"use client";

import { Sparkles, X as XIcon } from "lucide-react";

type BesoinSource = "ai" | "manual";

interface BesoinTagProps {
  value: string;
  source: BesoinSource;
  onRemove?: () => void;
  onClick?: () => void;
  /** Compact mode uses smaller padding — used inline in document views */
  compact?: boolean;
}

const SOURCE_STYLES: Record<BesoinSource, string> = {
  ai: "bg-[#ebf3ef] border-[#9dd5bb]",
  manual: "bg-white border-panora-border",
};

export function BesoinTag({ value, source, onRemove, onClick, compact }: BesoinTagProps) {
  const base = compact
    ? "min-h-[28px] px-2.5 py-1 gap-2 text-[12px]"
    : "min-h-[36px] px-3 py-2 gap-2.5 text-[13px]";

  return (
    <div
      className={`group/tag flex items-start rounded-[8px] border ${SOURCE_STYLES[source]} ${base} ${
        onClick ? "cursor-pointer hover:border-panora-green/40 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      {source === "ai" && (
        <Sparkles className="w-3.5 h-3.5 text-panora-green shrink-0 mt-[1px]" />
      )}
      <span className="text-panora-text flex-1 leading-[18px] break-words min-w-0">
        {value}
      </span>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className={`w-4 h-4 flex items-center justify-center text-panora-text-muted hover:text-panora-text transition-all shrink-0 mt-[1px] ${
            compact ? "opacity-0 group-hover/tag:opacity-100" : ""
          }`}
        >
          <XIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
