import { css, html, LitElement, nothing } from "lit";
import { addWish, completeWishes, errorCode, listWishes, removeWish } from "../api";
import { getStore, type DataStore } from "../data-store";
import "../dialogs/recipe-dialog";
import "../dialogs/recipe-editor";
import "../dialogs/recipe-picker";
import type { EsRecipeDialog } from "../dialogs/recipe-dialog";
import type { EsRecipeEditor } from "../dialogs/recipe-editor";
import type { EsRecipePicker } from "../dialogs/recipe-picker";
import { t, tError, type Key } from "../i18n";
import { sharedStyles } from "../styles";
import type { CardConfig, HomeAssistant, Recipe, Wish } from "../types";
import { notify } from "../utils/notify";
import { inCardPicker, limitRows, relativeTime } from "../utils/picker";

interface WishesConfig extends CardConfig {
  title?: string;
  layout?: "list" | "grid";
  sort?: "popular" | "oldest" | "newest";
  rows?: number;
  show_done?: number;
  shopping_list?: string;
}

interface Group {
  recipeId: string;
  name: string;
  thumb: string | null;
  wishes: Wish[];
}

export class EssensplanWishesCard extends LitElement {
  static override properties = {
    config: { state: true },
    tick: { state: true },
    done: { state: true },
  };
  declare config: WishesConfig;
  declare tick: number;
  declare done: Wish[];

  private _hass?: HomeAssistant;
  private store?: DataStore;
  private unsub?: () => void;
  private doneTimer?: ReturnType<typeof setTimeout>;
  private inPicker = false;
  private lastWidth = 0;
  private resizer?: ResizeObserver;

  constructor() {
    super();
    this.config = { type: "custom:essensplan-wishes-card" };
    this.tick = 0;
    this.done = [];
  }

  static getStubConfig(): WishesConfig {
    return { type: "custom:essensplan-wishes-card" };
  }

  static getConfigForm() {
    const lang = document.documentElement.lang || navigator.language || "en";
    const schema = [
      { name: "title", selector: { text: {} } },
      {
        name: "layout",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "list", label: t(lang, "cfg_layout_list") },
              { value: "grid", label: t(lang, "cfg_layout_grid") },
            ],
          },
        },
      },
      {
        name: "sort",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "popular", label: t(lang, "cfg_sort_popular") },
              { value: "oldest", label: t(lang, "cfg_sort_oldest") },
              { value: "newest", label: t(lang, "cfg_sort_newest") },
            ],
          },
        },
      },
      { name: "rows", selector: { number: { min: 0, max: 50, mode: "box" } } },
      { name: "show_done", selector: { number: { min: 0, max: 20, mode: "box" } } },
      { name: "shopping_list", selector: { entity: { domain: "todo" } } },
    ];
    const labels: Record<string, Key> = {
      title: "cfg_title",
      layout: "cfg_layout",
      sort: "cfg_sort",
      rows: "cfg_rows",
      show_done: "cfg_show_done",
      shopping_list: "cfg_shopping_list",
    };
    return {
      schema,
      computeLabel: (s: { name: string }) => (labels[s.name] ? t(lang, labels[s.name]) : s.name),
    };
  }

  setConfig(config: WishesConfig): void {
    this.config = { ...config };
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
    return 6;
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
    this.resizer?.disconnect();
    this.resizer = undefined;
    clearTimeout(this.doneTimer);
  }

  protected override willUpdate(): void {
    this.inPicker = inCardPicker(this);
    this.toggleAttribute("picker", this.inPicker);
  }

  protected override updated(): void {
    this.applyRows();
    if (!this.resizer) {
      this.resizer = new ResizeObserver(() => {
        const width = this.clientWidth;
        if (width !== this.lastWidth) this.applyRows();
      });
      this.resizer.observe(this);
    }
  }

  private applyRows(): void {
    this.lastWidth = this.clientWidth;
    const rows = this.inPicker ? 0 : Number(this.config.rows ?? 0);
    limitRows(this.renderRoot.querySelector(".groups"), rows);
  }

  private attach(): void {
    if (this.unsub || !this.store) return;
    this.unsub = this.store.subscribe(() => {
      this.tick++;
      this.scheduleDone();
    });
  }

  /** Recently cooked dishes are not part of the shared store; reload them after wish changes. */
  private scheduleDone(): void {
    const n = Number(this.config.show_done ?? 0);
    if (!n || !this._hass) return;
    clearTimeout(this.doneTimer);
    this.doneTimer = setTimeout(async () => {
      try {
        this.done = await listWishes(this._hass!.connection, "done", Math.min(n * 5, 100));
      } catch {
        /* optional section */
      }
    }, 200);
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .card {
        background: var(--ha-card-background, var(--card-background-color));
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, none);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
        padding: 12px;
      }
      header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      h1 {
        flex: 1;
        margin: 0 4px;
        font-size: 1.3em;
        font-weight: 500;
      }
      .groups {
        display: grid;
        gap: 12px;
      }
      .groups.grid {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      }
      .group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
        border-radius: 10px;
        background: var(--secondary-background-color);
      }
      .top {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .top button.open {
        display: flex;
        gap: 10px;
        align-items: center;
        flex: 1;
        min-width: 0;
        min-height: 56px;
        padding: 0;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }
      .thumb {
        flex: none;
        width: 72px;
        height: 54px;
        border-radius: 8px;
        object-fit: cover;
        background: var(--divider-color);
      }
      .name {
        font-weight: 500;
        line-height: 1.25;
      }
      .avatars {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 0.85em;
      }
      :host([picker]) .card {
        max-height: 240px;
        overflow: hidden;
      }
      .note {
        color: var(--primary-text-color);
      }
      .notes {
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: 0.9em;
        color: var(--secondary-text-color);
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .empty {
        text-align: center;
        padding: 24px 8px;
      }
      h2 {
        margin: 16px 4px 6px;
        font-size: 1em;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .done {
        margin: 0;
        padding: 0 4px;
        list-style: none;
        color: var(--secondary-text-color);
      }
      .done li {
        padding: 4px 0;
      }
    `,
  ];

  private get uiLang(): string {
    return this._hass?.locale.language ?? "en";
  }

  private get recipeDialog(): EsRecipeDialog {
    return this.renderRoot.querySelector("es-recipe-dialog") as EsRecipeDialog;
  }
  private get editor(): EsRecipeEditor {
    return this.renderRoot.querySelector("es-recipe-editor") as EsRecipeEditor;
  }
  private get picker(): EsRecipePicker {
    return this.renderRoot.querySelector("es-recipe-picker") as EsRecipePicker;
  }

  private groups(): Group[] {
    const map = new Map<string, Group>();
    for (const w of this.store?.wishes ?? []) {
      const g = map.get(w.recipe_id) ?? { recipeId: w.recipe_id, name: w.recipe_name, thumb: w.thumb_url, wishes: [] };
      g.wishes.push(w);
      map.set(w.recipe_id, g);
    }
    // wishes arrive oldest first, so the first entry is the oldest wish of a group
    const oldest = (g: Group) => g.wishes[0].created_at;
    const newest = (g: Group) => g.wishes[g.wishes.length - 1].created_at;
    const sort = this.config.sort ?? "popular";
    return [...map.values()].sort((a, b) =>
      sort === "oldest"
        ? oldest(a).localeCompare(oldest(b))
        : sort === "newest"
          ? newest(b).localeCompare(newest(a))
          : b.wishes.length - a.wishes.length || oldest(a).localeCompare(oldest(b)),
    );
  }

  private avatar(w: Wish) {
    const states = this._hass?.states ?? {};
    for (const [id, st] of Object.entries(states)) {
      if (id.startsWith("person.") && st.attributes.user_id === w.user_id) {
        const pic = st.attributes.entity_picture;
        if (typeof pic === "string" && pic) return html`<img class="avatar" src=${pic} alt=${w.user_name} title=${w.user_name} />`;
      }
    }
    const initials = w.user_name
      .split(/\s+/)
      .map((p) => p[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return html`<span class="avatar" title=${w.user_name} aria-label=${w.user_name}>${initials}</span>`;
  }

  private async run(action: () => Promise<string | void>): Promise<void> {
    try {
      const msg = await action();
      if (msg) notify(this, msg);
      await this.store?.refresh();
    } catch (err) {
      notify(this, tError(this.uiLang, errorCode(err)));
    }
  }

  private cooked(g: Group): Promise<void> {
    return this.run(async () => {
      await completeWishes(this._hass!.connection, g.recipeId);
      return t(this.uiLang, "cooked_done");
    });
  }

  private removeMine(w: Wish): Promise<void> {
    return this.run(async () => {
      await removeWish(this._hass!.connection, w.id);
    });
  }

  private onPicked(e: CustomEvent<string>): Promise<void> {
    return this.run(async () => {
      await addWish(this._hass!.connection, e.detail);
      return t(this.uiLang, "wish_added");
    });
  }

  private renderGroup(g: Group) {
    const lang = this.uiLang;
    const me = this._hass?.user?.id;
    const mine = g.wishes.find((w) => w.user_id === me);
    return html`<div class="group">
      <div class="top">
        <button class="open" aria-label=${`${t(lang, "open_recipe")}: ${g.name}`} @click=${() => void this.recipeDialog.open(g.recipeId)}>
          ${g.thumb ? html`<img class="thumb" src=${g.thumb} alt="" loading="lazy" decoding="async" />` : html`<div class="thumb"></div>`}
          <span class="name">${g.name}</span>
        </button>
        <div class="avatars">${g.wishes.map((w) => this.avatar(w))}</div>
      </div>
      <ul class="notes">
        ${g.wishes.map(
          (w) => html`<li title=${new Date(w.created_at).toLocaleString(lang)}>
            ${t(lang, "wished_ago", { name: w.user_name, when: relativeTime(w.created_at, lang) })}${w.note
              ? html`: <span class="note">${w.note}</span>`
              : nothing}
          </li>`,
        )}
      </ul>
      <div class="actions">
        <button class="btn primary" @click=${() => this.cooked(g)}>${t(lang, "cooked")}</button>
        ${mine ? html`<button class="btn" @click=${() => this.removeMine(mine)}>${t(lang, "wish_remove")}</button>` : nothing}
      </div>
    </div>`;
  }

  protected override render() {
    if (!this._hass || !this.store) return html`<div class="card muted">…</div>`;
    const lang = this.uiLang;
    const store = this.store;
    const cfg = this.config;
    const groups = store.loaded ? this.groups().slice(0, this.inPicker ? 1 : undefined) : [];
    const doneShown = this.groupDone();
    return html`
      <div class="card">
        <header>
          <h1>${cfg.title ?? t(lang, "wishes_title")}</h1>
          <button class="btn" @click=${() => void this.picker.open()}>${t(lang, "add_wish")}</button>
        </header>
        ${!store.loaded
          ? html`<p class="muted">${t(lang, "loading")}</p>`
          : groups.length === 0
            ? html`<p class="muted empty">${t(lang, "wishes_empty")}</p>`
            : html`<div class="groups ${cfg.layout === "grid" ? "grid" : ""}">${groups.map((g) => this.renderGroup(g))}</div>`}
        ${doneShown.length
          ? html`<h2>${t(lang, "recently_cooked")}</h2>
              <ul class="done">${doneShown.map((n) => html`<li>${n}</li>`)}</ul>`
          : nothing}
      </div>
      <es-recipe-dialog
        .hass=${this._hass}
        .categories=${store.categories}
        .shoppingList=${cfg.shopping_list}
        @edit=${(e: CustomEvent<Recipe>) => {
          this.recipeDialog.close();
          void this.editor.open(e.detail);
        }}
      ></es-recipe-dialog>
      <es-recipe-editor
        .hass=${this._hass}
        .categories=${store.categories}
        @saved=${(e: CustomEvent<Recipe>) => {
          void store.refresh();
          void this.recipeDialog.open(e.detail.id);
        }}
      ></es-recipe-editor>
      <es-recipe-picker
        .hass=${this._hass}
        .recipes=${store.recipes}
        .categories=${store.categories}
        @picked=${this.onPicked}
      ></es-recipe-picker>
    `;
  }

  /** Distinct recently cooked dish names, limited to `show_done`. */
  private groupDone(): string[] {
    const n = Number(this.config.show_done ?? 0);
    if (!n) return [];
    return [...new Set(this.done.map((w) => w.recipe_name))].slice(0, n);
  }
}

if (!customElements.get("essensplan-wishes-card")) {
  customElements.define("essensplan-wishes-card", EssensplanWishesCard);
}
