"use client";

import { useEffect } from "react";
import {
  BrandingSettings,
  ensureTitleFontLoaded,
  getOnColorPalette,
} from "@/data/branding";

interface CoverPagePreviewProps {
  branding: BrandingSettings;
  clientName?: string;
  productLabel?: string;
  /** Override the default 0.52 scale — useful for thumbnails. */
  scale?: number;
}

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const DEFAULT_SCALE = 0.52;

export function CoverPagePreview({
  branding,
  clientName = "Marble Inc.",
  productLabel = "RC Pro",
  scale: scaleOverride,
}: CoverPagePreviewProps) {
  const SCALE = scaleOverride ?? DEFAULT_SCALE;

  useEffect(() => {
    ensureTitleFontLoaded(branding.titleFont);
  }, [branding.titleFont]);

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const titleFontFamily = `"${branding.titleFont}", "Inter Display", serif`;

  return (
    <div
      className="relative bg-white rounded-[6px] overflow-hidden shadow-[0px_30px_60px_-20px_rgba(0,0,0,0.25),0px_6px_18px_-8px_rgba(0,0,0,0.12)] border border-panora-border"
      style={{
        width: A4_WIDTH * SCALE,
        height: A4_HEIGHT * SCALE,
      }}
    >
      <div
        style={{
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          width: A4_WIDTH,
          height: A4_HEIGHT,
        }}
      >
        <CoverPageA4
          branding={branding}
          clientName={clientName}
          productLabel={productLabel}
          today={today}
          titleFontFamily={titleFontFamily}
        />
      </div>
    </div>
  );
}

interface CoverPageA4Props {
  branding: BrandingSettings;
  clientName: string;
  productLabel: string;
  today: string;
  titleFontFamily: string;
}

function CoverPageA4({
  branding,
  clientName,
  productLabel,
  today,
  titleFontFamily,
}: CoverPageA4Props) {
  const bannerPalette = getOnColorPalette(branding.primaryColor);
  return (
    <div
      style={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Colored banner */}
      <div
        style={{
          backgroundColor: branding.primaryColor,
          flex: "0 0 748px",
          height: 748,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 40,
          color: bannerPalette.foreground,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 10,
            letterSpacing: "2.2px",
            textTransform: "uppercase",
            color: bannerPalette.foregroundMuted,
          }}
        >
          Synthèse Comparative
        </div>
        <div
          style={{
            fontFamily: titleFontFamily,
            fontWeight: 400,
            fontSize: 72,
            lineHeight: "70.56px",
            letterSpacing: "-1px",
            color: bannerPalette.foreground,
          }}
        >
          <div>Proposition</div>
          <div>d&apos;assurance {productLabel}</div>
        </div>
      </div>

      {/* White middle */}
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          padding: "56px 40px",
          color: "#0e1116",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 520 }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 10,
              letterSpacing: "2.2px",
              textTransform: "uppercase",
              opacity: 0.5,
            }}
          >
            Préparé pour
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 32,
              letterSpacing: "-0.64px",
              lineHeight: 1.1,
            }}
          >
            {clientName}
          </div>
        </div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            lineHeight: "20.15px",
            letterSpacing: "-0.065px",
            color: "#0e1116",
          }}
        >
          <div>Étude personnalisée · {productLabel}.</div>
          <div>
            Comparatif des garanties, franchises et exclusions sur les porteurs de risque
          </div>
          <div>retenus.</div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(14, 17, 22, 0.08)",
          padding: "25px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {branding.logoDataUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={branding.logoDataUrl}
            alt="Logo"
            style={{ height: 20, width: "auto", maxWidth: 180, objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#0e1116",
              opacity: 0.4,
            }}
          >
            Votre logo
          </div>
        )}
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 10,
            letterSpacing: "2.2px",
            textTransform: "uppercase",
            color: "#0e1116",
            opacity: 0.5,
          }}
        >
          Édité le {today}
        </div>
      </div>
    </div>
  );
}
