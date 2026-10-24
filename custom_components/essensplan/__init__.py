"""Essensplan: recipes, meal wishes and shopping list."""

from __future__ import annotations

import logging
from datetime import timedelta
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.typing import ConfigType

from .const import CLEANUP_INTERVAL_H, DATA_DIR_NAME, DOMAIN
from .db import DatabaseCorrupt
from .http import ImageUploadView, ImageView
from .store import EssensplanStore
from .websocket_api import async_register_websocket

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type EssensplanConfigEntry = ConfigEntry[EssensplanStore]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register WebSocket commands and HTTP views once per HA runtime."""
    async_register_websocket(hass)
    hass.http.register_view(ImageUploadView())
    hass.http.register_view(ImageView())
    return True


async def async_setup_entry(hass: HomeAssistant, entry: EssensplanConfigEntry) -> bool:
    """Open the database and start the cleanup job."""
    store = EssensplanStore(hass, Path(hass.config.path(DATA_DIR_NAME)), hass.config.language)
    try:
        await store.async_open()
    except DatabaseCorrupt as err:
        _LOGGER.error("Database check failed for %s: %s", store.db_path, err)
        ir.async_create_issue(
            hass,
            DOMAIN,
            "database_corrupt",
            is_fixable=False,
            severity=ir.IssueSeverity.ERROR,
            translation_key="database_corrupt",
            translation_placeholders={"path": str(store.db_path)},
        )
        raise ConfigEntryError("Essensplan database is damaged") from err
    ir.async_delete_issue(hass, DOMAIN, "database_corrupt")
    entry.runtime_data = store

    async def _cleanup(_now: object = None) -> None:
        try:
            await store.async_cleanup()
        except Exception:
            _LOGGER.exception("Essensplan cleanup failed")

    await _cleanup()
    entry.async_on_unload(
        async_track_time_interval(hass, _cleanup, timedelta(hours=CLEANUP_INTERVAL_H))
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: EssensplanConfigEntry) -> bool:
    """Close the store (interval job is removed by async_on_unload)."""
    await entry.runtime_data.async_close()
    return True
