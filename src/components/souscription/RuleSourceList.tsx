"use client";

import { FileSpreadsheet, FileText, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { produitLabel } from "@/data/souscription-engine";
import type { RuleSourceDoc } from "@/data/souscription-mock";

const TYPE_LABEL: Record<RuleSourceDoc["type"], string> = {
  grille: "Grille tarifaire",
  guide: "Guide de souscription",
  matrice: "Matrice d'autorité",
  exclusions: "Exclusions",
};

const TYPE_ICON: Record<RuleSourceDoc["type"], LucideIcon> = {
  grille: FileSpreadsheet,
  matrice: FileSpreadsheet,
  guide: FileText,
  exclusions: FileText,
};

function sourceProduit(p: RuleSourceDoc["produit"]): string {
  return p === "transverse" ? "Transverse" : produitLabel(p);
}

/** The ingested rule-source files that feed the engine, with their extraction
 *  state (N règles · M à valider). Distinct from the product référentiel docs. */
export function RuleSourceList({ sources }: { sources: RuleSourceDoc[] }) {
  if (sources.length === 0) {
    return (
      <div className="rounded-xl border border-panora-border px-4 py-6 text-center text-[12px] text-panora-text-muted">
        Aucun fichier ingéré.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-panora-border overflow-hidden">
      {sources.map((s, i) => {
        const Icon = TYPE_ICON[s.type];
        return (
          <div
            key={s.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              i > 0 && "border-t border-panora-border"
            )}
          >
            <Icon className="w-4 h-4 text-panora-text-muted shrink-0" />
            <span className="font-mono text-[12px] text-panora-text flex-1 min-w-0 truncate">
              {s.filename}
            </span>
            <span className="text-[12px] text-panora-text-muted hidden md:inline">
              {TYPE_LABEL[s.type]}
            </span>
            <span className="inline-flex items-center h-5 px-2 rounded-full bg-panora-secondary text-[11px] font-medium text-panora-text-secondary shrink-0">
              {sourceProduit(s.produit)}
            </span>
            <span className="text-[12px] text-panora-text-secondary tabular-nums shrink-0 hidden sm:inline">
              {s.reglesExtraites} règles
            </span>
            {s.aValider > 0 && (
              <span className="inline-flex items-center h-5 px-2 rounded-full bg-panora-warning-bg text-[11px] font-medium text-panora-warning-text shrink-0">
                {s.aValider} à valider
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
