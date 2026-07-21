"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { ListFilter, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/data/mock";

/* Shared feature filter bar (analyse, comparaison, cotation). The leftmost
 * chip is the SCOPE lens — "Réalisé par" — defaulting to the current user
 * ("Moi"); it's what powers the Mine ⇄ Équipe empty-state toggle. Status /
 * Types are attribute filters, kept visually secondary. */

export type Scope = "moi" | "equipe" | string; // string = a colleague's name

export function FeatureFilterBar({
  scope,
  onScopeChange,
  colleagues,
}: {
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  /** Distinct colleague authors present in the data, for the scope menu. */
  colleagues: string[];
}) {
  return (
    <div className="shrink-0 border-b border-panora-border bg-white px-5 py-2.5 flex items-center gap-3">
      {/* Scope lens — pulled to the far left, avatar-led */}
      <ScopeChip scope={scope} onChange={onScopeChange} colleagues={colleagues} />

      <span className="h-5 w-px bg-panora-border" />

      {/* Attribute filters (visual for now, matching the existing bar) */}
      <span className="flex items-center gap-1.5 text-[13px] text-panora-text-muted">
        <ListFilter className="h-3.5 w-3.5" />
        Filtres
      </span>
      <FilterPill label="Statut" value="Tous" />
      <FilterPill label="Types" value="Tous" />
    </div>
  );
}

function scopeLabel(scope: Scope): string {
  if (scope === "moi") return "Moi";
  if (scope === "equipe") return "Toute l'équipe";
  return scope;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function ScopeChip({
  scope,
  onChange,
  colleagues,
}: {
  scope: Scope;
  onChange: (scope: Scope) => void;
  colleagues: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const isMine = scope === "moi";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-lg border py-1 pl-1 pr-2.5 text-[13px] font-medium transition-colors",
          isMine
            ? "border-panora-green-border bg-panora-green-light text-panora-text"
            : "border-panora-border bg-white text-panora-text hover:bg-panora-drop"
        )}
      >
        {isMine && currentUser.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt=""
            className="h-6 w-6 rounded-md object-cover"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-panora-green/20 text-[10px] font-semibold text-panora-green-dark">
            {scope === "equipe" ? "★" : initials(scopeLabel(scope))}
          </span>
        )}
        <span className="text-panora-text-secondary">Réalisé par&nbsp;:</span>
        <span>{scopeLabel(scope)}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-panora-text-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[220px] rounded-lg border border-panora-border bg-white py-1 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]">
          <ScopeOption
            label="Moi"
            active={scope === "moi"}
            onClick={() => {
              onChange("moi");
              setOpen(false);
            }}
          />
          <ScopeOption
            label="Toute l'équipe"
            active={scope === "equipe"}
            onClick={() => {
              onChange("equipe");
              setOpen(false);
            }}
          />
          {colleagues.length > 0 && (
            <>
              <div className="my-1 h-px bg-panora-border" />
              <p className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-panora-text-muted">
                Collègues
              </p>
              {colleagues.map((name) => (
                <ScopeOption
                  key={name}
                  label={name}
                  active={scope === name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ScopeOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[13px] text-panora-text hover:bg-panora-drop transition-colors"
    >
      {label}
      {active && <Check className="h-3.5 w-3.5 text-panora-green" />}
    </button>
  );
}

function FilterPill({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-lg border border-panora-border bg-white px-2.5 py-1 text-[13px] text-panora-text-secondary hover:bg-panora-drop transition-colors"
    >
      <span className="text-panora-text-muted">{label} :</span>
      <span className="font-medium text-panora-text">{value}</span>
      <ChevronDown className="h-3.5 w-3.5 text-panora-text-muted" />
    </button>
  );
}
