import { css, html, LitElement, nothing } from "lit";
import { t } from "../i18n";
import { sharedStyles } from "../styles";
import type { Category, HomeAssistant, RecipeSummary } from "../types";
import { normalize } from "../utils/search";
import "./base-dialog";
import type { EsDialog } from "./base-dialog";

const MAX_SHOWN = 80;

/** Compact searchable list to pick one dish. Fires `picked` with the recipe id. */
export class EsRecipePicker extends LitElement {
  static override properties = {
    hass: { attribute: false },
    recipes: { attribute: false },
    categories: { attribute: false },
    query: { state: true },
  };
  declare hass: HomeAssistant;
  declare recipes: RecipeSummary[];
  declare categories: Category[];
  declare query: string;

  constructor() {
    super();
    this.recipes = [];
    this.categories = [];
    this.query = "";
  }

  static override styles = [
    sharedStyles,
    css`
      .list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
        margin-top: 12px;
      }
      .item {
        display: flex;
        gap: 8px;
        align-items: center;
        min-height: 56px;
        padding: 0;
        border: none;
        border-radius: 8px;
        background: var(--secondary-background-color);
        text-align: left;
        cursor: pointer;
        overflow: hidden;
      }
      .item img,
      .item .ph {
        flex: none;
        width: 64px;
        height: 48px;
        object-fit: cover;
        background: var(--divider-color);
      }
      .item span {
        padding-right: 8px;
        line-height: 1.2;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    `,
  ];

  private get dlg(): EsDialog {
    return this.renderRoot.querySelector("es-dialog") as EsDialog;
  }

  private get uiLang(): string {
    return this.hass?.locale?.language ?? "en";
  }

  async open(): Promise<void> {
    this.query = "";
    await this.updateComplete;
    this.dlg.show();
  }

  private pick(id: string): void {
    this.dispatchEvent(new CustomEvent("picked", { detail: id }));
    this.dlg.close();
  }

  private filtered(): RecipeSummary[] {
    const q = normalize(this.query.trim());
    if (!q) return this.recipes;
    const names = new Map(this.categories.map((c) => [c.id, normalize(c.name)]));
    return this.recipes.filter((r) => {
      const hay = `${normalize(r.name)} ${r.category_ids.map((id) => names.get(id) ?? "").join(" ")}`;
      return q.split(/\s+/).every((w) => hay.includes(w));
    });
  }

  protected override render() {
    const lang = this.uiLang;
    const found = this.filtered();
    return html`<es-dialog .heading=${t(lang, "picker_title")} .closeLabel=${t(lang, "close")}>
      <input
        type="search"
        placeholder=${t(lang, "search")}
        aria-label=${t(lang, "search")}
        .value=${this.query}
        @input=${(e: Event) => (this.query = (e.target as HTMLInputElement).value)}
      />
      ${found.length === 0 ? html`<p class="muted">${t(lang, "no_results")}</p>` : nothing}
      <div class="list">
        ${found.slice(0, MAX_SHOWN).map(
          (r) => html`<button class="item" @click=${() => this.pick(r.id)}>
            ${r.thumb_url
              ? html`<img src=${r.thumb_url} alt="" loading="lazy" decoding="async" />`
              : html`<div class="ph"></div>`}
            <span>${r.name}</span>
          </button>`,
        )}
      </div>
    </es-dialog>`;
  }
}

if (!customElements.get("es-recipe-picker")) customElements.define("es-recipe-picker", EsRecipePicker);
