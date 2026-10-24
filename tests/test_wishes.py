"""Wishes, shopping list, services and sensors."""

from __future__ import annotations

import pytest
from homeassistant.core import HomeAssistant, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    async_mock_service,
)

from custom_components.dishwish import shopping
from custom_components.dishwish.const import (
    CONF_DEFAULT_SHOPPING_LIST,
    DOMAIN,
    EVENT_WISH_ADDED,
    EVENT_WISHES_COMPLETED,
)

from .conftest import call, recipe_input

LIST = "todo.shopping_list"


@pytest.fixture
async def shopping_list(hass: HomeAssistant, setup_integration) -> str:
    """HA's built-in shopping list as a real to-do entity."""
    entry = MockConfigEntry(domain="shopping_list")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get(LIST) is not None
    return LIST


async def _items(hass: HomeAssistant) -> list[dict]:
    resp = await hass.services.async_call(
        "todo",
        "get_items",
        {"entity_id": LIST, "status": "needs_action"},
        blocking=True,
        return_response=True,
    )
    return resp[LIST]["items"]


async def _create(client, **overrides) -> dict:
    resp = await call(client, "dishwish/recipes/create", **recipe_input(**overrides))
    assert resp["success"], resp
    return resp["result"]


# --- wishes -------------------------------------------------------------------


async def test_wish_lifecycle(hass, setup_integration, make_client):
    alice, alice_user = await make_client("alice")
    bob, bob_user = await make_client("bob")
    added_events = async_capture_events(hass, EVENT_WISH_ADDED)
    done_events = async_capture_events(hass, EVENT_WISHES_COMPLETED)
    recipe = await _create(alice, name="Pizza")

    first = await call(alice, "dishwish/wishes/add", recipe_id=recipe["id"], note="mit Salami")
    assert first["success"], first
    wish = first["result"]
    assert wish["recipe_name"] == "Pizza" and wish["user_id"] == alice_user.id
    assert (
        wish["user_name"] == "alice" and wish["note"] == "mit Salami" and wish["status"] == "open"
    )

    dup = await call(alice, "dishwish/wishes/add", recipe_id=recipe["id"])
    assert dup["error"]["code"] == "already_wished"
    assert (await call(bob, "dishwish/wishes/add", recipe_id=recipe["id"]))["success"]
    await hass.async_block_till_done()

    assert [e.data["user_name"] for e in added_events] == ["alice", "bob"]
    assert added_events[0].data["note"] == "mit Salami"

    wishes = (await call(bob, "dishwish/wishes/list"))["result"]
    assert [w["user_name"] for w in wishes] == ["alice", "bob"]  # oldest first
    summary = (await call(bob, "dishwish/recipes/list"))["result"][0]
    assert summary["open_wish_count"] == 2
    assert summary["my_wish_id"] == wishes[1]["id"]

    done = await call(bob, "dishwish/wishes/complete", recipe_id=recipe["id"])
    assert done["result"] == {"count": 2}
    await hass.async_block_till_done()
    assert done_events[0].data == {"recipe_id": recipe["id"], "recipe_name": "Pizza", "count": 2}
    assert (await call(bob, "dishwish/wishes/list"))["result"] == []
    finished = (await call(bob, "dishwish/wishes/list", status="done", limit=1))["result"]
    assert len(finished) == 1 and finished[0]["status"] == "done" and finished[0]["done_at"]
    assert (await call(bob, "dishwish/recipes/list"))["result"][0]["open_wish_count"] == 0

    # completing again changes nothing and fires no event; a new wish is allowed again
    assert (await call(bob, "dishwish/wishes/complete", recipe_id=recipe["id"]))["result"] == {
        "count": 0
    }
    await hass.async_block_till_done()
    assert len(done_events) == 1
    assert (await call(alice, "dishwish/wishes/add", recipe_id=recipe["id"]))["success"]


async def test_wish_visibility_and_permissions(hass, setup_integration, make_client):
    alice, _ = await make_client("alice")
    bob, _ = await make_client("bob")
    admin, _ = await make_client("root", admin=True)
    secret = await _create(alice, name="Secret", visibility="private")
    shared = await _create(alice, name="Shared")

    # nobody else can wish for, see or complete a private recipe
    assert (await call(bob, "dishwish/wishes/add", recipe_id=secret["id"]))["error"][
        "code"
    ] == "not_found"
    assert (await call(bob, "dishwish/wishes/complete", recipe_id=secret["id"]))["error"][
        "code"
    ] == "not_found"
    own = (await call(alice, "dishwish/wishes/add", recipe_id=secret["id"]))["result"]
    assert [w["id"] for w in (await call(alice, "dishwish/wishes/list"))["result"]] == [own["id"]]
    assert (await call(bob, "dishwish/wishes/list"))["result"] == []

    # remove: own wish, someone else's wish, admin, unknown
    alice_wish = (await call(alice, "dishwish/wishes/add", recipe_id=shared["id"]))["result"]
    bob_wish = (await call(bob, "dishwish/wishes/add", recipe_id=shared["id"]))["result"]
    assert (await call(bob, "dishwish/wishes/remove", wish_id=alice_wish["id"]))["error"][
        "code"
    ] == "unauthorized"
    assert (await call(bob, "dishwish/wishes/remove", wish_id=bob_wish["id"]))["success"]
    assert (await call(admin, "dishwish/wishes/remove", wish_id=alice_wish["id"]))["success"]
    assert (await call(admin, "dishwish/wishes/remove", wish_id="nope"))["error"][
        "code"
    ] == "not_found"


async def test_deleting_recipe_removes_wishes(hass, setup_integration, make_client):
    alice, _ = await make_client("alice")
    recipe = await _create(alice)
    await call(alice, "dishwish/wishes/add", recipe_id=recipe["id"])
    await call(alice, "dishwish/recipes/delete", recipe_id=recipe["id"])
    assert (await call(alice, "dishwish/wishes/list"))["result"] == []


async def test_wish_change_event_reaches_subscribers(hass, setup_integration, make_client):
    alice, _ = await make_client("alice")
    bob, _ = await make_client("bob")
    recipe = await _create(alice)
    await bob.send_json_auto_id({"type": "dishwish/subscribe"})
    await bob.receive_json()
    await call(alice, "dishwish/wishes/add", recipe_id=recipe["id"])
    event = await bob.receive_json()
    assert event["event"] == {"kind": "wishes", "ids": [recipe["id"]]}


# --- shopping list ----------------------------------------------------------------


async def test_shopping_add_scales_and_skips_duplicates(hass, shopping_list, make_client):
    alice, _ = await make_client("alice")
    recipe = await _create(
        alice,
        name="Pasta",
        ingredients=[
            {"name": "Nudeln", "quantity": 500, "unit": "g"},
            {"name": "Eier", "quantity": 3},
            {"name": "Salz"},
        ],
    )
    resp = await call(
        alice,
        "dishwish/shopping/add",
        recipe_id=recipe["id"],
        servings=2,
        entity_id=shopping_list,
    )
    assert resp["result"] == {"added": ["250 g Nudeln", "1½ Eier", "Salz"], "skipped": []}
    items = await _items(hass)
    assert {i["summary"] for i in items} == {"250 g Nudeln", "1½ Eier", "Salz"}
    assert not any(i.get("description") for i in items)  # shopping_list has no descriptions

    again = await call(
        alice,
        "dishwish/shopping/add",
        recipe_id=recipe["id"],
        servings=2,
        entity_id=shopping_list,
    )
    assert again["result"] == {"added": [], "skipped": ["250 g Nudeln", "1½ Eier", "Salz"]}
    assert len(await _items(hass)) == 3

    # different servings -> different line, case-insensitive duplicate for the unscaled one
    more = await call(
        alice,
        "dishwish/shopping/add",
        recipe_id=recipe["id"],
        servings=4,
        entity_id=shopping_list,
    )
    assert more["result"]["added"] == ["500 g Nudeln", "3 Eier"]
    assert more["result"]["skipped"] == ["Salz"]


async def test_shopping_add_selection_and_errors(hass, shopping_list, make_client):
    alice, _ = await make_client("alice")
    bob, _ = await make_client("bob")
    recipe = await _create(
        alice,
        ingredients=[
            {"name": "Mehl", "quantity": 200, "unit": "g"},
            {"name": "Zucker", "quantity": 100, "unit": "g"},
        ],
    )
    ids = [i["id"] for i in recipe["ingredients"]]
    resp = await call(
        alice,
        "dishwish/shopping/add",
        recipe_id=recipe["id"],
        ingredient_ids=[ids[1]],
        entity_id=shopping_list,
    )
    assert resp["result"]["added"] == ["100 g Zucker"]

    bad_ids = await call(
        alice,
        "dishwish/shopping/add",
        recipe_id=recipe["id"],
        ingredient_ids=[999999],
        entity_id=shopping_list,
    )
    assert bad_ids["error"]["code"] == "not_found"
    no_entity = await call(alice, "dishwish/shopping/add", recipe_id=recipe["id"])
    assert no_entity["error"]["code"] == "entity_not_found"
    wrong = await call(
        alice, "dishwish/shopping/add", recipe_id=recipe["id"], entity_id="todo.does_not_exist"
    )
    assert wrong["error"]["code"] == "entity_not_found"
    secret = await _create(alice, visibility="private")
    hidden = await call(
        bob, "dishwish/shopping/add", recipe_id=secret["id"], entity_id=shopping_list
    )
    assert hidden["error"]["code"] == "not_found"


async def test_shopping_uses_default_list_from_options(
    hass, shopping_list, setup_integration, make_client
):
    hass.config_entries.async_update_entry(
        setup_integration, options={CONF_DEFAULT_SHOPPING_LIST: shopping_list}
    )
    alice, _ = await make_client("alice")
    recipe = await _create(alice, ingredients=[{"name": "Reis", "quantity": 1, "unit": "Tasse"}])
    resp = await call(alice, "dishwish/shopping/add", recipe_id=recipe["id"])
    assert resp["result"]["added"] == ["1 Tasse Reis"]


async def test_services(hass, shopping_list, setup_integration, make_client):
    alice, _ = await make_client("alice")
    bob, _ = await make_client("bob")
    cake = await _create(
        alice,
        name="Cake",
        ingredients=[
            {"name": "Mehl", "quantity": 200, "unit": "g"},
            {"name": "Eier", "quantity": 2},
        ],
    )
    bread = await _create(
        alice,
        name="Bread",
        ingredients=[
            {"name": "mehl", "quantity": 300, "unit": "g"},
            {"name": "Hefe", "quantity": 1, "unit": "Würfel"},
        ],
    )
    unwished = await _create(alice, name="Unwished", ingredients=[{"name": "Gold"}])

    resp = await hass.services.async_call(
        DOMAIN,
        "add_to_shopping_list",
        {"recipe_id": unwished["id"], "entity_id": shopping_list},
        blocking=True,
        return_response=True,
    )
    assert resp == {"added": ["Gold"], "skipped": []}

    # two users wish for the same recipe: its ingredients count once
    for client in (alice, bob):
        await call(client, "dishwish/wishes/add", recipe_id=cake["id"])
    await call(bob, "dishwish/wishes/add", recipe_id=bread["id"])

    resp = await hass.services.async_call(
        DOMAIN,
        "add_open_wishes_to_shopping_list",
        {"entity_id": shopping_list},
        blocking=True,
        return_response=True,
    )
    assert set(resp["added"]) == {"2 Eier", "500 g Mehl", "1 Würfel Hefe"}
    assert {i["summary"] for i in await _items(hass)} >= {"500 g Mehl", "2 Eier", "1 Würfel Hefe"}

    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "add_open_wishes_to_shopping_list", {}, blocking=True
        )


# --- sensors ---------------------------------------------------------------------


async def test_entity_ids_do_not_depend_on_language(hass: HomeAssistant, tmp_path):
    hass.config.config_dir = str(tmp_path)
    hass.config.language = "de"
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    for entity_id in ("sensor.dishwish_open_wishes", "sensor.dishwish_recipes"):
        state = hass.states.get(entity_id)
        assert state is not None, entity_id
    # the display name is still translated
    assert (
        hass.states.get("sensor.dishwish_open_wishes")
        .attributes["friendly_name"]
        .endswith("Offene Wünsche")
    )


async def test_sensors_follow_changes(hass, setup_integration, make_client):
    alice, _ = await make_client("alice")
    bob, _ = await make_client("bob")
    assert hass.states.get("sensor.dishwish_open_wishes").state == "0"
    assert hass.states.get("sensor.dishwish_recipes").state == "0"

    recipe = await _create(alice, name="Soup")
    await call(alice, "dishwish/wishes/add", recipe_id=recipe["id"], note="heiß")
    await call(bob, "dishwish/wishes/add", recipe_id=recipe["id"])
    await hass.async_block_till_done()

    wishes = hass.states.get("sensor.dishwish_open_wishes")
    assert wishes.state == "2"
    assert wishes.attributes["wishes"] == [
        {"recipe": "Soup", "users": ["alice", "bob"], "notes": ["heiß"]}
    ]
    assert hass.states.get("sensor.dishwish_recipes").state == "1"

    await call(alice, "dishwish/wishes/complete", recipe_id=recipe["id"])
    await hass.async_block_till_done()
    assert hass.states.get("sensor.dishwish_open_wishes").state == "0"
    assert hass.states.get("sensor.dishwish_open_wishes").attributes["wishes"] == []


async def test_description_only_when_supported(hass, setup_integration):
    fake = "todo.fake"
    hass.states.async_set(fake, "0", {"supported_features": 64})
    async_mock_service(
        hass,
        "todo",
        "get_items",
        response={fake: {"items": [{"summary": "Salz"}]}},
        supports_response=SupportsResponse.ONLY,
    )
    adds = async_mock_service(hass, "todo", "add_item")

    result = await shopping.async_add_lines(hass, fake, ["salz", "Mehl", "mehl"], "für: Kuchen")
    assert result == {"added": ["Mehl"], "skipped": ["salz", "mehl"]}
    assert [c.data for c in adds] == [
        {"entity_id": fake, "item": "Mehl", "description": "für: Kuchen"}
    ]

    hass.states.async_set(fake, "0", {"supported_features": 1})
    adds.clear()
    await shopping.async_add_lines(hass, fake, ["Zucker"], "für: Kuchen")
    assert [c.data for c in adds] == [{"entity_id": fake, "item": "Zucker"}]
