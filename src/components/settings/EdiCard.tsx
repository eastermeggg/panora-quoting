"use client";

import { useState } from "react";
import {
  Check,
  AlertCircle,
  KeyRound,
  Loader2,
  X,
  Power,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEdiConnection, setEdiState, EDI_BRAND } from "@/data/edi-store";

const CONNECT_DELAY_MS = 1500;

// EDIconnexion brand blue (approx — swap for the exact token if provided).
const EDI_BLUE = "#1366b3";

/** EDIconnexion brand mark — an "edi" monogram in the brand blue. */
function EdiMark() {
  return (
    <span
      className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold lowercase tracking-tight text-white text-[15px]"
      style={{ backgroundColor: EDI_BLUE }}
    >
      edi
    </span>
  );
}

/**
 * The EDIconnexion channel card. EDI is a global channel — one credential set
 * covers every compatible company — so it lives on its own, never inside the
 * per-company extranet list.
 */
export function EdiCard() {
  const state = useEdiConnection();
  const [modalOpen, setModalOpen] = useState(false);

  const headerBadge =
    state.status === "connected" ? (
      <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-panora-green-light text-[11px] font-semibold text-panora-green-dark">
        <Check className="w-3 h-3" strokeWidth={3} />
        Connexion active
      </span>
    ) : state.status === "error" ? (
      <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-[#f6e1db] text-[11px] font-semibold text-panora-error">
        <AlertCircle className="w-3 h-3" />
        Connexion interrompue
      </span>
    ) : null;

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
              <EdiMark />
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-medium text-panora-text-primary leading-5">
                  {EDI_BRAND}
                </span>
                <span className="text-[12px] text-panora-text-muted leading-4">
                  Un identifiant pour toutes vos compagnies
                </span>
              </div>
            </div>
            {/* Right-side action — one per state, no bottom footer */}
            <div className="flex items-center gap-2 shrink-0">
              {headerBadge}
              {state.status === "connecting" && (
                <span className="inline-flex items-center gap-2 text-[12px] font-medium text-panora-text-secondary">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Vérification…
                </span>
              )}
              {state.status === "connected" && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2 h-7 rounded-md border border-panora-border bg-white text-[12px] font-medium text-panora-text-secondary hover:bg-panora-secondary/50 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Modifier
                </button>
              )}
              {state.status === "error" && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-panora-error text-white text-[12px] font-semibold hover:brightness-110 transition"
                >
                  <KeyRound className="w-3 h-3" />
                  Corriger
                </button>
              )}
              {state.status === "idle" && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 h-8 rounded-md text-white text-[12px] font-semibold hover:brightness-110 transition"
                  style={{ backgroundColor: EDI_BLUE }}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Activer la connexion
                </button>
              )}
            </div>
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
        </div>
      </div>

      {modalOpen && (
        <EdiConnectionModal
          initial={
            state.status === "connected" || state.status === "error"
              ? { login: state.login }
              : undefined
          }
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ── Connection modal (connect + credential rotation) ──

export function EdiConnectionModal({
  initial,
  onClose,
  onConnected,
}: {
  initial?: { login: string };
  onClose: () => void;
  /** Called once the connection succeeds (not on cancel or error). */
  onConnected?: (login: string) => void;
}) {
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
          login,
          message: "Identifiants EDIconnexion invalides.",
        });
      } else {
        setEdiState({ status: "connected", login });
        onConnected?.(login);
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
            <EdiMark />
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-panora-text leading-5 font-display">
                {initial
                  ? `Mettre à jour ${EDI_BRAND}`
                  : `Connexion ${EDI_BRAND}`}
              </span>
              <span className="text-[12px] text-panora-text-muted leading-4">
                Un identifiant pour toutes vos compagnies compatibles
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
          <Field label="Identifiant">
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Identifiant adhérent EDIconnexion"
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
            Ces identifiants couvrent toutes vos compagnies {EDI_BRAND} à la
            fois. Ils sont chiffrés (AES-256) et révocables à tout moment.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between gap-2">
          <div>
            {initial && (
              <button
                onClick={() => {
                  setEdiState({ status: "idle" });
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-2 h-9 rounded-md text-[13px] font-medium text-panora-text-muted hover:text-panora-error transition-colors"
              >
                <Power className="w-3.5 h-3.5" />
                Désactiver
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 h-9 rounded-md text-[13px] font-medium text-panora-text-secondary hover:text-panora-text transition-colors"
            >
              Annuler
            </button>
          <button
            onClick={submit}
            disabled={!canSubmit || submitting}
            className="inline-flex items-center gap-2 px-4 h-9 rounded-md text-white text-[13px] font-semibold hover:brightness-110 transition disabled:opacity-50"
            style={{ backgroundColor: EDI_BLUE }}
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
