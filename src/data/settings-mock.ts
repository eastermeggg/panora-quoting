// ── Types ──

import { useSyncExternalStore } from "react";
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
  available: boolean; // Panora can quote it today (false = modelization planned, in DB but not live)
};

// Per insurer: which products from the master list are modelized
export type InsurerProduct = {
  product: InsuranceProduct;
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

/** Where the 2FA code is delivered by the insurer portal. */
export type OtpDelivery =
  | {
      channel: "email";
      hint: string; // masked address shown to the broker, e.g. "co****@axa.fr"
      /** Real "From" address the insurer sends 2FA emails from. Used by the
       *  forward-setup step to give the broker an exact filter rule. */
      sourceAddress?: string;
    }
  | { channel: "sms"; hint: string } // hint = masked number, e.g. "•• •• •• 42"
  | { channel: "app"; hint: string }; // hint = app name, e.g. "AXA Authenticator"

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
  /** OTP delivery (when portal requires 2FA). Drives the activation panel copy. */
  otpDelivery?: OtpDelivery;
  /** Whether the broker set up an auto-forward of the OTP email to their cotation address. */
  emailForwardConfigured?: boolean;
  /** How long the session stays active once activated. Varies a lot per insurer. */
  sessionDurationLabel?: string;
  /** Whether this insurer is reachable via EDIconnexion (single-gateway channel). */
  ediCompatible?: boolean;
  /** Whether the broker chose to route this insurer through EDIconnexion. */
  useEdi?: boolean;
};


export type AvailableExtranet = {
  id: string;
  insurerId: string;
  insurerName: string;
  portalLabel?: string;
  portalUrl: string;
  modelizedProducts: InsurerProduct[]; // what Panora can quote for this insurer
  /** Whether this portal requires daily 2FA. Drives the activation flow on the card. */
  requires2FA?: boolean;
  /** Default OTP delivery the portal uses. Copied onto the config when saved. */
  otpDelivery?: OtpDelivery;
  /** Approximate session lifetime after activation. Varies a lot: AXA ≈ 4h, Generali ≈ 10 jours. */
  sessionDurationLabel?: string;
  /** Whether this insurer is reachable via EDIconnexion (single-gateway channel). */
  ediCompatible?: boolean;
};

// ── Master product list ──
// All ~60 product types known to the platform (showing 15 for mock)

export const masterProducts: MasterProduct[] = [
  { id: "Auto", available: true },
  { id: "MRI", available: true },
  { id: "MRP", available: true },
  { id: "Santé", available: true },
  { id: "RC Pro", available: true },
  { id: "Cyber", available: true },
  { id: "Flotte", available: true },
  { id: "Décennale", available: false },
  { id: "D&O", available: true },
  { id: "PJ", available: true },
  { id: "Homme clé", available: false },
  { id: "Marchandises transportées", available: true },
  { id: "Bris de machine", available: true },
  { id: "Perte d'exploitation", available: true },
  { id: "Construction", available: false },
];

// ── External resources ──

export const COVERAGE_MATRIX_URL = "/matrice-couverture";

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

/**
 * Original seeded extranets, kept for reference. The actual demo store starts empty
 * (see reactive store below). Pass this array to `seedConfiguredExtranets()` to
 * populate the store with realistic mock data.
 */
export const seededConfiguredExtranets: ExtranetConfig[] = [
  // Generali — two credentials on same portal, different product lines
  {
    id: "cfg-generali-auto",
    insurerId: "generali",
    insurerName: "Generali",
    portalLabel: "Auto / MRI",
    portalUrl: "portail.generali.fr",
    username: "dhowden_auto",
    modelizedProducts: [
      { product: "Auto" },
      { product: "MRI" },
      { product: "MRP" },
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
      { product: "Santé" },
      { product: "RC Pro" },
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
      { product: "Auto" },
      { product: "MRI" },
      { product: "MRP" },
      { product: "Santé" },
      { product: "RC Pro" },
      { product: "Cyber" },
      { product: "Flotte" },
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
      { product: "Auto" },
      { product: "MRI" },
      { product: "MRP" },
      { product: "RC Pro" },
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
      { product: "Auto" },
      { product: "MRI" },
    ],
    selectedProducts: ["Auto", "MRI"],
    catalogEntryId: "avail-groupama",
    configuredAt: "2026-03-20",
    connectionStatus: "connected",
    lastVerified: "2026-04-12",
    sessionState: { status: "inactive" },
  },
];

// ── Reactive store (demo) ──
// In-memory store that drives the onboarding demo. Starts empty so brokers
// experience the full first-run flow: add credentials → activate session → reveal email.

let storeState: ExtranetConfig[] = [];
const subscribers = new Set<() => void>();

function notify(): void {
  subscribers.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

function getSnapshot(): ExtranetConfig[] {
  return storeState;
}

export function useConfiguredExtranets(): ExtranetConfig[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getConfiguredExtranets(): ExtranetConfig[] {
  return storeState;
}

export function addConfiguredExtranet(config: ExtranetConfig): void {
  storeState = [...storeState, config];
  notify();
}

/**
 * Add an EDI-compatible insurer that's covered by the active EDIconnexion
 * channel — no per-insurer credentials needed. Used to skip the credentials
 * modal entirely when EDI is connected and the insurer supports it.
 */
export function addEdiCoveredExtranet(source: AvailableExtranet): string {
  const today = new Date().toISOString().slice(0, 10);
  const id = `cfg-${source.insurerId}-${Date.now()}`;
  addConfiguredExtranet({
    id,
    insurerId: source.insurerId,
    insurerName: source.insurerName,
    portalLabel: source.portalLabel,
    portalUrl: source.portalUrl,
    username: "", // covered by EDIconnexion — no per-insurer login
    modelizedProducts: source.modelizedProducts,
    selectedProducts: source.modelizedProducts.map((p) => p.product),
    catalogEntryId: source.id,
    configuredAt: today,
    connectionStatus: "connected",
    lastVerified: today,
    sessionState: { status: "inactive" },
    otpDelivery: source.otpDelivery,
    emailForwardConfigured: false,
    sessionDurationLabel: source.sessionDurationLabel,
    ediCompatible: source.ediCompatible,
    useEdi: true,
  });
  return id;
}

export function removeConfiguredExtranet(id: string): void {
  storeState = storeState.filter((c) => c.id !== id);
  notify();
}

export function updateConfiguredExtranet(
  id: string,
  patch: Partial<ExtranetConfig>
): void {
  storeState = storeState.map((c) => (c.id === id ? { ...c, ...patch } : c));
  notify();
}

export function updateExtranetSession(
  id: string,
  sessionState: SessionState
): void {
  updateConfiguredExtranet(id, { sessionState });
}

/** Reset the store and optionally seed it. Useful for demo reset buttons. */
export function seedConfiguredExtranets(
  seed: ExtranetConfig[] = seededConfiguredExtranets
): void {
  storeState = [...seed];
  notify();
}

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
  // AXA — featured at the top, requires daily 2FA via email
  {
    id: "avail-axa",
    insurerId: "axa",
    insurerName: "Axa",
    portalUrl: "portail.axa.fr",
    modelizedProducts: [
      { product: "Auto" },
      { product: "MRI" },
      { product: "MRP" },
      { product: "Santé" },
      { product: "RC Pro" },
      { product: "Cyber" },
      { product: "Flotte" },
    ],
    requires2FA: true,
    otpDelivery: {
      channel: "email",
      hint: "co****@axa.fr",
      sourceAddress: "noreply.2fa@axa.fr",
    },
    sessionDurationLabel: "≈ 4 heures",
    ediCompatible: true,
  },
  // Generali — two portal entries (both configured)
  {
    id: "avail-generali-auto",
    insurerId: "generali",
    insurerName: "Generali",
    portalLabel: "Auto / MRI",
    portalUrl: "portail.generali.fr",
    modelizedProducts: [
      { product: "Auto" },
      { product: "MRI" },
      { product: "MRP" },
    ],
    requires2FA: true,
    otpDelivery: {
      channel: "email",
      hint: "co****@generali.fr",
      sourceAddress: "securite@generali.fr",
    },
    sessionDurationLabel: "≈ 10 jours",
    ediCompatible: true,
  },
  {
    id: "avail-generali-sante",
    insurerId: "generali",
    insurerName: "Generali",
    portalLabel: "Santé / Prévoyance",
    portalUrl: "portail.generali.fr",
    modelizedProducts: [
      { product: "Santé" },
      { product: "RC Pro" },
    ],
    requires2FA: true,
    otpDelivery: {
      channel: "email",
      hint: "co****@generali.fr",
      sourceAddress: "securite@generali.fr",
    },
    sessionDurationLabel: "≈ 10 jours",
    ediCompatible: true,
  },
  // MAIF — two separate portals for different product lines
  {
    id: "avail-maif-standard",
    insurerId: "maif",
    insurerName: "Maif",
    portalLabel: "Produits standards",
    portalUrl: "portail.maif.fr",
    modelizedProducts: [
      { product: "Auto" },
      { product: "MRI" },
      { product: "MRP" },
      { product: "Santé" },
    ],
  },
  {
    id: "avail-maif-rcpro",
    insurerId: "maif",
    insurerName: "Maif",
    portalLabel: "RC Pro",
    portalUrl: "portail-rcpro.maif.fr",
    modelizedProducts: [
      { product: "RC Pro" },
    ],
  },
  {
    id: "avail-groupama",
    insurerId: "groupama",
    insurerName: "Groupama",
    portalUrl: "portail.groupama.fr",
    modelizedProducts: [
      { product: "Auto" },
      { product: "MRI" },
    ],
    requires2FA: false,
  },
  {
    id: "avail-chubb",
    insurerId: "chubb",
    insurerName: "Chubb",
    portalUrl: "portail.chubb.fr",
    modelizedProducts: [
      { product: "RC Pro" },
      { product: "Cyber" },
      { product: "D&O" },
    ],
    requires2FA: true,
    otpDelivery: { channel: "sms", hint: "•• •• •• 42" },
    sessionDurationLabel: "≈ 1 jour",
  },
  {
    id: "avail-hiscox",
    insurerId: "hiscox",
    insurerName: "Hiscox",
    portalUrl: "portail.hiscox.fr",
    modelizedProducts: [
      { product: "RC Pro" },
      { product: "Cyber" },
    ],
    requires2FA: true,
    otpDelivery: { channel: "app", hint: "Hiscox Authenticator" },
    sessionDurationLabel: "≈ 8 heures",
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

// ── Coverage matrix / roadmap ──
// Honest, public-facing view of what's modelized today and what's coming next.

export type RoadmapStatus =
  | "available"
  | "short_term"
  | "mid_term"
  | "long_term"
  | "not_planned";

export type CoverageCell = {
  status: RoadmapStatus;
  /** Trimester target, e.g. "T3 2026". Required for short/mid/long_term cells. */
  targetLabel?: string;
};

export type InsurerCoverage = {
  insurerId: string;
  insurerName: string;
  coverage: Partial<Record<InsuranceProduct, CoverageCell>>;
};

export const ROADMAP_STATUS_ORDER: RoadmapStatus[] = [
  "available",
  "short_term",
  "mid_term",
  "long_term",
  "not_planned",
];

/** Ordered list of trimester periods used in the roadmap. */
export const ROADMAP_PERIODS = [
  "T3 2026",
  "T4 2026",
  "T1 2027",
  "T2 2027",
  "T3 2027",
  "T4 2027",
  "2028+",
] as const;

export type RoadmapPeriod = (typeof ROADMAP_PERIODS)[number];

export function roadmapPeriodToStatus(period: RoadmapPeriod): RoadmapStatus {
  if (period === "T3 2026" || period === "T4 2026") return "short_term";
  if (period === "T1 2027" || period === "T2 2027") return "mid_term";
  return "long_term";
}

export const coverageMatrix: InsurerCoverage[] = [
  {
    insurerId: "axa",
    insurerName: "Axa",
    coverage: {
      Auto: { status: "available" },
      MRI: { status: "available" },
      MRP: { status: "available" },
      Santé: { status: "available" },
      "RC Pro": { status: "available" },
      Cyber: { status: "available" },
      Flotte: { status: "available" },
      Décennale: { status: "short_term", targetLabel: "T3 2026" },
      "D&O": { status: "short_term", targetLabel: "T3 2026" },
      PJ: { status: "mid_term", targetLabel: "T1 2027" },
      "Homme clé": { status: "mid_term", targetLabel: "T2 2027" },
      "Marchandises transportées": { status: "long_term", targetLabel: "T4 2027" },
      "Bris de machine": { status: "long_term", targetLabel: "T4 2027" },
      "Perte d'exploitation": { status: "long_term", targetLabel: "2028+" },
      Construction: { status: "mid_term", targetLabel: "T2 2027" },
    },
  },
  {
    insurerId: "allianz",
    insurerName: "Allianz",
    coverage: {
      Auto: { status: "available" },
      MRI: { status: "available" },
      MRP: { status: "available" },
      "RC Pro": { status: "available" },
      Santé: { status: "short_term", targetLabel: "T3 2026" },
      Cyber: { status: "short_term", targetLabel: "T4 2026" },
      Flotte: { status: "short_term", targetLabel: "T4 2026" },
      Décennale: { status: "mid_term", targetLabel: "T1 2027" },
      "D&O": { status: "mid_term", targetLabel: "T2 2027" },
      PJ: { status: "long_term", targetLabel: "T3 2027" },
      "Homme clé": { status: "long_term", targetLabel: "T4 2027" },
      Construction: { status: "long_term", targetLabel: "T3 2027" },
    },
  },
  {
    insurerId: "generali",
    insurerName: "Generali",
    coverage: {
      Auto: { status: "available" },
      MRI: { status: "available" },
      MRP: { status: "available" },
      Santé: { status: "available" },
      "RC Pro": { status: "available" },
      Cyber: { status: "short_term", targetLabel: "T3 2026" },
      "D&O": { status: "short_term", targetLabel: "T4 2026" },
      Flotte: { status: "mid_term", targetLabel: "T1 2027" },
      Décennale: { status: "mid_term", targetLabel: "T2 2027" },
      PJ: { status: "long_term", targetLabel: "T3 2027" },
      "Perte d'exploitation": { status: "long_term", targetLabel: "T4 2027" },
    },
  },
  {
    insurerId: "groupama",
    insurerName: "Groupama",
    coverage: {
      Auto: { status: "available" },
      MRI: { status: "available" },
      MRP: { status: "short_term", targetLabel: "T3 2026" },
      "RC Pro": { status: "short_term", targetLabel: "T3 2026" },
      Santé: { status: "short_term", targetLabel: "T4 2026" },
      Cyber: { status: "mid_term", targetLabel: "T1 2027" },
      Flotte: { status: "mid_term", targetLabel: "T2 2027" },
      Décennale: { status: "long_term", targetLabel: "T3 2027" },
      "D&O": { status: "long_term", targetLabel: "T4 2027" },
    },
  },
  {
    insurerId: "maif",
    insurerName: "Maif",
    coverage: {
      Auto: { status: "short_term", targetLabel: "T3 2026" },
      MRI: { status: "short_term", targetLabel: "T3 2026" },
      MRP: { status: "short_term", targetLabel: "T4 2026" },
      Santé: { status: "short_term", targetLabel: "T4 2026" },
      "RC Pro": { status: "mid_term", targetLabel: "T1 2027" },
      Cyber: { status: "mid_term", targetLabel: "T2 2027" },
      PJ: { status: "long_term", targetLabel: "T3 2027" },
    },
  },
  {
    insurerId: "chubb",
    insurerName: "Chubb",
    coverage: {
      "RC Pro": { status: "available" },
      Cyber: { status: "available" },
      "D&O": { status: "available" },
      "Homme clé": { status: "short_term", targetLabel: "T3 2026" },
      "Perte d'exploitation": { status: "mid_term", targetLabel: "T1 2027" },
      "Bris de machine": { status: "mid_term", targetLabel: "T2 2027" },
      "Marchandises transportées": { status: "long_term", targetLabel: "T3 2027" },
    },
  },
  {
    insurerId: "hiscox",
    insurerName: "Hiscox",
    coverage: {
      "RC Pro": { status: "available" },
      Cyber: { status: "available" },
      "D&O": { status: "short_term", targetLabel: "T3 2026" },
      "Homme clé": { status: "short_term", targetLabel: "T4 2026" },
      PJ: { status: "mid_term", targetLabel: "T1 2027" },
      "Perte d'exploitation": { status: "long_term", targetLabel: "T3 2027" },
    },
  },
  {
    insurerId: "mma",
    insurerName: "MMA",
    coverage: {
      Auto: { status: "short_term", targetLabel: "T4 2026" },
      MRI: { status: "short_term", targetLabel: "T4 2026" },
      MRP: { status: "mid_term", targetLabel: "T1 2027" },
      Santé: { status: "mid_term", targetLabel: "T2 2027" },
      "RC Pro": { status: "long_term", targetLabel: "T3 2027" },
    },
  },
  {
    insurerId: "coface",
    insurerName: "COFACE",
    coverage: {
      "RC Pro": { status: "long_term", targetLabel: "T4 2027" },
      "D&O": { status: "long_term", targetLabel: "2028+" },
    },
  },
];

// ── Coverage votes (broker requests / upvotes per combo) ──

export function coverageVoteKey(
  insurerId: string,
  product: InsuranceProduct
): string {
  return `${insurerId}:${product}`;
}

// Seeded counts make the demo feel populated — these are "votes from other brokers".
let coverageVoteCounts: Record<string, number> = {
  "axa:Décennale": 23,
  "axa:D&O": 18,
  "axa:PJ": 7,
  "allianz:Cyber": 14,
  "allianz:Santé": 9,
  "allianz:Décennale": 12,
  "generali:Cyber": 31,
  "generali:D&O": 16,
  "groupama:Cyber": 11,
  "groupama:Santé": 4,
  "chubb:Homme clé": 9,
  "chubb:Perte d'exploitation": 6,
  "hiscox:D&O": 8,
  "maif:Auto": 12,
  "maif:RC Pro": 5,
  "mma:Auto": 3,
  "coface:RC Pro": 2,
};

let myCoverageVotes = new Set<string>();

let coverageVotesSnapshot: {
  counts: Record<string, number>;
  mine: ReadonlySet<string>;
} = {
  counts: coverageVoteCounts,
  mine: myCoverageVotes,
};

const coverageVoteSubscribers = new Set<() => void>();

function notifyCoverageVotes(): void {
  coverageVotesSnapshot = {
    counts: coverageVoteCounts,
    mine: myCoverageVotes,
  };
  coverageVoteSubscribers.forEach((fn) => fn());
}

function subscribeCoverageVotes(fn: () => void): () => void {
  coverageVoteSubscribers.add(fn);
  return () => {
    coverageVoteSubscribers.delete(fn);
  };
}

function getCoverageVotesSnapshot() {
  return coverageVotesSnapshot;
}

export function useCoverageVotes() {
  return useSyncExternalStore(
    subscribeCoverageVotes,
    getCoverageVotesSnapshot,
    getCoverageVotesSnapshot
  );
}

export function toggleCoverageVote(
  insurerId: string,
  product: InsuranceProduct
): void {
  const key = coverageVoteKey(insurerId, product);
  const wasVoted = myCoverageVotes.has(key);
  const nextMine = new Set(myCoverageVotes);
  if (wasVoted) {
    nextMine.delete(key);
    coverageVoteCounts = {
      ...coverageVoteCounts,
      [key]: Math.max(0, (coverageVoteCounts[key] ?? 0) - 1),
    };
  } else {
    nextMine.add(key);
    coverageVoteCounts = {
      ...coverageVoteCounts,
      [key]: (coverageVoteCounts[key] ?? 0) + 1,
    };
  }
  myCoverageVotes = nextMine;
  notifyCoverageVotes();
}

/** All products that appear at least once in the matrix, in display order. */
export const COVERAGE_PRODUCT_ORDER: InsuranceProduct[] = [
  "Auto",
  "MRI",
  "MRP",
  "Santé",
  "RC Pro",
  "Cyber",
  "Flotte",
  "Décennale",
  "D&O",
  "PJ",
  "Homme clé",
  "Construction",
  "Marchandises transportées",
  "Bris de machine",
  "Perte d'exploitation",
];
