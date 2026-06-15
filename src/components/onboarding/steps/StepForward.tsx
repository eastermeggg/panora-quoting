"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Mail,
  ArrowRight,
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
import { OnboardingHero, HeroAccent } from "@/components/onboarding/OnboardingHero";

const COTATION_EMAIL = "cotation+a7f3b2@panora.co";
const SWITCH_TO_EMAIL_GUIDE_URL =
  "https://panora.notion.site/2fa-passer-en-email";
const PRIVACY_URL = "https://panora.notion.site/confidentialite-messagerie";

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
  /**
   * Which sub-step inside Gestion 2FA is active:
   *  0 — Comprendre la 2FA
   *  1 — Vos compagnies d'assurance et leur 2FA
   *  2 — Mettre en place l'automatisation
   */
  subStep: 0 | 1 | 2;
}

export function StepForward({
  configuredExtranets,
  method,
  onMethodChange,
  onComplete,
  onToggleForward,
  subStep,
}: StepForwardProps) {
  // Catalog-level knowledge: do any configured portals authorize email 2FA?
  const state: DetectionState = useMemo(() => {
    const hasEmail = configuredExtranets.some(
      (c) => c.otpDelivery?.channel === "email"
    );
    return hasEmail ? "A" : "C";
  }, [configuredExtranets]);

  return (
    <div className="mx-auto w-full max-w-[1040px] flex flex-col gap-10 lg:gap-12 py-6 lg:py-10">
      {subStep === 0 && (
        <>
          <OnboardingHero
            eyebrow="Comprendre la 2FA"
            title={
              <>
                Panora <HeroAccent>automatise ce qui peut l&apos;être</HeroAccent>,
                et regroupe le reste en 1 à 3 saisies par jour.
              </>
            }
          />
          <ModesBreakdown />
        </>
      )}

      {subStep === 1 && (
        <>
          <OnboardingHero
            eyebrow="Vos compagnies d'assurance et leur 2FA"
            title={
              <>
                Voyons ce que Panora{" "}
                <HeroAccent>peut et ne peut pas</HeroAccent> automatiser pour
                vous.
              </>
            }
          />
          <PortalList configuredExtranets={configuredExtranets} />
        </>
      )}

      {subStep === 2 && (
        <>
          <OnboardingHero
            eyebrow="Mettre en place l'automatisation"
            title={
              <>
                Choisissez comment Panora reçoit vos{" "}
                <HeroAccent>codes par e-mail</HeroAccent> à votre place.
              </>
            }
          />
          <PrimaryAction
            state={state}
            method={method}
            onMethodChange={onMethodChange}
            onComplete={onComplete}
            configuredExtranets={configuredExtranets}
            onToggleForward={onToggleForward}
          />
        </>
      )}
    </div>
  );
}

// ── Modes breakdown: 4 modes, one automatable ──

function ModesBreakdown() {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-[17px] font-semibold text-panora-text font-display leading-6 tracking-[-0.01em]">
        Quatre modes possibles, un seul automatisable
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModeCard
          icon={<Mail className="w-5 h-5 text-panora-green-dark" />}
          tone="green"
          title="Code par e-mail"
          badge="auto"
          flow={[
            { label: "Code reçu", tone: "neutral" },
            { label: "Lu par Panora", tone: "accent" },
            { label: "Session ouverte", tone: "accent" },
          ]}
          body="Panora intercepte automatiquement le code et active la session sans intervention de votre part. Seule option entièrement automatisable — activez-le chez vos compagnies dès que c'est proposé."
        />
        <ModeCard
          icon={<Smartphone className="w-5 h-5 text-panora-warning-text" />}
          tone="copper"
          title="Code par SMS"
          badge="manuel"
          flow={[
            { label: "Code reçu", tone: "neutral" },
            { label: "Sur votre téléphone", tone: "neutral" },
            { label: "Vous saisissez", tone: "muted" },
          ]}
          body="Le code arrive sur votre téléphone. Vous le saisissez dans Panora au démarrage de votre journée."
        />
        <ModeCard
          icon={<KeyRound className="w-5 h-5 text-panora-error" />}
          tone="bordeaux"
          title="Code via application"
          badge="manuel"
          flow={[
            { label: "Code généré", tone: "neutral" },
            { label: "Dans l'app de la compagnie", tone: "neutral" },
            { label: "Vous saisissez", tone: "muted" },
          ]}
          body="L'application de la compagnie d'assurance génère un code valable quelques instants. Vous l'ouvrez, vous le saisissez."
        />
        <ModeCard
          icon={<Bell className="w-5 h-5 text-panora-text-secondary" />}
          tone="slate"
          title="Validation par notification"
          badge="manuel"
          flow={[
            { label: "Notification reçue", tone: "neutral" },
            { label: "Sur votre téléphone", tone: "neutral" },
            { label: "Vous approuvez", tone: "muted" },
          ]}
          body="L'app de la compagnie vous demande d'approuver la connexion. Validation en temps réel uniquement — vous devez être disponible."
        />
      </div>
    </section>
  );
}

type FlowChipTone = "accent" | "neutral" | "muted";

function ModeCard({
  icon,
  tone,
  title,
  badge,
  flow,
  body,
}: {
  icon: React.ReactNode;
  tone: "green" | "copper" | "bordeaux" | "slate";
  title: string;
  badge: "auto" | "manuel";
  flow: { label: string; tone: FlowChipTone }[];
  body: string;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col gap-4 p-5 rounded-xl border",
        tone === "green" && "border-panora-green-border bg-panora-green-light/25",
        tone === "copper" && "border-panora-border bg-white",
        tone === "bordeaux" && "border-panora-border bg-white",
        tone === "slate" && "border-panora-border bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]",
            tone === "green" && "border-panora-green-border",
            tone === "copper" && "border-panora-border",
            tone === "bordeaux" && "border-panora-border",
            tone === "slate" && "border-panora-border"
          )}
        >
          {icon}
        </div>
        {badge === "auto" ? (
          <span className="inline-flex items-center px-2 h-[22px] rounded-full bg-panora-green text-[10px] font-semibold text-white tracking-[0.01em]">
            Auto
          </span>
        ) : (
          <span className="inline-flex items-center px-2 h-[22px] rounded-full bg-panora-secondary border border-panora-border text-[10px] font-semibold text-panora-text-secondary tracking-[0.01em]">
            Manuel
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MethodCard
          selected={value === "mailbox"}
          onClick={() => onChange("mailbox")}
          title="Connectez votre messagerie"
          recommended
          mode="auto"
          body="Un filtre strict intercepte uniquement les codes de vérification envoyés par vos compagnies d'assurance — aucun autre e-mail n'est accessible. Connexion OAuth révocable à tout moment, rien à configurer dans votre boîte."
        />
        <MethodCard
          selected={value === "forward"}
          onClick={() => onChange("forward")}
          title="Transfert automatique"
          mode="manuel"
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
  mode,
  recommended,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  body: string;
  mode: "auto" | "manuel";
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
            <span className="inline-flex items-center px-2 h-[22px] rounded-full bg-panora-green text-[10px] font-semibold text-white tracking-[0.01em]">
              Recommandé
            </span>
          )}
          {mode === "auto" ? (
            <span className="inline-flex items-center px-2 h-[22px] rounded-full bg-panora-green-light text-[10px] font-semibold text-panora-green-dark border border-panora-green-border tracking-[0.01em]">
              Automatique
            </span>
          ) : (
            <span className="inline-flex items-center px-2 h-[22px] rounded-full bg-panora-secondary border border-panora-border text-[10px] font-semibold text-panora-text-secondary tracking-[0.01em]">
              Manuel
            </span>
          )}
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
          Panora intercepte uniquement les codes de vérification envoyés par vos
          compagnies d&apos;assurance. Aucun autre courrier n&apos;est accessible.
          Révocable à tout moment depuis vos paramètres.
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
          Pour automatiser la saisie des codes 2FA, Panora se connecte à votre
          messagerie via OAuth avec un filtre strict : seuls les e-mails de
          vérification envoyés par vos compagnies d&apos;assurance sont
          interceptés. Aucun autre courrier n&apos;est accessible à Panora.
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
        <span className="font-medium text-panora-text">Filtre strict</span>{" "}
        sur les codes 2FA de vos compagnies uniquement — aucun autre e-mail
        n&apos;est accessible à Panora.
      </ReassuranceRow>
      <ReassuranceRow>
        <span className="font-medium text-panora-text">
          Pas de stockage de vos e-mails.
        </span>{" "}
        Seul le code est transmis à l&apos;agent, puis effacé immédiatement.
      </ReassuranceRow>
      <ReassuranceRow>
        <span className="font-medium text-panora-text">
          Chiffrement AES-256
        </span>
        , serveurs hébergés en France, accès révocable à tout moment.
      </ReassuranceRow>
      <li className="pt-1">
        <a
          href={PRIVACY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-panora-green-dark hover:underline leading-4"
        >
          En savoir plus sur la confidentialité
          <ExternalLink className="w-3 h-3" />
        </a>
      </li>
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
  return (
    <div className="shrink-0 w-9 h-9 rounded-lg bg-white border border-panora-border flex items-center justify-center">
      {provider === "gmail" ? <GmailLogo /> : <OutlookLogo />}
    </div>
  );
}

function GmailLogo() {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 256 193"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455z"
      />
      <path
        fill="#34A853"
        d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.157 17.837-27.025 25.798z"
      />
      <path
        fill="#EA4335"
        d="M58.182 93.14l-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.669 33.413-4.669 42.223L128 145.504z"
      />
      <path
        fill="#FBBC04"
        d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945z"
      />
      <path
        fill="#C5221F"
        d="M0 49.504l26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23z"
      />
    </svg>
  );
}

function OutlookLogo() {
  return (
    <svg
      width="20"
      height="18"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="#0364B8"
        d="M44 13.5v21A3.5 3.5 0 0 1 40.5 38H21V10h19.5A3.5 3.5 0 0 1 44 13.5z"
      />
      <path
        fill="#0078D4"
        d="M21 10v28H7.5A3.5 3.5 0 0 1 4 34.5v-21A3.5 3.5 0 0 1 7.5 10H21z"
      />
      <path
        fill="#fff"
        d="M24 18h17v2H24zm0 4h17v2H24zm0 4h17v2H24zm0 4h12v2H24z"
      />
      <ellipse fill="#fff" cx="14" cy="24" rx="6.5" ry="7.5" />
      <ellipse fill="#0078D4" cx="14" cy="24" rx="3" ry="4" />
    </svg>
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
  portalLabel?: string;
};

type Bucket = "auto" | "manuel" | "locked";

function bucketFor(policy: PortalPolicy): Bucket {
  if (policy.lockedMode || policy.unsupportedExpiry) return "locked";
  if (policy.modes.includes("email")) return "auto";
  return "manuel";
}

function PortalList({
  configuredExtranets: _configuredExtranets,
}: {
  configuredExtranets: ExtranetConfig[];
}) {
  // Demo: 4 portals covering the three buckets. Switch back to deriving from
  // `configuredExtranets` once detection is wired.
  const DEMO_ROWS: PortalRowData[] = [
    { id: "demo-axa", insurerId: "axa", insurerName: "Axa" },
    {
      id: "demo-generali",
      insurerId: "generali",
      insurerName: "Generali",
      portalLabel: "Auto / MRI",
    },
    { id: "demo-chubb", insurerId: "chubb", insurerName: "Chubb" },
    { id: "demo-hiscox", insurerId: "hiscox", insurerName: "Hiscox" },
    {
      id: "demo-swisslife",
      insurerId: "swisslife",
      insurerName: "Swiss Life",
    },
  ];

  const { autoRows, manuelRows, lockedRows } = useMemo(() => {
    const a: PortalRowData[] = [];
    const m: PortalRowData[] = [];
    const l: PortalRowData[] = [];
    for (const row of DEMO_ROWS) {
      const bucket = bucketFor(policyFor(row.insurerId));
      if (bucket === "auto") a.push(row);
      else if (bucket === "manuel") m.push(row);
      else l.push(row);
    }
    return { autoRows: a, manuelRows: m, lockedRows: l };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-col gap-7">
      <div className="flex flex-col gap-3 max-w-[680px]">
        <h2 className="text-[17px] font-semibold text-panora-text font-display leading-6 tracking-[-0.01em]">
          Les modes 2FA proposés par vos compagnies d&apos;assurance
        </h2>
        <ModeLegend />
      </div>

      {autoRows.length > 0 && (
        <div className="flex flex-col gap-4 p-5 lg:p-6 rounded-2xl border border-panora-green-border bg-panora-green-light/30 shadow-[0px_4px_18px_-8px_rgba(0,162,114,0.25)]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-panora-green-border flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]">
                <Mail className="w-5 h-5 text-panora-green-dark" />
              </div>
              <h3 className="text-[16px] font-semibold text-panora-text leading-5 font-display tracking-[-0.01em]">
                Automatisable — basculez en e-mail
              </h3>
            </div>
            <a
              href={SWITCH_TO_EMAIL_GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 px-4 h-10 text-[13px] font-semibold leading-5 shrink-0"
            >
              Voir comment basculer
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <ul className="flex flex-col gap-2">
            {autoRows.map((row) => (
              <PortalRow key={row.id} {...row} bucket="auto" />
            ))}
          </ul>
        </div>
      )}

      {manuelRows.length > 0 && (
        <BucketPanel
          icon={<Smartphone className="w-5 h-5 text-panora-text-secondary" />}
          title="À saisir une fois par jour"
          sub="Pas de mode e-mail proposé. Vous regroupez ces codes au démarrage de votre journée."
        >
          {manuelRows.map((row) => (
            <PortalRow key={row.id} {...row} bucket="manuel" />
          ))}
        </BucketPanel>
      )}

      {lockedRows.length > 0 && (
        <BucketPanel
          icon={<Bell className="w-5 h-5 text-panora-text-secondary" />}
          title="Mode imposé — saisie en temps réel"
          sub="Ces compagnies n'autorisent pas le changement de mode. Vous saisirez le code au moment de la cotation."
        >
          {lockedRows.map((row) => (
            <PortalRow key={row.id} {...row} bucket="locked" />
          ))}
        </BucketPanel>
      )}
    </section>
  );
}

function BucketPanel({
  icon,
  title,
  sub,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 p-5 lg:p-6 rounded-2xl border border-panora-border bg-white">
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-panora-bg border border-panora-border flex items-center justify-center">
          {icon}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="text-[15px] font-semibold text-panora-text leading-5 font-display tracking-[-0.005em]">
            {title}
          </h3>
          <p className="text-[12px] text-panora-text-muted leading-4 max-w-[520px]">
            {sub}
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function ModeLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <LegendItem
        icon={<Mail className="w-3 h-3 text-panora-green-dark" />}
        label="E-mail"
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
      <LegendItem
        icon={<Bell className="w-3 h-3 text-panora-text-secondary" />}
        label="Notification"
        tone="slate"
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
  tone: "green" | "copper" | "bordeaux" | "slate";
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
          tone === "bordeaux" &&
            "bg-panora-error-bg/60 border-panora-error/20",
          tone === "slate" && "bg-panora-secondary border-panora-border"
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
  bucket,
}: PortalRowData & { bucket: Bucket }) {
  const policy = policyFor(insurerId);
  const lockedOrAction = bucket !== "manuel";

  return (
    <li
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border",
        bucket === "auto" && "border-panora-border bg-white",
        bucket === "manuel" && "border-panora-border/70 bg-panora-bg/30",
        bucket === "locked" && "border-panora-error/20 bg-panora-error-bg/30"
      )}
    >
      <InsurerLogo insurerId={insurerId} name={insurerName} size="md" />
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className={cn(
            "text-[13px] leading-4 truncate",
            lockedOrAction
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
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <BucketPill bucket={bucket} />
          {policy.sessionDurationLabel && (
            <span className="inline-flex items-center px-1.5 h-4 rounded text-[10px] font-medium text-panora-text-muted bg-panora-secondary/70 border border-panora-border tabular-nums">
              Session {policy.sessionDurationLabel}
            </span>
          )}
        </div>
      </div>
      <ModeIcons modes={policy.modes} lockedMode={policy.lockedMode} />
    </li>
  );
}

function BucketPill({ bucket }: { bucket: Bucket }) {
  if (bucket === "auto") {
    return (
      <span className="inline-flex items-center px-1.5 h-4 rounded text-[10px] font-semibold text-panora-green-dark bg-panora-green-light border border-panora-green-border tracking-[0.01em]">
        Auto
      </span>
    );
  }
  if (bucket === "manuel") {
    return (
      <span className="inline-flex items-center px-1.5 h-4 rounded text-[10px] font-semibold text-panora-warning-text bg-panora-warning-bg border border-panora-warning/30 tracking-[0.01em]">
        Manuel
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 h-4 rounded text-[10px] font-semibold text-panora-error bg-panora-error-bg border border-panora-error/30 tracking-[0.01em]">
      Imposé
    </span>
  );
}

function ModeIcons({
  modes,
  lockedMode,
}: {
  modes: ModeChannel[];
  lockedMode?: ModeChannel;
}) {
  if (modes.length === 0) {
    return (
      <span className="text-[11px] text-panora-text-muted">Pas de 2FA</span>
    );
  }
  const displayed = lockedMode ? [lockedMode] : modes;
  return (
    <div className="flex items-center gap-1 shrink-0">
      {displayed.map((m) => (
        <ModeIcon key={m} mode={m} />
      ))}
    </div>
  );
}

function ModeIcon({ mode }: { mode: ModeChannel }) {
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
      ? "Email"
      : mode === "sms"
        ? "SMS"
        : mode === "app"
          ? "Application"
          : "Notification push";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-6 h-6 rounded-md border",
        mode === "email" &&
          "bg-panora-green-light border-panora-green-border text-panora-green-dark",
        mode === "sms" &&
          "bg-panora-warning-bg border-panora-warning/30 text-panora-warning-text",
        mode === "app" &&
          "bg-panora-error-bg/60 border-panora-error/20 text-panora-error",
        mode === "push" &&
          "bg-panora-secondary border-panora-border text-panora-text-secondary"
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

Je souhaite utiliser Panora (panora.co), un assistant de cotation pour courtiers, qui nécessite un accès en lecture seule à ma boîte ${provider === "gmail" ? "Gmail" : "Outlook"} pour récupérer les codes 2FA envoyés par les portails des compagnies d'assurance.

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
                  Accéder aux e-mails de vérification envoyés par vos portails
                  d&apos;assurance pour en extraire les codes 2FA.
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
  onToggle: _onToggle,
}: {
  sources: SourceRow[];
  isConfigured: boolean;
  onToggle: (configured: boolean) => void;
}) {
  const isTutorial = sources.length === 0;
  const displayed = isTutorial ? TUTORIAL_SOURCES : sources;

  return (
    <article className="rounded-2xl border border-panora-border bg-white overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-panora-border">
        <span className="text-[14px] font-semibold text-panora-text leading-5 font-display">
          Règle de transfert
        </span>
        {!isTutorial && isConfigured && (
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2 h-6 rounded-full bg-panora-green-light text-[11px] font-semibold text-panora-green-dark">
            <Check className="w-3 h-3" strokeWidth={3} />
            Configurée
          </span>
        )}
      </div>

      <div className="px-5 py-5 flex flex-col gap-6">
        <p className="text-[13px] text-panora-text-secondary leading-5">
          Dans votre messagerie, créez une règle qui transfère automatiquement
          les emails 2FA reçus de vos compagnies d&apos;assurance vers Panora.
        </p>

        <SourceList sources={displayed} isTutorial={isTutorial} />

        <DestinationField value={COTATION_EMAIL} />

        <InstructionsPanel sources={displayed} />
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
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-panora-text-muted leading-4">
          Expéditeurs à transférer
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

function InstructionsPanel({ sources }: { sources: SourceRow[] }) {
  const [provider, setProvider] = useState<"gmail" | "outlook">("gmail");
  const sourcePattern = sources.map((s) => s.address).join(" OR ");
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-panora-bg/60 border border-panora-border">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-panora-text-muted leading-4">
          Tutoriel
        </span>
        <div className="inline-flex items-center gap-1 bg-white p-0.5 rounded-md border border-panora-border">
          {(["gmail", "outlook"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className={cn(
                "inline-flex items-center px-2.5 h-6 rounded text-[11px] font-medium leading-4 transition-colors",
                provider === p
                  ? "bg-panora-text text-white"
                  : "text-panora-text-secondary hover:text-panora-text"
              )}
            >
              {p === "gmail" ? "Gmail" : "Outlook"}
            </button>
          ))}
        </div>
      </div>
      <ol className="flex flex-col gap-1.5 text-[12px] text-panora-text-secondary leading-[18px]">
        {INSTRUCTIONS[provider](sourcePattern).map((step, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span className="shrink-0 mt-px inline-flex items-center justify-center w-4 h-4 rounded-full bg-white border border-panora-border text-[10px] font-semibold text-panora-text-secondary tabular-nums">
              {idx + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const INSTRUCTIONS: Record<
  "gmail" | "outlook",
  (sourcePattern: string) => string[]
> = {
  gmail: (sourcePattern) => [
    "Ouvrez Gmail › Paramètres › Filtres et adresses bloquées.",
    `Créez un filtre, collez dans « De » : ${sourcePattern}`,
    "Cochez « Transférer à » et collez votre adresse Panora.",
    "Validez l'email de confirmation reçu sur votre adresse Panora.",
  ],
  outlook: (sourcePattern) => [
    "Ouvrez Outlook › Paramètres › Courrier › Règles.",
    `Créez une règle sur l'expéditeur : ${sourcePattern.replace(/ OR /g, ", ")}.`,
    "Choisissez l'action « Transférer à » et collez votre adresse Panora.",
    "Activez la règle et vérifiez la réception du premier transfert.",
  ],
};

