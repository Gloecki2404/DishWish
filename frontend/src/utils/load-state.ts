import { html } from "lit";
import type { DataStore } from "../data-store";
import { t, tError } from "../i18n";

/** Placeholder while the first load runs; after the automatic retries gave up, an error with a retry button. */
export function renderLoadState(store: DataStore, lang: string) {
  if (!store.failed) return html`<p class="muted">${t(lang, "loading")}</p>`;
  return html`<p class="error">${tError(lang, "not_ready")}</p>
    <button class="btn" @click=${() => store.retry()}>${t(lang, "retry")}</button>`;
}
