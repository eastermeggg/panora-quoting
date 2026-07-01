"use client";

import { useState } from "react";
import { AlertTriangle, FileText } from "lucide-react";
import {
  facetChips,
  getRuleWithSource,
  type Appetit,
} from "@/data/souscription-engine";
import { AppetitBadge } from "./AppetitBadge";
import { FootActionBar } from "./FootActionBar";

/**
 * Body for a refused demande: hors appétit. Shows the sourced "pourquoi", not a
 * chiffrage (appétit is binary now — dans or hors, no "à vérifier"). The
 * decision lives in the foot action bar (Refuser / Renvoyer au comité).
 */
export function AppetitReason({ appetit }: { appetit: Appetit }) {
  const rw = getRuleWithSource(appetit.ruleId);
  const chips = rw ? facetChips(rw.rule) : [];
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  return (
    <div className="flex-1 min-h-0 flex">
      {/* Left — pourquoi, sourcé + foot action bar */}
      <div className="flex-1 min-w-0 flex flex-col bg-panora-bg">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-[640px] mx-auto px-6 py-6 flex flex-col gap-4">
            <div className="rounded-xl border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-3.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-panora-error" />
                <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
                  Pourquoi hors appétit
                </h2>
              </div>

              <p className="text-[13px] text-panora-text leading-6">
                {appetit.reason}
              </p>

              {rw && (
                <div className="rounded-lg border border-panora-border bg-panora-drop px-3.5 py-3 flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-[12px] leading-4">
                    <span className="text-panora-text-secondary">Posée par</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-panora-text">
                      <FileText className="w-3 h-3 text-panora-text-secondary" />
                      {rw.source?.filename ?? "source inconnue"}
                    </span>
                    <span className="text-panora-text-secondary">
                      · {rw.rule.sourceLocation}
                    </span>
                  </div>
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
                  <div className="flex items-center gap-1.5 text-[12px] leading-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-panora-green shrink-0" />
                    <span className="text-panora-text-secondary">
                      Disposition confirmée, sourcée
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[13px] text-panora-text-secondary leading-6">
                {
                  "On ne chiffre pas un risque hors appétit. Refusez-le, ou surchargez depuis le co-pilote si vous avez une raison documentée."
                }
              </p>
            </div>
          </div>
        </div>

        <FootActionBar
          status={actionMsg ?? "Hors appétit : on ne chiffre pas ce risque"}
        >
          <button
            type="button"
            onClick={() => setActionMsg("Refus enregistré.")}
            className="btn-primary inline-flex items-center justify-center h-9 px-4 text-[13px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => setActionMsg("Renvoyé au comité de souscription.")}
            className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg border border-panora-border text-[13px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
          >
            Renvoyer au comité
          </button>
        </FootActionBar>
      </div>

      {/* Right — the verdict recap */}
      <div className="w-[360px] shrink-0 border-l border-panora-border bg-white px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-panora-text-muted uppercase tracking-[0.06em] leading-4">
          Verdict
        </div>
        <div className="rounded-lg border border-panora-error/30 bg-panora-error-bg px-3.5 py-3 flex flex-col gap-2">
          <AppetitBadge verdict={appetit.verdict} className="self-start" />
          <span className="text-[13px] font-semibold leading-5 text-panora-text">
            Refus suggéré
          </span>
          <span className="text-[12px] text-panora-text-secondary leading-4">
            Quel que soit le prix : le risque est hors du périmètre couvert.
          </span>
        </div>
        <p className="text-[12px] text-panora-text-muted leading-4">
          La décision se prend dans la barre d&apos;action, en pied de l&apos;écran.
        </p>
      </div>
    </div>
  );
}
