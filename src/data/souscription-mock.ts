// Mock data - Assistant Souscription (demo Hiscox)
// Donnees fictives mais realistes. Profils, NAF, parametres RC Pro / D&O coherents.
// Sert de source de verite pour le proto (vault, regles, dossiers, draft).
//
// Choix terrain :
// - Hiscox = assureur specialiste PME : RC Pro, D&O, cyber. Le jeu de produits est sur ce perimetre.
// - Assiette RC Pro conseil = chiffre d'affaires HT (et non masse salariale). C'est la base
//   d'exposition usuelle pour la responsabilite professionnelle des activites de prestation.
// - Effets de regle types : disposition / tarif / couverture / exigence (cf. recherche metier).
// - Souscription delegue : au-dela de l'autorite, la regle ne tarifie pas, elle renvoie.

// ---------- Types ----------

export type Produit = "RC_PRO" | "DO" | "CYBER";

export type EffectKind = "disposition" | "tarif" | "couverture" | "exigence";

export type DispositionType = "accepter" | "renvoyer" | "refuser";
export type TarifType = "assiette" | "taux" | "modificateur";
export type CouvertureType = "plafond" | "sous_limite" | "franchise" | "exclusion" | "clause";
export type ExigenceType = "document" | "questionnaire";

export type RuleStatus = "confirmee" | "a_valider";

export interface RuleFacets {
  produit: Produit[] | "tous";
  activite: string;            // libelle ou "toutes"
  condition: string;           // predicat lisible, "-" si aucune
}

export interface Rule {
  id: string;
  sourceId: string;            // doc du vault d'ou la regle est extraite
  sourceLocation: string;      // cellule, section, page (provenance)
  facets: RuleFacets;
  effectKind: EffectKind;
  effectType: DispositionType | TarifType | CouvertureType | ExigenceType;
  effet: string;               // libelle de l'effet
  valeur?: string | number;    // valeur portee (taux, montant, %)
  status: RuleStatus;
}

export interface ReferentielDoc {
  id: string;
  produit: Produit;
  kind: "CG" | "modele_devis" | "modele_CP";
  filename: string;
  statut: "Reference" | "Modele";
}

export interface RuleSourceDoc {
  id: string;
  filename: string;
  type: "grille" | "guide" | "matrice" | "exclusions";
  produit: Produit | "transverse";
  reglesExtraites: number;
  aValider: number;
}

export interface InsuredProfile {
  raison: string;
  siren: string;               // fictif
  naf: string;
  activite: string;
  caHT: number;
  effectif: number;
  masseSalariale?: number;
  certifications?: string[];
  exportUS?: boolean;
  sousTraitancePct?: number;
  sinistres3ans?: number;
}

export interface Souscripteur {
  id: string;
  name: string;
  initials: string;
}

export interface Dossier {
  id: string;
  courtier: string;
  recuLe: string;
  produitsDemandes: Produit[];
  insured: InsuredProfile;
  completude: "complete" | "incomplete";
  pieces: string[];
  manques: { champ: string; origine: "mail" | "exigence"; regleId?: string }[];
  souscripteurId?: string;     // responsable; undefined = non attribué
  termine?: boolean;           // dossier finalisé/envoyé → onglet "Terminées"
}

// Souscripteurs (mono-utilisateur demo ; sert aux avatars de la liste de triage)
export const souscripteurs: Souscripteur[] = [
  { id: "md", name: "Marc Dubois", initials: "MD" },
  { id: "jd", name: "Julie Doré", initials: "JD" },
];

export interface DraftLine {
  label: string;
  valeur: string;
  effectKind: EffectKind;
  produit?: Produit;           // groups the line into its product section
  ruleId?: string;             // trace
  override?: boolean;
}

export interface Draft {
  dossierId: string;
  primeBase: number;
  primeFinale: number;
  lignes: DraftLine[];
  dispositions: { libelle: string; ruleId: string; declenche: boolean }[];
  exigences: { libelle: string; ruleId: string; statut: "fournie" | "manquante" }[];
}

// ---------- Vault Hiscox : referentiel produit ----------

export const referentiel: ReferentielDoc[] = [
  { id: "ref_cg_rcpro", produit: "RC_PRO", kind: "CG", filename: "CG_RC_Pro_v4.pdf", statut: "Reference" },
  { id: "ref_devis_rcpro", produit: "RC_PRO", kind: "modele_devis", filename: "modele_devis_rcpro.docx", statut: "Modele" },
  { id: "ref_cp_rcpro", produit: "RC_PRO", kind: "modele_CP", filename: "modele_CP_rcpro.docx", statut: "Modele" },
  { id: "ref_cg_do", produit: "DO", kind: "CG", filename: "CG_DO_v2.pdf", statut: "Reference" },
  { id: "ref_devis_do", produit: "DO", kind: "modele_devis", filename: "modele_devis_do.docx", statut: "Modele" },
  { id: "ref_cp_do", produit: "DO", kind: "modele_CP", filename: "modele_CP_do.docx", statut: "Modele" },
  { id: "ref_cg_cyber", produit: "CYBER", kind: "CG", filename: "CG_Cyber_v1.pdf", statut: "Reference" },
  { id: "ref_devis_cyber", produit: "CYBER", kind: "modele_devis", filename: "modele_devis_cyber.docx", statut: "Modele" },
  { id: "ref_cp_cyber", produit: "CYBER", kind: "modele_CP", filename: "modele_CP_cyber.docx", statut: "Modele" },
];

// ---------- Vault Hiscox : documents sources de regles ----------

export const ruleSources: RuleSourceDoc[] = [
  { id: "src_grille_rcpro", filename: "grille_tarif_rcpro_2026.xlsx", type: "grille", produit: "RC_PRO", reglesExtraites: 148, aValider: 12 },
  { id: "src_guide_rcpro", filename: "guide_souscription_rcpro.pdf", type: "guide", produit: "RC_PRO", reglesExtraites: 64, aValider: 9 },
  { id: "src_grille_do", filename: "grille_tarif_do_2026.xlsx", type: "grille", produit: "DO", reglesExtraites: 96, aValider: 7 },
  { id: "src_grille_cyber", filename: "grille_tarif_cyber_2026.xlsx", type: "grille", produit: "CYBER", reglesExtraites: 72, aValider: 5 },
  { id: "src_guide_cyber", filename: "guide_souscription_cyber.pdf", type: "guide", produit: "CYBER", reglesExtraites: 38, aValider: 6 },
  { id: "src_matrice_autorite", filename: "matrice_autorite_2026.xlsx", type: "matrice", produit: "transverse", reglesExtraites: 22, aValider: 0 },
  { id: "src_exclusions", filename: "exclusions_transverses.pdf", type: "exclusions", produit: "transverse", reglesExtraites: 31, aValider: 4 },
];

// ---------- Regles extraites (typees) ----------

export const rules: Rule[] = [
  // --- Disposition / eligibilite (RC Pro) ---
  {
    id: "R1", sourceId: "src_guide_rcpro", sourceLocation: "section 2.1 - secteurs",
    facets: { produit: ["RC_PRO"], activite: "BTP gros oeuvre (41-43)", condition: "-" },
    effectKind: "disposition", effectType: "refuser", effet: "Hors appetit : BTP gros oeuvre exclu", status: "confirmee",
  },
  {
    id: "R2", sourceId: "src_guide_rcpro", sourceLocation: "section 2.1 - secteurs",
    facets: { produit: ["RC_PRO"], activite: "Conseil / IT (62xx, 70xx)", condition: "-" },
    effectKind: "disposition", effectType: "accepter", effet: "Eligible standard", status: "confirmee",
  },
  {
    id: "R3", sourceId: "src_guide_rcpro", sourceLocation: "section 2.3 - activites reglementees",
    facets: { produit: ["RC_PRO"], activite: "Sante / paramedical (86xx)", condition: "-" },
    effectKind: "disposition", effectType: "renvoyer", effet: "Renvoi assureur (activite reglementee)", status: "a_valider",
  },

  // --- Tarif (RC Pro) ---
  {
    id: "R4", sourceId: "src_grille_rcpro", sourceLocation: "feuille Base, A1",
    facets: { produit: ["RC_PRO"], activite: "toutes", condition: "-" },
    effectKind: "tarif", effectType: "assiette", effet: "Assiette = chiffre d'affaires HT", status: "confirmee",
  },
  {
    id: "R5", sourceId: "src_grille_rcpro", sourceLocation: "feuille Taux, B2",
    facets: { produit: ["RC_PRO"], activite: "Conseil / IT", condition: "CA < 2M€" },
    effectKind: "tarif", effectType: "taux", effet: "Taux de base", valeur: "0,9%", status: "confirmee",
  },
  {
    id: "R6", sourceId: "src_grille_rcpro", sourceLocation: "feuille Taux, B3",
    facets: { produit: ["RC_PRO"], activite: "Conseil / IT", condition: "CA 2-5M€" },
    effectKind: "tarif", effectType: "taux", effet: "Taux de base", valeur: "0,8%", status: "confirmee",
  },
  {
    id: "R7", sourceId: "src_grille_rcpro", sourceLocation: "feuille Taux, B4",
    facets: { produit: ["RC_PRO"], activite: "Conseil / IT", condition: "CA > 5M€" },
    effectKind: "tarif", effectType: "taux", effet: "Taux de base (renvoi si CA > 10M€)", valeur: "0,7%", status: "confirmee",
  },
  {
    id: "R8", sourceId: "src_grille_rcpro", sourceLocation: "feuille Modificateurs, M2",
    facets: { produit: ["RC_PRO"], activite: "toutes", condition: "≥ 2 sinistres sur 3 ans" },
    effectKind: "tarif", effectType: "modificateur", effet: "Majoration sinistralite", valeur: "+25%", status: "confirmee",
  },
  {
    id: "R9", sourceId: "src_grille_rcpro", sourceLocation: "feuille Modificateurs, M5",
    facets: { produit: ["RC_PRO"], activite: "Conseil / IT", condition: "Certification ISO 27001" },
    effectKind: "tarif", effectType: "modificateur", effet: "Rabais prevention", valeur: "-10%", status: "confirmee",
  },

  // --- Couverture (RC Pro) ---
  {
    id: "R10", sourceId: "src_guide_rcpro", sourceLocation: "section 4.2 - cyber",
    facets: { produit: ["RC_PRO"], activite: "Conseil / IT", condition: "Effectif > 50" },
    effectKind: "couverture", effectType: "sous_limite", effet: "Sous-limite cyber", valeur: "250 000 €", status: "confirmee",
  },
  {
    id: "R11", sourceId: "src_grille_rcpro", sourceLocation: "feuille Franchises, F3",
    facets: { produit: ["RC_PRO"], activite: "toutes", condition: "CA 2-5M€" },
    effectKind: "couverture", effectType: "franchise", effet: "Franchise", valeur: "1 500 €", status: "confirmee",
  },
  {
    id: "R12", sourceId: "src_exclusions", sourceLocation: "page 3 - portee geographique",
    facets: { produit: "tous", activite: "toutes", condition: "Export US/Canada > 10% du CA" },
    effectKind: "couverture", effectType: "exclusion", effet: "Exclusion reclamations US/Canada", status: "a_valider",
  },
  {
    id: "R13", sourceId: "src_guide_rcpro", sourceLocation: "section 5.1 - sous-traitance",
    facets: { produit: ["RC_PRO"], activite: "toutes", condition: "Sous-traitance > 30%" },
    effectKind: "couverture", effectType: "clause", effet: "Clause sous-traitance obligatoire", status: "confirmee",
  },

  // --- Exigence (RC Pro) ---
  {
    id: "R14", sourceId: "src_guide_rcpro", sourceLocation: "section 1.3 - pieces",
    facets: { produit: ["RC_PRO"], activite: "toutes", condition: "CA > 10M€" },
    effectKind: "exigence", effectType: "document", effet: "Bilan N-1 requis", status: "confirmee",
  },
  {
    id: "R15", sourceId: "src_guide_rcpro", sourceLocation: "section 4.2 - cyber",
    facets: { produit: ["RC_PRO", "CYBER"], activite: "toutes", condition: "Volet cyber demande" },
    effectKind: "exigence", effectType: "questionnaire", effet: "Questionnaire cyber requis", status: "confirmee",
  },

  // --- Transverse : autorite et secteurs interdits ---
  {
    id: "R16", sourceId: "src_matrice_autorite", sourceLocation: "ligne 7 - capacite",
    facets: { produit: "tous", activite: "toutes", condition: "Ligne demandee > 5M€" },
    effectKind: "disposition", effectType: "renvoyer", effet: "Soumission assureur (au-dela autorite deleguee)", status: "confirmee",
  },
  {
    id: "R17", sourceId: "src_exclusions", sourceLocation: "page 1 - secteurs exclus",
    facets: { produit: "tous", activite: "Armement, crypto-actifs, cannabis", condition: "-" },
    effectKind: "disposition", effectType: "refuser", effet: "Risque hors appetit", status: "confirmee",
  },

  // --- D&O ---
  {
    id: "R18", sourceId: "src_grille_do", sourceLocation: "feuille Base, A2",
    facets: { produit: ["DO"], activite: "toutes", condition: "Total bilan < 10M€" },
    effectKind: "tarif", effectType: "taux", effet: "Prime de base", valeur: "1 800 €", status: "confirmee",
  },
  {
    id: "R19", sourceId: "src_grille_do", sourceLocation: "feuille Sous-limites, S2",
    facets: { produit: ["DO"], activite: "toutes", condition: "Levee de fonds en cours" },
    effectKind: "couverture", effectType: "sous_limite", effet: "Sous-limite frais de defense", valeur: "500 000 €", status: "a_valider",
  },
  {
    id: "R20", sourceId: "src_grille_do", sourceLocation: "feuille Pieces, P1",
    facets: { produit: ["DO"], activite: "toutes", condition: "-" },
    effectKind: "exigence", effectType: "document", effet: "Liasse fiscale + pacte d'actionnaires requis", status: "confirmee",
  },

  // --- Cyber ---
  {
    id: "R21", sourceId: "src_guide_cyber", sourceLocation: "section 1.2 - appetit",
    facets: { produit: ["CYBER"], activite: "Conseil / IT (62xx, 70xx)", condition: "-" },
    effectKind: "disposition", effectType: "accepter", effet: "Eligible standard", status: "confirmee",
  },
  {
    id: "R22", sourceId: "src_grille_cyber", sourceLocation: "feuille Base, A1",
    facets: { produit: ["CYBER"], activite: "toutes", condition: "-" },
    effectKind: "tarif", effectType: "assiette", effet: "Assiette = chiffre d'affaires HT", status: "confirmee",
  },
  {
    id: "R23", sourceId: "src_grille_cyber", sourceLocation: "feuille Taux, C3",
    facets: { produit: ["CYBER"], activite: "Conseil / IT", condition: "CA 2-5M€" },
    effectKind: "tarif", effectType: "taux", effet: "Taux cyber", valeur: "0,15%", status: "confirmee",
  },
  {
    id: "R24", sourceId: "src_grille_cyber", sourceLocation: "feuille Modificateurs, MC4",
    facets: { produit: ["CYBER"], activite: "toutes", condition: "MFA + EDR deployes" },
    effectKind: "tarif", effectType: "modificateur", effet: "Rabais securite", valeur: "-15%", status: "confirmee",
  },
  {
    id: "R25", sourceId: "src_guide_cyber", sourceLocation: "section 3.4 - extorsion",
    facets: { produit: ["CYBER"], activite: "toutes", condition: "-" },
    effectKind: "couverture", effectType: "sous_limite", effet: "Sous-limite cyber-extorsion", valeur: "250 000 €", status: "confirmee",
  },
  {
    id: "R26", sourceId: "src_grille_cyber", sourceLocation: "feuille Franchises, FC2",
    facets: { produit: ["CYBER"], activite: "toutes", condition: "CA 2-5M€" },
    effectKind: "couverture", effectType: "franchise", effet: "Franchise cyber", valeur: "5 000 €", status: "confirmee",
  },

  // --- D&O (complement) ---
  {
    id: "R27", sourceId: "src_grille_do", sourceLocation: "section 1.1 - appetit",
    facets: { produit: ["DO"], activite: "toutes", condition: "Total bilan < 10M€" },
    effectKind: "disposition", effectType: "accepter", effet: "Eligible standard", status: "confirmee",
  },
  {
    id: "R28", sourceId: "src_grille_do", sourceLocation: "feuille Modificateurs, MD3",
    facets: { produit: ["DO"], activite: "Secteur financier reglemente (64xx)", condition: "-" },
    effectKind: "tarif", effectType: "modificateur", effet: "Majoration secteur financier", valeur: "+20%", status: "confirmee",
  },
];

// ---------- Dossiers entrants (courtier -> souscripteur) ----------

export const dossiers: Dossier[] = [
  // D1 - complet, dans l'autorite : chemin nominal, draft tarife
  {
    id: "DOS-2026-0148",
    courtier: "Cabinet Vauban",
    recuLe: "2026-06-24",
    produitsDemandes: ["RC_PRO", "CYBER"],
    insured: {
      raison: "TechnoServ SAS",
      siren: "824 156 793",
      naf: "6202A",
      activite: "Conseil en systemes et logiciels informatiques",
      caHT: 4200000,
      effectif: 62,
      masseSalariale: 2280000,
      certifications: ["ISO 27001"],
      exportUS: false,
      sousTraitancePct: 12,
      sinistres3ans: 0,
    },
    completude: "complete",
    pieces: ["kbis_technoserv.pdf", "bilan_2024.pdf", "questionnaire_cyber.pdf"],
    manques: [],
    souscripteurId: "md",
  },

  // D2 - incomplet : declenche exigences + renvoi (CA > 10M)
  {
    id: "DOS-2026-0151",
    courtier: "Neo Courtage",
    recuLe: "2026-06-26",
    produitsDemandes: ["RC_PRO", "CYBER"],
    insured: {
      raison: "Novalink SAS",
      siren: "901 447 028",
      naf: "6201Z",
      activite: "Programmation informatique",
      caHT: 12000000,
      effectif: 80,
      exportUS: true,
      sousTraitancePct: 35,
      sinistres3ans: 1,
    },
    completude: "incomplete",
    pieces: ["kbis_novalink.pdf"],
    manques: [
      { champ: "Masse salariale N-1", origine: "mail" },
      { champ: "Bilan N-1", origine: "exigence", regleId: "R14" },
      { champ: "Questionnaire cyber", origine: "exigence", regleId: "R15" },
      { champ: "Part export US (justificatif)", origine: "exigence", regleId: "R12" },
    ],
    souscripteurId: "md",
  },

  // D3 - D&O startup : montre le second produit
  {
    id: "DOS-2026-0153",
    courtier: "Assurance & Conseil Lyon",
    recuLe: "2026-06-27",
    produitsDemandes: ["DO"],
    insured: {
      raison: "Fintech Pulse SAS",
      siren: "913 220 561",
      naf: "6419Z",
      activite: "Autres intermediations monetaires",
      caHT: 3100000,
      effectif: 28,
      sinistres3ans: 0,
    },
    completude: "incomplete",
    pieces: ["kbis_fintechpulse.pdf"],
    manques: [
      { champ: "Liasse fiscale", origine: "exigence", regleId: "R20" },
      { champ: "Pacte d'actionnaires", origine: "exigence", regleId: "R20" },
    ],
    souscripteurId: "jd",
  },

  // D4 - Atlas Conseil : dans l'appetit, RC Pro, chiffre + finalise (peuple "Terminees")
  {
    id: "DOS-2026-0156",
    courtier: "Atlas Partenaires",
    recuLe: "2026-06-22",
    produitsDemandes: ["RC_PRO"],
    insured: {
      raison: "Atlas Conseil SARL",
      siren: "789 334 102",
      naf: "7022Z",
      activite: "Conseil pour les affaires et autres conseils de gestion",
      caHT: 1800000,
      effectif: 18,
      certifications: [],
      exportUS: false,
      sousTraitancePct: 8,
      sinistres3ans: 0,
    },
    completude: "complete",
    pieces: ["kbis_atlas.pdf", "bilan_2024.pdf"],
    manques: [],
    termine: true,
  },

  // D5 - BTP Renov : hors appetit (BTP gros oeuvre, R1), non chiffre (peuple "Refusees")
  {
    id: "DOS-2026-0159",
    courtier: "Cabinet Vauban",
    recuLe: "2026-06-28",
    produitsDemandes: ["RC_PRO"],
    insured: {
      raison: "BTP Renov SARL",
      siren: "552 870 419",
      naf: "4399C",
      activite: "Travaux de maçonnerie générale et gros œuvre de bâtiment",
      caHT: 3500000,
      effectif: 24,
      exportUS: false,
      sousTraitancePct: 45,
      sinistres3ans: 2,
    },
    completude: "complete",
    pieces: ["kbis_btprenov.pdf"],
    manques: [],
  },
];

// ---------- Draft de tarification (dossier D1) ----------
// Offre 2 produits, dossier complet, dans l'autorite.
// RC Pro : CA HT 4 200 000 € x 0,8% = 33 600 base, ISO 27001 -10% -> 30 240 € HT
// Cyber  : CA HT 4 200 000 € x 0,15% = 6 300 base, securite -15% -> 5 355 € HT
// Total  : 39 900 base -> 35 595 € HT

export const draftD1: Draft = {
  dossierId: "DOS-2026-0148",
  primeBase: 39900,
  primeFinale: 35595,
  lignes: [
    // --- RC Pro ---
    { label: "Éligibilité RC Pro", valeur: "Éligible standard", effectKind: "disposition", produit: "RC_PRO", ruleId: "R2" },
    { label: "Assiette (CA HT)", valeur: "4 200 000 €", effectKind: "tarif", produit: "RC_PRO", ruleId: "R4" },
    { label: "Taux de base", valeur: "0,8%", effectKind: "tarif", produit: "RC_PRO", ruleId: "R6" },
    { label: "Modificateur ISO 27001", valeur: "-10%", effectKind: "tarif", produit: "RC_PRO", ruleId: "R9" },
    { label: "Prime RC Pro", valeur: "30 240 € HT", effectKind: "tarif", produit: "RC_PRO" },
    { label: "Plafond RC professionnelle", valeur: "2 000 000 €", effectKind: "couverture", produit: "RC_PRO" },
    { label: "Franchise", valeur: "1 500 €", effectKind: "couverture", produit: "RC_PRO", ruleId: "R11" },
    { label: "Clause sous-traitance", valeur: "Non déclenchée (12% < 30%)", effectKind: "couverture", produit: "RC_PRO", ruleId: "R13" },
    // --- Cyber ---
    { label: "Éligibilité cyber", valeur: "Éligible standard", effectKind: "disposition", produit: "CYBER", ruleId: "R21" },
    { label: "Assiette cyber (CA HT)", valeur: "4 200 000 €", effectKind: "tarif", produit: "CYBER", ruleId: "R22" },
    { label: "Taux cyber", valeur: "0,15%", effectKind: "tarif", produit: "CYBER", ruleId: "R23" },
    { label: "Modificateur sécurité (MFA, EDR)", valeur: "-15%", effectKind: "tarif", produit: "CYBER", ruleId: "R24" },
    { label: "Prime cyber", valeur: "5 355 € HT", effectKind: "tarif", produit: "CYBER" },
    { label: "Plafond cyber", valeur: "1 000 000 €", effectKind: "couverture", produit: "CYBER" },
    { label: "Sous-limite cyber-extorsion", valeur: "250 000 €", effectKind: "couverture", produit: "CYBER", ruleId: "R25" },
    { label: "Franchise cyber", valeur: "5 000 €", effectKind: "couverture", produit: "CYBER", ruleId: "R26" },
  ],
  dispositions: [
    { libelle: "Ligne 2M€ dans l'autorité déléguée (seuil renvoi 5M€)", ruleId: "R16", declenche: false },
    { libelle: "Aucune exclusion sectorielle transverse déclenchée", ruleId: "R17", declenche: false },
  ],
  exigences: [
    { libelle: "Questionnaire cyber requis", ruleId: "R15", statut: "fournie" },
  ],
};
