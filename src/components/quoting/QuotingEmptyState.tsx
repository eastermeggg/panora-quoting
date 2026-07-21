"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { useConfiguredExtranets } from "@/data/settings-mock";
import { FeatureFilterBar, type Scope } from "@/components/quoting/FeatureFilterBar";
import { QuotingReadyContent } from "@/components/quoting/QuotingReadyContent";
import { TeamProofRow } from "@/components/quoting/FeatureEmptyState";

/* Quoting dashboard EMPTY STATE — same systematized shell + 3-zone skeleton as
 * the analyse/comparaison empty state (agent-name header + filter bar, a green
 * Zone-1 activation, the feature content, then a quiet Zone-3 team-proof row).
 * Cotation's only allowed divergence is Zone 1's body: it's e-mail-driven, so
 * instead of a "New" CTA it shows the "prêt à coter" how-to (address + ideal
 * email), shared with the onboarding's last step. "Ce que fait l'équipe" is
 * demoted to the same quiet row as everywhere else — never a primary action. */

const TEAM = ["Marie Dubois", "Karim", "Sofiane Roux"];
const POINTS = [
  "Devis reçus par e-mail",
  "Suivi automatique des retours",
  "Plusieurs assureurs en parallèle",
];

export function QuotingEmptyState() {
  const configured = useConfiguredExtranets();
  const [scope, setScope] = useState<Scope>("moi");

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      {/* Header — agent name (matches the analyse list header) */}
      <div className="shrink-0 border-b border-[#e5e7eb] bg-white px-5 py-3 flex items-center gap-2.5">
        <Send className="w-[17px] h-[17px] text-panora-text-muted" />
        <h1 className="text-[15px] font-medium text-panora-text font-serif">
          Assistant cotation
        </h1>
      </div>

      <FeatureFilterBar scope={scope} onScopeChange={setScope} colleagues={[]} />

      {/* Content — same 3-zone skeleton as analyse/comparaison */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-5 px-6 py-10">
          {/* Zone 1 — Activation (cotation variant: the e-mail ritual) */}
          <div className="rounded-[16px] border border-panora-green-border bg-panora-green-light/50 px-6 py-7 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <Send className="h-7 w-7 text-panora-green-dark" strokeWidth={1.6} />
            </span>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-panora-green-dark">
              Assistant cotation
            </p>
            <h2 className="mt-1 font-serif text-[24px] leading-8 tracking-[-0.3px] text-panora-text">
              Votre assistant cotation est prêt à coter
            </h2>
            <p className="mx-auto mt-2 max-w-[460px] text-[13px] leading-5 text-panora-text-secondary">
              La cotation se fait par e-mail — voici comment lancer votre
              première.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              {POINTS.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 text-[12px] text-panora-text-secondary"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-panora-green-light">
                    <Check
                      className="h-2.5 w-2.5 text-panora-green-dark"
                      strokeWidth={3}
                    />
                  </span>
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Feature content — the cotation how-to (address + ideal email) */}
          <QuotingReadyContent configuredExtranets={configured} />

          {/* Zone 3 — Team proof (quiet, demoted from the old top banner) */}
          <TeamProofRow
            teamCount={24}
            teamAvatars={TEAM}
            onSeeTeam={() => setScope("equipe")}
            noun={["cotation", "cotations"]}
          />
        </div>
      </div>
    </div>
  );
}
