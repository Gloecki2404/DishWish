import { css, html, LitElement, nothing } from "lit";
import { deleteRecipe, errorCode, getRecipe } from "../api";
import { icon, paths } from "../icons";
import { t, tError } from "../i18n";
import { sharedStyles } from "../styles";
import type { Category, HomeAssistant, Recipe } from "../types";
import { formatIngredientAmount } from "../utils/scale";
import "./base-dialog";
import type { EsDialog } from "./base-dialog";

/** Read-only recipe view with servings scaling. Open with `open(recipeId)`. */
export class EsRecipeDialog extends LitElement {
  static override properties = {
    hass: { attribute: false },
    categories: { attribute: false },
    recipe: { state: true },
    servings: { state: true },
    loading: { state: true },
    error: { state: true },
    doneSteps: { state: true },
    confirmDelete: { state: true },
  };
  declare hass: HomeAssistant;
  declare categories: Category[];
  declare recipe: Recipe | null;
  declare servings: number;
  declare loading: boolean;
  declare error: string;
  declare doneSteps: Set<number>;
  declare confirmDelete: boolean;

  constructor() {
    super();
    this.categories = [];
    this.recipe = null;
    this.servings = 4;
    this.loading = false;
    this.error = "";
    this.doneSteps = new Set();
    this.confirmDelete = false;
  }

  static override styles = [
    sharedStyles,
    css`
      .gallery {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        margin: 0 -20px 12px;
        padding: 0 20px;
      }
      .gallery img,
      .gallery .ph {
        flex: none;
        width: 100%;
        max-height: 360px;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 8px;
        scroll-snap-align: center;
        background: var(--secondary-background-color);
      }
      .gallery .ph {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin-bottom: 12px;
      }
      .tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 10px;
        border-radius: 12px;
        background: var(--secondary-background-color);
        font-size: 0.9em;
      }
      .servings {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }
      .servings output {
        min-width: 7ch;
        text-align: center;
      }
      h3 {
        margin: 20px 0 8px;
        font-size: 1.05em;
      }
      h4 {
        margin: 12px 0 4px;
        font-size: 0.95em;
        color: var(--secondary-text-color);
      }
      ul.ing {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      ul.ing li {
        display: flex;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .amt {
        flex: none;
        min-width: 8ch;
        font-weight: 500;
        text-align: right;
      }
      ol.steps {
        list-style: none;
        counter-reset: s;
        margin: 0;
        padding: 0;
      }
      ol.steps li {
        counter-increment: s;
        display: flex;
        gap: 12px;
        padding: 10px 0;
        cursor: pointer;
        min-height: 44px;
      }
      ol.steps li::before {
        content: counter(s);
        flex: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        text-align: center;
        line-height: 28px;
        font-size: 0.9em;
      }
      ol.steps li.done {
        opacity: 0.5;
        text-decoration: line-through;
      }
      .notes {
        white-space: pre-wrap;
      }
      .confirm {
        margin-right: auto;
        display: flex;
        gap: 8px;
        align-items: center;
      }
    `,
  ];

  private get dlg(): EsDialog {
    return this.renderRoot.querySelector("es-dialog") as EsDialog;
  }

  private get uiLang(): string {
    return this.hass?.locale?.language ?? "en";
  }

  async open(recipeId: string): Promise<void> {
    this.recipe = null;
    this.error = "";
    this.confirmDelete = false;
    this.doneSteps = new Set();
    this.loading = true;
    await this.updateComplete;
    this.dlg.show();
    try {
      this.recipe = await getRecipe(this.hass.connection, recipeId);
      this.servings = this.recipe.servings;
    } catch (err) {
      this.error = tError(this.uiLang, errorCode(err));
    }
    this.loading = false;
  }

  close(): void {
    this.dlg?.close();
  }

  private async doDelete(): Promise<void> {
    if (!this.recipe) return;
    try {
      await deleteRecipe(this.hass.connection, this.recipe.id);
      this.dispatchEvent(new CustomEvent("deleted", { detail: this.recipe.id }));
      this.close();
    } catch (err) {
      this.error = tError(this.uiLang, errorCode(err));
      this.confirmDelete = false;
    }
  }

  private toggleStep(i: number): void {
    const next = new Set(this.doneSteps);
    if (!next.delete(i)) next.add(i);
    this.doneSteps = next;
  }

  private setServings(n: number): void {
    this.servings = Math.min(100, Math.max(1, n));
  }

  private renderIngredients(r: Recipe) {
    const groups: { name: string | null; items: Recipe["ingredients"] }[] = [];
    for (const ing of r.ingredients) {
      const last = groups[groups.length - 1];
      if (last && last.name === ing.group_name) last.items.push(ing);
      else groups.push({ name: ing.group_name, items: [ing] });
    }
    return groups.map(
      (g) => html`
        ${g.name ? html`<h4>${g.name}</h4>` : nothing}
        <ul class="ing">
          ${g.items.map(
            (ing) => html`<li>
              <span class="amt">${formatIngredientAmount(ing, r.servings, this.servings, this.uiLang)}</span>
              <span>${ing.name}${ing.note ? html` <span class="muted">(${ing.note})</span>` : nothing}</span>
            </li>`,
          )}
        </ul>
      `,
    );
  }

  private renderBody(r: Recipe) {
    const lang = this.uiLang;
    const cats = r.category_ids
      .map((id) => this.categories.find((c) => c.id === id))
      .filter((c): c is Category => !!c);
    return html`
      <div class="gallery">
        ${r.images.length
          ? r.images.map((img) => html`<img src=${img.full_url} alt=${r.name} loading="lazy" decoding="async" />`)
          : html`<div class="ph">${icon(paths.food)}</div>`}
      </div>
      <div class="meta">
        ${cats.map((c) => html`<span class="tag">${c.name}</span>`)}
        ${r.prep_minutes !== null
          ? html`<span class="tag">${icon(paths.clock)} ${t(lang, "prep", { n: r.prep_minutes })}</span>`
          : nothing}
        ${r.cook_minutes !== null
          ? html`<span class="tag">${icon(paths.clock)} ${t(lang, "cook", { n: r.cook_minutes })}</span>`
          : nothing}
        ${r.visibility === "private" ? html`<span class="tag">${icon(paths.lock)} ${t(lang, "only_me")}</span>` : nothing}
      </div>
      ${r.description ? html`<p>${r.description}</p>` : nothing}
      <div class="meta">
        <h3 style="margin:0">${t(lang, "ingredients")}</h3>
        <span class="servings">
          <button class="icon-btn" aria-label=${t(lang, "fewer")} @click=${() => this.setServings(this.servings - 1)}>
            ${icon(paths.minus)}
          </button>
          <output>${t(lang, "servings_n", { n: this.servings })}</output>
          <button class="icon-btn" aria-label=${t(lang, "more")} @click=${() => this.setServings(this.servings + 1)}>
            ${icon(paths.plus)}
          </button>
        </span>
      </div>
      ${this.renderIngredients(r)}
      ${r.steps.length
        ? html`<h3>${t(lang, "steps")}</h3>
            <ol class="steps">
              ${r.steps.map(
                (s, i) => html`<li class=${this.doneSteps.has(i) ? "done" : ""} @click=${() => this.toggleStep(i)}>
                  <span>${s.section ? html`<strong>${s.section}</strong><br />` : nothing}${s.text}</span>
                </li>`,
              )}
            </ol>`
        : nothing}
      ${r.notes ? html`<h3>${t(lang, "notes")}</h3><p class="notes">${r.notes}</p>` : nothing}
      ${r.source_url
        ? html`<p>
            <a href=${r.source_url} target="_blank" rel="noopener noreferrer">
              ${t(lang, "source")}: ${r.source_name ?? r.source_url}
            </a>
          </p>`
        : nothing}
    `;
  }

  private renderFooter(r: Recipe) {
    const lang = this.uiLang;
    if (!r.can_edit) return nothing;
    return this.confirmDelete
      ? html`<div slot="footer" class="confirm">
            <span>${t(lang, "delete_confirm")}</span>
            <button class="btn danger" @click=${() => this.doDelete()}>${t(lang, "delete")}</button>
            <button class="btn" @click=${() => (this.confirmDelete = false)}>${t(lang, "cancel")}</button>
          </div>`
      : html`<button slot="footer" class="btn danger" @click=${() => (this.confirmDelete = true)}>
            ${icon(paths.delete)} ${t(lang, "delete")}
          </button>
          <button
            slot="footer"
            class="btn primary"
            @click=${() => this.dispatchEvent(new CustomEvent("edit", { detail: r }))}
          >
            ${icon(paths.edit)} ${t(lang, "edit")}
          </button>`;
  }

  protected override render() {
    const lang = this.uiLang;
    return html`<es-dialog
      .heading=${this.recipe?.name ?? ""}
      .closeLabel=${t(lang, "close")}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      ${this.loading ? html`<p class="muted">${t(lang, "loading")}</p>` : nothing}
      ${this.error ? html`<p class="error">${this.error}</p>` : nothing}
      ${this.recipe ? this.renderBody(this.recipe) : nothing}
      ${this.recipe ? this.renderFooter(this.recipe) : nothing}
    </es-dialog>`;
  }
}

if (!customElements.get("es-recipe-dialog")) customElements.define("es-recipe-dialog", EsRecipeDialog);
