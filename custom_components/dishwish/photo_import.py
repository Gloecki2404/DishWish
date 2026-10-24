"""Recipe from photos of a cookbook page, read by a Home Assistant AI task (e.g. Google Gemini)."""

from __future__ import annotations

import asyncio
import contextlib
import logging
import uuid
from pathlib import Path

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

from .const import (
    CONF_AI_TASK_ENTITY,
    CONF_DEFAULT_SERVINGS,
    DEFAULT_SERVINGS,
    DOMAIN,
    MAX_DESCRIPTION,
    MAX_NOTES,
    MAX_PHOTOS,
    TMP_MEDIA_DIR,
)
from .db import DbError, Invalid
from .images import image_path
from .importer import ImportFailed, build_draft, clean_text
from .store import Actor, DishWishStore

_LOGGER = logging.getLogger(__name__)
AI_TIMEOUT = 180  # seconds; reading a page can take a while

_PROMPTS = {
    "en": (
        "The attached image(s) are photos of one recipe from a cookbook or magazine, "
        "in reading order. Read the recipe exactly as printed and return it in the "
        "requested structure. Do not invent anything and do not translate. "
        "Write one ingredient per entry including quantity and unit as printed "
        "(for example '200 g flour' or '1/2 tsp salt'). Write the steps in order "
        "without step numbers. Servings must be a whole number; times are in minutes. "
        "If something is not on the page, leave it out. If the images show no recipe, "
        "return an empty name and empty lists."
    ),
    "de": (
        "Die angehängten Bilder sind Fotos eines Rezepts aus einem Kochbuch oder einer "
        "Zeitschrift, in Leserichtung. Lies das Rezept genau so, wie es gedruckt ist, "
        "und gib es in der verlangten Struktur zurück. Erfinde nichts und übersetze "
        "nichts. Schreibe pro Eintrag eine Zutat mit Menge und Einheit wie gedruckt "
        "(zum Beispiel '200 g Mehl' oder '1/2 TL Salz'). Schreibe die Schritte der "
        "Reihe nach ohne Schrittnummern. Portionen sind eine ganze Zahl, Zeiten in "
        "Minuten. Was nicht auf der Seite steht, lässt du weg. Zeigen die Bilder kein "
        "Rezept, gib einen leeren Namen und leere Listen zurück."
    ),
}


def _structure() -> dict[str, dict]:
    text = {"text": {}}
    many = {"text": {"multiple": True}}
    minutes = {"number": {"min": 0, "max": 1440, "mode": "box"}}
    return {
        "name": {"description": "Recipe title", "required": True, "selector": text},
        "description": {"description": "Short introduction, if printed", "selector": text},
        "servings": {
            "description": "Number of servings",
            "selector": {"number": {"min": 1, "max": 100, "mode": "box"}},
        },
        "prep_minutes": {"description": "Preparation time in minutes", "selector": minutes},
        "cook_minutes": {"description": "Cooking or baking time in minutes", "selector": minutes},
        "ingredients": {
            "description": "Ingredients, one per entry, with quantity and unit",
            "required": True,
            "selector": many,
        },
        "steps": {
            "description": "Preparation steps in order, without numbers",
            "required": True,
            "selector": many,
        },
        "categories": {
            "description": "Type of dish, e.g. dessert, soup (only if printed)",
            "selector": many,
        },
        "notes": {"description": "Tips or notes printed with the recipe", "selector": text},
    }


class AiFailed(DbError):
    """The AI task could not read the photos."""

    code = "ai_failed"


class AiNotConfigured(DbError):
    """No AI task entity is chosen and Home Assistant has no default one."""

    code = "ai_not_configured"


def _write_files(media_dir: Path, sources: list[Path]) -> list[Path]:
    media_dir.mkdir(parents=True, exist_ok=True)
    written = []
    for source in sources:
        target = media_dir / f"{uuid.uuid4().hex}.jpg"
        target.write_bytes(source.read_bytes())
        written.append(target)
    return written


def _delete_files(paths: list[Path]) -> None:
    for path in paths:
        path.unlink(missing_ok=True)
    if paths:
        with contextlib.suppress(OSError):
            paths[0].parent.rmdir()  # only succeeds when empty


def _media_target(hass: HomeAssistant) -> tuple[str, Path]:
    dirs = hass.config.media_dirs
    if not dirs:
        raise AiFailed
    name = "local" if "local" in dirs else next(iter(dirs))
    return name, Path(dirs[name]) / TMP_MEDIA_DIR


async def _run_ai(
    hass: HomeAssistant, entity_id: str | None, language: str, sources: list[Path]
) -> dict:
    """Call ai_task.generate_data with the photos as attachments and return its data."""
    if not hass.services.has_service("ai_task", "generate_data"):
        raise AiNotConfigured
    media_name, media_dir = _media_target(hass)
    written = await hass.async_add_executor_job(_write_files, media_dir, sources)
    try:
        data: dict = {
            "task_name": "DishWish recipe from photo",
            "instructions": _PROMPTS["de" if language.startswith("de") else "en"],
            "structure": _structure(),
            "attachments": [
                {
                    "media_content_id": f"media-source://media_source/{media_name}/"
                    f"{TMP_MEDIA_DIR}/{path.name}",
                    "media_content_type": "image/jpeg",
                }
                for path in written
            ],
        }
        if entity_id:
            data["entity_id"] = entity_id
        try:
            async with asyncio.timeout(AI_TIMEOUT):
                response = await hass.services.async_call(
                    "ai_task", "generate_data", data, blocking=True, return_response=True
                )
        except HomeAssistantError as err:
            if "no preferred entity" in str(err):
                raise AiNotConfigured from err
            _LOGGER.warning("AI task failed: %s", err)
            raise AiFailed from err
        except TimeoutError as err:
            raise AiFailed from err
    finally:
        await hass.async_add_executor_job(_delete_files, written)
    result = (response or {}).get("data")
    if not isinstance(result, dict):
        raise AiFailed
    return result


def _as_list(value: object) -> list[str]:
    if isinstance(value, str):
        value = [value]
    return [str(v) for v in value if str(v).strip()] if isinstance(value, list) else []


def _minutes(value: object) -> str | None:
    try:
        number = int(float(value))  # type: ignore[arg-type]
    except TypeError, ValueError:
        return None
    return f"PT{number}M" if number > 0 else None


async def async_import_photos(
    hass: HomeAssistant, store: DishWishStore, actor: Actor, image_ids: list[str]
) -> dict:
    """Read the uploaded photos with the AI task and return an unsaved RecipeInput draft."""
    if not 1 <= len(image_ids) <= MAX_PHOTOS:
        raise Invalid
    owned = await store.async_owned_uploads(actor, image_ids)
    if len(owned) != len(image_ids):
        raise Invalid
    try:
        entries = hass.config_entries.async_loaded_entries(DOMAIN)
        options = entries[0].options if entries else {}
        sources = [image_path(store.images_dir, i, "full") for i in image_ids]
        data = await _run_ai(hass, options.get(CONF_AI_TASK_ENTITY), hass.config.language, sources)
    finally:
        await store.async_discard_uploads(image_ids)  # the page photos are not kept

    node = {
        "name": data.get("name"),
        "description": clean_text(data.get("description"))[:MAX_DESCRIPTION],
        "recipeYield": str(data.get("servings") or ""),
        "prepTime": _minutes(data.get("prep_minutes")),
        "cookTime": _minutes(data.get("cook_minutes")),
        "recipeIngredient": _as_list(data.get("ingredients")),
        "recipeInstructions": _as_list(data.get("steps")),
        "recipeCategory": _as_list(data.get("categories")),
    }
    categories = await store.async_list_categories()
    default_servings = int(options.get(CONF_DEFAULT_SERVINGS, DEFAULT_SERVINGS))
    draft, _ = build_draft(node, "", categories, default_servings)
    if not (clean_text(node["name"]) and (draft["ingredients"] or draft["steps"])):
        raise ImportFailed("no_recipe_found")
    draft["source_url"] = None
    draft["source_name"] = (
        "Kochbuch-Foto" if hass.config.language.startswith("de") else "Cookbook photo"
    )
    draft["notes"] = clean_text(data.get("notes"))[:MAX_NOTES]
    return draft
