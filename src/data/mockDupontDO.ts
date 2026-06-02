// Mock D&O Garage Dupont — fil rouge du proto comparatif (README).
// Cotation D&O pour Garage Dupont & Fils SARL, 3 assureurs (AXA, Generali, Chubb),
// 4 variantes par plafond (50k / 100k / 500k / 1M €), ~10 garanties en 3 sous-groupes.
// Démontre le système d'états de cellule à 5 états.

import type {
  Cotation,
  ComparisonTask,
  ComparisonData,
  CellDetail,
  SourceRef,
  FollowupData,
  InsurerAction,
} from "./mock";

const SOURCES_CG: SourceRef[] = [
  { title: "Conditions Générales", description: "Détail des garanties et limites applicables au contrat D&O.", badge: "Contrat", page: "Page 12" },
];

function step(insurerName: string, count: number): InsurerAction[] {
  const templates: InsurerAction[] = [
    { date: "16/05/26 - 09h12", title: "Lancement de la cotation", description: "Cotation lancée", status: "success" },
    { date: "16/05/26 - 09h13", title: `Connexion à l'extranet ${insurerName}`, description: "Authentification réussie", status: "success" },
    { date: "16/05/26 - 09h14", title: "Création du dossier client", description: "Client créé avec succès", status: "success" },
    { date: "16/05/26 - 09h16", title: "Saisie des informations", description: "Champs remplis automatiquement", status: "success" },
    { date: "16/05/26 - 09h18", title: "Upload des documents", description: "Documents transmis", status: "success" },
    { date: "16/05/26 - 09h20", title: "Demande de tarification", description: "Soumission du dossier complet", status: "success" },
    { date: "16/05/26 - 09h22", title: "Tarifs reçus — Devis récupéré", description: "Formules disponibles — Documents téléchargés", status: "success" },
  ];
  return templates.slice(0, count);
}

/** Helper to make a guarantee cell detail. */
function gDetail(
  label: string,
  insurerId: string,
  insurerName: string,
  description: string,
  state: CellDetail["state"] = "extracted",
  opts: Partial<CellDetail> = {},
): CellDetail {
  return {
    title: label,
    covered: true,
    insurerId,
    insurerName,
    description,
    cellType: "guarantee",
    sources: SOURCES_CG,
    state,
    ...opts,
  };
}

// ─── Cotation entry (cotationsList) ────────────────────────────────

export const dupontDoCotation: Cotation = {
  id: "cot-dupont-do",
  cotationId: "COT-2026-0220",
  client: "Garage Dupont & Fils SARL",
  product: "D&O",
  productIcon: "shield",
  createdAt: "16/05/2026",
  createdVia: "email",
  insurers: [
    { id: "axa", name: "Axa", status: "completed", reference: "AXA-DO-1162", bestPrice: "799 €/an" },
    { id: "generali", name: "Generali", status: "completed", reference: "GEN-DO-3344", bestPrice: "870 €/an" },
    { id: "chubb", name: "Chubb", status: "completed", reference: "CHB-DO-2280", bestPrice: "720 €/an" },
  ],
};

// ─── Comparison task entry (comparisonTasks) ───────────────────────

export const dupontDoComparisonTask: ComparisonTask = {
  id: "cmp-dupont-do",
  cotationId: "cot-dupont-do",
  client: "Garage Dupont & Fils SARL",
  products: ["D&O"],
  principalProduct: "D&O",
  insurerIds: ["axa", "generali", "chubb"],
  createdBy: "Delphine",
  date: "16/05/2026",
  status: "done",
};

// ─── Followup entry (cotationFollowupMap) ──────────────────────────

export const dupontDoFollowupData: FollowupData = {
  cotation: dupontDoCotation,
  projectName: "D&O Garage Dupont & Fils 2026",
  emailSubject: "Cotation D&O — Garage Dupont & Fils SARL",
  scenarioId: "do",
  attachments: [
    { name: "Kbis_Garage_Dupont.pdf", size: "184 Ko", fieldsExtracted: 3 },
    { name: "Statuts_Dupont_2024.pdf", size: "620 Ko", fieldsExtracted: 4 },
    { name: "PV_AG_Dupont_2025.pdf", size: "215 Ko", fieldsExtracted: 2 },
  ],
  insurers: [
    {
      id: "axa", name: "Axa", logo: "🔴", logoColor: "#FF1721", hasCode: true,
      status: "completed", reference: "AXA-DO-1162",
      documents: ["Devis_Axa_DO_Dupont.pdf", "CG_DO_Axa.pdf"],
      pricing: [
        { formula: "Variante 1 — Jusqu'à 50 000 € couverture", details: [{ label: "Prime annuelle nette", value: "799 €/an" }] },
        { formula: "Variante 2 — Jusqu'à 100 000 € couverture", details: [{ label: "Prime annuelle nette", value: "1 100 €/an" }] },
        { formula: "Variante 3 — Jusqu'à 500 000 € couverture", details: [{ label: "Prime annuelle nette", value: "2 400 €/an" }] },
        { formula: "Variante 4 — Jusqu'à 1 000 000 € couverture", details: [{ label: "Prime annuelle nette", value: "4 200 €/an" }] },
      ],
      quoteInfo: [
        { label: "Référence devis", value: "AXA-DO-1162" },
        { label: "Client", value: "Garage Dupont & Fils SARL" },
        { label: "Produit", value: "D&O — Responsabilité des dirigeants" },
        { label: "Date d'effet", value: "01/07/2026" },
      ],
      allSteps: step("Axa", 7),
    },
    {
      id: "generali", name: "Generali", logo: "🦁", logoColor: "#C8102E", hasCode: true,
      status: "completed", reference: "GEN-DO-3344",
      documents: ["Devis_Generali_DO_Dupont.pdf", "CG_DO_Generali.pdf"],
      pricing: [
        { formula: "Variante 1 — Jusqu'à 50 000 € couverture", details: [{ label: "Prime annuelle nette", value: "870 €/an" }] },
        { formula: "Variante 2 — Jusqu'à 100 000 € couverture", details: [{ label: "Prime annuelle nette", value: "1 200 €/an" }] },
        { formula: "Variante 3 — Jusqu'à 500 000 € couverture", details: [{ label: "Prime annuelle nette", value: "2 500 €/an" }] },
        { formula: "Variante 4 — Jusqu'à 1 000 000 € couverture", details: [{ label: "Prime annuelle nette", value: "4 500 €/an" }] },
      ],
      quoteInfo: [
        { label: "Référence devis", value: "GEN-DO-3344" },
        { label: "Client", value: "Garage Dupont & Fils SARL" },
        { label: "Produit", value: "D&O — Responsabilité des dirigeants" },
        { label: "Date d'effet", value: "01/07/2026" },
      ],
      allSteps: step("Generali", 7),
    },
    {
      id: "chubb", name: "Chubb", logo: "🟡", logoColor: "#E8A317", hasCode: true,
      status: "completed", reference: "CHB-DO-2280",
      documents: ["Devis_Chubb_DO_Dupont.pdf", "CG_DO_Chubb.pdf"],
      pricing: [
        { formula: "Variante 1 — Jusqu'à 50 000 € couverture", details: [{ label: "Prime annuelle nette", value: "720 €/an" }] },
        { formula: "Variante 2 — Jusqu'à 100 000 € couverture", details: [{ label: "Prime annuelle nette", value: "950 €/an" }] },
        { formula: "Variante 3 — Jusqu'à 500 000 € couverture", details: [{ label: "Prime annuelle nette", value: "2 200 €/an" }] },
        { formula: "Variante 4 — Jusqu'à 1 000 000 € couverture", details: [{ label: "Prime annuelle nette", value: "3 900 €/an" }] },
      ],
      quoteInfo: [
        { label: "Référence devis", value: "CHB-DO-2280" },
        { label: "Client", value: "Garage Dupont & Fils SARL" },
        { label: "Produit", value: "D&O — Responsabilité des dirigeants" },
        { label: "Date d'effet", value: "01/07/2026" },
      ],
      allSteps: step("Chubb", 7),
    },
  ],
};

// ─── Comparison data ───────────────────────────────────────────────

export const dupontDoComparisonData: ComparisonData = {
  pricingVariants: [
    {
      id: "v1",
      label: "Variante 1 — Jusqu'à 50 000 € couverture",
      shortLabel: "50k",
      rows: [
        {
          label: "Prime annuelle nette",
          values: { axa: "799 €/an", generali: "870 €/an", chubb: "720 €/an" },
          isTotal: true,
        },
      ],
    },
    {
      id: "v2",
      label: "Variante 2 — Jusqu'à 100 000 € couverture",
      shortLabel: "100k",
      rows: [
        {
          label: "Prime annuelle nette",
          values: { axa: "1 100 €/an", generali: "1 200 €/an", chubb: "950 €/an" },
          isTotal: true,
        },
      ],
    },
    {
      id: "v3",
      label: "Variante 3 — Jusqu'à 500 000 € couverture",
      shortLabel: "500k",
      rows: [
        {
          label: "Prime annuelle nette",
          values: { axa: "2 400 €/an", generali: "2 500 €/an", chubb: "2 200 €/an" },
          isTotal: true,
        },
      ],
    },
    {
      id: "v4",
      label: "Variante 4 — Jusqu'à 1 000 000 € couverture",
      shortLabel: "1M",
      rows: [
        {
          label: "Prime annuelle nette",
          values: { axa: "4 200 €/an", generali: "4 500 €/an", chubb: "3 900 €/an" },
          isTotal: true,
        },
      ],
    },
  ],
  products: [
    {
      title: "D&O",
      subGroups: [
        // ─── Conditions financières ──────────────────────────────
        {
          title: "Conditions financières",
          rows: [
            {
              label: "Plafond global de garantie",
              values: {
                axa: { type: "text", value: "Selon variante" },
                generali: { type: "text", value: "Selon variante" },
                chubb: { type: "text", value: "Selon variante" },
              },
              details: {
                axa: gDetail("Plafond global", "axa", "Axa", "Plafond unique par sinistre et par période d'assurance, selon la variante de couverture choisie.", "extracted", {
                  mainLimit: "50k / 100k / 500k / 1M €",
                  sourceExtract: { snippet: "Le plafond de garantie est fixé à la somme déclarée aux Conditions Particulières, par sinistre et par année d'assurance.", page: "p.4, art. 3.1" },
                }),
                generali: gDetail("Plafond global", "generali", "Generali", "Plafond identique aux 4 variantes proposées par Generali.", "extracted", {
                  mainLimit: "50k / 100k / 500k / 1M €",
                }),
                chubb: gDetail("Plafond global", "chubb", "Chubb", "Plafond unique par sinistre, montant choisi à la souscription.", "extracted", {
                  mainLimit: "50k / 100k / 500k / 1M €",
                }),
              },
            },
            {
              label: "Franchise contractuelle",
              values: {
                axa: { type: "text", value: "5 000 €" },
                generali: { type: "text", value: "7 500 €" },
                chubb: { type: "text", value: "3 000 €" },
              },
              details: {
                axa: gDetail("Franchise", "axa", "Axa", "Franchise par sinistre.", "extracted", { mainDeductible: "5 000 €" }),
                // Override courtier : Generali franchise modifiée manuellement
                generali: gDetail("Franchise", "generali", "Generali", "Franchise par sinistre — modifiée par le courtier après négociation.", "override", {
                  mainDeductible: "7 500 €",
                  originalValue: { type: "text", value: "10 000 €" },
                }),
                chubb: gDetail("Franchise", "chubb", "Chubb", "Franchise par sinistre.", "extracted", { mainDeductible: "3 000 €" }),
              },
            },
            {
              label: "Rétroactivité",
              values: {
                axa: { type: "text", value: "Illimitée" },
                generali: { type: "text", value: "5 ans" },
                chubb: { type: "text", value: "Illimitée" },
              },
              details: {
                axa: gDetail("Rétroactivité", "axa", "Axa", "Couverture rétroactive sans limite de date.", "extracted"),
                generali: gDetail("Rétroactivité", "generali", "Generali", "Période rétroactive limitée à 5 ans avant la souscription.", "extracted"),
                chubb: gDetail("Rétroactivité", "chubb", "Chubb", "Couverture rétroactive illimitée.", "extracted"),
              },
            },
          ],
        },
        // ─── Responsabilité des dirigeants ───────────────────────
        {
          title: "Responsabilité des dirigeants",
          rows: [
            {
              label: "RC des mandataires sociaux",
              values: {
                axa: { type: "check" },
                generali: { type: "check" },
                chubb: { type: "check" },
              },
              details: {
                axa: gDetail("RC mandataires sociaux", "axa", "Axa", "Couverture des dirigeants pour fautes de gestion, erreurs et omissions.", "extracted"),
                generali: gDetail("RC mandataires sociaux", "generali", "Generali", "Protection des dirigeants contre les réclamations liées à leur gestion.", "extracted"),
                chubb: gDetail("RC mandataires sociaux", "chubb", "Chubb", "Couverture étendue incluant les dirigeants de fait.", "extracted"),
              },
            },
            {
              label: "Faute de gestion",
              values: {
                axa: { type: "check" },
                generali: { type: "check" },
                chubb: { type: "check" },
              },
              details: {
                axa: gDetail("Faute de gestion", "axa", "Axa", "Conséquences financières d'une faute de gestion reprochée au dirigeant.", "extracted"),
                generali: gDetail("Faute de gestion", "generali", "Generali", "Fautes civiles uniquement.", "extracted"),
                chubb: gDetail("Faute de gestion", "chubb", "Chubb", "Toutes fautes non intentionnelles couvertes.", "extracted"),
              },
            },
            {
              label: "Mise en cause patrimoine personnel",
              values: {
                axa: { type: "check" },
                generali: { type: "check" },
                chubb: { type: "check" },
              },
              details: {
                axa: gDetail("Mise en cause patrimoine", "axa", "Axa", "Protection du patrimoine personnel du dirigeant.", "extracted"),
                generali: gDetail("Mise en cause patrimoine", "generali", "Generali", "Garantie du patrimoine personnel.", "extracted"),
                chubb: gDetail("Mise en cause patrimoine", "chubb", "Chubb", "Patrimoine personnel et familial étendu.", "extracted"),
              },
            },
            {
              label: "Couverture des filiales",
              values: {
                axa: { type: "check" },
                generali: { type: "text", value: "Filiales > 50%" },
                chubb: { type: "check" },
              },
              details: {
                axa: gDetail("Couverture filiales", "axa", "Axa", "Filiales contrôlées directement ou indirectement.", "extracted"),
                generali: gDetail("Couverture filiales", "generali", "Generali", "Couverture sous condition de participation > 50%. À vérifier sur les filiales étrangères.", "extracted", {
                  sourceExtract: { snippet: "Les filiales dont la Société Mère détient plus de 50% du capital sont couvertes au présent contrat.", page: "p.6, art. 5.2" },
                }),
                chubb: gDetail("Couverture filiales", "chubb", "Chubb", "Toutes filiales couvertes sans seuil de participation.", "extracted"),
              },
            },
          ],
        },
        // ─── Défense pénale ──────────────────────────────────────
        {
          title: "Défense pénale",
          rows: [
            {
              label: "Frais de défense pénale",
              values: {
                axa: { type: "text", value: "150 000 €" },
                generali: { type: "text", value: "100 000 €" },
                chubb: { type: "text", value: "Plafond global" },
              },
              details: {
                axa: gDetail("Frais de défense pénale", "axa", "Axa", "Frais d'avocat et de procédure en cas de poursuites pénales.", "extracted", { mainLimit: "150 000 €" }),
                generali: gDetail("Frais de défense pénale", "generali", "Generali", "Couverture des frais de défense devant les juridictions pénales.", "extracted", { mainLimit: "100 000 €" }),
                chubb: gDetail("Frais de défense pénale", "chubb", "Chubb", "Frais de défense pénale sans sous-limite dédiée — imputés sur le plafond global.", "extracted"),
              },
            },
            {
              label: "Enquête administrative / AMF",
              values: {
                axa: { type: "text", value: "75 000 €" },
                // Non disponible — Generali ne propose pas cette garantie
                generali: { type: "empty" },
                // Extraction en cours — démo de l'état loading
                chubb: { type: "empty" },
              },
              details: {
                axa: gDetail("Enquête AMF", "axa", "Axa", "Couverture des frais liés aux enquêtes de l'AMF et autorités administratives.", "extracted", { mainLimit: "75 000 €" }),
                generali: gDetail("Enquête AMF", "generali", "Generali", "Garantie non proposée par Generali sur cette cotation.", "unavailable"),
                chubb: gDetail("Enquête AMF", "chubb", "Chubb", "Extraction en cours…", "extracting"),
              },
            },
            {
              label: "Caution pénale",
              values: {
                axa: { type: "text", value: "50 000 €" },
                generali: { type: "empty" },
                chubb: { type: "text", value: "100 000 €" },
              },
              details: {
                axa: gDetail("Caution pénale", "axa", "Axa", "Avance de la caution pénale — formulation à vérifier dans les CG.", "extracted", {
                  mainLimit: "50 000 €",
                  sourceExtract: { snippet: "L'Assureur peut, à sa discrétion, avancer le montant de la caution pénale jusqu'à la somme indiquée aux CP.", page: "p.9, art. 7.4" },
                }),
                generali: gDetail("Caution pénale", "generali", "Generali", "Non proposé par Generali sur cette cotation.", "unavailable"),
                chubb: gDetail("Caution pénale", "chubb", "Chubb", "Avance de caution pénale étendue.", "extracted", { mainLimit: "100 000 €" }),
              },
            },
          ],
        },
      ],
    },
  ],
  exclusions: [
    {
      id: "excl-dupont-do-1",
      label: "Faute intentionnelle ou dolosive",
      origin: "deterministic",
      values: { axa: { type: "exclu" }, generali: { type: "exclu" }, chubb: { type: "exclu" } },
      details: {
        axa: {
          title: "Faute intentionnelle",
          covered: false,
          insurerId: "axa",
          insurerName: "Axa",
          description: "Actes intentionnels ou frauduleux du dirigeant.",
          cellType: "exclusion",
          origin: "deterministic",
          exclusionId: "excl-dupont-do-1",
          sources: SOURCES_CG,
          state: "extracted",
        },
        generali: {
          title: "Faute intentionnelle",
          covered: false,
          insurerId: "generali",
          insurerName: "Generali",
          description: "Fautes intentionnelles ou dolosives exclues.",
          cellType: "exclusion",
          origin: "deterministic",
          exclusionId: "excl-dupont-do-1",
          sources: SOURCES_CG,
          state: "extracted",
        },
        chubb: {
          title: "Faute intentionnelle",
          covered: false,
          insurerId: "chubb",
          insurerName: "Chubb",
          description: "Tout acte intentionnel ou frauduleux.",
          cellType: "exclusion",
          origin: "deterministic",
          exclusionId: "excl-dupont-do-1",
          sources: SOURCES_CG,
          state: "extracted",
        },
      },
    },
    {
      id: "excl-dupont-do-2",
      label: "Avantages indus / rémunération non autorisée",
      origin: "ai",
      values: { axa: { type: "exclu" }, generali: { type: "exclu" }, chubb: { type: "exclu-text", value: "Sauf bonne foi" } },
      details: {
        axa: {
          title: "Avantages indus",
          covered: false,
          insurerId: "axa",
          insurerName: "Axa",
          description: "Rémunérations ou avantages obtenus en violation des statuts.",
          cellType: "exclusion",
          origin: "ai",
          exclusionId: "excl-dupont-do-2",
          sources: SOURCES_CG,
          state: "extracted",
        },
        generali: {
          title: "Avantages indus",
          covered: false,
          insurerId: "generali",
          insurerName: "Generali",
          description: "Rémunérations indues exclues sans exception.",
          cellType: "exclusion",
          origin: "ai",
          exclusionId: "excl-dupont-do-2",
          sources: SOURCES_CG,
          state: "extracted",
        },
        chubb: {
          title: "Avantages indus",
          covered: false,
          insurerId: "chubb",
          insurerName: "Chubb",
          description: "Exclusion sauf si le dirigeant établit sa bonne foi.",
          cellType: "exclusion",
          origin: "ai",
          exclusionId: "excl-dupont-do-2",
          sources: SOURCES_CG,
          state: "extracted",
        },
      },
    },
  ],
};
