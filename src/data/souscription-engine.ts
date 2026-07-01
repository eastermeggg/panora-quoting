// Assistant Souscription - moteur (mock).
// Croisement profil x regles du vault. Les calculs sont simules mais coherents
// entre eux (assiette x taux x modificateurs = prime). Le draft D1 est precalcule
// dans le mock ; les autres dossiers restent bloques tant que la collecte n'est
// pas complete (la tarification ne se debloque qu'a dossier pret).

import {
  dossiers,
  rules,
  ruleSources,
  referentiel,
  draftD1,
  souscripteurs,
  type Dossier,
  type Draft,
  type DraftLine,
  type Rule,
  type RuleSourceDoc,
  type ReferentielDoc,
  type Produit,
  type EffectKind,
  type Souscripteur,
} from "./souscription-mock";
import type { ExtractedSection, ExtractedField } from "./scenarios";
import { getFormState } from "./souscription-store";

// ---------- Libelles ----------

export const PRODUIT_LABELS: Record<Produit, string> = {
  RC_PRO: "RC Pro",
  DO: "D&O",
  CYBER: "Cyber",
};

export function produitLabel(p: Produit): string {
  return PRODUIT_LABELS[p] ?? p;
}

export function produitsLabel(ps: Produit[]): string {
  return ps.map(produitLabel).join(" + ");
}

export const EFFECT_KIND_LABELS: Record<EffectKind, string> = {
  disposition: "Disposition",
  tarif: "Tarif",
  couverture: "Couverture",
  exigence: "Exigence",
};

// ---------- Lookups ----------

export function getDossier(id: string): Dossier | undefined {
  return dossiers.find((d) => d.id === id);
}

export function getAllDossiers(): Dossier[] {
  return dossiers;
}

export function getSouscripteur(id?: string): Souscripteur | undefined {
  if (!id) return undefined;
  return souscripteurs.find((s) => s.id === id);
}

export function getRule(id: string): Rule | undefined {
  return rules.find((r) => r.id === id);
}

export function getSourceDoc(id: string): RuleSourceDoc | undefined {
  return ruleSources.find((s) => s.id === id);
}

export function getAllRuleSources(): RuleSourceDoc[] {
  return ruleSources;
}

/** Toutes les regles extraites d'un document source (vault, vue d'extraction). */
export function getRulesForSource(sourceId: string): Rule[] {
  return rules.filter((r) => r.sourceId === sourceId);
}

/** Couple regle + document source pour la trace [src] d'une ligne de draft. */
export function getRuleWithSource(
  ruleId?: string
): { rule: Rule; source: RuleSourceDoc | undefined } | null {
  if (!ruleId) return null;
  const rule = getRule(ruleId);
  if (!rule) return null;
  return { rule, source: getSourceDoc(rule.sourceId) };
}

export function getReferentielForProduit(produit: Produit): ReferentielDoc[] {
  return referentiel.filter((r) => r.produit === produit);
}

/** Produits couverts par le referentiel, dans l'ordre de premiere apparition. */
export function getReferentielProduits(): Produit[] {
  const seen: Produit[] = [];
  for (const doc of referentiel) {
    if (!seen.includes(doc.produit)) seen.push(doc.produit);
  }
  return seen;
}

// ---------- Liste de regles (vault) ----------

export type RuleScope = Produit | "transverse" | "tous";

/** Toutes les regles du vault. */
export function getAllRules(): Rule[] {
  return rules;
}

/**
 * Regles d'un perimetre : un produit (regles propres au produit), "transverse"
 * (regles sans produit, i.e. produit "tous"), ou "tous" (tout le vault).
 */
export function rulesForScope(scope: RuleScope): Rule[] {
  if (scope === "tous") return rules;
  if (scope === "transverse") return rules.filter((r) => r.facets.produit === "tous");
  return rules.filter(
    (r) => Array.isArray(r.facets.produit) && r.facets.produit.includes(scope)
  );
}

/** Facet values present across the rules, for the multi-faceted vault filters. */
export function ruleFacetOptions(): {
  produits: (Produit | "transverse")[];
  kinds: EffectKind[];
} {
  const produits = new Set<Produit | "transverse">();
  const kinds = new Set<EffectKind>();
  for (const r of rules) {
    kinds.add(r.effectKind);
    if (r.facets.produit === "tous") produits.add("transverse");
    else for (const p of r.facets.produit) produits.add(p);
  }
  const prodOrder: (Produit | "transverse")[] = ["RC_PRO", "DO", "CYBER", "transverse"];
  const kindOrder: EffectKind[] = ["disposition", "tarif", "couverture", "exigence"];
  return {
    produits: prodOrder.filter((p) => produits.has(p)),
    kinds: kindOrder.filter((k) => kinds.has(k)),
  };
}

/** Does a rule match a product facet value? ("transverse" = produit "tous".) */
export function ruleMatchesProduct(
  rule: Rule,
  sel: Produit | "transverse"
): boolean {
  if (sel === "transverse") return rule.facets.produit === "tous";
  return Array.isArray(rule.facets.produit) && rule.facets.produit.includes(sel);
}

// ---------- Draft ----------

// Drafts produced once a dossier is ready. D1 is precalculated in the mock; D2
// and D3 unlock once the broker has completed the standalone form (see
// souscription-store). D2 (CA 12M€) routes to a renvoi assureur — the
// disposition outranks pricing; D3 (D&O, dans l'autorité) is priced.
const draftD2: Draft = {
  dossierId: "DOS-2026-0151",
  primeBase: 0,
  primeFinale: 0,
  lignes: [
    { label: "Éligibilité RC Pro", valeur: "Renvoi assureur", effectKind: "disposition", produit: "RC_PRO", ruleId: "R16" },
    { label: "Assiette (CA HT)", valeur: "12 000 000 €", effectKind: "tarif", produit: "RC_PRO", ruleId: "R4" },
    { label: "Éligibilité cyber", valeur: "Renvoi assureur", effectKind: "disposition", produit: "CYBER", ruleId: "R16" },
    { label: "Sous-limite cyber-extorsion", valeur: "250 000 €", effectKind: "couverture", produit: "CYBER", ruleId: "R25" },
  ],
  dispositions: [
    { libelle: "CA 12M€ : risque au-delà de l'autorité déléguée, soumission assureur", ruleId: "R16", declenche: true },
    { libelle: "Export US/Canada > 10% : exclusion à valider", ruleId: "R12", declenche: false },
  ],
  exigences: [
    { libelle: "Bilan N-1 requis", ruleId: "R14", statut: "fournie" },
    { libelle: "Questionnaire cyber requis", ruleId: "R15", statut: "fournie" },
  ],
};

// D3 (D&O, secteur financier) : base 1 800 € + majoration secteur +20% -> 2 160 € HT
const draftD3: Draft = {
  dossierId: "DOS-2026-0153",
  primeBase: 1800,
  primeFinale: 2160,
  lignes: [
    { label: "Éligibilité", valeur: "Éligible standard", effectKind: "disposition", produit: "DO", ruleId: "R27" },
    { label: "Prime de base", valeur: "1 800 €", effectKind: "tarif", produit: "DO", ruleId: "R18" },
    { label: "Modificateur secteur financier", valeur: "+20%", effectKind: "tarif", produit: "DO", ruleId: "R28" },
    { label: "Prime D&O", valeur: "2 160 € HT", effectKind: "tarif", produit: "DO" },
    { label: "Plafond D&O", valeur: "1 000 000 €", effectKind: "couverture", produit: "DO" },
    { label: "Sous-limite frais de défense", valeur: "Non déclenchée (pas de levée en cours)", effectKind: "couverture", produit: "DO", ruleId: "R19" },
    { label: "Exclusion US/Canada", valeur: "Non déclenchée (pas d'export US)", effectKind: "couverture", produit: "DO", ruleId: "R12" },
  ],
  dispositions: [
    { libelle: "Total bilan < 10M€, dans l'autorité déléguée", ruleId: "R16", declenche: false },
  ],
  exigences: [
    { libelle: "Liasse fiscale + pacte d'actionnaires requis", ruleId: "R20", statut: "fournie" },
  ],
};

// D4 (Atlas Conseil, RC Pro) : CA 1,8M × 0,9% (tranche < 2M) = 16 200 € HT
const draftAtlas: Draft = {
  dossierId: "DOS-2026-0156",
  primeBase: 16200,
  primeFinale: 16200,
  lignes: [
    { label: "Éligibilité RC Pro", valeur: "Éligible standard", effectKind: "disposition", produit: "RC_PRO", ruleId: "R2" },
    { label: "Assiette (CA HT)", valeur: "1 800 000 €", effectKind: "tarif", produit: "RC_PRO", ruleId: "R4" },
    { label: "Taux de base", valeur: "0,9%", effectKind: "tarif", produit: "RC_PRO", ruleId: "R5" },
    { label: "Prime RC Pro", valeur: "16 200 € HT", effectKind: "tarif", produit: "RC_PRO" },
    { label: "Plafond RC professionnelle", valeur: "2 000 000 €", effectKind: "couverture", produit: "RC_PRO" },
    { label: "Clause sous-traitance", valeur: "Non déclenchée (8% < 30%)", effectKind: "couverture", produit: "RC_PRO", ruleId: "R13" },
  ],
  dispositions: [
    { libelle: "Ligne 2M€ dans l'autorité déléguée (seuil renvoi 5M€)", ruleId: "R16", declenche: false },
    { libelle: "Aucune exclusion sectorielle transverse déclenchée", ruleId: "R17", declenche: false },
  ],
  exigences: [],
};

const DRAFTS: Record<string, Draft> = {
  [draftD1.dossierId]: draftD1,
  [draftD2.dossierId]: draftD2,
  [draftD3.dossierId]: draftD3,
  [draftAtlas.dossierId]: draftAtlas,
};

/**
 * Le profil est-il prêt à tarifer ? Complet d'origine (D1), ou complété via le
 * formulaire renvoyé par le courtier (souscription-store).
 */
export function isDossierReady(id: string): boolean {
  const dossier = getDossier(id);
  if (!dossier) return false;
  if (dossier.completude === "complete" && dossier.manques.length === 0) {
    return true;
  }
  return getFormState(`souscription-${id}`).completed;
}

/**
 * Le draft d'un dossier, disponible une fois le dossier prêt. D1 l'est d'office ;
 * D2/D3 le deviennent quand le formulaire courtier est complété.
 */
export function getDraftForDossier(id: string): Draft | null {
  if (!isDossierReady(id)) return null;
  return DRAFTS[id] ?? null;
}

export type DossierStage = "collecte" | "tarification" | "emis";

/** Colonne du board : un dossier prêt (avec draft) est à tarifer, sinon en collecte. */
export function dossierStage(dossier: Dossier): DossierStage {
  return getDraftForDossier(dossier.id) ? "tarification" : "collecte";
}

// ---------- Appétit : la disposition, évaluée tôt (dès le triage) ----------

export type AppetitVerdict = "dans_appetit" | "hors_appetit";

export interface Appetit {
  verdict: AppetitVerdict;
  ruleId?: string; // règle qui a produit le verdict (sourcé)
  reason: string;
}

export const APPETIT_LABELS: Record<AppetitVerdict, string> = {
  dans_appetit: "Dans l'appétit",
  hors_appetit: "Hors appétit",
};

function productOverlap(rule: Rule, dossier: Dossier): boolean {
  if (rule.facets.produit === "tous") return true;
  return rule.facets.produit.some((p) => dossier.produitsDemandes.includes(p));
}

/** Pragmatic activity match: NAF division (2 digits) vs the rule's facet hint. */
function activiteMatches(rule: Rule, dossier: Dossier): boolean {
  const fac = rule.facets.activite;
  if (fac === "toutes") return true;
  const div = dossier.insured.naf.slice(0, 2);
  const range = fac.match(/(\d{2})\s*-\s*(\d{2})/);
  if (range) {
    const d = Number(div);
    if (d >= Number(range[1]) && d <= Number(range[2])) return true;
  }
  const nums: string[] = fac.match(/\d{2}/g) ?? [];
  return nums.includes(div);
}

/**
 * Appetite verdict for a dossier, evaluated early (listing-time) and sourced.
 * Prefers the pre-computed draft's triggered dispositions; otherwise matches the
 * profile against the sector/appetite disposition rules (guide + exclusions, not
 * the authority matrix, which needs the requested limit, not the profile).
 */
export function getAppetit(dossier: Dossier): Appetit {
  const draft = DRAFTS[dossier.id];
  if (draft) {
    for (const d of draft.dispositions) {
      if (!d.declenche) continue;
      const r = getRule(d.ruleId);
      if (r?.effectType === "refuser")
        return { verdict: "hors_appetit", ruleId: r.id, reason: d.libelle };
    }
    return {
      verdict: "dans_appetit",
      reason: "Profil dans le périmètre couvert, aucune disposition déclenchée.",
    };
  }
  const dispo = rules.filter(
    (r) =>
      r.effectKind === "disposition" &&
      getSourceDoc(r.sourceId)?.type !== "matrice" &&
      productOverlap(r, dossier) &&
      activiteMatches(r, dossier)
  );
  // Only an explicit refusal takes a risk out of appetite. A renvoi (au-delà de
  // l'autorité déléguée) is NOT a refusal — the risk stays in appetite; the
  // escalation is handled at tarification, not as an appetite verdict.
  const hors = dispo.find((r) => r.effectType === "refuser");
  if (hors)
    return {
      verdict: "hors_appetit",
      ruleId: hors.id,
      reason: `${hors.effet} (${hors.sourceLocation})`,
    };
  return { verdict: "dans_appetit", reason: "Profil dans le périmètre couvert." };
}

/** Prime estimée pour la liste : la prime finale si un draft chiffré est dispo. */
export function getEstimatedPrime(dossier: Dossier): number | null {
  const draft = getDraftForDossier(dossier.id);
  return draft && draft.primeFinale > 0 ? draft.primeFinale : null;
}

// ---------- Statut de triage (onglets de la liste) ----------

export type DossierStatus = "a_process" | "tarifiee" | "refusee" | "terminee";

export const STATUS_LABELS: Record<DossierStatus, string> = {
  a_process: "À process",
  tarifiee: "Tarifiées",
  refusee: "Refusées",
  terminee: "Terminées",
};

/**
 * Onglet de la liste. Un dossier refusé (hors appétit) reste refusé ; un dossier
 * finalisé est terminé ; sinon il est tarifié dès qu'il est prêt, à défaut il
 * reste à traiter (collecte en cours).
 */
export function dossierStatus(dossier: Dossier): DossierStatus {
  const { verdict } = getAppetit(dossier);
  if (verdict === "hors_appetit") return "refusee";
  if (dossier.termine) return "terminee";
  return isDossierReady(dossier.id) ? "tarifiee" : "a_process";
}

/**
 * A demande still needs the collecte (préparation) step while its data is
 * incomplete and it is not a refusal. Such dossiers open on the dedicated
 * collecte screen; ready or refused ones go straight to the detail.
 */
export function dossierNeedsCollecte(dossier: Dossier): boolean {
  return (
    getAppetit(dossier).verdict !== "hors_appetit" && !isDossierReady(dossier.id)
  );
}

// ---------- Tarification: artefact (sections, provenance, synthèse) — spec 4.4 itéré ----------

/** Provenance à trois états d'une ligne tarifée. */
export type Provenance = "regle" | "agent" | "non_dispo";

/** Total/prime lines carry no pill (they are computed). */
export function lineProvenance(line: DraftLine): Provenance | null {
  if (/prime/i.test(line.label)) return null;
  if (line.ruleId) return "regle";
  if (line.valeur && line.valeur.trim()) return "agent";
  return "non_dispo";
}

export interface DraftSection {
  key: string;
  label: string;
  /** Section prime, or null when the section isn't priced (routed / pending). */
  prime: string | null;
  tarif: DraftLine[];
  couverture: DraftLine[];
}

/**
 * The offer as collapsible section(s), one per product: Tarif (assiette × taux
 * − modificateurs = prime de section) then Couverture. A multi-product dossier
 * (e.g. RC Pro + Cyber) yields a section per product; each carries its own
 * prime line. A single product is just one section without siblings.
 */
export function getDraftSections(dossier: Dossier, draft: Draft): DraftSection[] {
  const offer = draft.lignes.filter(
    (l) => l.effectKind === "tarif" || l.effectKind === "couverture"
  );
  // group order: products demanded that actually have offer lines, else principal
  const present = dossier.produitsDemandes.filter((p) =>
    offer.some((l) => l.produit === p)
  );
  const groups: Produit[] = present.length
    ? present
    : [dossier.produitsDemandes[0]];
  const single = groups.length === 1;

  return groups.map((p) => {
    const inGroup = offer.filter((l) => (single ? true : l.produit === p));
    const primeLine = inGroup.find(
      (l) => l.effectKind === "tarif" && /prime/i.test(l.label)
    );
    const tarif = inGroup.filter(
      (l) => l.effectKind === "tarif" && !/prime/i.test(l.label)
    );
    const couverture = inGroup.filter((l) => l.effectKind === "couverture");
    const prime =
      primeLine?.valeur ??
      (single && draft.primeFinale > 0
        ? `${draft.primeFinale.toLocaleString("fr-FR")} € HT`
        : null);
    return { key: p, label: produitLabel(p), prime, tarif, couverture };
  });
}

/** Disposition lines (éligibilité) — surfaced in the recommendation, not the projet. */
export function getDispositionLines(draft: Draft): DraftLine[] {
  return draft.lignes.filter((l) => l.effectKind === "disposition");
}

export interface Synthese {
  reading: string;
  attention: string | null;
  agentCount: number;
  missingCount: number;
}

/** An opinionated reading of the risk (a judgment), not a civil-status. */
export function getSynthese(dossier: Dossier, draft: Draft): Synthese {
  const ins = dossier.insured;
  const agentCount = draft.lignes.filter(
    (l) => lineProvenance(l) === "agent"
  ).length;
  const missingCount = draft.lignes.filter(
    (l) => lineProvenance(l) === "non_dispo"
  ).length;
  const ca =
    ins.caHT >= 1_000_000
      ? `${(ins.caHT / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M€`
      : `${ins.caHT.toLocaleString("fr-FR")} €`;
  const certif =
    ins.certifications && ins.certifications.length > 0
      ? `, ${ins.certifications.join(", ")}`
      : "";
  const offre = produitsLabel(dossier.produitsDemandes);
  const reading = `Profil maîtrisé : ${ins.activite.toLowerCase()}, CA ${ca}, ${ins.effectif} salariés${certif}. Offre ${offre}.`;
  const firstAgent = draft.lignes.find((l) => lineProvenance(l) === "agent");
  const attention = firstAgent
    ? `Point d'attention : ${firstAgent.label.toLowerCase()} (${firstAgent.valeur}), hypothèse de l'agent à confirmer.`
    : null;
  return { reading, attention, agentCount, missingCount };
}

// ---------- Facettes (affichage en chips) ----------

/**
 * Chips de facettes d'une regle, dans le langage des maquettes :
 * [Produit ...] [Activite ...] [Cond. ...] [Effet ...].
 * Une regle ne porte que les facettes pertinentes (condition "-" omise).
 */
export function facetChips(rule: Rule): string[] {
  const chips: string[] = [];
  const prod =
    rule.facets.produit === "tous"
      ? "tous"
      : rule.facets.produit.map(produitLabel).join("/");
  chips.push(`Produit ${prod}`);
  chips.push(`Activité ${rule.facets.activite}`);
  if (rule.facets.condition && rule.facets.condition !== "-") {
    chips.push(`Cond. ${rule.facets.condition}`);
  }
  const valeur = rule.valeur != null ? ` ${rule.valeur}` : "";
  chips.push(`Effet ${rule.effet}${valeur}`);
  return chips;
}

// ---------- Contexte client ----------

/**
 * Map a dossier's insured profile + collected data into the quoting
 * ExtractedSection model, so the souscripteur context tab can reuse the broker
 * preparation form (ExtractedDataPanel).
 */
export function dossierToSections(
  dossier: Dossier,
  opts?: { completed?: boolean; values?: Record<string, string> }
): ExtractedSection[] {
  const ins = dossier.insured;
  const euros = (n: number) => n.toLocaleString("fr-FR") + " €";

  const entreprise: ExtractedField[] = [
    { key: "raison", label: "Raison sociale", value: ins.raison, type: "text", status: "ok" },
    { key: "siren", label: "SIREN", value: ins.siren, type: "text", status: "ok" },
    { key: "naf", label: "Code NAF", value: ins.naf, type: "text", status: "ok" },
    { key: "activite", label: "Activité", value: ins.activite, type: "text", status: "ok" },
    { key: "ca", label: "Chiffre d'affaires HT", value: euros(ins.caHT), type: "currency", status: "ok" },
    { key: "effectif", label: "Effectif", value: String(ins.effectif), type: "number", status: "ok" },
  ];
  if (ins.masseSalariale != null) {
    entreprise.push({ key: "masse", label: "Masse salariale", value: euros(ins.masseSalariale), type: "currency", status: "ok" });
  }

  const risque: ExtractedField[] = [];
  if (ins.certifications && ins.certifications.length > 0) {
    risque.push({ key: "certif", label: "Certifications", value: ins.certifications.join(", "), type: "text", status: "ok" });
  }
  if (ins.exportUS != null) {
    risque.push({ key: "export", label: "Export US / Canada", value: ins.exportUS ? "Oui" : "Non", type: "text", status: "ok" });
  }
  if (ins.sousTraitancePct != null) {
    risque.push({ key: "st", label: "Sous-traitance", value: `${ins.sousTraitancePct} %`, type: "percentage", status: "ok" });
  }
  if (ins.sinistres3ans != null) {
    risque.push({ key: "sin", label: "Sinistres (3 ans)", value: ins.sinistres3ans === 0 ? "Aucun" : String(ins.sinistres3ans), type: "text", status: "ok" });
  }

  const demande: ExtractedField[] = [
    { key: "produits", label: "Produits demandés", value: dossier.produitsDemandes.map(produitLabel).join(" + "), type: "text", status: "ok" },
    { key: "courtier", label: "Courtier", value: dossier.courtier, type: "text", status: "ok" },
    { key: "recu", label: "Reçu le", value: dossier.recuLe, type: "text", status: "ok" },
  ];

  const pieces: ExtractedField[] = dossier.pieces.map((p, i) => ({
    key: `piece_${i}`, label: `Document ${i + 1}`, value: p, type: "text", status: "ok",
  }));

  const sections: ExtractedSection[] = [
    { key: "entreprise", label: "Entreprise", status: "complete", fields: entreprise },
  ];
  if (risque.length > 0) {
    sections.push({ key: "risque", label: "Profil de risque", status: "complete", fields: risque });
  }
  sections.push({ key: "demande", label: "Demande", status: "complete", fields: demande });
  if (pieces.length > 0) {
    sections.push({ key: "pieces", label: "Pièces jointes", status: "complete", fields: pieces });
  }
  if (dossier.manques.length > 0) {
    const completed = opts?.completed ?? false;
    const values = opts?.values ?? {};
    const manqueFields: ExtractedField[] = dossier.manques.map((m, i) => {
      const key = `manque_${i}`;
      if (completed) {
        return { key, label: m.champ, value: values[key] || "Complété par le courtier", type: "text", status: "ok" } as ExtractedField;
      }
      return { key, label: m.champ, value: "", type: "text", status: "missing", placeholder: "À compléter..." } as ExtractedField;
    });
    sections.push({
      key: "manques",
      label: completed ? "Complété par le courtier" : "À compléter",
      status: completed ? "complete" : "incomplete",
      missingCount: completed ? 0 : manqueFields.length,
      fields: manqueFields,
    });
  }

  return sections;
}
