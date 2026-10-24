import { expect, it } from "vitest";
import { inCardPicker, relativeTime } from "./picker";

const now = Date.parse("2026-10-24T12:00:00Z");

it("formats relative times in the given language", () => {
  expect(relativeTime("2026-10-24T11:59:30Z", "en", now)).toBe("this minute");
  expect(relativeTime("2026-10-24T09:00:00Z", "en", now)).toBe("3 hours ago");
  expect(relativeTime("2026-10-21T12:00:00Z", "de", now)).toBe("vor 3 Tagen");
  expect(relativeTime("2026-10-23T12:00:00Z", "en", now)).toBe("yesterday");
});

it("returns empty text for invalid dates", () => {
  expect(relativeTime("nonsense", "en", now)).toBe("");
});
it("detects an element inside the card picker, through nested shadow roots", () => {
  class FakePicker extends HTMLElement {}
  customElements.define("hui-card-picker", FakePicker);
  const picker = document.createElement("hui-card-picker");
  const shadow = picker.attachShadow({ mode: "open" });
  const wrapper = document.createElement("div");
  const hostCard = document.createElement("div");
  const inner = hostCard.attachShadow({ mode: "open" });
  const card = document.createElement("div");
  inner.appendChild(card);
  wrapper.appendChild(hostCard);
  shadow.appendChild(wrapper);
  document.body.appendChild(picker);
  expect(inCardPicker(card)).toBe(true);
  const plain = document.createElement("div");
  document.body.appendChild(plain);
  expect(inCardPicker(plain)).toBe(false);
});