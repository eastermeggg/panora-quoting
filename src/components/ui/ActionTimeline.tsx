"use client";

import { cn } from "@/lib/utils";

interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  status: "success" | "error";
}

interface ActionTimelineProps {
  actions: TimelineEntry[];
  maxVisible?: number;
  onViewAll?: () => void;
}

export function ActionTimeline({
  actions,
  maxVisible = 3,
  onViewAll,
}: ActionTimelineProps) {
  const visible = actions.slice(0, maxVisible);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-panora-text">
          Dernières actions de l&apos;agent
        </h4>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-panora-green hover:underline font-medium"
          >
            Voir tout
          </button>
        )}
      </div>
      <div className="space-y-0">
        {visible.map((action, i) => (
          <div key={i} className="flex gap-3 relative">
            {/* Line */}
            {i < visible.length - 1 && (
              <div className="absolute left-[7px] top-5 bottom-0 w-px bg-panora-border" />
            )}
            {/* Dot */}
            <div
              className={cn(
                "w-[15px] h-[15px] rounded-full mt-0.5 shrink-0 border-2",
                action.status === "success"
                  ? "bg-panora-green border-panora-green"
                  : "bg-panora-error border-panora-error"
              )}
            />
            {/* Content */}
            <div className="pb-4 min-w-0">
              <div className="flex items-center gap-2 text-xs text-panora-text-muted">
                <span>{action.date}</span>
              </div>
              <p className="text-sm font-medium text-panora-text mt-0.5">
                {action.title}
              </p>
              <p className="text-xs text-panora-text-secondary mt-0.5">
                {action.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
