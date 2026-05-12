"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, X, Check } from "lucide-react";
import {
  BrandingSettings,
  DEFAULT_BRANDING,
  LogoSize,
  TITLE_FONT_OPTIONS,
  loadBranding,
  saveBranding,
} from "@/data/branding";
import { CoverPagePreview } from "@/components/settings/presentation/CoverPagePreview";
import { LienDynamiquePreview } from "@/components/settings/presentation/LienDynamiquePreview";

const COLOR_SWATCHES = [
  "#1F4D3F", // deep green (default)
  "#00a272", // panora green
  "#0E2944", // navy
  "#1a3a52", // slate blue
  "#5b3a87", // royal purple
  "#952617", // burgundy
  "#cb8052", // terracotta
  "#22201a", // near-black
];

export default function PresentationSettingsPage() {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBranding(loadBranding());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveBranding(branding);
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1400);
    return () => clearTimeout(t);
  }, [branding, hydrated]);

  // Font loading is handled by the preview components via ensureTitleFontLoaded.

  const onUploadLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Probe the image to capture aspect ratio (needed for DOCX, which requires
      // explicit pixel dimensions).
      const img = new Image();
      img.onload = () => {
        const ratio =
          img.naturalWidth && img.naturalHeight
            ? img.naturalWidth / img.naturalHeight
            : 3;
        setBranding((b) => ({
          ...b,
          logoDataUrl: dataUrl,
          logoAspectRatio: ratio,
        }));
      };
      img.onerror = () => {
        setBranding((b) => ({ ...b, logoDataUrl: dataUrl, logoAspectRatio: 3 }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-[1280px] mx-auto px-10 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider leading-4">
              Paramètres
            </span>
            <h1 className="text-[24px] font-serif leading-7 text-panora-text">
              Présentation des exports
            </h1>
            <p className="text-[13px] text-panora-text-secondary leading-5 max-w-[560px]">
              Personnalisez la page de couverture utilisée dans vos exports PDF et DOCX. Les changements sont enregistrés automatiquement.
            </p>
          </div>
          <div
            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md border text-[12px] transition-opacity ${
              savedFlash ? "opacity-100" : "opacity-0"
            } bg-[#eaf3ec] border-[#cce4d5] text-[#2d6a4f]`}
          >
            <Check className="w-3.5 h-3.5" />
            Enregistré
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {/* Controls */}
          <div className="flex flex-col gap-7 max-w-[560px]">
            {/* Primary color */}
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-[14px] font-semibold text-panora-text leading-5">
                  Couleur principale
                </h2>
                <p className="text-[12px] text-panora-text-secondary leading-4">
                  Fond du bandeau de couverture.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <label className="relative w-9 h-9 rounded-md overflow-hidden border border-panora-border shadow-[0px_1px_2px_rgba(0,0,0,0.05)] cursor-pointer">
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: branding.primaryColor }}
                  />
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) =>
                      setBranding((b) => ({ ...b, primaryColor: e.target.value }))
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) =>
                    setBranding((b) => ({ ...b, primaryColor: e.target.value }))
                  }
                  className="px-3 h-9 rounded-md border border-panora-border bg-white text-[13px] font-mono tracking-tight text-panora-text w-[120px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:border-panora-green"
                />
                <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setBranding((b) => ({ ...b, primaryColor: c }))
                      }
                      className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                        branding.primaryColor.toLowerCase() === c.toLowerCase()
                          ? "border-panora-text scale-110"
                          : "border-panora-border"
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Choisir ${c}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Logo */}
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-[14px] font-semibold text-panora-text leading-5">
                  Logo
                </h2>
                <p className="text-[12px] text-panora-text-secondary leading-4">
                  Affiché en bas de la page de couverture. PNG ou SVG, fond transparent recommandé.
                </p>
              </div>
              {branding.logoDataUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-md border border-panora-border bg-[#faf8f5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={branding.logoDataUrl}
                    alt="Logo"
                    className="h-10 w-auto max-w-[160px] object-contain"
                  />
                  <div className="ml-auto flex items-center gap-1.5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-panora-border bg-white text-[12px] font-medium text-panora-text-muted hover:text-panora-text hover:bg-panora-bg transition-colors"
                    >
                      Remplacer
                    </button>
                    <button
                      onClick={() =>
                        setBranding((b) => ({ ...b, logoDataUrl: null }))
                      }
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-panora-border bg-white text-panora-text-muted hover:text-[#952617] hover:bg-panora-bg transition-colors"
                      aria-label="Retirer le logo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-md border border-dashed border-panora-border bg-[#faf8f5] text-panora-text-muted hover:border-panora-green hover:text-panora-green transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[13px] font-medium">
                    Déposer un fichier
                  </span>
                  <span className="text-[11px] text-panora-text-secondary">
                    PNG · SVG · JPG
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadLogo(file);
                  e.currentTarget.value = "";
                }}
              />

              {branding.logoDataUrl && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-panora-text-secondary">
                    Taille d&apos;affichage
                  </span>
                  <div className="inline-flex rounded-md border border-panora-border bg-white p-0.5 self-start">
                    {(["small", "default", "big"] as LogoSize[]).map((size) => {
                      const isActive =
                        (branding.logoSize ?? "default") === size;
                      const label =
                        size === "small"
                          ? "Petit"
                          : size === "default"
                            ? "Standard"
                            : "Grand";
                      return (
                        <button
                          key={size}
                          onClick={() =>
                            setBranding((b) => ({ ...b, logoSize: size }))
                          }
                          className={`px-3 h-7 rounded-[5px] text-[12px] font-medium transition-colors ${
                            isActive
                              ? "bg-panora-secondary text-panora-text"
                              : "text-panora-text-muted hover:text-panora-text"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Title font */}
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-[14px] font-semibold text-panora-text leading-5">
                  Typographie des titres
                </h2>
                <p className="text-[12px] text-panora-text-secondary leading-4">
                  Police utilisée uniquement pour le titre de couverture. Le corps reste en Inter.
                </p>
              </div>
              <select
                value={branding.titleFont}
                onChange={(e) =>
                  setBranding((b) => ({ ...b, titleFont: e.target.value }))
                }
                className="h-9 px-3 pr-9 rounded-md border border-panora-border bg-white text-[13px] text-panora-text shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:border-panora-green appearance-none bg-no-repeat bg-[length:16px] bg-[position:right_10px_center]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2385827b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                }}
              >
                {TITLE_FONT_OPTIONS.map((font) => (
                  <option key={font.name} value={font.name}>
                    {font.label}
                  </option>
                ))}
              </select>
            </section>
          </div>

          {/* Previews — displayed below the fields */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-[14px] font-semibold text-panora-text leading-5">
                Aperçus
              </h2>
              <p className="text-[12px] text-panora-text-secondary leading-4">
                Vérifiez en temps réel comment votre charte s&apos;applique aux deux surfaces de partage.
              </p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-2">
              <div className="flex flex-col gap-3 min-w-0">
                <span className="text-[11px] font-medium uppercase tracking-wider text-panora-text-secondary">
                  Lien dynamique · Présentation en ligne
                </span>
                <LienDynamiquePreview branding={branding} scale={0.32} />
              </div>
              <div className="flex flex-col gap-3 min-w-0">
                <span className="text-[11px] font-medium uppercase tracking-wider text-panora-text-secondary">
                  Page de couverture · Export PDF / DOCX
                </span>
                <CoverPagePreview branding={branding} scale={0.42} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
