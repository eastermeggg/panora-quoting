// Shared client store linking the standalone broker form to the collecte state.
// localStorage-backed so a form completed in another tab syncs back, and the
// souscripteur can launch the tarification once the broker has filled it.

import { useSyncExternalStore } from "react";

export interface SouscriptionFormState {
  sent: boolean;
  completed: boolean;
  values: Record<string, string>;
}

const EMPTY: SouscriptionFormState = { sent: false, completed: false, values: {} };
const STORAGE_KEY = "panora-souscription-forms";

type FormsMap = Record<string, SouscriptionFormState>;

function readStorage(): FormsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FormsMap) : {};
  } catch {
    return {};
  }
}

// Cache starts empty and hydrates from localStorage on first subscribe — keeps
// the initial client render matching SSR, then updates post-hydration.
let cache: FormsMap = {};
let hydrated = false;
let version = 0;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
      // ignore quota / serialization errors in the demo
    }
  }
  version += 1;
  listeners.forEach((l) => l());
}

function setToken(token: string, next: SouscriptionFormState) {
  cache = { ...cache, [token]: next };
  persist();
}

export function getFormState(token: string): SouscriptionFormState {
  return cache[token] ?? EMPTY;
}

export function markFormSent(token: string) {
  setToken(token, { ...(cache[token] ?? EMPTY), sent: true });
}

export function markFormCompleted(token: string, values: Record<string, string>) {
  setToken(token, { sent: true, completed: true, values });
}

export function resetFormState(token: string) {
  if (!cache[token]) return;
  const next = { ...cache };
  delete next[token];
  cache = next;
  persist();
}

function subscribe(onChange: () => void): () => void {
  if (!hydrated && typeof window !== "undefined") {
    cache = readStorage();
    hydrated = true;
    version += 1;
  }
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = readStorage();
      version += 1;
      onChange();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

/** Reactive per-token form state. */
export function useFormState(token: string): SouscriptionFormState {
  return useSyncExternalStore(
    subscribe,
    () => getFormState(token),
    () => EMPTY
  );
}

/** Re-render on any form change (for surfaces that read many tokens, e.g. the board). */
export function useSouscriptionFormsTick(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => 0
  );
}
