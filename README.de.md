# DishWish

[English](README.md) · **Deutsch**

Rezepte, Essenswünsche und Einkaufsliste für Home Assistant – ohne externen Dienst, mit Fotos, Link-Import und fertigen Lovelace-Karten.
*Recipes, meal wishes and a shopping list for Home Assistant, with photos, link import and ready-made dashboard cards.*

- **Bibliothek** eigener Gerichte mit Fotos, Kategorien, Suche und Filtern – flüssig auch mit 1.000+ Gerichten.
- **Rezept & Kochmodus:** Zutaten (auf Portionen umrechenbar), Schritte, Notizen; Schritt-für-Schritt-Ansicht mit großer Schrift, die den Bildschirm wach hält.
- **Neue Gerichte** per Handykamera oder Foto-Upload, oder **per Link** (schema.org-Rezeptseiten): Link einfügen, Entwurf prüfen, speichern.
- **Essenswünsche** pro Home-Assistant-Benutzer (mit Notiz). „Gekocht“ erledigt alle Wünsche eines Gerichts.
- **Einkaufsliste:** Zutaten (umgerechnet) landen in einer beliebigen `todo`-Liste (HA-Einkaufsliste, Local To-do, Bring!, Todoist …). Schon vorhandene Einträge werden übersprungen.
- Daten liegen in einer eigenen SQLite-Datei unter `/config/dishwish/` und sind Teil deiner HA-Backups.

## Installation

### Über HACS (empfohlen)

1. HACS → ⋮ → **Benutzerdefinierte Repositories** → `https://github.com/Gloecki2404/DishWish`, Kategorie **Integration**.
2. **DishWish** herunterladen und Home Assistant neu starten.
3. **Einstellungen → Geräte & Dienste → Integration hinzufügen → DishWish**.

Die Karten werden von der Integration automatisch geladen. Eine manuelle Dashboard-Ressource ist nicht nötig.

### Manuell

Den Ordner `custom_components/dishwish` nach `/config/custom_components/dishwish` kopieren und Home Assistant neu starten.

Nach einem Update einmal den Browser hart neu laden (Strg+Shift+R), falls die Karten alt aussehen.

## Einrichtung

Die Integration hat zwei Optionen (**Einstellungen → Geräte & Dienste → DishWish → Konfigurieren**):

| Option | Bedeutung |
|---|---|
| Standard-Einkaufsliste | `todo`-Entität, in die Zutaten geschrieben werden, wenn eine Karte keine eigene Liste hat |
| Standard-Portionen | Portionen für importierte Rezepte ohne Mengenangabe |

Rechte: Alle angemeldeten Benutzer sehen die Gerichte des Haushalts und ihre eigenen „Nur für mich“-Gerichte. Bearbeiten und Löschen dürfen der Ersteller und Administratoren. Kategorien bearbeiten oder löschen dürfen nur Administratoren.

## Karten

Alle Karten haben einen visuellen Editor und erscheinen in der Kartenauswahl unter „Benutzerdefiniert“.

### Bibliothek

```yaml
type: custom:dishwish-library-card
title: Gerichte
columns: auto          # auto oder 2–6
rows: 3                # sichtbare Zeilen, der Rest scrollt; 0 = alle
categories: []         # nur diese Kategorie-IDs als Filter (leer = alle)
default_category: ""   # Kategorie-ID, die beim Öffnen aktiv ist
show_search: true
show_add: true
show_import: true
sort: name             # name | newest | popular
shopping_list: todo.einkaufsliste
```

### Essenswünsche

```yaml
type: custom:dishwish-wishes-card
title: Essenswünsche
layout: list           # list | grid
sort: popular          # popular | oldest | newest
rows: 0                # sichtbare Zeilen, der Rest scrollt; 0 = alle
show_done: 3           # zuletzt gekochte Gerichte anzeigen (0 = aus)
shopping_list: todo.einkaufsliste
```

### Rezept und Kochmodus

```yaml
type: custom:dishwish-recipe-card
mode: top_wish         # top_wish = meistgewünschtes Gericht | fixed = festes Gericht
# recipe_id: 0123456789abcdef0123456789abcdef   (nur bei mode: fixed; im Editor auswählbar)
show_ingredients: true
show_steps: true
shopping_list: todo.einkaufsliste
```

### Einkaufsliste anzeigen

DishWish bringt keine eigene Listenkarte mit, sondern nutzt die Standardkarte von Home Assistant:

```yaml
type: todo-list
entity: todo.einkaufsliste
```

## Services

| Service | Wirkung |
|---|---|
| `dishwish.add_to_shopping_list` | `recipe_id`, optional `servings` und `entity_id`: schreibt die umgerechneten Zutaten eines Gerichts in die Liste. Antwort: `added` und `skipped`. |
| `dishwish.add_open_wishes_to_shopping_list` | optional `entity_id`: fasst die Zutaten aller Gerichte mit offenen Wünschen zusammen (gleiche Zutat und Einheit werden addiert). Jedes Gericht zählt einmal. |

Ohne `entity_id` wird die Standard-Einkaufsliste aus den Optionen verwendet.

## Entitäten und Ereignisse

- `sensor.dishwish_open_wishes` (Anzahl offener Wünsche, Attribut `wishes` mit bis zu 20 Gerichten) und `sensor.dishwish_recipes` (Anzahl Gerichte). Die Entity-IDs folgen der Sprache von Home Assistant, in einer deutschen Installation z. B. `sensor.dishwish_offene_wunsche`.
- Ereignis `dishwish_wish_added`: `recipe_id`, `recipe_name`, `user_id`, `user_name`, `note`
- Ereignis `dishwish_wishes_completed`: `recipe_id`, `recipe_name`, `count`

Beispiel: Nachricht, wenn jemand etwas wünscht.

```yaml
automation:
  - alias: Neuer Essenswunsch
    triggers:
      - trigger: event
        event_type: dishwish_wish_added
    actions:
      - action: notify.notify
        data:
          message: "{{ trigger.event.data.user_name }} wünscht sich {{ trigger.event.data.recipe_name }}"
```

## Link-Import

Der Import liest die schema.org-Rezeptdaten (JSON-LD) einer Seite: Name, Beschreibung, Portionen, Zeiten, Zutaten, Schritte, Kategorien und das Foto. Importierte Rezepte merken sich die Quelle und gelten als nicht teilbar. Seiten ohne solche Daten (oder mit Bot-Schutz) lassen sich nicht importieren. Aus Sicherheitsgründen werden Adressen im lokalen Netz abgelehnt.

## Datenschutz

- Fotos werden im Browser verkleinert, auf dem Server neu kodiert und von GPS/EXIF-Daten befreit.
- Bilder werden ohne Anmeldung ausgeliefert, aber nur über eine zufällige 32-stellige ID, die ausschließlich die angemeldete API herausgibt (wie bei den Bildern von Home Assistant selbst).

## Entwicklung

```powershell
docker compose -f dev/docker-compose.yml up -d homeassistant          # Dev-HA auf http://localhost:8123
docker compose -f dev/docker-compose.yml run --rm test pytest         # Backend-Tests
docker compose -f dev/docker-compose.yml run --rm test ruff check .   # Lint
npm --prefix frontend ci
npm --prefix frontend run build                                       # baut custom_components/dishwish/www/dishwish-cards.js
npm --prefix frontend run lint; npm --prefix frontend run typecheck; npm --prefix frontend test
docker compose -f dev/docker-compose.yml run --rm test python dev/seed.py --count 500   # Testdaten
```

Das gebaute Bundle wird mit eingecheckt (HACS). Der CI-Lauf prüft, dass es zum Quelltext passt. Details und Entscheidungen: [PLAN.md](PLAN.md).
