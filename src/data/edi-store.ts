// Reactive store for the global EDI connection.
//
// EDI is a *channel*, not a company: one credential set covers all compatible
// companies at once (spec §1.1). So it lives in its own store — never mixed
// into the per-company extranet list — and a single bad credential breaks every
// EDI company at once, which the "error" state has to surface.

import { useSyncExternalStore } from "react";

/** The EDI channel is EDIconnexion ("le France Connect de l'assurance") — a
 *  single gateway, not a list of providers. */
export const EDI_BRAND = "EDIconnexion";

export type EdiState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "connected"; login: string }
  | { status: "error"; login: string; message: string };

let store: EdiState = { status: "idle" };
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

function getSnapshot(): EdiState {
  return store;
}

export function useEdiConnection(): EdiState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getEdiConnection(): EdiState {
  return store;
}

export function setEdiState(next: EdiState): void {
  store = next;
  notify();
}
