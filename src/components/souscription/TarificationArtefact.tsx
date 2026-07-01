"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dossier, Draft } from "@/data/souscription-mock";
import { TarificationSynthese } from "./TarificationSynthese";
import { DraftSection } from "./DraftSection";
import { FootActionBar } from "./FootActionBar";
import type { CopiloteApi } from "./useCopilote";

function formatEuros(n: number): string {
  return n.toLocaleString("fr-FR") + " €";
}

/** Canned "pourquoi hors appétit" panel for the /scenario-hors-appetit demo. */
function SimHorsAppetit() {
  return (
    <div className="rounded-xl border border-panora-error/30 bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-3.5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-panora-error" />
        <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
          Pourquoi hors appétit
        </h2>
      </div>
      <p className="text-[13px] text-panora-text leading-6">
        {
          "Après revue, l'activité est requalifiée hors du périmètre couvert par Hiscox (secteur exclu, guide_souscription 2.1). Le risque n'a pas sa place chez nous, quel que soit le prix."
        }
      </p>
      <div className="rounded-lg border border-panora-border bg-panora-drop px-3.5 py-3 flex items-center gap-1.5 text-[12px] leading-4">
        <span className="w-1.5 h-1.5 rounded-full bg-panora-green shrink-0" />
        <span className="text-panora-text-secondary">
          Disposition confirmée, sourcée · guide_souscription 2.1
        </span>
      </div>
      <p className="text-[13px] text-panora-text-secondary leading-6">
        {
          "On ne chiffre pas un risque hors appétit. Décidez dans la barre d'action, en pied d'écran."
        }
      </p>
    </div>
  );
}

/**
 * The artefact side of the tarification screen: the opinionated synthèse, the
 * boxed "Le projet" total, the per-product draft sections, and the sticky foot
 * action bar. All mutable state comes from `useCopilote` so the co-pilote chat
 * (a full-height sibling rail) acts on the very same draft.
 */
export function TarificationArtefact({
  dossier,
  draft,
  api,
}: {
  dossier: Dossier;
  draft: Draft;
  api: CopiloteApi;
}) {
  const {
    sections,
    sectionState,
    confirmed,
    openPoints,
    hasPieces,
    clean,
    simState,
    prepareEnvoi,
    onOpenPoint,
    confirmAllPoints,
    postAssistant,
  } = api;

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-panora-bg">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[700px] mx-auto px-6 py-6 flex flex-col gap-4">
          {simState === "hors_appetit" ? (
            <SimHorsAppetit />
          ) : (
            <>
              <TarificationSynthese
                dossier={dossier}
                draft={draft}
                confirmed={confirmed}
                onOpenPoint={onOpenPoint}
              />

              <div className="rounded-xl border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-5 py-3.5 flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-panora-text">
                  Le projet
                </span>
                {draft.primeFinale > 0 ? (
                  <span className="text-[18px] font-semibold text-panora-text tabular-nums leading-6">
                    {formatEuros(draft.primeFinale)} HT
                  </span>
                ) : (
                  <span className="text-[12px] font-medium text-panora-warning-text">
                    Soumission assureur · pas de chiffrage délégué
                  </span>
                )}
              </div>

              {sections.map((s) => (
                <DraftSection key={s.key} section={s} state={sectionState} />
              ))}
            </>
          )}
        </div>
      </div>

      {simState === "hors_appetit" ? (
        <FootActionBar status="Hors appétit : on ne chiffre pas ce risque">
          <button
            type="button"
            onClick={() => postAssistant("Refus enregistré.")}
            className="btn-primary inline-flex items-center justify-center h-9 px-4 text-[13px] font-semibold leading-5"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => postAssistant("Renvoyé au comité de souscription.")}
            className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg border border-panora-border text-[13px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
          >
            Renvoyer au comité
          </button>
        </FootActionBar>
      ) : simState === "escalade" ? (
        <FootActionBar status="Dépassement de mandat : escalade requise, export gelé">
          <button
            type="button"
            onClick={() =>
              postAssistant("Dossier escaladé à un souscripteur senior.")
            }
            className="btn-primary inline-flex items-center justify-center h-9 px-4 text-[13px] font-semibold leading-5"
          >
            Escalader
          </button>
        </FootActionBar>
      ) : (
        <FootActionBar
          status={
            openPoints.length > 0
              ? `${openPoints.length} point${openPoints.length > 1 ? "s" : ""} ouvert${openPoints.length > 1 ? "s" : ""} à confirmer avant l'envoi`
              : hasPieces
                ? "Projet propre, prêt à préparer l'envoi"
                : "Projet propre, en attente des pièces"
          }
        >
          {openPoints.length > 0 ? (
            <button
              type="button"
              onClick={confirmAllPoints}
              className="btn-primary inline-flex items-center justify-center h-9 px-4 text-[13px] font-semibold leading-5"
            >
              Confirmer les points
            </button>
          ) : (
            <button
              type="button"
              onClick={prepareEnvoi}
              disabled={!clean}
              className={cn(
                "btn-primary inline-flex items-center justify-center h-9 px-4 text-[13px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                !clean && "opacity-40 cursor-not-allowed pointer-events-none"
              )}
            >
              Préparer l&apos;envoi
            </button>
          )}
        </FootActionBar>
      )}
    </div>
  );
}
