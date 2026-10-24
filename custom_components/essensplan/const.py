"""Constants for Essensplan."""

from __future__ import annotations

DOMAIN = "essensplan"
VERSION = "0.1.0"

DATA_DIR_NAME = "essensplan"
DB_FILE_NAME = "essensplan.db"
IMAGES_DIR_NAME = "images"
SCHEMA_VERSION = 1

SIGNAL_CHANGED = "essensplan_changed"

CONF_DEFAULT_SHOPPING_LIST = "default_shopping_list"
CONF_DEFAULT_SERVINGS = "default_servings"
DEFAULT_SERVINGS = 4

# Input limits
MAX_NAME = 200
MAX_DESCRIPTION = 2000
MAX_NOTES = 10000
MAX_SERVINGS = 100
MAX_MINUTES = 1440
MAX_INGREDIENTS = 100
MAX_STEPS = 100
MAX_STEP_TEXT = 5000
MAX_IMAGES = 10
MAX_PARSE_LINES = 100

# Images
MAX_UPLOAD_BYTES = 15 * 1024 * 1024
FULL_MAX_SIDE = 1600
FULL_QUALITY = 82
THUMB_SIZE = (480, 360)
THUMB_QUALITY = 78
ORPHAN_ROW_MAX_AGE_H = 24
ORPHAN_FILE_MAX_AGE_H = 1
CLEANUP_INTERVAL_H = 24

# Seed categories: (key, name de, name en, icon)
SEED_CATEGORIES: list[tuple[str, str, str, str]] = [
    ("meat", "Fleisch", "Meat", "mdi:food-steak"),
    ("poultry", "Geflügel", "Poultry", "mdi:food-drumstick"),
    ("fish", "Fisch", "Fish", "mdi:fish"),
    ("vegetarian", "Vegetarisch", "Vegetarian", "mdi:food-apple"),
    ("vegan", "Vegan", "Vegan", "mdi:sprout"),
    ("pasta", "Pasta", "Pasta", "mdi:pasta"),
    ("soup", "Suppe & Eintopf", "Soup & Stew", "mdi:pot-steam"),
    ("salad", "Salat", "Salad", "mdi:leaf"),
    ("casserole", "Auflauf", "Casserole", "mdi:baguette"),
    ("side", "Beilage", "Side dish", "mdi:rice"),
    ("breakfast", "Frühstück", "Breakfast", "mdi:egg-fried"),
    ("dessert", "Dessert", "Dessert", "mdi:cake-variant"),
    ("baking", "Backen", "Baking", "mdi:bread-slice"),
]

# Canonical unit -> accepted spellings (lowercase, without trailing dot).
UNIT_ALIASES: dict[str, tuple[str, ...]] = {
    "g": ("g", "gr", "gramm", "gram", "grams"),
    "kg": ("kg", "kilo", "kilogramm", "kilogram"),
    "mg": ("mg", "milligramm"),
    "ml": ("ml", "milliliter", "millilitre"),
    "cl": ("cl", "zentiliter"),
    "dl": ("dl", "deziliter"),
    "l": ("l", "liter", "litre", "ltr"),
    "EL": ("el", "esslöffel", "essloeffel", "eßlöffel"),
    "TL": ("tl", "teelöffel", "teeloeffel"),
    "Msp.": ("msp", "messerspitze", "messerspitzen"),
    "Prise": ("prise", "prisen"),
    "Pck.": ("pck", "pckg", "päckchen", "paeckchen", "packung", "packungen", "pkg", "pkt", "pk"),
    "Dose": ("dose", "dosen"),
    "Glas": ("glas", "gläser", "glaeser"),
    "Becher": ("becher",),
    "Bund": ("bund", "bündel"),
    "Stk.": ("stk", "stück", "stueck", "stücke", "stuecke"),
    "Zehe": ("zehe", "zehen"),
    "Scheibe": ("scheibe", "scheiben"),
    "Tasse": ("tasse", "tassen"),
    "Würfel": ("würfel", "wuerfel"),
    "Zweig": ("zweig", "zweige"),
    "Blatt": ("blatt", "blätter", "blaetter"),
    "Handvoll": ("handvoll",),
    "Tropfen": ("tropfen",),
    "cup": ("cup", "cups"),
    "tbsp": ("tbsp", "tablespoon", "tablespoons", "tbs"),
    "tsp": ("tsp", "teaspoon", "teaspoons"),
    "oz": ("oz", "ounce", "ounces"),
    "lb": ("lb", "lbs", "pound", "pounds"),
    "pinch": ("pinch", "pinches"),
    "clove": ("clove", "cloves"),
    "can": ("can", "cans"),
}
UNIT_LOOKUP: dict[str, str] = {
    alias: canon for canon, aliases in UNIT_ALIASES.items() for alias in aliases
}
