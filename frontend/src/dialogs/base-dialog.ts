import { css, html, LitElement } from "lit";
import { icon, paths } from "../icons";
import { sharedStyles } from "../styles";

/** Open dialogs, topmost last. Only the topmost one reacts to the browser back button. */
const stack: EsDialog[] = [];

/** Number of history.back() calls we issued ourselves; their popstate events are not user navigation. */
let pendingBacks = 0;

window.addEventListener("popstate", () => {
  if (pendingBacks > 0) {
    pendingBacks--;
    return;
  }
  const top = stack[stack.length - 1];
  top?.onPopState();
});

/**
 * Modal dialog on top of the native <dialog>. Fullscreen below 600 px.
 * Fires a cancelable `close-request` (Esc, X, back button) before closing and `closed` afterwards.
 */
export class EsDialog extends LitElement {
  static override properties = {
    heading: { type: String },
    closeLabel: { type: String },
  };
  declare heading: string;
  declare closeLabel: string;

  private pushed = false;

  constructor() {
    super();
    this.heading = "";
    this.closeLabel = "Close";
  }

  static override styles = [
    sharedStyles,
    css`
      dialog {
        width: min(760px, 100vw);
        max-width: 100vw;
        max-height: 92dvh;
        padding: 0;
        border: none;
        border-radius: var(--ha-card-border-radius, 12px);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        overflow: hidden;
      }
      dialog[open] {
        display: flex;
        flex-direction: column;
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
      }
      header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 8px 8px 20px;
        border-bottom: 1px solid var(--divider-color);
      }
      h2 {
        flex: 1;
        margin: 0;
        font-size: 1.2em;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .body {
        flex: 1;
        overflow-y: auto;
        padding: 16px 20px;
      }
      footer {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        flex-wrap: wrap;
        padding: 12px 20px;
        border-top: 1px solid var(--divider-color);
      }
      @media (max-width: 600px) {
        dialog {
          width: 100vw;
          height: 100dvh;
          max-height: 100dvh;
          border-radius: 0;
        }
      }
    `,
  ];

  private get dlg(): HTMLDialogElement {
    return this.renderRoot.querySelector("dialog")!;
  }

  show(): void {
    this.dlg.showModal();
    stack.push(this);
    history.pushState({ essensplan: true }, "");
    this.pushed = true;
  }

  /** Ask listeners whether we may close; closes unless one of them prevents it. */
  requestClose(): void {
    const ev = new CustomEvent("close-request", { cancelable: true });
    this.dispatchEvent(ev);
    if (!ev.defaultPrevented) this.close();
  }

  close(): void {
    if (this.dlg.open) this.dlg.close();
  }

  onPopState(): void {
    this.pushed = false;
    const ev = new CustomEvent("close-request", { cancelable: true });
    this.dispatchEvent(ev);
    if (ev.defaultPrevented) {
      // Stay open: restore the history entry the back button consumed.
      history.pushState({ essensplan: true }, "");
      this.pushed = true;
    } else {
      this.close();
    }
  }

  private onClosed(): void {
    const i = stack.indexOf(this);
    if (i >= 0) stack.splice(i, 1);
    if (this.pushed) {
      this.pushed = false;
      pendingBacks++;
      history.back();
    }
    this.dispatchEvent(new CustomEvent("closed"));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    const i = stack.indexOf(this);
    if (i >= 0) stack.splice(i, 1);
  }

  protected override render() {
    return html`
      <dialog
        @cancel=${(e: Event) => {
          e.preventDefault();
          this.requestClose();
        }}
        @close=${() => this.onClosed()}
      >
        <header>
          <h2>${this.heading}</h2>
          <slot name="actions"></slot>
          <button class="icon-btn" aria-label=${this.closeLabel} @click=${() => this.requestClose()}>
            ${icon(paths.close)}
          </button>
        </header>
        <div class="body"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </dialog>
    `;
  }
}

if (!customElements.get("es-dialog")) customElements.define("es-dialog", EsDialog);
