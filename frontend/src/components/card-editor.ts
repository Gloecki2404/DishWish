import { html, LitElement, nothing } from "lit";
import { getStore, type DataStore } from "../data-store";
import { t, type Key } from "../i18n";
import type { CardConfig, HomeAssistant } from "../types";

export type EditorKind = "library" | "recipe";

interface FormSchema {
  name: string;
  required?: boolean;
  selector: Record<string, unknown>;
}

/** `ha-form` is loaded lazily by Home Assistant; opening a built-in card editor pulls it in. */
async function ensureHaForm(): Promise<void> {
  if (customElements.get("ha-form")) return;
  const w = window as unknown as {
    loadCardHelpers?: () => Promise<{ createCardElement(c: object): Promise<{ constructor: { getConfigElement?: () => Promise<unknown> } }> }>;
  };
  try {
    const helpers = await w.loadCardHelpers?.();
    const card = await helpers?.createCardElement({ type: "entities", entities: [] });
    await card?.constructor.getConfigElement?.();
  } catch {
    /* the form simply stays unavailable */
  }
  await customElements.whenDefined("ha-form").catch(() => undefined);
}

const LABELS: Record<string, Key> = {
  title: "cfg_title",
  columns: "cfg_columns",
  rows: "cfg_rows",
  categories: "cfg_categories",
  default_category: "cfg_default_category",
  show_search: "cfg_show_search",
  show_add: "cfg_show_add",
  show_import: "cfg_show_import",
  sort: "cfg_sort",
  shopping_list: "cfg_shopping_list",
  mode: "cfg_mode",
  recipe_id: "cfg_recipe",
  show_ingredients: "cfg_show_ingredients",
  show_steps: "cfg_show_steps",
};

/** Visual card editor with dishes/categories loaded from the integration. */
export class DwCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    kind: { attribute: false },
    config: { state: true },
    ready: { state: true },
    tick: { state: true },
  };
  declare hass: HomeAssistant;
  declare kind: EditorKind;
  declare config: CardConfig;
  declare ready: boolean;
  declare tick: number;

  private store?: DataStore;
  private unsub?: () => void;

  constructor() {
    super();
    this.kind = "library";
    this.config = { type: "" };
    this.ready = false;
    this.tick = 0;
  }

  setConfig(config: CardConfig): void {
    this.config = config;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void ensureHaForm().then(() => (this.ready = true));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsub?.();
    this.unsub = undefined;
  }

  protected override willUpdate(): void {
    if (!this.store && this.hass) {
      this.store = getStore(this.hass);
      this.unsub = this.store.subscribe(() => this.tick++);
    }
  }

  private get uiLang(): string {
    return this.hass?.locale?.language ?? "en";
  }

  private schema(): FormSchema[] {
    const lang = this.uiLang;
    const categories = (this.store?.categories ?? []).map((c) => ({ value: c.id, label: c.name }));
    if (this.kind === "recipe") {
      const schema: FormSchema[] = [
        {
          name: "mode",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "fixed", label: t(lang, "cfg_mode_fixed") },
                { value: "top_wish", label: t(lang, "cfg_mode_top_wish") },
              ],
            },
          },
        },
      ];
      if ((this.config.mode ?? "fixed") === "fixed") {
        const recipes = [...(this.store?.recipes ?? [])]
          .sort((a, b) => a.name.localeCompare(b.name, lang))
          .map((r) => ({ value: r.id, label: r.name }));
        schema.push({ name: "recipe_id", selector: { select: { mode: "dropdown", options: recipes } } });
      }
      schema.push(
        { name: "show_ingredients", selector: { boolean: {} } },
        { name: "show_steps", selector: { boolean: {} } },
        { name: "shopping_list", selector: { entity: { domain: "todo" } } },
      );
      return schema;
    }
    return [
      { name: "title", selector: { text: {} } },
      { name: "columns", selector: { select: { mode: "dropdown", options: ["auto", "2", "3", "4", "5", "6"] } } },
      { name: "rows", selector: { number: { min: 0, max: 50, mode: "box" } } },
      { name: "categories", selector: { select: { multiple: true, options: categories } } },
      { name: "default_category", selector: { select: { mode: "dropdown", options: categories } } },
      { name: "show_search", selector: { boolean: {} } },
      { name: "show_add", selector: { boolean: {} } },
      { name: "show_import", selector: { boolean: {} } },
      {
        name: "sort",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "name", label: t(lang, "cfg_sort_name") },
              { value: "newest", label: t(lang, "cfg_sort_newest") },
              { value: "popular", label: t(lang, "cfg_sort_popular") },
            ],
          },
        },
      },
      { name: "shopping_list", selector: { entity: { domain: "todo" } } },
    ];
  }

  private changed(e: CustomEvent<{ value: CardConfig }>): void {
    e.stopPropagation();
    const config: CardConfig = { type: this.config.type };
    for (const [key, value] of Object.entries(e.detail.value)) {
      if (key === "type") continue;
      const empty = value === undefined || value === "" || value === null || (Array.isArray(value) && value.length === 0);
      if (!empty) config[key] = value;
    }
    this.config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  protected override render() {
    if (!this.hass || !this.ready) return nothing;
    const lang = this.uiLang;
    return html`<ha-form
      .hass=${this.hass}
      .data=${this.config}
      .schema=${this.schema()}
      .computeLabel=${(s: { name: string }) => (LABELS[s.name] ? t(lang, LABELS[s.name]) : s.name)}
      @value-changed=${this.changed}
    ></ha-form>`;
  }
}

if (!customElements.get("dw-card-editor")) customElements.define("dw-card-editor", DwCardEditor);