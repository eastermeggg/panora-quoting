"use client";

import { useEffect, useState } from "react";
import {
  Send,
  Copy,
  Check,
  ExternalLink,
  FolderInput,
  Forward,
  Sparkles,
  Globe,
  GitCompare,
  Mail,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtranetConfig } from "@/data/settings-mock";
import { OnboardingHero, HeroAccent } from "@/components/onboarding/OnboardingHero";

const COTATION_EMAIL = "cotation+a7f3b2@panora.co";
const REVEAL_PREFIX = "cotation+";
const REVEAL_HIDDEN_CHARS = "a7f3b2";
const REVEAL_SUFFIX = "@panora.co";
const COTATION_EMAIL_LOCKED = `${REVEAL_PREFIX}${"•".repeat(REVEAL_HIDDEN_CHARS.length)}${REVEAL_SUFFIX}`;
const DOCS_URL = "https://panora.notion.site/";

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
        eyebrow="Configuration terminée"
        title={
          <>
            Votre assistant cotation{" "}
            <HeroAccent>est prêt à coter</HeroAccent>.
          </>
        }
      />

      {/* Left: how-it-works timeline · Right: address + email example */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.45fr] gap-5 items-start">
        <FlowTimeline />
        <div className="flex flex-col gap-5">
          <AddressPanel />
          <ForwardExample assureurs={assureurs} produit={produit} />
        </div>
      </div>

      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-text-secondary hover:text-panora-text leading-4"
      >
        Consulter la documentation
        <ExternalLink className="w-3 h-3" />
      </a>
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
          Transférez n&apos;importe quel e-mail client à cette adresse —
          l&apos;agent extrait les informations et lance les cotations
          automatiquement.
        </p>
      </div>
      <EmailReveal copied={copied} onCopy={handleCopy} />
    </div>
  );
}

// ── Right column: ideal email example ──

function buildTemplate(assureurs: string, produit: string): string {
  return [
    `Objet : Demande de devis — ${PLACEHOLDER_CLIENT} — ${produit}`,
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

const FLOW_STEPS = [
  {
    icon: FolderInput,
    label: "Rassemblez les documents",
    sub: "Réunissez les pièces envoyées par le client.",
  },
  {
    icon: Forward,
    label: "Transférez à Panora",
    sub: "Un simple email crée le dossier.",
  },
  {
    icon: Sparkles,
    label: "Laissez l'agent vérifier",
    sub: "Il analyse les pièces et vous signale automatiquement ce qui manque.",
  },
  {
    icon: Globe,
    label: "Validez et lancez la cotation",
    sub: "Notre agent va chercher les devis pour vous auprès des compagnies.",
  },
  {
    icon: GitCompare,
    label: "Comparez les offres",
    sub: "Analysez les devis côte à côte dans Panora.",
  },
] as const;

function FlowTimeline() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-panora-border bg-panora-bg p-5 lg:p-6">
      <h2 className="text-[16px] font-semibold text-panora-text font-display leading-5 flex items-center gap-2">
        <Rocket className="w-4 h-4 text-panora-green-dark shrink-0" />
        Comment lancer votre première cotation
      </h2>
      <ol className="flex flex-col">
        {FLOW_STEPS.map(({ icon: Icon, label, sub }, i) => {
          const isLast = i === FLOW_STEPS.length - 1;
          return (
            <li key={i} className="flex gap-3 relative">
              {/* Connecting line */}
              {!isLast && (
                <div className="absolute left-[13px] top-7 bottom-0 w-px bg-panora-border" />
              )}
              {/* Icon marker */}
              <div className="relative z-10 shrink-0 inline-flex items-center justify-center w-[27px] h-[27px] rounded-full bg-panora-green-light border border-panora-green-border">
                <Icon className="w-3.5 h-3.5 text-panora-green-dark" />
              </div>
              {/* Content */}
              <div className={cn("min-w-0 pt-[3px]", !isLast && "pb-4")}>
                <p className="text-[13px] font-semibold text-panora-text leading-4">
                  {label}
                </p>
                <p className="text-[12px] text-panora-text-secondary leading-[17px] mt-1">
                  {sub}
                </p>
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
              Demande de devis —{" "}
              <Slot>{PLACEHOLDER_CLIENT}</Slot> —{" "}
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

// ── Email address reveal (typewriter) ──

function EmailReveal({
  copied,
  onCopy,
}: {
  copied: boolean;
  onCopy: () => void;
}) {
  const [displayed, setDisplayed] = useState(COTATION_EMAIL_LOCKED);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let step = 0;
    const total = REVEAL_HIDDEN_CHARS.length;

    const interval = setInterval(() => {
      step += 1;
      const revealed = REVEAL_HIDDEN_CHARS.slice(0, step);
      const remainingDots = "•".repeat(Math.max(0, total - step));
      setDisplayed(
        `${REVEAL_PREFIX}${revealed}${remainingDots}${REVEAL_SUFFIX}`
      );
      if (step >= total) {
        clearInterval(interval);
        setDisplayed(COTATION_EMAIL);
        setPulse(true);
        window.setTimeout(() => setPulse(false), 600);
      }
    }, 140);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-3 border rounded-xl px-4 bg-white transition-all duration-300",
        pulse
          ? "border-panora-green-dark shadow-[0px_8px_24px_-8px_rgba(0,162,114,0.28)]"
          : "border-panora-green-border shadow-[0px_3px_14px_-6px_rgba(0,162,114,0.15)]"
      )}
      style={{ height: "52px" }}
    >
      <span className="text-[14px] lg:text-[15px] text-panora-text font-medium flex-1 truncate font-mono tracking-tight">
        {displayed}
      </span>
      <button
        onClick={onCopy}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 h-9 rounded-md bg-panora-green-light text-[13px] font-semibold text-panora-green-dark hover:bg-panora-green/15 transition-colors"
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
  );
}
