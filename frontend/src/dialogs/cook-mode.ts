import { css, html, LitElement, nothing } from "lit";
import { t } from "../i18n";
import { sharedStyles } from "../styles";
import type { HomeAssistant, Recipe } from "../types";
import { formatIngredientAmount } from "../utils/scale";
import "./base-dialog";
import type { DwDialog } from "./base-dialog";

/** Full-screen, step-by-step cooking view with big text. Keeps the screen awake where supported. */
export class DwCookMode extends LitElement {
  static override properties = {
    hass: { attribute: false },
    recipe: { attribute: false },
    servings: { attribute: false },
    index: { state: true },
    showIngredients: { state: true },
  };
  declare hass: HomeAssistant;
  declare recipe: Recipe | null;
  declare servings: number;
  declare index: number;
  declare showIngredients: boolean;

  private wakeLock: WakeLockSentinel | null = null;
  private opened = false;

  constructor() {
    super();
    this.recipe = null;
    this.servings = 4;
    this.index = 0;
    this.showIngredients = false;
  }

  static override styles = [
    sharedStyles,
    css`
      .progress {
        height: 6px;
        border-radius: 3px;
        background: var(--secondary-background-color);
        overflow: hidden;
        margin-bottom: 8px;
      }
      .progress div {
        height: 100%;
        background: var(--dw-accent, var(--primary-color));
        transition: width 0.2s;
      }
      .count {
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .section {
        font-weight: 500;
        color: var(--dw-accent, var(--primary-color));
        margin-bottom: 8px;
        font-size: 1.1em;
      }
      .step {
        font-size: clamp(1.4rem, 4.5vw, 2.1rem);
        line-height: 1.5;
        white-space: pre-wrap;
      }
      .ings {
        margin: 16px 0 0;
        padding: 12px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        list-style: none;
      }
      .ings li {
        padding: 4px 0;
        font-size: 1.1em;
      }
      .ings b {
        display: inline-block;
        min-width: 8ch;
        text-align: right;
        margin-right: 8px;
      }
      .nav {
        display: flex;
        gap: 12px;
        width: 100%;
      }
      .nav .btn {
        flex: 1;
        min-height: 56px;
        font-size: 1.15em;
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
    this.index = 0;
    this.showIngredients = false;
    await this.updateComplete;
    this.dlg.show();
    this.opened = true;
    window.addEventListener("keydown", this.onKey);
    document.addEventListener("visibilitychange", this.onVisible);
    await this.lock();
  }

  private async lock(): Promise<void> {
    try {
      this.wakeLock = (await navigator.wakeLock?.request("screen")) ?? null;
    } catch {
      this.wakeLock = null; // not available or denied: cooking still works
    }
  }

  private onVisible = (): void => {
    if (this.opened && document.visibilityState === "visible") void this.lock();
  };

  private onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowRight") this.go(1);
    else if (e.key === "ArrowLeft") this.go(-1);
  };

  private onClosed(): void {
    this.opened = false;
    window.removeEventListener("keydown", this.onKey);
    document.removeEventListener("visibilitychange", this.onVisible);
    void this.wakeLock?.release().catch(() => undefined);
    this.wakeLock = null;
    this.dispatchEvent(new CustomEvent("closed"));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.onClosed();
  }

  private go(delta: number): void {
    const total = this.recipe?.steps.length ?? 0;
    const next = this.index + delta;
    if (next >= total) this.dlg.close();
    else this.index = Math.max(0, next);
  }

  protected override render() {
    const r = this.recipe;
    const lang = this.uiLang;
    if (!r || r.steps.length === 0) return html`<dw-dialog></dw-dialog>`;
    const total = r.steps.length;
    const step = r.steps[Math.min(this.index, total - 1)];
    const last = this.index >= total - 1;
    return html`<dw-dialog exportparts="dialog,header,title,close-button,body,footer" .heading=${r.name} .closeLabel=${t(lang, "close")} @closed=${() => this.onClosed()}>
      <div class="progress"><div style=${`width:${((this.index + 1) / total) * 100}%`}></div></div>
      <div class="count">${t(lang, "step_of", { n: this.index + 1, total })}</div>
      ${step.section ? html`<div class="section">${step.section}</div>` : nothing}
      <div class="step">${step.text}</div>
      <button class="btn" style="margin-top:16px" aria-expanded=${this.showIngredients} @click=${() => (this.showIngredients = !this.showIngredients)}>
        ${t(lang, "ingredients")}
      </button>
      ${this.showIngredients
        ? html`<ul class="ings">
            ${r.ingredients.map(
              (ing) => html`<li><b>${formatIngredientAmount(ing, r.servings, this.servings, lang)}</b>${ing.name}</li>`,
            )}
          </ul>`
        : nothing}
      <div slot="footer" class="nav">
        <button class="btn" ?disabled=${this.index === 0} @click=${() => this.go(-1)}>${t(lang, "prev")}</button>
        <button class="btn primary" @click=${() => this.go(1)}>${last ? t(lang, "finish") : t(lang, "next")}</button>
      </div>
    </dw-dialog>`;
  }
}

if (!customElements.get("dw-cook-mode")) customElements.define("dw-cook-mode", DwCookMode);