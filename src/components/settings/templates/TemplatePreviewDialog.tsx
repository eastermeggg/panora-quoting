"use client";

import { useEffect, useRef, useState } from "react";
import { X, Trash2, Pencil, Check } from "lucide-react";
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

interface TemplatePreviewDialogProps {
  template: DocumentTemplate;
  onClose: () => void;
  onChange: (next: DocumentTemplate) => void;
  onDelete: () => void;
  /** When true, focuses the name field on mount — used for the just-uploaded flow */
  startInRename?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function TemplatePreviewDialog({
  template,
  onClose,
  onChange,
  onDelete,
  startInRename = false,
}: TemplatePreviewDialogProps) {
  const [renaming, setRenaming] = useState(startInRename);
  const [draftName, setDraftName] = useState(template.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftName(template.name);
  }, [template.name]);

  useEffect(() => {
    if (renaming && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [renaming]);

  function commitName() {
    const next = draftName.trim();
    if (next && next !== template.name) {
      updateTemplateMock(template.id, { name: next });
      onChange({ ...template, name: next });
    } else {
      setDraftName(template.name);
    }
    setRenaming(false);
  }

  function updateProducts(products: string[]) {
    updateTemplateMock(template.id, { products });
    onChange({ ...template, products });
  }

  function updateType(type: string | undefined) {
    updateTemplateMock(template.id, { type });
    onChange({ ...template, type });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.16)] w-full max-w-[680px] mx-4 flex flex-col max-h-[88vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-panora-border flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            {renaming ? (
              <input
                ref={nameInputRef}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitName();
                  }
                  if (e.key === "Escape") {
                    setDraftName(template.name);
                    setRenaming(false);
                  }
                }}
                className="text-[15px] font-semibold text-panora-text leading-5 font-display bg-white border border-panora-green/40 rounded-md px-2 py-1 -mx-2 outline-none focus:border-panora-green w-full"
                placeholder="Nom du modèle"
              />
            ) : (
              <button
                onClick={() => setRenaming(true)}
                className="group flex items-center gap-1.5 text-left -mx-2 px-2 py-1 rounded-md hover:bg-panora-bg transition-colors"
              >
                <span className="text-[15px] font-semibold text-panora-text leading-5 font-display truncate">
                  {template.name}
                </span>
                <Pencil
                  className={cn(
                    "w-3 h-3 text-panora-text-muted shrink-0 transition-opacity",
                    "opacity-0 group-hover:opacity-100"
                  )}
                />
              </button>
            )}
            <div className="flex items-center gap-2 text-[12px] text-panora-text-muted">
              <span
                className={`inline-flex items-center h-4 px-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  FORMAT_BADGE_CLASS[template.fileFormat] ?? "bg-panora-secondary text-panora-text-secondary"
                }`}
              >
                {template.fileFormat}
              </span>
              <span>{formatBytes(template.fileSize)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-panora-border/40 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-panora-bg/30 px-6 py-6 flex items-center justify-center">
          <div
            className="w-full"
            style={{
              maxWidth: template.fileFormat === "pptx" ? "560px" : "420px",
            }}
          >
            <div
              className="w-full rounded-lg shadow-[0px_8px_24px_rgba(0,0,0,0.10),0px_2px_4px_rgba(0,0,0,0.04)] overflow-hidden border border-panora-border"
              style={{ aspectRatio: template.fileFormat === "pptx" ? 16 / 9 : 8.5 / 11 }}
            >
              <TemplateThumbnail
                variant={template.previewVariant}
                format={template.fileFormat}
                accent={template.previewAccent}
                fullPage
              />
            </div>
          </div>
        </div>

        {/* Type + product tags */}
        <div className="px-6 py-4 border-t border-panora-border bg-white flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-panora-text">Type de document</label>
              <span className="text-[11px] text-panora-text-muted">
                Proposition, synthèse, devoir de conseil… Créez le vôtre.
              </span>
            </div>
            <TypeSelect value={template.type} onChange={updateType} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-panora-text">Produits tagués</label>
              <span className="text-[11px] text-panora-text-muted">
                Détermine quand ce modèle apparaît dans l&apos;export
              </span>
            </div>
            <ProductTagSelect value={template.products} onChange={updateProducts} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-panora-border px-6 py-3 flex items-center justify-between bg-white">
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-panora-error hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer le modèle
          </button>
          <button
            onClick={onClose}
            className="btn-primary inline-flex items-center gap-2 px-4 h-[34px] text-[13px] font-semibold leading-5"
          >
            <Check className="w-3.5 h-3.5" />
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
}
