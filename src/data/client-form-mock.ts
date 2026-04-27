// Mock data for standalone client form tokens
// Each token maps to a cotation with its incomplete extracted sections

import type { ExtractedSection } from "./scenarios";

export type ClientFormRequest = {
  token: string;
  cotationId: string;
  client: string;
  product: string;
  brokerName: string;
  cabinetName: string;
  cabinetLogo?: string;
  expiresAt: string; // ISO date
  sections: ExtractedSection[];
};

// RC Pro scenario — has missing/invalid fields across multiple sections
const rcProSections: ExtractedSection[] = [
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
      { key: "antecedents", label: "Antécédents judiciaires", value: "", type: "text", status: "missing", placeholder: "Oui / Non" },
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
      { key: "certifications", label: "Certifications", value: "", type: "text", status: "missing", placeholder: "Ex: ISO 27001, SOC 2..." },
      { key: "hebergement", label: "Hébergement données", value: "AWS — eu-west-3 (Paris)", type: "text", status: "ok" },
      { key: "sinistre_rc_passe", label: "Sinistre RC Pro passé", value: "", type: "text", status: "missing", placeholder: "Oui / Non — détails si oui" },
      { key: "montant_garanti", label: "Montant garanti souhaité", value: "1 000 000 €", type: "currency", status: "ok" },
    ],
  },
];

// Flotte Auto scenario — different set of missing fields
const flotteAutoSections: ExtractedSection[] = [
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
      { key: "stationnement", label: "Mode stationnement", value: "", type: "text", status: "missing", placeholder: "Ex: garage fermé, parking extérieur..." },
      { key: "ptac_max", label: "PTAC max (PL)", value: "", type: "text", status: "missing", placeholder: "Ex: 19 tonnes" },
    ],
  },
  {
    key: "sinistralite",
    label: "Sinistralité (3 ans)",
    status: "invalid",
    invalidCount: 1,
    fields: [
      { key: "nb_sinistres_2025", label: "Sinistres 2025", value: "8", type: "number", status: "ok" },
      { key: "cout_2025", label: "Coût 2025", value: "31 200 €", type: "currency", status: "ok" },
      { key: "ratio_sp", label: "Ratio S/P moyen", value: "62 %", type: "percentage", status: "ok" },
      { key: "dernier_sinistre", label: "Date dernier sinistre", value: "45/12/2025", type: "date", status: "invalid", error: "Date invalide" },
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
      { key: "protection_juridique", label: "Protection juridique", value: "", type: "text", status: "missing", placeholder: "Oui / Non" },
      { key: "vehicule_remplacement", label: "Véhicule de remplacement", value: "Oui, durée 15 jours", type: "text", status: "ok" },
    ],
  },
];

export const clientFormRequests: Record<string, ClientFormRequest> = {
  "rc-pro-marble": {
    token: "rc-pro-marble",
    cotationId: "COT-2026-0142",
    client: "Marble Tech SAS",
    product: "RC Professionnelle",
    brokerName: "Alexandre Durand",
    cabinetName: "Cabinet Durand & Associés",
    expiresAt: "2026-05-15T23:59:59Z",
    sections: rcProSections,
  },
  "flotte-acme": {
    token: "flotte-acme",
    cotationId: "COT-2026-0198",
    client: "ACME Corp SAS",
    product: "Flotte Automobile",
    brokerName: "Alexandre Durand",
    cabinetName: "Cabinet Durand & Associés",
    expiresAt: "2026-05-15T23:59:59Z",
    sections: flotteAutoSections,
  },
};

export function getClientFormRequest(token: string): ClientFormRequest | undefined {
  return clientFormRequests[token];
}
