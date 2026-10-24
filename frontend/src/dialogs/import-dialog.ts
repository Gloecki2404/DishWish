import { css, html, LitElement, nothing } from "lit";
import { errorCode, importPhotos, importUrl, uploadImage } from "../api";
import { t, tError } from "../i18n";
import { icon, paths } from "../icons";
import { sharedStyles } from "../styles";
import type { HomeAssistant } from "../types";
import { resizeImage } from "../utils/image";
import "./base-dialog";
import type { DwDialog } from "./base-dialog";

const MAX_PHOTOS = 4;

interface Photo {
  file: File;
  preview: string;
}

/** Ask for a recipe link or photos of a cookbook page; fires `imported` with the draft (RecipeInput). Nothing is saved here. */
export class DwImportDialog extends LitElement {
  static override properties = {
    hass: { attribute: false },
    url: { state: true },
    loading: { state: true },
    error: { state: true },
    photos: { state: true },
    reading: { state: true },
  };
  declare hass: HomeAssistant;
  declare url: string;
  declare loading: boolean;
  declare error: string;
  declare photos: Photo[];
  declare reading: boolean;

  constructor() {
    super();
    this.url = "";
    this.loading = false;
    this.error = "";
    this.photos = [];
    this.reading = false;
  }

  static override styles = [
    sharedStyles,
    css`
      .row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      h3 {
        margin: 24px 0 4px;
        font-size: 1.05em;
      }
      input[type="file"] {
        display: none;
      }
      .photos {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
      .photo {
        position: relative;
        width: 96px;
      }
      .photo img {
        width: 96px;
        height: 128px;
        object-fit: cover;
        border-radius: 8px;
        display: block;
      }
      .photo .icon-btn {
        position: absolute;
        top: 0;
        right: 0;
        width: 32px;
        height: 32px;
        background: var(--card-background-color);
        border-radius: 50%;
      }
      .photo .icon-btn .icon {
        width: 18px;
        height: 18px;
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
    this.clearPhotos();
    await this.updateComplete;
    this.dlg.show();
  }

  private clearPhotos(): void {
    this.photos.forEach((p) => URL.revokeObjectURL(p.preview));
    this.photos = [];
  }

  private addPhotos(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = "";
    const room = MAX_PHOTOS - this.photos.length;
    this.photos = [
      ...this.photos,
      ...files.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ];
  }

  private removePhoto(index: number): void {
    URL.revokeObjectURL(this.photos[index].preview);
    this.photos = this.photos.filter((_, i) => i !== index);
  }

  private async readPhotos(): Promise<void> {
    if (!this.photos.length || this.reading) return;
    this.reading = true;
    this.error = "";
    try {
      const ids: string[] = [];
      for (const photo of this.photos) ids.push((await uploadImage(this.hass, await resizeImage(photo.file))).id);
      const draft = await importPhotos(this.hass.connection, ids);
      this.dispatchEvent(new CustomEvent("imported", { detail: draft }));
      this.clearPhotos();
      this.dlg.close();
    } catch (err) {
      this.error = tError(this.uiLang, errorCode(err));
    }
    this.reading = false;
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
    return html`<dw-dialog exportparts="dialog,header,title,close-button,body,footer"
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
      <h3>${t(lang, "import_photo_title")}</h3>
      <p class="muted">${t(lang, "import_photo_hint")}</p>
      <div class="row">
        <button class="btn" ?disabled=${this.reading || this.photos.length >= MAX_PHOTOS}
          @click=${() => (this.renderRoot.querySelector("#cam") as HTMLInputElement).click()}>
          ${icon(paths.camera)} ${t(lang, "camera")}
        </button>
        <button class="btn" ?disabled=${this.reading || this.photos.length >= MAX_PHOTOS}
          @click=${() => (this.renderRoot.querySelector("#gal") as HTMLInputElement).click()}>
          ${icon(paths.image)} ${t(lang, "gallery")}
        </button>
      </div>
      <input id="cam" type="file" accept="image/*" capture="environment" @change=${this.addPhotos} />
      <input id="gal" type="file" accept="image/*" multiple @change=${this.addPhotos} />
      ${this.photos.length
        ? html`<div class="photos">
              ${this.photos.map(
                (p, i) => html`<div class="photo">
                  <img src=${p.preview} alt="" />
                  <button class="icon-btn" aria-label=${t(lang, "photo_remove")} ?disabled=${this.reading}
                    @click=${() => this.removePhoto(i)}>${icon(paths.close)}</button>
                </div>`,
              )}
            </div>
            <div class="row">
              <button class="btn primary" ?disabled=${this.reading} @click=${() => this.readPhotos()}>
                ${t(lang, "import_photo_read")}
              </button>
            </div>`
        : nothing}
      ${this.reading ? html`<p class="muted">${t(lang, "import_photo_reading")}</p>` : nothing}
      ${this.error ? html`<p class="error">${this.error}</p>` : nothing}
    </dw-dialog>`;
  }
}

if (!customElements.get("dw-import-dialog")) customElements.define("dw-import-dialog", DwImportDialog);
