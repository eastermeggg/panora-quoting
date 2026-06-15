"use client";

import { useState } from "react";
import {
  Network,
  Check,
  AlertCircle,
  KeyRound,
  Loader2,
  X,
  Power,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import {
  useEdiConnection,
  setEdiState,
  EDI_PROVIDERS,
  EDI_COMPATIBLE_INSURERS,
  type EdiProvider,
} from "@/data/edi-store";

const CONNECT_DELAY_MS = 1500;
const COMPANY_COUNT = EDI_COMPATIBLE_INSURERS.length;

/** Compatible-company logos, shared by every state. */
function CompanyRow({ muted }: { muted?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5 flex-wrap", muted && "opacity-70")}>
      {EDI_COMPATIBLE_INSURERS.map((c) => (
        <div key={c.id} className="flex items-center gap-1.5">
          <InsurerLogo insurerId={c.id} name={c.name} size="sm" />
          <span className="text-[12px] text-panora-text-secondary leading-4">
            {c.name}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The global EDI channel card. Distinct from the per-company extranet cards —
 * it's a setting that sits above the list and covers every compatible company
 * with a single credential (spec §1.2).
 */
export function EdiCard() {
  const state = useEdiConnection();
  const [modalOpen, setModalOpen] = useState(false);

  const headerBadge =
    state.status === "connected" ? (
      <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-panora-green-light text-[11px] font-semibold text-panora-green-dark">
        <Check className="w-3 h-3" strokeWidth={3} />
        EDI actif · {COMPANY_COUNT} compagnies
      </span>
    ) : state.status === "error" ? (
      <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-[#f6e1db] text-[11px] font-semibold text-panora-error">
        <AlertCircle className="w-3 h-3" />
        Connexion interrompue
      </span>
    ) : (
      <span className="inline-flex items-center h-5 px-2 rounded-full bg-panora-secondary text-[11px] font-semibold text-panora-text-secondary">
        Toutes compagnies compatibles
      </span>
    );

  return (
    <>
      <div
        className={cn(
          "flex flex-col bg-white border rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)]",
          state.status === "error"
            ? "border-panora-error/30"
            : state.status === "connected"
              ? "border-panora-green-border"
              : "border-panora-border"
        )}
      >
        <div className="p-4 flex flex-col gap-3">
          {/* Identity */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  state.status === "connected"
                    ? "bg-panora-green-light text-panora-green-dark"
                    : "bg-panora-secondary text-panora-text-secondary"
                )}
              >
                <Network className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-medium text-panora-text-primary leading-5">
                  Canal EDI
                </span>
                <span className="text-[12px] text-panora-text-muted leading-4">
                  {state.status === "connected" || state.status === "error"
                    ? `${ediProviderLabel(state.provider)} · ${state.login}`
                    : "Un identifiant pour toutes vos compagnies"}
                </span>
              </div>
            </div>
            {headerBadge}
          </div>

          {/* Error banner — one bad credential breaks every EDI company */}
          {state.status === "error" && (
            <div className="flex items-start gap-2 rounded-lg bg-panora-error-bg p-2.5">
              <AlertCircle className="w-4 h-4 text-panora-error shrink-0 mt-0.5" />
              <p className="text-[12px] text-panora-error leading-[18px]">
                {state.message} Toutes vos compagnies EDI sont impactées tant que
                les identifiants ne sont pas corrigés.
              </p>
            </div>
          )}

          {/* Covered / compatible companies */}
          <CompanyRow muted={state.status !== "connected"} />
        </div>

        {/* Action strip */}
        <div className="border-t border-panora-border flex items-center justify-between gap-2 px-4 py-2.5">
          {state.status === "connecting" ? (
            <span className="inline-flex items-center gap-2 text-[12px] font-medium text-panora-text-secondary">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Vérification des identifiants…
            </span>
          ) : state.status === "connected" ? (
            <>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-panora-border bg-white text-[12px] font-medium text-panora-text-secondary hover:bg-panora-secondary/50 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Mettre à jour les identifiants
              </button>
              <button
                onClick={() => setEdiState({ status: "idle" })}
                className="inline-flex items-center gap-1.5 px-2 h-7 rounded-md text-[12px] font-medium text-panora-text-muted hover:text-panora-error transition-colors"
              >
                <Power className="w-3 h-3" />
                Désactiver
              </button>
            </>
          ) : state.status === "error" ? (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-panora-error text-white text-[12px] font-semibold hover:brightness-110 transition"
            >
              <KeyRound className="w-3 h-3" />
              Corriger les identifiants
            </button>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Activer la connexion EDI
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <EdiConnectionModal
          initial={
            state.status === "connected" || state.status === "error"
              ? { provider: state.provider, login: state.login }
              : undefined
          }
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

function ediProviderLabel(id: EdiProvider): string {
  return EDI_PROVIDERS.find((p) => p.id === id)?.label ?? id;
}

// ── Connection modal (connect + credential rotation) ──

function EdiConnectionModal({
  initial,
  onClose,
}: {
  initial?: { provider: EdiProvider; login: string };
  onClose: () => void;
}) {
  const [provider, setProvider] = useState<EdiProvider>(
    initial?.provider ?? "edicourtage"
  );
  const [login, setLogin] = useState(initial?.login ?? "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = login.trim().length > 0 && password.trim().length > 0;

  function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setEdiState({ status: "connecting" });
    // Demo: a login containing "fail" lands in the invalid-credentials state.
    const fails = login.toLowerCase().includes("fail");
    window.setTimeout(() => {
      if (fails) {
        setEdiState({
          status: "error",
          provider,
          login,
          message: "Identifiants EDI invalides.",
        });
      } else {
        setEdiState({ status: "connected", provider, login });
      }
      setSubmitting(false);
      onClose();
    }, CONNECT_DELAY_MS);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[440px] mx-4 flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-panora-secondary flex items-center justify-center text-panora-text-secondary">
              <Network className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-panora-text leading-5 font-display">
                {initial ? "Mettre à jour la connexion EDI" : "Activer la connexion EDI"}
              </span>
              <span className="text-[12px] text-panora-text-muted leading-4">
                Un identifiant pour {COMPANY_COUNT} compagnies compatibles
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-panora-border/40 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        <div className="h-px bg-panora-border" />

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <Field label="Fournisseur EDI">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as EdiProvider)}
              className="w-full h-9 px-3 rounded-lg bg-white border border-[#e2dfd8] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[13px] text-panora-text outline-none focus:border-panora-green-border"
            >
              {EDI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Identifiant">
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Identifiant adhérent EDI"
              className="w-full h-9 px-3 rounded-lg bg-white border border-[#e2dfd8] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green-border"
            />
          </Field>

          <Field label="Mot de passe">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-9 px-3 rounded-lg bg-white border border-[#e2dfd8] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green-border"
            />
          </Field>

          <p className="text-[12px] text-panora-text-muted leading-[18px]">
            Ces identifiants couvrent toutes vos compagnies EDI à la fois. Ils
            sont chiffrés (AES-256) et révocables à tout moment.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 h-9 rounded-md text-[13px] font-medium text-panora-text-secondary hover:text-panora-text transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit || submitting}
            className="btn-primary inline-flex items-center gap-2 px-4 h-9 text-[13px] font-semibold disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connexion…
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                {initial ? "Mettre à jour" : "Connecter"}
              </>
            )}
          </button>
        </div>
      </div>
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
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-panora-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}
