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
      { id: "axa", name: "Axa", status: "in_progress", reference: "AXA-MR-0091" },
      { id: "maif", name: "MAIF", status: "completed", reference: "MAIF-MR-4402", bestPrice: "1 850,00 €/an" },
      { id: "generali", name: "Generali", status: "in_progress", reference: "GEN-MR-2201" },
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
