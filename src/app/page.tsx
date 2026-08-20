"use client";

import { useAuth } from "@/hooks/useAuth";
import { useHousehold } from "@/hooks/useHousehold";
import LoginScreen from "@/components/LoginScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import AppShell from "@/components/AppShell";

export default function Home() {
  const { user, householdId, loading, error, magicLinkSent, loginWithGoogle, sendMagicLink, logout } = useAuth();
  const household = useHousehold(householdId);

  if (loading) {
    return <FullScreenMessage text="Cargando..." />;
  }

  if (!user) {
    return (
      <LoginScreen
        onGoogleLogin={loginWithGoogle}
        onSendMagicLink={sendMagicLink}
        magicLinkSent={magicLinkSent}
        error={error}
      />
    );
  }

  if (!householdId || !household.ready) {
    return <FullScreenMessage text="Preparando tu espacio..." />;
  }

  if (!household.settings.onboardingDone) {
    return <OnboardingScreen settings={household.settings} onComplete={household.updateSettings} />;
  }

  return <AppShell user={user} household={household} householdId={householdId} onLogout={logout} />;
}

function FullScreenMessage({ text }: { text: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "oklch(50% 0.01 90)", fontSize: 14 }}>
      {text}
    </div>
  );
}
