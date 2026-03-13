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
  pricing?: Array<{ formula: string; monthly: string; annual: string }>;
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
      { formula: "Essentielle", monthly: "87,71 €", annual: "810,52 €/an" },
      { formula: "Équilibre", monthly: "112,50 €", annual: "1 040,00 €/an" },
      { formula: "Étendue", monthly: "145,83 €", annual: "1 350,00 €/an" },
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
      { formula: "Standard", monthly: "95,00 €", annual: "1 140,00 €/an" },
      { formula: "Premium", monthly: "135,00 €", annual: "1 620,00 €/an" },
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
      { formula: "Confort", monthly: "102,00 €", annual: "1 224,00 €/an" },
      { formula: "Confort+", monthly: "128,50 €", annual: "1 542,00 €/an" },
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
          { formula: "Tiers étendu", monthly: "295,00 €", annual: "3 540,00 €/an" },
          { formula: "Tous risques", monthly: "350,00 €", annual: "4 200,00 €/an" },
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
          { formula: "Tiers étendu", monthly: "275,00 €", annual: "3 300,00 €/an" },
          { formula: "Tous risques", monthly: "331,67 €", annual: "3 980,00 €/an" },
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
          { formula: "Standard", monthly: "320,00 €", annual: "3 840,00 €/an" },
          { formula: "Premium", monthly: "370,83 €", annual: "4 450,00 €/an" },
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
          { formula: "Essentielle", monthly: "68,33 €", annual: "820,00 €/an" },
          { formula: "Étendue", monthly: "98,33 €", annual: "1 180,00 €/an" },
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
          { formula: "Standard", monthly: "85,00 €", annual: "1 020,00 €/an" },
          { formula: "Premium", monthly: "120,83 €", annual: "1 450,00 €/an" },
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
          { formula: "Essentielle", monthly: "142,50 €", annual: "1 710,00 €/an" },
          { formula: "Confort", monthly: "178,33 €", annual: "2 140,00 €/an" },
          { formula: "Étendue", monthly: "215,00 €", annual: "2 580,00 €/an" },
        ],
        allSteps: [
          { date: "13/03/26 - 09h15", title: "Connexion extranet AXA", description: "Authentification en cours", status: "success" },
          { date: "13/03/26 - 09h15", title: "Identifiants acceptés", description: "Credentials validés par le portail", status: "success" },
          { date: "13/03/26 - 09h16", title: "Double authentification requise", description: "Code envoyé par e-mail à d••••e@howden.fr", status: "in_progress" },
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
          { formula: "Confort", monthly: "154,17 €", annual: "1 850,00 €/an" },
          { formula: "Sérénité", monthly: "195,00 €", annual: "2 340,00 €/an" },
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
          { formula: "Standard", monthly: "165,00 €", annual: "1 980,00 €/an" },
          { formula: "Premium", monthly: "208,33 €", annual: "2 500,00 €/an" },
        ],
        allSteps: [
          { date: "13/03/26 - 09h12", title: "Connexion extranet Generali", description: "Authentification en cours", status: "success" },
          { date: "13/03/26 - 09h12", title: "Identifiants acceptés", description: "Credentials validés par le portail", status: "success" },
          { date: "13/03/26 - 09h13", title: "Double authentification requise", description: "Code SMS envoyé au 06 •• •• 42", status: "in_progress" },
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
          { formula: "Essentielle", monthly: "76,67 €", annual: "920,00 €/an" },
          { formula: "Étendue", monthly: "110,00 €", annual: "1 320,00 €/an" },
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
          { formula: "Standard", monthly: "72,92 €", annual: "875,00 €/an" },
          { formula: "Premium", monthly: "105,00 €", annual: "1 260,00 €/an" },
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
