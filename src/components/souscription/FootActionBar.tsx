"use client";

import { cn } from "@/lib/utils";

/**
 * The single exit action lives here — a sticky bar at the foot of the artefact
 * (not the header, not the chat). Contextual and gated: one deliberate action
 * dictated by state. `status` reads on the left, the action(s) on the right.
 */
export function FootActionBar({
  status,
  children,
  className,
}: {
  status?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-panora-border bg-white px-6 py-3 flex items-center justify-between gap-4",
        className
      )}
    >
      <div className="text-[12px] text-panora-text-secondary min-w-0 truncate">
        {status}
      </div>
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );
}
