"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { Check, X as XIcon, Plus, Sparkles, Loader2, Send, Trash2, Search, ChevronDown, ChevronRight, GripVertical, CheckCircle2, AlertCircle, Diamond } from "lucide-react";
import type { AnalysisData, InsurerData, SectionId, SectionMeta, ComparisonData, CellDetail, ContextPill } from "@/data/mock";
import { DEFAULT_SECTION_PROMPTS, mockRegenerateSection } from "@/data/mock";
import { DetailPanel } from "@/components/quoting/DetailPanel";
import { BesoinTag } from "@/components/ui/BesoinTag";

type GarantieCellId = { rowIndex: number; insurerId: string };

/** A generic section entry — either a built-in section or a custom text section */
type SectionEntry = { type: "builtin"; id: SectionId } | { type: "custom"; id: string; title: string; content: string };

interface AnalysisTabProps {
  analysisData: AnalysisData | undefined;
  insurers: InsurerData[];
  offerCount: number;
  comparisonData?: ComparisonData;
  onSwitchToComparison: () => void;
  onOpenProfile: () => void;
  onUpdateAnalysis?: (updated: AnalysisData) => void;
  isStreaming?: boolean;
  onStreamingDone?: () => void;
  /** When false, shows empty state prompting user to complete the client profile */
  hasClientProfile?: boolean;
  /** When true, hides TOC and adjusts layout for side panel */
  isPanelOpen?: boolean;
}

/** Splits "810,52 €/an" into { amount, period } */
function splitPrice(raw: string): { amount: string; period: string } {
  const m = raw.match(/^(.+?)\s*\/\s*(.+)$/);
  if (m) return { amount: m[1].trim(), period: `/ ${m[2].trim()}` };
  return { amount: raw, period: "" };
}

// ─── contentEditable prose block ────────────────────────────────────

function EditableBlock({
  value,
  onCommit,
  className,
  placeholder,
}: {
  value: string;
  onCommit: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(!value.trim());

  const commit = () => {
    if (!ref.current) return;
    const text = ref.current.innerText?.trim() ?? "";
    setShowPlaceholder(!text);
    if (text !== value) onCommit(text);
  };

  return (
    <div className="relative">
      {showPlaceholder && placeholder && (
        <span className="absolute left-1 top-0 text-panora-text-muted/50 pointer-events-none select-none" style={{ fontSize: "inherit", lineHeight: "inherit" }}>
          {placeholder}
        </span>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={`outline-none whitespace-pre-wrap ${className ?? ""}`}
        onFocus={() => setShowPlaceholder(false)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") e.currentTarget.blur();
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── contentEditable bullet list (one line = one bullet) ────────────

function EditableBullets({
  items,
  onCommit,
  className,
}: {
  items: string[];
  onCommit: (items: string[]) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const commit = () => {
    if (!ref.current) return;
    const text = ref.current.innerText ?? "";
    const lines = text.split("\n").map((l) => l.replace(/^[\s•\-–+]\s*/, "").trim()).filter(Boolean);
    if (lines.join("|") !== items.join("|")) onCommit(lines);
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`outline-none whitespace-pre-wrap rounded-[4px] focus:ring-1 focus:ring-panora-green/30 px-1 -mx-1 ${className ?? ""}`}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") e.currentTarget.blur();
      }}
    >
      {items.map((item) => `• ${item}`).join("\n")}
    </div>
  );
}

// ─── Streaming text ─────────────────────────────────────────────────

function StreamingBlock({
  text,
  active,
  delay = 0,
  speed = 8,
  className,
  onComplete,
}: {
  text: string;
  active: boolean;
  delay?: number;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [charCount, setCharCount] = useState(text.length);
  const [started, setStarted] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setCharCount(text.length);
      setStarted(false);
      return;
    }
    setCharCount(0);
    setStarted(false);
    const delayTimer = setTimeout(() => {
      setStarted(true);
      let i = 0;
      const interval = setInterval(() => {
        i += 3;
        if (i >= text.length) {
          i = text.length;
          clearInterval(interval);
          onCompleteRef.current?.();
        }
        setCharCount(i);
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(delayTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (active && !started) return <div className={className} />;

  const displayed = active ? text.slice(0, charCount) : text;
  const showCursor = active && charCount < text.length;

  return (
    <div className={`whitespace-pre-wrap ${className ?? ""}`}>
      {displayed}
      {showCursor && <span className="inline-block w-[5px] h-[13px] bg-panora-green/50 ml-[1px] animate-pulse rounded-sm align-middle" />}
    </div>
  );
}

// ─── Horizontal rule ────────────────────────────────────────────────

function Hr() {
  return <hr className="border-panora-border mt-0 mb-8" />;
}

// ─── Section Header ─────────────────────────────────────────────────

function SectionHeader({
  title,
  meta,
  isTargeted,
  onToggleTarget,
  onTitleChange,
  onDelete,
  dragHandleProps,
}: {
  title: string;
  meta?: SectionMeta;
  isTargeted?: boolean;
  onToggleTarget?: () => void;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
  dragHandleProps?: { onMouseDown: (e: React.MouseEvent) => void };
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  const commitTitle = () => {
    if (!titleRef.current) return;
    const text = titleRef.current.innerText?.trim() ?? "";
    if (text && text !== title) onTitleChange(text);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          {...(dragHandleProps ?? {})}
          className={`flex items-center justify-center w-4 h-4 shrink-0 ${dragHandleProps ? "cursor-grab active:cursor-grabbing" : ""}`}
        >
          <GripVertical className="w-4 h-4 text-panora-text-muted/40 group-hover:text-panora-text-muted transition-colors" />
        </div>
        <h2
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          className="text-[18px] font-serif font-semibold text-panora-text outline-none"
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
            if (e.key === "Escape") e.currentTarget.blur();
          }}
        >
          {title}
        </h2>
        {meta?.isEdited && (
          <span className="text-[11px] bg-panora-secondary text-panora-text-muted px-2 py-0.5 rounded-full shrink-0">
            Modifie
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onDelete}
          className="flex items-center justify-center w-7 h-7 rounded-[6px] text-panora-text-muted hover:text-[#952617] hover:bg-[#fde8e8] transition-colors"
          title="Supprimer cette section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Regenerating Overlay ───────────────────────────────────────────

function RegeneratingOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#8b5cf6] animate-spin" />
      </div>
    </div>
  );
}

// ─── Build CellDetail from garantie cell ────────────────────────────

function buildGarantieCellDetail(
  garantie: { label: string; values: Record<string, { status: "covered" | "not_covered"; keyInfo?: string }> },
  insurerId: string,
  insurerName: string,
): CellDetail {
  const val = garantie.values[insurerId];
  return {
    title: garantie.label,
    covered: val?.status === "covered",
    insurerId,
    insurerName,
    description: val?.keyInfo ?? "",
    cellType: "guarantee",
    subLimits: [],
    sources: [],
  };
}

// ─── Add Guarantee Popover ──────────────────────────────────────────

type AvailableGuarantee = { label: string; source: "guarantee" | "exclusion"; sectionTitle?: string };

function AddGuaranteePopover({
  comparisonData,
  existingLabels,
  onAdd,
  onClose,
}: {
  comparisonData: ComparisonData;
  existingLabels: Set<string>;
  onAdd: (label: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Build list of all guarantees + exclusions from comparison data
  const allItems: AvailableGuarantee[] = [];
  const flatSections = comparisonData.products?.flatMap((p) => p.subGroups) ?? comparisonData.sections ?? [];
  for (const section of flatSections) {
    for (const row of section.rows) {
      if (!existingLabels.has(row.label)) {
        allItems.push({ label: row.label, source: "guarantee", sectionTitle: section.title });
      }
    }
  }
  for (const excl of comparisonData.exclusions ?? []) {
    if (!existingLabels.has(excl.label)) {
      allItems.push({ label: excl.label, source: "exclusion" });
    }
  }

  const lower = search.toLowerCase();
  const filtered = search ? allItems.filter((item) => item.label.toLowerCase().includes(lower)) : allItems;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 z-20">
      <div className="bg-white border border-panora-border rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-h-[320px] flex flex-col overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-panora-border">
          <Search className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
            className="flex-1 text-[13px] text-panora-text bg-transparent outline-none placeholder:text-panora-text-muted/50"
            placeholder="Rechercher une garantie ou exclusion..."
          />
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-[13px] text-panora-text-muted text-center">
              Aucun resultat
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={`${item.source}-${item.label}`}
                onClick={() => { onAdd(item.label); onClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-panora-bg/50 transition-colors border-b border-panora-border last:border-b-0"
              >
                <span className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${
                  item.source === "guarantee" ? "bg-[#dbeee5] text-panora-green" : "bg-[#fde8e8] text-[#952617]"
                }`}>
                  {item.source === "guarantee" ? "Gar." : "Excl."}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-panora-text block truncate">{item.label}</span>
                  {item.sectionTitle && (
                    <span className="text-[11px] text-panora-text-muted">{item.sectionTitle}</span>
                  )}
                </div>
                <Plus className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pricing card (Figma-matched) ────────────────────────────────────

function PricingVariante({
  formula,
  defaultOpen,
}: {
  formula: { formula: string; details: Array<{ label: string; value: string }> };
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-[5px] w-full h-6 text-left text-[12px] font-medium text-panora-text-muted tracking-[0.12px] leading-6"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        )}
        <span className="truncate">
          {formula.formula}
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-1 mt-1">
          {formula.details.map((detail, i) => {
            const { amount, period } = splitPrice(detail.value);
            return (
              <div key={i} className="flex items-baseline justify-between">
                <span className="text-[13px] leading-5 text-panora-text-muted">{detail.label}</span>
                <span className="whitespace-nowrap">
                  <span className="text-[13px] font-medium leading-5 text-panora-text">{amount}</span>
                  {period && <span className="text-[13px] leading-5 text-panora-text-muted"> {period}</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PricingCards({ insurers }: { insurers: InsurerData[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {insurers.map((ins) => {
        const pricing = ins.pricing ?? [];
        return (
          <div key={ins.id} className="border border-panora-border rounded-[10px] overflow-hidden bg-white">
            <div className="flex items-center gap-3 px-3.5 py-3 bg-[#faf8f5] border-b border-panora-border">
              <InsurerLogo insurerId={ins.id} name={ins.name} size="sm" className="w-8 h-8 rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />
              <span className="text-[13px] font-semibold text-panora-text tracking-[-0.1px]">{ins.name}</span>
            </div>
            {pricing.length === 0 ? (
              <div className="p-3">
                <p className="text-[13px] text-panora-text-muted">Aucune offre</p>
              </div>
            ) : (
              pricing.map((formula, fIdx) => (
                <div
                  key={fIdx}
                  className={`p-3 ${fIdx < pricing.length - 1 ? "border-b border-panora-border" : ""}`}
                >
                  <PricingVariante formula={formula} defaultOpen={fIdx === 0} />
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Section labels ─────────────────────────────────────────────────

const SECTION_LABELS: Record<SectionId, string> = {
  resume: "Resume executif",
  financier: "Conditions financieres",
  offre_analyse: "Analyse par offre",
  garanties: "Garanties cles",
};

// ─── Floating Prompt Bar ────────────────────────────────────────────

function FloatingPromptBar({
  targetSections,
  sectionTitles: titles,
  onRemoveSection,
  onSubmit,
  onClear,
  isRegenerating,
}: {
  targetSections: SectionId[];
  sectionTitles: Record<SectionId, string>;
  onRemoveSection: (id: SectionId) => void;
  onSubmit: (instruction: string) => void;
  onClear: () => void;
  isRegenerating: boolean;
}) {
  const [instruction, setInstruction] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevCount = useRef(targetSections.length);

  useEffect(() => {
    if (targetSections.length > prevCount.current) {
      inputRef.current?.focus();
    }
    prevCount.current = targetSections.length;
  }, [targetSections.length]);

  const hasSections = targetSections.length > 0;

  const handleSubmit = () => {
    if (isRegenerating || !instruction.trim()) return;
    onSubmit(instruction);
    setInstruction("");
  };

  return (
    <div className="sticky bottom-0 z-10 pointer-events-none">
      <div className="max-w-[820px] mx-auto px-10 pb-6 pt-4">
        {/* Outer wrapper with animated gradient border */}
        <div className="pointer-events-auto relative rounded-[14px] p-px overflow-hidden shadow-[0_4px_24px_rgba(0,162,114,0.08),0_1px_4px_rgba(0,0,0,0.03)]">
          {/* Animated gradient border — 1px via p-px wrapper */}
          <div className="absolute inset-0 rounded-[14px] bg-[conic-gradient(from_var(--gradient-angle),#00a272,#34d399,#6ee7b7,#00a272)] animate-[spin-gradient_3s_linear_infinite] opacity-70" style={{ "--gradient-angle": "0deg" } as React.CSSProperties} />
          <div className="absolute inset-[-1px] rounded-[15px] bg-[conic-gradient(from_var(--gradient-angle),#00a272,#34d399,#6ee7b7,#00a272)] animate-[spin-gradient_3s_linear_infinite] opacity-20 blur-[4px]" style={{ "--gradient-angle": "0deg" } as React.CSSProperties} />

          {/* Inner card */}
          <div className="relative bg-white rounded-[13px]">
            {/* Context badges row */}
            {hasSections && (
              <div className="flex items-center gap-1.5 flex-wrap px-3.5 pt-3 pb-0">
                {targetSections.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 bg-panora-green/10 text-panora-green text-[11px] font-medium px-2 py-1 rounded-full"
                  >
                    {titles[id]}
                    <button
                      onClick={() => onRemoveSection(id)}
                      className="hover:bg-panora-green/20 rounded-full p-0.5 transition-colors"
                    >
                      <XIcon className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                {targetSections.length > 1 && (
                  <button
                    onClick={onClear}
                    className="text-[11px] text-panora-text-muted hover:text-panora-text transition-colors ml-1"
                  >
                    Tout retirer
                  </button>
                )}
              </div>
            )}

            {/* Input row */}
            <div className="flex items-center gap-2 px-3.5 py-3">
              <Sparkles className="w-4 h-4 text-panora-green/60 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                  if (e.key === "Escape" && hasSections) onClear();
                }}
                className="flex-1 text-[13px] text-panora-text bg-transparent outline-none placeholder:text-panora-text-muted/50"
                placeholder={hasSections ? "Decrivez comment ameliorer ces sections..." : "Ameliorer l'analyse, regenerer une section..."}
                disabled={isRegenerating}
              />
              <button
                onClick={handleSubmit}
                disabled={isRegenerating || !instruction.trim()}
                className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-panora-green text-white transition-colors shrink-0 disabled:opacity-30 hover:bg-panora-green/90"
              >
                {isRegenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Contexte client section — read-only display, shortcuts to panel ──

function ContexteClientSection({
  contextPills,
  onOpenProfile,
  noteBefore,
  onNoteBeforeChange,
}: {
  contextPills: ContextPill[];
  onOpenProfile: () => void;
  noteBefore?: string;
  onNoteBeforeChange?: (value: string) => void;
}) {
  const visiblePills = contextPills.filter((p) => p.source !== "missing");

  // In the synthèse, all pills render as neutral (no AI indicator)
  // AI/extracted source is only visible in the ClientProfilePanel

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <GripVertical className="w-4 h-4 text-panora-text-muted/40 shrink-0" />
        <h2 className="text-[18px] font-serif font-semibold text-panora-text">Contexte client</h2>
      </div>

      <div className="space-y-4">
        {/* Introduction paragraph */}
        <EditableBlock
          value={noteBefore || ""}
          className="text-[13px] leading-6 text-panora-text"
          placeholder="Presenter le contexte du client et les enjeux de cette comparaison..."
          onCommit={(v) => onNoteBeforeChange?.(v)}
        />

        {/* Besoins client pills */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-medium text-panora-text">Besoins client</span>
            <button
              onClick={onOpenProfile}
              className="text-[12px] font-medium text-panora-green hover:text-panora-green/80 transition-colors px-2 py-0.5 rounded-[4px] border border-panora-green/20 hover:bg-panora-green/5"
            >
              Modifier
            </button>
          </div>
          {visiblePills.length === 0 ? (
            <p className="text-[13px] text-panora-text-muted">
              Aucun besoin renseigne.{" "}
              <button onClick={onOpenProfile} className="text-panora-green font-medium hover:underline">
                Completer le profil
              </button>
            </p>
          ) : (
            <div className="flex flex-wrap gap-[11px] items-start">
              {visiblePills.map((pill) => (
                <BesoinTag
                  key={pill.id}
                  value={pill.label}
                  source="manual"
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Initial section states helper ──────────────────────────────────

function initSectionStates(): Record<SectionId, SectionMeta> {
  const ids: SectionId[] = ["resume", "financier", "offre_analyse", "garanties"];
  return Object.fromEntries(
    ids.map((id) => [
      id,
      { id, defaultPrompt: DEFAULT_SECTION_PROMPTS[id], state: "generated" as const, isEdited: false },
    ])
  ) as Record<SectionId, SectionMeta>;
}

// ─── Main component ─────────────────────────────────────────────────

export function AnalysisTab({ analysisData, insurers, offerCount, comparisonData, onSwitchToComparison, onOpenProfile, onUpdateAnalysis, isStreaming, onStreamingDone, hasClientProfile = true, isPanelOpen = false }: AnalysisTabProps) {
  const [sectionStates, setSectionStates] = useState<Record<SectionId, SectionMeta>>(initSectionStates);
  const [targetSections, setTargetSections] = useState<SectionId[]>([]);
  const [streamingSection, setStreamingSection] = useState<SectionId | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [sectionTitles, setSectionTitles] = useState<Record<SectionId, string>>(SECTION_LABELS);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [selectedGarantie, setSelectedGarantie] = useState<GarantieCellId | null>(null);
  const [showAddGuarantee, setShowAddGuarantee] = useState(false);

  // Ordered list of sections (built-in + custom text)
  const [sectionOrder, setSectionOrder] = useState<SectionEntry[]>([
    { type: "builtin", id: "resume" },
    { type: "builtin", id: "financier" },
    { type: "builtin", id: "offre_analyse" },
    { type: "builtin", id: "garanties" },
  ]);

  // ─── Handlers ───────────────────────────────────────────────────

  const toggleTargetSection = useCallback((sectionId: SectionId) => {
    setTargetSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  }, []);

  const handleDeleteSection = useCallback((sectionKey: string) => {
    // For custom sections, remove from order entirely
    setSectionOrder((prev) => {
      const entry = prev.find((e) => (e.type === "builtin" ? e.id : e.id) === sectionKey);
      if (entry?.type === "custom") return prev.filter((e) => e.id !== sectionKey);
      return prev;
    });
    // For built-in sections, hide them (can be restored)
    setHiddenSections((prev) => new Set(prev).add(sectionKey));
    setTargetSections((prev) => prev.filter((id) => id !== sectionKey));
  }, []);

  // Drag-and-drop state for section reordering
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);
  const dragStartY = useRef(0);
  const dragElRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback((index: number, e: React.MouseEvent) => {
    setDragIdx(index);
    setDropIdx(index);
    dragStartY.current = e.clientY;

    const onMove = (ev: MouseEvent) => {
      // Find which section we're hovering over by checking the drop zones
      const els = document.querySelectorAll<HTMLElement>("[data-section-drop-idx]");
      let closest: number | null = null;
      let closestDist = Infinity;
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const dist = Math.abs(ev.clientY - mid);
        if (dist < closestDist) {
          closestDist = dist;
          closest = parseInt(el.dataset.sectionDropIdx!, 10);
        }
      });
      if (closest !== null) setDropIdx(closest);
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setDragIdx((prevDrag) => {
        setDropIdx((prevDrop) => {
          if (prevDrag !== null && prevDrop !== null && prevDrag !== prevDrop) {
            setSectionOrder((prev) => {
              const next = [...prev];
              const [moved] = next.splice(prevDrag, 1);
              next.splice(prevDrop, 0, moved);
              return next;
            });
          }
          return null;
        });
        return null;
      });
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  const handleAddTextSection = useCallback(() => {
    const id = `custom-${Date.now()}`;
    setSectionOrder((prev) => [...prev, { type: "custom", id, title: "Nouvelle section", content: "" }]);
  }, []);

  const handleUpdateCustomSection = useCallback((id: string, updates: { title?: string; content?: string }) => {
    setSectionOrder((prev) => prev.map((e) => {
      if (e.type === "custom" && e.id === id) return { ...e, ...updates };
      return e;
    }));
  }, []);

  const handleTitleChange = useCallback((sectionId: SectionId, title: string) => {
    setSectionTitles((prev) => ({ ...prev, [sectionId]: title }));
  }, []);

  const handleGarantieCellUpdate = useCallback((rowIndex: number, insurerId: string, detail: CellDetail) => {
    if (!analysisData) return;
    const next = [...analysisData.garantiesCles];
    const val: { status: "covered" | "not_covered"; keyInfo?: string } = {
      status: detail.covered ? "covered" : "not_covered",
      keyInfo: detail.description || undefined,
    };
    next[rowIndex] = {
      ...next[rowIndex],
      label: detail.title,
      values: { ...next[rowIndex].values, [insurerId]: val },
    };
    onUpdateAnalysis?.({ ...analysisData, garantiesCles: next });
  }, [analysisData, onUpdateAnalysis]);

  const handleAddGuarantee = useCallback((label: string) => {
    if (!analysisData) return;
    const newRow = {
      label,
      values: Object.fromEntries(insurers.map((ins) => [ins.id, { status: "not_covered" as const }])),
    };
    onUpdateAnalysis?.({ ...analysisData, garantiesCles: [...analysisData.garantiesCles, newRow] });
  }, [analysisData, insurers, onUpdateAnalysis]);

  const handleDeleteGuaranteeRow = useCallback((rowIndex: number) => {
    if (!analysisData) return;
    const next = analysisData.garantiesCles.filter((_, i) => i !== rowIndex);
    onUpdateAnalysis?.({ ...analysisData, garantiesCles: next });
    if (selectedGarantie?.rowIndex === rowIndex) setSelectedGarantie(null);
  }, [analysisData, selectedGarantie, onUpdateAnalysis]);

  const handleRegenerate = useCallback(async (sectionId: SectionId, instruction: string) => {
    if (!analysisData) return;

    // Snapshot current content for undo
    const snapshot: Partial<AnalysisData> = {};
    if (sectionId === "resume") snapshot.resumeExecutif = analysisData.resumeExecutif;
    if (sectionId === "financier") snapshot.conditionsFinancieres = { ...analysisData.conditionsFinancieres };
    if (sectionId === "offre_analyse") snapshot.analyseParOffre = [...analysisData.analyseParOffre];
    if (sectionId === "garanties") snapshot.garantiesCles = [...analysisData.garantiesCles];

    setSectionStates((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], state: "regenerating", previousContent: snapshot },
    }));

    const result = await mockRegenerateSection(sectionId, instruction, analysisData);

    onUpdateAnalysis?.({ ...analysisData, ...result });
    setSectionStates((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], state: "generated", isEdited: false },
    }));
    setStreamingSection(sectionId);
  }, [analysisData, onUpdateAnalysis]);

  const handlePromptSubmit = useCallback(async (instruction: string) => {
    if (!analysisData) return;
    setIsRegenerating(true);
    // If sections are targeted, regenerate only those; otherwise regenerate all visible
    const allVisible: SectionId[] = (["resume", "financier", "offre_analyse", "garanties"] as SectionId[]).filter((id) => !hiddenSections.has(id));
    const sections: SectionId[] = targetSections.length > 0
      ? [...targetSections]
      : allVisible;
    setTargetSections([]);

    for (const sectionId of sections) {
      await handleRegenerate(sectionId, instruction);
    }
    setIsRegenerating(false);
  }, [analysisData, targetSections, hiddenSections, handleRegenerate]);

  const updateWithEdit = useCallback((sectionId: SectionId, partial: Partial<AnalysisData>) => {
    if (!analysisData) return;
    onUpdateAnalysis?.({ ...analysisData, ...partial });
    setSectionStates((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], state: "edited", isEdited: true },
    }));
  }, [analysisData, onUpdateAnalysis]);

  // Empty states
  if (offerCount === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f4f1]">
        <div className="bg-gradient-to-b from-[#f7f9ff] to-white rounded-[12px] px-7 py-6 max-w-md w-full">
          <div className="space-y-3">
            <div className="space-y-0.5">
              <p className="text-[13px] font-medium text-[#162416] leading-5">
                Ajoutez des offres au tableau comparatif pour generer l&apos;analyse.
              </p>
              <p className="text-[13px] text-panora-text-muted leading-5">
                L&apos;IA pourra ensuite analyser la comparaison et vos besoins pour rediger une note claire et structuree.
              </p>
            </div>
            <button
              onClick={onSwitchToComparison}
              className="bg-[#e4e2e4] border border-[rgba(34,32,26,0.1)] text-white rounded-[8px] px-3 py-1.5 text-[13px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              Aller au tableau comparatif
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (offerCount === 1) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f4f1]">
        <div className="bg-gradient-to-b from-[#f7f9ff] to-white rounded-[12px] px-7 py-6 max-w-md w-full">
          <div className="space-y-0.5">
            <p className="text-[13px] font-medium text-[#162416] leading-5">
              L&apos;analyse comparative necessite au moins deux offres.
            </p>
            <p className="text-[13px] text-panora-text-muted leading-5">
              Ajoutez une deuxieme offre au tableau pour permettre la comparaison.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasClientProfile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f4f1]">
        <div className="bg-gradient-to-b from-[#f7f9ff] to-white rounded-[12px] px-7 py-6 max-w-md w-full">
          <div className="space-y-3">
            <div className="space-y-0.5">
              <p className="text-[13px] font-medium text-[#162416] leading-5">
                Completez le profil client pour generer une analyse personnalisee.
              </p>
              <p className="text-[13px] text-panora-text-muted leading-5">
                L&apos;IA pourra ensuite analyser la comparaison et vos besoins pour rediger une note claire et structuree.
              </p>
            </div>
            <button
              onClick={onOpenProfile}
              className="bg-[#e4e2e4] border border-[rgba(34,32,26,0.1)] text-white rounded-[8px] px-3 py-1.5 text-[13px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              Renseigner les besoins client
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-panora-bg">
        <p className="text-[14px] text-panora-text-muted">Analyse non disponible.</p>
      </div>
    );
  }

  const { contextPills, resumeExecutif, conditionsFinancieres, analyseParOffre, garantiesCles } = analysisData;

  const tocItems = [
    { id: "contexte", label: "Contexte client" },
    ...sectionOrder
      .filter((e) => !hiddenSections.has(e.id))
      .map((e) => ({
        id: e.id,
        label: e.type === "custom" ? e.title : sectionTitles[e.id as SectionId],
      })),
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTocId, setActiveTocId] = useState<string>("contexte");

  // IntersectionObserver to track which section is in view
  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first entry that is intersecting from top
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("section-", "");
            setActiveTocId(id);
            break;
          }
        }
      },
      { root, rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );

    // Observe all section anchors
    const sectionIds = tocItems.map((t) => `section-${t.id}`);
    for (const sid of sectionIds) {
      const el = document.getElementById(sid);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [tocItems.map((t) => t.id).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollContent = (
    <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto bg-[#f5f4f1] ${(isStreaming || streamingSection) ? "streaming-bg" : ""}`}>
      <div className={`relative mx-auto my-8 flex gap-0 ${isPanelOpen ? "max-w-[860px] px-8" : "max-w-[1200px]"}`}>
        {/* Left TOC sidebar — hidden when panel is open */}
        {!isPanelOpen && (
        <div className="w-[210px] shrink-0 sticky top-8 self-start hidden xl:block pt-6 pl-2">
          <nav className="space-y-0.5">
            {tocItems.map((item) => {
              const isActive = activeTocId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    const el = document.getElementById(`section-${item.id}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-[6px] text-left transition-colors ${
                    isActive ? "" : "hover:bg-panora-secondary"
                  }`}
                >
                  <Diamond
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-panora-green fill-panora-green" : "text-panora-text-muted/40"
                    }`}
                  />
                  <span
                    className={`text-[13px] leading-5 truncate transition-colors ${
                      isActive
                        ? "font-medium text-panora-text-primary"
                        : "text-panora-text-muted"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
        )}

        {/* Document page */}
        <div className="flex-1 max-w-[860px]">
        <div className="bg-white rounded-[12px] border border-panora-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative">
          <div className="px-10 py-8 space-y-8">

            {/* ── Title ── */}
            <div>
              <div className="w-8 h-[3px] bg-panora-green rounded-full mb-4" />
              <h1 className="text-[28px] font-serif font-semibold text-panora-text leading-9 tracking-[-0.3px]">
                Synthese comparative
              </h1>
              <p className="text-[13px] text-panora-text-muted mt-1.5">
                {insurers.length} offres analysees
              </p>
            </div>

            <Hr />

            {/* ── Contexte client ── */}
            <div id="section-contexte" />
            <ContexteClientSection
              contextPills={contextPills}
              onOpenProfile={onOpenProfile}
              noteBefore={analysisData?.contextNoteBefore}
              onNoteBeforeChange={(v) => {
                if (analysisData) onUpdateAnalysis?.({ ...analysisData, contextNoteBefore: v });
              }}
            />

            <Hr />

            {/* ── Dynamic sections ── */}
            {(() => {
              const visibleSections = sectionOrder.filter((entry) => !hiddenSections.has(entry.id));
              return visibleSections.map((entry, visIdx) => {
                const isFirst = visIdx === 0;
                const isLast = visIdx === visibleSections.length - 1;
                const orderIdx = sectionOrder.indexOf(entry);

                const isDragging = dragIdx === orderIdx;
                const isDropTarget = dropIdx === orderIdx && dragIdx !== null && dragIdx !== orderIdx;

                // Custom text section
                if (entry.type === "custom") {
                  return (
                    <div key={entry.id} id={`section-${entry.id}`} data-section-drop-idx={orderIdx} className={`transition-opacity ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "border-t-2 border-panora-green" : ""}`}>
                      {!isFirst && <Hr />}
                      <div className="group">
                        <SectionHeader
                          title={entry.title}
                          onTitleChange={(t) => handleUpdateCustomSection(entry.id, { title: t })}
                          onDelete={() => handleDeleteSection(entry.id)}
                          dragHandleProps={{ onMouseDown: (e) => handleDragStart(orderIdx, e) }}
                        />
                        <EditableBlock
                          value={entry.content}
                          className="text-[14px] leading-6 text-panora-text"
                          placeholder="Saisissez le contenu de cette section..."
                          onCommit={(v) => handleUpdateCustomSection(entry.id, { content: v })}
                        />
                      </div>
                    </div>
                  );
                }

                // Built-in sections
                const sectionId = entry.id;

                const sectionHeader = (
                  <SectionHeader
                    title={sectionTitles[sectionId]}
                    meta={sectionStates[sectionId]}
                    isTargeted={targetSections.includes(sectionId)}
                    onToggleTarget={() => toggleTargetSection(sectionId)}
                    onTitleChange={(t) => handleTitleChange(sectionId, t)}
                    onDelete={() => handleDeleteSection(sectionId)}
                    dragHandleProps={{ onMouseDown: (e) => handleDragStart(orderIdx, e) }}
                  />
                );

                if (sectionId === "resume") {
                  return (
                    <div key={sectionId} id={`section-${sectionId}`} data-section-drop-idx={orderIdx} className={`transition-opacity ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "border-t-2 border-panora-green" : ""}`}>
                      {!isFirst && <Hr />}
                      <div className="group">
                        {sectionHeader}
                        {(isStreaming || streamingSection === "resume") ? (
                          <StreamingBlock
                            text={resumeExecutif}
                            active
                            delay={streamingSection === "resume" ? 0 : 0}
                            className="text-[14px] leading-6 text-panora-text"
                            onComplete={() => {
                              if (streamingSection === "resume") setStreamingSection(null);
                              if (isStreaming && !streamingSection) onStreamingDone?.();
                            }}
                          />
                        ) : (
                          <EditableBlock
                            value={resumeExecutif}
                            className="text-[14px] leading-6 text-panora-text"
                            onCommit={(v) => updateWithEdit("resume", { resumeExecutif: v })}
                          />
                        )}
                        <EditableBlock
                          value=""
                          className="text-[13px] leading-5 text-panora-text-muted mt-4"
                          placeholder="Ajouter du texte..."
                          onCommit={() => {}}
                        />
                      </div>
                    </div>
                  );
                }

                if (sectionId === "financier") {
                  return (
                    <div key={sectionId} id={`section-${sectionId}`} data-section-drop-idx={orderIdx} className={`transition-opacity ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "border-t-2 border-panora-green" : ""}`}>
                      {!isFirst && <Hr />}
                      <div className="group">
                        {sectionHeader}
                        {(isStreaming || streamingSection === "financier") ? (
                          <>
                            <StreamingBlock
                              text={conditionsFinancieres.analysisBefore}
                              active
                              delay={streamingSection === "financier" ? 0 : resumeExecutif.length * 8 / 3}
                              className="text-[14px] leading-6 text-panora-text mb-6"
                            />
                            <PricingCards insurers={insurers} />
                            <StreamingBlock
                              text={conditionsFinancieres.analysisAfter}
                              active
                              delay={streamingSection === "financier" ? conditionsFinancieres.analysisBefore.length * 8 / 3 : (resumeExecutif.length + conditionsFinancieres.analysisBefore.length) * 8 / 3 + 200}
                              className="text-[14px] leading-6 text-panora-text"
                              onComplete={() => {
                                if (streamingSection === "financier") setStreamingSection(null);
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <EditableBlock
                              value={conditionsFinancieres.analysisBefore}
                              className="text-[14px] leading-6 text-panora-text mb-6"
                              onCommit={(v) => updateWithEdit("financier", { conditionsFinancieres: { ...conditionsFinancieres, analysisBefore: v } })}
                            />
                            <PricingCards insurers={insurers} />
                            <EditableBlock
                              value={conditionsFinancieres.analysisAfter}
                              className="text-[14px] leading-6 text-panora-text"
                              onCommit={(v) => updateWithEdit("financier", { conditionsFinancieres: { ...conditionsFinancieres, analysisAfter: v } })}
                            />
                          </>
                        )}
                        <EditableBlock
                          value=""
                          className="text-[13px] leading-5 text-panora-text-muted mt-4"
                          placeholder="Ajouter du texte..."
                          onCommit={() => {}}
                        />
                      </div>
                    </div>
                  );
                }

                if (sectionId === "offre_analyse") {
                  return (
                    <div key={sectionId} id={`section-${sectionId}`} data-section-drop-idx={orderIdx} className={`transition-opacity ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "border-t-2 border-panora-green" : ""}`}>
                      {!isFirst && <Hr />}
                      <div className="group">
                        {sectionHeader}
                        <div className="space-y-4">
                          {analyseParOffre.map((item, idx) => (
                            <div key={item.insurerId} className="border border-panora-border rounded-[8px] overflow-hidden">
                              <div className="flex items-center gap-3 px-4 py-3 border-b border-panora-border">
                                <InsurerLogo insurerId={item.insurerId} name={item.insurerName} size="sm" className="w-6 h-6 rounded-[4px]" />
                                <h3 className="text-[13px] font-medium text-panora-text">{item.insurerName}</h3>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-panora-border">
                                <div className="p-4">
                                  <p className="text-[13px] font-medium text-panora-green mb-2 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-[18px] h-[18px]" />
                                    Points forts
                                  </p>
                                  {(isStreaming || streamingSection === "offre_analyse") ? (
                                    <StreamingBlock
                                      text={item.pointsForts.map((s) => `• ${s}`).join("\n")}
                                      active
                                      delay={streamingSection === "offre_analyse" ? idx * 400 : 3000 + idx * 800}
                                      speed={10}
                                      className="text-[13px] leading-6 text-panora-text"
                                    />
                                  ) : (
                                    <EditableBullets
                                      items={item.pointsForts}
                                      className="text-[13px] leading-6 text-panora-text"
                                      onCommit={(lines) => {
                                        const next = [...analyseParOffre];
                                        next[idx] = { ...item, pointsForts: lines };
                                        updateWithEdit("offre_analyse", { analyseParOffre: next });
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="p-4">
                                  <p className="text-[13px] font-medium text-[#cb8052] mb-2 flex items-center gap-1.5">
                                    <AlertCircle className="w-[18px] h-[18px]" />
                                    Points faibles
                                  </p>
                                  {(isStreaming || streamingSection === "offre_analyse") ? (
                                    <StreamingBlock
                                      text={item.pointsFaibles.map((s) => `• ${s}`).join("\n")}
                                      active
                                      delay={streamingSection === "offre_analyse" ? idx * 400 + 200 : 3000 + idx * 800 + 400}
                                      speed={10}
                                      className="text-[13px] leading-6 text-panora-text"
                                      onComplete={idx === analyseParOffre.length - 1 ? () => {
                                        if (streamingSection === "offre_analyse") setStreamingSection(null);
                                      } : undefined}
                                    />
                                  ) : (
                                    <EditableBullets
                                      items={item.pointsFaibles}
                                      className="text-[13px] leading-6 text-panora-text"
                                      onCommit={(lines) => {
                                        const next = [...analyseParOffre];
                                        next[idx] = { ...item, pointsFaibles: lines };
                                        updateWithEdit("offre_analyse", { analyseParOffre: next });
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <EditableBlock
                          value=""
                          className="text-[13px] leading-5 text-panora-text-muted mt-4"
                          placeholder="Ajouter du texte..."
                          onCommit={() => {}}
                        />
                      </div>
                    </div>
                  );
                }

                if (sectionId === "garanties") {
                  return (
                    <div key={sectionId} id={`section-${sectionId}`} data-section-drop-idx={orderIdx} className={`transition-opacity ${isDragging ? "opacity-40" : ""} ${isDropTarget ? "border-t-2 border-panora-green" : ""}`}>
                      {!isFirst && <Hr />}
                      <div className="group">
                        {sectionHeader}
                        {(() => {
                          const guaranteeRows = garantiesCles.map((r, i) => ({ ...r, origIdx: i })).filter((r) => r.type !== "exclusion");
                          const exclusionRows = garantiesCles.map((r, i) => ({ ...r, origIdx: i })).filter((r) => r.type === "exclusion");

                          const renderRow = (row: typeof garantiesCles[0] & { origIdx: number }, isRowLast: boolean) => {
                            const rIdx = row.origIdx;
                            const isSelected = selectedGarantie?.rowIndex === rIdx;
                            return (
                              <div key={rIdx} className={`flex group/row ${!isRowLast ? "border-b border-panora-border" : ""}`}>
                                <div className="w-[200px] min-w-[200px] shrink-0 px-3 py-2.5 border-r border-panora-border flex items-center justify-between">
                                  <span className="text-[13px] text-panora-text">{row.label}</span>
                                  <button
                                    onClick={() => handleDeleteGuaranteeRow(rIdx)}
                                    className="w-5 h-5 flex items-center justify-center rounded text-panora-text-muted hover:text-[#952617] opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                {insurers.map((ins) => {
                                  const val = row.values[ins.id];
                                  const cellSelected = isSelected && selectedGarantie?.insurerId === ins.id;
                                  return (
                                    <div
                                      key={ins.id}
                                      onClick={() => setSelectedGarantie(cellSelected ? null : { rowIndex: rIdx, insurerId: ins.id })}
                                      className={`min-w-[120px] flex-1 px-3 py-2.5 border-r border-panora-border last:border-r-0 cursor-pointer transition-colors ${
                                        cellSelected ? "bg-panora-green/5 ring-2 ring-inset ring-panora-green" : "hover:bg-panora-bg/50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        {val?.status === "covered" ? (
                                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#dbeee5]">
                                            <Check className="w-3 h-3 text-panora-green" />
                                          </span>
                                        ) : val?.status === "not_covered" ? (
                                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#fde8e8]">
                                            <XIcon className="w-3 h-3 text-[#952617]" />
                                          </span>
                                        ) : (
                                          <span className="text-[13px] text-panora-text-muted">—</span>
                                        )}
                                        {val?.keyInfo && (
                                          <span className="text-[11px] text-panora-text-muted leading-4">{val.keyInfo}</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          };

                          return (
                            <div className="overflow-x-auto -mx-10 px-10">
                              <div className="border border-panora-border rounded-[8px] overflow-hidden min-w-fit">
                                <div className="flex border-b border-panora-border bg-[#faf8f5]">
                                  <div className="w-[200px] min-w-[200px] shrink-0 px-3 py-2.5 border-r border-panora-border" />
                                  {insurers.map((ins) => (
                                    <div key={ins.id} className="min-w-[120px] flex-1 px-3 py-2.5 border-r border-panora-border last:border-r-0">
                                      <div className="flex items-center gap-1.5">
                                        <InsurerLogo insurerId={ins.id} name={ins.name} size="sm" className="w-4 h-4 rounded-[2px]" />
                                        <span className="text-[12px] font-medium text-panora-text">{ins.name}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {guaranteeRows.length > 0 && (
                                  <>
                                    <div className="flex border-b border-panora-border bg-[#faf8f5]/60">
                                      <div className="px-3 py-1.5">
                                        <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wide">Garanties</span>
                                      </div>
                                    </div>
                                    {guaranteeRows.map((row, i) => renderRow(row, i === guaranteeRows.length - 1 && exclusionRows.length === 0))}
                                  </>
                                )}
                                {exclusionRows.length > 0 && (
                                  <>
                                    <div className="flex border-b border-t border-panora-border bg-[#fde8e8]/30">
                                      <div className="px-3 py-1.5">
                                        <span className="text-[11px] font-medium text-[#952617]/70 uppercase tracking-wide">Exclusions</span>
                                      </div>
                                    </div>
                                    {exclusionRows.map((row, i) => renderRow(row, i === exclusionRows.length - 1))}
                                  </>
                                )}
                                <div className="border-t border-panora-border px-3 py-2 relative">
                                  <button
                                    onClick={() => setShowAddGuarantee(!showAddGuarantee)}
                                    className="flex items-center gap-1.5 text-[12px] font-medium text-panora-green hover:underline"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Ajouter
                                  </button>
                                  {showAddGuarantee && comparisonData && (
                                    <AddGuaranteePopover
                                      comparisonData={comparisonData}
                                      existingLabels={new Set(garantiesCles.map((r) => r.label))}
                                      onAdd={handleAddGuarantee}
                                      onClose={() => setShowAddGuarantee(false)}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                }

                return null;
              });
            })()}

            {/* ── Add section button ── */}
            <Hr />
            <button
              onClick={handleAddTextSection}
              className="flex items-center gap-1.5 text-[13px] font-medium text-panora-text-muted hover:text-panora-text transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une section
            </button>

            {/* ── Note complementaire — end of document ── */}
            <Hr />
            <EditableBlock
              value={analysisData?.contextNoteAfter || ""}
              className="text-[13px] leading-5 text-panora-text-muted"
              placeholder="Ajouter une note complementaire..."
              onCommit={(v) => {
                if (analysisData) onUpdateAnalysis?.({ ...analysisData, contextNoteAfter: v });
              }}
            />

          </div>
        </div>
        </div>

      </div>

      {/* Floating prompt bar — hidden for now */}
    </div>
  );

  // Selected garantie detail
  const selectedGarantieRow = selectedGarantie && analysisData ? analysisData.garantiesCles[selectedGarantie.rowIndex] : null;
  const selectedInsurer = selectedGarantie ? insurers.find((i) => i.id === selectedGarantie.insurerId) : null;
  const garantieCellDetail = selectedGarantieRow && selectedInsurer
    ? buildGarantieCellDetail(selectedGarantieRow, selectedGarantie!.insurerId, selectedInsurer.name)
    : null;

  return (
    <div className="flex-1 flex min-h-0">
      {scrollContent}
      {garantieCellDetail && selectedGarantie && (
        <DetailPanel
          cellDetail={garantieCellDetail}
          onUpdate={(detail) => handleGarantieCellUpdate(selectedGarantie.rowIndex, selectedGarantie.insurerId, detail)}
          onClose={() => setSelectedGarantie(null)}
        />
      )}
    </div>
  );
}
