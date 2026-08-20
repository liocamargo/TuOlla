export type MealKey = "desayuno" | "almuerzo" | "merienda" | "cena";

export interface Recipe {
  id: string;
  title: string;
  img: string | null;
  time: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  kind: string;
  description?: string;
  ingredients?: { name: string; qty: string }[];
  isCustom?: boolean;
}

export type DayPlan = Record<MealKey, string | null>;

export type WeekPlan = Record<string, DayPlan>;

export interface ShoppingItem {
  id: string;
  name: string;
  qty: string;
  aisle: string;
  emoji: string;
  checked: boolean;
}

export interface HouseholdSettings {
  diet: string;
  allergies: string[];
  dislikes: string[];
  enabledMeals: Record<MealKey, boolean>;
  defaultServings: number;
  dayServings: Record<string, number>;
  onboardingDone: boolean;
}

export interface Member {
  uid: string;
  email: string;
  role: "owner" | "member";
  joinedAt: number;
}

export interface Template {
  id: string;
  name: string;
  plan: WeekPlan;
  createdAt: number;
}
