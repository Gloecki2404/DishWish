import { css, html, LitElement, nothing } from "lit";
import { createCategory, createRecipe, errorCode, parseIngredients, updateRecipe, uploadImage } from "../api";
import { getStore } from "../data-store";
import { t, tError } from "../i18n";
import { icon, paths } from "../icons";
import { sharedStyles } from "../styles";
import type { Category, HomeAssistant, Ingredient, Recipe, RecipeInput } from "../types";
import { resizeImage } from "../utils/image";
import "./base-dialog";
import type { EsDialog } from "./base-dialog";

const MAX_IMAGES = 10;

interface IngRow {
  amount: string;
  unit: string;
  name: string;
  note: string;
  group_name: string | null;
}

interface Draft {
  name: string;
  description: string;
  servings: number;
  prep: string;
  cook: string;
  notes: string;
  private: boolean;
  source_url: string | null;
  source_name: string | null;
  category_ids: string[];
  image_ids: string[];
  ingredients: IngRow[];
  steps: { section: string | null; text: string }[];
}

const thumb = (id: string) => `/api/essensplan/images/${id}/thumb`;

const fmtNum = (n: number | null): string => (n === null ? "" : String(n).replace(".", ","));

function parseNum(text: string): number | null {
  const s = text.trim().replace(",", ".");
  if (!s) return null;
  const frac = /^(\d+)\/(\d+)$/.exec(s);
  const v = frac ? Number(frac[1]) / Number(frac[2]) : Number(s);
  return Number.isFinite(v) && v >= 0 ? v : null;
}

/** "2", "1,5" or a range "2-3" -> [quantity, quantity_max] */
function parseAmount(text: string): [number | null, number | null] {
  const m = /^\s*([\d.,/]+)\s*(?:[-–]\s*([\d.,/]+))?\s*$/.exec(text);
  if (!m) return [null, null];
  const q = parseNum(m[1]);
  const max = m[2] ? parseNum(m[2]) : null;
  return [q, q !== null && max !== null && max > q ? max : null];
}

function rowFromIngredient(ing: Ingredient): IngRow {
  const amount =
    ing.quantity === null ? "" : fmtNum(ing.quantity) + (ing.quantity_max !== null ? `-${fmtNum(ing.quantity_max)}` : "");
  return { amount, unit: ing.unit, name: ing.name, note: ing.note, group_name: ing.group_name };
}

function emptyDraft(): Draft {
  return {
    name: "",
    description: "",
    servings: 4,
    prep: "",
    cook: "",
    notes: "",
    private: false,
    source_url: null,
    source_name: null,
    category_ids: [],
    image_ids: [],
    ingredients: [{ amount: "", unit: "", name: "", note: "", group_name: null }],
    steps: [{ section: null, text: "" }],
  };
}

function draftFrom(src: Recipe | RecipeInput): Draft {
  const image_ids = "images" in src ? src.images.map((i) => i.id) : src.image_ids;
  return {
    name: src.name,
    description: src.description,
    servings: src.servings,
    prep: src.prep_minutes === null ? "" : String(src.prep_minutes),
    cook: src.cook_minutes === null ? "" : String(src.cook_minutes),
    notes: src.notes,
    private: src.visibility === "private",
    source_url: src.source_url,
    source_name: src.source_name,
    category_ids: [...src.category_ids],
    image_ids: [...image_ids],
    ingredients: src.ingredients.length ? src.ingredients.map(rowFromIngredient) : emptyDraft().ingredients,
    steps: src.steps.length ? src.steps.map((s) => ({ section: s.section, text: s.text })) : emptyDraft().steps,
  };
}

function move<T>(list: T[], i: number, delta: number): T[] {
  const j = i + delta;
  if (j < 0 || j >= list.length) return list;
  const copy = [...list];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

/** Create/edit a recipe. `open()` for new, `open(recipe)` to edit, `open(draft)` for imports. */
export class EsRecipeEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    categories: { attribute: false },
    draft: { state: true },
    uploading: { state: true },
    saving: { state: true },
    error: { state: true },
    pasteOpen: { state: true },
    pasteText: { state: true },
    newCategory: { state: true },
    confirmDiscard: { state: true },
  };
  declare hass: HomeAssistant;
  declare categories: Category[];
  declare draft: Draft;
  declare uploading: number;
  declare saving: boolean;
  declare error: string;
  declare pasteOpen: boolean;
  declare pasteText: string;
  declare newCategory: string;
  declare confirmDiscard: boolean;

  private recipeId: string | null = null;
  private snapshot = "";

  constructor() {
    super();
    this.categories = [];
    this.draft = emptyDraft();
    this.uploading = 0;
    this.saving = false;
    this.error = "";
    this.pasteOpen = false;
    this.pasteText = "";
    this.newCategory = "";
    this.confirmDiscard = false;
  }

  static override styles = [
    sharedStyles,
    css`
      section {
        margin-bottom: 20px;
      }
      h3 {
        margin: 0 0 8px;
        font-size: 1.05em;
      }
      .grid2 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
      }
      .chips,
      .photos,
      .row-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .photo {
        position: relative;
        width: 96px;
      }
      .photo img {
        width: 96px;
        height: 72px;
        object-fit: cover;
        border-radius: 8px;
      }
      .photo .row-actions {
        gap: 0;
        justify-content: space-between;
      }
      .photo .icon-btn {
        width: 32px;
        height: 32px;
      }
      .photo .icon-btn .icon {
        width: 18px;
        height: 18px;
      }
      .ing {
        display: grid;
        grid-template-columns: 80px 80px 1fr;
        gap: 6px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .ing .note {
        grid-column: 1 / 3;
      }
      .ing .row-actions {
        justify-content: flex-end;
      }
      .step {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 6px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .switch {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
      }
      .switch input {
        width: 22px;
        min-height: 22px;
        height: 22px;
      }
      input[type="file"] {
        display: none;
      }
      .add {
        margin-top: 8px;
      }
      .inline {
        display: flex;
        gap: 8px;
      }
      .confirm {
        margin-right: auto;
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
    `,
  ];

  private get dlg(): EsDialog {
    return this.renderRoot.querySelector("es-dialog") as EsDialog;
  }

  private get uiLang(): string {
    return this.hass?.locale?.language ?? "en";
  }

  /** New recipe (no argument), edit an existing one (Recipe), or review an import (RecipeInput). */
  async open(src?: Recipe | RecipeInput): Promise<void> {
    this.recipeId = src && "id" in src ? src.id : null;
    this.draft = src ? draftFrom(src) : emptyDraft();
    this.snapshot = JSON.stringify(this.draft);
    this.error = "";
    this.confirmDiscard = false;
    this.pasteOpen = false;
    this.pasteText = "";
    this.newCategory = "";
    await this.updateComplete;
    this.dlg.show();
  }

  private get dirty(): boolean {
    return JSON.stringify(this.draft) !== this.snapshot;
  }

  private patch(changes: Partial<Draft>): void {
    this.draft = { ...this.draft, ...changes };
  }

  private onCloseRequest(e: Event): void {
    if (this.dirty && !this.saving && !this.confirmDiscard) {
      e.preventDefault();
      this.confirmDiscard = true;
    }
  }

  // --- photos ---------------------------------------------------------------

  private async onFiles(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = "";
    for (const file of files) {
      if (this.draft.image_ids.length >= MAX_IMAGES) {
        this.error = t(this.uiLang, "max_images");
        break;
      }
      this.uploading++;
      try {
        const ref = await uploadImage(this.hass, await resizeImage(file));
        this.patch({ image_ids: [...this.draft.image_ids, ref.id] });
      } catch (err) {
        this.error = tError(this.uiLang, errorCode(err));
      }
      this.uploading--;
    }
  }

  // --- categories -------------------------------------------------------------

  private toggleCategory(id: string): void {
    const ids = this.draft.category_ids;
    this.patch({ category_ids: ids.includes(id) ? ids.filter((c) => c !== id) : [...ids, id] });
  }

  private async addCategory(): Promise<void> {
    const name = this.newCategory.trim();
    if (!name) return;
    try {
      const cat = await createCategory(this.hass.connection, name);
      this.newCategory = "";
      this.patch({ category_ids: [...this.draft.category_ids, cat.id] });
      await getStore(this.hass).refresh();
    } catch (err) {
      this.error = tError(this.uiLang, errorCode(err));
    }
  }

  // --- ingredients / steps ------------------------------------------------------

  private setIng(i: number, changes: Partial<IngRow>): void {
    const rows = this.draft.ingredients.map((r, k) => (k === i ? { ...r, ...changes } : r));
    this.patch({ ingredients: rows });
  }

  private async applyPaste(): Promise<void> {
    const lines = this.pasteText.split("\n").filter((l) => l.trim());
    if (!lines.length) return;
    try {
      const parsed = await parseIngredients(this.hass.connection, lines.slice(0, 100));
      const kept = this.draft.ingredients.filter((r) => r.name.trim() || r.amount.trim());
      this.patch({ ingredients: [...kept, ...parsed.map(rowFromIngredient)] });
      this.pasteText = "";
      this.pasteOpen = false;
    } catch (err) {
      this.error = tError(this.uiLang, errorCode(err));
    }
  }

  private setStep(i: number, text: string): void {
    this.patch({ steps: this.draft.steps.map((s, k) => (k === i ? { ...s, text } : s)) });
  }

  // --- save ---------------------------------------------------------------------

  private buildInput(): RecipeInput {
    const d = this.draft;
    const minutes = (s: string): number | null => {
      const n = parseInt(s, 10);
      return Number.isFinite(n) && n >= 0 ? Math.min(n, 1440) : null;
    };
    return {
      name: d.name.trim(),
      description: d.description.trim(),
      servings: d.servings,
      prep_minutes: minutes(d.prep),
      cook_minutes: minutes(d.cook),
      notes: d.notes.trim(),
      source_url: d.source_url,
      source_name: d.source_name,
      visibility: d.private ? "private" : "household",
      category_ids: d.category_ids,
      image_ids: d.image_ids,
      ingredients: d.ingredients
        .filter((r) => r.name.trim())
        .map((r) => {
          const [quantity, quantity_max] = parseAmount(r.amount);
          return {
            group_name: r.group_name,
            quantity,
            quantity_max,
            unit: r.unit.trim(),
            name: r.name.trim(),
            note: r.note.trim(),
          };
        }),
      steps: d.steps.filter((s) => s.text.trim()).map((s) => ({ section: s.section, text: s.text.trim() })),
    };
  }

  private async save(): Promise<void> {
    if (!this.draft.name.trim()) {
      this.error = t(this.uiLang, "name_required");
      return;
    }
    this.saving = true;
    this.error = "";
    try {
      const input = this.buildInput();
      const saved = this.recipeId
        ? await updateRecipe(this.hass.connection, this.recipeId, input)
        : await createRecipe(this.hass.connection, input);
      this.snapshot = JSON.stringify(this.draft);
      this.dispatchEvent(new CustomEvent("saved", { detail: saved }));
      this.dlg.close();
    } catch (err) {
      this.error = tError(this.uiLang, errorCode(err));
    }
    this.saving = false;
  }

  // --- render -------------------------------------------------------------------

  private renderPhotos() {
    const lang = this.uiLang;
    const ids = this.draft.image_ids;
    return html`<section>
      <h3>${t(lang, "photos")}</h3>
      <div class="photos">
        ${ids.map(
          (id, i) => html`<div class="photo">
            <img src=${thumb(id)} alt="" loading="lazy" />
            <div class="row-actions">
              <button class="icon-btn" aria-label=${t(lang, "move_up")} @click=${() => this.patch({ image_ids: move(ids, i, -1) })}>
                ${icon(paths.left)}
              </button>
              <button class="icon-btn" aria-label=${t(lang, "move_down")} @click=${() => this.patch({ image_ids: move(ids, i, 1) })}>
                ${icon(paths.right)}
              </button>
              <button class="icon-btn" aria-label=${t(lang, "remove")} @click=${() => this.patch({ image_ids: ids.filter((x) => x !== id) })}>
                ${icon(paths.close)}
              </button>
            </div>
          </div>`,
        )}
      </div>
      <div class="row-actions add">
        <button class="btn" @click=${() => (this.renderRoot.querySelector("#cam") as HTMLInputElement).click()}>
          ${icon(paths.camera)} ${t(lang, "camera")}
        </button>
        <button class="btn" @click=${() => (this.renderRoot.querySelector("#gal") as HTMLInputElement).click()}>
          ${icon(paths.image)} ${t(lang, "gallery")}
        </button>
        ${this.uploading ? html`<span class="muted">${t(lang, "uploading")}</span>` : nothing}
      </div>
      <input id="cam" type="file" accept="image/*" capture="environment" @change=${this.onFiles} />
      <input id="gal" type="file" accept="image/*" multiple @change=${this.onFiles} />
    </section>`;
  }

  private renderIngredients() {
    const lang = this.uiLang;
    const rows = this.draft.ingredients;
    return html`<section>
      <h3>${t(lang, "ingredients")}</h3>
      ${rows.map(
        (r, i) => html`<div class="ing">
          <input placeholder=${t(lang, "amount")} aria-label=${t(lang, "amount")} .value=${r.amount}
            @input=${(e: Event) => this.setIng(i, { amount: (e.target as HTMLInputElement).value })} />
          <input placeholder=${t(lang, "unit")} aria-label=${t(lang, "unit")} .value=${r.unit}
            @input=${(e: Event) => this.setIng(i, { unit: (e.target as HTMLInputElement).value })} />
          <input placeholder=${t(lang, "ingredient")} aria-label=${t(lang, "ingredient")} .value=${r.name}
            @input=${(e: Event) => this.setIng(i, { name: (e.target as HTMLInputElement).value })} />
          <input class="note" placeholder=${t(lang, "note")} aria-label=${t(lang, "note")} .value=${r.note}
            @input=${(e: Event) => this.setIng(i, { note: (e.target as HTMLInputElement).value })} />
          <div class="row-actions">
            <button class="icon-btn" aria-label=${t(lang, "move_up")} @click=${() => this.patch({ ingredients: move(rows, i, -1) })}>${icon(paths.arrowUp)}</button>
            <button class="icon-btn" aria-label=${t(lang, "move_down")} @click=${() => this.patch({ ingredients: move(rows, i, 1) })}>${icon(paths.arrowDown)}</button>
            <button class="icon-btn" aria-label=${t(lang, "remove")} @click=${() => this.patch({ ingredients: rows.filter((_, k) => k !== i) })}>${icon(paths.delete)}</button>
          </div>
        </div>`,
      )}
      <div class="row-actions add">
        <button class="btn" @click=${() => this.patch({ ingredients: [...rows, { amount: "", unit: "", name: "", note: "", group_name: null }] })}>
          ${icon(paths.plus)} ${t(lang, "add_ingredient")}
        </button>
        <button class="btn" @click=${() => (this.pasteOpen = !this.pasteOpen)}>${t(lang, "paste_lines")}</button>
      </div>
      ${this.pasteOpen
        ? html`<div class="add">
            <textarea rows="6" placeholder=${t(lang, "paste_hint")} .value=${this.pasteText}
              @input=${(e: Event) => (this.pasteText = (e.target as HTMLTextAreaElement).value)}></textarea>
            <button class="btn add" @click=${() => this.applyPaste()}>${t(lang, "apply_lines")}</button>
          </div>`
        : nothing}
    </section>`;
  }

  private renderSteps() {
    const lang = this.uiLang;
    const steps = this.draft.steps;
    return html`<section>
      <h3>${t(lang, "steps")}</h3>
      ${steps.map(
        (s, i) => html`<div class="step">
          <textarea rows="3" aria-label=${`${t(lang, "step")} ${i + 1}`} placeholder=${`${t(lang, "step")} ${i + 1}`} .value=${s.text}
            @input=${(e: Event) => this.setStep(i, (e.target as HTMLTextAreaElement).value)}></textarea>
          <div class="row-actions">
            <button class="icon-btn" aria-label=${t(lang, "move_up")} @click=${() => this.patch({ steps: move(steps, i, -1) })}>${icon(paths.arrowUp)}</button>
            <button class="icon-btn" aria-label=${t(lang, "move_down")} @click=${() => this.patch({ steps: move(steps, i, 1) })}>${icon(paths.arrowDown)}</button>
            <button class="icon-btn" aria-label=${t(lang, "remove")} @click=${() => this.patch({ steps: steps.filter((_, k) => k !== i) })}>${icon(paths.delete)}</button>
          </div>
        </div>`,
      )}
      <button class="btn add" @click=${() => this.patch({ steps: [...steps, { section: null, text: "" }] })}>
        ${icon(paths.plus)} ${t(lang, "add_step")}
      </button>
    </section>`;
  }

  protected override render() {
    const lang = this.uiLang;
    const d = this.draft;
    return html`<es-dialog
      .heading=${this.recipeId ? t(lang, "edit_recipe") : t(lang, "new_recipe")}
      .closeLabel=${t(lang, "close")}
      @close-request=${this.onCloseRequest}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      <section>
        <label class="field">${t(lang, "name")}
          <input .value=${d.name} maxlength="200" @input=${(e: Event) => this.patch({ name: (e.target as HTMLInputElement).value })} />
        </label>
      </section>
      ${this.renderPhotos()}
      <section>
        <div class="grid2">
          <label class="field">${t(lang, "servings")}
            <input type="number" min="1" max="100" .value=${String(d.servings)}
              @input=${(e: Event) => this.patch({ servings: Math.min(100, Math.max(1, parseInt((e.target as HTMLInputElement).value, 10) || 1)) })} />
          </label>
          <label class="field">${t(lang, "prep_minutes")}
            <input type="number" min="0" max="1440" .value=${d.prep}
              @input=${(e: Event) => this.patch({ prep: (e.target as HTMLInputElement).value })} />
          </label>
          <label class="field">${t(lang, "cook_minutes")}
            <input type="number" min="0" max="1440" .value=${d.cook}
              @input=${(e: Event) => this.patch({ cook: (e.target as HTMLInputElement).value })} />
          </label>
        </div>
      </section>
      <section>
        <h3>${t(lang, "categories")}</h3>
        <div class="chips">
          ${this.categories.map(
            (c) => html`<button class="chip" aria-pressed=${d.category_ids.includes(c.id)} @click=${() => this.toggleCategory(c.id)}>${c.name}</button>`,
          )}
        </div>
        <div class="inline add">
          <input placeholder=${t(lang, "new_category")} .value=${this.newCategory}
            @input=${(e: Event) => (this.newCategory = (e.target as HTMLInputElement).value)}
            @keydown=${(e: KeyboardEvent) => e.key === "Enter" && this.addCategory()} />
          <button class="btn" @click=${() => this.addCategory()}>${icon(paths.plus)}</button>
        </div>
      </section>
      <section>
        <label class="field">${t(lang, "description")}
          <textarea rows="2" .value=${d.description} @input=${(e: Event) => this.patch({ description: (e.target as HTMLTextAreaElement).value })}></textarea>
        </label>
      </section>
      ${this.renderIngredients()} ${this.renderSteps()}
      <section>
        <label class="field">${t(lang, "notes")}
          <textarea rows="3" .value=${d.notes} @input=${(e: Event) => this.patch({ notes: (e.target as HTMLTextAreaElement).value })}></textarea>
        </label>
      </section>
      <section>
        <label class="switch">
          <input type="checkbox" .checked=${d.private} @change=${(e: Event) => this.patch({ private: (e.target as HTMLInputElement).checked })} />
          ${t(lang, "only_me_switch")}
        </label>
        ${d.source_url ? html`<p class="muted">${t(lang, "source")}: ${d.source_name ?? d.source_url}</p>` : nothing}
      </section>
      ${this.error ? html`<p class="error">${this.error}</p>` : nothing}
      ${this.confirmDiscard
        ? html`<div slot="footer" class="confirm">
            <span>${t(lang, "discard_confirm")}</span>
            <button class="btn danger" @click=${() => { this.snapshot = JSON.stringify(this.draft); this.dlg.close(); }}>${t(lang, "discard")}</button>
            <button class="btn" @click=${() => (this.confirmDiscard = false)}>${t(lang, "keep_editing")}</button>
          </div>`
        : html`<button slot="footer" class="btn" @click=${() => this.dlg.requestClose()}>${t(lang, "cancel")}</button>
          <button slot="footer" class="btn primary" ?disabled=${this.saving || this.uploading > 0} @click=${() => this.save()}>
            ${this.saving ? t(lang, "saving") : t(lang, "save")}
          </button>`}
    </es-dialog>`;
  }
}

if (!customElements.get("es-recipe-editor")) customElements.define("es-recipe-editor", EsRecipeEditor);
