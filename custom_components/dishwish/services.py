"""Services: add recipes / open wishes to a shopping list (usable from automations)."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, MAX_SERVINGS
from .db import DbError
from .shopping import async_add_open_wishes, async_add_recipe
from .store import SYSTEM, get_store

SERVICE_ADD_TO_SHOPPING_LIST = "add_to_shopping_list"
SERVICE_ADD_OPEN_WISHES = "add_open_wishes_to_shopping_list"

_ADD_RECIPE_SCHEMA = vol.Schema(
    {
        vol.Required("recipe_id"): cv.string,
        vol.Optional("servings"): vol.All(vol.Coerce(int), vol.Range(min=1, max=MAX_SERVINGS)),
        vol.Optional("entity_id"): cv.entity_id,
    }
)
_ADD_WISHES_SCHEMA = vol.Schema({vol.Optional("entity_id"): cv.entity_id})


def _raise(err: DbError) -> ServiceValidationError:
    return ServiceValidationError(
        translation_domain=DOMAIN, translation_key=err.code, translation_placeholders={}
    )


async def _add_to_shopping_list(call: ServiceCall) -> dict[str, Any]:
    try:
        return await async_add_recipe(
            call.hass,
            get_store(call.hass),
            SYSTEM,
            call.data["recipe_id"],
            call.data.get("servings"),
            None,
            call.data.get("entity_id"),
        )
    except DbError as err:
        raise _raise(err) from err


async def _add_open_wishes(call: ServiceCall) -> dict[str, Any]:
    try:
        return await async_add_open_wishes(
            call.hass, get_store(call.hass), call.data.get("entity_id")
        )
    except DbError as err:
        raise _raise(err) from err


def async_register_services(hass: HomeAssistant) -> None:
    """Register the services once per HA runtime."""
    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_TO_SHOPPING_LIST,
        _add_to_shopping_list,
        schema=_ADD_RECIPE_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_OPEN_WISHES,
        _add_open_wishes,
        schema=_ADD_WISHES_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
