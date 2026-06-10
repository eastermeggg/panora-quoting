"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  ChevronDown,
  Mail,
  ArrowDown,
  ArrowRight,
  Plus,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  X,
  Send,
  Bell,
  Smartphone,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { type ExtranetConfig } from "@/data/settings-mock";

const COTATION_EMAIL = "cotation+a7f3b2@panora.co";
const SWITCH_TO_EMAIL_GUIDE_URL =
  "https://panora.notion.site/2fa-passer-en-email";

/**
 * Two high-level UI states based on whether the broker's portals authorize the
 * email 2FA mode (catalog-level knowledge — we can't detect what's currently
 * active in their account):
 *  - A: ≥1 portal proposes the email mode → hero CTA "Connecter ma messagerie"
 *  - C: 0 portal proposes email → demoted CTA, honest fallback messaging
 */
type DetectionState = "A" | "C";

interface StepForwardProps {
  configuredExtranets: ExtranetConfig[];
  method: "mailbox" | "forward";
  onMethodChange: (method: "mailbox" | "forward") => void;
  onComplete: () => void;
  onToggleForward: (configId: string, configured: boolean) => void;
}

export function StepForward({
  configuredExtranets,
  method,
  onMethodChange,
  onComplete,
  onToggleForward,
}: StepForwardProps) {
  // Catalog-level knowledge: do any configured portals authorize email 2FA?
  const state: DetectionState = useMemo(() => {
    const hasEmail = configuredExtranets.some(
      (c) => c.otpDelivery?.channel === "email"
    );
    return hasEmail ? "A" : "C";
  }, [configuredExtranets]);

  return (
    <div className="mx-auto w-full max-w-[920px] flex flex-col gap-12 lg:gap-14 py-6 lg:py-10">
      <Hero state={state} />

      {/* Educational framework: 3 modes, only one is automatable. */}
      <ModesBreakdown />

      {/* Portal list: who proposes email — the actionable part of the picture. */}
      <PortalList configuredExtranets={configuredExtranets} />

      <PrimaryAction
        state={state}
        method={method}
        onMethodChange={onMethodChange}
        onComplete={onComplete}
        configuredExtranets={configuredExtranets}
        onToggleForward={onToggleForward}
      />
    </div>
  );
}

// ── Hero ──

function Hero({ state: _state }: { state: DetectionState }) {
  return (
    <header className="flex flex-col gap-3 max-w-[760px]">
      <h1 className="text-[32px] lg:text-[42px] font-serif text-panora-text leading-[1.05] tracking-[-0.025em] text-balance">
        Recevez vos codes 2FA{" "}
        <span className="italic text-panora-green-dark">
          sans interrompre
        </span>{" "}
        vos cotations.
      </h1>
    </header>
  );
}

// ── Modes breakdown: 3 modes, one automatable ──

function ModesBreakdown() {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-[17px] font-semibold text-panora-text font-display leading-6 tracking-[-0.01em]">
        Trois modes possibles, un seul automatisable
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModeCard
          icon={<Mail className="w-5 h-5 text-panora-green-dark" />}
          tone="green"
          title="Code par email"
          recommended
          flow={[
            { label: "Code reçu", tone: "neutral" },
            { label: "Lu par Panora", tone: "accent" },
            { label: "Session ouverte", tone: "accent" },
          ]}
          body="L'agent lit le code à votre place et garde vos sessions ouvertes. Aucune intervention au moment de la cotation."
        />
        <ModeCard
          icon={<Smartphone className="w-5 h-5 text-panora-warning-text" />}
          tone="copper"
          title="Code par SMS"
          flow={[
            { label: "Code reçu", tone: "neutral" },
            { label: "Sur votre téléphone", tone: "neutral" },
            { label: "Vous saisissez", tone: "muted" },
          ]}
          body="Le code arrive sur votre téléphone. Vous le saisissez dans Panora au moment de la cotation."
        />
        <ModeCard
          icon={<KeyRound className="w-5 h-5 text-panora-error" />}
          tone="bordeaux"
          title="Code via application"
          flow={[
            { label: "Code généré", tone: "neutral" },
            { label: "Dans l'app assureur", tone: "neutral" },
            { label: "Vous saisissez", tone: "muted" },
          ]}
          body="L'application de l'assureur génère un code valable quelques instants. Vous l'ouvrez, vous le saisissez."
        />
      </div>
      <aside className="flex items-start gap-3.5 p-5 rounded-xl border border-panora-green-border bg-panora-green-light/30">
        <div className="shrink-0 w-8 h-8 rounded-full bg-white border border-panora-green-border flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-panora-green-dark" />
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-[12px] font-semibold text-panora-green-dark leading-4">
            Notre recommandation
          </p>
          <p className="text-[13px] text-panora-text-secondary leading-[20px]">
            Dans les portails qui proposent l&apos;email, activez ce mode
            depuis vos paramètres chez l&apos;assureur. C&apos;est la seule
            option que Panora peut automatiser de bout en bout.
          </p>
        </div>
      </aside>
    </section>
  );
}

type FlowChipTone = "accent" | "neutral" | "muted";

function ModeCard({
  icon,
  tone,
  title,
  recommended,
  flow,
  body,
}: {
  icon: React.ReactNode;
  tone: "green" | "copper" | "bordeaux";
  title: string;
  recommended?: boolean;
  flow: { label: string; tone: FlowChipTone }[];
  body: string;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col gap-4 p-5 rounded-xl border",
        tone === "green" && "border-panora-green-border bg-panora-green-light/25",
        tone === "copper" && "border-panora-border bg-white",
        tone === "bordeaux" && "border-panora-border bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]",
            tone === "green" && "border-panora-green-border",
            tone === "copper" && "border-panora-border",
            tone === "bordeaux" && "border-panora-border"
          )}
        >
          {icon}
        </div>
        {recommended && (
          <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-panora-green text-[10px] font-semibold text-white tracking-[0.01em]">
            <Sparkles className="w-2.5 h-2.5" />
            Recommandé
          </span>
        )}
      </div>
      <h3 className="text-[15px] font-semibold text-panora-text leading-5 font-display tracking-[-0.005em]">
        {title}
      </h3>
      <MiniFlow steps={flow} />
      <p className="text-[13px] text-panora-text-secondary leading-[20px]">
        {body}
      </p>
    </article>
  );
}

function MiniFlow({
  steps,
}: {
  steps: { label: string; tone: FlowChipTone }[];
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, idx) => (
        <span key={idx} className="inline-flex items-center gap-1">
          <span
            className={cn(
              "inline-flex items-center px-1.5 h-5 rounded text-[10px] font-medium leading-3",
              step.tone === "accent" &&
                "bg-panora-green-light text-panora-green-dark border border-panora-green-border/70",
              step.tone === "neutral" &&
                "bg-white text-panora-text-secondary border border-panora-border",
              step.tone === "muted" &&
                "bg-panora-secondary/60 text-panora-text-secondary border border-panora-border"
            )}
          >
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <ArrowRight className="w-2.5 h-2.5 text-panora-text-muted/70" />
          )}
        </span>
      ))}
    </div>
  );
}

// ── Primary action region (varies by state) ──

function PrimaryAction({
  state,
  method,
  onMethodChange,
  onComplete,
  configuredExtranets,
  onToggleForward,
}: {
  state: DetectionState;
  method: "mailbox" | "forward";
  onMethodChange: (method: "mailbox" | "forward") => void;
  onComplete: () => void;
  configuredExtranets: ExtranetConfig[];
  onToggleForward: (configId: string, configured: boolean) => void;
}) {
  const [mailbox, setMailbox] = useState<MailboxState>({ status: "idle" });
  const [consent, setConsent] = useState<{
    provider: "gmail" | "outlook";
  } | null>(null);
  const [itAuthOpen, setItAuthOpen] = useState(false);

  // Provider click hands off to a faux third-party consent modal. We never
  // show an in-app spinner — the OAuth handshake belongs visually to Google /
  // Microsoft, not to Panora.
  function startConnect(provider: "gmail" | "outlook") {
    setConsent({ provider });
  }

  function approveConsent(provider: "gmail" | "outlook") {
    setConsent(null);
    setMailbox({
      status: "connected",
      provider,
      email: "courtier@cabinet-dupont.fr",
    });
    window.setTimeout(() => onComplete(), 900);
  }

  const emailExtranets = configuredExtranets.filter(
    (c) => c.otpDelivery?.channel === "email" && c.otpDelivery.sourceAddress
  );
  const forwardSources = emailExtranets.map((c) => ({
    id: c.id,
    insurerId: c.insurerId,
    insurerName: c.insurerName,
    portalLabel: c.portalLabel,
    address:
      c.otpDelivery?.channel === "email"
        ? c.otpDelivery.sourceAddress ?? ""
        : "",
  }));
  const allForwardConfigured =
    emailExtranets.length > 0 &&
    emailExtranets.every((c) => c.emailForwardConfigured === true);

  // State C: nothing to set up — neither method helps when no portal proposes email.
  if (state === "C") {
    return (
      <article className="rounded-2xl border border-panora-warning/20 bg-panora-warning-bg/30 p-6 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-white border border-panora-warning/30 flex items-center justify-center">
            <Bell className="w-4 h-4 text-panora-warning-text" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
              Vous saisirez les codes à la main
            </h2>
            <p className="text-[13px] text-panora-text-secondary leading-[20px] max-w-[600px]">
              Aucun de vos portails ne propose actuellement le mode email. Vos
              cotations restent en file d&apos;attente, puis se lancent dès
              qu&apos;une session s&apos;ouvre.
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <MethodPicker value={method} onChange={onMethodChange} />
      {method === "mailbox" ? (
        <MailboxConnectPanel
          mailbox={mailbox}
          onConnect={startConnect}
          onDisconnect={() => setMailbox({ status: "idle" })}
          onAskItAuth={() => setItAuthOpen(true)}
          onResumeAfterItAuth={(provider) => startConnect(provider)}
        />
      ) : (
        <ForwardRulePanel
          sources={forwardSources}
          isConfigured={allForwardConfigured}
          onToggle={(configured) =>
            emailExtranets.forEach((c) => onToggleForward(c.id, configured))
          }
        />
      )}
      {itAuthOpen && (
        <ItAuthModal
          provider={
            mailbox.status === "it_auth_pending" ? mailbox.provider : "gmail"
          }
          onClose={() => setItAuthOpen(false)}
          onConfirm={(provider) => {
            setMailbox({ status: "it_auth_pending", provider });
            setItAuthOpen(false);
          }}
        />
      )}
      {consent && (
        <OAuthConsentModal
          provider={consent.provider}
          onCancel={() => setConsent(null)}
          onApprove={() => approveConsent(consent.provider)}
        />
      )}
    </section>
  );
}

// ── Method picker (mailbox connection vs forward rule) ──

function MethodPicker({
  value,
  onChange,
}: {
  value: "mailbox" | "forward";
  onChange: (v: "mailbox" | "forward") => void;
}) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-[17px] font-semibold text-panora-text font-display leading-6 tracking-[-0.01em] mb-1">
        Comment Panora reçoit vos codes
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MethodCard
          selected={value === "mailbox"}
          onClick={() => onChange("mailbox")}
          title="Connexion à votre messagerie"
          recommended
          tag="2 clics"
          body="Panora lit uniquement les emails 2FA reçus de vos assureurs. Rien à configurer dans votre boîte."
        />
        <MethodCard
          selected={value === "forward"}
          onClick={() => onChange("forward")}
          title="Règle de transfert manuelle"
          tag="5 à 10 min"
          body="Une règle créée dans votre messagerie transfère les codes 2FA vers une adresse Panora dédiée."
        />
      </div>
    </fieldset>
  );
}

function MethodCard({
  selected,
  onClick,
  title,
  body,
  tag,
  recommended,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  body: string;
  tag: string;
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col gap-3 p-5 rounded-xl text-left transition-all border-2",
        selected
          ? "border-panora-green-dark bg-panora-green-light/40 shadow-[0px_4px_14px_-4px_rgba(0,162,114,0.22)]"
          : "border-panora-border bg-white hover:border-panora-text-muted/40 hover:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors shrink-0",
            selected
              ? "border-panora-green-dark bg-panora-green-dark text-white"
              : "border-panora-text-muted/40 bg-white"
          )}
        >
          {selected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
        </span>
        <div className="flex items-center gap-1.5">
          {recommended && (
            <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-full bg-panora-green text-[10px] font-semibold text-white tracking-[0.01em]">
              <Sparkles className="w-2.5 h-2.5" />
              Recommandé
            </span>
          )}
          <span className="text-[11px] text-panora-text-muted font-medium leading-4">
            {tag}
          </span>
        </div>
      </div>
      <h3 className="text-[15px] font-semibold text-panora-text font-display leading-5 tracking-[-0.005em]">
        {title}
      </h3>
      <p className="text-[13px] text-panora-text-secondary leading-[20px]">
        {body}
      </p>
    </button>
  );
}

type MailboxState =
  | { status: "idle" }
  | { status: "connected"; provider: "gmail" | "outlook"; email: string }
  | { status: "it_auth_pending"; provider: "gmail" | "outlook" };

function MailboxConnectPanel({
  mailbox,
  onConnect,
  onDisconnect,
  onAskItAuth,
  onResumeAfterItAuth,
}: {
  mailbox: MailboxState;
  onConnect: (provider: "gmail" | "outlook") => void;
  onDisconnect: () => void;
  onAskItAuth: () => void;
  onResumeAfterItAuth: (provider: "gmail" | "outlook") => void;
}) {
  if (mailbox.status === "connected") {
    return (
      <article className="rounded-2xl border border-panora-green-border bg-panora-green-light/20 p-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-panora-green-border flex items-center justify-center">
            <Check className="w-5 h-5 text-panora-green-dark" strokeWidth={3} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-semibold text-panora-text leading-5 font-display">
              Messagerie connectée
            </span>
            <span className="text-[12px] text-panora-text-secondary leading-4">
              {mailbox.provider === "gmail" ? "Gmail" : "Outlook"} ·{" "}
              <span className="font-mono">{mailbox.email}</span>
            </span>
          </div>
        </div>
        <p className="text-[13px] text-panora-text-secondary leading-[20px] max-w-[640px]">
          Panora lit uniquement les emails 2FA de vos assureurs. Vous pouvez
          révoquer cet accès à tout moment depuis les paramètres.
        </p>
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={onDisconnect}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-panora-border bg-white text-[12px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
          >
            Déconnecter
          </button>
        </div>
      </article>
    );
  }

  // IT auth pending — interrupt-and-resume
  if (mailbox.status === "it_auth_pending") {
    return (
      <article className="rounded-2xl border border-panora-warning/30 bg-panora-warning-bg/30 p-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-panora-warning/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-panora-warning-text" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-semibold text-panora-text leading-5 font-display">
              Autorisation IT en attente
            </span>
            <span className="text-[12px] text-panora-text-secondary leading-4">
              {mailbox.provider === "gmail" ? "Gmail" : "Outlook"} · Revenez
              dès l&apos;autorisation accordée
            </span>
          </div>
        </div>
        <p className="text-[13px] text-panora-text-secondary leading-[20px] max-w-[640px]">
          Votre progression est sauvegardée. Dès que votre IT autorise Panora,
          revenez ici pour finaliser la connexion. En attendant, vous saisirez
          les codes 2FA à la main.
        </p>
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={() => onResumeAfterItAuth(mailbox.provider)}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-panora-border bg-white text-[12px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
          >
            J&apos;ai l&apos;autorisation, finaliser
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-panora-border bg-white p-6 lg:p-7 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[18px] font-semibold text-panora-text leading-6 font-display tracking-[-0.01em]">
          Choisissez votre messagerie
        </h2>
        <p className="text-[13px] text-panora-text-secondary leading-[20px] max-w-[600px]">
          Panora ne lira que les emails 2FA envoyés par vos assureurs. Aucun
          autre courrier n&apos;est consulté.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ProviderButton
          provider="gmail"
          onClick={() => onConnect("gmail")}
        />
        <ProviderButton
          provider="outlook"
          onClick={() => onConnect("outlook")}
        />
      </div>

      <ReassuranceBlock />

      <div className="pt-3 border-t border-panora-border flex items-center">
        <button
          type="button"
          onClick={onAskItAuth}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-text-secondary hover:text-panora-text leading-4"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Votre IT bloque cette connexion ? Demander l&apos;autorisation
        </button>
      </div>
    </article>
  );
}

// ── Reassurance block (lives next to OAuth, not in footnote) ──

function ReassuranceBlock() {
  return (
    <ul className="flex flex-col gap-1.5 text-[12px] text-panora-text-secondary leading-[18px]">
      <ReassuranceRow>
        <span className="font-medium text-panora-text">Lecture seule</span>{" "}
        sur les emails 2FA de vos assureurs.
      </ReassuranceRow>
      <ReassuranceRow>
        <span className="font-medium text-panora-text">
          Aucun autre courrier n&apos;est lu.
        </span>{" "}
        Le reste de votre boîte vous appartient.
      </ReassuranceRow>
      <ReassuranceRow>
        <span className="font-medium text-panora-text">
          Rien n&apos;est stocké en clair
        </span>{" "}
        — chiffrement AES-256, serveurs français, accès révocable à tout
        moment.
      </ReassuranceRow>
    </ul>
  );
}

function ReassuranceRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-panora-green-light">
        <Check className="w-2.5 h-2.5 text-panora-green-dark" strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  );
}

// ── Provider button (Gmail / Outlook) ──

function ProviderButton({
  provider,
  onClick,
}: {
  provider: "gmail" | "outlook";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 px-4 h-14 rounded-xl border border-panora-border bg-white text-left transition-all hover:border-panora-text-muted/40 hover:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06)]"
    >
      <ProviderGlyph provider={provider} />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[13px] font-semibold text-panora-text leading-4">
          {provider === "gmail" ? "Connecter Gmail" : "Connecter Outlook"}
        </span>
        <span className="text-[11px] text-panora-text-muted leading-3">
          {provider === "gmail"
            ? "Compte Google personnel ou professionnel"
            : "Compte Outlook ou Microsoft 365"}
        </span>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-panora-text-muted shrink-0 group-hover:text-panora-text" />
    </button>
  );
}

function ProviderGlyph({ provider }: { provider: "gmail" | "outlook" }) {
  const accent = provider === "gmail" ? "#cb8052" : "#3D5479";
  return (
    <div className="shrink-0 w-9 h-9 rounded-lg bg-white border border-panora-border flex items-center justify-center">
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden>
        <path
          d="M2 2h16v10H2z"
          fill="#fff"
          stroke="#e2e2e2"
          strokeWidth="0.5"
        />
        <path d="M2 2l8 6 8-6" stroke={accent} strokeWidth="1.4" fill="none" />
      </svg>
    </div>
  );
}

// ── Portal list (justification) ──

type ModeChannel = "email" | "sms" | "app";

// Catalog-level knowledge: which 2FA modes each portal authorizes.
// In production this comes from per-portal research, not from detection.
const PORTAL_MODES: Record<string, ModeChannel[]> = {
  axa: ["email", "sms"],
  generali: ["email", "sms", "app"],
  allianz: ["email", "sms"],
  chubb: ["sms", "app"],
  hiscox: ["app"],
};

function modesFor(insurerId: string): ModeChannel[] {
  return PORTAL_MODES[insurerId] ?? [];
}

function PortalList({
  configuredExtranets: _configuredExtranets,
}: {
  configuredExtranets: ExtranetConfig[];
}) {
  // Demo: 2 portals offering email + 1 without, regardless of what's actually
  // stored. Switch back to deriving from `configuredExtranets` once detection
  // is wired.
  const DEMO_ROWS: {
    id: string;
    insurerId: string;
    insurerName: string;
    portalLabel?: string;
    modes: ModeChannel[];
  }[] = [
    {
      id: "demo-axa",
      insurerId: "axa",
      insurerName: "Axa",
      modes: ["email", "sms"],
    },
    {
      id: "demo-generali",
      insurerId: "generali",
      insurerName: "Generali",
      portalLabel: "Auto / MRI",
      modes: ["email", "sms", "app"],
    },
    {
      id: "demo-hiscox",
      insurerId: "hiscox",
      insurerName: "Hiscox",
      modes: ["app"],
    },
  ];

  const { withEmail, withoutEmail } = useMemo(() => {
    const w = [];
    const wo = [];
    for (const row of DEMO_ROWS) {
      if (row.modes.includes("email")) w.push(row);
      else wo.push(row);
    }
    return { withEmail: w, withoutEmail: wo };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-col gap-7">
      <div className="flex flex-col gap-3 max-w-[680px]">
        <h2 className="text-[17px] font-semibold text-panora-text font-display leading-6 tracking-[-0.01em]">
          Les modes 2FA proposés par vos assureurs
        </h2>
        <ModeLegend />
      </div>

      {withEmail.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h3 className="text-[13px] font-medium text-panora-text leading-4">
              Vous pouvez basculer en email
            </h3>
            <a
              href={SWITCH_TO_EMAIL_GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-panora-green-dark hover:text-panora-text leading-4"
            >
              Voir comment
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ul className="flex flex-col gap-2">
            {withEmail.map((row) => (
              <PortalRow key={row.id} {...row} variant="action" />
            ))}
          </ul>
        </div>
      )}

      {withoutEmail.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[13px] font-medium text-panora-text-secondary leading-4">
            Pas de mode email proposé
          </h3>
          <ul className="flex flex-col gap-2">
            {withoutEmail.map((row) => (
              <PortalRow key={row.id} {...row} variant="muted" />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ModeLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <LegendItem
        icon={<Mail className="w-3 h-3 text-panora-green-dark" />}
        label="Email"
        tone="green"
      />
      <LegendItem
        icon={<Smartphone className="w-3 h-3 text-panora-warning-text" />}
        label="SMS"
        tone="copper"
      />
      <LegendItem
        icon={<KeyRound className="w-3 h-3 text-panora-error" />}
        label="Application"
        tone="bordeaux"
      />
    </div>
  );
}

function LegendItem({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "green" | "copper" | "bordeaux";
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-panora-text-secondary">
      <span
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 rounded border",
          tone === "green" &&
            "bg-panora-green-light border-panora-green-border",
          tone === "copper" &&
            "bg-panora-warning-bg border-panora-warning/30",
          tone === "bordeaux" && "bg-panora-error-bg/60 border-panora-error/20"
        )}
      >
        {icon}
      </span>
      {label}
    </span>
  );
}

function PortalRow({
  insurerId,
  insurerName,
  portalLabel,
  modes,
  variant,
}: {
  insurerId: string;
  insurerName: string;
  portalLabel?: string;
  modes: ModeChannel[];
  variant: "action" | "muted";
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border",
        variant === "action"
          ? "border-panora-border bg-white"
          : "border-panora-border/70 bg-panora-bg/30"
      )}
    >
      <InsurerLogo insurerId={insurerId} name={insurerName} size="md" />
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className={cn(
            "text-[13px] leading-4 truncate",
            variant === "action"
              ? "font-medium text-panora-text"
              : "text-panora-text-secondary"
          )}
        >
          {insurerName}
          {portalLabel && (
            <span className="text-panora-text-muted ml-1">
              · {portalLabel}
            </span>
          )}
        </span>
      </div>
      <ModeIcons modes={modes} />
    </li>
  );
}

function ModeIcons({ modes }: { modes: ModeChannel[] }) {
  if (modes.length === 0) {
    return (
      <span className="text-[11px] text-panora-text-muted">Pas de 2FA</span>
    );
  }
  return (
    <div className="flex items-center gap-1">
      {modes.map((m) => (
        <ModeIcon key={m} mode={m} />
      ))}
    </div>
  );
}

function ModeIcon({ mode }: { mode: ModeChannel }) {
  const Icon =
    mode === "email" ? Mail : mode === "sms" ? Smartphone : KeyRound;
  const label =
    mode === "email" ? "Email" : mode === "sms" ? "SMS" : "Application";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-6 h-6 rounded-md border",
        mode === "email" &&
          "bg-panora-green-light border-panora-green-border text-panora-green-dark",
        mode === "sms" &&
          "bg-panora-warning-bg border-panora-warning/30 text-panora-warning-text",
        mode === "app" &&
          "bg-panora-error-bg/60 border-panora-error/20 text-panora-error"
      )}
      title={label}
      aria-label={label}
    >
      <Icon className="w-3 h-3" />
    </span>
  );
}

// ── IT authorization modal ──

function ItAuthModal({
  provider,
  onClose,
  onConfirm,
}: {
  provider: "gmail" | "outlook";
  onClose: () => void;
  onConfirm: (provider: "gmail" | "outlook") => void;
}) {
  const [copied, setCopied] = useState(false);
  const template = `Bonjour,

Je souhaite utiliser Panora (panora.co), un assistant de cotation pour courtiers, qui nécessite un accès en lecture seule à ma boîte ${provider === "gmail" ? "Gmail" : "Outlook"} pour récupérer les codes 2FA envoyés par les portails assureurs.

Merci d'autoriser l'application "Panora" dans la console ${provider === "gmail" ? "Google Workspace" : "Microsoft 365"}.

Pour les détails de sécurité : security@panora.co

Merci,`;

  function copyTemplate() {
    navigator.clipboard.writeText(template);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px] p-4"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[560px] flex flex-col max-h-[90vh] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-panora-border">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[15px] font-semibold text-panora-text font-display leading-5">
              Demander l&apos;autorisation à votre IT
            </h2>
            <p className="text-[12px] text-panora-text-secondary leading-4">
              Message à transférer à votre service informatique
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md text-panora-text-muted hover:text-panora-text hover:bg-panora-drop transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
          <p className="text-[12px] text-panora-text-secondary leading-[18px]">
            Copiez ce message et envoyez-le à votre IT. Votre progression est
            sauvegardée ; reprenez l&apos;onboarding dès l&apos;autorisation
            accordée.
          </p>
          <div className="rounded-lg border border-panora-border bg-panora-bg/60 p-4 flex flex-col gap-3">
            <pre className="font-sans text-[12px] text-panora-text leading-[18px] whitespace-pre-wrap">
              {template}
            </pre>
            <button
              type="button"
              onClick={copyTemplate}
              className="self-start inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-panora-border bg-white text-[11px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" strokeWidth={3} />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copier le message
                </>
              )}
            </button>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-panora-border">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-3 h-9 rounded-md border border-panora-border bg-white text-[12px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onConfirm(provider)}
            className="btn-primary inline-flex items-center gap-1.5 px-4 h-9 text-[12px] font-semibold leading-4"
          >
            <Send className="w-3.5 h-3.5" />
            J&apos;ai envoyé la demande
          </button>
        </footer>
      </div>
    </div>
  );
}

// ── OAuth consent modal (faux third-party handoff) ──

function OAuthConsentModal({
  provider,
  onCancel,
  onApprove,
}: {
  provider: "gmail" | "outlook";
  onCancel: () => void;
  onApprove: () => void;
}) {
  const isGoogle = provider === "gmail";
  const providerName = isGoogle ? "Google" : "Microsoft";
  const providerDomain = isGoogle
    ? "accounts.google.com"
    : "login.microsoftonline.com";
  const accentColor = isGoogle ? "#1a73e8" : "#0067b8";
  const accentHover = isGoogle ? "#1765cc" : "#005a9e";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4"
      onMouseDown={onCancel}
    >
      <div
        className="w-full max-w-[460px] rounded-lg shadow-[0px_24px_64px_0px_rgba(0,0,0,0.25)] overflow-hidden bg-white"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="oauth-consent-title"
      >
        {/* Faux browser chrome — signals "you are no longer in Panora" */}
        <div className="flex items-center gap-3 px-3 h-9 bg-[#f1f3f4] border-b border-[#dadce0]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 h-5 rounded-md bg-white border border-[#dadce0] px-2 flex items-center gap-1.5 text-[11px] text-[#5f6368]">
            <LockGlyph />
            <span className="truncate">{providerDomain}</span>
          </div>
        </div>

        <div className="px-8 pt-7 pb-6 flex flex-col gap-5 bg-white">
          <div className="flex flex-col gap-3">
            {isGoogle ? <GoogleLogo /> : <MicrosoftLogo />}
            <div className="flex flex-col gap-0.5">
              <h2
                id="oauth-consent-title"
                className="text-[22px] font-normal text-[#202124] leading-[28px]"
              >
                Se connecter
              </h2>
              <p className="text-[14px] text-[#5f6368] leading-5">
                pour continuer vers{" "}
                <span style={{ color: accentColor }} className="font-medium">
                  Panora
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2.5 border border-[#dadce0] rounded-md hover:bg-[#f8f9fa] transition-colors text-left"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-medium shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              C
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] text-[#202124] truncate">
                Cabinet Dupont
              </span>
              <span className="text-[12px] text-[#5f6368] truncate">
                courtier@cabinet-dupont.fr
              </span>
            </div>
          </button>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#e8eaed]">
            <p className="text-[13px] text-[#202124] leading-5">
              <span className="font-medium">Panora</span> souhaite accéder à
              votre compte {providerName}.
            </p>
            <ul className="flex flex-col gap-1.5 text-[12px] text-[#5f6368] leading-[18px]">
              <li className="flex items-start gap-2.5">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#5f6368]" />
                <span>
                  Lire les codes 2FA envoyés par vos portails assureurs.
                </span>
              </li>
            </ul>
            <p className="text-[11px] text-[#5f6368] leading-4">
              Aucun autre courrier ne sera lu. Vous pouvez révoquer cet accès à
              tout moment.
            </p>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 px-5 py-4 bg-[#f8f9fa] border-t border-[#e8eaed]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 h-9 rounded-md text-[13px] font-medium hover:bg-black/5 transition-colors"
            style={{ color: accentColor }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="px-5 h-9 rounded-md text-white text-[13px] font-medium transition-colors"
            style={{ backgroundColor: accentColor }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = accentHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = accentColor)
            }
          >
            Autoriser
          </button>
        </footer>
      </div>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 10V8a6 6 0 1112 0v2m-9 4h6m-9 7h12a1 1 0 001-1v-9a1 1 0 00-1-1H6a1 1 0 00-1 1v9a1 1 0 001 1z"
        stroke="#5f6368"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382c-.232 1.25-.937 2.309-1.996 3.018v2.51h3.232c1.891-1.741 2.982-4.305 2.982-7.351z"
        fill="#4285f4"
      />
      <path
        d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.232-2.51c-.895.6-2.041.954-3.386.954-2.605 0-4.81-1.759-5.595-4.123H3.064v2.59C4.71 19.764 8.09 22 12 22z"
        fill="#34a853"
      />
      <path
        d="M6.405 13.9c-.2-.6-.314-1.241-.314-1.9 0-.659.114-1.3.314-1.9V7.51H3.064C2.386 8.86 2 10.386 2 12s.386 3.14 1.064 4.49l3.341-2.59z"
        fill="#fbbc05"
      />
      <path
        d="M12 5.977c1.468 0 2.786.504 3.823 1.495l2.868-2.868C16.96 2.99 14.695 2 12 2 8.09 2 4.71 4.236 3.064 7.51l3.341 2.59C7.19 7.736 9.395 5.977 12 5.977z"
        fill="#ea4335"
      />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="9" height="9" fill="#f25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7fba00" />
      <rect x="2" y="13" width="9" height="9" fill="#00a4ef" />
      <rect x="13" y="13" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

// ── Forward rule panel (subordinate fallback) ──

interface SourceRow {
  id: string;
  insurerId: string;
  insurerName: string;
  portalLabel?: string;
  address: string;
}

function ForwardRulePanel({
  sources,
  isConfigured,
  onToggle,
}: {
  sources: SourceRow[];
  isConfigured: boolean;
  onToggle: (configured: boolean) => void;
}) {
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const isTutorial = sources.length === 0;
  const displayed = isTutorial ? TUTORIAL_SOURCES : sources;

  return (
    <article className="rounded-2xl border border-panora-border bg-white overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-panora-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-panora-green-light flex items-center justify-center">
              <Mail className="w-4 h-4 text-panora-green-dark" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-semibold text-panora-text leading-5 font-display">
                Règle de transfert 2FA
              </span>
              <span className="text-[11px] text-panora-text-muted leading-4">
                {isTutorial
                  ? "Exemple de règle"
                  : `${displayed.length} expéditeur${displayed.length > 1 ? "s" : ""} couvert${displayed.length > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
          {isTutorial ? (
            <span className="shrink-0 inline-flex items-center gap-1.5 px-2 h-6 rounded-full bg-panora-secondary text-[11px] font-semibold text-panora-text-secondary">
              <Sparkles className="w-3 h-3" />
              Exemple
            </span>
          ) : isConfigured ? (
            <span className="shrink-0 inline-flex items-center gap-1.5 px-2 h-6 rounded-full bg-panora-green-light text-[11px] font-semibold text-panora-green-dark">
              <Check className="w-3 h-3" strokeWidth={3} />
              Configurée
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1.5 px-2 h-6 rounded-full bg-panora-warning-bg text-[11px] font-semibold text-panora-warning-text">
              À configurer
            </span>
          )}
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">
          <SourceList sources={displayed} isTutorial={isTutorial} />
          <div className="flex items-center justify-center text-panora-text-muted">
            <ArrowDown className="w-4 h-4" />
          </div>
          <DestinationField value={COTATION_EMAIL} />

          <div className="pt-1 border-t border-panora-border">
            <button
              type="button"
              onClick={() => setInstructionsOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-medium text-panora-text-secondary hover:text-panora-text leading-4 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Comment créer la règle dans votre messagerie
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform duration-200",
                  instructionsOpen && "rotate-180"
                )}
              />
            </button>
            {instructionsOpen && <InstructionsPanel sources={displayed} />}
          </div>

          {!isTutorial && (
            <div className="flex items-center justify-end pt-1">
              {isConfigured ? (
                <button
                  type="button"
                  onClick={() => onToggle(false)}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md border border-panora-border bg-white text-[12px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
                >
                  Marquer comme non configurée
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggle(true)}
                  className="btn-primary inline-flex items-center gap-1.5 px-4 h-9 text-[13px] font-semibold leading-5"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  J&apos;ai configuré la règle
                </button>
              )}
            </div>
          )}
        </div>
    </article>
  );
}

const TUTORIAL_SOURCES: SourceRow[] = [
  {
    id: "demo-axa",
    insurerId: "axa",
    insurerName: "Axa",
    address: "noreply.2fa@axa.fr",
  },
  {
    id: "demo-generali",
    insurerId: "generali",
    insurerName: "Generali",
    address: "securite@generali.fr",
  },
];

function SourceList({
  sources,
  isTutorial,
}: {
  sources: SourceRow[];
  isTutorial: boolean;
}) {
  const [copied, setCopied] = useState(false);
  function copyAll() {
    const text = sources.map((s) => s.address).join(", ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-panora-text leading-4">
          Quand l&apos;expéditeur est l&apos;une de ces adresses
        </span>
        {sources.length > 1 && (
          <button
            type="button"
            onClick={copyAll}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-panora-text-secondary hover:text-panora-text leading-4 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" strokeWidth={3} />
                Copiés
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copier tout
              </>
            )}
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-1.5">
        {sources.map((s) => (
          <SourceRowItem key={s.id} source={s} />
        ))}
      </ul>
      {isTutorial && (
        <p className="text-[11px] text-panora-text-muted leading-4">
          Exemple basé sur AXA et Generali. Vos adresses réelles
          apparaîtront après la connexion de vos accès.
        </p>
      )}
    </div>
  );
}

function SourceRowItem({ source }: { source: SourceRow }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(source.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <li className="flex items-center gap-2.5 h-10 px-3 rounded-lg border border-panora-border bg-panora-bg">
      <InsurerLogo
        insurerId={source.insurerId}
        name={source.insurerName}
        size="sm"
      />
      <span className="shrink-0 text-[12px] text-panora-text-muted leading-4">
        {source.insurerName}
        {source.portalLabel && ` · ${source.portalLabel}`}
      </span>
      <span className="flex-1 text-[13px] font-mono text-panora-text truncate text-right">
        {source.address}
      </span>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md text-panora-text-secondary hover:bg-panora-secondary transition-colors"
        aria-label={`Copier ${source.address}`}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </li>
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
      <span className="text-[12px] font-medium text-panora-text leading-4">
        Transférer vers votre adresse Panora
      </span>
      <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-panora-green-border bg-panora-green-light shadow-[0px_2px_8px_-4px_rgba(0,162,114,0.18)]">
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

function InstructionsPanel({ sources }: { sources: SourceRow[] }) {
  const [provider, setProvider] = useState<"gmail" | "outlook" | "other">(
    "gmail"
  );
  const sourcePattern = sources.map((s) => s.address).join(" OR ");
  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="inline-flex items-center gap-1 bg-panora-drop p-0.5 rounded-md self-start">
        {(["gmail", "outlook", "other"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProvider(p)}
            className={cn(
              "inline-flex items-center px-2.5 h-6 rounded text-[11px] font-medium leading-4 transition-colors",
              provider === p
                ? "bg-white text-panora-text shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                : "text-panora-text-secondary hover:text-panora-text"
            )}
          >
            {p === "gmail" ? "Gmail" : p === "outlook" ? "Outlook" : "Autre"}
          </button>
        ))}
      </div>
      <ol className="flex flex-col gap-1.5 text-[12px] text-panora-text-secondary leading-[18px]">
        {INSTRUCTIONS[provider](sourcePattern).map((step, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span className="shrink-0 mt-px inline-flex items-center justify-center w-4 h-4 rounded-full bg-panora-secondary text-[10px] font-semibold text-panora-text-secondary tabular-nums">
              {idx + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {sources.length > 1 && (
        <p className="flex items-start gap-2 text-[11px] text-panora-text-muted leading-4 pt-1 border-t border-panora-border/70">
          <Plus className="w-3 h-3 mt-0.5 shrink-0" />
          La plupart des messageries acceptent plusieurs expéditeurs dans le
          même filtre, séparés par <code className="font-mono">OR</code> ou des
          virgules.
        </p>
      )}
    </div>
  );
}

const INSTRUCTIONS: Record<
  "gmail" | "outlook" | "other",
  (sourcePattern: string) => string[]
> = {
  gmail: (sourcePattern) => [
    "Dans Gmail, ouvrez Paramètres › Voir tous les paramètres › Filtres et adresses bloquées.",
    `Cliquez sur « Créer un filtre » et collez dans le champ « De » : ${sourcePattern}`,
    "À l'étape suivante, cochez « Transférer à » puis ajoutez votre adresse Panora ci-dessus.",
    "Validez l'email de confirmation reçu sur votre adresse Panora.",
  ],
  outlook: (sourcePattern) => [
    "Dans Outlook, ouvrez Paramètres › Courrier › Règles.",
    `Créez une règle « Si l'expéditeur contient l'une de ces adresses » et collez : ${sourcePattern.replace(/ OR /g, ", ")}.`,
    "Choisissez l'action « Transférer à » et collez votre adresse Panora.",
    "Activez la règle et vérifiez la réception du premier transfert.",
  ],
  other: (sourcePattern) => [
    "Localisez l'option « Transfert automatique » ou « Forwarding » dans les paramètres.",
    `Créez un filtre sur les expéditeurs : ${sourcePattern}.`,
    "Ajoutez votre adresse Panora comme destinataire de transfert.",
    "Activez et validez le premier email transféré.",
  ],
};

