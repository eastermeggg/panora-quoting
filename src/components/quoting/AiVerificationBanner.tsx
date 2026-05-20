"use client";

import { Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiVerificationBannerProps {
  total: number;
  verified: number;
  /** When false, the per-section progress strip is hidden — used by variants
   *  that don't track section-level verification. Default: true. */
  showProgress?: boolean;
  className?: string;
}

/**
 * Sits above the extracted-data panel. Names the AI as the *author* of the
 * pre-filled data and assigns the broker as the *verifier* — without scolding.
 * Replaces the previous "Donnée consolidées" heading.
 */
export function AiVerificationBanner({
  total,
  verified,
  showProgress = true,
  className,
}: AiVerificationBannerProps) {
  const allDone = showProgress && total > 0 && verified === total;
  const percent = total === 0 ? 0 : Math.round((verified / total) * 100);

  return (
    <div
      className={cn(
        // Muted plum shell — signals "AI authorship zone" without going neon
        "rounded-xl border border-[#e3d2d6] bg-[#f5ebec] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] overflow-hidden",
        className
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* AI mark — small, deliberate, not glowing */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-inset transition-colors",
            allDone
              ? "bg-panora-green-light ring-panora-green-border"
              : "bg-white ring-[#e3d2d6]"
          )}
        >
          {allDone ? (
            <CheckCircle2 className="w-4 h-4 text-panora-green" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#75505d]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h2 className="text-[14px] font-semibold text-panora-text leading-5">
              {allDone
                ? "Toutes les sections sont vérifiées"
                : "Pré-rempli par l'IA Panora"}
            </h2>
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#75505d]">
              IA
            </span>
          </div>
          <p className="text-[13px] text-panora-text-secondary leading-5">
            {allDone ? (
              <>
                Vous pouvez lancer la cotation. Les données sont envoyées telles
                que vous les avez confirmées.
              </>
            ) : (
              <>
                À partir de l&apos;e-mail et des documents joints.{" "}
                <span className="text-panora-text">
                  Vérifiez chaque section
                </span>{" "}
                avant de lancer — vous restez responsable de l&apos;exactitude
                auprès des assureurs.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Progress strip — section dots, mapped 1:1 to sections */}
      {showProgress && (
      <div className="border-t border-[#e3d2d6]/70 bg-white/40 px-4 py-2.5 flex items-center gap-3">
        <span
          className={cn(
            "text-[12px] font-medium tabular-nums",
            allDone ? "text-panora-green-dark" : "text-panora-text"
          )}
        >
          {verified}
          <span className="text-panora-text-muted">/{total}</span>
          <span className="text-panora-text-muted font-normal ml-1">
            sections vérifiées
          </span>
        </span>

        <div className="flex-1 flex items-center gap-1 justify-end">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={cn(
                "h-1.5 w-5 rounded-full transition-colors",
                i < verified
                  ? "bg-panora-green"
                  : "bg-panora-border"
              )}
            />
          ))}
        </div>

        <span
          className="text-[11px] font-medium tabular-nums text-panora-text-muted shrink-0 w-8 text-right"
          aria-hidden
        >
          {percent}%
        </span>
      </div>
      )}
    </div>
  );
}
