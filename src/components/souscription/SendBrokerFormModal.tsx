"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Mail, X } from "lucide-react";
import type { Dossier } from "@/data/souscription-mock";

function isDocManque(champ: string): boolean {
  return /bilan|liasse|pacte|questionnaire|justificatif|kbis|attestation/i.test(
    champ
  );
}

/**
 * Compose and send the standalone form to the broker. Lists the requested fields
 * (the dossier manques) and an editable message; sending is stubbed (demo). The
 * form itself reuses /client-form/[token] (resolved from the dossier).
 */
export function SendBrokerFormModal({
  open,
  dossier,
  onClose,
  onSent,
}: {
  open: boolean;
  dossier: Dossier;
  onClose: () => void;
  onSent: () => void;
}) {
  const [message, setMessage] = useState(
    `Bonjour,\n\nMerci de compléter les informations ci-dessous pour finaliser l'étude de ${dossier.insured.raison}.\n\nCordialement,\nHiscox`
  );

  if (!open) return null;

  const previewUrl = `/client-form/souscription-${dossier.id}?figmacapture=form`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[520px] mx-4 flex flex-col max-h-[90vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-panora-green" />
            <span className="text-[15px] font-semibold text-panora-text">
              Envoyer un formulaire au courtier
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-7 h-7 flex items-center justify-center rounded-md text-panora-text-muted hover:text-panora-text hover:bg-panora-drop transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-px bg-panora-border" />

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-panora-text-muted">Destinataire</span>
            <span className="text-[13px] font-medium text-panora-text">
              {dossier.courtier}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[12px] text-panora-text-muted">
              Informations demandées ({dossier.manques.length})
            </span>
            <div className="rounded-lg border border-panora-border divide-y divide-panora-border">
              {dossier.manques.map((m, i) => (
                <div
                  key={i}
                  className="px-3.5 py-2.5 flex items-center justify-between gap-3"
                >
                  <span className="text-[13px] text-panora-text">{m.champ}</span>
                  <span className="inline-flex items-center h-5 px-2 rounded-full bg-panora-secondary text-[11px] font-medium text-panora-text-secondary shrink-0">
                    {isDocManque(m.champ) ? "Document" : "Champ"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-panora-text-muted">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-[13px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:border-panora-green/40 resize-y"
            />
          </div>

          <Link
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-green hover:text-panora-green-dark w-fit"
          >
            Aperçu du formulaire
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-px bg-panora-border" />

        <div className="px-6 py-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 rounded-lg border border-panora-border text-[13px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSent}
            className="btn-primary inline-flex items-center gap-2 px-4 h-9 text-[13px] font-semibold leading-5"
          >
            <Mail className="w-3.5 h-3.5" />
            Envoyer le formulaire
          </button>
        </div>
      </div>
    </div>
  );
}
