import { describe, expect, it } from "vitest";
import cases from "../../../tests/fixtures/ingredient_cases.json";
import { formatAmount, formatIngredientAmount, scaleQuantity } from "./scale";

describe("format fixture cases (shared with pytest)", () => {
  for (const c of cases.format) {
    it(`${c.quantity}-${c.quantity_max} ${c.unit} ${c.from_servings}->${c.to_servings} ${c.lang}`, () => {
      const q = c.quantity === null ? null : scaleQuantity(c.quantity, c.from_servings, c.to_servings);
      const m = c.quantity_max === null ? null : scaleQuantity(c.quantity_max, c.from_servings, c.to_servings);
      expect(formatAmount(q, m, c.unit, c.lang)).toBe(c.expected);
    });
  }
});

describe("formatIngredientAmount", () => {
  it("scales and formats", () => {
    const ing = { quantity: 200, quantity_max: null, unit: "g" };
    expect(formatIngredientAmount(ing, 4, 2, "de")).toBe("100 g");
  });
  it("returns empty without quantity", () => {
    expect(formatIngredientAmount({ quantity: null, quantity_max: null, unit: "" }, 4, 8)).toBe("");
  });
});
