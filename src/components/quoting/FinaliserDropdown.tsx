"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Copy, FileSignature, FileDown, Eye, ArrowDown, Palette, AlignLeft, Table } from "lucide-react";

interface ExportDropdownProps {
  clientName?: string;
  presentationUrl?: string;
  onGenerateDevoirConseil: () => void;
  onDownloadEtudePDF: () => void;
  onDownloadSynthesePDF: () => void;
  onExportTableauXLS?: () => void;
}

export function FinaliserDropdown({
  clientName = "Marble Tech SAS",
  presentationUrl = "#",
  onGenerateDevoirConseil,
  onDownloadEtudePDF,
  onDownloadSynthesePDF,
  onExportTableauXLS,
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
        <div className="absolute right-0 top-full mt-1.5 w-[320px] bg-white border border-panora-border rounded-[14px] shadow-[0px_18px_18px_0px_rgba(0,0,0,0.04),0px_4px_10px_0px_rgba(0,0,0,0.05)] z-50 overflow-hidden">
          {/* Presenter au client */}
          <div className="flex flex-col gap-3 p-3.5 bg-[#faf8f5] rounded-[8px]">
            <div className="flex flex-col gap-1">
              <p className="text-[14px] font-semibold text-panora-text">
                Presenter au client
              </p>
              <p className="text-[12px] text-[#85827b] leading-4">
                Un lien pour tout partager avec votre client
              </p>
            </div>

            {/* Link + copy button */}
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 flex items-center px-2 py-1.5 bg-panora-secondary rounded-[8px]">
                <span className="text-[13px] text-[#85827b] truncate">
                  {presentationUrl}
                </span>
              </div>
              <button
                onClick={copyLink}
                className={`shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 rounded-[8px] text-[13px] font-medium shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors border ${
                  linkCopied
                    ? "bg-panora-green border-panora-green text-white"
                    : "bg-white border-panora-border text-panora-text-muted hover:bg-panora-bg"
                }`}
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {linkCopied ? "Copie !" : "Copier lien"}
              </button>
            </div>

            {/* Preview card */}
            <div className="rounded-[8px] border border-[rgba(34,32,26,0.15)] overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <div className="bg-[#304370] h-[126px] flex">
                <div className="flex-1 flex flex-col justify-between px-3 py-[13px]">
                  <div className="bg-white rounded-[4px] p-1 w-fit">
                    <div className="flex items-center gap-[3px]">
                      <div className="w-[9px] h-[9px] rounded-full bg-panora-green" />
                      <span className="text-[6px] font-semibold text-panora-text tracking-tight">Panora</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] text-white font-serif tracking-[-0.26px]">
                      Etude des offres d&apos;assurance
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <div className="h-[7px] w-[101px] rounded-full bg-white/15" />
                      <div className="h-[7px] w-[146px] rounded-full bg-white/15" />
                    </div>
                  </div>
                </div>
                <div className="w-[56px] bg-white/[0.06]" />
              </div>

              {/* Action bar: Voir | Telecharger | Customiser */}
              <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                <a
                  href={presentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#85827b] hover:text-panora-text transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Voir
                </a>
                <div className="w-px h-3.5 bg-panora-border" />
                <button
                  onClick={() => handleAction(onDownloadEtudePDF)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#85827b] hover:text-panora-text transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  Telecharger
                </button>
                <div className="w-px h-3.5 bg-panora-border" />
                <a
                  href="/settings/presentation"
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#85827b] hover:text-panora-text transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                  Customiser
                </a>
              </div>
            </div>
          </div>

          <div className="h-px bg-panora-border" />

          {/* Autres actions */}
          <div className="flex flex-col gap-1 p-1.5">
            <div className="px-1.5 py-0.5">
              <span className="text-[12px] font-medium text-[#85827b]">Autres actions</span>
            </div>
            <button
              onClick={() => handleAction(onGenerateDevoirConseil)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-panora-bg transition-colors text-left"
            >
              <FileSignature className="w-4 h-4 text-panora-text-muted shrink-0" />
              <span className="text-[13px] text-panora-text">Generer le devoir de conseil</span>
            </button>
            <button
              onClick={() => handleAction(onDownloadSynthesePDF)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-panora-bg transition-colors text-left"
            >
              <AlignLeft className="w-4 h-4 text-panora-text-muted shrink-0" />
              <span className="text-[13px] text-panora-text">Telecharger la synthese (PDF)</span>
            </button>
            <button
              onClick={() => handleAction(onExportTableauXLS ?? (() => {}))}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-panora-bg transition-colors text-left"
            >
              <Table className="w-4 h-4 text-panora-text-muted shrink-0" />
              <span className="text-[13px] text-panora-text">Telecharger le tableau (XLS)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
