"use client";

import { useRef, useState } from "react";
import { ChevronDown, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRuleWithSource, lineProvenance } from "@/data/souscription-engine";
import type { DraftSection as Section } from "@/data/souscription-engine";
import type { DraftLine } from "@/data/souscription-mock";
import type { Provenance } from "@/data/souscription-engine";
import { TraceExpand } from "./TraceExpand";
import type { OverrideRecord } from "./types";

export function lineAnchorId(label: string): string {
  return "line-" + label.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

export interface SectionLineState {
  displayValue: (label: string) => string;
  overrides: Record<string, OverrideRecord>;
  confirmed: Set<string>;
  expandedLabel: string | null;
  onOpenFiche: (label: string) => void;
  onConfirm: (label: string) => void;
  onModify: (label: string) => void;
  onQuickEdit: (label: string, value: string) => void;
  onRevert: (label: string) => void;
  onApplyToVault: (label: string) => void;
}

/**
 * One product = one card (Tarif then Couverture), each rule its own flat box. An
 * agent hypothesis (à valider) shows Confirmer / Modifier directly on the box;
 * a sourced line opens its trace on click. Modifier always goes through the
 * co-pilote (a workflow that asks for the new value), never an inline input.
 */
export function DraftSection({
  section,
  state,
}: {
  section: Section;
  state: SectionLineState;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-panora-drop/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-panora-green/30"
      >
        <ChevronDown
          className={cn(
            "w-4 h-4 text-panora-text-muted transition-transform shrink-0",
            !open && "-rotate-90"
          )}
        />
        <span className="text-[14px] font-semibold text-panora-text flex-1 text-left">
          {section.label}
        </span>
        <span
          className={cn(
            "tabular-nums shrink-0",
            section.prime
              ? "text-[15px] font-semibold text-panora-text"
              : "text-[12px] italic text-panora-text-muted"
          )}
        >
          {section.prime ?? "non tarifée"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-4 border-t border-panora-border flex flex-col gap-4">
          {section.tarif.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <GroupLabel>Tarification</GroupLabel>
              {section.tarif.map((line) => (
                <SectionLine key={line.label} line={line} state={state} />
              ))}
            </div>
          )}

          {section.couverture.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <GroupLabel>Couverture</GroupLabel>
              {section.couverture.map((line) => (
                <SectionLine key={line.label} line={line} state={state} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-1 text-[11px] font-medium text-panora-text-muted uppercase tracking-[0.06em] leading-4">
      {children}
    </div>
  );
}

const PROV_BADGE: Record<Provenance, { label: string; className: string }> = {
  regle: { label: "règle", className: "bg-panora-green-light text-panora-green-dark" },
  agent: { label: "agent", className: "bg-panora-warning-bg text-panora-warning-text" },
  non_dispo: { label: "non dispo", className: "bg-panora-secondary text-panora-text-muted" },
};
const CONFIRMED_BADGE = {
  label: "confirmé",
  className: "bg-panora-green-light text-panora-green-dark",
};
// A hand-edited / chat-modified line is no longer rule-sourced. The badge must
// say so, not keep wearing the green "règle" it inherited (audit honesty).
const OVERRIDE_BADGE = {
  label: "override",
  className: "bg-panora-warning-bg text-panora-warning-text",
};

function ModifierButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-panora-border bg-white text-[12px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
    >
      Modifier
    </button>
  );
}

function RevertButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-panora-border bg-white text-[12px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
    >
      <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
      {label}
    </button>
  );
}

function SectionLine({
  line,
  state,
}: {
  line: DraftLine;
  state: SectionLineState;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef(false);

  const baseProv = lineProvenance(line);
  const isConfirmed = baseProv === "agent" && state.confirmed.has(line.label);
  const value = state.displayValue(line.label);
  const expanded = state.expandedLabel === line.label;
  const override = state.overrides[line.label] ?? null;
  const rule = line.ruleId ? getRuleWithSource(line.ruleId)?.rule : null;
  // agent hypothesis still awaiting confirmation → a "to validate" box
  const attention = baseProv === "agent" && !isConfirmed;

  // Quick hand-edit: click the value, type, Enter (Escape cancels). Distinct
  // from the guided chat "Modifier" — this is the fast, direct correction.
  function startEdit() {
    doneRef.current = false;
    setEditing(true);
    window.setTimeout(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.select();
      }
    }, 0);
  }
  function commitEdit() {
    if (doneRef.current) return;
    doneRef.current = true;
    const v = inputRef.current?.value.trim() ?? "";
    if (v && v !== value) state.onQuickEdit(line.label, v);
    setEditing(false);
  }
  function cancelEdit() {
    doneRef.current = true;
    setEditing(false);
  }

  const valueEl = editing ? (
    <span className="inline-flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        defaultValue={value}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            commitEdit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancelEdit();
          }
        }}
        onBlur={commitEdit}
        aria-label={`Nouvelle valeur pour ${line.label}`}
        className="w-[150px] h-7 px-2 rounded-md border border-panora-green/50 bg-white text-[13px] font-medium text-panora-text tabular-nums leading-5 outline-none focus:ring-2 focus:ring-panora-green/25"
      />
    </span>
  ) : (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        startEdit();
      }}
      className="group/val inline-flex items-center gap-1 shrink-0 -mr-1 px-1.5 py-0.5 rounded-md hover:bg-panora-secondary/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
      aria-label={`Modifier la valeur : ${line.label}`}
      title="Modifier la valeur"
    >
      <span className="text-[13px] font-medium text-panora-text tabular-nums leading-5">
        {value}
      </span>
      <Pencil
        className="w-3 h-3 text-panora-text-muted opacity-0 group-hover/val:opacity-100 transition-opacity shrink-0"
        strokeWidth={1.75}
      />
    </button>
  );

  const hasOverride = !!override;
  const badge = hasOverride
    ? OVERRIDE_BADGE
    : isConfirmed
      ? CONFIRMED_BADGE
      : baseProv
        ? PROV_BADGE[baseProv]
        : null;
  const provName = hasOverride
    ? "Modifié par le souscripteur"
    : isConfirmed
      ? "Confirmé par le souscripteur"
      : baseProv === "regle"
        ? (rule?.effet ?? "Règle du vault")
        : baseProv === "agent"
          ? "Hypothèse de l'agent, à confirmer"
          : "Aucune source, à compléter";

  const head = (
    <>
      <div className="flex items-center gap-3">
        <span className="flex-1 min-w-0 text-[13px] text-panora-text-secondary truncate">
          {line.label}
        </span>
        {valueEl}
      </div>
      {badge && (
        <div className="mt-1.5 flex items-center gap-1.5 min-w-0">
          <span
            className={cn(
              "inline-flex items-center h-[18px] px-1.5 rounded-[5px] text-[10px] font-semibold leading-none shrink-0",
              badge.className
            )}
          >
            {badge.label}
          </span>
          <span
            className={cn(
              "text-[12px] truncate",
              attention || hasOverride
                ? "text-panora-warning-text"
                : "text-panora-text-secondary"
            )}
          >
            {provName}
          </span>
        </div>
      )}
    </>
  );

  return (
    <div
      id={lineAnchorId(line.label)}
      className={cn(
        "group scroll-mt-4 rounded-lg border transition-colors",
        attention
          ? "border-panora-warning/40 bg-panora-warning-bg/50"
          : baseProv === "non_dispo"
            ? "border-panora-border bg-panora-drop"
            : "border-panora-border bg-panora-bg",
        expanded && "ring-1 ring-panora-green/25"
      )}
    >
      {attention ? (
        /* "To validate" box — Confirmer / Modifier are visible on it */
        <div className="px-3.5 py-2.5">
          {head}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => state.onConfirm(line.label)}
              className="btn-primary inline-flex items-center justify-center h-8 px-3.5 text-[12px] font-semibold leading-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Confirmer
            </button>
            <ModifierButton onClick={() => state.onModify(line.label)} />
            {hasOverride && (
              <RevertButton
                onClick={() => state.onRevert(line.label)}
                label={line.ruleId ? "Rétablir la règle" : "Rétablir l'origine"}
              />
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Sourced / confirmed line — click opens the trace */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => state.onOpenFiche(line.label)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                state.onOpenFiche(line.label);
              }
            }}
            className="px-3.5 py-2.5 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-panora-green/30"
          >
            {head}
          </div>

          {expanded && (
            <div className="px-3.5 pb-3 -mt-0.5 flex flex-col gap-2.5">
              {line.ruleId ? (
                <TraceExpand
                  ruleId={line.ruleId}
                  override={override}
                  onApplyToVault={() => state.onApplyToVault(line.label)}
                />
              ) : override ? (
                <div className="rounded-lg border border-panora-border bg-white px-3.5 py-2.5 flex flex-col gap-1">
                  <div className="text-[12px] text-panora-text-secondary leading-4">
                    Override manuel ·{" "}
                    <span className="text-panora-text-muted line-through">
                      {override.original}
                    </span>{" "}
                    →{" "}
                    <span className="text-panora-text font-medium">
                      {override.value}
                    </span>
                  </div>
                  <div className="text-[11px] text-panora-text-muted leading-4">
                    {override.author} · {override.at}
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                {hasOverride && (
                  <RevertButton
                    onClick={() => state.onRevert(line.label)}
                    label={line.ruleId ? "Rétablir la règle" : "Rétablir l'origine"}
                  />
                )}
                <ModifierButton onClick={() => state.onModify(line.label)} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
