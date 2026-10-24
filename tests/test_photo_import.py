"""Recipe from photos via an AI task (mocked: no real model is called)."""

from __future__ import annotations

from pathlib import Path

import pytest
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.exceptions import HomeAssistantError

from custom_components.dishwish.const import CONF_AI_TASK_ENTITY
from custom_components.dishwish.store import Actor, get_store

from .conftest import call, jpeg_bytes

AI_RESULT = {
    "name": "Marillenknödel",
    "description": "Süße Knödel aus Topfenteig.",
    "servings": 4,
    "prep_minutes": 30,
    "cook_minutes": 15.0,
    "ingredients": ["250 g Topfen", "1/2 TL Salz", "8 Marillen", ""],
    "steps": ["1. Teig kneten.", "2) Marillen einhüllen.", "Knödel kochen."],
    "categories": ["Dessert", "Mehlspeisen Rezepte"],
    "notes": "Mit Butterbröseln servieren.",
}


@pytest.fixture
def ai(hass: HomeAssistant, tmp_path):
    """A fake ai_task.generate_data service that records what it was asked."""
    media = tmp_path / "media"
    hass.config.media_dirs = {"local": str(media)}
    state = {
        "calls": [],
        "result": {"conversation_id": "x", "data": dict(AI_RESULT)},
        "error": None,
    }

    async def handler(service_call: ServiceCall):
        data = dict(service_call.data)
        seen = []
        for attachment in data.get("attachments", []):
            name = attachment["media_content_id"].rsplit("/", 1)[-1]
            seen.append((media / "dishwish_tmp" / name).is_file())
        state["calls"].append({**data, "files_present": seen})
        if state["error"]:
            raise state["error"]
        return state["result"]

    hass.services.async_register(
        "ai_task", "generate_data", handler, supports_response=SupportsResponse.ONLY
    )
    hass.states.async_set("ai_task.fake", "unknown", {"supported_features": 7})
    state["media"] = media
    return state


async def _upload(hass, user_id: str, count: int = 1) -> list[str]:
    store = get_store(hass)
    return [
        (await store.async_add_upload(Actor(user_id), jpeg_bytes()))["id"] for _ in range(count)
    ]


async def test_photo_import_returns_a_draft_and_cleans_up(hass, setup_integration, make_client, ai):
    client, user = await make_client("alice")
    ids = await _upload(hass, user.id, 2)
    hass.config_entries.async_update_entry(
        setup_integration, options={CONF_AI_TASK_ENTITY: "ai_task.fake"}
    )

    resp = await call(client, "dishwish/recipes/import_photos", image_ids=ids)
    assert resp["success"], resp
    draft = resp["result"]
    assert draft["name"] == "Marillenknödel" and draft["servings"] == 4
    assert (draft["prep_minutes"], draft["cook_minutes"]) == (30, 15)
    assert [(i["quantity"], i["unit"], i["name"]) for i in draft["ingredients"]] == [
        (250, "g", "Topfen"),
        (0.5, "TL", "Salz"),
        (8, "", "Marillen"),
    ]
    assert [s["text"] for s in draft["steps"]] == [
        "Teig kneten.",
        "Marillen einhüllen.",
        "Knödel kochen.",
    ]
    assert draft["new_categories"] == ["Mehlspeisen"]  # "Dessert" exists and is selected instead
    assert len(draft["category_ids"]) == 1
    assert draft["notes"] == "Mit Butterbröseln servieren."
    assert draft["source_url"] is None and draft["source_name"] == "Cookbook photo"
    assert draft["image_ids"] == []

    (request,) = ai["calls"]
    assert request["entity_id"] == "ai_task.fake"
    assert len(request["attachments"]) == 2 and request["files_present"] == [True, True]
    assert all(a["media_content_type"] == "image/jpeg" for a in request["attachments"])
    assert request["attachments"][0]["media_content_id"].startswith(
        "media-source://media_source/local/dishwish_tmp/"
    )
    assert set(request["structure"]) >= {"name", "ingredients", "steps", "servings", "categories"}
    assert "cookbook" in request["instructions"].lower()
    # temporary copies and the uploaded page photos are gone, nothing was saved
    assert not (ai["media"] / "dishwish_tmp").exists()
    store = get_store(hass)
    assert not [p for p in store.images_dir.iterdir()]
    assert (await call(client, "dishwish/recipes/list"))["result"] == []

    # saving the draft works and the recipe counts as not shareable
    payload = {k: v for k, v in draft.items() if k not in ("category_ids", "new_categories")}
    saved = await call(client, "dishwish/recipes/create", **payload)
    assert saved["success"], saved
    assert saved["result"]["shareable"] == 0


async def test_an_ai_task_with_image_support_is_picked_without_an_option(
    hass, setup_integration, make_client, ai
):
    client, user = await make_client("alice")
    hass.states.async_set(
        "ai_task.text_only", "unknown", {"supported_features": 1}
    )  # no attachments
    resp = await call(
        client, "dishwish/recipes/import_photos", image_ids=await _upload(hass, user.id)
    )
    assert resp["success"]
    assert ai["calls"][0]["entity_id"] == "ai_task.fake"


async def test_options_must_name_a_task_with_image_support(
    hass, setup_integration, make_client, ai
):
    client, user = await make_client("alice")
    hass.states.async_set("ai_task.text_only", "unknown", {"supported_features": 1})
    hass.config_entries.async_update_entry(
        setup_integration, options={CONF_AI_TASK_ENTITY: "ai_task.text_only"}
    )
    resp = await call(
        client, "dishwish/recipes/import_photos", image_ids=await _upload(hass, user.id)
    )
    assert resp["error"]["code"] == "ai_no_images"
    assert ai["calls"] == []


async def test_no_ai_task_at_all_or_only_text_ones(hass, setup_integration, make_client, ai):
    client, user = await make_client("alice")
    hass.states.async_remove("ai_task.fake")
    resp = await call(
        client, "dishwish/recipes/import_photos", image_ids=await _upload(hass, user.id)
    )
    assert resp["error"]["code"] == "ai_not_configured"
    hass.states.async_set("ai_task.text_only", "unknown", {"supported_features": 1})
    resp = await call(
        client, "dishwish/recipes/import_photos", image_ids=await _upload(hass, user.id)
    )
    assert resp["error"]["code"] == "ai_no_images"


async def test_german_prompt_and_source_name(hass, setup_integration, make_client, ai):
    hass.config.language = "de"
    client, user = await make_client("alice")
    resp = await call(
        client, "dishwish/recipes/import_photos", image_ids=await _upload(hass, user.id)
    )
    assert resp["result"]["source_name"] == "Kochbuch-Foto"
    assert "Kochbuch" in ai["calls"][0]["instructions"]


async def test_errors(hass, setup_integration, make_client, ai):
    client, user = await make_client("alice")
    other, other_user = await make_client("bob")

    async def code(ids):
        return (await call(client, "dishwish/recipes/import_photos", image_ids=ids))["error"][
            "code"
        ]

    # Home Assistant itself reports that no default task is set
    ai["error"] = HomeAssistantError("No entity_id provided and no preferred entity set")
    assert await code(await _upload(hass, user.id)) == "ai_not_configured"
    # any other failure of the model
    ai["error"] = HomeAssistantError("quota exceeded")
    assert await code(await _upload(hass, user.id)) == "ai_failed"
    # a reply that is not a structured answer
    ai["error"] = None
    ai["result"] = {"conversation_id": "x", "data": "just text"}
    assert await code(await _upload(hass, user.id)) == "ai_failed"
    # a page without a recipe
    ai["result"] = {"conversation_id": "x", "data": {"name": "", "ingredients": [], "steps": []}}
    assert await code(await _upload(hass, user.id)) == "no_recipe_found"
    # uploads of somebody else, unknown ids, too many photos
    assert await code(await _upload(hass, other_user.id)) == "invalid_format"
    assert await code(["0" * 32]) == "invalid_format"
    assert await code(await _upload(hass, user.id, 5)) == "invalid_format"
    # temporary files never stay behind, even after failures
    assert not (ai["media"] / "dishwish_tmp").exists()


async def test_without_the_ai_task_service(hass, setup_integration, make_client):
    hass.config.media_dirs = {"local": "/tmp/nowhere"}
    client, user = await make_client("alice")
    resp = await call(
        client, "dishwish/recipes/import_photos", image_ids=await _upload(hass, user.id)
    )
    assert resp["error"]["code"] == "ai_not_configured"


async def test_no_media_directory(hass, setup_integration, make_client, ai):
    hass.config.media_dirs = {}
    client, user = await make_client("alice")
    resp = await call(
        client, "dishwish/recipes/import_photos", image_ids=await _upload(hass, user.id)
    )
    assert resp["error"]["code"] == "ai_failed"
    assert isinstance(Path(ai["media"]), Path)
