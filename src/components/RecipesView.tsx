"use client";

import { useState } from "react";
import { LayoutGrid, List, Plus, X } from "lucide-react";
import { GLUTEN_KEYWORDS, MEAL_GROUP_SHORT_LABEL, MEAL_GROUPS, RECIPE_KINDS, TAG_COLORS, neutralChipStyle, chipStyle } from "@/lib/constants";
import type { useHousehold } from "@/hooks/useHousehold";
import type { MealGroup, Recipe } from "@/lib/types";

interface Props {
  household: ReturnType<typeof useHousehold>;
  isMobile: boolean;
}

export default function RecipesView({ household, isMobile }: Props) {
  const { recipes, addRecipe } = household;
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("Todas");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("Saladas");
  const [mealGroup, setMealGroup] = useState<MealGroup>("comida");
  const [ingredients, setIngredients] = useState<{ name: string; qty: string }[]>([{ name: "", qty: "" }]);

  const filtered = recipes.filter(
    (r) =>
      (kindFilter === "Todas" || (kindFilter === "Mis recetas" ? r.isCustom : r.kind === kindFilter)) &&
      r.title.toLowerCase().includes(search.toLowerCase())
  );

  const namesLower = ingredients.map((i) => i.name.toLowerCase());
  const hasGluten = namesLower.some((n) => GLUTEN_KEYWORDS.some((kw) => n.includes(kw)));

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTag("Saladas");
    setMealGroup("comida");
    setIngredients([{ name: "", qty: "" }]);
  };

  const submitRecipe = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    const isGlutenFree = !hasGluten;
    const tags = [tag];
    if (isGlutenFree) tags.push("Sin TACC");
    const recipe: Omit<Recipe, "id"> = {
      title: trimmedTitle,
      description,
      ingredients: ingredients.filter((i) => i.name.trim()),
      kcal: 350,
      time: 20,
      protein: 12,
      carbs: 30,
      fat: 12,
      tags,
      kind: tag,
      mealGroup,
      img: null,
      isCustom: true,
    };
    await addRecipe(recipe);
    resetForm();
    setShowAddModal(false);
  };

  const selected = selectedId ? recipes.find((r) => r.id === selectedId) || null : null;

  const metaLabel = (r: Recipe) =>
    `${r.time} min · ${r.kcal} kcal${r.mealGroup ? ` · ${MEAL_GROUP_SHORT_LABEL[r.mealGroup]}` : ""}`;

  const tagChip = (t: string) => (
    <span
      key={t}
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: TAG_COLORS[t]?.bg || "oklch(94% 0.005 90)",
        color: TAG_COLORS[t]?.fg || "oklch(40% 0.005 90)",
      }}
    >
      {t}
    </span>
  );

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Recetario</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={{ width: 150, padding: "8px 12px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 13, outline: "none", background: "oklch(99% 0.002 90)" }}
          />
          <div style={{ display: "flex", gap: 2, background: "oklch(95% 0.003 90)", borderRadius: 12, padding: 4 }}>
            <button onClick={() => setView("grid")} style={{ border: "none", background: view === "grid" ? "#fff" : "transparent", padding: 8, borderRadius: 9, cursor: "pointer", display: "flex", boxShadow: view === "grid" ? "0 1px 3px oklch(0% 0 0 / 0.12)" : "none" }}><LayoutGrid size={17} /></button>
            <button onClick={() => setView("list")} style={{ border: "none", background: view === "list" ? "#fff" : "transparent", padding: 8, borderRadius: 9, cursor: "pointer", display: "flex", boxShadow: view === "list" ? "0 1px 3px oklch(0% 0 0 / 0.12)" : "none" }}><List size={17} /></button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["Todas", "Mis recetas", ...RECIPE_KINDS].map((k) => (
          <button key={k} onClick={() => setKindFilter(k)} style={neutralChipStyle(kindFilter === k)}>
            {k}
          </button>
        ))}
      </div>

      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(${isMobile ? 150 : 170}px,1fr))`, gap: 16 }}>
          {filtered.map((r) => (
            <div key={r.id} onClick={() => setSelectedId(r.id)} style={{ background: "#fff", border: "1px solid oklch(92% 0.005 90)", borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
              {r.img ? (
                <div style={{ width: "100%", height: 150, backgroundImage: `url('${r.img}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
              ) : (
                <div style={{ width: "100%", height: 150, background: "repeating-linear-gradient(135deg,oklch(95% 0.005 90),oklch(95% 0.005 90) 10px,oklch(97% 0.003 90) 10px,oklch(97% 0.003 90) 20px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ font: "11px ui-monospace,monospace", color: "oklch(55% 0.01 90)" }}>foto de tu receta</span>
                </div>
              )}
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>{r.tags.map(tagChip)}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{r.title}</div>
                <div style={{ fontSize: 12.5, color: "oklch(50% 0.01 90)" }}>{metaLabel(r)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid oklch(92% 0.005 90)", borderRadius: 16, overflow: "hidden" }}>
          {filtered.map((r) => (
            <div key={r.id} onClick={() => setSelectedId(r.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: "1px solid oklch(95% 0.003 90)", cursor: "pointer" }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, flex: "none", background: r.img ? `url('${r.img}') center/cover` : "oklch(95% 0.005 90)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{r.tags.map(tagChip)}</div>
              </div>
              <div style={{ fontSize: 12.5, color: "oklch(50% 0.01 90)", whiteSpace: "nowrap" }}>{metaLabel(r)}</div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAddModal(true)}
        style={{ position: "fixed", bottom: isMobile ? 84 : 32, right: isMobile ? 20 : 32, width: 56, height: 56, borderRadius: "50%", border: "none", background: "oklch(20% 0 0)", color: "#fff", cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Plus size={26} />
      </button>

      {showAddModal && (
        <div onClick={() => setShowAddModal(false)} style={{ position: "fixed", inset: 0, background: "oklch(20% 0 0 / 0.4)", zIndex: 30 }} />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: isMobile ? "100%" : 400,
          maxWidth: "100%",
          background: "#fff",
          boxSizing: "border-box",
          overflowY: "auto",
          padding: 24,
          zIndex: 31,
          borderLeft: "1px solid oklch(90% 0.005 90)",
          transform: `translateX(${showAddModal ? "0" : "100%"})`,
          transition: "transform 0.25s ease",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 18 }}>Añadir mi propia receta</div>

        <label style={{ fontSize: 12, fontWeight: 700, color: "oklch(40% 0.01 90)", display: "block", marginBottom: 6 }}>Título</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Tarta de calabaza"
          style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 14, marginBottom: 16 }}
        />

        <label style={{ fontSize: 12, fontWeight: 700, color: "oklch(40% 0.01 90)", display: "block", marginBottom: 6 }}>¿Para qué comida es?</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {MEAL_GROUPS.map((g) => (
            <button key={g.value} onClick={() => setMealGroup(g.value)} style={chipStyle(mealGroup === g.value, 210)}>
              {g.label}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 12, fontWeight: 700, color: "oklch(40% 0.01 90)", display: "block", marginBottom: 6 }}>Ingredientes</label>
        {ingredients.map((ing, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              value={ing.name}
              onChange={(e) => setIngredients((prev) => prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))}
              placeholder="Ingrediente"
              style={{ flex: 2, minWidth: 0, padding: "9px 10px", borderRadius: 9, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 13.5 }}
            />
            <input
              value={ing.qty}
              onChange={(e) => setIngredients((prev) => prev.map((x, idx) => (idx === i ? { ...x, qty: e.target.value } : x)))}
              placeholder="Cantidad"
              style={{ flex: 1, minWidth: 0, padding: "9px 10px", borderRadius: 9, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 13.5 }}
            />
            <button onClick={() => setIngredients((prev) => prev.filter((_, idx) => idx !== i))} style={{ border: "none", background: "oklch(95% 0.005 90)", width: 34, borderRadius: 9, cursor: "pointer", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={13} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setIngredients((prev) => [...prev, { name: "", qty: "" }])}
          style={{ width: "100%", border: "1.5px dashed oklch(85% 0.005 90)", background: "none", color: "oklch(20% 0 0)", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: "10px 0", borderRadius: 9, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <Plus size={14} /> Agregar ingrediente
        </button>

        <label style={{ fontSize: 12, fontWeight: 700, color: "oklch(40% 0.01 90)", display: "block", marginBottom: 6 }}>Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Pasos o notas de preparación..."
          style={{ width: "100%", minHeight: 80, padding: "11px 12px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 14, marginBottom: 16, resize: "vertical" }}
        />

        <label style={{ fontSize: 12, fontWeight: 700, color: "oklch(40% 0.01 90)", display: "block", marginBottom: 6 }}>Tipo</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {RECIPE_KINDS.map((t) => (
            <button key={t} onClick={() => setTag(t)} style={chipStyle(tag === t, 150)}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "oklch(50% 0.01 90)", marginBottom: 22 }}>
          {hasGluten ? "Contiene ingredientes con gluten" : "Se marcará automáticamente como Sin TACC"}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setShowAddModal(false)} style={{ padding: "11px 18px", borderRadius: 10, border: "1.5px solid oklch(88% 0.005 90)", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={submitRecipe} style={{ padding: "11px 18px", borderRadius: 10, border: "none", background: "oklch(20% 0 0)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            Guardar receta
          </button>
        </div>
      </div>

      {selected && (
        <div onClick={() => setSelectedId(null)} style={{ position: "fixed", inset: 0, background: "oklch(20% 0 0 / 0.4)", zIndex: 30 }} />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: isMobile ? "100%" : 420,
          maxWidth: "100%",
          background: "#fff",
          boxSizing: "border-box",
          overflowY: "auto",
          zIndex: 31,
          borderLeft: "1px solid oklch(90% 0.005 90)",
          transform: `translateX(${selected ? "0" : "100%"})`,
          transition: "transform 0.25s ease",
        }}
      >
        {selected?.img && (
          <div style={{ width: "100%", height: 220, backgroundImage: `url('${selected.img}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <div style={{ padding: 24 }}>
          <button
            onClick={() => setSelectedId(null)}
            style={{ border: "none", background: "oklch(95% 0.005 90)", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={13} />
          </button>
          {selected && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>{selected.tags.map(tagChip)}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{selected.title}</div>
              <div style={{ fontSize: 13.5, color: "oklch(50% 0.01 90)", marginBottom: 20 }}>{metaLabel(selected)}</div>

              {!!selected.ingredients?.length && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Ingredientes</div>
                  <div style={{ marginBottom: 20 }}>
                    {selected.ingredients.map((ing, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid oklch(95% 0.003 90)", fontSize: 14 }}>
                        <span>{ing.name}</span>
                        <span style={{ color: "oklch(50% 0.01 90)" }}>{ing.qty}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selected.description && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Descripción</div>
                  <p style={{ fontSize: 14, color: "oklch(30% 0.01 90)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selected.description}</p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
