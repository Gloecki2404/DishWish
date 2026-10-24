export interface Category {
  id: string;
  name: string;
  icon: string;
  position: number;
}

export interface ImageRef {
  id: string;
  thumb_url: string;
  full_url: string;
}

export interface RecipeSummary {
  id: string;
  name: string;
  thumb_url: string | null;
  category_ids: string[];
  servings: number;
  prep_minutes: number | null;
  cook_minutes: number | null;
  visibility: "private" | "household";
  created_by: string;
  updated_at: string;
  open_wish_count: number;
  my_wish_id: string | null;
  source_name: string | null;
}

export interface Ingredient {
  id?: number;
  group_name: string | null;
  quantity: number | null;
  quantity_max: number | null;
  unit: string;
  name: string;
  note: string;
}

export interface Step {
  id?: number;
  section: string | null;
  text: string;
}

export interface Recipe extends RecipeSummary {
  description: string;
  notes: string;
  source_url: string | null;
  shareable: number;
  images: ImageRef[];
  ingredients: Ingredient[];
  steps: Step[];
  can_edit: boolean;
}

export interface Wish {
  id: string;
  recipe_id: string;
  recipe_name: string;
  thumb_url: string | null;
  user_id: string;
  user_name: string;
  note: string;
  status: "open" | "done";
  created_at: string;
  done_at: string | null;
}

export interface ShoppingResult {
  added: string[];
  skipped: string[];
}

/** Payload for create/update and the result of an import. */
export interface RecipeInput {
  name: string;
  description: string;
  servings: number;
  prep_minutes: number | null;
  cook_minutes: number | null;
  notes: string;
  source_url: string | null;
  source_name: string | null;
  visibility: "private" | "household";
  category_ids: string[];
  image_ids: string[];
  ingredients: Ingredient[];
  steps: Step[];
  /** Only in import drafts: category names found on the page that do not exist yet. */
  new_categories?: string[];
}

/** Minimal subset of the Home Assistant frontend object that we use. */
export interface HomeAssistant {
  connection: {
    sendMessagePromise<T>(msg: Record<string, unknown>): Promise<T>;
    subscribeMessage<T>(
      callback: (event: T) => void,
      subscribeMessage: Record<string, unknown>,
    ): Promise<() => Promise<void>>;
  };
  fetchWithAuth(path: string, init?: RequestInit): Promise<Response>;
  locale: { language: string };
  states: Record<string, { state: string; attributes: Record<string, unknown> }>;
  user?: { id: string; name: string; is_admin: boolean };
}

export interface CardConfig {
  type: string;
  [key: string]: unknown;
}

export interface ChangeEvent {
  kind: "recipes" | "categories" | "wishes";
  ids: string[];
}
