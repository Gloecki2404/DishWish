"""Write recipe ingredients into a Home Assistant to-do list."""

from __future__ import annotations

from typing import Any

from homeassistant.components.todo import DOMAIN as TODO_DOMAIN
from homeassistant.components.todo import TodoListEntityFeature
from homeassistant.core import HomeAssistant

from .const import CONF_DEFAULT_SHOPPING_LIST, DOMAIN
from .db import DbError, NotFound
from .ingredients import format_amount, format_line, merge_ingredients
from .store import Actor, EssensplanStore


class EntityNotFound(DbError):
    """No usable to-do list entity."""

    code = "entity_not_found"


def resolve_entity(hass: HomeAssistant, entity_id: str | None) -> str:
    """Call argument -> integration option; must be an existing todo entity."""
    if not entity_id:
        entries = hass.config_entries.async_loaded_entries(DOMAIN)
        entity_id = entries[0].options.get(CONF_DEFAULT_SHOPPING_LIST) if entries else None
    if (
        not entity_id
        or not entity_id.startswith(f"{TODO_DOMAIN}.")
        or hass.states.get(entity_id) is None
    ):
        raise EntityNotFound
    return entity_id


async def async_add_lines(
    hass: HomeAssistant, entity_id: str, lines: list[str], description: str
) -> dict[str, list[str]]:
    """Add lines to the list, skipping ones already open (case-insensitive)."""
    response = await hass.services.async_call(
        TODO_DOMAIN,
        "get_items",
        {"entity_id": entity_id, "status": "needs_action"},
        blocking=True,
        return_response=True,
    )
    items = (response or {}).get(entity_id, {}).get("items", [])
    seen = {str(item.get("summary", "")).casefold() for item in items}

    state = hass.states.get(entity_id)
    features = int(state.attributes.get("supported_features", 0)) if state else 0
    can_describe = bool(features & TodoListEntityFeature.SET_DESCRIPTION_ON_ITEM)

    added: list[str] = []
    skipped: list[str] = []
    for line in lines:
        key = line.casefold()
        if key in seen:
            skipped.append(line)
            continue
        seen.add(key)
        data: dict[str, Any] = {"entity_id": entity_id, "item": line}
        if can_describe and description:
            data["description"] = description
        await hass.services.async_call(TODO_DOMAIN, "add_item", data, blocking=True)
        added.append(line)
    return {"added": added, "skipped": skipped}


def _description(lang: str, recipe_names: list[str]) -> str:
    prefix = "für: " if lang.startswith("de") else "for: "
    return prefix + ", ".join(recipe_names)


async def async_add_recipe(
    hass: HomeAssistant,
    store: EssensplanStore,
    actor: Actor,
    recipe_id: str,
    servings: int | None = None,
    ingredient_ids: list[int] | None = None,
    entity_id: str | None = None,
) -> dict[str, list[str]]:
    """Add (a selection of) a recipe's scaled ingredients to the list."""
    entity_id = resolve_entity(hass, entity_id)
    recipe = await store.async_get_recipe(actor, recipe_id)
    target = servings or recipe["servings"]
    ingredients = [
        ing
        for ing in recipe["ingredients"]
        if ingredient_ids is None or ing["id"] in ingredient_ids
    ]
    if ingredient_ids is not None and not ingredients:
        raise NotFound
    lang = hass.config.language
    lines = [format_line(ing, recipe["servings"], target, lang) for ing in ingredients]
    return await async_add_lines(hass, entity_id, lines, _description(lang, [recipe["name"]]))


async def async_add_open_wishes(
    hass: HomeAssistant, store: EssensplanStore, entity_id: str | None = None
) -> dict[str, list[str]]:
    """Merge the ingredients of all recipes with open wishes and add them to the list."""
    entity_id = resolve_entity(hass, entity_id)
    recipes = await store.async_open_wish_recipes()
    lang = hass.config.language
    items: list[dict[str, Any]] = []
    for recipe in recipes:
        for ing in recipe["ingredients"]:
            items.append({k: ing[k] for k in ("name", "unit", "quantity", "quantity_max")})
    lines = []
    for item in merge_ingredients(items):
        amount = format_amount(item["quantity"], item["quantity_max"], item["unit"], lang)
        lines.append(f"{amount} {item['name']}".strip())
    names = [r["name"] for r in recipes]
    return await async_add_lines(hass, entity_id, lines, _description(lang, names) if names else "")
