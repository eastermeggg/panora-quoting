"use client";

import { Sparkles, Check } from "lucide-react";
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
        // Lilac shell on near-white — signals "AI authorship zone" with a
        // distinct accent (not the green of broker actions).
        "rounded-[10px] border-2 bg-[#fdfdfc] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden transition-colors",
        allDone ? "border-panora-green-border" : "border-[#d4cafe]",
        className
      )}
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Header row: dark IA pill + title on the same baseline */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 h-5 px-2 rounded-full shrink-0",
              allDone ? "bg-panora-green" : "bg-panora-text-primary"
            )}
          >
            {allDone ? (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            ) : (
              <Sparkles className="w-3 h-3 text-white" />
            )}
            <span className="text-[12px] font-medium text-white leading-4">
              I.A
            </span>
          </span>
          <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
            {allDone
              ? "Toutes les sections sont vérifiées"
              : "Pré-rempli par l'IA Panora"}
          </h2>
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
              <span className="font-medium text-panora-text-primary">
                Vérifiez chaque section
              </span>{" "}
              avant de lancer. Vous restez responsable de l&apos;exactitude
              auprès des assureurs.
            </>
          )}
        </p>
      </div>

      {/* Progress strip — continuous bar with count + percent */}
      {showProgress && (
        <div className="border-t border-panora-border flex items-center justify-between px-4 pt-[11px] pb-[10px]">
          <span className="text-[12px] font-medium tabular-nums">
            <span className="text-panora-text-primary">
              {verified}/{total}
            </span>
            <span className="text-panora-text-muted font-normal ml-1">
              sections vérifiées
            </span>
          </span>

          <div className="flex items-center gap-3.5">
            <div className="relative w-[130px] h-1 rounded-full bg-panora-secondary overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-300",
                  allDone ? "bg-panora-green" : "bg-panora-text-primary"
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[12px] font-medium tabular-nums text-panora-text-muted w-8 text-right">
              {percent}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
