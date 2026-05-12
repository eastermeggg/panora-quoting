"use client";

import { useEffect } from "react";
import { Lock, ArrowRight, User, Calendar } from "lucide-react";
import {
  BrandingSettings,
  ensureTitleFontLoaded,
  getOnColorPalette,
} from "@/data/branding";

interface LienDynamiquePreviewProps {
  branding: BrandingSettings;
  clientName?: string;
  productLabels?: string[];
  insurerNames?: string[];
  brokerName?: string;
  scale?: number;
}

const LANDSCAPE_WIDTH = 1440;
const LANDSCAPE_HEIGHT = 900;
const DEFAULT_SCALE = 0.38;

export function LienDynamiquePreview({
  branding,
  clientName = "Supervan SAS",
  productLabels = ["RC Pro", "Cyber"],
  insurerNames = ["Axa", "Generali", "Assureur", "Nom assureur"],
  brokerName = "Marie Dupont",
  scale: scaleOverride,
}: LienDynamiquePreviewProps) {
  const SCALE = scaleOverride ?? DEFAULT_SCALE;

  useEffect(() => {
    ensureTitleFontLoaded(branding.titleFont);
  }, [branding.titleFont]);

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const titleFontFamily = `"${branding.titleFont}", "Inter Display", serif`;
  const initial = clientName.charAt(0).toUpperCase();

  return (
    <div
      className="relative rounded-[8px] overflow-hidden shadow-[0px_30px_60px_-20px_rgba(0,0,0,0.25),0px_6px_18px_-8px_rgba(0,0,0,0.12)] border border-panora-border"
      style={{
        width: LANDSCAPE_WIDTH * SCALE,
        height: LANDSCAPE_HEIGHT * SCALE,
      }}
    >
      <div
        style={{
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          width: LANDSCAPE_WIDTH,
          height: LANDSCAPE_HEIGHT,
        }}
      >
        <LienDynamiqueA4
          branding={branding}
          clientName={clientName}
          productLabels={productLabels}
          insurerNames={insurerNames}
          brokerName={brokerName}
          today={today}
          titleFontFamily={titleFontFamily}
          initial={initial}
        />
      </div>
    </div>
  );
}

interface InnerProps {
  branding: BrandingSettings;
  clientName: string;
  productLabels: string[];
  insurerNames: string[];
  brokerName: string;
  today: string;
  titleFontFamily: string;
  initial: string;
}

function LienDynamiqueA4({
  branding,
  clientName,
  productLabels,
  insurerNames,
  brokerName,
  today,
  titleFontFamily,
  initial,
}: InnerProps) {
  const palette = getOnColorPalette(branding.primaryColor);
  return (
    <div
      style={{
        width: LANDSCAPE_WIDTH,
        height: LANDSCAPE_HEIGHT,
        backgroundColor: branding.primaryColor,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Hero area */}
      <div style={{ flex: "1 1 auto", display: "flex", minHeight: 0 }}>
        {/* Main content */}
        <div
          style={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 32,
            padding: 64,
            color: palette.foreground,
          }}
        >
          {/* Study Info: eyebrow + title + company */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Lock
                  className=""
                  style={{ width: 20, height: 20, color: palette.foregroundSecondary }}
                />
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 12,
                    letterSpacing: "0.72px",
                    textTransform: "uppercase",
                    color: palette.foregroundSecondary,
                    margin: 0,
                  }}
                >
                  Présentation confidentielle
                </p>
              </div>
              <p
                style={{
                  fontFamily: titleFontFamily,
                  fontWeight: 400,
                  fontSize: 72,
                  letterSpacing: "-1px",
                  lineHeight: "70.56px",
                  color: palette.foreground,
                  margin: 0,
                }}
              >
                Étude des offres d&rsquo;assurance
              </p>
            </div>
            <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: palette.chipBg,
                  border: `1px solid ${palette.chipBorder}`,
                  boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: palette.foreground,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {initial}
              </div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 16,
                  color: palette.foreground,
                  margin: 0,
                }}
              >
                {clientName}
              </p>
            </div>
          </div>

          {/* Product tags */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            {productLabels.map((label) => (
              <div
                key={label}
                style={{
                  background: palette.chipBg,
                  border: `1px solid ${palette.chipBorder}`,
                  borderRadius: 10,
                  padding: "8px 14px",
                  boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: palette.foregroundStrong,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Insurers row + CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: "0.72px",
                  textTransform: "uppercase",
                  color: palette.foregroundSecondary,
                  margin: 0,
                }}
              >
                Assureurs consultés
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {insurerNames.map((name) => (
                  <div
                    key={name}
                    style={{
                      height: 36,
                      background: palette.chipBg,
                      border: `1px solid ${palette.chipBorder}`,
                      borderRadius: 10,
                      padding: "0 14px 0 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        background: "#5a8dff",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: 13,
                        color: palette.foregroundStrong,
                      }}
                    >
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA button */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0px 1px 1px rgba(0,0,0,0.05)",
                color: "#000000",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <span>Accéder au comparatif</span>
              <ArrowRight style={{ width: 16, height: 16 }} />
            </div>
          </div>
        </div>

        {/* Decorative right rail */}
        <div
          style={{
            width: 303,
            flexShrink: 0,
            background: "rgba(255,255,255,0.06)",
          }}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          background: "#ffffff",
          borderTop: "1px solid rgba(14,17,22,0.08)",
          padding: "25px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {branding.logoDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={branding.logoDataUrl}
              alt=""
              style={{ height: 20, width: "auto", maxWidth: 180, objectFit: "contain" }}
            />
          ) : (
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#0e1116",
                opacity: 0.4,
              }}
            >
              VOTRE LOGO
            </span>
          )}
          <FooterPair label="ORIAS" value="XXX XXX XXX XXX" />
          <FooterPair label="Adresse" value="12 rue Martel, 75010 Paris" />
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <FooterPair icon={<User style={{ width: 18, height: 18, opacity: 0.5 }} />} label="Préparé par" value={brokerName} />
          <FooterPair icon={<Calendar style={{ width: 18, height: 18, opacity: 0.5 }} />} label="Le" value={today} />
        </div>
      </div>
    </div>
  );
}

function FooterPair({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
      {icon}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 12,
          letterSpacing: "0.72px",
          textTransform: "uppercase",
          color: "#22201a",
          opacity: 0.6,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          color: "#000000",
        }}
      >
        {value}
      </span>
    </div>
  );
}
