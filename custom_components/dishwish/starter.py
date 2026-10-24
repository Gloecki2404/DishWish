"""Starter recipes: 20 German and Austrian classics shipped with the integration."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant

from .const import SEED_CATEGORIES, SYSTEM_USER
from .db import DbError
from .ingredients import parse_line
from .store import SYSTEM, Actor, DishWishStore

_FILE = Path(__file__).parent / "starter_recipes.json"
_IMAGES = Path(__file__).parent / "starter_images"
SEEDED_FLAG = "starter_seeded"
IMAGES_FLAG = "starter_images_v1"


def _load() -> list[dict[str, Any]]:
    return json.loads(_FILE.read_text(encoding="utf-8"))


def _read_image(dish_id: str) -> bytes | None:
    path = _IMAGES / f"{dish_id}.jpg"
    return path.read_bytes() if path.is_file() else None


async def _upload_photo(
    hass: HomeAssistant, store: DishWishStore, actor: Actor, dish_id: str
) -> str | None:
    """Upload the shipped photo of a starter dish; None if there is none or it is unusable."""
    data = await hass.async_add_executor_job(_read_image, dish_id)
    if data is None:
        return None
    try:
        return (await store.async_add_upload(actor, data))["id"]
    except DbError:
        return None


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
        photo = await _upload_photo(hass, store, actor, dish["id"])
        await store.async_create_recipe(
            actor,
            {
                "name": text["name"],
                "description": text["description"],
                "servings": dish["servings"],
                "prep_minutes": dish["prep"],
                "cook_minutes": dish["cook"],
                "image_ids": [photo] if photo else [],
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
    """First start: add the starter dishes to an empty library; one-time photo backfill."""
    seeded = await store.async_meta_get(SEEDED_FLAG)
    if not seeded and await store.async_count_recipes() == 0:
        await async_import_starter(hass, store, SYSTEM, hass.config.language)
    if not seeded:
        await store.async_meta_set(SEEDED_FLAG, "1")
    if not await store.async_meta_get(IMAGES_FLAG):
        await _add_missing_photos(hass, store)
        await store.async_meta_set(IMAGES_FLAG, "1")


async def _add_missing_photos(hass: HomeAssistant, store: DishWishStore) -> None:
    """Give starter dishes that were created without a photo (earlier versions) their photo."""
    dishes = await hass.async_add_executor_job(_load)
    by_name = {
        dish[lang]["name"].casefold(): dish["id"] for dish in dishes for lang in ("de", "en")
    }
    for recipe in await store.async_list_recipes(SYSTEM):
        dish_id = by_name.get(recipe["name"].casefold())
        if not dish_id or recipe["created_by"] != SYSTEM_USER or recipe["thumb_url"] is not None:
            continue
        if photo := await _upload_photo(hass, store, SYSTEM, dish_id):
            await store.async_attach_image(recipe["id"], photo)
