import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "./firebase";
import { SEED_RECIPES, SEED_SHOPPING_ITEMS, emptyWeekPlan } from "./constants";

/**
 * Resolves the household a user belongs to, creating one (and seeding
 * default data) on first login, or joining a pending invite if present.
 */
export async function bootstrapHousehold(user: User): Promise<string> {
  const db = getFirebaseDb();
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const existingHouseholdId = userSnap.data()?.householdId as string | undefined;
  if (existingHouseholdId) return existingHouseholdId;

  const email = (user.email || "").toLowerCase();
  const inviteRef = doc(db, "invites", email);
  const inviteSnap = email ? await getDoc(inviteRef) : null;

  if (inviteSnap?.exists()) {
    const householdId = inviteSnap.data().householdId as string;
    const batch = writeBatch(db);
    batch.set(doc(db, "households", householdId, "members", user.uid), {
      uid: user.uid,
      email,
      role: "member",
      joinedAt: serverTimestamp(),
    });
    batch.set(userRef, { email, householdId }, { merge: true });
    await batch.commit();
    await deleteDoc(inviteRef);
    return householdId;
  }

  const householdId = user.uid;
  const batch = writeBatch(db);
  batch.set(doc(db, "households", householdId), {
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "households", householdId, "members", user.uid), {
    uid: user.uid,
    email,
    role: "owner",
    joinedAt: serverTimestamp(),
  });
  batch.set(userRef, { email, householdId }, { merge: true });
  batch.set(doc(db, "households", householdId, "settings", "main"), {
    diet: "Omnívoro",
    allergies: [],
    dislikes: [],
    enabledMeals: { desayuno: true, almuerzo: true, merienda: true, cena: true },
    defaultServings: 2,
    dayServings: {},
    onboardingDone: false,
  });
  batch.set(doc(db, "households", householdId, "plan", "week"), emptyWeekPlan());
  SEED_RECIPES.forEach((recipe) => {
    const ref = doc(db, "households", householdId, "recipes", crypto.randomUUID());
    batch.set(ref, recipe);
  });
  SEED_SHOPPING_ITEMS.forEach((item) => {
    const ref = doc(db, "households", householdId, "shoppingItems", crypto.randomUUID());
    batch.set(ref, { ...item, checked: false });
  });
  await batch.commit();
  return householdId;
}

export async function inviteHousemate(householdId: string, invitedBy: string, email: string) {
  const db = getFirebaseDb();
  const normalized = email.trim().toLowerCase();
  await setDoc(doc(db, "invites", normalized), {
    householdId,
    invitedBy,
    invitedAt: serverTimestamp(),
  });
}
