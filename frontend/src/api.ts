import type {
  Category,
  HomeAssistant,
  ImageRef,
  Ingredient,
  Recipe,
  RecipeInput,
  RecipeSummary,
} from "./types";

type Conn = HomeAssistant["connection"];

const call = <T>(conn: Conn, msg: Record<string, unknown>): Promise<T> => conn.sendMessagePromise<T>(msg);

export const listRecipes = (c: Conn) => call<RecipeSummary[]>(c, { type: "essensplan/recipes/list" });
export const getRecipe = (c: Conn, recipe_id: string) =>
  call<Recipe>(c, { type: "essensplan/recipes/get", recipe_id });
export const createRecipe = (c: Conn, input: RecipeInput) =>
  call<Recipe>(c, { type: "essensplan/recipes/create", ...input });
export const updateRecipe = (c: Conn, recipe_id: string, input: RecipeInput) =>
  call<Recipe>(c, { type: "essensplan/recipes/update", recipe_id, ...input });
export const deleteRecipe = (c: Conn, recipe_id: string) =>
  call<Record<string, never>>(c, { type: "essensplan/recipes/delete", recipe_id });
export const importUrl = (c: Conn, url: string) =>
  call<RecipeInput>(c, { type: "essensplan/recipes/import_url", url });

export const listCategories = (c: Conn) => call<Category[]>(c, { type: "essensplan/categories/list" });
export const createCategory = (c: Conn, name: string, icon?: string) =>
  call<Category>(c, { type: "essensplan/categories/create", name, ...(icon ? { icon } : {}) });

export const parseIngredients = (c: Conn, lines: string[]) =>
  call<Ingredient[]>(c, { type: "essensplan/ingredients/parse", lines });

export async function uploadImage(hass: HomeAssistant, blob: Blob): Promise<ImageRef> {
  const body = new FormData();
  body.append("file", blob, "photo.jpg");
  const resp = await hass.fetchWithAuth("/api/essensplan/images", { method: "POST", body });
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
