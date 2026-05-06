"use client";

import { cn } from "@/lib/utils";
import type { FileFormat, PreviewVariant } from "@/data/templates-mock";

interface TemplateThumbnailProps {
  variant?: PreviewVariant;
  format: FileFormat;
  accent?: string;
  /** Render scale — driven by container size; the inner page scales accordingly */
  size?: "sm" | "md" | "lg";
  /** When true, the preview content fills the container (no surrounding "desk" background) */
  fullPage?: boolean;
  className?: string;
}

/**
 * Stylized "first page" preview of a template.
 * Renders a miniature document with placeholder content blocks
 * (no real text) so a grid of thumbnails feels like a doc gallery.
 */
export function TemplateThumbnail({
  variant = "default",
  format,
  accent = "#1a3a52",
  size = "md",
  fullPage = false,
  className,
}: TemplateThumbnailProps) {
  const isPptx = format === "pptx";

  if (fullPage) {
    return (
      <div className={cn("relative w-full h-full bg-white overflow-hidden", className)}>
        <PreviewContent variant={variant} accent={accent} isPptx={isPptx} />
      </div>
    );
  }

  // Page aspect ratios: PPTX → 16:9 (landscape slide), PDF/DOCX → 8.5:11 portrait
  const pageAspect = isPptx ? 16 / 9 : 8.5 / 11;

  // Page width as a fraction of the thumbnail container — tuned to look good in a 240px card
  const widthByVariant: Record<NonNullable<PreviewVariant>, number> = {
    proposal: 0.62,
    synthesis: 0.62,
    presentation: 0.92,
    legal: 0.62,
    fleet: 0.62,
    sante: 0.62,
    default: 0.62,
  };
  const widthFraction = widthByVariant[variant] ?? 0.62;

  const sizeScale = size === "sm" ? 0.78 : size === "lg" ? 1.12 : 1;

  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Soft surface behind the page */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f5] to-[#eae7e0]" />

      {/* Page */}
      <div
        className="relative bg-white shadow-[0px_2px_6px_rgba(0,0,0,0.08),0px_1px_2px_rgba(0,0,0,0.04)] overflow-hidden"
        style={{
          width: `${Math.round(widthFraction * 100 * sizeScale)}%`,
          aspectRatio: pageAspect,
          borderRadius: 2,
        }}
      >
        <PreviewContent variant={variant} accent={accent} isPptx={isPptx} />
      </div>
    </div>
  );
}

function PreviewContent({
  variant,
  accent,
  isPptx,
}: {
  variant: PreviewVariant;
  accent: string;
  isPptx: boolean;
}) {
  switch (variant) {
    case "proposal":
      return <ProposalPreview accent={accent} />;
    case "synthesis":
      return <SynthesisPreview accent={accent} />;
    case "presentation":
      return <PresentationPreview accent={accent} />;
    case "legal":
      return <LegalPreview accent={accent} />;
    case "fleet":
      return <FleetPreview accent={accent} />;
    case "sante":
      return <SantePreview accent={accent} />;
    default:
      return isPptx ? <PresentationPreview accent={accent} /> : <DefaultPreview accent={accent} />;
  }
}

// ── Variants ─────────────────────────────────────────────────────────

function ProposalPreview({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="h-[6%] w-full" style={{ backgroundColor: accent }} />
      <div className="px-[10%] pt-[10%] flex flex-col gap-[3%]">
        <div className="flex justify-between">
          <div className="w-[28%] h-[4px] rounded" style={{ backgroundColor: accent, opacity: 0.85 }} />
          <div className="w-[14%] h-[4px] rounded bg-panora-text/20" />
        </div>
        <div className="mt-[8%]">
          <div className="w-[78%] h-[7px] rounded bg-panora-text/85 mb-[3%]" />
          <div className="w-[58%] h-[7px] rounded bg-panora-text/85" />
        </div>
        <div className="mt-[10%] flex flex-col gap-[5px]">
          {[92, 86, 90, 78, 84, 70].map((w, i) => (
            <div key={i} className="h-[3px] rounded bg-panora-text/25" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-[8%] left-[10%] right-[10%] flex items-end justify-between">
        <div className="w-[40%] h-[3px] rounded bg-panora-text/40" />
        <div className="w-[18%] h-[3px] rounded bg-panora-text/30" />
      </div>
    </div>
  );
}

function SynthesisPreview({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 flex flex-col px-[10%] py-[12%]">
      <div className="w-[58%] h-[7px] rounded mb-[3%]" style={{ backgroundColor: accent }} />
      <div className="w-[42%] h-[3px] rounded bg-panora-text/40 mb-[8%]" />

      {/* Mini comparative table */}
      <div className="border border-panora-text/15 rounded-[2px] overflow-hidden">
        <div className="flex h-[10px] border-b border-panora-text/15" style={{ backgroundColor: `${accent}15` }}>
          <div className="flex-1 px-[6%] flex items-center">
            <div className="w-[55%] h-[2px] rounded bg-panora-text/40" />
          </div>
          <div className="flex-1 px-[6%] flex items-center border-l border-panora-text/15">
            <div className="w-[55%] h-[2px] rounded bg-panora-text/40" />
          </div>
          <div className="flex-1 px-[6%] flex items-center border-l border-panora-text/15">
            <div className="w-[55%] h-[2px] rounded bg-panora-text/40" />
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex h-[10px] border-b border-panora-text/10 last:border-b-0"
          >
            <div className="flex-1 px-[6%] flex items-center">
              <div className="w-[70%] h-[2px] rounded bg-panora-text/30" />
            </div>
            <div className="flex-1 px-[6%] flex items-center border-l border-panora-text/10">
              <div
                className="w-[40%] h-[2px] rounded"
                style={{ backgroundColor: i === 0 ? accent : "rgba(34,32,26,0.30)" }}
              />
            </div>
            <div className="flex-1 px-[6%] flex items-center border-l border-panora-text/10">
              <div className="w-[55%] h-[2px] rounded bg-panora-text/25" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[8%] flex flex-col gap-[4px]">
        {[
          { dot: true, w: 78 },
          { dot: true, w: 64 },
          { dot: true, w: 70 },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-[6%]">
            <div className="w-[3px] h-[3px] rounded-full bg-panora-text/40" />
            <div className="h-[2px] rounded bg-panora-text/30" style={{ width: `${row.w}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PresentationPreview({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ backgroundColor: accent }}>
      <div className="absolute top-[10%] left-[8%] flex items-center gap-[3%]">
        <div className="w-[8px] h-[8px] rounded-full bg-white" />
        <div className="w-[20px] h-[3px] rounded bg-white/80" />
      </div>
      <div className="flex-1 flex flex-col items-start justify-center px-[8%] gap-[4%]">
        <div className="w-[78%] h-[10px] rounded bg-white" />
        <div className="w-[55%] h-[10px] rounded bg-white" />
        <div className="mt-[6%] flex flex-col gap-[3px]">
          <div className="w-[120px] h-[2px] rounded bg-white/40" />
          <div className="w-[80px] h-[2px] rounded bg-white/40" />
        </div>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-[8%] bg-white/10" />
    </div>
  );
}

function LegalPreview({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 flex flex-col px-[10%] py-[10%]">
      <div className="flex items-center justify-between mb-[6%]">
        <div className="flex flex-col gap-[2px]">
          <div className="w-[70px] h-[3px] rounded" style={{ backgroundColor: accent }} />
          <div className="w-[55px] h-[2px] rounded bg-panora-text/30" />
        </div>
        <div className="w-[36px] h-[36px] rounded-full border-[1.5px] border-panora-text/30 flex items-center justify-center">
          <div className="w-[20px] h-[20px] rounded-full border border-panora-text/30" />
        </div>
      </div>
      <div className="w-[68%] h-[6px] rounded mb-[4%]" style={{ backgroundColor: accent }} />
      <div className="w-[40%] h-[2px] rounded bg-panora-text/40 mb-[8%]" />
      <div className="flex flex-col gap-[3px]">
        {[94, 88, 92, 80, 90, 84, 78, 86].map((w, i) => (
          <div key={i} className="h-[2px] rounded bg-panora-text/22" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="mt-auto flex justify-between gap-[5%]">
        <div className="flex-1 flex flex-col gap-[2px]">
          <div className="w-[60%] h-[2px] rounded bg-panora-text/35" />
          <div className="w-[80%] h-[1px] bg-panora-text/30" />
        </div>
        <div className="flex-1 flex flex-col gap-[2px]">
          <div className="w-[60%] h-[2px] rounded bg-panora-text/35" />
          <div className="w-[80%] h-[1px] bg-panora-text/30" />
        </div>
      </div>
    </div>
  );
}

function FleetPreview({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 flex flex-col px-[10%] py-[12%]">
      <div className="flex items-center gap-[4%] mb-[6%]">
        <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: accent }} />
        <div className="w-[60%] h-[6px] rounded" style={{ backgroundColor: accent }} />
      </div>
      <div className="border border-panora-text/15 rounded-[2px] overflow-hidden">
        <div className="flex h-[8px]" style={{ backgroundColor: `${accent}15` }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 border-l border-panora-text/15 first:border-l-0 px-[3px] flex items-center"
            >
              <div className="w-[55%] h-[1.5px] rounded bg-panora-text/40" />
            </div>
          ))}
        </div>
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex h-[8px] border-t border-panora-text/10">
            {[0, 1, 2, 3].map((col) => (
              <div
                key={col}
                className="flex-1 border-l border-panora-text/10 first:border-l-0 px-[3px] flex items-center"
              >
                <div
                  className="h-[1.5px] rounded"
                  style={{
                    width: `${30 + ((row + col) % 4) * 18}%`,
                    backgroundColor: col === 0 ? "rgba(34,32,26,0.30)" : "rgba(34,32,26,0.20)",
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-[6%] flex justify-end gap-[4%]">
        <div className="w-[40%] h-[3px] rounded bg-panora-text/30" />
      </div>
    </div>
  );
}

function SantePreview({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 flex flex-col px-[10%] py-[12%]">
      <div className="w-[64%] h-[7px] rounded mb-[3%]" style={{ backgroundColor: accent }} />
      <div className="w-[36%] h-[2.5px] rounded bg-panora-text/35 mb-[8%]" />

      <div className="grid grid-cols-2 gap-[6%]">
        <Block />
        <Block />
        <Block />
        <Block />
      </div>

      <div className="mt-auto flex flex-col gap-[3px]">
        {[88, 70, 80].map((w, i) => (
          <div key={i} className="h-[2px] rounded bg-panora-text/22" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function Block() {
  return (
    <div className="border border-panora-text/15 rounded-[2px] p-[6%] flex flex-col gap-[3px]">
      <div className="w-[55%] h-[2px] rounded bg-panora-text/35" />
      <div className="w-[80%] h-[2px] rounded bg-panora-text/22" />
      <div className="w-[40%] h-[2px] rounded bg-panora-text/22" />
    </div>
  );
}

function DefaultPreview({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 flex flex-col px-[10%] py-[12%]">
      <div className="w-[60%] h-[6px] rounded mb-[4%]" style={{ backgroundColor: accent }} />
      <div className="w-[40%] h-[2.5px] rounded bg-panora-text/35 mb-[8%]" />
      <div className="flex flex-col gap-[4px]">
        {[92, 88, 80, 86, 70, 84, 78, 90].map((w, i) => (
          <div key={i} className="h-[2px] rounded bg-panora-text/22" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
