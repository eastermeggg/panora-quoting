"use client";

/* eslint-disable @next/next/no-img-element */

import type { LucideIcon } from "lucide-react";
import { Check, ScanSearch, Columns3 } from "lucide-react";

type SubFeature = { icon: LucideIcon; name: string; description: string };

type Agent = {
  id: string;
  icon: string;
  name: string;
  tagline: string;
  /** Cotation: a flat capabilities list. */
  capabilities?: string[];
  /** Analyse: two named sub-assistants, made explicit. */
  subFeatures?: SubFeature[];
};

/* Step "Découvrez vos assistants". Two active agents per spec: Agent Cotation
 * and Agent Analyse. The Analyse agent explicitly bundles TWO sub-assistants —
 * analyse de contrat + comparaison — shown as distinct modules so the broker
 * sees both. No upcoming/teaser agents; Agent Sinistre is never shown. */
export function StepAgents() {
  const agents: Agent[] = [
    {
      id: "cotation",
      icon: "/onboarding/icons/courrier.png",
      name: "Agent Cotation",
      tagline:
        "Il porte vos demandes de cotation de bout en bout, sur tous vos assureurs à la fois.",
      capabilities: [
        "Prépare la demande à partir des besoins du client",
        "Interroge vos assureurs sur leurs extranets, en parallèle",
        "Suit les retours de devis et vous alerte quand tout est prêt",
      ],
    },
    {
      id: "analyse",
      icon: "/onboarding/icons/loupe.png",
      name: "Agent Analyse",
      tagline:
        "Un même agent, deux sous-assistants qui transforment vos documents en une lecture claire.",
      subFeatures: [
        {
          icon: ScanSearch,
          name: "Analyse de contrat",
          description:
            "Décortique un contrat : garanties, exclusions, plafonds et franchises.",
        },
        {
          icon: Columns3,
          name: "Comparaison",
          description:
            "Met plusieurs devis en vis-à-vis dans une vue structurée, écart par écart.",
        },
      ],
    },
  ];

  return (
    <div className="flex w-full max-w-[512px] flex-col gap-6">
      <div>
        <h1 className="font-serif text-[30px] leading-9 tracking-[-0.3px] text-panora-text">
          Découvrez votre{" "}
          <span className="text-panora-green">nouvelle équipe</span>{" "}
          d&apos;assistants IA spécialisés
        </h1>
        <p className="mt-2 text-[13px] leading-5 text-panora-text-secondary">
          Deux assistants vous accompagnent dès aujourd&apos;hui.
          <br />
          Vous les pilotez depuis votre centre de pilotage, et gardez la main à
          chaque étape.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-[10px] border border-panora-border bg-white p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-start gap-4">
              <img
                src={agent.icon}
                alt=""
                className="h-12 w-12 shrink-0 object-contain"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[15px] font-medium text-panora-text">
                    {agent.name}
                  </span>
                  <span className="rounded-full bg-panora-green-light px-2.5 py-0.5 text-[12px] font-medium text-panora-green-dark">
                    {agent.subFeatures ? "2 sous-assistants" : "Inclus"}
                  </span>
                </div>
                <p className="mt-1 text-[13px] leading-5 text-panora-text-secondary">
                  {agent.tagline}
                </p>
              </div>
            </div>

            {agent.capabilities && (
              <ul className="mt-4 flex flex-col gap-2 border-t border-panora-border pt-4">
                {agent.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-panora-green-light">
                      <Check className="h-2.5 w-2.5 text-panora-green-dark" />
                    </span>
                    <span className="text-[13px] leading-5 text-panora-text">
                      {cap}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {agent.subFeatures && (
              <div className="mt-4 grid grid-cols-1 gap-3 border-t border-panora-border pt-4 sm:grid-cols-2">
                {agent.subFeatures.map((sf) => {
                  const SubIcon = sf.icon;
                  return (
                    <div
                      key={sf.name}
                      className="rounded-lg border border-panora-border bg-panora-drop/50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-panora-green-light text-panora-green-dark">
                          <SubIcon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <span className="text-[13px] font-medium text-panora-text">
                          {sf.name}
                        </span>
                      </div>
                      <p className="mt-2 text-[12px] leading-4 text-panora-text-secondary">
                        {sf.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
