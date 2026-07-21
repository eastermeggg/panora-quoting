// Reactive cotations store + "stock en attente d'une session" helpers.
//
// The dashboard reads cotations through this store (not the static seed) so that
// launching the backlog of an insurer — once its daily session reopens — moves
// the matching cards from "En préparation" to "En cours" live.
//
// A "demande en attente" is a per-insurer quote request with status "pending"
// whose insurer session isn't active yet: it's been captured (usually by email)
// but can't go out until the broker reopens that portal's session. Surfacing this
// stock turns reactivation from a chore into a payoff — open the session, the
// waiting demandes fire off.

import { useSyncExternalStore } from "react";
import { cotationsList, type Cotation } from "./mock";
import type { ExtranetConfig } from "./settings-mock";

/** A pending quote request waiting on a given insurer's session to reopen. */
export type PendingDemande = {
  /** Internal cotation id (cot-3). */
  cotationId: string;
  /** Human reference (COT-2026-0145). */
  cotationRef: string;
  client: string;
  product: string;
  productIcon: Cotation["productIcon"];
  createdAt: string;
  createdVia: Cotation["createdVia"];
};

// ── Reactive store ──
// Deep-clone the seed so launching mutates the store, never the source array
// (which other mock objects still reference by index).
let store: Cotation[] = cotationsList.map((c) => ({
  ...c,
  insurers: c.insurers.map((i) => ({ ...i })),
}));

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

function getSnapshot(): Cotation[] {
  return store;
}

export function useCotations(): Cotation[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getCotations(): Cotation[] {
  return store;
}

/** Empty the list (fresh / not-set-up prototype scenario). */
export function clearCotations(): void {
  store = [];
  notify();
}

/** Restore the seeded cotations (set-up prototype scenario). */
export function resetCotations(): void {
  store = cotationsList.map((c) => ({
    ...c,
    insurers: c.insurers.map((i) => ({ ...i })),
  }));
  notify();
}

/**
 * Launch every pending demande addressed to this insurer — flips their
 * per-insurer request from "pending" to "in_progress". Called the moment the
 * insurer's session becomes active again.
 */
export function launchPendingForInsurer(insurerId: string): void {
  store = store.map((c) => ({
    ...c,
    insurers: c.insurers.map((i) =>
      i.id === insurerId && i.status === "pending"
        ? { ...i, status: "in_progress" as const }
        : i
    ),
  }));
  notify();
}

// ── Pure stock selectors ──

/** The pending demandes addressed to a single insurer. */
export function getPendingDemandesForInsurer(
  cotations: Cotation[],
  insurerId: string
): PendingDemande[] {
  return cotations
    .filter((c) =>
      c.insurers.some((i) => i.id === insurerId && i.status === "pending")
    )
    .map((c) => ({
      cotationId: c.id,
      cotationRef: c.cotationId,
      client: c.client,
      product: c.product,
      productIcon: c.productIcon,
      createdAt: c.createdAt,
      createdVia: c.createdVia,
    }));
}

/**
 * Insurers whose configured session is down and so block a pending request. EDI-
 * covered insurers are excluded — EDIconnexion manages their session globally, so
 * there's no per-insurer session to reactivate.
 */
function downInsurerSet(extranets: ExtranetConfig[]): Set<string> {
  return new Set(
    extranets
      .filter((e) => e.sessionState.status !== "active" && !e.useEdi)
      .map((e) => e.insurerId)
  );
}

/**
 * The insurers on a cotation whose request is pending AND whose session is
 * down — i.e. the ones literally waiting for a reactivation to go out. Unconfigured
 * insurers are excluded: they're a different problem (no extranet at all).
 */
export function getBlockedInsurerIds(
  cotation: Cotation,
  extranets: ExtranetConfig[]
): Set<string> {
  const downInsurerIds = downInsurerSet(extranets);
  return new Set(
    cotation.insurers
      .filter((i) => i.status === "pending" && downInsurerIds.has(i.id))
      .map((i) => i.id)
  );
}

/**
 * Total demandes waiting on a session that isn't active — counted per
 * insurer-request (a cotation pending on two down insurers counts twice, since
 * each is a distinct request that reopening a different session will release).
 */
export function getWaitingDemandeCount(
  cotations: Cotation[],
  extranets: ExtranetConfig[]
): number {
  const downInsurerIds = downInsurerSet(extranets);
  let count = 0;
  for (const c of cotations) {
    for (const i of c.insurers) {
      if (i.status === "pending" && downInsurerIds.has(i.id)) count++;
    }
  }
  return count;
}
