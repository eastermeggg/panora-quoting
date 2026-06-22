"use client";

import { useState } from "react";
import { Send, Copy, Check, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtranetConfig } from "@/data/settings-mock";
import { OnboardingHero } from "@/components/onboarding/OnboardingHero";

const COTATION_EMAIL = "cotation+a7f3b2@panora.co";

const PLACEHOLDER_CLIENT = "[Nom du client / raison sociale]";
const PLACEHOLDER_DOCS = "[Kbis, bilan N-1, questionnaire rempli]";
const PLACEHOLDER_PRECISIONS = "[échéance souhaitée, particularités du risque…]";

interface StepReadyProps {
  configuredExtranets: ExtranetConfig[];
}

export function StepReady({ configuredExtranets }: StepReadyProps) {
  const insurerNames = Array.from(
    new Set(configuredExtranets.map((c) => c.insurerName))
  );
  const assureurs =
    insurerNames.length > 0
      ? insurerNames.slice(0, 3).join(", ")
      : "AXA, Generali, Allianz";
  const products = Array.from(
    new Set(configuredExtranets.flatMap((c) => c.selectedProducts))
  );
  const produit =
    products.length > 0
      ? products.slice(0, 2).join(", ")
      : "Multirisque professionnelle";

  return (
    <div className="mx-auto w-full max-w-[1040px] flex flex-col gap-10 py-6 lg:py-10">
      <OnboardingHero
        eyebrow="Étape 4"
        title={<>Votre assistant cotation est prêt à coter.</>}
      />

      {/* Left: how-it-works steps · Right: address + email example */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.45fr] gap-6 lg:gap-8 items-start">
        <FlowTimeline />
        <div className="flex flex-col gap-5">
          <AddressPanel />
          <ForwardExample assureurs={assureurs} produit={produit} />
        </div>
      </div>
    </div>
  );
}

// ── Left column: Panora address ──

function AddressPanel() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(COTATION_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-panora-border bg-panora-bg p-5 lg:p-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[16px] font-semibold text-panora-text font-display leading-5 flex items-center gap-2">
          <Send className="w-4 h-4 text-panora-green-dark shrink-0" />
          Votre adresse de cotation
        </h2>
        <p className="text-[13px] text-panora-text-secondary leading-[20px]">
          Transférez n&apos;importe quel e-mail client à cette adresse.
          L&apos;agent extrait les informations et lance les cotations
          automatiquement.
        </p>
      </div>
      <div
        className="flex items-center gap-3 h-[52px] pl-4 pr-1.5 rounded-xl border border-panora-border shadow-[0px_2px_6px_-3px_rgba(0,0,0,0.08)]"
        style={{
          background:
            "radial-gradient(130% 180% at 100% 50%, rgba(0,162,114,0.18) 0%, rgba(0,162,114,0) 46%), #ffffff",
        }}
      >
        <span className="flex-1 truncate font-mono text-[14px] font-medium text-panora-text">
          {COTATION_EMAIL}
        </span>
        <button
          onClick={handleCopy}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-9 rounded-md bg-[#173c2d] text-[13px] font-semibold text-white hover:bg-[#10301f] transition-colors"
          aria-label="Copier l'adresse"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" strokeWidth={3} />
              Copié
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copier
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Right column: ideal email example ──

function buildTemplate(assureurs: string, produit: string): string {
  return [
    `Objet : Demande de devis - ${PLACEHOLDER_CLIENT} - ${produit}`,
    "",
    "Bonjour,",
    "",
    "Merci de bien vouloir établir un devis pour le client ci-dessous :",
    "",
    `- Client : ${PLACEHOLDER_CLIENT}`,
    `- Produit : ${produit}`,
    `- Assureurs à consulter : ${assureurs}`,
    `- Documents joints : ${PLACEHOLDER_DOCS}`,
    `- Précisions : ${PLACEHOLDER_PRECISIONS}`,
    "",
    "Bien cordialement,",
  ].join("\n");
}

// ── How it works — compact digest ──

const FLOW_STEPS: { label: string; sub?: string }[] = [
  {
    label: "Rassemblez les documents de votre client",
    sub: "Réunissez les pièces envoyées par le client.",
  },
  {
    label: "Transférez le tout dans un email à Panora",
    sub: "Un simple email (voir le modèle) crée la demande de cotation.",
  },
  {
    label: "Validez et lancez la cotation",
    sub: "Vérifiez les informations extraites, puis lancez.",
  },
  {
    label: "Notre agent va chercher les devis",
    sub: "Il les récupère pour vous auprès des compagnies.",
  },
  {
    label: "Vos cotations et devis sont prêts",
  },
];

function FlowTimeline() {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-panora-border bg-white p-5 lg:p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]">
      <h2 className="text-[16px] font-semibold text-panora-text font-display leading-5">
        Comment lancer votre première cotation
      </h2>
      <ol className="flex flex-col">
        {FLOW_STEPS.map(({ label, sub }, i) => {
          const isLast = i === FLOW_STEPS.length - 1;
          return (
            <li key={i} className="flex gap-3 relative">
              {/* Connecting line between numbered steps */}
              {!isLast && (
                <div className="absolute left-[9.5px] top-6 bottom-0 w-px bg-panora-border" />
              )}
              <span className="relative z-10 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-panora-secondary text-[11px] font-semibold text-panora-text-secondary tabular-nums">
                {i + 1}
              </span>
              <div className={cn("flex flex-col gap-0.5 min-w-0", !isLast && "pb-4")}>
                <p className="text-[13px] font-semibold text-panora-text leading-5">
                  {label}
                </p>
                {sub && (
                  <p className="text-[12px] text-panora-text-secondary leading-[18px]">
                    {sub}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ForwardExample({
  assureurs,
  produit,
}: {
  assureurs: string;
  produit: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(buildTemplate(assureurs, produit));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-panora-border bg-panora-bg p-5 lg:p-6">
      {/* Card header — mirrors AddressPanel */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-panora-text font-display leading-5 flex items-center gap-2">
          <Mail className="w-4 h-4 text-panora-green-dark shrink-0" />
          L&apos;email idéal de cotation
        </h2>
        <button
          onClick={handleCopy}
          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-panora-green-light text-[12px] font-semibold text-panora-green-dark hover:bg-panora-green/15 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              Copié
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copier le modèle
            </>
          )}
        </button>
      </div>

      {/* Inner white card — email content */}
      <div className="rounded-xl border border-panora-border bg-white overflow-hidden shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)]">
        {/* Headers */}
        <div className="px-4 py-3 border-b border-panora-border flex flex-col gap-1.5">
          <MetaRow label="À">
            <span className="font-mono text-panora-text">{COTATION_EMAIL}</span>
          </MetaRow>
          <MetaRow label="Objet">
            <span className="text-panora-text">
              Demande de devis -{" "}
              <Slot>{PLACEHOLDER_CLIENT}</Slot> -{" "}
              <Mark>{produit}</Mark>
            </span>
          </MetaRow>
        </div>

        {/* Body */}
        <div className="px-4 py-4 flex flex-col gap-3 text-[13px] text-panora-text leading-5">
          <p>Bonjour,</p>
          <p className="text-panora-text-secondary">
            Merci de bien vouloir établir un devis pour le client ci-dessous :
          </p>
          <ul className="flex flex-col gap-2">
            <FieldLine mustHave label="Client">
              <Slot>{PLACEHOLDER_CLIENT}</Slot>
            </FieldLine>
            <FieldLine mustHave label="Produit">
              <Mark>{produit}</Mark>
            </FieldLine>
            <FieldLine mustHave label="Assureurs à consulter">
              <Mark>{assureurs}</Mark>
            </FieldLine>
            <FieldLine mustHave label="Documents joints">
              <Slot>{PLACEHOLDER_DOCS}</Slot>
            </FieldLine>
            <FieldLine label="Précisions">
              <span className="text-panora-text-muted">
                {PLACEHOLDER_PRECISIONS}
              </span>
            </FieldLine>
          </ul>
          <p className="text-panora-text-secondary">Bien cordialement,</p>
        </div>
      </div>

      <p className="inline-flex items-center gap-1.5 text-[12px] text-panora-text-muted leading-4">
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-panora-green-light shrink-0">
          <Check className="w-2.5 h-2.5 text-panora-green-dark" strokeWidth={3} />
        </span>
        Les quatre éléments surlignés sont indispensables à une bonne cotation.
      </p>
    </div>
  );
}

// ── Primitive display helpers ──

function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded px-1 bg-panora-green-light/70 text-panora-text font-medium">
      {children}
    </span>
  );
}

function Slot({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded px-1 bg-panora-warning-bg/70 text-panora-warning-text font-medium">
      {children}
    </span>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2 text-[13px]">
      <span className="shrink-0 w-12 text-panora-text-muted">{label}</span>
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}

function FieldLine({
  label,
  mustHave,
  children,
}: {
  label: string;
  mustHave?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      <span className="shrink-0 mt-[3px]">
        {mustHave ? (
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-panora-green-light">
            <Check
              className="w-2.5 h-2.5 text-panora-green-dark"
              strokeWidth={3}
            />
          </span>
        ) : (
          <span className="inline-block w-3.5 h-3.5 rounded-full border border-panora-border" />
        )}
      </span>
      <span className="text-panora-text-muted">{label} :</span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

