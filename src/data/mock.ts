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

export const insurers = [
  {
    id: "axa",
    name: "Axa",
    logo: "🔴",
    logoColor: "#FF1721",
    hasCode: true,
    status: "completed" as const,
    reference: "4RGWBWMKEB",
    documents: [
      "Conditions_generales_Marble_Gr_core_assur_long_name.pdf",
      "Tarifs_Axa_RC_Pro_2026.pdf",
      "Attestation_RC_Pro_Marble_Tech.pdf",
    ],
    pricing: [
      { formula: "Essentielle", version: "8,01 €", annual: "810,32 €/an" },
      { formula: "Equilibre", version: "12,50 €", annual: "1 250,00 €/an" },
      { formula: "Étendue", version: "18,75 €", annual: "1 875,00 €/an" },
    ],
    quoteInfo: {
      quoteId: "47500AAARBE",
      vehicule: "TESLA MODEL 3 ANS",
      usage: "Privé + Domicile travail",
      objet: "AAA 05165043G",
      dateEffet: "01/03/2026",
      fractionnement: "CF-13b...7",
      conducteur: "Régulatoire",
      garantie: "CS Assure protections",
      vadcp: "VADCP (3 ans)",
    },
    actions: [
      { date: "28/05/25 - 18h32", title: "Saisie des informations véhicule...", description: "En cours, remplissage des champs sur l'extranet", status: "success" as const },
      { date: "28/05/25 - 18h30", title: "Action agent", description: "Référence: AXA-FR-90124", status: "success" as const },
      { date: "28/05/25 - 18h28", title: "Connexion à l'extranet", description: "Authentification réussie", status: "success" as const },
      { date: "28/05/25 - 18h25", title: "Début", description: "Lancement de la cotation sur Axa", status: "success" as const },
    ],
  },
  {
    id: "allianz",
    name: "Allianz",
    logo: "🔵",
    logoColor: "#003781",
    hasCode: true,
    status: "action_required" as const,
    reference: "ALZ-2026-8841",
    alertMessage: "Sélection des options requise sur l'extranet",
    alertDescription: "Allianz propose 4 niveaux de franchise. L'agent ne sait pas encore lequel choisir et a mis en pause. Sélectionnez le niveau de franchise sur l'extranet pour que l'agent puisse continuer.",
    actions: [
      { date: "28/05/25 - 18h32", title: "Saisie des informations véhicule...", description: "En cours, remplissage des champs sur l'extranet", status: "success" as const },
      { date: "28/05/25 - 18h30", title: "Action agent", description: "Référence: SEI-FR-90124", status: "success" as const },
      { date: "28/05/25 - 18h31", title: "Impossible de récupérer les documents", description: "Action courtier requise", status: "error" as const },
    ],
  },
  {
    id: "generali",
    name: "Generali",
    logo: "🦁",
    logoColor: "#C8102E",
    hasCode: true,
    status: "in_progress" as const,
    reference: "GEN-2026-5523",
    actions: [
      { date: "28/05/25 - 18h35", title: "Saisie des informations...", description: "En cours, remplissage des champs sur l'extranet", status: "success" as const },
      { date: "28/05/25 - 18h33", title: "Connexion à l'extranet", description: "Authentification réussie", status: "success" as const },
      { date: "28/05/25 - 18h30", title: "Début", description: "Lancement de la cotation sur Generali", status: "success" as const },
    ],
  },
  {
    id: "chubb",
    name: "Chubb",
    logo: "⬛",
    logoColor: "#000000",
    hasCode: true,
    status: "error" as const,
    reference: "CHB-2026-1190",
    errorMessage: "L'agent a rencontré une erreur",
    errorDescription: "Le serveur a été inaccessible en raison d'une maintenance programmée. Nous sommes désolés pour cet inconvénient.",
    errorInfo: "Dernière tentative le : 09/03/26 à 14:04 - 3/3 tentatives",
    actions: [
      { date: "28/05/25 - 18h30", title: "Début", description: "Lancement de la cotation sur Chubb", status: "success" as const },
      { date: "28/05/25 - 18h31", title: "Erreur de connexion", description: "Serveur inaccessible", status: "error" as const },
      { date: "28/05/25 - 18h35", title: "Nouvelle tentative", description: "Tentative 2/3", status: "success" as const },
      { date: "28/05/25 - 18h36", title: "Erreur de connexion", description: "Serveur inaccessible", status: "error" as const },
      { date: "28/05/25 - 18h40", title: "Nouvelle tentative", description: "Tentative 3/3", status: "success" as const },
      { date: "28/05/25 - 18h41", title: "Erreur de connexion", description: "Serveur inaccessible - Abandon", status: "error" as const },
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
