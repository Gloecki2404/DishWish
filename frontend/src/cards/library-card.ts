import { css, html, LitElement, nothing } from "lit";
import { addWish, errorCode, removeWish } from "../api";
import { getStore, type DataStore } from "../data-store";
import { renderLoadState } from "../utils/load-state";
import "../components/card-editor";
import type { DwCardEditor } from "../components/card-editor";
import "../dialogs/import-dialog";
import "../dialogs/recipe-dialog";
import "../dialogs/recipe-editor";
import type { DwImportDialog } from "../dialogs/import-dialog";
import type { DwRecipeDialog } from "../dialogs/recipe-dialog";
import type { DwRecipeEditor } from "../dialogs/recipe-editor";
import { t, tError } from "../i18n";
import { icon, paths } from "../icons";
import { sharedStyles } from "../styles";
import type { CardConfig, HomeAssistant, Recipe, RecipeInput, RecipeSummary } from "../types";
import { notify } from "../utils/notify";
import { inCardPicker, limitRows } from "../utils/picker";
import { normalize } from "../utils/search";

const PAGE = 60;

interface LibraryConfig extends CardConfig {
  title?: string;
  columns?: string | number;
  categories?: string[];
  default_category?: string;
  show_search?: boolean;
  show_add?: boolean;
  show_import?: boolean;
  sort?: "name" | "newest" | "popular";
  rows?: number;
  shopping_list?: string;
}

const QUICK = "__quick";
const MINE = "__mine";

export class DishWishLibraryCard extends LitElement {
  static override properties = {
    config: { state: true },
    query: { state: true },
    filter: { state: true },
    limit: { state: true },
    menuOpen: { state: true },
    tick: { state: true },
  };
  declare config: LibraryConfig;
  declare query: string;
  declare filter: string;
  declare limit: number;
  declare menuOpen: boolean;
  declare tick: number;

  private _hass?: HomeAssistant;
  private store?: DataStore;
  private unsub?: () => void;
  private observer?: IntersectionObserver;
  private inPicker = false;
  private lastWidth = 0;
  private resizer?: ResizeObserver;

  constructor() {
    super();
    this.config = { type: "custom:dishwish-library-card" };
    this.query = "";
    this.filter = "";
    this.limit = PAGE;
    this.menuOpen = false;
    this.tick = 0;
  }

  static getStubConfig(): LibraryConfig {
    return { type: "custom:dishwish-library-card" };
  }

  static getConfigElement(): HTMLElement {
    const editor = document.createElement("dw-card-editor") as DwCardEditor;
    editor.kind = "library";
    return editor;
  }

  setConfig(config: LibraryConfig): void {
    this.config = { ...config };
    this.filter = config.default_category ?? "";
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
    this.observer?.disconnect();
    this.resizer?.disconnect();
    this.resizer = undefined;
  }

  private attach(): void {
    if (this.unsub || !this.store) return;
    this.unsub = this.store.subscribe(() => this.tick++);
  }

  protected override willUpdate(): void {
    this.inPicker = inCardPicker(this);
    this.toggleAttribute("picker", this.inPicker);
  }

  private applyRows(): void {
    this.lastWidth = this.clientWidth;
    const rows = this.inPicker ? 0 : Number(this.config.rows ?? 0);
    limitRows(this.renderRoot.querySelector(".grid"), rows);
  }

  protected override updated(): void {
    this.applyRows();
    if (!this.resizer) {
      this.resizer = new ResizeObserver(() => {
        if (this.clientWidth !== this.lastWidth) this.applyRows();
      });
      this.resizer.observe(this);
    }
    const sentinel = this.renderRoot.querySelector("#more");
    this.observer?.disconnect();
    if (sentinel) {
      this.observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) this.limit += PAGE;
      });
      this.observer.observe(sentinel);
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
        padding: 12px;
      }
      :host([picker]) .card {
        max-height: 340px;
        overflow: hidden;
      }
      header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      h1 {
        flex: none;
        margin: 0 4px;
        font-size: 1.3em;
        font-weight: 500;
      }
      .search {
        flex: 1;
        position: relative;
        min-width: 0;
      }
      .search input {
        padding-left: 40px;
      }
      .search .icon {
        position: absolute;
        left: 8px;
        top: 10px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .spacer {
        flex: 1;
      }
      .menu-wrap {
        position: relative;
      }
      .menu {
        position: absolute;
        right: 0;
        top: 48px;
        z-index: 2;
        min-width: 200px;
        padding: 4px;
        border-radius: 8px;
        --fill: var(--dw-dialog-background, var(--ha-dialog-surface-background, var(--card-background-color)));
        background: linear-gradient(var(--fill), var(--fill)), var(--primary-background-color, Canvas);
        border: 1px solid var(--divider-color);
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.3));
      }
      .menu button {
        display: block;
        width: 100%;
        min-height: 44px;
        padding: 0 12px;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        border-radius: 6px;
      }
      .menu button:hover {
        background: var(--secondary-background-color);
      }
      .filters {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 4px;
      }
      .grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      }
      .tile {
        position: relative;
        display: block;
        border-radius: var(--dw-tile-radius, 10px);
        overflow: hidden;
        background: var(--secondary-background-color);
        content-visibility: auto;
        contain-intrinsic-size: auto 200px;
      }
      .tile .img {
        aspect-ratio: 4 / 3;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        --mdc-icon-size: 40px;
      }
      .tile img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .tile .info {
        padding: 8px 10px 10px;
      }
      .tile .name {
        font-weight: 500;
        line-height: 1.25;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .tile .sub {
        margin-top: 2px;
        font-size: 0.85em;
        color: var(--secondary-text-color);
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .tile .open {
        display: block;
        width: 100%;
        padding: 0;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }
      .heart {
        position: absolute;
        top: 0;
        right: 0;
        min-width: 44px;
        min-height: 44px;
        padding: 0;
        border: none;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .heart .pill {
        padding: 2px 8px;
        border-radius: 12px;
        background: var(--card-background-color);
        font-size: 0.85em;
        opacity: 0.92;
      }
      .heart[aria-pressed="true"] .pill {
        background: var(--dw-accent, var(--primary-color));
        color: var(--text-primary-color, #fff);
      }
      .empty {
        text-align: center;
        padding: 32px 12px;
      }
      .empty .btns {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 12px;
      }
      #more {
        grid-column: 1 / -1;
        height: 1px;
      }
    `,
  ];

  // --- data -------------------------------------------------------------------

  private get uiLang(): string {
    return this._hass?.locale.language ?? "en";
  }

  private get visibleCategories() {
    const all = this.store?.categories ?? [];
    const only = this.config.categories;
    return only?.length ? all.filter((c) => only.includes(c.id)) : all;
  }

  private filtered(): RecipeSummary[] {
    const store = this.store!;
    const q = normalize(this.query.trim());
    const catName = new Map(store.categories.map((c) => [c.id, normalize(c.name)]));
    const me = this._hass?.user?.id;
    let list = store.recipes.filter((r) => {
      if (this.filter === QUICK) {
        const total = (r.prep_minutes ?? 0) + (r.cook_minutes ?? 0);
        if (r.prep_minutes === null && r.cook_minutes === null) return false;
        if (total > 30) return false;
      } else if (this.filter === MINE) {
        if (r.created_by !== me) return false;
      } else if (this.filter && !r.category_ids.includes(this.filter)) return false;
      if (!q) return true;
      const hay = normalize(r.name) + " " + r.category_ids.map((id) => catName.get(id) ?? "").join(" ");
      return q.split(/\s+/).every((word) => hay.includes(word));
    });
    const sort = this.config.sort ?? "name";
    const byName = (a: RecipeSummary, b: RecipeSummary) => a.name.localeCompare(b.name, this.uiLang);
    if (sort === "newest") list = [...list].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    else if (sort === "popular")
      list = [...list].sort((a, b) => b.open_wish_count - a.open_wish_count || byName(a, b));
    else list = [...list].sort(byName);
    return list;
  }

  // --- actions ------------------------------------------------------------------

  private get recipeDialog(): DwRecipeDialog {
    return this.renderRoot.querySelector("dw-recipe-dialog") as DwRecipeDialog;
  }
  private get editor(): DwRecipeEditor {
    return this.renderRoot.querySelector("dw-recipe-editor") as DwRecipeEditor;
  }
  private get importer(): DwImportDialog {
    return this.renderRoot.querySelector("dw-import-dialog") as DwImportDialog;
  }

  private newRecipe(): void {
    this.menuOpen = false;
    void this.editor.open();
  }

  private importRecipe(): void {
    this.menuOpen = false;
    void this.importer.open();
  }

  private openRecipe(id: string): void {
    void this.recipeDialog.open(id);
  }

  private async toggleWish(r: RecipeSummary): Promise<void> {
    const conn = this._hass!.connection;
    try {
      if (r.my_wish_id) await removeWish(conn, r.my_wish_id);
      else await addWish(conn, r.id);
      await this.store?.refresh();
    } catch (err) {
      notify(this, tError(this.lang, errorCode(err)));
    }
  }

  private onEdit(e: CustomEvent<Recipe>): void {
    this.recipeDialog.close();
    void this.editor.open(e.detail);
  }

  private onSaved(e: CustomEvent<Recipe>): void {
    void this.store?.refresh();
    this.openRecipe(e.detail.id);
  }

  // --- render -------------------------------------------------------------------

  private renderTile(r: RecipeSummary) {
    const lang = this.uiLang;
    const minutes = (r.prep_minutes ?? 0) + (r.cook_minutes ?? 0);
    const firstCat = this.store!.categories.find((c) => c.id === r.category_ids[0]);
    return html`<div class="tile">
      <button class="open" @click=${() => this.openRecipe(r.id)}>
        <div class="img">
          ${r.thumb_url
            ? html`<img src=${r.thumb_url} alt="" loading="lazy" decoding="async" />`
            : html`<ha-icon icon=${firstCat?.icon ?? "mdi:silverware-fork-knife"}></ha-icon>`}
        </div>
        <div class="info">
          <div class="name">${r.name}</div>
          <div class="sub">
            ${minutes ? html`<span>${t(lang, "minutes_short", { n: minutes })}</span>` : nothing}
            ${r.visibility === "private" ? html`<span>${t(lang, "only_me")}</span>` : nothing}
          </div>
        </div>
      </button>
      <button
        class="heart"
        aria-pressed=${r.my_wish_id !== null}
        aria-label=${r.my_wish_id ? t(lang, "wish_remove") : t(lang, "wish_heart")}
        @click=${() => this.toggleWish(r)}
      >
        <span class="pill">${r.my_wish_id ? "♥" : "♡"}${r.open_wish_count ? ` ${r.open_wish_count}` : ""}</span>
      </button>
    </div>`;
  }
  private renderEmpty() {
    const lang = this.uiLang;
    return html`<div class="empty">
      <p class="muted">${t(lang, "empty_title")}</p>
      <div class="btns">
        ${this.config.show_add !== false
          ? html`<button class="btn primary" @click=${() => this.newRecipe()}>${icon(paths.plus)} ${t(lang, "empty_first")}</button>`
          : nothing}
        ${this.config.show_import !== false
          ? html`<button class="btn" @click=${() => this.importRecipe()}>${icon(paths.link)} ${t(lang, "empty_import")}</button>`
          : nothing}
      </div>
    </div>`;
  }

  protected override render() {
    if (!this._hass || !this.store) return html`<div class="card muted">…</div>`;
    const lang = this.uiLang;
    const store = this.store;
    const cfg = this.config;
    const list = store.loaded ? this.filtered() : [];
    const shown = list.slice(0, this.inPicker ? 4 : this.limit);
    const cols = Number(cfg.columns);
    const gridStyle = cols >= 2 && cols <= 6 ? `grid-template-columns: repeat(${cols}, 1fr)` : "";
    const canAdd = cfg.show_add !== false;
    const canImport = cfg.show_import !== false;

    return html`
      <div class="card">
        <header>
          <h1>${cfg.title ?? t(lang, "library_title")}</h1>
          ${cfg.show_search !== false
            ? html`<div class="search">
                ${icon(paths.search)}
                <input
                  type="search"
                  placeholder=${t(lang, "search")}
                  aria-label=${t(lang, "search")}
                  .value=${this.query}
                  @input=${(e: Event) => {
                    this.query = (e.target as HTMLInputElement).value;
                    this.limit = PAGE;
                  }}
                />
              </div>`
            : html`<span class="spacer"></span>`}
          ${canAdd || canImport
            ? html`<div class="menu-wrap">
                <button class="icon-btn" aria-label=${t(lang, "add_menu")} aria-expanded=${this.menuOpen}
                  @click=${() => (this.menuOpen = !this.menuOpen)}>${icon(paths.plus)}</button>
                ${this.menuOpen
                  ? html`<div class="menu">
                      ${canAdd ? html`<button @click=${() => this.newRecipe()}>${t(lang, "new_recipe_menu")}</button>` : nothing}
                      ${canImport ? html`<button @click=${() => this.importRecipe()}>${t(lang, "import_menu")}</button>` : nothing}
                    </div>`
                  : nothing}
              </div>`
            : nothing}
        </header>
        <div class="filters">
          <button class="chip" aria-pressed=${this.filter === ""} @click=${() => this.setFilter("")}>${t(lang, "filter_all")}</button>
          ${this.visibleCategories.map(
            (c) => html`<button class="chip" aria-pressed=${this.filter === c.id} @click=${() => this.setFilter(c.id)}>
              <ha-icon icon=${c.icon} style="--mdc-icon-size:18px"></ha-icon>${c.name}
            </button>`,
          )}
          <button class="chip" aria-pressed=${this.filter === QUICK} @click=${() => this.setFilter(QUICK)}>${t(lang, "filter_quick")}</button>
          <button class="chip" aria-pressed=${this.filter === MINE} @click=${() => this.setFilter(MINE)}>${t(lang, "filter_mine")}</button>
        </div>
        ${store.error && store.loaded ? html`<p class="error">${tError(lang, "unknown")}</p>` : nothing}
        ${!store.loaded
          ? renderLoadState(store, lang)
          : store.recipes.length === 0
            ? this.renderEmpty()
            : list.length === 0
              ? html`<p class="muted empty">${t(lang, "no_results")}</p>`
              : html`<div class="grid" style=${gridStyle}>
                  ${shown.map((r) => this.renderTile(r))}
                  ${shown.length < list.length ? html`<div id="more"></div>` : nothing}
                </div>`}
      </div>
      <dw-recipe-dialog exportparts="dialog,header,title,close-button,body,footer"
        .hass=${this._hass}
        .categories=${store.categories}
        .shoppingList=${cfg.shopping_list}
        @edit=${this.onEdit}
      ></dw-recipe-dialog>
      <dw-recipe-editor exportparts="dialog,header,title,close-button,body,footer" .hass=${this._hass} .categories=${store.categories} @saved=${this.onSaved}></dw-recipe-editor>
      <dw-import-dialog exportparts="dialog,header,title,close-button,body,footer" .hass=${this._hass} @imported=${(e: CustomEvent<RecipeInput>) => void this.editor.open(e.detail)}></dw-import-dialog>
    `;
  }

  private setFilter(filter: string): void {
    this.filter = filter;
    this.limit = PAGE;
  }
}

if (!customElements.get("dishwish-library-card")) {
  customElements.define("dishwish-library-card", DishWishLibraryCard);
}
