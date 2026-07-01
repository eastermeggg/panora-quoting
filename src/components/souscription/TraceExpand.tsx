"use client";

import { cn } from "@/lib/utils";
import { getRuleWithSource, facetChips } from "@/data/souscription-engine";
import type { OverrideRecord } from "./types";

/**
 * Inline provenance for a priced line: which rule and which document posed it,
 * its facets, and its ingestion status. If the line has been overridden, the
 * traced override (origine -> retenue, auteur, horodatage) is shown here too,
 * with the optional "Appliquer au vault" escalation.
 */
export function TraceExpand({
  ruleId,
  override,
  onApplyToVault,
}: {
  ruleId: string;
  override?: OverrideRecord | null;
  onApplyToVault?: () => void;
}) {
  const rw = getRuleWithSource(ruleId);
  if (!rw) return null;
  const { rule, source } = rw;
  const chips = facetChips(rule);
  const confirmed = rule.status === "confirmee";

  return (
    <div className="mt-2 mb-1 rounded-lg border border-panora-border bg-panora-drop px-3.5 py-3 flex flex-col gap-2.5">
      {/* Posée par <source> · <emplacement> */}
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-[12px] leading-4">
        <span className="text-panora-text-secondary">Posée par</span>
        <span className="font-mono text-[11px] text-panora-text">
          {source?.filename ?? "source inconnue"}
        </span>
        <span className="text-panora-text-muted">· {rule.sourceLocation}</span>
      </div>

      {/* Facettes */}
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center h-5 px-2 rounded-[6px] bg-white border border-panora-border text-[11px] font-medium text-panora-text-secondary"
          >
            {c}
          </span>
        ))}
      </div>

      {/* Statut d'ingestion */}
      <div className="flex items-center gap-1.5 text-[12px] leading-4">
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            confirmed ? "bg-panora-green" : "bg-panora-warning"
          )}
        />
        <span className="text-panora-text-secondary">
          {confirmed
            ? "Source confirmée, overridable"
            : "À valider, exclue du moteur"}
        </span>
      </div>

      {/* Trace de l'override */}
      {override && (
        <div className="mt-0.5 pt-2.5 border-t border-panora-border flex flex-col gap-1.5">
          <div className="text-[12px] leading-4 text-panora-text-secondary">
            Override manuel ·{" "}
            <span className="text-panora-text-muted line-through">
              {override.original}
            </span>{" "}
            → <span className="text-panora-text font-medium">{override.value}</span>
          </div>
          <div className="text-[11px] text-panora-text-muted leading-4">
            {override.author} · {override.at}
          </div>
          {override.appliedToVault ? (
            <span className="text-[11px] font-medium text-panora-green-dark">
              Correction proposée au vault
            </span>
          ) : (
            onApplyToVault && (
              <button
                type="button"
                onClick={onApplyToVault}
                className="self-start text-[12px] font-medium text-panora-green hover:text-panora-green-dark transition-colors"
              >
                Appliquer au vault
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
