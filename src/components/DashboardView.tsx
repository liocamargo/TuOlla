"use client";

import { useState } from "react";
import { ChevronLeft, Minus, Plus, Save, Shuffle, X } from "lucide-react";
import {
  DAYS,
  MEALS,
  MEAL_KEY_TO_GROUP,
  chipStyle,
  dayLabel,
  quickFoodMatchesMeal,
  recipeMatchesMeal,
} from "@/lib/constants";
import type { useHousehold } from "@/hooks/useHousehold";
import type { MealKey, PlanEntry, Recipe } from "@/lib/types";

interface Props {
  household: ReturnType<typeof useHousehold>;
  isMobile: boolean;
}

interface ResolvedEntry {
  kind: "recipe" | "quick";
  title: string;
  sub: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function DashboardView({ household, isMobile }: Props) {
  const {
    settings,
    plan,
    assignEntry,
    recipes,
    quickFoods,
    addQuickFood,
    templates,
    saveTemplate,
    applyTemplate,
    deleteTemplate,
    setPlan,
    updateSettings,
  } = household;

  const [pickerSlot, setPickerSlot] = useState<{ day: string; mealKey: MealKey } | null>(null);
  const [pickerTab, setPickerTab] = useState<"rapidas" | "recetas">("rapidas");
  const [pickerRecipe, setPickerRecipe] = useState<Recipe | null>(null);
  const [pickerServings, setPickerServings] = useState(2);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickKcal, setQuickKcal] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const activeMeals = MEALS.filter((m) => settings.enabledMeals[m.key]);
  const recipeById = (id: string) => recipes.find((r) => r.id === id) || null;
  const quickById = (id: string) => quickFoods.find((f) => f.id === id) || null;

  const resolveEntry = (entry: PlanEntry | null | undefined): ResolvedEntry | null => {
    if (!entry) return null;
    if (entry.type === "recipe") {
      const r = recipeById(entry.refId);
      if (!r) return null;
      const servingsLabel = entry.servings ? ` · Para ${entry.servings} ${entry.servings === 1 ? "persona" : "personas"}` : "";
      return { kind: "recipe", title: r.title, sub: `${r.time} min · ${r.kcal} kcal${servingsLabel}`, kcal: r.kcal, protein: r.protein, carbs: r.carbs, fat: r.fat };
    }
    const f = quickById(entry.refId);
    if (!f) return null;
    return { kind: "quick", title: f.title, sub: `${f.kcal} kcal`, kcal: f.kcal, protein: 0, carbs: 0, fat: 0 };
  };

  const plannedList: ResolvedEntry[] = [];
  DAYS.forEach((day) => activeMeals.forEach((m) => { const r = resolveEntry(plan[day]?.[m.key]); if (r) plannedList.push(r); }));
  const totalSlots = DAYS.length * activeMeals.length;
  const weekProgressPct = totalSlots ? Math.round((plannedList.length / totalSlots) * 100) : 0;

  const setDayServings = (day: string, n: number) => {
    updateSettings({ dayServings: { ...settings.dayServings, [day]: n } });
  };

  const closePicker = () => {
    setPickerSlot(null);
    setPickerTab("rapidas");
    setPickerRecipe(null);
    setQuickTitle("");
    setQuickKcal("");
  };

  const openPicker = (day: string, mealKey: MealKey) => {
    setPickerSlot({ day, mealKey });
    setPickerTab("rapidas");
    setPickerRecipe(null);
    setPickerServings(settings.dayServings[day] ?? settings.defaultServings);
  };

  const stageRecipe = (r: Recipe) => {
    setPickerRecipe(r);
  };

  const confirmRecipe = () => {
    if (!pickerSlot || !pickerRecipe) return;
    assignEntry(pickerSlot.day, pickerSlot.mealKey, { type: "recipe", refId: pickerRecipe.id, servings: pickerServings });
    closePicker();
  };

  const pickQuickFood = (id: string) => {
    if (!pickerSlot) return;
    assignEntry(pickerSlot.day, pickerSlot.mealKey, { type: "quick", refId: id });
    closePicker();
  };

  const submitQuickAdd = async () => {
    if (!pickerSlot) return;
    const title = quickTitle.trim();
    const kcal = parseInt(quickKcal, 10);
    if (!title || !Number.isFinite(kcal)) return;
    const id = await addQuickFood({ title, kcal, mealGroup: MEAL_KEY_TO_GROUP[pickerSlot.mealKey] });
    if (id) pickQuickFood(id);
  };

  const autoFillWeek = () => {
    const next = { ...plan };
    DAYS.forEach((day) => {
      next[day] = { ...next[day] };
      activeMeals.forEach((m) => {
        if (!next[day][m.key]) {
          const recipePool = recipes.filter((r) => recipeMatchesMeal(r, m.key));
          const quickPool = quickFoods.filter((f) => quickFoodMatchesMeal(f, m.key));
          const servings = settings.dayServings[day] ?? settings.defaultServings;
          const combined: PlanEntry[] = [
            ...recipePool.map((r): PlanEntry => ({ type: "recipe", refId: r.id, servings })),
            ...quickPool.map((f): PlanEntry => ({ type: "quick", refId: f.id })),
          ];
          if (combined.length) next[day][m.key] = combined[Math.floor(Math.random() * combined.length)];
        }
      });
    });
    setPlan(next);
  };

  const swapForComodin = (day: string, mealKey: MealKey) => {
    const matching = recipes.filter((r) => recipeMatchesMeal(r, mealKey));
    const pool = matching.filter((r) => r.tags.includes("Comodín"));
    const list = pool.length ? pool : matching.length ? matching : recipes;
    if (!list.length) return;
    const chosen = list[Math.floor(Math.random() * list.length)];
    const current = plan[day]?.[mealKey];
    const servings = current?.type === "recipe" ? current.servings : settings.dayServings[day] ?? settings.defaultServings;
    assignEntry(day, mealKey, { type: "recipe", refId: chosen.id, servings });
  };

  const renderMealRow = (day: string, mealKey: MealKey, label: string, isLast: boolean) => {
    const resolved = resolveEntry(plan[day]?.[mealKey]);
    return (
      <div key={mealKey} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: isLast ? "none" : "1px dashed oklch(80% 0.04 90)" }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(45% 0.02 95)", width: 76, flex: "none" }}>
          {label}
        </div>
        {resolved ? (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resolved.title}</div>
              <div style={{ fontSize: 12, color: "oklch(50% 0.01 90)" }}>{resolved.sub}</div>
            </div>
            <button onClick={() => assignEntry(day, mealKey, null)} style={{ border: "none", background: "none", cursor: "pointer", flex: "none", color: "oklch(45% 0.01 90)", display: "flex", padding: 4 }}>
              <X size={15} />
            </button>
            {resolved.kind === "recipe" && (
              <button onClick={() => swapForComodin(day, mealKey)} style={{ border: "none", background: "none", cursor: "pointer", flex: "none", color: "oklch(45% 0.01 90)", display: "flex", padding: 4 }}>
                <Shuffle size={15} />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => openPicker(day, mealKey)}
            style={{ flex: 1, textAlign: "left", border: "none", background: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "oklch(45% 0.01 90)", cursor: "pointer", padding: "8px 0" }}
          >
            <Plus size={15} /> Añadir
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Menú semanal</h1>
          <p style={{ margin: 0, color: "oklch(50% 0.01 90)", fontSize: 14 }}>
            {plannedList.length} de {totalSlots} comidas planificadas
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setShowSaveTemplate(true)}
            style={{ padding: 9, border: "1.5px solid oklch(80% 0.005 90)", borderRadius: 9, background: "#fff", color: "oklch(20% 0 0)", cursor: "pointer", display: "flex" }}
            title="Guardar plantilla"
          >
            <Save size={16} />
          </button>
          <button onClick={autoFillWeek} style={{ padding: "9px 16px", border: "1.5px solid oklch(20% 0 0)", borderRadius: 9, background: "oklch(20% 0 0)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
            Autocompletar
          </button>
        </div>
      </div>

      {templates.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {templates.map((tpl) => (
            <div key={tpl.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 6px 6px 12px", borderRadius: 999, background: "oklch(95% 0.005 90)" }}>
              <button onClick={() => applyTemplate(tpl.id)} style={{ border: "none", background: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer", color: "oklch(20% 0 0)" }}>
                {tpl.name}
              </button>
              <button
                onClick={() => deleteTemplate(tpl.id)}
                style={{ border: "none", background: "oklch(88% 0.005 90)", color: "oklch(30% 0.01 90)", width: 16, height: 16, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}

      {weekProgressPct < 100 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, color: "oklch(55% 0.01 90)" }}>{weekProgressPct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "oklch(93% 0.005 90)" }}>
            <div style={{ height: "100%", borderRadius: 999, width: `${weekProgressPct}%`, background: "oklch(58% 0.15 150)" }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {DAYS.map((day, i) => {
          const n = settings.dayServings[day] ?? settings.defaultServings;
          const dayKcal = activeMeals.reduce((a, m) => a + (resolveEntry(plan[day]?.[m.key])?.kcal ?? 0), 0);
          return (
            <div key={day} style={{ background: "#fff", border: "1px solid oklch(92% 0.005 90)", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "oklch(20% 0 0)" }}>
                  {dayLabel(i)} {dayKcal > 0 && <span style={{ fontWeight: 600, color: "oklch(55% 0.01 90)" }}>· {dayKcal} kcal</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12.5, color: "oklch(45% 0.02 95)", fontWeight: 600 }}>
                    Para {n} {n === 1 ? "persona" : "personas"}
                  </span>
                  <button onClick={() => setDayServings(day, Math.max(1, n - 1))} style={{ border: "none", background: "oklch(95% 0.005 90)", width: 20, height: 20, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Minus size={12} />
                  </button>
                  <button onClick={() => setDayServings(day, n + 1)} style={{ border: "none", background: "oklch(95% 0.005 90)", width: 20, height: 20, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              {activeMeals.map((m, mi) => renderMealRow(day, m.key, m.label, mi === activeMeals.length - 1))}
            </div>
          );
        })}
      </div>

      {pickerSlot && (
        <div
          onClick={closePicker}
          style={{ position: "fixed", inset: 0, background: "oklch(20% 0 0 / 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30, padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, maxHeight: "80vh", overflow: "auto", background: "#fff", borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "oklch(55% 0.01 90)", marginBottom: 12 }}>
              {dayLabel(DAYS.indexOf(pickerSlot.day))} · {MEALS.find((m) => m.key === pickerSlot.mealKey)?.label}
            </div>
            {pickerRecipe ? (
              <>
                <button onClick={() => setPickerRecipe(null)} style={{ border: "none", background: "none", display: "flex", alignItems: "center", gap: 4, color: "oklch(45% 0.01 90)", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 14 }}>
                  <ChevronLeft size={15} /> Volver
                </button>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{pickerRecipe.title}</div>
                <div style={{ fontSize: 13, color: "oklch(50% 0.01 90)", marginBottom: 18 }}>{pickerRecipe.time} min · {pickerRecipe.kcal} kcal</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "oklch(40% 0.01 90)", marginBottom: 8 }}>¿Para cuántas personas?</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button key={n} onClick={() => setPickerServings(n)} style={chipStyle(pickerServings === n, 150)}>
                      {n}
                    </button>
                  ))}
                </div>
                <button onClick={confirmRecipe} style={{ width: "100%", padding: "12px 0", border: "none", borderRadius: 10, background: "oklch(20% 0 0)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  Agregar
                </button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", gap: 2, background: "oklch(95% 0.003 90)", borderRadius: 12, padding: 4, marginBottom: 16 }}>
                  <button onClick={() => setPickerTab("rapidas")} style={{ flex: 1, border: "none", background: pickerTab === "rapidas" ? "#fff" : "transparent", padding: "8px 0", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 13.5, color: "oklch(20% 0 0)" }}>
                    Rápidas
                  </button>
                  <button onClick={() => setPickerTab("recetas")} style={{ flex: 1, border: "none", background: pickerTab === "recetas" ? "#fff" : "transparent", padding: "8px 0", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 13.5, color: "oklch(20% 0 0)" }}>
                    Recetas
                  </button>
                </div>

                {pickerTab === "rapidas" ? (
                  <>
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8, marginBottom: 16 }}>
                      <input
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        placeholder="Título"
                        style={{ flex: 2, minWidth: 0, padding: "10px 12px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 13.5 }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={quickKcal}
                          onChange={(e) => setQuickKcal(e.target.value)}
                          type="number"
                          placeholder="Kcal"
                          style={isMobile
                            ? { flex: 1, minWidth: 0, padding: "10px 8px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 13.5, textAlign: "center" }
                            : { width: 72, flex: "none", padding: "10px 8px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 13.5, textAlign: "center" }}
                        />
                        <button onClick={submitQuickAdd} style={{ flex: "none", border: "none", background: "oklch(20% 0 0)", color: "#fff", borderRadius: 10, padding: "0 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 13 }}>
                          <Plus size={14} /> Agregar
                        </button>
                      </div>
                    </div>
                    {quickFoods.filter((f) => pickerSlot && quickFoodMatchesMeal(f, pickerSlot.mealKey)).map((f) => (
                      <div key={f.id} onClick={() => pickQuickFood(f.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px", borderRadius: 10, cursor: "pointer" }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{f.title}</span>
                        <span style={{ fontSize: 12.5, color: "oklch(50% 0.01 90)" }}>{f.kcal} kcal</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div>
                    {recipes.filter((r) => pickerSlot && recipeMatchesMeal(r, pickerSlot.mealKey)).map((r) => (
                      <div key={r.id} onClick={() => stageRecipe(r)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, borderRadius: 10, cursor: "pointer" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, flex: "none", background: r.img ? `url('${r.img}') center/cover` : "oklch(95% 0.005 90)" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{r.title}</div>
                          <div style={{ fontSize: 12, color: "oklch(50% 0.01 90)" }}>{r.time} min · {r.kcal} kcal</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showSaveTemplate && (
        <div
          onClick={() => setShowSaveTemplate(false)}
          style={{ position: "fixed", inset: 0, background: "oklch(20% 0 0 / 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30, padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 18, padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Guardar plantilla</div>
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ej: Semana típica"
              style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 14, marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowSaveTemplate(false)} style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid oklch(88% 0.005 90)", background: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!templateName.trim()) return;
                  saveTemplate(templateName.trim());
                  setTemplateName("");
                  setShowSaveTemplate(false);
                }}
                style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "oklch(20% 0 0)", color: "#fff", fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
