"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { produitsLabel } from "@/data/souscription-engine";
import type { Dossier } from "@/data/souscription-mock";

/** "4 200 000 €" -> "4,2 M€" / "12 000 000 €" -> "12 M€" */
function compactCa(n: number): string {
  if (n >= 1_000_000) {
    return (
      (n / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) +
      " M€"
    );
  }
  if (n >= 1_000) return Math.round(n / 1000).toLocaleString("fr-FR") + " k€";
  return n.toLocaleString("fr-FR") + " €";
}

/**
 * Single-line dossier identity for the souscription headers: a back affordance,
 * the dossier id and insured name (always visible), then the key profile facts
 * (truncate on overflow).
 */
export function DossierIdentityLine({ dossier }: { dossier: Dossier }) {
  const ins = dossier.insured;
  const principalLabel = produitsLabel([dossier.produitsDemandes[0]]);
  return (
    <div className="flex items-center gap-2 text-[13px] leading-5 min-w-0">
      <Link
        href="/souscription"
        title="Retour à la souscription"
        aria-label="Retour à la souscription"
        className="shrink-0 text-panora-text-muted hover:text-panora-text transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>
      <span className="shrink-0 text-panora-text-muted">{dossier.id}</span>
      <span className="shrink-0 text-panora-text-muted">·</span>
      <span className="shrink-0 font-medium text-panora-text">{ins.raison}</span>
      <span className="truncate text-panora-text-muted">
        · NAF {ins.naf} · CA {compactCa(ins.caHT)} · {ins.effectif} sal. ·{" "}
        {principalLabel}
      </span>
    </div>
  );
}
