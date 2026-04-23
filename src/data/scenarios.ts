// Scenario data: insurer × product × required fields mapping

export type FieldType = "text" | "date" | "number" | "email" | "phone" | "currency" | "percentage" | "boolean";

export type FieldStatus = "ok" | "missing" | "invalid";

export type ExtractedField = {
  key: string;
  label: string;
  value: string;
  type: FieldType;
  status?: FieldStatus;
  error?: string;
  placeholder?: string;
};

export type ExtractedSection = {
  key: string;
  label: string;
  status: "complete" | "incomplete" | "invalid";
  missingCount?: number;
  invalidCount?: number;
  fields: ExtractedField[];
};

export type EmailMessage = {
  id: string;
  from: string;
  fromName: string;
  fromEmail: string;
  to: string;
  date: string;
  subject: string;
  body: string;
  attachments: Array<{
    name: string;
    size: string;
    fieldsExtracted: number;
  }>;
};

export type ScenarioInsurer = {
  id: string;
  name: string;
  logo: string;
  hasCode: boolean;
};

export type Scenario = {
  id: string;
  label: string;
  description: string;
  product: string;
  productIcon: "car" | "shield";
  client: string;
  clientSiren: string;
  cotationId: string;
  emailThread: EmailMessage[];
  extractedSections: ExtractedSection[];
  availableInsurers: ScenarioInsurer[];
  defaultSelectedInsurers: string[];
  defaultProjectName: string;
};

// ─── Flotte Auto ───────────────────────────────────────────────────────

const flotteAutoEmailThread: EmailMessage[] = [
  {
    id: "fa-1",
    from: "Jean Martin",
    fromName: "Jean Martin",
    fromEmail: "j.martin@acme-corp.fr",
    to: "cotation+a7f3b2@panora.co",
    date: "09/03/2026 à 11:15",
    subject: "Renouvellement flotte automobile 2026 - ACME Corp",
    body: `Bonjour,

Nous souhaitons revoir notre contrat flotte automobile pour le renouvellement 2026.

Notre parc se compose de :
- 28 véhicules de tourisme (VP)
- 12 véhicules utilitaires légers (VUL)
- 4 poids lourds (PL)
Total : 44 véhicules

Kilométrage moyen annuel : 25 000 km/an par véhicule
Usage : déplacements professionnels et tournées commerciales

Sinistralité sur les 3 dernières années :
- 2023 : 6 sinistres, coût total 18 400 €
- 2024 : 4 sinistres, coût total 12 100 €
- 2025 : 8 sinistres, coût total 31 200 €
Ratio S/P moyen : 62 %

Le contrat actuel chez Axa arrive à échéance le 15/06/2026, prime annuelle de 48 500 €.

Vous trouverez en pièces jointes le relevé d'information flotte, les cartes grises et l'attestation de sinistralité.

Cordialement,
Jean Martin
Directeur Logistique
ACME Corp SAS
SIREN: 523 847 196`,
    attachments: [
      { name: "Releve_Info_Flotte_ACME.pdf", size: "1.8 Mo", fieldsExtracted: 8 },
      { name: "Cartes_Grises_Parc_2026.pdf", size: "3.4 Mo", fieldsExtracted: 5 },
      { name: "Attestation_Sinistralite_3ans.pdf", size: "520 Ko", fieldsExtracted: 6 },
    ],
  },
  {
    id: "fa-2",
    from: "Jean Martin",
    fromName: "Jean Martin",
    fromEmail: "j.martin@acme-corp.fr",
    to: "cotation+a7f3b2@panora.co",
    date: "09/03/2026 à 14:02",
    subject: "RE: Renouvellement flotte automobile 2026 - ACME Corp",
    body: `Re-bonjour,

J'ai oublié de préciser quelques éléments importants :

- Nous avons 3 conducteurs novices (permis < 2 ans)
- 2 véhicules électriques (Tesla Model 3) dans le parc VP
- Stationnement : 80% garage fermé, 20% parking extérieur
- Zone de circulation principale : Île-de-France + Nord

Aussi, nous souhaitons une option assistance 0 km si possible.

Merci,
Jean Martin`,
    attachments: [
      { name: "Liste_Conducteurs_2026.xlsx", size: "145 Ko", fieldsExtracted: 3 },
    ],
  },
];

const flotteAutoExtractedSections: ExtractedSection[] = [
  {
    key: "entreprise",
    label: "Entreprise",
    status: "complete",
    fields: [
      { key: "raison_sociale", label: "Raison sociale", value: "ACME Corp SAS", type: "text", status: "ok" },
      { key: "siren", label: "SIREN", value: "523 847 196", type: "text", status: "ok" },
      { key: "activite", label: "Activité", value: "Transport et logistique", type: "text", status: "ok" },
      { key: "ca", label: "Chiffre d'affaires", value: "12 500 000 €", type: "currency", status: "ok" },
      { key: "effectif", label: "Effectif", value: "87 collaborateurs", type: "text", status: "ok" },
      { key: "adresse", label: "Adresse siège", value: "45 rue de la Logistique, 93200 Saint-Denis", type: "text", status: "ok" },
    ],
  },
  {
    key: "parc_vehicules",
    label: "Parc véhicules",
    status: "incomplete",
    missingCount: 2,
    fields: [
      { key: "nb_vehicules", label: "Nb total véhicules", value: "44", type: "number", status: "ok" },
      { key: "nb_vp", label: "Véhicules tourisme (VP)", value: "28", type: "number", status: "ok" },
      { key: "nb_vul", label: "Utilitaires légers (VUL)", value: "12", type: "number", status: "ok" },
      { key: "nb_pl", label: "Poids lourds (PL)", value: "4", type: "number", status: "ok" },
      { key: "nb_electriques", label: "Véhicules électriques", value: "2", type: "number", status: "ok" },
      { key: "usage", label: "Usage principal", value: "Professionnel", type: "text", status: "ok" },
      { key: "km_moyen", label: "Km moyen annuel", value: "25 000 km", type: "text", status: "ok" },
      { key: "stationnement", label: "Mode stationnement", value: "", type: "text", status: "missing", placeholder: "À compléter..." },
      { key: "zone_circulation", label: "Zone de circulation", value: "Île-de-France + Nord", type: "text", status: "ok" },
      { key: "ptac_max", label: "PTAC max (PL)", value: "", type: "text", status: "missing", placeholder: "Ex: 19 tonnes" },
    ],
  },
  {
    key: "sinistralite",
    label: "Sinistralité (3 ans)",
    status: "invalid",
    invalidCount: 1,
    fields: [
      { key: "nb_sinistres_2023", label: "Sinistres 2023", value: "6", type: "number", status: "ok" },
      { key: "cout_2023", label: "Coût 2023", value: "18 400 €", type: "currency", status: "ok" },
      { key: "nb_sinistres_2024", label: "Sinistres 2024", value: "4", type: "number", status: "ok" },
      { key: "cout_2024", label: "Coût 2024", value: "12 100 €", type: "currency", status: "ok" },
      { key: "nb_sinistres_2025", label: "Sinistres 2025", value: "8", type: "number", status: "ok" },
      { key: "cout_2025", label: "Coût 2025", value: "31 200 €", type: "currency", status: "ok" },
      { key: "ratio_sp", label: "Ratio S/P moyen", value: "62 %", type: "percentage", status: "ok" },
      { key: "nb_conducteurs_novices", label: "Conducteurs novices", value: "3", type: "number", status: "ok" },
      { key: "dernier_sinistre", label: "Date dernier sinistre", value: "45/12/2025", type: "date", status: "invalid", error: "Date invalide" },
    ],
  },
  {
    key: "conducteurs",
    label: "Conducteurs principaux",
    status: "complete",
    fields: [
      { key: "nb_conducteurs", label: "Nb conducteurs déclarés", value: "52", type: "number", status: "ok" },
      { key: "age_moyen", label: "Âge moyen", value: "38 ans", type: "text", status: "ok" },
      { key: "bonus_malus_moyen", label: "Bonus/Malus moyen", value: "0.72", type: "text", status: "ok" },
      { key: "permis_moins_2ans", label: "Permis < 2 ans", value: "3", type: "number", status: "ok" },
    ],
  },
  {
    key: "contrat_actuel",
    label: "Contrat actuel",
    status: "complete",
    fields: [
      { key: "assureur_actuel", label: "Assureur actuel", value: "Axa", type: "text", status: "ok" },
      { key: "numero_contrat", label: "N° de contrat", value: "AXA-FLT-2024-8821", type: "text", status: "ok" },
      { key: "echeance", label: "Échéance", value: "15/06/2026", type: "date", status: "ok" },
      { key: "prime_annuelle", label: "Prime annuelle", value: "48 500 €", type: "currency", status: "ok" },
      { key: "franchise_actuelle", label: "Franchise actuelle", value: "500 € / sinistre", type: "text", status: "ok" },
    ],
  },
  {
    key: "garanties",
    label: "Garanties souhaitées",
    status: "incomplete",
    missingCount: 1,
    fields: [
      { key: "rc", label: "RC obligatoire", value: "Oui", type: "text", status: "ok" },
      { key: "dommages_tous_accidents", label: "Dommages tous accidents", value: "Oui (VP et VUL)", type: "text", status: "ok" },
      { key: "vol_incendie", label: "Vol / Incendie", value: "Oui", type: "text", status: "ok" },
      { key: "bris_glace", label: "Bris de glace", value: "Oui", type: "text", status: "ok" },
      { key: "assistance", label: "Assistance", value: "0 km souhaitée", type: "text", status: "ok" },
      { key: "protection_juridique", label: "Protection juridique", value: "", type: "text", status: "missing", placeholder: "À compléter..." },
      { key: "vehicule_remplacement", label: "Véhicule de remplacement", value: "Oui, durée 15 jours", type: "text", status: "ok" },
    ],
  },
];

// ─── RC Pro ────────────────────────────────────────────────────────────

const rcProEmailThread: EmailMessage[] = [
  {
    id: "rcp-1",
    from: "Marie Dupont",
    fromName: "Marie Dupont",
    fromEmail: "contact@marble-tech.com",
    to: "cotation+a7f3b2@panora.co",
    date: "09/03/2026 à 14:32",
    subject: "Cotation RC Pro - Marble Tech SAS",
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
      { name: "Kbis_Marble_Tech.pdf", size: "245 Ko", fieldsExtracted: 4 },
      { name: "Bilan_2025_Marble_Tech.pdf", size: "1.2 Mo", fieldsExtracted: 3 },
      { name: "RIB_Marble_Tech.pdf", size: "89 Ko", fieldsExtracted: 1 },
    ],
  },
  {
    id: "rcp-2",
    from: "Marie Dupont",
    fromName: "Marie Dupont",
    fromEmail: "contact@marble-tech.com",
    to: "cotation+a7f3b2@panora.co",
    date: "09/03/2026 à 16:45",
    subject: "RE: Cotation RC Pro - Marble Tech SAS",
    body: `Re-bonjour,

Suite à votre demande, voici les informations complémentaires sur les dirigeants :

Dirigeant 1 — Thomas Meghan
- Né le 15/06/1982
- Nationalité : Française
- Fonction : Président / CEO
- Tél : 06 87 58 41 17

Dirigeant 2 — Fabian Langlet
- Né le 22/09/1985
- Nationalité : Française
- Fonction : Directeur Technique / CTO
- E-mail : f.langlet@marble-tech.com
- Tél : 06 12 34 56 78

Nous avons aussi un sous-traitant régulier basé en Inde (5 développeurs), je ne sais pas si cela impacte la cotation RC Pro.

Cordialement,
Marie Dupont`,
    attachments: [
      { name: "CV_Dirigeants_Marble_Tech.pdf", size: "340 Ko", fieldsExtracted: 6 },
      { name: "Organigramme_2026.pdf", size: "180 Ko", fieldsExtracted: 2 },
    ],
  },
];

const rcProExtractedSections: ExtractedSection[] = [
  {
    key: "entreprise",
    label: "Entreprise",
    status: "complete",
    fields: [
      { key: "raison_sociale", label: "Raison sociale", value: "Marble Tech SAS", type: "text", status: "ok" },
      { key: "siren", label: "SIREN", value: "00007U26464", type: "text", status: "ok" },
      { key: "forme_juridique", label: "Forme juridique", value: "SAS", type: "text", status: "ok" },
      { key: "activite", label: "Activité principale", value: "Développement logiciels SaaS B2B", type: "text", status: "ok" },
      { key: "code_naf", label: "Code NAF", value: "6201Z", type: "text", status: "ok" },
      { key: "ca", label: "Chiffre d'affaires", value: "3 200 000 €", type: "currency", status: "ok" },
      { key: "ca_export", label: "CA à l'export", value: "480 000 €", type: "currency", status: "ok" },
      { key: "effectif", label: "Effectif total", value: "45 collaborateurs", type: "number", status: "ok" },
      { key: "date_creation", label: "Date de création", value: "12/03/2018", type: "date", status: "ok" },
      { key: "adresse", label: "Adresse siège", value: "12 rue de l'Innovation, 75011 Paris", type: "text", status: "ok" },
    ],
  },
  {
    key: "dirigeant1",
    label: "Dirigeant 1 — Président",
    status: "incomplete",
    missingCount: 2,
    fields: [
      { key: "nom", label: "Nom", value: "Meghan", type: "text", status: "ok" },
      { key: "prenom", label: "Prénom", value: "Thomas", type: "text", status: "ok" },
      { key: "fonction", label: "Fonction", value: "Président / CEO", type: "text", status: "ok" },
      { key: "date_naissance", label: "Date de naissance", value: "15/06/1982", type: "date", status: "ok" },
      { key: "nationalite", label: "Nationalité", value: "Française", type: "text", status: "ok" },
      { key: "email", label: "E-mail", value: "", type: "email", status: "missing", placeholder: "email@entreprise.com" },
      { key: "telephone", label: "Téléphone", value: "06 87 58 41 17", type: "phone", status: "ok" },
      { key: "antecedents", label: "Antécédents judiciaires", value: "", type: "text", status: "missing", placeholder: "À compléter..." },
    ],
  },
  {
    key: "dirigeant2",
    label: "Dirigeant 2 — CTO",
    status: "invalid",
    invalidCount: 1,
    fields: [
      { key: "nom", label: "Nom", value: "Langlet", type: "text", status: "ok" },
      { key: "prenom", label: "Prénom", value: "Fabian", type: "text", status: "ok" },
      { key: "fonction", label: "Fonction", value: "Directeur Technique", type: "text", status: "ok" },
      { key: "date_naissance", label: "Date de naissance", value: "22/09/1985", type: "date", status: "ok" },
      { key: "nationalite", label: "Nationalité", value: "Française", type: "text", status: "ok" },
      { key: "email", label: "E-mail", value: "gcdjasjshk", type: "email", status: "invalid", error: "Format email invalide" },
      { key: "telephone", label: "Téléphone", value: "06 12 34 56 78", type: "phone", status: "ok" },
      { key: "antecedents", label: "Antécédents judiciaires", value: "Aucun", type: "text", status: "ok" },
    ],
  },
  {
    key: "activite_detail",
    label: "Détail activité & risques",
    status: "incomplete",
    missingCount: 2,
    fields: [
      { key: "description_activite", label: "Description détaillée", value: "Édition et hébergement de logiciels SaaS pour PME", type: "text", status: "ok" },
      { key: "nb_clients", label: "Nombre de clients actifs", value: "320", type: "number", status: "ok" },
      { key: "sous_traitance", label: "Sous-traitance", value: "Oui — Inde, 5 développeurs", type: "text", status: "ok" },
      { key: "donnees_personnelles", label: "Traitement données perso.", value: "Oui", type: "text", status: "ok" },
      { key: "certifications", label: "Certifications", value: "", type: "text", status: "missing", placeholder: "À compléter..." },
      { key: "hebergement", label: "Hébergement données", value: "AWS — eu-west-3 (Paris)", type: "text", status: "ok" },
      { key: "sinistre_rc_passe", label: "Sinistre RC Pro passé", value: "", type: "text", status: "missing", placeholder: "À compléter..." },
      { key: "montant_garanti", label: "Montant garanti souhaité", value: "1 000 000 €", type: "currency", status: "ok" },
    ],
  },
  {
    key: "contrat_actuel",
    label: "Contrat actuel",
    status: "complete",
    fields: [
      { key: "assureur_actuel", label: "Assureur actuel", value: "Generali", type: "text", status: "ok" },
      { key: "numero_contrat", label: "N° de contrat", value: "GEN-2025-44102", type: "text", status: "ok" },
      { key: "echeance", label: "Échéance", value: "01/04/2026", type: "date", status: "ok" },
      { key: "prime_annuelle", label: "Prime annuelle", value: "2 340 €", type: "currency", status: "ok" },
      { key: "franchise", label: "Franchise actuelle", value: "1 500 €", type: "currency", status: "ok" },
      { key: "plafond_garanti", label: "Plafond garanti", value: "500 000 €", type: "currency", status: "ok" },
    ],
  },
];

// ─── Auto individuelle ────────────────────────────────────────────────

const autoEmailThread: EmailMessage[] = [
  {
    id: "auto-1",
    from: "Sophie Marchand",
    fromName: "Sophie Marchand",
    fromEmail: "s.marchand@gmail.com",
    to: "cotation+a7f3b2@panora.co",
    date: "23/04/2026 à 09:40",
    subject: "Demande de devis auto - Peugeot 3008",
    body: `Bonjour,

Je souhaite obtenir un devis pour assurer mon véhicule :
- Peugeot 3008 GT, année 2024
- Immatriculation : FG-456-HJ
- Mise en circulation : 15/03/2024
- Kilométrage actuel : 18 000 km, environ 15 000 km/an
- Usage : trajets domicile-travail (25 km aller)
- Stationnement : garage fermé

Me concernant :
- Née le 12/07/1988
- Permis obtenu le 20/09/2006
- Bonus/malus : 0.50 depuis le 01/01/2023
- Cadre dans le secteur bancaire
- Aucun sinistre sur les 24 derniers mois
- Jamais résiliée par un assureur

Mon contrat actuel chez Macif arrive à échéance le 15/06/2026.
Je souhaite une prise d'effet au 15/06/2026.

Cordialement,
Sophie Marchand`,
    attachments: [
      { name: "Carte_Grise_3008.pdf", size: "320 Ko", fieldsExtracted: 4 },
      { name: "Releve_Info_Macif.pdf", size: "180 Ko", fieldsExtracted: 5 },
    ],
  },
];

const autoExtractedSections: ExtractedSection[] = [
  {
    key: "conducteur",
    label: "Informations conducteur",
    status: "incomplete",
    missingCount: 1,
    fields: [
      { key: "nom_prenom", label: "Nom et prénom", value: "Sophie Marchand", type: "text", status: "ok" },
      { key: "date_naissance", label: "Date de naissance", value: "12/07/1988", type: "date", status: "ok" },
      { key: "date_permis", label: "Date du permis", value: "20/09/2006", type: "date", status: "ok" },
      { key: "crm", label: "Bonus/malus (CRM)", value: "0.50", type: "text", status: "ok" },
      { key: "date_bonus_50", label: "Date bonus 0,50", value: "01/01/2023", type: "date", status: "ok" },
      { key: "situation_pro", label: "Situation pro.", value: "Cadre — secteur bancaire", type: "text", status: "ok" },
      { key: "sinistres_24m", label: "Sinistres (24 mois)", value: "Aucun", type: "text", status: "ok" },
      { key: "resiliation", label: "Résiliation par assureur", value: "", type: "text", status: "missing", placeholder: "Oui / Non" },
    ],
  },
  {
    key: "vehicule",
    label: "Informations véhicule",
    status: "complete",
    fields: [
      { key: "immatriculation", label: "Plaque d'immatriculation", value: "FG-456-HJ", type: "text", status: "ok" },
      { key: "marque_modele", label: "Marque / Modèle", value: "Peugeot 3008 GT", type: "text", status: "ok" },
      { key: "annee", label: "Année", value: "2024", type: "number", status: "ok" },
      { key: "date_mec", label: "Date de 1ère mise en circulation", value: "15/03/2024", type: "date", status: "ok" },
      { key: "usage", label: "Usage du véhicule", value: "Trajets domicile-travail", type: "text", status: "ok" },
      { key: "km_annuel", label: "Kilométrage annuel estimé", value: "15 000 km/an", type: "text", status: "ok" },
      { key: "stationnement", label: "Mode de stationnement", value: "Garage fermé", type: "text", status: "ok" },
    ],
  },
  {
    key: "contrat",
    label: "Informations contrat",
    status: "complete",
    fields: [
      { key: "date_effet", label: "Date d'effet souhaitée", value: "15/06/2026", type: "date", status: "ok" },
      { key: "assureur_precedent", label: "Assureur précédent", value: "Macif", type: "text", status: "ok" },
      { key: "echeance", label: "Date d'échéance", value: "15/06/2026", type: "date", status: "ok" },
    ],
  },
];

// ─── Scenario definitions ──────────────────────────────────────────────

export const scenarios: Record<string, Scenario> = {
  "flotte-auto": {
    id: "flotte-auto",
    label: "Flotte Automobile",
    description: "Renouvellement d'un contrat flotte auto avec 44 véhicules. Email entrant avec relevé d'information, cartes grises et sinistralité.",
    product: "Flotte Automobile",
    productIcon: "car",
    client: "ACME Corp SAS",
    clientSiren: "523 847 196",
    cotationId: "COT-2026-0198",
    emailThread: flotteAutoEmailThread,
    extractedSections: flotteAutoExtractedSections,
    availableInsurers: [
      { id: "axa", name: "Axa", logo: "🔴", hasCode: true },
      { id: "allianz", name: "Allianz", logo: "🔵", hasCode: true },
      { id: "generali", name: "Generali", logo: "🦁", hasCode: true },
      { id: "groupama", name: "Groupama", logo: "🟢", hasCode: true },
      { id: "mma", name: "MMA", logo: "🔶", hasCode: true },
      { id: "assureur_nc1", name: "Zurich", logo: "", hasCode: false },
      { id: "assureur_nc2", name: "Swiss Re Corporate", logo: "", hasCode: false },
    ],
    defaultSelectedInsurers: ["axa", "allianz"],
    defaultProjectName: "Flotte Auto ACME 2026",
  },
  "auto": {
    id: "auto",
    label: "Auto individuelle",
    description: "Devis auto pour un véhicule particulier. Email entrant avec carte grise et relevé d'information.",
    product: "Auto",
    productIcon: "car",
    client: "Sophie Marchand",
    clientSiren: "",
    cotationId: "COT-2026-0178",
    emailThread: autoEmailThread,
    extractedSections: autoExtractedSections,
    availableInsurers: [
      { id: "axa", name: "Axa", logo: "🔴", hasCode: true },
      { id: "maif", name: "MAIF", logo: "🟢", hasCode: true },
      { id: "groupama", name: "Groupama", logo: "🟢", hasCode: true },
      { id: "mma", name: "MMA", logo: "🔶", hasCode: true },
    ],
    defaultSelectedInsurers: ["axa", "maif"],
    defaultProjectName: "Auto Marchand 2026",
  },
  "rc-pro": {
    id: "rc-pro",
    label: "RC Professionnelle",
    description: "Cotation RC Pro pour une ESN SaaS de 45 salariés. Email entrant avec Kbis, bilan et informations dirigeants.",
    product: "RC Professionnelle",
    productIcon: "shield",
    client: "Marble Tech SAS",
    clientSiren: "00007U26464",
    cotationId: "COT-2026-0142",
    emailThread: rcProEmailThread,
    extractedSections: rcProExtractedSections,
    availableInsurers: [
      { id: "axa", name: "Axa", logo: "🔴", hasCode: true },
      { id: "allianz", name: "Allianz", logo: "🔵", hasCode: true },
      { id: "generali", name: "Generali", logo: "🦁", hasCode: true },
      { id: "chubb", name: "Chubb", logo: "⬛", hasCode: true },
      { id: "hiscox", name: "Hiscox", logo: "🟣", hasCode: true },
      { id: "assureur_nc1", name: "Beazley", logo: "", hasCode: false },
    ],
    defaultSelectedInsurers: ["axa", "generali"],
    defaultProjectName: "RC Pro Marble Tech 2026",
  },
};

export function getScenario(id: string): Scenario | undefined {
  return scenarios[id];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(scenarios);
}

// Compute validation stats for a scenario
export function getValidationStats(sections: ExtractedSection[]) {
  let missingFields = 0;
  let invalidFields = 0;
  for (const section of sections) {
    for (const field of section.fields) {
      if (field.status === "missing") missingFields++;
      if (field.status === "invalid") invalidFields++;
    }
  }
  return { missingFields, invalidFields };
}
