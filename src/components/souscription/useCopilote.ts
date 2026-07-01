"use client";

import { useMemo, useRef, useState } from "react";
import { currentUser } from "@/data/mock";
import {
  getDraftSections,
  lineProvenance,
  produitsLabel,
} from "@/data/souscription-engine";
import type { Dossier, Draft } from "@/data/souscription-mock";
import { lineAnchorId, type SectionLineState } from "./DraftSection";
import type { OverrideRecord } from "./types";
import {
  detectModify,
  explain,
  formatEuro,
  modifyConsequence,
  parseAmount,
  type CopiloteCard,
  type CopiloteMessage,
} from "./copilote";
import { SCENARIOS } from "./scenarioCommands";
import { PACKAGE_ITEMS, exportPackageItem } from "./exportPackage";

function nowFr(): string {
  const d = new Date();
  return (
    d.toLocaleDateString("fr-FR") +
    " à " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

export interface SuggestionGroup {
  key: "comprendre" | "ajuster" | "verifier";
  label: string;
  items: string[];
}

/**
 * Empty-state prompts framed as the underwriter's ACTIONS on the tarification,
 * grounded in THIS draft: comprendre (justify a sourced value), ajuster (move a
 * coverage lever), vérifier (the delegated authority). Each prompt is one the
 * co-pilote actually handles (explain / modify). No dossier-agnostic copy.
 */
function buildSuggestions(draft: Draft | null): SuggestionGroup[] {
  const authority: SuggestionGroup = {
    key: "verifier",
    label: "Vérifier l'autorité",
    items: ["Suis-je dans mon autorité déléguée ?"],
  };
  if (!draft) return [authority];
  const groups: SuggestionGroup[] = [];

  // Comprendre — justify a value and its source.
  const comprendre: string[] = [];
  const agentLine = draft.lignes.find(
    (l) => lineProvenance(l) === "agent" && !/prime|assiette/i.test(l.label)
  );
  if (agentLine) comprendre.push(`Pourquoi « ${agentLine.label} » ?`);
  const regleLine = draft.lignes.find(
    (l) => /taux/i.test(l.label) && l.label !== agentLine?.label
  );
  if (regleLine)
    comprendre.push(`Sur quelle règle repose « ${regleLine.label} » ?`);
  if (comprendre.length)
    groups.push({ key: "comprendre", label: "Comprendre le projet", items: comprendre });

  // Ajuster — move a coverage lever (sous-limite > plafond > franchise).
  const lever =
    draft.lignes.find((l) => /sous-limite/i.test(l.label)) ??
    draft.lignes.find((l) => /plafond/i.test(l.label)) ??
    draft.lignes.find((l) => /franchise/i.test(l.label));
  if (lever) {
    const amt = parseAmount(lever.valeur);
    const bumped = amt ? (amt < 1_000_000 ? amt * 2 : Math.round(amt * 1.5)) : null;
    groups.push({
      key: "ajuster",
      label: "Ajuster une garantie",
      items: [
        bumped
          ? `Relève « ${lever.label} » à ${formatEuro(bumped)}`
          : `Ajuste « ${lever.label} »`,
      ],
    });
  }

  groups.push(authority);
  return groups;
}

/**
 * The whole tarification co-pilote as a hook. It owns ALL mutable draft state
 * (overrides, confirmed hypotheses, the conversation, sim flags) so the artefact
 * (left) and the chat (right) act on the same state even though they render on
 * opposite sides of the page shell. Every commit stays a deliberate gated gesture.
 */
export function useCopilote(dossier: Dossier, draft: Draft | null) {
  const [overrides, setOverrides] = useState<Record<string, OverrideRecord>>({});
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);
  const [awaitingModify, setAwaitingModify] = useState<{ label: string } | null>(
    null
  );
  const [messages, setMessages] = useState<CopiloteMessage[]>([]);
  const [simState, setSimState] = useState<null | "escalade" | "hors_appetit">(
    null
  );
  const idRef = useRef(0);
  const nextId = () => String(++idRef.current);

  const sections = useMemo(
    () => (draft ? getDraftSections(dossier, draft) : []),
    [dossier, draft]
  );
  const openPoints = useMemo(
    () =>
      draft
        ? draft.lignes.filter(
            (l) => lineProvenance(l) === "agent" && !confirmed.has(l.label)
          )
        : [],
    [draft, confirmed]
  );
  const hasPieces = dossier.pieces.length > 0;
  const clean = openPoints.length === 0 && hasPieces;
  const principalLabel = produitsLabel(dossier.produitsDemandes);
  const suggestions = useMemo(() => buildSuggestions(draft), [draft]);

  // ---------- chat helpers ----------
  function postUser(text: string) {
    setMessages((m) => [...m, { id: nextId(), role: "user", text }]);
  }
  function postAssistant(text: string) {
    setMessages((m) => [...m, { id: nextId(), role: "assistant", text }]);
  }
  function postCard(card: CopiloteCard) {
    setMessages((m) => [
      ...m,
      { id: nextId(), role: "assistant", card, status: "proposed" },
    ]);
  }
  function resolveCard(id: string, status: "applied" | "cancelled" | "scoped") {
    setMessages((m) =>
      m.map((msg) => (msg.id === id ? { ...msg, status } : msg))
    );
  }

  // ---------- draft mutations (deliberate) ----------
  function displayValue(label: string): string {
    const o = overrides[label];
    if (o) return o.value;
    return draft?.lignes.find((l) => l.label === label)?.valeur ?? "";
  }

  /** Record an override (trace: original, author, timestamp). Returns the base
   *  value so the caller can journal it. Keeps the true original across re-edits. */
  function writeOverride(label: string, value: string): string {
    const line = draft?.lignes.find((l) => l.label === label);
    const original = overrides[label]?.original ?? line?.valeur ?? "";
    setOverrides((o) => ({
      ...o,
      [label]: {
        original,
        value,
        author: currentUser.name,
        at: nowFr(),
        appliedToVault: o[label]?.appliedToVault,
      },
    }));
    return original;
  }

  // Chat "Modifier" path: applies + journals (with the anticipated consequence).
  function applyOverride(label: string, value: string, consequence?: string) {
    const original = writeOverride(label, value);
    postAssistant(
      `Override appliqué : ${label} · ${original} → ${value}. ${
        consequence
          ? consequence.charAt(0).toUpperCase() + consequence.slice(1) + "."
          : "Prime recalculée par le moteur, dans l'autorité déléguée."
      }`
    );
  }

  // Quick hand-edit path: click the value, type, Enter. Stays instant, but goes
  // THROUGH the co-pilote (journaled, never silent) so the change is traceable
  // for the audit trail — and it is revertable.
  function quickOverride(label: string, value: string) {
    const v = value.trim();
    if (!v) return;
    const original = writeOverride(label, v);
    postAssistant(
      `Valeur modifiée à la main : ${label} · ${original} → ${v}. Origine conservée dans la trace, « Rétablir la règle » pour revenir.`
    );
  }

  // Undo a hand-edit (or a chat "Modifier") and hand the line back to the vault.
  function revertOverride(label: string) {
    const o = overrides[label];
    if (!o) return;
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[label];
      return next;
    });
    setExpandedLabel(null);
    postAssistant(
      `Valeur rétablie : ${label} · retour à ${o.original}, la règle du vault reprend la main.`
    );
  }

  function applyToVault(label: string) {
    setOverrides((o) =>
      o[label] ? { ...o, [label]: { ...o[label], appliedToVault: true } } : o
    );
  }

  function confirmLine(label: string) {
    setConfirmed((c) => new Set(c).add(label));
    setExpandedLabel(null);
    postAssistant(
      `Hypothèse confirmée : ${label} devient une valeur retenue, sourcée « décision du souscripteur ».`
    );
  }

  function confirmAllPoints() {
    if (openPoints.length === 0) return;
    setConfirmed((c) => {
      const n = new Set(c);
      openPoints.forEach((l) => n.add(l.label));
      return n;
    });
    setExpandedLabel(null);
    postAssistant(
      `${openPoints.length} hypothèse${openPoints.length > 1 ? "s" : ""} confirmée${openPoints.length > 1 ? "s" : ""}. Le projet est propre, vous pouvez préparer l'envoi.`
    );
  }

  function createRule(card: CopiloteCard & { kind: "create-rule" }) {
    // demo stub: the rule lands in the vault "à valider"
    postAssistant(`Règle ajoutée au vault, à valider : ${card.summary}.`);
  }

  // "Préparer l'envoi" is handled IN the chat: the co-pilote proposes the
  // package as a gated envoi card (Envoyer / Télécharger), never a modal.
  function prepareEnvoi() {
    postAssistant(
      `Le dossier est propre. Voici le package prêt à envoyer à ${dossier.courtier}, à valider :`
    );
    postCard({
      kind: "envoi",
      courtier: dossier.courtier,
      objet: `Proposition ${principalLabel} · ${dossier.insured.raison}`,
      items: ["Devis", "Conditions générales", "Conditions particulières"],
    });
  }

  // ---------- the one edit fiche (4 doors converge here) ----------
  function openFiche(label: string, ask?: boolean) {
    setExpandedLabel(label);
    if (typeof document !== "undefined") {
      document
        .getElementById(lineAnchorId(label))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (ask) {
      postUser(`Pourquoi ${label.toLowerCase()} ?`);
      postAssistant(explain(label));
    }
  }

  // "Modifier" (from a line box or the fiche) opens a co-pilote workflow: the
  // agent asks for the new value, then proposes a confirmable card.
  function startModify(label: string) {
    setAwaitingModify({ label });
    setExpandedLabel(null);
    postAssistant(
      `Vous modifiez « ${label} » (actuellement ${displayValue(label)}). Quelle nouvelle valeur souhaitez-vous appliquer ?`
    );
  }

  function sendChat(text: string) {
    const q = text.trim();
    if (!q) return;
    if (q.startsWith("/")) {
      handleCommand(q);
      return;
    }
    postUser(q);

    // In the middle of a "Modifier" workflow: this message is the new value.
    if (awaitingModify) {
      const label = awaitingModify.label;
      setAwaitingModify(null);
      const amt = parseAmount(q);
      const to = amt != null ? formatEuro(amt) : q;
      postAssistant("Voici la modification à valider :");
      postCard({
        kind: "modify",
        label,
        from: displayValue(label),
        to,
        consequence: modifyConsequence(label, amt),
      });
      return;
    }

    const card = draft ? detectModify(q, draft) : null;
    if (card) {
      postAssistant(
        card.consequence
          ? `${card.consequence.charAt(0).toUpperCase()}${card.consequence.slice(1)}. Voici la modification à valider :`
          : "Voici la modification à valider :"
      );
      postCard(card);
    } else {
      postAssistant(explain(q));
    }
  }

  function applyCard(id: string) {
    const msg = messages.find((m) => m.id === id);
    if (!msg?.card) return;
    if (msg.card.kind === "modify") {
      applyOverride(msg.card.label, msg.card.to, msg.card.consequence);
    } else if (msg.card.kind === "create-rule") {
      createRule(msg.card);
    } else if (msg.card.kind === "envoi") {
      postAssistant(
        `Envoi confirmé au courtier ${msg.card.courtier} (démo, pas d'envoi réel). Le dossier passe en attente de réponse.`
      );
    } else {
      postAssistant("Relance envoyée au courtier.");
    }
    resolveCard(id, "applied");
  }
  function scopeCard(id: string) {
    const msg = messages.find((m) => m.id === id);
    if (msg?.card?.kind === "create-rule") {
      postAssistant("Conservé comme exception sur ce dossier seulement.");
      resolveCard(id, "scoped");
    } else if (msg?.card?.kind === "envoi" && draft) {
      // Télécharger : utilitaire neutre, ne résout pas la carte.
      for (const item of msg.card.items) {
        if (PACKAGE_ITEMS.includes(item))
          exportPackageItem(item, dossier, draft, principalLabel);
      }
      postAssistant("Package téléchargé (Devis, CG, CP).");
    }
  }
  function cancelCard(id: string) {
    resolveCard(id, "cancelled");
  }

  // ---------- demo scenarios ----------
  function resetAll() {
    setOverrides({});
    setConfirmed(new Set());
    setSimState(null);
    setExpandedLabel(null);
    setAwaitingModify(null);
    setMessages([
      {
        id: nextId(),
        role: "assistant",
        text: "Dossier réinitialisé à l'état initial.",
      },
    ]);
  }

  function handleCommand(raw: string) {
    const cmd = raw.trim().toLowerCase();
    if (cmd === "/") {
      postAssistant(
        "Scénarios de démo :\n" +
          SCENARIOS.map((s) => `${s.cmd} · ${s.label}`).join("\n") +
          "\n/reset · rejouer depuis l'état initial"
      );
      return;
    }
    if (cmd === "/reset") {
      resetAll();
      return;
    }
    if (!SCENARIOS.some((s) => s.cmd === cmd)) {
      postAssistant(
        "Commande inconnue. Tapez « / » pour la liste des scénarios."
      );
      return;
    }
    postUser(cmd);
    runScenario(cmd);
  }

  function runScenario(cmd: string) {
    switch (cmd) {
      case "/scenario-confirm": {
        const p = openPoints[0];
        if (!p) {
          postAssistant("Aucune hypothèse ouverte à confirmer.");
          return;
        }
        confirmLine(p.label);
        break;
      }
      case "/scenario-override": {
        const label = "Sous-limite cyber-extorsion";
        postAssistant(
          "Au-delà de 250 000 €, guide_souscription_cyber demande l'avis du comité. Voici la modification à valider :"
        );
        postCard({
          kind: "modify",
          label,
          from: displayValue(label),
          to: "500 000 €",
          consequence: "déclenche l'avis du comité (guide_souscription_cyber)",
        });
        break;
      }
      case "/scenario-rule": {
        postAssistant(
          "Cet override ressemble à une règle manquante. Je peux la formaliser :"
        );
        postCard({
          kind: "create-rule",
          label: "Plafond RC professionnelle",
          summary: "Si CA 2-5 M€ et activité Conseil / IT, plafond 3 000 000 €",
        });
        break;
      }
      case "/scenario-escalade": {
        setSimState("escalade");
        postAssistant(
          "Ligne demandée au-delà du mandat délégué (matrice_autorite_2026). Escalade requise, l'export est gelé."
        );
        break;
      }
      case "/scenario-hors-appetit": {
        setSimState("hors_appetit");
        postAssistant(
          "Requalification : activité hors du périmètre couvert. On ne chiffre plus, le corps montre le pourquoi sourcé."
        );
        break;
      }
      case "/scenario-gap": {
        postAssistant("Pièces manquantes détectées côté courtier. Relance à valider :");
        postCard({
          kind: "relance",
          courtier: dossier.courtier,
          missing: ["Bilan N-1", "Questionnaire cyber", "Justificatif part export US"],
        });
        break;
      }
    }
  }

  const sectionState: SectionLineState = {
    displayValue,
    overrides,
    confirmed,
    expandedLabel,
    onOpenFiche: (label) =>
      setExpandedLabel((e) => (e === label ? null : label)),
    onConfirm: confirmLine,
    onModify: startModify,
    onQuickEdit: quickOverride,
    onRevert: revertOverride,
    onApplyToVault: applyToVault,
  };

  return {
    // shared
    dossier,
    draft,
    // chat (right rail)
    messages,
    suggestions,
    sendChat,
    applyCard,
    scopeCard,
    cancelCard,
    // artefact (left)
    sections,
    sectionState,
    confirmed,
    openPoints,
    hasPieces,
    clean,
    principalLabel,
    simState,
    setSimState,
    prepareEnvoi,
    onOpenPoint: (label: string) => openFiche(label, true),
    confirmAllPoints,
    postAssistant,
  };
}

export type CopiloteApi = ReturnType<typeof useCopilote>;
