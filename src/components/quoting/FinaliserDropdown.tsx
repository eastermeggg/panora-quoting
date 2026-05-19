"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown,
  Check,
  Copy,
  FileDown,
  FileSignature,
  Eye,
  Link as LinkIcon,
} from "lucide-react";
import {
  BrandingSettings,
  DEFAULT_BRANDING,
  loadBranding,
} from "@/data/branding";
import { CoverPagePreview } from "@/components/settings/presentation/CoverPagePreview";

// Format-icon glyphs — colored tiles with the file-type initial, evocative of
// the Microsoft/Adobe brand marks without copying them verbatim.
function PdfIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#E11D2A" />
      <text
        x="8"
        y="11"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="5.5"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        PDF
      </text>
    </svg>
  );
}

function WordIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#2B579A" />
      <text
        x="8"
        y="11.5"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="9"
        fontWeight="700"
      >
        W
      </text>
    </svg>
  );
}

function ExcelIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#217346" />
      <text
        x="8"
        y="11.5"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="9"
        fontWeight="700"
      >
        X
      </text>
    </svg>
  );
}

interface ExportDropdownProps {
  clientName?: string;
  productLabel: string;
  presentationUrl?: string;
  onPreviewSynthesePDF: () => void;
  onDownloadSynthesePDF: () => void;
  onDownloadSyntheseDocx: () => void;
  onDownloadTableauXLS: () => void;
  onGenerateDevoirConseil?: () => void;
}

export function FinaliserDropdown({
  clientName,
  productLabel,
  presentationUrl = "#",
  onPreviewSynthesePDF,
  onDownloadSynthesePDF,
  onDownloadSyntheseDocx,
  onDownloadTableauXLS,
  onGenerateDevoirConseil,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBranding(loadBranding());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "panora.branding.v1") setBranding(loadBranding());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (isOpen) setBranding(loadBranding());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAction = (fn: () => void) => {
    setIsOpen(false);
    fn();
  };

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(presentationUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [presentationUrl]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="btn-primary h-8 flex items-center gap-2 px-4 text-[13px] font-medium"
      >
        <FileDown className="w-4 h-4" />
        Exporter
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-[360px] bg-white border border-panora-border rounded-[12px] shadow-[0px_30px_60px_-15px_rgba(0,0,0,0.18),0px_12px_24px_-8px_rgba(0,0,0,0.10),0px_4px_8px_-2px_rgba(0,0,0,0.06)] z-50 overflow-hidden">
          {/* Hero card — synthèse export */}
          <div className="flex gap-3 p-3.5 bg-[#faf8f5]">
            <div className="shrink-0">
              <CoverPagePreview
                branding={branding}
                clientName={clientName || "Client"}
                productLabel={productLabel}
                scale={0.12}
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-panora-text leading-5">
                Exporter la synthèse client
              </p>
              <p className="text-[11.5px] text-panora-text-muted leading-4 mt-0.5">
                Un livrable prêt à partager avec votre client.
              </p>
              <div className="flex items-center gap-1.5 mt-auto pt-3">
                <button
                  onClick={() => handleAction(onPreviewSynthesePDF)}
                  className="inline-flex items-center justify-center w-[28px] h-[28px] rounded-[6px] border border-panora-border bg-white text-panora-text-muted hover:bg-panora-bg hover:text-panora-text transition-colors"
                  aria-label="Aperçu PDF de la synthèse"
                  title="Aperçu PDF"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAction(onDownloadSynthesePDF)}
                  className="inline-flex items-center gap-1.5 h-[28px] pl-2 pr-3 rounded-[6px] text-[11px] font-semibold uppercase tracking-wider border border-panora-border bg-white text-panora-text-muted hover:bg-[#fdecec] hover:border-[#fdecec] hover:text-[#952617] transition-colors"
                >
                  <PdfIcon className="w-[14px] h-[14px]" />
                  PDF
                </button>
                <button
                  onClick={() => handleAction(onDownloadSyntheseDocx)}
                  className="inline-flex items-center gap-1.5 h-[28px] pl-2 pr-3 rounded-[6px] text-[11px] font-semibold uppercase tracking-wider border border-panora-border bg-white text-panora-text-muted hover:bg-[#e9f0f9] hover:border-[#e9f0f9] hover:text-[#1a3a52] transition-colors"
                >
                  <WordIcon className="w-[14px] h-[14px]" />
                  DOCX
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-panora-border" />

          {/* Secondary list */}
          <div className="flex flex-col gap-0.5 p-2">
            <div className="px-2 pt-1 pb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-panora-text-muted leading-4">
                Autres actions
              </span>
            </div>

            <button
              onClick={() => handleAction(onDownloadTableauXLS)}
              className="flex items-center gap-3 px-2 py-2 rounded-[8px] hover:bg-panora-bg transition-colors text-left"
            >
              <ExcelIcon className="w-[18px] h-[18px] shrink-0" />
              <span className="text-[13px] font-medium text-panora-text flex-1">
                Télécharger le tableau
              </span>
            </button>

            {onGenerateDevoirConseil && (
              <button
                onClick={() => handleAction(onGenerateDevoirConseil)}
                className="flex items-center gap-3 px-2 py-2 rounded-[8px] hover:bg-panora-bg transition-colors text-left"
              >
                <FileSignature className="w-[18px] h-[18px] text-panora-text-secondary shrink-0" />
                <span className="text-[13px] font-medium text-panora-text flex-1">
                  Générer le devoir de conseil
                </span>
              </button>
            )}

            <div className="flex items-center gap-3 px-2 py-2 rounded-[8px] hover:bg-panora-bg transition-colors">
              <LinkIcon className="w-[18px] h-[18px] text-panora-text-secondary shrink-0" />
              <span className="text-[13px] font-medium text-panora-text flex-1">
                Lien dynamique
              </span>
              <a
                href={presentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-[6px] border border-panora-border bg-white text-panora-text-muted hover:bg-panora-bg hover:text-panora-text transition-colors"
                aria-label="Voir l'aperçu"
              >
                <Eye className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={copyLink}
                className={`inline-flex items-center gap-1 h-[26px] px-2.5 rounded-[6px] text-[11.5px] font-medium border transition-colors ${
                  linkCopied
                    ? "bg-panora-green border-panora-green text-white"
                    : "border-panora-border bg-white text-panora-text-muted hover:bg-panora-bg hover:text-panora-text"
                }`}
                aria-label="Copier le lien"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
