import "./cards/library-card";
import "./cards/wishes-card";

interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview: boolean;
  documentationURL: string;
}

const w = window as unknown as { customCards?: CustomCardEntry[] };
w.customCards = w.customCards ?? [];

const cards: Omit<CustomCardEntry, "preview" | "documentationURL">[] = [
  {
    type: "essensplan-library-card",
    name: "Essensplan – Bibliothek",
    description: "Gerichte mit Fotos, Suche und Filtern / Dish library with photos, search and filters",
  },
  {
    type: "essensplan-wishes-card",
    name: "Essensplan – Essenswünsche",
    description: "Offene Essenswünsche der Familie / Open meal wishes of the household",
  },
];

for (const card of cards) {
  if (!w.customCards.some((c) => c.type === card.type)) {
    w.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/GITHUB_USER/essensplan" });
  }
}
