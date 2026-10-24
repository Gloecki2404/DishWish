// Must match custom_components/dishwish/ingredients.py (shared fixture: tests/fixtures/ingredient_cases.json).
import type { Ingredient } from "../types";

const roundHalfUp = (v: number): number => Math.floor(v + 0.5);

export function scaleQuantity(value: number, recipeServings: number, targetServings: number): number {
  return (value * targetServings) / recipeServings;
}

function decimal(value: number, lang: string): string {
  const rounded = roundHalfUp(value * 100) / 100;
  const text = rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return lang.startsWith("de") ? text.replace(".", ",") : text;
}

function quarter(value: number): string {
  if (value >= 10) return String(Math.max(1, roundHalfUp(value)));
  const quarters = Math.max(1, roundHalfUp(value * 4));
  const whole = Math.floor(quarters / 4);
  const glyph = ["", "¼", "½", "¾"][quarters % 4];
  return whole ? `${whole}${glyph}` : glyph;
}

function formatOne(value: number, unit: string, lang: string): string {
  if (unit === "g" || unit === "ml") {
    if (value >= 100) return String(roundHalfUp(value / 5) * 5);
    return String(Math.max(1, roundHalfUp(value)));
  }
  if (unit === "kg" || unit === "l") return decimal(value, lang);
  return quarter(value);
}

/** Format an already scaled amount incl. unit, e.g. `400 g`, `1½ EL`, `2–3 EL`. */
export function formatAmount(
  quantity: number | null,
  quantityMax: number | null,
  unit: string,
  lang = "de",
): string {
  if (quantity === null) return "";
  const top = quantityMax ?? quantity;
  let divisor = 1;
  let shownUnit = unit;
  if ((unit === "g" || unit === "ml") && top >= 1000) {
    divisor = 1000;
    shownUnit = unit === "g" ? "kg" : "l";
  }
  let amount = formatOne(quantity / divisor, shownUnit, lang);
  if (quantityMax !== null) amount += `–${formatOne(quantityMax / divisor, shownUnit, lang)}`;
  return `${amount} ${shownUnit}`.trim();
}

/** Scaled amount of one ingredient (without name). */
export function formatIngredientAmount(
  ing: Pick<Ingredient, "quantity" | "quantity_max" | "unit">,
  recipeServings: number,
  targetServings: number,
  lang = "de",
): string {
  const q = ing.quantity === null ? null : scaleQuantity(ing.quantity, recipeServings, targetServings);
  const m = ing.quantity_max === null ? null : scaleQuantity(ing.quantity_max, recipeServings, targetServings);
  return formatAmount(q, m, ing.unit, lang);
}
