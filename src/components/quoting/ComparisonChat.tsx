"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  ChevronRight,
  CircleArrowDown,
  Copy,
  FileText,
  Lightbulb,
  MessageCircleMore,
  Paperclip,
  PenLine,
  ScanText,
  Sparkles,
  Table2,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsurerData } from "@/data/mock";
import {
  type ChatMessage,
  type ChatContext,
  type ProposedRowAddition,
  type ProposedDocDraft,
  type ChatAttachment,
  appendChatMessage,
  getChatSession,
  recordSyntheseEdit,
  respondToPrompt,
  updateSyntheseEditStatus,
  updateRowProposalStatus,
} from "@/data/chatMock";
import { SyntheseEditDiff } from "./SyntheseEditDiff";
import { ProposedRowCard } from "./ProposedRowCard";
import { DocDraftCard } from "./DocDraftCard";
import { suggestionsForScope } from "./CellActionBar";

interface ComparisonChatProps {
  cotParamId: string;
  insurers: InsurerData[];
  productLabel: string;
  recommendedInsurerId: string | null;
  syntheseContent: string;
  onAcceptContentEdit: (next: string) => void;
  onClose: () => void;
  /** Bumped by parent when an external trigger (e.g. "+") injects a chat message. */
  externalTriggerCounter?: number;
  /** Called the first time the agent emits a row-addition proposal (so the grid can show overlay). */
  onRowProposalEmitted?: (proposal: ProposedRowAddition) => void;
  /** Called when the broker accepts a proposed row addition. */
  onAcceptRowAddition?: (proposal: ProposedRowAddition) => void;
  /** Called when the broker rejects a proposed row addition. */
  onRejectRowAddition?: (proposal: ProposedRowAddition) => void;
  /** Called when the agent emits a generated doc draft (auto-switch to Présenter). */
  onDocDraftEmitted?: (draft: ProposedDocDraft) => void;
  /** Open the doc in the Présenter tab preview. */
  onOpenDocPreview?: (docId: string) => void;
  /** Trigger a mock download for a generated doc. */
  onDownloadDoc?: (docId: string, fileName: string, body: string) => void;
  /** Client name used for filename suggestions on doc artifact cards. */
  clientName?: string;
  /** When set, a context pill + suggestion chips are rendered above the composer to scope the question. */
  contextScope?: import("./CellActionBar").SelectedObject | null;
  /** Called when broker clears the context pill (X). */
  onClearContextScope?: () => void;
  /** Optional: notified with each user message (standalone Chat tab uses it to title conversations). */
  onUserMessage?: (text: string) => void;
  /** Optional: hide the whole header (standalone Chat tab provides its own). */
  hideHeader?: boolean;
  /** Presentation: "panel" = 380px docked side panel (default); "centered" = full-width centered column. */
  variant?: "panel" | "centered";
  /** Optional: override the empty-state quick suggestions (general Chat tab lists broad use cases). */
  emptySuggestions?: string[];
}

export function ComparisonChat({
  cotParamId,
  insurers,
  productLabel,
  recommendedInsurerId,
  syntheseContent,
  onAcceptContentEdit,
  onClose,
  externalTriggerCounter,
  onRowProposalEmitted,
  onAcceptRowAddition,
  onRejectRowAddition,
  onDocDraftEmitted,
  onOpenDocPreview,
  onDownloadDoc,
  clientName,
  contextScope,
  onClearContextScope,
  onUserMessage,
  hideHeader,
  variant = "panel",
  emptySuggestions,
}: ComparisonChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatSession(cotParamId).messages);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const tipsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setAttachments((prev) => [...prev, ...arr]);
  }
  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }
  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    dragCounterRef.current += 1;
    setIsDraggingOver(true);
  }
  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) return;
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  }
  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }

  // Close prompt-ideas popover on outside click + Escape
  useEffect(() => {
    if (!tipsOpen) return;
    function onClick(e: MouseEvent) {
      if (tipsRef.current && !tipsRef.current.contains(e.target as Node)) {
        setTipsOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTipsOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [tipsOpen]);

  function applyTemplate(template: string) {
    setDraft(template);
    setTipsOpen(false);
    // Defer so the textarea has the updated value before we move the caret.
    window.setTimeout(() => {
      const ta = composerRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(template.length, template.length);
      autoGrow(ta);
    }, 0);
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  // External triggers (e.g. broker clicks "+" on the grid) inject an agent
  // message into the session from the outside. We need to re-read so the
  // chat picks it up.
  useEffect(() => {
    if (externalTriggerCounter !== undefined) {
      setMessages(getChatSession(cotParamId).messages);
    }
  }, [externalTriggerCounter, cotParamId]);

  /** Apply a text to the composer and focus it (used by suggestion chips). */
  function applySuggestion(text: string) {
    setDraft(text);
    window.setTimeout(() => {
      const ta = composerRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(text.length, text.length);
      autoGrow(ta);
    }, 0);
  }

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  function send() {
    const text = draft.trim();
    if ((!text && attachments.length === 0) || thinking) return;
    const userAttachments: ChatAttachment[] | undefined = attachments.length > 0
      ? attachments.map((f) => ({ name: f.name, size: f.size, type: f.type || "application/octet-stream" }))
      : undefined;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: text || (userAttachments ? `${userAttachments.length} fichier${userAttachments.length > 1 ? "s" : ""} joint${userAttachments.length > 1 ? "s" : ""}` : ""),
      attachments: userAttachments,
      createdAt: new Date().toISOString(),
    };
    appendChatMessage(cotParamId, userMsg);
    setMessages((prev) => [...prev, userMsg]);
    onUserMessage?.(userMsg.content);
    setDraft("");
    setAttachments([]);
    if (composerRef.current) {
      composerRef.current.style.height = "auto";
    }
    setThinking(true);

    const ctx: ChatContext = {
      cotParamId,
      productLabel,
      insurers,
      currentContent: syntheseContent,
      recommendedInsurerId,
    };
    setTimeout(() => {
      const response = respondToPrompt(text, ctx);
      appendChatMessage(cotParamId, response);
      if (response.proposedSyntheseEdit) {
        recordSyntheseEdit(cotParamId, response.proposedSyntheseEdit);
      }
      if (response.proposedRowAddition) {
        onRowProposalEmitted?.(response.proposedRowAddition);
      }
      if (response.proposedDocDraft) {
        onDocDraftEmitted?.(response.proposedDocDraft);
      }
      setMessages((prev) => [...prev, response]);
      setThinking(false);
    }, 700);
  }

  function handleAcceptEdit(message: ChatMessage) {
    if (!message.proposedSyntheseEdit) return;
    onAcceptContentEdit(message.proposedSyntheseEdit.after);
    updateSyntheseEditStatus(cotParamId, message.proposedSyntheseEdit.before, "accepted");
    setMessages(getChatSession(cotParamId).messages);
  }

  function handleRejectEdit(message: ChatMessage) {
    if (!message.proposedSyntheseEdit) return;
    updateSyntheseEditStatus(cotParamId, message.proposedSyntheseEdit.before, "rejected");
    setMessages(getChatSession(cotParamId).messages);
  }

  function handleAcceptRow(message: ChatMessage) {
    if (!message.proposedRowAddition) return;
    onAcceptRowAddition?.(message.proposedRowAddition);
    updateRowProposalStatus(cotParamId, message.id, "accepted");
    setMessages(getChatSession(cotParamId).messages);
  }

  function handleRejectRow(message: ChatMessage) {
    if (!message.proposedRowAddition) return;
    onRejectRowAddition?.(message.proposedRowAddition);
    updateRowProposalStatus(cotParamId, message.id, "rejected");
    setMessages(getChatSession(cotParamId).messages);
  }

  return (
    <aside
      className={cn(
        "h-full flex flex-col relative",
        variant === "centered"
          ? "w-full max-w-[760px] mx-auto bg-white"
          : "w-[380px] shrink-0 border-l border-panora-border bg-[#faf8f5]",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      {!hideHeader && (
        <div className="h-[52px] shrink-0 border-b border-panora-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-panora-green" />
            <span className="text-[13px] font-semibold text-panora-text leading-5">
              Co-pilote Panora
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-panora-bg transition-colors text-panora-text-muted"
            title="Fermer le copilote"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.length === 0 ? (
          <EmptyState
            insurers={insurers}
            onSuggestion={(s) => setDraft(s)}
            customSuggestions={emptySuggestions}
          />
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              insurers={insurers}
              onAccept={() => handleAcceptEdit(msg)}
              onReject={() => handleRejectEdit(msg)}
              onAcceptRow={() => handleAcceptRow(msg)}
              onRejectRow={() => handleRejectRow(msg)}
              onOpenDocPreview={onOpenDocPreview}
              onDownloadDoc={onDownloadDoc}
              clientName={clientName}
            />
          ))
        )}
        {thinking && <ThinkingDots />}
      </div>

      {/* Composer */}
      <div className="p-3 flex flex-col gap-2">
        {contextScope && (
          <>
            <ContextPill scope={contextScope} onClear={onClearContextScope} />
            <div className="flex flex-wrap gap-1.5">
              {suggestionsForScope(contextScope).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="inline-flex items-center h-[26px] px-2.5 rounded-full border border-panora-border bg-white text-[12px] text-panora-text hover:bg-panora-bg/40 hover:border-panora-text-secondary/30 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
        <div
          className={cn(
            "rounded-2xl bg-white p-2 flex flex-col gap-2 transition-shadow",
            isDraggingOver
              ? "shadow-[0px_0px_0px_2px_#9dd5bb,0px_2px_8px_rgba(0,0,0,0.06)]"
              : draft.trim() || attachments.length > 0
                ? "shadow-[0px_0px_0px_2px_#9dd5bb,0px_2px_8px_rgba(0,0,0,0.06)]"
                : "shadow-[0px_0px_0px_1px_#d2cfc8,0px_1px_2px_rgba(0,0,0,0.04)]"
          )}
        >
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-1 pt-1">
              {attachments.map((f, idx) => (
                <AttachmentChip key={`${f.name}-${idx}`} file={f} onRemove={() => removeAttachment(idx)} />
              ))}
            </div>
          )}
          {isDraggingOver && (
            <div className="h-[44px] rounded-xl border border-dashed border-panora-green bg-panora-green/8 flex items-center justify-center gap-1.5">
              <CircleArrowDown className="w-3.5 h-3.5 text-panora-green" strokeWidth={1.75} />
              <span className="text-[11px] font-medium text-panora-green">
                Déposez vos fichiers ici
              </span>
            </div>
          )}
          <textarea
            ref={composerRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              autoGrow(e.target);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Reformuler, comparer, demander une justification…"
            rows={1}
            className="w-full px-2 pt-1 text-[13px] leading-[20px] text-panora-text bg-transparent outline-none resize-none placeholder:text-panora-text-muted"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-panora-text-muted hover:bg-panora-secondary hover:text-panora-text-secondary transition-colors"
                aria-label="Joindre un fichier"
                title="Joindre un fichier"
              >
                <Paperclip className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div ref={tipsRef} className="relative">
                <button
                  type="button"
                  onClick={() => setTipsOpen((v) => !v)}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                    tipsOpen
                      ? "bg-panora-secondary text-panora-text"
                      : "text-panora-text-muted hover:bg-panora-secondary hover:text-panora-text-secondary"
                  )}
                  aria-haspopup="menu"
                  aria-expanded={tipsOpen}
                  aria-label="Idées de prompts"
                  title="Idées de prompts"
                >
                  <Lightbulb className="w-4 h-4" strokeWidth={1.75} />
                </button>
                {tipsOpen && (
                  <PromptIdeasPopover onPick={applyTemplate} />
                )}
              </div>
            </div>
            <button
              onClick={send}
              disabled={(!draft.trim() && attachments.length === 0) || thinking}
              className={cn(
                "w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-colors",
                (draft.trim() || attachments.length > 0) && !thinking
                  ? "bg-[#173c2d] text-white hover:opacity-90"
                  : "bg-panora-secondary text-panora-text-muted cursor-not-allowed"
              )}
              aria-label="Envoyer"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Attachment shown in a sent user message — same shape as the composer chip
 *  but without the X. */
function SentAttachment({ attachment }: { attachment: ChatAttachment }) {
  const ext = attachment.name.split(".").pop()?.toUpperCase() ?? "";
  const kb = Math.max(1, Math.round(attachment.size / 1024));
  const sizeLabel = kb < 1024 ? `${kb} Ko` : `${(kb / 1024).toFixed(1)} Mo`;
  return (
    <div className="inline-flex items-center gap-1.5 max-w-[260px] bg-white border border-panora-border rounded-md px-2 py-1 shadow-[0px_1px_2px_rgba(0,0,0,0.04)]">
      <FileText className="w-3.5 h-3.5 text-panora-text-secondary shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-[12px] font-medium text-panora-text leading-[14px] truncate">{attachment.name}</span>
        <span className="text-[10px] text-panora-text-muted leading-[12px]">
          {ext}{ext && " · "}{sizeLabel}
        </span>
      </div>
    </div>
  );
}

/** Compact badge chip — matches Figma chat dropdoc component. */
function AttachmentChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center h-5 gap-1.5 pl-2 pr-1 bg-panora-secondary rounded-full max-w-[220px]">
      <Paperclip className="w-3 h-3 text-panora-text-secondary shrink-0" strokeWidth={1.75} />
      <span className="text-[12px] font-medium text-panora-text leading-none truncate">{file.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="w-3.5 h-3.5 flex items-center justify-center rounded-full text-panora-text-muted hover:text-panora-text transition-colors shrink-0"
        aria-label={`Retirer ${file.name}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

const PROMPT_IDEAS: { label: string; template: string }[] = [
  { label: "Comparer des garanties", template: "Compare les exclusions entre " },
  { label: "Vérifier une couverture", template: "Quelle offre couvre le risque de " },
  { label: "Expliquer une clause", template: "Explique-moi la clause " },
  { label: "Reformuler la synthèse", template: "Reformule la synthèse pour " },
  { label: "Rédiger un email", template: "Rédige un email pour " },
  { label: "Mettre en perspective", template: "Qu'est-ce qui change si " },
];

function PromptIdeasPopover({
  onPick,
}: {
  onPick: (template: string) => void;
}) {
  return (
    <div
      role="menu"
      className="absolute bottom-full left-0 mb-2 w-[280px] bg-white border border-panora-border rounded-lg shadow-[0px_8px_24px_rgba(0,0,0,0.10)] py-1.5 z-30"
    >
      <div className="px-3 pt-1 pb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-panora-text-muted">
        Idées de prompts
      </div>
      {PROMPT_IDEAS.map((idea) => (
        <button
          key={idea.template}
          role="menuitem"
          type="button"
          onClick={() => onPick(idea.template)}
          className="w-full flex flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-panora-secondary/40 transition-colors"
        >
          <span className="text-[12.5px] font-medium text-panora-text leading-5">
            {idea.label}
          </span>
          <span className="text-[11px] text-panora-text-muted leading-4 truncate w-full">
            {idea.template}…
          </span>
        </button>
      ))}
    </div>
  );
}

function EmptyState({
  onSuggestion,
  customSuggestions,
}: {
  insurers: InsurerData[];
  onSuggestion: (s: string) => void;
  customSuggestions?: string[];
}) {
  // General Chat tab: a single list of broad use cases instead of the
  // comparison-specific capability groups.
  if (customSuggestions && customSuggestions.length > 0) {
    return (
      <div className="flex-1 flex flex-col justify-center gap-5 pt-4">
        <h3 className="text-[30px] font-serif text-panora-text leading-[36px] tracking-[-0.01em] m-0">
          Votre copilote,
          <br />
          à vos côtés.
        </h3>
        <CapabilityGroup
          Icon={Sparkles}
          label="Par où commencer ?"
          suggestions={customSuggestions}
          onSuggestion={onSuggestion}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center gap-5 pt-4">
      <h3 className="text-[30px] font-serif text-panora-text leading-[36px] tracking-[-0.01em] m-0">
        Votre copilote,
        <br />
        à vos côtés.
      </h3>

      <CapabilityGroup
        Icon={MessageCircleMore}
        label="Posez vos questions"
        suggestions={[
          "Identifie les écarts entre les propositions",
          "Résume les exclusions de chaque assureur",
          "Évalue le rapport garanties/prime",
        ]}
        onSuggestion={onSuggestion}
      />

      <div className="h-px bg-panora-border" />

      <CapabilityGroup
        Icon={PenLine}
        label="Rédigez et modifiez votre synthèse client"
        suggestions={[
          "Reformule la synthèse pour un e-mail",
          "Modifier la synthèse",
        ]}
        onSuggestion={onSuggestion}
      />

      <div className="h-px bg-panora-border" />

      <CapabilityGroup
        Icon={Table2}
        label="Modifiez votre tableau comparatif"
        suggestions={[
          "Ajoute la garantie Cyber au comparatif",
          "Retire la ligne Plafond global",
        ]}
        onSuggestion={onSuggestion}
      />
    </div>
  );
}

function CapabilityGroup({
  Icon,
  label,
  suggestions,
  onSuggestion,
}: {
  Icon: typeof MessageCircleMore;
  label: string;
  suggestions: string[];
  onSuggestion: (s: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5 px-px">
        <Icon className="w-4 h-4 text-panora-text-muted" strokeWidth={1.75} />
        <span className="text-[12px] font-medium text-panora-text-muted leading-4">
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="text-left text-[13px] font-medium leading-5 text-panora-text px-3 py-2.5 rounded-[8px] bg-panora-secondary hover:bg-panora-secondary/70 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  insurers,
  onAccept,
  onReject,
  onAcceptRow,
  onRejectRow,
  onOpenDocPreview,
  onDownloadDoc,
  clientName,
}: {
  message: ChatMessage;
  insurers: InsurerData[];
  onAccept: () => void;
  onReject: () => void;
  onAcceptRow: () => void;
  onRejectRow: () => void;
  onOpenDocPreview?: (docId: string) => void;
  onDownloadDoc?: (docId: string, fileName: string, body: string) => void;
  clientName?: string;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5 max-w-full">
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5 max-w-[88%]">
            {message.attachments.map((a, idx) => (
              <SentAttachment key={`${a.name}-${idx}`} attachment={a} />
            ))}
          </div>
        )}
        {message.content && (
          <div className="max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-[20px] bg-[#173c2d] text-white">
            <p className="whitespace-pre-wrap break-words">
              {renderMarkdown(message.content)}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AgentReasoning />
      <p className="text-[13px] leading-[20px] text-panora-text whitespace-pre-wrap break-words">
        {renderMarkdown(message.content)}
      </p>
      {message.citedOffers && message.citedOffers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.citedOffers.map((id) => {
            const ins = insurers.find((i) => i.id === id);
            if (!ins) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center h-5 px-2 rounded-full bg-white border border-panora-border text-[11px] font-medium text-panora-text-secondary"
              >
                {ins.name}
              </span>
            );
          })}
        </div>
      )}
      {message.proposedSyntheseEdit && (
        <SyntheseEditDiff
          edit={message.proposedSyntheseEdit}
          onAccept={onAccept}
          onReject={onReject}
        />
      )}
      {message.proposedRowAddition && (
        <ProposedRowCard
          proposal={message.proposedRowAddition}
          insurers={insurers}
          onAccept={onAcceptRow}
          onReject={onRejectRow}
        />
      )}
      {message.proposedDocDraft && (
        <DocDraftCard
          draft={message.proposedDocDraft}
          clientName={clientName}
          onOpenPreview={onOpenDocPreview}
          onDownload={onDownloadDoc}
        />
      )}
      <AgentActions content={message.content} />
    </div>
  );
}

// Mock reasoning steps — same set for every agent response in the demo. The
// "real" version would attach steps to the ChatMessage; for the prototype this
// gives the visual treatment without changing the data model.
const REASONING_STEPS: { Icon: typeof FileText; label: string }[] = [
  { Icon: FileText, label: "Lecture des conditions générales" },
  { Icon: ScanText, label: "Extraction des garanties souscrites" },
  { Icon: PenLine, label: "Rédaction de la réponse" },
];

function AgentReasoning() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-[12px] text-panora-text-secondary hover:text-panora-text transition-colors w-fit"
        aria-expanded={open}
      >
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 text-panora-text-muted transition-transform",
            open && "rotate-90"
          )}
        />
        <span>Résumé de l&apos;agent</span>
      </button>
      {open && (
        <ul className="flex flex-col gap-1 pl-[18px]">
          {REASONING_STEPS.map(({ Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 text-[12px] text-panora-text-secondary leading-5"
            >
              <Icon
                className="w-3.5 h-3.5 text-panora-text-muted shrink-0"
                strokeWidth={1.75}
              />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AgentActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="flex items-center gap-0.5 -ml-1.5">
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center justify-center w-7 h-7 rounded-md text-panora-text-muted hover:bg-panora-secondary/60 hover:text-panora-text-secondary transition-colors"
        aria-label="Copier la réponse"
        title={copied ? "Copié" : "Copier"}
      >
        <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => setFeedback((v) => (v === "up" ? null : "up"))}
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-md transition-colors",
          feedback === "up"
            ? "text-panora-green bg-panora-green-light"
            : "text-panora-text-muted hover:bg-panora-secondary/60 hover:text-panora-text-secondary"
        )}
        aria-label="Réponse utile"
        aria-pressed={feedback === "up"}
      >
        <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => setFeedback((v) => (v === "down" ? null : "down"))}
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-md transition-colors",
          feedback === "down"
            ? "text-panora-error bg-panora-error-bg"
            : "text-panora-text-muted hover:bg-panora-secondary/60 hover:text-panora-text-secondary"
        )}
        aria-label="Réponse à améliorer"
        aria-pressed={feedback === "down"}
      >
        <ThumbsDown className="w-3.5 h-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

/** Pill rendered above the composer when the broker scopes the question. */
function ContextPill({
  scope,
  onClear,
}: {
  scope: import("./CellActionBar").SelectedObject;
  onClear?: () => void;
}) {
  const label = (() => {
    if (scope.kind === "value") return `${scope.insurerName} · ${scope.rowLabel}`;
    if (scope.kind === "offer") return scope.insurerName;
    return scope.rowLabel;
  })();
  const kindLabel = scope.kind === "value" ? "Cellule" : scope.kind === "offer" ? "Offre" : "Garantie";
  return (
    <div className="inline-flex items-center gap-1.5 self-start max-w-full bg-panora-green/8 border border-panora-green/30 rounded-full pl-2 pr-1 py-1">
      <Sparkles className="w-3 h-3 text-panora-green shrink-0" />
      <span className="text-[10px] font-medium uppercase tracking-wider text-panora-green shrink-0">
        {kindLabel}
      </span>
      <span className="text-[12px] text-panora-text truncate max-w-[180px]">
        {label}
      </span>
      <button
        onClick={onClear}
        className="w-4 h-4 flex items-center justify-center rounded-full text-panora-text-muted hover:bg-panora-green/15 hover:text-panora-text transition-colors shrink-0"
        aria-label="Annuler le focus"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-panora-text-muted/60 animate-pulse" style={{ animationDelay: "0ms" }} />
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-panora-text-muted/60 animate-pulse" style={{ animationDelay: "150ms" }} />
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-panora-text-muted/60 animate-pulse" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

// Lightweight markdown — bold (**…**) only, leaves rest as text
function renderMarkdown(content: string): React.ReactNode {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}
