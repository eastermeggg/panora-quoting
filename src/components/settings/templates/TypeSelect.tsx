"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getKnownTypes } from "@/data/templates-mock";

interface TypeSelectProps {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  variant?: "pills" | "compact";
}

export function TypeSelect({ value, onChange, variant = "pills" }: TypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [knownTypes, setKnownTypes] = useState<string[]>(() => getKnownTypes());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // Refresh on open in case other surfaces created types
      setKnownTypes(getKnownTypes());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const lowerQuery = query.trim().toLowerCase();
  const filtered = knownTypes.filter((t) => t.toLowerCase().includes(lowerQuery));
  const exactMatch = knownTypes.some((t) => t.toLowerCase() === lowerQuery);
  const canCreate = lowerQuery.length > 0 && !exactMatch;

  function commit(next: string | undefined) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative inline-block w-full" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-1.5 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] cursor-pointer text-left transition-colors hover:bg-panora-bg",
          variant === "pills" ? "h-[34px] px-2.5" : "h-[32px] px-2.5",
          open && "border-panora-green/40"
        )}
      >
        <span className="min-w-0 flex-1 truncate">
          {value ? (
            <span className="text-[13px] text-panora-text">{value}</span>
          ) : (
            <span className="text-[13px] text-panora-text-muted">Type</span>
          )}
        </span>
        <span className="flex items-center gap-0.5 shrink-0">
          {value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-panora-secondary/60 text-panora-text-muted"
              title="Retirer le type"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={cn("w-3.5 h-3.5 text-panora-text-muted transition-transform", open && "rotate-180")} />
        </span>
      </button>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-panora-border rounded-lg shadow-[0px_8px_24px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-2.5 py-2 border-b border-panora-border flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-panora-text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCreate) {
                  e.preventDefault();
                  commit(query.trim());
                }
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                }
              }}
              placeholder="Rechercher ou créer un type"
              className="flex-1 text-[12px] outline-none bg-transparent text-panora-text placeholder:text-panora-text-muted"
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto">
            {filtered.map((t) => (
              <button
                key={t}
                onClick={() => commit(t)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-panora-text hover:bg-panora-bg transition-colors"
              >
                <span className="flex-1">{t}</span>
                {value === t && <Check className="w-3 h-3 text-panora-green" />}
              </button>
            ))}
            {filtered.length === 0 && !canCreate && (
              <div className="px-3 py-3 text-[12px] text-panora-text-muted text-center">
                Aucun type correspondant.
              </div>
            )}
            {canCreate && (
              <button
                onClick={() => commit(query.trim())}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] text-panora-green font-medium hover:bg-panora-green/5 transition-colors border-t border-panora-border"
              >
                <Plus className="w-3.5 h-3.5" />
                Créer le type «&nbsp;{query.trim()}&nbsp;»
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Read-only display of a type pill — same shape as product pills, in a navy slate to differentiate. */
export function TypePill({ type }: { type: string | undefined }) {
  if (!type) return null;
  return (
    <span className="self-start w-fit inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-[#1a3a52]/[0.08] text-[#1a3a52] border border-[#1a3a52]/20">
      {type}
    </span>
  );
}
