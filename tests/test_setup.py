"""Config flow, setup/unload, corrupt DB, backup lock, cleanup, performance."""

from __future__ import annotations

import asyncio
import gzip
import json
import time

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import issue_registry as ir
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dishwish import backup
from custom_components.dishwish.const import (
    CONF_DEFAULT_SERVINGS,
    CONF_DEFAULT_SHOPPING_LIST,
    DOMAIN,
)
from custom_components.dishwish.store import SYSTEM, Actor, get_store

from .conftest import call, jpeg_bytes, recipe_input


async def test_config_flow_single_instance(hass: HomeAssistant, tmp_path):
    hass.config.config_dir = str(tmp_path)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()

    again = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert again["type"] is FlowResultType.ABORT
    assert again["reason"] == "single_instance_allowed"


async def test_options_flow(hass: HomeAssistant, setup_integration):
    result = await hass.config_entries.options.async_init(setup_integration.entry_id)
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {CONF_DEFAULT_SERVINGS: 6, CONF_DEFAULT_SHOPPING_LIST: "todo.einkauf"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert setup_integration.options[CONF_DEFAULT_SERVINGS] == 6
    assert setup_integration.options[CONF_DEFAULT_SHOPPING_LIST] == "todo.einkauf"


async def test_unload_and_reload(hass: HomeAssistant, setup_integration):
    store = get_store(hass)
    await store.async_create_recipe(SYSTEM, recipe_input())
    assert await hass.config_entries.async_unload(setup_integration.entry_id)
    assert setup_integration.state is config_entries.ConfigEntryState.NOT_LOADED
    assert await hass.config_entries.async_setup(setup_integration.entry_id)
    assert await get_store(hass).async_count_recipes() == 1


async def test_corrupt_db_blocks_setup_and_is_kept(hass: HomeAssistant, tmp_path):
    hass.config.config_dir = str(tmp_path)
    data_dir = tmp_path / "dishwish"
    data_dir.mkdir()
    garbage = b"garbage" * 1000
    (data_dir / "dishwish.db").write_bytes(garbage)

    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    assert entry.state is config_entries.ConfigEntryState.SETUP_ERROR
    assert (data_dir / "dishwish.db").read_bytes() == garbage
    assert ir.async_get(hass).async_get_issue(DOMAIN, "database_corrupt") is not None


async def test_backup_write_lock(hass: HomeAssistant, setup_integration):
    store = get_store(hass)
    await backup.async_pre_backup(hass)

    blocked = asyncio.create_task(store.async_create_recipe(SYSTEM, recipe_input()))
    await asyncio.sleep(0.2)
    assert not blocked.done()
    # reads still work while locked
    assert await store.async_list_recipes(SYSTEM) == []

    await backup.async_post_backup(hass)
    recipe = await asyncio.wait_for(blocked, 5)
    assert recipe["name"] == "Spaghetti"


async def test_backup_hooks_without_entry_do_not_raise(hass: HomeAssistant):
    await backup.async_pre_backup(hass)
    await backup.async_post_backup(hass)


async def test_cleanup_removes_stale_uploads(hass: HomeAssistant, setup_integration):
    store = get_store(hass)
    stale = await store.async_add_upload(Actor("u1"), jpeg_bytes())
    fresh = await store.async_add_upload(Actor("u1"), jpeg_bytes())

    def age(conn, image_id: str) -> None:
        with conn:
            conn.execute(
                "UPDATE recipe_images SET created_at = '2000-01-01T00:00:00+00:00' WHERE id = ?",
                (image_id,),
            )

    await store._write(age, stale["id"])  # noqa: SLF001
    await store.async_cleanup()
    assert not await store.async_image_known(stale["id"])
    assert await store.async_image_known(fresh["id"])
    names = {p.name for p in store.images_dir.iterdir()}
    assert names == {f"{fresh['id']}_full.jpg", f"{fresh['id']}_thumb.jpg"}


async def test_list_performance_with_1000_recipes(hass: HomeAssistant, setup_integration):
    store = get_store(hass)
    conn = store._conn  # noqa: SLF001

    def seed(connection) -> None:
        from custom_components.dishwish import db

        cats = [c["id"] for c in db.list_categories(connection)]
        for i in range(1000):
            data = {
                "name": f"Gericht {i:04d} mit einem etwas längeren Namen",
                "category_ids": cats[: 1 + i % 3],
                "ingredients": [{"name": "Zutat", "quantity": 1, "unit": "g"}],
                "steps": [{"text": "Machen."}],
            }
            db.create_recipe(connection, data, "seed")

    assert conn is not None
    await hass.loop.run_in_executor(store._executor, seed, conn)  # noqa: SLF001

    start = time.perf_counter()
    items = await store.async_list_recipes(Actor("someone"))
    elapsed = time.perf_counter() - start
    assert len(items) == 1000
    assert elapsed < 0.1, f"recipes/list took {elapsed * 1000:.0f} ms"
    # Payload goal < 250 KB is measured as sent over the (compressed) WebSocket.
    raw = json.dumps(items).encode()
    assert len(raw) < 500_000
    assert len(gzip.compress(raw)) < 250_000


async def test_list_via_websocket_with_many_recipes(hass, setup_integration, make_client):
    client, _ = await make_client("alice")
    for i in range(3):
        assert (await call(client, "dishwish/recipes/create", **recipe_input(name=f"R{i}")))[
            "success"
        ]
    assert len((await call(client, "dishwish/recipes/list"))["result"]) == 3
