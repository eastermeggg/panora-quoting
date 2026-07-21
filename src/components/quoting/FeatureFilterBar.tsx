"use client";

import { useEffect, useRef, useState } from "react";
import { UserRound, CircleDashed, Package, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* Shared feature filter bar (analyse, comparaison, cotation) — Figma 9919-19731.
 * Chips: Collaborateur (the scope lens, default "Vous", green when it narrows) ·
 * Statuts · Produits · Réinit. The Collaborateur lens is what powers the
 * Vous ⇄ Équipe empty-state toggle; Statuts/Produits are attribute filters. */

export type Scope = "moi" | "equipe" | string; // string = a colleague's name

export function FeatureFilterBar({
  scope,
  onScopeChange,
  colleagues,
  onReset,
}: {
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  /** Distinct colleague authors present in the data, for the scope menu. */
  colleagues: string[];
  /** Réinit. — back to the default view (Collaborateur: Vous). */
  onReset?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-panora-border bg-white px-5 py-3.5">
      <CollaborateurChip scope={scope} onChange={onScopeChange} colleagues={colleagues} />
      <FilterPill icon={CircleDashed} label="Statuts" value="Tous" />
      <FilterPill icon={Package} label="Produits" value="Tous" />
      <button
        type="button"
        onClick={onReset ?? (() => onScopeChange("moi"))}
        className="flex items-center gap-2 rounded-lg bg-[#eae7e0] px-3 py-1.5 text-[13px] font-medium text-[#63635e] transition-colors hover:bg-[#e0ddd5]"
      >
        <X className="h-4 w-4" />
        Réinit.
      </button>
    </div>
  );
}

function scopeValue(scope: Scope): string {
  if (scope === "moi") return "Vous";
  if (scope === "equipe") return "Toute l'équipe";
  return scope;
}

function CollaborateurChip({
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

  // Green (active) whenever the lens narrows to a person; neutral for "Toute
  // l'équipe" (no narrowing).
  const active = scope !== "equipe";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[13px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors",
          active
            ? "border-[rgba(0,162,114,0.4)] bg-[#ebf3ef]"
            : "border-panora-border bg-white hover:bg-panora-drop"
        )}
      >
        <UserRound
          className={cn(
            "h-4 w-4",
            active ? "text-panora-green" : "text-panora-text-muted"
          )}
          strokeWidth={1.9}
        />
        <span className="text-panora-text-secondary">Collaborateur</span>
        <span className="font-medium text-panora-text">{scopeValue(scope)}</span>
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
            label="Vous"
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
      className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[13px] text-panora-text transition-colors hover:bg-panora-drop"
    >
      {label}
      {active && <Check className="h-3.5 w-3.5 text-panora-green" />}
    </button>
  );
}

function FilterPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleDashed;
  label: string;
  value: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-lg border border-panora-border bg-white px-2 py-1.5 text-[13px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-panora-drop"
    >
      <Icon className="h-4 w-4 text-panora-text-muted" strokeWidth={1.75} />
      <span className="text-panora-text-secondary">{label}</span>
      <span className="font-medium text-panora-text">{value}</span>
      <ChevronDown className="h-3.5 w-3.5 text-panora-text-muted" />
    </button>
  );
}
