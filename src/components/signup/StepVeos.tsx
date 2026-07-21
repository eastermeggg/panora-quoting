"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Field, TextInput, PrimaryButton } from "./ui";

export type VeosCredentials = {
  url: string;
  login: string;
  password: string;
};

/* Step "VEOS Connect" : classic credentials form, skippable via the footer.
 * No conversational capture — structured data goes through forms only. */
export function StepVeos({
  credentials,
  onChange,
  connected,
  onConnect,
}: {
  credentials: VeosCredentials;
  onChange: (patch: Partial<VeosCredentials>) => void;
  connected: boolean;
  onConnect: () => void;
}) {
  const [connecting, setConnecting] = useState(false);
  const formValid =
    credentials.url.trim().length > 0 &&
    credentials.login.trim().length > 0 &&
    credentials.password.length > 0;

  const handleConnect = () => {
    if (!formValid || connected || connecting) return;
    setConnecting(true);
    // Mock connection: no real backend in this prototype
    setTimeout(() => {
      setConnecting(false);
      onConnect();
    }, 1200);
  };

  const benefits = [
    "Retrouve vos clients et vos contrats sans ressaisie",
    "Permet à vos assistants IA de travailler avec un contexte réel",
    "Pré-remplit vos demandes de cotation (optionnel)",
    "Chaque action reste soumise à votre validation",
  ];

  const privacy = [
    "Données hébergées en Europe",
    "Conforme DDA / RGPD",
    "Données chiffrées",
    "Pas d'entraînement sur vos données",
  ];

  return (
    <div className="flex w-full max-w-[512px] flex-col gap-7">
      <div>
        <h1 className="font-serif text-[30px] leading-9 tracking-[-0.3px] text-panora-text">
          Connectez votre <span className="text-[#173c2d]">ERP VEOS</span>
        </h1>
        <p className="mt-2 text-[13px] leading-5 text-panora-text-secondary">
          En connectant votre environnement VEOS, Panora :
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {benefits.map((b) => (
          <li key={b} className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-panora-tag">
              <Check className="h-3.5 w-3.5 text-panora-text-secondary" />
            </span>
            <span className="text-[13px] leading-5 text-panora-text">{b}</span>
          </li>
        ))}
      </ul>

      {connected ? (
        <div className="flex items-center gap-3 rounded-lg border border-panora-green-border bg-panora-green-light px-4 py-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-panora-green">
            <Check className="h-3.5 w-3.5 text-white" />
          </span>
          <p className="text-[13px] leading-5 text-panora-text">
            VEOS connecté. La synchronisation de vos données démarre en
            arrière-plan.
          </p>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleConnect();
          }}
        >
          <Field label="URL de l'environnement">
            <TextInput
              value={credentials.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="https://veos.moncabinet.com"
            />
          </Field>
          <div className="flex gap-4">
            <Field label="Identifiant VEOS" className="flex-1">
              <TextInput
                value={credentials.login}
                onChange={(e) => onChange({ login: e.target.value })}
                placeholder="Login VEOS"
              />
            </Field>
            <Field label="Mot de passe" className="flex-1">
              <TextInput
                type="password"
                value={credentials.password}
                onChange={(e) => onChange({ password: e.target.value })}
                placeholder="••••••••••••"
              />
            </Field>
          </div>
          <PrimaryButton
            type="submit"
            disabled={!formValid || connecting}
            className="self-start px-4 py-2.5"
          >
            {connecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {connecting ? "Connexion en cours..." : "Connecter VEOS"}
          </PrimaryButton>
        </form>
      )}

      <div className="border-t border-panora-border pt-5">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-panora-text">
            <rect x="3" y="7" width="10" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span className="text-[13px] font-medium text-panora-text">
            La confidentialité est primordiale
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {privacy.map((p) => (
            <span key={p} className="flex items-center gap-1.5 text-[12px] text-panora-text-secondary">
              <Check className="h-3.5 w-3.5" />
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
