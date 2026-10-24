"""Synchronous SQLite layer. Only call from the store's DB thread."""

from __future__ import annotations

import sqlite3
import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from .const import SCHEMA_VERSION, SEED_CATEGORIES

Row = dict[str, Any]


class DbError(Exception):
    """Base error carrying a WebSocket error code."""

    code = "invalid_format"


class NotFound(DbError):
    """Entity does not exist (or is not visible)."""

    code = "not_found"


class Invalid(DbError):
    """Input references something invalid."""

    code = "invalid_format"


class AlreadyWished(DbError):
    """The user already has an open wish for this recipe."""

    code = "already_wished"


class DatabaseCorrupt(Exception):
    """The integrity check failed or the file is not a database."""


SCHEMA_V1: tuple[str, ...] = (
    """CREATE TABLE recipes (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      description   TEXT NOT NULL DEFAULT '',
      servings      INTEGER NOT NULL DEFAULT 4 CHECK (servings > 0),
      prep_minutes  INTEGER,
      cook_minutes  INTEGER,
      notes         TEXT NOT NULL DEFAULT '',
      source_url    TEXT,
      source_name   TEXT,
      visibility    TEXT NOT NULL DEFAULT 'household'
                    CHECK (visibility IN ('private', 'household')),
      shareable     INTEGER NOT NULL DEFAULT 1,
      created_by    TEXT NOT NULL,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    )""",
    "CREATE INDEX idx_recipes_name ON recipes (name COLLATE NOCASE)",
    """CREATE TABLE recipe_images (
      id          TEXT PRIMARY KEY,
      recipe_id   TEXT REFERENCES recipes(id) ON DELETE CASCADE,
      position    INTEGER NOT NULL DEFAULT 0,
      created_by  TEXT NOT NULL,
      created_at  TEXT NOT NULL
    )""",
    "CREATE INDEX idx_recipe_images_recipe ON recipe_images (recipe_id, position)",
    """CREATE TABLE ingredients (
      id            INTEGER PRIMARY KEY,
      recipe_id     TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      position      INTEGER NOT NULL,
      group_name    TEXT,
      quantity      REAL,
      quantity_max  REAL,
      unit          TEXT NOT NULL DEFAULT '',
      name          TEXT NOT NULL,
      note          TEXT NOT NULL DEFAULT ''
    )""",
    "CREATE INDEX idx_ingredients_recipe ON ingredients (recipe_id, position)",
    """CREATE TABLE steps (
      id         INTEGER PRIMARY KEY,
      recipe_id  TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      position   INTEGER NOT NULL,
      section    TEXT,
      text       TEXT NOT NULL
    )""",
    "CREATE INDEX idx_steps_recipe ON steps (recipe_id, position)",
    """CREATE TABLE categories (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      icon      TEXT NOT NULL DEFAULT 'mdi:silverware-fork-knife',
      position  INTEGER NOT NULL DEFAULT 0
    )""",
    """CREATE TABLE recipe_categories (
      recipe_id    TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      category_id  TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (recipe_id, category_id)
    )""",
    "CREATE INDEX idx_recipe_categories_cat ON recipe_categories (category_id)",
    """CREATE TABLE wishes (
      id            TEXT PRIMARY KEY,
      recipe_id     TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      user_id       TEXT NOT NULL,
      note          TEXT NOT NULL DEFAULT '',
      status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
      planned_date  TEXT,
      created_at    TEXT NOT NULL,
      done_at       TEXT
    )""",
    "CREATE INDEX idx_wishes_status ON wishes (status, created_at)",
    "CREATE UNIQUE INDEX idx_wishes_open_unique ON wishes (recipe_id, user_id) "
    "WHERE status = 'open'",
)

# Ordered list; MIGRATIONS[i] upgrades user_version i -> i + 1.
MIGRATIONS: list[tuple[str, ...]] = [SCHEMA_V1]
assert len(MIGRATIONS) == SCHEMA_VERSION


def now_iso() -> str:
    """Current UTC time as ISO 8601."""
    return datetime.now(UTC).isoformat(timespec="seconds")


def new_id() -> str:
    """Random 32-char hex id."""
    return uuid.uuid4().hex


def image_urls(image_id: str) -> dict[str, str]:
    """Return thumb and full URL for an image id."""
    base = f"/api/dishwish/images/{image_id}"
    return {"id": image_id, "thumb_url": f"{base}/thumb", "full_url": f"{base}/full"}


# --- connection, integrity, migrations -------------------------------------


def _connect(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA synchronous = NORMAL")
    conn.execute("PRAGMA busy_timeout = 5000")
    return conn


def open_db(
    path: Path,
    language: str = "en",
    migrations: list[tuple[str, ...]] | None = None,
) -> sqlite3.Connection:
    """Open (and create/migrate) the database. Raises DatabaseCorrupt, never overwrites."""
    migrations = MIGRATIONS if migrations is None else migrations
    try:
        conn = _connect(path)
        result = conn.execute("PRAGMA quick_check").fetchone()[0]
    except sqlite3.DatabaseError as err:
        raise DatabaseCorrupt(str(err)) from err
    if result != "ok":
        conn.close()
        raise DatabaseCorrupt(result)

    version = conn.execute("PRAGMA user_version").fetchone()[0]
    if version > len(migrations):
        conn.close()
        raise DatabaseCorrupt(f"database version {version} is newer than supported")
    fresh = version == 0
    if version < len(migrations):
        if not fresh:
            _backup(conn, path, version)
        for target in range(version, len(migrations)):
            _run_migration(conn, migrations[target], target + 1)
    if fresh:
        seed_categories(conn, language)
    return conn


def _backup(conn: sqlite3.Connection, path: Path, version: int) -> None:
    target = path.with_name(f"{path.name}.bak-v{version}")
    dest = sqlite3.connect(target)
    try:
        conn.backup(dest)
    finally:
        dest.close()


def _run_migration(conn: sqlite3.Connection, statements: tuple[str, ...], version: int) -> None:
    conn.execute("BEGIN")
    try:
        for stmt in statements:
            conn.execute(stmt)
        conn.execute(f"PRAGMA user_version = {int(version)}")
    except BaseException:
        conn.rollback()
        raise
    conn.commit()


def seed_categories(conn: sqlite3.Connection, language: str) -> None:
    """Insert the default categories in the given language (de/en)."""
    index = 1 if language.startswith("de") else 2
    with conn:
        for pos, entry in enumerate(SEED_CATEGORIES):
            conn.execute(
                "INSERT INTO categories (id, name, icon, position) VALUES (?, ?, ?, ?)",
                (new_id(), entry[index], entry[3], pos),
            )


def wal_checkpoint(conn: sqlite3.Connection) -> None:
    """Flush the WAL into the main file (used before backups)."""
    conn.execute("PRAGMA wal_checkpoint(TRUNCATE)").fetchall()


# --- categories --------------------------------------------------------------


def list_categories(conn: sqlite3.Connection) -> list[Row]:
    """All categories ordered by position, then name."""
    rows = conn.execute(
        "SELECT id, name, icon, position FROM categories ORDER BY position, name COLLATE NOCASE"
    )
    return [dict(r) for r in rows]


def get_category(conn: sqlite3.Connection, category_id: str) -> Row:
    """One category or NotFound."""
    row = conn.execute(
        "SELECT id, name, icon, position FROM categories WHERE id = ?", (category_id,)
    ).fetchone()
    if row is None:
        raise NotFound
    return dict(row)


def create_category(conn: sqlite3.Connection, name: str, icon: str | None) -> Row:
    """Create a category; a duplicate name raises Invalid."""
    cat_id = new_id()
    try:
        with conn:
            pos = conn.execute("SELECT COALESCE(MAX(position) + 1, 0) FROM categories").fetchone()[
                0
            ]
            if icon:
                conn.execute(
                    "INSERT INTO categories (id, name, icon, position) VALUES (?, ?, ?, ?)",
                    (cat_id, name, icon, pos),
                )
            else:
                conn.execute(
                    "INSERT INTO categories (id, name, position) VALUES (?, ?, ?)",
                    (cat_id, name, pos),
                )
    except sqlite3.IntegrityError as err:
        raise Invalid from err
    return get_category(conn, cat_id)


def update_category(conn: sqlite3.Connection, category_id: str, fields: dict[str, Any]) -> Row:
    """Update name/icon/position of a category."""
    get_category(conn, category_id)
    allowed = {k: v for k, v in fields.items() if k in ("name", "icon", "position")}
    if allowed:
        sets = ", ".join(f"{k} = ?" for k in allowed)
        try:
            with conn:
                conn.execute(
                    f"UPDATE categories SET {sets} WHERE id = ?",  # noqa: S608 (whitelisted keys)
                    (*allowed.values(), category_id),
                )
        except sqlite3.IntegrityError as err:
            raise Invalid from err
    return get_category(conn, category_id)


def delete_category(conn: sqlite3.Connection, category_id: str) -> None:
    """Delete a category (links cascade)."""
    get_category(conn, category_id)
    with conn:
        conn.execute("DELETE FROM categories WHERE id = ?", (category_id,))


# --- recipes -----------------------------------------------------------------


def get_recipe_meta(conn: sqlite3.Connection, recipe_id: str) -> Row:
    """created_by + visibility of a recipe or NotFound."""
    row = conn.execute(
        "SELECT id, name, created_by, visibility FROM recipes WHERE id = ?", (recipe_id,)
    ).fetchone()
    if row is None:
        raise NotFound
    return dict(row)


def count_recipes(conn: sqlite3.Connection) -> int:
    """Number of recipes."""
    return conn.execute("SELECT COUNT(*) FROM recipes").fetchone()[0]


def _visible_sql(user_id: str | None) -> tuple[str, tuple[str, ...]]:
    if user_id is None:
        return "1", ()
    return "(r.visibility = 'household' OR r.created_by = ?)", (user_id,)


def list_recipes(conn: sqlite3.Connection, user_id: str | None) -> list[Row]:
    """RecipeSummary list of all visible recipes."""
    where, params = _visible_sql(user_id)
    rows = conn.execute(
        f"""SELECT r.id, r.name, r.servings, r.prep_minutes, r.cook_minutes, r.visibility,
            r.created_by, r.updated_at, r.source_name,
            (SELECT i.id FROM recipe_images i WHERE i.recipe_id = r.id
              ORDER BY i.position LIMIT 1) AS image_id,
            (SELECT COUNT(*) FROM wishes w
              WHERE w.recipe_id = r.id AND w.status = 'open') AS open_wish_count,
            (SELECT w.id FROM wishes w
              WHERE w.recipe_id = r.id AND w.user_id = ? AND w.status = 'open') AS my_wish_id
        FROM recipes r WHERE {where} ORDER BY r.name COLLATE NOCASE""",  # noqa: S608
        (user_id or "", *params),
    ).fetchall()
    cats: dict[str, list[str]] = {}
    for link in conn.execute(
        "SELECT recipe_id, category_id FROM recipe_categories ORDER BY recipe_id"
    ):
        cats.setdefault(link["recipe_id"], []).append(link["category_id"])
    result = []
    for row in rows:
        item = dict(row)
        image_id = item.pop("image_id")
        item["thumb_url"] = image_urls(image_id)["thumb_url"] if image_id else None
        item["category_ids"] = cats.get(item["id"], [])
        result.append(item)
    return result


def get_recipe(
    conn: sqlite3.Connection, recipe_id: str, user_id: str | None, is_admin: bool = False
) -> Row:
    """Full recipe; NotFound if missing or not visible to the user."""
    row = conn.execute("SELECT * FROM recipes WHERE id = ?", (recipe_id,)).fetchone()
    if row is None or (
        user_id is not None and row["visibility"] == "private" and row["created_by"] != user_id
    ):
        raise NotFound
    recipe = dict(row)
    images = [
        image_urls(r["id"])
        for r in conn.execute(
            "SELECT id FROM recipe_images WHERE recipe_id = ? ORDER BY position", (recipe_id,)
        )
    ]
    recipe["images"] = images
    recipe["thumb_url"] = images[0]["thumb_url"] if images else None
    recipe["category_ids"] = [
        r[0]
        for r in conn.execute(
            "SELECT category_id FROM recipe_categories WHERE recipe_id = ?", (recipe_id,)
        )
    ]
    recipe["ingredients"] = [
        dict(r)
        for r in conn.execute(
            """SELECT id, group_name, quantity, quantity_max, unit, name, note
               FROM ingredients WHERE recipe_id = ? ORDER BY position""",
            (recipe_id,),
        )
    ]
    recipe["steps"] = [
        dict(r)
        for r in conn.execute(
            "SELECT id, section, text FROM steps WHERE recipe_id = ? ORDER BY position",
            (recipe_id,),
        )
    ]
    recipe["open_wish_count"] = conn.execute(
        "SELECT COUNT(*) FROM wishes WHERE recipe_id = ? AND status = 'open'", (recipe_id,)
    ).fetchone()[0]
    my_wish = conn.execute(
        "SELECT id FROM wishes WHERE recipe_id = ? AND user_id = ? AND status = 'open'",
        (recipe_id, user_id or ""),
    ).fetchone()
    recipe["my_wish_id"] = my_wish[0] if my_wish else None
    recipe["can_edit"] = user_id is None or is_admin or recipe["created_by"] == user_id
    return recipe


def _write_children(conn: sqlite3.Connection, recipe_id: str, data: Row, user_id: str) -> list[str]:
    """Replace categories/ingredients/steps and attach images. Returns removed image ids."""
    category_ids = list(dict.fromkeys(data.get("category_ids", [])))
    if category_ids:
        marks = ",".join("?" * len(category_ids))
        found = conn.execute(
            f"SELECT COUNT(*) FROM categories WHERE id IN ({marks})",  # noqa: S608
            category_ids,
        ).fetchone()[0]
        if found != len(category_ids):
            raise Invalid
    conn.execute("DELETE FROM recipe_categories WHERE recipe_id = ?", (recipe_id,))
    conn.executemany(
        "INSERT INTO recipe_categories (recipe_id, category_id) VALUES (?, ?)",
        [(recipe_id, c) for c in category_ids],
    )

    conn.execute("DELETE FROM ingredients WHERE recipe_id = ?", (recipe_id,))
    conn.executemany(
        """INSERT INTO ingredients
           (recipe_id, position, group_name, quantity, quantity_max, unit, name, note)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        [
            (
                recipe_id,
                pos,
                ing.get("group_name"),
                ing.get("quantity"),
                ing.get("quantity_max"),
                ing.get("unit", ""),
                ing["name"],
                ing.get("note", ""),
            )
            for pos, ing in enumerate(data.get("ingredients", []))
        ],
    )

    conn.execute("DELETE FROM steps WHERE recipe_id = ?", (recipe_id,))
    conn.executemany(
        "INSERT INTO steps (recipe_id, position, section, text) VALUES (?, ?, ?, ?)",
        [
            (recipe_id, pos, step.get("section"), step["text"])
            for pos, step in enumerate(data.get("steps", []))
        ],
    )

    # Images: may be already attached to this recipe or freshly uploaded by the user.
    image_ids = list(dict.fromkeys(data.get("image_ids", [])))
    for image_id in image_ids:
        row = conn.execute(
            "SELECT recipe_id, created_by FROM recipe_images WHERE id = ?", (image_id,)
        ).fetchone()
        if row is None or not (
            row["recipe_id"] == recipe_id
            or (row["recipe_id"] is None and row["created_by"] == user_id)
        ):
            raise Invalid
    existing = [
        r[0] for r in conn.execute("SELECT id FROM recipe_images WHERE recipe_id = ?", (recipe_id,))
    ]
    removed = [i for i in existing if i not in image_ids]
    conn.executemany("DELETE FROM recipe_images WHERE id = ?", [(i,) for i in removed])
    conn.executemany(
        "UPDATE recipe_images SET recipe_id = ?, position = ? WHERE id = ?",
        [(recipe_id, pos, i) for pos, i in enumerate(image_ids)],
    )
    return removed


def create_recipe(conn: sqlite3.Connection, data: Row, user_id: str) -> str:
    """Insert a recipe with all children in one transaction. Returns its id."""
    recipe_id = new_id()
    now = now_iso()
    shareable = 0 if data.get("source_url") else 1
    with conn:
        conn.execute(
            """INSERT INTO recipes (id, name, description, servings, prep_minutes, cook_minutes,
                 notes, source_url, source_name, visibility, shareable, created_by,
                 created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                recipe_id,
                data["name"],
                data.get("description", ""),
                data.get("servings", 4),
                data.get("prep_minutes"),
                data.get("cook_minutes"),
                data.get("notes", ""),
                data.get("source_url"),
                data.get("source_name"),
                data.get("visibility", "household"),
                shareable,
                user_id,
                now,
                now,
            ),
        )
        _write_children(conn, recipe_id, data, user_id)
    return recipe_id


def update_recipe(conn: sqlite3.Connection, recipe_id: str, data: Row, user_id: str) -> list[str]:
    """Replace a recipe's content. Returns ids of images that were removed."""
    get_recipe_meta(conn, recipe_id)
    shareable = 0 if data.get("source_url") else 1
    with conn:
        conn.execute(
            """UPDATE recipes SET name = ?, description = ?, servings = ?, prep_minutes = ?,
                 cook_minutes = ?, notes = ?, source_url = ?, source_name = ?, visibility = ?,
                 shareable = ?, updated_at = ?
               WHERE id = ?""",
            (
                data["name"],
                data.get("description", ""),
                data.get("servings", 4),
                data.get("prep_minutes"),
                data.get("cook_minutes"),
                data.get("notes", ""),
                data.get("source_url"),
                data.get("source_name"),
                data.get("visibility", "household"),
                shareable,
                now_iso(),
                recipe_id,
            ),
        )
        return _write_children(conn, recipe_id, data, user_id)


def delete_recipe(conn: sqlite3.Connection, recipe_id: str) -> list[str]:
    """Delete a recipe (children cascade). Returns its image ids for file removal."""
    get_recipe_meta(conn, recipe_id)
    image_ids = [
        r[0] for r in conn.execute("SELECT id FROM recipe_images WHERE recipe_id = ?", (recipe_id,))
    ]
    with conn:
        conn.execute("DELETE FROM recipes WHERE id = ?", (recipe_id,))
    return image_ids


# --- images ------------------------------------------------------------------


def insert_upload(conn: sqlite3.Connection, image_id: str, user_id: str) -> None:
    """Register an uploaded, not yet assigned image."""
    with conn:
        conn.execute(
            "INSERT INTO recipe_images (id, recipe_id, position, created_by, created_at) "
            "VALUES (?, NULL, 0, ?, ?)",
            (image_id, user_id, now_iso()),
        )


def image_exists(conn: sqlite3.Connection, image_id: str) -> bool:
    """Whether an image row exists."""
    return (
        conn.execute("SELECT 1 FROM recipe_images WHERE id = ?", (image_id,)).fetchone() is not None
    )


def all_image_ids(conn: sqlite3.Connection) -> set[str]:
    """Every registered image id."""
    return {r[0] for r in conn.execute("SELECT id FROM recipe_images")}


def delete_stale_uploads(conn: sqlite3.Connection, max_age_h: int) -> list[str]:
    """Delete unassigned image rows older than max_age_h. Returns their ids."""
    cutoff = (datetime.now(UTC) - timedelta(hours=max_age_h)).isoformat(timespec="seconds")
    ids = [
        r[0]
        for r in conn.execute(
            "SELECT id FROM recipe_images WHERE recipe_id IS NULL AND created_at < ?", (cutoff,)
        )
    ]
    with conn:
        conn.executemany("DELETE FROM recipe_images WHERE id = ?", [(i,) for i in ids])
    return ids


# --- wishes ------------------------------------------------------------------

_WISH_SELECT = """SELECT w.id, w.recipe_id, r.name AS recipe_name, w.user_id, w.note, w.status,
    w.created_at, w.done_at,
    (SELECT i.id FROM recipe_images i WHERE i.recipe_id = r.id
      ORDER BY i.position LIMIT 1) AS image_id
  FROM wishes w JOIN recipes r ON r.id = w.recipe_id"""


def _wish_row(row: sqlite3.Row) -> Row:
    wish = dict(row)
    image_id = wish.pop("image_id")
    wish["thumb_url"] = image_urls(image_id)["thumb_url"] if image_id else None
    return wish


def get_wish(conn: sqlite3.Connection, wish_id: str) -> Row:
    """One wish or NotFound."""
    row = conn.execute(f"{_WISH_SELECT} WHERE w.id = ?", (wish_id,)).fetchone()  # noqa: S608
    if row is None:
        raise NotFound
    return _wish_row(row)


def list_wishes(
    conn: sqlite3.Connection, user_id: str | None, status: str, limit: int | None
) -> list[Row]:
    """Wishes of visible recipes. Open: oldest first; done: most recently done first."""
    where, params = _visible_sql(user_id)
    order = "w.created_at, w.rowid" if status == "open" else "w.done_at DESC, w.rowid DESC"
    sql = f"{_WISH_SELECT} WHERE w.status = ? AND {where} ORDER BY {order}"  # noqa: S608
    args: list[Any] = [status, *params]
    if limit is not None:
        sql += " LIMIT ?"
        args.append(limit)
    return [_wish_row(r) for r in conn.execute(sql, args)]


def add_wish(conn: sqlite3.Connection, recipe_id: str, user_id: str, note: str) -> Row:
    """Create an open wish for a visible recipe; a second open one raises AlreadyWished."""
    row = conn.execute(
        "SELECT visibility, created_by FROM recipes WHERE id = ?", (recipe_id,)
    ).fetchone()
    if row is None or (row["visibility"] == "private" and row["created_by"] != user_id):
        raise NotFound
    wish_id = new_id()
    try:
        with conn:
            conn.execute(
                "INSERT INTO wishes (id, recipe_id, user_id, note, created_at) "
                "VALUES (?, ?, ?, ?, ?)",
                (wish_id, recipe_id, user_id, note, now_iso()),
            )
    except sqlite3.IntegrityError as err:
        raise AlreadyWished from err
    return get_wish(conn, wish_id)


def remove_wish(conn: sqlite3.Connection, wish_id: str) -> None:
    """Delete a wish."""
    get_wish(conn, wish_id)
    with conn:
        conn.execute("DELETE FROM wishes WHERE id = ?", (wish_id,))


def complete_wishes(conn: sqlite3.Connection, recipe_id: str) -> int:
    """Mark all open wishes of a recipe as done. Returns how many."""
    get_recipe_meta(conn, recipe_id)
    with conn:
        cur = conn.execute(
            "UPDATE wishes SET status = 'done', done_at = ? "
            "WHERE recipe_id = ? AND status = 'open'",
            (now_iso(), recipe_id),
        )
    return cur.rowcount


def count_open_wishes(conn: sqlite3.Connection) -> int:
    """Number of open wishes."""
    return conn.execute("SELECT COUNT(*) FROM wishes WHERE status = 'open'").fetchone()[0]


def open_wish_recipe_ids(conn: sqlite3.Connection) -> list[str]:
    """Distinct recipe ids with at least one open wish, oldest wish first."""
    return [
        r[0]
        for r in conn.execute(
            "SELECT recipe_id FROM wishes WHERE status = 'open' "
            "GROUP BY recipe_id ORDER BY MIN(created_at), MIN(rowid)"
        )
    ]
