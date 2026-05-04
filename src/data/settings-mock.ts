// ── Types ──

import type { InsurerAction } from "./mock";

export type InsuranceProduct =
  | "Auto"
  | "MRI"
  | "MRP"
  | "Santé"
  | "RC Pro"
  | "Cyber"
  | "Flotte"
  | "Décennale"
  | "D&O"
  | "PJ"
  | "Homme clé"
  | "Marchandises transportées"
  | "Bris de machine"
  | "Perte d'exploitation"
  | "Construction";

export type MasterProduct = {
  id: InsuranceProduct;
  isNew: boolean; // recently modelized (30-day window)
};

// Per insurer: which products from the master list are modelized
export type InsurerProduct = {
  product: InsuranceProduct;
  isNew: boolean; // mirrors master but can differ per insurer timing
};

export type ConnectionStatus = "connected" | "needs_reauth" | "unchecked";

export type OtpFormat = "digits-4" | "digits-6" | "alphanumeric-8";

/**
 * Daily 2FA session lifecycle, per extranet card.
 * Orthogonal to `connectionStatus` (which is the long-term credentials trust signal).
 */
export type SessionState =
  | { status: "inactive" }
  | { status: "connecting" }
  | { status: "otp_required"; otpFormat: OtpFormat }
  | { status: "active"; expiresAtLabel: string }
  | { status: "error"; message: string };

export type ExtranetConfig = {
  id: string;
  insurerId: string;
  insurerName: string;
  portalLabel?: string;
  portalUrl: string;
  username: string;
  modelizedProducts: InsurerProduct[]; // what Panora can quote for this insurer
  selectedProducts: InsuranceProduct[]; // user's choices (modelized + requested)
  catalogEntryId?: string;
  configuredAt: string;
  connectionStatus: ConnectionStatus;
  lastVerified: string;
  sessionState: SessionState;
};


export type AvailableExtranet = {
  id: string;
  insurerId: string;
  insurerName: string;
  portalLabel?: string;
  portalUrl: string;
  modelizedProducts: InsurerProduct[]; // what Panora can quote for this insurer
};

// ── Master product list ──
// All ~60 product types known to the platform (showing 15 for mock)

export const masterProducts: MasterProduct[] = [
  { id: "Auto", isNew: false },
  { id: "MRI", isNew: false },
  { id: "MRP", isNew: false },
  { id: "Santé", isNew: false },
  { id: "RC Pro", isNew: false },
  { id: "Cyber", isNew: true },
  { id: "Flotte", isNew: false },
  { id: "Décennale", isNew: true },
  { id: "D&O", isNew: true },
  { id: "PJ", isNew: false },
  { id: "Homme clé", isNew: true },
  { id: "Marchandises transportées", isNew: false },
  { id: "Bris de machine", isNew: false },
  { id: "Perte d'exploitation", isNew: false },
  { id: "Construction", isNew: true },
];

// ── Helpers ──

/** Check if a product is modelized for a given insurer */
export function isModelized(
  modelizedProducts: InsurerProduct[],
  product: InsuranceProduct
): boolean {
  return modelizedProducts.some((p) => p.product === product);
}

/** Get active products (selected AND modelized) */
export function getActiveProducts(config: ExtranetConfig): InsuranceProduct[] {
  return config.selectedProducts.filter((p) =>
    isModelized(config.modelizedProducts, p)
  );
}

/** Get requested products (selected but NOT modelized) */
export function getRequestedProducts(config: ExtranetConfig): InsuranceProduct[] {
  return config.selectedProducts.filter(
    (p) => !isModelized(config.modelizedProducts, p)
  );
}

// ── Mock data ──

export const configuredExtranets: ExtranetConfig[] = [
  // Generali — two credentials on same portal, different product lines
  {
    id: "cfg-generali-auto",
    insurerId: "generali",
    insurerName: "Generali",
    portalLabel: "Auto / MRI",
    portalUrl: "portail.generali.fr",
    username: "dhowden_auto",
    modelizedProducts: [
      { product: "Auto", isNew: false },
      { product: "MRI", isNew: false },
      { product: "MRP", isNew: false },
    ],
    selectedProducts: ["Auto", "MRI", "MRP", "Flotte"], // Flotte = requested (not modelized)
    catalogEntryId: "avail-generali-auto",
    configuredAt: "2026-03-15",
    connectionStatus: "connected",
    lastVerified: "2026-04-15",
    sessionState: { status: "active", expiresAtLabel: "18h" },
  },
  {
    id: "cfg-generali-sante",
    insurerId: "generali",
    insurerName: "Generali",
    portalLabel: "Santé / Prévoyance",
    portalUrl: "portail.generali.fr",
    username: "dhowden_sante",
    modelizedProducts: [
      { product: "Santé", isNew: false },
      { product: "RC Pro", isNew: false },
    ],
    selectedProducts: ["Santé", "RC Pro", "Cyber", "D&O"], // Cyber + D&O = requested
    catalogEntryId: "avail-generali-sante",
    configuredAt: "2026-03-15",
    connectionStatus: "connected",
    lastVerified: "2026-04-15",
    sessionState: { status: "inactive" },
  },
  {
    id: "cfg-axa",
    insurerId: "axa",
    insurerName: "Axa",
    portalUrl: "portail.axa.fr",
    username: "dhowden_courtier",
    modelizedProducts: [
      { product: "Auto", isNew: false },
      { product: "MRI", isNew: false },
      { product: "MRP", isNew: false },
      { product: "Santé", isNew: false },
      { product: "RC Pro", isNew: false },
      { product: "Cyber", isNew: true },
      { product: "Flotte", isNew: false },
    ],
    selectedProducts: ["Auto", "MRI", "MRP", "Santé", "RC Pro", "Cyber", "Flotte", "Décennale"], // Décennale = requested
    configuredAt: "2026-03-10",
    connectionStatus: "connected",
    lastVerified: "2026-04-14",
    sessionState: { status: "otp_required", otpFormat: "digits-6" },
  },
  {
    id: "cfg-allianz",
    insurerId: "allianz",
    insurerName: "Allianz",
    portalUrl: "portail.allianz.fr",
    username: "dhowden_courtier",
    modelizedProducts: [
      { product: "Auto", isNew: false },
      { product: "MRI", isNew: false },
      { product: "MRP", isNew: false },
      { product: "RC Pro", isNew: false },
    ],
    selectedProducts: ["Auto", "MRI", "MRP", "RC Pro"],
    configuredAt: "2026-03-12",
    connectionStatus: "needs_reauth",
    lastVerified: "2026-04-02",
    sessionState: { status: "inactive" },
  },
  {
    id: "cfg-groupama",
    insurerId: "groupama",
    insurerName: "Groupama",
    portalUrl: "portail.groupama.fr",
    username: "dhowden_courtier",
    modelizedProducts: [
      { product: "Auto", isNew: false },
      { product: "MRI", isNew: false },
    ],
    selectedProducts: ["Auto", "MRI"],
    catalogEntryId: "avail-groupama",
    configuredAt: "2026-03-20",
    connectionStatus: "connected",
    lastVerified: "2026-04-12",
    sessionState: { status: "inactive" },
  },
];

/** Steps the agent walks through when activating a session — used by the live side panel. */
export const mockConnectionSteps: InsurerAction[] = [
  {
    date: "À l'instant",
    title: "Ouverture du portail assureur",
    description: "Connexion à l'extranet en cours.",
    status: "success",
  },
  {
    date: "À l'instant",
    title: "Saisie des identifiants",
    description: "Les identifiants sont déchiffrés localement puis transmis au portail.",
    status: "success",
  },
  {
    date: "À l'instant",
    title: "Demande du code 2FA",
    description: "L'extranet exige une vérification supplémentaire.",
    status: "in_progress",
  },
  {
    date: "En attente",
    title: "Validation du code",
    description: "Saisissez le code reçu pour finaliser la connexion.",
    status: "pending",
  },
];

export const availableExtranets: AvailableExtranet[] = [
  // Generali — two portal entries (both configured)
  {
    id: "avail-generali-auto",
    insurerId: "generali",
    insurerName: "Generali",
    portalLabel: "Auto / MRI",
    portalUrl: "portail.generali.fr",
    modelizedProducts: [
      { product: "Auto", isNew: false },
      { product: "MRI", isNew: false },
      { product: "MRP", isNew: false },
    ],
  },
  {
    id: "avail-generali-sante",
    insurerId: "generali",
    insurerName: "Generali",
    portalLabel: "Santé / Prévoyance",
    portalUrl: "portail.generali.fr",
    modelizedProducts: [
      { product: "Santé", isNew: false },
      { product: "RC Pro", isNew: false },
    ],
  },
  // MAIF — two separate portals for different product lines
  {
    id: "avail-maif-standard",
    insurerId: "maif",
    insurerName: "Maif",
    portalLabel: "Produits standards",
    portalUrl: "portail.maif.fr",
    modelizedProducts: [
      { product: "Auto", isNew: false },
      { product: "MRI", isNew: false },
      { product: "MRP", isNew: false },
      { product: "Santé", isNew: false },
    ],
  },
  {
    id: "avail-maif-rcpro",
    insurerId: "maif",
    insurerName: "Maif",
    portalLabel: "RC Pro",
    portalUrl: "portail-rcpro.maif.fr",
    modelizedProducts: [
      { product: "RC Pro", isNew: false },
    ],
  },
  {
    id: "avail-groupama",
    insurerId: "groupama",
    insurerName: "Groupama",
    portalUrl: "portail.groupama.fr",
    modelizedProducts: [
      { product: "Auto", isNew: false },
      { product: "MRI", isNew: false },
    ],
  },
  {
    id: "avail-chubb",
    insurerId: "chubb",
    insurerName: "Chubb",
    portalUrl: "portail.chubb.fr",
    modelizedProducts: [
      { product: "RC Pro", isNew: false },
      { product: "Cyber", isNew: true },
      { product: "D&O", isNew: true },
    ],
  },
  {
    id: "avail-hiscox",
    insurerId: "hiscox",
    insurerName: "Hiscox",
    portalUrl: "portail.hiscox.fr",
    modelizedProducts: [
      { product: "RC Pro", isNew: false },
      { product: "Cyber", isNew: true },
    ],
  },
  {
    id: "avail-mma",
    insurerId: "mma",
    insurerName: "MMA",
    portalUrl: "portail.mma.fr",
    modelizedProducts: [], // nothing modelized yet
  },
  {
    id: "avail-coface",
    insurerId: "coface",
    insurerName: "COFACE",
    portalUrl: "portail.coface.fr",
    modelizedProducts: [], // nothing modelized yet
  },
];
