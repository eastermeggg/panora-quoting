"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReferentielDoc } from "@/data/souscription-mock";

const KIND_LABELS: Record<ReferentielDoc["kind"], string> = {
  CG: "Conditions générales",
  modele_devis: "Modèle de devis",
  modele_CP: "Modèle de CP",
};

/** Product-bound référentiel: documents stored as-is, retrieved at export. */
export function ReferentielList({ docs }: { docs: ReferentielDoc[] }) {
  if (docs.length === 0) {
    return (
      <div className="rounded-xl border border-panora-border px-4 py-6 text-center text-[12px] text-panora-text-muted">
        Aucun document référencé.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-panora-border overflow-hidden">
      {docs.map((d, i) => (
        <div
          key={d.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            i > 0 && "border-t border-panora-border"
          )}
        >
          <FileText className="w-4 h-4 text-panora-text-muted shrink-0" />
          <span className="font-mono text-[12px] text-panora-text flex-1 min-w-0 truncate">
            {d.filename}
          </span>
          <span className="text-[12px] text-panora-text-muted hidden sm:inline">
            {KIND_LABELS[d.kind]}
          </span>
          <span className="inline-flex items-center h-5 px-2 rounded-full bg-panora-secondary text-[11px] font-medium text-panora-text-secondary shrink-0">
            {d.statut === "Reference" ? "Référence" : "Modèle"}
          </span>
        </div>
      ))}
    </div>
  );
}
