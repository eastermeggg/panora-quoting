"use client";

import { useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  Users,
  FileText,
  RefreshCcw,
  Database,
  Lock,
  Loader2,
  AlertCircle,
  Check,
  ArrowLeft,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  veosBenefits,
  type Integration,
  type VeosBenefit,
} from "@/data/integrations-mock";

type Step = "discover" | "credentials";
type TestState =
  | { status: "idle" }
  | { status: "testing" }
  | { status: "success" }
  | { status: "error"; message: string };

interface ConfigureVeosModalProps {
  integration: Integration;
  onClose: () => void;
  onConnected: () => void;
  /** Demo/capture affordance — start on a given step instead of "discover". */
  initialStep?: Step;
  /** Demo/capture affordance — seed the connection-test banner state. */
  initialTest?: TestState;
}

const benefitIcon: Record<VeosBenefit["icon"], typeof Users> = {
  users: Users,
  files: FileText,
  refresh: RefreshCcw,
  database: Database,
};

export function ConfigureVeosModal({
  integration,
  onClose,
  onConnected,
  initialStep,
  initialTest,
}: ConfigureVeosModalProps) {
  const [step, setStep] = useState<Step>(initialStep ?? "discover");
  const [url, setUrl] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [test, setTest] = useState<TestState>(initialTest ?? { status: "idle" });

  const canConnect =
    url.trim().length > 0 && login.trim().length > 0 && password.length > 0;

  // No connection verification — submitting the credentials connects directly.
  // (The brief "connexion" state is just feedback, not a pass/fail check.)
  function connect() {
    if (!canConnect || test.status === "testing") return;
    setTest({ status: "testing" });
    window.setTimeout(() => {
      setTest({ status: "success" });
      window.setTimeout(() => {
        onConnected();
      }, 700);
    }, 700);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[600px] mx-4 flex flex-col max-h-[92vh] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Configuration ${integration.name}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-[42px] px-4 bg-panora-secondary/40 border-b border-panora-border">
          <div className="flex items-center gap-2 min-w-0">
            <Settings2 className="w-3.5 h-3.5 text-panora-text-secondary shrink-0" />
            <span className="text-[13px] font-medium text-panora-text leading-5 truncate">
              Configuration {integration.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-panora-border/50 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-3 px-6 pt-5 pb-3">
          <Stepper step={step} />
          {step === "discover" ? (
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] font-serif text-panora-text leading-7 tracking-[-0.01em]">
                Pourquoi connecter VEOS&nbsp;?
              </h2>
              <p className="text-[13px] text-panora-text-secondary leading-5">
                Panora travaille directement avec vos données ERP. Terminée, la
                double saisie.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] font-serif text-panora-text leading-7 tracking-[-0.01em]">
                Connectez vos identifiants
              </h2>
              <p className="text-[13px] text-panora-text-secondary leading-5">
                Munissez-vous de vos identifiants — URL de l&apos;environnement,
                identifiant et mot de passe. Votre administrateur ERP peut vous
                les fournir.
              </p>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-3">
          {step === "discover" ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {veosBenefits.map((benefit) => {
                  const Icon = benefitIcon[benefit.icon];
                  return (
                    <div
                      key={benefit.title}
                      className="flex flex-col gap-3 p-4 rounded-lg bg-panora-secondary/40 border border-panora-border"
                    >
                      <div className="w-8 h-8 rounded-md bg-white border border-panora-border flex items-center justify-center">
                        <Icon className="w-4 h-4 text-panora-text-secondary" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[13px] font-semibold text-panora-text leading-5">
                          {benefit.title}
                        </p>
                        <p className="text-[12px] text-panora-text-secondary leading-[18px]">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-3 rounded-lg bg-panora-green-light/60 border border-panora-green/20">
                <p className="text-[12.5px] text-panora-green-dark leading-[18px]">
                  Munissez-vous de vos identifiants — URL de
                  l&apos;environnement, identifiant et mot de passe. Votre
                  administrateur ERP peut vous les fournir.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Field label="URL de l'environnement">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (test.status === "error") setTest({ status: "idle" });
                  }}
                  placeholder="https://veos.environnement.com"
                  className={fieldClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Identifiant VEOS">
                  <input
                    type="text"
                    value={login}
                    onChange={(e) => {
                      setLogin(e.target.value);
                      if (test.status === "error") setTest({ status: "idle" });
                    }}
                    placeholder="Login VEOS"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Mot de passe">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (test.status === "error")
                          setTest({ status: "idle" });
                      }}
                      placeholder="••••••••••••"
                      className={cn(fieldClass, "pr-10")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-panora-text-muted hover:text-panora-text-secondary transition-colors"
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </Field>
              </div>

              <TestStateBanner state={test} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-panora-border px-6 py-4 flex items-center justify-between gap-3">
          {step === "discover" ? (
            <>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-panora-border text-panora-text-secondary hover:bg-panora-drop transition-colors"
                aria-label="Annuler"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => setStep("credentials")}
                className="btn-primary px-4 h-9 text-[13px] font-semibold leading-5 inline-flex items-center gap-1.5"
              >
                Étape suivante
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep("discover")}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-panora-border text-panora-text-secondary hover:bg-panora-drop transition-colors"
                aria-label="Étape précédente"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              {test.status === "success" ? null : (
                <button
                  onClick={connect}
                  disabled={!canConnect || test.status === "testing"}
                  className={cn(
                    "btn-primary px-4 h-9 text-[13px] font-semibold leading-5 inline-flex items-center gap-1.5",
                    (!canConnect || test.status === "testing") &&
                      "opacity-60 cursor-not-allowed"
                  )}
                >
                  {test.status === "testing" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Connexion…
                    </>
                  ) : (
                    <>Connecter</>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function Stepper({ step }: { step: Step }) {
  const steps: { id: Step; label: string; n: number }[] = [
    { id: "discover", label: "Découvrir", n: 1 },
    { id: "credentials", label: "Identifiants", n: 2 },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const isActive = step === s.id;
        const isDone =
          s.id === "discover" && step === "credentials" ? true : false;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold leading-4",
                isActive || isDone
                  ? "bg-panora-green text-white"
                  : "bg-panora-secondary text-panora-text-muted"
              )}
            >
              {isDone ? <Check className="w-3 h-3" /> : s.n}
            </span>
            <span
              className={cn(
                "text-[13px] leading-5",
                isActive
                  ? "text-panora-text font-semibold"
                  : "text-panora-text-muted font-medium"
              )}
            >
              {s.label}
            </span>
            {i === 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-panora-text-muted mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-panora-text leading-5">
        {label}
      </label>
      {children}
    </div>
  );
}

const fieldClass =
  "w-full h-[38px] px-3 text-[13px] leading-5 text-panora-text placeholder:text-panora-text-muted bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:border-panora-green/40 transition-colors";

function TestStateBanner({ state }: { state: TestState }) {
  if (state.status === "idle") {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-panora-secondary/40 border border-panora-border">
        <Lock className="w-3.5 h-3.5 text-panora-text-muted" />
        <span className="text-[12px] text-panora-text-muted leading-4">
          Connexion chiffrée AES-256 · Token stocké côté Panora
        </span>
      </div>
    );
  }
  if (state.status === "testing") {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-panora-green-light/50 border border-panora-green/20">
        <Loader2 className="w-3.5 h-3.5 text-panora-green animate-spin" />
        <span className="text-[12px] font-medium text-panora-green-dark leading-4">
          Test de connexion en cours…
        </span>
      </div>
    );
  }
  if (state.status === "success") {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-panora-green-light/70 border border-panora-green/30">
        <Check className="w-3.5 h-3.5 text-panora-green" />
        <span className="text-[12px] font-medium text-panora-green-dark leading-4">
          Connexion établie avec succès
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-panora-error-bg border border-panora-error/20">
      <AlertCircle className="w-3.5 h-3.5 text-panora-error shrink-0 mt-0.5" />
      <span className="text-[12px] text-panora-error leading-[18px]">
        {state.message}
      </span>
    </div>
  );
}
