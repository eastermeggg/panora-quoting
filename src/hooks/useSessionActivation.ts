"use client";

import { useCallback, useRef, useState } from "react";
import type { OtpFormat, SessionState } from "@/data/settings-mock";

const CONNECTING_DELAY_MS = 2000;
const SUBMIT_DELAY_MS = 1500;
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Demo: fail the first OTP attempt, succeed on the second.
  const otpAttemptsRef = useRef(0);

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
    }, CONNECTING_DELAY_MS);
  }, [clearTimer, otpFormat]);

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

  return { state, submitting, otpError, startConnecting, submitOtp, retry };
}
