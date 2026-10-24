"""WebSocket API tests incl. permissions, uploads and image deletion."""

from __future__ import annotations

from aiohttp import FormData

from custom_components.essensplan.store import get_store

from .conftest import call, jpeg_bytes, recipe_input


async def _upload(hass_client, token: str, data: bytes, name: str = "a.jpg"):
    form = FormData()
    form.add_field("file", data, filename=name, content_type="image/jpeg")
    return await hass_client.post(
        "/api/essensplan/images", data=form, headers={"Authorization": f"Bearer {token}"}
    )


async def test_recipe_lifecycle_with_images(
    hass, hass_client, hass_access_token, hass_ws_client, setup_integration
):
    store = get_store(hass)
    client = await hass_ws_client(hass, hass_access_token)
    http = await hass_client(hass_access_token)

    resp = await _upload(http, hass_access_token, jpeg_bytes((800, 600)))
    assert resp.status == 201
    image = await resp.json()
    assert len(image["id"]) == 32

    created = await call(
        client, "essensplan/recipes/create", **recipe_input(image_ids=[image["id"]])
    )
    assert created["success"], created
    recipe = created["result"]
    assert recipe["images"][0]["id"] == image["id"]
    assert recipe["can_edit"] is True
    assert recipe["steps"][0]["text"] == "Kochen."

    thumb = await http.get(image["thumb_url"], headers={})
    assert thumb.status == 200
    assert "immutable" in thumb.headers["Cache-Control"]
    assert (await http.get(image["full_url"])).status == 200

    listed = await call(client, "essensplan/recipes/list")
    assert [r["id"] for r in listed["result"]] == [recipe["id"]]
    assert listed["result"][0]["thumb_url"] == image["thumb_url"]

    fetched = await call(client, "essensplan/recipes/get", recipe_id=recipe["id"])
    assert fetched["result"]["ingredients"][0]["unit"] == "g"

    updated = await call(
        client,
        "essensplan/recipes/update",
        recipe_id=recipe["id"],
        **recipe_input(name="Neu", image_ids=[]),
    )
    assert updated["result"]["name"] == "Neu"
    assert updated["result"]["images"] == []
    assert not list(store.images_dir.iterdir())  # removed image deleted from disk
    assert (await http.get(image["thumb_url"])).status == 404

    # delete: files disappear with the recipe
    resp = await _upload(http, hass_access_token, jpeg_bytes())
    image2 = await resp.json()
    updated = await call(
        client,
        "essensplan/recipes/update",
        recipe_id=recipe["id"],
        **recipe_input(image_ids=[image2["id"]]),
    )
    assert updated["success"]
    assert len(list(store.images_dir.iterdir())) == 2
    deleted = await call(client, "essensplan/recipes/delete", recipe_id=recipe["id"])
    assert deleted["success"]
    assert not list(store.images_dir.iterdir())
    missing = await call(client, "essensplan/recipes/get", recipe_id=recipe["id"])
    assert missing["error"]["code"] == "not_found"


async def test_permissions(hass, setup_integration, make_client):
    alice, _ = await make_client("alice")
    bob, _ = await make_client("bob")
    admin, _ = await make_client("root", admin=True)

    shared = (await call(alice, "essensplan/recipes/create", **recipe_input(name="Shared")))[
        "result"
    ]
    secret = (
        await call(
            alice, "essensplan/recipes/create", **recipe_input(name="Secret", visibility="private")
        )
    )["result"]

    # visibility
    assert {r["id"] for r in (await call(bob, "essensplan/recipes/list"))["result"]} == {
        shared["id"]
    }
    assert {r["id"] for r in (await call(alice, "essensplan/recipes/list"))["result"]} == {
        shared["id"],
        secret["id"],
    }
    assert (await call(bob, "essensplan/recipes/get", recipe_id=secret["id"]))["error"][
        "code"
    ] == "not_found"
    assert (await call(admin, "essensplan/recipes/get", recipe_id=secret["id"]))["error"][
        "code"
    ] == "not_found"

    # bob may read shared but not change it
    bob_view = (await call(bob, "essensplan/recipes/get", recipe_id=shared["id"]))["result"]
    assert bob_view["can_edit"] is False
    resp = await call(
        bob, "essensplan/recipes/update", recipe_id=shared["id"], **recipe_input(name="Hack")
    )
    assert resp["error"]["code"] == "unauthorized"
    resp = await call(bob, "essensplan/recipes/delete", recipe_id=shared["id"])
    assert resp["error"]["code"] == "unauthorized"
    # nor touch alice's private recipe (not even learn it exists)
    resp = await call(bob, "essensplan/recipes/delete", recipe_id=secret["id"])
    assert resp["error"]["code"] == "not_found"

    # admin may edit/delete shared recipes
    resp = await call(
        admin, "essensplan/recipes/update", recipe_id=shared["id"], **recipe_input(name="Admin")
    )
    assert resp["result"]["name"] == "Admin"
    assert (await call(admin, "essensplan/recipes/delete", recipe_id=shared["id"]))["success"]


async def test_invalid_input(hass, setup_integration, make_client):
    alice, _ = await make_client("alice")
    for bad in (
        recipe_input(name=""),
        recipe_input(servings=0),
        recipe_input(servings=101),
        recipe_input(prep_minutes=2000),
        recipe_input(ingredients=[{"name": "x"}] * 101),
        recipe_input(steps=[{"text": "x"}] * 101),
        recipe_input(image_ids=["a"] * 11),
        recipe_input(visibility="public"),
        recipe_input(name="x" * 201),
    ):
        resp = await call(alice, "essensplan/recipes/create", **bad)
        assert resp["success"] is False
        assert resp["error"]["code"] == "invalid_format"
    # unknown category -> invalid_format from the DB layer
    resp = await call(alice, "essensplan/recipes/create", **recipe_input(category_ids=["nope"]))
    assert resp["error"]["code"] == "invalid_format"
    assert (await call(alice, "essensplan/recipes/list"))["result"] == []


async def test_upload_rejects_garbage_and_foreign_images(
    hass, hass_client, hass_access_token, setup_integration, make_client
):
    http = await hass_client(hass_access_token)
    resp = await _upload(http, hass_access_token, b"definitely not an image")
    assert resp.status == 400
    assert (await resp.json())["code"] == "unsupported_image"

    # Another user's pending upload cannot be attached.
    image = await (await _upload(http, hass_access_token, jpeg_bytes())).json()
    bob, _ = await make_client("bob")
    resp = await call(bob, "essensplan/recipes/create", **recipe_input(image_ids=[image["id"]]))
    assert resp["error"]["code"] == "invalid_format"


async def test_upload_requires_auth(hass, hass_client_no_auth, setup_integration):
    client = await hass_client_no_auth()
    form = FormData()
    form.add_field("file", jpeg_bytes(), filename="a.jpg", content_type="image/jpeg")
    assert (await client.post("/api/essensplan/images", data=form)).status == 401


async def test_image_view_validation(hass, hass_client_no_auth, setup_integration):
    client = await hass_client_no_auth()
    assert (await client.get(f"/api/essensplan/images/{'a' * 32}/thumb")).status == 404
    assert (await client.get("/api/essensplan/images/../x/thumb")).status == 404
    assert (await client.get(f"/api/essensplan/images/{'a' * 32}/huge")).status == 404
    assert (await client.get("/api/essensplan/images/NOT-HEX/thumb")).status == 404


async def test_categories(hass, setup_integration, make_client):
    alice, _ = await make_client("alice")
    admin, _ = await make_client("root", admin=True)

    cats = (await call(alice, "essensplan/categories/list"))["result"]
    assert len(cats) == 13

    created = await call(alice, "essensplan/categories/create", name="Grillen", icon="mdi:grill")
    assert created["result"]["name"] == "Grillen"
    dup = await call(alice, "essensplan/categories/create", name="grillen")
    assert dup["error"]["code"] == "invalid_format"

    cid = created["result"]["id"]
    resp = await call(alice, "essensplan/categories/update", category_id=cid, name="BBQ")
    assert resp["error"]["code"] == "unauthorized"
    resp = await call(alice, "essensplan/categories/delete", category_id=cid)
    assert resp["error"]["code"] == "unauthorized"

    resp = await call(admin, "essensplan/categories/update", category_id=cid, name="BBQ")
    assert resp["result"]["name"] == "BBQ"
    assert (await call(admin, "essensplan/categories/delete", category_id=cid))["success"]
    resp = await call(admin, "essensplan/categories/delete", category_id=cid)
    assert resp["error"]["code"] == "not_found"


async def test_ingredients_parse(hass, setup_integration, make_client):
    alice, _ = await make_client("alice")
    resp = await call(alice, "essensplan/ingredients/parse", lines=["200 g Mehl", "", "Salz"])
    assert [r["name"] for r in resp["result"]] == ["Mehl", "Salz"]
    assert resp["result"][0]["quantity"] == 200
    resp = await call(alice, "essensplan/ingredients/parse", lines=["x"] * 101)
    assert resp["error"]["code"] == "invalid_format"


async def test_subscribe_receives_changes(hass, setup_integration, make_client):
    alice, _ = await make_client("alice")
    bob, _ = await make_client("bob")

    await bob.send_json_auto_id({"type": "essensplan/subscribe"})
    sub = await bob.receive_json()
    assert sub["success"]
    sub_id = sub["id"]

    created = (await call(alice, "essensplan/recipes/create", **recipe_input()))["result"]
    event = await bob.receive_json()
    assert event["id"] == sub_id
    assert event["event"] == {"kind": "recipes", "ids": [created["id"]]}

    await call(alice, "essensplan/categories/create", name="Neu")
    event = await bob.receive_json()
    assert event["event"]["kind"] == "categories"


async def test_bundle_is_served_without_caching(hass, hass_client_no_auth, setup_integration):
    client = await hass_client_no_auth()
    resp = await client.get("/essensplan_static/essensplan-cards.js?v=anything")
    assert resp.status == 200
    assert resp.headers["Cache-Control"] == "no-cache"
    assert "essensplan-library-card" in await resp.text()
