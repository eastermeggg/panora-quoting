"use client";

import {
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Lock,
  Eye,
  Clock,
} from "lucide-react";
import { SessionOtpInput } from "@/components/ui/SessionOtpInput";
import type { SessionState } from "@/data/settings-mock";

interface SessionActionBlockProps {
  state: SessionState;
  submitting: boolean;
  otpError: string | null;
  onActivate: () => void;
  onSubmitOtp: (code: string) => void;
  onRetry: () => void;
  onOpenLivePanel: () => void;
}

/**
 * Renders the action affordance for the session inside the card's top section.
 * Returns null for the active state — when nothing needs to happen, no block is shown.
 */
export function SessionActionBlock({
  state,
  submitting,
  otpError,
  onActivate,
  onSubmitOtp,
  onRetry,
  onOpenLivePanel,
}: SessionActionBlockProps) {
  if (state.status === "active") return null;

  if (state.status === "inactive") {
    return (
      <button
        onClick={onActivate}
        className="btn-primary inline-flex items-center gap-2 self-start px-3 py-1.5 text-[13px] font-semibold"
      >
        <KeyRound className="w-4 h-4" />
        Activer la session
      </button>
    );
  }

  if (state.status === "connecting") {
    return (
      <div className="bg-[rgba(242,221,193,0.3)] rounded-lg p-3">
        <div className="flex items-center gap-2 text-panora-warning-text">
          <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
          <span className="text-[13px] font-medium leading-5 flex-1">
            Connexion à l&apos;extranet en cours…
          </span>
          <button
            onClick={onOpenLivePanel}
            className="flex items-center gap-1 text-[12px] font-medium text-panora-warning-text/80 hover:text-panora-warning-text hover:underline whitespace-nowrap"
          >
            <Eye className="w-3 h-3" />
            Voir
          </button>
        </div>
      </div>
    );
  }

  if (state.status === "otp_required") {
    return (
      <div className="bg-[rgba(242,221,193,0.3)] rounded-lg p-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-panora-warning-text">
          <Lock className="w-4 h-4 shrink-0" />
          <span className="text-[13px] font-medium leading-5">
            Code de vérification requis
          </span>
        </div>
        <SessionOtpInput
          format={state.otpFormat}
          submitting={submitting}
          error={otpError}
          compact
          onSubmit={onSubmitOtp}
        />
      </div>
    );
  }

  // state.status === "error"
  return (
    <div className="bg-panora-error-bg rounded-lg p-3 flex flex-col gap-2.5">
      <div className="flex items-start gap-2 text-panora-error">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span className="text-[13px] leading-5 flex-1">{state.message}</span>
      </div>
      <button
        onClick={onRetry}
        className="self-start inline-flex items-center gap-1.5 px-2.5 h-7 bg-white border border-panora-error/30 rounded-md text-[12px] font-medium text-panora-error hover:bg-panora-error-bg/60 transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        Réessayer
      </button>
    </div>
  );
}

/**
 * Renders the status pill in the card's bottom strip — green for active,
 * red for every other state. Always rendered.
 */
export function SessionStatusPill({ state }: { state: SessionState }) {
  if (state.status === "active") {
    return (
      <div className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-panora-green-light">
        <Check className="w-3 h-3 text-panora-green-dark" />
        <span className="text-[12px] font-medium text-panora-green-dark leading-4">
          Session active jusqu&apos;à {state.expiresAtLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-[#f6e1db]">
      <Clock className="w-3 h-3 text-panora-error" />
      <span className="text-[12px] font-medium text-panora-error leading-4">
        Session expirée
      </span>
    </div>
  );
}
