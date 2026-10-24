"""Create N synthetic recipes with generated images in the dev data directory.

Usage: docker compose -f dev/docker-compose.yml run --rm test python dev/seed.py --count 500
"""

from __future__ import annotations

import argparse
import random
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from custom_components.dishwish import db, images  # noqa: E402
from custom_components.dishwish.ingredients import parse_line  # noqa: E402

ADJECTIVES = ["Cremige", "Knusprige", "Scharfe", "Herzhafte", "Leichte", "Würzige", "Gebackene"]
DISHES = ["Nudeln", "Suppe", "Auflauf", "Salat", "Pfanne", "Eintopf", "Curry", "Kuchen", "Burger"]
EXTRAS = ["mit Käse", "mit Gemüse", "nach Omas Art", "mit Kräutern", "à la Chef", "vom Blech"]
INGREDIENTS = [
    "200 g Mehl",
    "2 Eier",
    "1 Zwiebel, fein gewürfelt",
    "3 Zehen Knoblauch",
    "250 ml Sahne",
    "1 EL Olivenöl",
    "1 Prise Salz",
    "500 g Hackfleisch",
    "1 Dose Tomaten (400 g)",
    "100 g Parmesan",
    "2 Karotten",
    "1 Bund Petersilie",
    "1 TL Paprikapulver",
    "300 g Nudeln",
]
STEPS = [
    "Zutaten vorbereiten und alles abwiegen.",
    "Zwiebel und Knoblauch in Öl glasig anbraten.",
    "Die restlichen Zutaten hinzufügen und 10 Minuten köcheln lassen.",
    "Mit Salz und Pfeffer abschmecken.",
    "Auf Tellern anrichten und sofort servieren.",
]


def make_image(rng: random.Random, text: str) -> bytes:
    """Colored 4:3 area with the recipe name."""
    color = tuple(rng.randint(60, 200) for _ in range(3))
    img = Image.new("RGB", (1200, 900), color)
    ImageDraw.Draw(img).text((60, 420), text, fill=(255, 255, 255))
    out = BytesIO()
    img.save(out, "JPEG", quality=80)
    return out.getvalue()


def main() -> None:
    """Seed the database."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=100)
    parser.add_argument("--data-dir", type=Path, default=ROOT / "dev" / "config" / "dishwish")
    args = parser.parse_args()

    args.data_dir.mkdir(parents=True, exist_ok=True)
    images_dir = args.data_dir / "images"
    conn = db.open_db(args.data_dir / "dishwish.db", "de")
    categories = [c["id"] for c in db.list_categories(conn)]
    rng = random.Random(42)

    for i in range(args.count):
        name = f"{rng.choice(ADJECTIVES)} {rng.choice(DISHES)} {rng.choice(EXTRAS)} #{i + 1}"
        image_id = db.new_id()
        images.save_image(images_dir, image_id, make_image(rng, name))
        db.insert_upload(conn, image_id, "seed")
        data = {
            "name": name,
            "description": "Testgericht aus dev/seed.py",
            "servings": rng.choice([2, 4, 4, 6]),
            "prep_minutes": rng.choice([10, 15, 20, 30]),
            "cook_minutes": rng.choice([0, 15, 30, 45, 60]),
            "category_ids": rng.sample(categories, rng.randint(1, 3)),
            "image_ids": [image_id],
            "ingredients": [
                parse_line(line) for line in rng.sample(INGREDIENTS, rng.randint(4, 9))
            ],
            "steps": [{"text": s} for s in STEPS[: rng.randint(3, 5)]],
        }
        db.create_recipe(conn, data, "seed")
    print(f"Created {args.count} recipes in {args.data_dir}")


if __name__ == "__main__":
    main()
