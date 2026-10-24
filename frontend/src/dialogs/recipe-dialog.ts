import { css, html, LitElement, nothing } from "lit";
import { addWish, deleteRecipe, errorCode, getRecipe, removeWish } from "../api";
import { icon, paths } from "../icons";
import { t, tError } from "../i18n";
import { sharedStyles } from "../styles";
import type { Category, HomeAssistant, Recipe } from "../types";
import { notify } from "../utils/notify";
import "../components/recipe-view";
import "./base-dialog";
import type { DwDialog } from "./base-dialog";

/** Read-only recipe view with servings scaling. Open with `open(recipeId)`. */
export class DwRecipeDialog extends LitElement {
  static override properties = {
    hass: { attribute: false },
    categories: { attribute: false },
    shoppingList: { attribute: false },
    wishOpen: { state: true },
    wishNote: { state: true },
    recipe: { state: true },
    loading: { state: true },
    error: { state: true },
    confirmDelete: { state: true },
  };
  declare hass: HomeAssistant;
  declare categories: Category[];
  declare shoppingList: string | undefined;
  declare wishOpen: boolean;
  declare wishNote: string;
  declare recipe: Recipe | null;
  declare loading: boolean;
  declare error: string;
  declare confirmDelete: boolean;

  constructor() {
    super();
    this.categories = [];
    this.wishOpen = false;
    this.wishNote = "";
    this.recipe = null;
    this.loading = false;
    this.error = "";
    this.confirmDelete = false;
  }

  static override styles = [
    sharedStyles,
    css`
      dw-recipe-view {
        --dw-bleed: 20px;
      }
      .wishbox {
        margin-right: auto;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }
      .wishbox input {
        width: 220px;
      }
      .confirm {
        margin-right: auto;
        display: flex;
        gap: 8px;
        align-items: center;
      }
    `,
  ];

  private get dlg(): DwDialog {
    return this.renderRoot.querySelector("dw-dialog") as DwDialog;
  }

  private get uiLang(): string {
    return this.hass?.locale?.language ?? "en";
  }

  async open(recipeId: string): Promise<void> {
    this.recipe = null;
    this.error = "";
    this.confirmDelete = false;
    this.wishOpen = false;
    this.wishNote = "";
    this.loading = true;
    await this.updateComplete;
    this.dlg.show();
    try {
      this.recipe = await getRecipe(this.hass.connection, recipeId);
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

  private async reload(): Promise<void> {
    if (this.recipe) this.recipe = await getRecipe(this.hass.connection, this.recipe.id);
  }

  private async toggleWish(): Promise<void> {
    const r = this.recipe;
    if (!r) return;
    const lang = this.uiLang;
    try {
      if (r.my_wish_id) await removeWish(this.hass.connection, r.my_wish_id);
      else {
        await addWish(this.hass.connection, r.id, this.wishNote.trim());
        notify(this, t(lang, "wish_added"));
      }
      this.wishOpen = false;
      this.wishNote = "";
      await this.reload();
    } catch (err) {
      notify(this, tError(lang, errorCode(err)));
    }
  }

  private renderWish(r: Recipe) {
    const lang = this.uiLang;
    if (r.my_wish_id) {
      return html`<button slot="footer" class="btn" @click=${() => this.toggleWish()}>
        ${t(lang, "wish_remove")}
      </button>`;
    }
    if (!this.wishOpen) {
      return html`<button slot="footer" class="btn" @click=${() => (this.wishOpen = true)}>
        ♥ ${t(lang, "wish_add")}
      </button>`;
    }
    return html`<div slot="footer" class="wishbox">
      <input
        placeholder=${t(lang, "wish_note")}
        aria-label=${t(lang, "wish_note")}
        maxlength="500"
        .value=${this.wishNote}
        @input=${(e: Event) => (this.wishNote = (e.target as HTMLInputElement).value)}
        @keydown=${(e: KeyboardEvent) => e.key === "Enter" && this.toggleWish()}
      />
      <button class="btn primary" @click=${() => this.toggleWish()}>${t(lang, "wish_send")}</button>
    </div>`;
  }

  private renderFooter(r: Recipe) {
    const lang = this.uiLang;
    if (this.confirmDelete) {
      return html`<div slot="footer" class="confirm">
        <span>${t(lang, "delete_confirm")}</span>
        <button class="btn danger" @click=${() => this.doDelete()}>${t(lang, "delete")}</button>
        <button class="btn" @click=${() => (this.confirmDelete = false)}>${t(lang, "cancel")}</button>
      </div>`;
    }
    return html`${this.renderWish(r)}
    ${r.can_edit
      ? html`<button slot="footer" class="btn danger" @click=${() => (this.confirmDelete = true)}>
            ${icon(paths.delete)} ${t(lang, "delete")}
          </button>
          <button
            slot="footer"
            class="btn primary"
            @click=${() => this.dispatchEvent(new CustomEvent("edit", { detail: r }))}
          >
            ${icon(paths.edit)} ${t(lang, "edit")}
          </button>`
      : nothing}`;
  }
  protected override render() {
    const lang = this.uiLang;
    return html`<dw-dialog
      .heading=${this.recipe?.name ?? ""}
      .closeLabel=${t(lang, "close")}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      ${this.loading ? html`<p class="muted">${t(lang, "loading")}</p>` : nothing}
      ${this.error ? html`<p class="error">${this.error}</p>` : nothing}
      ${this.recipe
        ? html`<dw-recipe-view
            .hass=${this.hass}
            .recipe=${this.recipe}
            .categories=${this.categories}
            .shoppingList=${this.shoppingList}
          ></dw-recipe-view>`
        : nothing}
      ${this.recipe ? this.renderFooter(this.recipe) : nothing}
    </dw-dialog>`;
  }
}

if (!customElements.get("dw-recipe-dialog")) customElements.define("dw-recipe-dialog", DwRecipeDialog);
