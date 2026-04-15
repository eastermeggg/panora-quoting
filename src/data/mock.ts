// Mock data for the quoting assistant

export const currentUser = {
  name: "Delphine",
  cabinet: "Howden",
  avatar: "D",
  email: "delphine@howden.fr",
};

export const quotingEmail = {
  from: "contact@marble-tech.com",
  fromName: "Marie Dupont",
  to: "cotation+a7f3b2@panora.co",
  subject: "Cotation Panora RC Pro - Marble Tech SAS",
  date: "09/03/2026 à 14:32",
  body: `Bonjour,

Suite à notre échange téléphonique, je vous transmets les documents nécessaires pour la cotation RC Professionnelle de notre société Marble Tech SAS.

Vous trouverez en pièces jointes :
- Le Kbis de la société
- Le bilan 2025
- Le RIB

Notre activité principale est le développement de logiciels SaaS B2B. Nous avons actuellement 45 collaborateurs et un chiffre d'affaires de 3,2M€.

Le contrat actuel arrive à échéance le 01/04/2026, nous souhaitons obtenir des propositions compétitives.

Cordialement,
Marie Dupont
Directrice Administrative
Marble Tech SAS
SIREN: 00007U26464`,
  attachments: [
    { name: "Kbis_Marble_Tech.pdf", size: "245 Ko", fieldsExtracted: 2 },
    { name: "Bilan_2025_Marble_Tech.pdf", size: "1.2 Mo", fieldsExtracted: 2 },
    { name: "RIB_Marble_Tech.pdf", size: "89 Ko", fieldsExtracted: 2 },
  ],
};

export const cotationId = "COT-2026-0142";

export type InsurerAction = {
  date: string;
  title: string;
  description: string;
  status: "success" | "error" | "in_progress" | "pending";
};

export type ActionType = "manual" | "2fa_otp" | "2fa_push" | "2fa_expired";

export type TwoFaAction = {
  type: ActionType;
  title: string;
  desc: string;
  portalName: string;
  /** OTP-specific */
  channel?: "sms" | "email" | "totp";
  codeLength?: number;
  canResend?: boolean;
  /** ISO timestamp for expiration (OTP & push) */
  expiresAt?: string;
  interruptId?: string;
};

export type InsurerData = {
  id: string;
  name: string;
  logo: string;
  logoColor: string;
  hasCode: boolean;
  status: "completed" | "action_required" | "in_progress";
  reference: string;
  documents?: string[];
  pricing?: Array<{ formula: string; details: Array<{ label: string; value: string }> }>;
  quoteInfo?: Array<{ label: string; value: string }>;
  alertMessage?: string;
  alertDescription?: string;
  nextAction?: string;
  allSteps: InsurerAction[];
  initialVisibleSteps?: number;
  /** 2FA action data — when present, the action_required state uses this */
  twoFaAction?: TwoFaAction;
};

export const initialInsurers: InsurerData[] = [
  {
    id: "axa",
    name: "Axa",
    logo: "🔴",
    logoColor: "#FF1721",
    hasCode: true,
    status: "completed",
    reference: "4RGWBWMKEB",
    documents: [
      "Devis_Axa_RC_Pro_Marble_Tech.pdf",
      "Conditions_Generales_RC_Pro_Axa.pdf",
      "Tableau_Garanties_Axa.pdf",
    ],
    pricing: [
      { formula: "Essentielle", details: [{ label: "Prime annuelle", value: "810,52 €/an" }, { label: "Prime mensuelle", value: "87,71 €" }] },
      { formula: "Équilibre", details: [{ label: "Prime annuelle", value: "1 040,00 €/an" }, { label: "Prime mensuelle", value: "112,50 €" }] },
      { formula: "Étendue", details: [{ label: "Prime annuelle", value: "1 350,00 €/an" }, { label: "Prime mensuelle", value: "145,83 €" }] },
    ],
    quoteInfo: [
      { label: "Référence devis", value: "4RGWBWMKEB" },
      { label: "Client", value: "Marble Tech SAS" },
      { label: "Produit", value: "RC Professionnelle" },
      { label: "Date d'effet", value: "01/04/2026" },
      { label: "Plafond garanti", value: "1 000 000 €" },
      { label: "Franchise", value: "1 500 €" },
    ],
    allSteps: [
      { date: "10/03/26 - 14h32", title: "Lancement de la cotation", description: "Cotation RC Pro pour Marble Tech SAS", status: "success" },
      { date: "10/03/26 - 14h33", title: "Connexion à l'extranet Axa", description: "Authentification réussie", status: "success" },
      { date: "10/03/26 - 14h34", title: "Création du dossier client", description: "Client Marble Tech SAS créé — Réf: AXA-CL-90124", status: "success" },
      { date: "10/03/26 - 14h36", title: "Saisie des informations entreprise", description: "10 champs remplis — SIREN, activité, CA, effectif...", status: "success" },
      { date: "10/03/26 - 14h38", title: "Saisie des informations dirigeants", description: "2 dirigeants saisis avec coordonnées", status: "success" },
      { date: "10/03/26 - 14h40", title: "Upload des documents", description: "Kbis, Bilan 2025, RIB transmis", status: "success" },
      { date: "10/03/26 - 14h42", title: "Demande de tarification", description: "3 formules demandées", status: "success" },
      { date: "10/03/26 - 14h45", title: "Tarifs reçus — Devis récupéré", description: "3 formules disponibles — Documents téléchargés", status: "success" },
    ],
  },
  {
    id: "generali",
    name: "Generali",
    logo: "🦁",
    logoColor: "#C8102E",
    hasCode: true,
    status: "in_progress",
    reference: "GEN-2026-5523",
    initialVisibleSteps: 3,
    allSteps: [
      { date: "10/03/26 - 14h32", title: "Lancement de la cotation", description: "Cotation RC Pro pour Marble Tech SAS", status: "success" },
      { date: "10/03/26 - 14h33", title: "Connexion à l'extranet Generali", description: "Authentification réussie", status: "success" },
      { date: "10/03/26 - 14h34", title: "Création du dossier client", description: "Client créé — Réf: GEN-RR-9072", status: "success" },
      { date: "10/03/26 - 14h36", title: "Saisie des informations entreprise", description: "10 champs remplis — SIREN, activité, CA, effectif...", status: "success" },
      { date: "10/03/26 - 14h38", title: "Saisie des informations dirigeants", description: "2 dirigeants saisis avec coordonnées", status: "success" },
      { date: "10/03/26 - 14h40", title: "Upload des documents justificatifs", description: "Kbis, Bilan, RIB transmis", status: "success" },
      { date: "10/03/26 - 14h42", title: "Demande de tarification", description: "Soumission du dossier complet", status: "success" },
      { date: "10/03/26 - 14h45", title: "Tarifs reçus — Devis récupéré", description: "2 formules disponibles — Documents téléchargés", status: "success" },
    ],
    documents: [
      "Devis_Generali_RC_Pro_Marble_Tech.pdf",
      "Conditions_Generales_Generali.pdf",
    ],
    pricing: [
      { formula: "Standard", details: [{ label: "Prime annuelle", value: "1 140,00 €/an" }, { label: "Prime mensuelle", value: "95,00 €" }] },
      { formula: "Premium", details: [{ label: "Prime annuelle", value: "1 620,00 €/an" }, { label: "Prime mensuelle", value: "135,00 €" }] },
    ],
    quoteInfo: [
      { label: "Référence devis", value: "GEN-2026-5523" },
      { label: "Client", value: "Marble Tech SAS" },
      { label: "Produit", value: "RC Professionnelle" },
      { label: "Date d'effet", value: "01/04/2026" },
      { label: "Plafond garanti", value: "1 000 000 €" },
      { label: "Franchise", value: "2 000 €" },
    ],
  },
  {
    id: "allianz",
    name: "Allianz",
    logo: "🔵",
    logoColor: "#003781",
    hasCode: true,
    status: "action_required",
    reference: "ALZ-2026-8841",
    alertMessage: "Sélection du niveau de franchise requise",
    alertDescription: "Allianz propose 4 niveaux de franchise. L'agent ne peut pas choisir à votre place. Connectez-vous sur l'extranet Allianz, sélectionnez le niveau de franchise souhaité, puis cliquez sur \"J'ai validé\" ci-dessous.",
    nextAction: "L'agent récupérera le tarif et les documents de devis.",
    allSteps: [
      { date: "10/03/26 - 14h32", title: "Lancement de la cotation", description: "Cotation RC Pro pour Marble Tech SAS", status: "success" },
      { date: "10/03/26 - 14h33", title: "Connexion à l'extranet Allianz", description: "Authentification réussie", status: "success" },
      { date: "10/03/26 - 14h35", title: "Création du dossier client", description: "Client créé — Réf: ALZ-CL-8841", status: "success" },
      { date: "10/03/26 - 14h37", title: "Saisie des informations entreprise", description: "10 champs remplis", status: "success" },
      { date: "10/03/26 - 14h39", title: "Saisie des informations dirigeants", description: "2 dirigeants saisis", status: "success" },
      { date: "10/03/26 - 14h41", title: "Upload des documents", description: "Kbis, Bilan, RIB transmis", status: "success" },
      { date: "10/03/26 - 14h42", title: "En attente — Action courtier requise", description: "Sélection du niveau de franchise nécessaire sur l'extranet", status: "error" },
    ],
    // These get used after validation
    documents: [
      "Devis_Allianz_RC_Pro_Marble_Tech.pdf",
      "Conditions_Generales_Allianz.pdf",
    ],
    pricing: [
      { formula: "Confort", details: [{ label: "Prime annuelle", value: "1 224,00 €/an" }, { label: "Prime mensuelle", value: "102,00 €" }] },
      { formula: "Confort+", details: [{ label: "Prime annuelle", value: "1 542,00 €/an" }, { label: "Prime mensuelle", value: "128,50 €" }] },
    ],
    quoteInfo: [
      { label: "Référence devis", value: "ALZ-2026-8841" },
      { label: "Client", value: "Marble Tech SAS" },
      { label: "Produit", value: "RC Professionnelle" },
      { label: "Date d'effet", value: "01/04/2026" },
      { label: "Plafond garanti", value: "1 000 000 €" },
      { label: "Franchise", value: "1 000 €" },
    ],
  },
];

export const availableInsurers = [
  { id: "axa", name: "Axa", logo: "🔴", hasCode: true },
  { id: "allianz", name: "Allianz", logo: "🔵", hasCode: true },
  { id: "generali", name: "Generali", logo: "🦁", hasCode: true },
  { id: "chubb", name: "Chubb", logo: "⬛", hasCode: true },
  { id: "maif", name: "MAIF", logo: "🟢", hasCode: true },
  { id: "assureur1", name: "Assureur Sans Code 1", logo: "", hasCode: false },
  { id: "assureur2", name: "Assureur Sans Code 2", logo: "", hasCode: false },
];

export const extractedData = {
  entreprise: {
    label: "Entreprise",
    status: "complete" as const,
    fields: [
      { label: "Raison sociale", value: "Marble Tech SAS" },
      { label: "SIREN", value: "00007U26464" },
      { label: "Activité", value: "Développement logiciels SaaS B2B" },
      { label: "Chiffre d'affaires", value: "3 200 000 €" },
      { label: "Effectif", value: "45 collaborateurs" },
    ],
  },
  dirigeant1: {
    label: "Dirigeant 1",
    status: "incomplete" as const,
    missingCount: 2,
    fields: [
      { label: "Nom", value: "Meghan", status: "ok" as const },
      { label: "Prénom", value: "", status: "missing" as const },
      { label: "Date de naissance", value: "JJ/MM/AAAA", status: "ok" as const },
      { label: "Nationalité", value: "F", status: "ok" as const },
      { label: "E-mail", value: "", status: "missing" as const },
      { label: "Téléphone", value: "06 87 58 41 17", status: "ok" as const },
    ],
  },
  dirigeant2: {
    label: "Dirigeant 2",
    status: "invalid" as const,
    invalidCount: 1,
    fields: [
      { label: "Nom", value: "Fabian", status: "ok" as const },
      { label: "Prénom", value: "Langlet", status: "ok" as const },
      { label: "Date de naissance", value: "JJ/MM/AAAA", status: "ok" as const },
      { label: "Nationalité", value: "F", status: "ok" as const },
      { label: "E-mail", value: "gcdjasjshk", status: "invalid" as const, error: "Email invalide" },
      { label: "Téléphone", value: "06 87 58 41 17", status: "ok" as const },
    ],
  },
  contratActuel: {
    label: "Contrat actuel",
    status: "complete" as const,
    fields: [
      { label: "Assureur actuel", value: "Generali" },
      { label: "N° de contrat", value: "GEN-2025-44102" },
      { label: "Échéance", value: "01/04/2026" },
      { label: "Prime annuelle", value: "2 340,00 €" },
    ],
  },
};

// Cotation statuses for the kanban/table view
export type CotationStatus = "preparation" | "en_cours" | "terminee";

export type CotationInsurerStatus = "completed" | "action_required" | "in_progress" | "pending";

export type CotationInsurer = {
  id: string;
  name: string;
  status: CotationInsurerStatus;
  reference?: string;
  bestPrice?: string;
};

export type Cotation = {
  id: string;
  cotationId: string;
  client: string;
  product: string;
  productIcon: "car" | "shield" | "building";
  createdAt: string;
  createdVia: "email" | "manual";
  insurers: CotationInsurer[];
};

export function getCotationStatus(cotation: Cotation): CotationStatus {
  const statuses = cotation.insurers.map((i) => i.status);
  if (statuses.every((s) => s === "pending")) return "preparation";
  if (statuses.every((s) => s === "completed")) return "terminee";
  return "en_cours";
}

export const cotationsList: Cotation[] = [
  {
    id: "cot-1",
    cotationId: "COT-2026-0142",
    client: "Marble Tech SAS",
    product: "RC Professionnelle",
    productIcon: "shield",
    createdAt: "09/03/2026",
    createdVia: "email",
    insurers: [
      { id: "axa", name: "Axa", status: "completed", reference: "4RGWBWMKEB", bestPrice: "810,52 €/an" },
      { id: "generali", name: "Generali", status: "in_progress", reference: "GEN-2026-5523" },
      { id: "allianz", name: "Allianz", status: "action_required", reference: "ALZ-2026-8841" },
    ],
  },
  {
    id: "cot-2",
    cotationId: "COT-2026-0139",
    client: "Acme Corp",
    product: "Flotte automobile",
    productIcon: "car",
    createdAt: "07/03/2026",
    createdVia: "email",
    insurers: [
      { id: "axa", name: "Axa", status: "completed", reference: "AXA-FL-2211", bestPrice: "4 200,00 €/an" },
      { id: "allianz", name: "Allianz", status: "completed", reference: "ALZ-FL-8877", bestPrice: "3 980,00 €/an" },
      { id: "generali", name: "Generali", status: "completed", reference: "GEN-FL-1124", bestPrice: "4 450,00 €/an" },
    ],
  },
  {
    id: "cot-3",
    cotationId: "COT-2026-0145",
    client: "TechVision SAS",
    product: "RC Professionnelle",
    productIcon: "shield",
    createdAt: "10/03/2026",
    createdVia: "email",
    insurers: [
      { id: "axa", name: "Axa", status: "pending" },
      { id: "chubb", name: "Chubb", status: "pending" },
    ],
  },
  {
    id: "cot-4",
    cotationId: "COT-2026-0146",
    client: "GreenWay Industries",
    product: "Multirisque bureaux",
    productIcon: "building",
    createdAt: "10/03/2026",
    createdVia: "manual",
    insurers: [
      { id: "axa", name: "Axa", status: "action_required", reference: "AXA-MR-0091" },
      { id: "maif", name: "MAIF", status: "completed", reference: "MAIF-MR-4402", bestPrice: "1 850,00 €/an" },
      { id: "generali", name: "Generali", status: "action_required", reference: "GEN-MR-2201" },
    ],
  },
  {
    id: "cot-5",
    cotationId: "COT-2026-0135",
    client: "Digital Solutions SARL",
    product: "RC Professionnelle",
    productIcon: "shield",
    createdAt: "04/03/2026",
    createdVia: "email",
    insurers: [
      { id: "axa", name: "Axa", status: "completed", reference: "AXA-RC-7711", bestPrice: "920,00 €/an" },
      { id: "allianz", name: "Allianz", status: "completed", reference: "ALZ-RC-3302", bestPrice: "875,00 €/an" },
    ],
  },
  {
    id: "cot-7",
    cotationId: "COT-2026-0151",
    client: "Dupont SA",
    product: "Santé collective",
    productIcon: "shield",
    createdAt: "14/04/2026",
    createdVia: "email",
    insurers: [
      { id: "alan", name: "Alan", status: "completed", reference: "ALN-SC-2201", bestPrice: "82,50 €/pers/mois" },
      { id: "malakoff", name: "Malakoff Humanis", status: "completed", reference: "MH-SC-4410", bestPrice: "78,30 €/pers/mois" },
      { id: "generali", name: "Generali", status: "completed", reference: "GEN-SC-7703", bestPrice: "85,00 €/pers/mois" },
    ],
  },
  {
    id: "cot-6",
    cotationId: "COT-2026-0148",
    client: "LegalPlace SAS",
    product: "Prévoyance / AT",
    productIcon: "shield",
    createdAt: "12/04/2026",
    createdVia: "email",
    insurers: [
      { id: "generali", name: "Generali", status: "completed", reference: "GEN-AT-5501", bestPrice: "1.85%" },
      { id: "axa", name: "Axa", status: "completed", reference: "AXA-AT-3344", bestPrice: "1.72%" },
      { id: "allianz", name: "Allianz", status: "completed", reference: "ALZ-AT-9920", bestPrice: "1.90%" },
    ],
  },
];

// ─── Followup data per cotation ───────────────────────────────────────
// Maps cotation IDs to their detailed insurer data for the followup page.

export type FollowupData = {
  cotation: Cotation;
  projectName: string;
  emailSubject: string;
  insurers: InsurerData[];
  scenarioId: string;
  attachments: Array<{ name: string; size: string; fieldsExtracted: number }>;
};

function makeSteps(insurerName: string, count: number): InsurerAction[] {
  const templates: InsurerAction[] = [
    { date: "10/03/26 - 14h32", title: "Lancement de la cotation", description: `Cotation lancée`, status: "success" },
    { date: "10/03/26 - 14h33", title: `Connexion à l'extranet ${insurerName}`, description: "Authentification réussie", status: "success" },
    { date: "10/03/26 - 14h34", title: "Création du dossier client", description: "Client créé avec succès", status: "success" },
    { date: "10/03/26 - 14h36", title: "Saisie des informations", description: "Champs remplis automatiquement", status: "success" },
    { date: "10/03/26 - 14h38", title: "Upload des documents", description: "Documents transmis", status: "success" },
    { date: "10/03/26 - 14h40", title: "Demande de tarification", description: "Soumission du dossier complet", status: "success" },
    { date: "10/03/26 - 14h42", title: "Tarifs reçus — Devis récupéré", description: "Formules disponibles — Documents téléchargés", status: "success" },
  ];
  return templates.slice(0, count);
}

const cotationFollowupMap: Record<string, FollowupData> = {
  "cot-1": {
    cotation: cotationsList[0],
    projectName: "RC Pro Marble Tech 2026",
    emailSubject: "Cotation Panora RC Pro - Marble Tech SAS",
    scenarioId: "rc-pro",
    attachments: [
      { name: "Kbis_Marble_Tech.pdf", size: "245 Ko", fieldsExtracted: 4 },
      { name: "Bilan_2025_Marble_Tech.pdf", size: "1.2 Mo", fieldsExtracted: 3 },
      { name: "RIB_Marble_Tech.pdf", size: "89 Ko", fieldsExtracted: 1 },
    ],
    insurers: initialInsurers,
  },
  "cot-2": {
    cotation: cotationsList[1],
    projectName: "Flotte Auto ACME 2026",
    emailSubject: "Renouvellement flotte automobile 2026 - ACME Corp",
    scenarioId: "flotte-auto",
    attachments: [
      { name: "Releve_Info_Flotte_ACME.pdf", size: "1.8 Mo", fieldsExtracted: 8 },
      { name: "Cartes_Grises_Parc_2026.pdf", size: "3.4 Mo", fieldsExtracted: 5 },
      { name: "Attestation_Sinistralite_3ans.pdf", size: "520 Ko", fieldsExtracted: 6 },
    ],
    insurers: [
      {
        id: "axa", name: "Axa", logo: "🔴", logoColor: "#FF1721", hasCode: true,
        status: "completed", reference: "AXA-FL-2211",
        documents: ["Devis_Axa_Flotte_ACME.pdf", "Conditions_Generales_Flotte_Axa.pdf"],
        pricing: [
          { formula: "Tiers étendu", details: [{ label: "Prime annuelle", value: "3 540,00 €/an" }, { label: "Prime mensuelle", value: "295,00 €" }] },
          { formula: "Tous risques", details: [{ label: "Prime annuelle", value: "4 200,00 €/an" }, { label: "Prime mensuelle", value: "350,00 €" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "AXA-FL-2211" },
          { label: "Client", value: "ACME Corp SAS" },
          { label: "Produit", value: "Flotte automobile" },
          { label: "Date d'effet", value: "15/06/2026" },
          { label: "Nb véhicules", value: "44" },
          { label: "Franchise", value: "500 € / sinistre" },
        ],
        allSteps: makeSteps("Axa", 7),
      },
      {
        id: "allianz", name: "Allianz", logo: "🔵", logoColor: "#003781", hasCode: true,
        status: "completed", reference: "ALZ-FL-8877",
        documents: ["Devis_Allianz_Flotte_ACME.pdf", "Tableau_Garanties_Allianz.pdf"],
        pricing: [
          { formula: "Tiers étendu", details: [{ label: "Prime annuelle", value: "3 300,00 €/an" }, { label: "Prime mensuelle", value: "275,00 €" }] },
          { formula: "Tous risques", details: [{ label: "Prime annuelle", value: "3 980,00 €/an" }, { label: "Prime mensuelle", value: "331,67 €" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "ALZ-FL-8877" },
          { label: "Client", value: "ACME Corp SAS" },
          { label: "Produit", value: "Flotte automobile" },
          { label: "Date d'effet", value: "15/06/2026" },
          { label: "Nb véhicules", value: "44" },
          { label: "Franchise", value: "750 € / sinistre" },
        ],
        allSteps: makeSteps("Allianz", 7),
      },
      {
        id: "generali", name: "Generali", logo: "🦁", logoColor: "#C8102E", hasCode: true,
        status: "completed", reference: "GEN-FL-1124",
        documents: ["Devis_Generali_Flotte_ACME.pdf"],
        pricing: [
          { formula: "Standard", details: [{ label: "Prime annuelle", value: "3 840,00 €/an" }, { label: "Prime mensuelle", value: "320,00 €" }] },
          { formula: "Premium", details: [{ label: "Prime annuelle", value: "4 450,00 €/an" }, { label: "Prime mensuelle", value: "370,83 €" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "GEN-FL-1124" },
          { label: "Client", value: "ACME Corp SAS" },
          { label: "Produit", value: "Flotte automobile" },
          { label: "Date d'effet", value: "15/06/2026" },
          { label: "Nb véhicules", value: "44" },
          { label: "Franchise", value: "500 € / sinistre" },
        ],
        allSteps: makeSteps("Generali", 7),
      },
    ],
  },
  "cot-7": {
    cotation: cotationsList[6],
    projectName: "Santé Collective Dupont SA 2026",
    emailSubject: "Cotation Santé Collective - Dupont SA",
    scenarioId: "sante-collective",
    attachments: [
      { name: "Kbis_Dupont_SA.pdf", size: "210 Ko", fieldsExtracted: 3 },
      { name: "DUE_Mutuelle_Dupont.pdf", size: "450 Ko", fieldsExtracted: 5 },
      { name: "Effectifs_2025_Dupont.pdf", size: "320 Ko", fieldsExtracted: 8 },
    ],
    insurers: [
      {
        id: "alan", name: "Alan", logo: "💜", logoColor: "#6C5CE7", hasCode: true,
        status: "completed", reference: "ALN-SC-2201",
        documents: ["Devis_Alan_Sante_Dupont.pdf", "Tableau_Garanties_Alan.pdf"],
        pricing: [
          { formula: "Formule Confort", details: [{ label: "Tarif cadre isolé", value: "82,50 €/pers/mois" }, { label: "Tarif non-cadre isolé", value: "62,00 €/pers/mois" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "ALN-SC-2201" },
          { label: "Client", value: "Dupont SA" },
          { label: "Produit", value: "Santé collective" },
          { label: "Date d'effet", value: "01/01/2027" },
          { label: "Convention", value: "Syntec — IDCC 1486" },
        ],
        allSteps: makeSteps("Alan", 7),
      },
      {
        id: "malakoff", name: "Malakoff Humanis", logo: "🟠", logoColor: "#E67E22", hasCode: true,
        status: "completed", reference: "MH-SC-4410",
        documents: ["Devis_Malakoff_Sante_Dupont.pdf", "CG_Malakoff_Sante.pdf"],
        pricing: [
          { formula: "Formule Équilibre", details: [{ label: "Tarif cadre isolé", value: "78,30 €/pers/mois" }, { label: "Tarif non-cadre isolé", value: "59,80 €/pers/mois" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "MH-SC-4410" },
          { label: "Client", value: "Dupont SA" },
          { label: "Produit", value: "Santé collective" },
          { label: "Date d'effet", value: "01/01/2027" },
          { label: "Convention", value: "Syntec — IDCC 1486" },
        ],
        allSteps: makeSteps("Malakoff Humanis", 7),
      },
      {
        id: "generali", name: "Generali", logo: "🦁", logoColor: "#C8102E", hasCode: true,
        status: "completed", reference: "GEN-SC-7703",
        documents: ["Devis_Generali_Sante_Dupont.pdf"],
        pricing: [
          { formula: "Formule Vitalité", details: [{ label: "Tarif cadre isolé", value: "85,00 €/pers/mois" }, { label: "Tarif non-cadre isolé", value: "64,50 €/pers/mois" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "GEN-SC-7703" },
          { label: "Client", value: "Dupont SA" },
          { label: "Produit", value: "Santé collective" },
          { label: "Date d'effet", value: "01/01/2027" },
          { label: "Convention", value: "Syntec — IDCC 1486" },
        ],
        allSteps: makeSteps("Generali", 7),
      },
    ],
  },
  "cot-6": {
    cotation: cotationsList[5],
    projectName: "Prévoyance AT LegalPlace 2026",
    emailSubject: "Cotation Prévoyance AT - LegalPlace SAS",
    scenarioId: "prevoyance-at",
    attachments: [
      { name: "Kbis_LegalPlace.pdf", size: "220 Ko", fieldsExtracted: 3 },
      { name: "Masse_Salariale_2025_LegalPlace.pdf", size: "890 Ko", fieldsExtracted: 6 },
      { name: "Convention_Collective_Syntec.pdf", size: "1.5 Mo", fieldsExtracted: 4 },
    ],
    insurers: [
      {
        id: "generali", name: "Generali", logo: "🦁", logoColor: "#C8102E", hasCode: true,
        status: "completed", reference: "GEN-AT-5501",
        documents: ["Devis_Generali_AT_LegalPlace.pdf", "Conditions_Generales_Prevoyance_Generali.pdf"],
        pricing: [
          { formula: "Formule Standard", details: [{ label: "Taux global", value: "1,85 % de la MS" }, { label: "Cotisation estimée", value: "À calculer" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "GEN-AT-5501" },
          { label: "Client", value: "LegalPlace SAS" },
          { label: "Produit", value: "Prévoyance / AT" },
          { label: "Date d'effet", value: "01/07/2026" },
          { label: "Convention", value: "Syntec — IDCC 1486" },
        ],
        allSteps: makeSteps("Generali", 7),
      },
      {
        id: "axa", name: "Axa", logo: "🔴", logoColor: "#FF1721", hasCode: true,
        status: "completed", reference: "AXA-AT-3344",
        documents: ["Devis_Axa_AT_LegalPlace.pdf", "Tableau_Garanties_Axa_AT.pdf"],
        pricing: [
          { formula: "Formule Confort", details: [{ label: "Taux global", value: "1,72 % de la MS" }, { label: "Cotisation estimée", value: "À calculer" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "AXA-AT-3344" },
          { label: "Client", value: "LegalPlace SAS" },
          { label: "Produit", value: "Prévoyance / AT" },
          { label: "Date d'effet", value: "01/07/2026" },
          { label: "Convention", value: "Syntec — IDCC 1486" },
        ],
        allSteps: makeSteps("Axa", 7),
      },
      {
        id: "allianz", name: "Allianz", logo: "🔵", logoColor: "#003781", hasCode: true,
        status: "completed", reference: "ALZ-AT-9920",
        documents: ["Devis_Allianz_AT_LegalPlace.pdf"],
        pricing: [
          { formula: "Formule Essentielle", details: [{ label: "Taux global", value: "1,90 % de la MS" }, { label: "Cotisation estimée", value: "À calculer" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "ALZ-AT-9920" },
          { label: "Client", value: "LegalPlace SAS" },
          { label: "Produit", value: "Prévoyance / AT" },
          { label: "Date d'effet", value: "01/07/2026" },
          { label: "Convention", value: "Syntec — IDCC 1486" },
        ],
        allSteps: makeSteps("Allianz", 7),
      },
    ],
  },
  "cot-3": {
    cotation: cotationsList[2],
    projectName: "RC Pro TechVision 2026",
    emailSubject: "Devis RC Pro urgence - TechVision SAS",
    scenarioId: "rc-pro",
    attachments: [
      { name: "Kbis_TechVision.pdf", size: "210 Ko", fieldsExtracted: 3 },
      { name: "Bilan_2025_TechVision.pdf", size: "980 Ko", fieldsExtracted: 2 },
    ],
    insurers: [
      {
        id: "axa", name: "Axa", logo: "🔴", logoColor: "#FF1721", hasCode: true,
        status: "completed", reference: "AXA-RC-9912",
        documents: ["Devis_Axa_RC_Pro_TechVision.pdf", "Conditions_Generales_Axa.pdf"],
        pricing: [
          { formula: "Essentielle", details: [{ label: "Prime annuelle", value: "820,00 €/an" }, { label: "Prime mensuelle", value: "68,33 €" }] },
          { formula: "Étendue", details: [{ label: "Prime annuelle", value: "1 180,00 €/an" }, { label: "Prime mensuelle", value: "98,33 €" }] },
        ],
        allSteps: makeSteps("Axa", 7),
        quoteInfo: [
          { label: "Référence devis", value: "AXA-RC-9912" },
          { label: "Client", value: "TechVision SAS" },
          { label: "Produit", value: "RC Professionnelle" },
          { label: "Date d'effet", value: "01/05/2026" },
          { label: "Plafond garanti", value: "500 000 €" },
          { label: "Franchise", value: "1 000 €" },
        ],
      },
      {
        id: "chubb", name: "Chubb", logo: "⬛", logoColor: "#000", hasCode: true,
        status: "completed", reference: "CHB-RC-4401",
        documents: ["Devis_Chubb_RC_Pro_TechVision.pdf", "Tableau_Garanties_Chubb.pdf"],
        pricing: [
          { formula: "Standard", details: [{ label: "Prime annuelle", value: "1 020,00 €/an" }, { label: "Prime mensuelle", value: "85,00 €" }] },
          { formula: "Premium", details: [{ label: "Prime annuelle", value: "1 450,00 €/an" }, { label: "Prime mensuelle", value: "120,83 €" }] },
        ],
        allSteps: makeSteps("Chubb", 7),
        quoteInfo: [
          { label: "Référence devis", value: "CHB-RC-4401" },
          { label: "Client", value: "TechVision SAS" },
          { label: "Produit", value: "RC Professionnelle" },
          { label: "Date d'effet", value: "01/05/2026" },
          { label: "Plafond garanti", value: "500 000 €" },
          { label: "Franchise", value: "1 500 €" },
        ],
      },
    ],
  },
  "cot-4": {
    cotation: cotationsList[3],
    projectName: "Multirisque GreenWay 2026",
    emailSubject: "Demande de cotation multirisque bureaux - GreenWay",
    scenarioId: "rc-pro",
    attachments: [
      { name: "Bail_Commercial_GreenWay.pdf", size: "1.5 Mo", fieldsExtracted: 5 },
      { name: "Plan_Locaux_2026.pdf", size: "2.1 Mo", fieldsExtracted: 3 },
    ],
    insurers: [
      {
        id: "axa", name: "Axa", logo: "🔴", logoColor: "#FF1721", hasCode: true,
        status: "action_required", reference: "AXA-MR-0091",
        twoFaAction: {
          type: "2fa_otp",
          title: "Code de vérification requis",
          desc: "AXA demande un code à 6 chiffres envoyé par e-mail à d••••e@howden.fr.",
          portalName: "AXA",
          channel: "email",
          codeLength: 6,
          canResend: true,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          interruptId: "int-axa-otp-001",
        },
        documents: ["Devis_Axa_Multirisque_GreenWay.pdf", "Conditions_Generales_MR_Axa.pdf"],
        pricing: [
          { formula: "Essentielle", details: [{ label: "Prime annuelle", value: "1 710,00 €/an" }, { label: "Prime mensuelle", value: "142,50 €" }] },
          { formula: "Confort", details: [{ label: "Prime annuelle", value: "2 140,00 €/an" }, { label: "Prime mensuelle", value: "178,33 €" }] },
          { formula: "Étendue", details: [{ label: "Prime annuelle", value: "2 580,00 €/an" }, { label: "Prime mensuelle", value: "215,00 €" }] },
        ],
        allSteps: [
          { date: "13/03/26 - 09h15", title: "Connexion extranet AXA", description: "Authentification en cours", status: "success" },
          { date: "13/03/26 - 09h15", title: "Identifiants acceptés", description: "Credentials validés par le portail", status: "success" },
          { date: "13/03/26 - 09h16", title: "Agent en attente — Code 2FA requis", description: "Un code a été envoyé par e-mail à d••••e@howden.fr. L'agent ne peut pas continuer sans ce code.", status: "error" },
          { date: "13/03/26 - 09h17", title: "Code 2FA validé", description: "Authentification complète", status: "success" },
          { date: "13/03/26 - 09h18", title: "Création du dossier client", description: "Client GreenWay Industries créé", status: "success" },
          { date: "13/03/26 - 09h20", title: "Saisie des informations", description: "Champs remplis automatiquement", status: "success" },
          { date: "13/03/26 - 09h22", title: "Upload des documents", description: "Bail commercial et plan des locaux transmis", status: "success" },
          { date: "13/03/26 - 09h24", title: "Tarifs reçus — Devis récupéré", description: "3 formules disponibles — Documents téléchargés", status: "success" },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "AXA-MR-0091" },
          { label: "Client", value: "GreenWay Industries" },
          { label: "Produit", value: "Multirisque bureaux" },
          { label: "Date d'effet", value: "01/05/2026" },
          { label: "Surface assurée", value: "450 m²" },
          { label: "Franchise", value: "500 €" },
        ],
      },
      {
        id: "maif", name: "MAIF", logo: "🟢", logoColor: "#00A651", hasCode: true,
        status: "completed", reference: "MAIF-MR-4402",
        documents: ["Devis_MAIF_Multirisque_GreenWay.pdf"],
        pricing: [
          { formula: "Confort", details: [{ label: "Prime annuelle", value: "1 850,00 €/an" }, { label: "Prime mensuelle", value: "154,17 €" }] },
          { formula: "Sérénité", details: [{ label: "Prime annuelle", value: "2 340,00 €/an" }, { label: "Prime mensuelle", value: "195,00 €" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "MAIF-MR-4402" },
          { label: "Client", value: "GreenWay Industries" },
          { label: "Produit", value: "Multirisque bureaux" },
          { label: "Date d'effet", value: "01/05/2026" },
          { label: "Surface assurée", value: "450 m²" },
          { label: "Franchise", value: "300 €" },
        ],
        allSteps: makeSteps("MAIF", 7),
      },
      {
        id: "generali", name: "Generali", logo: "🦁", logoColor: "#C8102E", hasCode: true,
        status: "action_required", reference: "GEN-MR-2201",
        twoFaAction: {
          type: "2fa_otp",
          title: "Code de vérification requis",
          desc: "Generali demande un code à 6 chiffres envoyé par SMS au 06 •• •• 42.",
          portalName: "Generali",
          channel: "sms",
          codeLength: 6,
          canResend: false,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          interruptId: "int-gen-otp-001",
        },
        documents: ["Devis_Generali_Multirisque_GreenWay.pdf", "Conditions_Generales_MR_Generali.pdf"],
        pricing: [
          { formula: "Standard", details: [{ label: "Prime annuelle", value: "1 980,00 €/an" }, { label: "Prime mensuelle", value: "165,00 €" }] },
          { formula: "Premium", details: [{ label: "Prime annuelle", value: "2 500,00 €/an" }, { label: "Prime mensuelle", value: "208,33 €" }] },
        ],
        allSteps: [
          { date: "13/03/26 - 09h12", title: "Connexion extranet Generali", description: "Authentification en cours", status: "success" },
          { date: "13/03/26 - 09h12", title: "Identifiants acceptés", description: "Credentials validés par le portail", status: "success" },
          { date: "13/03/26 - 09h13", title: "Agent en attente — Code 2FA requis", description: "Un code a été envoyé par SMS au 06 •• •• 42. L'agent ne peut pas continuer sans ce code.", status: "error" },
          { date: "13/03/26 - 09h14", title: "Code 2FA validé", description: "Authentification complète", status: "success" },
          { date: "13/03/26 - 09h15", title: "Création du dossier client", description: "Client GreenWay Industries créé", status: "success" },
          { date: "13/03/26 - 09h17", title: "Saisie des informations", description: "Champs remplis automatiquement", status: "success" },
          { date: "13/03/26 - 09h19", title: "Upload des documents", description: "Bail commercial et plan des locaux transmis", status: "success" },
          { date: "13/03/26 - 09h21", title: "Tarifs reçus — Devis récupéré", description: "2 formules disponibles — Documents téléchargés", status: "success" },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "GEN-MR-2201" },
          { label: "Client", value: "GreenWay Industries" },
          { label: "Produit", value: "Multirisque bureaux" },
          { label: "Date d'effet", value: "01/05/2026" },
          { label: "Surface assurée", value: "450 m²" },
          { label: "Franchise", value: "400 €" },
        ],
      },
    ],
  },
  "cot-5": {
    cotation: cotationsList[4],
    projectName: "RC Pro Digital Solutions 2026",
    emailSubject: "Cotation RC Pro - Digital Solutions SARL",
    scenarioId: "rc-pro",
    attachments: [
      { name: "Kbis_Digital_Solutions.pdf", size: "195 Ko", fieldsExtracted: 3 },
      { name: "Bilan_2025_Digital_Solutions.pdf", size: "1.1 Mo", fieldsExtracted: 2 },
    ],
    insurers: [
      {
        id: "axa", name: "Axa", logo: "🔴", logoColor: "#FF1721", hasCode: true,
        status: "completed", reference: "AXA-RC-7711",
        documents: ["Devis_Axa_RC_Pro_Digital_Solutions.pdf", "Conditions_Generales_Axa.pdf"],
        pricing: [
          { formula: "Essentielle", details: [{ label: "Prime annuelle", value: "920,00 €/an" }, { label: "Prime mensuelle", value: "76,67 €" }] },
          { formula: "Étendue", details: [{ label: "Prime annuelle", value: "1 320,00 €/an" }, { label: "Prime mensuelle", value: "110,00 €" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "AXA-RC-7711" },
          { label: "Client", value: "Digital Solutions SARL" },
          { label: "Produit", value: "RC Professionnelle" },
          { label: "Date d'effet", value: "01/05/2026" },
          { label: "Plafond garanti", value: "500 000 €" },
          { label: "Franchise", value: "1 000 €" },
        ],
        allSteps: makeSteps("Axa", 7),
      },
      {
        id: "allianz", name: "Allianz", logo: "🔵", logoColor: "#003781", hasCode: true,
        status: "completed", reference: "ALZ-RC-3302",
        documents: ["Devis_Allianz_RC_Pro_Digital_Solutions.pdf"],
        pricing: [
          { formula: "Standard", details: [{ label: "Prime annuelle", value: "875,00 €/an" }, { label: "Prime mensuelle", value: "72,92 €" }] },
          { formula: "Premium", details: [{ label: "Prime annuelle", value: "1 260,00 €/an" }, { label: "Prime mensuelle", value: "105,00 €" }] },
        ],
        quoteInfo: [
          { label: "Référence devis", value: "ALZ-RC-3302" },
          { label: "Client", value: "Digital Solutions SARL" },
          { label: "Produit", value: "RC Professionnelle" },
          { label: "Date d'effet", value: "01/05/2026" },
          { label: "Plafond garanti", value: "500 000 €" },
          { label: "Franchise", value: "1 500 €" },
        ],
        allSteps: makeSteps("Allianz", 7),
      },
    ],
  },
};

export function getFollowupData(cotationId: string): FollowupData | undefined {
  return cotationFollowupMap[cotationId];
}

// ─── Comparison data ─────────────────────────────────────────────────
// Structured guarantee/coverage data extracted by the comparison agent.

export type CellValue =
  | { type: "check" }
  | { type: "cross" }
  | { type: "text"; value: string }
  | { type: "empty" };

export type SubLimitRow = {
  id: string;
  label: string;
  value: string;
};

export type PricingCardRow = {
  id: string;
  offerLabel: string;
  price: string;
  conditions: string;
};

export type SourceRef = {
  title: string;
  description: string;
  badge: string;
  page?: string;
};

export type ExclusionOrigin = "deterministic" | "ai" | "manual";

export type CellDetail = {
  title: string;
  covered: boolean;
  insurerId: string;
  insurerName: string;
  description: string;
  cellType: "guarantee" | "price" | "exclusion";
  mainLimit?: string;
  mainDeductible?: string;
  subLimits?: SubLimitRow[];
  pricingRows?: PricingCardRow[];
  sources?: SourceRef[];
  origin?: ExclusionOrigin;
  exclusionId?: string;
};

export type CellIdentifier =
  | { type: "guarantee"; sectionIndex: number; rowIndex: number; insurerId: string }
  | { type: "price"; insurerId: string }
  | { type: "exclusion"; exclusionId: string; insurerId: string };

export type GuaranteeRow = {
  label: string;
  /** keyed by insurer id */
  values: Record<string, CellValue>;
  /** keyed by insurer id */
  details?: Record<string, CellDetail>;
};

export type GuaranteeSubGroup = {
  title: string;
  rows: GuaranteeRow[];
};

export type GuaranteeProduct = {
  title: string;
  subGroups: GuaranteeSubGroup[];
};

/** @deprecated — kept for migration, use GuaranteeProduct */
export type GuaranteeSection = {
  title: string;
  level?: "product" | "sub";
  rows: GuaranteeRow[];
};

export type ExclusionCellValue =
  | { type: "exclu" }
  | { type: "inclus" }
  | { type: "exclu-text"; value: string }
  | { type: "empty" };

export type ExclusionRow = {
  id: string;
  label: string;
  origin: ExclusionOrigin;
  values: Record<string, ExclusionCellValue>;
  details?: Record<string, CellDetail>;
};

// ─── Dynamic fields & rate-based pricing ─────────────────────────────

export type DynamicField = {
  id: string;
  label: string;
  sectionKey: string;
  sectionLabel: string;
  type: "number" | "select";
  required?: boolean;
};

export type DynamicFieldValues = Record<string, number | undefined>;

/** A rate-based guarantee row where each insurer quotes a % rate.
 *  The € amount is computed client-side: rate × payroll category. */
export type RateRow = {
  label: string;
  /** Which dynamic field (by id) provides the base for computation */
  dynamicFieldId: string;
  /** Rate per insurer (e.g. 0.0185 for 1.85%) keyed by insurer id */
  rates: Record<string, number>;
  details?: Record<string, CellDetail>;
};

export type RateSubGroup = {
  title: string;
  rows: RateRow[];
};

export type RateUnit = "percent" | "eur_per_person_month";

export type RateProduct = {
  title: string;
  subGroups: RateSubGroup[];
  /** How to interpret rates: "percent" (rate × base) or "eur_per_person_month" (rate × headcount × 12). Defaults to "percent". */
  rateUnit?: RateUnit;
  /** Dynamic field id providing the employer share % (for eur_per_person_month products) */
  employerShareFieldId?: string;
};

export type ComparisonData = {
  products: GuaranteeProduct[];
  /** @deprecated — use products */
  sections?: GuaranteeSection[];
  exclusions?: ExclusionRow[];
  /** Rate-based products (Workers' Comp, Group Health, etc.) */
  rateProducts?: RateProduct[];
  /** Dynamic fields required for rate computation */
  dynamicFields?: DynamicField[];
  /** Current values for dynamic fields */
  dynamicFieldValues?: DynamicFieldValues;
};

function makeDetail(
  label: string,
  insurerId: string,
  insurerName: string,
  covered: boolean,
  description: string,
  subLimits: SubLimitRow[] = [],
  sources: SourceRef[] = [],
  mainLimit: string = "1 500 €",
  mainDeductible: string = "5 000 €",
): CellDetail {
  return {
    title: label,
    covered,
    insurerId,
    insurerName,
    description,
    cellType: "guarantee",
    mainLimit,
    mainDeductible,
    subLimits,
    sources,
  };
}

function makeExclusionDetail(
  label: string,
  insurerId: string,
  insurerName: string,
  covered: boolean,
  origin: ExclusionOrigin,
  exclusionId: string,
  description: string,
  subLimits: SubLimitRow[] = [],
  sources: SourceRef[] = [],
): CellDetail {
  return {
    title: label,
    covered,
    insurerId,
    insurerName,
    description,
    cellType: "exclusion",
    origin,
    exclusionId,
    subLimits,
    sources,
  };
}

const defaultSources: SourceRef[] = [
  { title: "Conditions Générales", description: "Détail des garanties et limites applicables au contrat.", badge: "Contrat", page: "Page 12" },
];

/** Mock comparison data per cotation (keyed by cotation id) */
const comparisonDataMap: Record<string, ComparisonData> = {
  "cot-2": {
    exclusions: [
      {
        id: "excl-d1",
        label: "Faute intentionnelle",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, allianz: { type: "exclu" }, generali: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Faute intentionnelle", "axa", "Axa", false, "deterministic", "excl-d1", "Les dommages causés intentionnellement par l'assuré sont exclus de toute garantie.", [{ id: "sl-1", label: "Condition", value: "Aucune dérogation possible" }], defaultSources),
          allianz: makeExclusionDetail("Faute intentionnelle", "allianz", "Allianz", false, "deterministic", "excl-d1", "Exclusion légale : tout acte intentionnel de l'assuré.", [{ id: "sl-1", label: "Condition", value: "Article L113-1 Code des assurances" }], defaultSources),
          generali: makeExclusionDetail("Faute intentionnelle", "generali", "Generali", false, "deterministic", "excl-d1", "Dommages résultant d'une faute intentionnelle ou dolosive.", [], defaultSources),
        },
      },
      {
        id: "excl-d2",
        label: "Guerre et terrorisme",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, allianz: { type: "exclu" }, generali: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Guerre et terrorisme", "axa", "Axa", false, "deterministic", "excl-d2", "Dommages résultant de faits de guerre, guerre civile ou actes de terrorisme.", [{ id: "sl-1", label: "Exception", value: "Loi GAREAT pour le terrorisme" }], defaultSources),
          allianz: makeExclusionDetail("Guerre et terrorisme", "allianz", "Allianz", false, "deterministic", "excl-d2", "Exclusion des risques de guerre et assimilés.", [], defaultSources),
          generali: makeExclusionDetail("Guerre et terrorisme", "generali", "Generali", false, "deterministic", "excl-d2", "Événements de guerre et terrorisme exclus.", [], defaultSources),
        },
      },
      {
        id: "excl-d3",
        label: "Usure normale du véhicule",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, allianz: { type: "exclu" }, generali: { type: "inclus" } },
        details: {
          axa: makeExclusionDetail("Usure normale du véhicule", "axa", "Axa", false, "deterministic", "excl-d3", "L'usure normale et la vétusté du véhicule ne sont pas couvertes.", [], defaultSources),
          allianz: makeExclusionDetail("Usure normale du véhicule", "allianz", "Allianz", false, "deterministic", "excl-d3", "Dommages liés à l'usure, la corrosion ou le défaut d'entretien.", [], defaultSources),
          generali: makeExclusionDetail("Usure normale du véhicule", "generali", "Generali", true, "deterministic", "excl-d3", "Prise en charge partielle de l'usure dans la formule Premium.", [{ id: "sl-1", label: "Plafond", value: "500 €/an" }], defaultSources),
        },
      },
      {
        id: "excl-a1",
        label: "Activités non déclarées",
        origin: "ai",
        values: { axa: { type: "exclu" }, allianz: { type: "exclu-text", value: "Sauf avenant" }, generali: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Activités non déclarées", "axa", "Axa", false, "ai", "excl-a1", "Exclusion des sinistres liés à une activité non déclarée au contrat.", [{ id: "sl-1", label: "Condition", value: "Déclaration exhaustive requise" }], defaultSources),
          allianz: makeExclusionDetail("Activités non déclarées", "allianz", "Allianz", false, "ai", "excl-a1", "Activités non mentionnées au contrat exclues, sauf avenant spécifique.", [{ id: "sl-1", label: "Dérogation", value: "Avenant possible sous 30j" }], defaultSources),
          generali: makeExclusionDetail("Activités non déclarées", "generali", "Generali", false, "ai", "excl-a1", "Toute activité non portée à la connaissance de l'assureur est exclue.", [], defaultSources),
        },
      },
      {
        id: "excl-a2",
        label: "Dommages aux biens confiés",
        origin: "ai",
        values: { axa: { type: "inclus" }, allianz: { type: "exclu" }, generali: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Dommages aux biens confiés", "axa", "Axa", true, "ai", "excl-a2", "Les dommages aux biens confiés sont couverts dans le cadre de la RC exploitation.", [{ id: "sl-1", label: "Sous-limite", value: "50 000 €" }], defaultSources),
          allianz: makeExclusionDetail("Dommages aux biens confiés", "allianz", "Allianz", false, "ai", "excl-a2", "Les biens confiés par les clients sont exclus de la couverture de base.", [], defaultSources),
          generali: makeExclusionDetail("Dommages aux biens confiés", "generali", "Generali", false, "ai", "excl-a2", "Exclusion des dommages aux biens dont l'assuré a la garde.", [], defaultSources),
        },
      },
    ],
    products: [
      {
        title: "Auto",
        subGroups: [
          {
            title: "Couvertures véhicules",
            rows: [
              {
                label: "Responsabilité civile",
                values: { axa: { type: "check" }, allianz: { type: "check" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("Responsabilité civile", "axa", "Axa", true, "Couverture RC obligatoire pour tous les véhicules de la flotte.", [{ id: "sl-1", label: "Dommages corporels", value: "Illimité" }, { id: "sl-2", label: "Dommages matériels", value: "100 000 000 €" }], defaultSources, "1 500 €", "5 000 €"),
                  allianz: makeDetail("Responsabilité civile", "allianz", "Allianz", true, "RC automobile obligatoire conforme à la législation en vigueur.", [{ id: "sl-1", label: "Dommages corporels", value: "Illimité" }, { id: "sl-2", label: "Dommages matériels", value: "100 000 000 €" }], defaultSources, "2 000 €", "3 000 €"),
                  generali: makeDetail("Responsabilité civile", "generali", "Generali", true, "Garantie de base couvrant la responsabilité civile des conducteurs.", [{ id: "sl-1", label: "Dommages corporels", value: "Illimité" }], defaultSources, "1 000 €", "2 500 €"),
                },
              },
              {
                label: "Dommages tous accidents",
                values: { axa: { type: "check" }, allianz: { type: "check" }, generali: { type: "cross" } },
                details: {
                  axa: makeDetail("Dommages tous accidents", "axa", "Axa", true, "Prise en charge des dommages au véhicule assuré, quelle que soit la responsabilité.", [{ id: "sl-1", label: "Franchise", value: "500 €" }], defaultSources, "75 000 €", "500 €"),
                  allianz: makeDetail("Dommages tous accidents", "allianz", "Allianz", true, "Couverture complète des dommages au véhicule.", [{ id: "sl-1", label: "Franchise", value: "750 €" }], defaultSources, "100 000 €", "750 €"),
                  generali: makeDetail("Dommages tous accidents", "generali", "Generali", false, "Non inclus dans la formule Standard. Disponible en option.", [], defaultSources),
                },
              },
              {
                label: "Vol et tentative de vol",
                values: { axa: { type: "check" }, allianz: { type: "check" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("Vol et tentative de vol", "axa", "Axa", true, "Indemnisation en cas de vol ou tentative de vol du véhicule.", [{ id: "sl-1", label: "Plafond", value: "Valeur vénale" }], defaultSources, "50 000 €", "300 €"),
                  allianz: makeDetail("Vol et tentative de vol", "allianz", "Allianz", true, "Couverture vol incluant les accessoires.", [{ id: "sl-1", label: "Plafond accessoires", value: "1 500 €" }], defaultSources, "60 000 €", "400 €"),
                  generali: makeDetail("Vol et tentative de vol", "generali", "Generali", true, "Garantie vol de base.", [{ id: "sl-1", label: "Franchise", value: "10% valeur vénale" }], defaultSources, "40 000 €", "250 €"),
                },
              },
              {
                label: "Bris de glace",
                values: { axa: { type: "check" }, allianz: { type: "check" }, generali: { type: "cross" } },
                details: {
                  axa: makeDetail("Bris de glace", "axa", "Axa", true, "Remplacement ou réparation de tous les vitrages du véhicule.", [{ id: "sl-1", label: "Franchise réparation", value: "0 €" }, { id: "sl-2", label: "Franchise remplacement", value: "50 €" }], defaultSources, "10 000 €", "0 €"),
                  allianz: makeDetail("Bris de glace", "allianz", "Allianz", true, "Couverture bris de glace pare-brise, lunette arrière et vitres latérales.", [{ id: "sl-1", label: "Franchise", value: "75 €" }], defaultSources, "15 000 €", "75 €"),
                  generali: makeDetail("Bris de glace", "generali", "Generali", false, "Non couvert dans cette formule.", [], defaultSources),
                },
              },
              {
                label: "Incendie, explosion, tempête",
                values: { axa: { type: "check" }, allianz: { type: "check" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("Incendie, explosion, tempête", "axa", "Axa", true, "Protection contre incendie, explosion et événements climatiques.", [{ id: "sl-1", label: "Franchise tempête", value: "250 €" }], defaultSources, "200 000 €", "250 €"),
                  allianz: makeDetail("Incendie, explosion, tempête", "allianz", "Allianz", true, "Garantie étendue incendie et événements naturels.", [{ id: "sl-1", label: "Franchise", value: "300 €" }], defaultSources, "150 000 €", "300 €"),
                  generali: makeDetail("Incendie, explosion, tempête", "generali", "Generali", true, "Couverture de base incendie et tempête.", [{ id: "sl-1", label: "Franchise", value: "500 €" }], defaultSources),
                },
              },
              {
                label: "Catastrophes naturelles",
                values: { axa: { type: "check" }, allianz: { type: "check" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("Catastrophes naturelles", "axa", "Axa", true, "Garantie légale catastrophes naturelles.", [{ id: "sl-1", label: "Franchise légale", value: "380 €" }], defaultSources),
                  allianz: makeDetail("Catastrophes naturelles", "allianz", "Allianz", true, "Conformément à la réglementation en vigueur.", [{ id: "sl-1", label: "Franchise légale", value: "380 €" }], defaultSources),
                  generali: makeDetail("Catastrophes naturelles", "generali", "Generali", true, "Couverture obligatoire.", [{ id: "sl-1", label: "Franchise légale", value: "380 €" }], defaultSources),
                },
              },
              {
                label: "Protection juridique",
                values: { axa: { type: "check" }, allianz: { type: "cross" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("Protection juridique", "axa", "Axa", true, "Assistance juridique en cas de litige lié au véhicule.", [{ id: "sl-1", label: "Plafond honoraires", value: "15 000 €" }], defaultSources),
                  allianz: makeDetail("Protection juridique", "allianz", "Allianz", false, "Non incluse. Disponible en option.", [], defaultSources),
                  generali: makeDetail("Protection juridique", "generali", "Generali", true, "Protection juridique incluse dans la formule.", [{ id: "sl-1", label: "Plafond", value: "10 000 €" }], defaultSources),
                },
              },
            ],
          },
          {
            title: "Garanties conducteur",
            rows: [
              {
                label: "Protection corporelle du conducteur",
                values: { axa: { type: "text", value: "1 000 000 €" }, allianz: { type: "text", value: "500 000 €" }, generali: { type: "text", value: "750 000 €" } },
                details: {
                  axa: makeDetail("Protection corporelle du conducteur", "axa", "Axa", true, "Indemnisation des dommages corporels subis par le conducteur.", [{ id: "sl-1", label: "Capital décès", value: "1 000 000 €" }, { id: "sl-2", label: "Frais de soins", value: "Illimité" }], defaultSources),
                  allianz: makeDetail("Protection corporelle du conducteur", "allianz", "Allianz", true, "Capital garanti en cas de blessure du conducteur.", [{ id: "sl-1", label: "Capital décès", value: "500 000 €" }], defaultSources),
                  generali: makeDetail("Protection corporelle du conducteur", "generali", "Generali", true, "Protection intermédiaire du conducteur.", [{ id: "sl-1", label: "Capital décès", value: "750 000 €" }], defaultSources),
                },
              },
              {
                label: "Assistance 0 km",
                values: { axa: { type: "check" }, allianz: { type: "check" }, generali: { type: "cross" } },
                details: {
                  axa: makeDetail("Assistance 0 km", "axa", "Axa", true, "Dépannage et remorquage dès le domicile.", [], defaultSources),
                  allianz: makeDetail("Assistance 0 km", "allianz", "Allianz", true, "Assistance depuis le lieu de panne, y compris domicile.", [], defaultSources),
                  generali: makeDetail("Assistance 0 km", "generali", "Generali", false, "Assistance uniquement à partir de 25 km du domicile.", [], defaultSources),
                },
              },
              {
                label: "Véhicule de remplacement",
                values: { axa: { type: "text", value: "30 jours" }, allianz: { type: "text", value: "15 jours" }, generali: { type: "text", value: "21 jours" } },
                details: {
                  axa: makeDetail("Véhicule de remplacement", "axa", "Axa", true, "Mise à disposition d'un véhicule de remplacement.", [{ id: "sl-1", label: "Durée max", value: "30 jours" }, { id: "sl-2", label: "Catégorie", value: "Équivalente" }], defaultSources),
                  allianz: makeDetail("Véhicule de remplacement", "allianz", "Allianz", true, "Véhicule de remplacement en cas d'immobilisation.", [{ id: "sl-1", label: "Durée max", value: "15 jours" }], defaultSources),
                  generali: makeDetail("Véhicule de remplacement", "generali", "Generali", true, "Prêt de véhicule en cas de sinistre.", [{ id: "sl-1", label: "Durée max", value: "21 jours" }], defaultSources),
                },
              },
              {
                label: "Franchise sinistre responsable",
                values: { axa: { type: "text", value: "500 €" }, allianz: { type: "text", value: "750 €" }, generali: { type: "text", value: "500 €" } },
                details: {
                  axa: makeDetail("Franchise sinistre responsable", "axa", "Axa", true, "Montant restant à charge en cas de sinistre responsable.", [{ id: "sl-1", label: "Franchise standard", value: "500 €" }], defaultSources),
                  allianz: makeDetail("Franchise sinistre responsable", "allianz", "Allianz", true, "Franchise applicable aux sinistres dont l'assuré est responsable.", [{ id: "sl-1", label: "Franchise standard", value: "750 €" }], defaultSources),
                  generali: makeDetail("Franchise sinistre responsable", "generali", "Generali", true, "Franchise en cas de responsabilité.", [{ id: "sl-1", label: "Franchise standard", value: "500 €" }], defaultSources),
                },
              },
            ],
          },
          {
            title: "Services inclus",
            rows: [
              {
                label: "Gestion de flotte en ligne",
                values: { axa: { type: "check" }, allianz: { type: "check" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("Gestion de flotte en ligne", "axa", "Axa", true, "Plateforme en ligne pour gérer l'ensemble de la flotte.", [], defaultSources),
                  allianz: makeDetail("Gestion de flotte en ligne", "allianz", "Allianz", true, "Espace client dédié à la gestion de flotte.", [], defaultSources),
                  generali: makeDetail("Gestion de flotte en ligne", "generali", "Generali", true, "Outil de suivi de flotte basique.", [], defaultSources),
                },
              },
              {
                label: "Carte verte dématérialisée",
                values: { axa: { type: "check" }, allianz: { type: "check" }, generali: { type: "cross" } },
                details: {
                  axa: makeDetail("Carte verte dématérialisée", "axa", "Axa", true, "Cartes vertes disponibles au format numérique.", [], defaultSources),
                  allianz: makeDetail("Carte verte dématérialisée", "allianz", "Allianz", true, "Attestation d'assurance dématérialisée.", [], defaultSources),
                  generali: makeDetail("Carte verte dématérialisée", "generali", "Generali", false, "Uniquement en format papier.", [], defaultSources),
                },
              },
              {
                label: "Reporting sinistralité",
                values: { axa: { type: "text", value: "Trimestriel" }, allianz: { type: "text", value: "Mensuel" }, generali: { type: "text", value: "Annuel" } },
                details: {
                  axa: makeDetail("Reporting sinistralité", "axa", "Axa", true, "Rapports de sinistralité détaillés fournis trimestriellement.", [{ id: "sl-1", label: "Fréquence", value: "Trimestriel" }], defaultSources),
                  allianz: makeDetail("Reporting sinistralité", "allianz", "Allianz", true, "Suivi mensuel de la sinistralité de la flotte.", [{ id: "sl-1", label: "Fréquence", value: "Mensuel" }], defaultSources),
                  generali: makeDetail("Reporting sinistralité", "generali", "Generali", true, "Bilan annuel de sinistralité.", [{ id: "sl-1", label: "Fréquence", value: "Annuel" }], defaultSources),
                },
              },
            ],
          },
        ],
      },
    ],
  },
  "cot-5": {
    exclusions: [
      {
        id: "excl-d1",
        label: "Faute intentionnelle ou dolosive",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, allianz: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Faute intentionnelle ou dolosive", "axa", "Axa", false, "deterministic", "excl-d1", "Tout dommage résultant d'un acte volontaire de l'assuré.", [], defaultSources),
          allianz: makeExclusionDetail("Faute intentionnelle ou dolosive", "allianz", "Allianz", false, "deterministic", "excl-d1", "Exclusion des fautes intentionnelles conformément au Code des assurances.", [], defaultSources),
        },
      },
      {
        id: "excl-d2",
        label: "Amendes et pénalités",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, allianz: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Amendes et pénalités", "axa", "Axa", false, "deterministic", "excl-d2", "Les amendes, pénalités et sanctions financières ne sont pas assurables.", [], defaultSources),
          allianz: makeExclusionDetail("Amendes et pénalités", "allianz", "Allianz", false, "deterministic", "excl-d2", "Exclusion légale des amendes et pénalités administratives ou judiciaires.", [], defaultSources),
        },
      },
      {
        id: "excl-a1",
        label: "Activités de conseil juridique",
        origin: "ai",
        values: { axa: { type: "exclu" }, allianz: { type: "inclus" } },
        details: {
          axa: makeExclusionDetail("Activités de conseil juridique", "axa", "Axa", false, "ai", "excl-a1", "Les prestations de conseil juridique sont exclues sauf si exercées à titre accessoire.", [{ id: "sl-1", label: "Condition", value: "< 10% du CA" }], defaultSources),
          allianz: makeExclusionDetail("Activités de conseil juridique", "allianz", "Allianz", true, "ai", "excl-a1", "Le conseil juridique accessoire est couvert dans la formule Confort.", [], defaultSources),
        },
      },
      {
        id: "excl-a2",
        label: "Travaux sur infrastructures critiques",
        origin: "ai",
        values: { axa: { type: "exclu-text", value: "Limité" }, allianz: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Travaux sur infrastructures critiques", "axa", "Axa", false, "ai", "excl-a2", "Interventions sur systèmes critiques (santé, transport, énergie) soumises à sous-limite.", [{ id: "sl-1", label: "Sous-limite", value: "100 000 €" }], defaultSources),
          allianz: makeExclusionDetail("Travaux sur infrastructures critiques", "allianz", "Allianz", false, "ai", "excl-a2", "Exclusion totale des interventions sur infrastructures critiques.", [], defaultSources),
        },
      },
    ],
    products: [
      {
        title: "RC Pro",
        subGroups: [
          {
            title: "Couvertures",
            rows: [
              {
                label: "Fautes professionnelles",
                values: { axa: { type: "check" }, allianz: { type: "check" } },
                details: {
                  axa: makeDetail("Fautes professionnelles", "axa", "Axa", true, "Couverture des erreurs, omissions et fautes dans l'exercice professionnel.", [{ id: "sl-1", label: "Plafond par sinistre", value: "500 000 €" }], defaultSources),
                  allianz: makeDetail("Fautes professionnelles", "allianz", "Allianz", true, "Protection contre les réclamations liées à des manquements professionnels.", [{ id: "sl-1", label: "Plafond par sinistre", value: "500 000 €" }], defaultSources),
                },
              },
              {
                label: "Atteinte aux droits de propriété intellectuelle",
                values: { axa: { type: "check" }, allianz: { type: "check" } },
                details: {
                  axa: makeDetail("Atteinte aux droits de propriété intellectuelle", "axa", "Axa", true, "Couverture en cas de contrefaçon involontaire ou atteinte aux droits d'auteur.", [{ id: "sl-1", label: "Sous-limite", value: "250 000 €" }], defaultSources),
                  allianz: makeDetail("Atteinte aux droits de propriété intellectuelle", "allianz", "Allianz", true, "Protection PI dans le cadre de l'activité professionnelle.", [{ id: "sl-1", label: "Sous-limite", value: "200 000 €" }], defaultSources),
                },
              },
              {
                label: "Perte de données client",
                values: { axa: { type: "check" }, allianz: { type: "cross" } },
                details: {
                  axa: makeDetail("Perte de données client", "axa", "Axa", true, "Indemnisation en cas de perte, altération ou destruction de données confiées par les clients.", [{ id: "sl-1", label: "Sous-limite", value: "150 000 €" }, { id: "sl-2", label: "Frais de notification", value: "50 000 €" }], defaultSources),
                  allianz: makeDetail("Perte de données client", "allianz", "Allianz", false, "Non couvert dans la formule Standard. Disponible en option Cyber.", [], defaultSources),
                },
              },
              {
                label: "Violation du RGPD",
                values: { axa: { type: "check" }, allianz: { type: "check" } },
                details: {
                  axa: makeDetail("Violation du RGPD", "axa", "Axa", true, "Prise en charge des frais liés à une violation des données personnelles.", [{ id: "sl-1", label: "Frais de défense", value: "100 000 €" }], defaultSources),
                  allianz: makeDetail("Violation du RGPD", "allianz", "Allianz", true, "Couverture des conséquences financières d'une non-conformité RGPD.", [{ id: "sl-1", label: "Frais de défense", value: "75 000 €" }], defaultSources),
                },
              },
              {
                label: "Sous-traitance",
                values: { axa: { type: "text", value: "Couverte" }, allianz: { type: "text", value: "Exclue" } },
                details: {
                  axa: makeDetail("Sous-traitance", "axa", "Axa", true, "Les prestations réalisées par des sous-traitants sont couvertes.", [], defaultSources),
                  allianz: makeDetail("Sous-traitance", "allianz", "Allianz", false, "La sous-traitance est exclue de la garantie. Seules les prestations directes sont couvertes.", [], defaultSources),
                },
              },
            ],
          },
          {
            title: "Limites et franchises",
            rows: [
              {
                label: "Plafond par sinistre",
                values: { axa: { type: "text", value: "500 000 €" }, allianz: { type: "text", value: "500 000 €" } },
                details: {
                  axa: makeDetail("Plafond par sinistre", "axa", "Axa", true, "Montant maximum d'indemnisation pour un sinistre unique.", [{ id: "sl-1", label: "Plafond", value: "500 000 €" }], defaultSources),
                  allianz: makeDetail("Plafond par sinistre", "allianz", "Allianz", true, "Limite d'engagement par événement dommageable.", [{ id: "sl-1", label: "Plafond", value: "500 000 €" }], defaultSources),
                },
              },
              {
                label: "Plafond annuel",
                values: { axa: { type: "text", value: "1 000 000 €" }, allianz: { type: "text", value: "1 000 000 €" } },
                details: {
                  axa: makeDetail("Plafond annuel", "axa", "Axa", true, "Montant maximum d'indemnisation sur une année d'assurance.", [{ id: "sl-1", label: "Plafond annuel global", value: "1 000 000 €" }], defaultSources),
                  allianz: makeDetail("Plafond annuel", "allianz", "Allianz", true, "Engagement maximum annuel toutes garanties confondues.", [{ id: "sl-1", label: "Plafond annuel global", value: "1 000 000 €" }], defaultSources),
                },
              },
              {
                label: "Franchise",
                values: { axa: { type: "text", value: "1 000 €" }, allianz: { type: "text", value: "1 500 €" } },
                details: {
                  axa: makeDetail("Franchise", "axa", "Axa", true, "Montant restant à la charge de l'assuré par sinistre.", [{ id: "sl-1", label: "Franchise fixe", value: "1 000 €" }], defaultSources),
                  allianz: makeDetail("Franchise", "allianz", "Allianz", true, "Franchise applicable par sinistre déclaré.", [{ id: "sl-1", label: "Franchise fixe", value: "1 500 €" }], defaultSources),
                },
              },
              {
                label: "Défense pénale",
                values: { axa: { type: "check" }, allianz: { type: "check" } },
                details: {
                  axa: makeDetail("Défense pénale", "axa", "Axa", true, "Prise en charge des frais de défense en cas de poursuites pénales liées à l'activité.", [{ id: "sl-1", label: "Plafond honoraires", value: "75 000 €" }, { id: "sl-2", label: "Frais d'expert judiciaire", value: "5 000 €" }], defaultSources),
                  allianz: makeDetail("Défense pénale", "allianz", "Allianz", true, "Assistance juridique et prise en charge de la défense pénale.", [{ id: "sl-1", label: "Plafond honoraires", value: "50 000 €" }], defaultSources),
                },
              },
            ],
          },
        ],
      },
    ],
  },
  "cot-1": {
    exclusions: [
      {
        id: "excl-d1",
        label: "Faute intentionnelle ou dolosive",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, generali: { type: "exclu" }, allianz: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Faute intentionnelle ou dolosive", "axa", "Axa", false, "deterministic", "excl-d1", "Exclusion légale des actes volontaires de l'assuré.", [], defaultSources),
          generali: makeExclusionDetail("Faute intentionnelle ou dolosive", "generali", "Generali", false, "deterministic", "excl-d1", "Conformément au Code des assurances, art. L113-1.", [], defaultSources),
          allianz: makeExclusionDetail("Faute intentionnelle ou dolosive", "allianz", "Allianz", false, "deterministic", "excl-d1", "Exclusion des fautes intentionnelles.", [], defaultSources),
        },
      },
      {
        id: "excl-d2",
        label: "Amendes et pénalités",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, generali: { type: "exclu" }, allianz: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Amendes et pénalités", "axa", "Axa", false, "deterministic", "excl-d2", "Les amendes et pénalités ne sont pas assurables.", [], defaultSources),
          generali: makeExclusionDetail("Amendes et pénalités", "generali", "Generali", false, "deterministic", "excl-d2", "Caractère inassurable des amendes et sanctions.", [], defaultSources),
          allianz: makeExclusionDetail("Amendes et pénalités", "allianz", "Allianz", false, "deterministic", "excl-d2", "Amendes et sanctions pécuniaires exclues.", [], defaultSources),
        },
      },
      {
        id: "excl-d3",
        label: "Dommages aux biens confiés",
        origin: "deterministic",
        values: { axa: { type: "inclus" }, generali: { type: "exclu" }, allianz: { type: "exclu-text", value: "Option" } },
        details: {
          axa: makeExclusionDetail("Dommages aux biens confiés", "axa", "Axa", true, "deterministic", "excl-d3", "Les biens confiés par les clients sont couverts dans la formule Étendue.", [], defaultSources),
          generali: makeExclusionDetail("Dommages aux biens confiés", "generali", "Generali", false, "deterministic", "excl-d3", "Exclusion standard des biens confiés.", [], defaultSources),
          allianz: makeExclusionDetail("Dommages aux biens confiés", "allianz", "Allianz", false, "deterministic", "excl-d3", "Disponible en option avec avenant spécifique.", [], defaultSources),
        },
      },
      {
        id: "excl-a1",
        label: "Activités SaaS hors périmètre déclaré",
        origin: "ai",
        values: { axa: { type: "exclu" }, generali: { type: "inclus" }, allianz: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Activités SaaS hors périmètre déclaré", "axa", "Axa", false, "ai", "excl-a1", "Seules les activités déclarées au contrat sont couvertes. Tout nouveau service SaaS doit être notifié.", [{ id: "sl-1", label: "Délai de déclaration", value: "30 jours" }], defaultSources),
          generali: makeExclusionDetail("Activités SaaS hors périmètre déclaré", "generali", "Generali", true, "ai", "excl-a1", "Extension automatique aux nouvelles activités dans le même secteur.", [], defaultSources),
          allianz: makeExclusionDetail("Activités SaaS hors périmètre déclaré", "allianz", "Allianz", false, "ai", "excl-a1", "Activités hors périmètre exclues. Avenant nécessaire.", [], defaultSources),
        },
      },
      {
        id: "excl-a2",
        label: "Cyber-attaque et rançongiciel",
        origin: "ai",
        values: { axa: { type: "exclu-text", value: "Sous-limite" }, generali: { type: "exclu" }, allianz: { type: "inclus" } },
        details: {
          axa: makeExclusionDetail("Cyber-attaque et rançongiciel", "axa", "Axa", false, "ai", "excl-a2", "Couverture partielle avec sous-limite dédiée. Ne couvre pas le paiement de rançon.", [{ id: "sl-1", label: "Sous-limite cyber", value: "200 000 €" }], defaultSources),
          generali: makeExclusionDetail("Cyber-attaque et rançongiciel", "generali", "Generali", false, "ai", "excl-a2", "Risque cyber exclu de la RC Pro. Contrat Cyber dédié proposé séparément.", [], defaultSources),
          allianz: makeExclusionDetail("Cyber-attaque et rançongiciel", "allianz", "Allianz", true, "ai", "excl-a2", "Garantie cyber intégrée dans la formule Confort+.", [{ id: "sl-1", label: "Plafond cyber", value: "300 000 €" }], defaultSources),
        },
      },
    ],
    products: [
      {
        title: "RC Pro",
        subGroups: [
          {
            title: "Couvertures",
            rows: [
              {
                label: "Fautes professionnelles",
                values: { axa: { type: "check" }, generali: { type: "check" }, allianz: { type: "check" } },
                details: {
                  axa: makeDetail("Fautes professionnelles", "axa", "Axa", true, "Erreurs, omissions et manquements dans l'exercice professionnel.", [{ id: "sl-1", label: "Plafond par sinistre", value: "500 000 €" }], defaultSources),
                  generali: makeDetail("Fautes professionnelles", "generali", "Generali", true, "Protection contre les réclamations clients.", [{ id: "sl-1", label: "Plafond par sinistre", value: "400 000 €" }], defaultSources),
                  allianz: makeDetail("Fautes professionnelles", "allianz", "Allianz", true, "Couverture des manquements professionnels.", [{ id: "sl-1", label: "Plafond par sinistre", value: "500 000 €" }], defaultSources),
                },
              },
              {
                label: "Atteinte aux droits de propriété intellectuelle",
                values: { axa: { type: "check" }, generali: { type: "cross" }, allianz: { type: "check" } },
                details: {
                  axa: makeDetail("Atteinte aux droits de propriété intellectuelle", "axa", "Axa", true, "Couverture en cas de contrefaçon involontaire.", [{ id: "sl-1", label: "Sous-limite PI", value: "250 000 €" }], defaultSources),
                  generali: makeDetail("Atteinte aux droits de propriété intellectuelle", "generali", "Generali", false, "Non inclus dans la formule Standard.", [], defaultSources),
                  allianz: makeDetail("Atteinte aux droits de propriété intellectuelle", "allianz", "Allianz", true, "Protection PI intégrée.", [{ id: "sl-1", label: "Sous-limite PI", value: "200 000 €" }], defaultSources),
                },
              },
              {
                label: "Perte de données client",
                values: { axa: { type: "check" }, generali: { type: "check" }, allianz: { type: "cross" } },
                details: {
                  axa: makeDetail("Perte de données client", "axa", "Axa", true, "Indemnisation en cas de perte ou destruction de données.", [{ id: "sl-1", label: "Sous-limite", value: "150 000 €" }, { id: "sl-2", label: "Frais de notification", value: "50 000 €" }], defaultSources),
                  generali: makeDetail("Perte de données client", "generali", "Generali", true, "Couverture des données client incluant les frais de reconstitution.", [{ id: "sl-1", label: "Sous-limite", value: "100 000 €" }], defaultSources),
                  allianz: makeDetail("Perte de données client", "allianz", "Allianz", false, "Non couvert. Option Cyber disponible.", [], defaultSources),
                },
              },
              {
                label: "Violation du RGPD",
                values: { axa: { type: "check" }, generali: { type: "check" }, allianz: { type: "check" } },
                details: {
                  axa: makeDetail("Violation du RGPD", "axa", "Axa", true, "Prise en charge des frais liés à une violation de données personnelles.", [{ id: "sl-1", label: "Frais de défense", value: "100 000 €" }], defaultSources),
                  generali: makeDetail("Violation du RGPD", "generali", "Generali", true, "Accompagnement juridique et frais de notification.", [{ id: "sl-1", label: "Frais de défense", value: "80 000 €" }], defaultSources),
                  allianz: makeDetail("Violation du RGPD", "allianz", "Allianz", true, "Couverture RGPD standard.", [{ id: "sl-1", label: "Frais de défense", value: "75 000 €" }], defaultSources),
                },
              },
              {
                label: "Sous-traitance",
                values: { axa: { type: "text", value: "Couverte" }, generali: { type: "text", value: "Limitée" }, allianz: { type: "text", value: "Exclue" } },
                details: {
                  axa: makeDetail("Sous-traitance", "axa", "Axa", true, "Prestations réalisées par des sous-traitants couvertes sans restriction.", [], defaultSources),
                  generali: makeDetail("Sous-traitance", "generali", "Generali", true, "Sous-traitance couverte jusqu'à 30% du CA.", [{ id: "sl-1", label: "Limite sous-traitance", value: "30% du CA" }], defaultSources),
                  allianz: makeDetail("Sous-traitance", "allianz", "Allianz", false, "La sous-traitance est exclue.", [], defaultSources),
                },
              },
            ],
          },
          {
            title: "Limites et franchises",
            rows: [
              {
                label: "Plafond par sinistre",
                values: { axa: { type: "text", value: "500 000 €" }, generali: { type: "text", value: "400 000 €" }, allianz: { type: "text", value: "500 000 €" } },
                details: {
                  axa: makeDetail("Plafond par sinistre", "axa", "Axa", true, "Montant maximum d'indemnisation par sinistre.", [{ id: "sl-1", label: "Plafond", value: "500 000 €" }], defaultSources),
                  generali: makeDetail("Plafond par sinistre", "generali", "Generali", true, "Plafond standard par événement.", [{ id: "sl-1", label: "Plafond", value: "400 000 €" }], defaultSources),
                  allianz: makeDetail("Plafond par sinistre", "allianz", "Allianz", true, "Limite par sinistre.", [{ id: "sl-1", label: "Plafond", value: "500 000 €" }], defaultSources),
                },
              },
              {
                label: "Plafond annuel",
                values: { axa: { type: "text", value: "1 500 000 €" }, generali: { type: "text", value: "1 000 000 €" }, allianz: { type: "text", value: "1 000 000 €" } },
                details: {
                  axa: makeDetail("Plafond annuel", "axa", "Axa", true, "Engagement maximum annuel toutes garanties.", [{ id: "sl-1", label: "Plafond annuel", value: "1 500 000 €" }], defaultSources),
                  generali: makeDetail("Plafond annuel", "generali", "Generali", true, "Plafond annuel global.", [{ id: "sl-1", label: "Plafond annuel", value: "1 000 000 €" }], defaultSources),
                  allianz: makeDetail("Plafond annuel", "allianz", "Allianz", true, "Engagement annuel.", [{ id: "sl-1", label: "Plafond annuel", value: "1 000 000 €" }], defaultSources),
                },
              },
              {
                label: "Franchise",
                values: { axa: { type: "text", value: "1 000 €" }, generali: { type: "text", value: "1 500 €" }, allianz: { type: "text", value: "1 200 €" } },
                details: {
                  axa: makeDetail("Franchise", "axa", "Axa", true, "Franchise fixe par sinistre.", [{ id: "sl-1", label: "Franchise", value: "1 000 €" }], defaultSources),
                  generali: makeDetail("Franchise", "generali", "Generali", true, "Franchise applicable.", [{ id: "sl-1", label: "Franchise", value: "1 500 €" }], defaultSources),
                  allianz: makeDetail("Franchise", "allianz", "Allianz", true, "Franchise par sinistre.", [{ id: "sl-1", label: "Franchise", value: "1 200 €" }], defaultSources),
                },
              },
              {
                label: "Défense pénale",
                values: { axa: { type: "check" }, generali: { type: "check" }, allianz: { type: "cross" } },
                details: {
                  axa: makeDetail("Défense pénale", "axa", "Axa", true, "Prise en charge des frais de défense pénale.", [{ id: "sl-1", label: "Plafond honoraires", value: "75 000 €" }], defaultSources),
                  generali: makeDetail("Défense pénale", "generali", "Generali", true, "Assistance juridique pénale.", [{ id: "sl-1", label: "Plafond honoraires", value: "50 000 €" }], defaultSources),
                  allianz: makeDetail("Défense pénale", "allianz", "Allianz", false, "Non inclus. Option disponible.", [], defaultSources),
                },
              },
            ],
          },
        ],
      },
    ],
  },
  "cot-3": {
    exclusions: [
      {
        id: "excl-d1",
        label: "Faute intentionnelle ou dolosive",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, chubb: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Faute intentionnelle ou dolosive", "axa", "Axa", false, "deterministic", "excl-d1", "Exclusion légale des actes volontaires.", [], defaultSources),
          chubb: makeExclusionDetail("Faute intentionnelle ou dolosive", "chubb", "Chubb", false, "deterministic", "excl-d1", "Exclusion conforme aux standards internationaux.", [], defaultSources),
        },
      },
      {
        id: "excl-d2",
        label: "Amendes et sanctions réglementaires",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, chubb: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Amendes et sanctions réglementaires", "axa", "Axa", false, "deterministic", "excl-d2", "Caractère inassurable des amendes.", [], defaultSources),
          chubb: makeExclusionDetail("Amendes et sanctions réglementaires", "chubb", "Chubb", false, "deterministic", "excl-d2", "Amendes et pénalités de toute nature exclues.", [], defaultSources),
        },
      },
      {
        id: "excl-a1",
        label: "Prestations hors territoire couvert",
        origin: "ai",
        values: { axa: { type: "exclu" }, chubb: { type: "inclus" } },
        details: {
          axa: makeExclusionDetail("Prestations hors territoire couvert", "axa", "Axa", false, "ai", "excl-a1", "Couverture limitée à la France et DOM-TOM.", [], defaultSources),
          chubb: makeExclusionDetail("Prestations hors territoire couvert", "chubb", "Chubb", true, "ai", "excl-a1", "Couverture mondiale incluant les USA/Canada dans la formule Premium.", [], defaultSources),
        },
      },
      {
        id: "excl-a2",
        label: "Retard de livraison de projet",
        origin: "ai",
        values: { axa: { type: "exclu" }, chubb: { type: "exclu-text", value: "Limité" } },
        details: {
          axa: makeExclusionDetail("Retard de livraison de projet", "axa", "Axa", false, "ai", "excl-a2", "Les dommages immatériels consécutifs à un retard sont exclus.", [], defaultSources),
          chubb: makeExclusionDetail("Retard de livraison de projet", "chubb", "Chubb", false, "ai", "excl-a2", "Couverture partielle des préjudices liés aux retards.", [{ id: "sl-1", label: "Sous-limite retard", value: "50 000 €" }], defaultSources),
        },
      },
    ],
    products: [
      {
        title: "RC Pro",
        subGroups: [
          {
            title: "Couvertures",
            rows: [
              {
                label: "Fautes professionnelles",
                values: { axa: { type: "check" }, chubb: { type: "check" } },
                details: {
                  axa: makeDetail("Fautes professionnelles", "axa", "Axa", true, "Erreurs et omissions couvertes.", [{ id: "sl-1", label: "Plafond par sinistre", value: "500 000 €" }], defaultSources),
                  chubb: makeDetail("Fautes professionnelles", "chubb", "Chubb", true, "Couverture large des manquements professionnels.", [{ id: "sl-1", label: "Plafond par sinistre", value: "750 000 €" }], defaultSources),
                },
              },
              {
                label: "Atteinte à la propriété intellectuelle",
                values: { axa: { type: "check" }, chubb: { type: "check" } },
                details: {
                  axa: makeDetail("Atteinte à la propriété intellectuelle", "axa", "Axa", true, "Contrefaçon involontaire couverte.", [{ id: "sl-1", label: "Sous-limite", value: "250 000 €" }], defaultSources),
                  chubb: makeDetail("Atteinte à la propriété intellectuelle", "chubb", "Chubb", true, "Protection étendue de la PI.", [{ id: "sl-1", label: "Sous-limite", value: "500 000 €" }], defaultSources),
                },
              },
              {
                label: "Perte de données client",
                values: { axa: { type: "check" }, chubb: { type: "check" } },
                details: {
                  axa: makeDetail("Perte de données client", "axa", "Axa", true, "Couverture des données avec frais de notification.", [{ id: "sl-1", label: "Sous-limite", value: "150 000 €" }], defaultSources),
                  chubb: makeDetail("Perte de données client", "chubb", "Chubb", true, "Protection complète incluant reconstitution et notification.", [{ id: "sl-1", label: "Sous-limite", value: "300 000 €" }], defaultSources),
                },
              },
              {
                label: "Violation du RGPD",
                values: { axa: { type: "check" }, chubb: { type: "check" } },
                details: {
                  axa: makeDetail("Violation du RGPD", "axa", "Axa", true, "Frais de défense RGPD.", [{ id: "sl-1", label: "Frais de défense", value: "100 000 €" }], defaultSources),
                  chubb: makeDetail("Violation du RGPD", "chubb", "Chubb", true, "Couverture RGPD étendue incluant frais de notification.", [{ id: "sl-1", label: "Frais de défense", value: "150 000 €" }], defaultSources),
                },
              },
              {
                label: "Sous-traitance",
                values: { axa: { type: "text", value: "Couverte" }, chubb: { type: "text", value: "Couverte" } },
                details: {
                  axa: makeDetail("Sous-traitance", "axa", "Axa", true, "Sous-traitants couverts.", [], defaultSources),
                  chubb: makeDetail("Sous-traitance", "chubb", "Chubb", true, "Sous-traitance couverte y compris offshore.", [], defaultSources),
                },
              },
            ],
          },
          {
            title: "Limites et franchises",
            rows: [
              {
                label: "Plafond par sinistre",
                values: { axa: { type: "text", value: "500 000 €" }, chubb: { type: "text", value: "750 000 €" } },
                details: {
                  axa: makeDetail("Plafond par sinistre", "axa", "Axa", true, "Plafond standard.", [{ id: "sl-1", label: "Plafond", value: "500 000 €" }], defaultSources),
                  chubb: makeDetail("Plafond par sinistre", "chubb", "Chubb", true, "Plafond élevé Premium.", [{ id: "sl-1", label: "Plafond", value: "750 000 €" }], defaultSources),
                },
              },
              {
                label: "Plafond annuel",
                values: { axa: { type: "text", value: "1 000 000 €" }, chubb: { type: "text", value: "2 000 000 €" } },
                details: {
                  axa: makeDetail("Plafond annuel", "axa", "Axa", true, "Plafond annuel global.", [{ id: "sl-1", label: "Plafond annuel", value: "1 000 000 €" }], defaultSources),
                  chubb: makeDetail("Plafond annuel", "chubb", "Chubb", true, "Plafond annuel élevé.", [{ id: "sl-1", label: "Plafond annuel", value: "2 000 000 €" }], defaultSources),
                },
              },
              {
                label: "Franchise",
                values: { axa: { type: "text", value: "1 000 €" }, chubb: { type: "text", value: "1 500 €" } },
                details: {
                  axa: makeDetail("Franchise", "axa", "Axa", true, "Franchise fixe.", [{ id: "sl-1", label: "Franchise", value: "1 000 €" }], defaultSources),
                  chubb: makeDetail("Franchise", "chubb", "Chubb", true, "Franchise par sinistre.", [{ id: "sl-1", label: "Franchise", value: "1 500 €" }], defaultSources),
                },
              },
              {
                label: "Défense pénale",
                values: { axa: { type: "check" }, chubb: { type: "check" } },
                details: {
                  axa: makeDetail("Défense pénale", "axa", "Axa", true, "Frais de défense pénale couverts.", [{ id: "sl-1", label: "Plafond", value: "75 000 €" }], defaultSources),
                  chubb: makeDetail("Défense pénale", "chubb", "Chubb", true, "Défense pénale étendue.", [{ id: "sl-1", label: "Plafond", value: "150 000 €" }], defaultSources),
                },
              },
            ],
          },
        ],
      },
    ],
  },
  "cot-4": {
    exclusions: [
      {
        id: "excl-d1",
        label: "Vétusté et défaut d'entretien",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, maif: { type: "exclu" }, generali: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Vétusté et défaut d'entretien", "axa", "Axa", false, "deterministic", "excl-d1", "Dommages résultant d'un défaut d'entretien du bâtiment.", [], defaultSources),
          maif: makeExclusionDetail("Vétusté et défaut d'entretien", "maif", "MAIF", false, "deterministic", "excl-d1", "Exclusion des dommages liés à la vétusté.", [], defaultSources),
          generali: makeExclusionDetail("Vétusté et défaut d'entretien", "generali", "Generali", false, "deterministic", "excl-d1", "La vétusté n'est pas couverte.", [], defaultSources),
        },
      },
      {
        id: "excl-d2",
        label: "Guerre et actes de terrorisme",
        origin: "deterministic",
        values: { axa: { type: "exclu" }, maif: { type: "exclu" }, generali: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Guerre et actes de terrorisme", "axa", "Axa", false, "deterministic", "excl-d2", "Exclusion standard GAREAT hors contribution.", [], defaultSources),
          maif: makeExclusionDetail("Guerre et actes de terrorisme", "maif", "MAIF", false, "deterministic", "excl-d2", "Faits de guerre et terrorisme exclus.", [], defaultSources),
          generali: makeExclusionDetail("Guerre et actes de terrorisme", "generali", "Generali", false, "deterministic", "excl-d2", "Exclusion légale des risques de guerre.", [], defaultSources),
        },
      },
      {
        id: "excl-a1",
        label: "Dommages aux installations informatiques",
        origin: "ai",
        values: { axa: { type: "exclu-text", value: "Sous-limite" }, maif: { type: "inclus" }, generali: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Dommages aux installations informatiques", "axa", "Axa", false, "ai", "excl-a1", "Matériel informatique couvert avec sous-limite spécifique.", [{ id: "sl-1", label: "Sous-limite", value: "30 000 €" }], defaultSources),
          maif: makeExclusionDetail("Dommages aux installations informatiques", "maif", "MAIF", true, "ai", "excl-a1", "Couverture complète du matériel informatique et bureautique.", [], defaultSources),
          generali: makeExclusionDetail("Dommages aux installations informatiques", "generali", "Generali", false, "ai", "excl-a1", "Matériel informatique exclu. Contrat spécifique requis.", [], defaultSources),
        },
      },
      {
        id: "excl-a2",
        label: "Perte de loyers suite sinistre",
        origin: "ai",
        values: { axa: { type: "inclus" }, maif: { type: "inclus" }, generali: { type: "exclu" } },
        details: {
          axa: makeExclusionDetail("Perte de loyers suite sinistre", "axa", "Axa", true, "ai", "excl-a2", "Indemnisation de la perte de loyers en cas d'immobilisation.", [{ id: "sl-1", label: "Durée max", value: "12 mois" }], defaultSources),
          maif: makeExclusionDetail("Perte de loyers suite sinistre", "maif", "MAIF", true, "ai", "excl-a2", "Perte de loyers couverte pendant la remise en état.", [{ id: "sl-1", label: "Durée max", value: "24 mois" }], defaultSources),
          generali: makeExclusionDetail("Perte de loyers suite sinistre", "generali", "Generali", false, "ai", "excl-a2", "Non couvert dans la formule Standard.", [], defaultSources),
        },
      },
    ],
    products: [
      {
        title: "Multirisque",
        subGroups: [
          {
            title: "Couverture des locaux",
            rows: [
              {
                label: "Incendie et explosion",
                values: { axa: { type: "check" }, maif: { type: "check" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("Incendie et explosion", "axa", "Axa", true, "Couverture complète incendie, explosion, implosion.", [{ id: "sl-1", label: "Valeur à neuf", value: "Oui" }], defaultSources),
                  maif: makeDetail("Incendie et explosion", "maif", "MAIF", true, "Protection incendie avec remplacement à neuf.", [{ id: "sl-1", label: "Valeur à neuf", value: "Oui" }], defaultSources),
                  generali: makeDetail("Incendie et explosion", "generali", "Generali", true, "Garantie incendie standard.", [{ id: "sl-1", label: "Valeur à neuf", value: "Non — vétusté déduite" }], defaultSources),
                },
              },
              {
                label: "Dégâts des eaux",
                values: { axa: { type: "check" }, maif: { type: "check" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("Dégâts des eaux", "axa", "Axa", true, "Fuites, débordements, infiltrations couverts.", [], defaultSources),
                  maif: makeDetail("Dégâts des eaux", "maif", "MAIF", true, "Couverture étendue incluant recherche de fuite.", [], defaultSources),
                  generali: makeDetail("Dégâts des eaux", "generali", "Generali", true, "Dégâts des eaux courants.", [], defaultSources),
                },
              },
              {
                label: "Vol et vandalisme",
                values: { axa: { type: "check" }, maif: { type: "check" }, generali: { type: "cross" } },
                details: {
                  axa: makeDetail("Vol et vandalisme", "axa", "Axa", true, "Vol par effraction et vandalisme couverts.", [{ id: "sl-1", label: "Plafond contenu", value: "50 000 €" }], defaultSources),
                  maif: makeDetail("Vol et vandalisme", "maif", "MAIF", true, "Protection vol avec revalorisation annuelle.", [{ id: "sl-1", label: "Plafond contenu", value: "75 000 €" }], defaultSources),
                  generali: makeDetail("Vol et vandalisme", "generali", "Generali", false, "Non inclus dans la formule Standard.", [], defaultSources),
                },
              },
              {
                label: "Catastrophes naturelles",
                values: { axa: { type: "check" }, maif: { type: "check" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("Catastrophes naturelles", "axa", "Axa", true, "Régime CatNat obligatoire.", [], defaultSources),
                  maif: makeDetail("Catastrophes naturelles", "maif", "MAIF", true, "Régime CatNat avec accompagnement dédié.", [], defaultSources),
                  generali: makeDetail("Catastrophes naturelles", "generali", "Generali", true, "Régime CatNat obligatoire.", [], defaultSources),
                },
              },
              {
                label: "Bris de glace",
                values: { axa: { type: "check" }, maif: { type: "check" }, generali: { type: "text", value: "Option" } },
                details: {
                  axa: makeDetail("Bris de glace", "axa", "Axa", true, "Vitrines, enseignes et glaces incluses.", [], defaultSources),
                  maif: makeDetail("Bris de glace", "maif", "MAIF", true, "Bris de glace étendu aux enseignes lumineuses.", [], defaultSources),
                  generali: makeDetail("Bris de glace", "generali", "Generali", true, "Disponible en option.", [], defaultSources),
                },
              },
            ],
          },
          {
            title: "Responsabilité civile",
            rows: [
              {
                label: "RC exploitation",
                values: { axa: { type: "check" }, maif: { type: "check" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("RC exploitation", "axa", "Axa", true, "Responsabilité civile dans le cadre de l'activité.", [{ id: "sl-1", label: "Plafond RC", value: "3 000 000 €" }], defaultSources),
                  maif: makeDetail("RC exploitation", "maif", "MAIF", true, "RC professionnelle et exploitation.", [{ id: "sl-1", label: "Plafond RC", value: "5 000 000 €" }], defaultSources),
                  generali: makeDetail("RC exploitation", "generali", "Generali", true, "RC exploitation standard.", [{ id: "sl-1", label: "Plafond RC", value: "2 000 000 €" }], defaultSources),
                },
              },
              {
                label: "RC après livraison",
                values: { axa: { type: "check" }, maif: { type: "check" }, generali: { type: "cross" } },
                details: {
                  axa: makeDetail("RC après livraison", "axa", "Axa", true, "Couverture des dommages après travaux.", [], defaultSources),
                  maif: makeDetail("RC après livraison", "maif", "MAIF", true, "Garantie post-intervention.", [], defaultSources),
                  generali: makeDetail("RC après livraison", "generali", "Generali", false, "Non inclus. Avenant disponible.", [], defaultSources),
                },
              },
              {
                label: "Protection juridique",
                values: { axa: { type: "check" }, maif: { type: "check" }, generali: { type: "check" } },
                details: {
                  axa: makeDetail("Protection juridique", "axa", "Axa", true, "Accompagnement juridique et prise en charge des frais.", [{ id: "sl-1", label: "Plafond", value: "15 000 €" }], defaultSources),
                  maif: makeDetail("Protection juridique", "maif", "MAIF", true, "Protection juridique étendue.", [{ id: "sl-1", label: "Plafond", value: "25 000 €" }], defaultSources),
                  generali: makeDetail("Protection juridique", "generali", "Generali", true, "Protection juridique de base.", [{ id: "sl-1", label: "Plafond", value: "10 000 €" }], defaultSources),
                },
              },
            ],
          },
          {
            title: "Services et franchises",
            rows: [
              {
                label: "Franchise générale",
                values: { axa: { type: "text", value: "500 €" }, maif: { type: "text", value: "300 €" }, generali: { type: "text", value: "400 €" } },
                details: {
                  axa: makeDetail("Franchise générale", "axa", "Axa", true, "Franchise applicable par sinistre.", [{ id: "sl-1", label: "Franchise", value: "500 €" }], defaultSources),
                  maif: makeDetail("Franchise générale", "maif", "MAIF", true, "Franchise basse.", [{ id: "sl-1", label: "Franchise", value: "300 €" }], defaultSources),
                  generali: makeDetail("Franchise générale", "generali", "Generali", true, "Franchise standard.", [{ id: "sl-1", label: "Franchise", value: "400 €" }], defaultSources),
                },
              },
              {
                label: "Assistance 24h/24",
                values: { axa: { type: "check" }, maif: { type: "check" }, generali: { type: "cross" } },
                details: {
                  axa: makeDetail("Assistance 24h/24", "axa", "Axa", true, "Numéro d'urgence et intervention rapide.", [], defaultSources),
                  maif: makeDetail("Assistance 24h/24", "maif", "MAIF", true, "Service d'urgence avec intervention sous 2h.", [], defaultSources),
                  generali: makeDetail("Assistance 24h/24", "generali", "Generali", false, "Non inclus dans cette formule.", [], defaultSources),
                },
              },
              {
                label: "Valeur à neuf",
                values: { axa: { type: "text", value: "25 ans" }, maif: { type: "text", value: "Illimitée" }, generali: { type: "text", value: "10 ans" } },
                details: {
                  axa: makeDetail("Valeur à neuf", "axa", "Axa", true, "Remplacement valeur à neuf si bien < 25 ans.", [], defaultSources),
                  maif: makeDetail("Valeur à neuf", "maif", "MAIF", true, "Remplacement à neuf sans limite d'ancienneté.", [], defaultSources),
                  generali: makeDetail("Valeur à neuf", "generali", "Generali", true, "Remplacement à neuf limité à 10 ans.", [], defaultSources),
                },
              },
            ],
          },
        ],
      },
    ],
  },
  "cot-7": {
    products: [
      {
        title: "Santé collective",
        subGroups: [
          {
            title: "Hospitalisation",
            rows: [
              {
                label: "Frais de séjour",
                values: { alan: { type: "text", value: "100% BR" }, malakoff: { type: "text", value: "150% BR" }, generali: { type: "text", value: "100% BR" } },
                details: {
                  alan: makeDetail("Frais de séjour", "alan", "Alan", true, "Prise en charge des frais de séjour hospitalier.", [{ id: "sl-1", label: "Base", value: "100% BR" }], defaultSources),
                  malakoff: makeDetail("Frais de séjour", "malakoff", "Malakoff Humanis", true, "Prise en charge majorée des frais de séjour.", [{ id: "sl-1", label: "Base", value: "150% BR" }], defaultSources),
                  generali: makeDetail("Frais de séjour", "generali", "Generali", true, "Remboursement frais de séjour.", [{ id: "sl-1", label: "Base", value: "100% BR" }], defaultSources),
                },
              },
              {
                label: "Chambre particulière",
                values: { alan: { type: "text", value: "80 €/jour" }, malakoff: { type: "text", value: "60 €/jour" }, generali: { type: "text", value: "70 €/jour" } },
                details: {
                  alan: makeDetail("Chambre particulière", "alan", "Alan", true, "Forfait chambre individuelle.", [{ id: "sl-1", label: "Plafond", value: "80 €/jour" }], defaultSources),
                  malakoff: makeDetail("Chambre particulière", "malakoff", "Malakoff Humanis", true, "Indemnité chambre seule.", [{ id: "sl-1", label: "Plafond", value: "60 €/jour" }], defaultSources),
                  generali: makeDetail("Chambre particulière", "generali", "Generali", true, "Forfait chambre particulière.", [{ id: "sl-1", label: "Plafond", value: "70 €/jour" }], defaultSources),
                },
              },
              {
                label: "Honoraires chirurgicaux",
                values: { alan: { type: "text", value: "200% BR" }, malakoff: { type: "text", value: "250% BR" }, generali: { type: "text", value: "200% BR" } },
                details: {
                  alan: makeDetail("Honoraires chirurgicaux", "alan", "Alan", true, "Dépassements d'honoraires chirurgicaux.", [{ id: "sl-1", label: "Base", value: "200% BR" }], defaultSources),
                  malakoff: makeDetail("Honoraires chirurgicaux", "malakoff", "Malakoff Humanis", true, "Prise en charge étendue des dépassements.", [{ id: "sl-1", label: "Base", value: "250% BR" }], defaultSources),
                  generali: makeDetail("Honoraires chirurgicaux", "generali", "Generali", true, "Honoraires chirurgicaux.", [{ id: "sl-1", label: "Base", value: "200% BR" }], defaultSources),
                },
              },
            ],
          },
          {
            title: "Soins courants",
            rows: [
              {
                label: "Consultations généralistes",
                values: { alan: { type: "text", value: "100% BR" }, malakoff: { type: "text", value: "100% BR" }, generali: { type: "text", value: "100% BR" } },
                details: {
                  alan: makeDetail("Consultations généralistes", "alan", "Alan", true, "Consultations médecin traitant.", [], defaultSources),
                  malakoff: makeDetail("Consultations généralistes", "malakoff", "Malakoff Humanis", true, "Consultations généralistes dans le parcours de soins.", [], defaultSources),
                  generali: makeDetail("Consultations généralistes", "generali", "Generali", true, "Consultations médecin.", [], defaultSources),
                },
              },
              {
                label: "Consultations spécialistes",
                values: { alan: { type: "text", value: "200% BR" }, malakoff: { type: "text", value: "150% BR" }, generali: { type: "text", value: "180% BR" } },
                details: {
                  alan: makeDetail("Consultations spécialistes", "alan", "Alan", true, "Dépassements d'honoraires spécialistes.", [{ id: "sl-1", label: "Base", value: "200% BR" }], defaultSources),
                  malakoff: makeDetail("Consultations spécialistes", "malakoff", "Malakoff Humanis", true, "Consultations spécialistes avec dépassements.", [{ id: "sl-1", label: "Base", value: "150% BR" }], defaultSources),
                  generali: makeDetail("Consultations spécialistes", "generali", "Generali", true, "Honoraires spécialistes.", [{ id: "sl-1", label: "Base", value: "180% BR" }], defaultSources),
                },
              },
              {
                label: "Pharmacie",
                values: { alan: { type: "text", value: "100% BR" }, malakoff: { type: "text", value: "100% BR" }, generali: { type: "text", value: "100% BR" } },
                details: {
                  alan: makeDetail("Pharmacie", "alan", "Alan", true, "Médicaments remboursés par la Sécu.", [], defaultSources),
                  malakoff: makeDetail("Pharmacie", "malakoff", "Malakoff Humanis", true, "Pharmacie prescrite.", [], defaultSources),
                  generali: makeDetail("Pharmacie", "generali", "Generali", true, "Médicaments remboursés.", [], defaultSources),
                },
              },
            ],
          },
          {
            title: "Optique et dentaire",
            rows: [
              {
                label: "Monture + verres",
                values: { alan: { type: "text", value: "200 €/an" }, malakoff: { type: "text", value: "150 €/an" }, generali: { type: "text", value: "180 €/an" } },
                details: {
                  alan: makeDetail("Monture + verres", "alan", "Alan", true, "Forfait annuel optique.", [{ id: "sl-1", label: "Plafond", value: "200 €/an" }], defaultSources),
                  malakoff: makeDetail("Monture + verres", "malakoff", "Malakoff Humanis", true, "Forfait optique.", [{ id: "sl-1", label: "Plafond", value: "150 €/an" }], defaultSources),
                  generali: makeDetail("Monture + verres", "generali", "Generali", true, "Forfait optique annuel.", [{ id: "sl-1", label: "Plafond", value: "180 €/an" }], defaultSources),
                },
              },
              {
                label: "Prothèses dentaires",
                values: { alan: { type: "text", value: "300% BR" }, malakoff: { type: "text", value: "250% BR" }, generali: { type: "text", value: "200% BR" } },
                details: {
                  alan: makeDetail("Prothèses dentaires", "alan", "Alan", true, "Prothèses dentaires remboursées.", [{ id: "sl-1", label: "Base", value: "300% BR" }], defaultSources),
                  malakoff: makeDetail("Prothèses dentaires", "malakoff", "Malakoff Humanis", true, "Couverture prothèses.", [{ id: "sl-1", label: "Base", value: "250% BR" }], defaultSources),
                  generali: makeDetail("Prothèses dentaires", "generali", "Generali", true, "Prothèses dentaires.", [{ id: "sl-1", label: "Base", value: "200% BR" }], defaultSources),
                },
              },
              {
                label: "Orthodontie",
                values: { alan: { type: "check" }, malakoff: { type: "check" }, generali: { type: "cross" } },
                details: {
                  alan: makeDetail("Orthodontie", "alan", "Alan", true, "Orthodontie acceptée par la Sécu.", [{ id: "sl-1", label: "Forfait", value: "600 €/an" }], defaultSources),
                  malakoff: makeDetail("Orthodontie", "malakoff", "Malakoff Humanis", true, "Orthodontie enfants et adultes.", [{ id: "sl-1", label: "Forfait", value: "400 €/an" }], defaultSources),
                  generali: makeDetail("Orthodontie", "generali", "Generali", false, "Non couvert dans cette formule.", [], defaultSources),
                },
              },
            ],
          },
        ],
      },
    ],
    exclusions: [
      {
        id: "excl-d1",
        label: "Actes hors nomenclature Sécu",
        origin: "deterministic",
        values: { alan: { type: "inclus" }, malakoff: { type: "exclu" }, generali: { type: "exclu" } },
        details: {
          alan: makeExclusionDetail("Actes hors nomenclature", "alan", "Alan", true, "deterministic", "excl-d1", "Certains actes hors nomenclature pris en charge dans le cadre du forfait bien-être.", [], defaultSources),
          malakoff: makeExclusionDetail("Actes hors nomenclature", "malakoff", "Malakoff Humanis", false, "deterministic", "excl-d1", "Actes non remboursés par la Sécurité sociale exclus.", [], defaultSources),
          generali: makeExclusionDetail("Actes hors nomenclature", "generali", "Generali", false, "deterministic", "excl-d1", "Exclusion des actes hors nomenclature.", [], defaultSources),
        },
      },
      {
        id: "excl-d2",
        label: "Médecines douces",
        origin: "ai",
        values: { alan: { type: "inclus" }, malakoff: { type: "exclu-text", value: "Limité" }, generali: { type: "exclu" } },
        details: {
          alan: makeExclusionDetail("Médecines douces", "alan", "Alan", true, "ai", "excl-d2", "Ostéopathie, acupuncture, naturopathie incluses.", [{ id: "sl-1", label: "Forfait", value: "4 séances/an" }], defaultSources),
          malakoff: makeExclusionDetail("Médecines douces", "malakoff", "Malakoff Humanis", false, "ai", "excl-d2", "Ostéopathie uniquement, limitée à 2 séances/an.", [{ id: "sl-1", label: "Plafond", value: "2 séances/an" }], defaultSources),
          generali: makeExclusionDetail("Médecines douces", "generali", "Generali", false, "ai", "excl-d2", "Médecines alternatives non couvertes.", [], defaultSources),
        },
      },
    ],
    rateProducts: [
      {
        title: "Cotisations par régime",
        rateUnit: "eur_per_person_month",
        employerShareFieldId: "partEmployeur",
        subGroups: [
          {
            title: "Cadres",
            rows: [
              { label: "Isolé", dynamicFieldId: "cadresIsole", rates: { alan: 82.50, malakoff: 78.30, generali: 85.00 } },
              { label: "Duo", dynamicFieldId: "cadresDuo", rates: { alan: 165.00, malakoff: 156.60, generali: 170.00 } },
              { label: "Famille", dynamicFieldId: "cadresFamille", rates: { alan: 214.50, malakoff: 203.60, generali: 221.00 } },
            ],
          },
          {
            title: "Non-cadres",
            rows: [
              { label: "Isolé", dynamicFieldId: "nonCadresIsole", rates: { alan: 62.00, malakoff: 59.80, generali: 64.50 } },
              { label: "Duo", dynamicFieldId: "nonCadresDuo", rates: { alan: 124.00, malakoff: 119.60, generali: 129.00 } },
              { label: "Famille", dynamicFieldId: "nonCadresFamille", rates: { alan: 161.20, malakoff: 155.50, generali: 167.70 } },
            ],
          },
        ],
      },
    ],
    dynamicFields: [
      { id: "cadresIsole", label: "Isolé", sectionKey: "effectifsCadres", sectionLabel: "Effectifs cadres", type: "number" },
      { id: "cadresDuo", label: "Duo", sectionKey: "effectifsCadres", sectionLabel: "Effectifs cadres", type: "number" },
      { id: "cadresFamille", label: "Famille", sectionKey: "effectifsCadres", sectionLabel: "Effectifs cadres", type: "number" },
      { id: "nonCadresIsole", label: "Isolé", sectionKey: "effectifsNonCadres", sectionLabel: "Effectifs non-cadres", type: "number" },
      { id: "nonCadresDuo", label: "Duo", sectionKey: "effectifsNonCadres", sectionLabel: "Effectifs non-cadres", type: "number" },
      { id: "nonCadresFamille", label: "Famille", sectionKey: "effectifsNonCadres", sectionLabel: "Effectifs non-cadres", type: "number" },
      { id: "partEmployeur", label: "Part employeur (%)", sectionKey: "repartition", sectionLabel: "Répartition cotisation", type: "number" },
    ],
    dynamicFieldValues: { partEmployeur: 50 },
  },
  "cot-6": {
    products: [
      {
        title: "Prévoyance / AT",
        subGroups: [
          {
            title: "Garanties décès",
            rows: [
              {
                label: "Capital décès toute cause",
                values: { generali: { type: "text", value: "300% TA + 200% TB" }, axa: { type: "text", value: "250% TA + 200% TB" }, allianz: { type: "text", value: "300% TA + 250% TB" } },
                details: {
                  generali: makeDetail("Capital décès toute cause", "generali", "Generali", true, "Capital versé en cas de décès quelle qu'en soit la cause.", [{ id: "sl-1", label: "Tranche A", value: "300% du salaire" }, { id: "sl-2", label: "Tranche B", value: "200% du salaire" }], defaultSources),
                  axa: makeDetail("Capital décès toute cause", "axa", "Axa", true, "Capital décès versé aux bénéficiaires désignés.", [{ id: "sl-1", label: "Tranche A", value: "250% du salaire" }, { id: "sl-2", label: "Tranche B", value: "200% du salaire" }], defaultSources),
                  allianz: makeDetail("Capital décès toute cause", "allianz", "Allianz", true, "Garantie décès avec doublement en cas d'accident.", [{ id: "sl-1", label: "Tranche A", value: "300% du salaire" }, { id: "sl-2", label: "Tranche B", value: "250% du salaire" }], defaultSources),
                },
              },
              {
                label: "Rente éducation",
                values: { generali: { type: "check" }, axa: { type: "check" }, allianz: { type: "cross" } },
                details: {
                  generali: makeDetail("Rente éducation", "generali", "Generali", true, "Rente versée aux enfants à charge jusqu'à 26 ans si poursuite d'études.", [{ id: "sl-1", label: "Montant", value: "12% du salaire / enfant" }], defaultSources),
                  axa: makeDetail("Rente éducation", "axa", "Axa", true, "Rente éducation jusqu'à 25 ans.", [{ id: "sl-1", label: "Montant", value: "10% du salaire / enfant" }], defaultSources),
                  allianz: makeDetail("Rente éducation", "allianz", "Allianz", false, "Non incluse. Option disponible.", [], defaultSources),
                },
              },
              {
                label: "Rente de conjoint",
                values: { generali: { type: "text", value: "60% du salaire" }, axa: { type: "text", value: "50% du salaire" }, allianz: { type: "text", value: "60% du salaire" } },
                details: {
                  generali: makeDetail("Rente de conjoint", "generali", "Generali", true, "Rente viagère au conjoint survivant.", [{ id: "sl-1", label: "Taux", value: "60% du salaire" }], defaultSources),
                  axa: makeDetail("Rente de conjoint", "axa", "Axa", true, "Rente temporaire au conjoint.", [{ id: "sl-1", label: "Taux", value: "50% du salaire" }], defaultSources),
                  allianz: makeDetail("Rente de conjoint", "allianz", "Allianz", true, "Rente viagère au conjoint.", [{ id: "sl-1", label: "Taux", value: "60% du salaire" }], defaultSources),
                },
              },
            ],
          },
          {
            title: "Incapacité et invalidité",
            rows: [
              {
                label: "Indemnités journalières",
                values: { generali: { type: "text", value: "90% du salaire" }, axa: { type: "text", value: "85% du salaire" }, allianz: { type: "text", value: "90% du salaire" } },
                details: {
                  generali: makeDetail("Indemnités journalières", "generali", "Generali", true, "IJ versées après franchise de 90 jours.", [{ id: "sl-1", label: "Franchise", value: "90 jours" }, { id: "sl-2", label: "Durée max", value: "1 095 jours" }], defaultSources),
                  axa: makeDetail("Indemnités journalières", "axa", "Axa", true, "IJ versées dès le 91e jour d'arrêt.", [{ id: "sl-1", label: "Franchise", value: "90 jours" }, { id: "sl-2", label: "Durée max", value: "1 095 jours" }], defaultSources),
                  allianz: makeDetail("Indemnités journalières", "allianz", "Allianz", true, "IJ avec maintien de 90% du salaire net.", [{ id: "sl-1", label: "Franchise", value: "90 jours" }], defaultSources),
                },
              },
              {
                label: "Invalidité permanente",
                values: { generali: { type: "check" }, axa: { type: "check" }, allianz: { type: "check" } },
                details: {
                  generali: makeDetail("Invalidité permanente", "generali", "Generali", true, "Rente d'invalidité selon catégorie.", [{ id: "sl-1", label: "Cat. 1", value: "40% du salaire" }, { id: "sl-2", label: "Cat. 2-3", value: "80% du salaire" }], defaultSources),
                  axa: makeDetail("Invalidité permanente", "axa", "Axa", true, "Rente d'invalidité.", [{ id: "sl-1", label: "Cat. 1", value: "36% du salaire" }, { id: "sl-2", label: "Cat. 2-3", value: "75% du salaire" }], defaultSources),
                  allianz: makeDetail("Invalidité permanente", "allianz", "Allianz", true, "Rente d'invalidité.", [{ id: "sl-1", label: "Cat. 1", value: "40% du salaire" }, { id: "sl-2", label: "Cat. 2-3", value: "80% du salaire" }], defaultSources),
                },
              },
              {
                label: "Doublement accident",
                values: { generali: { type: "check" }, axa: { type: "cross" }, allianz: { type: "check" } },
                details: {
                  generali: makeDetail("Doublement accident", "generali", "Generali", true, "Capital doublé en cas de décès ou invalidité par accident.", [], defaultSources),
                  axa: makeDetail("Doublement accident", "axa", "Axa", false, "Non inclus dans la formule.", [], defaultSources),
                  allianz: makeDetail("Doublement accident", "allianz", "Allianz", true, "Doublement du capital en cas d'accident.", [], defaultSources),
                },
              },
            ],
          },
        ],
      },
    ],
    exclusions: [
      {
        id: "excl-d1",
        label: "Faute intentionnelle de l'assuré",
        origin: "deterministic",
        values: { generali: { type: "exclu" }, axa: { type: "exclu" }, allianz: { type: "exclu" } },
        details: {
          generali: makeExclusionDetail("Faute intentionnelle de l'assuré", "generali", "Generali", false, "deterministic", "excl-d1", "Exclusion légale des actes intentionnels.", [], defaultSources),
          axa: makeExclusionDetail("Faute intentionnelle de l'assuré", "axa", "Axa", false, "deterministic", "excl-d1", "Exclusion conforme au Code des assurances.", [], defaultSources),
          allianz: makeExclusionDetail("Faute intentionnelle de l'assuré", "allianz", "Allianz", false, "deterministic", "excl-d1", "Actes volontaires exclus.", [], defaultSources),
        },
      },
      {
        id: "excl-d2",
        label: "Guerre et émeute",
        origin: "deterministic",
        values: { generali: { type: "exclu" }, axa: { type: "exclu" }, allianz: { type: "exclu" } },
        details: {
          generali: makeExclusionDetail("Guerre et émeute", "generali", "Generali", false, "deterministic", "excl-d2", "Faits de guerre, guerre civile, émeutes.", [], defaultSources),
          axa: makeExclusionDetail("Guerre et émeute", "axa", "Axa", false, "deterministic", "excl-d2", "Événements de guerre et assimilés.", [], defaultSources),
          allianz: makeExclusionDetail("Guerre et émeute", "allianz", "Allianz", false, "deterministic", "excl-d2", "Risques de guerre exclus.", [], defaultSources),
        },
      },
      {
        id: "excl-a1",
        label: "Sports à risque pratiqués hors cadre professionnel",
        origin: "ai",
        values: { generali: { type: "exclu" }, axa: { type: "inclus" }, allianz: { type: "exclu-text", value: "Rachat possible" } },
        details: {
          generali: makeExclusionDetail("Sports à risque", "generali", "Generali", false, "ai", "excl-a1", "Pratique de sports dangereux hors activité professionnelle exclue.", [], defaultSources),
          axa: makeExclusionDetail("Sports à risque", "axa", "Axa", true, "ai", "excl-a1", "Sports à risque couverts sans surcoût dans la formule Confort.", [], defaultSources),
          allianz: makeExclusionDetail("Sports à risque", "allianz", "Allianz", false, "ai", "excl-a1", "Exclusion standard, rachat possible via avenant.", [{ id: "sl-1", label: "Surprime", value: "+15%" }], defaultSources),
        },
      },
    ],
    rateProducts: [
      {
        title: "Cotisations par catégorie",
        subGroups: [
          {
            title: "Masse salariale 2025",
            rows: [
              {
                label: "Cadres (tranche A)",
                dynamicFieldId: "payroll-cadres-ta",
                rates: { generali: 0.0185, axa: 0.0172, allianz: 0.0190 },
              },
              {
                label: "Cadres (tranche B)",
                dynamicFieldId: "payroll-cadres-tb",
                rates: { generali: 0.0220, axa: 0.0215, allianz: 0.0230 },
              },
              {
                label: "Non-cadres (tranche A)",
                dynamicFieldId: "payroll-noncadres-ta",
                rates: { generali: 0.0110, axa: 0.0105, allianz: 0.0115 },
              },
              {
                label: "Non-cadres (tranche B)",
                dynamicFieldId: "payroll-noncadres-tb",
                rates: { generali: 0.0145, axa: 0.0138, allianz: 0.0150 },
              },
            ],
          },
        ],
      },
    ],
    dynamicFields: [
      { id: "payroll-cadres-ta", label: "Cadres (tranche A)", sectionKey: "masseSalariale2025", sectionLabel: "Masse salariale 2025", type: "number", required: true },
      { id: "payroll-cadres-tb", label: "Cadres (tranche B)", sectionKey: "masseSalariale2025", sectionLabel: "Masse salariale 2025", type: "number", required: true },
      { id: "payroll-noncadres-ta", label: "Non-cadres (tranche A)", sectionKey: "masseSalariale2025", sectionLabel: "Masse salariale 2025", type: "number", required: true },
      { id: "payroll-noncadres-tb", label: "Non-cadres (tranche B)", sectionKey: "masseSalariale2025", sectionLabel: "Masse salariale 2025", type: "number" },
    ],
    dynamicFieldValues: {},
  },
};

export function getComparisonData(cotationId: string): ComparisonData | undefined {
  return comparisonDataMap[cotationId];
}

// ─── Analysis data ──────────────────────────────────────────────────

export type ContextPill = {
  id: string;
  label: string;
  source: "extracted" | "ai" | "manual" | "missing";
  /** For missing pills: explains why this info would improve the analysis */
  hint?: string;
};

export type AnalysisSyntheseItem = {
  insurerId: string;
  pointsForts: string[];
  pointsFaibles: string[];
};

export type AnalysisData = {
  synthese: AnalysisSyntheseItem[];
  contextPills: ContextPill[];
  hasFullContext: boolean;
  /** Free text above the context pills */
  contextNoteBefore?: string;
  /** Free text below the context pills */
  contextNoteAfter?: string;
  resumeExecutif: string;
  conditionsFinancieres: { analysisBefore: string; analysisAfter: string };
  analyseParOffre: Array<{ insurerId: string; insurerName: string; pointsForts: string[]; pointsFaibles: string[] }>;
  garantiesCles: Array<{ label: string; type?: "guarantee" | "exclusion"; values: Record<string, { status: "covered" | "not_covered"; keyInfo?: string }> }>;
};

const analysisDataMap: Record<string, AnalysisData> = {
  "cot-1": {
    synthese: [
      {
        insurerId: "axa",
        pointsForts: [
          "Meilleur rapport qualité-prix sur la formule Essentielle",
          "Couverture RC Pro étendue aux sous-traitants incluse",
          "Franchise compétitive à 500 €/sinistre",
        ],
        pointsFaibles: [
          "Protection cyber non incluse en formule Essentielle",
          "Plafond de garantie limité à 1 500 000 € en Essentielle",
        ],
      },
      {
        insurerId: "generali",
        pointsForts: [
          "Protection juridique incluse dès la première formule",
          "Couverture monde entier sans surcoût",
        ],
        pointsFaibles: [
          "Prime annuelle la plus élevée du panel",
          "Franchise élevée à 1 000 €/sinistre",
          "Délai de carence de 30 jours sur la cyber",
        ],
      },
      {
        insurerId: "allianz",
        pointsForts: [
          "Protection cyber incluse dès la formule de base",
          "Assistance juridique étendue incluse",
          "Plafond RC le plus élevé à 3 000 000 €",
        ],
        pointsFaibles: [
          "Tarif intermédiaire mais pas le plus compétitif",
          "Exclusion des sous-traitants hors UE",
        ],
      },
    ],
    contextPills: [
      { id: "cp-1", label: "CA 2,4 M€", source: "extracted" },
      { id: "cp-2", label: "Activité : conseil IT", source: "extracted" },
      { id: "cp-3", label: "12 salariés", source: "extracted" },
      { id: "cp-4", label: "Sinistralité 3 ans : 0", source: "manual" },
      { id: "cp-5", label: "Sous-traitance", source: "missing", hint: "Impacte le perimetre de couverture RC" },
      { id: "cp-6", label: "Activité à l'international", source: "missing", hint: "Determine la zone geographique de garantie" },
    ],
    hasFullContext: false,
    resumeExecutif: "L'analyse comparative des trois offres RC Pro pour Marble Tech SAS révèle des positionnements différenciés. Axa propose le tarif le plus compétitif avec la formule Essentielle à 810,52 €/an, tandis qu'Allianz offre la couverture la plus complète avec une protection cyber incluse dès la formule de base.\n\nGenerali se positionne en milieu de gamme avec un avantage notable sur la protection juridique incluse et la couverture monde entier. Cependant, la franchise plus élevée (1 000 €) et le délai de carence sur la cyber constituent des points de vigilance.\n\nRecommandation : compte tenu du profil technologique de Marble Tech et du besoin en couverture cyber, l'offre Allianz présente le meilleur alignement avec les besoins exprimés. L'offre Axa reste pertinente si le budget est la priorité, sous réserve de souscrire l'option cyber.",
    conditionsFinancieres: {
      analysisBefore: "Les trois assureurs proposent chacun trois niveaux de formule. Les écarts de prime annuelle varient de 539,48 € entre la formule la moins chère (Axa Essentielle à 810,52 €) et la plus chère (Allianz Étendue à 1 350,00 €). Les franchises diffèrent sensiblement : 500 € chez Axa, 750 € chez Allianz et 1 000 € chez Generali.",
      analysisAfter: "En rapportant le coût au chiffre d'affaires de 2,4 M€, la prime Axa représente 0,034% du CA en formule Essentielle, ce qui reste dans la fourchette basse du marché pour une RC Pro IT. Le surcoût de la couverture cyber chez Allianz (incluse) vs Axa (option à ~200 €/an) doit être intégré dans la comparaison.",
    },
    analyseParOffre: [
      {
        insurerId: "axa",
        insurerName: "Axa",
        pointsForts: [
          "Tarif le plus compétitif du panel avec la formule Essentielle à 810,52 €/an",
          "RC Pro étendue aux sous-traitants incluse dans toutes les formules",
          "Franchise contenue à 500 €/sinistre, la plus basse du panel",
          "Trois niveaux de formule permettant un ajustement fin de la couverture",
        ],
        pointsFaibles: [
          "Protection cyber non incluse en formule Essentielle, disponible en option",
          "Plafond de garantie limité à 1 500 000 € en formule Essentielle",
          "Pas de protection juridique en standard",
        ],
      },
      {
        insurerId: "generali",
        insurerName: "Generali",
        pointsForts: [
          "Protection juridique incluse dès la première formule",
          "Couverture monde entier sans restriction géographique",
          "Garantie perte d'exploitation incluse en formule Premium",
        ],
        pointsFaibles: [
          "Prime annuelle la plus élevée du panel sur les formules comparables",
          "Franchise la plus élevée à 1 000 €/sinistre",
          "Délai de carence de 30 jours sur la garantie cyber",
          "Sous-traitants hors UE non couverts",
        ],
      },
      {
        insurerId: "allianz",
        insurerName: "Allianz",
        pointsForts: [
          "Protection cyber incluse dès la formule de base, sans délai de carence",
          "Plafond RC le plus élevé du panel à 3 000 000 €",
          "Assistance juridique étendue avec prise en charge des frais de procédure",
          "Couverture des dommages immatériels non consécutifs",
        ],
        pointsFaibles: [
          "Tarif intermédiaire, ni le plus compétitif ni le plus cher",
          "Exclusion des sous-traitants établis hors UE",
          "Franchise de 750 €, légèrement au-dessus d'Axa",
        ],
      },
    ],
    garantiesCles: [
      { label: "RC Professionnelle", type: "guarantee", values: { axa: { status: "covered", keyInfo: "1 500 000 €" }, generali: { status: "covered", keyInfo: "2 000 000 €" }, allianz: { status: "covered", keyInfo: "3 000 000 €" } } },
      { label: "Protection cyber", type: "guarantee", values: { axa: { status: "not_covered", keyInfo: "Option" }, generali: { status: "covered", keyInfo: "Carence 30j" }, allianz: { status: "covered", keyInfo: "Incluse" } } },
      { label: "Protection juridique", type: "guarantee", values: { axa: { status: "not_covered" }, generali: { status: "covered" }, allianz: { status: "covered" } } },
      { label: "Sous-traitants", type: "exclusion", values: { axa: { status: "covered", keyInfo: "Tous" }, generali: { status: "covered", keyInfo: "UE uniquement" }, allianz: { status: "covered", keyInfo: "UE uniquement" } } },
      { label: "Couverture monde entier", type: "exclusion", values: { axa: { status: "not_covered" }, generali: { status: "covered" }, allianz: { status: "covered" } } },
      { label: "Perte d'exploitation", type: "guarantee", values: { axa: { status: "not_covered" }, generali: { status: "covered", keyInfo: "Premium" }, allianz: { status: "covered" } } },
    ],
  },
  "cot-2": {
    synthese: [
      {
        insurerId: "axa",
        pointsForts: [
          "Couverture dommages tous accidents incluse",
          "Assistance 0 km disponible",
          "Franchise compétitive à 500 €/sinistre",
        ],
        pointsFaibles: [
          "Tarif le plus élevé sur le tous risques",
          "Pas de garantie valeur à neuf au-delà de 12 mois",
        ],
      },
      {
        insurerId: "allianz",
        pointsForts: [
          "Meilleur tarif global sur le tiers étendu",
          "Bris de glace sans franchise",
          "Garantie conducteur étendue à 2 000 000 €",
        ],
        pointsFaibles: [
          "Franchise plus élevée à 750 €/sinistre",
          "Pas de couverture des accessoires hors série",
        ],
      },
      {
        insurerId: "generali",
        pointsForts: [
          "Prise en charge partielle de l'usure véhicule",
          "Garantie perte financière incluse en Premium",
        ],
        pointsFaibles: [
          "Dommages tous accidents non inclus en Standard",
          "Tarif le plus élevé sur la formule Premium",
          "Assistance uniquement à partir de 50 km",
        ],
      },
    ],
    contextPills: [
      { id: "cp-1", label: "44 véhicules", source: "extracted" },
      { id: "cp-2", label: "Usage professionnel", source: "extracted" },
      { id: "cp-3", label: "Sinistralité 3 ans : 12%", source: "extracted" },
      { id: "cp-4", label: "Bonus-malus moyen : 0.76", source: "manual" },
      { id: "cp-5", label: "Zone de circulation", source: "missing", hint: "Affine le calcul du risque routier" },
      { id: "cp-6", label: "Kilométrage annuel moyen", source: "missing", hint: "Influence le tarif et les options d'assurance" },
    ],
    hasFullContext: false,
    resumeExecutif: `L'analyse comparative des trois offres pour la flotte de 44 véhicules d'ACME Corp révèle des différences significatives en termes de couverture et de tarification. Allianz propose le meilleur rapport qualité-prix sur la formule Tiers étendu (3 300 €/an), tandis qu'Axa offre la couverture la plus complète en Tous risques malgré un tarif plus élevé.\n\nGenerali se positionne en milieu de gamme avec un avantage notable sur la prise en charge de l'usure véhicule dans sa formule Premium. Cependant, l'absence de couverture dommages tous accidents en formule Standard constitue une limitation importante pour une flotte professionnelle.\n\nRecommandation : pour une flotte de cette taille avec un taux de sinistralité de 12%, la formule Tous risques Axa ou Allianz est préconisée. Le choix final dépendra de l'arbitrage entre la franchise (500 € Axa vs 750 € Allianz) et le tarif annuel.`,
    conditionsFinancieres: {
      analysisBefore: "Les trois assureurs proposent chacun deux niveaux de formule. Les écarts de prime annuelle varient de 660 € entre la formule la moins chère (Allianz Tiers étendu à 3 300 €) et la plus chère (Generali Premium à 4 450 €). À noter que les franchises diffèrent sensiblement d'un assureur à l'autre.",
      analysisAfter: "En rapportant le coût au nombre de véhicules, Allianz offre le coût par véhicule le plus bas à 75 €/véhicule/an en Tiers étendu. Axa reste compétitif à 80,45 €/véhicule/an en Tiers étendu. Le surcoût du Tous risques se situe entre 15 et 18 €/véhicule/an selon l'assureur.",
    },
    analyseParOffre: [
      {
        insurerId: "axa",
        insurerName: "Axa",
        pointsForts: [
          "Couverture dommages tous accidents incluse dès la première formule",
          "Assistance 0 km disponible",
          "Franchise compétitive à 500 €/sinistre",
          "Réseau de garages partenaires le plus étendu (1 200 garages)",
          "Véhicule de remplacement sous 48h",
        ],
        pointsFaibles: [
          "Tarif le plus élevé sur la formule Tous risques (4 200 €/an)",
          "Pas de garantie valeur à neuf au-delà de 12 mois",
          "Plafond accessoires limité à 1 500 €",
        ],
      },
      {
        insurerId: "allianz",
        insurerName: "Allianz",
        pointsForts: [
          "Meilleur tarif global toutes formules confondues",
          "Bris de glace sans franchise",
          "Garantie conducteur étendue à 2 000 000 €",
          "Gestion sinistres en ligne 24/7",
        ],
        pointsFaibles: [
          "Franchise plus élevée à 750 €/sinistre",
          "Pas de couverture des accessoires hors série",
          "Délai véhicule de remplacement : 72h",
        ],
      },
      {
        insurerId: "generali",
        insurerName: "Generali",
        pointsForts: [
          "Prise en charge partielle de l'usure véhicule (unique sur le marché)",
          "Garantie perte financière incluse en formule Premium",
          "Franchise identique à Axa (500 €/sinistre)",
        ],
        pointsFaibles: [
          "Dommages tous accidents non inclus en formule Standard",
          "Tarif le plus élevé sur la formule Premium (4 450 €/an)",
          "Assistance uniquement à partir de 50 km du domicile",
          "Réseau de garages partenaires limité (400 garages)",
        ],
      },
    ],
    garantiesCles: [
      {
        label: "Responsabilité civile",
        values: {
          axa: { status: "covered" },
          allianz: { status: "covered" },
          generali: { status: "covered" },
        },
      },
      {
        label: "Dommages tous accidents",
        values: {
          axa: { status: "covered" },
          allianz: { status: "covered" },
          generali: { status: "not_covered", keyInfo: "Option en Standard" },
        },
      },
      {
        label: "Vol et tentative de vol",
        values: {
          axa: { status: "covered" },
          allianz: { status: "covered" },
          generali: { status: "covered" },
        },
      },
      {
        label: "Bris de glace",
        values: {
          axa: { status: "covered", keyInfo: "Franchise 150 €" },
          allianz: { status: "covered", keyInfo: "Sans franchise" },
          generali: { status: "covered", keyInfo: "Franchise 100 €" },
        },
      },
      {
        label: "Assistance 0 km",
        values: {
          axa: { status: "covered" },
          allianz: { status: "covered" },
          generali: { status: "not_covered", keyInfo: "À partir de 50 km" },
        },
      },
      {
        label: "Véhicule de remplacement",
        values: {
          axa: { status: "covered", keyInfo: "Sous 48h" },
          allianz: { status: "covered", keyInfo: "Sous 72h" },
          generali: { status: "covered", keyInfo: "Sous 48h" },
        },
      },
    ],
  },
  "cot-7": {
    synthese: [
      {
        insurerId: "alan",
        pointsForts: [
          "Prise en charge des médecines douces (4 séances/an)",
          "Meilleur forfait optique (200 €/an)",
          "Orthodontie couverte (600 €/an)",
          "App mobile avec téléconsultation incluse",
        ],
        pointsFaibles: [
          "Tarifs légèrement supérieurs à Malakoff sur les cadres",
          "Réseau de soins moins étendu",
        ],
      },
      {
        insurerId: "malakoff",
        pointsForts: [
          "Tarifs les plus compétitifs toutes catégories",
          "Honoraires chirurgicaux les mieux couverts (250% BR)",
          "Réseau de soins étendu (accords tiers payant)",
        ],
        pointsFaibles: [
          "Forfait optique le plus bas (150 €/an)",
          "Médecines douces limitées à l'ostéopathie (2 séances)",
          "Pas de forfait bien-être",
        ],
      },
      {
        insurerId: "generali",
        pointsForts: [
          "Chambre particulière bien couverte (70 €/jour)",
          "Bon niveau de couverture spécialistes (180% BR)",
        ],
        pointsFaibles: [
          "Tarifs les plus élevés",
          "Orthodontie non couverte",
          "Médecines douces exclues",
          "Forfait optique intermédiaire",
        ],
      },
    ],
    contextPills: [
      { id: "cp-1", label: "Convention Syntec — IDCC 1486", source: "extracted" },
      { id: "cp-2", label: "127 salariés (45 cadres, 82 non-cadres)", source: "extracted" },
      { id: "cp-3", label: "Âge moyen : 38 ans", source: "extracted" },
      { id: "cp-4", label: "Effectifs par régime", source: "missing", hint: "Nécessaire pour calculer le coût total annuel" },
    ],
    hasFullContext: false,
    resumeExecutif: `L'analyse comparative des trois offres de santé collective pour Dupont SA (Convention Syntec, 127 salariés) met en évidence des positionnements différenciés.\n\nMalakoff Humanis propose les tarifs les plus compétitifs avec un écart de 5 à 7% par rapport aux concurrents, tout en offrant la meilleure couverture en hospitalisation (150% BR frais de séjour, 250% BR honoraires chirurgicaux).\n\nAlan se distingue par son approche digitale et ses garanties bien-être (médecines douces, téléconsultation incluse, forfait optique le plus élevé), pour un surcoût modéré.\n\nGenerali présente les tarifs les plus élevés avec un niveau de couverture intermédiaire, notamment l'absence d'orthodontie et de médecines douces.\n\nRecommandation : renseigner les effectifs par régime pour obtenir le coût total annuel et finaliser la comparaison.`,
    conditionsFinancieres: {
      analysisBefore: "Les assureurs cotent en euros par personne et par mois, ventilés par collège (cadres/non-cadres) et régime (isolé/duo/famille). Les écarts de tarifs sont significatifs : Malakoff est systématiquement le moins cher (-5 à 7%), Alan se positionne en milieu de gamme, et Generali est le plus cher (+3 à 8% vs Malakoff).",
      analysisAfter: "Pour finaliser la comparaison financière, il est indispensable de renseigner la répartition des effectifs par régime (isolé/duo/famille) et par collège. Le coût total annuel dépend directement de cette ventilation. La part employeur (fixée à 50% par défaut) peut être ajustée selon la politique de l'entreprise.",
    },
    analyseParOffre: [
      { insurerId: "alan", insurerName: "Alan", pointsForts: ["Approche 100% digitale avec app mobile", "Médecines douces incluses (4 séances/an)", "Meilleur forfait optique (200 €/an)", "Téléconsultation 24/7 incluse"], pointsFaibles: ["Tarifs supérieurs à Malakoff", "Réseau de soins moins étendu"] },
      { insurerId: "malakoff", insurerName: "Malakoff Humanis", pointsForts: ["Tarifs les plus compétitifs", "Meilleure couverture hospitalisation", "Réseau tiers payant étendu"], pointsFaibles: ["Forfait optique le plus bas", "Médecines douces limitées", "Interface de gestion vieillissante"] },
      { insurerId: "generali", insurerName: "Generali", pointsForts: ["Bonne couverture chambre particulière", "Spécialistes à 180% BR"], pointsFaibles: ["Tarifs les plus élevés", "Pas d'orthodontie", "Pas de médecines douces"] },
    ],
    garantiesCles: [
      { label: "Chambre particulière", values: { alan: { status: "covered", keyInfo: "80 €/jour" }, malakoff: { status: "covered", keyInfo: "60 €/jour" }, generali: { status: "covered", keyInfo: "70 €/jour" } } },
      { label: "Honoraires chirurgicaux", values: { alan: { status: "covered", keyInfo: "200% BR" }, malakoff: { status: "covered", keyInfo: "250% BR" }, generali: { status: "covered", keyInfo: "200% BR" } } },
      { label: "Optique", values: { alan: { status: "covered", keyInfo: "200 €/an" }, malakoff: { status: "covered", keyInfo: "150 €/an" }, generali: { status: "covered", keyInfo: "180 €/an" } } },
      { label: "Orthodontie", values: { alan: { status: "covered", keyInfo: "600 €/an" }, malakoff: { status: "covered", keyInfo: "400 €/an" }, generali: { status: "not_covered" } } },
      { label: "Médecines douces", values: { alan: { status: "covered", keyInfo: "4 séances" }, malakoff: { status: "covered", keyInfo: "2 séances" }, generali: { status: "not_covered" } } },
    ],
  },
  "cot-6": {
    synthese: [
      {
        insurerId: "generali",
        pointsForts: [
          "Garanties décès complètes avec rente éducation incluse",
          "Doublement du capital en cas d'accident",
          "Indemnités journalières à 90% du salaire",
        ],
        pointsFaibles: [
          "Taux de cotisation intermédiaire (1,85%)",
          "Sports à risque exclus sans possibilité de rachat",
        ],
      },
      {
        insurerId: "axa",
        pointsForts: [
          "Taux de cotisation le plus compétitif (1,72%)",
          "Sports à risque couverts sans surcoût",
          "Rente éducation incluse",
        ],
        pointsFaibles: [
          "Pas de doublement accident",
          "Rente de conjoint limitée à 50% vs 60% chez les concurrents",
          "Indemnités journalières plafonnées à 85%",
        ],
      },
      {
        insurerId: "allianz",
        pointsForts: [
          "Capital décès le plus élevé (300% TA + 250% TB)",
          "Doublement du capital en cas d'accident",
          "Indemnités journalières à 90%",
        ],
        pointsFaibles: [
          "Taux de cotisation le plus élevé (1,90%)",
          "Pas de rente éducation en standard",
          "Rachat sports à risque avec surprime de 15%",
        ],
      },
    ],
    contextPills: [
      { id: "cp-1", label: "Convention Syntec — IDCC 1486", source: "extracted" },
      { id: "cp-2", label: "52 salariés (32 cadres, 20 non-cadres)", source: "extracted" },
      { id: "cp-3", label: "Âge moyen : 34 ans", source: "extracted" },
      { id: "cp-4", label: "Masse salariale cadres TA", source: "missing", hint: "Nécessaire pour calculer les cotisations en euros" },
      { id: "cp-5", label: "Masse salariale cadres TB", source: "missing", hint: "Nécessaire pour calculer les cotisations en euros" },
      { id: "cp-6", label: "Masse salariale non-cadres", source: "missing", hint: "Nécessaire pour calculer les cotisations en euros" },
    ],
    hasFullContext: false,
    resumeExecutif: `L'analyse comparative des trois offres de prévoyance / AT pour LegalPlace SAS (Convention Syntec) fait ressortir des positionnements différenciés.\n\nAxa propose le taux de cotisation le plus compétitif à 1,72% de la masse salariale, avec une couverture des sports à risque sans surcoût. Cependant, les niveaux de garanties décès et IJ sont légèrement inférieurs aux concurrents.\n\nAllianz offre les garanties décès les plus généreuses (300% TA + 250% TB) avec doublement accident, mais au taux le plus élevé (1,90%) et sans rente éducation en standard.\n\nGenerali se positionne en milieu de gamme (1,85%) avec un bon équilibre entre niveau de garanties et tarification.\n\nRecommandation : compléter la masse salariale par catégorie pour obtenir les montants de cotisation en euros et finaliser l'arbitrage.`,
    conditionsFinancieres: {
      analysisBefore: "Les assureurs cotent en pourcentage de la masse salariale, ce qui rend la comparaison directe en euros impossible sans les données de paie. Les taux s'échelonnent de 1,72% (Axa) à 1,90% (Allianz), soit un écart de 0,18 point. Sur une masse salariale hypothétique de 2,5 M€, cela représente un différentiel annuel de 4 500 €.",
      analysisAfter: "Pour finaliser la comparaison tarifaire, il est indispensable de renseigner la masse salariale ventilée par catégorie (cadres TA/TB, non-cadres TA/TB). Les taux diffèrent selon les tranches et une simulation globale est nécessaire.",
    },
    analyseParOffre: [
      {
        insurerId: "generali",
        insurerName: "Generali",
        pointsForts: [
          "Bon équilibre garanties / tarif",
          "Rente éducation et rente de conjoint incluses",
          "Doublement du capital en cas d'accident",
        ],
        pointsFaibles: [
          "Sports à risque exclus",
          "Taux intermédiaire (1,85%)",
        ],
      },
      {
        insurerId: "axa",
        insurerName: "Axa",
        pointsForts: [
          "Taux le plus compétitif (1,72%)",
          "Sports à risque couverts",
          "Rente éducation incluse",
        ],
        pointsFaibles: [
          "Capital décès inférieur (250% TA vs 300%)",
          "Pas de doublement accident",
          "Rente de conjoint à 50% seulement",
        ],
      },
      {
        insurerId: "allianz",
        insurerName: "Allianz",
        pointsForts: [
          "Capital décès le plus élevé (300% TA + 250% TB)",
          "Doublement accident inclus",
          "IJ à 90% du salaire",
        ],
        pointsFaibles: [
          "Taux le plus élevé (1,90%)",
          "Pas de rente éducation",
          "Rachat sports à risque avec surprime",
        ],
      },
    ],
    garantiesCles: [
      {
        label: "Capital décès",
        values: {
          generali: { status: "covered", keyInfo: "300% TA + 200% TB" },
          axa: { status: "covered", keyInfo: "250% TA + 200% TB" },
          allianz: { status: "covered", keyInfo: "300% TA + 250% TB" },
        },
      },
      {
        label: "Rente éducation",
        values: {
          generali: { status: "covered" },
          axa: { status: "covered" },
          allianz: { status: "not_covered", keyInfo: "Option" },
        },
      },
      {
        label: "Indemnités journalières",
        values: {
          generali: { status: "covered", keyInfo: "90%" },
          axa: { status: "covered", keyInfo: "85%" },
          allianz: { status: "covered", keyInfo: "90%" },
        },
      },
      {
        label: "Doublement accident",
        values: {
          generali: { status: "covered" },
          axa: { status: "not_covered" },
          allianz: { status: "covered" },
        },
      },
    ],
  },
};

export function getAnalysisData(cotationId: string): AnalysisData | undefined {
  return analysisDataMap[cotationId];
}

// ─── Section reprompt types & helpers ─────────────────────────────────

export type SectionId = "resume" | "financier" | "offre_analyse" | "garanties";
export type SectionState = "generated" | "edited" | "regenerating";

export type SectionMeta = {
  id: SectionId;
  defaultPrompt: string;
  state: SectionState;
  isEdited: boolean;
  previousContent?: Partial<AnalysisData>;
};

export const DEFAULT_SECTION_PROMPTS: Record<SectionId, string> = {
  resume: "Resume executif comparatif factuel, avec recommandation finale",
  financier: "Analyse des conditions financieres, ecarts de prime, cout par vehicule",
  offre_analyse: "Points forts et points faibles par assureur, factuel et synthetique",
  garanties: "Tableau des garanties cles avec statut couvert/non couvert par assureur",
};

// Alternate content variants used when regenerating sections.
// Each variant is keyed by instruction keywords to simulate contextual generation.

const resumeVariants: Record<string, string> = {
  court: "En synthese, l'offre AXA presente le meilleur rapport qualite-prix avec une prime annuelle competitive et une couverture etendue. L'offre Allianz reste solide mais legerement plus chere. Recommandation : privilegier AXA pour le renouvellement.",
  detaille: "L'analyse comparative des deux offres recues met en evidence des ecarts significatifs tant sur le plan tarifaire que sur la qualite des garanties proposees.\n\nSur le volet financier, AXA propose une prime annuelle de 810,52 EUR, soit un ecart de -12% par rapport a Allianz (921,30 EUR). Cet ecart s'explique principalement par une franchise plus elevee chez AXA (500 EUR vs 350 EUR) et l'absence de la garantie assistance juridique en standard.\n\nEn termes de couverture, les deux assureurs offrent un socle comparable sur les garanties principales (RC, dommages, vol). Neanmoins, AXA se distingue par l'inclusion de l'assistance 0 km et d'une couverture dommages tous accidents sans surcoute.\n\nCompte tenu du profil de flotte du client (vehicules recents, sinistralite maitrisee), la recommandation s'oriente vers l'offre AXA, sous reserve de negocier l'ajout de la garantie assistance juridique.",
  recommandation: "Apres analyse approfondie, nous recommandons l'offre AXA pour les raisons suivantes :\n\n1. Tarification la plus competitive (-12% vs Allianz)\n2. Couverture dommages tous accidents incluse sans surcoute\n3. Assistance 0 km integree, adaptee au profil urbain de la flotte\n4. Franchise raisonnable a 500 EUR/sinistre\n\nPoints de vigilance : negocier l'inclusion de l'assistance juridique et verifier les conditions de resiliation anticipee.",
  default: "L'etude comparative des offres AXA et Allianz revele des positionnements differencies. AXA se positionne comme l'option la plus economique avec une couverture dommages elargie, tandis qu'Allianz offre des franchises plus basses et une assistance juridique en standard.\n\nLe profil du client, caracterise par une flotte de vehicules recents et une sinistralite maitrisee, favorise l'offre AXA dont le tarif reflete mieux ce niveau de risque. L'ecart de prime de 110 EUR/an constitue une economie notable a l'echelle de la flotte.\n\nRecommandation : retenir l'offre AXA comme base de negociation, en demandant l'alignement sur l'assistance juridique d'Allianz.",
};

const financierBeforeVariants: Record<string, string> = {
  cout: "L'analyse des couts par vehicule met en evidence un ecart moyen de 55 EUR/an en faveur d'AXA. Sur une flotte de 12 vehicules, cela represente une economie annuelle de 660 EUR. Le cout mensuel par vehicule s'etablit a 67,54 EUR chez AXA contre 76,78 EUR chez Allianz.",
  ecart: "Les ecarts de prime entre les deux offres s'analysent comme suit : la prime annuelle globale AXA (810,52 EUR) est inferieure de 12% a celle d'Allianz (921,30 EUR). Cette difference provient principalement de la politique de franchises (AXA : 500 EUR, Allianz : 350 EUR) et du perimetre de garanties incluses en standard.",
  default: "L'analyse financiere fait ressortir un positionnement tarifaire favorable a AXA, avec une prime annuelle de 810,52 EUR contre 921,30 EUR pour Allianz, soit un ecart de 110,78 EUR (-12%). Les deux offres proposent des facilites de paiement mensuelles sans frais supplementaires.",
};

const financierAfterVariants: Record<string, string> = {
  cout: "En projection sur 3 ans et en tenant compte de l'evolution probable des primes (+3%/an en moyenne), l'ecart cumule en faveur d'AXA atteindrait environ 2 040 EUR. Ce differentiel justifie la recommandation, sous reserve de la stabilite des conditions a terme.",
  ecart: "A noter que l'ecart de franchise (150 EUR en faveur d'Allianz) ne compense l'ecart de prime qu'a partir du 1er sinistre. Pour un client avec une sinistralite inferieure a 1 sinistre/an, l'offre AXA reste plus avantageuse financierement.",
  default: "Le rapport cout/couverture penche en faveur d'AXA pour les profils a faible sinistralite, tandis qu'Allianz peut s'averer plus economique pour les flottes a sinistralite elevee grace a ses franchises plus basses.",
};

function matchVariant<T>(instruction: string, variants: Record<string, T>): T {
  const lower = instruction.toLowerCase();
  for (const [key, value] of Object.entries(variants)) {
    if (key !== "default" && lower.includes(key)) return value;
  }
  return variants.default;
}

export function mockRegenerateSection(
  sectionId: SectionId,
  instruction: string,
  currentData: AnalysisData,
): Promise<Partial<AnalysisData>> {
  const delay = 1500 + Math.random() * 1000;
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (sectionId) {
        case "resume":
          resolve({ resumeExecutif: matchVariant(instruction, resumeVariants) });
          break;
        case "financier":
          resolve({
            conditionsFinancieres: {
              analysisBefore: matchVariant(instruction, financierBeforeVariants),
              analysisAfter: matchVariant(instruction, financierAfterVariants),
            },
          });
          break;
        case "offre_analyse":
          // Generate varied strengths/weaknesses based on instruction
          resolve({
            analyseParOffre: currentData.analyseParOffre.map((item) => {
              const lower = instruction.toLowerCase();
              if (lower.includes("risque") || lower.includes("faible")) {
                return {
                  ...item,
                  pointsForts: [
                    "Couverture des risques principaux conforme aux attentes",
                    "Niveau de franchise adapte au profil de sinistralite",
                    "Conditions de resiliation flexibles",
                  ],
                  pointsFaibles: [
                    "Risques speciaux (cyber, environnement) non couverts",
                    "Plafond de garantie inferieur aux standards du marche",
                    "Delai de carence de 30 jours sur certaines garanties",
                  ],
                };
              }
              return {
                ...item,
                pointsForts: [
                  "Tarification competitive sur le segment flotte PME",
                  "Garanties etendues incluant l'assistance et la protection juridique",
                  "Processus de declaration de sinistre digitalise",
                ],
                pointsFaibles: [
                  "Franchise elevee sur les dommages materiels",
                  "Exclusion des vehicules de plus de 10 ans",
                  "Pas de garantie valeur a neuf au-dela de 24 mois",
                ],
              };
            }),
          });
          break;
        case "garanties":
          resolve({ garantiesCles: currentData.garantiesCles });
          break;
      }
    }, delay);
  });
}

// ─── Client profile data ─────────────────────────────────────────────

export type BesoinItem = {
  id: string;
  value: string;
  source: "ai" | "manual";
};

export type ClientProfileData = {
  clientLabel: string;
  clientSiren: string;
  besoinsClient: BesoinItem[];
};

const clientProfileMap: Record<string, ClientProfileData> = {
  "cot-1": {
    clientLabel: "Marble Tech SAS",
    clientSiren: "00007U26464",
    besoinsClient: [
      { id: "b-1", value: "Couverture RC Pro étendue aux sous-traitants", source: "ai" },
      { id: "b-2", value: "Protection cyber incluse", source: "ai" },
      { id: "b-7", value: "Franchise max 1 000€ par sinistre", source: "manual" },
      { id: "b-8", value: "Besoin d'une couverture monde entier (missions clients a l'international)", source: "manual" },
    ],
  },
  "cot-6": {
    clientLabel: "LegalPlace SAS",
    clientSiren: "82012457800019",
    besoinsClient: [
      { id: "b-10", value: "Garanties décès et invalidité conformes à la CCN Syntec", source: "ai" },
      { id: "b-11", value: "Maintien de salaire à 90% minimum en cas d'arrêt", source: "ai" },
      { id: "b-12", value: "Portabilité des droits pour les salariés sortants", source: "manual" },
    ],
  },
  "cot-2": {
    clientLabel: "ACME Corp SAS",
    clientSiren: "84392017300024",
    besoinsClient: [
      { id: "b-3", value: "Couverture tous risques sur l'ensemble du parc", source: "ai" },
      { id: "b-4", value: "Franchise plafonnée à 500 €/sinistre maximum", source: "ai" },
      { id: "b-5", value: "Assistance 0 km obligatoire (véhicules utilitaires inclus)", source: "ai" },
      { id: "b-6", value: "Véhicule de remplacement sous 48h en cas d'immobilisation", source: "manual" },
    ],
  },
  "cot-7": {
    clientLabel: "Dupont SA",
    clientSiren: "91234567800012",
    besoinsClient: [
      { id: "b-13", value: "Couverture santé conforme aux minimums CCN Syntec", source: "ai" },
      { id: "b-14", value: "Prise en charge optique et dentaire renforcée", source: "ai" },
      { id: "b-15", value: "Part employeur à 60% minimum", source: "manual" },
    ],
  },
};

export function getClientProfile(cotationId: string): ClientProfileData | undefined {
  return clientProfileMap[cotationId];
}

export function updateClientProfile(cotationId: string, data: ClientProfileData): void {
  clientProfileMap[cotationId] = data;
}

export function buildContextPills(
  profile: ClientProfileData,
  basePills: ContextPill[],
): { pills: ContextPill[]; hasFullContext: boolean } {
  // besoinsClient is the source of truth — it now contains extracted items too.
  // Start fresh: build pills from besoinsClient, then append missing base pills
  // that haven't been addressed yet.
  const pills: ContextPill[] = [];
  const usedLabels = new Set<string>();

  // 1. Add all besoins as pills, preserving their source (ai or manual)
  profile.besoinsClient.filter((b) => b.value.trim()).forEach((besoin, idx) => {
    const key = besoin.value.toLowerCase();
    if (!usedLabels.has(key)) {
      pills.push({ id: `besoin-${idx}`, label: besoin.value, source: besoin.source });
      usedLabels.add(key);
    }
  });

  // 2. Keep "missing" base pills that haven't been filled by a besoin
  const hasBesoins = pills.length > 0;
  for (const pill of basePills) {
    if (pill.source === "missing") {
      const lbl = pill.label.toLowerCase();
      // Promote besoin-related missing pills if user has provided besoins
      if (lbl.includes("besoin") && hasBesoins) continue;
      if (!usedLabels.has(lbl)) {
        pills.push(pill);
        usedLabels.add(lbl);
      }
    }
  }

  const hasFullContext = pills.every((p) => p.source !== "missing");
  return { pills, hasFullContext };
}

// ─── Comparison task list ────────────────────────────────────────────
// Persisted comparison agent tasks shown on the /quoting/comparison list page.

export const PRODUCT_PRIORITY: Record<string, number> = {
  "RC Pro": 1,
  "RC Exploitation": 2,
  "Décennale": 3,
  "D&O": 4,
  "Apres livraison": 5,
  "Protection juridique": 6,
};

export type ComparisonTaskStatus = "in_progress" | "done";

export type ComparisonTask = {
  id: string;
  cotationId: string;
  client: string;
  products: string[];
  principalProduct: string | null;
  insurerIds: string[];
  createdBy: string;
  date: string;
  status: ComparisonTaskStatus;
};

export const comparisonTasks: ComparisonTask[] = [
  {
    id: "cmp-1",
    cotationId: "cot-1",
    client: "Marble Tech SAS",
    products: ["RC Pro"],
    principalProduct: "RC Pro",
    insurerIds: ["axa", "generali", "allianz"],
    createdBy: "Delphine",
    date: "10/03/2026",
    status: "done",
  },
  {
    id: "cmp-2",
    cotationId: "cot-2",
    client: "Acme Corp",
    products: ["Flotte automobile"],
    principalProduct: "Flotte automobile",
    insurerIds: ["axa", "allianz", "generali"],
    createdBy: "Delphine",
    date: "07/03/2026",
    status: "done",
  },
  {
    id: "cmp-3",
    cotationId: "cot-5",
    client: "Digital Solutions SARL",
    products: ["RC Pro"],
    principalProduct: "RC Pro",
    insurerIds: ["axa", "allianz"],
    createdBy: "Delphine",
    date: "04/03/2026",
    status: "done",
  },
  {
    id: "cmp-4",
    cotationId: "cot-3",
    client: "TechVision SAS",
    products: ["RC Pro"],
    principalProduct: "RC Pro",
    insurerIds: ["axa", "chubb"],
    createdBy: "Delphine",
    date: "10/03/2026",
    status: "done",
  },
  {
    id: "cmp-5",
    cotationId: "cot-4",
    client: "GreenWay Industries",
    products: ["Multirisque bureaux"],
    principalProduct: "Multirisque bureaux",
    insurerIds: ["axa", "maif", "generali"],
    createdBy: "Delphine",
    date: "10/03/2026",
    status: "done",
  },
  {
    id: "cmp-6",
    cotationId: "cot-6",
    client: "LegalPlace SAS",
    products: ["Prévoyance / AT"],
    principalProduct: "Prévoyance / AT",
    insurerIds: ["generali", "axa", "allianz"],
    createdBy: "Delphine",
    date: "12/04/2026",
    status: "done",
  },
  {
    id: "cmp-7",
    cotationId: "cot-7",
    client: "Dupont SA",
    products: ["Santé collective"],
    principalProduct: "Santé collective",
    insurerIds: ["alan", "malakoff", "generali"],
    createdBy: "Delphine",
    date: "14/04/2026",
    status: "done",
  },
];

export const emailInboxMock = [
  {
    id: "1",
    from: "Marie Dupont",
    fromEmail: "contact@marble-tech.com",
    subject: "Cotation Panora RC Pro - Marble Tech SAS",
    preview: "Suite à notre échange téléphonique, je vous transmets les documents...",
    date: "14:32",
    unread: true,
    hasAttachments: true,
    starred: false,
  },
  {
    id: "2",
    from: "Jean Martin",
    fromEmail: "j.martin@acme-corp.fr",
    subject: "Renouvellement flotte automobile 2026",
    preview: "Bonjour, nous souhaitons revoir notre contrat flotte...",
    date: "11:15",
    unread: true,
    hasAttachments: true,
    starred: true,
  },
  {
    id: "3",
    from: "Sophie Laurent",
    fromEmail: "s.laurent@techvision.io",
    subject: "RE: Devis RC Pro urgence",
    preview: "Merci pour votre retour rapide. Voici les documents complémentaires...",
    date: "Hier",
    unread: false,
    hasAttachments: false,
    starred: false,
  },
  {
    id: "4",
    from: "Pierre Dubois",
    fromEmail: "pdubois@greenway.fr",
    subject: "Demande de cotation multirisque bureaux",
    preview: "Nous cherchons une couverture pour nos nouveaux locaux...",
    date: "Hier",
    unread: false,
    hasAttachments: true,
    starred: false,
  },
  {
    id: "5",
    from: "Panora Support",
    fromEmail: "support@panora.co",
    subject: "Bienvenue sur Panora - Configuration de vos extranets",
    preview: "Votre compte a été créé avec succès. Configurez vos accès...",
    date: "07/03",
    unread: false,
    hasAttachments: false,
    starred: false,
  },
];
