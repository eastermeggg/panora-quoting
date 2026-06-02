// D&O guarantee reference catalog — flywheel of "préférences apprises".
// Mocked in-memory for the proto. Real product would feed this from server.
//
// Used by the chat add-row flow (iteration 01): when the broker asks to add
// a guarantee, the agent fuzzy-matches the request against this catalog.
// A match → row added with high-confidence cells (reference-backed).
// No match → free creation, low-confidence cells (best effort).

import type { GuaranteeRow, CellDetail, CellValue, InsurerData } from "./mock";

export type DOReferenceEntry = {
  id: string;
  label: string;
  description: string;
  /** Hint on how to generate plausible per-insurer mock values when the row is added. */
  valueKind: "binary" | "amount_eur" | "duration";
  /** Synonyms used for fuzzy matching (lower-case, accent-stripped). */
  synonyms: string[];
};

export const DO_REFERENCE_CATALOG: DOReferenceEntry[] = [
  {
    id: "periode-decouverte",
    label: "Période de découverte (run-off)",
    description: "Durée pendant laquelle le contrat couvre les réclamations introduites après sa résiliation pour des faits antérieurs.",
    valueKind: "duration",
    synonyms: ["periode de decouverte", "run-off", "run off", "découverte", "decouverte", "post-contractuel"],
  },
  {
    id: "frais-communication-crise",
    label: "Frais de communication de crise",
    description: "Honoraires d'agences de communication ou de relations publiques engagés à la suite d'une réclamation médiatisée.",
    valueKind: "amount_eur",
    synonyms: ["communication de crise", "rp", "relations publiques", "image", "e-reputation", "e reputation"],
  },
  {
    id: "couverture-cyber-dirigeants",
    label: "Couverture cyber des dirigeants",
    description: "Protection spécifique des dirigeants en cas de manquement aux obligations de cybersécurité (RGPD, atteintes aux données).",
    valueKind: "binary",
    synonyms: ["cyber", "rgpd", "donnees", "données", "cybersecurite", "cybersécurité"],
  },
  {
    id: "responsabilite-solidaire-dirigeants",
    label: "Responsabilité solidaire entre dirigeants",
    description: "Couverture des dirigeants tenus solidairement responsables d'une faute de gestion commune.",
    valueKind: "binary",
    synonyms: ["solidaire", "solidarite", "solidarité", "responsabilite solidaire"],
  },
  {
    id: "procedure-collective",
    label: "Couverture en procédure collective",
    description: "Garantie maintenue en cas de redressement ou liquidation judiciaire de la société assurée.",
    valueKind: "binary",
    synonyms: ["procedure collective", "redressement", "liquidation", "sauvegarde"],
  },
  {
    id: "frais-expertise-externe",
    label: "Frais d'expertise externe",
    description: "Honoraires d'experts (comptables, techniques) mandatés pour préparer la défense du dirigeant.",
    valueKind: "amount_eur",
    synonyms: ["expertise", "expert", "honoraires expert"],
  },
  {
    id: "sanctions-administratives",
    label: "Sanctions administratives (ACPR / AMF)",
    description: "Couverture des frais de défense et conséquences pécuniaires des sanctions prononcées par les autorités administratives.",
    valueKind: "amount_eur",
    synonyms: ["sanctions administratives", "acpr", "amf", "autorite", "autorité"],
  },
  {
    id: "mise-en-cause-associes",
    label: "Mise en cause par les associés",
    description: "Réclamations introduites par les associés de la société assurée contre les dirigeants (actio mandati, action sociale).",
    valueKind: "binary",
    synonyms: ["associes", "associés", "actio mandati", "action sociale", "actionnaires"],
  },
  {
    id: "poursuites-disciplinaires",
    label: "Coût des poursuites disciplinaires",
    description: "Frais de défense devant les juridictions disciplinaires (ordres professionnels, instances internes).",
    valueKind: "amount_eur",
    synonyms: ["disciplinaires", "ordre", "instances internes", "poursuites disciplinaires"],
  },
  {
    id: "new-subsidiary",
    label: "Garantie « New Subsidiary »",
    description: "Extension automatique de la couverture aux nouvelles filiales acquises ou créées en cours d'année.",
    valueKind: "binary",
    synonyms: ["new subsidiary", "nouvelle filiale", "extension filiales", "subsidiary"],
  },
  {
    id: "enquete-interne",
    label: "Frais d'enquête interne",
    description: "Honoraires d'avocats engagés pour conduire une enquête interne à la demande du conseil d'administration.",
    valueKind: "amount_eur",
    synonyms: ["enquete interne", "enquête interne", "investigation interne"],
  },
  {
    id: "licenciement-abusif",
    label: "Indemnités de licenciement abusif",
    description: "Prise en charge des indemnités prononcées contre le dirigeant pour licenciement sans cause réelle et sérieuse.",
    valueKind: "amount_eur",
    synonyms: ["licenciement abusif", "licenciement", "rupture abusive"],
  },
];

// ─── Matching ──────────────────────────────────────────────────────

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .trim();
}

/**
 * Fuzzy-match a free-form broker query against the catalog.
 * Returns the best entry or null if confidence is too low.
 */
export function matchReference(query: string): DOReferenceEntry | null {
  const q = normalize(query);
  if (q.length < 3) return null;

  let bestEntry: DOReferenceEntry | null = null;
  let bestScore = 0;

  for (const entry of DO_REFERENCE_CATALOG) {
    const haystacks = [normalize(entry.label), ...entry.synonyms.map(normalize)];
    for (const h of haystacks) {
      // Substring match
      if (h.includes(q) || q.includes(h)) {
        const score = Math.min(q.length, h.length) / Math.max(q.length, h.length);
        if (score > bestScore) {
          bestScore = score;
          bestEntry = entry;
        }
      }
      // Token overlap (split on spaces, count matching tokens)
      const qTokens = q.split(/\s+/).filter((t) => t.length > 2);
      const hTokens = h.split(/\s+/).filter((t) => t.length > 2);
      const overlap = qTokens.filter((t) => hTokens.some((ht) => ht.startsWith(t) || t.startsWith(ht))).length;
      if (overlap > 0 && qTokens.length > 0) {
        const tokenScore = overlap / Math.max(qTokens.length, hTokens.length);
        if (tokenScore > bestScore) {
          bestScore = tokenScore;
          bestEntry = entry;
        }
      }
    }
  }

  // Threshold: anything below ~0.4 is too weak to claim a match.
  return bestScore >= 0.4 ? bestEntry : null;
}

// ─── Mock value generation ────────────────────────────────────────
// When a referenced row is added, generate plausible per-insurer values.
// When a free-creation row is added, leave values empty / low confidence.

const AMOUNTS_EUR = ["50 000 €", "75 000 €", "100 000 €", "150 000 €", "200 000 €"];
const DURATIONS = ["3 ans", "5 ans", "10 ans", "Illimitée"];

export function generateReferenceValues(
  entry: DOReferenceEntry,
  insurers: InsurerData[],
): { values: Record<string, CellValue>; details: Record<string, CellDetail> } {
  const values: Record<string, CellValue> = {};
  const details: Record<string, CellDetail> = {};

  insurers.forEach((ins, idx) => {
    let value: CellValue;
    let mainLimit: string | undefined;

    if (entry.valueKind === "binary") {
      // 80% chance of "check", 20% "cross" — biased toward covered for D&O
      value = Math.random() < 0.8 ? { type: "check" } : { type: "cross" };
    } else if (entry.valueKind === "amount_eur") {
      const amt = AMOUNTS_EUR[(idx + Math.floor(Math.random() * AMOUNTS_EUR.length)) % AMOUNTS_EUR.length];
      value = { type: "text", value: amt };
      mainLimit = amt;
    } else {
      const dur = DURATIONS[(idx + Math.floor(Math.random() * DURATIONS.length)) % DURATIONS.length];
      value = { type: "text", value: dur };
    }

    values[ins.id] = value;
    details[ins.id] = {
      title: entry.label,
      covered: value.type !== "cross" && value.type !== "empty",
      insurerId: ins.id,
      insurerName: ins.name,
      description: entry.description,
      cellType: "guarantee",
      state: "extracted",
      mainLimit,
    };
  });

  return { values, details };
}

export function generateFreeValues(
  label: string,
  description: string,
  insurers: InsurerData[],
): { values: Record<string, CellValue>; details: Record<string, CellDetail> } {
  // Free creation gets plausible mock values too — the broker can see the
  // shape of the row immediately rather than staring at empty cells.
  // We pick text amounts as the most common D&O value kind.
  const values: Record<string, CellValue> = {};
  const details: Record<string, CellDetail> = {};

  insurers.forEach((ins, idx) => {
    const amt = AMOUNTS_EUR[(idx + Math.floor(Math.random() * AMOUNTS_EUR.length)) % AMOUNTS_EUR.length];
    const value: CellValue = { type: "text", value: amt };
    values[ins.id] = value;
    details[ins.id] = {
      title: label,
      covered: true,
      insurerId: ins.id,
      insurerName: ins.name,
      description: description || "Garantie ajoutée à la volée — valeur extraite par l'agent.",
      cellType: "guarantee",
      state: "extracted",
      mainLimit: amt,
    };
  });

  return { values, details };
}

/**
 * Build a complete GuaranteeRow from a reference match or a free description.
 */
export function buildRowFromReference(
  entry: DOReferenceEntry,
  insurers: InsurerData[],
): GuaranteeRow {
  const { values, details } = generateReferenceValues(entry, insurers);
  return { label: entry.label, values, details };
}

export function buildRowFromFreeDescription(
  label: string,
  description: string,
  insurers: InsurerData[],
): GuaranteeRow {
  const { values, details } = generateFreeValues(label, description, insurers);
  return { label, values, details };
}
