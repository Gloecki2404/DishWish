"""Starter dishes (German/Austrian classics)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from homeassistant.core import HomeAssistant
from PIL import Image
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dishwish import db, starter
from custom_components.dishwish.const import (
    DOMAIN,
    MAX_INGREDIENTS,
    MAX_NAME,
    MAX_STEP_TEXT,
    MAX_STEPS,
    SEED_CATEGORIES,
)
from custom_components.dishwish.ingredients import parse_line
from custom_components.dishwish.store import get_store

from .conftest import call, recipe_input

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


def test_every_dish_has_a_valid_photo_and_credit():
    images_dir = Path(starter.__file__).parent / "starter_images"
    credits = {c["id"]: c for c in json.loads((images_dir / "credits.json").read_text("utf-8"))}
    allowed = {
        "CC0",
        "Public domain",
        "CC BY 2.0",
        "CC BY 3.0",
        "CC BY 4.0",
        "CC BY-SA 3.0",
        "CC BY-SA 4.0",
    }
    assert set(credits) == {d["id"] for d in DISHES}
    for dish in DISHES:
        with Image.open(images_dir / f"{dish['id']}.jpg") as img:
            img.verify()
        assert credits[dish["id"]]["license"] in allowed
        assert credits[dish["id"]]["author"] and credits[dish["id"]]["source"].startswith(
            "https://"
        )
    assert (images_dir / "ATTRIBUTION.md").is_file()


async def _setup(hass: HomeAssistant, tmp_path, language: str) -> MockConfigEntry:
    hass.config.config_dir = str(tmp_path)
    hass.config.language = language
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.mark.starter
async def test_first_setup_adds_german_starter_dishes(hass: HomeAssistant, tmp_path, make_client):
    entry = await _setup(hass, tmp_path, "de")
    client, _ = await make_client("alice")

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
    assert len(full["steps"]) == 4 and full["prep_minutes"] == 20
    assert schnitzel["thumb_url"] and len(full["images"]) == 1
    assert all(r["thumb_url"] for r in recipes)  # every starter dish ships with a photo
    store = get_store(hass)
    assert len(list(store.images_dir.glob("*_thumb.jpg"))) == 20
    # shipped dishes belong to the household: any user may edit or delete them
    assert full["can_edit"] is True
    deleted = await call(client, "dishwish/recipes/delete", recipe_id=schnitzel["id"])
    assert deleted["success"]

    # reloading must neither duplicate dishes nor bring a deleted one back
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    names = [r["name"] for r in (await call(client, "dishwish/recipes/list"))["result"]]
    assert len(names) == 19 and "Wiener Schnitzel" not in names


@pytest.mark.starter
async def test_first_setup_in_english(hass: HomeAssistant, tmp_path, make_client):
    await _setup(hass, tmp_path, "en")
    client, _ = await make_client("alice")
    recipes = (await call(client, "dishwish/recipes/list"))["result"]
    names = {r["name"] for r in recipes}
    assert len(recipes) == 20 and "Beef goulash (Rindsgulasch)" in names
    cats = {c["id"]: c["name"] for c in (await call(client, "dishwish/categories/list"))["result"]}
    goulash = next(r for r in recipes if r["name"].startswith("Beef"))
    assert [cats[i] for i in goulash["category_ids"]] == ["Meat"]


@pytest.mark.starter
async def test_existing_library_is_left_alone(hass: HomeAssistant, tmp_path, make_client):
    data_dir = tmp_path / "dishwish"
    data_dir.mkdir()
    conn = db.open_db(data_dir / "dishwish.db", "en")
    db.create_recipe(conn, recipe_input(name="Mein Gericht"), "someone")
    conn.close()

    await _setup(hass, tmp_path, "en")
    client, _ = await make_client("alice")
    names = [r["name"] for r in (await call(client, "dishwish/recipes/list"))["result"]]
    assert names == ["Mein Gericht"]


@pytest.mark.starter
async def test_photos_are_added_to_starter_dishes_from_earlier_versions(
    hass: HomeAssistant, tmp_path, make_client
):
    data_dir = tmp_path / "dishwish"
    data_dir.mkdir()
    conn = db.open_db(data_dir / "dishwish.db", "en")
    db.set_meta(conn, starter.SEEDED_FLAG, "1")  # as if 0.1.0 had created the dishes
    old = db.create_recipe(conn, recipe_input(name="Wiener Schnitzel"), "system")
    mine = db.create_recipe(conn, recipe_input(name="Tafelspitz"), "alice")  # a user's own dish
    conn.close()

    await _setup(hass, tmp_path, "en")
    client, _ = await make_client("alice")
    recipes = {r["id"]: r for r in (await call(client, "dishwish/recipes/list"))["result"]}
    assert recipes[old]["thumb_url"] is not None
    assert recipes[mine]["thumb_url"] is None
    assert len(recipes) == 2  # nothing else was added


async def test_import_service_adds_missing_dishes(hass: HomeAssistant, setup_integration):
    response = await hass.services.async_call(
        DOMAIN, "import_starter_recipes", {"language": "de"}, blocking=True, return_response=True
    )
    assert response == {"created": 20, "skipped": 0}
    again = await hass.services.async_call(
        DOMAIN, "import_starter_recipes", {"language": "de"}, blocking=True, return_response=True
    )
    assert again == {"created": 0, "skipped": 20}
