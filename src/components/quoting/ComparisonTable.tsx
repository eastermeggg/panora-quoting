"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { ComparisonCell } from "@/components/quoting/ComparisonCell";
import { Check, X as XIcon, ChevronDown, ChevronUp, ChevronRight, Plus, Eye, EyeOff, Info, ArrowRight, Sparkles, Search } from "lucide-react";
import type { InsurerData, ComparisonData, CellValue, CellIdentifier, CellDetail, ExclusionCellValue, ExclusionOrigin, ExclusionRow, AnalysisSyntheseItem, DynamicFieldValues, FleetEntity } from "@/data/mock";

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
  /** Current dynamic field values for rate computation */
  dynamicFieldValues?: DynamicFieldValues;
  /** Fleet view mode — controlled by parent for multi-entity products */
  fleetViewMode?: "garanties" | "tarifs";
  onFleetViewChange?: (mode: "garanties" | "tarifs") => void;
  /** Principal product name — drives layout variants (e.g. columnar pricing for Santé) */
  principalProduct?: string | null;
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

/** Format a number as French currency, e.g. 15170 → "15 170 €" */
function formatEur(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

/** Format a rate as percentage, e.g. 0.0185 → "1,85%" */
function formatRate(rate: number): string {
  return (rate * 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
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
      <span className="text-[13px] leading-5 text-panora-text-muted truncate min-w-0">{label}</span>
      <span className="whitespace-nowrap ml-2 shrink-0">
        <span className="text-[13px] font-medium leading-5 text-panora-text">{amount}</span>
        {period && <span className="text-[13px] leading-5 text-panora-text-muted"> {period}</span>}
      </span>
    </div>
  );
}

function PriceLineStacked({ label, value }: { label: string; value: string }) {
  const { amount, period } = splitPrice(value);
  return (
    <div className="flex flex-col">
      <span className="text-[13px] leading-5 text-panora-text-muted">{label}</span>
      <span>
        <span className="text-[13px] font-medium leading-5 text-panora-text">{amount}</span>
        {period && <span className="text-[13px] leading-5 text-panora-text-muted"> {period}</span>}
      </span>
    </div>
  );
}

function SubOfferDropdown({ label, isOpen, onToggle, showCaret = true, onHide }: { label: string; isOpen: boolean; onToggle: (e: React.MouseEvent) => void; showCaret?: boolean; onHide?: (e: React.MouseEvent) => void }) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center h-6 w-full border border-panora-border rounded-[5px] overflow-hidden group/dropdown ${showCaret ? "cursor-pointer" : "cursor-default"}`}
    >
      {showCaret && (
        <span className="flex items-center justify-center w-6 h-6 bg-[#faf8f5] border-r border-panora-border shrink-0">
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-panora-text" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-panora-text" />
          )}
        </span>
      )}
      <span className="flex-1 min-w-0 h-6 flex items-center gap-2.5 px-1.5 bg-[#faf8f5]">
        <span className="text-[12px] font-medium leading-4 text-panora-text truncate flex-1 min-w-0">{label}</span>
        {onHide && (
          <button
            onClick={onHide}
            className="shrink-0 opacity-0 group-hover/dropdown:opacity-100 transition-opacity cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5 text-panora-text-muted" />
          </button>
        )}
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

function OfferFilterDropdown({
  insurerId,
  formulas,
  hiddenOffers,
  onToggle,
  shown,
  total,
}: {
  insurerId: string;
  formulas: string[];
  hiddenOffers: Set<number>;
  onToggle: (fIdx: number) => void;
  shown: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger — styled as a visible button with border + shadow */}
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-2.5 py-[5px] rounded-[8px] border text-left cursor-pointer transition-all ${
          open
            ? "border-panora-green/40 bg-[#f0f9f5] shadow-[0px_0px_0px_2px_rgba(0,162,114,0.1)]"
            : "border-[#e2dfd8] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:border-[#d4d2cc] hover:shadow-[0px_1px_3px_rgba(0,0,0,0.08)]"
        }`}
      >
        <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-[5px] rounded-[5px] bg-panora-green text-white text-[11px] font-bold leading-none">
          {shown}/{total}
        </span>
        <span className="text-[12px] font-medium text-panora-text">
          offres affichées
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-panora-text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-[280px] bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] z-30 overflow-hidden">
          <div className="px-3 py-2 border-b border-panora-border">
            <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-[0.5px]">Offres à afficher</span>
          </div>
          <div className="py-1 max-h-[260px] overflow-y-auto">
            {formulas.map((formula, fIdx) => {
              const isVisible = !hiddenOffers.has(fIdx);
              return (
                <button
                  key={fIdx}
                  onClick={(e) => { e.stopPropagation(); onToggle(fIdx); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#faf8f5] transition-colors"
                >
                  <span className={`w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                    isVisible ? "bg-panora-green border-panora-green" : "bg-white border-[#d4d2cc]"
                  }`}>
                    {isVisible && <Check className="w-[10px] h-[10px] text-white" strokeWidth={3} />}
                  </span>
                  <span className={`text-[13px] leading-[18px] min-w-0 ${isVisible ? "text-panora-text" : "text-panora-text-muted"}`}>{formula}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ComparisonTable({ insurers, comparisonData, selectedCell, onCellSelect, onAddExclusion, onUpdateExclusionLabel, onDiscardExclusion, cellDisplayModes, syntheseData, onUpdateSynthese, onViewAnalysis, onOpenProfile, isStreaming, onStreamingDone, hasClientProfile = true, dynamicFieldValues, fleetViewMode, onFleetViewChange, principalProduct }: ComparisonTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [shownRows, setShownRows] = useState<Set<string>>(new Set());
  const [pricingMode, setPricingMode] = useState<"ht" | "ttc">("ttc");
  const [showAnnual, setShowAnnual] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Columnar pricing layout for Santé products — sub-offers as columns instead of stacked
  const isColumnarPricing = principalProduct === "Santé collective";
  const subOfferColClass = "w-[191px]";
  // Helper: returns column class and optional style for an insurer cell in columnar mode
  const insurerColProps = (ins: InsurerData) => {
    if (!isColumnarPricing) return { className: colClass, style: undefined };
    const visibleFormulas = (ins.pricing ?? []).filter((_, fIdx) => isOfferVisible(ins.id, fIdx));
    const spanCount = Math.max(visibleFormulas.length, 1);
    return { className: "", style: { width: `${spanCount * 191}px` } as React.CSSProperties };
  };

  // Per-insurer hidden offers state — keyed by insurerId, value is Set of hidden formula indices
  const [hiddenOffers, setHiddenOffers] = useState<Record<string, Set<number>>>({});
  const toggleOffer = (insurerId: string, formulaIdx: number) => {
    setHiddenOffers((prev) => {
      const current = prev[insurerId] ?? new Set<number>();
      const next = new Set(current);
      if (next.has(formulaIdx)) next.delete(formulaIdx);
      else next.add(formulaIdx);
      return { ...prev, [insurerId]: next };
    });
  };
  const isOfferVisible = (insurerId: string, formulaIdx: number) =>
    !hiddenOffers[insurerId]?.has(formulaIdx);
  const visibleOfferCount = (ins: InsurerData) => {
    const total = ins.pricing?.length ?? 0;
    const hidden = hiddenOffers[ins.id]?.size ?? 0;
    return total - hidden;
  };

  // Multi-entity state
  const multiEntity = comparisonData?.multiEntity;
  const isMultiEntity = !!multiEntity;
  // Per-category selected entity
  const [selectedEntityPerCategory, setSelectedEntityPerCategory] = useState<Record<string, string>>({});

  // Group entities by category
  const entityCategories = useMemo(() => {
    if (!multiEntity) return [];
    const cats: { category: string; entities: FleetEntity[] }[] = [];
    for (const entity of multiEntity.entities) {
      const existing = cats.find((c) => c.category === entity.category);
      if (existing) existing.entities.push(entity);
      else cats.push({ category: entity.category, entities: [entity] });
    }
    return cats;
  }, [multiEntity]);
  const toggleSection = (key: string) => setCollapsedSections((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

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
        <div className="w-[250px] shrink-0 border-r border-panora-border flex items-center px-3">
          {isMultiEntity && (
            <div className="flex items-center gap-[2px] bg-[#eae7e0] rounded-[6px] p-[2px]">
              <button
                onClick={() => onFleetViewChange?.("garanties")}
                className={`px-1.5 py-[2px] rounded-[6px] text-[12px] font-medium leading-4 transition-colors ${
                  fleetViewMode === "garanties"
                    ? "bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-panora-text"
                    : "text-panora-text-muted"
                }`}
              >
                Garanties
              </button>
              <button
                onClick={() => onFleetViewChange?.("tarifs")}
                className={`px-1.5 py-[2px] rounded-[6px] text-[12px] font-medium leading-4 transition-colors ${
                  fleetViewMode === "tarifs"
                    ? "bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-panora-text"
                    : "text-panora-text-muted"
                }`}
              >
                Tarifs
              </button>
            </div>
          )}
        </div>
        {insurers.map((ins) => {
          const offerCount = ins.pricing?.length ?? 0;
          const shown = visibleOfferCount(ins);
          const icp = insurerColProps(ins);
          return (
            <div
              key={ins.id}
              className={`${icp.className} shrink-0 px-3 py-3 border-r border-panora-border`}
              style={icp.style}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InsurerLogo insurerId={ins.id} name={ins.name} size="sm" className="w-5 h-5 rounded-[3px]" />
                  <span className="text-[13px] font-semibold text-panora-text">{ins.name}</span>
                </div>
                {offerCount > 1 && (
                  <span className="text-[11px] text-panora-text-muted">{shown}/{offerCount} offres</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic fields banner — shown when rate products exist but dynamic field data is incomplete */}
      {comparisonData?.rateProducts && comparisonData.rateProducts.length > 0 && comparisonData.dynamicFields && (() => {
        const emptyFields = comparisonData.dynamicFields!.filter((f) => f.type === "number" && dynamicFieldValues?.[f.id] === undefined);
        const hasRates = comparisonData.rateProducts!.some((rp) => rp.subGroups.some((sg) => sg.rows.some((r) => Object.keys(r.rates).length > 0)));
        if (emptyFields.length === 0 || !hasRates) return null;
        const isHeadcount = comparisonData.rateProducts!.some((rp) => rp.rateUnit === "eur_per_person_month");
        const bannerText = isHeadcount
          ? "Renseignez les effectifs par régime pour voir le coût total annuel."
          : "Renseignez la masse salariale pour afficher les cotisations en euros.";
        return (
          <div className="border-b border-[#e8c88a] bg-[#fdf6e9] px-5 py-3 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#cb8052]/20 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[#cb8052]">!</span>
            </div>
            <p className="text-[13px] text-[#8b6914] flex-1">
              {bannerText}
            </p>
            <button
              onClick={onOpenProfile}
              className="text-[13px] font-medium text-[#cb8052] hover:underline shrink-0 flex items-center gap-1"
            >
              Compléter
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {/* Section: Synthese IA — hidden for demo */}

      {/* Section: Synthèse parc auto — both views for multi-entity */}
      {isMultiEntity && multiEntity && (
        <FleetSynthesisSection
          multiEntity={multiEntity}
          insurers={insurers}
          colClass={colClass}
          pricingMode={pricingMode}
          setPricingMode={setPricingMode}
          showAnnual={showAnnual}
          setShowAnnual={setShowAnnual}
          collapsedSections={collapsedSections}
          toggleSection={toggleSection}
        />
      )}

      {/* Section: Conditions financières — per-insurer cell pricing with offer filtering */}
      {!isMultiEntity && <SectionHeader
        title={comparisonData?.synthesisLabel ?? "Conditions financières"}
        collapsed={collapsedSections.has("conditions")}
        onToggle={() => toggleSection("conditions")}
      />}

      {/* Offer filter row — one dropdown per insurer, shown when any insurer has >1 offer */}
      {!isMultiEntity && !collapsedSections.has("conditions") && insurers.some((ins) => (ins.pricing?.length ?? 0) > 1) && (
        <div className="flex border-b border-panora-border bg-[#faf8f5]">
          <div className="w-[250px] shrink-0 px-4 py-2.5 border-r border-panora-border flex items-center">
            <span className="text-[12px] text-panora-text-muted">Offres affichées</span>
          </div>
          {insurers.map((ins) => {
            const pricing = ins.pricing ?? [];
            const total = pricing.length;
            const shown = visibleOfferCount(ins);
            const icp = insurerColProps(ins);
            return (
              <div
                key={ins.id}
                className={`${icp.className} shrink-0 px-4 py-2.5 border-r border-panora-border`}
                style={icp.style}
              >
                {total > 1 ? (
                  <OfferFilterDropdown
                    insurerId={ins.id}
                    formulas={pricing.map((p) => p.formula)}
                    hiddenOffers={hiddenOffers[ins.id] ?? new Set()}
                    onToggle={(fIdx) => toggleOffer(ins.id, fIdx)}
                    shown={shown}
                    total={total}
                  />
                ) : (
                  <span className="text-[12px] text-panora-text-muted">—</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isMultiEntity && !collapsedSections.has("conditions") && <div className="flex border-b border-panora-border">
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

        {/* One cell per insurer — show only visible offers */}
        {insurers.map((ins) => {
          const pricing = ins.pricing ?? [];
          const cellId: CellIdentifier = { type: "price", insurerId: ins.id };
          const isSelected = cellIdEquals(selectedCell, cellId);
          const visibleFormulas = pricing.filter((_, fIdx) => isOfferVisible(ins.id, fIdx));

          if (isColumnarPricing) {
            // Columnar layout: each sub-offer is its own column
            // Track original indices for toggling visibility
            const visibleWithIdx = pricing
              .map((f, idx) => ({ formula: f, originalIdx: idx }))
              .filter(({ originalIdx }) => isOfferVisible(ins.id, originalIdx));

            return visibleWithIdx.length === 0 ? (
              <div key={ins.id} className={`${subOfferColClass} shrink-0 px-4 py-3 border-r border-panora-border`}>
                <span className="text-[13px] text-panora-text-muted italic">Aucune offre</span>
              </div>
            ) : (
              visibleWithIdx.map(({ formula, originalIdx }) => (
                <ComparisonCell
                  key={`${ins.id}-${originalIdx}`}
                  isSelected={isSelected}
                  onClick={() => onCellSelect?.(cellId)}
                  className={`${subOfferColClass} shrink-0 border-r border-panora-border group/suboffer`}
                >
                  <div className="flex flex-col gap-2 p-4">
                    <SubOfferDropdown
                      label={formula.formula}
                      isOpen={true}
                      onToggle={(e) => e.stopPropagation()}
                      showCaret={false}
                      onHide={(e) => { e.stopPropagation(); toggleOffer(ins.id, originalIdx); }}
                    />
                    <div className="flex flex-col gap-1 px-px">
                      {formula.details.map((d, di) => (
                        <PriceLineStacked key={di} label={d.label} value={d.value} />
                      ))}
                    </div>
                  </div>
                </ComparisonCell>
              ))
            );
          }

          return (
            <ComparisonCell
              key={ins.id}
              isSelected={isSelected}
              onClick={() => onCellSelect?.(cellId)}
              className={`${colClass} shrink-0 border-r border-panora-border`}
            >
              {visibleFormulas.length === 0 ? (
                <span className="text-[13px] text-panora-text-muted italic px-4 py-3">Aucune offre sélectionnée</span>
              ) : (
                <div className="flex flex-col">
                  {visibleFormulas.map((formula, vIdx) => {
                    const key = `${ins.id}-${formula.formula}`;
                    const isOpen = expanded[key] ?? (vIdx === 0);
                    return (
                      <div key={vIdx} className={`flex flex-col gap-2 p-4 ${vIdx > 0 ? "border-t border-panora-border" : ""}`}>
                        <SubOfferDropdown
                          label={formula.formula}
                          isOpen={isOpen}
                          onToggle={(e) => { e.stopPropagation(); toggle(key); }}
                        />
                        {isOpen && (
                          <div className="flex flex-col gap-1 px-px">
                            {formula.details.map((d, di) => (
                              <PriceLine key={di} label={d.label} value={d.value} />
                            ))}
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
      </div>}

      {/* Separator */}
      {!isMultiEntity && <SectionDivider />}

      {/* Multi-entity tarifs: entity rows with prices per category */}
      {isMultiEntity && multiEntity && fleetViewMode === "tarifs" && (
        entityCategories.map((cat, catIdx) => (
          <div key={cat.category}>
            {/* Category header */}
            <div className="flex items-center gap-2 px-4 border-b border-panora-border h-[40px] bg-[#faf8f5]">
              <span className="text-[14px] font-semibold font-display text-panora-text tracking-[-0.2px]">{cat.category}</span>
              <span className="text-[12px] text-panora-text-muted">({cat.entities.length})</span>
            </div>
            {/* Entity rows with prices */}
            {cat.entities.map((entity) => (
              <div key={entity.id} className="flex border-b border-panora-border">
                <div className="w-[250px] shrink-0 px-4 py-3 border-r border-panora-border flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-panora-text truncate">{entity.name ?? entity.label}</span>
                  {entity.plate && <span className="text-[12px] text-panora-text-muted shrink-0">{entity.plate}</span>}
                </div>
                {insurers.map((ins) => {
                  const monthlyPrice = entity.pricingPerInsurer[ins.id];
                  if (monthlyPrice === undefined) return (
                    <div key={ins.id} className={`${colClass} shrink-0 px-3 py-3 border-r border-panora-border`}>
                      <span className="text-[13px] text-panora-text-muted">—</span>
                    </div>
                  );
                  const price = showAnnual ? monthlyPrice * 12 : monthlyPrice;
                  const period = showAnnual ? "/ an" : "/ mois";
                  return (
                    <div key={ins.id} className={`${colClass} shrink-0 px-3 py-3 border-r border-panora-border`}>
                      <span className="text-[13px] font-medium text-panora-text">
                        {formatEur(price)} <span className="font-normal text-panora-text-muted">{period}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
            <SectionDivider />
          </div>
        ))
      )}

      {/* Multi-entity garanties: guarantee rows repeated per category with entity selector */}
      {isMultiEntity && multiEntity && fleetViewMode === "garanties" && comparisonData?.products?.[0] && (
        entityCategories.map((cat, catIdx) => {
          const catEntities = cat.entities;
          const selectedId = selectedEntityPerCategory[cat.category] ?? catEntities[0]?.id;
          const selectedIdx = catEntities.findIndex((e) => e.id === selectedId);
          const currentEntity = catEntities[selectedIdx >= 0 ? selectedIdx : 0];

          let flatSectionIdx = 0;
          // Count sections from previous categories to offset correctly
          for (let ci = 0; ci < catIdx; ci++) {
            for (const p of comparisonData!.products) {
              flatSectionIdx += p.subGroups.length;
            }
          }

          return (
            <div key={cat.category}>
              {/* Category header with entity selector — matches product-level SectionHeader style */}
              <div className="flex items-center gap-3 px-4 border-b border-panora-border h-[56px] bg-[#faf8f5]">
                <span className="text-[14px] font-semibold font-display text-panora-text tracking-[-0.2px] shrink-0">{cat.category}</span>
                <div className="flex items-center gap-2">
                  {/* Custom dropdown with search */}
                  <EntitySelector
                    entities={catEntities}
                    selectedId={currentEntity?.id ?? catEntities[0]?.id ?? ""}
                    onSelect={(id) => setSelectedEntityPerCategory((prev) => ({ ...prev, [cat.category]: id }))}
                  />
                  {/* Up / down arrows — side by side */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => {
                        const prev = Math.max(0, (selectedIdx >= 0 ? selectedIdx : 0) - 1);
                        setSelectedEntityPerCategory((p) => ({ ...p, [cat.category]: catEntities[prev].id }));
                      }}
                      disabled={selectedIdx <= 0}
                      className="w-[22px] h-[22px] flex items-center justify-center rounded-[4px] disabled:opacity-30 hover:bg-[#eae7e0] transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5 text-panora-text-muted" />
                    </button>
                    <button
                      onClick={() => {
                        const next = Math.min(catEntities.length - 1, (selectedIdx >= 0 ? selectedIdx : 0) + 1);
                        setSelectedEntityPerCategory((p) => ({ ...p, [cat.category]: catEntities[next].id }));
                      }}
                      disabled={selectedIdx >= catEntities.length - 1}
                      className="w-[22px] h-[22px] flex items-center justify-center rounded-[4px] disabled:opacity-30 hover:bg-[#eae7e0] transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-panora-text-muted" />
                    </button>
                  </div>
                  {/* Counter */}
                  <span className="text-[11px] text-panora-text-muted">{(selectedIdx >= 0 ? selectedIdx : 0) + 1}/{catEntities.length}</span>
                </div>
              </div>

              {/* Guarantee rows for this category */}
              {comparisonData!.products.map((product, pIdx) => {
                return product.subGroups.map((subGroup, sgIdx) => {
                  const sIdx = flatSectionIdx++;
                  const subKey = `multi-sub-${catIdx}-${pIdx}-${sgIdx}`;
                  const subCollapsed = collapsedSections.has(subKey);
                  return (
                    <div key={`${catIdx}-${pIdx}-${sgIdx}`}>
                      <SectionHeader
                        title={subGroup.title}
                        variant="sub"
                        collapsed={subCollapsed}
                        onToggle={() => toggleSection(subKey)}
                      />
                      {!subCollapsed && subGroup.rows.map((row, rIdx) => {
                        const rowKey = `gua-multi-${catIdx}-${sIdx}-${rIdx}`;
                        const rowActive = isGuaranteeRowActive(sIdx, rIdx);
                        const rowShown = shownRows.has(rowKey);
                        return (
                          <div key={rIdx} className="flex border-b border-panora-border group/row">
                            <div className={`w-[250px] shrink-0 px-4 py-3.5 border-r border-panora-border flex items-center gap-2.5 relative ${rowActive ? "bg-[linear-gradient(to_right,#ebf3ef_0%,white_20%)]" : ""}`}>
                              <span className="text-[13px] leading-[20px] flex-1 min-w-0 truncate text-panora-text">{row.label}</span>
                              <ShowHideToggle shown={rowShown} onToggle={() => toggleRowVisibility(rowKey)} />
                              {rowActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-panora-green rounded-r-sm" />}
                            </div>
                            {insurers.map((ins) => {
                              // Apply per-entity overrides if available
                              const override = currentEntity ? multiEntity?.guaranteeOverrides?.[currentEntity.id]?.[row.label]?.[ins.id] : undefined;
                              const cell = override ?? row.values[ins.id] ?? { type: "empty" as const };
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
                    </div>
                  );
                });
              })}
              <SectionDivider />
            </div>
          );
        })
      )}

      {/* Rate-based products */}
      {comparisonData?.rateProducts?.map((rateProduct, rpIdx) => {
        const rpKey = `rate-product-${rpIdx}`;
        const rpCollapsed = collapsedSections.has(rpKey);
        const isPerPerson = rateProduct.rateUnit === "eur_per_person_month";
        const employerShareFieldId = rateProduct.employerShareFieldId;
        const employerPct = employerShareFieldId ? dynamicFieldValues?.[employerShareFieldId] : undefined;

        // For eur_per_person_month: compute grand total across all sub-groups
        const grandTotals: Record<string, { total: number; partial: boolean } | null> = {};
        if (isPerPerson) {
          for (const ins of insurers) {
            let sum = 0;
            let hasAny = false;
            let allFilled = true;
            for (const sg of rateProduct.subGroups) {
              for (const row of sg.rows) {
                const rate = row.rates[ins.id];
                const headcount = dynamicFieldValues?.[row.dynamicFieldId];
                if (rate !== undefined && headcount !== undefined) {
                  sum += rate * headcount * 12;
                  hasAny = true;
                } else if (rate !== undefined) {
                  allFilled = false;
                }
              }
            }
            grandTotals[ins.id] = hasAny ? { total: sum, partial: !allFilled } : null;
          }
        }

        return (
          <div key={rpKey}>
            <SectionHeader
              title={rateProduct.title}
              variant="product"
              collapsed={rpCollapsed}
              onToggle={() => toggleSection(rpKey)}
            />
            {!rpCollapsed && rateProduct.subGroups.map((sg, sgIdx) => {
              const sgKey = `rate-sub-${rpIdx}-${sgIdx}`;
              const sgCollapsed = collapsedSections.has(sgKey);

              return (
                <div key={sgIdx}>
                  {sgIdx > 0 && <SectionDivider />}
                  <SectionHeader
                    title={sg.title}
                    variant="category"
                    collapsed={sgCollapsed}
                    onToggle={() => toggleSection(sgKey)}
                  />
                  {!sgCollapsed && (
                    <>
                      {sg.rows.map((row, rIdx) => {
                        const base = dynamicFieldValues?.[row.dynamicFieldId];
                        return (
                          <div key={rIdx} className="flex border-b border-panora-border group/row">
                            <div className="w-[250px] shrink-0 px-4 py-3.5 border-r border-panora-border flex items-center">
                              <span className="text-[13px] leading-[20px] flex-1 min-w-0 truncate text-panora-text">{row.label}</span>
                            </div>
                            {insurers.map((ins) => {
                              const rate = row.rates[ins.id];
                              const icp = insurerColProps(ins);

                              if (isPerPerson) {
                                // €/pers/mois: show rate as primary, unit label as secondary
                                return (
                                  <div
                                    key={ins.id}
                                    className={`${icp.className} shrink-0 px-3 py-3 border-r border-panora-border`}
                                    style={icp.style}
                                  >
                                    <div className="flex flex-col gap-0.5">
                                      {rate !== undefined ? (
                                        <>
                                          <span className="text-[13px] font-medium text-panora-text">
                                            {rate.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                          </span>
                                          <span className="text-[11px] text-panora-text-muted">/pers/mois</span>
                                        </>
                                      ) : (
                                        <span className="text-[13px] italic text-panora-text-muted">—</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              }

                              // Percent-based: split cell — € left | % right when base filled, full-width % otherwise
                              const amount = rate !== undefined && base !== undefined ? rate * base : null;
                              return (
                                <div
                                  key={ins.id}
                                  className={`${icp.className} shrink-0 border-r border-panora-border`}
                                  style={icp.style}
                                >
                                  {amount !== null ? (
                                    <div className="flex h-full">
                                      <div className="flex-1 px-3 py-3 flex items-center border-r border-panora-border/50">
                                        <span className="text-[13px] text-panora-text-muted">{formatRate(rate!)}</span>
                                      </div>
                                      <div className="flex-1 px-3 py-3 flex items-center">
                                        <span className="text-[13px] font-medium text-panora-text">{formatEur(amount)}</span>
                                      </div>
                                    </div>
                                  ) : rate !== undefined ? (
                                    <div className="px-3 py-3">
                                      <span className="text-[13px] text-panora-text">{formatRate(rate)}</span>
                                    </div>
                                  ) : (
                                    <div className="px-3 py-3">
                                      <span className="text-[13px] italic text-panora-text-muted">—</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}

                    </>
                  )}
                </div>
              );
            })}

            {/* Grand total row — for eur_per_person_month products (across all sub-groups) */}
            {isPerPerson && !rpCollapsed && (
              <>
                <div className="flex border-b border-panora-border bg-[#faf9f7]">
                  <div className="w-[250px] shrink-0 px-4 py-3.5 border-r border-panora-border flex items-center">
                    <span className="text-[13px] font-semibold text-panora-text">Coût total / an</span>
                  </div>
                  {insurers.map((ins) => {
                    const gt = grandTotals[ins.id];
                    const icp = insurerColProps(ins);
                    return (
                      <div key={ins.id} className={`${icp.className} shrink-0 px-3 py-3 border-r border-panora-border`} style={icp.style}>
                        {gt !== null ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-semibold text-panora-text">
                              {formatEur(gt.total)}
                            </span>
                            {gt.partial && (
                              <span className="text-[11px] italic text-panora-text-muted">partiel — effectifs incomplets</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[13px] italic text-panora-text-muted">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Employer share line */}
                {employerPct !== undefined && (
                  <div className="flex border-b border-panora-border bg-[#faf9f7]">
                    <div className="w-[250px] shrink-0 px-4 py-3.5 border-r border-panora-border flex items-center">
                      <span className="text-[13px] text-panora-text-muted">dont employeur ({employerPct}%)</span>
                    </div>
                    {insurers.map((ins) => {
                      const gt = grandTotals[ins.id];
                      const icp = insurerColProps(ins);
                      return (
                        <div key={ins.id} className={`${icp.className} shrink-0 px-3 py-3 border-r border-panora-border`} style={icp.style}>
                          {gt !== null ? (
                            <span className="text-[13px] text-panora-text-muted">
                              {formatEur(Math.round(gt.total * employerPct / 100))}
                            </span>
                          ) : (
                            <span className="text-[13px] italic text-panora-text-muted">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            <SectionDivider />
          </div>
        );
      })}

      {/* Guarantee products → sub-groups → rows (non-fleet standard view) */}
      {!isMultiEntity && (() => {
        let flatSectionIdx = 0;
        return comparisonData?.products?.map((product, pIdx) => {
          const productKey = `product-${pIdx}`;
          const productCollapsed = collapsedSections.has(productKey);
          const isDefinitions = product.layout === "definitions";

          return (
            <div key={pIdx}>
              <SectionHeader
                title={product.title}
                variant="product"
                collapsed={productCollapsed}
                onToggle={() => toggleSection(productKey)}
              />
              {!productCollapsed && isDefinitions && product.subGroups.flatMap((sg) => sg.rows).map((row, rIdx) => {
                const defText = (row.values._definition as { type: "text"; value: string } | undefined)?.value ?? "";
                return (
                  <div key={rIdx} className="flex border-b border-panora-border">
                    <div className="w-[250px] shrink-0 px-4 py-3.5 border-r border-panora-border flex items-start">
                      <span className="text-[13px] font-medium text-panora-text">{row.label}</span>
                    </div>
                    <div className="flex-1 px-4 py-3.5">
                      <p className="text-[13px] leading-[20px] text-panora-text-muted">{defText}</p>
                    </div>
                  </div>
                );
              })}
              {!productCollapsed && !isDefinitions && product.subGroups.map((subGroup, sgIdx) => {
                const sIdx = flatSectionIdx++;
                const subKey = `sub-${pIdx}-${sgIdx}`;
                const subCollapsed = collapsedSections.has(subKey);
                return (
                  <div key={sgIdx}>
                    {sgIdx > 0 && <SectionDivider />}
                    {subGroup.title && (
                      <SectionHeader
                        title={subGroup.title}
                        variant="sub"
                        collapsed={subCollapsed}
                        onToggle={() => toggleSection(subKey)}
                      />
                    )}
                    {!subCollapsed && subGroup.rows.map((row, rIdx) => {
                      const rowKey = `gua-${sIdx}-${rIdx}`;
                      const rowActive = isGuaranteeRowActive(sIdx, rIdx);
                      const rowShown = shownRows.has(rowKey);
                      return (
                        <div key={rIdx} className="flex border-b border-panora-border group/row">
                          <div className={`w-[250px] shrink-0 px-4 py-3.5 border-r border-panora-border flex items-center gap-2.5 relative ${rowActive ? "bg-[linear-gradient(to_right,#ebf3ef_0%,white_20%)]" : ""}`}>
                            <span className="text-[13px] leading-[20px] flex-1 min-w-0 truncate text-panora-text">{row.label}</span>
                            <ShowHideToggle shown={rowShown} onToggle={() => toggleRowVisibility(rowKey)} />
                            {rowActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-panora-green rounded-r-sm" />}
                          </div>
                          {insurers.map((ins) => {
                            const cell = row.values[ins.id] ?? { type: "empty" as const };
                            const cellId: CellIdentifier = { type: "guarantee", sectionIndex: sIdx, rowIndex: rIdx, insurerId: ins.id };
                            const isSelected = cellIdEquals(selectedCell, cellId);
                            const showDetail = cellDisplayModes?.[cellIdKey(cellId)];
                            const keyDetail = showDetail ? deriveKeyDetail(cell, row.details?.[ins.id] ?? null) : null;
                            const icp = insurerColProps(ins);

                            return (
                              <ComparisonCell
                                key={ins.id}
                                isSelected={isSelected}
                                onClick={() => onCellSelect?.(cellId)}
                                className={`${icp.className} shrink-0 px-3 py-3.5 border-r border-panora-border flex items-center`}
                                style={icp.style}
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
                  </div>
                );
              })}
              <SectionDivider />
            </div>
          );
        });
      })()}

      {/* Exclusions section — hidden in tarifs mode */}
      {fleetViewMode !== "tarifs" && comparisonData?.exclusions && comparisonData.exclusions.length > 0 && (() => {
        const deterministicRows = exclusionsByOrigin("deterministic");
        const aiRows = exclusionsByOrigin("ai");
        const manualRows = exclusionsByOrigin("manual");

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
                const icp = insurerColProps(ins);

                return (
                  <ComparisonCell
                    key={ins.id}
                    isSelected={isSelected}
                    onClick={() => onCellSelect?.(cellId)}
                    className={`${icp.className} shrink-0 px-3 py-3.5 border-r border-panora-border flex items-center`}
                    style={icp.style}
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
            <SectionHeader
              title="Exclusions"
              variant="destructive"
              collapsed={collapsedSections.has("exclusions")}
              onToggle={() => toggleSection("exclusions")}
            />
            {!collapsedSections.has("exclusions") && <>
            <SectionDivider />

            {/* Deterministic rows — flat, no sub-group */}
            {deterministicRows.map(renderExclusionRow)}

            {/* AI exclusions — single row with bullet lists per insurer */}
            {aiRows.length > 0 && (
              <>
                <SectionDivider />
                <div className="flex border-b border-panora-border">
                  <div className="w-[250px] shrink-0 px-4 py-3.5 border-r border-panora-border flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 mt-[3px] text-panora-green shrink-0" />
                    <span className="text-[13px] leading-[20px] text-panora-text font-medium">Exclusions détectées par l&apos;IA</span>
                  </div>
                  {insurers.map((ins) => {
                    const icp = insurerColProps(ins);
                    return (
                      <div key={ins.id} className={`${icp.className} shrink-0 px-3 py-3 border-r border-panora-border`} style={icp.style}>
                        <ul className="flex flex-col gap-1.5">
                          {aiRows.map((row) => (
                            <li key={row.id} className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 bg-[#fde8e8]">
                                <span className="text-[13px] font-bold text-[#952617] leading-none">!</span>
                              </span>
                              <span className="text-[13px] leading-6 text-panora-text">{row.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </>
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
            </>}
          </div>
        );
      })()}

    </div>
  );
}

/** Fleet/MRI synthesis section — "Synthèse parc auto" */
function FleetSynthesisSection({
  multiEntity,
  insurers,
  colClass,
  pricingMode,
  setPricingMode,
  showAnnual,
  setShowAnnual,
  collapsedSections,
  toggleSection,
}: {
  multiEntity: NonNullable<ComparisonData["multiEntity"]>;
  insurers: InsurerData[];
  colClass: string;
  pricingMode: "ht" | "ttc";
  setPricingMode: (m: "ht" | "ttc") => void;
  showAnnual: boolean;
  setShowAnnual: (v: boolean) => void;
  collapsedSections: Set<string>;
  toggleSection: (key: string) => void;
}) {
  const collapsed = collapsedSections.has("fleet-synthesis");
  return (
    <div>
      <SectionHeader
        title={`Synthèse parc ${multiEntity.entityLabelPlural}`}
        variant="product"
        collapsed={collapsed}
        onToggle={() => toggleSection("fleet-synthesis")}
      />
      {!collapsed && (
        <div className="flex border-b border-panora-border">
          <div className="w-[250px] shrink-0 px-4 py-4 border-r border-panora-border flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-[22px] h-[22px] rounded-[4px] bg-[#eae7e0] flex items-center justify-center text-[10px] text-panora-text font-bold">€</span>
                <span className="text-[13px] font-medium text-panora-text">Prix</span>
              </div>
              <div className="flex items-center gap-[2px] bg-[#eae7e0] rounded-[6px] p-[2px]">
                <button
                  onClick={() => setPricingMode("ht")}
                  className={`px-1.5 py-[2px] rounded-[6px] text-[12px] font-medium leading-4 transition-colors ${
                    pricingMode === "ht"
                      ? "bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-panora-text"
                      : "text-panora-text-muted"
                  }`}
                >
                  HT
                </button>
                <button
                  onClick={() => setPricingMode("ttc")}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnnual(!showAnnual)}
                className={`relative w-[28px] h-[16px] rounded-full transition-colors ${showAnnual ? "bg-panora-green" : "bg-[#d1d1d1]"}`}
              >
                <span className={`absolute top-[2px] w-[12px] h-[12px] rounded-full bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.15)] transition-transform ${showAnnual ? "left-[14px]" : "left-[2px]"}`} />
              </button>
              <span className="text-[13px] text-panora-text-muted">Prix annuel</span>
            </div>
          </div>

          {insurers.map((ins) => {
            const summary = multiEntity.summaryPerInsurer[ins.id];
            if (!summary) return (
              <div key={ins.id} className={`${colClass} shrink-0 px-3 py-3 border-r border-panora-border`}>
                <span className="text-[13px] text-panora-text-muted">—</span>
              </div>
            );
            const total = showAnnual ? summary.totalAnnual : Math.round(summary.totalAnnual / 12);
            const avg = showAnnual ? summary.avgPerEntity : Math.round(summary.avgPerEntity / 12);
            const period = showAnnual ? "/ an" : "/ mois";
            return (
              <div key={ins.id} className={`${colClass} shrink-0 px-3 py-3 border-r border-panora-border`}>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] text-panora-text-muted">Coût total flotte</span>
                    <span className="text-[13px] font-semibold text-panora-text">{formatEur(total)} <span className="text-panora-text-muted font-normal">{period}</span></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] text-panora-text-muted">Coût moy/{multiEntity.entityLabel.toLowerCase()}</span>
                    <span className="text-[13px] font-medium text-panora-text">{formatEur(avg)} <span className="text-panora-text-muted font-normal">{period}</span></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] text-panora-text-muted">Nombre de {multiEntity.entityLabelPlural}</span>
                    <span className="text-[13px] text-panora-text">{summary.entityCount}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] text-panora-text-muted">Date du devis</span>
                    <span className="text-[13px] text-panora-text">{summary.quoteDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <SectionDivider />
    </div>
  );
}

function EntitySelector({
  entities,
  selectedId,
  onSelect,
}: {
  entities: FleetEntity[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = entities.find((e) => e.id === selectedId) ?? entities[0];
  const filtered = query
    ? entities.filter((e) => {
        const haystack = `${e.name ?? ""} ${e.plate ?? ""} ${e.label}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : entities;

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white border border-[#e2dfd8] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[6px] pl-2.5 pr-2 py-[3px] text-[13px] text-panora-text cursor-pointer hover:border-[#d4d2cc] transition-colors"
      >
        <span className="font-medium truncate max-w-[140px]">{selected?.name ?? selected?.label}</span>
        {selected?.plate && <span className="text-panora-text-muted text-[12px]">{selected.plate}</span>}
        <ChevronDown className={`w-3 h-3 text-panora-text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] z-30 overflow-hidden">
          {/* Search */}
          <div className="px-2.5 py-2 border-b border-panora-border">
            <div className="flex items-center gap-2 bg-[#faf8f5] border border-[#e2dfd8] rounded-[6px] px-2.5 py-[5px]">
              <Search className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 bg-transparent text-[12px] text-panora-text outline-none placeholder:text-panora-text-muted"
              />
            </div>
          </div>
          {/* List */}
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-panora-text-muted">Aucun résultat</div>
            ) : (
              filtered.map((e) => {
                const isActive = e.id === selectedId;
                return (
                  <button
                    key={e.id}
                    onClick={() => { onSelect(e.id); setOpen(false); }}
                    className={`w-full px-3 py-1.5 flex items-center gap-2 text-left hover:bg-[#faf8f5] transition-colors ${isActive ? "bg-[#ebf3ef]" : ""}`}
                  >
                    <span className={`text-[13px] truncate ${isActive ? "font-medium text-panora-text" : "text-panora-text"}`}>{e.name ?? e.label}</span>
                    {e.plate && <span className="text-[11px] text-panora-text-muted shrink-0">{e.plate}</span>}
                    {isActive && <Check className="w-3 h-3 text-panora-green ml-auto shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
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

  const fortsText = item.pointsForts.map((s) => `• ${s}`).join("\n");
  const faiblesText = item.pointsFaibles.map((s) => `• ${s}`).join("\n");

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
          {item.pointsForts.map((s) => `• ${s}`).join("\n")}
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
          {item.pointsFaibles.map((s) => `• ${s}`).join("\n")}
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

function SectionHeader({ title, variant = "product", collapsed, onToggle }: {
  title: string;
  variant?: "product" | "category" | "sub" | "destructive" | "synthese";
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const chevron = onToggle ? (
    <button onClick={onToggle} className="shrink-0 flex items-center justify-center p-1 rounded-[4px] hover:bg-[#eae7e0] transition-colors">
      {collapsed ? (
        <ChevronRight className="w-3.5 h-3.5 text-panora-text-muted" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 text-panora-text-muted" />
      )}
    </button>
  ) : null;

  if (variant === "synthese") {
    return (
      <div className="group flex items-center gap-2 px-4 border-b border-panora-border h-[40px] bg-[#faf8f5]">
        {onToggle ? (
          <button onClick={onToggle} className="shrink-0 flex items-center justify-center p-1 rounded-[4px] hover:bg-[#eae7e0] transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-panora-text-muted group-hover:hidden" />
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-panora-text-muted hidden group-hover:block" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-panora-text-muted hidden group-hover:block" />
            )}
          </button>
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
        )}
        <span className="text-[14px] font-semibold font-display text-panora-text tracking-[-0.2px]">{title}</span>
      </div>
    );
  }

  if (variant === "product") {
    return (
      <div className="flex items-center gap-2 px-4 border-b border-panora-border h-[40px] bg-[#faf8f5]">
        {chevron}
        <span className="text-[14px] font-semibold font-display text-panora-text tracking-[-0.2px]">{title}</span>
      </div>
    );
  }

  if (variant === "category") {
    return (
      <div className="flex items-center gap-2 px-4 border-b border-panora-border h-[36px] bg-[#f5f3ef]">
        {chevron}
        <span className="text-[12px] font-semibold text-panora-text tracking-[0.2px]">{title}</span>
      </div>
    );
  }

  if (variant === "sub") {
    return (
      <div className="flex items-center gap-2 px-4 border-b border-panora-border h-[34px]">
        {chevron}
        <span className="text-[10px] font-medium tracking-[0.5px] uppercase text-panora-text-muted">{title}</span>
      </div>
    );
  }

  // destructive — exclusions
  return (
    <div className="flex items-center gap-2 px-4 border-b border-panora-border h-[40px] bg-[#fdf5f4]/40">
      {chevron}
      <span className="text-[14px] font-semibold font-display text-[#952617] tracking-[-0.2px]">{title}</span>
    </div>
  );
}

function SectionDivider() {
  return <div className="h-[4px] bg-white border-b border-panora-border" />;
}
