import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "dishwish-cards.js",
    },
    outDir: "../custom_components/dishwish/www",
    emptyOutDir: true,
    sourcemap: false,
    target: "es2022",
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});

