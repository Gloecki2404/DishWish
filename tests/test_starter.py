"""Starter dishes (German/Austrian classics)."""

from __future__ import annotations

import json
from pathlib import Path

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dishwish import starter
from custom_components.dishwish.const import (
    DOMAIN,
    MAX_INGREDIENTS,
    MAX_NAME,
    MAX_STEP_TEXT,
    MAX_STEPS,
    SEED_CATEGORIES,
)
from custom_components.dishwish.ingredients import parse_line

from .conftest import call

DISHES = json.loads((Path(starter.__file__).parent / "starter_recipes.json").read_text("utf-8"))


def test_starter_file_is_complete_and_valid():
    assert len(DISHES) == 20
    assert len({d["id"] for d in DISHES}) == 20
    seed_keys = {key for key, *_ in SEED_CATEGORIES}
    for dish in DISHES:
        assert dish["categories"] and set(dish["categories"]) <= seed_keys
        assert 1 <= dish["servings"] <= 100 and dish["prep"] >= 0 and dish["cook"] >= 0
        for lang in ("de", "en"):
            text = dish[lang]
            assert 0 < len(text["name"]) <= MAX_NAME and text["description"]
            assert 0 < len(text["ingredients"]) <= MAX_INGREDIENTS
            assert 0 < len(text["steps"]) <= MAX_STEPS
            assert all(0 < len(s) <= MAX_STEP_TEXT for s in text["steps"])
            for line in text["ingredients"]:
                parsed = parse_line(line)
                assert parsed["name"], line
    for lang in ("de", "en"):
        names = [d[lang]["name"].casefold() for d in DISHES]
        assert len(set(names)) == 20


async def test_import_german_via_websocket(hass: HomeAssistant, tmp_path, make_client):
    hass.config.config_dir = str(tmp_path)
    hass.config.language = "de"
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    client, _ = await make_client("alice")

    result = await call(client, "dishwish/recipes/import_starter")
    assert result["result"] == {"created": 20, "skipped": 0}
    again = await call(client, "dishwish/recipes/import_starter")
    assert again["result"] == {"created": 0, "skipped": 20}

    recipes = (await call(client, "dishwish/recipes/list"))["result"]
    assert len(recipes) == 20
    schnitzel = next(r for r in recipes if r["name"] == "Wiener Schnitzel")
    categories = {
        c["id"]: c["name"] for c in (await call(client, "dishwish/categories/list"))["result"]
    }
    assert [categories[i] for i in schnitzel["category_ids"]] == ["Fleisch"]
    full = (await call(client, "dishwish/recipes/get", recipe_id=schnitzel["id"]))["result"]
    first = full["ingredients"][0]
    assert (first["quantity"], first["name"], first["note"]) == (
        4,
        "Kalbsschnitzel",
        "je ca. 150 g",
    )
    assert len(full["steps"]) == 4 and full["prep_minutes"] == 20 and full["can_edit"] is True


async def test_import_english_and_skip_existing(
    hass: HomeAssistant, setup_integration, make_client
):
    client, _ = await make_client("alice")
    await call(client, "dishwish/recipes/create", name="Linseneintopf (lentil stew)", servings=2)
    result = await call(client, "dishwish/recipes/import_starter", language="en")
    assert result["result"] == {"created": 19, "skipped": 1}
    names = {r["name"] for r in (await call(client, "dishwish/recipes/list"))["result"]}
    assert "Beef goulash (Rindsgulasch)" in names and "Wiener Schnitzel" in names
    goulash = next(
        r
        for r in (await call(client, "dishwish/recipes/list"))["result"]
        if r["name"].startswith("Beef")
    )
    cats = {c["id"]: c["name"] for c in (await call(client, "dishwish/categories/list"))["result"]}
    assert [cats[i] for i in goulash["category_ids"]] == ["Meat"]


async def test_import_service(hass: HomeAssistant, setup_integration):
    response = await hass.services.async_call(
        DOMAIN, "import_starter_recipes", {"language": "de"}, blocking=True, return_response=True
    )
    assert response == {"created": 20, "skipped": 0}
    again = await hass.services.async_call(
        DOMAIN, "import_starter_recipes", {"language": "de"}, blocking=True, return_response=True
    )
    assert again == {"created": 0, "skipped": 20}
