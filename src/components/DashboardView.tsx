"use client";

import { useState } from "react";
import { Minus, Plus, Save, Shuffle, X } from "lucide-react";
import { DAYS, MEALS, WEEKLY_KCAL_GOAL, WEEKLY_PROTEIN_GOAL, WEEKLY_CARBS_GOAL, WEEKLY_FAT_GOAL, dayLabel, recipeMatchesMeal } from "@/lib/constants";
import type { useHousehold } from "@/hooks/useHousehold";
import type { MealKey, Recipe } from "@/lib/types";

interface Props {
  household: ReturnType<typeof useHousehold>;
  isMobile: boolean;
}

export default function DashboardView({ household, isMobile }: Props) {
  const { settings, plan, assignRecipe, recipes, templates, saveTemplate, applyTemplate, deleteTemplate, setPlan, updateSettings } = household;
  const [focusedDayIndex, setFocusedDayIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"dia" | "todos">("dia");
  const [pickerSlot, setPickerSlot] = useState<{ day: string; mealKey: MealKey } | null>(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const activeMeals = MEALS.filter((m) => settings.enabledMeals[m.key]);
  const recipeById = (id: string | null) => (id ? recipes.find((r) => r.id === id) || null : null);

  const plannedList: Recipe[] = [];
  DAYS.forEach((day) => activeMeals.forEach((m) => { const r = recipeById(plan[day]?.[m.key] ?? null); if (r) plannedList.push(r); }));
  const totalKcal = plannedList.reduce((a, r) => a + r.kcal, 0);
  const totalProtein = plannedList.reduce((a, r) => a + r.protein, 0);
  const totalCarbs = plannedList.reduce((a, r) => a + r.carbs, 0);
  const totalFat = plannedList.reduce((a, r) => a + r.fat, 0);
  const totalSlots = DAYS.length * activeMeals.length;
  const weekProgressPct = totalSlots ? Math.round((plannedList.length / totalSlots) * 100) : 0;

  const macroDefs = [
    { label: "Proteínas", total: totalProtein, goal: WEEKLY_PROTEIN_GOAL },
    { label: "Carbohidratos", total: totalCarbs, goal: WEEKLY_CARBS_GOAL },
    { label: "Grasas", total: totalFat, goal: WEEKLY_FAT_GOAL },
  ];

  const focusedDay = DAYS[focusedDayIndex];
  const focusedDayRecipes = activeMeals.map((m) => recipeById(plan[focusedDay]?.[m.key] ?? null)).filter(Boolean) as Recipe[];
  const heroDayKcal = focusedDayRecipes.reduce((a, r) => a + r.kcal, 0);
  const focusedDayServings = settings.dayServings[focusedDay] ?? settings.defaultServings;

  const setDayServings = (n: number) => {
    updateSettings({ dayServings: { ...settings.dayServings, [focusedDay]: n } });
  };

  const autoFillWeek = () => {
    const next = { ...plan };
    DAYS.forEach((day) => {
      next[day] = { ...next[day] };
      activeMeals.forEach((m) => {
        if (!next[day][m.key]) {
          const pool = recipes.filter((r) => recipeMatchesMeal(r, m.key));
          const options = pool.length ? pool : recipes;
          if (options.length) next[day][m.key] = options[Math.floor(Math.random() * options.length)].id;
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
    assignRecipe(day, mealKey, list[Math.floor(Math.random() * list.length)].id);
  };

  const renderMealRow = (day: string, mealKey: MealKey, label: string, isLast: boolean) => {
    const recipe = recipeById(plan[day]?.[mealKey] ?? null);
    return (
      <div key={mealKey} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: isLast ? "none" : "1px dashed oklch(80% 0.04 90)" }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(45% 0.02 95)", width: 76, flex: "none" }}>
          {label}
        </div>
        {recipe ? (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{recipe.title}</div>
              <div style={{ fontSize: 12, color: "oklch(50% 0.01 90)" }}>{recipe.time} min · {recipe.kcal} kcal</div>
            </div>
            <button onClick={() => assignRecipe(day, mealKey, null)} style={{ border: "none", background: "none", cursor: "pointer", flex: "none", color: "oklch(45% 0.01 90)", display: "flex", padding: 4 }}>
              <X size={15} />
            </button>
            <button onClick={() => swapForComodin(day, mealKey)} style={{ border: "none", background: "none", cursor: "pointer", flex: "none", color: "oklch(45% 0.01 90)", display: "flex", padding: 4 }}>
              <Shuffle size={15} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setPickerSlot({ day, mealKey })}
            style={{ flex: 1, textAlign: "left", border: "none", background: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "oklch(45% 0.01 90)", cursor: "pointer", padding: "8px 0" }}
          >
            <Plus size={15} /> Añadir receta
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
          <div style={{ display: "flex", gap: 2, background: "oklch(95% 0.003 90)", borderRadius: 12, padding: 4 }}>
            <button onClick={() => setViewMode("dia")} style={{ border: "none", background: viewMode === "dia" ? "oklch(92% 0.005 90)" : "transparent", padding: 8, borderRadius: 9, cursor: "pointer", color: "oklch(30% 0.01 90)" }}>
              Día
            </button>
            <button onClick={() => setViewMode("todos")} style={{ border: "none", background: viewMode === "todos" ? "oklch(92% 0.005 90)" : "transparent", padding: 8, borderRadius: 9, cursor: "pointer", color: "oklch(30% 0.01 90)" }}>
              Todos
            </button>
          </div>
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

      {viewMode === "dia" ? (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {DAYS.map((day, i) => {
              const selected = i === focusedDayIndex;
              return (
                <button
                  key={day}
                  onClick={() => setFocusedDayIndex(i)}
                  style={{
                    flex: 1,
                    padding: "10px 6px",
                    borderRadius: 999,
                    border: `1.5px solid ${selected ? "oklch(20% 0 0)" : "oklch(90% 0.005 90)"}`,
                    background: selected ? "oklch(20% 0 0)" : "#fff",
                    color: selected ? "#fff" : "oklch(30% 0.01 90)",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {dayLabel(i).slice(0, 3)}
                </button>
              );
            })}
          </div>

          <div style={{ background: "#fff1b8", borderRadius: 16, padding: "6px 20px", width: "100%", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "oklch(20% 0 0)" }}>{dayLabel(focusedDayIndex)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: "oklch(45% 0.02 95)", fontWeight: 600 }}>
                  Para {focusedDayServings} {focusedDayServings === 1 ? "persona" : "personas"}
                </span>
                <button onClick={() => setDayServings(Math.max(1, focusedDayServings - 1))} style={{ border: "none", background: "oklch(100% 0 0 / 0.6)", width: 20, height: 20, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Minus size={12} />
                </button>
                <button onClick={() => setDayServings(focusedDayServings + 1)} style={{ border: "none", background: "oklch(100% 0 0 / 0.6)", width: 20, height: 20, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={12} />
                </button>
              </div>
            </div>
            {activeMeals.map((m, i) => renderMealRow(focusedDay, m.key, m.label, i === activeMeals.length - 1))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 12 }}>
            <MacroTile label={`Calorías de ${dayLabel(focusedDayIndex)}`} value={`${heroDayKcal} kcal`} />
            <MacroTile label="Proteínas" value={`${focusedDayRecipes.reduce((a, r) => a + r.protein, 0)}g`} />
            <MacroTile label="Carbohidratos" value={`${focusedDayRecipes.reduce((a, r) => a + r.carbs, 0)}g`} />
            <MacroTile label="Grasas" value={`${focusedDayRecipes.reduce((a, r) => a + r.fat, 0)}g`} />
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11.5, color: "oklch(50% 0.01 90)", marginBottom: 4 }}>
              {totalKcal} / {WEEKLY_KCAL_GOAL} kcal esta semana
            </div>
            {macroDefs.map((m) => {
              const p = Math.min(100, Math.round((m.total / m.goal) * 100));
              return (
                <div key={m.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "oklch(50% 0.01 90)", marginBottom: 4 }}>
                    <span>{m.label}</span>
                    <span>{m.total}g / {m.goal}g</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "oklch(93% 0.005 90)" }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${p}%`, background: "oklch(45% 0.005 90)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {DAYS.map((day, i) => {
            const n = settings.dayServings[day] ?? settings.defaultServings;
            return (
              <div key={day} style={{ background: "#fff", border: "1px solid oklch(92% 0.005 90)", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "oklch(20% 0 0)" }}>{dayLabel(i)}</div>
                  <span style={{ fontSize: 12.5, color: "oklch(45% 0.02 95)", fontWeight: 600 }}>
                    Para {n} {n === 1 ? "persona" : "personas"}
                  </span>
                </div>
                {activeMeals.map((m, mi) => renderMealRow(day, m.key, m.label, mi === activeMeals.length - 1))}
              </div>
            );
          })}
        </div>
      )}

      {pickerSlot && (
        <div
          onClick={() => setPickerSlot(null)}
          style={{ position: "fixed", inset: 0, background: "oklch(20% 0 0 / 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30, padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, maxHeight: "70vh", overflow: "auto", background: "#fff", borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Elegí una receta</div>
            {recipes.filter((r) => recipeMatchesMeal(r, pickerSlot.mealKey)).map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  assignRecipe(pickerSlot.day, pickerSlot.mealKey, r.id);
                  setPickerSlot(null);
                }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, borderRadius: 10, cursor: "pointer" }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 10, flex: "none", background: r.img ? `url('${r.img}') center/cover` : "oklch(95% 0.005 90)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: "oklch(50% 0.01 90)" }}>{r.time} min · {r.kcal} kcal</div>
                </div>
              </div>
            ))}
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

function MacroTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "oklch(97% 0.003 90)", borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ fontSize: 11.5, color: "oklch(50% 0.01 90)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
