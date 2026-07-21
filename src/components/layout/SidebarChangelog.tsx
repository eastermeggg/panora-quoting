"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { latestChangelog } from "@/data/changelog";
import { ChangelogModal } from "@/components/home/ChangelogModal";

/* "Nouveautés" widget in the sidebar footer. Expanded → a compact card showing
 * the latest update; collapsed → a bell/megaphone icon with an unread dot.
 * Opens the full changelog modal. */
export function SidebarChangelog({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const latest = latestChangelog(1)[0];

  return (
    <>
      {collapsed ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Nouveautés"
          aria-label="Nouveautés"
          className="flex items-center justify-center py-0.5"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-[8px] text-panora-text-secondary hover:bg-panora-secondary hover:text-panora-text transition-colors">
            <Megaphone className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-panora-green" />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-[10px] border border-panora-border bg-panora-drop/40 p-2.5 text-left transition-colors hover:bg-white"
        >
          <div className="flex items-center gap-1.5">
            <Megaphone className="h-3.5 w-3.5 text-panora-green-dark" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-panora-green-dark">
              Nouveauté
            </span>
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-panora-green" />
          </div>
          <p className="mt-1 line-clamp-1 text-[12px] font-medium leading-4 text-panora-text">
            {latest.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-panora-text-secondary">
            {latest.description}
          </p>
        </button>
      )}

      {open && <ChangelogModal onClose={() => setOpen(false)} />}
    </>
  );
}
