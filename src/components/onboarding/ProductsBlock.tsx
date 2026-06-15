"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { masterProducts, type InsuranceProduct } from "@/data/settings-mock";
import { StepNumber } from "@/components/onboarding/StepNumber";
import {
  useQuotedProducts,
  addQuotedProduct,
  removeQuotedProduct,
} from "@/data/products-store";

/**
 * "Produits que vous cotez régulièrement" — the first block of the Portails
 * step (spec §3.1). A search bar over the master product list, with the
 * selected products shown as removable pills below. Kept independent from the
 * Extranets block.
 */
export function ProductsBlock({ step }: { step?: number }) {
  const selected = useQuotedProducts();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return masterProducts.filter(
      (p) =>
        !selectedSet.has(p.id) &&
        (q === "" || p.id.toLowerCase().includes(q))
    );
  }, [query, selectedSet]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function add(product: InsuranceProduct) {
    addQuotedProduct(product);
    setQuery("");
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {step !== undefined && <StepNumber n={step} />}
        <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
          Produits que vous cotez régulièrement
        </h2>
      </div>

      {/* Search + dropdown */}
      <div className="relative" ref={wrapRef}>
        <div
          className={cn(
            "flex items-center gap-2.5 h-[42px] px-3.5 rounded-lg bg-white border transition-colors",
            open
              ? "border-panora-green-border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
              : "border-panora-border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          )}
        >
          <Search className="w-4 h-4 text-panora-text-muted shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Rechercher un produit (Auto, RC Pro, Flotte…)"
            className="flex-1 text-[14px] leading-5 text-panora-text placeholder:text-panora-text-muted bg-transparent outline-none"
          />
        </div>

        {open && (
          <div className="absolute z-20 mt-1.5 w-full max-h-[240px] overflow-y-auto rounded-lg bg-white border border-panora-border shadow-[0px_8px_24px_-8px_rgba(0,0,0,0.16)] py-1.5">
            {matches.length === 0 ? (
              <p className="px-3.5 py-2 text-[13px] text-panora-text-muted">
                Aucun produit à ajouter.
              </p>
            ) : (
              matches.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => add(p.id)}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2 text-left hover:bg-panora-secondary/50 transition-colors"
                >
                  <span className="inline-flex items-center gap-2 text-[13px] text-panora-text">
                    {p.id}
                    {p.isNew && (
                      <span className="inline-flex items-center gap-1 px-1.5 h-[18px] rounded-full bg-purple-100 text-[10px] font-semibold text-purple-700">
                        <Sparkles className="w-2.5 h-2.5" />
                        Nouveau
                      </span>
                    )}
                  </span>
                  <Plus className="w-3.5 h-3.5 text-panora-text-muted" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected pills */}
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((product) => (
            <span
              key={product}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 h-7 rounded-full bg-panora-green-light text-[12px] font-medium text-panora-green-dark"
            >
              {product}
              <button
                type="button"
                onClick={() => removeQuotedProduct(product)}
                aria-label={`Retirer ${product}`}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-panora-green/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-panora-text-muted leading-4">
          Aucun produit sélectionné pour l&apos;instant.
        </p>
      )}
    </section>
  );
}
