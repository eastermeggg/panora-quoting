"use client";

import { useState } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type DocumentTemplate,
  updateTemplate as updateTemplateMock,
} from "@/data/templates-mock";
import { ProductTagSelect } from "./ProductTagSelect";
import { TemplateThumbnail } from "./TemplateThumbnail";
import { TypeSelect } from "./TypeSelect";

const FORMAT_BADGE_CLASS: Record<string, string> = {
  pdf: "bg-[#fdecec] text-[#952617]",
  docx: "bg-[#e9f0f9] text-[#1a3a52]",
  pptx: "bg-[#fdf1e8] text-[#cb8052]",
};

interface BatchReviewPanelProps {
  templates: DocumentTemplate[];
  onTemplatesChange: () => void;
  onRemove: (id: string) => void;
  onValidate: () => void;
}

export function BatchReviewPanel({
  templates,
  onTemplatesChange,
  onRemove,
  onValidate,
}: BatchReviewPanelProps) {
  if (templates.length === 0) return null;

  // NOTE: deliberately no `overflow-hidden` — the Type/Product dropdowns
  // inside each row are absolutely positioned and would get clipped.
  // Corner rounding is handled per-section.
  return (
    <div className="rounded-2xl border border-panora-border bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.04)] animate-[slide-up_0.2s_ease-out]">
      {/* Header */}
      <div className="rounded-t-2xl bg-panora-bg/50 border-b border-panora-border px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-panora-secondary text-[11px] font-semibold text-panora-text-secondary tabular-nums">
            {templates.length}
          </span>
          <span className="text-[13px] font-semibold text-panora-text">
            modèle{templates.length > 1 ? "s" : ""} à classer
          </span>
          <span className="text-[12px] text-panora-text-muted truncate">
            · type et produits pré-détectés
          </span>
        </div>
        <button
          onClick={onValidate}
          className="btn-primary inline-flex items-center gap-1.5 px-3 h-[28px] text-[12px] font-semibold shrink-0"
        >
          <Check className="w-3 h-3" />
          Tout valider
        </button>
      </div>

      {/* Rows */}
      <ul>
        {templates.map((t, idx) => (
          <BatchReviewRow
            key={t.id}
            template={t}
            isLast={idx === templates.length - 1}
            onTemplatesChange={onTemplatesChange}
            onRemove={() => onRemove(t.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function BatchReviewRow({
  template,
  isLast,
  onTemplatesChange,
  onRemove,
}: {
  template: DocumentTemplate;
  isLast: boolean;
  onTemplatesChange: () => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(template.name);
  const isProcessing = template.extraction.status === "processing";

  function commitName() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== template.name) {
      updateTemplateMock(template.id, { name: trimmed });
      onTemplatesChange();
    } else {
      setName(template.name);
    }
  }

  function updateType(type: string | undefined) {
    updateTemplateMock(template.id, { type });
    onTemplatesChange();
  }

  function updateProducts(products: string[]) {
    updateTemplateMock(template.id, { products });
    onTemplatesChange();
  }

  return (
    <li
      className={cn(
        "flex items-start gap-4 px-5 py-5",
        !isLast && "border-b border-panora-border",
        isLast && "rounded-b-2xl"
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-[44px] h-[56px] rounded-md border border-panora-border overflow-hidden shrink-0 mt-0.5 bg-white">
        <TemplateThumbnail
          variant={template.previewVariant}
          format={template.fileFormat}
          accent={template.previewAccent}
          size="sm"
        />
        <span
          className={cn(
            "absolute bottom-0 left-0 right-0 inline-flex items-center justify-center h-3.5 text-[8px] font-bold uppercase tracking-[0.06em]",
            FORMAT_BADGE_CLASS[template.fileFormat] ?? "bg-panora-secondary text-panora-text-secondary"
          )}
        >
          {template.fileFormat}
        </span>
      </div>

      {/* Editable fields */}
      <div className="flex-1 min-w-0 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === "Escape") {
                setName(template.name);
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="flex-1 h-[32px] px-2.5 text-[13px] font-medium text-panora-text bg-white border border-panora-border rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)] outline-none focus:border-panora-green/40 transition-colors"
            placeholder="Nom du modèle"
          />
          {isProcessing && (
            <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded-full bg-panora-secondary text-[10px] font-medium text-panora-text-muted shrink-0">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              Analyse
            </span>
          )}
        </div>
        <div className="flex items-stretch gap-2 flex-wrap">
          <div className="w-[180px]">
            <TypeSelect variant="compact" value={template.type} onChange={updateType} />
          </div>
          <div className="flex-1 min-w-[260px]">
            <ProductTagSelect
              variant="compact"
              value={template.products}
              onChange={updateProducts}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="w-7 h-7 inline-flex items-center justify-center rounded-md text-panora-text-muted hover:text-panora-error hover:bg-panora-error-bg shrink-0 mt-1 transition-colors"
        title="Retirer ce modèle"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}
