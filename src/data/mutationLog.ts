// Local mutation log — mock audit trail of every change made to a comparison.
// Persisted in sessionStorage so it survives navigation within a single
// browser tab (page refresh clears it, which matches the proto scope).
//
// Real product would push these to a backend audit log (ACPR compliance).
// For now, this is the visible piste d'audit shown in the broker's UI.

export type MutationKind =
  | "add_row_reference" // Row added from D&O reference catalog (high confidence)
  | "add_row_free" // Row added by free creation (low confidence)
  | "remove_row" // Row removed from view + export (recoverable)
  | "override_cell" // Cell value overridden by broker
  | "verify_cell" // Cell re-extracted on demand
  | "restore_cell"; // Override reverted to extracted value

export type MutationLogEntry = {
  id: string;
  kind: MutationKind;
  /** Cotation id this mutation belongs to */
  cotParamId: string;
  /** ISO timestamp */
  timestamp: string;
  /** Short human-readable description for the audit panel */
  summary: string;
  /** Optional structured payload (e.g. cell coordinates, before/after) */
  details?: Record<string, unknown>;
};

// ─── Storage ───────────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = "panora-mutation-log";

function storageKey(cotParamId: string): string {
  return `${STORAGE_KEY_PREFIX}-${cotParamId}`;
}

function safeRead(cotParamId: string): MutationLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(storageKey(cotParamId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(cotParamId: string, entries: MutationLogEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey(cotParamId), JSON.stringify(entries));
  } catch {
    // Quota exceeded or storage unavailable — silently degrade
  }
}

// ─── Public API ────────────────────────────────────────────────────

export function logMutation(
  cotParamId: string,
  entry: Omit<MutationLogEntry, "id" | "timestamp" | "cotParamId">,
): MutationLogEntry {
  const full: MutationLogEntry = {
    id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cotParamId,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  const current = safeRead(cotParamId);
  safeWrite(cotParamId, [...current, full]);
  return full;
}

export function getMutationLog(cotParamId: string): MutationLogEntry[] {
  return safeRead(cotParamId);
}

export function clearMutationLog(cotParamId: string): void {
  safeWrite(cotParamId, []);
}

/**
 * Pop the most recent entry — used by undo flows that need to remove the
 * audit trace as well as revert the change.
 */
export function popLastMutation(
  cotParamId: string,
): MutationLogEntry | null {
  const current = safeRead(cotParamId);
  if (current.length === 0) return null;
  const last = current[current.length - 1];
  safeWrite(cotParamId, current.slice(0, -1));
  return last;
}
