"use client";

import { cn } from "@/lib/utils";

type Status = "completed" | "action_required" | "in_progress" | "error";

const statusConfig: Record<Status, { label: string; className: string }> = {
  completed: {
    label: "Terminé",
    className: "bg-[#dbeee5] text-[#173c2d]",
  },
  action_required: {
    label: "Action requise",
    className: "bg-[#f2ddc1] text-panora-warning-text",
  },
  in_progress: {
    label: "En cours",
    className: "bg-panora-secondary text-panora-text-secondary",
  },
  error: {
    label: "Erreur",
    className: "bg-[#f6e1db] text-panora-error",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 h-5 rounded-full text-[12px] font-medium leading-4",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
