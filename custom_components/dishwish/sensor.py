"""Sensors: open wishes and number of recipes. Updated by change signals, no polling."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import DishWishConfigEntry
from .const import DOMAIN, SIGNAL_CHANGED
from .store import DishWishStore


class _DishWishSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, entry: DishWishConfigEntry, key: str) -> None:
        self._store: DishWishStore = entry.runtime_data
        self._attr_translation_key = key
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        # Fixed entity IDs (sensor.dishwish_open_wishes, ...) regardless of the HA language, so
        # dashboards keep working across installations. Only the display name is translated.
        self.internal_integration_suggested_object_id = f"dishwish_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name="DishWish",
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        """Refresh on every change signal."""

        @callback
        def _changed(_data: dict[str, Any]) -> None:
            self.async_schedule_update_ha_state(True)

        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_CHANGED, _changed))


class OpenWishesSensor(_DishWishSensor):
    """Number of open wishes; attribute `wishes` lists up to 20 recipes."""

    _unrecorded_attributes = frozenset({"wishes"})

    def __init__(self, entry: DishWishConfigEntry) -> None:
        super().__init__(entry, "open_wishes")

    async def async_update(self) -> None:
        """Read the current counts."""
        count, summary = await self._store.async_open_wish_summary()
        self._attr_native_value = count
        self._attr_extra_state_attributes = {"wishes": summary}


class RecipesSensor(_DishWishSensor):
    """Number of recipes."""

    def __init__(self, entry: DishWishConfigEntry) -> None:
        super().__init__(entry, "recipes")

    async def async_update(self) -> None:
        """Read the current count."""
        self._attr_native_value = await self._store.async_count_recipes()


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DishWishConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the sensors."""
    async_add_entities([OpenWishesSensor(entry), RecipesSensor(entry)], True)
