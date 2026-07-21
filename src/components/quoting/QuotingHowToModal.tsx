"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useConfiguredExtranets } from "@/data/settings-mock";
import { QuotingReadyContent } from "@/components/quoting/QuotingReadyContent";

/* "Voir comment coter" — the cotation empty state's single primary CTA opens
 * this modal, which holds the e-mail how-to (address + steps + ideal e-mail)
 * shared with the onboarding's last step. Keeps the empty state itself to the
 * shared reference structure (one centered block, one primary action). */
export function QuotingHowToModal({ onClose }: { onClose: () => void }) {
  const configured = useConfiguredExtranets();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Comment lancer une cotation"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0px_8px_32px_0px_rgba(0,0,0,0.14)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-panora-border px-6 py-3.5">
          <div>
            <h2 className="font-serif text-[18px] leading-6 text-panora-text">
              Lancez votre première cotation
            </h2>
            <p className="text-[12px] text-panora-text-secondary">
              La cotation se fait par e-mail — voici comment procéder.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-panora-text-muted transition-colors hover:bg-panora-drop hover:text-panora-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <QuotingReadyContent configuredExtranets={configured} />
        </div>
      </div>
    </div>
  );
}
