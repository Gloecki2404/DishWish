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

Permissions: every signed-in user sees the household's dishes and their own "only me" dishes. The creator and administrators can edit and delete a dish. Only administrators can rename or delete categories.

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

## Services

| Service | Effect |
|---|---|
| `dishwish.add_to_shopping_list` | `recipe_id`, optional `servings` and `entity_id`: adds the scaled ingredients of one dish to the list. The response contains `added` and `skipped`. |
| `dishwish.import_starter_recipes` | optional `language` (`de`/`en`): adds the 20 starter dishes. The response contains `created` and `skipped`. |
| `dishwish.add_open_wishes_to_shopping_list` | optional `entity_id`: merges the ingredients of all dishes with open wishes (equal ingredient and unit are added up). Each dish counts once. |

Without `entity_id` the default shopping list from the options is used.

## Entities and events

- `sensor.dishwish_open_wishes` (number of open wishes, attribute `wishes` with up to 20 dishes) and `sensor.dishwish_recipes` (number of dishes). Entity IDs follow your Home Assistant language, for example `sensor.dishwish_offene_wunsche` on a German system.
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

An empty library offers **Add 20 starter dishes**: classic German and Austrian dishes (Wiener Schnitzel, Tafelspitz, Kaiserschmarrn, Apfelstrudel, Rindsgulasch, Käsespätzle, Rinderrouladen, Currywurst, Flammkuchen, ...) with ingredients, steps and categories, in the language of your Home Assistant. The recipes are written for this project and come without photos. You can also run the service `dishwish.import_starter_recipes` (optional `language`: `de` or `en`); dishes that already exist by name are skipped.

## Link import

The import reads the schema.org recipe data (JSON-LD) of a page: name, description, servings, times, ingredients, steps, categories and the photo. Imported recipes remember their source and are marked as not shareable. Pages without such data, or with bot protection, cannot be imported. For security reasons, addresses in your local network are rejected.

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
