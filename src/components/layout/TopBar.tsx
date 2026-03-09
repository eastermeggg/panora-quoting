"use client";

import { ArrowLeft, FileText, X, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopBarProps {
  variant: "empty" | "preparation" | "followup";
  cotationId?: string;
  title?: string;
  onClose?: () => void;
}

export function TopBar({ variant, cotationId, title, onClose }: TopBarProps) {
  if (variant === "empty") {
    return (
      <div className="h-14 border-b border-panora-border bg-panora-card flex items-center px-6">
        <h1 className="text-sm font-semibold text-panora-text">
          Assistant cotation
        </h1>
      </div>
    );
  }

  return (
    <div className="h-14 border-b border-panora-border bg-panora-card flex items-center px-4 gap-3">
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
        {variant === "preparation" ? "Nouvelle cotation" : ""}{" "}
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
