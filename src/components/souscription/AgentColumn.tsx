"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  MessageCircleMore,
  Pencil,
  ShieldCheck,
  Slash,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CopiloteMessage } from "./copilote";
import { SCENARIOS, type ScenarioMeta } from "./scenarioCommands";
import type { SuggestionGroup } from "./useCopilote";
import { UserAskCard } from "./UserAskCard";

/** Each empty-state action group gets a verb icon. */
const GROUP_ICON: Record<SuggestionGroup["key"], LucideIcon> = {
  comprendre: MessageCircleMore,
  ajuster: Pencil,
  verifier: ShieldCheck,
};

/** The full slash-command palette: the demo scenarios, plus /reset. */
const RESET_CMD: ScenarioMeta = {
  cmd: "/reset",
  label: "Réinitialiser le dossier",
  shows: "rejoue le brouillon depuis l'état initial",
};
const COMMANDS: ScenarioMeta[] = [...SCENARIOS, RESET_CMD];

/**
 * The souscription co-pilote — a full-page-height right rail. Same chat idiom as
 * the broker's `ComparisonChat` (plain agent text, green user bubbles, a
 * rounded composer, a serif empty state), with the souscription twist: it never
 * mutates on its own (every commit is a gated `UserAskCard`), and typing "/"
 * opens a palette of the demo scenarios rather than sending a message.
 */
export function AgentColumn({
  messages,
  suggestions,
  onSend,
  onApplyCard,
  onScopeCard,
  onCancelCard,
}: {
  messages: CopiloteMessage[];
  suggestions: SuggestionGroup[];
  onSend: (text: string) => void;
  onApplyCard: (id: string) => void;
  onScopeCard: (id: string) => void;
  onCancelCard: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Slash-command palette state, derived from the draft.
  const isSlash = draft.startsWith("/");
  const query = isSlash ? draft.slice(1).toLowerCase().trim() : "";
  const matches = isSlash
    ? COMMANDS.filter(
        (c) =>
          c.cmd.toLowerCase().includes(query) ||
          c.label.toLowerCase().includes(query)
      )
    : [];
  const paletteOpen = isSlash && matches.length > 0;
  const active = matches.length ? Math.min(activeIdx, matches.length - 1) : 0;

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  function runCommand(cmd: string) {
    onSend(cmd);
    setDraft("");
    setActiveIdx(0);
    if (composerRef.current) composerRef.current.style.height = "auto";
  }

  function submit() {
    if (paletteOpen) {
      runCommand(matches[active].cmd);
      return;
    }
    const q = draft.trim();
    if (!q) return;
    onSend(q);
    setDraft("");
    if (composerRef.current) composerRef.current.style.height = "auto";
  }

  function applySuggestion(text: string) {
    setDraft(text);
    setActiveIdx(0);
    window.setTimeout(() => {
      const ta = composerRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(text.length, text.length);
      autoGrow(ta);
    }, 0);
  }

  const hasDraft = draft.trim().length > 0;

  return (
    <aside className="w-[380px] shrink-0 border-l border-panora-border bg-white flex flex-col min-h-0">
      {/* Header */}
      <div className="h-[52px] shrink-0 border-b border-panora-border px-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-panora-green" />
        <span className="text-[13px] font-semibold text-panora-text leading-5">
          Co-pilote
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4"
      >
        {messages.length === 0 ? (
          <EmptyState suggestions={suggestions} onSuggestion={applySuggestion} />
        ) : (
          messages.map((m) =>
            m.card ? (
              <div key={m.id} className="max-w-[92%]">
                <UserAskCard
                  card={m.card}
                  status={m.status ?? "proposed"}
                  onApply={() => onApplyCard(m.id)}
                  onSecondary={() => onScopeCard(m.id)}
                  onCancel={() => onCancelCard(m.id)}
                />
              </div>
            ) : m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-[20px] bg-[#173c2d] text-white whitespace-pre-wrap break-words">
                  {m.text}
                </div>
              </div>
            ) : (
              <p
                key={m.id}
                className="text-[13px] leading-[20px] text-panora-text whitespace-pre-wrap break-words"
              >
                {m.text}
              </p>
            )
          )
        )}
      </div>

      {/* Composer */}
      <div className="p-3 relative">
        {paletteOpen && (
          <div
            role="listbox"
            aria-label="Scénarios de démo"
            className="absolute left-3 right-3 bottom-full mb-2 z-30 bg-white border border-panora-border rounded-xl shadow-[0px_12px_32px_-8px_rgba(34,32,26,0.18)] overflow-hidden"
          >
            <div className="px-3 py-2 flex items-center gap-1.5 border-b border-panora-border/70">
              <Sparkles className="w-3.5 h-3.5 text-panora-green" />
              <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-[0.06em] leading-4">
                Scénarios de démo
              </span>
            </div>
            <div className="max-h-[288px] overflow-y-auto py-1">
              {matches.map((c, i) => (
                <button
                  key={c.cmd}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    runCommand(c.cmd);
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={cn(
                    "w-full text-left px-3 py-2 flex flex-col gap-0.5 transition-colors",
                    i === active ? "bg-panora-drop" : "hover:bg-panora-drop/60"
                  )}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-[12px] font-medium text-panora-green-dark font-mono leading-4 shrink-0">
                      {c.cmd}
                    </span>
                    <span className="text-[13px] text-panora-text leading-4 truncate">
                      {c.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-panora-text-muted leading-4">
                    {c.shows}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl bg-white p-2 flex flex-col gap-2 transition-shadow",
            hasDraft
              ? "shadow-[0px_0px_0px_2px_#9dd5bb,0px_2px_8px_rgba(0,0,0,0.06)]"
              : "shadow-[0px_0px_0px_1px_#d2cfc8,0px_1px_2px_rgba(0,0,0,0.04)]"
          )}
        >
          <textarea
            ref={composerRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setActiveIdx(0);
              autoGrow(e.target);
            }}
            onKeyDown={(e) => {
              if (paletteOpen) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveIdx((i) => Math.min(i + 1, matches.length - 1));
                  return;
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIdx((i) => Math.max(i - 1, 0));
                  return;
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setDraft("");
                  setActiveIdx(0);
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  runCommand(matches[active].cmd);
                  return;
                }
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            aria-label="Une question ou une modification"
            placeholder="Une question, ou une modification…"
            className="w-full px-2 pt-1 text-[13px] leading-[20px] text-panora-text bg-transparent outline-none resize-none placeholder:text-panora-text-muted"
          />
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => applySuggestion("/")}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                paletteOpen
                  ? "bg-panora-secondary text-panora-text"
                  : "text-panora-text-muted hover:bg-panora-secondary hover:text-panora-text-secondary"
              )}
              aria-label="Scénarios de démo"
              title="Scénarios de démo"
            >
              <Slash className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!hasDraft}
              className={cn(
                "w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-colors",
                hasDraft
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

function EmptyState({
  suggestions,
  onSuggestion,
}: {
  suggestions: SuggestionGroup[];
  onSuggestion: (s: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center gap-5 pt-4">
      <h3 className="text-[30px] font-serif text-panora-text leading-[36px] tracking-[-0.01em] m-0">
        Votre co-pilote,
        <br />
        à vos côtés.
      </h3>

      {suggestions.map((group) => {
        const Icon = GROUP_ICON[group.key];
        return (
          <div key={group.key} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 px-px">
              <Icon className="w-4 h-4 text-panora-text-muted" strokeWidth={1.75} />
              <span className="text-[12px] font-medium text-panora-text-muted leading-4">
                {group.label}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {group.items.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSuggestion(s)}
                  className="text-left text-[13px] font-medium leading-5 text-panora-text px-3 py-2.5 rounded-[8px] bg-panora-secondary hover:bg-panora-secondary/70 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <p className="text-[12px] text-panora-text-muted leading-5">
        Rien n&apos;est appliqué sans votre validation.
      </p>
    </div>
  );
}
