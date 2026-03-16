"use client";

import { useState, useRef, useCallback } from "react";
import { X as XIcon, ExternalLink, Check, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { PanelCardA, PanelCardB } from "@/components/quoting/PanelCards";
import type { CellDetail, SubLimitRow, PricingCardRow, SourceRef } from "@/data/mock";

interface DetailPanelProps {
  cellDetail: CellDetail;
  onUpdate: (updated: CellDetail) => void;
  onClose: () => void;
  onDelete?: () => void;
  showKeyDetail?: boolean;
  onToggleDisplayMode?: () => void;
}

function OverrideDot() {
  return (
    <span
      className="w-[6px] h-[6px] rounded-full bg-panora-green shrink-0"
      title="Modifi&eacute;"
    />
  );
}

export function DetailPanel({ cellDetail, onUpdate, onClose, onDelete, showKeyDetail, onToggleDisplayMode }: DetailPanelProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(cellDetail.title);
  const [editingDesc, setEditingDesc] = useState(false);
  const [localDesc, setLocalDesc] = useState(cellDetail.description);

  // Track originals to detect overrides
  const [originals, setOriginals] = useState({
    key: `${cellDetail.insurerId}-${cellDetail.title}`,
    title: cellDetail.title,
    description: cellDetail.description,
    subLimits: cellDetail.subLimits ? [...cellDetail.subLimits] : undefined,
    pricingRows: cellDetail.pricingRows ? [...cellDetail.pricingRows] : undefined,
  });

  // Sync local state when a different cell is selected
  const currentKey = `${cellDetail.insurerId}-${cellDetail.title}`;
  if (currentKey !== originals.key) {
    setOriginals({
      key: currentKey,
      title: cellDetail.title,
      description: cellDetail.description,
      subLimits: cellDetail.subLimits ? [...cellDetail.subLimits] : undefined,
      pricingRows: cellDetail.pricingRows ? [...cellDetail.pricingRows] : undefined,
    });
    setLocalTitle(cellDetail.title);
    setLocalDesc(cellDetail.description);
    setEditingTitle(false);
    setEditingDesc(false);
  }

  const titleOverridden = cellDetail.title !== originals.title;
  const descOverridden = cellDetail.description !== originals.description;

  const [saveFlash, setSaveFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const update = useCallback((patch: Partial<CellDetail>) => {
    onUpdate({ ...cellDetail, ...patch });
    setSaveFlash(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSaveFlash(false), 1500);
  }, [cellDetail, onUpdate]);

  const isExclusion = cellDetail.cellType === "exclusion";
  const isManualExclusion = isExclusion && cellDetail.origin === "manual";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-[420px] shrink-0 border-l border-panora-border bg-white flex flex-col"
    >
      {/* Header */}
      <div className="h-[52px] shrink-0 border-b border-[#e3e3e3] flex items-center justify-between px-4">
        <span className="text-[13px] text-panora-text-muted">
          {isExclusion ? "D\u00e9tail de l\u2019exclusion" : "D\u00e9tail de la garantie"}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1 text-[12px] text-panora-green transition-opacity duration-300",
              saveFlash ? "opacity-100" : "opacity-0"
            )}
          >
            <Check className="w-3 h-3" />
            Enregistr\u00e9
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-[6px] bg-panora-secondary hover:bg-panora-drop transition-colors"
          >
            <XIcon className="w-3.5 h-3.5 text-panora-text" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
      {/* Title + insurer badge + description */}
      <div className="border-b border-[#e3e3e3] p-4 flex flex-col gap-3">
        {/* Editable title */}
        <div className="flex items-center gap-2">
          {titleOverridden && <OverrideDot />}
          {editingTitle ? (
            <input
              autoFocus
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={() => {
                update({ title: localTitle });
                setEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  update({ title: localTitle });
                  setEditingTitle(false);
                }
                if (e.key === "Escape") {
                  setLocalTitle(cellDetail.title);
                  setEditingTitle(false);
                }
              }}
              className="flex-1 text-[20px] font-serif tracking-[-0.2px] leading-6 text-black bg-white border border-panora-border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-panora-green/20"
            />
          ) : (
            <div
              onClick={() => {
                setLocalTitle(cellDetail.title);
                setEditingTitle(true);
              }}
              className="group/title flex items-center gap-2 cursor-text"
            >
              <h2 className="text-[20px] font-serif tracking-[-0.2px] leading-6 text-black">
                {cellDetail.title || <span className="text-panora-text-muted">Ajouter un titre…</span>}
              </h2>
              <Pencil className="w-3.5 h-3.5 text-panora-text-muted opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
            </div>
          )}
        </div>

        {/* Insurer badge */}
        <div className="flex items-center gap-[7px]">
          <div className="flex items-center gap-1.5">
            <InsurerLogo insurerId={cellDetail.insurerId} name={cellDetail.insurerName} size="sm" className="w-4 h-4 rounded-[4px]" />
            <span className="text-[13px] text-panora-text">{cellDetail.insurerName}</span>
          </div>
        </div>

        {/* Covered / Non couvert toggle — guarantee */}
        {cellDetail.cellType === "guarantee" && (
          <div className="inline-flex self-start gap-2">
            <button
              onClick={() => update({ covered: true })}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium rounded-[8px] border transition-colors",
                cellDetail.covered
                  ? "bg-[#dbeee5] border-[#b5e0cc]"
                  : "bg-white border-panora-border text-panora-text-muted hover:bg-panora-bg/50 hover:border-[#d4d2cc]"
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center w-5 h-5 rounded-full",
                cellDetail.covered ? "bg-panora-green/20" : "bg-panora-border"
              )}>
                <Check className={cn("w-3 h-3", cellDetail.covered ? "text-panora-green" : "text-panora-text-muted")} />
              </span>
              <span className={cellDetail.covered ? "text-panora-green" : ""}>Couvert</span>
            </button>
            <button
              onClick={() => update({ covered: false })}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium rounded-[8px] border transition-colors",
                !cellDetail.covered
                  ? "bg-[#fde8e8] border-[#f0c4c4]"
                  : "bg-white border-panora-border text-panora-text-muted hover:bg-panora-bg/50 hover:border-[#d4d2cc]"
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center w-5 h-5 rounded-full",
                !cellDetail.covered ? "bg-[#952617]/20" : "bg-panora-border"
              )}>
                <XIcon className={cn("w-3 h-3", !cellDetail.covered ? "text-[#952617]" : "text-panora-text-muted")} />
              </span>
              <span className={!cellDetail.covered ? "text-[#952617]" : ""}>Non couvert</span>
            </button>
          </div>
        )}

        {/* Inclus / Exclu toggle — exclusion */}
        {isExclusion && (
          <div className="inline-flex self-start gap-2">
            <button
              onClick={() => update({ covered: true })}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium rounded-[8px] border transition-colors",
                cellDetail.covered
                  ? "bg-[#dbeee5] border-[#b5e0cc]"
                  : "bg-white border-panora-border text-panora-text-muted hover:bg-panora-bg/50 hover:border-[#d4d2cc]"
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center w-5 h-5 rounded-full",
                cellDetail.covered ? "bg-panora-green/20" : "bg-panora-border"
              )}>
                <Check className={cn("w-3 h-3", cellDetail.covered ? "text-panora-green" : "text-panora-text-muted")} />
              </span>
              <span className={cellDetail.covered ? "text-panora-text" : ""}>Incluse</span>
            </button>
            <button
              onClick={() => update({ covered: false })}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium rounded-[8px] border transition-colors",
                !cellDetail.covered
                  ? "bg-[#fde8e8] border-[#f0c4c4]"
                  : "bg-white border-panora-border text-panora-text-muted hover:bg-panora-bg/50 hover:border-[#d4d2cc]"
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center w-5 h-5 rounded-full",
                !cellDetail.covered ? "bg-[#952617]/20" : "bg-panora-border"
              )}>
                <span className={cn("text-[11px] font-bold leading-none", !cellDetail.covered ? "text-[#952617]" : "text-panora-text-muted")}>!</span>
              </span>
              <span className={!cellDetail.covered ? "text-[#952617]" : ""}>Exclue</span>
            </button>
          </div>
        )}

        {/* Editable description */}
        <div className="flex items-start gap-2">
          {descOverridden && <OverrideDot />}
          {editingDesc ? (
            <textarea
              autoFocus
              value={localDesc}
              onChange={(e) => setLocalDesc(e.target.value)}
              onBlur={() => {
                update({ description: localDesc });
                setEditingDesc(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setLocalDesc(cellDetail.description);
                  setEditingDesc(false);
                }
              }}
              rows={3}
              className="flex-1 text-[13px] leading-5 text-panora-text bg-white border border-panora-border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-panora-green/20 resize-none"
            />
          ) : (
            <div
              onClick={() => {
                setLocalDesc(cellDetail.description);
                setEditingDesc(true);
              }}
              className="group/desc flex items-start gap-2 cursor-text"
            >
              <p className="text-[13px] leading-5 text-panora-text">
                {cellDetail.description || <span className="text-panora-text-muted">Ajouter une description…</span>}
              </p>
              <Pencil className="w-3.5 h-3.5 text-panora-text-muted opacity-0 group-hover/desc:opacity-100 transition-opacity shrink-0 mt-0.5" />
            </div>
          )}
        </div>
      </div>

      {/* Cards section — guarantee: "Sous limites" */}
      {cellDetail.cellType === "guarantee" && (
        <div className="border-b border-[#e3e3e3] p-4 pb-5 flex flex-col gap-3">
          <h3 className="text-[15px] font-semibold text-panora-text">Sous limites</h3>
          <PanelCardA
            rows={cellDetail.subLimits ?? []}
            originalRows={originals.subLimits}
            onChange={(rows: SubLimitRow[]) => update({ subLimits: rows })}
          />
        </div>
      )}

      {cellDetail.cellType === "price" && (
        <div className="border-b border-[#e3e3e3] p-4 pb-5 flex flex-col gap-3">
          <h3 className="text-[15px] font-semibold text-panora-text">Tarification</h3>
          <PanelCardB
            rows={cellDetail.pricingRows ?? []}
            originalRows={originals.pricingRows}
            onChange={(rows: PricingCardRow[]) => update({ pricingRows: rows })}
          />
        </div>
      )}

      {/* Sources (read-only) — hidden for manual exclusions */}
      {cellDetail.sources && cellDetail.sources.length > 0 && !isManualExclusion && (
        <div className="p-4 flex flex-col gap-3">
          <h3 className="text-[15px] font-semibold text-panora-text">Sources</h3>
          {cellDetail.sources.map((source: SourceRef, idx: number) => (
            <SourceCard key={idx} source={source} />
          ))}
        </div>
      )}

      {/* Delete button — manual exclusions only */}
      {isManualExclusion && onDelete && (
        <div className="p-4 border-t border-[#e3e3e3] mt-auto">
          <button
            onClick={() => {
              if (window.confirm("Supprimer cette exclusion manuelle ?")) {
                onDelete();
              }
            }}
            className="flex items-center gap-2 text-[13px] font-medium text-[#952617] hover:text-[#952617]/80 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer l&apos;exclusion
          </button>
        </div>
      )}
      </div>{/* end scrollable content */}

      {/* Display mode footer — guarantee & price only */}
      {(cellDetail.cellType === "guarantee" || cellDetail.cellType === "price") && onToggleDisplayMode && (
        <div className="shrink-0 border-t border-[#e3e3e3] bg-[#faf8f5] px-4 py-3 flex items-center justify-between">
          <span className="text-[12px] text-panora-text-muted">Affichage dans la grille</span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-panora-text-muted">Afficher détail clé en plus</span>
            <button
              onClick={onToggleDisplayMode}
              className={`relative w-[28px] h-[16px] rounded-full transition-colors ${showKeyDetail ? "bg-panora-green" : "bg-[#d1d1d1]"}`}
            >
              <span className={`absolute top-[2px] w-[12px] h-[12px] rounded-full bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.15)] transition-transform ${showKeyDetail ? "left-[14px]" : "left-[2px]"}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SourceCard({ source }: { source: SourceRef }) {
  return (
    <div className="bg-panora-bg rounded-[10px] px-3 py-2.5 flex flex-col gap-[7px]">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-panora-text leading-5 truncate">
          {source.title}
        </span>
        <span className="text-[12px] text-panora-text leading-[18px]">
          {source.description}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="inline-flex h-5 items-center px-2.5 rounded-full bg-white border border-panora-border text-[12px] font-medium text-panora-text">
          {source.badge}
        </span>
        {source.page && (
          <div className="flex items-center gap-2 text-[12px] text-panora-text-muted">
            <span>{source.page}</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
