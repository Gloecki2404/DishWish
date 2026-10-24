"""Database layer tests (no Home Assistant needed)."""

from __future__ import annotations

import sqlite3
from datetime import UTC, datetime, timedelta

import pytest

from custom_components.essensplan import db


@pytest.fixture
def conn(tmp_path):
    connection = db.open_db(tmp_path / "essensplan.db", "de")
    yield connection
    connection.close()


def _recipe(**overrides):
    data = {
        "name": "Lasagne",
        "servings": 4,
        "ingredients": [
            {"name": "Nudelplatten", "quantity": 250, "unit": "g"},
            {"name": "Hackfleisch", "quantity": 500, "unit": "g", "group_name": "Soße"},
        ],
        "steps": [{"text": "Schichten."}, {"text": "Backen.", "section": "Ofen"}],
    }
    data.update(overrides)
    return data


def test_fresh_db(conn):
    assert conn.execute("PRAGMA user_version").fetchone()[0] == db.SCHEMA_VERSION
    assert conn.execute("PRAGMA journal_mode").fetchone()[0] == "wal"
    assert conn.execute("PRAGMA foreign_keys").fetchone()[0] == 1
    names = [c["name"] for c in db.list_categories(conn)]
    assert len(names) == 13
    assert "Fleisch" in names and "Suppe & Eintopf" in names


def test_seed_english(tmp_path):
    connection = db.open_db(tmp_path / "en.db", "en")
    assert "Meat" in [c["name"] for c in db.list_categories(connection)]
    connection.close()


def test_reopen_does_not_reseed(tmp_path):
    path = tmp_path / "x.db"
    db.open_db(path).close()
    connection = db.open_db(path)
    assert len(db.list_categories(connection)) == 13
    connection.close()


def test_create_get_roundtrip(conn):
    cat = db.list_categories(conn)[0]["id"]
    rid = db.create_recipe(conn, _recipe(category_ids=[cat]), "u1")
    recipe = db.get_recipe(conn, rid, "u1")
    assert recipe["name"] == "Lasagne"
    assert recipe["category_ids"] == [cat]
    assert [i["name"] for i in recipe["ingredients"]] == ["Nudelplatten", "Hackfleisch"]
    assert recipe["ingredients"][1]["group_name"] == "Soße"
    assert [s["text"] for s in recipe["steps"]] == ["Schichten.", "Backen."]
    assert recipe["can_edit"] is True
    assert recipe["shareable"] == 1
    assert db.get_recipe(conn, rid, "u2")["can_edit"] is False
    assert db.get_recipe(conn, rid, "u2", is_admin=True)["can_edit"] is True


def test_imported_recipe_not_shareable(conn):
    rid = db.create_recipe(conn, _recipe(source_url="https://example.com/r"), "u1")
    assert db.get_recipe(conn, rid, "u1")["shareable"] == 0


def test_update_replaces_children_and_reports_removed_images(conn):
    img1, img2 = db.new_id(), db.new_id()
    for i in (img1, img2):
        db.insert_upload(conn, i, "u1")
    rid = db.create_recipe(conn, _recipe(image_ids=[img1, img2]), "u1")
    assert [i["id"] for i in db.get_recipe(conn, rid, "u1")["images"]] == [img1, img2]

    removed = db.update_recipe(
        conn, rid, _recipe(name="Neu", ingredients=[], steps=[], image_ids=[img2]), "u1"
    )
    recipe = db.get_recipe(conn, rid, "u1")
    assert removed == [img1]
    assert recipe["name"] == "Neu"
    assert recipe["ingredients"] == [] and recipe["steps"] == []
    assert [i["id"] for i in recipe["images"]] == [img2]
    assert not db.image_exists(conn, img1)


def test_image_order_defines_cover(conn):
    a, b = db.new_id(), db.new_id()
    for i in (a, b):
        db.insert_upload(conn, i, "u1")
    rid = db.create_recipe(conn, _recipe(image_ids=[b, a]), "u1")
    summary = db.list_recipes(conn, "u1")[0]
    assert summary["thumb_url"].endswith(f"{b}/thumb")
    assert db.get_recipe(conn, rid, "u1")["thumb_url"].endswith(f"{b}/thumb")


def test_delete_cascades(conn):
    cat = db.list_categories(conn)[0]["id"]
    img = db.new_id()
    db.insert_upload(conn, img, "u1")
    rid = db.create_recipe(conn, _recipe(category_ids=[cat], image_ids=[img]), "u1")
    with conn:
        conn.execute(
            "INSERT INTO wishes (id, recipe_id, user_id, created_at) VALUES ('w', ?, 'u1', 'now')",
            (rid,),
        )
    assert db.delete_recipe(conn, rid) == [img]
    for table in ("ingredients", "steps", "recipe_categories", "recipe_images", "wishes"):
        assert conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0] == 0  # noqa: S608
    assert db.list_categories(conn)  # categories stay
    with pytest.raises(db.NotFound):
        db.delete_recipe(conn, rid)


def test_visibility(conn):
    shared = db.create_recipe(conn, _recipe(name="Shared"), "u1")
    private = db.create_recipe(conn, _recipe(name="Secret", visibility="private"), "u1")
    assert {r["id"] for r in db.list_recipes(conn, "u1")} == {shared, private}
    assert {r["id"] for r in db.list_recipes(conn, "u2")} == {shared}
    assert {r["id"] for r in db.list_recipes(conn, None)} == {shared, private}
    with pytest.raises(db.NotFound):
        db.get_recipe(conn, private, "u2")
    with pytest.raises(db.NotFound):
        db.get_recipe(conn, private, "u2", is_admin=True)
    assert db.get_recipe(conn, private, None)["name"] == "Secret"


def test_list_summary_fields_and_sorting(conn):
    db.create_recipe(conn, _recipe(name="banane"), "u1")
    db.create_recipe(conn, _recipe(name="Apfel"), "u1")
    rid = db.create_recipe(conn, _recipe(name="Zebra"), "u1")
    with conn:
        conn.execute(
            "INSERT INTO wishes (id, recipe_id, user_id, created_at) VALUES ('w1', ?, 'u1', 'x')",
            (rid,),
        )
        conn.execute(
            "INSERT INTO wishes (id, recipe_id, user_id, created_at) VALUES ('w2', ?, 'u2', 'x')",
            (rid,),
        )
    items = db.list_recipes(conn, "u1")
    assert [r["name"] for r in items] == ["Apfel", "banane", "Zebra"]
    zebra = items[2]
    assert zebra["open_wish_count"] == 2 and zebra["my_wish_id"] == "w1"
    assert zebra["thumb_url"] is None and zebra["category_ids"] == []
    assert items[0]["my_wish_id"] is None


def test_unique_open_wish(conn):
    rid = db.create_recipe(conn, _recipe(), "u1")
    sql = "INSERT INTO wishes (id, recipe_id, user_id, created_at) VALUES (?, ?, 'u1', 'x')"
    with conn:
        conn.execute(sql, ("a", rid))
    with pytest.raises(sqlite3.IntegrityError), conn:
        conn.execute(sql, ("b", rid))


def test_invalid_references_roll_back(conn):
    with pytest.raises(db.Invalid):
        db.create_recipe(conn, _recipe(category_ids=["nope"]), "u1")
    with pytest.raises(db.Invalid):
        db.create_recipe(conn, _recipe(image_ids=["nope"]), "u1")
    assert db.count_recipes(conn) == 0


def test_cannot_attach_foreign_or_assigned_image(conn):
    img = db.new_id()
    db.insert_upload(conn, img, "u1")
    with pytest.raises(db.Invalid):
        db.create_recipe(conn, _recipe(image_ids=[img]), "u2")
    other = db.create_recipe(conn, _recipe(image_ids=[img]), "u1")
    with pytest.raises(db.Invalid):
        db.create_recipe(conn, _recipe(image_ids=[img]), "u1")
    assert db.get_recipe(conn, other, "u1")["images"][0]["id"] == img


def test_constraints(conn):
    with pytest.raises(sqlite3.IntegrityError):
        db.create_recipe(conn, _recipe(servings=0), "u1")


def test_categories_crud(conn):
    cat = db.create_category(conn, "Grillen", "mdi:grill")
    assert cat["icon"] == "mdi:grill"
    default_icon = db.create_category(conn, "Snacks", None)
    assert default_icon["icon"] == "mdi:silverware-fork-knife"
    with pytest.raises(db.Invalid):
        db.create_category(conn, "grillen", None)  # case-insensitive unique
    updated = db.update_category(conn, cat["id"], {"name": "BBQ", "position": 99})
    assert updated["name"] == "BBQ" and updated["position"] == 99
    rid = db.create_recipe(conn, _recipe(category_ids=[cat["id"]]), "u1")
    db.delete_category(conn, cat["id"])
    assert db.get_recipe(conn, rid, "u1")["category_ids"] == []
    with pytest.raises(db.NotFound):
        db.get_category(conn, cat["id"])


def test_stale_uploads_deleted(conn):
    fresh, old = db.new_id(), db.new_id()
    db.insert_upload(conn, fresh, "u1")
    db.insert_upload(conn, old, "u1")
    long_ago = (datetime.now(UTC) - timedelta(hours=30)).isoformat(timespec="seconds")
    with conn:
        conn.execute("UPDATE recipe_images SET created_at = ? WHERE id = ?", (long_ago, old))
    assert db.delete_stale_uploads(conn, 24) == [old]
    assert db.all_image_ids(conn) == {fresh}


def test_migration_makes_backup_and_upgrades(tmp_path):
    path = tmp_path / "m.db"
    db.open_db(path).close()
    extra = ("ALTER TABLE recipes ADD COLUMN rating INTEGER",)
    conn = db.open_db(path, migrations=[*db.MIGRATIONS, extra])
    assert conn.execute("PRAGMA user_version").fetchone()[0] == 2
    conn.execute("SELECT rating FROM recipes")
    conn.close()
    backup = tmp_path / "m.db.bak-v1"
    assert backup.exists()
    old = sqlite3.connect(backup)
    assert old.execute("PRAGMA user_version").fetchone()[0] == 1
    old.close()


def test_failed_migration_rolls_back(tmp_path):
    path = tmp_path / "f.db"
    db.open_db(path).close()
    bad = ("ALTER TABLE recipes ADD COLUMN ok INTEGER", "THIS IS NOT SQL")
    with pytest.raises(sqlite3.Error):
        db.open_db(path, migrations=[*db.MIGRATIONS, bad])
    conn = db.open_db(path)
    assert conn.execute("PRAGMA user_version").fetchone()[0] == 1
    columns = [r[1] for r in conn.execute("PRAGMA table_info(recipes)")]
    assert "ok" not in columns
    conn.close()


def test_corrupt_file_is_not_replaced(tmp_path):
    path = tmp_path / "bad.db"
    path.write_bytes(b"this is definitely not a sqlite database" * 50)
    with pytest.raises(db.DatabaseCorrupt):
        db.open_db(path)
    assert path.read_bytes().startswith(b"this is definitely")


def test_newer_version_refused(tmp_path):
    path = tmp_path / "new.db"
    raw = sqlite3.connect(path)
    raw.execute("PRAGMA user_version = 99")
    raw.execute("CREATE TABLE t (x)")
    raw.commit()
    raw.close()
    with pytest.raises(db.DatabaseCorrupt):
        db.open_db(path)
