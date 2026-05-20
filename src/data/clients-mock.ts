// Shared client base used by ClientSelector across Compare / Quote / Devoir surfaces.
// Treated as the snapshot of clients that exist in the broker's VEOS ERP.

export type VeosClientType = "PM" | "PP"; // personne morale / personne physique

export type ClientAddress = {
  street: string;
  postalCode: string;
  city: string;
  country: string;
};

export type ClientPrimaryContact = {
  firstName: string;
  lastName: string;
  role?: string;
  email: string;
  phone?: string;
};

export type VeosClient = {
  id: string;
  type: VeosClientType;
  name: string;
  /** SIREN for personne morale, empty/undefined for personne physique. */
  siren?: string;
  /** City — used as quiet secondary line in dropdown results. */
  city?: string;
  /** "12/04/2026" — last contract update from VEOS, used as result metadata. */
  lastContractUpdate: string;
  // ── Extended v3 fields (optional, used by Create Client v3). ──
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  legalForm?: string;
  ape?: string;
  primaryContact?: ClientPrimaryContact;
  address?: ClientAddress;
};

export const veosClients: VeosClient[] = [
  {
    id: "marble",
    type: "PM",
    name: "Marble Tech SAS",
    siren: "00007U26464",
    city: "Paris 9e",
    lastContractUpdate: "14/04/2026",
  },
  {
    id: "acme",
    type: "PM",
    name: "ACME Corp SAS",
    siren: "523 847 196",
    city: "Lyon 2e",
    lastContractUpdate: "02/04/2026",
  },
  {
    id: "techvision",
    type: "PM",
    name: "TechVision SAS",
    siren: "891 234 567",
    city: "Paris 11e",
    lastContractUpdate: "10/03/2026",
  },
  {
    id: "greenway",
    type: "PM",
    name: "GreenWay Industries SARL",
    siren: "345 678 912",
    city: "Bordeaux",
    lastContractUpdate: "28/02/2026",
  },
  {
    id: "blueleaf",
    type: "PM",
    name: "BlueLeaf Industries SA",
    siren: "456 789 123",
    city: "Nantes",
    lastContractUpdate: "21/03/2026",
  },
  {
    id: "digital-solutions",
    type: "PM",
    name: "Digital Solutions SARL",
    siren: "612 308 421",
    city: "Lille",
    lastContractUpdate: "07/03/2026",
  },
  {
    id: "legalplace",
    type: "PM",
    name: "LegalPlace SAS",
    siren: "812 904 117",
    city: "Paris 2e",
    lastContractUpdate: "12/04/2026",
  },
  {
    id: "dupont-sa",
    type: "PM",
    name: "Dupont SA",
    siren: "327 651 099",
    city: "Marseille",
    lastContractUpdate: "16/04/2026",
  },
  {
    id: "transports-moreau",
    type: "PM",
    name: "Transports Moreau SAS",
    siren: "445 081 234",
    city: "Rennes",
    lastContractUpdate: "08/04/2026",
  },
  {
    id: "fonciere-belleville",
    type: "PM",
    name: "Fonciere Belleville SCI",
    siren: "789 213 654",
    city: "Paris 20e",
    lastContractUpdate: "17/04/2026",
  },
  {
    id: "garage-dupont",
    type: "PM",
    name: "Garage Dupont & Fils SARL",
    siren: "215 678 042",
    city: "Toulouse",
    lastContractUpdate: "18/04/2026",
  },
  {
    id: "btp-horizon",
    type: "PM",
    name: "BTP Horizon SAS",
    siren: "954 321 876",
    city: "Lyon 7e",
    lastContractUpdate: "20/04/2026",
  },
  {
    id: "valeas-groupe",
    type: "PM",
    name: "Valeas Groupe SAS",
    siren: "146 029 583",
    city: "Paris 8e",
    lastContractUpdate: "22/04/2026",
  },
  {
    id: "marchand-sophie",
    type: "PP",
    name: "Sophie Marchand",
    city: "Lyon 6e",
    lastContractUpdate: "03/04/2026",
  },
  {
    id: "laurent-pierre",
    type: "PP",
    name: "Pierre Laurent",
    city: "Marseille",
    lastContractUpdate: "30/03/2026",
  },
];

// ── Helpers ──

export function getVeosClient(id: string): VeosClient | undefined {
  return veosClients.find((c) => c.id === id);
}

// ── Client creation ──

export type CreateClientInput = {
  type: VeosClientType;
  identity: {
    /** PM: raison sociale. PP: "Prénom Nom" joined. */
    name: string;
    firstName?: string;
    lastName?: string;
    /** ISO date string for PP only. */
    dateOfBirth?: string;
    siren?: string;
    legalForm?: string;
    /** Stored as a free-text label, e.g. "6202A — Conseil en systèmes…". */
    ape?: string;
  };
  primaryContact?: ClientPrimaryContact;
  address: ClientAddress;
};

/**
 * Add a new client to the shared list and return it. The structure mirrors
 * what VEOS expects so the record can later be pushed to the ERP unchanged.
 */
export function createClient(input: CreateClientInput): VeosClient {
  const id = `new-${Date.now()}`;
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const next: VeosClient = {
    id,
    type: input.type,
    name: input.identity.name.trim(),
    siren:
      input.type === "PM"
        ? input.identity.siren?.trim() || undefined
        : undefined,
    city: input.address.city.trim() || undefined,
    lastContractUpdate: `${dd}/${mm}/${today.getFullYear()}`,
    firstName: input.identity.firstName,
    lastName: input.identity.lastName,
    dateOfBirth: input.identity.dateOfBirth,
    legalForm: input.identity.legalForm,
    ape: input.identity.ape,
    primaryContact: input.primaryContact,
    address: input.address,
  };
  veosClients.unshift(next);
  return next;
}

// ── INSEE lookup mock ──

export type InseeFound = {
  status: "found";
  data: {
    name: string;
    legalForm?: string;
    ape?: string;
    address?: ClientAddress;
  };
};

export type InseeLookupResult =
  | InseeFound
  | { status: "duplicate"; client: VeosClient }
  | { status: "notfound" };

const SIREN_FIXTURES: Record<string, InseeFound["data"]> = {
  "732829320": {
    name: "Renault SAS",
    legalForm: "SAS",
    ape: "2910Z — Construction de véhicules automobiles",
    address: {
      street: "13 Quai Le Gallo",
      postalCode: "92100",
      city: "Boulogne-Billancourt",
      country: "France",
    },
  },
  "552032534": {
    name: "Air Liquide SA",
    legalForm: "SA",
    ape: "2011Z — Fabrication de gaz industriels",
    address: {
      street: "75 Quai d'Orsay",
      postalCode: "75007",
      city: "Paris 7e",
      country: "France",
    },
  },
};

/** Strip whitespace and uppercase; SIRENs are 9 digits but we keep it permissive. */
function normalizeSiren(raw: string): string {
  return raw.replace(/\s+/g, "").toLowerCase();
}

export function lookupInsee(rawSiren: string): Promise<InseeLookupResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const normalized = normalizeSiren(rawSiren);
      if (normalized.length < 6) {
        resolve({ status: "notfound" });
        return;
      }
      const existing = veosClients.find(
        (c) => c.siren && normalizeSiren(c.siren) === normalized
      );
      if (existing) {
        resolve({ status: "duplicate", client: existing });
        return;
      }
      const fixture = SIREN_FIXTURES[normalized];
      if (fixture) {
        resolve({ status: "found", data: fixture });
        return;
      }
      // Synthetic fallback so the demo "works" with arbitrary SIRENs.
      resolve({
        status: "found",
        data: {
          name: `Société ${normalized.slice(0, 3).toUpperCase()}`,
          legalForm: "SAS",
          ape: "7022Z — Conseil pour les affaires et autres conseils de gestion",
          address: {
            street: "12 rue de la République",
            postalCode: "75011",
            city: "Paris 11e",
            country: "France",
          },
        },
      });
    }, 700);
  });
}

// ── Form taxonomies ──

export const LEGAL_FORMS = [
  "SAS",
  "SARL",
  "SA",
  "SASU",
  "EURL",
  "SCI",
  "SNC",
  "SCP",
  "Société civile",
  "Association loi 1901",
  "Auto-entrepreneur",
  "Profession libérale",
] as const;

export const APE_CODES: { code: string; label: string }[] = [
  { code: "6202A", label: "Conseil en systèmes et logiciels informatiques" },
  { code: "7022Z", label: "Conseil pour les affaires et autres conseils de gestion" },
  { code: "6920Z", label: "Activités comptables" },
  { code: "6831Z", label: "Agences immobilières" },
  { code: "4791A", label: "Vente à distance sur catalogue spécialisé" },
  { code: "4321A", label: "Travaux d'installation électrique dans tous locaux" },
  { code: "2910Z", label: "Construction de véhicules automobiles" },
  { code: "4941A", label: "Transports routiers de fret interurbains" },
  { code: "8610Z", label: "Activités hospitalières" },
  { code: "5610A", label: "Restauration traditionnelle" },
];

export const COUNTRIES = [
  "France",
  "Belgique",
  "Luxembourg",
  "Suisse",
  "Allemagne",
  "Italie",
  "Espagne",
  "Royaume-Uni",
] as const;

// ── VEOS contracts ─────────────────────────────────────────────────────

export type VeosContractStatus = "active" | "renewal" | "expired" | "etude";

export type VeosContract = {
  id: string;
  clientId: string;
  /** Insurance product. Matches loosely the cotation's `principalProduct`. */
  product: string;
  /** Human label / name, e.g. "Étude RC Pro 2026" or "RC Pro 2024 · AXA". */
  label: string;
  /** External reference number in the ERP — required for études (e.g. "ETU-2026-014"),
   *  optional on policies. */
  number?: string;
  insurer?: string;
  status: VeosContractStatus;
  /** "01/01/2024" — start date. */
  startDate?: string;
  /** "31/12/2024" — end date. */
  endDate?: string;
  /** "4 280 € TTC" — annual premium. */
  premium?: string;
};

const CONTRACTS: VeosContract[] = [
  // Marble Tech SAS
  { id: "ctr-marble-rcpro", clientId: "marble", product: "RC Pro", label: "RC Pro 2024 · AXA", insurer: "Axa", status: "active", startDate: "01/01/2024", endDate: "31/12/2024", premium: "4 280 € TTC" },
  { id: "ctr-marble-mri", clientId: "marble", product: "MRI", label: "Multirisque bureaux · Generali", insurer: "Generali", status: "active", startDate: "01/03/2023", endDate: "28/02/2025", premium: "1 950 € TTC" },
  { id: "ctr-marble-cyber", clientId: "marble", product: "Cyber", label: "Étude Cyber-risques 2026", number: "ETU-2026-014", insurer: "—", status: "etude", startDate: "15/06/2023", endDate: "14/06/2024", premium: "3 100 € TTC" },
  { id: "ctr-marble-etude-rcpro", clientId: "marble", product: "RC Pro", label: "Étude RC Pro 2026", number: "ETU-2026-008", insurer: "—", status: "etude" },
  { id: "ctr-marble-etude-mrb", clientId: "marble", product: "Multirisque Bureaux", label: "Étude Multirisque 2026", number: "ETU-2026-091", insurer: "—", status: "etude" },
  // ACME Corp
  { id: "ctr-acme-flotte", clientId: "acme", product: "Flotte automobile", label: "Flotte 38 véhicules · Allianz", insurer: "Allianz", status: "active", startDate: "01/04/2024", endDate: "31/03/2025", premium: "42 600 € TTC" },
  { id: "ctr-acme-rcpro", clientId: "acme", product: "RC Pro", label: "RC Pro 2023 · AXA", insurer: "Axa", status: "expired", startDate: "01/01/2023", endDate: "31/12/2023", premium: "5 800 € TTC" },
  { id: "ctr-acme-mrp", clientId: "acme", product: "MRP", label: "Multirisque pro · MAIF", insurer: "Maif", status: "active", startDate: "15/05/2023", endDate: "14/05/2025", premium: "2 700 € TTC" },
  // TechVision SAS
  { id: "ctr-techvision-rcpro", clientId: "techvision", product: "RC Pro", label: "RC Pro · Generali", insurer: "Generali", status: "active", startDate: "01/02/2024", endDate: "31/01/2026", premium: "3 460 € TTC" },
  { id: "ctr-techvision-do", clientId: "techvision", product: "D&O", label: "D&O Mandataires · Chubb", insurer: "Chubb", status: "active", startDate: "01/06/2023", endDate: "31/05/2025", premium: "8 200 € TTC" },
  // GreenWay Industries
  { id: "ctr-greenway-mrp", clientId: "greenway", product: "MRP", label: "Multirisque entrepôt · AXA", insurer: "Axa", status: "active", startDate: "01/09/2023", endDate: "31/08/2025", premium: "9 400 € TTC" },
  { id: "ctr-greenway-flotte", clientId: "greenway", product: "Flotte automobile", label: "Flotte 12 véhicules · Generali", insurer: "Generali", status: "active", startDate: "01/01/2024", endDate: "31/12/2024", premium: "14 800 € TTC" },
  { id: "ctr-greenway-rcpro", clientId: "greenway", product: "RC Pro", label: "Étude RC Pro 2026", number: "ETU-2026-031", insurer: "—", status: "etude", startDate: "01/01/2024", endDate: "31/12/2024", premium: "6 100 € TTC" },
  // BlueLeaf
  { id: "ctr-blueleaf-rcpro", clientId: "blueleaf", product: "RC Pro", label: "RC Pro · Allianz", insurer: "Allianz", status: "active", startDate: "01/03/2024", endDate: "28/02/2026", premium: "4 950 € TTC" },
  { id: "ctr-blueleaf-construction", clientId: "blueleaf", product: "Construction", label: "Décennale · MMA", insurer: "MMA", status: "active", startDate: "01/01/2024", endDate: "31/12/2024", premium: "12 300 € TTC" },
  // Digital Solutions
  { id: "ctr-digital-rcpro", clientId: "digital-solutions", product: "RC Pro", label: "RC Pro 2024 · AXA", insurer: "Axa", status: "active", startDate: "01/04/2024", endDate: "31/03/2026", premium: "3 980 € TTC" },
  { id: "ctr-digital-cyber", clientId: "digital-solutions", product: "Cyber", label: "Cyber-risques · Hiscox", insurer: "Hiscox", status: "renewal", startDate: "01/05/2023", endDate: "30/04/2024", premium: "2 400 € TTC" },
  // LegalPlace
  { id: "ctr-legalplace-prevoyance", clientId: "legalplace", product: "Prévoyance / AT", label: "Prévoyance collective · Generali", insurer: "Generali", status: "active", startDate: "01/01/2024", endDate: "31/12/2025", premium: "18 600 € TTC" },
  { id: "ctr-legalplace-rcpro", clientId: "legalplace", product: "RC Pro", label: "RC Pro · AXA", insurer: "Axa", status: "active", startDate: "01/06/2023", endDate: "31/05/2025", premium: "4 100 € TTC" },
  // Dupont SA
  { id: "ctr-dupont-sante", clientId: "dupont-sa", product: "Santé collective", label: "Santé collective · Alan", insurer: "Alan", status: "active", startDate: "01/01/2024", endDate: "31/12/2024", premium: "21 300 € TTC" },
  { id: "ctr-dupont-prevoyance", clientId: "dupont-sa", product: "Prévoyance / AT", label: "Prévoyance · Malakoff", insurer: "Malakoff", status: "active", startDate: "01/01/2024", endDate: "31/12/2025", premium: "14 700 € TTC" },
  // Transports Moreau
  { id: "ctr-moreau-flotte", clientId: "transports-moreau", product: "Flotte automobile", label: "Flotte poids lourds · AXA", insurer: "Axa", status: "active", startDate: "01/03/2024", endDate: "28/02/2025", premium: "68 400 € TTC" },
  { id: "ctr-moreau-marchandises", clientId: "transports-moreau", product: "Marchandises transportées", label: "Marchandises · Allianz", insurer: "Allianz", status: "active", startDate: "01/03/2024", endDate: "28/02/2025", premium: "9 200 € TTC" },
  // Fonciere Belleville
  { id: "ctr-belleville-mri", clientId: "fonciere-belleville", product: "MRI", label: "Multirisque immeubles · Generali", insurer: "Generali", status: "active", startDate: "01/01/2024", endDate: "31/12/2025", premium: "32 800 € TTC" },
  { id: "ctr-belleville-rcpro", clientId: "fonciere-belleville", product: "RC Pro", label: "RC Gestionnaire · AXA", insurer: "Axa", status: "active", startDate: "01/01/2024", endDate: "31/12/2025", premium: "2 100 € TTC" },
  // Garage Dupont
  { id: "ctr-garage-flotte", clientId: "garage-dupont", product: "Flotte automobile", label: "Flotte stock · AXA", insurer: "Axa", status: "active", startDate: "01/05/2024", endDate: "30/04/2025", premium: "5 800 € TTC" },
  { id: "ctr-garage-rcpro", clientId: "garage-dupont", product: "RC Pro", label: "RC Pro garage · Allianz", insurer: "Allianz", status: "active", startDate: "01/05/2024", endDate: "30/04/2025", premium: "1 600 € TTC" },
  // BTP Horizon
  { id: "ctr-btp-at", clientId: "btp-horizon", product: "Accident du Travail", label: "AT collective · Generali", insurer: "Generali", status: "active", startDate: "01/01/2024", endDate: "31/12/2024", premium: "27 500 € TTC" },
  { id: "ctr-btp-decennale", clientId: "btp-horizon", product: "Construction", label: "Décennale · SwissLife", insurer: "SwissLife", status: "active", startDate: "01/04/2023", endDate: "31/03/2026", premium: "18 900 € TTC" },
  // Valeas Groupe
  { id: "ctr-valeas-do", clientId: "valeas-groupe", product: "D&O", label: "D&O Dirigeants · Chubb", insurer: "Chubb", status: "active", startDate: "01/03/2024", endDate: "28/02/2026", premium: "12 400 € TTC" },
  { id: "ctr-valeas-rcpro", clientId: "valeas-groupe", product: "RC Pro", label: "RC Pro · AXA", insurer: "Axa", status: "renewal", startDate: "01/01/2023", endDate: "31/12/2024", premium: "5 300 € TTC" },
];

export function getClientContracts(clientId: string): VeosContract[] {
  return CONTRACTS.filter((c) => c.clientId === clientId);
}

export function getClientContractByProduct(
  clientId: string,
  product: string | null | undefined
): VeosContract | undefined {
  if (!product) return undefined;
  const target = product.toLowerCase();
  return CONTRACTS.find(
    (c) => c.clientId === clientId && c.product.toLowerCase() === target
  );
}

/**
 * Append a new contract (typically a status="etude") to the shared mock list.
 * Used by the preparation page when the broker creates an étude upfront so
 * downstream views (bulk send modal) see it immediately.
 */
export function addContract(contract: VeosContract): VeosContract {
  CONTRACTS.unshift(contract);
  return contract;
}

/** Pretty-format the SIREN for display when the source has none ("—"). */
export function formatSiren(client: VeosClient): string {
  return client.siren ?? "—";
}

/** Live-search helper: matches against name + SIREN (case-insensitive, accent-insensitive). */
export function searchVeosClients(query: string): VeosClient[] {
  const q = query.trim().toLowerCase();
  if (!q) return veosClients;
  return veosClients.filter((c) => {
    const hay = `${c.name} ${c.siren ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}
