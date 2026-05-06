"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentTemplate } from "@/data/templates-mock";
import { ProductTagPills } from "./ProductTagSelect";
import { TemplateThumbnail } from "./TemplateThumbnail";
import { TypePill } from "./TypeSelect";

const FORMAT_BADGE_CLASS: Record<string, string> = {
  pdf: "bg-[#fdecec] text-[#952617]",
  docx: "bg-[#e9f0f9] text-[#1a3a52]",
  pptx: "bg-[#fdf1e8] text-[#cb8052]",
};

interface TemplateCardProps {
  template: DocumentTemplate;
  onClick: () => void;
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return "Jamais utilisé";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
  return `Il y a ${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? "s" : ""}`;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const status = template.extraction.status;
  const hasNoProducts = template.products.length === 0;
  const isReady = status === "ready";

  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left bg-white border rounded-[12px] overflow-hidden flex flex-col",
        "shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)]",
        "hover:shadow-[0px_5px_9px_0px_rgba(0,0,0,0.06)] hover:-translate-y-px transition-all duration-200",
        hasNoProducts && isReady ? "border-[#cb8052]/25" : "border-panora-border"
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-[148px] border-b border-panora-border">
        <TemplateThumbnail
          variant={template.previewVariant}
          format={template.fileFormat}
          accent={template.previewAccent}
          size="md"
        />
        {/* Format — top right */}
        <span
          className={cn(
            "absolute top-2.5 right-2.5 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold uppercase tracking-wider",
            FORMAT_BADGE_CLASS[template.fileFormat] ?? "bg-panora-secondary text-panora-text-secondary"
          )}
        >
          {template.fileFormat}
        </span>
        {/* Status overlay — top left, only when not ready */}
        {status === "processing" && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 h-5 px-2 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-medium text-panora-text-secondary shadow-[0px_1px_2px_rgba(0,0,0,0.06)]">
            <Loader2 className="w-3 h-3 animate-spin" />
            Analyse
          </span>
        )}
        {status === "failed" && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 h-5 px-2 rounded-full bg-[#fdecec] text-[10px] font-medium text-[#952617] shadow-[0px_1px_2px_rgba(0,0,0,0.06)]">
            <AlertTriangle className="w-3 h-3" />
            Échec
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-4 pb-3.5 flex flex-col flex-1">
        {/* Title block — tight grouping */}
        <div className="flex flex-col gap-1.5 min-w-0">
          {template.type && isReady && <TypePill type={template.type} />}
          <span className="text-[13px] font-semibold text-panora-text leading-[18px] line-clamp-2">
            {template.name}
          </span>
        </div>

        {/* Tags / status — generous space above */}
        <div className="mt-3 min-h-[20px]">
          {isReady ? (
            hasNoProducts ? (
              <span className="text-[11px] text-[#cb8052]/85">
                À tagger pour utilisation
              </span>
            ) : (
              <ProductTagPills products={template.products} />
            )
          ) : (
            <span className="text-[11px] text-panora-text-muted">
              {status === "processing"
                ? "Lecture du modèle en cours…"
                : status === "failed"
                  ? "Impossible d'analyser ce fichier"
                  : "En attente"}
            </span>
          )}
        </div>

        {/* Meta footer — single muted line, pinned bottom */}
        <div className="mt-auto pt-3 text-[10px] text-panora-text-muted tabular-nums">
          {formatRelativeDate(template.lastUsedAt)}
        </div>
      </div>
    </button>
  );
}
