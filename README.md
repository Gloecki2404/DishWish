# DishWish

**English** · [Deutsch](README.de.md)

Recipes, meal wishes and a shopping list for Home Assistant. No external service, with photos, link import and ready-made dashboard cards.

- **Library** of your own dishes with photos, categories, search and filters. Stays fast with 1,000+ dishes.
- **Recipe and cook mode:** ingredients (scalable to any number of servings), steps and notes. The cook mode shows one step at a time in large type and keeps the screen awake.
- **Add dishes** with the phone camera or a photo upload, or **from a link** (pages with schema.org recipe data): paste the link, review the draft, save.
- **Meal wishes** per Home Assistant user, with an optional note. "Cooked" completes all wishes for a dish.
- **Shopping list:** the (scaled) ingredients go into any `todo` list (Home Assistant Shopping List, Local To-do, Bring!, Todoist, ...). Items that are already on the list are skipped.
- Data lives in its own SQLite file under `/config/dishwish/` and is part of your Home Assistant backups.
- The whole integration (setup, entities, services, cards) is available in **English and German** and follows the language of your Home Assistant user.

## Installation

### With HACS (recommended)

1. HACS → ⋮ → **Custom repositories** → add `https://github.com/Gloecki2404/DishWish` with category **Integration**.
2. Download **DishWish** and restart Home Assistant.
3. **Settings → Devices & services → Add integration → DishWish**.

The integration loads its dashboard cards automatically. You do not need to add a dashboard resource.

### Manually

Copy the folder `custom_components/dishwish` to `/config/custom_components/dishwish` and restart Home Assistant.

After an update, reload the browser once with a hard refresh (Ctrl+Shift+R) if the cards look outdated.

## Setup

The integration has two options (**Settings → Devices & services → DishWish → Configure**):

| Option | Meaning |
|---|---|
| Default shopping list | `todo` entity that ingredients are added to when a card has no list of its own |
| Default servings | Servings for imported recipes that do not state a yield |
| AI task for photo import | `ai_task` entity that reads recipe photos (optional, see "Recipe from a photo") |

Permissions: every signed-in user sees the household's dishes and their own "only me" dishes. Only the creator of a dish and administrators can edit or delete it; the starter dishes and dishes added by other people are read-only for everybody else. **Everyone can add a note** to any dish (it is appended with name and date and cannot be edited by others). Only administrators can rename or delete categories.

## Cards

All cards have a visual editor and appear in the card picker under custom cards.

### Library

```yaml
type: custom:dishwish-library-card
title: Dishes
columns: auto          # auto or 2-6
rows: 3                # visible rows, the rest scrolls; 0 = all
categories: []         # only offer these category IDs as filters (empty = all)
default_category: ""   # category ID that is active when the card opens
show_search: true
show_add: true
show_import: true
sort: name             # name | newest | popular
shopping_list: todo.shopping_list
```

### Meal wishes

```yaml
type: custom:dishwish-wishes-card
title: Meal wishes
layout: list           # list | grid
sort: popular          # popular | oldest | newest
rows: 0                # visible rows, the rest scrolls; 0 = all
show_done: 3           # number of recently cooked dishes to show (0 = off)
shopping_list: todo.shopping_list
show_link_button: true # optional extra button, left of "+ Wish" (off by default)
link_label: Shopping
link_icon: mdi:cart
link_action:           # any Home Assistant action: navigate, url, more-info, perform-action, ...
  action: navigate
  navigation_path: /lovelace/shopping
```

### Recipe and cook mode

```yaml
type: custom:dishwish-recipe-card
mode: top_wish         # top_wish = the most wished dish | fixed = one chosen dish
# recipe_id: 0123456789abcdef0123456789abcdef   (only with mode: fixed; pick it in the editor)
show_ingredients: true
show_steps: true
shopping_list: todo.shopping_list
```

### Showing the shopping list

DishWish does not ship its own list card. Use the standard Home Assistant card:

```yaml
type: todo-list
entity: todo.shopping_list
```

## Theming

The cards use your theme's CSS variables. These optional variables override single aspects (for example with card-mod or in a theme):

| Variable | Default | Effect |
|---|---|---|
| `--dw-accent` | `--primary-color` | accent colour (buttons, chips, progress) |
| `--dw-card-background` | `--ha-card-background` | card background |
| `--dw-card-radius` | `--ha-card-border-radius` | card corner radius |
| `--dw-tile-radius` | `10px` | dish tiles and wish entries |
| `--dw-dialog-background` | `--ha-dialog-surface-background`, then `--card-background-color` | dialog and menu background. It is always drawn on a solid base, so translucent card colours never make a dialog see-through. |
| `--dw-dialog-radius` | `--ha-card-border-radius` | dialog corner radius |
| `--dw-dialog-top-offset` | safe area at the top, at least `24px` | free space above full-screen dialogs on phones |
| `--dw-input-background`, `--dw-input-text`, `--dw-input-border` | form colours of your theme | input fields |

Full-screen dialogs on phones respect the safe areas (status bar, notch, gesture bar). The dialogs expose the CSS parts `dialog`, `header`, `title`, `close-button`, `body` and `footer` through the card, for example `dishwish-library-card::part(close-button)`.

## Services

| Service | Effect |
|---|---|
| `dishwish.add_to_shopping_list` | `recipe_id`, optional `servings` and `entity_id`: adds the scaled ingredients of one dish to the list. The response contains `added` and `skipped`. |
| `dishwish.import_starter_recipes` | optional `language` (`de`/`en`): adds the 20 starter dishes. The response contains `created` and `skipped`. |
| `dishwish.add_open_wishes_to_shopping_list` | optional `entity_id`: merges the ingredients of all dishes with open wishes (equal ingredient and unit are added up). Each dish counts once. |

Without `entity_id` the default shopping list from the options is used.

## Entities and events

- `sensor.dishwish_open_wishes` (number of open wishes, attribute `wishes` with up to 20 dishes) and `sensor.dishwish_recipes` (number of dishes). The entity IDs are the same in every language (only the display name is translated). Installations that were set up earlier keep the IDs they already have, for example `sensor.dishwish_offene_wunsche`; you can rename them under the entity settings.
- Event `dishwish_wish_added`: `recipe_id`, `recipe_name`, `user_id`, `user_name`, `note`
- Event `dishwish_wishes_completed`: `recipe_id`, `recipe_name`, `count`

Example: send a message when someone adds a wish.

```yaml
automation:
  - alias: New meal wish
    triggers:
      - trigger: event
        event_type: dishwish_wish_added
    actions:
      - action: notify.notify
        data:
          message: "{{ trigger.event.data.user_name }} wishes for {{ trigger.event.data.recipe_name }}"
```

## Starter dishes

A new, empty library starts with 20 classic German and Austrian dishes (Wiener Schnitzel, Tafelspitz, Kaiserschmarrn, Apfelstrudel, Rindsgulasch, Käsespätzle, Rinderrouladen, Currywurst, Flammkuchen, ...) with ingredients, steps and categories, in the language of your Home Assistant. They are added once, on the first start. A library that already contains dishes is left alone, and deleting a starter dish keeps it deleted. The recipes are written for this project; every dish comes with a photo from Wikimedia Commons (see [photo credits](custom_components/dishwish/starter_images/ATTRIBUTION.md)). Everyone in the household may edit or delete them.

The service `dishwish.import_starter_recipes` (optional `language`: `de` or `en`) adds missing starter dishes later; dishes that already exist by name are skipped.

## Link import

The import reads the schema.org recipe data (JSON-LD) of a page: name, description, servings, times, ingredients, steps, categories and the photo. Categories named by the page are offered as new categories in the editor (you can switch them off); categories that already exist are selected automatically. Pages without schema.org data are supported for a few known layouts (for example gusto.at), and amounts that only appear in the page's ingredient list are picked up too. Imported recipes remember their source and are marked as not shareable. Pages without such data, or with bot protection, cannot be imported. For security reasons, addresses in your local network are rejected.

## Recipe from a photo

In the import dialog you can photograph a cookbook or magazine page (up to 4 photos for one recipe). DishWish hands the photos to a **Home Assistant AI task**, which reads the recipe and returns a draft that you review and save, just like a link import.

- Set up any Home Assistant integration that offers an AI task with image support: Google Generative AI (Gemini), Anthropic, OpenAI, Ollama (with a vision model), OpenRouter or Home Assistant Cloud. Groq and other providers only work if their integration provides an `ai_task` entity.
- **Settings → Devices & services → DishWish → Configure → "AI task for photo import"** selects the entity. Leave it empty to use the default AI task of Home Assistant (Settings → System → AI tasks).
- The photos are sent to that AI service and are **not kept** by DishWish. Temporary copies are written to the `dishwish_tmp` folder of your Home Assistant media directory for the duration of the call; a media directory must exist (it does on Home Assistant OS and by default).
- AI can misread amounts or steps, so the result is always shown as a draft first. A recipe from a photo is marked as not shareable.

## Privacy

- Photos are downscaled in the browser, re-encoded on the server and stripped of GPS/EXIF data.
- Images are delivered without sign-in, but only through a random 32-character ID that only the authenticated API hands out (the same approach as Home Assistant's own image uploads).

## Development

```powershell
docker compose -f dev/docker-compose.yml up -d homeassistant          # dev Home Assistant on http://localhost:8123
docker compose -f dev/docker-compose.yml run --rm test pytest         # backend tests
docker compose -f dev/docker-compose.yml run --rm test ruff check .   # lint
npm --prefix frontend ci
npm --prefix frontend run build                                       # builds custom_components/dishwish/www/dishwish-cards.js
npm --prefix frontend run lint; npm --prefix frontend run typecheck; npm --prefix frontend test
docker compose -f dev/docker-compose.yml run --rm test python dev/seed.py --count 500   # test data
```

The built bundle is committed (HACS needs it) and CI checks that it matches the source. Design decisions and status: [PLAN.md](PLAN.md) (German).

## Versions and releases

DishWish uses [semantic versioning](https://semver.org/) (`0.1.0`, `0.2.0`, ...), see [CHANGELOG.md](CHANGELOG.md). The version lives in `manifest.json`, `const.py` and `frontend/package.json`; a test keeps them identical. To release:

1. `python dev/bump_version.py 0.2.0`
2. Move the notes from `[Unreleased]` to a new `## [0.2.0] - date` section in `CHANGELOG.md`.
3. `npm --prefix frontend run build`, commit and push.
4. `git tag v0.2.0` and `git push origin v0.2.0`. The release workflow checks that the tag matches the manifest, takes the release notes from the changelog and publishes the GitHub release.

HACS offers the newest release for installation.
