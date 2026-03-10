"use client";

import { ArrowLeft, FileText, X, ChevronUp, ChevronDown, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ViewMode = "kanban" | "table";

interface TopBarProps {
  variant: "empty" | "preparation" | "followup" | "dashboard";
  cotationId?: string;
  title?: string;
  onClose?: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export function TopBar({ variant, cotationId, title, onClose, viewMode, onViewModeChange }: TopBarProps) {
  if (variant === "empty" || variant === "dashboard") {
    return (
      <div className="h-14 border-b border-panora-border bg-panora-bg flex items-center px-6">
        <h1 className="text-sm font-semibold text-panora-text">
          Assistant cotation
        </h1>
        {variant === "dashboard" && onViewModeChange && (
          <>
            <div className="flex-1" />
            <div className="flex items-center bg-panora-card border border-panora-border rounded-lg p-0.5">
              <button
                onClick={() => onViewModeChange("kanban")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  viewMode === "kanban"
                    ? "bg-panora-bg text-panora-text shadow-sm"
                    : "text-panora-text-muted hover:text-panora-text-secondary"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Kanban
              </button>
              <button
                onClick={() => onViewModeChange("table")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  viewMode === "table"
                    ? "bg-panora-bg text-panora-text shadow-sm"
                    : "text-panora-text-muted hover:text-panora-text-secondary"
                )}
              >
                <List className="w-3.5 h-3.5" />
                Table
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="h-14 border-b border-panora-border bg-panora-bg flex items-center px-4 gap-3">
      <Link
        href="/quoting"
        className="flex items-center gap-1 text-sm text-panora-text-secondary hover:text-panora-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour</span>
      </Link>

      <div className="w-px h-5 bg-panora-border" />

      <FileText className="w-4 h-4 text-panora-green" />

      <span className="text-sm font-medium text-panora-text">
        {variant === "preparation" ? "Nouvelle cotation" : "Nom cotation"}{" "}
        {cotationId || "COT-XXX"}
      </span>

      {title && (
        <>
          <div className="w-px h-5 bg-panora-border" />
          <span className="text-sm text-panora-text-secondary">{title}</span>
        </>
      )}

      <div className="flex-1" />

      {variant === "followup" && (
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-panora-sidebar rounded transition-colors">
            <ChevronUp className="w-4 h-4 text-panora-text-muted" />
          </button>
          <button className="p-1 hover:bg-panora-sidebar rounded transition-colors">
            <ChevronDown className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>
      )}

      <Link
        href="/quoting"
        className={cn(
          "p-1 hover:bg-panora-sidebar rounded transition-colors",
          "text-panora-text-muted hover:text-panora-text"
        )}
      >
        <X className="w-4 h-4" />
      </Link>
    </div>
  );
}
