// Reactive store for the products the broker quotes regularly.
//
// This is a broker-profile concept, distinct from the per-extranet
// selectedProducts (which say what a given insurer credential covers). The
// Portails onboarding step (§3) separates this "Produits" block from the
// "Extranets" credentials block, and the same store is the home for it in-app.

import { useSyncExternalStore } from "react";
import type { InsuranceProduct } from "./settings-mock";

let store: InsuranceProduct[] = [];
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

function getSnapshot(): InsuranceProduct[] {
  return store;
}

export function useQuotedProducts(): InsuranceProduct[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getQuotedProducts(): InsuranceProduct[] {
  return store;
}

export function addQuotedProduct(product: InsuranceProduct): void {
  if (store.includes(product)) return;
  store = [...store, product];
  notify();
}

export function removeQuotedProduct(product: InsuranceProduct): void {
  store = store.filter((p) => p !== product);
  notify();
}

// ── Custom product requests (feedback loop to the team) ──
// Products that aren't in the catalog yet. Requesting one signals demand to the
// team; it carries the insurers that offer it and any extra context, and is
// tracked separately from the catalog selection.

export type RequestedProduct = {
  name: string;
  /** Free-text list of insurers that offer this product. */
  assureurs?: string;
  /** Any extra context for the team. */
  details?: string;
};

let requestedStore: RequestedProduct[] = [];

function getRequestedSnapshot(): RequestedProduct[] {
  return requestedStore;
}

export function useRequestedProducts(): RequestedProduct[] {
  return useSyncExternalStore(subscribe, getRequestedSnapshot, getRequestedSnapshot);
}

export function requestCustomProduct(req: RequestedProduct): void {
  const name = req.name.trim();
  if (!name) return;
  if (requestedStore.some((r) => r.name.toLowerCase() === name.toLowerCase()))
    return;
  requestedStore = [...requestedStore, { ...req, name }];
  notify();
}

export function removeRequestedProduct(name: string): void {
  requestedStore = requestedStore.filter((r) => r.name !== name);
  notify();
}
