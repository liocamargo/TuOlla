"use client";

import { useState } from "react";

interface Props {
  onGoogleLogin: () => void;
  onSendMagicLink: (email: string) => void;
  magicLinkSent: boolean;
  error: string | null;
}

export default function LoginScreen({ onGoogleLogin, onSendMagicLink, magicLinkSent, error }: Props) {
  const [email, setEmail] = useState("");

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid oklch(91% 0.005 90)", borderRadius: 20, padding: "40px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "oklch(20% 0 0)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: "oklch(50% 0.01 90)", textTransform: "uppercase" }}>
            Tu Olla
          </span>
        </div>

        {!magicLinkSent ? (
          <>
            <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800 }}>Iniciar sesión</h1>
            <p style={{ margin: "0 0 28px", fontSize: 14.5, color: "oklch(50% 0.01 90)", lineHeight: 1.5 }}>
              Entrá para armar tu menú semanal.
            </p>

            <button
              onClick={onGoogleLogin}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: 13,
                borderRadius: 12,
                border: "1.5px solid oklch(88% 0.005 90)",
                background: "#fff",
                fontSize: 14.5,
                fontWeight: 700,
                cursor: "pointer",
                color: "oklch(20% 0.01 90)",
                marginBottom: 18,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ flex: "none" }}>
                <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
                <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.86-12.32-9.05H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
                <path fill="#FBBC05" d="M11.68 28.2c-.44-1.32-.69-2.72-.69-4.2s.25-2.88.69-4.2v-5.7H4.34C2.85 16.98 2 20.36 2 24s.85 7.02 2.34 9.9l7.34-5.7z" />
                <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.1l7.34 5.7c1.74-5.19 6.59-9.05 12.32-9.05z" />
              </svg>
              Continuar con Google
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: "oklch(90% 0.005 90)" }} />
              <span style={{ fontSize: 12, color: "oklch(55% 0.01 90)" }}>o</span>
              <div style={{ flex: 1, height: 1, background: "oklch(90% 0.005 90)" }} />
            </div>

            <label style={{ fontSize: 12, fontWeight: 700, color: "oklch(40% 0.01 90)", display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid oklch(90% 0.005 90)",
                fontSize: 14,
                outline: "none",
                background: "oklch(99% 0.002 90)",
                marginBottom: 16,
              }}
            />
            <button
              onClick={() => email.trim() && onSendMagicLink(email.trim())}
              style={{
                width: "100%",
                padding: 13,
                border: "none",
                borderRadius: 12,
                background: "oklch(20% 0 0)",
                color: "#fff",
                fontSize: 14.5,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Enviar link de acceso por email
            </button>
          </>
        ) : (
          <>
            <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800 }}>Revisá tu email</h1>
            <p style={{ margin: "0 0 26px", fontSize: 14.5, color: "oklch(50% 0.01 90)", lineHeight: 1.5 }}>
              Te enviamos un link de acceso a <strong>{email}</strong>. Abrilo desde este mismo dispositivo para
              entrar.
            </p>
          </>
        )}

        {error && (
          <p style={{ marginTop: 16, fontSize: 13, color: "oklch(50% 0.18 25)" }}>{error}</p>
        )}
      </div>
    </div>
  );
}
