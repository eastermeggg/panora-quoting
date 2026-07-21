"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useConfiguredExtranets } from "@/data/settings-mock";
import { FeatureFilterBar, type Scope } from "@/components/quoting/FeatureFilterBar";
import { FeatureEmptyState, TeamActivityBanner } from "@/components/quoting/FeatureEmptyState";
import { QuotingReadyContent } from "@/components/quoting/QuotingReadyContent";
import { CotationHeaderActions } from "@/components/quoting/CotationHeaderActions";

/* Quoting dashboard EMPTY STATE — same reference structure as analyse /
 * comparaison (Figma 9919-19731): agent header + filter bar (Collaborateur ·
 * Statuts · Produits · Réinit.) + a discreet team-activity banner + a single
 * centered block. Cotation is e-mail-driven, so its one primary CTA opens the
 * how-to modal (address + steps + ideal e-mail) rather than creating in-app. */

const TEAM_COTATIONS: { author: string; client: string; product: string; date: string }[] = [
  { author: "Marie Dubois", client: "Marble Tech", product: "RC Pro", date: "18 juil." },
  { author: "Karim Benali", client: "GreenWay", product: "Multirisque", date: "16 juil." },
  { author: "Sofiane Roux", client: "Digital Solutions", product: "Flotte auto", date: "12 juil." },
];
const TEAM_NAMES = TEAM_COTATIONS.map((c) => c.author);

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function QuotingEmptyState() {
  const [scope, setScope] = useState<Scope>("moi");
  const configured = useConfiguredExtranets();

  const teamCount = TEAM_COTATIONS.length;
  const teamActivity = {
    text: `${teamCount} ${teamCount > 1 ? "cotations" : "cotation"}`,
    avatars: TEAM_NAMES,
    onSee: () => setScope("equipe"),
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Header — agent name (matches the analyse list header) */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[#e5e7eb] bg-white px-5 py-3">
        <Send className="h-[17px] w-[17px] text-panora-text-muted" />
        <h1 className="font-serif text-[15px] font-medium text-panora-text">
          Assistant cotation
        </h1>
        <div className="flex-1" />
        <CotationHeaderActions />
      </div>

      <FeatureFilterBar
        scope={scope}
        onScopeChange={setScope}
        colleagues={TEAM_NAMES}
        onReset={() => setScope("moi")}
      />

      {scope === "equipe" ? (
        // "Voir" → the team's recent cotations (read-only, discreet)
        <div className="flex min-h-0 flex-1 flex-col">
          <TeamActivityBanner {...teamActivity} />
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <ul className="mx-auto flex w-full max-w-[760px] flex-col gap-2">
              {TEAM_COTATIONS.map((c) => (
                <li
                  key={c.author + c.client}
                  className="flex items-center gap-3 rounded-[10px] border border-panora-border bg-white px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panora-green/15 text-[10px] font-semibold text-panora-green-dark">
                    {initials(c.author)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-panora-text">
                      {c.client}{" "}
                      <span className="font-normal text-panora-text-secondary">
                        · {c.product}
                      </span>
                    </p>
                    <p className="truncate text-[12px] text-panora-text-secondary">
                      Par {c.author}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] text-panora-text-muted">
                    {c.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <FeatureEmptyState
          illustration="/onboarding/icons/courrier.png"
          title="Lancez votre première cotation"
          subtitle="La cotation se fait par e-mail : transférez la demande de votre client, l'agent extrait les informations et interroge les assureurs pour vous."
          team={teamActivity}
          slot={<QuotingReadyContent configuredExtranets={configured} />}
        />
      )}
    </div>
  );
}
