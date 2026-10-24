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

Rechte: Alle angemeldeten Benutzer sehen die Gerichte des Haushalts und ihre eigenen „Nur für mich“-Gerichte. Bearbeiten und Löschen dürfen nur der Ersteller eines Gerichts und Administratoren; Beispielgerichte und Gerichte anderer sind für alle anderen schreibgeschützt. **Notizen dürfen alle hinzufügen** (sie werden mit Name und Datum angehängt und können von anderen nicht geändert werden). Kategorien bearbeiten oder löschen dürfen nur Administratoren.

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
show_link_button: true # optionaler Zusatz-Button links von "+ Wunsch" (standardmäßig aus)
link_label: Einkauf
link_icon: mdi:cart
link_action:           # jede Home-Assistant-Aktion: navigate, url, more-info, perform-action, ...
  action: navigate
  navigation_path: /lovelace/einkauf
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

## Theming

Die Karten nutzen die CSS-Variablen deines Themes. Diese optionalen Variablen überschreiben einzelne Dinge (z. B. mit card-mod oder in einem Theme):

| Variable | Standard | Wirkung |
|---|---|---|
| `--dw-accent` | `--primary-color` | Akzentfarbe (Buttons, Chips, Fortschritt) |
| `--dw-card-background` | `--ha-card-background` | Kartenhintergrund |
| `--dw-card-radius` | `--ha-card-border-radius` | Eckenradius der Karte |
| `--dw-tile-radius` | `10px` | Gericht-Kacheln und Wunsch-Einträge |
| `--dw-dialog-background` | `--ha-dialog-surface-background`, sonst `--card-background-color` | Hintergrund von Dialogen und Menüs. Er wird immer auf einer deckenden Fläche gezeichnet, halbtransparente Kartenfarben machen Dialoge also nie durchsichtig. |
| `--dw-dialog-radius` | `--ha-card-border-radius` | Eckenradius der Dialoge |
| `--dw-dialog-top-offset` | Safe-Area oben, mindestens `24px` | Abstand über Vollbild-Dialogen am Handy |
| `--dw-input-background`, `--dw-input-text`, `--dw-input-border` | Formularfarben deines Themes | Eingabefelder |

Vollbild-Dialoge am Handy berücksichtigen die Safe-Areas (Statusleiste, Notch, Gestenleiste). Die Dialoge geben die CSS-Parts `dialog`, `header`, `title`, `close-button`, `body` und `footer` über die Karte weiter, z. B. `dishwish-library-card::part(close-button)`.

## Services

| Service | Wirkung |
|---|---|
| `dishwish.add_to_shopping_list` | `recipe_id`, optional `servings` und `entity_id`: schreibt die umgerechneten Zutaten eines Gerichts in die Liste. Antwort: `added` und `skipped`. |
| `dishwish.import_starter_recipes` | optional `language` (`de`/`en`): fügt die 20 Beispielgerichte hinzu. Antwort: `created` und `skipped`. |
| `dishwish.add_open_wishes_to_shopping_list` | optional `entity_id`: fasst die Zutaten aller Gerichte mit offenen Wünschen zusammen (gleiche Zutat und Einheit werden addiert). Jedes Gericht zählt einmal. |

Ohne `entity_id` wird die Standard-Einkaufsliste aus den Optionen verwendet.

## Entitäten und Ereignisse

- `sensor.dishwish_open_wishes` (Anzahl offener Wünsche, Attribut `wishes` mit bis zu 20 Gerichten) und `sensor.dishwish_recipes` (Anzahl Gerichte). Die Entity-IDs sind in jeder Sprache gleich (nur der Anzeigename wird übersetzt). Früher eingerichtete Installationen behalten ihre bisherigen IDs, z. B. `sensor.dishwish_offene_wunsche`; du kannst sie in den Entitäts-Einstellungen umbenennen.
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

## Beispielgerichte

Eine neue, leere Bibliothek startet mit 20 deutschen und österreichischen Klassikern (Wiener Schnitzel, Tafelspitz, Kaiserschmarrn, Apfelstrudel, Rindsgulasch, Käsespätzle, Rinderrouladen, Currywurst, Flammkuchen, ...) mit Zutaten, Schritten und Kategorien, in der Sprache deiner Home-Assistant-Installation. Sie werden einmalig beim ersten Start angelegt. Eine Bibliothek, in der schon Gerichte liegen, bleibt unberührt, und ein gelöschtes Beispielgericht bleibt gelöscht. Die Rezepte sind für dieses Projekt geschrieben; zu jedem Gericht gehört ein Foto von Wikimedia Commons (siehe [Bildnachweise](custom_components/dishwish/starter_images/ATTRIBUTION.md)). Alle im Haushalt dürfen sie bearbeiten oder löschen.

Der Service `dishwish.import_starter_recipes` (optional `language`: `de` oder `en`) ergänzt fehlende Beispielgerichte später; Gerichte, die es dem Namen nach schon gibt, werden übersprungen.

## Link-Import

Der Import liest die schema.org-Rezeptdaten (JSON-LD) einer Seite: Name, Beschreibung, Portionen, Zeiten, Zutaten, Schritte, Kategorien und das Foto. Kategorien, die die Seite nennt, werden im Editor als neue Kategorien vorgeschlagen (abwählbar); vorhandene Kategorien werden automatisch gewählt. Seiten ohne schema.org-Daten werden für einige bekannte Aufbauten unterstützt (z. B. gusto.at), und Mengen, die nur in der Zutatenliste der Seite stehen, werden mit übernommen. Importierte Rezepte merken sich die Quelle und gelten als nicht teilbar. Seiten ohne solche Daten (oder mit Bot-Schutz) lassen sich nicht importieren. Aus Sicherheitsgründen werden Adressen im lokalen Netz abgelehnt.

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

## Versionen und Releases

DishWish nutzt [semantische Versionierung](https://semver.org/lang/de/) (`0.1.0`, `0.2.0`, ...), siehe [CHANGELOG.md](CHANGELOG.md). Die Version steht in `manifest.json`, `const.py` und `frontend/package.json`; ein Test hält sie gleich. So veröffentlichst du:

1. `python dev/bump_version.py 0.2.0`
2. Die Notizen aus `[Unreleased]` im `CHANGELOG.md` in einen neuen Abschnitt `## [0.2.0] - Datum` verschieben.
3. `npm --prefix frontend run build`, committen und pushen.
4. `git tag v0.2.0` und `git push origin v0.2.0`. Der Release-Workflow prüft, ob der Tag zur `manifest.json` passt, nimmt die Release-Notizen aus dem Changelog und veröffentlicht das GitHub-Release.

HACS bietet das neueste Release zur Installation an.
