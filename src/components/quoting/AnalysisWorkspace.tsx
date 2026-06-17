"use client";

// ─────────────────────────────────────────────────────────────────────────
// PAN-67 · "Version 1" prototype — the result workspace for the "besoin" and
// "explore" analysis kinds. Mirrors the comparatif board layout: an artefact
// pane on the left + the Co-pilote chat on the right.
//
// The artefact is a generated synthèse rendered with the SAME `.synthese-doc`
// design as the compare synthèse (only the content differs) + a download as
// .md. "compare" still routes to the real board. All data is mocked.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import {
  ArrowLeft,
  ArrowUp,
  Sparkles,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import type {
  AnalysisKind,
  AnalysisWorkspacePayload,
  DetectedFile,
} from "@/components/quoting/NewAnalysisFlow";

type Props = AnalysisWorkspacePayload & { onBack: () => void };

const KIND_LABEL: Record<AnalysisKind, string> = {
  besoin: "Synthèse de contrat",
  explore: "Synthèse documentaire",
  generate: "Document généré",
};

function downloadMockFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function mdToHtml(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

// ─── Component ────────────────────────────────────────────────────────

export function AnalysisWorkspace({
  kind,
  clientName,
  intent,
  files,
  product,
  onBack,
}: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1400);
    return () => window.clearTimeout(t);
  }, []);

  const hasClient = !!clientName && clientName !== "le client";

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      {/* Header / breadcrumb (mirrors the board) */}
      <div className="h-[52px] shrink-0 border-b border-panora-border flex items-center justify-between px-4 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-panora-bg transition-colors text-panora-text-muted hover:text-panora-text"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] text-panora-text-muted">Analyses</span>
          <span className="text-[13px] text-panora-text-muted">/</span>
          {hasClient && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-panora-green/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-panora-green">
                    {clientName.charAt(0)}
                  </span>
                </div>
                <span className="text-[13px] font-medium text-panora-text">
                  {clientName}
                </span>
              </div>
              <span className="text-[13px] text-panora-text-muted">/</span>
            </>
          )}
          <span className="text-[13px] font-medium text-panora-text">
            {KIND_LABEL[kind]}
          </span>
        </div>
      </div>

      {loading ? (
        <WorkspaceLoading kind={kind} fileCount={files.length} />
      ) : (
        <div className="flex-1 flex min-h-0 min-w-0">
          {/* Left: synthèse artefact */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
            <SynthesisArtefact
              kind={kind}
              intent={intent}
              files={files}
              clientName={clientName}
              product={product}
            />
          </div>

          {/* Right: co-pilote chat */}
          <WorkspaceChat kind={kind} />
        </div>
      )}
    </div>
  );
}

// ─── Loading transition ───────────────────────────────────────────────

function WorkspaceLoading({
  kind,
  fileCount,
}: {
  kind: AnalysisKind;
  fileCount: number;
}) {
  const label =
    kind === "besoin"
      ? "Génération de la synthèse de contrat"
      : kind === "generate"
        ? "Génération du document"
        : "Analyse et synthèse des documents";
  return (
    <div className="flex-1 flex items-center justify-center bg-panora-bg">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#dbeee5] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-panora-green animate-spin" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-panora-text font-serif mb-1">
            {label}
          </h3>
          <p className="text-[13px] text-panora-text-muted leading-5">
            {fileCount} document{fileCount > 1 ? "s" : ""} en cours de
            traitement…
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Left artefact: generated synthèse .md ────────────────────────────

function SynthesisArtefact({
  kind,
  intent,
  files,
  clientName,
  product,
}: {
  kind: AnalysisKind;
  intent: string;
  files: DetectedFile[];
  clientName: string;
  product?: string;
}) {
  const md = buildSynthesisMd(kind, intent, files, clientName, product);
  const fileName =
    kind === "besoin"
      ? "Synthese_contrat.md"
      : kind === "explore"
        ? "Synthese_documentaire.md"
        : "Document.md";

  return (
    <>
      <div className="h-[52px] shrink-0 border-b border-panora-border bg-white px-4 flex items-center justify-between">
        <span className="text-[12px] text-panora-text-muted">
          Aperçu · prototype
        </span>
        <button
          onClick={() => downloadMockFile(fileName, md)}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-panora-secondary text-[12px] font-medium text-panora-text-secondary hover:bg-[#e2dfd8] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Télécharger .md
        </button>
      </div>

      {/* Same rendering as the compare synthèse (.synthese-doc); content differs. */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-[760px] mx-auto px-10 pt-6 pb-10">
          <div
            className="synthese-doc"
            dangerouslySetInnerHTML={{ __html: mdToHtml(md) }}
          />
        </div>
      </div>
    </>
  );
}

function buildSynthesisMd(
  kind: AnalysisKind,
  intent: string,
  files: DetectedFile[],
  clientName: string,
  product?: string,
): string {
  const docNames = files.map((f) => f.name).join(", ") || "le document fourni";
  const intentLine = intent ? `« ${intent} »` : "—";

  if (kind === "generate") {
    return `# ${clientName} — Document

**Produit :** ${product ?? "—"}
**Source :** ${docNames}
**Intention :** ${intentLine}

## Présentation
Document généré à partir du devis fourni, selon l'intention exprimée.

## Garanties principales
- Responsabilité civile circulation
- Dommages tous accidents
- Vol, incendie & bris de glace
- Assistance 0 km, 7j/7

## Conditions
- Franchise : 500 € par sinistre
- Prime annuelle estimée : 12 480 € TTC`;
  }

  if (kind === "besoin") {
    return `# Synthèse — Analyse de contrat

**Client :** ${clientName}
**Produit :** ${product ?? "—"}
**Document :** ${docNames}
**Intention :** ${intentLine}

## Contexte
Analyse du contrat existant au regard de l'intention exprimée.

## Points couverts
- Responsabilité civile circulation
- Dommages tous accidents
- Assistance 0 km, 7j/7

## Écarts identifiés
- Franchise vol à 500 € — à confirmer face au besoin
- Plafond bris de glace à vérifier

## Recommandations
- Négocier l'option « Assistance étendue »
- Demander un avenant abaissant la franchise vol`;
  }

  return `# Synthèse documentaire

**Produit :** ${product ?? "—"}
**Documents :** ${docNames}
**Intention :** ${intentLine}

## Synthèse
Réponse construite à partir des documents fournis.

## Points clés
- Franchise vol : 500 € / sinistre — CG_Axa_Flotte.pdf, p.12
- Bris de glace : inclus, sans plafond — CG_Axa_Flotte.pdf, p.8
- Assistance : 0 km, 7j/7 — Contrat_Flotte_2024.pdf, p.3

## Exclusions
- Trajets hors Union européenne — CG_Axa_Flotte.pdf, p.21`;
}

// ─── Right: co-pilote chat (lightweight) ──────────────────────────────

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  source?: string;
  /** When set, the message renders a generated-document card. */
  doc?: { title: string; fileName: string; body: string };
};

const CHAT_SEED: Record<AnalysisKind, { intro: string; suggestions: string[] }> = {
  besoin: {
    intro:
      "Synthèse générée à partir de votre intention. Posez vos questions ou demandez une retouche.",
    suggestions: ["Quels sont les écarts majeurs ?", "Reformule la synthèse"],
  },
  explore: {
    intro:
      "J’ai synthétisé les documents selon votre intention. Posez vos questions — je cite mes sources.",
    suggestions: [
      "Quelle est la franchise vol ?",
      "Le bris de glace est-il couvert ?",
    ],
  },
  generate: {
    intro:
      "Document généré à partir de votre intention. Demandez une retouche ou un autre format.",
    suggestions: ["Raccourcis le document", "Mets-le au format courrier"],
  },
};

function cannedReply(kind: AnalysisKind): ChatMsg {
  if (kind === "explore") {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "D’après les conditions générales, la franchise vol s’élève à 500 € par sinistre, réduite de 50 % en cas de stationnement dans un parking sécurisé.",
      source: "CG_Axa_Flotte.pdf · p.12",
    };
  }
  if (kind === "generate") {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: "C’est mis à jour. Vous pouvez télécharger le document ou me demander un autre format (courrier, e-mail).",
    };
  }
  return {
    id: `a-${Date.now()}`,
    role: "assistant",
    text: "Les deux écarts majeurs portent sur l’assistance 0 km et la franchise vol. Je peux préparer un avenant ou un courrier de négociation.",
  };
}

function WorkspaceChat({ kind }: { kind: AnalysisKind }) {
  const seed = CHAT_SEED[kind];
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "intro", role: "assistant", text: seed.intro },
  ]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasUserSent = messages.some((m) => m.role === "user");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, thinking]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || thinking) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: value },
    ]);
    setDraft("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, cannedReply(kind)]);
      setThinking(false);
    }, 600);
  };

  // "Générer un document" is a chat tool, not a separate entrance.
  const generateDoc = () => {
    if (thinking) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: "Génère un courrier pour le client." },
    ]);
    setThinking(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: "Voici un courrier d’accompagnement prêt à envoyer :",
          doc: {
            title: "Courrier d’accompagnement",
            fileName: "Courrier_accompagnement.txt",
            body: "Madame, Monsieur,\n\n(Courrier de démonstration généré par le prototype Panora.)",
          },
        },
      ]);
      setThinking(false);
    }, 600);
  };

  return (
    <aside className="w-[380px] shrink-0 h-full border-l border-panora-border bg-[#faf8f5] flex flex-col">
      {/* Header */}
      <div className="h-[52px] shrink-0 border-b border-panora-border px-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-panora-green" />
        <span className="text-[13px] font-semibold text-panora-text leading-5">
          Co-pilote Panora
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
      >
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-[20px] bg-[#173c2d] text-white">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Sparkles className="w-4 h-4 text-panora-green shrink-0 mt-0.5" />
                <p className="text-[13px] leading-[20px] text-panora-text">
                  {m.text}
                </p>
              </div>
              {m.source && (
                <span className="ml-6 inline-flex w-fit items-center gap-1.5 h-6 px-2 rounded-full bg-white border border-panora-border text-[12px] text-panora-text-muted">
                  <FileText className="w-3 h-3" />
                  {m.source}
                </span>
              )}
              {m.doc && (
                <div className="ml-6 flex items-center gap-3 rounded-[10px] border border-panora-border bg-white p-3">
                  <div className="w-8 h-8 rounded-[6px] bg-panora-green-light flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-panora-green-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-panora-text truncate">
                      {m.doc.title}
                    </div>
                    <div className="text-[11px] text-panora-text-muted">
                      Document généré · prototype
                    </div>
                  </div>
                  <button
                    onClick={() => downloadMockFile(m.doc!.fileName, m.doc!.body)}
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-panora-secondary text-[12px] font-medium text-panora-text-secondary hover:bg-[#e2dfd8] transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger
                  </button>
                </div>
              )}
            </div>
          ),
        )}
        {thinking && (
          <div className="flex gap-2 items-center text-panora-text-muted">
            <Sparkles className="w-4 h-4 text-panora-green" />
            <span className="text-[13px]">…</span>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-3 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {/* Persistent tool — document generation lives in the chat */}
          <button
            onClick={generateDoc}
            disabled={thinking}
            className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full border border-panora-border bg-white text-[12px] text-panora-text hover:bg-panora-bg/40 hover:border-panora-text-secondary/30 transition-colors disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5 text-panora-green" />
            Générer un document
          </button>
          {!hasUserSent &&
            seed.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="inline-flex items-center h-[26px] px-2.5 rounded-full border border-panora-border bg-white text-[12px] text-panora-text hover:bg-panora-bg/40 hover:border-panora-text-secondary/30 transition-colors"
              >
                {s}
              </button>
            ))}
        </div>
        <div className="flex items-end gap-2 bg-white border border-panora-border rounded-[12px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send(draft);
              }
            }}
            placeholder="Posez une question…"
            className="flex-1 text-[13px] leading-[20px] text-panora-text bg-transparent outline-none placeholder:text-panora-text-muted"
          />
          <button
            onClick={() => send(draft)}
            disabled={!draft.trim() || thinking}
            className="w-8 h-8 shrink-0 rounded-full bg-[#173c2d] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  );
}
