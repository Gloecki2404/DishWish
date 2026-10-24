"""Shared fixtures."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from io import BytesIO
from typing import Any

import pytest
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.auth.models import User
from homeassistant.core import HomeAssistant
from PIL import Image
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.dishwish.const import DOMAIN

CLIENT_ID = "https://example.com/app"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Allow loading custom_components in every test."""


@pytest.fixture(autouse=True)
def no_starter_dishes(request: pytest.FixtureRequest, monkeypatch: pytest.MonkeyPatch) -> None:
    """Most tests want an empty library; mark a test with `starter` to keep the first-run seeding."""
    if request.node.get_closest_marker("starter"):
        return

    async def _skip(*_args: Any) -> None:
        return None

    monkeypatch.setattr("custom_components.dishwish.async_seed_starter_once", _skip)


@pytest.fixture
async def setup_integration(hass: HomeAssistant, tmp_path) -> MockConfigEntry:
    """Set up DishWish with a temporary config dir."""
    hass.config.config_dir = str(tmp_path)
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.fixture
def make_client(hass: HomeAssistant, hass_ws_client: Callable[..., Awaitable[Any]]):
    """Factory: (name, admin) -> (ws client, user)."""

    async def _make(name: str, admin: bool = False) -> tuple[Any, User]:
        groups = ["system-admin"] if admin else [GROUP_ID_USER]
        user = await hass.auth.async_create_user(name, group_ids=groups)
        refresh = await hass.auth.async_create_refresh_token(user, CLIENT_ID)
        token = hass.auth.async_create_access_token(refresh)
        return await hass_ws_client(hass, token), user

    return _make


async def call(client: Any, type_: str, **kwargs: Any) -> dict[str, Any]:
    """Send one WebSocket command and return the full response."""
    await client.send_json_auto_id({"type": type_, **kwargs})
    return await client.receive_json()


def jpeg_bytes(
    size: tuple[int, int] = (320, 240), color: Any = (200, 30, 30), **save: Any
) -> bytes:
    """Create a small JPEG."""
    out = BytesIO()
    Image.new("RGB", size, color).save(out, "JPEG", **save)
    return out.getvalue()


def recipe_input(**overrides: Any) -> dict[str, Any]:
    """Minimal valid RecipeInput."""
    data: dict[str, Any] = {
        "name": "Spaghetti",
        "servings": 4,
        "ingredients": [{"name": "Nudeln", "quantity": 500, "unit": "g"}],
        "steps": [{"text": "Kochen."}],
    }
    data.update(overrides)
    return data
