import { listCategories, listRecipes, listWishes } from "./api";
import type { Category, ChangeEvent, HomeAssistant, RecipeSummary, Wish } from "./types";

type Listener = () => void;

const MAX_ATTEMPTS = 5;

/** Client cache: one instance and one live subscription per HA connection. */
export class DataStore {
  recipes: RecipeSummary[] = [];
  categories: Category[] = [];
  /** Open wishes, oldest first. */
  wishes: Wish[] = [];
  loaded = false;
  error: unknown = null;

  private listeners = new Set<Listener>();
  private unsub: Promise<() => Promise<void>> | null = null;
  private timers: Record<string, ReturnType<typeof setTimeout> | undefined> = {};

  /** True once the initial load gave up retrying; `retry()` starts over. */
  failed = false;
  private attempts = 0;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(private conn: HomeAssistant["connection"]) {
    // HA reconnected (e.g. after a restart): subscription and data may be gone or stale
    conn.addEventListener?.("ready", () => {
      if (this.listeners.size) void this.start();
    });
  }

  /** Manual retry after the automatic ones gave up. */
  retry(): void {
    this.attempts = 0;
    void this.start();
  }

  /** Register a listener; the first one starts loading and the live subscription. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    if (this.listeners.size === 1) void this.start();
    else if (this.loaded) listener();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stop();
    };
  }

  /** Reload everything (e.g. after a local change, before the event arrives). */
  async refresh(): Promise<void> {
    this.error = null;
    await Promise.all([this.loadRecipes(), this.loadCategories(), this.loadWishes()]);
  }

  /** Subscribe and load; while the backend is not ready, retry with backoff (1, 2, 4, 8, 16 s). */
  private async start(): Promise<void> {
    clearTimeout(this.retryTimer);
    this.failed = false;
    const old = this.unsub;
    old?.then((fn) => fn()).catch(() => undefined);
    this.unsub = this.conn.subscribeMessage<ChangeEvent>((ev) => this.onEvent(ev), {
      type: "dishwish/subscribe",
    });
    this.unsub.catch(() => undefined);
    await this.refresh();
    if (this.error) {
      if (this.attempts >= MAX_ATTEMPTS) this.failed = !this.loaded;
      else this.retryTimer = setTimeout(() => void this.start(), 1000 * 2 ** this.attempts++);
      this.emit();
      return;
    }
    this.attempts = 0;
    this.loaded = true;
    this.emit();
  }

  private stop(): void {
    clearTimeout(this.retryTimer);
    this.attempts = 0;
    this.failed = false;
    Object.values(this.timers).forEach((t) => clearTimeout(t));
    this.timers = {};
    const unsub = this.unsub;
    this.unsub = null;
    this.loaded = false;
    unsub?.then((fn) => fn()).catch(() => undefined);
  }

  private onEvent(ev: ChangeEvent): void {
    if (ev.kind === "recipes" || ev.kind === "wishes") this.debounce("recipes", () => this.loadRecipes());
    if (ev.kind === "recipes" || ev.kind === "wishes") this.debounce("wishes", () => this.loadWishes());
    if (ev.kind === "categories") this.debounce("categories", () => this.loadCategories());
  }

  private debounce(key: string, fn: () => Promise<void>): void {
    clearTimeout(this.timers[key]);
    this.timers[key] = setTimeout(() => void fn(), 300);
  }

  private async loadRecipes(): Promise<void> {
    try {
      this.recipes = await listRecipes(this.conn);
      this.error = null;
    } catch (err) {
      this.error = err;
    }
    this.emit();
  }

  private async loadWishes(): Promise<void> {
    try {
      this.wishes = await listWishes(this.conn, "open");
    } catch (err) {
      this.error = err;
    }
    this.emit();
  }

  private async loadCategories(): Promise<void> {
    try {
      this.categories = await listCategories(this.conn);
    } catch (err) {
      this.error = err;
    }
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((l) => l());
  }
}

const stores = new WeakMap<object, DataStore>();

export function getStore(hass: HomeAssistant): DataStore {
  let store = stores.get(hass.connection);
  if (!store) {
    store = new DataStore(hass.connection);
    stores.set(hass.connection, store);
  }
  return store;
}
