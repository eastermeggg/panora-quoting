"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { TopBar, ViewMode } from "@/components/layout/TopBar";
import { KanbanBoard } from "@/components/quoting/KanbanBoard";
import { cotationsList } from "@/data/mock";

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("cotation+a7f3b2@panora.co");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      <TopBar
        variant="dashboard"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Sticky email forward banner */}
      <div className="sticky top-0 z-10 bg-[#ebf3ef] border-b border-[#e5e7eb] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#173c2d]">
            Côtez directement en envoyant vos informations de cotation à
          </span>
          <span className="text-[13px] font-medium text-panora-green">
            cotation+a7f3b2@panora.co
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-panora-green" />
            ) : (
              <Copy className="w-4 h-4 text-[#173c2d]/50 hover:text-[#173c2d] transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {viewMode === "kanban" ? (
          <KanbanBoard cotations={cotationsList} />
        ) : (
          <div className="text-sm text-panora-text-muted text-center py-12">
            Vue table — à venir
          </div>
        )}
      </div>
    </div>
  );
}
