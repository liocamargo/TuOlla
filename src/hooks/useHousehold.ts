"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { emptyWeekPlan } from "@/lib/constants";
import type {
  HouseholdSettings,
  Member,
  Recipe,
  ShoppingItem,
  Template,
  WeekPlan,
  MealKey,
} from "@/lib/types";

const DEFAULT_SETTINGS: HouseholdSettings = {
  diet: "Omnívoro",
  allergies: [],
  dislikes: [],
  enabledMeals: { desayuno: true, almuerzo: true, merienda: true, cena: true },
  defaultServings: 2,
  dayServings: {},
  onboardingDone: false,
};

export function useHousehold(householdId: string | null) {
  const [settings, setSettings] = useState<HouseholdSettings>(DEFAULT_SETTINGS);
  const [plan, setPlanState] = useState<WeekPlan>(emptyWeekPlan());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!householdId) return;
    const db = getFirebaseDb();

    const unsubs = [
      onSnapshot(doc(db, "households", householdId, "settings", "main"), (snap) => {
        if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...(snap.data() as HouseholdSettings) });
        setReady(true);
      }),
      onSnapshot(doc(db, "households", householdId, "plan", "week"), (snap) => {
        if (snap.exists()) setPlanState(snap.data() as WeekPlan);
      }),
      onSnapshot(collection(db, "households", householdId, "recipes"), (snap) => {
        setRecipes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recipe)));
      }),
      onSnapshot(collection(db, "households", householdId, "shoppingItems"), (snap) => {
        setShoppingItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShoppingItem)));
      }),
      onSnapshot(
        query(collection(db, "households", householdId, "templates"), orderBy("createdAt", "desc")),
        (snap) => {
          setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Template)));
        }
      ),
      onSnapshot(collection(db, "households", householdId, "members"), (snap) => {
        setMembers(snap.docs.map((d) => d.data() as Member));
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, [householdId]);

  const updateSettings = useCallback(
    (patch: Partial<HouseholdSettings>) => {
      if (!householdId) return;
      void updateDoc(doc(getFirebaseDb(), "households", householdId, "settings", "main"), patch);
    },
    [householdId]
  );

  const setPlan = useCallback(
    (next: WeekPlan) => {
      if (!householdId) return;
      setPlanState(next);
      void setDoc(doc(getFirebaseDb(), "households", householdId, "plan", "week"), next);
    },
    [householdId]
  );

  const assignRecipe = useCallback(
    (day: string, mealKey: MealKey, recipeId: string | null) => {
      const next = { ...plan, [day]: { ...plan[day], [mealKey]: recipeId } };
      setPlan(next);
    },
    [plan, setPlan]
  );

  const addRecipe = useCallback(
    async (recipe: Omit<Recipe, "id">) => {
      if (!householdId) return;
      await addDoc(collection(getFirebaseDb(), "households", householdId, "recipes"), recipe);
    },
    [householdId]
  );

  const toggleShoppingItem = useCallback(
    (id: string, checked: boolean) => {
      if (!householdId) return;
      void updateDoc(doc(getFirebaseDb(), "households", householdId, "shoppingItems", id), { checked });
    },
    [householdId]
  );

  const deleteShoppingItem = useCallback(
    (id: string) => {
      if (!householdId) return;
      void deleteDoc(doc(getFirebaseDb(), "households", householdId, "shoppingItems", id));
    },
    [householdId]
  );

  const addShoppingItem = useCallback(
    async (item: Omit<ShoppingItem, "id" | "checked">) => {
      if (!householdId) return;
      await addDoc(collection(getFirebaseDb(), "households", householdId, "shoppingItems"), {
        ...item,
        checked: false,
      });
    },
    [householdId]
  );

  const saveTemplate = useCallback(
    async (name: string) => {
      if (!householdId) return;
      await addDoc(collection(getFirebaseDb(), "households", householdId, "templates"), {
        name,
        plan,
        createdAt: Date.now(),
      });
    },
    [householdId, plan]
  );

  const applyTemplate = useCallback(
    (templateId: string) => {
      const tpl = templates.find((t) => t.id === templateId);
      if (!tpl) return;
      setPlan(tpl.plan);
    },
    [templates, setPlan]
  );

  const deleteTemplate = useCallback(
    (templateId: string) => {
      if (!householdId) return;
      void deleteDoc(doc(getFirebaseDb(), "households", householdId, "templates", templateId));
    },
    [householdId]
  );

  return useMemo(
    () => ({
      ready,
      settings,
      updateSettings,
      plan,
      setPlan,
      assignRecipe,
      recipes,
      addRecipe,
      shoppingItems,
      toggleShoppingItem,
      deleteShoppingItem,
      addShoppingItem,
      templates,
      saveTemplate,
      applyTemplate,
      deleteTemplate,
      members,
    }),
    [
      ready,
      settings,
      updateSettings,
      plan,
      setPlan,
      assignRecipe,
      recipes,
      addRecipe,
      shoppingItems,
      toggleShoppingItem,
      deleteShoppingItem,
      addShoppingItem,
      templates,
      saveTemplate,
      applyTemplate,
      deleteTemplate,
      members,
    ]
  );
}
