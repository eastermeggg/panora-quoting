"use client";

/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";
import { FlowerOutline, FlowerMark } from "./ui";

/* Right-hand visual panel of the onboarding screens: deep green background,
 * aurora gradient strip and colorful landscape at the bottom, with a
 * per-step floating illustration layered on top (Figma "Login visual"). */

export type RightPanelVariant = "flower" | "workspace" | "veos" | "agents";

export function RightPanel({
  variant,
  topRight,
  org,
}: {
  variant: RightPanelVariant;
  topRight?: React.ReactNode;
  /** When set, the workspace preview shows this org instead of the generic placeholder. */
  org?: { name: string; initial: string };
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[10px] border border-[rgba(34,32,26,0.15)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-[#0b2621]">
      {/* Sky: deep green with the outlined flower watermark */}
      <div className="absolute inset-x-0 top-0 h-[61%] bg-[#0b2621]">
        {variant === "flower" && (
          <FlowerOutline className="absolute left-1/2 top-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
      {/* Aurora gradient strip + landscape */}
      <img
        src="/onboarding/empty-state-gradient.jpg"
        alt=""
        className="absolute inset-x-0 top-[53%] h-[8%] w-full object-cover"
      />
      <img
        src="/onboarding/empty-state-landscape.jpg"
        alt=""
        className="absolute inset-x-0 top-[61%] h-[39%] w-full object-cover"
      />

      {topRight && (
        <div className="absolute right-5 top-5">{topRight}</div>
      )}

      {variant === "workspace" && <WorkspacePreview org={org} />}
      {variant === "veos" && <VeosPreview />}
      {variant === "agents" && <AgentsPreview />}
    </div>
  );
}

/* ---- Workspace step: floating sidebar preview ---- */

function WorkspacePreview({ org }: { org?: { name: string; initial: string } }) {
  const items = [
    "Centre de pilotage",
    "Assistant cotation",
    "Assistant analyse",
    "Assistant support",
  ];
  return (
    <div className="absolute left-1/2 top-1/2 w-[308px] -translate-x-1/2 -translate-y-1/2 rounded-[14px] border border-black/10 bg-[#f9f8f9] p-3.5 shadow-[0px_29px_29px_0px_rgba(0,0,0,0.02),0px_7px_16px_0px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-1.5 px-2 py-2">
        <FlowerMark className="w-[18px] h-[18px]" />
        <span className="font-serif text-[17px] text-panora-text">Panora</span>
      </div>
      <div className="mt-1 flex items-center gap-3 rounded-lg bg-panora-btn-secondary p-2.5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-[10px] border-2 border-[rgba(34,32,26,0.1)] text-[13px] font-semibold text-white"
          style={{ background: org ? "#6d5ef0" : "#173c2d" }}
        >
          {org?.initial ?? "C"}
        </span>
        <span className="flex-1 text-[15px] font-medium text-panora-text">
          {org?.name ?? "Votre cabinet"}
        </span>
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-panora-text-secondary">
          <path d="M5 6l3-3 3 3M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="mt-4 px-2 text-[15px] font-medium text-panora-text-secondary">
        Vos assistants IA
      </p>
      <ul className="mt-1">
        {items.map((label) => (
          <li
            key={label}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[16px] font-medium text-panora-text-secondary"
          >
            <span className="h-2 w-2 rounded-full bg-panora-green/60" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- VEOS step: sync illustration ---- */

function VeosPreview() {
  return (
    <div className="absolute left-1/2 top-1/2 flex w-[300px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5">
      <div className="flex items-center justify-center rounded-[14px] border border-black/10 bg-white px-7 py-5 shadow-[0px_7px_16px_0px_rgba(0,0,0,0.06)]">
        <img src="/logos/veos.svg" alt="VEOS" className="h-9" />
      </div>
      <div className="flex items-center gap-3 rounded-[14px] border border-black/10 bg-white p-4 shadow-[0px_7px_16px_0px_rgba(0,0,0,0.06)]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#173c2d]">
          <FlowerMark className="h-5 w-5" color="#ffffff" />
        </span>
        <p className="text-[13px] leading-5 text-panora-text">
          Panora synchronise vos clients, contrats et documents.
        </p>
      </div>
      <div className="flex flex-col items-center">
        <span className="z-10 rounded-full bg-[#173c2d] px-3.5 py-1.5 text-[12px] font-medium text-white shadow-[0px_2px_6px_rgba(0,0,0,0.25)]">
          Assistants IA prêts à agir
        </span>
        <div className="-mt-3 w-[268px] rounded-[14px] border border-black/10 bg-white pt-5 shadow-[0px_7px_16px_0px_rgba(0,0,0,0.06)]">
          {[
            { hint: "Client retrouvé : Atelier Arkos", agent: "Dossier pré-rempli" },
            { hint: "Contrat RC Pro détecté", agent: "Analyse prête à lancer" },
          ].map((row, i) => (
            <div
              key={row.hint}
              className={cn(
                "px-4 py-3",
                i > 0 && "border-t border-panora-border"
              )}
            >
              <p className="text-[12px] leading-4 text-panora-text-secondary">
                {row.hint}
              </p>
              <p className="mt-1 text-[13px] font-medium text-panora-text">
                {row.agent}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Agents / Invite steps: "pilotez vos assistants" cards ---- */

function AgentsPreview() {
  return (
    <div className="absolute left-1/2 top-1/2 w-[324px] -translate-x-1/2 -translate-y-1/2">
      <p className="mb-4 text-[16px] font-medium text-white">
        Pilotez vos assistants IA
      </p>
      <div className="flex flex-col gap-4">
        <AgentCard
          icon="/onboarding/icons/courrier.png"
          name="Agent Cotation"
          badge={{ label: "2/4 devis reçus", tone: "purple" }}
        >
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border border-panora-border bg-[#e6e0f8]" />
            <span className="text-[13px] text-panora-text">Nouveau Monde</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="rounded-md bg-panora-tag px-2 py-0.5 text-[12px] text-panora-text-secondary">
              Hommes-clés
            </span>
            <Progress value={0.55} color="#6d28a8" />
          </div>
        </AgentCard>
        <AgentCard
          icon="/onboarding/icons/loupe.png"
          name="Agent Analyse"
          badge={{ label: "Comparaison prête", tone: "orange" }}
        >
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border border-panora-border bg-[#e6e0f8]" />
            <span className="text-[13px] text-panora-text">Lebrun & Associées</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="rounded-md bg-panora-tag px-2 py-0.5 text-[12px] text-panora-text-secondary">
                RC Pro
              </span>
              <span className="rounded-md bg-panora-tag px-2 py-0.5 text-[12px] text-panora-text-secondary">
                Cyber
              </span>
            </div>
            <Progress value={0.8} color="#173c2d" />
          </div>
        </AgentCard>
        <AgentCard icon="/onboarding/icons/cloche.png" name="Agent de support">
          <p className="text-[13px] leading-5 text-panora-text">
            Demande d&apos;attestation RC Pro. L&apos;agent a envoyé le document
            d&apos;attestation.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-4 w-4 rounded border border-panora-border bg-[#efeacb]" />
            <span className="text-[13px] text-panora-text">Atelier Arkos</span>
          </div>
        </AgentCard>
      </div>
    </div>
  );
}

function AgentCard({
  icon,
  name,
  badge,
  children,
}: {
  icon: string;
  name: string;
  badge?: { label: string; tone: "purple" | "orange" };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-black/10 bg-white shadow-[0px_7px_16px_0px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2.5 border-b border-panora-border px-4 py-3">
        <img src={icon} alt="" className="h-7 w-7 object-contain" />
        <span className="flex-1 text-[14px] font-medium text-panora-text">
          {name}
        </span>
        {badge && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[12px] font-medium",
              badge.tone === "purple"
                ? "bg-[#f1e6fb] text-[#6d28a8]"
                : "bg-panora-warning-bg text-panora-warning-text"
            )}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function Progress({ value, color }: { value: number; color: string }) {
  return (
    <span className="inline-block h-1.5 w-20 overflow-hidden rounded-full bg-panora-border">
      <span
        className="block h-full rounded-full"
        style={{ width: `${Math.round(value * 100)}%`, background: color }}
      />
    </span>
  );
}
