"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, PlayCircle, Sparkles, Users } from "lucide-react";

/* Systematized feature empty state — one skeleton, three zones, per-agent fill:
 *   1 · Activation   — what to do first (the hero CTA / instructions)
 *   2 · Start from the team — team work as a shortcut (examples, presets…)
 *   3 · Team proof   — quiet motivation + a jump to the Équipe scope
 * Every feature (analyse, comparaison, cotation) renders this same shape so the
 * empty states feel like one product. Zones 1–2 are slotted; Zone 3 is generic. */

export type TeamExample = {
  id: string;
  author: string;
  client: string;
  product: string | null;
  insurerIds: string[];
  /** Why it's relevant to this user (e.g. matching product). Optional. */
  relevance?: string;
};

export type FeatureEmptyStateProps = {
  // Zone 1 — activation
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  onPrimary: () => void;
  onWatch?: () => void;
  watchLabel?: string;
  /** A few quick "what this feature does" points, shown under the subtitle. */
  points?: string[];
  /** Slot for a fully custom activation body (e.g. cotation's e-mail block). */
  activationSlot?: React.ReactNode;

  // Zone 2 — the team's recent work (view, not reuse)
  teamExamples?: TeamExample[];
  onOpenExample?: (ex: TeamExample) => void;

  // Zone 3 — team proof
  teamCount?: number;
  teamAvatars?: string[];
  onSeeTeam?: () => void;
};

const INSURER_LABEL: Record<string, string> = {
  axa: "Axa",
  allianz: "Allianz",
  generali: "Generali",
  chubb: "Chubb",
  maif: "MAIF",
  alan: "Alan",
  malakoff: "Malakoff",
};

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function FeatureEmptyState(props: FeatureEmptyStateProps) {
  const {
    icon: Icon,
    eyebrow,
    title,
    subtitle,
    primaryCta,
    onPrimary,
    onWatch,
    watchLabel = "Voir comment ça marche",
    points = [],
    activationSlot,
    teamExamples = [],
    onOpenExample,
    teamCount,
    teamAvatars = [],
    onSeeTeam,
  } = props;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-6 py-10">
        {/* Zone 1 — Activation */}
        <div className="rounded-[16px] border border-panora-green-border bg-panora-green-light/50 px-6 py-7 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <Icon className="h-7 w-7 text-panora-green-dark" strokeWidth={1.6} />
          </span>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-panora-green-dark">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-serif text-[24px] leading-8 tracking-[-0.3px] text-panora-text">
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-5 text-panora-text-secondary">
            {subtitle}
          </p>

          <PointsRow points={points} />

          {activationSlot ? (
            <div className="mt-5 text-left">{activationSlot}</div>
          ) : (
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={onPrimary}
                className="btn-primary flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium"
              >
                <Sparkles className="h-4 w-4" />
                {primaryCta}
              </button>
              {onWatch && (
                <button
                  type="button"
                  onClick={onWatch}
                  className="flex items-center gap-1.5 rounded-lg border border-panora-border bg-white px-4 py-2.5 text-[13px] font-medium text-panora-text-secondary shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-panora-drop transition-colors"
                >
                  <PlayCircle className="h-4 w-4" />
                  {watchLabel}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Zone 2 — the team's recent work (view, for inspiration) */}
        {teamExamples.length > 0 && (
          <div className="rounded-[14px] border border-panora-border bg-white p-5">
            <h3 className="text-[14px] font-medium text-panora-text">
              Les dernières analyses de votre équipe
            </h3>
            <p className="mt-0.5 text-[12px] leading-4 text-panora-text-secondary">
              Analyses de contrat et comparaisons réalisées par vos collègues —
              jetez-y un œil pour vous inspirer.
            </p>

            <ul className="mt-3 flex flex-col gap-2">
              {teamExamples.map((ex) => (
                <li
                  key={ex.id}
                  className="group flex items-center gap-3 rounded-lg border border-panora-border bg-panora-drop/40 px-3.5 py-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-panora-green/15 text-[10px] font-semibold text-panora-green-dark">
                    {initials(ex.author)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-panora-text">
                      {ex.client}
                      {ex.product ? (
                        <span className="font-normal text-panora-text-secondary">
                          {" "}
                          · {ex.product}
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-[12px] leading-4 text-panora-text-secondary">
                      {ex.relevance ??
                        `Par ${ex.author}${
                          ex.insurerIds.length
                            ? " · " +
                              ex.insurerIds
                                .map((i) => INSURER_LABEL[i] ?? i)
                                .join(", ")
                            : ""
                        }`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenExample?.(ex)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-panora-border bg-white px-3 py-1.5 text-[12px] font-medium text-panora-text-secondary shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-panora-drop transition-colors"
                  >
                    Voir
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Zone 3 — Team proof (quiet, never a primary action) */}
        <TeamProofRow
          teamCount={teamCount}
          teamAvatars={teamAvatars}
          onSeeTeam={onSeeTeam}
        />
      </div>
    </div>
  );
}

/* Quick "what this feature does" line — a compact, centered check-list shown in
 * Zone 1. Keeps the activation the hero while making the feature legible. */
function PointsRow({ points }: { points: string[] }) {
  if (points.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
      {points.map((p) => (
        <span
          key={p}
          className="inline-flex items-center gap-1.5 text-[12px] text-panora-text-secondary"
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-panora-green-light">
            <Check className="h-2.5 w-2.5 text-panora-green-dark" strokeWidth={3} />
          </span>
          {p}
        </span>
      ))}
    </div>
  );
}

/* Zone 3 — the team's activity as quiet motivation + a jump to the Équipe
 * scope. Shared across every feature empty state so "what the team does" reads
 * the same everywhere and is never a primary action. */
export function TeamProofRow({
  teamCount,
  teamAvatars = [],
  onSeeTeam,
  noun = ["analyse", "analyses"],
}: {
  teamCount?: number;
  teamAvatars?: string[];
  onSeeTeam?: () => void;
  /** [singular, plural] of the artifact this feature produces. */
  noun?: [string, string];
}) {
  if (typeof teamCount !== "number" || teamCount <= 0) return null;
  return (
    <button
      type="button"
      onClick={onSeeTeam}
      className="group flex w-full items-center gap-3 rounded-[12px] border border-panora-border bg-panora-drop/50 px-5 py-3.5 text-left transition-colors hover:bg-white"
    >
      {teamAvatars.length > 0 ? (
        <span className="flex -space-x-2">
          {teamAvatars.slice(0, 4).map((name) => (
            <span
              key={name}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-panora-bg bg-panora-green/15 text-[10px] font-semibold text-panora-green-dark"
            >
              {initials(name)}
            </span>
          ))}
        </span>
      ) : (
        <Users className="h-5 w-5 text-panora-text-secondary" />
      )}
      <span className="flex-1 text-[13px] text-panora-text">
        <span className="font-medium">Votre équipe</span> a déjà réalisé{" "}
        <span className="font-medium">{teamCount}</span>{" "}
        {teamCount > 1 ? noun[1] : noun[0]} — regardez comment ils font.
      </span>
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-panora-green-dark">
        Voir toute l&apos;équipe
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}
