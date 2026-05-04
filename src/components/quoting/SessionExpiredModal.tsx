"use client";

import { useEffect } from "react";
import {
  Clock,
  Loader2,
  Lock,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  X,
} from "lucide-react";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { SessionOtpInput } from "@/components/ui/SessionOtpInput";
import { useSessionActivation } from "@/hooks/useSessionActivation";
import type { OtpFormat } from "@/data/settings-mock";

interface SessionExpiredModalProps {
  open: boolean;
  insurerId: string;
  insurerName: string;
  /** OTP format prompted by this carrier. Defaults to digits-6. */
  otpFormat?: OtpFormat;
  /** Called once the session is reactivated and the modal closes. */
  onResolved: () => void;
  /** Called when the user dismisses without reactivating. */
  onDismiss?: () => void;
}

export function SessionExpiredModal({
  open,
  insurerId,
  insurerName,
  otpFormat = "digits-6",
  onResolved,
  onDismiss,
}: SessionExpiredModalProps) {
  const { state, submitting, otpError, startConnecting, submitOtp } =
    useSessionActivation({
      initialState: { status: "inactive" },
      otpFormat,
      onActivated: () => {
        // Give the success state a beat to be seen, then resolve.
        setTimeout(() => onResolved(), 900);
      },
    });

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && state.status !== "active" && onDismiss) {
        onDismiss();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, state.status, onDismiss]);

  if (!open) return null;

  const dismissable = onDismiss && state.status !== "active";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-panora-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <InsurerLogo
              insurerId={insurerId}
              name={insurerName}
              size="md"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider leading-3">
                {insurerName}
              </span>
              <h2
                id="session-expired-title"
                className="text-[17px] font-serif text-panora-text leading-6"
              >
                Session expirée
              </h2>
            </div>
          </div>
          {dismissable && (
            <button
              onClick={onDismiss}
              aria-label="Fermer"
              className="p-1 hover:bg-panora-bg rounded transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-panora-text-muted" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          <ModalBody
            state={state}
            insurerName={insurerName}
            submitting={submitting}
            otpError={otpError}
            onActivate={startConnecting}
            onSubmitOtp={() => submitOtp()}
          />
        </div>
      </div>
    </div>
  );
}

interface ModalBodyProps {
  state: ReturnType<typeof useSessionActivation>["state"];
  insurerName: string;
  submitting: boolean;
  otpError: string | null;
  onActivate: () => void;
  onSubmitOtp: (code: string) => void;
}

function ModalBody({
  state,
  insurerName,
  submitting,
  otpError,
  onActivate,
  onSubmitOtp,
}: ModalBodyProps) {
  if (state.status === "inactive") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2.5 bg-panora-bg rounded-md px-3 py-2.5">
          <Clock className="w-4 h-4 text-panora-text-muted shrink-0 mt-0.5" />
          <p className="text-[13px] text-panora-text-secondary leading-5">
            La session 2FA avec <strong className="text-panora-text">{insurerName}</strong> a
            expiré. Réactivez-la pour que l&apos;agent puisse poursuivre la cotation.
          </p>
        </div>
        <button
          onClick={onActivate}
          className="btn-primary w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[13px] font-medium"
        >
          <KeyRound className="w-3.5 h-3.5" />
          Activer la session
        </button>
      </div>
    );
  }

  if (state.status === "connecting") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 bg-[rgba(242,221,193,0.4)] rounded-md px-3 py-3">
          <Loader2 className="w-4 h-4 text-[#80452b] shrink-0 animate-spin" />
          <span className="text-[13px] font-medium text-[#80452b] leading-5">
            Connexion à l&apos;extranet {insurerName} en cours…
          </span>
        </div>
        <p className="text-[12px] text-panora-text-muted leading-4 px-1">
          L&apos;agent ouvre le portail et soumet vos identifiants. Préparez votre
          téléphone pour le code 2FA.
        </p>
      </div>
    );
  }

  if (state.status === "otp_required") {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-[rgba(242,221,193,0.4)] rounded-md px-3 py-3 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[#80452b]">
            <Lock className="w-4 h-4 shrink-0" />
            <span className="text-[13px] font-medium leading-5">
              Entrez le code 2FA reçu de {insurerName}
            </span>
          </div>
          <SessionOtpInput
            format={state.otpFormat}
            submitting={submitting}
            error={otpError}
            onSubmit={onSubmitOtp}
          />
        </div>
        <p className="text-[12px] text-panora-text-muted leading-4 px-1">
          Le code arrive par SMS, e-mail ou application selon le portail. Format
          défini par l&apos;assureur.
        </p>
      </div>
    );
  }

  if (state.status === "active") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 bg-panora-green-light rounded-md px-3 py-3">
          <CheckCircle2 className="w-4 h-4 text-panora-green shrink-0" />
          <span className="text-[13px] font-medium text-panora-green-dark leading-5">
            Session active jusqu&apos;à {state.expiresAtLabel}. Reprise de la cotation…
          </span>
        </div>
      </div>
    );
  }

  // state.status === "error" — defensive fallback (the hook does not
  // currently produce error states from the modal flow, but the type allows it).
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2.5 bg-panora-error-bg rounded-md px-3 py-3">
        <AlertCircle className="w-4 h-4 text-panora-error shrink-0 mt-0.5" />
        <span className="text-[13px] text-panora-error leading-5">
          {state.message}
        </span>
      </div>
    </div>
  );
}
