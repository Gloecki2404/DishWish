import type {
  Category,
  HomeAssistant,
  ImageRef,
  Ingredient,
  Recipe,
  RecipeInput,
  RecipeSummary,
  ShoppingResult,
  Wish,
} from "./types";

type Conn = HomeAssistant["connection"];

const call = <T>(conn: Conn, msg: Record<string, unknown>): Promise<T> => conn.sendMessagePromise<T>(msg);

export const listRecipes = (c: Conn) => call<RecipeSummary[]>(c, { type: "dishwish/recipes/list" });
export const getRecipe = (c: Conn, recipe_id: string) =>
  call<Recipe>(c, { type: "dishwish/recipes/get", recipe_id });
export const createRecipe = (c: Conn, input: RecipeInput) =>
  call<Recipe>(c, { type: "dishwish/recipes/create", ...input });
export const updateRecipe = (c: Conn, recipe_id: string, input: RecipeInput) =>
  call<Recipe>(c, { type: "dishwish/recipes/update", recipe_id, ...input });
export const deleteRecipe = (c: Conn, recipe_id: string) =>
  call<Record<string, never>>(c, { type: "dishwish/recipes/delete", recipe_id });
export const importUrl = (c: Conn, url: string) =>
  call<RecipeInput>(c, { type: "dishwish/recipes/import_url", url });

export const listCategories = (c: Conn) => call<Category[]>(c, { type: "dishwish/categories/list" });
export const createCategory = (c: Conn, name: string, icon?: string) =>
  call<Category>(c, { type: "dishwish/categories/create", name, ...(icon ? { icon } : {}) });

export const parseIngredients = (c: Conn, lines: string[]) =>
  call<Ingredient[]>(c, { type: "dishwish/ingredients/parse", lines });

export async function uploadImage(hass: HomeAssistant, blob: Blob): Promise<ImageRef> {
  const body = new FormData();
  body.append("file", blob, "photo.jpg");
  const resp = await hass.fetchWithAuth("/api/dishwish/images", { method: "POST", body });
  if (!resp.ok) {
    let code = "upload_failed";
    try {
      code = ((await resp.json()) as { code?: string }).code ?? code;
    } catch {
      /* keep default */
    }
    throw { code };
  }
  return (await resp.json()) as ImageRef;
}

/** WebSocket errors arrive as `{code, message}`; map anything else to `unknown`. */
export function errorCode(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) return String((err as { code: unknown }).code);
  return "unknown";
}

export const listWishes = (c: Conn, status: "open" | "done" = "open", limit?: number) =>
  call<Wish[]>(c, { type: "dishwish/wishes/list", status, ...(limit ? { limit } : {}) });
export const addWish = (c: Conn, recipe_id: string, note = "") =>
  call<Wish>(c, { type: "dishwish/wishes/add", recipe_id, note });
export const removeWish = (c: Conn, wish_id: string) =>
  call<Record<string, never>>(c, { type: "dishwish/wishes/remove", wish_id });
export const completeWishes = (c: Conn, recipe_id: string) =>
  call<{ count: number }>(c, { type: "dishwish/wishes/complete", recipe_id });

export const addToShopping = (
  c: Conn,
  recipe_id: string,
  opts: { servings?: number; ingredient_ids?: number[]; entity_id?: string } = {},
) => call<ShoppingResult>(c, { type: "dishwish/shopping/add", recipe_id, ...opts });

export const addNote = (c: Conn, recipe_id: string, text: string) =>
  call<Recipe>(c, { type: "dishwish/recipes/add_note", recipe_id, text });

export const importPhotos = (c: Conn, image_ids: string[]) =>
  call<RecipeInput>(c, { type: "dishwish/recipes/import_photos", image_ids });
