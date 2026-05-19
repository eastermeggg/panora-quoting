// ── Types ──

export type IntegrationCategory = "erp_crm" | "email";

export type IntegrationStatus =
  | "not_configured"
  | "connected"
  | "coming_soon";

export type IntegrationAvailability = "available" | "coming_soon";

export type Integration = {
  id: string;
  name: string;
  category: IntegrationCategory;
  logoSrc: string;
  availability: IntegrationAvailability;
  /** Short marketing tagline, used inside catalog rows and modals */
  description?: string;
};

/** Connection record for a configured integration. Mirrors what the user actually set up. */
export type IntegrationConnection = {
  integrationId: string;
  status: Exclude<IntegrationStatus, "coming_soon">;
  /** The login or account identifier shown next to the status (e.g. "Token actif" or an email). */
  accountLabel?: string;
  /** Pre-rendered “Il y a 2 min” style label. */
  lastSyncLabel?: string;
  connectedAt?: string;
};

// ── Catalog ──

export const integrationsCatalog: Integration[] = [
  {
    id: "veos",
    name: "Veos / IGA",
    category: "erp_crm",
    logoSrc: "/logos/veos.svg",
    availability: "available",
    description:
      "Synchronisez les données clients, contrats et documents avec votre ERP IGA Veos.",
  },
  {
    id: "excalibur",
    name: "Excalibur",
    category: "erp_crm",
    logoSrc: "/logos/excalibur.svg",
    availability: "coming_soon",
  },
  {
    id: "outlook",
    name: "Outlook",
    category: "email",
    logoSrc: "/logos/outlook.svg",
    availability: "coming_soon",
  },
];

// ── Section copy ──

export const integrationSectionCopy: Record<
  IntegrationCategory,
  { title: string; description: string }
> = {
  erp_crm: {
    title: "ERP & CRM",
    description:
      "Récupérez les informations client, documents et historique existants — et repoussez les devis, contrats et pièces générées.",
  },
  email: {
    title: "Messagerie e-mail",
    description:
      "Permet aux agents de détecter automatiquement les demandes de cotation et d'agir de façon proactive.",
  },
};

// ── Live state ──

/**
 * Module-level mutable connection list — shared across pages so that the
 * comparison / quote surfaces can see when the user just connected an
 * integration in Settings without prop-drilling or a global store.
 *
 * VEOS is pre-connected by default for demo purposes so reviewers see the
 * full ERP experience (Send-to-VEOS modals, footer pills, etc.) without
 * having to walk through the configuration flow first. Disconnect from
 * Settings · Intégrations to exercise the "not connected" state.
 */
export const currentConnections: IntegrationConnection[] = [
  {
    integrationId: "veos",
    status: "connected",
    accountLabel: "Token actif",
    lastSyncLabel: "Dernière sync · Il y a 2 min",
    connectedAt: "2026-05-18",
  },
];

export function isIntegrationConnected(integrationId: string): boolean {
  return currentConnections.some(
    (c) => c.integrationId === integrationId && c.status === "connected"
  );
}

export function setIntegrationConnection(next: IntegrationConnection): void {
  const idx = currentConnections.findIndex(
    (c) => c.integrationId === next.integrationId
  );
  if (idx >= 0) currentConnections[idx] = next;
  else currentConnections.push(next);
}

export function removeIntegrationConnection(integrationId: string): void {
  const idx = currentConnections.findIndex(
    (c) => c.integrationId === integrationId
  );
  if (idx >= 0) currentConnections.splice(idx, 1);
}

// ── Modal copy ──

export type VeosBenefit = {
  icon: "users" | "files" | "refresh" | "database";
  title: string;
  description: string;
};

export const veosBenefits: VeosBenefit[] = [
  {
    icon: "users",
    title: "Données clients synchronisées",
    description:
      "Identité, adresses, KBIS, contacts — récupérés automatiquement depuis votre ERP.",
  },
  {
    icon: "files",
    title: "Documents & contrats",
    description: "Identité, adresses, contacts récupérés depuis VEOS.",
  },
  {
    icon: "refresh",
    title: "Repoussez dans VEOS",
    description:
      "Devis, comparatifs et devoirs de conseil archivés dans votre ERP après génération.",
  },
  {
    icon: "database",
    title: "Source de vérité unique",
    description: "Vos deux systèmes restent alignés.",
  },
];
