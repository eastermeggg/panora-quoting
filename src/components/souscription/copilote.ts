import type { Draft } from "@/data/souscription-mock";

// ---------- Co-pilote message + userAsk card model ----------

export interface ModifyCard {
  kind: "modify";
  label: string; // ligne cible
  from: string;
  to: string;
  consequence?: string; // ex : "déclenche l'avis du comité"
}

export interface CreateRuleCard {
  kind: "create-rule";
  label: string; // ligne d'origine (override)
  summary: string; // "si CA 2-5M€ / Conseil, plafond 3M€"
}

export interface RelanceCard {
  kind: "relance";
  courtier: string;
  missing: string[];
}

export interface EnvoiCard {
  kind: "envoi";
  courtier: string;
  objet: string; // objet du mail
  items: string[]; // pièces du package (Devis, CG, CP)
}

export type CopiloteCard =
  | ModifyCard
  | CreateRuleCard
  | RelanceCard
  | EnvoiCard;
export type CardStatus = "proposed" | "applied" | "cancelled" | "scoped";

export interface CopiloteMessage {
  id: string;
  role: "user" | "assistant";
  text?: string; // texte (Expliquer / journal / toast)
  card?: CopiloteCard; // carte userAsk confirmable
  status?: CardStatus; // pour les cartes
}

// ---------- Registre 1 : Expliquer (répond + source, pas de carte) ----------

export function explain(q: string): string {
  const s = q.toLowerCase();
  if (s.includes("extorsion"))
    return "La sous-limite cyber-extorsion de 250 000 € est posée par guide_souscription_cyber (section 3.4). Condition : effectif > 50 en conseil / IT. Source confirmée, overridable.";
  if (s.includes("cyber"))
    return "Le volet cyber est tarifé à part : assiette CA HT × 0,15 % (grille_tarif_cyber_2026), rabais sécurité -15 % si MFA + EDR. Source confirmée.";
  if (s.includes("iso") || s.includes("rabais") || s.includes("27001"))
    return "Le rabais de 10 % (prévention) vient de grille_tarif_rcpro_2026 (Modificateurs, M5). Condition : certification ISO 27001 en conseil / IT.";
  if (s.includes("plafond"))
    return "Le plafond est une hypothèse de l'agent (plafond standard du produit), à confirmer. Aucune règle ne le fixe.";
  if (s.includes("autorit") || s.includes("renvoi") || s.includes("seuil"))
    return "La ligne demandée reste sous le seuil de renvoi (matrice_autorite_2026). Aucune soumission assureur requise.";
  if (s.includes("taux"))
    return "Le taux de base vient de la grille tarifaire du produit, tranche conseil / IT et CA 2-5 M€.";
  if (s.includes("franchise"))
    return "La franchise est posée par la grille du produit, tranche CA 2-5 M€.";
  return "Je m'appuie sur les règles confirmées du vault. Précisez l'élément (taux, sous-limite, franchise, plafond, autorité) et je cite la règle qui l'a posé.";
}

// ---------- Registre 2 : Modifier (détecte une intention → carte) ----------

const MODIFY_VERBS =
  /\b(rel[eè]ve|passe|modifie|change|mets|ajuste|augmente|baisse|fixe|porte|remonte|descends)\b/i;

/** "500k" → 500000, "500 000" → 500000, "3M" → 3000000, "250000" → 250000. */
export function parseAmount(s: string): number | null {
  const m = s.match(/(\d[\d\s.]*\d|\d)\s*(m|k)?\b/i);
  if (!m) return null;
  const n = Number(m[1].replace(/[\s.]/g, ""));
  if (Number.isNaN(n)) return null;
  const unit = (m[2] || "").toLowerCase();
  if (unit === "m") return n * 1_000_000;
  if (unit === "k") return n * 1_000;
  return n;
}

export function formatEuro(n: number): string {
  return n.toLocaleString("fr-FR") + " €";
}

/** The anticipated consequence of raising a line to `amount` (if any). */
export function modifyConsequence(
  label: string,
  amount: number | null
): string | undefined {
  if (amount == null) return undefined;
  const l = label.toLowerCase();
  if (amount >= 400_000 && /sous-limite|cyber/.test(l))
    return "au-delà de 250 000 €, guide_souscription_cyber demande l'avis du comité";
  if (amount >= 3_000_000 && /plafond/.test(l))
    return "hors grille tarifaire : déclenche une revue";
  return undefined;
}

/** Detect a line-modification intent in a free-text message. */
export function detectModify(q: string, draft: Draft): ModifyCard | null {
  if (!MODIFY_VERBS.test(q)) return null;
  const amt = parseAmount(q);
  if (amt == null) return null;
  const s = q.toLowerCase();
  const line = draft.lignes.find((l) => {
    const ll = l.label.toLowerCase();
    if (s.includes("extorsion") && ll.includes("extorsion")) return true;
    if (s.includes("cyber") && ll.includes("cyber") && ll.includes("sous-limite"))
      return true;
    if (s.includes("plafond") && ll.includes("plafond")) return true;
    if (s.includes("franchise") && ll.includes("franchise")) return true;
    if (s.includes("sous-limite") && ll.includes("sous-limite")) return true;
    return false;
  });
  if (!line) return null;
  return {
    kind: "modify",
    label: line.label,
    from: line.valeur,
    to: formatEuro(amt),
    consequence: modifyConsequence(line.label, amt),
  };
}
