import React from "react";
import { AbsoluteFill } from "remotion";
import { C, sans, shadowCard } from "./theme";
import { Flower, Wordmark } from "./kit";

const NavItem: React.FC<{ label: string; active?: boolean; icon: string }> = ({
  label,
  active,
  icon,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "10px 12px",
      borderRadius: 9,
      background: active ? C.nav : "transparent",
      color: active ? C.white : C.muted,
      fontFamily: sans,
      fontSize: 15,
      fontWeight: active ? 600 : 500,
    }}
  >
    <span style={{ fontSize: 16, width: 18, textAlign: "center" }}>{icon}</span>
    {label}
  </div>
);

/* App shell with the shared sidebar; content fills the right side. */
export const AppShell: React.FC<{
  children: React.ReactNode;
  prenom?: string;
  progress?: number; // 0..1 → shows prise-en-main widget when < 1
  bg?: string;
}> = ({ children, prenom = "Benjamin", progress, bg = C.bg }) => {
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 296,
            flexShrink: 0,
            borderRight: `1px solid ${C.border}`,
            background: C.white,
            display: "flex",
            flexDirection: "column",
            padding: "26px 16px 18px",
          }}
        >
          <div style={{ padding: "0 8px 18px" }}>
            <Wordmark size={21} />
          </div>

          {/* user pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: C.nav,
                color: C.white,
                fontFamily: sans,
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {prenom[0]}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.text }}>
                {prenom}
              </span>
              <span style={{ fontFamily: sans, fontSize: 12, color: C.muted }}>
                CEGEAS
              </span>
            </div>
          </div>

          <NavItem label="Accueil" icon="⌂" active />
          <NavItem label="Paramètres" icon="⚙" />

          <div
            style={{
              margin: "16px 12px 8px",
              fontFamily: sans,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#a8a49c",
            }}
          >
            Assistants
          </div>
          <NavItem label="Assistant analyse" icon="◱" />
          <NavItem label="Assistant cotation" icon="✉" />
          <NavItem label="Assistant souscription" icon="✎" />

          <div style={{ flex: 1 }} />

          {/* prise-en-main widget */}
          {progress !== undefined && progress < 1 && (
            <div
              style={{
                position: "relative",
                border: `1px solid ${C.greenLight}`,
                borderRadius: 12,
                padding: "12px 12px 14px",
                marginBottom: 12,
                overflow: "hidden",
                background: C.white,
                boxShadow: shadowCard,
              }}
            >
              <div style={{ fontFamily: sans, fontSize: 13.5, fontWeight: 600, color: C.text }}>
                👋 Bienvenue sur Panora
              </div>
              <div style={{ fontFamily: sans, fontSize: 12, color: C.muted, marginTop: 2 }}>
                Voir détail
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  height: 3,
                  width: `${progress * 100}%`,
                  background: C.green,
                }}
              />
            </div>
          )}

          {/* changelog widget */}
          <div
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "10px 12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 13 }}>📣</span>
              <span
                style={{
                  fontFamily: sans,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: C.greenDark,
                }}
              >
                Nouveauté
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: C.green,
                }}
              />
            </div>
            <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 500, color: C.text, marginTop: 6 }}>
              Comparaison multi-entités
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: bg, overflow: "hidden", position: "relative" }}>
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Flowerless = Flower; // re-export convenience
