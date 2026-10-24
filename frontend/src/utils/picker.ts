/** True when the element is rendered as a preview inside Home Assistant's card picker. */
export function inCardPicker(el: Element): boolean {
  let node: Node = el;
  for (;;) {
    const root = node.getRootNode();
    if (!(root instanceof ShadowRoot)) return false;
    node = root.host;
    if (node.nodeName === "HUI-CARD-PICKER") return true;
  }
}

/** Relative time like "3 days ago" in the given language; falls back to the date. */
export function relativeTime(iso: string, lang: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.round((then - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
    ["month", 2592000],
    ["year", 31536000],
  ];
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(0, "minute");
  let chosen = units[0];
  for (const u of units) if (abs >= u[1]) chosen = u;
  return rtf.format(Math.round(seconds / chosen[1]), chosen[0]);
}
/**
 * Show only the first `rows` visual rows of `container`'s children and make the rest scrollable.
 * Rows are detected by the vertical position of the children, so grids and lists both work.
 * `rows` of 0 (or less) removes the limit.
 */
export function limitRows(container: HTMLElement | null, rows: number): void {
  if (!container) return;
  container.style.maxHeight = "";
  container.style.overflowY = "";
  if (!(rows >= 1)) return;
  const box = container.getBoundingClientRect();
  const items = [...container.children].filter((el) => el.id !== "more" && el.getBoundingClientRect().height > 0);
  const rects = items.map((el) => el.getBoundingClientRect());
  const tops = [...new Set(rects.map((r) => Math.round(r.top - box.top + container.scrollTop)))].sort((a, b) => a - b);
  if (tops.length <= rows) return;
  const lastRowTop = tops[rows - 1];
  const bottom = Math.max(
    ...rects
      .filter((r) => Math.round(r.top - box.top + container.scrollTop) === lastRowTop)
      .map((r) => r.bottom - box.top + container.scrollTop),
  );
  container.style.maxHeight = `${Math.ceil(bottom) + 2}px`;
  container.style.overflowY = "auto";
}
