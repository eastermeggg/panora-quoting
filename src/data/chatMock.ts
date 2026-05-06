// Chat copilote mock — pattern-matches keywords to canned responses.
// Two modes mixed by intent: edit-synthese (Mode A) and Q&A on offers (Mode B).

import type { InsurerData } from "./mock";

export type ChatMessageRole = "user" | "assistant";

export type SyntheseEditField = "recommendation" | "argumentaire" | "criteriaRow";

export type SyntheseEdit = {
  field: SyntheseEditField;
  before: string;
  after: string;
  status: "proposed" | "accepted" | "rejected";
};

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  citedOffers?: string[];
  proposedSyntheseEdit?: SyntheseEdit;
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

export function respondToPrompt(prompt: string, ctx: ChatContext): ChatMessage {
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
