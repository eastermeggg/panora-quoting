"use client";

import { Check, Mail, Shield, Forward, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";

export function StepWelcome() {
  return (
    <div className="mx-auto w-full max-w-[1040px] flex flex-col gap-8 py-4 lg:py-8">
      <header className="flex flex-col gap-2.5 max-w-[640px]">
        <h1 className="text-[28px] lg:text-[32px] font-serif text-panora-text leading-[1.15] text-balance">
          Configurons votre assistant cotation
        </h1>
        <p className="text-[14px] text-panora-text-secondary leading-6 max-w-[560px]">
          Trois étapes pour préparer Panora à coter pour vous. Comptez environ
          cinq minutes. Vous pouvez quitter à tout moment, les assureurs
          connectés restent enregistrés.
        </p>
      </header>

      {/* The three pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Pillar
          visual={<CredentialsPreview />}
          title="Connectez vos accès"
          body="Renseignez vos identifiants assureurs une fois. Panora les chiffre localement et s'authentifie à votre place sur chaque portail."
        />
        <Pillar
          visual={<ActivationPreview />}
          title="Activez vos sessions"
          body="La plupart des assureurs exigent une vérification quotidienne. Vous saisissez le code une fois le matin, l'agent peut coter toute la journée."
        />
        <Pillar
          visual={<TransfertCotationsPreview />}
          title="Transférez vos cotations"
          body="Transférez l'email d'un client à votre adresse Panora. L'agent ouvre les portails, remplit les formulaires et vous renvoie une comparaison."
        />
      </div>
    </div>
  );
}

function Pillar({
  visual,
  title,
  body,
}: {
  visual: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="relative h-[200px] bg-panora-bg border-b border-panora-border overflow-hidden flex items-center justify-center px-5">
        {visual}
      </div>
      <div className="flex flex-col gap-1.5 p-5">
        <h3 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
          {title}
        </h3>
        <p className="text-[13px] text-panora-text-secondary leading-5">
          {body}
        </p>
      </div>
    </article>
  );
}

// ── Visual previews ──

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

function CredentialsPreview() {
  return (
    <>
      <StackedBackdrop />
      <div className="relative z-10 w-full max-w-[260px] rounded-lg bg-white border border-panora-border shadow-[0px_10px_24px_-6px_rgba(0,0,0,0.14)] p-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <InsurerLogo insurerId="axa" name="Axa" size="md" />
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-panora-text leading-3">
              Axa
            </span>
            <span className="text-[10px] text-panora-text-muted leading-3 truncate">
              portail.axa.fr
            </span>
          </div>
          <span className="ml-auto inline-flex items-center gap-0.5 px-1.5 h-4 rounded-full bg-panora-green-light text-[9px] font-semibold text-panora-green-dark">
            <Check className="w-2 h-2" strokeWidth={3} />
            Connecté
          </span>
        </div>
        <div className="h-px bg-panora-border" />
        <Field
          label="Identifiant"
          value="courtier@cabinet-dupont.fr"
          monospace
        />
        <Field label="Mot de passe" value="••••••••••••" monospace />
        <div className="flex items-center gap-1.5 pt-1">
          <Shield className="w-3 h-3 text-panora-green-dark" />
          <span className="text-[10px] text-panora-text-muted leading-3">
            Chiffré AES-256 · Serveurs FR
          </span>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  monospace,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-medium uppercase tracking-wider text-panora-text-muted">
        {label}
      </span>
      <span
        className={cn(
          "text-[11px] text-panora-text leading-4 truncate",
          monospace && "font-mono"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ActivationPreview() {
  // Mid-state: 4 of 6 digits typed.
  const digits = ["3", "4", "2", "5", "", ""];

  return (
    <>
      <StackedBackdrop />
      <div className="relative z-10 w-full max-w-[260px] rounded-lg bg-white border border-panora-border shadow-[0px_10px_24px_-6px_rgba(0,0,0,0.14)] p-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <InsurerLogo insurerId="axa" name="Axa" size="md" />
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-panora-text leading-3">
              Axa
            </span>
            <span className="text-[10px] text-panora-text-muted leading-3 truncate">
              Code de vérification
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-panora-text-secondary">
          <Mail className="w-3 h-3 text-panora-text-muted" />
          <span className="truncate">
            Email envoyé à <span className="font-mono">co****@axa.fr</span>
          </span>
        </div>
        <div className="flex items-center gap-1 justify-center pt-1">
          {digits.map((d, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center justify-center w-7 h-9 rounded-md border text-[14px] font-mono font-semibold leading-none",
                d
                  ? "border-panora-green/40 bg-white text-panora-text"
                  : i === digits.findIndex((x) => !x)
                    ? "border-panora-green/40 bg-white text-panora-text-muted animate-pulse"
                    : "border-panora-border bg-panora-drop/50 text-panora-text-muted"
              )}
            >
              {d || (i === digits.findIndex((x) => !x) ? "|" : "")}
            </span>
          ))}
        </div>
        <div className="pt-1 flex items-center justify-between">
          <span className="text-[10px] text-panora-text-muted">
            Code valide 10 min
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 h-4 rounded-full bg-panora-warning-bg text-[9px] font-semibold text-panora-warning-text">
            En attente
          </span>
        </div>
      </div>
    </>
  );
}

function TransfertCotationsPreview() {
  return (
    <>
      <StackedBackdrop />
      <div className="relative z-10 w-full max-w-[260px] rounded-lg bg-white border border-panora-border shadow-[0px_10px_24px_-6px_rgba(0,0,0,0.14)] p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-panora-text-muted">
            <Forward className="w-2.5 h-2.5" />
            Transféré
          </span>
          <span className="text-[10px] text-panora-text-muted">14:22</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 w-6 h-6 rounded-full bg-panora-secondary flex items-center justify-center text-[10px] font-semibold text-panora-text-secondary">
            JL
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-panora-text leading-3 truncate">
              Jean Lefevre
            </span>
            <span className="text-[10px] text-panora-text-muted leading-3 truncate">
              jean.lefevre@dupont.fr
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] min-w-0">
          <span className="shrink-0 text-panora-text-muted">À</span>
          <span className="inline-flex items-center gap-1 px-1.5 h-[18px] rounded bg-panora-green-light text-panora-green-dark font-mono font-medium text-[10px] truncate">
            <Mail className="w-2.5 h-2.5" />
            cotation+a7f3b2@panora.co
          </span>
        </div>
        <div className="h-px bg-panora-border" />
        <p className="text-[11px] font-medium text-panora-text leading-[14px]">
          Fwd: Cotation Flotte Auto 2027
        </p>
        <p className="text-[10px] text-panora-text-secondary leading-[14px] line-clamp-2">
          Bonjour, vous trouverez en pièce jointe le carnet
          d&apos;immatriculation pour notre flotte de 120 véhicules…
        </p>
      </div>
      {/* Arrow into Panora */}
      <div
        aria-hidden
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border border-panora-green-border flex items-center justify-center shadow-[0px_2px_6px_-1px_rgba(0,162,114,0.25)]"
      >
        <ArrowDown className="w-3.5 h-3.5 text-panora-green-dark" />
      </div>
    </>
  );
}
