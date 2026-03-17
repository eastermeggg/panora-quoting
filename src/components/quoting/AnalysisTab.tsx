"use client";

import { useRef, useState, useEffect } from "react";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { Check, X as XIcon, HelpCircle, FileDown, Copy, Plus, Sparkles } from "lucide-react";
import type { AnalysisData, InsurerData } from "@/data/mock";

interface AnalysisTabProps {
  analysisData: AnalysisData | undefined;
  insurers: InsurerData[];
  offerCount: number;
  onSwitchToComparison: () => void;
  onOpenProfile: () => void;
  onUpdateAnalysis?: (updated: AnalysisData) => void;
  isStreaming?: boolean;
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
}: {
  value: string;
  onCommit: (value: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const commit = () => {
    if (!ref.current) return;
    const text = ref.current.innerText?.trim() ?? "";
    if (text !== value) onCommit(text);
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
      {value}
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
}: {
  text: string;
  active: boolean;
  delay?: number;
  speed?: number;
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
        i += 3;
        if (i >= text.length) i = text.length;
        setCharCount(i);
        if (i >= text.length) clearInterval(interval);
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

// ─── Main component ─────────────────────────────────────────────────

export function AnalysisTab({ analysisData, insurers, offerCount, onSwitchToComparison, onOpenProfile, onUpdateAnalysis, isStreaming }: AnalysisTabProps) {
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

  if (!analysisData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-panora-bg">
        <p className="text-[14px] text-panora-text-muted">Analyse non disponible.</p>
      </div>
    );
  }

  const { contextPills, resumeExecutif, conditionsFinancieres, analyseParOffre, garantiesCles } = analysisData;

  const update = (partial: Partial<AnalysisData>) => {
    onUpdateAnalysis?.({ ...analysisData, ...partial });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f4f1]">
      <div className="max-w-[820px] mx-auto my-8 relative">
        {/* ── Floating actions (right gutter) ── */}
        <div className="absolute -right-[140px] top-0 w-[120px] space-y-2 hidden xl:block">
          <button
            onClick={() => console.log("TODO: Exporter")}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-[12px] font-medium text-panora-text border border-panora-border rounded-[6px] bg-white hover:bg-panora-bg transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <FileDown className="w-3.5 h-3.5" />
            Exporter
          </button>
          <button
            onClick={() => console.log("TODO: Copier")}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-[12px] font-medium text-panora-text border border-panora-border rounded-[6px] bg-white hover:bg-panora-bg transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <Copy className="w-3.5 h-3.5" />
            Copier
          </button>
        </div>

        {/* Document page */}
        <div className="bg-white rounded-[12px] border border-panora-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative">
          <div className="px-10 py-10 space-y-10">

            {/* ── Title ── */}
            <div className="flex items-start justify-between pb-2">
              <div>
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
              {/* Inline fallback for narrow screens */}
              <div className="flex items-center gap-2 shrink-0 ml-4 xl:hidden">
                <button
                  onClick={() => console.log("TODO: Exporter")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-panora-text border border-panora-border rounded-[6px] bg-white hover:bg-panora-bg transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Exporter
                </button>
                <button
                  onClick={() => console.log("TODO: Copier")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-panora-text border border-panora-border rounded-[6px] bg-white hover:bg-panora-bg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copier
                </button>
              </div>
            </div>

            <Hr />

            {/* ── Contexte client ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[18px] font-serif font-semibold text-panora-text">Contexte client</h2>
                <button onClick={onOpenProfile} className="text-[12px] font-medium text-panora-green hover:underline">
                  Modifier
                </button>
              </div>
              {contextPills.length === 0 ? (
                <p className="text-[14px] text-panora-text-muted">
                  Aucun contexte renseigne. <button onClick={onOpenProfile} className="text-panora-green font-medium hover:underline">Completer le profil</button>
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {contextPills.map((pill) => (
                    <span
                      key={pill.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] leading-4 ${
                        pill.source === "missing"
                          ? "border border-dashed border-[#d4d2cc] text-panora-text-muted"
                          : "bg-panora-secondary text-panora-text"
                      }`}
                    >
                      {pill.source === "missing" && <HelpCircle className="w-3 h-3" />}
                      {pill.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Hr />

            {/* ── Resume executif ── */}
            <div>
              <h2 className="text-[18px] font-serif font-semibold text-panora-text mb-3">Resume executif</h2>
              {isStreaming ? (
                <StreamingBlock
                  text={resumeExecutif}
                  active
                  delay={0}
                  className="text-[15px] leading-7 text-panora-text"
                />
              ) : (
                <EditableBlock
                  value={resumeExecutif}
                  className="text-[15px] leading-7 text-panora-text"
                  onCommit={(v) => update({ resumeExecutif: v })}
                />
              )}
            </div>

            <Hr />

            {/* ── Conditions financieres ── */}
            <div>
              <h2 className="text-[18px] font-serif font-semibold text-panora-text mb-3">Conditions financieres</h2>
              {isStreaming ? (
                <StreamingBlock
                  text={conditionsFinancieres.analysisBefore}
                  active
                  delay={resumeExecutif.length * 8 / 3}
                  className="text-[15px] leading-7 text-panora-text mb-6"
                />
              ) : (
                <EditableBlock
                  value={conditionsFinancieres.analysisBefore}
                  className="text-[15px] leading-7 text-panora-text mb-6"
                  onCommit={(v) => update({ conditionsFinancieres: { ...conditionsFinancieres, analysisBefore: v } })}
                />
              )}

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

              {isStreaming ? (
                <StreamingBlock
                  text={conditionsFinancieres.analysisAfter}
                  active
                  delay={(resumeExecutif.length + conditionsFinancieres.analysisBefore.length) * 8 / 3 + 200}
                  className="text-[15px] leading-7 text-panora-text"
                />
              ) : (
                <EditableBlock
                  value={conditionsFinancieres.analysisAfter}
                  className="text-[15px] leading-7 text-panora-text"
                  onCommit={(v) => update({ conditionsFinancieres: { ...conditionsFinancieres, analysisAfter: v } })}
                />
              )}
            </div>

            <Hr />

            {/* ── Analyse par offre ── */}
            <div>
              <h2 className="text-[18px] font-serif font-semibold text-panora-text mb-4">Analyse par offre</h2>
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
                        {isStreaming ? (
                          <StreamingBlock
                            text={item.pointsForts.map((s) => `• ${s}`).join("\n")}
                            active
                            delay={3000 + idx * 800}
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
                              update({ analyseParOffre: next });
                            }}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[12px] font-medium text-[#952617] mb-2 flex items-center gap-1">
                          <XIcon className="w-3.5 h-3.5" />
                          Points faibles
                        </p>
                        {isStreaming ? (
                          <StreamingBlock
                            text={item.pointsFaibles.map((s) => `• ${s}`).join("\n")}
                            active
                            delay={3000 + idx * 800 + 400}
                            speed={10}
                            className="text-[13px] leading-6 text-panora-text"
                          />
                        ) : (
                          <EditableBullets
                            items={item.pointsFaibles}
                            className="text-[13px] leading-6 text-panora-text"
                            onCommit={(lines) => {
                              const next = [...analyseParOffre];
                              next[idx] = { ...item, pointsFaibles: lines };
                              update({ analyseParOffre: next });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Hr />

            {/* ── Garanties cles ── */}
            <div>
              <h2 className="text-[18px] font-serif font-semibold text-panora-text mb-4">Garanties cles</h2>
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
                {garantiesCles.map((row, rIdx) => (
                  <div key={rIdx} className={`flex ${rIdx < garantiesCles.length - 1 ? "border-b border-panora-border" : ""}`}>
                    <div className="w-[200px] shrink-0 px-3 py-2.5 border-r border-panora-border">
                      <span className="text-[13px] text-panora-text">{row.label}</span>
                    </div>
                    {insurers.map((ins) => {
                      const val = row.values[ins.id];
                      return (
                        <div key={ins.id} className="flex-1 px-3 py-2.5 border-r border-panora-border last:border-r-0">
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
                ))}
                <div className="border-t border-panora-border px-3 py-2">
                  <button
                    onClick={() => console.log("TODO: Ajouter une garantie")}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-panora-green hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une garantie
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
