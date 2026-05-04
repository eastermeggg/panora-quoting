"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OtpFormat } from "@/data/settings-mock";

interface SessionOtpInputProps {
  format: OtpFormat;
  submitting: boolean;
  error?: string | null;
  /** Compact form: shows a square check-icon button instead of the "Valider" label. */
  compact?: boolean;
  onSubmit: (code: string) => void;
}

const FORMAT_HINTS: Record<
  OtpFormat,
  { maxLength: number; placeholder: string; inputMode: "numeric" | "text" }
> = {
  "digits-4": { maxLength: 4, placeholder: "4 chiffres", inputMode: "numeric" },
  "digits-6": { maxLength: 6, placeholder: "6 chiffres", inputMode: "numeric" },
  "alphanumeric-8": {
    maxLength: 8,
    placeholder: "8 caractères",
    inputMode: "text",
  },
};

export function SessionOtpInput({
  format,
  submitting,
  error,
  compact = false,
  onSubmit,
}: SessionOtpInputProps) {
  const [value, setValue] = useState("");
  // Sync-during-render pattern: clear the input when a new error arrives so
  // the broker can re-enter cleanly. This is the React-blessed alternative
  // to calling setState inside an effect for prop-driven state resets.
  const [lastSeenError, setLastSeenError] = useState<string | null | undefined>(
    error
  );
  if (error !== lastSeenError) {
    setLastSeenError(error);
    if (error) setValue("");
  }
  const hints = FORMAT_HINTS[format];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || submitting) return;
    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          autoFocus
          inputMode={hints.inputMode}
          maxLength={hints.maxLength}
          value={value}
          disabled={submitting}
          onChange={(e) => setValue(e.target.value)}
          placeholder={hints.placeholder}
          aria-invalid={!!error}
          className={cn(
            "flex-1 min-w-0 h-9 px-3 bg-white text-[13px] font-mono tracking-wider text-panora-text rounded-lg border outline-none transition-all",
            "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]",
            "placeholder:font-sans placeholder:tracking-normal placeholder:text-panora-text-muted/70",
            error
              ? "border-panora-error/50 focus:ring-2 focus:ring-panora-error/20 focus:border-panora-error"
              : "border-panora-border focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green",
            submitting && "opacity-50 cursor-not-allowed"
          )}
        />
        <button
          type="submit"
          aria-label={compact ? "Valider le code" : undefined}
          disabled={submitting || value.trim().length === 0}
          className={cn(
            "btn-primary flex items-center justify-center gap-1.5 h-9 text-[13px] font-medium whitespace-nowrap transition-opacity",
            compact ? "w-9" : "px-3",
            (submitting || value.trim().length === 0) && "opacity-60 cursor-not-allowed"
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {!compact && "Vérification…"}
            </>
          ) : compact ? (
            <Check className="w-4 h-4" />
          ) : (
            "Valider"
          )}
        </button>
      </form>
      {error && (
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-panora-error shrink-0" />
          <p className="text-[12px] text-panora-error leading-4">{error}</p>
        </div>
      )}
    </div>
  );
}
