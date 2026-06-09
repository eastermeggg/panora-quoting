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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtranetConfig } from "@/data/settings-mock";

const COTATION_EMAIL = "cotation+a7f3b2@panora.co";
const REVEAL_PREFIX = "cotation+";
const REVEAL_HIDDEN_CHARS = "a7f3b2";
const REVEAL_SUFFIX = "@panora.co";
const COTATION_EMAIL_LOCKED = `${REVEAL_PREFIX}${"•".repeat(REVEAL_HIDDEN_CHARS.length)}${REVEAL_SUFFIX}`;
const DOCS_URL = "https://panora.notion.site/";

interface StepReadyProps {
  configuredExtranets: ExtranetConfig[];
}

export function StepReady(_props: StepReadyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(COTATION_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-[1080px] flex flex-col gap-10 py-6 lg:py-10 items-center text-center">
      {/* Hero */}
      <header className="flex flex-col items-center gap-3 max-w-[640px]">
        <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full bg-panora-green-light text-[11px] font-semibold text-panora-green-dark">
          <Check className="w-3 h-3" strokeWidth={3} />
          Configuration terminée
        </span>
        <h1 className="text-[28px] lg:text-[32px] font-serif text-panora-text leading-[1.15] tracking-[-0.02em] text-balance">
          Votre assistant cotation est prêt.
        </h1>
      </header>

      {/* Email reveal — the centerpiece moment */}
      <section className="relative w-full max-w-[820px]">
        <div
          aria-hidden
          className="absolute inset-x-10 top-6 bottom-6 rounded-[28px] bg-panora-green/8 blur-2xl"
        />
        <div className="relative rounded-2xl bg-panora-bg border border-panora-border px-6 lg:px-10 py-8 lg:py-10 flex flex-col items-center gap-5 text-center overflow-hidden">
          <h2 className="inline-flex items-center gap-2 text-[18px] lg:text-[20px] font-semibold text-panora-text font-display leading-7">
            <Send className="w-4 h-4 text-panora-green-dark" />
            Transférez vos cotations à cette adresse
          </h2>
          <EmailReveal copied={copied} onCopy={handleCopy} />
          <p className="text-[12px] text-panora-text-muted leading-5 max-w-[420px]">
            Transférez n&apos;importe quel email client à cette adresse,
            l&apos;agent fait le reste.
          </p>
        </div>
      </section>

      {/* How it works — a single vertical flow */}
      <section className="w-full max-w-[760px] flex flex-col gap-5 items-center">
        <h2 className="text-[18px] font-semibold text-panora-text font-display leading-6">
          Comment ça marche, du dossier à la cotation
        </h2>
        <ol className="w-full text-left flex flex-col">
          <FlowStep
            number={1}
            icon={<FolderInput className="w-4 h-4 text-panora-green-dark" />}
            title="Vous récupérez les documents du client"
            body="Pour chaque nouvelle cotation, rassemblez les pièces et informations envoyées par le client : devis, contrats, justificatifs."
          />
          <FlowStep
            number={2}
            icon={<Forward className="w-4 h-4 text-panora-green-dark" />}
            title="Vous envoyez ou transférez à Panora"
            body="Envoyez un email à votre adresse Panora, ou transférez celui du client. Tous les documents sont rattachés automatiquement au nouveau dossier."
          />
          <FlowStep
            number={3}
            icon={<Sparkles className="w-4 h-4 text-panora-green-dark" />}
            title="L'agent vérifie les informations"
            body="Panora lit les pièces et signale ce qui manque. Vous complétez directement dans le dossier : ajout de documents, précisions, échanges avec le client."
          />
          <FlowStep
            number={4}
            icon={<Globe className="w-4 h-4 text-panora-green-dark" />}
            title="L'agent ouvre les portails assureurs"
            body="Quand tout est en place, Panora se connecte aux extranets configurés, remplit les formulaires et lance les cotations dossier par dossier."
          />
          <FlowStep
            number={5}
            icon={<GitCompare className="w-4 h-4 text-panora-green-dark" />}
            title="Vos cotations sont prêtes à comparer"
            body="Les offres reviennent dans Panora, comparables côte à côte. Vous les analysez, vous les annotez, vous les transformez en présentation client."
            isLast
          />
        </ol>
      </section>

      {/* Secondary doc link */}
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-text-secondary hover:text-panora-text leading-4"
      >
        Consulter la documentation
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

// ── Vertical flow step ──

function FlowStep({
  number,
  icon,
  title,
  body,
  isLast,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  body: string;
  isLast?: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Numbered marker + connector */}
      <div className="shrink-0 flex flex-col items-center">
        <div className="relative z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-panora-border text-[13px] font-semibold text-panora-text tabular-nums shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          {number}
        </div>
        {!isLast && (
          <span
            aria-hidden
            className="flex-1 w-px bg-panora-border mt-1"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 pt-1 pb-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-panora-green-light">
            {icon}
          </span>
          <h3 className="text-[14px] font-semibold text-panora-text leading-5 font-display">
            {title}
          </h3>
        </div>
        <p className="text-[13px] text-panora-text-secondary leading-5">
          {body}
        </p>
      </div>
    </li>
  );
}

// ── Email reveal (typewriter) ──

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
        "flex items-center gap-3 border rounded-xl px-5 bg-white transition-all duration-300",
        pulse
          ? "border-panora-green-dark shadow-[0px_8px_24px_-8px_rgba(0,162,114,0.28)]"
          : "border-panora-green-border shadow-[0px_3px_14px_-6px_rgba(0,162,114,0.15)]"
      )}
      style={{ height: "52px" }}
    >
      <span className="text-[15px] lg:text-[17px] text-panora-text font-medium flex-1 truncate font-mono tracking-tight">
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
