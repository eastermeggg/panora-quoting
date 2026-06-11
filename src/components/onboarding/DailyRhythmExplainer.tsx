"use client";

import {
  KeyRound,
  Sunrise,
  Moon,
  ShieldCheck,
  Clock,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";

/**
 * Visual explainer for the daily session-activation rhythm.
 * Matches the "Comment lancer une cotation" card layout: each rhythm step has
 * a 200px visual preview on top and the title + body beneath.
 */
export function DailyRhythmExplainer() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RhythmCard
          visual={<MorningPreview />}
          when="Quand la session expire"
          title="Vous validez le code 2FA"
          body="Code par email (transfert automatique si configuré), SMS ou application : la session redevient active. Cela arrive plus ou moins souvent selon la compagnie d'assurance."
        />
        <RhythmCard
          visual={<DayPreview />}
          when="Entre deux activations"
          title="L'agent cote sans nouvelle authentification"
          body="Panora utilise la session active pour ouvrir le portail, remplir les formulaires et rapporter les cotations, dossier par dossier."
        />
        <RhythmCard
          visual={<EveningPreview />}
          when="À l'expiration"
          title="La session expire selon le portail"
          body="La durée varie de quelques heures à plusieurs jours selon la compagnie d'assurance et la configuration de votre compte. Panora la détecte et s'y adapte."
        />
      </div>

      <p className="flex items-start gap-2 text-[12px] text-panora-text-secondary leading-[18px] max-w-[820px]">
        <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-panora-green-dark" />
        <span>
          <span className="font-medium text-panora-text">
            Pourquoi cette routine ?
          </span>{" "}
          Les portails des compagnies d&apos;assurance imposent un 2FA récurrent pour protéger vos
          accès. Vos identifiants restent chiffrés en AES-256 sur des serveurs
          français ; l&apos;agent n&apos;utilise que la session en cours, jamais
          le mot de passe en clair.
        </span>
      </p>
    </div>
  );
}

function RhythmCard({
  visual,
  when,
  title,
  body,
}: {
  visual: React.ReactNode;
  when: string;
  title: string;
  body: string;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="relative h-[200px] bg-panora-bg border-b border-panora-border overflow-hidden flex items-center justify-center px-5">
        {visual}
      </div>
      <div className="flex flex-col gap-1 p-5">
        <span className="text-[12px] font-medium text-panora-text-muted leading-4">
          {when}
        </span>
        <h3 className="text-[14px] font-semibold text-panora-text leading-5 font-display">
          {title}
        </h3>
        <p className="text-[13px] text-panora-text-secondary leading-5 mt-1">
          {body}
        </p>
      </div>
    </article>
  );
}

// ── Stacked-papers backdrop (same idiom as the launch / welcome previews) ──

function StackedBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-x-6 top-6 bottom-3 rounded-lg bg-white/55 border border-panora-border"
        style={{ transform: "rotate(-2deg)" }}
      />
      <div
        aria-hidden
        className="absolute inset-x-4 top-4 bottom-2 rounded-lg bg-white/85 border border-panora-border"
        style={{ transform: "rotate(1deg)" }}
      />
    </>
  );
}

// ── Visual previews ──

function MorningPreview() {
  return (
    <>
      <StackedBackdrop />
      <div className="relative z-10 w-full max-w-[260px] rounded-lg bg-white border border-panora-border shadow-[0px_10px_24px_-6px_rgba(0,0,0,0.14)] p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-panora-warning-text">
            <Sunrise className="w-3 h-3" />
            Aujourd&apos;hui · 08:00
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <InsurerLogo insurerId="axa" name="Axa" size="md" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-panora-text leading-3">
              Axa
            </span>
            <span className="text-[10px] text-panora-text-muted leading-3">
              Session à activer
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-panora-warning-bg">
          <KeyRound className="w-3 h-3 text-panora-warning-text shrink-0" />
          <span className="text-[10px] font-medium text-panora-warning-text">
            Code 2FA reçu il y a 30s
          </span>
        </div>
        <div className="flex items-center gap-1 justify-center pt-1">
          {["3", "4", "2", "5", "", ""].map((d, i, arr) => {
            const next = arr.findIndex((x) => !x);
            return (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center justify-center w-6 h-7 rounded-md border text-[12px] font-mono font-semibold leading-none",
                  d
                    ? "border-panora-green/40 bg-white text-panora-text"
                    : i === next
                      ? "border-panora-green/40 bg-white text-panora-text-muted animate-pulse"
                      : "border-panora-border bg-panora-drop/50"
                )}
              >
                {d || (i === next ? "|" : "")}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
}

function DayPreview() {
  return (
    <>
      <StackedBackdrop />
      <div className="relative z-10 w-full max-w-[260px] rounded-lg bg-white border border-panora-border shadow-[0px_10px_24px_-6px_rgba(0,0,0,0.14)] p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-panora-green-dark">
            <span className="w-1.5 h-1.5 rounded-full bg-panora-green animate-pulse" />
            Session active
          </span>
          <span className="text-[10px] text-panora-text-muted">14:22</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <InsurerLogo insurerId="axa" name="Axa" size="md" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-panora-text leading-3">
              Axa
            </span>
            <span className="text-[10px] text-panora-text-muted leading-3">
              Active jusqu&apos;à 18:00
            </span>
          </div>
        </div>
        <div className="h-px bg-panora-border" />
        <ul className="flex flex-col gap-1.5">
          <DayActivity
            time="10:15"
            label="Cotation Dupont · Auto"
            state="done"
          />
          <DayActivity
            time="12:30"
            label="Cotation Martin · MRP"
            state="done"
          />
          <DayActivity
            time="14:22"
            label="Cotation Lefevre · Flotte"
            state="active"
          />
        </ul>
      </div>
    </>
  );
}

function DayActivity({
  time,
  label,
  state,
}: {
  time: string;
  label: string;
  state: "done" | "active";
}) {
  return (
    <li className="flex items-center gap-2 text-[10px]">
      <span className="w-9 shrink-0 tabular-nums text-panora-text-muted">
        {time}
      </span>
      <span
        className={cn(
          "flex-1 truncate leading-[14px]",
          state === "active" ? "text-panora-text font-medium" : "text-panora-text"
        )}
      >
        {label}
      </span>
      {state === "done" ? (
        <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-panora-green flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </span>
      ) : (
        <Loader2 className="shrink-0 w-3.5 h-3.5 text-panora-warning-text animate-spin" />
      )}
    </li>
  );
}

function EveningPreview() {
  return (
    <>
      <StackedBackdrop />
      <div className="relative z-10 w-full max-w-[260px] rounded-lg bg-white border border-panora-border shadow-[0px_10px_24px_-6px_rgba(0,0,0,0.14)] p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-panora-text-secondary">
            <Moon className="w-3 h-3" />
            Aujourd&apos;hui · 19:34
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <InsurerLogo insurerId="axa" name="Axa" size="md" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-panora-text leading-3">
              Axa
            </span>
            <span className="text-[10px] text-panora-text-muted leading-3">
              Pause jusqu&apos;à demain
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 self-start px-2 h-5 rounded-full bg-[#f6e1db]">
          <Clock className="w-3 h-3 text-panora-error" />
          <span className="text-[10px] font-medium text-panora-error">
            Session expirée
          </span>
        </div>
        <div className="pt-1.5 mt-0.5 border-t border-panora-border">
          <p className="text-[10px] text-panora-text-muted leading-[14px]">
            <span className="inline-flex items-center gap-1 font-medium text-panora-text-secondary">
              <Sunrise className="w-2.5 h-2.5" />
              Reprise automatique
            </span>{" "}
            demain matin à 08:00.
          </p>
        </div>
      </div>
    </>
  );
}
