"use client";

import { Lock, ArrowRight, User, Calendar } from "lucide-react";
import {
  BrandingSettings,
  getLogoSize,
  getOnColorPalette,
} from "@/data/branding";
import { InsurerLogo } from "@/components/ui/InsurerLogo";

interface PresentationCoverProps {
  branding: BrandingSettings;
  clientName: string;
  productLabels: string[];
  insurers: Array<{ id: string; name: string }>;
  brokerName: string;
  cabinetName?: string;
  orias?: string;
  address?: string;
  onContinue: () => void;
}

export function PresentationCover({
  branding,
  clientName,
  productLabels,
  insurers,
  brokerName,
  cabinetName,
  orias = "XXX XXX XXX XXX",
  address = "12 rue Martel, 75010 Paris",
  onContinue,
}: PresentationCoverProps) {
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const titleFontFamily = `"${branding.titleFont}", "Inter Display", serif`;
  const initial = clientName.charAt(0).toUpperCase();
  const palette = getOnColorPalette(branding.primaryColor);
  const logoBox = getLogoSize(branding.logoSize);

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: branding.primaryColor }}
    >
      {/* Subtle paper-grain / vignette overlay for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,0,0,0.18) 0%, transparent 60%), radial-gradient(ellipse 100% 60% at 0% 0%, rgba(255,255,255,0.04) 0%, transparent 50%)",
        }}
      />
      {/* Hero — vertically centered, three movements with generous rhythm */}
      <div className="flex-1 flex items-center min-h-0 relative">
        <div
          className="w-full px-8 sm:px-14 lg:px-24 py-20 relative z-10"
          style={{ color: palette.foreground }}
        >
          {/* L1 — Confidentiality eyebrow + Title (focal hero) */}
          <div className="flex flex-col gap-9 max-w-[820px]">
            <div className="flex items-center gap-2.5">
              <Lock
                className="w-3.5 h-3.5"
                strokeWidth={1.75}
                style={{ color: palette.foregroundMuted }}
              />
              <span
                className="text-[10px] font-medium tracking-[0.22em] uppercase"
                style={{ color: palette.foregroundMuted }}
              >
                Présentation confidentielle
              </span>
            </div>
            <h1
              style={{
                fontFamily: titleFontFamily,
                fontWeight: 400,
                fontSize: "clamp(46px, 7vw, 88px)",
                letterSpacing: "-0.028em",
                lineHeight: 0.96,
                margin: 0,
                color: palette.foreground,
              }}
            >
              Étude des offres
              <br />
              d&rsquo;assurance.
            </h1>
          </div>

          {/* L2 — Products (subject) + client (recipient) — each with its own eyebrow */}
          <div className="flex flex-col gap-7 mt-14 max-w-[820px]">
            {productLabels.length > 0 && (
              <div className="flex flex-col gap-3">
                <span
                  className="text-[10px] font-medium tracking-[0.22em] uppercase"
                  style={{ color: palette.foregroundMuted }}
                >
                  Produits étudiés
                </span>
                <div className="flex gap-2 flex-wrap">
                  {productLabels.map((label) => (
                    <div
                      key={label}
                      className="rounded-[10px] px-3.5 py-1.5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[2px] text-[13px] font-medium border"
                      style={{
                        backgroundColor: palette.chipBg,
                        borderColor: palette.chipBorder,
                        color: palette.foregroundStrong,
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <span
                className="text-[10px] font-medium tracking-[0.22em] uppercase"
                style={{ color: palette.foregroundMuted }}
              >
                Préparé pour
              </span>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-[8px] border flex items-center justify-center text-[14px] font-semibold backdrop-blur-[2px]"
                  style={{
                    backgroundColor: palette.chipBg,
                    borderColor: palette.chipBorder,
                    color: palette.foreground,
                    boxShadow: `0px 1px 2px rgba(0,0,0,0.08), inset 0px 0px 0px 1px ${palette.chipShadowInset}`,
                  }}
                >
                  {initial}
                </div>
                <span
                  className="text-[18px] font-medium tracking-[-0.005em]"
                  style={{ color: palette.foreground }}
                >
                  {clientName}
                </span>
              </div>
            </div>
          </div>

          {/* L3 — Assureurs consultés + CTA (vertically aligned bottom edges) */}
          <div className="flex items-end justify-between gap-6 mt-12 flex-wrap">
            <div className="flex flex-col gap-3.5 flex-1 min-w-0">
              <span
                className="text-[10px] font-medium tracking-[0.22em] uppercase"
                style={{ color: palette.foregroundMuted }}
              >
                Assureurs consultés
              </span>
              <div className="flex gap-2 flex-wrap">
                {insurers.map((ins) => (
                  <div
                    key={ins.id}
                    className="h-10 rounded-[10px] px-3.5 flex items-center gap-2.5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[2px] border"
                    style={{
                      backgroundColor: palette.chipBg,
                      borderColor: palette.chipBorder,
                    }}
                  >
                    <InsurerLogo
                      insurerId={ins.id}
                      name={ins.name}
                      size="sm"
                    />
                    <span
                      className="text-[13px] font-medium whitespace-nowrap"
                      style={{ color: palette.foregroundStrong }}
                    >
                      {ins.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onContinue}
              className="shrink-0 group bg-white rounded-[12px] pl-5 pr-4 py-3.5 flex items-center gap-3 shadow-[0px_2px_4px_rgba(0,0,0,0.08),0px_8px_24px_-8px_rgba(0,0,0,0.15)] text-[13px] font-semibold text-[#0e1116] hover:shadow-[0px_4px_8px_rgba(0,0,0,0.1),0px_12px_32px_-8px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] transition-all duration-200"
            >
              Accéder
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0e1116] text-white transition-transform duration-200 group-hover:translate-x-[2px]">
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[rgba(14,17,22,0.08)] px-10 lg:px-20 py-7 flex items-center justify-between gap-8 flex-wrap relative z-10">
        <div className="flex items-center gap-6 flex-wrap">
          {branding.logoDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={branding.logoDataUrl}
              alt={cabinetName ?? "Cabinet"}
              className="w-auto object-contain"
              style={{ maxHeight: logoBox.maxHeight, maxWidth: logoBox.maxWidth }}
            />
          ) : (
            <span className="text-[14px] font-bold text-[#0e1116]/40 tracking-tight">
              {cabinetName ?? "VOTRE LOGO"}
            </span>
          )}
          <div className="w-px h-6 bg-[#0e1116]/10" />
          <FooterPair label="ORIAS" value={orias} />
          <div className="w-px h-6 bg-[#0e1116]/10" />
          <FooterPair label="Adresse" value={address} />
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <FooterPair
            icon={<User className="w-[14px] h-[14px] opacity-45" strokeWidth={1.75} />}
            label="Préparé par"
            value={brokerName}
          />
          <div className="w-px h-6 bg-[#0e1116]/10" />
          <FooterPair
            icon={<Calendar className="w-[14px] h-[14px] opacity-45" strokeWidth={1.75} />}
            label="Le"
            value={today}
          />
        </div>
      </footer>
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
    <div className="flex flex-col gap-0.5 whitespace-nowrap">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9.5px] font-semibold tracking-[0.18em] uppercase text-[#22201a]/55">
          {label}
        </span>
      </div>
      <span className="text-[13px] text-[#0e1116] font-normal">{value}</span>
    </div>
  );
}
