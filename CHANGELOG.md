# Changelog

All notable changes are listed here. The project follows [Semantic Versioning](https://semver.org/):
`MAJOR.MINOR.PATCH`. Versions below 1.0 may still change the data format or card options between minor
versions; every database upgrade makes a backup copy first.

## [Unreleased]

## [0.2.0] - 2026-10-24

### Added
- Photos for all 20 starter dishes (Wikimedia Commons, CC0/CC BY/CC BY-SA, credits in `starter_images/ATTRIBUTION.md`).
  Starter dishes that earlier versions created without a photo get theirs once after the update.
- Optional link button on the meal wishes card, left of "+ Wish": freely configurable label, icon and
  action (navigate to a page or dashboard, open an entity, URL, ...); hidden unless `show_link_button` is on.

### Changed
- Starter dishes are added automatically on the first start of an empty library (no button needed).
- Fullscreen dialogs respect the phone safe areas, dialogs are always opaque, `--dw-*` theming variables
  and CSS parts, input colours, fixed sensor entity IDs, empty state of the recipe card.

## [0.1.0] - 2026-10-24

First release.

### Added
- Recipe library with photos (camera or upload), categories, search and filters; fast with 1,000+ dishes.
- Recipe view with servings scaling, step-by-step cook mode and notes.
- Import from a link (schema.org recipe data) including the photo.
- Meal wishes per Home Assistant user with notes; "cooked" completes them.
- Shopping list: scaled ingredients into any `todo` list with duplicate protection, plus the services
  `dishwish.add_to_shopping_list` and `dishwish.add_open_wishes_to_shopping_list`.
- Sensors for open wishes and number of dishes; events `dishwish_wish_added` and `dishwish_wishes_completed`.
- Cards `dishwish-library-card`, `dishwish-wishes-card` and `dishwish-recipe-card` with visual editors.
- 20 German and Austrian starter dishes (German and English) added on the first start of an empty library;
  service `dishwish.import_starter_recipes` adds missing ones later.
- English and German user interface; theming through `--dw-*` CSS variables and CSS parts.
- Brand images, HACS support, GitHub Actions (tests, hassfest, HACS validation, release).