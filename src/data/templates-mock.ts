// Document templates — broker-uploaded export templates.
// One source of data, two renders: this is the template (structure + branding)
// that gets composed with the dossier at export time.
// Templates are tagged with one or more product labels — at export time we
// match against the comparison's principal product.

export type FileFormat = "pdf" | "docx" | "pptx";

export type ExtractionWarning = {
  id: string;
  severity: "info" | "warning";
  message: string;
};

export type TemplateExtraction = {
  status: "pending" | "processing" | "ready" | "failed";
  warnings: ExtractionWarning[];
};

export type PreviewVariant =
  | "proposal"
  | "synthesis"
  | "presentation"
  | "legal"
  | "fleet"
  | "sante"
  | "default";

export type DocumentTemplate = {
  id: string;
  cabinetId: string;
  name: string;
  fileFormat: FileFormat;
  fileSize: number; // bytes, for display
  /** Product labels this template applies to (matches comparison's principalProduct) */
  products: string[];
  /** Free-form type tag (Proposition, Synthèse, Devoir de conseil, …). User-creatable. */
  type?: string;
  extraction: TemplateExtraction;
  exportFormats: FileFormat[];
  createdAt: string; // ISO
  lastUsedAt: string | null;
  /** Visual layout cue for the thumbnail preview */
  previewVariant?: PreviewVariant;
  /** Optional accent color for the preview (hex) */
  previewAccent?: string;
};

const CABINET_ID = "howden";

// Canonical product tag options — match common ComparisonTask.principalProduct values.
export const PRODUCT_TAG_OPTIONS: string[] = [
  "RC Pro",
  "Cyber",
  "D&O",
  "Santé collective",
  "Prévoyance / AT",
  "Flotte automobile",
  "Auto",
  "MRI",
  "MRP",
  "Décennale",
  "PJ",
  "Homme clé",
  "Marchandises transportées",
  "Bris de machine",
  "Perte d'exploitation",
  "Construction",
];

// Default type suggestions — broker can create new types freely.
export const DEFAULT_TYPE_OPTIONS: string[] = [
  "Proposition",
  "Synthèse",
  "Devoir de conseil",
  "Présentation client",
  "Étude",
  "Comparatif",
];

// ── Seeded templates ──────────────────────────────────────────────

export const documentTemplatesMock: DocumentTemplate[] = [
  {
    id: "tpl-proposition-pme",
    cabinetId: CABINET_ID,
    name: "Proposition standard PME",
    fileFormat: "pdf",
    fileSize: 412_000,
    products: ["RC Pro", "Cyber", "MRI", "MRP"],
    type: "Proposition",
    exportFormats: ["pdf"],
    createdAt: "2026-02-12T09:30:00Z",
    lastUsedAt: "2026-04-28T14:12:00Z",
    extraction: { status: "ready", warnings: [] },
    previewVariant: "proposal",
    previewAccent: "#1a3a52",
  },
  {
    id: "tpl-synthese-rapide",
    cabinetId: CABINET_ID,
    name: "Synthèse rapide (1 page)",
    fileFormat: "docx",
    fileSize: 58_000,
    products: ["RC Pro", "Cyber", "D&O"],
    type: "Synthèse",
    exportFormats: ["docx", "pdf"],
    createdAt: "2026-03-04T11:00:00Z",
    lastUsedAt: "2026-04-30T08:55:00Z",
    extraction: { status: "ready", warnings: [] },
    previewVariant: "synthesis",
    previewAccent: "#00a272",
  },
  {
    id: "tpl-presentation-luxe",
    cabinetId: CABINET_ID,
    name: "Présentation client — Premium",
    fileFormat: "pptx",
    fileSize: 1_240_000,
    products: ["D&O", "RC Pro"],
    type: "Présentation client",
    exportFormats: ["pptx", "pdf"],
    createdAt: "2026-01-18T16:45:00Z",
    lastUsedAt: null,
    extraction: { status: "ready", warnings: [] },
    previewVariant: "presentation",
    previewAccent: "#0e2a3f",
  },
  {
    id: "tpl-devoir-conseil-std",
    cabinetId: CABINET_ID,
    name: "Devoir de conseil — modèle légal",
    fileFormat: "pdf",
    fileSize: 218_000,
    products: ["RC Pro", "Cyber", "D&O", "Santé collective", "Prévoyance / AT"],
    type: "Devoir de conseil",
    exportFormats: ["pdf"],
    createdAt: "2025-11-22T10:00:00Z",
    lastUsedAt: "2026-04-22T09:30:00Z",
    extraction: { status: "ready", warnings: [] },
    previewVariant: "legal",
    previewAccent: "#22201a",
  },
  {
    id: "tpl-sante-collective",
    cabinetId: CABINET_ID,
    name: "Synthèse Santé collective",
    fileFormat: "docx",
    fileSize: 92_000,
    products: ["Santé collective", "Prévoyance / AT"],
    type: "Synthèse",
    exportFormats: ["docx", "pdf"],
    createdAt: "2026-02-28T10:00:00Z",
    lastUsedAt: "2026-04-25T15:20:00Z",
    extraction: { status: "ready", warnings: [] },
    previewVariant: "sante",
    previewAccent: "#cb8052",
  },
  {
    id: "tpl-flotte",
    cabinetId: CABINET_ID,
    name: "Étude flotte — multi-entité",
    fileFormat: "pdf",
    fileSize: 540_000,
    products: ["Flotte automobile", "Auto"],
    type: "Étude",
    exportFormats: ["pdf"],
    createdAt: "2026-03-15T09:00:00Z",
    lastUsedAt: "2026-04-19T11:45:00Z",
    extraction: { status: "ready", warnings: [] },
    previewVariant: "fleet",
    previewAccent: "#1a3a52",
  },
];

// ── In-memory store + helpers ─────────────────────────────────────

let templatesStore: DocumentTemplate[] = [...documentTemplatesMock];

export function getDocumentTemplates(): DocumentTemplate[] {
  return templatesStore;
}

export function getTemplateById(id: string): DocumentTemplate | undefined {
  return templatesStore.find((t) => t.id === id);
}

export function addTemplate(t: DocumentTemplate): void {
  templatesStore = [t, ...templatesStore];
}

export function updateTemplate(id: string, patch: Partial<DocumentTemplate>): void {
  templatesStore = templatesStore.map((t) =>
    t.id === id ? { ...t, ...patch } : t
  );
}

export function deleteTemplate(id: string): void {
  templatesStore = templatesStore.filter((t) => t.id !== id);
}

// ── Product matching ──────────────────────────────────────────────

export function getTemplatesForProduct(productLabel: string | null | undefined): DocumentTemplate[] {
  if (!productLabel) {
    return [...templatesStore]
      .filter((t) => t.extraction.status === "ready")
      .sort((a, b) => {
        const aDate = a.lastUsedAt ?? a.createdAt;
        const bDate = b.lastUsedAt ?? b.createdAt;
        return bDate.localeCompare(aDate);
      })
      .slice(0, 4);
  }
  return templatesStore
    .filter(
      (t) => t.extraction.status === "ready" && t.products.includes(productLabel)
    )
    .sort((a, b) => {
      const aDate = a.lastUsedAt ?? a.createdAt;
      const bDate = b.lastUsedAt ?? b.createdAt;
      return bDate.localeCompare(aDate);
    })
    .slice(0, 4);
}

// ── Simulated extraction for new uploads ──────────────────────────

const PROCESSING_DURATION_MS = 2500;

export function simulateExtraction(
  templateId: string,
  shouldFail: boolean,
  onUpdate: (template: DocumentTemplate) => void
): () => void {
  const timeout = setTimeout(() => {
    const current = getTemplateById(templateId);
    if (!current) return;
    if (shouldFail) {
      const updated: DocumentTemplate = {
        ...current,
        extraction: {
          status: "failed",
          warnings: [
            {
              id: "fail-1",
              severity: "warning",
              message:
                "L'extraction a échoué — fichier non lisible ou corrompu. Réessayez ou contactez le support.",
            },
          ],
        },
      };
      updateTemplate(templateId, { extraction: updated.extraction });
      onUpdate(updated);
      return;
    }
    const updated: DocumentTemplate = {
      ...current,
      extraction: { status: "ready", warnings: [] },
    };
    updateTemplate(templateId, { extraction: updated.extraction });
    onUpdate(updated);
  }, PROCESSING_DURATION_MS);
  return () => clearTimeout(timeout);
}

export function makePendingTemplate(args: {
  name: string;
  fileFormat: FileFormat;
  fileSize: number;
  products?: string[];
  type?: string;
}): DocumentTemplate {
  const id = `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    cabinetId: CABINET_ID,
    name: args.name,
    fileFormat: args.fileFormat,
    fileSize: args.fileSize,
    products: args.products ?? [],
    type: args.type,
    exportFormats:
      args.fileFormat === "pdf"
        ? ["pdf"]
        : args.fileFormat === "docx"
          ? ["docx", "pdf"]
          : ["pptx", "pdf"],
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    extraction: {
      status: "processing",
      warnings: [],
    },
  };
}

// ── Type registry — defaults + types currently in use across the cabinet ─

export function getKnownTypes(): string[] {
  const inUse = new Set<string>();
  templatesStore.forEach((t) => {
    if (t.type) inUse.add(t.type);
  });
  // Merge defaults + cabinet-created types, preserve insertion order, dedupe
  const merged: string[] = [];
  for (const t of [...DEFAULT_TYPE_OPTIONS, ...inUse]) {
    if (!merged.includes(t)) merged.push(t);
  }
  return merged;
}

// ── Filename heuristics — auto-detect type + products on upload ──

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const TYPE_KEYWORDS: { type: string; matchers: RegExp[] }[] = [
  { type: "Devoir de conseil", matchers: [/devoir/i, /\bdda\b/i, /\bconseil\b/i] },
  { type: "Présentation client", matchers: [/presentation/i, /\bpitch\b/i, /\bclient\b.*\bpremium\b/i] },
  { type: "Synthèse", matchers: [/synthese/i, /\bresume\b/i, /\bbref\b/i] },
  { type: "Comparatif", matchers: [/comparatif/i, /comparaison/i, /\bcompare\b/i] },
  { type: "Étude", matchers: [/etude/i, /\banalyse\b/i, /audit/i] },
  { type: "Proposition", matchers: [/proposition/i, /\boffre\b/i, /\bdevis\b/i] },
];

const PRODUCT_KEYWORDS: { product: string; matchers: RegExp[] }[] = [
  { product: "RC Pro", matchers: [/rc[\s_-]?pro/i, /responsabilite/i] },
  { product: "Cyber", matchers: [/cyber/i] },
  { product: "D&O", matchers: [/\bd[\s_-]?[&et][\s_-]?o\b/i, /dirigeant/i, /\bdno\b/i] },
  { product: "Santé collective", matchers: [/sante.*coll/i, /\bsante\b/i, /\bmutuelle\b/i] },
  { product: "Prévoyance / AT", matchers: [/prevoyance/i, /\bat\b/i] },
  { product: "Flotte automobile", matchers: [/flotte/i] },
  { product: "Auto", matchers: [/\bauto\b/i, /\bvehicule\b/i] },
  { product: "MRI", matchers: [/\bmri\b/i, /multirisque[\s_-]?immeuble/i] },
  { product: "MRP", matchers: [/\bmrp\b/i, /multirisque[\s_-]?pro/i] },
  { product: "Décennale", matchers: [/decennale/i] },
  { product: "Construction", matchers: [/construction/i, /chantier/i] },
  { product: "Marchandises transportées", matchers: [/marchandise/i, /transport/i] },
  { product: "Bris de machine", matchers: [/bris[\s_-]?(de|d)?[\s_-]?machine/i] },
  { product: "Perte d'exploitation", matchers: [/perte.*exploit/i, /\bpe\b/i] },
  { product: "PJ", matchers: [/\bpj\b/i, /protection[\s_-]?juridique/i] },
  { product: "Homme clé", matchers: [/homme[\s_-]?cle/i] },
];

export function guessTypeFromFilename(name: string): string | undefined {
  const n = normalize(name);
  for (const { type, matchers } of TYPE_KEYWORDS) {
    if (matchers.some((re) => re.test(n))) return type;
  }
  return undefined;
}

export function guessProductsFromFilename(name: string): string[] {
  const n = normalize(name);
  const found: string[] = [];
  for (const { product, matchers } of PRODUCT_KEYWORDS) {
    if (matchers.some((re) => re.test(n)) && !found.includes(product)) {
      found.push(product);
    }
  }
  return found;
}
