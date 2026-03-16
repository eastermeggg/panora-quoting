"use client";

import { useState } from "react";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { ComparisonCell } from "@/components/quoting/ComparisonCell";
import { parsePriceEuros } from "@/lib/utils";
import { Check, X as XIcon, ChevronDown, ChevronRight, FileText } from "lucide-react";
import type { InsurerData, ComparisonData, CellValue, CellIdentifier } from "@/data/mock";

interface ComparisonTableProps {
  insurers: InsurerData[];
  comparisonData?: ComparisonData;
  /** Associated cotation param id — for linking back to quote flow */
  cotParamId?: string;
  selectedCell?: CellIdentifier | null;
  onCellSelect?: (cell: CellIdentifier) => void;
}

function cellIdEquals(a: CellIdentifier | null | undefined, b: CellIdentifier): boolean {
  if (!a) return false;
  if (a.type !== b.type) return false;
  if (a.type === "guarantee" && b.type === "guarantee") {
    return a.sectionIndex === b.sectionIndex && a.rowIndex === b.rowIndex && a.insurerId === b.insurerId;
  }
  if (a.type === "price" && b.type === "price") {
    return a.insurerId === b.insurerId && a.formulaIndex === b.formulaIndex;
  }
  return false;
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
        <span className="text-[13px] font-medium text-panora-text">{cell.value}</span>
      </span>
    );
  }
  return <span className="text-[13px] text-panora-text-muted">—</span>;
}

export function ComparisonTable({ insurers, comparisonData, selectedCell, onCellSelect }: ComparisonTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // For each insurer, find cheapest annual price
  const cheapestPerInsurer = insurers.map((ins) => {
    const annuals = (ins.pricing ?? []).map((p) => parsePriceEuros(p.annual));
    return annuals.length > 0 ? Math.min(...annuals) : Infinity;
  });
  const globalCheapestPrice = Math.min(...cheapestPerInsurer.filter((p) => p < Infinity));
  const globalCheapestIdx = cheapestPerInsurer.indexOf(globalCheapestPrice);

  const colClass = "w-[300px]";

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

      {/* Section: Conditions générales — single Prix row, sub-offers inside cells */}
      <SectionHeader title="Conditions générales" />
      <div className="flex border-b border-panora-border">
        {/* Left label */}
        <div className="w-[250px] shrink-0 px-4 py-4 border-r border-panora-border">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-panora-text flex items-center justify-center text-[10px] text-white font-bold">$</span>
            <span className="text-[13px] font-medium text-panora-text">Prix</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-panora-text-muted">
            <span className="w-3 h-3 rounded-full bg-panora-green/60 inline-block" />
            Prix annuel
          </div>
        </div>

        {/* One cell per insurer with all sub-offers */}
        {insurers.map((ins, iIdx) => {
          const pricing = ins.pricing ?? [];
          return (
            <div
              key={ins.id}
              className={`${colClass} shrink-0 border-r border-panora-border`}
            >
              {pricing.map((formula, fIdx) => {
                const key = `${ins.id}-${fIdx}`;
                const isOpen = expanded[key] ?? (fIdx === 0);
                const price = parsePriceEuros(formula.annual);
                const isCheapest = price === cheapestPerInsurer[iIdx];
                const cellId: CellIdentifier = { type: "price", insurerId: ins.id, formulaIndex: fIdx };
                const isSelected = cellIdEquals(selectedCell, cellId);

                return (
                  <ComparisonCell
                    key={fIdx}
                    isSelected={isSelected}
                    onClick={() => onCellSelect?.(cellId)}
                    className={`px-3 py-3 ${fIdx > 0 ? "border-t border-panora-border/50" : ""}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(key);
                      }}
                      className={`flex items-center gap-1.5 text-[12px] font-medium ${isOpen ? "text-panora-green" : "text-panora-text-muted"}`}
                    >
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      {formula.formula}
                    </button>
                    {isOpen && (
                      <div className="mt-1.5 space-y-1 pl-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-panora-text-muted">{ins.name} net</span>
                          <span className={`text-[13px] font-semibold ${isCheapest ? "text-panora-green" : "text-panora-text"}`}>
                            {formula.annual}
                          </span>
                        </div>
                        {formula.monthly && (
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-panora-text-muted">Mensuel</span>
                            <span className="text-[13px] text-panora-text">{formula.monthly}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </ComparisonCell>
                );
              })}
              {pricing.length === 0 && (
                <div className="px-3 py-3">
                  <span className="text-[13px] text-panora-text-muted">—</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Separator */}
      <div className="h-1.5 bg-panora-bg" />

      {/* Guarantee sections */}
      {comparisonData?.sections.map((section, sIdx) => (
        <div key={sIdx}>
          <SectionHeader title={section.title} />
          {section.rows.map((row, rIdx) => (
            <div key={rIdx} className="flex border-b border-panora-border">
              <div className="w-[250px] shrink-0 px-4 py-3.5 border-r border-panora-border">
                <span className="text-[13px] text-panora-text leading-[18px]">{row.label}</span>
              </div>
              {insurers.map((ins) => {
                const cell = row.values[ins.id] ?? { type: "empty" as const };
                const cellId: CellIdentifier = { type: "guarantee", sectionIndex: sIdx, rowIndex: rIdx, insurerId: ins.id };
                const isSelected = cellIdEquals(selectedCell, cellId);

                return (
                  <ComparisonCell
                    key={ins.id}
                    isSelected={isSelected}
                    onClick={() => onCellSelect?.(cellId)}
                    className={`${colClass} shrink-0 px-3 py-3.5 border-r border-panora-border flex items-center`}
                  >
                    <CellBadge cell={cell} />
                  </ComparisonCell>
                );
              })}
            </div>
          ))}
          <div className="h-1.5 bg-panora-bg" />
        </div>
      ))}

      {/* Documents section */}
      <SectionHeader title="Documents" />
      <div className="flex border-b border-panora-border">
        <div className="w-[250px] shrink-0 px-4 py-3 border-r border-panora-border">
          <span className="text-[13px] text-panora-text-muted">Fichiers reçus</span>
        </div>
        {insurers.map((ins) => {
          const count = ins.documents?.length ?? 0;
          return (
            <div
              key={ins.id}
              className={`${colClass} shrink-0 px-3 py-3 border-r border-panora-border`}
            >
              <div className="flex items-center gap-1.5 text-[13px] text-panora-text">
                <FileText className="w-3.5 h-3.5 text-panora-text-muted" />
                {count} fichier{count !== 1 ? "s" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex bg-[#f5f3ef] border-b border-panora-border">
      <div className="w-[250px] shrink-0 px-4 py-2.5 border-r border-panora-border">
        <span className="text-[13px] font-semibold text-panora-text">{title}</span>
      </div>
      <div className="flex-1" />
    </div>
  );
}
