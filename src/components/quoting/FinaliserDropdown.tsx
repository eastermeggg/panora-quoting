"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ExternalLink, Download, Settings, Check, Copy, FileSignature, FileDown } from "lucide-react";

interface ExportDropdownProps {
  clientName?: string;
  presentationUrl?: string;
  onGenerateDevoirConseil: () => void;
  onDownloadEtudePDF: () => void;
  onDownloadSynthesePDF: () => void;
}

export function FinaliserDropdown({
  clientName = "Marble Tech SAS",
  presentationUrl = "#",
  onGenerateDevoirConseil,
  onDownloadEtudePDF,
  onDownloadSynthesePDF,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
      >
        <FileDown className="w-4 h-4" />
        Exporter
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-[340px] bg-white border border-panora-border rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
          {/* Primary — Presentation client */}
          <div className="px-4 pt-4 pb-3 border-b border-panora-border">
            <div className="mb-3">
              <p className="text-[14px] font-semibold text-panora-text">
                Presentation client
              </p>
              <p className="text-[12px] text-panora-text-muted mt-0.5 leading-4">
                Comparatif et synthese, prets a partager.
              </p>
            </div>

            {/* URL input + copy */}
            <div className="flex items-center gap-0 border border-[#e2dfd8] rounded-[8px] overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.05)] mb-3">
              <input
                type="text"
                readOnly
                value={presentationUrl}
                className="flex-1 min-w-0 px-3 py-2 text-[12px] text-panora-text-muted bg-[#faf9f7] outline-none truncate"
              />
              <button
                onClick={copyLink}
                className={`shrink-0 px-3 py-2 border-l border-[#e2dfd8] text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
                  linkCopied
                    ? "bg-[#f0faf5] text-panora-green"
                    : "bg-white text-panora-text hover:bg-panora-bg"
                }`}
              >
                {linkCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {linkCopied ? "Copie" : "Copier"}
              </button>
            </div>

            {/* Preview card — clickable to open */}
            <a
              href={presentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[8px] border border-[#e2dfd8] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] mb-3 hover:border-panora-green/40 transition-colors group"
            >
              <div className="bg-[#173c2d] px-4 pt-4 pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-white/20" />
                  <div className="h-1.5 w-12 rounded-full bg-white/30" />
                </div>
                <div className="h-2 w-28 rounded-full bg-white/50 mb-1.5" />
                <div className="h-1.5 w-20 rounded-full bg-white/25" />
              </div>
              <div className="bg-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-[#e2dfd8]" />
                  <div className="h-1.5 w-10 rounded-full bg-[#e2dfd8]" />
                </div>
                <span className="text-[11px] text-panora-text-muted group-hover:text-panora-green transition-colors flex items-center gap-1">
                  Ouvrir
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>

            {/* Download + Customize row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleAction(onDownloadSynthesePDF)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-panora-text hover:text-panora-green transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Telecharger en PDF
              </button>
              <a
                href="/settings/presentation"
                className="flex items-center gap-1 text-[11px] text-panora-text-muted hover:text-panora-text transition-colors"
              >
                <Settings className="w-3 h-3" />
                Personnaliser
              </a>
            </div>
          </div>

          {/* Section label */}
          <div className="px-4 py-1.5 text-[11px] text-panora-text-muted uppercase tracking-wide bg-panora-bg border-b border-panora-border">
            Autres actions
          </div>

          {/* Secondary actions */}
          <button
            onClick={() => handleAction(onGenerateDevoirConseil)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-panora-bg transition-colors text-left border-b border-panora-border"
          >
            <FileSignature className="w-4 h-4 text-panora-text-muted shrink-0" />
            <div>
              <span className="text-[13px] text-panora-text block">Devoir de conseil</span>
              <span className="text-[11px] text-panora-text-muted">Assistant 3 etapes pour le document reglementaire</span>
            </div>
          </button>
          <button
            onClick={() => handleAction(onDownloadEtudePDF)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-panora-bg transition-colors text-left"
          >
            <FileDown className="w-4 h-4 text-panora-text-muted shrink-0" />
            <div>
              <span className="text-[13px] text-panora-text block">Telecharger l'etude complete</span>
              <span className="text-[11px] text-panora-text-muted">Tableau comparatif et analyse IA en PDF</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
