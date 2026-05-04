"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { LiveAgentTimeline } from "@/components/ui/LiveAgentTimeline";
import { VideoPlaceholder } from "@/components/ui/VideoPlaceholder";
import type { InsurerAction } from "@/data/mock";

interface AgentLivePanelProps {
  open: boolean;
  title: string;
  steps: InsurerAction[];
  onClose: () => void;
  /** When true, the timeline is shown as a static history. Defaults to true. */
  isCompleted?: boolean;
  /** When true, the video shows a LIVE indicator. */
  isLive?: boolean;
}

export function AgentLivePanel({
  open,
  title,
  steps,
  onClose,
  isCompleted = true,
  isLive = false,
}: AgentLivePanelProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-panora-border">
          <h2 className="text-[15px] font-semibold text-panora-text">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1 hover:bg-panora-bg rounded transition-colors"
          >
            <X className="w-5 h-5 text-panora-text-muted" />
          </button>
        </div>
        <div className="px-5 pt-5">
          <VideoPlaceholder isLive={isLive} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <LiveAgentTimeline allSteps={steps} isCompleted={isCompleted} />
        </div>
      </div>
    </>
  );
}
