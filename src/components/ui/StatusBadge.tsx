"use client";

import { cn } from "@/lib/utils";

type Status = "completed" | "action_required" | "in_progress" | "error";

const statusConfig: Record<Status, { label: string; className: string }> = {
  completed: {
    label: "Terminé",
    className: "border border-panora-green/40 bg-panora-green-light text-panora-green",
  },
  action_required: {
    label: "Action requise",
    className: "border border-panora-warning/40 bg-panora-warning-bg text-panora-warning",
  },
  in_progress: {
    label: "En cours",
    className: "border border-panora-border bg-panora-drop text-panora-text-secondary",
  },
  error: {
    label: "Erreur",
    className: "border border-panora-error/40 bg-panora-error-bg text-panora-error",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
