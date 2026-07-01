"use client";

import { CheckCircle2, FileText, Mail, Paperclip } from "lucide-react";
import { produitsLabel } from "@/data/souscription-engine";
import type { Dossier } from "@/data/souscription-mock";
import { useFormState } from "@/data/souscription-store";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function frDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/**
 * Pièces tab: the original broker mail and its attachments, read-only. The
 * bottom of the traceability trail, every tarifé value can be traced back to a
 * piece that fed it.
 */
export function PiecesTab({ dossier }: { dossier: Dossier }) {
  const form = useFormState(`souscription-${dossier.id}`);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-[760px] mx-auto px-6 py-6 flex flex-col gap-4">
        {/* Mail courtier d'origine */}
        <div className="rounded-xl border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-panora-border flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-panora-green-light flex items-center justify-center shrink-0">
              <Mail className="w-3.5 h-3.5 text-panora-green-dark" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-panora-text leading-4">
                Mail courtier
              </span>
              <span className="text-[12px] text-panora-text-secondary leading-4">
                {dossier.courtier} · {frDate(dossier.recuLe)}
              </span>
            </div>
          </div>
          <div className="px-5 py-4 text-[13px] text-panora-text leading-6">
            {`Bonjour, demande ${produitsLabel(dossier.produitsDemandes)} pour ${dossier.insured.raison} (${dossier.insured.activite}). Merci de nous adresser une proposition. Pièces jointes ci-dessous.`}
          </div>
        </div>

        {/* Pièces jointes */}
        <div className="rounded-xl border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-1.5 mb-3 text-[11px] font-medium text-panora-text-muted uppercase tracking-[0.06em] leading-4">
            <Paperclip className="w-3.5 h-3.5" />
            Pièces jointes ({dossier.pieces.length})
          </div>
          {dossier.pieces.length > 0 ? (
            <div className="flex flex-col">
              {dossier.pieces.map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-2.5 py-2 border-b border-panora-border/60 last:border-0"
                >
                  <div className="bg-panora-secondary rounded p-1 shrink-0">
                    <FileText className="w-3.5 h-3.5 text-panora-text-secondary" />
                  </div>
                  <span className="text-[13px] font-mono text-panora-text truncate">
                    {p}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-panora-text-secondary">
              Aucune pièce jointe au mail d&apos;origine.
            </p>
          )}
        </div>

        {/* Formulaire renvoyé au courtier */}
        {(form.sent || form.completed) && (
          <div className="rounded-lg border border-panora-green-border bg-panora-green-light/50 px-4 py-2.5 flex items-center gap-2 text-[13px] text-panora-green-dark">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {form.completed
              ? "Formulaire renvoyé au courtier, complété."
              : `Formulaire envoyé à ${dossier.courtier}, en attente de complétion.`}
          </div>
        )}
      </div>
    </div>
  );
}
