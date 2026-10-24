# DishWish – Umsetzungsplan

> Status: freigegeben am 2026-10-24. Umsetzung phasenweise (eine Phase pro Session):
> „Setze Phase N aus PLAN.md um.“ Erledigte Aufgaben hier abhaken (`- [x]`).
> Entscheidungen in Abschnitt 2 nicht ohne Rückfrage ändern.

## 1. Ziel

Home-Assistant-native Rezept- und Essenswunsch-Verwaltung:

- **Bibliothek** eigener Gerichte mit Fotos, Kategorien, Suche und Filter.
- **Rezept + Anleitung** pro Gericht: Zutaten (strukturiert, Portionen umrechenbar), nummerierte Schritte, Notizen.
- **Neue Gerichte** per Handykamera oder Foto-Upload anlegen.
- **Externe Rezepte nur per Link** (z. B. Chefkoch): Link einfügen → Entwurf prüfen → speichern.
- **Essenswünsche** pro HA-User (mit Notiz), mehrere User pro Gericht, „Gekocht“ erledigt sie.
- **Einkaufsliste:** Button im Rezept schreibt die (skalierten) Zutaten in eine wählbare HA-`todo`-Liste.
- **Fertige, konfigurierbare Lovelace-Karten** für alles, ausgeliefert mit der Integration.
- **Schnell und stabil auch bei 100–1.000+ Gerichten.**

**Nicht-Ziele (bewusst ausgeschlossen):** Mealie-/Grocy-/Tandoor-Anbindung, Durchsuchen fremder Kataloge (Chefkoch-Suche), Vorratshaltung, Nährwerte.
**Später (Backlog, Abschnitt 15):** Community, Wochenplan, Assist-Sprachbefehle.

## 2. Architekturentscheidungen (fest)

| Thema | Entscheidung | Begründung |
|---|---|---|
| Form | Custom Integration, Installation über HACS. Kein Add-on. | Läuft auf jeder HA-Installation, nutzt HA-User, Backup, `todo`. |
| Daten | Eigene SQLite-Datei `/config/dishwish/dishwish.db` (stdlib `sqlite3`) | Transaktionen, Indizes, absturzsicher (WAL), keine Abhängigkeit. Nicht Recorder-DB, nicht `.storage`-JSON. |
| DB-Zugriff | Ein eigener Single-Thread-Executor, eine Verbindung | Kein Blockieren des Event-Loops, keine SQLite-Thread-Probleme, Schreibzugriffe serialisiert. |
| Bilder | Dateien `/config/dishwish/images/{id}_full.jpg` (≤ 1600 px) + `{id}_thumb.jpg` (480×360, 4:3) | Bibliothek lädt nur Vorschaubilder → schnell auch mobil. |
| Bildverarbeitung | Browser verkleinert vor Upload; Server (Pillow) prüft, dreht nach EXIF, entfernt EXIF/GPS, erzeugt beide Größen | Schneller Upload, saubere einheitliche Dateien, Privatsphäre. |
| Bildauslieferung | HTTP-View **ohne Auth**, Zugriff nur über zufällige 32-stellige ID, `Cache-Control: immutable` | Wie HA-Core `image_upload`; `<img>` kann keinen Token senden; IDs gibt nur die authentifizierte API heraus. |
| API | WebSocket-Befehle `dishwish/*` + HTTP nur für Bilder | HA-Standard, Auth & User-Kontext inklusive, Live-Updates per Subscription. |
| Einkaufsliste | Bestehende `todo`-Entität über `todo.add_item`; Anzeige mit Standard-Karte `todo-list` | Funktioniert mit HA-Einkaufsliste, Local To-do, Bring!, Todoist …; keine eigene Liste nötig. |
| Link-Import | Eigener schema.org-JSON-LD-Parser (stdlib `html.parser` + `json`) | Keine schwere Fremdbibliothek (Abhängigkeitskonflikte mit HA vermeiden). |
| Frontend | TypeScript + Lit 3, Vite, **ein** gebündeltes JS in der Integration, automatisch geladen | Eine Installation, keine manuelle Lovelace-Ressource. |
| UI-Bausteine | Eigene Elemente + natives `<dialog>`; HA-intern nur `ha-icon` (Kategorie-Icons) und ggf. `ha-form` im Karten-Editor | Robust gegen HA-Frontend-Updates. |
| Theming | Ausschließlich HA-CSS-Variablen | Dark Mode und Themes automatisch. |
| Benutzer | HA-User (`connection.user`), Avatar über `person`-Entität mit passender `user_id` | Keine eigene Benutzerverwaltung. |
| Sprache | Deutsch + Englisch (Integration-Übersetzungen + eigenes Frontend-i18n) | |
| Urheberrecht | Importierte Rezepte: `source_url` gespeichert, `shareable = 0` | Für spätere Community: nur eigene Rezepte teilbar. |

## 3. Projektstruktur

```
dishwish/
├── CLAUDE.md, PLAN.md, README.md, hacs.json, .gitignore
├── pyproject.toml                 # ruff + pytest-Konfiguration
├── requirements_test.txt          # pytest-homeassistant-custom-component (passend zur Ziel-HA)
├── custom_components/dishwish/
│   ├── __init__.py                # async_setup (einmalig: WS, Views, Static, Frontend) + async_setup_entry
│   ├── manifest.json
│   ├── const.py                   # DOMAIN, Pfade, Limits, Einheiten-Tabelle, Seed-Kategorien
│   ├── config_flow.py             # Einrichtung + Optionen
│   ├── db.py                      # synchron: Schema, Migrationen, Queries
│   ├── store.py                   # async Fassade: DB-Thread, Rechte, Change-Signal, Schreibsperre
│   ├── images.py                  # Bild prüfen/verarbeiten/speichern, Aufräumen
│   ├── importer.py                # URL laden, JSON-LD → Rezept-Entwurf
│   ├── ingredients.py             # Zutatenzeile parsen, skalieren, formatieren, zusammenführen
│   ├── shopping.py                # Zutaten → todo-Liste
│   ├── websocket_api.py
│   ├── http.py                    # Upload-View, Bild-View
│   ├── services.py, services.yaml
│   ├── sensor.py
│   ├── backup.py
│   ├── strings.json, translations/de.json, translations/en.json
│   └── www/dishwish-cards.js    # Build-Ergebnis, wird committed (HACS)
├── frontend/
│   ├── package.json, tsconfig.json, vite.config.ts, eslint.config.js
│   └── src/
│       ├── index.ts               # Karten registrieren + window.customCards
│       ├── api.ts                 # typisierte WS-Aufrufe + Bild-Upload
│       ├── types.ts               # Recipe, RecipeSummary, Wish, Category, minimaler HomeAssistant-Typ
│       ├── data-store.ts          # Client-Cache + EINE Live-Subscription pro Seite
│       ├── i18n.ts, styles.ts
│       ├── cards/library-card.ts, wishes-card.ts, recipe-card.ts
│       ├── dialogs/base-dialog.ts, recipe-dialog.ts, recipe-editor.ts, import-dialog.ts, recipe-picker.ts
│       └── utils/image.ts, scale.ts
├── tests/
│   ├── conftest.py
│   ├── fixtures/                  # ingredient_cases.json, jsonld_*.html (synthetisch!), test_*.jpg
│   └── test_*.py
└── dev/
    ├── docker-compose.yml         # Dev-HA + Test-Runner
    ├── Dockerfile.test
    ├── seed.py                    # N Testgerichte mit generierten Bildern anlegen
    └── config/configuration.yaml  # Rest von dev/config ist gitignored
```

### manifest.json

```json
{
  "domain": "dishwish",
  "name": "DishWish",
  "codeowners": ["@Gloecki2404"],
  "config_flow": true,
  "dependencies": ["http", "frontend", "websocket_api"],
  "documentation": "https://github.com/Gloecki2404/DishWish",
  "integration_type": "service",
  "iot_class": "calculated",
  "issue_tracker": "https://github.com/Gloecki2404/DishWish/issues",
  "requirements": [],
  "single_config_entry": true,
  "version": "0.1.0"
}
```

`hacs.json`: `{"name": "DishWish", "homeassistant": "2026.3.0", "render_readme": true}`

## 4. Datenmodell (SQLite, Schema v1)

Beim Öffnen jeder Verbindung:

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
```

```sql
CREATE TABLE recipes (
  id            TEXT PRIMARY KEY,                 -- uuid4().hex
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  servings      INTEGER NOT NULL DEFAULT 4 CHECK (servings > 0),
  prep_minutes  INTEGER,                          -- NULL = unbekannt
  cook_minutes  INTEGER,
  notes         TEXT NOT NULL DEFAULT '',
  source_url    TEXT,                             -- gesetzt = importiert
  source_name   TEXT,                             -- z. B. "chefkoch.de"
  visibility    TEXT NOT NULL DEFAULT 'household' CHECK (visibility IN ('private', 'household')),
  shareable     INTEGER NOT NULL DEFAULT 1,       -- 0 bei Import (Urheberrecht)
  created_by    TEXT NOT NULL,                    -- HA user id
  created_at    TEXT NOT NULL,                    -- ISO 8601 UTC
  updated_at    TEXT NOT NULL
);
CREATE INDEX idx_recipes_name ON recipes (name COLLATE NOCASE);

CREATE TABLE recipe_images (
  id          TEXT PRIMARY KEY,                   -- uuid4().hex = Dateiname
  recipe_id   TEXT REFERENCES recipes(id) ON DELETE CASCADE,  -- NULL = hochgeladen, noch nicht zugeordnet
  position    INTEGER NOT NULL DEFAULT 0,         -- 0 = Titelbild
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_recipe_images_recipe ON recipe_images (recipe_id, position);

CREATE TABLE ingredients (
  id            INTEGER PRIMARY KEY,
  recipe_id     TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL,
  group_name    TEXT,                             -- z. B. "Für den Teig"
  quantity      REAL,                             -- NULL = ohne Menge ("Salz")
  quantity_max  REAL,                             -- Bereich "2–3"
  unit          TEXT NOT NULL DEFAULT '',         -- kanonisch, siehe 9.
  name          TEXT NOT NULL,
  note          TEXT NOT NULL DEFAULT ''          -- z. B. "fein gewürfelt"
);
CREATE INDEX idx_ingredients_recipe ON ingredients (recipe_id, position);

CREATE TABLE steps (
  id         INTEGER PRIMARY KEY,
  recipe_id  TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position   INTEGER NOT NULL,
  section    TEXT,                                -- optionale Zwischenüberschrift
  text       TEXT NOT NULL
);
CREATE INDEX idx_steps_recipe ON steps (recipe_id, position);

CREATE TABLE categories (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  icon      TEXT NOT NULL DEFAULT 'mdi:silverware-fork-knife',
  position  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE recipe_categories (
  recipe_id    TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  category_id  TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, category_id)
);
CREATE INDEX idx_recipe_categories_cat ON recipe_categories (category_id);

CREATE TABLE wishes (
  id            TEXT PRIMARY KEY,
  recipe_id     TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL,
  note          TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  planned_date  TEXT,                             -- vorbereitet für Wochenplan, vorerst ungenutzt
  created_at    TEXT NOT NULL,
  done_at       TEXT
);
CREATE INDEX idx_wishes_status ON wishes (status, created_at);
CREATE UNIQUE INDEX idx_wishes_open_unique ON wishes (recipe_id, user_id) WHERE status = 'open';
```

**Regeln:**
- Versionierung über `PRAGMA user_version`. Migrationen als geordnete Liste in `db.py`, jede in einer Transaktion. **Vor jeder Migration** Kopie `dishwish.db.bak-v{alt}` anlegen.
- Beim Start `PRAGMA quick_check`. Schlägt er fehl: Fehler loggen, HA-Repair-Issue anlegen, Setup mit `ConfigEntryError` abbrechen. **Nie** eine neue DB über eine defekte legen.
- Alle Schreibvorgänge in `with conn:` (Transaktion). Update eines Rezepts ersetzt Zutaten- und Schrittliste komplett (kein Diff).
- Seed-Kategorien beim ersten Anlegen, Namen nach `hass.config.language` (de/en): Fleisch, Geflügel, Fisch, Vegetarisch, Vegan, Pasta, Suppe & Eintopf, Salat, Auflauf, Beilage, Frühstück, Dessert, Backen, jeweils mit passendem `mdi:`-Icon.
- Limits (in `const.py`, per voluptuous geprüft): Name 1–200 Zeichen, Beschreibung ≤ 2.000, Notizen ≤ 10.000, Portionen 1–100, Minuten 0–1.440, ≤ 100 Zutaten, ≤ 100 Schritte (je ≤ 5.000 Zeichen), ≤ 10 Bilder pro Gericht.

## 5. Backend-Module

**`__init__.py`**
- `CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)`.
- `async_setup` (einmal pro HA-Laufzeit): WS-Befehle, HTTP-Views, Static-Path für `www/` und `frontend.add_extra_js_url(hass, f"/dishwish_static/dishwish-cards.js?v={VERSION}")`. Dadurch kein Doppel-Registrieren bei Entry-Reload.
- `async_setup_entry`: Ordner anlegen, Store öffnen (`entry.runtime_data`), Plattform `sensor`, Aufräum-Job (beim Start + alle 24 h).
- `async_unload_entry`: Jobs stoppen, Store schließen (Verbindung im DB-Thread schließen, Executor beenden).
- Helfer `get_store(hass)` holt den geladenen Entry oder wirft einen klaren Fehler (für WS/Services/Backup).

**`store.py`** – `DishWishStore`
- Besitzt `ThreadPoolExecutor(max_workers=1, thread_name_prefix="dishwish_db")`. Die Verbindung wird **im** Thread geöffnet, alle `db.py`-Aufrufe über `loop.run_in_executor`.
- Rechteprüfung (Abschnitt 11), danach Dispatcher-Signal `dishwish_changed` mit `{"kind": "recipes" | "categories" | "wishes", "ids": [...]}`.
- Schreibsperre für Backups: `asyncio.Event` `_writes_allowed`. Jede Schreibmethode wartet darauf, Lesezugriffe nicht.
- User-Namen über `hass.auth.async_get_user` auflösen und cachen.

**`backup.py`**
- `async_pre_backup`: Schreibsperre setzen, dann im DB-Thread `PRAGMA wal_checkpoint(TRUNCATE)`. Der Checkpoint läuft erst nach allen bereits eingereihten Schreibvorgängen.
- `async_post_backup`: Sperre aufheben. Beide Funktionen dürfen nie werfen, wenn die Integration nicht geladen ist (dann sofort `return`).

**`images.py`** (CPU-lastig → `hass.async_add_executor_job`, nicht der DB-Thread)
- Eingabe ≤ 15 MB. `Image.open` + `verify()`, erneut öffnen. `ImageOps.exif_transpose`, nach RGB konvertieren (Alpha auf Weiß).
- `full`: in 1600×1600 einpassen, JPEG Qualität 82, progressive, ohne EXIF. `thumb`: mittig auf 4:3 zuschneiden, 480×360, Qualität 78.
- Schreiben in eine Temp-Datei, dann `os.replace` (atomar).
- Nicht lesbares Format (z. B. HEIC ohne Unterstützung) → Fehlercode `unsupported_image`.
- Aufräumen: Zeilen mit `recipe_id IS NULL`, die älter als 24 h sind, samt Dateien löschen. Dateien ohne DB-Zeile, die älter als 1 h sind, löschen. Nach `recipes/delete` und beim Entfernen einzelner Bilder: Dateien sofort nach dem Commit löschen.

**`http.py`**
- `POST /api/dishwish/images` (`requires_auth = True`): Multipart-Feld `file`. Legt eine `recipe_images`-Zeile ohne `recipe_id` an. Antwort `201 {"id", "thumb_url", "full_url"}`.
- `GET /api/dishwish/images/{image_id}/{size}` (`requires_auth = False`): `image_id` muss `^[0-9a-f]{32}$` entsprechen, `size` ∈ {`thumb`, `full`}. `FileResponse` mit `Cache-Control: public, max-age=31536000, immutable`, sonst 404.

**`config_flow.py`**
- Einrichtung ohne Eingaben (einmalig).
- Optionen: `default_shopping_list` (EntitySelector, Domain `todo`, optional) und `default_servings` (1–20, Standard 4).

## 6. Schnittstellen

### WebSocket-Befehle (alle authentifiziert)

| `type` | Parameter | Antwort | Rechte |
|---|---|---|---|
| `dishwish/recipes/list` | – | `RecipeSummary[]` | sichtbare Gerichte |
| `dishwish/recipes/get` | `recipe_id` | `Recipe` | sichtbar |
| `dishwish/recipes/create` | `RecipeInput` | `Recipe` | alle |
| `dishwish/recipes/update` | `recipe_id`, `RecipeInput` | `Recipe` | Ersteller oder Admin |
| `dishwish/recipes/delete` | `recipe_id` | `{}` | Ersteller oder Admin |
| `dishwish/recipes/import_url` | `url` | `RecipeInput` (Entwurf, **nicht** gespeichert; `image_ids` enthält das importierte Bild; `source_url`/`source_name` gesetzt) | alle |
| `dishwish/ingredients/parse` | `lines: string[]` (≤ 100) | `IngredientInput[]` | alle |
| `dishwish/categories/list` | – | `Category[]` | alle |
| `dishwish/categories/create` | `name`, `icon?` | `Category` | alle |
| `dishwish/categories/update` | `category_id`, `name?`, `icon?`, `position?` | `Category` | Admin |
| `dishwish/categories/delete` | `category_id` | `{}` | Admin |
| `dishwish/wishes/list` | `status?` (`open` Standard, `done`), `limit?` | `Wish[]` | Wünsche zu sichtbaren Gerichten |
| `dishwish/wishes/add` | `recipe_id`, `note?` | `Wish` | für sich selbst; doppelt offen → Fehler `already_wished` |
| `dishwish/wishes/remove` | `wish_id` | `{}` | eigener Wunsch oder Admin |
| `dishwish/wishes/complete` | `recipe_id` | `{"count"}` | alle („Gekocht“: alle offenen Wünsche dieses Gerichts) |
| `dishwish/shopping/add` | `recipe_id`, `servings?`, `ingredient_ids?`, `entity_id?` | `{"added": [...], "skipped": [...]}` | alle |
| `dishwish/subscribe` | – | Events `{"kind", "ids"}` | alle |

**Typen (JSON):**
- `RecipeSummary`: `id, name, thumb_url|null, category_ids, servings, prep_minutes, cook_minutes, visibility, created_by, updated_at, open_wish_count, my_wish_id|null, source_name|null`.
- `Recipe`: alle Summary-Felder plus `description, notes, source_url, shareable, images[{id, thumb_url, full_url}], ingredients[{id, group_name, quantity, quantity_max, unit, name, note}], steps[{id, section, text}], can_edit`.
- `RecipeInput`: `name, description, servings, prep_minutes, cook_minutes, notes, source_url, source_name, visibility, category_ids, image_ids` (Reihenfolge = Position, erstes = Titelbild), `ingredients[], steps[]`.
- `Wish`: `id, recipe_id, recipe_name, thumb_url, user_id, user_name, note, status, created_at, done_at`.
- Fehler als WS-Fehlercodes (`not_found`, `unauthorized`, `invalid_format`, `already_wished`, `invalid_url`, `fetch_failed`, `no_recipe_found`, `too_large`, `unsupported_image`, `entity_not_found`). Das Frontend übersetzt sie.

**Live-Updates:** `subscribe` verbindet sich mit dem Dispatcher-Signal (`connection.subscriptions[msg["id"]] = unsub`) und sendet `event_message`.

### Services (`services.yaml` + Übersetzungen)

- `dishwish.add_to_shopping_list`: `recipe_id` (Pflicht), `servings`, `entity_id` (`todo`; Standard aus den Optionen).
- `dishwish.add_open_wishes_to_shopping_list`: `entity_id`. Nimmt die Zutaten aller offenen Wünsche, fasst gleiche Zutat + Einheit zusammen und schreibt sie in die Liste.

Beide sind ohne User-Kontext (Automationen) erlaubt.

### Events (für Automationen)

- `dishwish_wish_added`: `recipe_id, recipe_name, user_id, user_name, note`
- `dishwish_wishes_completed`: `recipe_id, recipe_name, count`

### Entitäten (ein Service-Gerät „DishWish“, `has_entity_name`, `translation_key`)

- `sensor.dishwish_open_wishes`: Anzahl offener Wünsche. Attribut `wishes` (max. 20 Einträge `{recipe, users, notes}`) über `_unrecorded_attributes` vom Recorder ausgeschlossen.
- `sensor.dishwish_recipes`: Anzahl Gerichte.
- Aktualisierung über das Change-Signal, kein Polling.

## 7. Einkaufsliste (`shopping.py`)

- Ziel: `entity_id` aus dem Aufruf → Karten-Konfiguration → Integrations-Option. Fehlt alles, Fehler `entity_not_found`.
- Zutaten auswählen (`ingredient_ids`, Standard: alle), mit `servings / recipe.servings` skalieren, Zeile formatieren (ohne Notiz), z. B. `400 g Mehl`.
- Duplikat-Schutz: vorher `todo.get_items` (Status `needs_action`) abfragen. Zeilen mit gleichem Text (case-insensitive) überspringen und in `skipped` melden.
- `todo.add_item` je Zeile mit `blocking=True`. `description` = „für: {Rezeptname}“, nur wenn die Entität `TodoEntityFeature.SET_DESCRIPTION_ON_ITEM` unterstützt.

## 8. Link-Import (`importer.py`)

- Nur `http`/`https`, URL ≤ 2.000 Zeichen.
- Laden über `async_get_clientsession(hass)`: Timeout 15 s, ≤ 5 Weiterleitungen, max. 5 MB (gestückelt lesen, darüber abbrechen). Browserähnlicher `User-Agent` und `Accept-Language` passend zur HA-Sprache.
- `<script type="application/ld+json">`-Blöcke mit `html.parser` sammeln und jeden einzeln mit `json.loads` lesen. Kaputte Blöcke überspringen.
- Rekursiv nach einem Objekt mit `@type` == `"Recipe"` (oder Liste, die `"Recipe"` enthält) suchen: oberste Ebene, Listen, `@graph`, `mainEntity`.

| JSON-LD | → Feld | Regel |
|---|---|---|
| `name` | `name` | HTML entfernen, `html.unescape`, trimmen |
| `description` | `description` | wie oben, auf 2.000 Zeichen kürzen |
| `image` | Bild | String, Liste, `ImageObject{url}` → erste URL laden (≤ 10 MB, `image/*`) und über `images.py` verarbeiten |
| `recipeYield` | `servings` | erste ganze Zahl aus String/Liste, sonst Option `default_servings` |
| `prepTime`, `cookTime`, `totalTime` | Minuten | ISO-8601-Dauer (`PT1H30M`, `P0DT45M`). Nur `totalTime` vorhanden → `prep = total - cook` bzw. `prep = total` |
| `recipeIngredient` (alt: `ingredients`) | `ingredients` | jede Zeile mit `ingredients.parse_line` |
| `recipeInstructions` | `steps` | String (an Zeilenumbrüchen/Nummern teilen), `string[]`, `HowToStep{text}`, `HowToSection{name, itemListElement}` → `section` |
| `recipeCategory`, `keywords` | `category_ids` | nur **vorschlagen**: Abgleich mit vorhandenen Kategorien (case-insensitive) |
| Ziel-URL nach Weiterleitungen | `source_url`, `source_name` | Hostname ohne `www.` |

- Kein Rezept gefunden → `no_recipe_found` („Seite enthält keine Rezeptdaten“).
- **Tests nur mit selbst geschriebenen, synthetischen HTML-Fixtures** (keine echten Chefkoch-Seiten im Repo, Urheberrecht). Abzudecken: Recipe direkt, in `@graph`, in Liste, `HowToSection`, String-Anleitung, ein kaputter + ein gültiger Block, fehlendes Bild.

## 9. Zutaten (`ingredients.py` + `frontend/src/utils/scale.ts`)

**`parse_line(text)` → `quantity, quantity_max, unit, name, note`** (wirft nie; Fallback: ganze Zeile = `name`)
- Menge am Anfang:
  - ganze Zahlen und Dezimalzahlen mit `,` oder `.`
  - Brüche `1/2`, Unicode-Brüche `½ ⅓ ¼ ¾ ⅔ ⅛`, gemischt `1 1/2` / `1½`
  - Bereiche `2-3`, `2 – 3`, `2 bis 3`
  - `ca.` bzw. `etwa` wird ignoriert
- Einheit: nächstes Token aus der Einheiten-Tabelle (`const.py`), case-insensitive, mit/ohne Punkt, Plural. Normalisiert auf eine kanonische Form:
  - Deutsch: g, kg, mg, ml, cl, dl, l, EL, TL, Msp., Prise, Pck., Dose, Glas, Becher, Bund, Stk., Zehe, Scheibe, Tasse, Würfel, Zweig, Blatt, Handvoll, Tropfen
  - Englisch: cup, tbsp, tsp, oz, lb, pinch, clove, can
  - z. B. „Esslöffel“ → `EL`, „Päckchen“ → `Pck.`
- Notiz: Text nach dem ersten Komma oder in Klammern am Ende („Zwiebel, fein gewürfelt“ → `name` „Zwiebel“, `note` „fein gewürfelt“).
- Keine Menge → `quantity = None` („Salz und Pfeffer“).

**Skalieren & Formatieren** (Backend **und** Frontend identisch)
- Skalieren: `q * ziel_portionen / rezept_portionen`.
- g/ml: ≥ 1.000 → kg/l mit bis zu 2 Nachkommastellen; ≥ 100 → auf 5 runden; sonst auf ganze Zahl (mind. 1).
- kg/l: bis 2 Nachkommastellen.
- Alle anderen Einheiten: auf ¼ runden und als Bruch anzeigen (`½`, `1½`, `¾`); ≥ 10 → ganze Zahl.
- Dezimaltrennzeichen nach Sprache (de `,`, en `.`). Bereiche als `2–3`.
- Zusammenführen (für mehrere Rezepte): gleicher normalisierter Name + gleiche Einheit → Mengen addieren. Bei unterschiedlicher Einheit getrennt lassen.

**Gemeinsame Testdatei** `tests/fixtures/ingredient_cases.json` mit `parse`- und `format`-Fällen (≥ 40). Wird von pytest **und** vitest gelesen, damit beide Seiten gleich rechnen.

## 10. Frontend

### Allgemein
- Lit 3, TypeScript `strict`, Vite-Library-Build → ein ES-Modul `custom_components/dishwish/www/dishwish-cards.js`. Keine CDN-Abhängigkeiten.
- Registrierung: `customElements.define` nur wenn noch nicht definiert. `window.customCards.push({type, name, description, preview: true, documentationURL})`.
- `data-store.ts`: ein Singleton pro `hass.connection`.
  - Startet beim ersten Zugriff parallel `recipes/list`, `categories/list` und `wishes/list`.
  - Hält **eine** `subscribe`-Verbindung. Bei Events wird die betroffene Liste neu geladen (300 ms entprellt).
  - Karten registrieren sich als Listener und rendern bei Änderungen neu.
- Hinweise/Fehler: `hass-notification`-Event (`{message}`, `bubbles`, `composed`).
- Icons: eigene `<svg>` mit Pfaden aus `@mdi/js` (nur genutzte Icons). Kategorie-Icons über `ha-icon`.
- Bilder: `<img loading="lazy" decoding="async">`, Platzhalter mit `aspect-ratio: 4/3` (kein Layout-Springen). Ohne Bild: Icon der ersten Kategorie.
- Suche normalisiert: Kleinschreibung, Diakritika entfernen (NFD), durchsucht Name + Kategorienamen. Läuft komplett im Client und reagiert sofort.
- Mobile-first: Touch-Ziele ≥ 44 px, Container-Queries, auf dem Handy 2 Spalten.
- i18n: `hass.locale.language`, Fallback `en`. Texte nur über `i18n.ts`.
- Kartengrößen: `getCardSize()` und `getGridOptions()` (Bibliothek volle Breite, Wünsche mind. 6 Spalten).

### Dialoge (`base-dialog.ts`, natives `<dialog>` + `showModal()`)
- Unter 600 px Vollbild. Beim Öffnen History-Eintrag pushen, `popstate` schließt den Dialog (Zurück-Taste in der Companion App).
- **recipe-dialog:**
  - Bilder zum Wischen, Name, Kategorien, Zeiten
  - Portionen −/+ (skaliert die Anzeige live)
  - Zutatenliste mit Checkboxen (Standard: alle) + Button „N Zutaten auf Einkaufsliste“ → `shopping/add`, Ergebnis als Hinweis
  - Schritte nummeriert (antippen = lokal als erledigt markieren), Notizen
  - Quelle als Link (neuer Tab)
  - Wunsch-Button mit optionaler Notiz
  - Bearbeiten/Löschen (nur bei `can_edit`, Löschen mit Bestätigung)
- **recipe-editor:**
  - Fotos über zwei Buttons: „Kamera“ (`<input type="file" accept="image/*" capture="environment">`) und „Galerie/Datei“ (`accept="image/*" multiple`). Upload sofort mit Fortschritt; Reihenfolge per ↑/↓, erstes = Titelbild; Entfernen.
  - Kategorien als Chips (Mehrfachauswahl, neue Kategorie direkt anlegen)
  - Portionen, Vorbereitungs- und Kochzeit
  - Zutaten als Zeilen (Menge, Einheit, Name, Notiz). Zusätzlich „Mehrere Zeilen einfügen“ (Textfeld) → `ingredients/parse`.
  - Schritte als Textfelder mit Hinzufügen/Entfernen/↑↓, Notizen, Schalter „Nur für mich“ (`private`)
  - Ungespeicherte Änderungen beim Schließen bestätigen lassen
- **import-dialog:** URL-Feld (Einfügen), „Laden“ → Ladeanzeige → öffnet den Editor mit dem Entwurf. Gespeichert wird erst dort.
- **recipe-picker:** kompakte Such-Kachelansicht zur Auswahl eines Gerichts (für „+ Wunsch“).

### Bild-Upload (`utils/image.ts`)
- `createImageBitmap(file, {imageOrientation: "from-image"})` → Canvas, lange Kante max. 2.048 px → `toBlob("image/jpeg", 0.85)`.
- Schlägt das fehl, Original hochladen (Server-Limit 15 MB).
- Upload per `hass.fetchWithAuth("/api/dishwish/images", {method: "POST", body: FormData})`.

### Karten

**`dishwish-library-card`** – Bibliothek
- Konfiguration:

  | Option | Werte | Standard |
  |---|---|---|
  | `title` | Text | „Gerichte“ |
  | `columns` | `auto` \| 2–6 | `auto` |
  | `categories` | Liste von IDs | alle |
  | `default_category` | ID | – |
  | `show_search` | bool | `true` |
  | `show_add` | bool | `true` |
  | `show_import` | bool | `true` |
  | `sort` | `name` \| `newest` \| `popular` | `name` |
  | `shopping_list` | `todo`-Entität | Integrations-Option |

- Aufbau:
  - Kopfzeile: Titel, Suche, „+“-Menü (Neues Gericht / Per Link importieren)
  - Filter-Chips: Alle, Kategorien, „Schnell (≤ 30 min)“, „Meine“
  - Kachel-Raster: Bild, Name, Zeit-Badge, Herz (eigener Wunsch an/aus) + Anzahl Wünsche. Kachel antippen → recipe-dialog.
  - Leerer Zustand mit Buttons „Erstes Gericht anlegen“ / „Per Link importieren“

**`dishwish-wishes-card`** – Essenswünsche
- Konfiguration:

  | Option | Werte | Standard |
  |---|---|---|
  | `title` | Text | „Essenswünsche“ |
  | `layout` | `list` \| `grid` | `list` |
  | `show_done` | Anzahl zuletzt erledigter | 0 |
  | `shopping_list` | `todo`-Entität | Integrations-Option |

- Aufbau:
  - Gruppiert nach Gericht, sortiert nach Anzahl Wünsche, dann ältester Wunsch
  - Pro Gericht: Bild, Name, Avatare der Wünschenden (`person`-Bild, sonst Initialen), Notizen
  - Aktionen: „Gekocht ✓“, „Zutaten auf Einkaufsliste“, eigenen Wunsch entfernen, Rezept öffnen
  - Button „+ Wunsch“ → recipe-picker

**`dishwish-recipe-card`** – Einzelrezept / Kochmodus (Phase 4)
- Konfiguration:

  | Option | Werte | Standard |
  |---|---|---|
  | `recipe_id` | Gericht-ID | – |
  | `mode` | `fixed` \| `top_wish` | `fixed` |
  | `show_ingredients` | bool | `true` |
  | `show_steps` | bool | `true` |
  | `shopping_list` | `todo`-Entität | Integrations-Option |

- Inhalt wie recipe-dialog, als Karte. „Kochmodus“: Schritt für Schritt, große Schrift, Weiter/Zurück, `navigator.wakeLock` (falls verfügbar).

**Einkaufsliste anzeigen:** Standard-Karte `type: todo-list` mit der gewählten Entität (in der README dokumentieren). Keine eigene Karte.

**Karten-Editoren:** `static getStubConfig()` für alle Karten. Visueller Editor bevorzugt über `static getConfigForm()` (Selektoren: `entity` mit Domain `todo`, `select`, `number`, `boolean`), sonst `getConfigElement()` mit `ha-form` (siehe Prüfpunkt 1). Die Kategorie- bzw. Rezept-Auswahl lädt ihre Optionen aus `categories/list` bzw. `recipes/list`.

## 11. Berechtigungen

| Aktion | Wer |
|---|---|
| Gerichte ansehen | alle angemeldeten User: `household` + eigene `private` |
| Gericht anlegen, Link importieren, Bilder hochladen | alle |
| Gericht bearbeiten/löschen | Ersteller oder Admin (`user.is_admin`) |
| Kategorie anlegen | alle |
| Kategorie bearbeiten/löschen | Admin |
| Wunsch hinzufügen | alle (nur für sich selbst) |
| Wunsch entfernen | eigener oder Admin |
| „Gekocht“, Einkaufsliste | alle |
| Services aus Automationen (ohne User) | erlaubt |

Wünsche zu einem `private`-Gericht sieht nur dessen Ersteller.

## 12. Leistungs- und Stabilitätsziele

- `recipes/list` mit 1.000 Gerichten: < 100 ms serverseitig (Test mit `dev/seed.py`-Daten), Antwort < 250 KB.
- Vorschaubild ≤ 60 KB, Vollbild ≤ 400 KB (typisch).
- Filter/Suche ohne Server-Anfrage, ohne spürbare Verzögerung.
- Kein blockierender I/O im Event-Loop (HA warnt sonst; im Test prüfen).
- Kein Datenverlust bei Absturz (WAL + Transaktionen), konsistentes Backup (Abschnitt 5).
- Fehlerhafte Eingaben/Importe liefern verständliche Fehlercodes, nie einen Absturz der Integration.

## 13. Entwicklungsumgebung & Befehle

Host: Windows mit Docker Desktop (WSL2), Node.js 22 LTS, Git. Python läuft nur im Container.

`dev/docker-compose.yml` (Kern):
```yaml
services:
  homeassistant:
    image: ghcr.io/home-assistant/home-assistant:stable
    ports: ["8123:8123"]
    environment: ["TZ=Europe/Berlin"]   # anpassen
    volumes:
      - ./config:/config
      - ../custom_components/dishwish:/config/custom_components/dishwish
  test:
    build: { context: .., dockerfile: dev/Dockerfile.test }   # python:3.14-slim + requirements_test.txt
    working_dir: /repo
    volumes: ["..:/repo"]
```

| Zweck | Befehl |
|---|---|
| Dev-HA starten | `docker compose -f dev/docker-compose.yml up -d homeassistant` → http://localhost:8123 |
| Nach Python-Änderung | `docker compose -f dev/docker-compose.yml restart homeassistant` |
| Backend-Tests | `docker compose -f dev/docker-compose.yml run --rm test pytest` |
| Backend-Lint | `docker compose -f dev/docker-compose.yml run --rm test ruff check .` und `… ruff format --check .` |
| Frontend installieren | `npm --prefix frontend ci` |
| Frontend bauen | `npm --prefix frontend run build` |
| Frontend während Entwicklung | `npm --prefix frontend run dev` (Build im Watch-Modus, Browser neu laden) |
| Frontend prüfen | `npm --prefix frontend run lint`, `… run typecheck`, `… test` (vitest) |
| Testdaten | `docker compose -f dev/docker-compose.yml run --rm test python dev/seed.py --count 500` |

## 14. Phasen

Jede Phase endet mit grünen Tests, Lint und Build, einer manuellen Prüfung in der Dev-HA und einem Commit-Vorschlag.

### Phase 1 – Fundament (Backend-Kern)
- [x] 1.1 Repo: `git init`, `.gitignore` (node_modules, `__pycache__`, `.pytest_cache`, `dev/config/*` außer `configuration.yaml`, `*.db*`, `.env`), `pyproject.toml` (ruff, pytest `asyncio_mode = auto`), `requirements_test.txt`, `dev/docker-compose.yml`, `dev/Dockerfile.test`, `hacs.json`, README-Gerüst
- [x] 1.2 Integrations-Gerüst: `manifest.json`, `const.py`, `config_flow.py` inkl. Optionen, `strings.json` + Übersetzungen de/en, `__init__.py` (Aufteilung `async_setup` / `async_setup_entry`)
- [x] 1.3 `db.py`: Schema v1, Migrationsmechanik mit Sicherungskopie, `quick_check`, alle Queries, Kategorien-Seed
- [x] 1.4 `store.py`: DB-Thread, Rechteprüfung, Change-Signal, Schreibsperre
- [x] 1.5 `images.py` + `http.py`: Upload, Auslieferung, Aufräum-Job
- [x] 1.6 `ingredients.py` + `tests/fixtures/ingredient_cases.json`
- [x] 1.7 `websocket_api.py`: `recipes/*` (ohne `import_url`), `categories/*`, `ingredients/parse`, `subscribe`
- [x] 1.8 `backup.py`
- [x] 1.9 `dev/seed.py` (Gerichte mit generierten Bildern, z. B. farbige Pillow-Flächen mit Text)
- [x] 1.10 Tests: DB (CRUD, Cascade, Migration, Sichtbarkeit), Zutaten (≥ 40 Fälle), Bilder (EXIF-Drehung, EXIF entfernt, Größen, kaputte Datei), WebSocket (inkl. Rechte!), Config-Flow, Backup-Schreibsperre, Performance (1.000 Gerichte → `recipes/list` < 100 ms)

**Fertig wenn:** Integration lässt sich in der Dev-HA einrichten. Ein Gericht mit Bild lässt sich per WebSocket anlegen, lesen, ändern und löschen, die Bilddateien verschwinden mit. Alle Tests und ruff sind grün.

**Abweichungen/Notizen Phase 1 (2026-10-24):**
- Prüfpunkte geklärt: HA 2026.10.3 im Container (Python 3.14.9, Pillow 12.3.0 enthalten → nicht in `requirements`); Test-Image `python:3.14-slim` mit `pytest-homeassistant-custom-component==0.13.374`. Node 24 LTS statt 22 installiert.
- `requirements_test.txt` enthält zusätzlich `home-assistant-frontend==20260930.5` (nur Test-Umgebung), weil `manifest.json` `frontend` als Dependency nennt und HA es beim Setup lädt.
- `get_store(hass)` liegt in `store.py` statt `__init__.py` (vermeidet zirkuläre Imports mit `http.py`/`backup.py`).
- Statische Auslieferung von `www/` und `add_extra_js_url` bewusst erst in Phase 2 (2.1), da es noch kein JS gibt. Plattform `sensor` + Aufräum-Job: Job ist da, Sensoren folgen in Phase 3.
- Antwortgröße `recipes/list` (1.000 Gerichte): ~430 KB roh, < 250 KB komprimiert (HA nutzt WebSocket-Kompression). Test prüft die komprimierte Größe.
- Dev-HA startet und erkennt die Integration; 50 Seed-Gerichte liegen in `dev/config/dishwish`. Manuell in der Dev-HA geprüft (über WS im Browser): Integration eingerichtet, Gericht anlegen/lesen/ändern/löschen, Bild-Upload per `fetchWithAuth` (201), Bilddateien verschwinden mit dem Gericht.

### Phase 2 – Bibliothek, Rezepte, Link-Import
- [x] 2.1 Frontend-Projekt: Vite, TS strict, Lit, ESLint, vitest. Build nach `custom_components/dishwish/www/`. Auslieferung + `add_extra_js_url` in `__init__.py`.
- [x] 2.2 `api.ts`, `types.ts`, `data-store.ts`, `i18n.ts`, `styles.ts`, `base-dialog.ts`
- [x] 2.3 `library-card` inkl. Filter, Suche, Sortierung, Editor
- [x] 2.4 `recipe-dialog` inkl. Portionen-Umrechnung (`utils/scale.ts`, gleiche Fixture wie Backend)
- [x] 2.5 `recipe-editor` inkl. Kamera/Galerie, Verkleinern im Browser, Zutaten-Mehrzeilen-Eingabe
- [x] 2.6 `importer.py` + WS `recipes/import_url` + `import-dialog`
- [x] 2.7 Tests: Importer (synthetische Fixtures, Abschnitt 8), `scale.ts` (vitest), Build/Lint/Typecheck

**Fertig wenn:**
- Am Handy (Companion App) Foto aufnehmen → Gericht speichern → erscheint sofort in der Bibliothek auf einem zweiten Gerät (Live-Update).
- Ein Chefkoch-Link übernimmt Name, Zutaten, Schritte und Bild.
- Mit 100+ Gerichten scrollt die Bibliothek flüssig und der Filter reagiert sofort.

**Abweichungen/Notizen Phase 2 (2026-10-24):**
- Prüfpunkte: (1) `getConfigForm()` wird vom HA-Frontend für Custom Cards aufgerufen (Editor-Code geprüft). Die Bibliothekskarte nutzt ein statisches Schema; `categories`/`default_category` sind vorerst nur per YAML einstellbar, da `getConfigForm` keine dynamischen Optionen kennt → `getConfigElement()` + `ha-form` in Phase 4.2. (2) `frontend.add_extra_js_url(hass, url)` und `http.async_register_static_paths([StaticPathConfig(url_path, path)])` bestätigt. (8) `hass.fetchWithAuth` funktioniert (Upload getestet). (9) Kamera-Input (`capture`) **nicht** auf echten Geräten geprüft – manuell mit iOS/Android Companion App testen. (10) Chefkoch-Link **nicht** gegen die echte Seite geprüft (keine echten Seiten im Repo/Test) – manuell mit einem echten Link testen.
- Toolchain: Windows-Anwendungssteuerung blockiert die native Rolldown-Binärdatei → Vite 7 (esbuild) statt Vite 8; TypeScript `~6.0` (typescript-eslint unterstützt noch kein TS 7). Node 24.
- Cache-Buster der Bundle-URL: `?v={VERSION}-{mtime}` statt nur Version.
- Importer blockiert Hosts mit nicht-öffentlichen IPs (Schutz vor Zugriff auf das lokale Netz), Weiterleitungen werden einzeln geprüft. In Tests wird `_check_host` ersetzt.
- `wishes/list` wird im `data-store.ts` erst in Phase 3 geladen. Wunsch-Herz und Einkaufslisten-Button folgen in Phase 3. Im Dialog sind noch keine Zutaten-Checkboxen.
- Gemessen in der Dev-HA mit 1.000 Gerichten: `recipes/list` 54 ms im Browser, erster Karten-Render 34 ms, Suche 13 ms. Kacheln werden schrittweise (60 pro Schritt) gerendert.
- Manuell in der Dev-HA geprüft: Karte lädt, Dialog, Editor (inkl. Mehrzeilen-Zutaten, Verwerfen-Abfrage), Anlegen, Löschen, Suche mit Umlauten, Filter.
### Phase 3 – Wünsche & Einkaufsliste
- [x] 3.1 WS `wishes/*`, Events, Sensoren
- [x] 3.2 `shopping.py`, WS `shopping/add`, Services `add_to_shopping_list` + `add_open_wishes_to_shopping_list` (`services.yaml`, Übersetzungen)
- [x] 3.3 `wishes-card` + `recipe-picker`. Herz in der `library-card`, Wunsch mit Notiz im `recipe-dialog`, Einkaufslisten-Button aktivieren.
- [x] 3.4 Tests: Wünsche (Unique-Regel, `complete`, Sichtbarkeit), Einkauf (mit HA-`local_todo` oder `shopping_list` im Test, Duplikat-Schutz, Skalierung, Zusammenführen), Services, Sensoren

**Fertig wenn:**
- Zwei User wünschen dasselbe Gericht → die Karte zeigt beide Avatare, „Gekocht“ erledigt beide.
- Der Button schreibt skalierte Zutaten in die gewählte todo-Liste (geprüft mit HA-Einkaufsliste und Local To-do), ein zweiter Klick erzeugt keine Duplikate.

**Abweichungen/Notizen Phase 3 (2026-10-24):**
- Prüfpunkt 7 geklärt: `todo.get_items` (mit `status: needs_action`, `return_response`) liefert `{entity_id: {"items": [{summary, uid, status, ...}]}}`; `todo.add_item` nimmt `item` und `description`, aber nur wenn die Entität `SET_DESCRIPTION_ON_ITEM` (64) unterstützt. Die HA-Einkaufsliste (`shopping_list`) unterstützt keine Beschreibung → dort wird sie weggelassen; mit Local To-do o. Ä. wird „für: Rezeptname“ gesetzt.
- `manifest.json`: `todo` zu `dependencies` ergänzt (Services und Import von `homeassistant.components.todo`).
- `dishwish.add_open_wishes_to_shopping_list`: Jedes Gericht mit offenen Wünschen zählt einmal (mit seinen eigenen Portionen), auch wenn mehrere Personen es sich wünschen; gleiche Zutat + Einheit wird addiert.
- Entity-IDs der Sensoren richten sich nach der HA-Sprache (z. B. `sensor.dishwish_offene_wunsche`, `sensor.dishwish_gerichte` bei Deutsch).
- Wünsche werden nach `created_at` und Einfüge-Reihenfolge sortiert (Sekundenauflösung, `rowid` als Tiebreaker).
- Im `recipe-dialog`: Zutaten-Checkboxen, Einkaufslisten-Button (nutzt `shopping_list` der Karte, sonst Integrations-Option), Wunsch mit Notiz. Herz in der `library-card`, `wishes-card` und `recipe-picker` sind da. „Zuletzt gekocht“ (`show_done`) lädt `wishes/list?status=done` nach.
- Nachträglich (Feedback): In der Kartenauswahl von HA (`hui-card-picker`) rendern beide Karten verkürzt (Bibliothek 4 Kacheln, Wünsche 1 Gericht, begrenzte Höhe). Die Wünsche-Karte zeigt je Wunsch "Name · vor 3 Tagen" (+ Notiz) und hat die Option `sort` (`popular` | `oldest` | `newest`). Der Button "Auf Einkaufsliste" ist aus der Wünsche-Karte entfernt, die Einkaufsliste steckt weiterhin im Rezept-Dialog.
- Nachträglich (Feedback 2): Beide Karten haben `rows` (sichtbare Zeilen, 0 = alle; der Rest scrollt, die Bibliothek lädt beim Scrollen weiter). Der Link-Import probiert nacheinander alle Bild-URLs aus JSON-LD, dann `og:image`/`twitter:image`, mit `Referer` und ohne Content-Type-Zwang (Pillow prüft); ein unbrauchbares Bild lässt den Import weiter nicht scheitern. Mit einer echten Seite (lecker.de) getestet; Chefkoch selbst nicht.
- Das Bundle wird jetzt über eine eigene View mit `Cache-Control: no-cache` ausgeliefert statt über `StaticPathConfig` (ein gecachter Seiten-HTML-Stand oder 31 Tage Browser-Cache lieferten sonst alte Versionen aus). Der `?v=`-Parameter bleibt.
- Nicht geprüft: zwei verschiedene echte Benutzer in der Dev-HA (nur per Test), Local To-do, Avatar mit `person`-Bild.
### Phase 4 – Feinschliff & Veröffentlichung
- [x] 4.1 `recipe-card` inkl. Kochmodus
- [x] 4.2 Visuelle Editoren aller Karten vervollständigen, Vorschau im Karten-Picker
- [ ] 4.3 UI-Prüfung: Handy (iOS + Android Companion App), Tablet, Desktop, Dark Mode, 1.000 Testgerichte
- [x] 4.4 README: Installation über HACS, YAML-Beispiele aller Karten inkl. `todo-list`-Karte (Screenshots fehlen noch, siehe Notizen)
- [x] 4.5 GitHub Actions: Backend-Tests + ruff, Frontend-Build/Lint/Tests, `hassfest`, HACS-Validierung. Release-Workflow (Version in `manifest.json` = Tag).
- [ ] 4.6 (optional) Export/Import eigener Gerichte als ZIP (JSON + Bilder)

**Fertig wenn:** Installation über HACS (Custom Repository) in einer frischen HA funktioniert, die Karten sind ohne manuelle Ressource verfügbar, hassfest und HACS-Validierung sind grün.

**Abweichungen/Notizen Phase 4 (2026-10-24):**
- `recipe-card` (`dishwish-recipe-card`) mit Modus `fixed`/`top_wish` und Kochmodus (`dw-cook-mode`: Schritt für Schritt, große Schrift, Zurück/Weiter, Pfeiltasten, `navigator.wakeLock` falls verfügbar, Zutaten einblendbar). Der Rezept-Inhalt steckt jetzt in der gemeinsamen Komponente `dw-recipe-view`, die `recipe-dialog` und `recipe-card` nutzen.
- Karten-Editoren: Bibliothek und Rezept-Karte nutzen `getConfigElement()` mit `ha-form` (`dw-card-editor`, lädt `ha-form` über den Lazy-Load-Trick) damit Kategorien und Gerichte aus `categories/list` bzw. `recipes/list` wählbar sind. Die Wünsche-Karte bleibt bei `getConfigForm()`. Alle drei Karten rendern in der Kartenauswahl verkürzt.
- 4.3 nur teilweise geprüft: programmatisch in der Dev-HA mit 1.000 Gerichten (schnell), Karten ohne horizontales Überlaufen bei 360/768 px Containerbreite. **Offen (manuell):** echte Geräte (iOS/Android Companion App), Dialoge im Vollbild unter 600 px Fenster, Dark Mode und Themes, Kamera. Das Browserfenster ließ sich nicht verkleinern, Screenshots waren nicht möglich.
- 4.4: README ohne Screenshots (keine Möglichkeit, sie hier aufzunehmen). Bitte `docs/screenshots/` nachliefern und in der README einbinden.
- 4.5: `.github/workflows/ci.yml` (Backend: ruff + pytest, Frontend: lint/typecheck/test/build + Prüfung, dass das eingecheckte Bundle zum Quelltext passt, hassfest, HACS-Validierung mit `ignore: brands`) und `release.yml` (Tag `vX.Y.Z` muss `manifest.json` entsprechen, erzeugt Release mit `dishwish.zip`). `hassfest` lokal mit dem offiziellen Image geprüft: 0 ungültige Integrationen. Die Actions selbst sind noch nicht auf GitHub gelaufen. HACS verlangt für die Aufnahme ggf. Marken-Bilder (`brand/icon.png`) und Repo-Beschreibung/Topics.
- 4.6 (optional, ZIP-Export/-Import) nicht umgesetzt.
## 15. Prüfpunkte (zu Beginn der jeweiligen Phase gegen aktuelle Doku/Quellcode prüfen)

1. **Karten-Editor:** Unterstützt die aktuelle HA-Version `static getConfigForm()` für Custom Cards? (Im HA-Frontend-Quellcode nach `getConfigForm` suchen.) Sonst `getConfigElement()` + `ha-form`; dann den Lazy-Load-Trick nutzen, damit `ha-form` geladen ist. *(Phase 2)*
2. **Frontend laden:** aktuelle Signaturen von `frontend.add_extra_js_url`, `http.StaticPathConfig`, `hass.http.async_register_static_paths`. *(Phase 2)*
3. **Pillow** ist in HA Core enthalten → nicht in `requirements` aufnehmen; Import im Container prüfen. *(Phase 1)*
4. **Backup-Plattform:** `async_pre_backup` / `async_post_backup` in `backup.py` (laut Developer-Docs vorhanden, beide müssen definiert sein). *(Phase 1)*
5. **Python-Version:** HA nutzt seit 2026.3 Python 3.14 → Test-Image `python:3.14-slim`; passende Version von `pytest-homeassistant-custom-component` wählen. *(Phase 1)*
6. **Config-Entry-Zugriff:** `entry.runtime_data`, `hass.config_entries.async_loaded_entries(DOMAIN)`. *(Phase 1)*
7. **todo-Services:** Parameter von `todo.add_item` / `todo.get_items` (Antwortformat), `TodoEntityFeature.SET_DESCRIPTION_ON_ITEM`. *(Phase 3)*
8. **`hass.fetchWithAuth`** im Frontend verfügbar. *(Phase 2)*
9. **Kamera-Input** (`capture="environment"`) in der Companion App auf echten Geräten (iOS + Android). *(Phase 2)*
10. **Chefkoch:** liefert JSON-LD mit `@type: Recipe`, akzeptiert den User-Agent. *(Phase 2)*

## 16. Backlog (nicht Teil der Phasen 1–4)

- Community (nur `shareable = 1`): GitHub-Katalog per Pull Request oder zentraler Server
- Wochenplan: `wishes.planned_date` + `calendar`-Entität
- Assist-Intents („Was wünscht sich die Familie?“)
- Zufallsvorschlag, Bewertungen, Kochhistorie („zuletzt gekocht“)
- Einkaufsliste nach Supermarkt-Kategorien sortieren

**Nachträge nach dem ersten Push (2026-10-24):**
- GitHub-CI: HACS-Validierung schlug fehl wegen fehlender Lizenz, Repo-Beschreibung und Topics. `LICENSE` (MIT, Copyright Gloecki2404 – bei Bedarf ändern) ergänzt; Beschreibung und Topics im Repo gesetzt. Die Warnung zu `categories` im Manifest ist nur ein Hinweis (hassfest kennt das Feld noch nicht).
- Logo: `brand/icon*.png` und `brand/logo*.png` sind rund mit weich auslaufendem Rand (transparent), Teller größer. Das Original liegt in `docs/logo.png`. HACS zeigt in seiner Liste Bilder des HA-Brands-Dienstes; lokale Bilder erscheinen erst nach der Installation in Home Assistant bzw. wenn die Marke im `home-assistant/brands`-Repo steht.
- Beispielgerichte: `starter_recipes.json` (20 deutsche/österreichische Klassiker, Deutsch und Englisch, eigene Texte, ohne Fotos). Import über den Button in der leeren Bibliothek, WS `dishwish/recipes/import_starter` und den Service `dishwish.import_starter_recipes`; doppelte Namen werden übersprungen.

**Verbesserungen aus dem Handy-Einsatz (`HA-Dashboard/dishwish-feedback.md`, 2026-10-24):**
1. Vollbild-Dialoge (< 600 px) lassen oben `--dw-dialog-top-offset` frei (Safe-Area, mindestens 24 px); der Fuß berücksichtigt die untere Safe-Area. Im Browser mit einem 390-px-iframe und simulierter Safe-Area 48 px geprüft: Schließen-X sichtbar und anklickbar. Ein Playwright-Test wurde nicht ergänzt (neue Abhängigkeit, braucht Rückfrage).
2. Dialoge und Menüs sind immer deckend (Theme-Farbe über fester Grundfläche).
3. Öffentliche Variablen `--dw-*` und CSS-Parts (`exportparts` bis zur Karte), dokumentiert in der README.
4. Eingabefelder über `--dw-input-*` mit Rückfall auf `--ha-color-form-background`.
5. Sensoren haben feste Entity-IDs (`sensor.dishwish_open_wishes`, `sensor.dishwish_recipes`) in jeder Sprache. Bereits registrierte Entitäten behalten ihre IDs.
6. Leerer Zustand der Rezept-Karte (Modus `top_wish`) mit Hinweis und Button „+ Wunsch“. Nicht umgesetzt: eine Mobil-Vorschau im Karten-Editor (die Vorschaubreite bestimmt Home Assistant).

**Versionierung und Beispielgerichte als Basis (2026-10-24):**
- Versionierung nach SemVer, erste Version `0.1.0` (Tag `v0.1.0`). `CHANGELOG.md`, `dev/bump_version.py`, `tests/test_version.py` (Manifest = `const.VERSION` = `package.json` = Changelog-Eintrag) und `release.yml` (Release-Notizen aus dem Changelog).
- Die 20 Beispielgerichte werden beim ersten Start einer leeren Bibliothek automatisch angelegt (neues Schema v2: Tabelle `meta` mit Flag `starter_seeded`; bestehende Datenbanken werden mit Sicherungskopie migriert, nicht-leere Bibliotheken bleiben unberührt, gelöschte Beispiele kommen nicht zurück). Der Button und der WebSocket-Befehl `recipes/import_starter` sind entfernt; der Service `dishwish.import_starter_recipes` bleibt. Beispielgerichte gehören `created_by = "system"` und sind für alle Benutzer bearbeitbar.
- HACS-Katalog ohne Bild: Home Assistant liefert lokale `brand/`-Bilder erst für **installierte** Integrationen (`/api/brands/integration/dishwish/icon.png`, in der Dev-HA geprüft). Der Katalog nicht installierter Repos nutzt das CDN von `home-assistant/brands`; dafür müsste das Logo dort eingereicht werden (Ordner `custom_integrations` ist laut README ein Altbestand).