// Chat copilote mock — pattern-matches keywords to canned responses.
// Two modes mixed by intent: edit-synthese (Mode A) and Q&A on offers (Mode B).
// Iteration 01 adds: multi-turn "add row" conversation (Mode C).

import type { InsurerData, GuaranteeRow } from "./mock";
import {
  matchReference,
  buildRowFromReference,
  buildRowFromFreeDescription,
  type DOReferenceEntry,
} from "./doReferenceCatalog";
import {
  addGeneratedDoc,
  suggestFileName,
  type GeneratedDocType,
} from "./generatedDocsStore";

export type ChatMessageRole = "user" | "assistant";

export type SyntheseEditField = "recommendation" | "argumentaire" | "criteriaRow";

export type SyntheseEdit = {
  field: SyntheseEditField;
  before: string;
  after: string;
  status: "proposed" | "accepted" | "rejected";
};

/** Multi-turn add-row conversation flow markers. */
export type SectionPath = { productIndex: number; subGroupIndex: number; sectionTitle: string };

export type AwaitingFollowup =
  | { kind: "add_row_name"; sectionPath: SectionPath }
  | { kind: "add_row_description"; sectionPath: SectionPath; candidateLabel: string }
  | { kind: "doc_type"; intentSeed?: string }
  | { kind: "doc_template"; docType: string };

export type ProposedDocDraft = {
  docType: string;
  title: string;
  body: string;
  /** Set after the draft is saved to the generated-docs store. */
  docId?: string;
  /** Suggested filename based on type + client. */
  fileName?: string;
};

export type ProposedRowAddition = {
  sectionPath: SectionPath;
  row: GuaranteeRow;
  /** True if the row was matched in the D&O reference catalog (high confidence). */
  isReferenceMatch: boolean;
  /** Reference entry id if matched (for the audit log). */
  referenceId?: string;
  status: "proposed" | "accepted" | "rejected";
};

export type ChatAttachment = {
  name: string;
  size: number; // bytes
  type: string; // mime
};

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  citedOffers?: string[];
  attachments?: ChatAttachment[];
  proposedSyntheseEdit?: SyntheseEdit;
  /** If set, the next user message will be routed based on this marker. */
  awaitingFollowup?: AwaitingFollowup;
  /** If set, this message proposes a new row to the grid (chat side of the diff). */
  proposedRowAddition?: ProposedRowAddition;
  /** If set, this message contains a generated document draft (email / PPT / synthèse / etc.). */
  proposedDocDraft?: ProposedDocDraft;
  createdAt: string; // ISO
};

export type ComparisonChatSession = {
  id: string;
  quoteId: string;
  messages: ChatMessage[];
  syntheseEditHistory: SyntheseEdit[];
};

export type ChatContext = {
  cotParamId: string;
  productLabel: string;
  insurers: InsurerData[];
  /** Whole synthèse document content — chat edits replace this in full */
  currentContent: string;
  recommendedInsurerId: string | null;
  /** Standalone Chat tab: a "generate document" message produces a draft in one shot. */
  oneShotDoc?: boolean;
};

// ── In-memory store keyed by cotParamId ───────────────────────────

const sessionStore = new Map<string, ComparisonChatSession>();

export function getChatSession(cotParamId: string): ComparisonChatSession {
  let session = sessionStore.get(cotParamId);
  if (!session) {
    session = {
      id: `chat-${cotParamId}`,
      quoteId: cotParamId,
      messages: [],
      syntheseEditHistory: [],
    };
    sessionStore.set(cotParamId, session);
  }
  return session;
}

export function appendChatMessage(cotParamId: string, message: ChatMessage): void {
  const session = getChatSession(cotParamId);
  session.messages = [...session.messages, message];
  sessionStore.set(cotParamId, session);
}

export function recordSyntheseEdit(cotParamId: string, edit: SyntheseEdit): void {
  const session = getChatSession(cotParamId);
  session.syntheseEditHistory = [...session.syntheseEditHistory, edit];
  sessionStore.set(cotParamId, session);
}

export function updateSyntheseEditStatus(
  cotParamId: string,
  before: string,
  status: "accepted" | "rejected"
): void {
  const session = getChatSession(cotParamId);
  session.messages = session.messages.map((m) =>
    m.proposedSyntheseEdit && m.proposedSyntheseEdit.before === before
      ? {
          ...m,
          proposedSyntheseEdit: { ...m.proposedSyntheseEdit, status },
        }
      : m
  );
  session.syntheseEditHistory = session.syntheseEditHistory.map((e) =>
    e.before === before ? { ...e, status } : e
  );
  sessionStore.set(cotParamId, session);
}

// ── Synthesis override store (broker edits to the synthèse document) ─

type SynthesisOverride = {
  /** Whole synthèse document — plain text with paragraph breaks */
  content?: string;
};

const overrideStore = new Map<string, SynthesisOverride>();

export function getSynthesisOverride(cotParamId: string): SynthesisOverride {
  return overrideStore.get(cotParamId) ?? {};
}

export function setSynthesisOverride(
  cotParamId: string,
  patch: SynthesisOverride
): void {
  const current = getSynthesisOverride(cotParamId);
  overrideStore.set(cotParamId, { ...current, ...patch });
}

// ── Multi-turn add-row flow (iteration 01) ────────────────────────

/** Find the active follow-up marker from the last assistant message in the session. */
function getActiveFollowup(cotParamId: string): AwaitingFollowup | null {
  const session = getChatSession(cotParamId);
  for (let i = session.messages.length - 1; i >= 0; i--) {
    const m = session.messages[i];
    if (m.role === "assistant" && m.awaitingFollowup) return m.awaitingFollowup;
    if (m.role === "assistant") return null; // most recent assistant message had no follow-up
  }
  return null;
}

/**
 * Inject the initial agent message that kicks off an add-row conversation,
 * scoped to a specific section. Called when the broker clicks "+" in a
 * guarantee subgroup.
 */
export function triggerAddRowConversation(
  cotParamId: string,
  sectionPath: SectionPath,
): ChatMessage {
  const msg: ChatMessage = {
    id: `msg-${Date.now()}-trigger`,
    role: "assistant",
    content: `Quelle garantie souhaitez-vous ajouter dans **${sectionPath.sectionTitle}** ?\n\nVous pouvez taper un nom (ex. *« période de découverte »*) ou décrire la garantie en quelques mots.`,
    awaitingFollowup: { kind: "add_row_name", sectionPath },
    createdAt: new Date().toISOString(),
  };
  appendChatMessage(cotParamId, msg);
  return msg;
}

/**
 * Inject the initial agent message for the custom document generation flow,
 * triggered from the Présenter tab. The flow always asks the broker for a
 * template/model before generating — that's the qualification.
 *
 * If an `intentSeed` is provided (broker picked a suggestion like "E-mail au
 * client"), we skip the type qualification step and go straight to the
 * template question.
 */
export function triggerCustomDocConversation(
  cotParamId: string,
  intentSeed?: string,
): ChatMessage {
  if (intentSeed) {
    const docType = inferDocType(intentSeed);
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-doc-template`,
      role: "assistant",
      content: `Très bien — je vais préparer **${docTypeLabel(docType)}**. Avez-vous un modèle ou une trame existante à suivre ? Vous pouvez coller un exemple, décrire le ton et la structure souhaités, ou répondre *« non »* pour que je parte d'un format standard.`,
      awaitingFollowup: { kind: "doc_template", docType },
      createdAt: new Date().toISOString(),
    };
    appendChatMessage(cotParamId, msg);
    return msg;
  }

  const msg: ChatMessage = {
    id: `msg-${Date.now()}-doc-type`,
    role: "assistant",
    content: `Quel type de document souhaitez-vous générer ?\n\nExemples : *e-mail au client, présentation PowerPoint, synthèse interne, lettre d'accompagnement, support pour la réunion de présentation…* — précisez ce qu'il vous faut.`,
    awaitingFollowup: { kind: "doc_type" },
    createdAt: new Date().toISOString(),
  };
  appendChatMessage(cotParamId, msg);
  return msg;
}

function inferDocType(s: string): string {
  const p = lower(s);
  if (p.includes("email") || p.includes("e-mail") || p.includes("mail")) return "email";
  if (p.includes("powerpoint") || p.includes("ppt") || p.includes("présentation") || p.includes("presentation") || p.includes("slide")) return "ppt";
  if (p.includes("synthèse") || p.includes("synthese") || p.includes("rapport")) return "synthese_interne";
  if (p.includes("lettre")) return "lettre";
  if (p.includes("sms")) return "sms";
  return "autre";
}

function docTypeLabel(t: string): string {
  if (t === "email") return "un e-mail";
  if (t === "ppt") return "une présentation PowerPoint";
  if (t === "synthese_interne") return "une synthèse interne";
  if (t === "lettre") return "une lettre d'accompagnement";
  if (t === "sms") return "un SMS";
  return "ce document";
}

/** Mark an in-message row proposal as accepted or rejected. */
export function updateRowProposalStatus(
  cotParamId: string,
  proposalId: string,
  status: "accepted" | "rejected",
): void {
  const session = getChatSession(cotParamId);
  session.messages = session.messages.map((m) => {
    if (m.id !== proposalId) return m;
    if (!m.proposedRowAddition) return m;
    return { ...m, proposedRowAddition: { ...m.proposedRowAddition, status } };
  });
  sessionStore.set(cotParamId, session);
}

// ── Prompt → response logic ───────────────────────────────────────

const REWRITE_TRIGGERS = ["reformule", "argumente", "met en avant", "justifie", "rédige", "réécris"];
const QA_TRIGGERS = [
  "exclusion",
  "exclusions",
  "couvre",
  "couvert",
  "franchise",
  "prime",
  "plafond",
  "garantie",
  "compare",
  "comparer",
  "différence",
  "differences",
  "perte d'exploitation",
  "cyber",
];

function lower(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function pickInsurerByMention(prompt: string, insurers: InsurerData[]): InsurerData | null {
  const p = lower(prompt);
  for (const ins of insurers) {
    if (p.includes(lower(ins.name))) return ins;
  }
  return null;
}

function mentionedInsurers(prompt: string, insurers: InsurerData[]): InsurerData[] {
  const p = lower(prompt);
  return insurers.filter((ins) => p.includes(lower(ins.name)));
}

function nearestNumberInPrompt(prompt: string): number | null {
  const m = prompt.match(/(\d{1,3}(?:[\s.,]\d{3})*|\d+)\s*(?:€|euros?)?/i);
  if (!m) return null;
  const cleaned = m[1].replace(/[\s.,]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 100 ? n : null;
}

function buildRewrite(
  prompt: string,
  ctx: ChatContext
): { content: string; edit: SyntheseEdit } {
  const recommended =
    ctx.insurers.find((i) => i.id === ctx.recommendedInsurerId) ?? ctx.insurers[0];
  const carrier = recommended?.name ?? "l'assureur retenu";
  const before = ctx.currentContent;

  const p = lower(prompt);
  const tone = p.includes("dirigeant")
    ? "dirigeant"
    : p.includes("technique")
      ? "technique"
      : p.includes("synthétique") || p.includes("court") || p.includes("rapide")
        ? "court"
        : "neutre";

  // Try to surgically swap the "## Argumentaire" markdown section if present.
  // Otherwise append a new one at the end of the document.
  const argumentaireRe = /^(##\s+Argumentaire\s*\n+)([\s\S]*?)(?=\n##\s|$)/m;
  const match = before.match(argumentaireRe);

  let newArgumentaire: string;
  switch (tone) {
    case "dirigeant":
      newArgumentaire = `Pour votre activité, **${carrier}** se distingue par la couverture la plus complète sur les risques que vous avez identifiés en priorité. La prime est compétitive (15% sous la moyenne du marché interrogé) et la franchise reste maîtrisée. C'est l'offre qui combine le mieux protection et coût pour votre profil.`;
      break;
    case "technique":
      newArgumentaire = `**${carrier}** propose un plafond RC de **2 M€** avec extensions cyber et perte d'exploitation incluses, exclusions limitées (pas d'exclusion chantier ni d'activité dérivée) et une franchise de **1 000€**. Sur les critères pondérés, c'est la combinaison la plus équilibrée.`;
      break;
    case "court":
      newArgumentaire = `**${carrier}** : meilleure couverture, prime alignée, franchise basse. Notre choix.`;
      break;
    default:
      newArgumentaire = `**${carrier}** reste notre recommandation : couverture la plus large sur le profil de risque identifié, prime compétitive et franchise maîtrisée. Aucun concurrent n'égale cette combinaison sur les devis reçus.`;
  }

  let after: string;
  if (match) {
    after = before.replace(argumentaireRe, `$1${newArgumentaire}\n\n`);
  } else {
    // No "## Argumentaire" section found — append it.
    after = `${before.trimEnd()}\n\n## Argumentaire\n\n${newArgumentaire}\n`;
  }

  return {
    content: `J'ai reformulé l'argumentaire pour mieux correspondre à votre demande. Tu peux garder cette version ou revenir en arrière.`,
    edit: { field: "argumentaire", before, after, status: "proposed" },
  };
}

function answerQA(prompt: string, ctx: ChatContext): { content: string; cited: string[] } {
  const p = lower(prompt);
  const mentioned = mentionedInsurers(prompt, ctx.insurers);

  if (p.includes("exclusion")) {
    if (mentioned.length >= 2) {
      const [a, b] = mentioned;
      return {
        content: `**${a.name}** affiche moins d'exclusions que **${b.name}** sur les devis reçus : pas d'exclusion d'activité dérivée, ni de chantier en hauteur. **${b.name}** exclut explicitement la sous-traitance non déclarée. Sur les autres clauses (cyber, perte d'exploitation), les deux assureurs sont alignés.`,
        cited: mentioned.map((m) => m.id),
      };
    }
    return {
      content: `Les exclusions varient selon les devis. **AXA** est le plus permissif (peu d'exclusions explicites), **Generali** exclut la sous-traitance non déclarée, **Solly Azar** ne couvre pas les chantiers > 8m. Dis-moi entre quelles offres tu veux comparer.`,
      cited: ctx.insurers.slice(0, 3).map((i) => i.id),
    };
  }

  if (p.includes("couvre") || p.includes("couvert") || p.includes("perte d'exploitation") || p.includes("cyber")) {
    const offer = pickInsurerByMention(prompt, ctx.insurers);
    if (offer) {
      return {
        content: `**${offer.name}** couvre l'ensemble du périmètre standard (RC Pro, défense-recours, perte d'exploitation, cyber en option). Le plafond RC est à ${offer.pricing?.[0]?.details?.[0]?.value ?? "2 M€"}.`,
        cited: [offer.id],
      };
    }
    return {
      content: `Sur la perte d'exploitation et le cyber, **AXA** et **Generali** sont les seuls à les inclure d'office. **Solly Azar** propose le cyber en option payante.`,
      cited: ctx.insurers.slice(0, 3).map((i) => i.id),
    };
  }

  if (p.includes("franchise")) {
    return {
      content: `Les franchises affichées sur les devis : **AXA** 1 500€, **Generali** 2 000€, **Solly Azar** 1 000€. Si tu veux baisser la franchise sur l'une d'elles, il faut relancer une cotation avec ce paramètre — la prime sera ajustée.`,
      cited: ctx.insurers.slice(0, 3).map((i) => i.id),
    };
  }

  if (p.includes("prime") || p.includes("prix")) {
    return {
      content: `Sur les primes annuelles HT : **Generali** est la moins chère (15% sous la moyenne), **AXA** la plus complète justifie un écart de +12%. **Solly Azar** se positionne au milieu. L'écart prime/couverture penche vers ${ctx.insurers[0]?.name ?? "le carrier principal"} pour ce profil.`,
      cited: ctx.insurers.slice(0, 3).map((i) => i.id),
    };
  }

  if (p.includes("compare") || p.includes("comparer") || p.includes("différence") || p.includes("differences")) {
    if (mentioned.length >= 2) {
      const [a, b] = mentioned;
      return {
        content: `**${a.name} vs ${b.name}** : prime quasi-équivalente (écart <8%). **${a.name}** offre un plafond RC supérieur et inclut le cyber. **${b.name}** a une franchise plus basse et un délai de carence plus court. Pour ce profil, ${a.name} reste plus protecteur.`,
        cited: [a.id, b.id],
      };
    }
  }

  return {
    content: `Je peux t'aider à reformuler l'argumentaire ou à comparer les offres. Essaie par exemple : « compare les exclusions entre ${ctx.insurers[0]?.name ?? "AXA"} et ${ctx.insurers[1]?.name ?? "Generali"} », ou « reformule pour un dirigeant non-technique ».`,
    cited: [],
  };
}

function isFabricationGuardRail(prompt: string, ctx: ChatContext): string | null {
  const number = nearestNumberInPrompt(prompt);
  if (number === null) return null;
  const p = lower(prompt);
  // If the prompt asks "if I change X" / "to / with N€" — likely a what-if not in data
  if (
    p.includes("si on") ||
    p.includes("si je") ||
    p.includes("a ") ||
    p.includes("à ") ||
    p.includes("avec ") ||
    p.includes("monte") ||
    p.includes("baisse") ||
    p.includes("change") ||
    p.includes("ajuste")
  ) {
    return `Cette information n'est pas dans les devis reçus — je ne peux pas reconstruire un tarif à partir d'un paramètre absent (${number}€). Souhaites-tu **relancer une cotation** avec ce paramètre ? Les assureurs ré-évalueront la prime.`;
  }
  return null;
}

// ─── Multi-turn add-row handlers ──────────────────────────────────

function handleAddRowNameStep(
  prompt: string,
  sectionPath: SectionPath,
  ctx: ChatContext,
): ChatMessage {
  const match = matchReference(prompt);

  if (match) {
    // Reference match → propose row with high-confidence values
    const row = buildRowFromReference(match, ctx.insurers);
    return {
      id: `msg-${Date.now()}-addrow-ref`,
      role: "assistant",
      content: `J'ai trouvé **${match.label}** dans le référentiel D&O.\n\n${match.description}\n\nVoici ce que je propose d'ajouter dans **${sectionPath.sectionTitle}** :`,
      proposedRowAddition: {
        sectionPath,
        row,
        isReferenceMatch: true,
        referenceId: match.id,
        status: "proposed",
      },
      createdAt: new Date().toISOString(),
    };
  }

  // No match → ask for description (free creation path)
  const candidateLabel = prompt.trim().slice(0, 80);
  return {
    id: `msg-${Date.now()}-addrow-ask-desc`,
    role: "assistant",
    content: `Je ne trouve pas **« ${candidateLabel} »** dans le référentiel D&O. Voulez-vous tout de même la créer comme garantie ad hoc ?\n\nDécrivez-la en une ou deux phrases pour que je puisse poser la ligne. Les cellules seront marquées comme « à vérifier » jusqu'à ce que vous les complétiez.`,
    awaitingFollowup: {
      kind: "add_row_description",
      sectionPath,
      candidateLabel,
    },
    createdAt: new Date().toISOString(),
  };
}

function handleAddRowDescriptionStep(
  description: string,
  sectionPath: SectionPath,
  candidateLabel: string,
  ctx: ChatContext,
): ChatMessage {
  const row = buildRowFromFreeDescription(candidateLabel, description, ctx.insurers);
  return {
    id: `msg-${Date.now()}-addrow-free`,
    role: "assistant",
    content: `D'accord. Je propose d'ajouter **« ${candidateLabel} »** dans **${sectionPath.sectionTitle}** en best effort. Les cellules seront en confiance basse — pensez à les compléter à partir des conditions générales.`,
    proposedRowAddition: {
      sectionPath,
      row,
      isReferenceMatch: false,
      status: "proposed",
    },
    createdAt: new Date().toISOString(),
  };
}

// ─── Custom document generation handlers ──────────────────────────

function handleDocTypeStep(prompt: string, _ctx: ChatContext): ChatMessage {
  const docType = inferDocType(prompt);
  return {
    id: `msg-${Date.now()}-doc-template`,
    role: "assistant",
    content: `Compris — je pars sur **${docTypeLabel(docType)}**.\n\nAvez-vous un modèle ou une trame existante à me passer ? Vous pouvez :\n- coller un exemple,\n- décrire le ton et la structure souhaités,\n- ou répondre *« non »* et je partirai d'un format standard.`,
    awaitingFollowup: { kind: "doc_template", docType },
    createdAt: new Date().toISOString(),
  };
}

function handleDocTemplateStep(
  prompt: string,
  docType: string,
  ctx: ChatContext,
): ChatMessage {
  const p = lower(prompt);
  const hasTemplate = !p.match(/^(non|aucun|pas de mod[eè]le|standard|par d[eé]faut|skip)/);
  const draft = buildDocDraft(docType, hasTemplate ? prompt : null, ctx);

  // Persist to the generated-docs store so it surfaces in the Présenter tab.
  const clientName = recommendedClientName(ctx);
  const docTypeKey = docType as GeneratedDocType;
  const fileName = suggestFileName(docTypeKey, clientName);
  const saved = addGeneratedDoc(ctx.cotParamId, {
    docType: docTypeKey,
    title: draft.title,
    body: draft.body,
  });

  return {
    id: `msg-${Date.now()}-doc-draft`,
    role: "assistant",
    content: hasTemplate
      ? `J'ai pris en compte votre trame. Voici un brouillon de **${docTypeLabel(docType)}** — il est ouvert en aperçu sur la gauche, et disponible dans **Présenter › Documents générés**.`
      : `Voici un brouillon de **${docTypeLabel(docType)}** au format standard — ouvert en aperçu sur la gauche, et disponible dans **Présenter › Documents générés**.`,
    proposedDocDraft: { ...draft, docId: saved.id, fileName },
    createdAt: new Date().toISOString(),
  };
}

// ─── One-shot doc generation (standalone Chat tab) ────────────────────
// Unlike the board's multi-step qualification, a "generate document" message
// here produces a draft immediately so the artefact opens on the left.

const DOC_GEN_TRIGGERS = [
  "génère", "genere", "générer", "generer", "génере",
  "rédige", "redige", "rédiger", "rediger",
  "document", "courrier", "lettre", "e-mail", "email", "mail",
  "fiche", "synthèse", "synthese", "note", "présentation", "presentation",
  "compte rendu", "compte-rendu", "résume", "resume",
];

function isDocGenIntent(p: string): boolean {
  return DOC_GEN_TRIGGERS.some((t) => p.includes(t));
}

function buildOneShotDoc(prompt: string, ctx: ChatContext): ChatMessage {
  const docType = inferDocType(prompt);
  const draft = buildDocDraft(docType, null, ctx);
  const saved = addGeneratedDoc(ctx.cotParamId, {
    docType: docType as GeneratedDocType,
    title: draft.title,
    body: draft.body,
  });
  const fileName = suggestFileName(docType as GeneratedDocType, recommendedClientName(ctx));
  return {
    id: `msg-${Date.now()}-doc`,
    role: "assistant",
    content: `Voici un brouillon de **${docTypeLabel(docType)}** — ouvert en aperçu sur la gauche. Dites-moi ce que vous souhaitez ajuster.`,
    proposedDocDraft: { ...draft, docId: saved.id, fileName },
    createdAt: new Date().toISOString(),
  };
}

function recommendedClientName(ctx: ChatContext): string {
  // We don't get the client name directly in ChatContext, but the synthese
  // content usually starts with "Synthèse pour CLIENT". Fallback to a generic.
  const m = ctx.currentContent?.match(/Synth[èe]se.*?pour\s+([^\n]{2,60})/i);
  return m ? m[1].trim() : "Client";
}

function buildDocDraft(
  docType: string,
  templateInput: string | null,
  ctx: ChatContext,
): ProposedDocDraft {
  const recommended = ctx.insurers.find((i) => i.id === ctx.recommendedInsurerId) ?? ctx.insurers[0];
  const carrier = recommended?.name ?? "l'assureur retenu";
  const product = ctx.productLabel || "votre couverture";

  if (docType === "email") {
    return {
      docType,
      title: "Brouillon e-mail",
      body: `Objet : Votre cotation ${product} — recommandation

Bonjour,

Suite à l'analyse des offres reçues, je vous transmets ci-joint la synthèse comparative pour votre couverture ${product}.

Notre recommandation se porte sur **${carrier}**, qui propose la combinaison la plus équilibrée entre couverture, prime et franchise sur le périmètre de risque identifié.

Je reste à votre disposition pour échanger sur cette proposition à votre convenance.

Bien cordialement,`,
    };
  }

  if (docType === "ppt") {
    return {
      docType,
      title: "Trame de présentation",
      body: `**Slide 1 — Titre**
${product} · Comparaison des offres

**Slide 2 — Contexte**
Rappel du besoin et des critères retenus

**Slide 3 — Offres reçues**
${ctx.insurers.map((i) => `· ${i.name}`).join("\n")}

**Slide 4 — Tableau comparatif**
Garanties clés et exclusions

**Slide 5 — Notre recommandation**
${carrier} — argumentaire en 3 points

**Slide 6 — Prochaines étapes**
Validation, signature, mise en place`,
    };
  }

  if (docType === "synthese_interne") {
    return {
      docType,
      title: "Synthèse interne",
      body: `**Cotation ${product}**

Trois assureurs consultés : ${ctx.insurers.map((i) => i.name).join(", ")}.

**Recommandation** : ${carrier}, sur la base d'un meilleur rapport couverture / prime sur le profil de risque identifié.

**Points de vigilance** : à compléter selon les exclusions spécifiques au dossier.

**Décision attendue** : validation broker → présentation client.`,
    };
  }

  if (docType === "lettre") {
    return {
      docType,
      title: "Lettre d'accompagnement",
      body: `[Coordonnées courtier]
[Date]

[Coordonnées client]

Objet : Cotation ${product}

Madame, Monsieur,

Suite à votre demande, vous trouverez ci-joint la synthèse de votre cotation ${product}.

Après analyse des offres reçues, notre recommandation se porte sur ${carrier}.

Je reste à votre disposition pour tout complément d'information.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Signature]`,
    };
  }

  if (docType === "sms") {
    return {
      docType,
      title: "SMS",
      body: `Bonjour, votre cotation ${product} est prête. Notre recommandation : ${carrier}. Je vous appelle dans la journée pour en discuter. Bien cordialement.`,
    };
  }

  return {
    docType,
    title: "Brouillon",
    body: `Document généré à partir de votre demande${templateInput ? " et de la trame fournie" : ""}.

À adapter selon le contexte précis du dossier.`,
  };
}

export function respondToPrompt(prompt: string, ctx: ChatContext): ChatMessage {
  // ─── Multi-turn follow-up flows take priority over keyword routing ─
  const followup = getActiveFollowup(ctx.cotParamId);
  if (followup) {
    if (followup.kind === "add_row_name") {
      return handleAddRowNameStep(prompt, followup.sectionPath, ctx);
    }
    if (followup.kind === "add_row_description") {
      return handleAddRowDescriptionStep(
        prompt,
        followup.sectionPath,
        followup.candidateLabel,
        ctx,
      );
    }
    if (followup.kind === "doc_type") {
      return handleDocTypeStep(prompt, ctx);
    }
    if (followup.kind === "doc_template") {
      return handleDocTemplateStep(prompt, followup.docType, ctx);
    }
  }

  // Standalone Chat tab — generate a document in one shot (no qualification).
  if (ctx.oneShotDoc && isDocGenIntent(lower(prompt))) {
    return buildOneShotDoc(prompt, ctx);
  }

  const guard = isFabricationGuardRail(prompt, ctx);
  if (guard) {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: "assistant",
      content: guard,
      createdAt: new Date().toISOString(),
    };
  }

  const p = lower(prompt);
  const isRewrite = REWRITE_TRIGGERS.some((t) => p.includes(t));
  if (isRewrite) {
    const { content, edit } = buildRewrite(prompt, ctx);
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: "assistant",
      content,
      proposedSyntheseEdit: edit,
      createdAt: new Date().toISOString(),
    };
  }

  const isQA = QA_TRIGGERS.some((t) => p.includes(t)) || p.match(/\b(axa|generali|solly|allianz|maaf|groupama)\b/i);
  if (isQA) {
    const { content, cited } = answerQA(prompt, ctx);
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: "assistant",
      content,
      citedOffers: cited,
      createdAt: new Date().toISOString(),
    };
  }

  // Fallback
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: "assistant",
    content: `Je peux t'aider à reformuler la synthèse ou à comparer les offres. Essaie par exemple : « compare les exclusions entre ${ctx.insurers[0]?.name ?? "AXA"} et ${ctx.insurers[1]?.name ?? "Generali"} », ou « reformule l'argumentaire pour un dirigeant non-technique ».`,
    createdAt: new Date().toISOString(),
  };
}
