"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import { cn } from "@/lib/utils";

/* Shared feature empty state — one reference structure for every assistant
 * (analyse, comparaison, cotation), after Figma 9919-19731:
 *   1. a DISCREET "team activity" banner at the very top (avatars + count +
 *      "Voir"), always secondary — never styled as a primary action;
 *   2. a single centered block: 3D illustration → action title → benefit
 *      subtext → ONE primary CTA.
 * Only the content (illustration, wording, CTA label) changes per feature. */

export type EmptyTeamActivity = {
  /** The activity phrase after "Votre équipe a déjà réalisé " (e.g. "3 analyses et 2 comparaisons"). */
  text: React.ReactNode;
  /** Colleague names — rendered as overlapping initials. */
  avatars: string[];
  /** "Voir" — drops the default "Vous" filter and shows the team's activity. */
  onSee: () => void;
};

export type FeatureEmptyStateProps = {
  illustration: string;
  title: string;
  subtitle: React.ReactNode;
  /** Single primary CTA (analyse/comparaison). Omit when using `slot`. */
  primaryCta?: string;
  onPrimary?: () => void;
  /** Inline content shown in place of the CTA — e.g. cotation's e-mail how-to
   *  (address + steps + ideal e-mail), kept in the template, not a modal. */
  slot?: React.ReactNode;
  /** Discreet top banner. Omit (or no team activity) to hide it entirely. */
  team?: EmptyTeamActivity;
};

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function FeatureEmptyState({
  illustration,
  title,
  subtitle,
  primaryCta,
  onPrimary,
  slot,
  team,
}: FeatureEmptyStateProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {team && <TeamActivityBanner {...team} />}

      {/* Central block — vertically centered when it's just the CTA; top-aligned
          and scrollable when a feature slots inline content (e.g. cotation). */}
      <div
        className={cn(
          "flex flex-1 flex-col items-center overflow-y-auto px-5 py-9",
          slot ? "justify-start gap-7" : "justify-center"
        )}
      >
        <div className="flex max-w-[576px] flex-col items-center gap-5 text-center">
          <img
            src={illustration}
            alt=""
            className="h-[124px] w-[124px] object-contain drop-shadow-[2px_5px_11px_rgba(0,0,0,0.07)]"
          />
          <div className="flex flex-col gap-1.5">
            <p className="font-display text-[15px] font-semibold leading-5 text-[#162416]">
              {title}
            </p>
            <p className="text-[13px] leading-5 text-panora-text-secondary">
              {subtitle}
            </p>
          </div>
          {!slot && primaryCta && (
            <button
              type="button"
              onClick={onPrimary}
              className="rounded-lg bg-[#ebf3ef] px-3 py-2 text-[13px] font-medium text-[#00784f] transition-colors hover:bg-[#dfeee7]"
            >
              {primaryCta}
            </button>
          )}
        </div>

        {slot && <div className="w-full max-w-[1040px]">{slot}</div>}
      </div>
    </div>
  );
}

/* The discreet team-activity strip — sits just under the filter bar. Subtle by
 * design: light surface, small type, a plain "Voir" text link. Never competes
 * with the central CTA. */
export function TeamActivityBanner({ text, avatars, onSee }: EmptyTeamActivity) {
  return (
    <div className="shrink-0 px-5 pt-3">
      <div className="flex items-center gap-3 rounded-[12px] border border-panora-border bg-panora-bg/70 px-5 py-2.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
        {avatars.length > 0 && (
          <span className="flex -space-x-2.5">
            {avatars.slice(0, 3).map((name) => (
              <span
                key={name}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-panora-green/15 text-[10px] font-semibold text-panora-green-dark"
              >
                {initials(name)}
              </span>
            ))}
          </span>
        )}
        <p className="flex-1 text-[13px] leading-5 text-panora-text-secondary">
          Votre équipe a déjà réalisé{" "}
          <span className="font-medium text-panora-text">{text}</span>
        </p>
        <button
          type="button"
          onClick={onSee}
          className="shrink-0 text-[13px] font-medium text-panora-green transition-colors hover:text-panora-green-dark"
        >
          Voir
        </button>
      </div>
    </div>
  );
}
