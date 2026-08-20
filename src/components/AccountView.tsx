"use client";

import { useState } from "react";
import type { User } from "firebase/auth";
import { MEALS, chipStyle } from "@/lib/constants";
import { inviteHousemate } from "@/lib/household";
import type { useHousehold } from "@/hooks/useHousehold";
import type { MealKey } from "@/lib/types";

interface Props {
  user: User;
  household: ReturnType<typeof useHousehold>;
  householdId: string;
  onLogout: () => void;
}

export default function AccountView({ user, household, householdId, onLogout }: Props) {
  const { settings, updateSettings, members } = household;
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  const toggleMeal = (key: MealKey) => {
    updateSettings({ enabledMeals: { ...settings.enabledMeals, [key]: !settings.enabledMeals[key] } });
  };

  const sendInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    await inviteHousemate(householdId, user.uid, email);
    setInviteEmail("");
    setInviteStatus(`Invitación enviada a ${email}. Va a activarse cuando esa persona inicie sesión.`);
  };

  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800 }}>Mi cuenta</h1>
      <p style={{ margin: "0 0 28px", color: "oklch(50% 0.01 90)", fontSize: 14 }}>{user.email}</p>

      <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(50% 0.01 90)", marginBottom: 12 }}>
        Qué querés planificar
      </div>
      <div style={{ background: "#fff", border: "1px solid oklch(92% 0.005 90)", borderRadius: 14, overflow: "hidden" }}>
        {MEALS.map((m) => (
          <div key={m.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid oklch(95% 0.003 90)" }}>
            <span style={{ fontSize: 14.5, fontWeight: 700 }}>{m.label}</span>
            <div
              onClick={() => toggleMeal(m.key)}
              style={{ width: 42, height: 24, borderRadius: 999, background: settings.enabledMeals[m.key] ? "oklch(20% 0 0)" : "oklch(90% 0.005 90)", position: "relative", cursor: "pointer" }}
            >
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: settings.enabledMeals[m.key] ? 21 : 3, transition: "left 0.15s ease" }} />
            </div>
          </div>
        ))}
      </div>
      <p style={{ margin: "14px 0 0", fontSize: 12.5, color: "oklch(55% 0.01 90)" }}>
        Las comidas desactivadas no van a aparecer en tu semana ni en el autocompletar.
      </p>

      <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(50% 0.01 90)", margin: "28px 0 12px" }}>
        Personas por defecto
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button key={n} onClick={() => updateSettings({ defaultServings: n })} style={chipStyle(settings.defaultServings === n, 150)}>
            {n}
          </button>
        ))}
      </div>
      <p style={{ margin: "14px 0 0", fontSize: 12.5, color: "oklch(55% 0.01 90)" }}>
        Podés cambiar la cantidad de personas para un día puntual desde el menú semanal.
      </p>

      <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(50% 0.01 90)", margin: "28px 0 12px" }}>
        Compartir tu espacio
      </div>
      <div style={{ background: "#fff", border: "1px solid oklch(92% 0.005 90)", borderRadius: 14, padding: "18px 20px" }}>
        <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "oklch(40% 0.01 90)", lineHeight: 1.5 }}>
          Invitá a las personas con las que vivís para que vean y editen el mismo menú, lista de compras y recetario.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@ejemplo.com"
            style={{ flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 13.5 }}
          />
          <button onClick={sendInvite} style={{ padding: "10px 16px", border: "none", borderRadius: 10, background: "oklch(20% 0 0)", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap" }}>
            Invitar
          </button>
        </div>
        {inviteStatus && <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "oklch(45% 0.1 150)" }}>{inviteStatus}</p>}
        {members.map((m) => (
          <div key={m.uid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid oklch(95% 0.003 90)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "oklch(90% 0.005 90)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "oklch(30% 0.01 90)" }}>
                {m.email[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: 13.5 }}>{m.email}</span>
            </div>
            <span style={{ fontSize: 12, color: "oklch(55% 0.01 90)" }}>{m.role === "owner" ? "Dueño/a" : "Miembro"}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onLogout}
        style={{ marginTop: 28, padding: "11px 18px", borderRadius: 10, border: "1.5px solid oklch(88% 0.005 90)", background: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
