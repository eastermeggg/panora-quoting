"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import {
  GoogleIcon,
  MicrosoftIcon,
  GhostButton,
  PrimaryButton,
} from "./ui";
import { OtpBoxes } from "./OtpBoxes";

export type AuthMode = "signup" | "login";

/* ---- Screen 1: create account / sign in ---- */

export function StepAuth({
  mode,
  email,
  onEmailChange,
  onSubmit,
}: {
  mode: AuthMode;
  email: string;
  onEmailChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const [cguAccepted, setCguAccepted] = useState(false);
  const emailValid = /.+@.+\..+/.test(email.trim());
  const canSubmit = emailValid && (mode === "login" || cguAccepted);

  return (
    <div className="w-full max-w-[352px] flex flex-col items-center">
      {mode === "signup" ? (
        <>
          <h1 className="font-serif text-[32px] leading-10 tracking-[-0.3px] text-panora-text text-center whitespace-nowrap">
            Créez votre compte{" "}
            <span className="text-panora-green-dark">gratuit</span>
          </h1>
          <p className="mt-1 text-[13px] leading-5 text-panora-text-secondary text-center">
            Pas de carte bancaire requise.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-serif text-[32px] leading-10 tracking-[-0.3px] text-panora-text text-center">
            Ravi de vous <span className="text-panora-green-dark">revoir</span>
          </h1>
          <p className="mt-1 text-[13px] leading-5 text-panora-text-secondary text-center">
            Connectez-vous à votre espace Panora.
          </p>
        </>
      )}

      <div className="mt-8 flex w-full flex-col gap-2.5">
        <GhostButton className="w-full py-2.5" onClick={onSubmit}>
          <GoogleIcon />
          Continuer avec Google
        </GhostButton>
        <GhostButton className="w-full py-2.5" onClick={onSubmit}>
          <MicrosoftIcon />
          Continuer avec Microsoft
        </GhostButton>
      </div>

      <div className="mt-6 flex w-full items-center gap-3">
        <span className="h-px flex-1 bg-panora-border" />
        <span className="text-[12px] text-panora-text-secondary">
          Ou continuer avec votre e-mail
        </span>
        <span className="h-px flex-1 bg-panora-border" />
      </div>

      <form
        className="mt-6 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit();
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium leading-5 text-panora-text">
            Adresse e-mail professionnelle
          </span>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="nom@moncabinet.fr"
            className="w-full rounded-lg border border-[#e2dfd8] bg-white px-3 py-2.5 text-[13px] leading-5 text-panora-text shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none transition-all placeholder:text-panora-text-muted/70 focus:border-panora-green focus:ring-2 focus:ring-panora-green/20"
          />
        </label>

        <PrimaryButton
          type="submit"
          disabled={!canSubmit}
          className="mt-5 w-full py-2.5"
        >
          {mode === "signup" ? "Créer mon compte" : "Se connecter"}
        </PrimaryButton>
      </form>

      {mode === "signup" && (
        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={cguAccepted}
            onChange={(e) => setCguAccepted(e.target.checked)}
            className="h-4 w-4 rounded border-panora-border accent-[#173c2d]"
          />
          <span className="text-[12px] leading-4 text-panora-text-secondary">
            En créant un compte, vous acceptez les{" "}
            <a href="#" className="font-semibold text-panora-text underline-offset-2 hover:underline">
              CGU
            </a>
          </span>
        </label>
      )}
    </div>
  );
}

/* ---- Screen 2: verify e-mail with a code ----
 * Owner sign-up/login gets a magic-link + code; the collaborator "join"
 * context verifies the invited address without any account creation. */
export type OtpContext = AuthMode | "join";

export function StepOtp({
  context,
  email,
  orgName,
  onBack,
  onSubmit,
}: {
  context: OtpContext;
  email: string;
  orgName?: string;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(299);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const complete = code.replace(/\s/g, "").length === 6;
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const isJoin = context === "join";
  const heading = isJoin
    ? "Vérifiez votre adresse e-mail"
    : "Jetez un coup d'oeil à vos e-mails";
  const ctaLabel = isJoin
    ? "Rejoindre l'espace"
    : context === "signup"
      ? "Finaliser la création du compte"
      : "Se connecter";

  return (
    <div className="w-full max-w-[352px] flex flex-col items-center">
      <img
        src="/onboarding/icons/enveloppe.png"
        alt=""
        className="h-20 w-20 object-contain"
      />
      <h1 className="mt-4 font-serif text-[32px] leading-10 tracking-[-0.3px] text-panora-text text-center">
        {heading}
      </h1>
      <p className="mt-3 text-[13px] leading-5 text-panora-text-secondary text-center">
        {isJoin ? (
          <>
            Pour rejoindre {orgName ?? "votre équipe"}, saisissez le code que
            nous venons d&apos;envoyer à{" "}
            <span className="text-panora-green-dark">{email}</span>. Aucun mot de
            passe à créer.
          </>
        ) : (
          <>
            Nous vous avons envoyé un e-mail à{" "}
            <span className="text-panora-green-dark">{email}</span>. Il contient
            un lien magique qui vous connectera automatiquement, ainsi que le
            code ci-dessous.
          </>
        )}
      </p>

      <div className="mt-7">
        <OtpBoxes value={code} onChange={setCode} />
      </div>

      <PrimaryButton
        disabled={!complete}
        onClick={onSubmit}
        className="mt-7 w-full py-2.5"
      >
        {ctaLabel}
      </PrimaryButton>

      <div className="mt-6 flex w-full items-center justify-between px-3">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] font-medium text-panora-text-secondary hover:text-panora-text transition-colors"
        >
          Retour
        </button>
        <button
          type="button"
          disabled={secondsLeft > 0}
          onClick={() => setSecondsLeft(299)}
          className="text-[13px] font-medium text-panora-text disabled:cursor-default disabled:opacity-70"
        >
          {secondsLeft > 0 ? `Renvoyer (${mm}:${ss})` : "Renvoyer"}
        </button>
      </div>
    </div>
  );
}
