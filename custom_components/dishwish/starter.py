"""Starter recipes: 20 German and Austrian classics shipped with the integration."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant

from .const import SEED_CATEGORIES
from .ingredients import parse_line
from .store import SYSTEM, Actor, DishWishStore

_FILE = Path(__file__).parent / "starter_recipes.json"
SEEDED_FLAG = "starter_seeded"


def _load() -> list[dict[str, Any]]:
    return json.loads(_FILE.read_text(encoding="utf-8"))


def _category_name(key: str, lang: str) -> str:
    for seed_key, name_de, name_en, _icon in SEED_CATEGORIES:
        if seed_key == key:
            return name_de if lang == "de" else name_en
    return ""


async def async_import_starter(
    hass: HomeAssistant, store: DishWishStore, actor: Actor, language: str
) -> dict[str, int]:
    """Create the starter dishes that do not exist yet (matched by name)."""
    lang = "de" if language.startswith("de") else "en"
    dishes = await hass.async_add_executor_job(_load)
    category_ids = {c["name"].casefold(): c["id"] for c in await store.async_list_categories()}
    existing = {r["name"].casefold() for r in await store.async_list_recipes(SYSTEM)}

    created = skipped = 0
    for dish in dishes:
        text = dish[lang]
        if text["name"].casefold() in existing:
            skipped += 1
            continue
        await store.async_create_recipe(
            actor,
            {
                "name": text["name"],
                "description": text["description"],
                "servings": dish["servings"],
                "prep_minutes": dish["prep"],
                "cook_minutes": dish["cook"],
                "category_ids": [
                    category_ids[name]
                    for key in dish["categories"]
                    if (name := _category_name(key, lang).casefold()) in category_ids
                ],
                "ingredients": [
                    {**parse_line(line), "group_name": None} for line in text["ingredients"]
                ],
                "steps": [{"section": None, "text": step} for step in text["steps"]],
            },
        )
        created += 1
    return {"created": created, "skipped": skipped}


async def async_seed_starter_once(hass: HomeAssistant, store: DishWishStore) -> None:
    """Add the starter dishes to a library that has never had any (runs once per database)."""
    if await store.async_meta_get(SEEDED_FLAG):
        return
    if await store.async_count_recipes() == 0:
        await async_import_starter(hass, store, SYSTEM, hass.config.language)
    await store.async_meta_set(SEEDED_FLAG, "1")
