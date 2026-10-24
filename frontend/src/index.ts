import "./cards/library-card";
import "./cards/recipe-card";
import "./cards/wishes-card";
import { t, uiLanguage } from "./i18n";

interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview: boolean;
  documentationURL: string;
}

const w = window as unknown as { customCards?: CustomCardEntry[] };
w.customCards = w.customCards ?? [];

const lang = uiLanguage();
const cards = [
  { type: "dishwish-library-card", name: t(lang, "card_library_name"), description: t(lang, "card_library_desc") },
  { type: "dishwish-recipe-card", name: t(lang, "card_recipe_name"), description: t(lang, "card_recipe_desc") },
  { type: "dishwish-wishes-card", name: t(lang, "card_wishes_name"), description: t(lang, "card_wishes_desc") },
];

for (const card of cards) {
  if (!w.customCards.some((c) => c.type === card.type)) {
    w.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/Gloecki2404/DishWish" });
  }
}