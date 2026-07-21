// Prototype "scenario" — makes the WHOLE interface reflect an onboarding state,
// not just the /bienvenue checklist. Driven by the ProtoStateSwitcher so a demo
// is coherent across settings, extranets, products and the feature lists:
//
//   "fresh" — not set up: no insurers connected, no products to quote, empty
//             cotations/analyses, onboarding checklist in progress.
//   "setup" — set up: insurers connected, products activated, populated lists,
//             onboarding checklist complete.
//
// Persisted in localStorage so pages reached via the sidebar (settings,
// dashboard…) — which never see the ?state param — still reflect the scenario.

import { useSyncExternalStore } from "react";
import {
  seedConfiguredExtranets,
  getConfiguredExtranets,
} from "./settings-mock";
import { setQuotedProducts, clearQuotedProducts } from "./products-store";
import { resetCotations, clearCotations } from "./cotations-store";
import {
  completeAllOnboarding,
  resetOnboardingProgress,
} from "./onboarding-store";

export type ProtoScenario = "fresh" | "setup";

const KEY = "panora_proto_scenario";

let scenario: ProtoScenario | null = null;
let hydrated = false;

const subscribers = new Set<() => void>();
function notify(): void {
  subscribers.forEach((fn) => fn());
}
function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(KEY);
  if (raw === "fresh" || raw === "setup") scenario = raw;
}

export function getProtoScenario(): ProtoScenario | null {
  hydrate();
  return scenario;
}

export function useProtoScenario(): ProtoScenario | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrate();
      return scenario;
    },
    () => null
  );
}

/** Seed or clear every store so the interface matches the scenario. */
export function applyProtoScenario(next: ProtoScenario): void {
  hydrate();
  scenario = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* storage may be unavailable */
    }
  }

  if (next === "setup") {
    seedConfiguredExtranets();
    // Products to quote = everything the connected insurers cover.
    const products = [
      ...new Set(getConfiguredExtranets().flatMap((c) => c.selectedProducts)),
    ];
    setQuotedProducts(products);
    resetCotations();
    completeAllOnboarding();
  } else {
    seedConfiguredExtranets([]); // no insurers connected
    clearQuotedProducts();
    clearCotations();
    resetOnboardingProgress();
  }

  notify();
}
