"use client";

import { useEffect, useState } from "react";
import { X, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type EtudeDraft = {
  title: string;
  number: string;
  product: string;
};

interface CreateEtudeModalProps {
  open: boolean;
  /** Pre-fills the form on each open. */
  initial: EtudeDraft;
  /** Used as the title placeholder when the broker hasn't typed one. */
  productPlaceholder: string;
  /** Singular noun ("étude", "study", …) from the ERP adapter. */
  singular: string;
  /** ERP display name ("VEOS", …). */
  erpName: string;
  /** Per-field labels from the ERP adapter. */
  formLabels: { title: string; number: string; product: string };
  /** Show the "Reprendre une étude existante" link when relevant. */
  hasExistingEtudes: boolean;
  /** Called when the broker clicks "Reprendre une étude existante". */
  onBack?: () => void;
  /** Called on cancel / escape / backdrop click. */
  onCancel: () => void;
  /** Called when the broker commits the form. */
  onCreate: (values: EtudeDraft) => void;
}

export function CreateEtudeModal({
  open,
  initial,
  productPlaceholder,
  singular,
  erpName,
  formLabels,
  hasExistingEtudes,
  onBack,
  onCancel,
  onCreate,
}: CreateEtudeModalProps) {
  const [draft, setDraft] = useState<EtudeDraft>(initial);

  // Reset draft each time the modal opens, so cancelling discards in-progress
  // edits without leaking them across opens.
  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const canCreate = draft.title.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-etude-title"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-panora-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider leading-3 mb-1">
              Nouvelle {singular} dans {erpName}
            </span>
            <h2
              id="create-etude-title"
              className="text-[20px] font-serif text-panora-text leading-7"
            >
              Créer une {singular}
            </h2>
          </div>
          <button
            onClick={onCancel}
            aria-label="Fermer"
            className="p-1 hover:bg-panora-bg rounded transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[13px] font-medium text-panora-text leading-5">
                {formLabels.title}
                <span className="text-panora-error ml-1">*</span>
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
                placeholder={`${singular.charAt(0).toUpperCase() + singular.slice(1)} ${productPlaceholder} ${new Date().getFullYear()}`}
                className="w-full h-9 px-3 bg-white border border-panora-border rounded-md text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green/40 transition-colors"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-panora-text leading-5">
                {formLabels.number}
              </label>
              <input
                type="text"
                value={draft.number}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, number: e.target.value }))
                }
                className="w-full h-9 px-3 bg-white border border-panora-border rounded-md text-[13px] text-panora-text font-mono tabular-nums outline-none focus:border-panora-green/40 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-panora-text leading-5">
                {formLabels.product}
              </label>
              <input
                type="text"
                value={draft.product}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, product: e.target.value }))
                }
                placeholder={productPlaceholder}
                className="w-full h-9 px-3 bg-white border border-panora-border rounded-md text-[13px] text-panora-text outline-none focus:border-panora-green/40 transition-colors"
              />
            </div>
          </div>

          {hasExistingEtudes && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-panora-text-muted hover:text-panora-text-secondary transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Reprendre une {singular} existante
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="bg-panora-drop/40 border-t border-panora-border px-6 py-3 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="h-9 px-3 rounded-lg text-[13px] font-medium text-panora-text-secondary hover:text-panora-text hover:bg-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onCreate(draft)}
            disabled={!canCreate}
            className={cn(
              "btn-primary inline-flex items-center gap-1.5 px-4 h-9 text-[13px] font-semibold transition-all",
              !canCreate && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
            aria-disabled={!canCreate}
          >
            <Plus className="w-3.5 h-3.5" />
            Créer l&apos;{singular}
          </button>
        </div>
      </div>
    </div>
  );
}
