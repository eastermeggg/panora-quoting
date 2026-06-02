// In-memory + sessionStorage store of generated documents per cotation.
// Backs the "Documents générés" panel in the Présenter tab and the artifact
// cards rendered in chat.

export type GeneratedDocType =
  | "email"
  | "ppt"
  | "synthese_interne"
  | "lettre"
  | "sms"
  | "autre";

export type GeneratedDoc = {
  id: string;
  cotParamId: string;
  docType: GeneratedDocType;
  title: string;
  body: string;
  createdAt: string; // ISO
};

const STORAGE_KEY_PREFIX = "panora-generated-docs";
const memoryStore = new Map<string, GeneratedDoc[]>();

function storageKey(cotParamId: string): string {
  return `${STORAGE_KEY_PREFIX}-${cotParamId}`;
}

function safeReadSession(cotParamId: string): GeneratedDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(storageKey(cotParamId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteSession(cotParamId: string, docs: GeneratedDoc[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey(cotParamId), JSON.stringify(docs));
  } catch {
    // quota — silent degrade
  }
}

function loadIntoMemory(cotParamId: string): GeneratedDoc[] {
  const cached = memoryStore.get(cotParamId);
  if (cached) return cached;
  const fromSession = safeReadSession(cotParamId);
  memoryStore.set(cotParamId, fromSession);
  return fromSession;
}

export function listGeneratedDocs(cotParamId: string): GeneratedDoc[] {
  return loadIntoMemory(cotParamId);
}

export function addGeneratedDoc(
  cotParamId: string,
  doc: Omit<GeneratedDoc, "id" | "cotParamId" | "createdAt">,
): GeneratedDoc {
  const full: GeneratedDoc = {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cotParamId,
    createdAt: new Date().toISOString(),
    ...doc,
  };
  const current = loadIntoMemory(cotParamId);
  const next = [full, ...current];
  memoryStore.set(cotParamId, next);
  safeWriteSession(cotParamId, next);
  return full;
}

export function getGeneratedDoc(cotParamId: string, docId: string): GeneratedDoc | undefined {
  return loadIntoMemory(cotParamId).find((d) => d.id === docId);
}

export function deleteGeneratedDoc(cotParamId: string, docId: string): void {
  const current = loadIntoMemory(cotParamId);
  const next = current.filter((d) => d.id !== docId);
  if (next.length === current.length) return;
  memoryStore.set(cotParamId, next);
  safeWriteSession(cotParamId, next);
}

/** Resolve a friendly file-type label for display in the artifact card. */
export function docTypeFileLabel(t: GeneratedDocType): string {
  switch (t) {
    case "email": return "E-mail · Texte";
    case "ppt": return "Présentation · PowerPoint";
    case "synthese_interne": return "Synthèse · Document";
    case "lettre": return "Lettre · Word";
    case "sms": return "SMS · Texte";
    default: return "Document";
  }
}

/** A "filename" for the artifact, based on doc type + client + date. */
export function suggestFileName(
  docType: GeneratedDocType,
  clientName: string,
): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const slug = clientName.replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 30);
  const ext = docType === "ppt" ? "pptx" : docType === "lettre" || docType === "synthese_interne" ? "docx" : "txt";
  const root = docType === "email" ? "Email" : docType === "ppt" ? "Pitch" : docType === "synthese_interne" ? "Synthese_interne" : docType === "lettre" ? "Lettre" : docType === "sms" ? "SMS" : "Document";
  return `${root}_${slug}_${date}.${ext}`;
}

export function isPreviewable(docType: GeneratedDocType): boolean {
  // PPT exports as a slide outline, but we don't ship a real slide preview.
  return docType !== "ppt";
}
