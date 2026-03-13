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
      <OtpBox
        action={action}
        insurerName={insurerName}
        onResolved={onResolved}
        onExpired={handleExpired}
      />
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
    <div className="border-l-[3px] border-l-panora-warning bg-panora-warning-bg/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-panora-warning/10 flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-4 h-4 text-panora-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-semibold text-panora-text mb-1">
            {action.title}
          </h4>
          <p className="text-[13px] text-panora-text-secondary leading-5 mb-4">
            {action.desc}
          </p>

          {/* OTP input */}
          <div className="mb-4">
            <OtpInputRow
              length={action.codeLength ?? 6}
              onComplete={handleSubmitCode}
              error={error}
              resetKey={resetKey}
              disabled={submitting}
            />
          </div>

          {/* Submit button */}
          <button
            disabled={submitting}
            className={cn(
              "btn-primary flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium transition-all",
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

          {/* Action links row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {/* Resend code */}
            <button
              onClick={handleResendCode}
              disabled={resent}
              className={cn(
                "text-[12px] hover:underline transition-colors",
                resent
                  ? "text-panora-green"
                  : "text-panora-text-muted"
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

            <div className="w-px h-3 bg-panora-border" />

            {/* Open mailbox — for email channel */}
            {action.channel === "email" && (
              <>
                <a
                  href={`/email?search=${encodeURIComponent(action.portalName + " 2FA")}`}
                  className="text-[12px] text-panora-text-muted hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  Chercher dans la boîte mail
                </a>
                <div className="w-px h-3 bg-panora-border" />
              </>
            )}

            {/* Relaunch full login */}
            <button
              onClick={handleRelaunch}
              className="text-[12px] text-panora-text-muted hover:underline"
            >
              Relancer la connexion
            </button>
          </div>

          {/* Help text on error */}
          {error && (
            <div className="mt-3 bg-panora-bg rounded-lg p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-panora-text-muted shrink-0 mt-0.5" />
              <div className="text-[12px] text-panora-text-secondary leading-[18px]">
                <p className="font-medium text-panora-text mb-0.5">
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
    <div className="border-l-[3px] border-l-panora-warning bg-panora-warning-bg/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-panora-warning/10 flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-4 h-4 text-panora-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-semibold text-panora-text mb-1">
            {action.title}
          </h4>
          <p className="text-[13px] text-panora-text-secondary leading-5 mb-4">
            {action.desc}
          </p>

          {/* Push instruction zone */}
          <div className="bg-white border border-panora-border rounded-lg p-3 flex items-center gap-3 mb-4">
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
            <div className="flex items-center gap-1.5 mb-3 bg-panora-warning-bg rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-panora-warning shrink-0" />
              <p className="text-[12px] text-panora-warning-text">{error}</p>
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={cn(
              "btn-primary flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium transition-all",
              submitting && "opacity-70"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Vérification...
              </>
            ) : (
              "J'ai validé, continuer"
            )}
          </button>

          {/* Action links */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleRelaunch}
              className="text-[12px] text-panora-text-muted hover:underline"
            >
              Relancer la demande 2FA
            </button>
          </div>

          {/* Help text on error */}
          {error && (
            <div className="mt-3 bg-panora-bg rounded-lg p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-panora-text-muted shrink-0 mt-0.5" />
              <div className="text-[12px] text-panora-text-secondary leading-[18px]">
                <p className="font-medium text-panora-text mb-0.5">
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
    <div className="border-l-[3px] border-l-panora-text-muted bg-panora-drop rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-panora-secondary flex items-center justify-center shrink-0 mt-0.5">
          <Clock className="w-4 h-4 text-panora-text-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-semibold text-panora-text mb-1">
            Session expirée
          </h4>
          <p className="text-[13px] text-panora-text-secondary leading-5 mb-4">
            La session de vérification {action.portalName} a expiré. Relancez la
            connexion pour obtenir un nouveau code.
          </p>

          <button
            onClick={handleRelaunch}
            disabled={relaunching}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-[10px] border border-panora-border bg-white hover:bg-panora-drop transition-colors",
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
    </div>
  );
}
