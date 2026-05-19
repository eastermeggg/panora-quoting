// Thin ERP adapter layer.
//
// Only the visible vocabulary changes from one ERP to another in this proto —
// container noun ("étude" / "opportunité" / "affaire"), status labels, the
// container-creation form, and the data path catalog. Component structure
// stays the same. Add a new ERP by appending an entry to `erpAdapters` and
// wiring it to a connection in `integrations-mock`.

import { currentConnections } from "@/data/integrations-mock";

/** Status keys live on `VeosContract.status` and other future container types. */
export type ErpContainerStatus =
  | "active"
  | "renewal"
  | "expired"
  | "etude"
  // Placeholder values reserved for future ERPs.
  | "pipeline"
  | "closed";

export type ErpAdapter = {
  id: string;
  /** Display name — used in headers, buttons, toast copy. */
  name: string;
  /** Container = the parent record the cotation lands in. */
  container: {
    /** Lowercase noun, e.g. "étude". Used mid-sentence. */
    singular: string;
    /** Lowercase plural, e.g. "études". */
    plural: string;
    /** Capitalised singular, e.g. "Étude". Used at sentence start. */
    Singular: string;
    /** Capitalised plural, e.g. "Études". */
    Plural: string;
    /** Reference prefix for auto-generated container numbers. */
    numberPrefix: string;
    /** Field labels for the 3-field inline create form. */
    formLabels: {
      title: string;
      number: string;
      product: string;
    };
    /** Status -> human label, for badges in the contract picker. */
    statuses: Partial<Record<ErpContainerStatus, string>>;
  };
  /** Per-line entity (one row per insurer inside the container). null if not applicable. */
  childEntity: {
    singular: string;
    plural: string;
  } | null;
};

const veosAdapter: ErpAdapter = {
  id: "veos",
  name: "VEOS",
  container: {
    singular: "étude",
    plural: "études",
    Singular: "Étude",
    Plural: "Études",
    numberPrefix: "ETU",
    formLabels: {
      title: "Titre",
      number: "Numéro",
      product: "Type (produit)",
    },
    statuses: {
      active: "Active",
      renewal: "À renouveler",
      expired: "Échue",
      etude: "Étude",
    },
  },
  childEntity: {
    singular: "ligne compagnie",
    plural: "lignes compagnies",
  },
};

// Stub — wired the day Excalibur becomes a real integration. Vocabulary based
// on the Excalibur docs the team shared, refine when the contract is signed.
const excaliburAdapter: ErpAdapter = {
  id: "excalibur",
  name: "Excalibur",
  container: {
    singular: "opportunité",
    plural: "opportunités",
    Singular: "Opportunité",
    Plural: "Opportunités",
    numberPrefix: "OPP",
    formLabels: {
      title: "Nom",
      number: "Référence",
      product: "Branche",
    },
    statuses: {
      active: "Active",
      pipeline: "En pipeline",
      closed: "Clôturée",
    },
  },
  childEntity: {
    singular: "ligne offre",
    plural: "lignes offres",
  },
};

export const erpAdapters: Record<string, ErpAdapter> = {
  veos: veosAdapter,
  excalibur: excaliburAdapter,
};

/**
 * Returns the adapter for the currently-active ERP. The proto assumes a
 * single connected ERP at a time — for multi-ERP, take an `integrationId`
 * argument here instead.
 */
export function getActiveErpAdapter(): ErpAdapter {
  const connected = currentConnections.find((c) => c.status === "connected");
  return erpAdapters[connected?.integrationId ?? "veos"] ?? veosAdapter;
}
