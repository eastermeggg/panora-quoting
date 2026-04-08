"use client";

import { useState, useRef, useEffect } from "react";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { ComparisonCell } from "@/components/quoting/ComparisonCell";
import { Check, X as XIcon, ChevronDown, ChevronRight, Plus, Sparkles, Eye, EyeOff, Info, ArrowRight } from "lucide-react";
import type { InsurerData, ComparisonData, CellValue, CellIdentifier, CellDetail, ExclusionCellValue, ExclusionOrigin, ExclusionRow, AnalysisSyntheseItem } from "@/data/mock";

interface ComparisonTableProps {
  insurers: InsurerData[];
  comparisonData?: ComparisonData;
  /** Associated cotation param id — for linking back to quote flow */
  cotParamId?: string;
  selectedCell?: CellIdentifier | null;
  onCellSelect?: (cell: CellIdentifier) => void;
  onAddExclusion?: () => string;
  onUpdateExclusionLabel?: (exclusionId: string, label: string) => void;
  onDiscardExclusion?: (exclusionId: string) => void;
  cellDisplayModes?: Record<string, boolean>;
  syntheseData?: AnalysisSyntheseItem[];
  onUpdateSynthese?: (updated: AnalysisSyntheseItem[]) => void;
  onViewAnalysis?: () => void;
  onOpenProfile?: () => void;
  isStreaming?: boolean;
  onStreamingDone?: () => void;
  /** When false, shows empty state in synthese row prompting user to complete the profile */
  hasClientProfile?: boolean;
}

function cellIdKey(c: CellIdentifier): string {
  if (c.type === "guarantee") return `g-${c.sectionIndex}-${c.rowIndex}-${c.insurerId}`;
  if (c.type === "price") return `p-${c.insurerId}`;
  return `e-${c.exclusionId}-${c.insurerId}`;
}

function deriveKeyDetail(
  cellValue: { type: string; value?: string } | null | undefined,
  detail: CellDetail | null | undefined,
): { text: string; isPrice: boolean } | null {
  if (cellValue?.type === "text" && cellValue.value) return null;
  if (detail?.subLimits?.[0]) {
    const sl = detail.subLimits[0];
    return { text: `${sl.label} : ${sl.value}`, isPrice: false };
  }
  if (detail?.pricingRows?.[0]) {
    return { text: detail.pricingRows[0].price, isPrice: true };
  }
  return null;
}

/** Returns true when a string contains a number, currency, or unit (e.g. "1 500 €", "30 jours", "Illimité"). */
function hasNumericContent(s: string): boolean {
  return /\d/.test(s) || /illimité/i.test(s);
}

function cellIdEquals(a: CellIdentifier | null | undefined, b: CellIdentifier): boolean {
  if (!a) return false;
  if (a.type !== b.type) return false;
  if (a.type === "guarantee" && b.type === "guarantee") {
    return a.sectionIndex === b.sectionIndex && a.rowIndex === b.rowIndex && a.insurerId === b.insurerId;
  }
  if (a.type === "price" && b.type === "price") {
    return a.insurerId === b.insurerId;
  }
  if (a.type === "exclusion" && b.type === "exclusion") {
    return a.exclusionId === b.exclusionId && a.insurerId === b.insurerId;
  }
  return false;
}

/** Splits "810,52 €/an" into { amount: "810,52 €", period: "/ an" } */
function splitPrice(raw: string): { amount: string; period: string } {
  const m = raw.match(/^(.+?)\s*\/\s*(.+)$/);
  if (m) return { amount: m[1].trim(), period: `/ ${m[2].trim()}` };
  return { amount: raw, period: "" };
}

function PriceLine({ label, value }: { label: string; value: string }) {
  const { amount, period } = splitPrice(value);
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[13px] leading-5 text-panora-text-muted">{label}</span>
      <span className="whitespace-nowrap">
        <span className="text-[15px] font-semibold leading-6 text-panora-text">{amount}</span>
        {period && <span className="text-[13px] leading-5 text-panora-text-muted"> {period}</span>}
      </span>
    </div>
  );
}

function CellBadge({ cell }: { cell: CellValue }) {
  if (cell.type === "check") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#dbeee5]">
        <Check className="w-3.5 h-3.5 text-panora-green" />
      </span>
    );
  }
  if (cell.type === "cross") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#fde8e8]">
        <XIcon className="w-3.5 h-3.5 text-[#952617]" />
      </span>
    );
  }
  if (cell.type === "text") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#dbeee5]">
          <Check className="w-3.5 h-3.5 text-panora-green" />
        </span>
        <span className={`text-[13px] text-panora-text ${hasNumericContent(cell.value) ? "font-medium" : ""}`}>{cell.value}</span>
      </span>
    );
  }
  return <span className="text-[13px] text-panora-text-muted">—</span>;
}

function ExclusionCellBadge({ cell }: { cell: ExclusionCellValue }) {
  if (cell.type === "exclu") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#fde8e8] text-[13px] font-bold text-[#952617] leading-none">!</span>
    );
  }
  if (cell.type === "inclus") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#dbeee5]">
        <Check className="w-3.5 h-3.5 text-panora-green" />
      </span>
    );
  }
  if (cell.type === "exclu-text") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#fde8e8] text-[13px] font-bold text-[#952617] leading-none">!</span>
        <span className="text-[13px] text-[#952617]">{cell.value}</span>
      </span>
    );
  }
  return <span className="text-[13px] text-panora-text-muted">—</span>;
}


function ShowHideToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
    setLocked(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLocked(false), 600);
  };

  // When locked, suppress the hover→EyeOff swap
  const showHoverEffect = shown && !locked;

  return (
    <span className="relative group/eye">
      <button
        onClick={handleClick}
        className={`flex items-center justify-center p-[3px] rounded-[4px] shrink-0 w-[22px] h-[22px] transition-all ${
          shown
            ? showHoverEffect
              ? "bg-white border border-[#d4d2cc] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#faf8f5]"
              : "bg-white border border-[#d4d2cc] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            : "bg-[#eae7e0] opacity-0 group-hover/row:opacity-100"
        }`}
      >
        {shown ? (
          showHoverEffect ? (
            <>
              <Eye className="w-3.5 h-3.5 text-panora-green group-hover/eye:hidden" />
              <EyeOff className="w-3.5 h-3.5 text-panora-text-muted hidden group-hover/eye:block" />
            </>
          ) : (
            <Eye className="w-3.5 h-3.5 text-panora-green" />
          )
        ) : (
          <Eye className="w-3.5 h-3.5 text-panora-text-muted" />
        )}
      </button>
      {showHoverEffect && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-[140px] px-2.5 py-1.5 rounded-[6px] bg-panora-text text-white text-[11px] leading-[15px] opacity-0 pointer-events-none group-hover/eye:opacity-100 transition-opacity z-20 text-center">
          Visible au client — cliquer pour masquer
        </span>
      )}
    </span>
  );
}

export function ComparisonTable({ insurers, comparisonData, selectedCell, onCellSelect, onAddExclusion, onUpdateExclusionLabel, onDiscardExclusion, cellDisplayModes, syntheseData, onUpdateSynthese, onViewAnalysis, onOpenProfile, isStreaming, onStreamingDone, hasClientProfile = true }: ComparisonTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [shownRows, setShownRows] = useState<Set<string>>(new Set());
  const [pricingMode, setPricingMode] = useState<"ht" | "ttc">("ttc");
  const [showAnnual, setShowAnnual] = useState(true);
  const [syntheseCollapsed, setSyntheseCollapsed] = useState(false);

  const toggleRowVisibility = (rowKey: string) => {
    setShownRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const isGuaranteeRowActive = (sIdx: number, rIdx: number) =>
    selectedCell?.type === "guarantee" && selectedCell.sectionIndex === sIdx && selectedCell.rowIndex === rIdx;

  const isExclusionRowActive = (exclusionId: string) =>
    selectedCell?.type === "exclusion" && selectedCell.exclusionId === exclusionId;

  const isPriceRowActive = selectedCell?.type === "price";

  const colClass = "w-[300px]";

  // Group exclusions by origin
  const exclusionsByOrigin = (origin: ExclusionOrigin) =>
    (comparisonData?.exclusions ?? []).filter((r) => r.origin === origin);

  return (
    <div className="bg-white border-b border-panora-border">
      {/* Sticky insurer header row */}
      <div className="flex border-b border-panora-border sticky top-0 z-10 bg-white">
        <div className="w-[250px] shrink-0 border-r border-panora-border" />
        {insurers.map((ins) => {
          const offerCount = ins.pricing?.length ?? 0;
          return (
            <div
              key={ins.id}
              className={`${colClass} shrink-0 px-3 py-3 border-r border-panora-border`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InsurerLogo insurerId={ins.id} name={ins.name} size="sm" className="w-5 h-5 rounded-[3px]" />
                  <span className="text-[13px] font-semibold text-panora-text">{ins.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-panora-text-muted">
                    {offerCount}/{offerCount} offres affichées
                  </span>
                  <button className="text-[11px] font-medium text-panora-green">Gérer</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section: Synthese IA */}
      {(syntheseData && syntheseData.length > 0) || !hasClientProfile ? (
        <div>
          <div className="flex bg-[#f3f0ff] border-b border-panora-border h-[44px]">
            <div className="w-[250px] shrink-0 px-4 flex items-center gap-2 border-r border-panora-border">
              <button
                onClick={() => setSyntheseCollapsed(!syntheseCollapsed)}
                className="flex items-center justify-center p-1 rounded-[4px] bg-[#e8e4f3] shrink-0"
              >
                {syntheseCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-[#8b5cf6]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#8b5cf6]" />
                )}
              </button>
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#8b5cf6]" />
              <span className="text-[15px] font-semibold font-display text-[#22201a]">Synthese IA</span>
            </div>
            <div className="flex-1" />
          </div>
          {!syntheseCollapsed && (
            !hasClientProfile ? (
              /* Empty state: no client profile */
              <div className="flex items-center border-b border-panora-border bg-[#f7fbf9] px-5 py-4 gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-panora-green shrink-0" />
                <p className="text-[13px] font-medium text-panora-text flex-1">
                  Completez le profil client pour personnaliser la synthese
                </p>
                <button
                  onClick={onOpenProfile}
                  className="btn-primary flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium shrink-0"
                >
                  Renseigner le profil client
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex border-b border-panora-border">
                <div className="w-[250px] shrink-0 px-4 py-4 border-r border-panora-border">
                  <p className="text-[12px] text-panora-text-muted leading-[18px]">
                    La synthese est generee a partir des devis et du{" "}
                    <button onClick={onOpenProfile} className="text-panora-green font-medium hover:underline">profil client</button>{" "}
                    que vous pouvez modifier.
                  </p>
                </div>
                {insurers.map((ins, insIdx) => {
                  const item = syntheseData?.find((s) => s.insurerId === ins.id);
                  return (
                    <div key={ins.id} className={`${colClass} shrink-0 px-3 py-3 border-r border-panora-border`}>
                      {item ? (
                        <SyntheseCell
                          item={item}
                          onUpdate={(updated) => {
                            const next = (syntheseData ?? []).map((s) => s.insurerId === ins.id ? updated : s);
                            onUpdateSynthese?.(next);
                          }}
                          onViewAnalysis={onViewAnalysis}
                          isStreaming={isStreaming}
                          streamDelay={insIdx * 400}
                          onStreamingDone={insIdx === insurers.length - 1 ? onStreamingDone : undefined}
                        />
                      ) : (
                        <span className="text-[13px] text-panora-text-muted">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}
          <SectionDivider />
        </div>
      ) : null}

      {/* Section: Conditions générales — single Prix row, sub-offers inside cells */}
      <SectionHeader title="Conditions générales" />
      <div className="flex border-b border-panora-border">
        {/* Left label */}
        <div className={`w-[250px] shrink-0 px-4 py-4 border-r border-panora-border flex flex-col gap-2.5 relative ${isPriceRowActive ? "bg-[linear-gradient(to_right,#ebf3ef_0%,white_20%)]" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-[22px] h-[22px] rounded-[4px] bg-[#eae7e0] flex items-center justify-center text-[10px] text-panora-text font-bold">€</span>
              <span className="text-[13px] font-medium text-panora-text">Prix</span>
              <Info className="w-3.5 h-3.5 text-panora-text-muted" />
            </div>
            {/* HT / TTC switcher */}
            <div className="flex items-center gap-[2px] bg-[#eae7e0] rounded-[6px] p-[2px]">
              <button
                onClick={(e) => { e.stopPropagation(); setPricingMode("ht"); }}
                className={`px-1.5 py-[2px] rounded-[6px] text-[12px] font-medium leading-4 transition-colors ${
                  pricingMode === "ht"
                    ? "bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-panora-text"
                    : "text-panora-text-muted"
                }`}
              >
                HT
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPricingMode("ttc"); }}
                className={`px-1.5 py-[2px] rounded-[6px] text-[12px] font-medium leading-4 transition-colors ${
                  pricingMode === "ttc"
                    ? "bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-panora-text"
                    : "text-panora-text-muted"
                }`}
              >
                TTC
              </button>
            </div>
          </div>
          {/* Annual toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowAnnual(!showAnnual); }}
              className={`relative w-[28px] h-[16px] rounded-full transition-colors ${showAnnual ? "bg-panora-green" : "bg-[#d1d1d1]"}`}
            >
              <span className={`absolute top-[2px] w-[12px] h-[12px] rounded-full bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.15)] transition-transform ${showAnnual ? "left-[14px]" : "left-[2px]"}`} />
            </button>
            <span className="text-[13px] text-panora-text-muted">Prix annuel</span>
          </div>
          {isPriceRowActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-panora-green rounded-r-sm" />}
        </div>

        {/* One cell per insurer — all sub-offers inside */}
        {insurers.map((ins) => {
          const pricing = ins.pricing ?? [];
          const cellId: CellIdentifier = { type: "price", insurerId: ins.id };
          const isSelected = cellIdEquals(selectedCell, cellId);

          return (
            <ComparisonCell
              key={ins.id}
              isSelected={isSelected}
              onClick={() => onCellSelect?.(cellId)}
              className={`${colClass} shrink-0 px-3 py-3 border-r border-panora-border`}
            >
              {pricing.length === 0 ? (
                <span className="text-[13px] text-panora-text-muted">—</span>
              ) : (
                <div className="flex flex-col gap-2">
                  {pricing.map((formula, fIdx) => {
                    const key = `${ins.id}-${fIdx}`;
                    const isOpen = expanded[key] ?? (fIdx === 0);
                    return (
                      <div key={fIdx} className="flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(key);
                          }}
                          className="flex items-center gap-[5px] text-[12px] font-medium text-panora-green tracking-[0.12px] leading-6"
                        >
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="truncate">{formula.formula}</span>
                        </button>
                        {isOpen && (
                          <div className="space-y-0.5">
                            <PriceLine label={`${ins.name} net`} value={formula.annual} />
                            {formula.monthly && (
                              <PriceLine label="Mensuel" value={formula.monthly} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ComparisonCell>
          );
        })}
      </div>

      {/* Separator */}
      <SectionDivider />

      {/* Guarantee sections */}
      {comparisonData?.sections.map((section, sIdx) => (
        <div key={sIdx}>
          <SectionHeader title={section.title} />
          {section.rows.map((row, rIdx) => {
            const rowKey = `gua-${sIdx}-${rIdx}`;
            const rowActive = isGuaranteeRowActive(sIdx, rIdx);
            const rowShown = shownRows.has(rowKey);
            return (
            <div key={rIdx} className="flex border-b border-panora-border group/row">
              <div className={`w-[250px] shrink-0 px-4 py-3.5 border-r border-panora-border flex items-center gap-2.5 relative ${rowActive ? "bg-[linear-gradient(to_right,#ebf3ef_0%,white_20%)]" : ""}`}>
                <span className={`text-[13px] leading-[20px] flex-1 min-w-0 truncate text-panora-text`}>{row.label}</span>
                <ShowHideToggle shown={rowShown} onToggle={() => toggleRowVisibility(rowKey)} />
                {rowActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-panora-green rounded-r-sm" />}
              </div>
              {insurers.map((ins) => {
                const cell = row.values[ins.id] ?? { type: "empty" as const };
                const cellId: CellIdentifier = { type: "guarantee", sectionIndex: sIdx, rowIndex: rIdx, insurerId: ins.id };
                const isSelected = cellIdEquals(selectedCell, cellId);
                const showDetail = cellDisplayModes?.[cellIdKey(cellId)];
                const keyDetail = showDetail ? deriveKeyDetail(cell, row.details?.[ins.id] ?? null) : null;

                return (
                  <ComparisonCell
                    key={ins.id}
                    isSelected={isSelected}
                    onClick={() => onCellSelect?.(cellId)}
                    className={`${colClass} shrink-0 px-3 py-3.5 border-r border-panora-border flex items-center`}
                  >
                    {keyDetail ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CellBadge cell={cell} />
                        <span className={`text-[13px] text-panora-text truncate max-w-[180px] ${keyDetail.isPrice || hasNumericContent(keyDetail.text) ? "font-medium" : ""}`}>{keyDetail.text}</span>
                      </span>
                    ) : (
                      <CellBadge cell={cell} />
                    )}
                  </ComparisonCell>
                );
              })}
            </div>
            );
          })}
          <SectionDivider />
        </div>
      ))}

      {/* Exclusions section */}
      {comparisonData?.exclusions && comparisonData.exclusions.length > 0 && (() => {
        const deterministicRows = exclusionsByOrigin("deterministic");
        const aiRows = exclusionsByOrigin("ai");
        const manualRows = exclusionsByOrigin("manual");
        const aiGroupKey = "excl-group-ai";
        const isAiExpanded = expanded[aiGroupKey] ?? (aiRows.length <= 5);

        const renderExclusionRow = (row: ExclusionRow) => {
          const exclRowActive = isExclusionRowActive(row.id);
          const exclRowShown = shownRows.has(`excl-${row.id}`);
          return (
            <div key={row.id} className="flex border-b border-panora-border group/row">
              <div
                className={`w-[250px] shrink-0 px-4 py-3.5 border-r border-panora-border transition-colors flex items-center gap-2.5 relative ${
                  editingRowId === row.id
                    ? "bg-[#f0f7f4] ring-1 ring-inset ring-panora-green/30"
                    : exclRowActive
                      ? "bg-[linear-gradient(to_right,#ebf3ef_0%,white_20%)]"
                      : ""
                }`}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingRowId(row.id);
                }}
              >
                {editingRowId === row.id ? (
                  <InlineExclusionInput
                    initialValue={row.label}
                    onCommit={(value) => {
                      setEditingRowId(null);
                      if (value.trim()) {
                        onUpdateExclusionLabel?.(row.id, value.trim());
                      } else if (row.origin === "manual" && !row.label) {
                        onDiscardExclusion?.(row.id);
                      }
                    }}
                    onDiscard={() => {
                      setEditingRowId(null);
                      if (row.origin === "manual" && !row.label) onDiscardExclusion?.(row.id);
                    }}
                  />
                ) : (
                  <>
                    <span className={`text-[13px] leading-[20px] flex-1 min-w-0 truncate cursor-text ${exclRowActive ? "font-medium" : ""} ${row.label ? "text-panora-text" : "text-panora-text-muted"}`}>{row.label || "Sans titre"}</span>
                    <ShowHideToggle shown={exclRowShown} onToggle={() => toggleRowVisibility(`excl-${row.id}`)} />
                  </>
                )}
                {exclRowActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-panora-green rounded-r-sm" />}
              </div>
              {insurers.map((ins) => {
                const cell = row.values[ins.id] ?? { type: "empty" as const };
                const cellId: CellIdentifier = { type: "exclusion", exclusionId: row.id, insurerId: ins.id };
                const isSelected = cellIdEquals(selectedCell, cellId);

                return (
                  <ComparisonCell
                    key={ins.id}
                    isSelected={isSelected}
                    onClick={() => onCellSelect?.(cellId)}
                    className={`${colClass} shrink-0 px-3 py-3.5 border-r border-panora-border flex items-center`}
                  >
                    <ExclusionCellBadge cell={cell} />
                  </ComparisonCell>
                );
              })}
            </div>
          );
        };

        return (
          <div>
            <SectionHeader title="Exclusions" variant="destructive" />
            <SectionDivider />

            {/* Deterministic rows — flat, no sub-group */}
            {deterministicRows.map(renderExclusionRow)}

            {/* AI sub-group — collapsible */}
            {aiRows.length > 0 && (
              <div>
                <div className="flex bg-[#faf8f5] border-b border-panora-border h-[46px]">
                  <div className="w-[250px] shrink-0 px-4 flex items-center gap-2 border-r border-panora-border">
                    <button
                      onClick={() => toggle(aiGroupKey)}
                      className="flex items-center justify-center p-1 rounded-[4px] bg-[#eae7e0] shrink-0"
                    >
                      {isAiExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-panora-text" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-panora-text" />
                      )}
                    </button>
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#8b5cf6]" />
                    <span className="text-[13px] font-medium text-panora-text whitespace-nowrap">
                      {aiRows.length} autre{aiRows.length > 1 ? "s" : ""} exclusion{aiRows.length > 1 ? "s" : ""} détectée{aiRows.length > 1 ? "s" : ""} par l&apos;IA
                    </span>
                  </div>
                  <div className="flex-1" />
                </div>
                {isAiExpanded && aiRows.map(renderExclusionRow)}
              </div>
            )}

            {/* "Ajouter une exclusion manuelle" — inline action row */}
            <div
              className="flex border-b border-panora-border hover:bg-panora-bg/30 transition-colors cursor-pointer"
              onClick={() => {
                if (onAddExclusion) {
                  const newId = onAddExclusion();
                  setEditingRowId(newId);
                }
              }}
            >
              <div className="w-[250px] shrink-0 px-4 py-3 border-r border-panora-border">
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-panora-green">
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter une exclusion manuelle
                </span>
              </div>
              <div className="flex-1" />
            </div>

            {/* Manual rows — flat, below the action row */}
            {manualRows.map(renderExclusionRow)}

            <SectionDivider />
          </div>
        );
      })()}
    </div>
  );
}

function InlineExclusionInput({
  initialValue,
  onCommit,
  onDiscard,
}: {
  initialValue?: string;
  onCommit: (value: string) => void;
  onDiscard: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
      // Place cursor at end for existing text
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, []);

  const commit = (value: string) => {
    if (committedRef.current) return;
    committedRef.current = true;
    onCommit(value);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={initialValue ?? ""}
      placeholder="Sans titre"
      className="text-[13px] text-panora-text leading-[18px] w-full bg-transparent outline-none placeholder:text-panora-text-muted"
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit(e.currentTarget.value);
        } else if (e.key === "Escape") {
          committedRef.current = true;
          onDiscard();
        }
      }}
    />
  );
}

function parseContentEditable(el: HTMLElement): string[] {
  return (el.innerText ?? "").split("\n").map((l) => l.replace(/^[\s•\-–+]\s*/, "").trim()).filter(Boolean);
}

function StreamingText({
  text,
  active,
  delay = 0,
  speed = 18,
  onDone,
  className,
}: {
  text: string;
  active: boolean;
  delay?: number;
  speed?: number;
  onDone?: () => void;
  className?: string;
}) {
  const [charCount, setCharCount] = useState(text.length);
  const [started, setStarted] = useState(false);

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
        i++;
        setCharCount(i);
        if (i >= text.length) {
          clearInterval(interval);
          onDone?.();
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(delayTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (active && !started) {
    return <span className={className} />;
  }

  const displayed = active ? text.slice(0, charCount) : text;
  const showCursor = active && charCount < text.length;

  return (
    <span className={className}>
      {displayed}
      {showCursor && <span className="inline-block w-[5px] h-[12px] bg-[#8b5cf6]/60 ml-[1px] animate-pulse rounded-sm align-middle" />}
    </span>
  );
}

function SyntheseCell({
  item,
  onUpdate,
  onViewAnalysis,
  isStreaming,
  streamDelay = 0,
  onStreamingDone,
}: {
  item: AnalysisSyntheseItem;
  onUpdate: (updated: AnalysisSyntheseItem) => void;
  onViewAnalysis?: () => void;
  isStreaming?: boolean;
  streamDelay?: number;
  onStreamingDone?: () => void;
}) {
  const fortsRef = useRef<HTMLDivElement>(null);
  const faiblesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fortsText = item.pointsForts.join("\n");
  const faiblesText = item.pointsFaibles.join("\n");

  // Track which sections have finished streaming
  const [fortsDone, setFortsDone] = useState(false);
  const [faiblesDone, setFaiblesDone] = useState(false);

  useEffect(() => {
    if (isStreaming) {
      setFortsDone(false);
      setFaiblesDone(false);
    }
  }, [isStreaming]);

  useEffect(() => {
    if (isStreaming && fortsDone && faiblesDone) {
      onStreamingDone?.();
    }
  }, [isStreaming, fortsDone, faiblesDone, onStreamingDone]);

  const commitForts = () => {
    if (!fortsRef.current) return;
    const lines = parseContentEditable(fortsRef.current);
    if (lines.join("|") !== item.pointsForts.join("|")) {
      onUpdate({ ...item, pointsForts: lines });
    }
  };

  const commitFaibles = () => {
    if (!faiblesRef.current) return;
    const lines = parseContentEditable(faiblesRef.current);
    if (lines.join("|") !== item.pointsFaibles.join("|")) {
      onUpdate({ ...item, pointsFaibles: lines });
    }
  };

  if (isStreaming) {
    return (
      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
        <div>
          <p className="text-[12px] font-medium text-panora-green mb-1">Points forts :</p>
          <div className="text-[12px] leading-[18px] text-panora-text whitespace-pre-wrap">
            <StreamingText
              text={fortsText}
              active
              delay={streamDelay}
              speed={15}
              onDone={() => setFortsDone(true)}
            />
          </div>
        </div>
        <div>
          <p className="text-[12px] font-medium text-[#952617] mb-1">Points faibles :</p>
          <div className="text-[12px] leading-[18px] text-panora-text whitespace-pre-wrap">
            <StreamingText
              text={faiblesText}
              active
              delay={streamDelay + fortsText.length * 15 + 200}
              speed={15}
              onDone={() => setFaiblesDone(true)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <div>
        <p className="text-[12px] font-medium text-panora-green mb-1">Points forts :</p>
        <div
          ref={fortsRef}
          contentEditable
          suppressContentEditableWarning
          className="text-[12px] leading-[18px] text-panora-text whitespace-pre-wrap outline-none"
          onBlur={commitForts}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {item.pointsForts.join("\n")}
        </div>
      </div>
      <div>
        <p className="text-[12px] font-medium text-[#952617] mb-1">Points faibles :</p>
        <div
          ref={faiblesRef}
          contentEditable
          suppressContentEditableWarning
          className="text-[12px] leading-[18px] text-panora-text whitespace-pre-wrap outline-none"
          onBlur={commitFaibles}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {item.pointsFaibles.join("\n")}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onViewAnalysis?.(); }}
        className="flex items-center gap-1 text-[12px] font-medium text-panora-green hover:underline"
      >
        Voir la synthese complete
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

function SectionHeader({ title, variant = "brand" }: { title: string; variant?: "brand" | "destructive" }) {
  const bg = variant === "destructive" ? "bg-[#fdf5f4]" : "bg-[#ebf3ef]";
  const textColor = variant === "destructive" ? "text-[#952617]" : "text-[#22201a]";
  return (
    <div className={`flex ${bg} border-b border-panora-border h-[44px]`}>
      <div className="w-[250px] shrink-0 px-4 flex items-center border-r border-panora-border">
        <span className={`text-[15px] font-semibold font-display ${textColor}`}>{title}</span>
      </div>
      <div className="flex-1" />
    </div>
  );
}

function SectionDivider() {
  return <div className="h-[4px] bg-white border-b border-panora-border" />;
}
