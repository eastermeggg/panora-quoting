"use client";

import { ArrowDownToLine } from "lucide-react";
import type { ProposedDocDraft } from "@/data/chatMock";
import { docTypeFileLabel, suggestFileName, type GeneratedDocType } from "@/data/generatedDocsStore";

interface DocDraftCardProps {
  draft: ProposedDocDraft & { docId?: string; fileName?: string };
  clientName?: string;
  onOpenPreview?: (docId: string) => void;
  onDownload?: (docId: string, fileName: string, body: string) => void;
}

/**
 * Compact artifact card rendered in chat after the agent generates a doc.
 * Visual matches the Figma "DocArtefact" component:
 *   ┌─────────┬──────────────────────────────┬─────┐
 *   │  [icon] │  filename                    │ [↓] │
 *   │  Word   │  Doc type · subtype          │     │
 *   └─────────┴──────────────────────────────┴─────┘
 * Click the whole card → opens preview in the Présenter tab.
 * Click the download button → triggers a mock download.
 */
export function DocDraftCard({ draft, clientName, onOpenPreview, onDownload }: DocDraftCardProps) {
  const docType = (draft.docType as GeneratedDocType) ?? "autre";
  const fileName = draft.fileName ?? suggestFileName(docType, clientName ?? "Client");
  const typeLabel = docTypeFileLabel(docType);

  function handleCardClick() {
    if (!draft.docId) return;
    onOpenPreview?.(draft.docId);
  }

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (!draft.docId) return;
    onDownload?.(draft.docId, fileName, draft.body);
  }

  return (
    <button
      type="button"
      onClick={handleCardClick}
      className="group/doc flex items-stretch w-full max-w-[397px] bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden hover:border-panora-text-secondary/40 transition-colors text-left"
    >
      {/* File-type icon — gradient panel evoking a document cover */}
      <div className="flex flex-col items-stretch justify-end shrink-0 pb-px pt-2.5 px-3.5">
        <div className="flex items-center justify-center p-3 rounded-tl-[6px] rounded-tr-[8px] border-l border-r border-t border-panora-border bg-gradient-to-b from-transparent to-[#faf8f5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] w-[36px]">
          <DocTypeGlyph docType={docType} />
        </div>
      </div>

      {/* Filename + type */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 pl-2.5 pr-4 py-2.5">
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="text-[13px] font-medium leading-5 text-panora-text truncate">
            {fileName}
          </p>
          <p className="text-[12px] leading-4 text-panora-text-muted truncate">
            {typeLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center w-6 h-6 rounded-[6px] bg-panora-text hover:opacity-90 transition-opacity shrink-0"
          aria-label={`Télécharger ${fileName}`}
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </button>
  );
}

/**
 * Small colored glyph rendered inside the gradient frame on the left of the
 * artifact card. Mimics the Word/PDF/Excel brand tiles without copying them
 * verbatim — same approach as the existing FinaliserDropdown icons.
 */
function DocTypeGlyph({ docType }: { docType: GeneratedDocType }) {
  if (docType === "ppt") {
    return (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden>
        <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#D24726" />
        <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontFamily="Inter, system-ui, sans-serif" fontSize="9" fontWeight="700">P</text>
      </svg>
    );
  }
  if (docType === "lettre" || docType === "synthese_interne") {
    return (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden>
        <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#2B579A" />
        <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontFamily="Inter, system-ui, sans-serif" fontSize="9" fontWeight="700">W</text>
      </svg>
    );
  }
  if (docType === "sms") {
    return (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden>
        <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#00a272" />
        <text x="8" y="11" textAnchor="middle" fill="#fff" fontFamily="Inter, system-ui, sans-serif" fontSize="5.5" fontWeight="700">SMS</text>
      </svg>
    );
  }
  // email + autre
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden>
      <rect x="0.5" y="0.5" width="15" height="15" rx="2.5" fill="#0078D4" />
      <path d="M3 5h10v6H3z" fill="#fff" />
      <path d="M3 5l5 3.5L13 5" stroke="#0078D4" strokeWidth="1" fill="none" />
    </svg>
  );
}
