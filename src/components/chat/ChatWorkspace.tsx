"use client";

// ─────────────────────────────────────────────────────────────────────────
// Standalone "Chat" tab — reuses the real comparison co-pilote (<ComparisonChat>)
// so the chat bar, suggestion pills, drag-drop, tips, etc. are identical.
//
//   • Conversations are listed in the sidebar (chatStore); messages live in
//     chatMock, keyed by conversation id.
//   • Centered chat by default; when the co-pilote drafts a document, it opens
//     as an artefact on the left + chat on the right.
//   • Every artefact of a conversation is reachable from a "Documents" popover.
//
// All data is mocked.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { Sparkles, FileText, Plus, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparisonChat } from "@/components/quoting/ComparisonChat";
import type { ProposedDocDraft } from "@/data/chatMock";
import {
  useChatState,
  ensureActiveConversation,
  createConversation,
  setTitleFromMessage,
  addArtefact,
  uid,
  type Conversation,
  type ChatArtefact,
} from "@/data/chatStore";

function mdToHtml(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

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

// Broad use cases shown in the empty state of the general chat.
const GENERAL_CHAT_SUGGESTIONS = [
  "Analyser un contrat existant",
  "Générer un document (synthèse, e-mail…)",
  "Poser une question sur un devis",
  "Faire une analyse de sinistralité",
];

export function ChatWorkspace() {
  const { conversations, activeId } = useChatState();
  const conv = activeId
    ? conversations.find((c) => c.id === activeId) ?? null
    : null;

  useEffect(() => {
    ensureActiveConversation();
  }, []);

  if (!conv) return <div className="flex-1 bg-white" />;

  // Keyed by conversation id — switching remounts ChatView (and the chat reads
  // the right chatMock session) with fresh per-view state.
  return <ChatView key={conv.id} conv={conv} />;
}

function ChatView({ conv }: { conv: Conversation }) {
  const [openArtefactId, setOpenArtefactId] = useState<string | null>(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const docsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!docsOpen) return;
    function handle(e: MouseEvent) {
      if (docsRef.current && !docsRef.current.contains(e.target as Node)) {
        setDocsOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [docsOpen]);

  const artefacts = conv.artefacts;
  const openArtefact = artefacts.find((a) => a.id === openArtefactId) ?? null;

  // A document drafted in the chat becomes an artefact on the left.
  const handleDocDraft = (draft: ProposedDocDraft) => {
    const id = draft.docId ?? uid("art");
    addArtefact(conv.id, { id, title: draft.title, md: draft.body });
    setOpenArtefactId(id);
  };

  const chatEl = (variant: "centered" | "panel") => (
    <ComparisonChat
      key="chat"
      variant={variant}
      hideHeader
      emptySuggestions={GENERAL_CHAT_SUGGESTIONS}
      oneShotDoc
      cotParamId={conv.id}
      insurers={[]}
      productLabel=""
      recommendedInsurerId={null}
      syntheseContent=""
      onAcceptContentEdit={() => {}}
      onClose={() => {}}
      onUserMessage={(text) => setTitleFromMessage(conv.id, text)}
      onDocDraftEmitted={handleDocDraft}
      onOpenDocPreview={(docId) => setOpenArtefactId(docId)}
      onDownloadDoc={(_id, fileName, body) => downloadMockFile(fileName, body)}
    />
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      {/* Header */}
      <div className="h-[52px] shrink-0 border-b border-panora-border flex items-center justify-between px-4 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-panora-green shrink-0" />
          <span className="text-[15px] font-medium text-panora-text font-serif truncate">
            {conv.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {artefacts.length > 0 && (
            <div className="relative" ref={docsRef}>
              <button
                onClick={() => setDocsOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] border border-panora-border text-[13px] text-panora-text-secondary hover:bg-panora-bg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Documents
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-panora-green-light text-[11px] font-medium text-panora-green-dark">
                  {artefacts.length}
                </span>
              </button>

              {docsOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-[280px] bg-white border border-panora-border rounded-lg shadow-[0px_8px_24px_rgba(0,0,0,0.10)] z-30 py-1.5">
                  <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-panora-text-muted">
                    Documents de la conversation
                  </div>
                  {artefacts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setOpenArtefactId(a.id);
                        setDocsOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-panora-bg transition-colors",
                        a.id === openArtefactId && "bg-panora-bg",
                      )}
                    >
                      <FileText className="w-4 h-4 text-panora-green-dark shrink-0" />
                      <span className="text-[13px] text-panora-text truncate flex-1">
                        {a.title}
                      </span>
                      {a.id === openArtefactId && (
                        <span className="w-1.5 h-1.5 rounded-full bg-panora-green shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => createConversation()}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] border border-panora-border text-[13px] font-medium text-panora-text-secondary hover:bg-panora-bg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau chat
          </button>
        </div>
      </div>

      {/* Body — centered chat; smoothly splits to artefact-left + chat-right.
          The chat keeps a stable key so it persists (no flicker) across the
          switch; the artefact pane animates in. */}
      <div
        className={cn(
          "flex-1 flex min-h-0 min-w-0",
          !openArtefact && "justify-center bg-white",
        )}
      >
        {openArtefact && (
          <div
            key={openArtefact.id}
            className="flex-1 flex flex-col min-h-0 min-w-0 bg-white [animation:chat-artefact-in_320ms_ease-out]"
          >
            <ArtefactPane
              artefact={openArtefact}
              onClose={() => setOpenArtefactId(null)}
            />
          </div>
        )}
        {chatEl(openArtefact ? "panel" : "centered")}
      </div>
    </div>
  );
}

// ─── Artefact pane (left, when a document is open) ────────────────────

function ArtefactPane({
  artefact,
  onClose,
}: {
  artefact: ChatArtefact;
  onClose: () => void;
}) {
  return (
    <>
      <div className="h-[52px] shrink-0 border-b border-panora-border bg-white px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-panora-text-muted shrink-0" />
          <span className="text-[13px] font-medium text-panora-text truncate">
            {artefact.title}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              downloadMockFile(
                `${artefact.title.replace(/\s+/g, "_")}.md`,
                artefact.md,
              )
            }
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-panora-secondary text-[12px] font-medium text-panora-text-secondary hover:bg-[#e2dfd8] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger .md
          </button>
          <button
            onClick={onClose}
            title="Fermer le document"
            className="w-7 h-7 flex items-center justify-center rounded-md text-panora-text-muted hover:bg-panora-bg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-[760px] mx-auto px-10 pt-6 pb-10">
          <div
            className="synthese-doc"
            dangerouslySetInnerHTML={{ __html: mdToHtml(artefact.md) }}
          />
        </div>
      </div>
    </>
  );
}
