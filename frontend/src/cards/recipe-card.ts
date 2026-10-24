import { css, html, LitElement, nothing } from "lit";
import { addWish, errorCode, getRecipe } from "../api";
import "../components/card-editor";
import type { DwCardEditor } from "../components/card-editor";
import "../components/recipe-view";
import { getStore, type DataStore } from "../data-store";
import "../dialogs/cook-mode";
import "../dialogs/recipe-picker";
import type { DwRecipePicker } from "../dialogs/recipe-picker";
import type { DwCookMode } from "../dialogs/cook-mode";
import { t, tError } from "../i18n";
import { sharedStyles } from "../styles";
import type { CardConfig, HomeAssistant, Recipe } from "../types";
import { notify } from "../utils/notify";
import { inCardPicker } from "../utils/picker";

interface RecipeCardConfig extends CardConfig {
  recipe_id?: string;
  mode?: "fixed" | "top_wish";
  show_ingredients?: boolean;
  show_steps?: boolean;
  shopping_list?: string;
}

export class DishWishRecipeCard extends LitElement {
  static override properties = {
    config: { state: true },
    tick: { state: true },
    recipe: { state: true },
    error: { state: true },
    servings: { state: true },
  };
  declare config: RecipeCardConfig;
  declare tick: number;
  declare recipe: Recipe | null;
  declare error: string;
  declare servings: number;

  private _hass?: HomeAssistant;
  private store?: DataStore;
  private unsub?: () => void;
  private requested = "";
  private inPicker = false;

  constructor() {
    super();
    this.config = { type: "custom:dishwish-recipe-card" };
    this.tick = 0;
    this.recipe = null;
    this.error = "";
    this.servings = 4;
  }

  static getStubConfig(): RecipeCardConfig {
    return { type: "custom:dishwish-recipe-card", mode: "top_wish" };
  }

  static getConfigElement(): HTMLElement {
    const editor = document.createElement("dw-card-editor") as DwCardEditor;
    editor.kind = "recipe";
    return editor;
  }

  setConfig(config: RecipeCardConfig): void {
    this.config = { ...config };
    this.requested = "";
  }

  set hass(hass: HomeAssistant) {
    const first = !this._hass;
    const langChanged = this._hass && this._hass.locale.language !== hass.locale.language;
    this._hass = hass;
    if (first) {
      this.store = getStore(hass);
      if (this.isConnected) this.attach();
      this.requestUpdate();
    } else if (langChanged) this.requestUpdate();
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  getCardSize(): number {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.attach();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsub?.();
    this.unsub = undefined;
  }

  private attach(): void {
    if (this.unsub || !this.store) return;
    this.unsub = this.store.subscribe(() => this.tick++);
  }

  /** Id of the dish to show: the configured one, or the one with the most open wishes. */
  private targetId(): string | undefined {
    if ((this.config.mode ?? "fixed") === "fixed") return this.config.recipe_id;
    const counts = new Map<string, number>();
    for (const w of this.store?.wishes ?? []) counts.set(w.recipe_id, (counts.get(w.recipe_id) ?? 0) + 1);
    let best: string | undefined;
    let bestCount = 0;
    for (const [id, n] of counts) if (n > bestCount) [best, bestCount] = [id, n]; // ties: oldest wish wins
    return best;
  }

  protected override willUpdate(): void {
    this.inPicker = inCardPicker(this);
    this.toggleAttribute("picker", this.inPicker);
    if (!this._hass || !this.store?.loaded) return;
    const id = this.targetId();
    if (!id) {
      this.recipe = null;
      this.requested = "";
      return;
    }
    // reload when the dish changed or was edited
    const key = `${id}@${this.store.recipes.find((r) => r.id === id)?.updated_at ?? ""}`;
    if (key === this.requested) return;
    this.requested = key;
    void this.load(id);
  }

  private async load(id: string): Promise<void> {
    try {
      const recipe = await getRecipe(this._hass!.connection, id);
      if (!this.requested.startsWith(`${id}@`)) return; // superseded by a newer request
      this.recipe = recipe;
      this.error = "";
    } catch (err) {
      if (!this.requested.startsWith(`${id}@`)) return;
      this.recipe = null;
      this.error = tError(this.uiLang, errorCode(err));
    }
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .card {
        background: var(--dw-card-background, var(--ha-card-background, var(--card-background-color)));
        border-radius: var(--dw-card-radius, var(--ha-card-border-radius, 12px));
        box-shadow: var(--ha-card-box-shadow, none);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
        padding: 16px;
      }
      :host([picker]) .card {
        max-height: 300px;
        overflow: hidden;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 1.4em;
        font-weight: 500;
      }
    `,
  ];

  private get uiLang(): string {
    return this._hass?.locale.language ?? "en";
  }

  private get picker(): DwRecipePicker {
    return this.renderRoot.querySelector("dw-recipe-picker") as DwRecipePicker;
  }

  private async onPicked(e: CustomEvent<string>): Promise<void> {
    const lang = this.uiLang;
    try {
      await addWish(this._hass!.connection, e.detail);
      notify(this, t(lang, "wish_added"));
      await this.store?.refresh();
    } catch (err) {
      notify(this, tError(lang, errorCode(err)));
    }
  }

  private get cook(): DwCookMode {
    return this.renderRoot.querySelector("dw-cook-mode") as DwCookMode;
  }

  protected override render() {
    if (!this._hass || !this.store) return html`<div class="card muted">…</div>`;
    const lang = this.uiLang;
    const cfg = this.config;
    let body;
    if (this.error) body = html`<p class="error">${this.error}</p>`;
    else if (!this.store.loaded) body = html`<p class="muted">${t(lang, "loading")}</p>`;
    else if (!this.recipe) {
      const fixed = (cfg.mode ?? "fixed") === "fixed";
      body = fixed
        ? html`<p class="muted">${t(lang, "recipe_missing")}</p>`
        : html`<p>${t(lang, "wishes_empty")}</p>
            <p class="muted">${t(lang, "wishes_hint")}</p>
            <button class="btn" @click=${() => void this.picker.open()}>${t(lang, "add_wish")}</button>`;
    } else {
      body = html`<h1>${this.recipe.name}</h1>
        <dw-recipe-view
          .hass=${this._hass}
          .recipe=${this.recipe}
          .categories=${this.store.categories}
          .shoppingList=${cfg.shopping_list}
          .showIngredients=${cfg.show_ingredients !== false}
          .showSteps=${cfg.show_steps !== false}
          .cookable=${true}
          @cook=${(e: CustomEvent<{ servings: number }>) => {
            this.servings = e.detail.servings;
            void this.cook.open();
          }}
        ></dw-recipe-view>`;
    }
    return html`<div class="card">${body}</div>
      <dw-recipe-picker
        exportparts="dialog,header,title,close-button,body,footer"
        .hass=${this._hass}
        .recipes=${this.store.recipes}
        .categories=${this.store.categories}
        @picked=${this.onPicked}
      ></dw-recipe-picker>
      ${this.recipe
        ? html`<dw-cook-mode exportparts="dialog,header,title,close-button,body,footer" .hass=${this._hass} .recipe=${this.recipe} .servings=${this.servings}></dw-cook-mode>`
        : nothing}`;
  }
}

if (!customElements.get("dishwish-recipe-card")) {
  customElements.define("dishwish-recipe-card", DishWishRecipeCard);
}