import "./cards/library-card";

interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview: boolean;
  documentationURL: string;
}

const w = window as unknown as { customCards?: CustomCardEntry[] };
w.customCards = w.customCards ?? [];

if (!w.customCards.some((c) => c.type === "essensplan-library-card")) {
  w.customCards.push({
    type: "essensplan-library-card",
    name: "Essensplan – Bibliothek",
    description: "Gerichte mit Fotos, Suche und Filtern / Dish library with photos, search and filters",
    preview: true,
    documentationURL: "https://github.com/GITHUB_USER/essensplan",
  });
}
