"""WebSocket API (`dishwish/*`)."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from functools import wraps
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import (
    MAX_DESCRIPTION,
    MAX_IMAGES,
    MAX_INGREDIENTS,
    MAX_MINUTES,
    MAX_NAME,
    MAX_NOTES,
    MAX_PARSE_LINES,
    MAX_SERVINGS,
    MAX_STEP_TEXT,
    MAX_STEPS,
    MAX_WISH_NOTE,
    SIGNAL_CHANGED,
)
from .db import DbError
from .importer import async_import_recipe
from .ingredients import parse_line
from .shopping import async_add_recipe
from .starter import async_import_starter
from .store import Actor, get_store

_Handler = Callable[
    [HomeAssistant, websocket_api.ActiveConnection, dict[str, Any]], Awaitable[None]
]

_TEXT = vol.All(str, vol.Strip)
_NAME = vol.All(str, vol.Strip, vol.Length(min=1, max=MAX_NAME))
_MINUTES = vol.Any(None, vol.All(int, vol.Range(min=0, max=MAX_MINUTES)))
_AMOUNT = vol.Any(None, vol.All(vol.Coerce(float), vol.Range(min=0, max=10_000_000)))

_INGREDIENT = vol.Schema(
    {
        vol.Optional("group_name", default=None): vol.Any(None, vol.All(str, vol.Length(max=200))),
        vol.Optional("quantity", default=None): _AMOUNT,
        vol.Optional("quantity_max", default=None): _AMOUNT,
        vol.Optional("unit", default=""): vol.All(str, vol.Length(max=20)),
        vol.Required("name"): _NAME,
        vol.Optional("note", default=""): vol.All(str, vol.Length(max=500)),
    },
    extra=vol.REMOVE_EXTRA,
)
_STEP = vol.Schema(
    {
        vol.Optional("section", default=None): vol.Any(None, vol.All(str, vol.Length(max=200))),
        vol.Required("text"): vol.All(str, vol.Strip, vol.Length(min=1, max=MAX_STEP_TEXT)),
    },
    extra=vol.REMOVE_EXTRA,
)

RECIPE_FIELDS: dict[Any, Any] = {
    vol.Required("name"): _NAME,
    vol.Optional("description", default=""): vol.All(str, vol.Length(max=MAX_DESCRIPTION)),
    vol.Optional("servings", default=4): vol.All(int, vol.Range(min=1, max=MAX_SERVINGS)),
    vol.Optional("prep_minutes", default=None): _MINUTES,
    vol.Optional("cook_minutes", default=None): _MINUTES,
    vol.Optional("notes", default=""): vol.All(str, vol.Length(max=MAX_NOTES)),
    vol.Optional("source_url", default=None): vol.Any(None, vol.All(str, vol.Length(max=2000))),
    vol.Optional("source_name", default=None): vol.Any(None, vol.All(str, vol.Length(max=200))),
    vol.Optional("visibility", default="household"): vol.In(["private", "household"]),
    vol.Optional("category_ids", default=list): [str],
    vol.Optional("image_ids", default=list): vol.All([str], vol.Length(max=MAX_IMAGES)),
    vol.Optional("ingredients", default=list): vol.All(
        [_INGREDIENT], vol.Length(max=MAX_INGREDIENTS)
    ),
    vol.Optional("steps", default=list): vol.All([_STEP], vol.Length(max=MAX_STEPS)),
}
_RECIPE_KEYS = [k.schema for k in RECIPE_FIELDS]


def _actor(connection: websocket_api.ActiveConnection) -> Actor:
    return Actor(connection.user.id, connection.user.is_admin)


def _command(schema: dict[Any, Any]) -> Callable[[_Handler], Callable[..., Any]]:
    """Register-ready decorator: schema, async, DbError -> WebSocket error code."""

    def decorator(func: _Handler) -> Callable[..., Any]:
        @websocket_api.websocket_command(schema)
        @websocket_api.async_response
        @wraps(func)
        async def wrapper(
            hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
        ) -> None:
            try:
                await func(hass, connection, msg)
            except DbError as err:
                connection.send_error(msg["id"], err.code, err.code)

        return wrapper

    return decorator


def _recipe_data(msg: dict[str, Any]) -> dict[str, Any]:
    return {key: msg[key] for key in _RECIPE_KEYS if key in msg}


@_command({vol.Required("type"): "dishwish/recipes/list"})
async def ws_recipes_list(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """List visible recipes."""
    connection.send_result(msg["id"], await get_store(hass).async_list_recipes(_actor(connection)))


@_command({vol.Required("type"): "dishwish/recipes/get", vol.Required("recipe_id"): str})
async def ws_recipes_get(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Get one recipe."""
    recipe = await get_store(hass).async_get_recipe(_actor(connection), msg["recipe_id"])
    connection.send_result(msg["id"], recipe)


@_command({vol.Required("type"): "dishwish/recipes/create", **RECIPE_FIELDS})
async def ws_recipes_create(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Create a recipe."""
    recipe = await get_store(hass).async_create_recipe(_actor(connection), _recipe_data(msg))
    connection.send_result(msg["id"], recipe)


@_command(
    {
        vol.Required("type"): "dishwish/recipes/update",
        vol.Required("recipe_id"): str,
        **RECIPE_FIELDS,
    }
)
async def ws_recipes_update(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Replace a recipe's content."""
    recipe = await get_store(hass).async_update_recipe(
        _actor(connection), msg["recipe_id"], _recipe_data(msg)
    )
    connection.send_result(msg["id"], recipe)


@_command({vol.Required("type"): "dishwish/recipes/delete", vol.Required("recipe_id"): str})
async def ws_recipes_delete(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Delete a recipe."""
    await get_store(hass).async_delete_recipe(_actor(connection), msg["recipe_id"])
    connection.send_result(msg["id"], {})


@_command(
    {
        vol.Required("type"): "dishwish/recipes/import_url",
        vol.Required("url"): vol.All(str, vol.Length(max=10_000)),
    }
)
async def ws_recipes_import_url(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Load a recipe from a link as an unsaved draft."""
    draft = await async_import_recipe(hass, get_store(hass), _actor(connection), msg["url"])
    connection.send_result(msg["id"], draft)


@_command(
    {
        vol.Required("type"): "dishwish/recipes/import_starter",
        vol.Optional("language"): vol.All(str, vol.Length(max=10)),
    }
)
async def ws_recipes_import_starter(
    hass: HomeAssistant, connection: Any, msg: dict[str, Any]
) -> None:
    """Add the starter dishes (German/Austrian classics) in the given language."""
    result = await async_import_starter(
        hass, get_store(hass), _actor(connection), msg.get("language") or hass.config.language
    )
    connection.send_result(msg["id"], result)


@_command(
    {
        vol.Required("type"): "dishwish/ingredients/parse",
        vol.Required("lines"): vol.All(
            [vol.All(str, vol.Length(max=500))], vol.Length(max=MAX_PARSE_LINES)
        ),
    }
)
async def ws_ingredients_parse(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Parse ingredient lines."""
    result = [parse_line(line) for line in msg["lines"] if line.strip()]
    connection.send_result(msg["id"], result)


@_command({vol.Required("type"): "dishwish/categories/list"})
async def ws_categories_list(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """List categories."""
    connection.send_result(msg["id"], await get_store(hass).async_list_categories())


@_command(
    {
        vol.Required("type"): "dishwish/categories/create",
        vol.Required("name"): vol.All(str, vol.Strip, vol.Length(min=1, max=100)),
        vol.Optional("icon"): vol.All(str, vol.Length(max=100)),
    }
)
async def ws_categories_create(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Create a category."""
    category = await get_store(hass).async_create_category(msg["name"], msg.get("icon"))
    connection.send_result(msg["id"], category)


@_command(
    {
        vol.Required("type"): "dishwish/categories/update",
        vol.Required("category_id"): str,
        vol.Optional("name"): vol.All(str, vol.Strip, vol.Length(min=1, max=100)),
        vol.Optional("icon"): vol.All(str, vol.Length(max=100)),
        vol.Optional("position"): vol.All(int, vol.Range(min=0, max=10_000)),
    }
)
async def ws_categories_update(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Update a category (admin)."""
    fields = {k: msg[k] for k in ("name", "icon", "position") if k in msg}
    category = await get_store(hass).async_update_category(
        _actor(connection), msg["category_id"], fields
    )
    connection.send_result(msg["id"], category)


@_command({vol.Required("type"): "dishwish/categories/delete", vol.Required("category_id"): str})
async def ws_categories_delete(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Delete a category (admin)."""
    await get_store(hass).async_delete_category(_actor(connection), msg["category_id"])
    connection.send_result(msg["id"], {})


@_command(
    {
        vol.Required("type"): "dishwish/wishes/list",
        vol.Optional("status", default="open"): vol.In(["open", "done"]),
        vol.Optional("limit"): vol.All(int, vol.Range(min=1, max=500)),
    }
)
async def ws_wishes_list(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """List wishes of visible recipes."""
    wishes = await get_store(hass).async_list_wishes(
        _actor(connection), msg["status"], msg.get("limit")
    )
    connection.send_result(msg["id"], wishes)


@_command(
    {
        vol.Required("type"): "dishwish/wishes/add",
        vol.Required("recipe_id"): str,
        vol.Optional("note", default=""): vol.All(str, vol.Strip, vol.Length(max=MAX_WISH_NOTE)),
    }
)
async def ws_wishes_add(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Add a wish for yourself."""
    wish = await get_store(hass).async_add_wish(_actor(connection), msg["recipe_id"], msg["note"])
    connection.send_result(msg["id"], wish)


@_command({vol.Required("type"): "dishwish/wishes/remove", vol.Required("wish_id"): str})
async def ws_wishes_remove(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Remove an own wish (admins: any)."""
    await get_store(hass).async_remove_wish(_actor(connection), msg["wish_id"])
    connection.send_result(msg["id"], {})


@_command({vol.Required("type"): "dishwish/wishes/complete", vol.Required("recipe_id"): str})
async def ws_wishes_complete(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """'Cooked': complete all open wishes of a recipe."""
    count = await get_store(hass).async_complete_wishes(_actor(connection), msg["recipe_id"])
    connection.send_result(msg["id"], {"count": count})


@_command(
    {
        vol.Required("type"): "dishwish/shopping/add",
        vol.Required("recipe_id"): str,
        vol.Optional("servings"): vol.All(int, vol.Range(min=1, max=MAX_SERVINGS)),
        vol.Optional("ingredient_ids"): [int],
        vol.Optional("entity_id"): cv.entity_id,
    }
)
async def ws_shopping_add(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Add (scaled) ingredients of a recipe to a to-do list."""
    result = await async_add_recipe(
        hass,
        get_store(hass),
        _actor(connection),
        msg["recipe_id"],
        msg.get("servings"),
        msg.get("ingredient_ids"),
        msg.get("entity_id"),
    )
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "dishwish/subscribe"})
@callback
def ws_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Subscribe to change events `{kind, ids}`."""

    @callback
    def forward(data: dict[str, Any]) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], data))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_CHANGED, forward)
    connection.send_result(msg["id"])


def async_register_websocket(hass: HomeAssistant) -> None:
    """Register all commands (once per HA runtime)."""
    for command in (
        ws_recipes_list,
        ws_recipes_get,
        ws_recipes_create,
        ws_recipes_update,
        ws_recipes_delete,
        ws_recipes_import_url,
        ws_recipes_import_starter,
        ws_ingredients_parse,
        ws_categories_list,
        ws_categories_create,
        ws_categories_update,
        ws_categories_delete,
        ws_wishes_list,
        ws_wishes_add,
        ws_wishes_remove,
        ws_wishes_complete,
        ws_shopping_add,
        ws_subscribe,
    ):
        websocket_api.async_register_command(hass, command)
