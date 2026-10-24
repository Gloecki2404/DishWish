import { listCategories, listRecipes } from "./api";
import type { Category, ChangeEvent, HomeAssistant, RecipeSummary } from "./types";

type Listener = () => void;

/** Client cache: one instance and one live subscription per HA connection. */
export class DataStore {
  recipes: RecipeSummary[] = [];
  categories: Category[] = [];
  loaded = false;
  error: unknown = null;

  private listeners = new Set<Listener>();
  private unsub: Promise<() => Promise<void>> | null = null;
  private timers: Record<string, ReturnType<typeof setTimeout> | undefined> = {};

  constructor(private conn: HomeAssistant["connection"]) {}

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
    await Promise.all([this.loadRecipes(), this.loadCategories()]);
  }

  private async start(): Promise<void> {
    this.unsub = this.conn.subscribeMessage<ChangeEvent>((ev) => this.onEvent(ev), {
      type: "essensplan/subscribe",
    });
    this.unsub.catch(() => undefined);
    await this.refresh();
    this.loaded = true;
    this.emit();
  }

  private stop(): void {
    Object.values(this.timers).forEach((t) => clearTimeout(t));
    this.timers = {};
    const unsub = this.unsub;
    this.unsub = null;
    this.loaded = false;
    unsub?.then((fn) => fn()).catch(() => undefined);
  }

  private onEvent(ev: ChangeEvent): void {
    if (ev.kind === "recipes" || ev.kind === "wishes") this.debounce("recipes", () => this.loadRecipes());
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
