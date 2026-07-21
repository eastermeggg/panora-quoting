"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { PrimaryButton } from "@/components/signup/ui";

export type FeatureIntroContent = {
  eyebrow: string;
  title: string;
  description: string;
  /** What the assistant does — shown as a checked list. */
  can: string[];
  /** Honest limits — "ce que l'agent ne fait pas". Optional. */
  cannot?: string[];
  icon: string;
  ctaLabel: string;
};

/* First-use intro modal shown BEFORE a feature launches. Presents the feature
 * and its context (what it can / can't do) so the broker knows what to expect.
 * Mirrors the app's modal overlay pattern (fixed inset, backdrop, card). */
export function FeatureIntroModal({
  content,
  onLaunch,
  onClose,
}: {
  content: FeatureIntroContent;
  onLaunch: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
    >
      <div
        className="w-full max-w-[460px] overflow-hidden rounded-[16px] bg-white shadow-[0px_8px_32px_0px_rgba(0,0,0,0.14)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Branded header band */}
        <div className="relative flex items-center justify-center overflow-hidden bg-[#0b2621] px-6 pt-8 pb-6">
          <img
            src="/onboarding/empty-state-gradient.jpg"
            alt=""
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 w-full object-cover opacity-90"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <img src={content.icon} alt="" className="relative h-20 w-20 object-contain" />
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-panora-green-dark">
            {content.eyebrow}
          </span>
          <h2 className="mt-1 font-serif text-[22px] leading-7 tracking-[-0.3px] text-panora-text">
            {content.title}
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-panora-text-secondary">
            {content.description}
          </p>

          <ul className="mt-4 flex flex-col gap-2">
            {content.can.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-panora-green-light">
                  <Check className="h-2.5 w-2.5 text-panora-green-dark" />
                </span>
                <span className="text-[13px] leading-5 text-panora-text">{item}</span>
              </li>
            ))}
          </ul>

          {content.cannot && content.cannot.length > 0 && (
            <div className="mt-4 rounded-lg border border-panora-border bg-panora-drop/60 px-3.5 py-3">
              <p className="text-[12px] font-medium text-panora-text-secondary">
                Bon à savoir
              </p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {content.cannot.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[12px] leading-4 text-panora-text-secondary"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-panora-text-muted" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-panora-border px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] font-medium text-panora-text-secondary hover:text-panora-text transition-colors"
          >
            Plus tard
          </button>
          <PrimaryButton onClick={onLaunch} className="px-4 py-2">
            {content.ctaLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
