"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect } from "react";
import { X, Play, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CHANGELOG_NOTION_URL,
  latestEntry,
  type ChangelogEntry,
  type ChangelogTag,
} from "@/data/changelog";
import { MarkdownContent } from "./MarkdownContent";

const TAG_STYLE: Record<ChangelogTag, string> = {
  Nouveau: "bg-panora-green-light text-panora-green-dark",
  Amélioration: "bg-[#f1e6fb] text-[#6d28a8]",
  Correctif: "bg-panora-tag text-panora-text-secondary",
};

/* Detail modal for one changelog update (defaults to the latest). This is the
 * template for a Notion .md: Title → TL;DR + Remotion video → free-form body
 * (paragraphs, headings, images). "Voir toutes les nouveautés" → Notion. */
export function ChangelogModal({
  entry,
  onClose,
}: {
  entry?: ChangelogEntry;
  onClose: () => void;
}) {
  const item = entry ?? latestEntry();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0px_8px_32px_0px_rgba(0,0,0,0.14)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header — tag + date + close */}
        <div className="flex items-center justify-between border-b border-panora-border px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                TAG_STYLE[item.tag]
              )}
            >
              {item.tag}
            </span>
            <span className="text-[12px] text-panora-text-muted">{item.date}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-7 w-7 items-center justify-center rounded-full text-panora-text-muted transition-colors hover:bg-panora-drop hover:text-panora-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Title */}
          <h2 className="font-serif text-[22px] leading-7 tracking-[-0.3px] text-panora-text">
            {item.title}
          </h2>

          {/* TL;DR */}
          <div className="mt-4 rounded-xl border border-panora-green-border bg-panora-green-light/50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-panora-green-dark">
              TL;DR
            </p>
            <p className="mt-1 text-[13px] leading-5 text-panora-text">
              {item.tldr ?? item.description}
            </p>
          </div>

          {/* Remotion explainer video */}
          {item.video && <ChangelogVideo video={item.video} title={item.title} />}

          {/* Free-form Notion body */}
          {item.body ? (
            <div className="mt-5">
              <MarkdownContent source={item.body} />
            </div>
          ) : (
            <p className="mt-5 text-[13px] leading-[22px] text-panora-text-secondary">
              {item.description}
            </p>
          )}
        </div>

        {/* Footer — link to the full changelog on Notion */}
        <div className="border-t border-panora-border px-6 py-3.5">
          <a
            href={CHANGELOG_NOTION_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-panora-green transition-colors hover:text-panora-green-dark"
          >
            Voir toutes les nouveautés
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* The Remotion explainer slot. Plays the rendered video when a src is present;
 * otherwise shows a branded poster + play affordance (the Remotion output can
 * be dropped in later). */
function ChangelogVideo({
  video,
  title,
}: {
  video: { src?: string; poster?: string };
  title: string;
}) {
  if (video.src) {
    return (
      <video
        src={video.src}
        poster={video.poster}
        controls
        className="mt-4 aspect-video w-full rounded-xl border border-black/10 bg-[#0b2621] object-cover"
      />
    );
  }
  return (
    <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl border border-black/10 bg-[#0b2621]">
      {video.poster && (
        <img
          src={video.poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-[rgba(11,38,33,0.32)]" />
      <button
        type="button"
        aria-label={`Lire la vidéo — ${title}`}
        className="group absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm transition-colors hover:bg-white/35"
      >
        <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
      </button>
      <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        Vidéo Remotion
      </span>
    </div>
  );
}
