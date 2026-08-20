"use client";

import { useEffect, useState, useCallback } from "react";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { bootstrapHousehold } from "@/lib/household";

const PENDING_EMAIL_KEY = "tuolla:pendingEmail";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const id = await bootstrapHousehold(firebaseUser);
          setHouseholdId(id);
        } catch (e) {
          setError(e instanceof Error ? e.message : "No se pudo preparar tu espacio.");
        }
      } else {
        setHouseholdId(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isSignInWithEmailLink(getFirebaseAuth(), window.location.href)) return;

    let email = window.localStorage.getItem(PENDING_EMAIL_KEY);
    if (!email) {
      email = window.prompt("Confirmá tu email para completar el ingreso") || "";
    }
    if (!email) return;

    signInWithEmailLink(getFirebaseAuth(), email, window.location.href)
      .then(() => {
        window.localStorage.removeItem(PENDING_EMAIL_KEY);
        window.history.replaceState(null, "", window.location.pathname);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "El link no es válido o expiró."));
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión con Google.");
    }
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    setError(null);
    try {
      await sendSignInLinkToEmail(getFirebaseAuth(), email, {
        url: window.location.href,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(PENDING_EMAIL_KEY, email);
      setMagicLinkSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar el link de acceso.");
    }
  }, []);

  const resetMagicLinkSent = useCallback(() => setMagicLinkSent(false), []);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
  }, []);

  return {
    user,
    householdId,
    loading,
    error,
    magicLinkSent,
    loginWithGoogle,
    sendMagicLink,
    resetMagicLinkSent,
    logout,
  };
}
