"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { TopBar, ViewMode } from "@/components/layout/TopBar";
import { KanbanBoard } from "@/components/quoting/KanbanBoard";
import { useCotations } from "@/data/cotations-store";
import {
  getConfiguredExtranets,
  seedConfiguredExtranets,
} from "@/data/settings-mock";

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [copied, setCopied] = useState(false);

  // Demo: populate realistic extranets (some with closed sessions) on first
  // load so the board shows the full lifecycle — Action requise included — and
  // the reactivation flow is reachable. Skipped once the broker has any of their
  // own configured, so it never clobbers real data.
  useEffect(() => {
    if (getConfiguredExtranets().length === 0) seedConfiguredExtranets();
  }, []);

  const cotations = useCotations();

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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-[#173c2d]">
            Côtez directement en envoyant vos informations de cotation à
          </span>
          <span className="text-[13px] font-medium text-panora-green">
            cotation+a7f3b2@panora.co
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0"
            aria-label="Copier l'adresse"
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
          <KanbanBoard cotations={cotations} />
        ) : (
          <div className="text-sm text-panora-text-muted text-center py-12">
            Vue tableau à venir
          </div>
        )}
      </div>
    </div>
  );
}
