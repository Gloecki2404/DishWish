"""Ingredient line parsing, scaling, formatting and merging.

The rounding/format rules must match frontend/src/utils/scale.ts; both are tested
against tests/fixtures/ingredient_cases.json.
"""

from __future__ import annotations

import math
import re
from typing import Any

from .const import UNIT_LOOKUP

_UNICODE_FRACTIONS = {"½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75, "⅛": 0.125}
_UF = "".join(_UNICODE_FRACTIONS)
_NUMBER = re.compile(
    rf"(?P<mixed>(\d+)\s+(\d+)/(\d+))"
    rf"|(?P<frac>(\d+)/(\d+))"
    rf"|(?P<intuni>(\d+)\s?([{_UF}]))"
    rf"|(?P<uni>[{_UF}])"
    rf"|(?P<dec>\d+(?:[.,]\d+)?)"
)
_RANGE_SEP = re.compile(r"\s*[-–—]\s*|\s+bis\s+", re.IGNORECASE)
_APPROX = re.compile(r"^(?:ca\.?|circa|etwa|ungefähr)\s*(?=\d|[" + _UF + "])", re.IGNORECASE)
_UNIT_TOKEN = re.compile(r"\s*([^\W\d_]+)\.?(?=\s|$|,|\()")
_TRAILING_PAREN = re.compile(r"^(.*?)\s*\(([^()]*)\)\s*$")


def _read_number(text: str) -> tuple[float, int] | None:
    match = _NUMBER.match(text)
    if not match:
        return None
    kind = match.lastgroup
    groups = match.groups()
    if kind == "mixed":
        value = int(groups[1]) + int(groups[2]) / int(groups[3])
    elif kind == "frac":
        value = int(groups[5]) / int(groups[6])
    elif kind == "intuni":
        value = int(groups[8]) + _UNICODE_FRACTIONS[groups[9]]
    elif kind == "uni":
        value = _UNICODE_FRACTIONS[match.group("uni")]
    else:
        value = float(match.group("dec").replace(",", "."))
    return value, match.end()


def parse_line(text: str) -> dict[str, Any]:
    """Parse one ingredient line. Never raises; falls back to name = whole line."""
    original = " ".join(str(text).split())
    fallback = {"quantity": None, "quantity_max": None, "unit": "", "name": original, "note": ""}
    try:
        result = _parse(original)
    except ValueError, ZeroDivisionError, IndexError:
        return fallback
    return result if result["name"] else fallback


def _split_note(rest: str) -> tuple[str, str] | None:
    """Split at the first comma that is not inside parentheses: "Zwiebel (rot, groß), gewürfelt"."""
    depth = 0
    for i, char in enumerate(rest):
        if char in "([":
            depth += 1
        elif char in ")]":
            depth = max(0, depth - 1)
        elif char == "," and depth == 0:
            return rest[:i].strip(), rest[i + 1 :].strip()
    return None


def _parse(line: str) -> dict[str, Any]:
    rest = _APPROX.sub("", line).strip()
    quantity = quantity_max = None
    unit = ""

    number = _read_number(rest)
    if number:
        quantity, end = number
        rest = rest[end:]
        sep = _RANGE_SEP.match(rest)
        if sep:
            second = _read_number(rest[sep.end() :])
            if second:
                quantity_max, second_end = second
                rest = rest[sep.end() + second_end :]
        token = _UNIT_TOKEN.match(rest)
        if token and token.group(1).lower() in UNIT_LOOKUP:
            unit = UNIT_LOOKUP[token.group(1).lower()]
            rest = rest[token.end() :]
        rest = rest.strip()
        if quantity_max is not None and quantity_max <= quantity:
            quantity_max = None

    name, note = rest, ""
    if (split := _split_note(rest)) is not None:
        name, note = split
    elif paren := _TRAILING_PAREN.match(rest):
        name, note = paren.group(1).strip(), paren.group(2).strip()
    return {
        "quantity": quantity,
        "quantity_max": quantity_max,
        "unit": unit,
        "name": name,
        "note": note,
    }


# --- scaling & formatting ----------------------------------------------------


def _round_half_up(value: float) -> int:
    return math.floor(value + 0.5)


def scale_quantity(value: float, recipe_servings: int, target_servings: int) -> float:
    """Scale a quantity from recipe servings to target servings."""
    return value * target_servings / recipe_servings


def _decimal(value: float, lang: str) -> str:
    rounded = _round_half_up(value * 100) / 100
    text = f"{rounded:.2f}".rstrip("0").rstrip(".")
    return text.replace(".", "," if lang.startswith("de") else ".")


def _quarter(value: float) -> str:
    if value >= 10:
        return str(max(1, _round_half_up(value)))
    quarters = max(1, _round_half_up(value * 4))
    whole, frac = divmod(quarters, 4)
    glyph = ("", "¼", "½", "¾")[frac]
    return f"{whole}{glyph}" if whole else glyph


def _format_one(value: float, unit: str, lang: str) -> str:
    if unit in ("g", "ml"):
        if value >= 100:
            return str(_round_half_up(value / 5) * 5)
        return str(max(1, _round_half_up(value)))
    if unit in ("kg", "l"):
        return _decimal(value, lang)
    return _quarter(value)


def format_amount(
    quantity: float | None, quantity_max: float | None, unit: str, lang: str = "de"
) -> str:
    """Format an (already scaled) amount incl. unit, e.g. `400 g`, `1,5 kg`, `1½ EL`, `2–3 EL`."""
    if quantity is None:
        return ""
    top = quantity_max if quantity_max is not None else quantity
    divisor = 1.0
    if unit in ("g", "ml") and top >= 1000:
        divisor = 1000.0
        unit = "kg" if unit == "g" else "l"
    first = _format_one(quantity / divisor, unit, lang)
    amount = first
    if quantity_max is not None:
        amount = f"{first}–{_format_one(quantity_max / divisor, unit, lang)}"
    return f"{amount} {unit}".strip()


def format_line(
    ingredient: dict[str, Any],
    recipe_servings: int,
    target_servings: int,
    lang: str = "de",
    include_note: bool = False,
) -> str:
    """Format a full line like `400 g Mehl` for a target number of servings."""
    quantity = ingredient.get("quantity")
    quantity_max = ingredient.get("quantity_max")
    if quantity is not None:
        quantity = scale_quantity(quantity, recipe_servings, target_servings)
    if quantity_max is not None:
        quantity_max = scale_quantity(quantity_max, recipe_servings, target_servings)
    amount = format_amount(quantity, quantity_max, ingredient.get("unit", ""), lang)
    parts = [amount, ingredient["name"]]
    if include_note and ingredient.get("note"):
        parts.append(f"({ingredient['note']})")
    return " ".join(p for p in parts if p)


def merge_ingredients(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Merge equal name + unit by adding quantities (items must already be scaled)."""
    merged: dict[tuple[str, str], dict[str, Any]] = {}
    for item in items:
        key = (" ".join(item["name"].casefold().split()), item.get("unit", ""))
        current = merged.get(key)
        if current is None:
            merged[key] = {
                "name": item["name"],
                "unit": item.get("unit", ""),
                "quantity": item.get("quantity"),
                "quantity_max": item.get("quantity_max"),
            }
            continue
        if item.get("quantity") is None or current["quantity"] is None:
            continue
        low = current["quantity"] + item["quantity"]
        high = (current["quantity_max"] or current["quantity"]) + (
            item.get("quantity_max") or item["quantity"]
        )
        current["quantity"] = low
        current["quantity_max"] = high if high != low else None
    return list(merged.values())
