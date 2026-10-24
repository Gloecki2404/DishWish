/** Show a toast via the Home Assistant frontend. */
export function notify(el: HTMLElement, message: string): void {
  el.dispatchEvent(new CustomEvent("hass-notification", { detail: { message }, bubbles: true, composed: true }));
}
