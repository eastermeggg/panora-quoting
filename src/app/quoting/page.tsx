"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Send,
  Mail,
  LayoutGrid,
  ExternalLink,
  Lock,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SecurityTrustBar } from "@/components/settings/SecurityTrustBar";
import {
  COVERAGE_MATRIX_URL,
  useConfiguredExtranets,
} from "@/data/settings-mock";

const COTATION_EMAIL = "cotation+a7f3b2@panora.co";
const REVEAL_PREFIX = "cotation+";
const REVEAL_HIDDEN_CHARS = "a7f3b2";
const REVEAL_SUFFIX = "@panora.co";
const COTATION_EMAIL_LOCKED = `${REVEAL_PREFIX}${"•".repeat(REVEAL_HIDDEN_CHARS.length)}${REVEAL_SUFFIX}`;

type GateState = "locked" | "current" | "complete";

export default function QuotingEmptyState() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const extranets = useConfiguredExtranets();

  const totalExtranets = extranets.length;
  const activeSessionCount = extranets.filter(
    (c) => c.sessionState.status === "active"
  ).length;
  const hasCredentials = totalExtranets > 0;
  const hasActiveSession = activeSessionCount > 0;
  const isFullySetUp = hasCredentials && hasActiveSession;

  const gate1State: GateState = hasCredentials ? "complete" : "current";
  const gate2State: GateState = !hasCredentials
    ? "locked"
    : hasActiveSession
      ? "complete"
      : "current";
  const gate3State: GateState = !isFullySetUp ? "locked" : "current";

  const handleCopy = () => {
    navigator.clipboard.writeText(COTATION_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-panora-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-[17px] h-5 rounded-sm bg-panora-green-light" />
          <span className="text-[15px] font-medium text-panora-text font-serif">
            Assistant cotation
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="bg-panora-bg rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col items-center px-3.5 py-14 min-h-[500px]">
          <div className="w-full max-w-[660px]">
            {/* Title */}
            <div className="px-1 mb-6">
              <h1 className="text-2xl text-panora-text font-serif leading-7 mb-2.5">
                Bienvenue sur l&apos;assistant cotation
              </h1>
              <p className="text-[13px] text-panora-text-secondary leading-5">
                Trois étapes pour lancer votre première cotation. Comptez deux
                minutes.
              </p>
            </div>

            {/* Quick link to dashboard once fully set up */}
            {isFullySetUp && (
              <div className="px-1 mb-4">
                <Link
                  href="/quoting/dashboard"
                  className="inline-flex items-center gap-2 text-[13px] text-panora-green hover:underline font-medium"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Voir mes cotations
                </Link>
              </div>
            )}

            {/* Gates */}
            <div className="space-y-5">
              <GateCard
                state={gate1State}
                number={1}
                title={
                  gate1State === "complete"
                    ? `${totalExtranets} assureur${totalExtranets > 1 ? "s" : ""} connecté${totalExtranets > 1 ? "s" : ""}`
                    : "Connectez vos accès assureurs"
                }
              >
                {gate1State === "current" ? (
                  <Gate1Current />
                ) : (
                  <Gate1Complete />
                )}
              </GateCard>

              <GateCard
                state={gate2State}
                number={2}
                title={
                  gate2State === "complete"
                    ? `${activeSessionCount} session${activeSessionCount > 1 ? "s" : ""} active${activeSessionCount > 1 ? "s" : ""}`
                    : "Activez vos sessions du jour"
                }
              >
                {gate2State === "locked" ? (
                  <p className="text-[13px] text-panora-text-secondary leading-5">
                    Disponible après la première étape.
                  </p>
                ) : gate2State === "current" ? (
                  <Gate2Current />
                ) : (
                  <Gate2Complete />
                )}
              </GateCard>

              <GateCard
                state={gate3State}
                number={3}
                title="Votre adresse de cotation"
              >
                {gate3State === "locked" ? (
                  <Gate3Locked />
                ) : (
                  <Gate3Unlocked
                    copied={copied}
                    onCopy={handleCopy}
                    onSimulate={() => router.push("/email")}
                  />
                )}
              </GateCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Gate card primitive ──

function GateCard({
  state,
  number,
  title,
  children,
}: {
  state: GateState;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  const isLocked = state === "locked";
  const isComplete = state === "complete";

  return (
    <div
      className={cn(
        "bg-white border border-panora-border rounded-xl p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-opacity",
        isLocked && "opacity-60"
      )}
    >
      <div className="flex gap-4 items-start">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[12px] font-medium",
            isLocked
              ? "bg-panora-secondary text-panora-text-secondary"
              : "bg-panora-green text-white"
          )}
        >
          {isComplete ? (
            <Check className="w-3.5 h-3.5" />
          ) : isLocked ? (
            <Lock className="w-3 h-3" />
          ) : (
            number
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-medium text-panora-text font-serif leading-5 mb-1">
            {title}
          </h3>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Gate 1: credentials ──

function Gate1Current() {
  return (
    <>
      <p className="text-[13px] text-panora-text-secondary leading-5 mb-4">
        Renseignez vos identifiants une seule fois. Ils sont chiffrés et ne
        quittent jamais nos serveurs français.
      </p>
      <div className="mb-4">
        <SecurityTrustBar />
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          href="/settings/extranets"
          className="btn-primary inline-flex items-center px-3 py-2 text-[13px] font-medium transition-colors"
        >
          Configurer mes accès
        </Link>
        <a
          href={COVERAGE_MATRIX_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] text-panora-text-secondary hover:text-panora-text hover:underline"
        >
          Voir la matrice de couverture
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </>
  );
}

function Gate1Complete() {
  return (
    <p className="text-[13px] text-panora-text-secondary leading-5">
      Vous pouvez en ajouter d&apos;autres à tout moment.{" "}
      <Link
        href="/settings/extranets"
        className="text-panora-green hover:underline font-medium"
      >
        Gérer mes accès →
      </Link>
    </p>
  );
}

// ── Gate 2: sessions ──

function Gate2Current() {
  return (
    <>
      <p className="text-[13px] text-panora-text-secondary leading-5 mb-4">
        Sessions à activer en premier — si l&apos;assureur le demande. Certains
        portails exigent une double authentification quotidienne avant que
        l&apos;agent puisse coter pour vous.
      </p>
      <Link
        href="/settings/extranets"
        className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium transition-colors"
      >
        <KeyRound className="w-4 h-4" />
        Activer mes sessions
      </Link>
    </>
  );
}

function Gate2Complete() {
  return (
    <p className="text-[13px] text-panora-text-secondary leading-5">
      Vos sessions sont prêtes pour aujourd&apos;hui.{" "}
      <Link
        href="/settings/extranets"
        className="text-panora-green hover:underline font-medium"
      >
        Gérer les sessions →
      </Link>
    </p>
  );
}

// ── Gate 3: email reveal ──

function Gate3Locked() {
  return (
    <>
      <p className="text-[13px] text-panora-text-secondary leading-5 mb-4">
        Disponible dès qu&apos;une session est active.
      </p>
      <div className="flex items-center gap-2.5 bg-panora-secondary/30 border border-panora-border rounded-[7px] px-2.5 h-[37px]">
        <Lock className="w-4 h-4 text-panora-text-muted shrink-0" />
        <span className="text-[13px] text-panora-text-muted font-medium flex-1 truncate">
          {COTATION_EMAIL_LOCKED}
        </span>
      </div>
    </>
  );
}

function Gate3Unlocked({
  copied,
  onCopy,
  onSimulate,
}: {
  copied: boolean;
  onCopy: () => void;
  onSimulate: () => void;
}) {
  return (
    <>
      <p className="text-[13px] text-panora-text-secondary leading-5 mb-4">
        Transférez un email client avec les documents. L&apos;agent crée la
        cotation et vous notifie quand c&apos;est prêt.
      </p>
      <EmailReveal copied={copied} onCopy={onCopy} />
      <div className="mt-4 pt-4 border-t border-panora-border">
        <p className="text-[13px] text-panora-text-secondary mb-3">
          Pas encore d&apos;email client ? Simulez l&apos;envoi pour découvrir
          le processus complet.
        </p>
        <button
          onClick={onSimulate}
          className="btn-primary flex items-center gap-2 px-3 py-2 text-[13px] font-medium transition-colors"
        >
          <Mail className="w-4 h-4" />
          Simuler envoi via boîte mail
        </button>
      </div>
    </>
  );
}

function EmailReveal({
  copied,
  onCopy,
}: {
  copied: boolean;
  onCopy: () => void;
}) {
  const [displayed, setDisplayed] = useState(COTATION_EMAIL_LOCKED);
  const [pulse, setPulse] = useState(false);
  const [helperVisible, setHelperVisible] = useState(false);

  useEffect(() => {
    let step = 0;
    const total = REVEAL_HIDDEN_CHARS.length;

    const interval = setInterval(() => {
      step += 1;
      const revealed = REVEAL_HIDDEN_CHARS.slice(0, step);
      const remainingDots = "•".repeat(Math.max(0, total - step));
      setDisplayed(`${REVEAL_PREFIX}${revealed}${remainingDots}${REVEAL_SUFFIX}`);
      if (step >= total) {
        clearInterval(interval);
        setDisplayed(COTATION_EMAIL);
        setPulse(true);
        window.setTimeout(() => setPulse(false), 600);
        window.setTimeout(() => setHelperVisible(true), 350);
      }
    }, 160);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2.5 border border-panora-green-border rounded-[7px] px-2.5 h-[37px] transition-colors duration-300",
          pulse ? "bg-panora-green/20" : "bg-panora-green-light"
        )}
      >
        <Send className="w-4 h-4 text-panora-green-dark shrink-0" />
        <span className="text-[13px] text-panora-green-dark font-medium flex-1 truncate font-mono">
          {displayed}
        </span>
        <button
          onClick={onCopy}
          className="shrink-0 text-panora-green-dark hover:text-panora-green transition-colors"
          aria-label="Copier l'adresse"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <p
        className={cn(
          "mt-2 text-[12px] text-panora-text-muted italic transition-opacity duration-500",
          helperVisible ? "opacity-100" : "opacity-0"
        )}
      >
        Votre adresse personnelle. Conservez-la, elle ne change jamais.
      </p>
    </>
  );
}
