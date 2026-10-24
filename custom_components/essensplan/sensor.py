"""Sensors: open wishes and number of recipes. Updated by change signals, no polling."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import EssensplanConfigEntry
from .const import DOMAIN, SIGNAL_CHANGED
from .store import EssensplanStore


class _EssensplanSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, entry: EssensplanConfigEntry, key: str) -> None:
        self._store: EssensplanStore = entry.runtime_data
        self._attr_translation_key = key
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name="Essensplan",
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        """Refresh on every change signal."""

        @callback
        def _changed(_data: dict[str, Any]) -> None:
            self.async_schedule_update_ha_state(True)

        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_CHANGED, _changed))


class OpenWishesSensor(_EssensplanSensor):
    """Number of open wishes; attribute `wishes` lists up to 20 recipes."""

    _unrecorded_attributes = frozenset({"wishes"})

    def __init__(self, entry: EssensplanConfigEntry) -> None:
        super().__init__(entry, "open_wishes")

    async def async_update(self) -> None:
        """Read the current counts."""
        count, summary = await self._store.async_open_wish_summary()
        self._attr_native_value = count
        self._attr_extra_state_attributes = {"wishes": summary}


class RecipesSensor(_EssensplanSensor):
    """Number of recipes."""

    def __init__(self, entry: EssensplanConfigEntry) -> None:
        super().__init__(entry, "recipes")

    async def async_update(self) -> None:
        """Read the current count."""
        self._attr_native_value = await self._store.async_count_recipes()


async def async_setup_entry(
    hass: HomeAssistant,
    entry: EssensplanConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the sensors."""
    async_add_entities([OpenWishesSensor(entry), RecipesSensor(entry)], True)
