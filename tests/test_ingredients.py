"""Ingredient parsing/formatting, driven by the shared fixture file."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from custom_components.essensplan import ingredients

CASES = json.loads(
    (Path(__file__).parent / "fixtures" / "ingredient_cases.json").read_text("utf-8")
)


def test_enough_cases():
    assert len(CASES["parse"]) + len(CASES["format"]) >= 40


@pytest.mark.parametrize("case", CASES["parse"], ids=lambda c: c["input"] or "blank")
def test_parse(case):
    expected = {k: case[k] for k in ("quantity", "quantity_max", "unit", "name", "note")}
    assert ingredients.parse_line(case["input"]) == expected


@pytest.mark.parametrize(
    "case",
    CASES["format"],
    ids=lambda c: (
        f"{c['quantity']}-{c['quantity_max']}{c['unit']}-{c['from_servings']}to{c['to_servings']}-{c['lang']}"
    ),
)
def test_format(case):
    qty, qmax = case["quantity"], case["quantity_max"]
    if qty is not None:
        qty = ingredients.scale_quantity(qty, case["from_servings"], case["to_servings"])
    if qmax is not None:
        qmax = ingredients.scale_quantity(qmax, case["from_servings"], case["to_servings"])
    assert ingredients.format_amount(qty, qmax, case["unit"], case["lang"]) == case["expected"]


@pytest.mark.parametrize("case", CASES["line"])
def test_format_line(case):
    result = ingredients.format_line(
        case["ingredient"], case["from_servings"], case["to_servings"], case["lang"]
    )
    assert result == case["expected"]


def test_format_line_with_note():
    ing = {"name": "Mehl", "quantity": 100, "unit": "g", "note": "gesiebt"}
    assert ingredients.format_line(ing, 4, 4, "de", include_note=True) == "100 g Mehl (gesiebt)"


@pytest.mark.parametrize("text", ["", "   ", "½", "1/0 g Mehl", "- - -", "9" * 400, "ca."])
def test_parse_never_raises(text):
    result = ingredients.parse_line(text)
    assert set(result) == {"quantity", "quantity_max", "unit", "name", "note"}


def test_merge_same_name_and_unit():
    items = [
        {"name": "Mehl", "quantity": 200, "unit": "g"},
        {"name": " mehl ", "quantity": 300, "unit": "g"},
        {"name": "Mehl", "quantity": 1, "unit": "kg"},
        {"name": "Salz", "quantity": None, "unit": ""},
        {"name": "Salz", "quantity": None, "unit": ""},
        {"name": "Eier", "quantity": 2, "quantity_max": 3, "unit": ""},
        {"name": "Eier", "quantity": 1, "unit": ""},
    ]
    merged = ingredients.merge_ingredients(items)
    by_key = {(m["name"].lower().strip(), m["unit"]): m for m in merged}
    assert len(merged) == 4
    assert by_key[("mehl", "g")]["quantity"] == 500
    assert by_key[("mehl", "kg")]["quantity"] == 1
    assert by_key[("salz", "")]["quantity"] is None
    assert (by_key[("eier", "")]["quantity"], by_key[("eier", "")]["quantity_max"]) == (3, 4)
