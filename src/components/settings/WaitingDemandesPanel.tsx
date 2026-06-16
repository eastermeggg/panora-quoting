"use client";

import { Car, Shield, Building2, Inbox, Check, Mail, Hand } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PendingDemande } from "@/data/cotations-store";

function ProductIcon({ icon }: { icon: PendingDemande["productIcon"] }) {
  const Glyph = icon === "car" ? Car : icon === "building" ? Building2 : Shield;
  return <Glyph className="w-3.5 h-3.5" />;
}

interface WaitingDemandesPanelProps {
  demandes: PendingDemande[];
  /** "queued" before activation (will be launched) · "launched" after success. */
  mode: "queued" | "launched";
}

/**
 * Shows the stock of cotation requests waiting on this insurer's session.
 * Before activation it frames them as queued ("seront lancées dès l'ouverture");
 * once the session is active it confirms the batch went out.
 */
export function WaitingDemandesPanel({
  demandes,
  mode,
}: WaitingDemandesPanelProps) {
  const n = demandes.length;
  if (n === 0) return null;

  const launched = mode === "launched";

  return (
    <div
      className={cn(
        "rounded-lg border p-3 flex flex-col gap-2.5 transition-colors",
        launched
          ? "border-panora-green/25 bg-panora-green-light/40"
          : "border-panora-warning-text/20 bg-[rgba(242,221,193,0.3)]"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-2",
          launched ? "text-panora-green-dark" : "text-panora-warning-text"
        )}
      >
        {launched ? (
          <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} />
        ) : (
          <Inbox className="w-4 h-4 shrink-0" />
        )}
        <span className="text-[13px] font-medium leading-5 flex-1">
          {launched
            ? `${n} demande${n > 1 ? "s" : ""} lancée${n > 1 ? "s" : ""}`
            : `${n} demande${n > 1 ? "s" : ""} en attente de cette session`}
        </span>
      </div>

      {/* Framing line */}
      <p
        className={cn(
          "text-[12px] leading-[18px]",
          launched
            ? "text-panora-green-dark/80"
            : "text-panora-warning-text/85"
        )}
      >
        {launched
          ? "Elles partent maintenant chez l'assureur. Suivez-les depuis « En cours »."
          : "Capturées mais en attente — elles seront lancées automatiquement dès l'ouverture de la session."}
      </p>

      {/* List */}
      <ul className="flex flex-col gap-1.5">
        {demandes.map((d) => (
          <li
            key={d.cotationId + d.cotationRef}
            className="flex items-center gap-2.5 rounded-md bg-white/70 border border-white px-2.5 py-1.5"
          >
            <span className="shrink-0 w-6 h-6 rounded-md bg-panora-secondary/70 flex items-center justify-center text-panora-text-secondary">
              <ProductIcon icon={d.productIcon} />
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] font-medium text-panora-text leading-4 truncate">
                {d.client}
              </span>
              <span className="text-[11px] text-panora-text-muted leading-4 truncate">
                {d.product} · {d.cotationRef}
              </span>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 text-[11px] text-panora-text-muted">
              {d.createdVia === "email" ? (
                <Mail className="w-3 h-3" />
              ) : (
                <Hand className="w-3 h-3" />
              )}
              {d.createdAt}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
