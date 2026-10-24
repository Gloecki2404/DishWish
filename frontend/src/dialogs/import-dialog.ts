import { css, html, LitElement, nothing } from "lit";
import { errorCode, importUrl } from "../api";
import { t, tError } from "../i18n";
import { sharedStyles } from "../styles";
import type { HomeAssistant } from "../types";
import "./base-dialog";
import type { DwDialog } from "./base-dialog";

/** Ask for a recipe link; fires `imported` with the draft (RecipeInput). Nothing is saved here. */
export class DwImportDialog extends LitElement {
  static override properties = {
    hass: { attribute: false },
    url: { state: true },
    loading: { state: true },
    error: { state: true },
  };
  declare hass: HomeAssistant;
  declare url: string;
  declare loading: boolean;
  declare error: string;

  constructor() {
    super();
    this.url = "";
    this.loading = false;
    this.error = "";
  }

  static override styles = [
    sharedStyles,
    css`
      .row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
    `,
  ];

  private get dlg(): DwDialog {
    return this.renderRoot.querySelector("dw-dialog") as DwDialog;
  }

  private get uiLang(): string {
    return this.hass?.locale?.language ?? "en";
  }

  async open(): Promise<void> {
    this.url = "";
    this.error = "";
    this.loading = false;
    await this.updateComplete;
    this.dlg.show();
  }

  private async load(): Promise<void> {
    const url = this.url.trim();
    if (!url || this.loading) return;
    this.loading = true;
    this.error = "";
    try {
      const draft = await importUrl(this.hass.connection, url);
      this.dispatchEvent(new CustomEvent("imported", { detail: draft }));
      this.dlg.close();
    } catch (err) {
      this.error = tError(this.uiLang, errorCode(err));
    }
    this.loading = false;
  }

  protected override render() {
    const lang = this.uiLang;
    return html`<dw-dialog
      .heading=${t(lang, "import_title")}
      .closeLabel=${t(lang, "close")}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      <p class="muted">${t(lang, "import_hint")}</p>
      <div class="row">
        <input
          type="url"
          inputmode="url"
          placeholder="https://"
          aria-label=${t(lang, "import_url")}
          .value=${this.url}
          ?disabled=${this.loading}
          @input=${(e: Event) => (this.url = (e.target as HTMLInputElement).value)}
          @keydown=${(e: KeyboardEvent) => e.key === "Enter" && this.load()}
        />
        <button class="btn primary" ?disabled=${this.loading || !this.url.trim()} @click=${() => this.load()}>
          ${t(lang, "import_load")}
        </button>
      </div>
      ${this.loading ? html`<p class="muted">${t(lang, "import_loading")}</p>` : nothing}
      ${this.error ? html`<p class="error">${this.error}</p>` : nothing}
    </dw-dialog>`;
  }
}

if (!customElements.get("dw-import-dialog")) customElements.define("dw-import-dialog", DwImportDialog);
