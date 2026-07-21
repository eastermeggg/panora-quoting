// Feature-tour tracking for feature-level onboarding.
//
// The tour (an explanatory video modal) plays over the list while a freshly
// created analysis/comparison processes in the background — but only for a
// user's FIRST few uses of each feature (not a strict one-time thing). We track
// a per-feature launch count in localStorage and show the tour while the count
// is below FEATURE_TOUR_MAX. Onboarding is USER-LEVEL (per browser here).

import { useSyncExternalStore } from "react";

export type FeatureId = "analyse" | "comparaison" | "cotation";

/** Show the feature tour for the first N launches of each feature. */
export const FEATURE_TOUR_MAX = 3;

const COUNT_KEY = "panora_feature_tour_counts";

let counts: Record<string, number> = {};
let hydrated = false;
const EMPTY: Record<string, number> = {};

const subscribers = new Set<() => void>();

function notify(): void {
  subscribers.forEach((fn) => fn());
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(COUNT_KEY);
    if (raw) counts = JSON.parse(raw) as Record<string, number>;
  } catch {
    /* ignore malformed storage */
  }
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COUNT_KEY, JSON.stringify(counts));
  } catch {
    /* storage may be unavailable */
  }
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

function getSnapshot(): Record<string, number> {
  hydrate();
  return counts;
}

function getServerSnapshot(): Record<string, number> {
  return EMPTY;
}

/** How many times this user has launched (and been toured on) a feature. */
export function getFeatureTourCount(feature: FeatureId): number {
  hydrate();
  return counts[feature] ?? 0;
}

/** Should the tour still play for this feature (first FEATURE_TOUR_MAX uses)? */
export function shouldShowFeatureTour(feature: FeatureId): boolean {
  return getFeatureTourCount(feature) < FEATURE_TOUR_MAX;
}

/** Record a launch that showed the tour (increments the count). */
export function recordFeatureTour(feature: FeatureId): void {
  hydrate();
  counts = { ...counts, [feature]: (counts[feature] ?? 0) + 1 };
  persist();
  notify();
}

/** Reactive count — for UI that wants to reflect remaining tours live. */
export function useFeatureTourCount(feature: FeatureId): number {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return snap[feature] ?? 0;
}

/** Clear all tour counts — for demos / QA (replay onboarding). */
export function resetFeatureOnboarding(): void {
  counts = {};
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(COUNT_KEY);
    } catch {
      /* ignore */
    }
  }
  notify();
}
