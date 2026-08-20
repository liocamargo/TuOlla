"use client";

import { useState } from "react";
import { ALLERGY_OPTIONS, DIET_OPTIONS, DISLIKE_SUGGESTIONS, ONBOARDING_STEPS, chipStyle } from "@/lib/constants";
import type { HouseholdSettings } from "@/lib/types";

interface Props {
  settings: HouseholdSettings;
  onComplete: (patch: Partial<HouseholdSettings>) => void;
}

export default function OnboardingScreen({ settings, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [diet, setDiet] = useState(settings.diet);
  const [allergies, setAllergies] = useState<string[]>(settings.allergies);
  const [dislikes, setDislikes] = useState<string[]>(settings.dislikes);
  const [dislikeInput, setDislikeInput] = useState("");

  const toggleAllergy = (a: string) =>
    setAllergies((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const addDislike = (word: string) => {
    if (!dislikes.includes(word)) setDislikes((prev) => [...prev, word]);
    setDislikeInput("");
  };
  const removeDislike = (word: string) => setDislikes((prev) => prev.filter((x) => x !== word));

  const suggestions =
    dislikeInput.length > 0
      ? DISLIKE_SUGGESTIONS.filter(
          (w) => w.toLowerCase().includes(dislikeInput.toLowerCase()) && !dislikes.includes(w)
        ).slice(0, 5)
      : [];

  const isLast = step >= ONBOARDING_STEPS.length - 1;

  const next = () => {
    if (isLast) {
      onComplete({ diet, allergies, dislikes, onboardingDone: true });
      return;
    }
    setStep((s) => s + 1);
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#fff", border: "1px solid oklch(91% 0.005 90)", borderRadius: 20, padding: "36px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 22 : 8,
                height: 8,
                borderRadius: 999,
                background: i <= step ? "oklch(20% 0 0)" : "oklch(90% 0.005 90)",
                marginRight: 6,
              }}
            />
          ))}
          <span style={{ fontSize: 12.5, color: "oklch(55% 0.01 90)", marginLeft: 8 }}>
            Paso {step + 1} de {ONBOARDING_STEPS.length}
          </span>
        </div>

        {step === 0 && (
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800 }}>¿Qué tipo de dieta seguís?</h1>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: "oklch(50% 0.01 90)" }}>
              Vamos a sugerirte recetas acordes.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DIET_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDiet(d.value)}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: d.value === diet ? "1.5px solid oklch(20% 0 0)" : "1.5px solid oklch(88% 0.005 90)",
                    background: d.value === diet ? "oklch(96% 0.01 150)" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{d.value}</div>
                  <div style={{ fontSize: 13, color: "oklch(50% 0.01 90)" }}>{d.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800 }}>¿Alguna alergia o restricción?</h1>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: "oklch(50% 0.01 90)" }}>Podés elegir varias.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ALLERGY_OPTIONS.map((a) => (
                <button key={a} onClick={() => toggleAllergy(a)} style={chipStyle(allergies.includes(a), 50)}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800 }}>¿Algo que no te guste?</h1>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: "oklch(50% 0.01 90)" }}>
              Evitamos sugerirte recetas con estos ingredientes.
            </p>
            <input
              value={dislikeInput}
              onChange={(e) => setDislikeInput(e.target.value)}
              placeholder="Buscar un ingrediente..."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid oklch(90% 0.005 90)",
                fontSize: 14,
                outline: "none",
                background: "oklch(99% 0.002 90)",
              }}
            />
            {suggestions.length > 0 && (
              <div style={{ border: "1px solid oklch(90% 0.005 90)", borderRadius: 10, marginTop: 6, overflow: "hidden" }}>
                {suggestions.map((sug) => (
                  <div
                    key={sug}
                    onClick={() => addDislike(sug)}
                    style={{ padding: "10px 14px", fontSize: 14, cursor: "pointer", borderBottom: "1px solid oklch(95% 0.003 90)" }}
                  >
                    {sug}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              {dislikes.map((d) => (
                <span
                  key={d}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 10px 7px 14px",
                    borderRadius: 999,
                    background: "oklch(95% 0.005 90)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {d}
                  <button
                    onClick={() => removeDislike(d)}
                    style={{
                      border: "none",
                      background: "oklch(88% 0.005 90)",
                      color: "oklch(30% 0.01 90)",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      fontSize: 11,
                      cursor: "pointer",
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button
            onClick={prev}
            style={
              step === 0
                ? { padding: "14px 22px", border: "none", borderRadius: 14, background: "none", color: "transparent", fontSize: 15, fontWeight: 700, cursor: "default" }
                : { padding: "14px 22px", border: "1.5px solid oklch(88% 0.005 90)", borderRadius: 14, background: "#fff", color: "oklch(25% 0.01 90)", fontSize: 15, fontWeight: 700, cursor: "pointer" }
            }
          >
            Atrás
          </button>
          <button
            onClick={next}
            style={{ padding: "14px 26px", border: "none", borderRadius: 14, background: "oklch(20% 0 0)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
          >
            {isLast ? "Guardar y armar mi menú" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
