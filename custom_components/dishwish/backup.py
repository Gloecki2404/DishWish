"""Backup hooks: pause writes and flush the WAL so backups are consistent."""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .store import DishWishStore


def _loaded_store(hass: HomeAssistant) -> DishWishStore | None:
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    return entries[0].runtime_data if entries else None


async def async_pre_backup(hass: HomeAssistant) -> None:
    """Block new writes, then checkpoint the WAL after already queued writes."""
    if store := _loaded_store(hass):
        await store.async_lock_writes()


async def async_post_backup(hass: HomeAssistant) -> None:
    """Allow writes again."""
    if store := _loaded_store(hass):
        store.unlock_writes()
