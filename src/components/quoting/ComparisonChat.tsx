"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle, Sparkles, X } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

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
    <aside className="w-[380px] shrink-0 h-full border-l border-panora-border bg-white flex flex-col">
      {/* Header */}
      <div className="h-[44px] shrink-0 border-b border-panora-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-panora-green" />
          <span className="text-[13px] font-semibold text-panora-text">Copilote</span>
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
          <div className="flex items-center justify-between px-3 py-2 border-t border-panora-border">
            <span className="text-[11px] text-panora-text-muted">
              Entrée pour envoyer · Maj+Entrée pour aller à la ligne
            </span>
            <button
              onClick={send}
              disabled={!draft.trim() || thinking}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-md transition-colors",
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

function EmptyState({
  insurers,
  onSuggestion,
}: {
  insurers: InsurerData[];
  onSuggestion: (s: string) => void;
}) {
  const [a, b] = insurers;
  const suggestions = [
    a && b ? `Compare les exclusions entre ${a.name} et ${b.name}` : null,
    `Reformule l'argumentaire pour un dirigeant non-technique`,
    `Quelle offre couvre la perte d'exploitation ?`,
  ].filter((s): s is string => Boolean(s));

  return (
    <div className="flex flex-col items-center text-center gap-3 py-6">
      <div className="w-9 h-9 rounded-full bg-panora-green/10 flex items-center justify-center">
        <MessageCircle className="w-4 h-4 text-panora-green" />
      </div>
      <p className="text-[13px] font-medium text-panora-text leading-5 max-w-[280px]">
        Demande une reformulation, une comparaison, ou interroge les offres.
      </p>
      <p className="text-[12px] text-panora-text-muted leading-[18px] max-w-[280px]">
        Le copilote s&apos;appuie sur les devis reçus, ne fabrique pas de données absentes.
      </p>
      <div className="flex flex-col gap-1.5 w-full mt-1">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="text-left text-[12px] text-panora-text px-3 py-2 rounded-lg border border-panora-border hover:bg-panora-bg transition-colors"
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
  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-[20px]",
          isUser
            ? "bg-panora-green text-white"
            : "bg-panora-bg text-panora-text border border-panora-border"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{renderMarkdown(message.content)}</p>
      </div>
      {!isUser && message.citedOffers && message.citedOffers.length > 0 && (
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
      {!isUser && message.proposedSyntheseEdit && (
        <SyntheseEditDiff
          edit={message.proposedSyntheseEdit}
          onAccept={onAccept}
          onReject={onReject}
        />
      )}
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
