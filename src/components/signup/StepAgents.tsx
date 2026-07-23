"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import {
  Check,
  Sparkles,
  ChevronDown,
  Mail,
  Network,
  Bell,
  ScanSearch,
  Columns3,
  FileText,
  MonitorPlay,
  FilePlus,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type Capability = { text: string; soon?: boolean };

type Surface = {
  id: string;
  icon: string;
  /** Autonomy tier shown as an eyebrow label. */
  type: string;
  name: string;
  capabilities: Capability[];
};

/* The three surfaces. Which ones a cabinet sees depends on its offer:
 *  - Offre complète  → Collecte, Comparaison, Partage & Conseil
 *  - Cotation seule  → Collecte only (Partage & Conseil is simply not shown)
 * Partage & Conseil is always active when present; there is no "locked" state. */
const surfaces: Surface[] = [
  {
    id: "cotation",
    icon: "/onboarding/icons/courrier.png",
    type: "Agent autonome",
    name: "Collecte & Cotation",
    capabilities: [
      { text: "Déclenchement par e-mail" },
      { text: "Extranets assureurs interrogés" },
      { text: "Suivi des devis et alertes" },
    ],
  },
  {
    id: "analyse",
    icon: "/onboarding/icons/loupe.png",
    type: "Assistant",
    name: "Comparaison & Synthèse",
    capabilities: [
      { text: "Analyse : garanties, franchises, exclusions" },
      { text: "Comparaison poste par poste" },
      { text: "Synthèse client : écarts et trous de garantie" },
    ],
  },
  {
    id: "conseil",
    icon: "/onboarding/icons/diplome.png",
    type: "Production",
    name: "Partage & Conseil",
    capabilities: [
      { text: "Présentation au branding du cabinet" },
      { text: "Documents personnalisés" },
      { text: "Devoir de conseil conforme", soon: true },
    ],
  },
];

/* Feature-level view of the same offer — each capability as its own tile,
 * grouped by family (one row per family in the grid). */
type Feature = {
  id: string;
  name: string;
  family: string;
  familyId: string;
  icon: LucideIcon;
  soon?: boolean;
};

const features: Feature[] = [
  { id: "email", name: "Déclencher vos cotations par e-mail", family: "Cotation", familyId: "cotation", icon: Mail },
  { id: "extranets", name: "Interroger vos extranets assureurs", family: "Cotation", familyId: "cotation", icon: Network },
  { id: "suivi", name: "Suivre vos devis et alertes", family: "Cotation", familyId: "cotation", icon: Bell },
  { id: "analyse", name: "Analyser vos contrats", family: "Analyse", familyId: "analyse", icon: ScanSearch },
  { id: "compare", name: "Comparer vos devis", family: "Analyse", familyId: "analyse", icon: Columns3 },
  { id: "synthese", name: "Rédiger vos synthèses client", family: "Analyse", familyId: "analyse", icon: FileText },
  { id: "presentation", name: "Créer vos présentations client", family: "Analyse", familyId: "analyse", icon: MonitorPlay },
  { id: "documents", name: "Personnaliser vos documents", family: "Analyse", familyId: "analyse", icon: FilePlus },
  { id: "devoir", name: "Générer votre devoir de conseil", family: "Analyse", familyId: "analyse", icon: ShieldCheck, soon: true },
];

/* Group descriptors for the grid layout — one header per assistant. Partage &
 * Conseil is not a third assistant: its features live under Assistant analyse. */
const FAMILIES: {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "cotation",
    type: "Agent autonome",
    name: "Assistant cotation",
    description: "Vos demandes de cotation, portées de bout en bout.",
    icon: "/onboarding/icons/courrier.png",
  },
  {
    id: "analyse",
    type: "Assistant",
    name: "Assistant analyse",
    description:
      "Vos devis analysés et comparés, vos synthèses et documents prêts à partager.",
    icon: "/onboarding/icons/loupe.png",
  },
];

/* Which surfaces an offer includes. */
type Offer = "full" | "cotation";
const OFFER_SURFACES: Record<Offer, string[]> = {
  full: ["cotation", "analyse", "conseil"],
  cotation: ["cotation"],
};

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function SurfaceHeader({ surface }: { surface: Surface }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={surface.icon}
        alt=""
        className="h-10 w-10 shrink-0 object-contain"
      />
      <div className="min-w-0 flex-1">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.6px] text-panora-text-secondary">
          {surface.type}
        </span>
        <div className="text-[14px] font-medium leading-5 text-panora-text">
          {surface.name}
        </div>
      </div>
    </div>
  );
}

function Bullet({ cap }: { cap: Capability }) {
  return (
    <li className="flex items-center gap-2">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-panora-green-light">
        <Check className="h-2.5 w-2.5 text-panora-green-dark" />
      </span>
      <span className="min-w-0 flex-1 text-[12.5px] leading-5 text-panora-text">
        {cap.text}
      </span>
      {cap.soon && (
        <span className="shrink-0 rounded-full border border-panora-border bg-panora-drop/60 px-1.5 py-px text-[10.5px] font-medium text-panora-text-secondary">
          Bientôt
        </span>
      )}
    </li>
  );
}

function AskStrip() {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-panora-border bg-panora-drop/50 px-4 py-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-panora-green-light text-panora-green-dark">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
      </span>
      <p className="text-[12.5px] leading-4 text-panora-text">
        <span className="font-medium">Et partout, Ask</span> — une question sur
        n&apos;importe quel contrat, devis ou comparatif.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Variant A — Empilé (full-width stack)                              */
/* ------------------------------------------------------------------ */

function StackLayout({ visible }: { visible: Surface[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {visible.map((s) => (
        <div
          key={s.id}
          className="rounded-2xl border border-panora-border bg-white p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
        >
          <SurfaceHeader surface={s} />
          <ul className="mt-3 flex flex-col gap-1.5 border-t border-panora-border pt-3">
            {s.capabilities.map((cap) => (
              <Bullet key={cap.text} cap={cap} />
            ))}
          </ul>
        </div>
      ))}
      <AskStrip />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Variant B — Parcours (bout-en-bout numbered rail)                 */
/* ------------------------------------------------------------------ */

function RailLayout({ visible }: { visible: Surface[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-2xl border border-panora-border bg-white p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
        {visible.map((s, i) => {
          const last = i === visible.length - 1;
          return (
            <div key={s.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-panora-green text-[11px] font-semibold text-white">
                  {i + 1}
                </span>
                {!last && <span className="my-1 w-px flex-1 bg-panora-border" />}
              </div>
              <div className={last ? "flex-1" : "flex-1 pb-4"}>
                <div className="flex items-center gap-2">
                  <img src={s.icon} alt="" className="h-7 w-7 object-contain" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-panora-text-secondary">
                      {s.type}
                    </span>
                    <div className="text-[13.5px] font-medium leading-4 text-panora-text">
                      {s.name}
                    </div>
                  </div>
                </div>
                <ul className="mt-2 flex flex-col gap-1">
                  {s.capabilities.map((cap) => (
                    <li key={cap.text} className="flex items-center gap-2">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-panora-green" />
                      <span className="text-[12px] leading-5 text-panora-text-secondary">
                        {cap.text}
                      </span>
                      {cap.soon && (
                        <span className="rounded-full border border-panora-border bg-panora-drop/60 px-1.5 py-px text-[10px] font-medium text-panora-text-secondary">
                          Bientôt
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
      <AskStrip />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Variant C — Grille (one tile per feature, rows = families)         */
/* ------------------------------------------------------------------ */

function FeatureChip({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const soon = feature.soon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${
        soon
          ? "border-panora-border bg-panora-drop/40"
          : "border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
      }`}
    >
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${
          soon ? "text-panora-text-muted" : "text-panora-green"
        }`}
        strokeWidth={1.75}
      />
      <span
        className={`text-[12px] font-medium leading-4 ${
          soon ? "text-panora-text-secondary" : "text-panora-text"
        }`}
      >
        {feature.name}
      </span>
      {soon && (
        <span className="rounded-full border border-panora-border bg-white px-1.5 py-px text-[9.5px] font-medium text-panora-text-secondary">
          Bientôt
        </span>
      )}
    </span>
  );
}

function GridLayout({ visible }: { visible: Feature[] }) {
  const families = FAMILIES.filter((fam) =>
    visible.some((f) => f.familyId === fam.id)
  );
  const single = families.length === 1;
  return (
    <div className="flex flex-col gap-2.5">
      {/* Two assistant group cards side by side (stacked if only one). */}
      <div className={`grid gap-2.5 ${single ? "" : "sm:grid-cols-2"}`}>
        {families.map((fam) => {
          const feats = visible.filter((f) => f.familyId === fam.id);
          return (
            <div
              key={fam.id}
              className="rounded-2xl border border-panora-border bg-panora-drop/30 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-panora-text">
                    {fam.name}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-4 text-panora-text-secondary">
                    {fam.description}
                  </p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fam.icon}
                  alt=""
                  className="h-11 w-11 shrink-0 object-contain"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {feats.map((f) => (
                  <FeatureChip key={f.id} feature={f} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ask — cross-cutting, title + subtext per the reference */}
      <div className="rounded-2xl border border-panora-border bg-panora-drop/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles
            className="h-3.5 w-3.5 text-panora-green"
            strokeWidth={1.75}
          />
          <span className="text-[13px] font-medium text-panora-text">
            Et bientôt partout, Ask
          </span>
        </div>
        <p className="mt-0.5 pl-[22px] text-[12px] leading-4 text-panora-text-secondary">
          Une question sur n&apos;importe quel contrat, devis ou comparatif.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step + proto switchers                                             */
/* ------------------------------------------------------------------ */

type LayoutId = "stack" | "rail" | "grid";

const LAYOUTS: { id: LayoutId; label: string }[] = [
  { id: "stack", label: "Empilé" },
  { id: "rail", label: "Parcours" },
  { id: "grid", label: "Grille" },
];

const OFFERS: { id: Offer; label: string }[] = [
  { id: "full", label: "Offre complète" },
  { id: "cotation", label: "Cotation seule" },
];

function ProtoSelect<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  label: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="appearance-none rounded-lg border border-[#e2dfd8] bg-white py-1.5 pl-3 pr-8 text-[12px] font-medium text-panora-text shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none focus:border-panora-green"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-panora-text-secondary" />
    </div>
  );
}

/* Step "Découvrez votre équipe d'assistants". Surfaces shown depend on the
 * cabinet's offer (Partage & Conseil is always active unless it's a cotation-
 * only cabinet, in which case it isn't shown at all). Two proto dropdowns let
 * us preview the offer scenarios against the two layout finalists + the grid. */
export function StepAgents() {
  const [layout, setLayout] = useState<LayoutId>("stack");
  const [offer, setOffer] = useState<Offer>("full");

  const allowed = OFFER_SURFACES[offer];
  const visibleSurfaces = surfaces.filter((s) => allowed.includes(s.id));
  const visibleFeatures = features.filter((f) => allowed.includes(f.familyId));

  const cotationOnly = offer === "cotation";
  // The grid variant groups features under two assistant cards side by side —
  // it needs a wider gabarit than the other signup steps.
  const wide = layout === "grid" && !cotationOnly;

  return (
    <div
      className={`flex w-full flex-col gap-3.5 ${
        wide ? "max-w-[840px]" : "max-w-[560px]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[24px] leading-7 tracking-[-0.3px] text-panora-text">
            Découvrez votre{" "}
            <span className="text-panora-green">équipe d&apos;assistants</span>{" "}
            IA spécialisés
          </h1>
          <p className="mt-1.5 text-[13px] leading-5 text-panora-text-secondary">
            {cotationOnly
              ? "Votre agent de cotation prend en charge vos demandes, de la collecte au suivi."
              : "Deux assistants qui couvrent votre dossier de bout en bout, activés selon votre cabinet."}
          </p>
        </div>

        {/* Proto-only switchers */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <ProtoSelect
            value={offer}
            onChange={setOffer}
            options={OFFERS}
            label="Offre (proto)"
          />
          <ProtoSelect
            value={layout}
            onChange={setLayout}
            options={LAYOUTS}
            label="Disposition (proto)"
          />
        </div>
      </div>

      {layout === "stack" && <StackLayout visible={visibleSurfaces} />}
      {layout === "rail" && <RailLayout visible={visibleSurfaces} />}
      {layout === "grid" && <GridLayout visible={visibleFeatures} />}
    </div>
  );
}
