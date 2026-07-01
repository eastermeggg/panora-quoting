"use client";

import { ArrowRight, Check, FileText, Gavel, Mail, Pencil, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardStatus, CopiloteCard } from "./copilote";

/**
 * A confirmable userAsk card. The co-pilote proposes; nothing mutates until the
 * souscripteur presses a deliberate, gated button here. Never a chat bubble.
 */
export function UserAskCard({
  card,
  status,
  onApply,
  onSecondary,
  onCancel,
}: {
  card: CopiloteCard;
  status: CardStatus;
  onApply: () => void;
  onSecondary?: () => void;
  onCancel: () => void;
}) {
  const resolved = status !== "proposed";

  const meta =
    card.kind === "modify"
      ? { icon: Pencil, label: "Modifier" }
      : card.kind === "create-rule"
        ? { icon: Gavel, label: "Proposition de règle" }
        : card.kind === "envoi"
          ? { icon: Send, label: "Envoi au courtier" }
          : { icon: Mail, label: "Relance courtier" };
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "self-start w-[92%] rounded-lg border bg-white overflow-hidden",
        resolved ? "border-panora-border opacity-80" : "border-panora-green/30"
      )}
    >
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-panora-border bg-panora-drop/60 text-[10px] font-semibold uppercase tracking-[0.06em] text-panora-text-secondary">
        <Icon className="w-3 h-3 text-panora-green-dark" />
        {meta.label}
      </div>

      <div className="px-3.5 py-3 flex flex-col gap-2">
        {card.kind === "modify" && (
          <>
            <span className="text-[13px] font-medium text-panora-text">
              {card.label}
            </span>
            <div className="flex items-center gap-2 text-[13px] tabular-nums">
              <span className="text-panora-text-muted line-through">
                {card.from}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
              <span className="font-semibold text-panora-text">{card.to}</span>
            </div>
            {card.consequence && (
              <p className="text-[12px] text-panora-warning-text leading-4">
                {card.consequence}
              </p>
            )}
          </>
        )}

        {card.kind === "create-rule" && (
          <>
            <p className="text-[13px] text-panora-text leading-5">{card.summary}</p>
            <p className="text-[12px] text-panora-text-secondary leading-4">
              Atterrit dans le vault, statut « à valider », source « décision du
              souscripteur ».
            </p>
          </>
        )}

        {card.kind === "relance" && (
          <>
            <p className="text-[13px] text-panora-text leading-5">
              Relancer {card.courtier} pour les pièces manquantes :
            </p>
            <ul className="flex flex-col gap-0.5">
              {card.missing.map((m) => (
                <li
                  key={m}
                  className="text-[12px] text-panora-text-secondary leading-4"
                >
                  · {m}
                </li>
              ))}
            </ul>
          </>
        )}

        {card.kind === "envoi" && (
          <>
            <p className="text-[13px] text-panora-text leading-5">
              Package prêt pour {card.courtier} :
            </p>
            <ul className="flex flex-col gap-1">
              {card.items.map((it) => (
                <li
                  key={it}
                  className="flex items-center gap-1.5 text-[12px] text-panora-text-secondary leading-4"
                >
                  <FileText className="w-3 h-3 text-panora-text-muted shrink-0" />
                  {it}
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-panora-text-muted leading-4">
              Objet : {card.objet}
            </p>
          </>
        )}
      </div>

      {resolved ? (
        <div className="px-3.5 py-2 border-t border-panora-border flex items-center gap-1.5 text-[12px] font-medium">
          {status === "cancelled" ? (
            <span className="text-panora-text-muted">Annulé</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-panora-green-dark">
              <Check className="w-3.5 h-3.5" />
              {status === "scoped" ? "Appliqué à ce dossier" : "Appliqué"}
            </span>
          )}
        </div>
      ) : (
        <div className="px-3.5 py-2.5 border-t border-panora-border flex items-center gap-2">
          <button
            type="button"
            onClick={onApply}
            className="btn-primary inline-flex items-center justify-center h-8 px-3.5 text-[12px] font-semibold leading-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {card.kind === "create-rule"
              ? "Créer la règle"
              : card.kind === "relance"
                ? "Envoyer la relance"
                : card.kind === "envoi"
                  ? "Envoyer au courtier"
                  : "Appliquer"}
          </button>
          {(card.kind === "create-rule" || card.kind === "envoi") && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-panora-border text-[12px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
            >
              {card.kind === "envoi" ? "Télécharger" : "Juste ce dossier"}
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-[12px] font-medium text-panora-text-muted hover:bg-panora-drop transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
