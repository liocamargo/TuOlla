"use client";

import { useState } from "react";
import { AISLE_EMOJI, neutralChipStyle } from "@/lib/constants";
import type { useHousehold } from "@/hooks/useHousehold";
import type { ShoppingItem } from "@/lib/types";

interface Props {
  household: ReturnType<typeof useHousehold>;
  isMobile: boolean;
  collapsed: boolean;
}

export default function ShoppingView({ household, isMobile, collapsed }: Props) {
  const { shoppingItems, toggleShoppingItem, deleteShoppingItem, addShoppingItem } = household;
  const [aisleFilter, setAisleFilter] = useState("Todos");
  const [viewMode, setViewMode] = useState<"categoria" | "junto">("categoria");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemAisle, setNewItemAisle] = useState("Otros");

  const aisleNamesPresent = [...new Set(shoppingItems.map((it) => it.aisle))];
  const visibleItems = shoppingItems.filter((it) => aisleFilter === "Todos" || it.aisle === aisleFilter);
  const byAisle: Record<string, ShoppingItem[]> = {};
  visibleItems.forEach((it) => {
    (byAisle[it.aisle] = byAisle[it.aisle] || []).push(it);
  });

  const submitGeneral = () => {
    const name = newItemName.trim();
    if (!name) return;
    addShoppingItem({ name, qty: newItemQty.trim() || "1", aisle: newItemAisle, emoji: AISLE_EMOJI[newItemAisle] || "🧺" });
    setNewItemName("");
    setNewItemQty("1");
  };

  const submitToAisle = (aisle: string) => {
    const name = (drafts[aisle] || "").trim();
    if (!name) return;
    addShoppingItem({ name, qty: "1", aisle, emoji: AISLE_EMOJI[aisle] || "🧺" });
    setDrafts((d) => ({ ...d, [aisle]: "" }));
  };

  const renderItem = (it: ShoppingItem) => (
    <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "1px solid oklch(95% 0.003 90)" }}>
      <div style={{ fontSize: 13, color: "oklch(55% 0.01 90)", flex: "none", width: 44 }}>{it.qty}</div>
      <div style={{ flex: 1, fontSize: 14, textDecoration: it.checked ? "line-through" : "none", color: it.checked ? "oklch(65% 0.005 90)" : "inherit" }}>
        {it.name}
      </div>
      <button onClick={() => deleteShoppingItem(it.id)} style={{ border: "none", background: "none", color: "oklch(60% 0.01 90)", cursor: "pointer", flex: "none", display: "flex", padding: 2 }}>
        🗑
      </button>
      <input type="checkbox" checked={it.checked} onChange={(e) => toggleShoppingItem(it.id, e.target.checked)} style={{ width: 18, height: 18, accentColor: "oklch(20% 0 0)", cursor: "pointer", flex: "none" }} />
    </div>
  );

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Lista de compras</h1>
        <div style={{ display: "flex", gap: 2, background: "oklch(95% 0.003 90)", borderRadius: 12, padding: 4 }}>
          <button onClick={() => setViewMode("categoria")} style={{ border: "none", background: viewMode === "categoria" ? "#fff" : "transparent", padding: 8, borderRadius: 9, cursor: "pointer", boxShadow: viewMode === "categoria" ? "0 1px 3px oklch(0% 0 0 / 0.12)" : "none" }}>
            ▦
          </button>
          <button onClick={() => setViewMode("junto")} style={{ border: "none", background: viewMode === "junto" ? "#fff" : "transparent", padding: 8, borderRadius: 9, cursor: "pointer", boxShadow: viewMode === "junto" ? "0 1px 3px oklch(0% 0 0 / 0.12)" : "none" }}>
            ☰
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {["Todos", ...aisleNamesPresent].map((name) => {
          const selected = aisleFilter === name;
          const emoji = name === "Todos" ? "" : `${shoppingItems.find((it) => it.aisle === name)?.emoji || ""} `;
          return (
            <button key={name} onClick={() => setAisleFilter(name)} style={neutralChipStyle(selected)}>
              {emoji}{name}
            </button>
          );
        })}
      </div>

      {viewMode === "categoria" ? (
        Object.keys(byAisle).length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "oklch(55% 0.01 90)", fontSize: 14 }}>No te queda nada por comprar</div>
        ) : (
          Object.keys(byAisle).map((aisle) => (
            <div key={aisle} style={{ marginBottom: 22, background: "#fff", border: "1px solid oklch(92% 0.005 90)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ fontSize: 14, fontWeight: 800, padding: "14px 16px", borderBottom: "1px solid oklch(93% 0.005 90)" }}>
                {byAisle[aisle][0].emoji} {aisle}
              </div>
              <div>
                {byAisle[aisle].map(renderItem)}
                <div style={{ display: "flex", gap: 8, padding: "10px 16px" }}>
                  <input
                    value={drafts[aisle] || ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [aisle]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitToAisle(aisle); } }}
                    placeholder="Agregar item..."
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 13 }}
                  />
                  <button onClick={() => submitToAisle(aisle)} style={{ border: "none", background: "oklch(95% 0.005 90)", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
          ))
        )
      ) : visibleItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "oklch(55% 0.01 90)", fontSize: 14 }}>No te queda nada por comprar</div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid oklch(92% 0.005 90)", borderRadius: 14, overflow: "hidden" }}>
          {visibleItems.map(renderItem)}
        </div>
      )}

      <div
        style={{
          position: "fixed",
          left: isMobile ? 0 : collapsed ? 76 : 220,
          right: 0,
          bottom: isMobile ? 64 : 0,
          zIndex: 16,
          background: "#fff",
          borderTop: "1px solid oklch(92% 0.005 90)",
          boxShadow: "0 -6px 24px oklch(0% 0 0 / 0.07)",
          padding: `12px ${isMobile ? 14 : 40}px`,
          display: "flex",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", width: "100%", maxWidth: 760 }}>
          <input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitGeneral(); } }}
            placeholder="Agregar producto..."
            style={{ flex: 1, minWidth: isMobile ? "100%" : 180, padding: "11px 14px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 14, outline: "none", background: "oklch(99% 0.002 90)" }}
          />
          <input
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            type="text"
            placeholder="Cant."
            title="Cantidad"
            style={{ width: 64, flex: "none", padding: "11px 8px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 14, textAlign: "center", outline: "none", background: "oklch(99% 0.002 90)" }}
          />
          <select
            value={newItemAisle}
            onChange={(e) => setNewItemAisle(e.target.value)}
            style={{ flex: "none", padding: "11px 10px", borderRadius: 10, border: "1.5px solid oklch(90% 0.005 90)", fontSize: 14, background: "#fff", outline: "none" }}
          >
            {Object.keys(AISLE_EMOJI).map((a) => (
              <option key={a} value={a}>{AISLE_EMOJI[a]} {a}</option>
            ))}
          </select>
          <button onClick={submitGeneral} style={{ flex: "none", padding: "11px 18px", border: "none", borderRadius: 10, background: "oklch(20% 0 0)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
            + Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
