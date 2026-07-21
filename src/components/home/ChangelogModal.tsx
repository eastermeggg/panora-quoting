"use client";

import { useEffect } from "react";
import { X, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHANGELOG, type ChangelogTag } from "@/data/changelog";

const TAG_STYLE: Record<ChangelogTag, string> = {
  Nouveau: "bg-panora-green-light text-panora-green-dark",
  Amélioration: "bg-[#f1e6fb] text-[#6d28a8]",
  Correctif: "bg-panora-tag text-panora-text-secondary",
};

/* Full changelog list, opened from the home widget or the sidebar. */
export function ChangelogModal({ onClose }: { onClose: () => void }) {
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
      aria-label="Nouveautés Panora"
    >
      <div
        className="flex max-h-[86vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0px_8px_32px_0px_rgba(0,0,0,0.14)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-panora-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-panora-green-dark" />
            <h2 className="font-serif text-[17px] text-panora-text">
              Quoi de neuf sur Panora
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-7 w-7 items-center justify-center rounded-full text-panora-text-muted hover:bg-panora-drop hover:text-panora-text transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ol className="flex-1 overflow-y-auto px-5 py-4">
          {CHANGELOG.map((e, i) => (
            <li key={e.id} className="relative flex gap-4 pb-5 last:pb-0">
              {/* Timeline rail */}
              <div className="flex flex-col items-center">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-panora-green" />
                {i < CHANGELOG.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-panora-border" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      TAG_STYLE[e.tag]
                    )}
                  >
                    {e.tag}
                  </span>
                  <span className="text-[12px] text-panora-text-muted">
                    {e.date}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] font-medium text-panora-text">
                  {e.title}
                </p>
                <p className="mt-0.5 text-[13px] leading-5 text-panora-text-secondary">
                  {e.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
