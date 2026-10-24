"""Importer tests with synthetic fixtures only (no real recipe sites)."""

from __future__ import annotations

from pathlib import Path

import pytest

from custom_components.essensplan import importer
from custom_components.essensplan.store import get_store

from .conftest import call, jpeg_bytes

FIXTURES = Path(__file__).parent / "fixtures"

CATEGORIES = [
    {"id": "c-bake", "name": "Baking"},
    {"id": "c-vegan", "name": "Vegan"},
    {"id": "c-soup", "name": "Soup"},
]


def _draft(name: str, url: str = "https://www.example.org/r/1"):
    html = (FIXTURES / name).read_text("utf-8")
    node = importer.extract_recipe_node(html)
    assert node is not None
    return importer.build_draft(node, url, CATEGORIES, default_servings=4)


def test_direct_recipe():
    draft, image = _draft("jsonld_direct.html")
    assert draft["name"] == "Test Cake & Co"
    assert draft["description"] == "A simple cake."
    assert draft["servings"] == 4
    assert (draft["prep_minutes"], draft["cook_minutes"]) == (15, 60)
    assert [i["name"] for i in draft["ingredients"]] == ["flour", "eggs", "onion"]
    assert draft["ingredients"][0]["quantity"] == 200
    assert draft["ingredients"][2]["note"] == "finely diced"
    assert [s["text"] for s in draft["steps"]] == ["Sift the flour.", "Bake it."]
    assert set(draft["category_ids"]) == {"c-bake", "c-vegan"}
    assert draft["source_url"] == "https://www.example.org/r/1"
    assert draft["source_name"] == "example.org"
    assert image == "https://img.example.org/cake.jpg"
    assert draft["image_ids"] == [] and draft["visibility"] == "household"


def test_graph_with_sections_and_total_time():
    draft, image = _draft("jsonld_graph.html")
    assert draft["name"] == "Graph Soup"
    assert draft["servings"] == 6
    assert (draft["prep_minutes"], draft["cook_minutes"]) == (15, 30)  # total - cook
    assert [s["section"] for s in draft["steps"]] == ["Broth", "Broth", "Serve"]
    assert draft["ingredients"][1]["name"] == "Salt"
    assert draft["ingredients"][1]["quantity"] is None
    assert image == "/img/soup.png"


def test_list_with_string_instructions_and_total_only():
    draft, image = _draft("jsonld_list.html")
    assert draft["name"] == "List Salad"
    assert draft["servings"] == 2
    assert (draft["prep_minutes"], draft["cook_minutes"]) == (20, None)  # total only -> prep
    assert [s["text"] for s in draft["steps"]] == ["Wash the lettuce.", "Cut it.", "Serve."]
    assert image is None  # missing image is fine


def test_broken_block_is_skipped():
    draft, _ = _draft("jsonld_broken.html")
    assert draft["name"] == "Survivor"
    assert draft["servings"] == 4  # default


def test_no_recipe():
    html = (FIXTURES / "no_recipe.html").read_text("utf-8")
    assert importer.extract_recipe_node(html) is None
    assert importer.extract_recipe_node("<html>no scripts</html>") is None


def test_empty_recipe_node_rejected():
    with pytest.raises(importer.ImportFailed) as err:
        importer.build_draft({"@type": "Recipe"}, "https://x.org/", CATEGORIES)
    assert err.value.code == "no_recipe_found"


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("PT1H30M", 90),
        ("P0DT45M", 45),
        ("PT90S", 2),
        ("P1DT1H", 1440),  # clamped to 24 h
        ("PT0M", 0),
        ("garbage", None),
        ("PT", None),
        (None, None),
        (45, None),
    ],
)
def test_parse_duration(value, expected):
    assert importer.parse_duration(value) == expected


@pytest.mark.parametrize("host", ["127.0.0.1", "localhost", "192.168.1.5", "10.0.0.2", "::1"])
async def test_private_hosts_rejected(host):
    with pytest.raises(importer.ImportFailed) as err:
        await importer._check_host(host)
    assert err.value.code == "invalid_url"


@pytest.mark.parametrize(
    "url", ["ftp://example.org/x", "javascript:alert(1)", "not a url", "http://"]
)
def test_invalid_urls(url):
    with pytest.raises(importer.ImportFailed) as err:
        importer._validate_url(url)
    assert err.value.code == "invalid_url"


def test_url_too_long():
    with pytest.raises(importer.ImportFailed):
        importer._validate_url("https://example.org/" + "a" * 2000)


@pytest.fixture
def public_hosts(monkeypatch):
    async def ok(_host: str) -> None:
        return None

    monkeypatch.setattr(importer, "_check_host", ok)


async def test_import_via_websocket(
    hass, setup_integration, make_client, aioclient_mock, public_hosts
):
    html = (FIXTURES / "jsonld_direct.html").read_bytes()
    aioclient_mock.get(
        "https://old.example.org/r", status=301, headers={"Location": "https://www.example.org/r/1"}
    )
    aioclient_mock.get(
        "https://www.example.org/r/1",
        content=html,
        headers={"Content-Type": "text/html; charset=utf-8"},
    )
    aioclient_mock.get(
        "https://img.example.org/cake.jpg",
        content=jpeg_bytes((900, 700)),
        headers={"Content-Type": "image/jpeg"},
    )
    client, _ = await make_client("alice")

    resp = await call(client, "essensplan/recipes/import_url", url="https://old.example.org/r")
    assert resp["success"], resp
    draft = resp["result"]
    assert draft["name"] == "Test Cake & Co"
    assert draft["source_url"] == "https://www.example.org/r/1"  # after redirect
    assert len(draft["image_ids"]) == 1
    assert draft["category_ids"]
    # the draft is not saved
    assert (await call(client, "essensplan/recipes/list"))["result"] == []
    # but the image is processed and can be attached when saving
    store = get_store(hass)
    assert (store.images_dir / f"{draft['image_ids'][0]}_thumb.jpg").is_file()
    saved = await call(
        client,
        "essensplan/recipes/create",
        **{k: v for k, v in draft.items() if k != "category_ids"},
    )
    assert saved["success"], saved
    assert saved["result"]["shareable"] == 0
    assert saved["result"]["images"][0]["id"] == draft["image_ids"][0]


async def test_import_image_failure_does_not_fail(
    hass, setup_integration, make_client, aioclient_mock, public_hosts
):
    html = (FIXTURES / "jsonld_direct.html").read_bytes()
    aioclient_mock.get(
        "https://www.example.org/a", content=html, headers={"Content-Type": "text/html"}
    )
    aioclient_mock.get("https://img.example.org/cake.jpg", status=404)
    client, _ = await make_client("alice")
    resp = await call(client, "essensplan/recipes/import_url", url="https://www.example.org/a")
    assert resp["success"] and resp["result"]["image_ids"] == []


async def test_import_errors(hass, setup_integration, make_client, aioclient_mock, public_hosts):
    aioclient_mock.get(
        "https://www.example.org/none",
        content=(FIXTURES / "no_recipe.html").read_bytes(),
        headers={"Content-Type": "text/html"},
    )
    aioclient_mock.get("https://www.example.org/missing", status=404)
    aioclient_mock.get(
        "https://www.example.org/huge",
        content=b"x" * (5 * 1024 * 1024 + 10),
        headers={"Content-Type": "text/html"},
    )
    aioclient_mock.get(
        "https://www.example.org/loop",
        status=302,
        headers={"Location": "https://www.example.org/loop"},
    )
    client, _ = await make_client("alice")

    async def code(url: str) -> str:
        return (await call(client, "essensplan/recipes/import_url", url=url))["error"]["code"]

    assert await code("https://www.example.org/none") == "no_recipe_found"
    assert await code("https://www.example.org/missing") == "fetch_failed"
    assert await code("https://www.example.org/huge") == "too_large"
    assert await code("https://www.example.org/loop") == "fetch_failed"
    assert await code("ftp://www.example.org/x") == "invalid_url"
