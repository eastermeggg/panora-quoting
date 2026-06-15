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

/** Companies reachable over EDI (catalog-level knowledge). insurerId matches the
 *  extranet store, so covered extranet cards can be tagged. */
export const EDI_COMPATIBLE_INSURERS: { id: string; name: string }[] = [
  { id: "axa", name: "Axa" },
  { id: "generali", name: "Generali" },
  { id: "allianz", name: "Allianz" },
];

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

/** The insurerIds currently covered by an active EDI connection (empty unless
 *  connected). Used to tag the extranet cards. */
export function getEdiCoveredInsurerIds(): Set<string> {
  if (store.status !== "connected") return new Set();
  return new Set(EDI_COMPATIBLE_INSURERS.map((c) => c.id));
}

export function useEdiCoveredInsurerIds(): Set<string> {
  const state = useEdiConnection();
  if (state.status !== "connected") return new Set();
  return new Set(EDI_COMPATIBLE_INSURERS.map((c) => c.id));
}
