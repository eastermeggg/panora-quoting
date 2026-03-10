"use client";

import { useState } from "react";
import { Copy, Check, Mail } from "lucide-react";
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
    <div className="flex flex-col min-h-screen">
      <TopBar
        variant="dashboard"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Sticky email forward banner */}
      <div className="sticky top-0 z-10 bg-panora-green-light border-b border-panora-green/10 px-6 py-2.5">
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-panora-green shrink-0" />
          <span className="text-sm text-panora-green font-medium">
            Cotez par e-mail
          </span>
          <span className="text-sm text-panora-text-secondary">
            Transférez un e-mail client vers
          </span>
          <span className="text-sm text-panora-green font-medium font-mono">
            cotation+a7f3b2@panora.co
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-panora-green hover:underline font-medium shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copié
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copier
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
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
