"use client";

import { Check, X } from "lucide-react";
import type { InsurerData } from "@/data/mock";
import type { ProposedRowAddition } from "@/data/chatMock";

interface ProposedRowCardProps {
  proposal: ProposedRowAddition;
  insurers: InsurerData[];
  onAccept: () => void;
  onReject: () => void;
}

/**
 * Artifact card rendered in chat when the agent proposes adding a new row to
 * the comparison. Shares the visual language of DocDraftCard — same shell,
 * left gradient glyph, content column — but adapted for the row-addition
 * intent: stacked accept/reject actions on the right, row label as the
 * "filename", section path as the caption.
 */
export function ProposedRowCard({
  proposal,
  insurers: _insurers,
  onAccept,
  onReject,
}: ProposedRowCardProps) {
  if (proposal.status === "accepted") {
    return (
      <p className="text-[12px] font-medium text-panora-green flex items-center gap-1.5">
        <Check className="w-3.5 h-3.5" />
        Ligne ajoutée au comparatif.
      </p>
    );
  }
  if (proposal.status === "rejected") {
    return (
      <p className="text-[12px] font-medium text-panora-text-muted flex items-center gap-1.5">
        <X className="w-3.5 h-3.5" />
        Proposition annulée.
      </p>
    );
  }

  return (
    <div className="flex items-stretch w-full max-w-[397px] bg-white border border-panora-border rounded-lg shadow-xs overflow-hidden">
      {/* Left glyph — paper-tab framing matches DocDraftCard, green tile signals "row" */}
      <div className="flex flex-col items-stretch justify-end shrink-0 pb-px pt-2.5 px-3.5">
        <div className="flex items-center justify-center p-3 rounded-tl-[6px] rounded-tr-[8px] border-l border-r border-t border-panora-border bg-gradient-to-b from-transparent to-panora-bg shadow-xs w-[36px]">
          <RowAddGlyph />
        </div>
      </div>

      {/* Label + section path */}
      <div className="flex-1 min-w-0 flex items-center gap-2 pl-2.5 pr-2 py-2.5">
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="text-[13px] font-medium leading-5 text-panora-text truncate">
            {proposal.row.label}
          </p>
          <p className="text-[12px] leading-4 text-panora-text-muted truncate">
            Ajout dans {proposal.sectionPath.sectionTitle}
            {proposal.isReferenceMatch && " · Référence catalogue"}
          </p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={onAccept}
            className="flex items-center justify-center w-6 h-6 rounded-[6px] bg-panora-green text-white hover:opacity-90 transition-opacity"
            aria-label="Garder la ligne"
            title="Garder"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex items-center justify-center w-6 h-6 rounded-[6px] border border-panora-border bg-white text-panora-text-muted hover:bg-panora-bg hover:text-panora-text transition-colors"
            aria-label="Annuler la proposition"
            title="Annuler"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Small mark evoking "new row" — three stacked guideline rows with a green
 * leading dot on the top one (the row being added). Same scale and viewBox as
 * the DocDraftCard glyphs so the two artifacts feel like a set.
 */
function RowAddGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#00a272" />
      <circle cx="4" cy="5.2" r="1.1" fill="#ffffff" />
      <rect x="6.2" y="4.6" width="6.5" height="1.2" rx="0.4" fill="#ffffff" />
      <rect x="3" y="8" width="10" height="1" rx="0.4" fill="#ffffff" opacity="0.55" />
      <rect x="3" y="10.6" width="10" height="1" rx="0.4" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}
