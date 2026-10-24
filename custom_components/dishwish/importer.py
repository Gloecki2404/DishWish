"""Recipe import from a link: fetch the page, read schema.org JSON-LD, build a draft."""

from __future__ import annotations

import asyncio
import ipaddress
import json
import logging
import re
import socket
from html import unescape
from html.parser import HTMLParser
from typing import Any
from urllib.parse import urljoin, urlsplit

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_DEFAULT_SERVINGS,
    DEFAULT_SERVINGS,
    DOMAIN,
    MAX_DESCRIPTION,
    MAX_INGREDIENTS,
    MAX_MINUTES,
    MAX_NAME,
    MAX_SERVINGS,
    MAX_STEP_TEXT,
    MAX_STEPS,
)
from .db import DbError
from .images import ImageError
from .ingredients import parse_line
from .store import Actor, DishWishStore

_LOGGER = logging.getLogger(__name__)

MAX_URL = 2000
MAX_HTML_BYTES = 5 * 1024 * 1024
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_REDIRECTS = 5
IMAGE_ACCEPT = "image/webp,image/jpeg,image/png,image/*;q=0.8,*/*;q=0.5"
TIMEOUT = aiohttp.ClientTimeout(total=15)
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0 Safari/537.36"
)


class ImportFailed(DbError):
    """Import failed; `code` is the WebSocket error code."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


# --- parsing (pure, synchronous) ---------------------------------------------


class _JsonLdCollector(HTMLParser):
    """Collect the text of every <script type="application/ld+json"> block."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.blocks: list[str] = []
        self.meta_images: list[str] = []
        self._current: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "meta":
            meta = {k.lower(): v for k, v in attrs if v is not None}
            key = (meta.get("property") or meta.get("name") or "").lower()
            url = (meta.get("content") or "").strip()
            if url and key in ("og:image", "og:image:url", "og:image:secure_url", "twitter:image"):
                self.meta_images.append(unescape(url))
        if tag == "script" and any(
            k == "type" and v and v.split(";")[0].strip().lower() == "application/ld+json"
            for k, v in attrs
        ):
            self._current = []

    def handle_data(self, data: str) -> None:
        if self._current is not None:
            self._current.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._current is not None:
            self.blocks.append("".join(self._current))
            self._current = None


def _is_recipe(node: dict[str, Any]) -> bool:
    kind = node.get("@type")
    return kind == "Recipe" or (isinstance(kind, list) and "Recipe" in kind)


def _find_recipe(node: Any) -> dict[str, Any] | None:
    if isinstance(node, list):
        for item in node:
            if (found := _find_recipe(item)) is not None:
                return found
    elif isinstance(node, dict):
        if _is_recipe(node):
            return node
        for key in ("@graph", "mainEntity"):
            if key in node and (found := _find_recipe(node[key])) is not None:
                return found
    return None


def _collect(html: str) -> _JsonLdCollector:
    collector = _JsonLdCollector()
    collector.feed(html)
    collector.close()
    return collector


def extract_meta_images(html: str) -> list[str]:
    """Image URLs from og:image / twitter:image meta tags (fallback when JSON-LD has none)."""
    return _collect(html).meta_images


def extract_recipe_node(html: str) -> dict[str, Any] | None:
    """First schema.org Recipe object found in the page's JSON-LD blocks."""
    collector = _collect(html)
    for block in collector.blocks:
        try:
            data = json.loads(block.strip())
        except ValueError:
            continue
        if (found := _find_recipe(data)) is not None:
            return found
    return None


_MACRO = re.compile(r"\{\{(.*?)\}\}", re.S)
_QUOTED = re.compile(r"\"([^\"]*)\"|'([^']*)'")


def _macro_text(match: re.Match[str]) -> str:
    """Template leftovers like {{ link("RZT", "1829", "Powidl") }} -> the last quoted text."""
    quoted = [a or b for a, b in _QUOTED.findall(match.group(1))]
    return quoted[-1] if quoted else ""


def clean_text(value: Any) -> str:
    """Plain text: template macros resolved, HTML tags removed, entities unescaped."""
    if not isinstance(value, str):
        return ""
    value = _MACRO.sub(_macro_text, value)
    value = re.sub(r"<br\s*/?>|</(?:p|li|div)>", " ", value, flags=re.IGNORECASE)
    text = unescape(re.sub(r"<[^>]+>", "", value))
    if "<" in text:  # markup that was escaped twice
        text = re.sub(r"<[^>]+>", "", text)
    return " ".join(text.split())


_DURATION = re.compile(
    r"^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$", re.IGNORECASE
)


def parse_duration(value: Any) -> int | None:
    """ISO 8601 duration (PT1H30M, P0DT45M) -> minutes."""
    if not isinstance(value, str):
        return None
    match = _DURATION.match(value.strip())
    if not match or not any(match.groups()):
        return None
    days, hours, minutes, seconds = (float(g) if g else 0.0 for g in match.groups())
    return min(int(days * 1440 + hours * 60 + minutes + seconds / 60 + 0.5), MAX_MINUTES)


def _first_url(value: Any) -> str | None:
    if isinstance(value, str):
        return value.strip() or None
    if isinstance(value, list):
        for item in value:
            if url := _first_url(item):
                return url
    elif isinstance(value, dict):
        return _first_url(value.get("url") or value.get("contentUrl"))
    return None


def image_candidates(node: dict[str, Any]) -> list[str]:
    """All image URLs of a JSON-LD Recipe in page order (str, list, ImageObject)."""
    urls: list[str] = []

    def add(value: Any) -> None:
        if isinstance(value, str):
            if value.strip():
                urls.append(value.strip())
        elif isinstance(value, list):
            for item in value:
                add(item)
        elif isinstance(value, dict):
            add(value.get("url") or value.get("contentUrl"))

    add(node.get("image"))
    return urls


def _servings(value: Any, default: int) -> int:
    items = value if isinstance(value, list) else [value]
    for item in items:
        match = re.search(r"\d+", str(item))
        if match:
            return min(max(int(match.group()), 1), MAX_SERVINGS)
    return default


def _steps(value: Any, section: str | None = None) -> list[dict[str, Any]]:
    steps: list[dict[str, Any]] = []
    if isinstance(value, str):
        for line in re.split(r"[\r\n]+|<br\s*/?>", value):
            text = re.sub(r"^\s*(?:schritt\s*)?\d+\s*[.):]\s*", "", clean_text(line), flags=re.I)
            if text:
                steps.append({"section": section, "text": text})
    elif isinstance(value, list):
        for item in value:
            steps.extend(_steps(item, section))
    elif isinstance(value, dict):
        kind = value.get("@type")
        if kind == "HowToSection" or "itemListElement" in value:
            name = clean_text(value.get("name")) or section
            steps.extend(_steps(value.get("itemListElement", []), name))
        else:
            steps.extend(_steps(value.get("text") or value.get("name") or "", section))
    return steps


_STOP_STEP = re.compile(
    r"^(gefällt dir|zurück zur|hol dir|schau dir|folge uns|newsletter|kommentar|jetzt bewerten"
    r"|share|print)",
    re.IGNORECASE,
)


def _clean_steps(steps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Drop page chrome that some sites put into the instructions (CSS, share links, ...)."""
    kept: list[dict[str, Any]] = []
    for step in steps:
        text = step["text"]
        if _STOP_STEP.match(text):
            break  # everything after is page furniture
        if "{" in text or "}" in text or text.endswith(";") or text.startswith("."):
            continue
        kept.append(step)
    if len({s["section"] for s in kept}) == 1:
        for step in kept:  # a single section only repeats the dish name
            step["section"] = None
    return kept


_CATEGORY_SUFFIX = re.compile(r"\s+(rezepte|rezept|recipes|recipe)$", re.IGNORECASE)
MAX_NEW_CATEGORIES = 3


def _category_names(node: dict[str, Any]) -> list[str]:
    """Categories named by the page (`recipeCategory`), without a trailing 'Rezepte'."""
    value = node.get("recipeCategory")
    parts = value if isinstance(value, list) else re.split(r"[,|]", str(value or ""))
    names: list[str] = []
    for part in parts:
        name = _CATEGORY_SUFFIX.sub("", clean_text(part)).strip()
        if name and len(name) <= 40 and name.casefold() not in {n.casefold() for n in names}:
            names.append(name)
    return names


def _categories(
    node: dict[str, Any], categories: list[dict[str, Any]]
) -> tuple[list[str], list[str]]:
    """(ids of existing categories that match, names of categories that do not exist yet)."""
    by_name = {c["name"].casefold(): c["id"] for c in categories}
    ids: list[str] = []
    new: list[str] = []
    for name in _category_names(node):
        if name.casefold() in by_name:
            ids.append(by_name[name.casefold()])
        elif len(new) < MAX_NEW_CATEGORIES:
            new.append(name)
    keywords = node.get("keywords")  # keywords only ever select existing categories
    parts = keywords if isinstance(keywords, list) else str(keywords or "").split(",")
    for part in parts:
        key = clean_text(part).casefold()
        if key in by_name and by_name[key] not in ids:
            ids.append(by_name[key])
    return ids, new


def _ingredient_rows(node: dict[str, Any]) -> list[dict[str, Any]]:
    """Parsed ingredients; site adapters may deliver them in named groups."""
    groups = node.get("_ingredient_groups")
    if not groups:
        raw = node.get("recipeIngredient", node.get("ingredients", []))
        lines = raw.splitlines() if isinstance(raw, str) else raw
        groups = [(None, lines if isinstance(lines, list) else [])]
    rows = []
    for group, lines in groups:
        for line in lines:
            if text := clean_text(line):
                rows.append({**parse_line(text), "group_name": group or None})
    return rows


def build_draft(
    node: dict[str, Any],
    source_url: str,
    categories: list[dict[str, Any]],
    default_servings: int = DEFAULT_SERVINGS,
) -> tuple[dict[str, Any], str | None]:
    """Map a JSON-LD Recipe to a RecipeInput draft. Returns (draft, image_url)."""
    host = (urlsplit(source_url).hostname or "").removeprefix("www.")

    ingredients = _ingredient_rows(node)
    steps = _clean_steps(_steps(node.get("recipeInstructions", [])))
    name = clean_text(node.get("name"))[:MAX_NAME]
    if not (name or ingredients or steps):
        raise ImportFailed("no_recipe_found")

    prep = parse_duration(node.get("prepTime"))
    cook = parse_duration(node.get("cookTime"))
    total = parse_duration(node.get("totalTime"))
    if prep is None and total is not None:
        prep = max(total - cook, 0) if cook is not None else total

    category_ids, new_categories = _categories(node, categories)
    draft = {
        "name": name or host,
        "description": clean_text(node.get("description"))[:MAX_DESCRIPTION],
        "servings": _servings(node.get("recipeYield"), default_servings),
        "prep_minutes": prep,
        "cook_minutes": cook,
        "notes": "",
        "source_url": source_url,
        "source_name": host or None,
        "visibility": "household",
        "category_ids": category_ids,
        "new_categories": new_categories,
        "image_ids": [],
        "ingredients": ingredients[:MAX_INGREDIENTS],
        "steps": [
            {"section": s["section"], "text": s["text"][:MAX_STEP_TEXT]} for s in steps[:MAX_STEPS]
        ],
    }
    return draft, _first_url(node.get("image"))


# --- site adapters (pages without usable schema.org data) ----------------------------

_NEXT_DATA = re.compile(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', re.S)
_AMOUNT_UNITS = {
    "GRAM": "g", "KILOGRAM": "kg", "MILLILITER": "ml", "LITER": "l", "DECILITER": "dl",
    "CENTILITER": "cl", "TABLESPOON": "EL", "TEASPOON": "TL", "PIECE": "Stk.", "PINCH": "Prise",
    "PACKAGE": "Pck.", "CLOVE": "Zehe", "BUNCH": "Bund", "SLICE": "Scheibe", "CUP": "Tasse",
    "CAN": "Dose", "NONE": "",
    "MILLILITRE": "ml", "LITRE": "l", "DECILITRE": "dl", "CENTILITRE": "cl", "KILOGRAMME": "kg",
}  # fmt: skip


def _find_recipe_data(node: Any) -> dict[str, Any] | None:
    """A dict holding both `ingredient_groups` and `steps` somewhere in Next.js page data."""
    if isinstance(node, dict):
        if isinstance(node.get("ingredient_groups"), list) and isinstance(node.get("steps"), list):
            return node
        for value in node.values():
            if (found := _find_recipe_data(value)) is not None:
                return found
    elif isinstance(node, list):
        for value in node:
            if (found := _find_recipe_data(value)) is not None:
                return found
    return None


def _next_data_node(html: str) -> dict[str, Any] | None:
    """Recipe from a Next.js page (e.g. gusto.at) that has no JSON-LD, as a schema.org-like node."""
    match = _NEXT_DATA.search(html)
    if not match:
        return None
    try:
        data = _find_recipe_data(json.loads(match.group(1)))
    except ValueError:
        return None
    if data is None:
        return None
    groups = []
    for group in data["ingredient_groups"]:
        lines = []
        for item in group.get("ingredients") or []:
            title = (item.get("ingredient") or {}).get("title") or ""
            amount = item.get("amount")
            quantity = f"{amount:g}" if isinstance(amount, (int, float)) and amount else ""
            kind = str(item.get("amount_type") or "NONE").upper()
            unit = _AMOUNT_UNITS.get(kind, _AMOUNT_UNITS.get(kind.removesuffix("S"), ""))
            line = " ".join(p for p in (quantity, unit, title) if p)
            if suffix := (item.get("suffix") or "").strip():
                line += f", {suffix}"
            if title:
                lines.append(line)
        groups.append((clean_text(group.get("headline")), lines))
    steps = []
    for step in sorted(data["steps"], key=lambda s: s.get("sorting") or 0):
        entry = {"@type": "HowToStep", "text": step.get("description") or ""}
        headline = clean_text(step.get("headline"))
        steps.append(
            {"@type": "HowToSection", "name": headline, "itemListElement": [entry]}
            if headline
            else entry
        )
    cover = data.get("cover_image") or {}
    return {
        "name": data.get("title"),
        "description": data.get("teaser") or data.get("teaser_short") or "",
        "recipeYield": str(data.get("servings") or ""),
        "totalTime": f"PT{int(data['time'])}M" if data.get("time") else None,
        "recipeCategory": [c.get("title") for c in data.get("categories") or [] if c.get("title")],
        "image": cover.get("url"),
        "_ingredient_groups": groups,
        "recipeInstructions": steps,
    }


_SHOP_INGREDIENT = re.compile(
    r"(?:<h3[^>]*ingredient-list__title[^>]*>(?P<group>.*?)</h3>)"
    r"|(?:<span[^>]*ingredient__quantity[^>]*>(?P<qty>.*?)</span>\s*"
    r"<div[^>]*ingredient__title[^>]*>(?P<title>.*?)</div>)",
    re.S,
)


def _enrich_with_page_quantities(node: dict[str, Any], html: str) -> None:
    """Some shop-system recipe pages put amounts only into the HTML list, not into JSON-LD."""
    existing = node.get("recipeIngredient")
    if not isinstance(existing, list):
        return
    groups: list[tuple[str | None, list[str]]] = [(None, [])]
    titles: list[str] = []
    for match in _SHOP_INGREDIENT.finditer(html):
        if match.group("group") is not None:
            groups.append((clean_text(match.group("group")), []))
            continue
        qty, title = clean_text(match.group("qty")), clean_text(match.group("title"))
        groups[-1][1].append(f"{qty} {title}".strip())
        titles.append(title)
    # only trust the page list if it is the same list as the JSON-LD one
    if len(titles) == len(existing) and all(
        title.casefold() == clean_text(line).casefold()
        for title, line in zip(titles, existing, strict=True)
    ):
        node["_ingredient_groups"] = [g for g in groups if g[1]]


def extract_node(html: str) -> dict[str, Any] | None:
    """JSON-LD recipe, else a known site layout; enriched with amounts from the page if missing."""
    node = extract_recipe_node(html)
    if node is None:
        return _next_data_node(html)
    _enrich_with_page_quantities(node, html)
    return node


# --- fetching (network) --------------------------------------------------------


async def _check_host(host: str) -> None:
    """Reject hosts that resolve to non-public addresses (no probing of the local network)."""
    try:
        infos = await asyncio.get_running_loop().getaddrinfo(host, None, type=socket.SOCK_STREAM)
    except OSError as err:
        raise ImportFailed("fetch_failed") from err
    for info in infos:
        if not ipaddress.ip_address(info[4][0]).is_global:
            raise ImportFailed("invalid_url")


def _validate_url(url: str) -> str:
    if len(url) > MAX_URL:
        raise ImportFailed("invalid_url")
    parts = urlsplit(url.strip())
    if parts.scheme not in ("http", "https") or not parts.hostname:
        raise ImportFailed("invalid_url")
    return parts.geturl()


async def _fetch(
    session: aiohttp.ClientSession,
    url: str,
    language: str,
    limit: int,
    accept: str,
    referer: str | None = None,
) -> tuple[bytes, str, str, str | None]:
    """GET with manual, validated redirects. Returns (body, final_url, content_type, charset)."""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": accept,
        "Accept-Language": f"{language},en;q=0.7",
    }
    if referer:
        headers["Referer"] = referer
    current = _validate_url(url)
    for _ in range(MAX_REDIRECTS + 1):
        await _check_host(urlsplit(current).hostname or "")
        try:
            async with session.get(
                current, headers=headers, allow_redirects=False, timeout=TIMEOUT
            ) as resp:
                if resp.status in (301, 302, 303, 307, 308):
                    location = resp.headers.get("Location")
                    if not location:
                        raise ImportFailed("fetch_failed")
                    current = _validate_url(urljoin(current, location))
                    continue
                if resp.status != 200:
                    raise ImportFailed("fetch_failed")
                body = bytearray()
                async for chunk in resp.content.iter_chunked(64 * 1024):
                    body.extend(chunk)
                    if len(body) > limit:
                        raise ImportFailed("too_large")
                return bytes(body), current, resp.content_type, resp.charset
        except (aiohttp.ClientError, TimeoutError) as err:
            raise ImportFailed("fetch_failed") from err
    raise ImportFailed("fetch_failed")


async def async_import_recipe(
    hass: HomeAssistant, store: DishWishStore, actor: Actor, url: str
) -> dict[str, Any]:
    """Load a recipe page and return an unsaved RecipeInput draft (incl. processed image)."""
    session = async_get_clientsession(hass)
    language = hass.config.language
    body, final_url, _ctype, charset = await _fetch(
        session, url, language, MAX_HTML_BYTES, "text/html,application/xhtml+xml"
    )
    html = body.decode(charset or "utf-8", errors="replace")
    node = extract_node(html)
    if node is None:
        raise ImportFailed("no_recipe_found")

    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    default_servings = (
        int(entries[0].options.get(CONF_DEFAULT_SERVINGS, DEFAULT_SERVINGS))
        if entries
        else DEFAULT_SERVINGS
    )
    categories = await store.async_list_categories()
    draft, image_url = build_draft(node, final_url, categories, default_servings)

    candidates = image_candidates(node) + extract_meta_images(html)
    if not candidates and image_url:
        candidates = [image_url]
    for candidate in dict.fromkeys(urljoin(final_url, c) for c in candidates[:6]):
        try:
            data, _, _, _ = await _fetch(
                session, candidate, language, MAX_IMAGE_BYTES, IMAGE_ACCEPT, referer=final_url
            )
            image = await store.async_add_upload(actor, data)
        except (ImportFailed, ImageError) as err:
            _LOGGER.debug("Recipe image %s not usable: %s", candidate, err.code)
            continue  # a missing or unusable image never fails the import
        draft["image_ids"] = [image["id"]]
        break
    return draft
