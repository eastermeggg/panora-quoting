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
