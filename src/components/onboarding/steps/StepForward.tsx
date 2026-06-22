"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Mail,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Smartphone,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { type ExtranetConfig } from "@/data/settings-mock";
import { OnboardingHero, HeroAccent } from "@/components/onboarding/OnboardingHero";

const COTATION_EMAIL = "cotation+a7f3b2@panora.co";
const SWITCH_TO_EMAIL_GUIDE_URL =
  "https://panora.notion.site/2fa-passer-en-email";

interface StepForwardProps {
  configuredExtranets: ExtranetConfig[];
  /**
   * Which sub-step inside Gestion 2FA is active:
   *  0 — Vos compagnies d'assurance et leur 2FA
   *  1 — Mettre en place l'automatisation (règle de transfert)
   */
  subStep: 0 | 1;
}

export function StepForward({ configuredExtranets, subStep }: StepForwardProps) {
  return (
    <div className="mx-auto w-full max-w-[1040px] flex flex-col gap-10 lg:gap-12 py-6 lg:py-10">
      {subStep === 0 && (
        <>
          <OnboardingHero
            eyebrow="Étape 3"
            title={
              <>
                Passez vos compagnies en 2FA par e-mail dès que c&apos;est
                possible.
              </>
            }
            subtitle={
              <>
                Panora automatise entièrement ce mode : vos sessions restent
                ouvertes sans intervention. Pour les compagnies imposant SMS,
                application ou notification, l&apos;automatisation est impossible
                — vous devrez saisir un code régulièrement pour garder
                l&apos;accès actif.
              </>
            }
          />
          <PortalList configuredExtranets={configuredExtranets} />
        </>
      )}

      {subStep === 1 && (
        <>
          <OnboardingHero
            eyebrow="Étape 3"
            title={
              <>
                Recevez vos codes 2FA{" "}
                <HeroAccent>automatiquement</HeroAccent> dans Panora.
              </>
            }
            subtitle={
              <>
                Créez une règle dans votre messagerie : les e-mails 2FA de vos
                compagnies sont transférés à Panora, qui lit le code et garde
                vos sessions ouvertes.
              </>
            }
          />
          <ForwardSetup configuredExtranets={configuredExtranets} />
        </>
      )}
    </div>
  );
}

// ── Forward setup: rule card (left) + tutorial (right) ──
// Two columns so the senders list grows independently of the fixed tutorial.
// The senders list is height-bounded + scrollable to stay compact when a broker
// quotes with many insurers.

interface SourceRow {
  id: string;
  insurerId: string;
  insurerName: string;
  portalLabel?: string;
  address: string;
}

const TUTORIAL_SOURCES: SourceRow[] = [
  {
    id: "demo-generali",
    insurerId: "generali",
    insurerName: "Generali",
    address: "securite@generali.fr",
  },
  {
    id: "demo-axa",
    insurerId: "axa",
    insurerName: "Axa",
    address: "noreply.2fa@axa.fr",
  },
  {
    id: "demo-allianz",
    insurerId: "allianz",
    insurerName: "Allianz",
    address: "auth@allianz.fr",
  },
  {
    id: "demo-swisslife",
    insurerId: "swisslife",
    insurerName: "Swiss Life",
    address: "noreply.securite@swisslife.fr",
  },
  {
    id: "demo-groupama",
    insurerId: "groupama",
    insurerName: "Groupama",
    address: "2fa@groupama.fr",
  },
  {
    id: "demo-maif",
    insurerId: "maif",
    insurerName: "MAIF",
    address: "securite@maif.fr",
  },
];

function ForwardSetup({
  configuredExtranets,
}: {
  configuredExtranets: ExtranetConfig[];
}) {
  const emailExtranets = configuredExtranets.filter(
    (c) => c.otpDelivery?.channel === "email" && c.otpDelivery.sourceAddress
  );
  const sources: SourceRow[] = emailExtranets.map((c) => ({
    id: c.id,
    insurerId: c.insurerId,
    insurerName: c.insurerName,
    portalLabel: c.portalLabel,
    address:
      c.otpDelivery?.channel === "email"
        ? c.otpDelivery.sourceAddress ?? ""
        : "",
  }));
  const isTutorial = sources.length === 0;
  const displayed = isTutorial ? TUTORIAL_SOURCES : sources;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-5 lg:gap-8 items-start">
      <ForwardRuleCard sources={displayed} isTutorial={isTutorial} />
      <TutorialPanel />
    </div>
  );
}

function ForwardRuleCard({
  sources,
  isTutorial,
}: {
  sources: SourceRow[];
  isTutorial: boolean;
}) {
  return (
    <article
      className="flex flex-col gap-5 p-5 lg:p-6 rounded-2xl border border-panora-green-border/60 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]"
      style={{
        background:
          "radial-gradient(85% 120% at 100% 0%, rgba(0,162,114,0.16) 0%, rgba(0,162,114,0) 46%), #ffffff",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
          Créez une règle de transfert automatique dans votre boîte mail
        </h3>
        <span className="shrink-0 inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-panora-green-light text-[10px] font-semibold text-panora-green-dark tracking-[0.01em]">
          À faire
        </span>
      </div>

      <SendersList sources={sources} isTutorial={isTutorial} />

      <DestinationField value={COTATION_EMAIL} />
    </article>
  );
}

// A single comma-joined block — paste straight into the mail filter's "From"
// field. One block regardless of how many insurers, so the card height is
// stable (it wraps to a couple of lines, then scrolls).
function SendersList({
  sources,
  isTutorial,
}: {
  sources: SourceRow[];
  isTutorial: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const joined = sources.map((s) => s.address).join(", ");
  function copyAll() {
    navigator.clipboard.writeText(joined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-panora-text-muted leading-4">
        Liste des expéditeurs à copier
      </span>
      <div className="rounded-lg border border-panora-border bg-white px-3 py-2.5 flex flex-col gap-1.5">
        <p className="text-[12px] font-mono text-panora-text leading-5 break-words max-h-[80px] overflow-y-auto">
          {joined}
        </p>
        <button
          type="button"
          onClick={copyAll}
          className="self-end inline-flex items-center gap-1 px-2 h-6 rounded-full bg-panora-green-light text-[11px] font-medium text-panora-green-dark hover:bg-panora-green/15 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" strokeWidth={3} />
              Copié
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copier
            </>
          )}
        </button>
      </div>
      {isTutorial && (
        <p className="text-[11px] text-panora-text-muted leading-4">
          Exemple. Vos adresses réelles apparaîtront après la connexion de vos
          accès.
        </p>
      )}
    </div>
  );
}

function DestinationField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-panora-text-muted leading-4">
        Vers votre adresse Panora
      </span>
      <div className="flex items-center gap-2 h-11 pl-3 pr-1.5 rounded-lg border border-panora-green-border bg-panora-green-light shadow-[0px_2px_8px_-4px_rgba(0,162,114,0.18)]">
        <Mail className="w-4 h-4 text-panora-green-dark shrink-0" />
        <span className="flex-1 truncate text-[14px] font-mono font-medium text-panora-green-dark">
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 inline-flex items-center gap-1 px-2 h-7 rounded-md text-[12px] font-semibold text-panora-green-dark hover:bg-white/50 transition-colors"
          aria-label="Copier l'adresse Panora"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              Copié
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copier
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Tutorial (provider-specific, fixed height beside the rule card) ──

const TUTORIAL_STEPS: Record<
  "gmail" | "outlook",
  { title: string; body: string }[]
> = {
  gmail: [
    {
      title: "Paramètres › Filtres",
      body: "Ouvrez « Voir tous les paramètres », puis l'onglet « Filtres et adresses bloquées ».",
    },
    {
      title: "Créer un filtre",
      body: "Dans le champ « De », collez l'adresse de l'expéditeur à transférer.",
    },
    {
      title: "Action de transfert",
      body: "Cochez « Transférer à » et collez votre adresse Panora.",
    },
    {
      title: "Confirmer",
      body: "Validez l'adresse de transfert via l'e-mail de confirmation Google.",
    },
  ],
  outlook: [
    {
      title: "Paramètres › Règles",
      body: "Ouvrez Paramètres › Courrier › Règles, puis « Ajouter une règle ».",
    },
    {
      title: "Définir la condition",
      body: "Choisissez « L'expéditeur est » et indiquez l'adresse à transférer.",
    },
    {
      title: "Action de transfert",
      body: "Ajoutez l'action « Transférer à » et collez votre adresse Panora.",
    },
    {
      title: "Activer",
      body: "Enregistrez la règle, puis vérifiez la réception du premier transfert.",
    },
  ],
};

function TutorialPanel() {
  const [provider, setProvider] = useState<"gmail" | "outlook">("gmail");
  return (
    <div className="flex flex-col gap-4 p-5 lg:p-6 rounded-2xl border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-panora-text-muted leading-4">
          Tutoriel
        </span>
        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-panora-text">
          {(["gmail", "outlook"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className={cn(
                "inline-flex items-center px-2.5 h-6 rounded-md text-[11px] font-medium leading-4 transition-colors",
                provider === p
                  ? "bg-white text-panora-text"
                  : "text-white/60 hover:text-white"
              )}
            >
              {p === "gmail" ? "Gmail" : "Outlook"}
            </button>
          ))}
        </div>
      </div>
      <ol className="flex flex-col gap-3.5">
        {TUTORIAL_STEPS[provider].map((step, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-panora-secondary border border-panora-border text-[11px] font-semibold text-panora-text-secondary tabular-nums">
              {idx + 1}
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[13px] font-semibold text-panora-text leading-5">
                {step.title}
              </span>
              <span className="text-[12px] text-panora-text-secondary leading-[18px]">
                {step.body}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Portal list (justification) ──

type ModeChannel = "email" | "sms" | "app" | "push";

/**
 * Catalog-level knowledge per portal.
 * - `modes`: every 2FA channel the portal proposes.
 * - `lockedMode`: if set, the broker can't switch — this is the imposed channel.
 * - `sessionDurationLabel`: how long a session stays alive once activated.
 * - `unsupportedExpiry`: session too short for Panora to automate cleanly.
 */
type PortalPolicy = {
  modes: ModeChannel[];
  lockedMode?: ModeChannel;
  sessionDurationLabel?: string;
  unsupportedExpiry?: boolean;
};

const PORTAL_POLICIES: Record<string, PortalPolicy> = {
  axa: { modes: ["email", "sms"], sessionDurationLabel: "4 h" },
  generali: { modes: ["email", "sms", "app"], sessionDurationLabel: "10 j" },
  allianz: { modes: ["email", "sms"], sessionDurationLabel: "24 h" },
  chubb: { modes: ["sms", "app"], sessionDurationLabel: "8 h" },
  hiscox: {
    modes: ["app", "push"],
    lockedMode: "app",
    sessionDurationLabel: "12 h",
  },
  swisslife: {
    modes: ["push"],
    lockedMode: "push",
    sessionDurationLabel: "2 h",
    unsupportedExpiry: true,
  },
};

function policyFor(insurerId: string): PortalPolicy {
  return PORTAL_POLICIES[insurerId] ?? { modes: [] };
}

type PortalRowData = {
  id: string;
  insurerId: string;
  insurerName: string;
  portalUrl: string;
};

/** Email available and switchable → Panora can automate it end-to-end. */
function isAutomatable(policy: PortalPolicy): boolean {
  if (policy.lockedMode || policy.unsupportedExpiry) return false;
  return policy.modes.includes("email");
}

function PortalList({
  configuredExtranets: _configuredExtranets,
}: {
  configuredExtranets: ExtranetConfig[];
}) {
  // Demo rows covering both buckets. Switch back to deriving from
  // `configuredExtranets` once detection is wired.
  const DEMO_ROWS: PortalRowData[] = [
    { id: "demo-axa", insurerId: "axa", insurerName: "Axa", portalUrl: "portail.axa.fr" },
    {
      id: "demo-generali",
      insurerId: "generali",
      insurerName: "Generali",
      portalUrl: "portail.generali.fr",
    },
    { id: "demo-chubb", insurerId: "chubb", insurerName: "Chubb", portalUrl: "portail.chubb.fr" },
    { id: "demo-hiscox", insurerId: "hiscox", insurerName: "Hiscox", portalUrl: "portail.hiscox.fr" },
    {
      id: "demo-swisslife",
      insurerId: "swisslife",
      insurerName: "Swiss Life",
      portalUrl: "portail.swisslife.fr",
    },
  ];

  const { autoRows, manualRows } = useMemo(() => {
    const a: PortalRowData[] = [];
    const m: PortalRowData[] = [];
    for (const row of DEMO_ROWS) {
      if (isAutomatable(policyFor(row.insurerId))) a.push(row);
      else m.push(row);
    }
    return { autoRows: a, manualRows: m };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-col gap-8">
      {autoRows.length > 0 && (
        <div
          className="flex flex-col gap-5 p-5 lg:p-6 rounded-2xl border border-panora-green-border"
          style={{
            background:
              "radial-gradient(125% 130% at 92% 0%, rgba(201,232,217,0.65) 0%, rgba(201,232,217,0) 52%), #faf8f5",
          }}
        >
          <div className="flex flex-col gap-3">
            <span className="self-start inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-panora-green text-[10px] font-semibold text-white tracking-[0.01em]">
              <Check className="w-2.5 h-2.5" strokeWidth={3} />
              À faire · Recommandé
            </span>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-panora-text leading-5 font-display tracking-[-0.005em]">
                  Basculez en e-mail les assureurs suivants
                </h3>
                <p className="text-[13px] text-panora-text-secondary leading-5 max-w-[540px]">
                  Le seul mode 100 % automatique : Panora maintient vos sessions
                  ouvertes, vous n&apos;avez plus rien à saisir.
                </p>
              </div>
              <a
                href={SWITCH_TO_EMAIL_GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-panora-green-dark hover:underline leading-5 shrink-0"
              >
                Découvrir comment faire
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <ul className="flex flex-col gap-2">
            {autoRows.map((row) => (
              <PortalRow key={row.id} {...row} variant="auto" />
            ))}
          </ul>
        </div>
      )}

      {manualRows.length > 0 && (
        <div className="flex flex-col gap-5 p-5 lg:p-6 rounded-2xl border border-panora-border bg-white">
          <div className="flex flex-col gap-1">
            <h3 className="text-[15px] font-semibold text-panora-text leading-5 font-display tracking-[-0.005em]">
              Mode imposé : saisie manuelle obligatoire
            </h3>
            <p className="text-[13px] text-panora-text-secondary leading-5 max-w-[560px]">
              Ces compagnies n&apos;autorisent pas le changement de mode. Panora
              vous notifiera pour saisir vos codes reçus manuellement.
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {manualRows.map((row) => (
              <PortalRow key={row.id} {...row} variant="manual" />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function PortalRow({
  insurerId,
  insurerName,
  portalUrl,
  variant,
}: PortalRowData & { variant: "auto" | "manual" }) {
  const policy = policyFor(insurerId);
  const modes = policy.lockedMode ? [policy.lockedMode] : policy.modes;

  return (
    <li
      className={cn(
        "flex items-center gap-3 px-4 h-12 rounded-lg border border-panora-border",
        variant === "auto" ? "bg-white" : "bg-panora-bg/60"
      )}
    >
      <InsurerLogo insurerId={insurerId} name={insurerName} size="md" />
      <span className="flex-1 min-w-0 text-[13px] font-medium text-panora-text truncate">
        {insurerName}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {modes.map((m) => (
          <ModeBadge key={m} mode={m} />
        ))}
      </div>
      <span className="w-px h-5 bg-panora-border shrink-0" aria-hidden />
      {variant === "auto" ? (
        <a
          href={`https://${portalUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-panora-green-dark hover:underline shrink-0 whitespace-nowrap"
        >
          Ouvrir le portail
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-warning-text shrink-0 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-panora-warning-text" />
          Saisie manuelle
        </span>
      )}
    </li>
  );
}

function ModeBadge({ mode }: { mode: ModeChannel }) {
  const isEmail = mode === "email";
  const Icon =
    mode === "email"
      ? Mail
      : mode === "sms"
        ? Smartphone
        : mode === "app"
          ? KeyRound
          : Bell;
  const label =
    mode === "email"
      ? "E-mail"
      : mode === "sms"
        ? "SMS"
        : mode === "app"
          ? "Appli"
          : "Notif";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-5 pl-1.5 pr-2 rounded-full text-[11px] font-medium whitespace-nowrap",
        isEmail
          ? "bg-panora-green-light text-panora-green-dark"
          : "bg-panora-secondary text-panora-text-secondary"
      )}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}
