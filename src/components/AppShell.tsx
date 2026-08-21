"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { CalendarDays, ChevronLeft, ChevronRight, CookingPot, ShoppingCart } from "lucide-react";
import type { useHousehold } from "@/hooks/useHousehold";
import DashboardView from "./DashboardView";
import ShoppingView from "./ShoppingView";
import RecipesView from "./RecipesView";
import AccountView from "./AccountView";

type Screen = "dashboard" | "shopping" | "recipes" | "account";

interface Props {
  user: User;
  household: ReturnType<typeof useHousehold>;
  householdId: string;
  onLogout: () => void;
}

const NAV_DEFS: { key: Screen; label: string }[] = [
  { key: "dashboard", label: "Menú semanal" },
  { key: "shopping", label: "Compras" },
  { key: "recipes", label: "Recetas" },
];

export default function AppShell({ user, household, householdId, onLogout }: Props) {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 900);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const collapsed = !isMobile && navCollapsed;
  const onShoppingScreen = screen === "shopping";

  const profileEmail = user.email || "Cuenta de Google";
  const profileInitial = (user.displayName || user.email || "V")[0].toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh" }}>
      <nav
        style={
          isMobile
            ? {
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                height: 64,
                background: "#fff",
                borderTop: "1px solid oklch(92% 0.005 90)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "0 8px",
                zIndex: 15,
              }
            : {
                width: collapsed ? 76 : 220,
                flex: "none",
                height: "100vh",
                position: "sticky",
                top: 0,
                background: "#fff",
                borderRight: "1px solid oklch(92% 0.005 90)",
                padding: `24px ${collapsed ? 14 : 18}px`,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }
        }
      >
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: "oklch(20% 0 0)", flex: "none" }} />
              {!collapsed && (
                <>
                  <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.01em", overflow: "hidden", whiteSpace: "nowrap" }}>
                    Tu Olla
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "oklch(55% 0.13 50)",
                      background: "oklch(94% 0.03 50)",
                      padding: "2px 6px",
                      borderRadius: 5,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      flex: "none",
                    }}
                  >
                    Beta
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => setNavCollapsed((c) => !c)}
              style={{
                border: "none",
                background: "oklch(95% 0.005 90)",
                width: 26,
                height: 26,
                borderRadius: 8,
                cursor: "pointer",
                flex: "none",
                color: "oklch(30% 0.01 90)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
        )}

        <div style={isMobile ? { display: "flex", width: "100%", justifyContent: "space-around" } : { display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          <div style={isMobile ? { display: "flex", width: "100%", justifyContent: "space-around" } : { display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV_DEFS.map((n) => {
              const active = screen === n.key;
              const color = active ? "oklch(20% 0 0)" : "oklch(45% 0.01 90)";
              const bg = !isMobile && active ? "oklch(94% 0.005 90)" : "transparent";
              return (
                <button
                  key={n.key}
                  onClick={() => setScreen(n.key)}
                  style={
                    isMobile
                      ? { border: "none", background: "none", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 10px", cursor: "pointer", color }
                      : { border: "none", background: bg, display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "11px 12px", borderRadius: 10, cursor: "pointer", color }
                  }
                >
                  <NavIcon k={n.key} color={color} />
                  {(!collapsed || isMobile) && (
                    <span style={isMobile ? { fontSize: 11, fontWeight: 700, marginTop: 2 } : { display: "block" }}>{n.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {!isMobile && (
            <div
              onClick={() => setScreen("account")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 4px",
                borderTop: "1px solid oklch(93% 0.005 90)",
                marginTop: "auto",
                cursor: "pointer",
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "oklch(20% 0 0)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flex: "none" }}>
                {profileInitial}
              </div>
              {!collapsed && (
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Vos</div>
                  <div style={{ fontSize: 11.5, color: "oklch(55% 0.01 90)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profileEmail}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: isMobile ? `24px 16px ${onShoppingScreen ? 190 : 90}px` : `36px 40px ${onShoppingScreen ? 130 : 36}px`,
          overflowX: "hidden",
          background: "#fff",
        }}
      >
        {screen === "dashboard" && <DashboardView household={household} />}
        {screen === "shopping" && <ShoppingView household={household} isMobile={isMobile} collapsed={navCollapsed} />}
        {screen === "recipes" && <RecipesView household={household} isMobile={isMobile} />}
        {screen === "account" && (
          <AccountView user={user} household={household} householdId={householdId} onLogout={onLogout} />
        )}
      </main>
    </div>
  );
}

function NavIcon({ k, color }: { k: Screen; color: string }) {
  const style = { flex: "none" as const };
  if (k === "dashboard") return <CalendarDays size={20} color={color} style={style} />;
  if (k === "shopping") return <ShoppingCart size={20} color={color} style={style} />;
  return <CookingPot size={20} color={color} style={style} />;
}
