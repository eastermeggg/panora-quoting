"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAppetit,
  getEstimatedPrime,
  getSynthese,
  lineProvenance,
} from "@/data/souscription-engine";
import type { Dossier, Draft } from "@/data/souscription-mock";
import { lineAnchorId } from "./DraftSection";
import { AppetitBadge } from "./AppetitBadge";

function formatEuros(n: number): string {
  return n.toLocaleString("fr-FR") + " € HT";
}

/**
 * Étage 1: two headline metrics (Appétit + Prime estimée), an opinionated
 * reading of the risk, and the home of the open points. The `[agent]`
 * hypotheses to confirm are clickable chips (open the line fiche AND ask in
 * context); the tarif leviers link to their lines.
 */
export function TarificationSynthese({
  dossier,
  draft,
  confirmed,
  onOpenPoint,
}: {
  dossier: Dossier;
  draft: Draft;
  confirmed: Set<string>;
  onOpenPoint: (label: string) => void;
}) {
  const s = getSynthese(dossier, draft);
  const appetit = getAppetit(dossier);
  const prime = getEstimatedPrime(dossier);
  const openPoints = draft.lignes.filter(
    (l) => lineProvenance(l) === "agent" && !confirmed.has(l.label)
  );
  const levers = draft.lignes.filter(
    (l) =>
      (l.effectKind === "tarif" &&
        !/prime/i.test(l.label) &&
        !/assiette/i.test(l.label)) ||
      /sous-limite/i.test(l.label)
  );

  function jump(label: string) {
    document
      .getElementById(lineAnchorId(label))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="rounded-xl border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-panora-green" />
        <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
          Synthèse
        </h2>
      </div>

      {/* Two headline metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        <MetricBox label="Appétit">
          <AppetitBadge verdict={appetit.verdict} />
        </MetricBox>
        <MetricBox label="Prime estimée">
          <span className="text-[15px] font-semibold text-panora-text tabular-nums leading-5">
            {prime != null ? formatEuros(prime) : "—"}
          </span>
        </MetricBox>
      </div>

      <p className="text-[13px] text-panora-text leading-6">{s.reading}</p>

      {/* Points ouverts — clickable, open the fiche + ask */}
      {openPoints.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <Note dot="bg-panora-warning" className="text-panora-warning-text">
            {openPoints.length} hypothèse{openPoints.length > 1 ? "s" : ""} de
            l&apos;agent à confirmer
          </Note>
          <div className="flex flex-wrap gap-1.5">
            {openPoints.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onOpenPoint(p.label)}
                className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-md border border-panora-warning/30 bg-panora-warning-bg/60 text-[12px] font-medium text-panora-warning-text hover:bg-panora-warning-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
              >
                {p.label}
                <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Note dot="bg-panora-green" className="text-panora-green-dark">
          Toutes les hypothèses sont confirmées, le projet est sourcé
        </Note>
      )}

      {levers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-panora-text-muted mr-0.5">
            Leviers :
          </span>
          {levers.map((l) => (
            <button
              key={l.label}
              type="button"
              onClick={() => jump(l.label)}
              className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md border border-panora-border bg-white text-[11px] font-medium text-panora-text-secondary hover:bg-panora-drop hover:text-panora-text transition-colors"
            >
              {l.label}
              <span className="tabular-nums text-panora-text">{l.valeur}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-panora-border bg-panora-bg px-3.5 py-2.5 flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-[0.06em] leading-4">
        {label}
      </span>
      {children}
    </div>
  );
}

function Note({
  dot,
  className,
  children,
}: {
  dot: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-[12px] leading-4", className)}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
      {children}
    </span>
  );
}
