"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { Check, X as XIcon, Plus, Sparkles, RotateCcw, Loader2, Send, Trash2, Search, ArrowRight } from "lucide-react";
import type { AnalysisData, InsurerData, SectionId, SectionMeta, ComparisonData, CellDetail, ContextPill } from "@/data/mock";
import { DEFAULT_SECTION_PROMPTS, mockRegenerateSection } from "@/data/mock";
import { DetailPanel } from "@/components/quoting/DetailPanel";
import { BesoinTag } from "@/components/ui/BesoinTag";

type GarantieCellId = { rowIndex: number; insurerId: string };

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
      {showCursor && <span className="inline-block w-[5px] h-[13px] bg-[#8b5cf6]/60 ml-[1px] animate-pulse rounded-sm align-middle" />}
    </div>
  );
}

// ─── Horizontal rule ────────────────────────────────────────────────

function Hr() {
  return <hr className="border-panora-border my-0" />;
}

// ─── Section Header ─────────────────────────────────────────────────

function SectionHeader({
  title,
  meta,
  isTargeted,
  onToggleTarget,
  onTitleChange,
  onDelete,
}: {
  title: string;
  meta: SectionMeta;
  isTargeted: boolean;
  onToggleTarget: () => void;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  const commitTitle = () => {
    if (!titleRef.current) return;
    const text = titleRef.current.innerText?.trim() ?? "";
    if (text && text !== title) onTitleChange(text);
  };

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <h2
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          className="text-[18px] font-serif font-semibold text-panora-text outline-none rounded-[4px] focus:ring-1 focus:ring-panora-green/30 px-1 -mx-1"
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
            if (e.key === "Escape") e.currentTarget.blur();
          }}
        >
          {title}
        </h2>
        {meta.isEdited && (
          <span className="text-[11px] bg-panora-secondary text-panora-text-muted px-2 py-0.5 rounded-full shrink-0">
            Modifie
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          onClick={onDelete}
          className="flex items-center justify-center w-7 h-7 rounded-[6px] text-panora-text-muted hover:text-[#952617] hover:bg-[#fde8e8] transition-colors opacity-0 group-hover:opacity-100"
          title="Supprimer cette section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleTarget}
          className={`flex items-center gap-1.5 text-[12px] px-2 py-1 rounded-[6px] transition-colors ${
            isTargeted
              ? "text-panora-green font-medium bg-panora-green/10"
              : "text-panora-text-muted hover:text-panora-text hover:bg-panora-bg opacity-0 group-hover:opacity-100"
          }`}
          title={isTargeted ? "Retirer du scope" : "Cibler cette section"}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isTargeted ? "Cible" : "Cibler"}
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
  for (const section of comparisonData.sections) {
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

  // Map pill source to BesoinTag source (extracted → ai visually)
  const tagSource = (pill: ContextPill): "ai" | "manual" => {
    if (pill.source === "ai" || pill.source === "extracted") return "ai";
    return "manual";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-serif font-semibold text-panora-text">Contexte client</h2>
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 text-[12px] font-medium text-panora-green hover:text-panora-green/80 transition-colors px-2 py-1 rounded-[6px] border border-panora-green/20 hover:bg-panora-green/5"
        >
          Modifier
        </button>
      </div>

      <div className="space-y-3">
        {/* Introduction paragraph */}
        <EditableBlock
          value={noteBefore || ""}
          className="text-[14px] leading-6 text-panora-text"
          placeholder="Presenter le contexte du client et les enjeux de cette comparaison..."
          onCommit={(v) => onNoteBeforeChange?.(v)}
        />

        {visiblePills.length === 0 ? (
          <p className="text-[14px] text-panora-text-muted">
            Aucun besoin renseigne.{" "}
            <button onClick={onOpenProfile} className="text-panora-green font-medium hover:underline">
              Completer le profil
            </button>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 items-start">
            {visiblePills.map((pill) => (
              <BesoinTag
                key={pill.id}
                value={pill.label}
                source={tagSource(pill)}
                compact
              />
            ))}
          </div>
        )}
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

export function AnalysisTab({ analysisData, insurers, offerCount, comparisonData, onSwitchToComparison, onOpenProfile, onUpdateAnalysis, isStreaming, onStreamingDone, hasClientProfile = true }: AnalysisTabProps) {
  const [sectionStates, setSectionStates] = useState<Record<SectionId, SectionMeta>>(initSectionStates);
  const [targetSections, setTargetSections] = useState<SectionId[]>([]);
  const [streamingSection, setStreamingSection] = useState<SectionId | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [sectionTitles, setSectionTitles] = useState<Record<SectionId, string>>(SECTION_LABELS);
  const [hiddenSections, setHiddenSections] = useState<Set<SectionId>>(new Set());
  const [selectedGarantie, setSelectedGarantie] = useState<GarantieCellId | null>(null);
  const [showAddGuarantee, setShowAddGuarantee] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────

  const toggleTargetSection = useCallback((sectionId: SectionId) => {
    setTargetSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  }, []);

  const handleDeleteSection = useCallback((sectionId: SectionId) => {
    setHiddenSections((prev) => new Set(prev).add(sectionId));
    setTargetSections((prev) => prev.filter((id) => id !== sectionId));
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
      <div className="flex-1 flex items-center justify-center bg-panora-bg">
        <div className="text-center max-w-sm space-y-3">
          <Sparkles className="w-8 h-8 text-panora-text-muted mx-auto" />
          <p className="text-[17px] font-serif font-semibold text-panora-text">Aucune offre</p>
          <p className="text-[14px] text-panora-text-muted leading-5">
            Ajoutez des offres au tableau comparatif pour generer l&apos;analyse.
          </p>
          <button onClick={onSwitchToComparison} className="btn-primary px-4 py-2 text-[13px] font-medium">
            Aller au tableau comparatif
          </button>
        </div>
      </div>
    );
  }

  if (offerCount === 1) {
    return (
      <div className="flex-1 flex items-center justify-center bg-panora-bg">
        <div className="text-center max-w-sm space-y-3">
          <Sparkles className="w-8 h-8 text-panora-text-muted mx-auto" />
          <p className="text-[17px] font-serif font-semibold text-panora-text">Offre unique</p>
          <p className="text-[14px] text-panora-text-muted leading-5">
            L&apos;analyse comparative necessite au moins deux offres.
          </p>
        </div>
      </div>
    );
  }

  if (!hasClientProfile) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#f5f4f1] relative">
        {/* Skeleton preview of the synthesis — blurred to tease content */}
        <div className="max-w-[820px] mx-auto my-8 pointer-events-none select-none" aria-hidden>
          <div className="bg-white rounded-[12px] border border-panora-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-10 py-10 space-y-10 opacity-[0.45] blur-[1.5px]">
            {/* Fake title */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
                <div className="h-3 w-16 rounded bg-[#8b5cf6]/20" />
              </div>
              <div className="h-7 w-64 rounded bg-panora-text/10 mb-2" />
              <div className="h-3.5 w-48 rounded bg-panora-text/7" />
            </div>
            <hr className="border-panora-border" />
            {/* Fake context pills */}
            <div>
              <div className="h-5 w-32 rounded bg-panora-text/10 mb-3" />
              <div className="flex flex-wrap gap-2">
                <div className="h-7 w-20 rounded-full bg-panora-secondary" />
                <div className="h-7 w-28 rounded-full bg-panora-secondary" />
                <div className="h-7 w-24 rounded-full bg-panora-secondary" />
                <div className="h-7 w-32 rounded-full border border-dashed border-[#d4d2cc]" />
              </div>
            </div>
            <hr className="border-panora-border" />
            {/* Fake resume executif */}
            <div>
              <div className="h-5 w-40 rounded bg-panora-text/10 mb-3" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-panora-text/7" />
                <div className="h-4 w-full rounded bg-panora-text/7" />
                <div className="h-4 w-3/4 rounded bg-panora-text/7" />
                <div className="h-4 w-full rounded bg-panora-text/7" />
                <div className="h-4 w-5/6 rounded bg-panora-text/7" />
              </div>
            </div>
            <hr className="border-panora-border" />
            {/* Fake pricing table */}
            <div>
              <div className="h-5 w-48 rounded bg-panora-text/10 mb-3" />
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="border border-panora-border rounded-[8px] p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-panora-secondary" />
                      <div className="h-4 w-20 rounded bg-panora-text/10" />
                    </div>
                    <div className="h-6 w-24 rounded bg-panora-green/15" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-full rounded bg-panora-text/5" />
                      <div className="h-3 w-3/4 rounded bg-panora-text/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#f5f4f1]/30 via-[#f5f4f1]/70 to-[#f5f4f1]/95">
          <div className="bg-white border border-panora-border rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] max-w-md w-full">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#dbeee5] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-panora-green" />
              </div>
              <div>
                <h3 className="text-[18px] font-serif font-semibold text-panora-text leading-6 mb-1.5">
                  Personnalisez cette synthese
                </h3>
                <p className="text-[13px] text-panora-text-muted leading-5">
                  Renseignez les besoins de votre client pour generer une synthese comparative personnalisee avec recommandations.
                </p>
              </div>
              <button
                onClick={onOpenProfile}
                className="btn-primary flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium mt-1"
              >
                Renseigner les besoins client
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[12px] text-panora-text-muted">Moins de 2 minutes</p>
            </div>
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

  const scrollContent = (
    <div className="flex-1 overflow-y-auto bg-[#f5f4f1]">
      <div className="max-w-[820px] mx-auto my-8">
        {/* Document page */}
        <div className="bg-white rounded-[12px] border border-panora-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative">
          <div className="px-10 py-10 space-y-10">

            {/* ── Title ── */}
            <div className="pb-2">
              <p className="text-[12px] font-medium text-[#8b5cf6] tracking-wide uppercase mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Analyse IA
              </p>
              <h1 className="text-[28px] font-serif font-semibold text-panora-text leading-9">
                Synthese comparative
              </h1>
              <p className="text-[14px] text-panora-text-muted mt-2 leading-5">
                {insurers.length} offres analysees &middot; Cliquez sur un texte pour le modifier directement
              </p>
            </div>

            <Hr />

            {/* ── Contexte client ── */}
            <ContexteClientSection
              contextPills={contextPills}
              onOpenProfile={onOpenProfile}
              noteBefore={analysisData?.contextNoteBefore}
              onNoteBeforeChange={(v) => {
                if (analysisData) onUpdateAnalysis?.({ ...analysisData, contextNoteBefore: v });
              }}
            />

            {!hiddenSections.has("resume") && <Hr />}

            {/* ── Resume executif ── */}
            {!hiddenSections.has("resume") && <div className="group">
              <SectionHeader
                title={sectionTitles.resume}
                meta={sectionStates.resume}
                isTargeted={targetSections.includes("resume")}
                onToggleTarget={() => toggleTargetSection("resume")}
                onTitleChange={(t) => handleTitleChange("resume", t)}
                onDelete={() => handleDeleteSection("resume")}
              />
              {sectionStates.resume.state === "regenerating" ? (
                <RegeneratingOverlay>
                  <div className="text-[15px] leading-7 text-panora-text">{resumeExecutif}</div>
                </RegeneratingOverlay>
              ) : (isStreaming || streamingSection === "resume") ? (
                <StreamingBlock
                  text={resumeExecutif}
                  active
                  delay={streamingSection === "resume" ? 0 : 0}
                  className="text-[15px] leading-7 text-panora-text"
                  onComplete={() => {
                    if (streamingSection === "resume") setStreamingSection(null);
                    if (isStreaming && !streamingSection) onStreamingDone?.();
                  }}
                />
              ) : (
                <>
                  <EditableBlock
                    value={resumeExecutif}
                    className="text-[15px] leading-7 text-panora-text"
                    onCommit={(v) => updateWithEdit("resume", { resumeExecutif: v })}
                  />
                </>
              )}
            </div>}

            {!hiddenSections.has("financier") && <Hr />}

            {/* ── Conditions financieres ── */}
            {!hiddenSections.has("financier") && <div className="group">
              <SectionHeader
                title={sectionTitles.financier}
                meta={sectionStates.financier}
                isTargeted={targetSections.includes("financier")}
                onToggleTarget={() => toggleTargetSection("financier")}
                onTitleChange={(t) => handleTitleChange("financier", t)}
                onDelete={() => handleDeleteSection("financier")}
              />
              {sectionStates.financier.state === "regenerating" ? (
                <RegeneratingOverlay>
                  <div className="text-[15px] leading-7 text-panora-text mb-6">{conditionsFinancieres.analysisBefore}</div>
                  <div className="text-[15px] leading-7 text-panora-text">{conditionsFinancieres.analysisAfter}</div>
                </RegeneratingOverlay>
              ) : (isStreaming || streamingSection === "financier") ? (
                <>
                  <StreamingBlock
                    text={conditionsFinancieres.analysisBefore}
                    active
                    delay={streamingSection === "financier" ? 0 : resumeExecutif.length * 8 / 3}
                    className="text-[15px] leading-7 text-panora-text mb-6"
                  />

                  {/* Pricing cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {insurers.map((ins) => {
                      const pricing = ins.pricing ?? [];
                      return (
                        <div key={ins.id} className="border border-panora-border rounded-[8px] overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#faf8f5] border-b border-panora-border">
                            <InsurerLogo insurerId={ins.id} name={ins.name} size="sm" className="w-5 h-5 rounded-[3px]" />
                            <span className="text-[13px] font-semibold text-panora-text">{ins.name}</span>
                          </div>
                          <div className="p-4">
                            {pricing.length === 0 ? (
                              <p className="text-[13px] text-panora-text-muted">Aucune offre</p>
                            ) : (
                              <div className="space-y-3">
                                {pricing.map((formula, fIdx) => {
                                  const annual = splitPrice(formula.annual);
                                  return (
                                    <div key={fIdx} className={fIdx > 0 ? "pt-3 border-t border-panora-border" : ""}>
                                      <p className="text-[12px] font-medium text-panora-text-muted uppercase tracking-wide mb-1">{formula.formula}</p>
                                      <div className="flex items-baseline justify-between">
                                        <span className="text-[13px] text-panora-text-muted">Annuel</span>
                                        <span>
                                          <span className="text-[16px] font-semibold text-panora-text">{annual.amount}</span>
                                          {annual.period && <span className="text-[12px] text-panora-text-muted ml-0.5">{annual.period}</span>}
                                        </span>
                                      </div>
                                      {formula.monthly && (
                                        <div className="flex items-baseline justify-between mt-0.5">
                                          <span className="text-[13px] text-panora-text-muted">Mensuel</span>
                                          <span className="text-[13px] text-panora-text">{formula.monthly}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <StreamingBlock
                    text={conditionsFinancieres.analysisAfter}
                    active
                    delay={streamingSection === "financier" ? conditionsFinancieres.analysisBefore.length * 8 / 3 : (resumeExecutif.length + conditionsFinancieres.analysisBefore.length) * 8 / 3 + 200}
                    className="text-[15px] leading-7 text-panora-text"
                    onComplete={() => {
                      if (streamingSection === "financier") setStreamingSection(null);
                    }}
                  />
                </>
              ) : (
                <>
                  <EditableBlock
                    value={conditionsFinancieres.analysisBefore}
                    className="text-[15px] leading-7 text-panora-text mb-6"
                    onCommit={(v) => updateWithEdit("financier", { conditionsFinancieres: { ...conditionsFinancieres, analysisBefore: v } })}
                  />

                  {/* Pricing cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {insurers.map((ins) => {
                      const pricing = ins.pricing ?? [];
                      return (
                        <div key={ins.id} className="border border-panora-border rounded-[8px] overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#faf8f5] border-b border-panora-border">
                            <InsurerLogo insurerId={ins.id} name={ins.name} size="sm" className="w-5 h-5 rounded-[3px]" />
                            <span className="text-[13px] font-semibold text-panora-text">{ins.name}</span>
                          </div>
                          <div className="p-4">
                            {pricing.length === 0 ? (
                              <p className="text-[13px] text-panora-text-muted">Aucune offre</p>
                            ) : (
                              <div className="space-y-3">
                                {pricing.map((formula, fIdx) => {
                                  const annual = splitPrice(formula.annual);
                                  return (
                                    <div key={fIdx} className={fIdx > 0 ? "pt-3 border-t border-panora-border" : ""}>
                                      <p className="text-[12px] font-medium text-panora-text-muted uppercase tracking-wide mb-1">{formula.formula}</p>
                                      <div className="flex items-baseline justify-between">
                                        <span className="text-[13px] text-panora-text-muted">Annuel</span>
                                        <span>
                                          <span className="text-[16px] font-semibold text-panora-text">{annual.amount}</span>
                                          {annual.period && <span className="text-[12px] text-panora-text-muted ml-0.5">{annual.period}</span>}
                                        </span>
                                      </div>
                                      {formula.monthly && (
                                        <div className="flex items-baseline justify-between mt-0.5">
                                          <span className="text-[13px] text-panora-text-muted">Mensuel</span>
                                          <span className="text-[13px] text-panora-text">{formula.monthly}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <EditableBlock
                    value={conditionsFinancieres.analysisAfter}
                    className="text-[15px] leading-7 text-panora-text"
                    onCommit={(v) => updateWithEdit("financier", { conditionsFinancieres: { ...conditionsFinancieres, analysisAfter: v } })}
                  />
                </>
              )}
            </div>}

            {!hiddenSections.has("offre_analyse") && <Hr />}

            {/* ── Analyse par offre ── */}
            {!hiddenSections.has("offre_analyse") && <div className="group">
              <SectionHeader
                title={sectionTitles.offre_analyse}
                meta={sectionStates.offre_analyse}
                isTargeted={targetSections.includes("offre_analyse")}
                onToggleTarget={() => toggleTargetSection("offre_analyse")}
                onTitleChange={(t) => handleTitleChange("offre_analyse", t)}
                onDelete={() => handleDeleteSection("offre_analyse")}
              />
              {sectionStates.offre_analyse.state === "regenerating" ? (
                <RegeneratingOverlay>
                  <div className="space-y-4">
                    {analyseParOffre.map((item) => (
                      <div key={item.insurerId} className="border border-panora-border rounded-[8px] p-4">
                        <span className="text-[13px] font-semibold text-panora-text">{item.insurerName}</span>
                      </div>
                    ))}
                  </div>
                </RegeneratingOverlay>
              ) : (
                <>
                  <div className="space-y-4">
                    {analyseParOffre.map((item, idx) => (
                      <div key={item.insurerId} className="border border-panora-border rounded-[8px] overflow-hidden">
                        {/* Insurer header */}
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#faf8f5] border-b border-panora-border">
                          <InsurerLogo insurerId={item.insurerId} name={item.insurerName} size="sm" className="w-5 h-5 rounded-[3px]" />
                          <h3 className="text-[13px] font-semibold text-panora-text">{item.insurerName}</h3>
                        </div>
                        {/* Points forts / faibles */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-panora-border">
                          <div className="p-4">
                            <p className="text-[12px] font-medium text-panora-green mb-2 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
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
                            <p className="text-[12px] font-medium text-[#952617] mb-2 flex items-center gap-1">
                              <XIcon className="w-3.5 h-3.5" />
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
                </>
              )}
            </div>}

            {!hiddenSections.has("garanties") && <Hr />}

            {/* ── Garanties cles ── */}
            {!hiddenSections.has("garanties") && <div className="group">
              <SectionHeader
                title={sectionTitles.garanties}
                meta={sectionStates.garanties}
                isTargeted={targetSections.includes("garanties")}
                onToggleTarget={() => toggleTargetSection("garanties")}
                onTitleChange={(t) => handleTitleChange("garanties", t)}
                onDelete={() => handleDeleteSection("garanties")}
              />
              {sectionStates.garanties.state === "regenerating" ? (
                <RegeneratingOverlay>
                  <div className="border border-panora-border rounded-[8px] p-4">
                    <span className="text-[13px] text-panora-text-muted">Garanties cles</span>
                  </div>
                </RegeneratingOverlay>
              ) : (
                <>
                  <div className="border border-panora-border rounded-[8px] overflow-hidden">
                    <div className="flex border-b border-panora-border bg-[#faf8f5]">
                      <div className="w-[200px] shrink-0 px-3 py-2.5 border-r border-panora-border">
                        <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wide">Garantie</span>
                      </div>
                      {insurers.map((ins) => (
                        <div key={ins.id} className="flex-1 px-3 py-2.5 border-r border-panora-border last:border-r-0">
                          <div className="flex items-center gap-1.5">
                            <InsurerLogo insurerId={ins.id} name={ins.name} size="sm" className="w-4 h-4 rounded-[2px]" />
                            <span className="text-[12px] font-medium text-panora-text">{ins.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {garantiesCles.map((row, rIdx) => {
                      const isSelected = selectedGarantie?.rowIndex === rIdx;
                      return (
                        <div key={rIdx} className={`flex group/row ${rIdx < garantiesCles.length - 1 ? "border-b border-panora-border" : ""}`}>
                          <div className="w-[200px] shrink-0 px-3 py-2.5 border-r border-panora-border flex items-center justify-between">
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
                                className={`flex-1 px-3 py-2.5 border-r border-panora-border last:border-r-0 cursor-pointer transition-colors ${
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
                    })}
                    <div className="border-t border-panora-border px-3 py-2 relative">
                      <button
                        onClick={() => setShowAddGuarantee(!showAddGuarantee)}
                        className="flex items-center gap-1.5 text-[12px] font-medium text-panora-green hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter une garantie
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
                </>
              )}
            </div>}

            {/* ── Note complementaire — end of document ── */}
            <Hr />
            <EditableBlock
              value={analysisData?.contextNoteAfter || ""}
              className="text-[14px] leading-6 text-panora-text-muted"
              placeholder="Ajouter une note complementaire..."
              onCommit={(v) => {
                if (analysisData) onUpdateAnalysis?.({ ...analysisData, contextNoteAfter: v });
              }}
            />

          </div>
        </div>

      </div>

      {/* Floating prompt bar — sticky to bottom of scroll container, aligned with doc */}
      <FloatingPromptBar
        targetSections={targetSections}
        sectionTitles={sectionTitles}
        onRemoveSection={(id) => setTargetSections((prev) => prev.filter((s) => s !== id))}
        onSubmit={handlePromptSubmit}
        onClear={() => setTargetSections([])}
        isRegenerating={isRegenerating}
      />
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
