"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { useConfiguredExtranets } from "@/data/settings-mock";
import { currentUser } from "@/data/mock";
import { FeatureFilterBar, type Scope } from "@/components/quoting/FeatureFilterBar";
import { QuotingReadyContent } from "@/components/quoting/QuotingReadyContent";
import { FlowerOutline } from "@/components/signup/ui";

const TEAM = ["Marie Dubois", "Karim", "Sofiane Roux"];
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/* Quoting dashboard EMPTY STATE — same systematized shell as the other
 * agents (agent-name header + filter bar + content). The content is the
 * "prêt à coter" block (how-to + address + ideal email), shared with the
 * onboarding's last step. Cotation is e-mail-driven, so there's no "New"
 * button — the address IS the entry point. */
export function QuotingEmptyState() {
  const configured = useConfiguredExtranets();
  const [scope, setScope] = useState<Scope>("moi");

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      {/* Header — agent name (matches the analyse list header) */}
      <div className="shrink-0 border-b border-[#e5e7eb] bg-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileText className="w-[17px] h-[17px] text-panora-text-muted" />
          <h1 className="text-[15px] font-medium text-panora-text font-serif">
            Assistant cotation
          </h1>
        </div>
      </div>

      <FeatureFilterBar scope={scope} onScopeChange={setScope} colleagues={[]} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto w-full max-w-[1040px] flex flex-col gap-8">
          {/* Bold branded team-proof banner — on top, sets the tone */}
          <TeamProofBanner />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-panora-green-dark">
              Prise en main
            </p>
            <h2 className="mt-1 font-serif text-[26px] leading-8 tracking-[-0.3px] text-panora-text">
              Votre assistant cotation est prêt à coter.
            </h2>
            <p className="mt-1.5 text-[13px] leading-5 text-panora-text-secondary">
              La cotation se fait par e-mail — voici comment lancer votre
              première.
            </p>
          </div>

          <QuotingReadyContent configuredExtranets={configured} />
        </div>
      </div>
    </div>
  );
}

/* Deep-green brand banner — the hero stat "24" is the focal point, with the
 * flower watermark, a live pulse and the team's real faces. Confident, on-brand
 * (quiet authority), not a generic gradient. */
function TeamProofBanner() {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-black/15 bg-[#0b2621] px-6 py-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <FlowerOutline
        className="pointer-events-none absolute -right-10 -top-12 w-[190px] opacity-90"
        stroke="#2c5343"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 160% at 0% 50%, rgba(0,162,114,0.22) 0%, rgba(0,162,114,0) 55%)",
        }}
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-[560px]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-panora-green animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-panora-green/90">
              Votre équipe carbure
            </span>
          </div>
          <h2 className="mt-2 font-serif text-[23px] leading-7 tracking-[-0.2px] text-white">
            Le relais {currentUser.cabinet} est déjà bien rôdé.
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-white/70">
            Vos collègues cotent par e-mail chaque semaine. Envoyez votre
            première demande — l&apos;assistant s&apos;occupe du reste.
          </p>
          <span className="mt-4 flex items-center gap-2.5">
            <span className="flex -space-x-2.5">
              {TEAM.map((name) => (
                <span
                  key={name}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0b2621] bg-panora-green-light text-[10px] font-semibold text-panora-green-dark"
                >
                  {initials(name)}
                </span>
              ))}
            </span>
            <span className="text-[12px] text-white/60">
              {TEAM.join(", ")} et 5 autres
            </span>
          </span>
        </div>

        {/* Hero stat */}
        <div className="flex shrink-0 items-end gap-3 border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
          <span className="font-serif text-[56px] leading-[0.9] text-white">
            24
          </span>
          <span className="pb-1 text-[13px] leading-4 text-white/70">
            cotations
            <br />
            ce mois
          </span>
        </div>
      </div>
    </div>
  );
}
