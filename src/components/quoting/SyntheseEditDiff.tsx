"use client";

import { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SyntheseEdit } from "@/data/chatMock";

interface SyntheseEditDiffProps {
  edit: SyntheseEdit;
  onAccept: () => void;
  onReject: () => void;
}

/**
 * Show only the portion of the document that actually differs.
 * For most chat-driven edits we swap a single paragraph (e.g. "Argumentaire"),
 * so we extract the changed paragraph and present that.
 */
function diffParagraphs(before: string, after: string): { before: string; after: string } {
  const beforeParas = before.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const afterParas = after.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);

  // Find paragraphs in `after` that don't exist in `before`
  const beforeSet = new Set(beforeParas);
  const afterSet = new Set(afterParas);

  const changedAfter = afterParas.filter((p) => !beforeSet.has(p));
  const changedBefore = beforeParas.filter((p) => !afterSet.has(p));

  if (changedAfter.length === 0 && changedBefore.length === 0) {
    return { before, after };
  }

  return {
    before: changedBefore.join("\n\n"),
    after: changedAfter.join("\n\n"),
  };
}

export function SyntheseEditDiff({ edit, onAccept, onReject }: SyntheseEditDiffProps) {
  const [showBefore, setShowBefore] = useState(false);

  if (edit.status === "accepted") {
    return (
      <div className="rounded-lg border border-panora-green/30 bg-panora-green/5 px-3 py-2">
        <p className="text-[12px] font-medium text-panora-green flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          Modification appliquée à la synthèse.
        </p>
      </div>
    );
  }
  if (edit.status === "rejected") {
    return (
      <div className="rounded-lg border border-panora-border bg-panora-bg/40 px-3 py-2">
        <p className="text-[12px] font-medium text-panora-text-muted flex items-center gap-1.5">
          <X className="w-3.5 h-3.5" />
          Modification annulée.
        </p>
      </div>
    );
  }

  const diff = diffParagraphs(edit.before, edit.after);
  const hasBefore = diff.before.trim().length > 0;

  return (
    <div className="rounded-lg border border-panora-border bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="px-3 py-2 bg-panora-bg/40 border-b border-panora-border">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-panora-text-muted">
          Modification proposée
        </span>
      </div>
      <div className="px-3 py-2.5 bg-panora-green/5">
        <p className="text-[12px] text-panora-text leading-[18px] whitespace-pre-wrap">
          {diff.after}
        </p>
      </div>
      {hasBefore && (
        <button
          onClick={() => setShowBefore((v) => !v)}
          className="w-full flex items-center justify-center gap-1 px-3 py-1.5 border-t border-panora-border text-[11px] font-medium text-panora-text-muted hover:text-panora-text hover:bg-panora-bg transition-colors"
        >
          <ChevronDown className={cn("w-3 h-3 transition-transform", showBefore && "rotate-180")} />
          {showBefore ? "Masquer la version actuelle" : "Voir la version actuelle"}
        </button>
      )}
      {showBefore && hasBefore && (
        <div className="px-3 py-2.5 border-t border-panora-border bg-panora-bg/30">
          <p className="text-[12px] text-panora-text-muted leading-[18px] line-through decoration-[#952617]/40 whitespace-pre-wrap">
            {diff.before}
          </p>
        </div>
      )}
      <div className="px-3 py-2 border-t border-panora-border flex items-center justify-end gap-1.5">
        <button
          onClick={onReject}
          className="inline-flex items-center gap-1 px-2.5 h-[26px] rounded-md text-[12px] font-medium text-panora-text-secondary hover:bg-panora-bg transition-colors"
        >
          <X className="w-3 h-3" />
          Annuler
        </button>
        <button
          onClick={onAccept}
          className="inline-flex items-center gap-1 px-2.5 h-[26px] rounded-md text-[12px] font-semibold bg-panora-green text-white hover:opacity-90"
        >
          <Check className="w-3 h-3" />
          Garder
        </button>
      </div>
    </div>
  );
}
