"""Recipe import from a link: fetch the page, read schema.org JSON-LD, build a draft."""

from __future__ import annotations

import asyncio
import ipaddress
import json
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
from .store import Actor, EssensplanStore

MAX_URL = 2000
MAX_HTML_BYTES = 5 * 1024 * 1024
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_REDIRECTS = 5
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
        self._current: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
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


def extract_recipe_node(html: str) -> dict[str, Any] | None:
    """First schema.org Recipe object found in the page's JSON-LD blocks."""
    collector = _JsonLdCollector()
    collector.feed(html)
    collector.close()
    for block in collector.blocks:
        try:
            data = json.loads(block.strip())
        except ValueError:
            continue
        if (found := _find_recipe(data)) is not None:
            return found
    return None


def clean_text(value: Any) -> str:
    """Strip HTML tags, unescape entities, collapse whitespace."""
    if not isinstance(value, str):
        return ""
    value = re.sub(r"<br\s*/?>|</(?:p|li|div)>", " ", value, flags=re.IGNORECASE)
    return " ".join(unescape(re.sub(r"<[^>]+>", "", value)).split())


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


def _category_ids(node: dict[str, Any], categories: list[dict[str, Any]]) -> list[str]:
    words: set[str] = set()
    for key in ("recipeCategory", "keywords"):
        value = node.get(key)
        parts = value if isinstance(value, list) else str(value or "").split(",")
        words.update(clean_text(p).casefold() for p in parts if isinstance(p, str))
    by_name = {c["name"].casefold(): c["id"] for c in categories}
    return [by_name[w] for w in words if w in by_name]


def build_draft(
    node: dict[str, Any],
    source_url: str,
    categories: list[dict[str, Any]],
    default_servings: int = DEFAULT_SERVINGS,
) -> tuple[dict[str, Any], str | None]:
    """Map a JSON-LD Recipe to a RecipeInput draft. Returns (draft, image_url)."""
    host = (urlsplit(source_url).hostname or "").removeprefix("www.")

    raw = node.get("recipeIngredient", node.get("ingredients", []))
    lines = raw.splitlines() if isinstance(raw, str) else raw
    ingredients = []
    for line in lines if isinstance(lines, list) else []:
        if text := clean_text(line):
            ingredients.append({**parse_line(text), "group_name": None})
    steps = _steps(node.get("recipeInstructions", []))
    name = clean_text(node.get("name"))[:MAX_NAME]
    if not (name or ingredients or steps):
        raise ImportFailed("no_recipe_found")

    prep = parse_duration(node.get("prepTime"))
    cook = parse_duration(node.get("cookTime"))
    total = parse_duration(node.get("totalTime"))
    if prep is None and total is not None:
        prep = max(total - cook, 0) if cook is not None else total

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
        "category_ids": _category_ids(node, categories),
        "image_ids": [],
        "ingredients": ingredients[:MAX_INGREDIENTS],
        "steps": [
            {"section": s["section"], "text": s["text"][:MAX_STEP_TEXT]} for s in steps[:MAX_STEPS]
        ],
    }
    return draft, _first_url(node.get("image"))


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
    session: aiohttp.ClientSession, url: str, language: str, limit: int, accept: str
) -> tuple[bytes, str, str, str | None]:
    """GET with manual, validated redirects. Returns (body, final_url, content_type, charset)."""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": accept,
        "Accept-Language": f"{language},en;q=0.7",
    }
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
    hass: HomeAssistant, store: EssensplanStore, actor: Actor, url: str
) -> dict[str, Any]:
    """Load a recipe page and return an unsaved RecipeInput draft (incl. processed image)."""
    session = async_get_clientsession(hass)
    language = hass.config.language
    body, final_url, _ctype, charset = await _fetch(
        session, url, language, MAX_HTML_BYTES, "text/html,application/xhtml+xml"
    )
    html = body.decode(charset or "utf-8", errors="replace")
    node = extract_recipe_node(html)
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

    if image_url:
        try:
            data, _, ctype, _ = await _fetch(
                session, urljoin(final_url, image_url), language, MAX_IMAGE_BYTES, "image/*"
            )
            if ctype.startswith("image/"):
                image = await store.async_add_upload(actor, data)
                draft["image_ids"] = [image["id"]]
        except ImportFailed, ImageError:
            pass  # a missing or unusable image never fails the import
    return draft
