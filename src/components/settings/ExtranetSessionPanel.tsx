"use client";

import { useState } from "react";
import {
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Lock,
  Eye,
  Clock,
  Mail,
  Smartphone,
  HelpCircle,
  ChevronDown,
  Forward,
} from "lucide-react";
import { SessionOtpInput } from "@/components/ui/SessionOtpInput";
import { cn } from "@/lib/utils";
import type { OtpDelivery, SessionState } from "@/data/settings-mock";

interface SessionActionBlockProps {
  state: SessionState;
  submitting: boolean;
  otpError: string | null;
  resendCooldown: number;
  /** Where the portal sends the OTP. Undefined = generic copy. */
  otpDelivery?: OtpDelivery;
  /** Whether the broker has set up auto-forward for email-delivered OTPs. */
  emailForwardConfigured?: boolean;
  onActivate: () => void;
  onSubmitOtp: (code: string) => void;
  onResendOtp: () => void;
  onRetry: () => void;
  onOpenLivePanel: () => void;
  /** Open the email-forward setup flow (only relevant for email-delivered OTPs). */
  onConfigureEmailForward?: () => void;
}

function DeliveryIcon({ channel }: { channel: OtpDelivery["channel"] }) {
  if (channel === "email") return <Mail className="w-3.5 h-3.5" />;
  if (channel === "sms") return <Smartphone className="w-3.5 h-3.5" />;
  return <KeyRound className="w-3.5 h-3.5" />;
}

function deliveryLabel(d: OtpDelivery) {
  if (d.channel === "email") return `Email envoyé à ${d.hint}`;
  if (d.channel === "sms") return `SMS envoyé au ${d.hint}`;
  return `Ouvrez ${d.hint}`;
}

function deliveryHelp(d: OtpDelivery) {
  if (d.channel === "email")
    return "Vérifiez la boîte de réception associée à votre compte chez cet assureur. L'email arrive en général en moins d'une minute — pensez à regarder les spams.";
  if (d.channel === "sms")
    return "Le SMS arrive en général en moins d'une minute. Si le délai dépasse 2 min, demandez un renvoi.";
  return "Ouvrez l'application sur votre téléphone et copiez le code à 6 chiffres affiché.";
}

/**
 * Renders the action affordance for the session inside the card's top section.
 * Returns null for the active state — when nothing needs to happen, no block is shown.
 */
export function SessionActionBlock({
  state,
  submitting,
  otpError,
  resendCooldown,
  otpDelivery,
  emailForwardConfigured,
  onActivate,
  onSubmitOtp,
  onResendOtp,
  onRetry,
  onOpenLivePanel,
  onConfigureEmailForward,
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
      <OtpBlock
        otpFormat={state.otpFormat}
        submitting={submitting}
        otpError={otpError}
        resendCooldown={resendCooldown}
        otpDelivery={otpDelivery}
        emailForwardConfigured={emailForwardConfigured}
        onSubmitOtp={onSubmitOtp}
        onResendOtp={onResendOtp}
        onConfigureEmailForward={onConfigureEmailForward}
      />
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

interface OtpBlockProps {
  otpFormat: NonNullable<
    Extract<SessionState, { status: "otp_required" }>
  >["otpFormat"];
  submitting: boolean;
  otpError: string | null;
  resendCooldown: number;
  otpDelivery?: OtpDelivery;
  emailForwardConfigured?: boolean;
  onSubmitOtp: (code: string) => void;
  onResendOtp: () => void;
  onConfigureEmailForward?: () => void;
}

function OtpBlock({
  otpFormat,
  submitting,
  otpError,
  resendCooldown,
  otpDelivery,
  emailForwardConfigured,
  onSubmitOtp,
  onResendOtp,
  onConfigureEmailForward,
}: OtpBlockProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const canResend = resendCooldown === 0;
  const isEmailChannel = otpDelivery?.channel === "email";
  const showForwardPitch =
    isEmailChannel && !emailForwardConfigured && onConfigureEmailForward;

  return (
    <div className="bg-[rgba(242,221,193,0.3)] rounded-lg p-3 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center gap-2 text-panora-warning-text">
        <Lock className="w-4 h-4 shrink-0" />
        <span className="text-[13px] font-medium leading-5">
          Code de vérification requis
        </span>
      </div>

      {/* Delivery context */}
      {otpDelivery && (
        <div className="flex items-center gap-1.5 text-[12px] text-panora-warning-text/85 leading-[18px]">
          <DeliveryIcon channel={otpDelivery.channel} />
          <span>{deliveryLabel(otpDelivery)}</span>
        </div>
      )}

      {/* OTP input */}
      <SessionOtpInput
        format={otpFormat}
        submitting={submitting}
        error={otpError}
        compact
        onSubmit={onSubmitOtp}
      />

      {/* Action row */}
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <button
          onClick={onResendOtp}
          disabled={!canResend}
          className={cn(
            "inline-flex items-center gap-1 font-medium leading-4 transition-colors",
            canResend
              ? "text-panora-warning-text hover:underline"
              : "text-panora-text-muted cursor-not-allowed"
          )}
        >
          <RefreshCw className="w-3 h-3" />
          {canResend ? "Renvoyer le code" : `Renvoyer dans ${resendCooldown}s`}
        </button>
        <button
          onClick={() => setHelpOpen((o) => !o)}
          className="inline-flex items-center gap-1 font-medium text-panora-text-secondary hover:text-panora-text leading-4 transition-colors"
        >
          <HelpCircle className="w-3 h-3" />
          Je n&apos;ai pas reçu le code
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform",
              helpOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Help block — only shown when expanded */}
      {helpOpen && (
        <div className="flex flex-col gap-2 pt-2 border-t border-panora-warning-text/15">
          {otpDelivery && (
            <p className="text-[12px] text-panora-text-secondary leading-[18px]">
              {deliveryHelp(otpDelivery)}
            </p>
          )}
          {showForwardPitch && (
            <button
              onClick={onConfigureEmailForward}
              className="flex items-start gap-2 p-2.5 rounded-md bg-white border border-panora-border hover:border-panora-green/40 hover:bg-panora-green-light/10 transition-colors text-left group"
            >
              <Forward className="w-3.5 h-3.5 text-panora-green shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-[12px] font-medium text-panora-text leading-4">
                  Évitez de saisir le code chaque matin
                </p>
                <p className="text-[11px] text-panora-text-secondary leading-4">
                  Configurez un transfert automatique de l&apos;email vers votre
                  adresse de cotation — Panora lira le code pour vous.
                </p>
              </div>
            </button>
          )}
          {!otpDelivery && (
            <p className="text-[12px] text-panora-text-secondary leading-[18px]">
              Vérifiez votre boîte mail et vos SMS. Si rien n&apos;arrive,
              relancez l&apos;activation depuis le portail assureur.
            </p>
          )}
        </div>
      )}
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
