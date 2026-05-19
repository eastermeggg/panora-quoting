"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  ChevronRight,
  Copy,
  FileText,
  Lightbulb,
  MessageCircleQuestion,
  PenLine,
  ScanText,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsurerData } from "@/data/mock";
import {
  type ChatMessage,
  type ChatContext,
  appendChatMessage,
  getChatSession,
  recordSyntheseEdit,
  respondToPrompt,
  updateSyntheseEditStatus,
} from "@/data/chatMock";
import { SyntheseEditDiff } from "./SyntheseEditDiff";

interface ComparisonChatProps {
  cotParamId: string;
  insurers: InsurerData[];
  productLabel: string;
  recommendedInsurerId: string | null;
  syntheseContent: string;
  onAcceptContentEdit: (next: string) => void;
  onClose: () => void;
}

export function ComparisonChat({
  cotParamId,
  insurers,
  productLabel,
  recommendedInsurerId,
  syntheseContent,
  onAcceptContentEdit,
  onClose,
}: ComparisonChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatSession(cotParamId).messages);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const tipsRef = useRef<HTMLDivElement>(null);

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

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  function send() {
    const text = draft.trim();
    if (!text || thinking) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    appendChatMessage(cotParamId, userMsg);
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
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

  return (
    <aside className="w-[380px] shrink-0 h-full border-l border-panora-border bg-[#faf8f5] flex flex-col">
      {/* Header */}
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

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.length === 0 ? (
          <EmptyState insurers={insurers} onSuggestion={(s) => setDraft(s)} />
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              insurers={insurers}
              onAccept={() => handleAcceptEdit(msg)}
              onReject={() => handleRejectEdit(msg)}
            />
          ))
        )}
        {thinking && <ThinkingDots />}
      </div>

      {/* Composer */}
      <div className="border-t border-panora-border p-3">
        <div className="rounded-xl border border-panora-border bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus-within:border-panora-green/40 transition-colors">
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
            className="w-full px-3 py-2.5 text-[13px] leading-[20px] text-panora-text bg-transparent outline-none resize-none placeholder:text-panora-text-muted"
          />
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-t border-panora-border">
            <div ref={tipsRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setTipsOpen((v) => !v)}
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-md transition-colors",
                  tipsOpen
                    ? "bg-panora-secondary text-panora-text"
                    : "text-panora-text-muted hover:bg-panora-secondary hover:text-panora-text-secondary"
                )}
                aria-haspopup="menu"
                aria-expanded={tipsOpen}
                aria-label="Idées de prompts"
                title="Idées de prompts"
              >
                <Lightbulb className="w-3.5 h-3.5" />
              </button>
              {tipsOpen && (
                <PromptIdeasPopover onPick={applyTemplate} />
              )}
            </div>
            <span className="text-[11px] text-panora-text-muted truncate">
              Entrée pour envoyer · Maj+Entrée pour aller à la ligne
            </span>
            <button
              onClick={send}
              disabled={!draft.trim() || thinking}
              className={cn(
                "w-7 h-7 shrink-0 flex items-center justify-center rounded-md transition-colors",
                draft.trim() && !thinking
                  ? "bg-panora-green text-white hover:opacity-90"
                  : "bg-panora-secondary text-panora-text-muted cursor-not-allowed"
              )}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
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
}: {
  insurers: InsurerData[];
  onSuggestion: (s: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-6 pt-4">
      <h3 className="text-[28px] font-serif text-panora-text leading-[34px] tracking-[-0.015em] m-0">
        Votre copilote,
        <br />
        à vos côtés.
      </h3>

      <div className="h-px bg-panora-border" />

      <CapabilityGroup
        Icon={MessageCircleQuestion}
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
    </div>
  );
}

function CapabilityGroup({
  Icon,
  label,
  suggestions,
  onSuggestion,
}: {
  Icon: typeof MessageCircleQuestion;
  label: string;
  suggestions: string[];
  onSuggestion: (s: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-panora-text-secondary" strokeWidth={1.75} />
        <span className="text-[12px] font-medium text-panora-text-secondary leading-5">
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="text-left text-[13px] leading-5 text-panora-text px-3 py-2.5 rounded-[8px] border border-panora-border bg-white hover:border-panora-text-secondary/40 hover:shadow-[0px_1px_2px_rgba(0,0,0,0.04)] transition-all"
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
}: {
  message: ChatMessage;
  insurers: InsurerData[];
  onAccept: () => void;
  onReject: () => void;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-[20px] bg-[#173c2d] text-white">
          <p className="whitespace-pre-wrap break-words">
            {renderMarkdown(message.content)}
          </p>
        </div>
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
