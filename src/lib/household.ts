import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "./firebase";
import { SEED_QUICK_FOODS, SEED_SHOPPING_ITEMS, emptyWeekPlan } from "./constants";

async function cleanupSeededRecipes(db: Firestore, householdId: string) {
  const snap = await getDocs(collection(db, "households", householdId, "recipes"));
  const seeded = snap.docs.filter((d) => d.data().isCustom !== true);
  if (!seeded.length) return;
  const batch = writeBatch(db);
  seeded.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/**
 * Resolves the household a user belongs to, creating one (and seeding
 * default data) on first login, or joining a pending invite if present.
 */
export async function bootstrapHousehold(user: User): Promise<string> {
  const db = getFirebaseDb();
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const existingHouseholdId = userSnap.data()?.householdId as string | undefined;
  if (existingHouseholdId) {
    await cleanupSeededRecipes(db, existingHouseholdId).catch(() => {});
    return existingHouseholdId;
  }

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
    await cleanupSeededRecipes(db, householdId).catch(() => {});
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
  SEED_QUICK_FOODS.forEach((food) => {
    const ref = doc(db, "households", householdId, "quickFoods", crypto.randomUUID());
    batch.set(ref, food);
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
