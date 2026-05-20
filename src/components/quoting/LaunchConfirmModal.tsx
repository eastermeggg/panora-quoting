"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LaunchConfirmModalProps {
  open: boolean;
  /** When true, the modal becomes the verification gate — broker must tick a
   *  checkbox attesting to verification before "Lancer" enables. Used by the
   *  variant that has no per-section verification. Default: false. */
  requireAcknowledgment?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LaunchConfirmModal({
  open,
  requireAcknowledgment = false,
  onClose,
  onConfirm,
}: LaunchConfirmModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset acknowledgment when the modal closes so reopening doesn't carry
  // over a previous tick.
  useEffect(() => {
    if (!open) setAcknowledged(false);
  }, [open]);

  if (!open) return null;

  const canConfirm = !requireAcknowledgment || acknowledged;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-confirm-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-panora-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider leading-3 mb-1">
              Confirmation
            </span>
            <h2
              id="launch-confirm-title"
              className="text-[20px] font-serif text-panora-text leading-7"
            >
              {requireAcknowledgment
                ? "Avez-vous bien vérifié toutes les données ?"
                : "Lancer la cotation ?"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1 hover:bg-panora-bg rounded transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-5 space-y-4">
          {requireAcknowledgment && (
            <p className="text-[13px] text-panora-text-secondary leading-5">
              La cotation va être transmise aux assureurs sélectionnés. Les
              informations rentrées seront utilisées pour saisir les devis sur
              leurs extranets.{" "}
              <span className="text-panora-text">Vérifiez bien tout</span>, vous
              restez responsable de l&apos;exactitude auprès des assureurs.
            </p>
          )}

          {requireAcknowledgment && (
            /* Verification gate — explicit attestation in the absence of
               per-section verification on the page. */
            <label
              className={cn(
                "flex items-start gap-3 px-3 py-3 rounded-lg border bg-white cursor-pointer select-none transition-colors",
                acknowledged
                  ? "border-panora-green-border bg-panora-green-light/40"
                  : "border-panora-border hover:border-panora-text-muted/40"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center transition-colors",
                  acknowledged
                    ? "bg-panora-green border border-panora-green"
                    : "bg-white border border-panora-text-muted/40"
                )}
              >
                {acknowledged && <Check className="w-3 h-3 text-white" />}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              <span className="text-[13px] font-medium text-panora-text leading-5">
                Je confirme
              </span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="bg-panora-drop/40 border-t border-panora-border px-6 py-3 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-3 rounded-lg text-[13px] font-medium text-panora-text-secondary hover:text-panora-text hover:bg-white transition-colors"
          >
            Revoir
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={cn(
              "btn-primary inline-flex items-center gap-1.5 px-4 h-9 text-[13px] font-semibold transition-all",
              !canConfirm && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
            aria-disabled={!canConfirm}
          >
            {requireAcknowledgment ? "Lancer" : "Lancer la cotation"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

