import { css, html, LitElement } from "lit";
import { icon, paths } from "../icons";
import { sharedStyles } from "../styles";

/** Open dialogs, topmost last. Only the topmost one reacts to the browser back button. */
const stack: DwDialog[] = [];

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
export class DwDialog extends LitElement {
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
        /* Space kept free above a fullscreen dialog (phone status bar / notch). */
        --dw-top: var(
          --dw-dialog-top-offset,
          max(var(--safe-area-inset-top, 0px), env(safe-area-inset-top, 0px), 24px)
        );
        --dw-bottom: max(var(--safe-area-inset-bottom, 0px), env(safe-area-inset-bottom, 0px));
        width: min(760px, 100vw);
        max-width: 100vw;
        max-height: 92dvh;
        padding: 0;
        border: none;
        border-radius: var(--dw-dialog-radius, var(--ha-card-border-radius, 12px));
        /* Always opaque: a translucent theme colour is laid over a solid base colour. */
        --dw-dialog-fill: var(
          --dw-dialog-background,
          var(--ha-dialog-surface-background, var(--card-background-color))
        );
        background:
          linear-gradient(var(--dw-dialog-fill), var(--dw-dialog-fill)),
          var(--primary-background-color, Canvas);
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
        padding: 12px 20px calc(12px + var(--dw-bottom));
        border-top: 1px solid var(--divider-color);
      }
      @media (max-width: 600px) {
        dialog {
          width: 100vw;
          margin: var(--dw-top) 0 0 0;
          height: calc(100dvh - var(--dw-top));
          max-height: calc(100dvh - var(--dw-top));
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
    history.pushState({ dishwish: true }, "");
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
      history.pushState({ dishwish: true }, "");
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
        part="dialog"
        @cancel=${(e: Event) => {
          e.preventDefault();
          this.requestClose();
        }}
        @close=${() => this.onClosed()}
      >
        <header part="header">
          <h2 part="title">${this.heading}</h2>
          <slot name="actions"></slot>
          <button class="icon-btn" part="close-button" aria-label=${this.closeLabel} @click=${() => this.requestClose()}>
            ${icon(paths.close)}
          </button>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer part="footer"><slot name="footer"></slot></footer>
      </dialog>
    `;
  }
}

if (!customElements.get("dw-dialog")) customElements.define("dw-dialog", DwDialog);
