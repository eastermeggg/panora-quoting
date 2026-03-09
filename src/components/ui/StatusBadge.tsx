"use client";

import { cn } from "@/lib/utils";

type Status = "completed" | "action_required" | "in_progress" | "error";

const statusConfig: Record<Status, { label: string; className: string }> = {
  completed: {
    label: "Terminé",
    className: "bg-gray-700 text-white",
  },
  action_required: {
    label: "Action requise",
    className: "bg-panora-green text-white",
  },
  in_progress: {
    label: "En cours",
    className: "bg-gray-400 text-white",
  },
  error: {
    label: "Erreur",
    className: "bg-panora-error text-white",
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
