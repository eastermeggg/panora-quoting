"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRODUCT_TAG_OPTIONS } from "@/data/templates-mock";

interface ProductTagSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  /** Display variant — "pills" (used in detail view, full size) or "compact" (small chips) */
  variant?: "pills" | "compact";
}

export function ProductTagSelect({ value, onChange, variant = "pills" }: ProductTagSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const valueSet = new Set(value);
  const filtered = PRODUCT_TAG_OPTIONS.filter(
    (p) => !valueSet.has(p) && p.toLowerCase().includes(query.toLowerCase())
  );

  function toggle(product: string) {
    if (valueSet.has(product)) {
      onChange(value.filter((p) => p !== product));
    } else {
      onChange([...value, product]);
    }
  }

  const isEmpty = value.length === 0;

  return (
    <div className="relative" ref={ref}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] cursor-pointer transition-colors hover:bg-panora-bg",
          variant === "pills"
            ? isEmpty
              ? "min-h-[34px] px-2.5 py-1.5"
              : "min-h-[34px] px-2 py-1.5"
            : isEmpty
              ? "h-[32px] px-2.5"
              : "min-h-[32px] px-2 py-1",
          open && "border-panora-green/40"
        )}
        onClick={() => setOpen(true)}
      >
        {isEmpty ? (
          <>
            <span className="text-[13px] text-panora-text-muted flex-1 truncate">
              Produits
            </span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-panora-text-muted transition-transform shrink-0",
                open && "rotate-180"
              )}
            />
          </>
        ) : (
          <>
            {value.map((p) => (
              <span
                key={p}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full bg-panora-green/10 text-panora-green border border-panora-green/20 font-medium",
                  variant === "pills"
                    ? "h-6 pl-2 pr-1 text-[12px]"
                    : "h-5 pl-1.5 pr-0.5 text-[11px]"
                )}
              >
                {p}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(p);
                  }}
                  className="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full hover:bg-panora-green/20"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              className={cn(
                "inline-flex items-center gap-0.5 font-medium text-panora-text-muted hover:text-panora-text transition-colors px-1 ml-auto",
                variant === "pills" ? "text-[11px]" : "text-[10px]"
              )}
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          </>
        )}
      </div>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-panora-border rounded-lg shadow-[0px_8px_24px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-2.5 py-2 border-b border-panora-border flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-panora-text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit"
              className="flex-1 text-[12px] outline-none bg-transparent text-panora-text placeholder:text-panora-text-muted"
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-[12px] text-panora-text-muted text-center">
                Aucun produit correspondant.
              </div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    toggle(p);
                    setQuery("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] text-panora-text hover:bg-panora-bg transition-colors"
                >
                  <span className="flex-1">{p}</span>
                  {valueSet.has(p) && <Check className="w-3 h-3 text-panora-green" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Read-only display of product pills — used on cards.
 */
export function ProductTagPills({ products }: { products: string[] }) {
  if (products.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {products.map((p) => (
        <span
          key={p}
          className="inline-flex items-center h-5 px-2 rounded-full bg-panora-green/10 text-panora-green border border-panora-green/20 text-[10px] font-medium"
        >
          {p}
        </span>
      ))}
    </div>
  );
}
