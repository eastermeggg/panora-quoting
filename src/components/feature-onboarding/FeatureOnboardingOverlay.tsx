"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Play, Pause, X } from "lucide-react";

/* Video overlay shown DURING a feature's processing/loading, on first use.
 * The processing time is otherwise dead — we use it to train the broker in
 * context: the onboarding video plays while the result is being prepared, then
 * the overlay steps aside once it's ready (parent stops rendering it). */
export function FeatureOnboardingOverlay({
  title,
  subtitle,
  durationLabel = "1:12",
  onSkip,
}: {
  title: string;
  subtitle: string;
  durationLabel?: string;
  onSkip: () => void;
}) {
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onSkip]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-[560px] overflow-hidden rounded-[16px] border border-panora-border bg-white shadow-[0px_12px_40px_0px_rgba(0,0,0,0.12)]">
        {/* Video area */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#0b2621]">
          <img
            src="/onboarding/empty-state-landscape.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Mettre en pause" : "Lire"}
            className="group absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors group-hover:bg-white/30">
              {playing ? (
                <Pause className="h-6 w-6 fill-white text-white" />
              ) : (
                <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
              )}
            </span>
          </button>

          {/* Live processing badge */}
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-panora-green" />
            <span className="text-[11px] font-medium text-white">
              Analyse en cours
            </span>
          </div>

          {/* Faux scrubber */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 px-4 py-3">
            <span className="text-[11px] text-white/70">Onboarding</span>
            <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <span
                className={
                  playing
                    ? "absolute inset-y-0 left-0 w-1/3 rounded-full bg-white/90"
                    : "absolute inset-y-0 left-0 w-1/3 rounded-full bg-white/60"
                }
              />
            </span>
            <span className="text-[11px] tabular-nums text-white/70">
              {durationLabel}
            </span>
          </div>
        </div>

        {/* Caption + skip */}
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1">
            <p className="text-[14px] font-medium text-panora-text">{title}</p>
            <p className="mt-0.5 text-[12px] leading-4 text-panora-text-secondary">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-panora-border bg-white px-3 py-1.5 text-[13px] font-medium text-panora-text-secondary shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-panora-drop transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Passer
          </button>
        </div>
      </div>
    </div>
  );
}
