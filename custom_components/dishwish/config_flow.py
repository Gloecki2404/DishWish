"""Config flow for DishWish."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import (
    CONF_DEFAULT_SERVINGS,
    CONF_DEFAULT_SHOPPING_LIST,
    DEFAULT_SERVINGS,
    DOMAIN,
)


class DishWishConfigFlow(ConfigFlow, domain=DOMAIN):
    """Single-step setup without inputs."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Create the (single) entry."""
        if user_input is not None:
            return self.async_create_entry(title="DishWish", data={})
        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow."""
        return DishWishOptionsFlow()


class DishWishOptionsFlow(OptionsFlow):
    """Default shopping list and servings."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(data=user_input)

        opts = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_DEFAULT_SHOPPING_LIST,
                    description={"suggested_value": opts.get(CONF_DEFAULT_SHOPPING_LIST)},
                ): selector.EntitySelector(selector.EntitySelectorConfig(domain="todo")),
                vol.Required(
                    CONF_DEFAULT_SERVINGS,
                    default=opts.get(CONF_DEFAULT_SERVINGS, DEFAULT_SERVINGS),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=1, max=20, step=1, mode=selector.NumberSelectorMode.BOX
                    )
                ),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
