"use client";

import { Check, Mail, Shield, Forward, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { OnboardingHero, HeroAccent } from "@/components/onboarding/OnboardingHero";

export function StepWelcome() {
  return (
    <div className="mx-auto w-full max-w-[1040px] flex flex-col gap-10 py-6 lg:py-10">
      <OnboardingHero
        eyebrow="Bienvenue"
        title={
          <>
            Configurons votre <HeroAccent>assistant cotation</HeroAccent> en
            quelques minutes.
          </>
        }
      />

      {/* The three pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Pillar
          visual={<CredentialsPreview />}
          title="Connectez vos accès"
          body="Renseignez vos identifiants une fois. Panora les chiffre localement et s'authentifie à votre place sur chaque portail."
        />
        <Pillar
          visual={<TwoFaAutomationPreview />}
          title="Automatisez la 2FA"
          body="Connectez votre messagerie ou créez une règle de transfert. Panora lit les codes 2FA et garde vos sessions ouvertes."
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

function TwoFaAutomationPreview() {
  return (
    <>
      <StackedBackdrop />
      <div className="relative z-10 w-full max-w-[260px] rounded-lg bg-white border border-panora-border shadow-[0px_10px_24px_-6px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col">
        {/* Email header */}
        <div className="px-3 py-2.5 flex items-center gap-2 border-b border-panora-border bg-panora-bg/50">
          <InsurerLogo insurerId="axa" name="Axa" size="md" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-mono text-panora-text-muted leading-3 truncate">
              noreply.2fa@axa.fr
            </span>
            <span className="text-[11px] font-semibold text-panora-text leading-3 truncate">
              Code de connexion Axa
            </span>
          </div>
        </div>
        {/* Email body */}
        <div className="px-3 py-3 flex flex-col gap-2">
          <p className="text-[10px] text-panora-text-secondary leading-[14px]">
            Bonjour, votre code de vérification :
          </p>
          <div className="inline-flex items-center self-start gap-1 px-2 h-7 rounded-md border border-panora-green/40 bg-panora-green-light/40 font-mono text-[15px] font-semibold tracking-[0.18em] text-panora-green-dark">
            342518
          </div>
        </div>
        {/* Status footer */}
        <div className="px-3 py-2 flex items-center justify-between border-t border-panora-border bg-panora-bg/50">
          <span className="inline-flex items-center gap-1 text-[10px] text-panora-text-muted">
            <Mail className="w-2.5 h-2.5" />
            E-mail entrant
          </span>
          <span className="inline-flex items-center px-1.5 h-4 rounded-full bg-panora-green-light text-[9px] font-semibold text-panora-green-dark">
            Lu par Panora
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
