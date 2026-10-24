import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { addToShopping, errorCode } from "../api";
import { t, tError } from "../i18n";
import { icon, paths } from "../icons";
import { sharedStyles } from "../styles";
import type { Category, HomeAssistant, Recipe } from "../types";
import { notify } from "../utils/notify";
import { formatIngredientAmount } from "../utils/scale";

/**
 * Recipe content with servings scaling, ingredient selection and shopping button.
 * Shared by the recipe dialog and the recipe card. Fires `cook` ({servings}) when the cook button is used.
 */
export class DwRecipeView extends LitElement {
  static override properties = {
    hass: { attribute: false },
    recipe: { attribute: false },
    categories: { attribute: false },
    shoppingList: { attribute: false },
    showIngredients: { type: Boolean },
    showSteps: { type: Boolean },
    cookable: { type: Boolean },
    servings: { state: true },
    selected: { state: true },
    doneSteps: { state: true },
  };
  declare hass: HomeAssistant;
  declare recipe: Recipe | null;
  declare categories: Category[];
  declare shoppingList: string | undefined;
  declare showIngredients: boolean;
  declare showSteps: boolean;
  declare cookable: boolean;
  declare servings: number;
  declare selected: Set<number>;
  declare doneSteps: Set<number>;

  constructor() {
    super();
    this.recipe = null;
    this.categories = [];
    this.showIngredients = true;
    this.showSteps = true;
    this.cookable = false;
    this.servings = 4;
    this.selected = new Set();
    this.doneSteps = new Set();
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .gallery {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        margin: 0 calc(-1 * var(--dw-bleed, 0px)) 12px;
        padding: 0 var(--dw-bleed, 0px);
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
        background: var(--dw-accent, var(--primary-color));
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
      .pick {
        flex: none;
        width: 22px;
        min-height: 22px;
        height: 22px;
        align-self: center;
      }
      .add {
        margin-top: 12px;
      }
    `,
  ];

  private get uiLang(): string {
    return this.hass?.locale?.language ?? "en";
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!changed.has("recipe") || !this.recipe) return;
    const prev = changed.get("recipe") as Recipe | null | undefined;
    if (prev?.id === this.recipe.id) return; // same dish reloaded: keep the user's choices
    this.servings = this.recipe.servings;
    this.selected = new Set(this.recipe.ingredients.map((i) => i.id!));
    this.doneSteps = new Set();
  }

  private async addToList(): Promise<void> {
    const r = this.recipe;
    if (!r) return;
    const lang = this.uiLang;
    try {
      const res = await addToShopping(this.hass.connection, r.id, {
        servings: this.servings,
        ingredient_ids: [...this.selected],
        ...(this.shoppingList ? { entity_id: this.shoppingList } : {}),
      });
      notify(this, t(lang, "shop_result", { added: res.added.length, skipped: res.skipped.length }));
    } catch (err) {
      notify(this, tError(lang, errorCode(err)));
    }
  }

  private toggleIngredient(id: number): void {
    const next = new Set(this.selected);
    if (!next.delete(id)) next.add(id);
    this.selected = next;
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
              <input
                type="checkbox"
                class="pick"
                aria-label=${ing.name}
                .checked=${this.selected.has(ing.id!)}
                @change=${() => this.toggleIngredient(ing.id!)}
              />
              <span class="amt">${formatIngredientAmount(ing, r.servings, this.servings, this.uiLang)}</span>
              <span>${ing.name}${ing.note ? html` <span class="muted">(${ing.note})</span>` : nothing}</span>
            </li>`,
          )}
        </ul>
      `,
    );
  }

  protected override render() {
    const r = this.recipe;
    if (!r) return nothing;
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
      ${this.cookable && r.steps.length
        ? html`<button class="btn primary" @click=${() => this.dispatchEvent(new CustomEvent("cook", { detail: { servings: this.servings } }))}>
            ${t(lang, "cook_mode")}
          </button>`
        : nothing}
      ${this.showIngredients
        ? html`<div class="meta">
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
            ${r.ingredients.length
              ? html`<button class="btn add" ?disabled=${this.selected.size === 0} @click=${() => this.addToList()}>
                  ${t(lang, "shop_n", { n: this.selected.size })}
                </button>`
              : nothing}`
        : nothing}
      ${this.showSteps && r.steps.length
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
}

if (!customElements.get("dw-recipe-view")) customElements.define("dw-recipe-view", DwRecipeView);