"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Lock,
  Clock,
  Smartphone,
  RefreshCw,
  Loader2,
  Mail,
  AlertCircle,
  Send,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TwoFaAction } from "@/data/mock";

interface TwoFaActionBoxProps {
  action: TwoFaAction;
  insurerName: string;
  onResolved: () => void;
}

export function TwoFaActionBox({
  action,
  insurerName,
  onResolved,
}: TwoFaActionBoxProps) {
  const [currentType, setCurrentType] = useState(action.type);

  const handleExpired = useCallback(() => {
    setCurrentType("2fa_expired");
  }, []);

  if (currentType === "2fa_otp") {
    return (
      <>
        <OtpBox
          action={action}
          insurerName={insurerName}
          onResolved={onResolved}
          onExpired={handleExpired}
        />
        {action.channel === "email" && (
          <div className="relative bg-[rgba(234,231,224,0.4)] rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex items-center gap-1.5 pl-[21px] pr-4 py-3.5">
            <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_4px_0px_0px_0px_#c4bfb6]" />
            <div className="flex-1 flex items-center gap-2.5 text-panora-text-muted">
              <Mail className="w-4 h-4 shrink-0" />
              <p className="text-[13px] leading-5">
                Recevez vos codes 2FA automatiquement en connectant votre boîte mail.
              </p>
            </div>
            <a
              href="/email?connect=true"
              className="shrink-0 text-[13px] font-medium text-panora-green hover:underline whitespace-nowrap"
            >
              Connecter ma boîte mail
            </a>
          </div>
        )}
      </>
    );
  }

  if (currentType === "2fa_push") {
    return (
      <PushBox
        action={action}
        insurerName={insurerName}
        onResolved={onResolved}
        onExpired={handleExpired}
      />
    );
  }

  if (currentType === "2fa_expired") {
    return (
      <ExpiredBox
        action={action}
        insurerName={insurerName}
        onRelaunch={onResolved}
      />
    );
  }

  return null;
}

/* ── OTP Input Component ── */
function OtpInputRow({
  length,
  onComplete,
  error,
  resetKey,
  disabled,
}: {
  length: number;
  onComplete: (code: string) => void;
  error: string | null;
  resetKey: number;
  disabled?: boolean;
}) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setValues(Array(length).fill(""));
    refs.current[0]?.focus();
  }, [resetKey, length]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    if (disabled) return;

    if (val.length > 1) {
      const digits = val.replace(/\D/g, "").slice(0, length);
      const newValues = Array(length).fill("");
      for (let i = 0; i < digits.length; i++) {
        newValues[i] = digits[i];
      }
      setValues(newValues);
      if (digits.length === length) {
        onComplete(digits);
      } else {
        refs.current[digits.length]?.focus();
      }
      return;
    }

    const digit = val.replace(/\D/g, "");
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }

    if (digit && newValues.every((v) => v !== "")) {
      onComplete(newValues.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      const newValues = [...values];
      newValues[index - 1] = "";
      setValues(newValues);
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        {values.map((val, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, length);
              handleChange(i, pasted);
            }}
            className={cn(
              "w-10 h-11 bg-white text-center text-[16px] font-mono font-semibold rounded-lg border outline-none transition-all",
              "focus:ring-2",
              error
                ? "border-panora-error/50 focus:ring-panora-error/20"
                : "border-panora-border focus:ring-panora-green/20 focus:border-panora-green",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-2">
          <AlertCircle className="w-3.5 h-3.5 text-panora-error shrink-0" />
          <p className="text-[12px] text-panora-error">{error}</p>
        </div>
      )}
    </div>
  );
}

/* ── Channel label helper ── */
function channelLabel(channel?: string): string {
  if (channel === "sms") return "SMS";
  if (channel === "email") return "e-mail";
  if (channel === "totp") return "application";
  return "SMS";
}

/* ── Variante 1: OTP Box ── */
function OtpBox({
  action,
  insurerName,
  onResolved,
  onExpired,
}: {
  action: TwoFaAction;
  insurerName: string;
  onResolved: () => void;
  onExpired: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [resent, setResent] = useState(false);

  const handleSubmitCode = (code: string) => {
    setSubmitting(true);
    setError(null);
    // Simulate backend — always succeeds for demo on second try
    setTimeout(() => {
      const success = resetKey > 0 || Math.random() > 0.4;
      if (success) {
        onResolved();
      } else {
        setError("Code incorrect, veuillez réessayer");
        setResetKey((k) => k + 1);
        setSubmitting(false);
      }
    }, 1500);
  };

  const handleResendCode = () => {
    setResent(true);
    setError(null);
    setResetKey((k) => k + 1);
    setTimeout(() => setResent(false), 3000);
  };

  const handleRelaunch = () => {
    setSubmitting(true);
    setTimeout(() => {
      onResolved();
    }, 1500);
  };

  const channel = channelLabel(action.channel);

  return (
    <div className="relative bg-[rgba(242,221,193,0.4)] rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 pl-[21px]">
      {/* Left accent border */}
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_4px_0px_0px_0px_#cb8052]" />

      <div className="flex flex-col gap-1.5 text-[#80452b]">
        <div className="flex items-center gap-2 mb-0.5">
          <Lock className="w-4 h-4 shrink-0" />
          <h4 className="text-[15px] font-semibold leading-[21px] tracking-[-0.15px]">
            {action.title}
          </h4>
        </div>
        <p className="text-[13px] font-normal leading-5 mb-3">
          {action.desc}
        </p>

        {/* OTP input */}
        <div className="mb-3">
          <OtpInputRow
            length={action.codeLength ?? 6}
            onComplete={handleSubmitCode}
            error={error}
            resetKey={resetKey}
            disabled={submitting}
          />
        </div>

        {/* Submit button */}
        <div className="flex items-center gap-2.5">
          <button
            disabled={submitting}
            className={cn(
              "btn-primary flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-opacity",
              submitting && "opacity-70"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Vérification...
              </>
            ) : (
              "Continuer"
            )}
          </button>
        </div>

        {/* Action links row */}
        <div className="flex items-center gap-3 mt-2 flex-wrap text-[#80452b]">
          <button
            onClick={handleResendCode}
            disabled={resent}
            className={cn(
              "text-[12px] hover:underline transition-colors",
              resent ? "text-panora-green" : "text-[#80452b]/70"
            )}
          >
            {resent ? (
              <span className="flex items-center gap-1">
                <Send className="w-3 h-3" />
                Code renvoyé par {channel}
              </span>
            ) : (
              `Renvoyer un code par ${channel}`
            )}
          </button>

          <div className="w-px h-3 bg-[#80452b]/20" />

          {action.channel === "email" && (
            <>
              <a
                href={`/email?search=${encodeURIComponent(action.portalName + " 2FA")}`}
                className="text-[12px] text-[#80452b]/70 hover:underline flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                Chercher dans la boîte mail
              </a>
              <div className="w-px h-3 bg-[#80452b]/20" />
            </>
          )}

          <button
            onClick={handleRelaunch}
            className="text-[12px] text-[#80452b]/70 hover:underline"
          >
            Relancer la connexion
          </button>
        </div>

        {/* Help text on error */}
        {error && (
          <div className="mt-3 bg-white/60 border border-panora-border rounded-lg p-3 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#80452b]/60 shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#80452b]/80 leading-[18px]">
              <p className="font-medium text-[#80452b] mb-0.5">
                Vous n&apos;arrivez pas à vous connecter ?
              </p>
              {action.channel === "email" ? (
                <p>
                  Vérifiez vos spams ou{" "}
                  <a
                    href={`/email?search=${encodeURIComponent(action.portalName + " code vérification")}`}
                    className="text-panora-green hover:underline font-medium"
                  >
                    cherchez l&apos;e-mail de {action.portalName}
                  </a>
                  . Sinon, relancez la connexion pour obtenir un nouveau code.
                </p>
              ) : (
                <p>
                  Vérifiez que vous avez bien reçu le {channel} de{" "}
                  {action.portalName}. Vous pouvez renvoyer un code ou
                  relancer la connexion complète.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Variante 2: Push Box ── */
function PushBox({
  action,
  insurerName,
  onResolved,
  onExpired,
}: {
  action: TwoFaAction;
  insurerName: string;
  onResolved: () => void;
  onExpired: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setSubmitting(true);
    setError(null);
    setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        onResolved();
      } else {
        setError(
          "Validation non reçue. Vérifiez votre téléphone et réessayez."
        );
        setSubmitting(false);
      }
    }, 1500);
  };

  const handleRelaunch = () => {
    setSubmitting(true);
    setTimeout(() => {
      onResolved();
    }, 1500);
  };

  return (
    <div className="relative bg-[rgba(242,221,193,0.4)] rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 pl-[21px]">
      {/* Left accent border */}
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_4px_0px_0px_0px_#cb8052]" />

      <div className="flex flex-col gap-1.5 text-[#80452b]">
        <div className="flex items-center gap-2 mb-0.5">
          <Lock className="w-4 h-4 shrink-0" />
          <h4 className="text-[15px] font-semibold leading-[21px] tracking-[-0.15px]">
            {action.title}
          </h4>
        </div>
        <p className="text-[13px] font-normal leading-5 mb-3">
          {action.desc}
        </p>

        {/* Push instruction zone */}
        <div className="bg-white border border-panora-border rounded-lg p-3 flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-panora-secondary flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-panora-text-secondary" />
          </div>
          <p className="text-[13px] text-panora-text-secondary leading-5">
            Approuvez la notification sur votre téléphone puis cliquez
            ci-dessous.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-1.5 mb-3 bg-white/60 border border-panora-border rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#80452b] shrink-0" />
            <p className="text-[12px] text-[#80452b]">{error}</p>
          </div>
        )}

        {/* Confirm button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={cn(
              "btn-primary flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-opacity",
              submitting && "opacity-70"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Vérification...
              </>
            ) : (
              "J\u2019ai validé, continuer"
            )}
          </button>
        </div>

        {/* Action links */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleRelaunch}
            className="text-[12px] text-[#80452b]/70 hover:underline"
          >
            Relancer la demande 2FA
          </button>
        </div>

        {/* Help text on error */}
        {error && (
          <div className="mt-3 bg-white/60 border border-panora-border rounded-lg p-3 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#80452b]/60 shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#80452b]/80 leading-[18px]">
              <p className="font-medium text-[#80452b] mb-0.5">
                Notification non reçue ?
              </p>
              <p>
                Assurez-vous que les notifications {action.portalName} sont
                activées sur votre téléphone. Vous pouvez relancer la demande
                pour recevoir une nouvelle notification.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Variante 3: Expired Box ── */
function ExpiredBox({
  action,
  insurerName,
  onRelaunch,
}: {
  action: TwoFaAction;
  insurerName: string;
  onRelaunch: () => void;
}) {
  const [relaunching, setRelaunching] = useState(false);

  const handleRelaunch = () => {
    setRelaunching(true);
    setTimeout(() => {
      onRelaunch();
    }, 1500);
  };

  return (
    <div className="relative bg-[rgba(232,230,225,0.4)] rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 pl-[21px]">
      {/* Left accent border — gray for expired */}
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_4px_0px_0px_0px_#9c9890]" />

      <div className="flex items-end gap-1.5">
        <div className="flex-1 flex flex-col gap-1.5 text-panora-text-muted">
          <div className="flex items-center gap-2 mb-0.5">
            <Clock className="w-4 h-4 shrink-0" />
            <h4 className="text-[15px] font-semibold leading-[21px] tracking-[-0.15px] text-panora-text">
              Session expirée
            </h4>
          </div>
          <p className="text-[13px] font-normal leading-5">
            La session de vérification {action.portalName} a expiré. Relancez la
            connexion pour obtenir un nouveau code.
          </p>
        </div>

        <button
          onClick={handleRelaunch}
          disabled={relaunching}
          className={cn(
            "shrink-0 flex items-center gap-2.5 px-3 py-2 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-[13px] font-medium text-panora-text-muted whitespace-nowrap hover:bg-panora-bg transition-colors",
            relaunching && "opacity-70"
          )}
        >
          {relaunching ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Relance en cours...
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Relancer la connexion
            </>
          )}
        </button>
      </div>
    </div>
  );
}
