import type { MealGroup, MealKey, PlanEntry, QuickFood, Recipe } from "./types";

export const DIET_OPTIONS = [
  { value: "Omnívoro", label: "Como de todo, sin restricciones" },
  { value: "Vegetariano", label: "Sin carne ni pescado" },
  { value: "Vegano", label: "Sin ningún producto de origen animal" },
];

export const ALLERGY_OPTIONS = [
  "Sin TACC",
  "Sin Lactosa",
  "Sin Frutos secos",
  "Sin Huevo",
  "Sin Mariscos",
  "Sin Soja",
  "Sin Maní",
  "Bajo en sodio",
];

export const DISLIKE_SUGGESTIONS = [
  "Cilantro",
  "Berenjena",
  "Hígado",
  "Aceitunas",
  "Anchoas",
  "Coco",
  "Comino",
  "Rabanito",
  "Morrón",
  "Brócoli",
  "Pescado",
  "Hongos",
];

export const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export const MEALS: { key: MealKey; label: string }[] = [
  { key: "desayuno", label: "Desayuno" },
  { key: "almuerzo", label: "Almuerzo" },
  { key: "merienda", label: "Merienda" },
  { key: "cena", label: "Cena" },
];

export const MEAL_GROUPS: { value: MealGroup; label: string }[] = [
  { value: "comida", label: "Comida (almuerzo / cena)" },
  { value: "desayuno_merienda", label: "Desayuno / merienda" },
];

export const MEAL_GROUP_SHORT_LABEL: Record<MealGroup, string> = {
  comida: "Comida",
  desayuno_merienda: "Desayuno/merienda",
};

export const MEAL_KEY_TO_GROUP: Record<MealKey, MealGroup> = {
  desayuno: "desayuno_merienda",
  almuerzo: "comida",
  merienda: "desayuno_merienda",
  cena: "comida",
};

// Recipes created before mealGroup existed have it unset — treat those as compatible with any meal.
export function recipeMatchesMeal(recipe: Recipe, mealKey: MealKey): boolean {
  return !recipe.mealGroup || recipe.mealGroup === MEAL_KEY_TO_GROUP[mealKey];
}

export function quickFoodMatchesMeal(food: QuickFood, mealKey: MealKey): boolean {
  return food.mealGroup === MEAL_KEY_TO_GROUP[mealKey];
}

// Plan slots used to store a bare recipe id string. Old Firestore data may
// still have that shape — read it back as a recipe entry with no servings set.
export function normalizePlanEntry(value: unknown): PlanEntry | null {
  if (!value) return null;
  if (typeof value === "string") return { type: "recipe", refId: value };
  return value as PlanEntry;
}

export const ONBOARDING_STEPS = ["diet", "allergy", "dislikes"] as const;

export const TAG_COLORS: Record<string, { bg: string; fg: string }> = {
  Vegetariano: { bg: "oklch(94% 0.03 150)", fg: "oklch(35% 0.1 150)" },
  Vegano: { bg: "oklch(94% 0.03 150)", fg: "oklch(35% 0.1 150)" },
  Comodín: { bg: "oklch(94% 0.03 50)", fg: "oklch(35% 0.1 50)" },
  Aprovechamiento: { bg: "oklch(94% 0.03 50)", fg: "oklch(35% 0.1 50)" },
  "Sin TACC": { bg: "oklch(94% 0.005 90)", fg: "oklch(40% 0.005 90)" },
  "Sin Lactosa": { bg: "oklch(94% 0.005 90)", fg: "oklch(40% 0.005 90)" },
};

export const AISLE_EMOJI: Record<string, string> = {
  Verdulería: "🥦",
  Carnicería: "🥩",
  Lácteos: "🥛",
  Almacén: "🥫",
  Otros: "🧺",
};

export const GLUTEN_KEYWORDS = [
  "trigo",
  "harina",
  "pan",
  "fideos",
  "pasta",
  "tallarines",
  "ñoquis",
  "cebada",
  "centeno",
  "avena",
  "galletitas",
  "masa",
  "bizcochuelo",
  "cerveza",
];

export const DAILY_KCAL_GOAL = 2000;
export const WEEKLY_KCAL_GOAL = DAILY_KCAL_GOAL * 7;
export const WEEKLY_PROTEIN_GOAL = 700;
export const WEEKLY_CARBS_GOAL = 1750;
export const WEEKLY_FAT_GOAL = 455;

export const RECIPE_KINDS = [
  "Saladas",
  "Ocasiones especiales",
  "Niveles de cocina",
  "Dietas especiales",
  "Bebidas",
  "Dulces",
];

export const SEED_QUICK_FOODS: Omit<QuickFood, "id">[] = [
  { title: "Café con leche y tostadas", kcal: 220, mealGroup: "desayuno_merienda" },
  { title: "Yogur con granola", kcal: 250, mealGroup: "desayuno_merienda" },
  { title: "Fruta", kcal: 80, mealGroup: "desayuno_merienda" },
  { title: "Sandwich de jamón y queso", kcal: 350, mealGroup: "comida" },
  { title: "Milanesa con ensalada", kcal: 480, mealGroup: "comida" },
];

export const SEED_SHOPPING_ITEMS: Omit<import("./types").ShoppingItem, "id" | "checked">[] = [
  { name: "Cebollas", qty: "3", aisle: "Verdulería", emoji: "🥦" },
  { name: "Tomates", qty: "4", aisle: "Verdulería", emoji: "🥦" },
  { name: "Lechuga", qty: "1", aisle: "Verdulería", emoji: "🥦" },
  { name: "Zanahorias", qty: "2", aisle: "Verdulería", emoji: "🥦" },
  { name: "Paltas", qty: "2", aisle: "Verdulería", emoji: "🥦" },
  { name: "Pechuga de pollo", qty: "1kg", aisle: "Carnicería", emoji: "🥩" },
  { name: "Carne picada", qty: "500g", aisle: "Carnicería", emoji: "🥩" },
  { name: "Leche", qty: "1L", aisle: "Lácteos", emoji: "🥛" },
  { name: "Yogures", qty: "2", aisle: "Lácteos", emoji: "🥛" },
  { name: "Queso cremoso", qty: "1", aisle: "Lácteos", emoji: "🥛" },
  { name: "Arroz", qty: "1kg", aisle: "Almacén", emoji: "🥫" },
  { name: "Fideos", qty: "500g", aisle: "Almacén", emoji: "🥫" },
  { name: "Aceite de oliva", qty: "1", aisle: "Almacén", emoji: "🥫" },
  { name: "Garbanzos en lata", qty: "2", aisle: "Almacén", emoji: "🥫" },
  { name: "Papel higiénico", qty: "4", aisle: "Otros", emoji: "🧺" },
  { name: "Fósforos", qty: "1", aisle: "Otros", emoji: "🧺" },
];

export function emptyDayPlan(): import("./types").DayPlan {
  return { desayuno: null, almuerzo: null, merienda: null, cena: null };
}

export function emptyWeekPlan(): import("./types").WeekPlan {
  const plan: import("./types").WeekPlan = {};
  DAYS.forEach((d) => {
    plan[d] = emptyDayPlan();
  });
  return plan;
}

export function dayLabel(i: number): string {
  return i === 0 ? "Hoy" : i === 1 ? "Mañana" : DAYS[i];
}

export type ChipStyle = {
  padding: string;
  borderRadius: number;
  border: string;
  background: string;
  color: string;
  fontWeight: number;
  fontSize: number;
  cursor: string;
};

export function chipStyle(selected: boolean, hue: number): ChipStyle {
  return selected
    ? {
        padding: "9px 16px",
        borderRadius: 999,
        border: "none",
        background: `oklch(58% 0.15 ${hue})`,
        color: "#fff",
        fontWeight: 700,
        fontSize: 13.5,
        cursor: "pointer",
      }
    : {
        padding: "9px 16px",
        borderRadius: 999,
        border: "1.5px solid oklch(88% 0.005 90)",
        background: "#fff",
        color: "oklch(30% 0.01 90)",
        fontWeight: 600,
        fontSize: 13.5,
        cursor: "pointer",
      };
}

export function neutralChipStyle(selected: boolean): ChipStyle {
  return selected
    ? {
        padding: "9px 16px",
        borderRadius: 999,
        border: "none",
        background: "oklch(20% 0 0)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13.5,
        cursor: "pointer",
      }
    : {
        padding: "9px 16px",
        borderRadius: 999,
        border: "1.5px solid oklch(88% 0.005 90)",
        background: "#fff",
        color: "oklch(30% 0.01 90)",
        fontWeight: 600,
        fontSize: 13.5,
        cursor: "pointer",
      };
}
