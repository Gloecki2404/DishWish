import { expect, it } from "vitest";
import { normalize } from "./search";

it("ignores case and diacritics", () => {
  expect(normalize("Käse-Spätzle ÉCLAIR")).toBe("kase-spatzle eclair");
});
