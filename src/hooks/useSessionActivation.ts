"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OtpFormat, SessionState } from "@/data/settings-mock";

const CONNECTING_DELAY_MS = 2000;
const SUBMIT_DELAY_MS = 1500;
const RESEND_COOLDOWN_SECONDS = 30;
const DEFAULT_EXPIRES_LABEL = "18h";

interface UseSessionActivationOptions {
  initialState?: SessionState;
  /** Format prompted in the OTP step. Defaults to digits-6. */
  otpFormat?: OtpFormat;
  /** Label shown once the session is active. Defaults to "18h". */
  expiresAtLabel?: string;
  /** Called once the state transitions to "active". */
  onActivated?: () => void;
}

export function useSessionActivation({
  initialState = { status: "inactive" },
  otpFormat = "digits-6",
  expiresAtLabel = DEFAULT_EXPIRES_LABEL,
  onActivated,
}: UseSessionActivationOptions = {}) {
  const [state, setState] = useState<SessionState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Demo: fail the first OTP attempt, succeed on the second.
  const otpAttemptsRef = useRef(0);

  useEffect(
    () => () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    },
    []
  );

  const startCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((sec) => {
        if (sec <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
  }, []);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startConnecting = useCallback(() => {
    clearTimer();
    setOtpError(null);
    otpAttemptsRef.current = 0;
    setState({ status: "connecting" });
    timeoutRef.current = setTimeout(() => {
      setState({ status: "otp_required", otpFormat });
      startCooldown();
    }, CONNECTING_DELAY_MS);
  }, [clearTimer, otpFormat, startCooldown]);

  const resendOtp = useCallback(() => {
    if (resendCooldown > 0) return;
    setOtpError(null);
    startCooldown();
  }, [resendCooldown, startCooldown]);

  const submitOtp = useCallback(() => {
    clearTimer();
    setSubmitting(true);
    setOtpError(null);
    timeoutRef.current = setTimeout(() => {
      otpAttemptsRef.current += 1;
      const valid = otpAttemptsRef.current > 1;
      setSubmitting(false);

      if (valid) {
        setState({ status: "active", expiresAtLabel });
        onActivated?.();
      } else {
        setOtpError("Code incorrect, veuillez réessayer");
      }
    }, SUBMIT_DELAY_MS);
  }, [clearTimer, expiresAtLabel, onActivated]);

  const retry = useCallback(() => {
    startConnecting();
  }, [startConnecting]);

  return {
    state,
    submitting,
    otpError,
    resendCooldown,
    startConnecting,
    submitOtp,
    resendOtp,
    retry,
  };
}
