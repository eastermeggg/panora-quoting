// Shared UI types for the souscription surfaces.

import type { Produit } from "@/data/souscription-mock";

/** A traced manual override on a draft line (origine, valeur retenue, auteur, horodatage). */
export interface OverrideRecord {
  original: string;
  value: string;
  author: string;
  at: string; // formatted fr datetime, stamped at interaction time
  appliedToVault?: boolean;
}

/** A modification applied to a vault rule (via the rule editor or Valider action). */
export type RuleChange = Partial<{
  valeur: string;
  condition: string;
  activite: string;
  effet: string;
  status: "confirmee" | "a_valider";
  produit: Produit[] | "tous";
}>;
