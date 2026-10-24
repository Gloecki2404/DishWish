"""Async facade over the SQLite layer: DB thread, permissions, change signal, write lock."""

from __future__ import annotations

import asyncio
import logging
import sqlite3
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from functools import partial
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.dispatcher import async_dispatcher_send

from . import db, images
from .const import (
    DOMAIN,
    EVENT_WISH_ADDED,
    EVENT_WISHES_COMPLETED,
    ORPHAN_FILE_MAX_AGE_H,
    ORPHAN_ROW_MAX_AGE_H,
    SIGNAL_CHANGED,
    SYSTEM_USER,
)

_LOGGER = logging.getLogger(__name__)


def get_store(hass: HomeAssistant) -> DishWishStore:
    """Return the store of the loaded config entry or raise a clear error."""
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    if not entries:
        raise HomeAssistantError("DishWish is not loaded")
    return entries[0].runtime_data


class Unauthorized(db.DbError):
    """The user may not perform this action."""

    code = "unauthorized"


@dataclass(frozen=True)
class Actor:
    """Who performs an action. user_id None = system (services, automations)."""

    user_id: str | None
    is_admin: bool = False


SYSTEM = Actor(None, True)


class DishWishStore:
    """Owns the DB thread and connection; all access goes through here."""

    def __init__(self, hass: HomeAssistant, data_dir: Path, language: str) -> None:
        self.hass = hass
        self.data_dir = data_dir
        self.db_path = data_dir / "dishwish.db"
        self.images_dir = data_dir / "images"
        self._language = language
        self._executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="dishwish_db")
        self._conn: sqlite3.Connection | None = None
        self._writes_allowed = asyncio.Event()
        self._writes_allowed.set()
        self._user_names: dict[str, str] = {}

    # --- lifecycle -----------------------------------------------------------

    def _open(self) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self._conn = db.open_db(self.db_path, self._language)

    async def async_open(self) -> None:
        """Open the database inside the DB thread. Raises db.DatabaseCorrupt."""
        try:
            await self.hass.loop.run_in_executor(self._executor, self._open)
        except BaseException:
            self._executor.shutdown(wait=False)
            raise

    async def async_close(self) -> None:
        """Close the connection in its thread and stop the executor."""
        if self._conn is not None:
            await self.hass.loop.run_in_executor(self._executor, self._conn.close)
            self._conn = None
        self._executor.shutdown(wait=False)

    async def _read(self, func: Any, *args: Any) -> Any:
        assert self._conn is not None
        return await self.hass.loop.run_in_executor(
            self._executor, partial(func, self._conn, *args)
        )

    async def _write(self, func: Any, *args: Any) -> Any:
        await self._writes_allowed.wait()
        return await self._read(func, *args)

    def _notify(self, kind: str, ids: list[str] | None = None) -> None:
        async_dispatcher_send(self.hass, SIGNAL_CHANGED, {"kind": kind, "ids": ids or []})

    # --- one-time flags ------------------------------------------------------

    async def async_meta_get(self, key: str) -> str | None:
        """Read a one-time flag."""
        return await self._read(db.get_meta, key)

    async def async_meta_set(self, key: str, value: str) -> None:
        """Write a one-time flag."""
        await self._write(db.set_meta, key, value)

    # --- backup lock ---------------------------------------------------------

    async def async_lock_writes(self) -> None:
        """Block new writes and checkpoint the WAL (runs after already queued writes)."""
        self._writes_allowed.clear()
        await self._read(db.wal_checkpoint)

    def unlock_writes(self) -> None:
        """Allow writes again."""
        self._writes_allowed.set()

    # --- helpers -------------------------------------------------------------

    async def async_user_name(self, user_id: str) -> str:
        """Display name of an HA user (cached)."""
        if user_id not in self._user_names:
            user = await self.hass.auth.async_get_user(user_id)
            self._user_names[user_id] = user.name if user and user.name else user_id
        return self._user_names[user_id]

    async def _require_owner(self, actor: Actor, recipe_id: str) -> dict[str, Any]:
        meta = await self._read(db.get_recipe_meta, recipe_id)
        visible = (
            actor.user_id is None
            or meta["visibility"] == "household"
            or meta["created_by"] == actor.user_id
        )
        if not visible:
            raise db.NotFound
        if not (
            actor.user_id is None
            or actor.is_admin
            or meta["created_by"] in (actor.user_id, SYSTEM_USER)
        ):
            raise Unauthorized
        return meta

    async def _delete_files(self, image_ids: list[str]) -> None:
        if image_ids:
            await self.hass.async_add_executor_job(images.delete_files, self.images_dir, image_ids)

    # --- recipes -------------------------------------------------------------

    async def async_list_recipes(self, actor: Actor) -> list[dict[str, Any]]:
        """Visible recipes (summaries)."""
        return await self._read(db.list_recipes, actor.user_id)

    async def async_get_recipe(self, actor: Actor, recipe_id: str) -> dict[str, Any]:
        """One visible recipe."""
        return await self._read(db.get_recipe, recipe_id, actor.user_id, actor.is_admin)

    async def async_create_recipe(self, actor: Actor, data: dict[str, Any]) -> dict[str, Any]:
        """Create a recipe."""
        owner = actor.user_id or SYSTEM_USER
        recipe_id = await self._write(db.create_recipe, data, owner)
        self._notify("recipes", [recipe_id])
        return await self.async_get_recipe(actor, recipe_id)

    async def async_update_recipe(
        self, actor: Actor, recipe_id: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Replace a recipe's content (owner or admin)."""
        await self._require_owner(actor, recipe_id)
        removed = await self._write(db.update_recipe, recipe_id, data, actor.user_id or "system")
        await self._delete_files(removed)
        self._notify("recipes", [recipe_id])
        return await self.async_get_recipe(actor, recipe_id)

    async def async_delete_recipe(self, actor: Actor, recipe_id: str) -> None:
        """Delete a recipe and its image files (owner or admin)."""
        await self._require_owner(actor, recipe_id)
        image_ids = await self._write(db.delete_recipe, recipe_id)
        await self._delete_files(image_ids)
        self._notify("recipes", [recipe_id])
        self._notify("wishes")

    async def async_count_recipes(self) -> int:
        """Number of recipes."""
        return await self._read(db.count_recipes)

    # --- categories ----------------------------------------------------------

    async def async_list_categories(self) -> list[dict[str, Any]]:
        """All categories."""
        return await self._read(db.list_categories)

    async def async_create_category(self, name: str, icon: str | None) -> dict[str, Any]:
        """Create a category (any user)."""
        category = await self._write(db.create_category, name, icon)
        self._notify("categories", [category["id"]])
        return category

    async def async_update_category(
        self, actor: Actor, category_id: str, fields: dict[str, Any]
    ) -> dict[str, Any]:
        """Update a category (admin)."""
        if not actor.is_admin:
            raise Unauthorized
        category = await self._write(db.update_category, category_id, fields)
        self._notify("categories", [category_id])
        return category

    async def async_delete_category(self, actor: Actor, category_id: str) -> None:
        """Delete a category (admin)."""
        if not actor.is_admin:
            raise Unauthorized
        await self._write(db.delete_category, category_id)
        self._notify("categories", [category_id])
        self._notify("recipes")

    # --- wishes --------------------------------------------------------------

    async def _with_names(self, wishes: list[dict[str, Any]]) -> list[dict[str, Any]]:
        for wish in wishes:
            wish["user_name"] = await self.async_user_name(wish["user_id"])
        return wishes

    async def async_list_wishes(
        self, actor: Actor, status: str = "open", limit: int | None = None
    ) -> list[dict[str, Any]]:
        """Wishes of visible recipes."""
        wishes = await self._read(db.list_wishes, actor.user_id, status, limit)
        return await self._with_names(wishes)

    async def async_add_wish(self, actor: Actor, recipe_id: str, note: str = "") -> dict[str, Any]:
        """Add an open wish for the acting user."""
        if actor.user_id is None:
            raise Unauthorized
        wish = (
            await self._with_names([await self._write(db.add_wish, recipe_id, actor.user_id, note)])
        )[0]
        self._notify("wishes", [recipe_id])
        self.hass.bus.async_fire(
            EVENT_WISH_ADDED,
            {
                "recipe_id": recipe_id,
                "recipe_name": wish["recipe_name"],
                "user_id": actor.user_id,
                "user_name": wish["user_name"],
                "note": note,
            },
        )
        return wish

    async def async_remove_wish(self, actor: Actor, wish_id: str) -> None:
        """Remove an own wish (admins may remove any)."""
        wish = await self._read(db.get_wish, wish_id)
        if not (actor.user_id is None or actor.is_admin or wish["user_id"] == actor.user_id):
            raise Unauthorized
        await self._write(db.remove_wish, wish_id)
        self._notify("wishes", [wish["recipe_id"]])

    async def async_complete_wishes(self, actor: Actor, recipe_id: str) -> int:
        """'Cooked': mark all open wishes of a visible recipe as done."""
        meta = await self._read(db.get_recipe_meta, recipe_id)
        if (
            actor.user_id is not None
            and meta["visibility"] == "private"
            and meta["created_by"] != actor.user_id
        ):
            raise db.NotFound
        count = await self._write(db.complete_wishes, recipe_id)
        self._notify("wishes", [recipe_id])
        if count:
            self.hass.bus.async_fire(
                EVENT_WISHES_COMPLETED,
                {"recipe_id": recipe_id, "recipe_name": meta["name"], "count": count},
            )
        return count

    async def async_open_wish_summary(
        self, max_items: int = 20
    ) -> tuple[int, list[dict[str, Any]]]:
        """(open wish count, per-recipe summary for the sensor attribute)."""
        wishes = await self.async_list_wishes(SYSTEM, "open")
        grouped: dict[str, dict[str, Any]] = {}
        for wish in wishes:
            entry = grouped.setdefault(
                wish["recipe_id"], {"recipe": wish["recipe_name"], "users": [], "notes": []}
            )
            entry["users"].append(wish["user_name"])
            if wish["note"]:
                entry["notes"].append(wish["note"])
        return len(wishes), list(grouped.values())[:max_items]

    async def async_open_wish_recipes(self) -> list[dict[str, Any]]:
        """Full recipes (own servings) that have open wishes; each recipe once."""
        ids = await self._read(db.open_wish_recipe_ids)
        return [await self._read(db.get_recipe, rid, None) for rid in ids]

    # --- images --------------------------------------------------------------

    async def async_add_upload(self, actor: Actor, data: bytes) -> dict[str, str]:
        """Process an uploaded image and register it as unassigned."""
        image_id = db.new_id()
        await self.hass.async_add_executor_job(images.save_image, self.images_dir, image_id, data)
        try:
            await self._write(db.insert_upload, image_id, actor.user_id or "system")
        except BaseException:
            await self._delete_files([image_id])
            raise
        return db.image_urls(image_id)

    async def async_image_known(self, image_id: str) -> bool:
        """Whether an image row exists."""
        return await self._read(db.image_exists, image_id)

    async def async_cleanup(self) -> None:
        """Remove stale unassigned uploads and orphaned files."""
        stale = await self._write(db.delete_stale_uploads, ORPHAN_ROW_MAX_AGE_H)
        await self._delete_files(stale)
        known = await self._read(db.all_image_ids)
        removed = await self.hass.async_add_executor_job(
            images.delete_orphan_files, self.images_dir, known, ORPHAN_FILE_MAX_AGE_H
        )
        if stale or removed:
            _LOGGER.debug("Cleanup removed %d stale uploads, %d orphan files", len(stale), removed)
