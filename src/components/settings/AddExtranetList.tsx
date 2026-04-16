"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Settings, Plus, X, SlidersHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { ProductBadge } from "./ProductBadge";
import {
  availableExtranets,
  configuredExtranets,
  type InsuranceProduct,
  type AvailableExtranet,
} from "@/data/settings-mock";

// Collect all unique products across all extranets for filter options
const allProducts: InsuranceProduct[] = Array.from(
  new Set(
    availableExtranets.flatMap((e) => e.modelizedProducts.map((p) => p.product))
  )
);

// ── Product filter dropdown ──

function ProductFilterDropdown({
  selected,
  onChange,
}: {
  selected: Set<InsuranceProduct>;
  onChange: (next: Set<InsuranceProduct>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function toggle(product: InsuranceProduct) {
    const next = new Set(selected);
    if (next.has(product)) next.delete(product);
    else next.add(product);
    onChange(next);
  }

  const count = selected.size;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 h-[38px] rounded-lg border text-[13px] font-medium leading-5 transition-colors duration-150",
          count > 0
            ? "border-panora-green/40 bg-panora-green-light text-panora-green-dark"
            : "border-panora-border bg-white text-panora-text-secondary hover:bg-panora-drop"
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Produits</span>
        {count > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-panora-green text-white text-[10px] font-semibold">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-[220px] bg-white border border-panora-border rounded-lg shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] z-50 py-1.5 max-h-[320px] overflow-y-auto">
          {count > 0 && (
            <>
              <button
                onClick={() => onChange(new Set())}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-panora-text-muted hover:bg-panora-drop transition-colors duration-150 w-full text-left"
              >
                Tout effacer
              </button>
              <div className="h-px bg-panora-border mx-2 my-1" />
            </>
          )}

          {allProducts.map((product) => {
            const isSelected = selected.has(product);
            return (
              <button
                key={product}
                onClick={() => toggle(product)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 text-[13px] w-full text-left transition-colors duration-150",
                  isSelected
                    ? "text-panora-text bg-panora-green-light/50"
                    : "text-panora-text-secondary hover:bg-panora-drop"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors duration-150",
                    isSelected
                      ? "bg-panora-green border-panora-green"
                      : "border-panora-border"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-medium flex-1">{product}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Row component ──

function ExtranetRow({
  extranet,
  configuredCount = 0,
  onConfigure,
}: {
  extranet: AvailableExtranet;
  configuredCount?: number;
  onConfigure?: (extranet: AvailableExtranet) => void;
}) {
  const isConfigured = configuredCount > 0;
  const hasNoModelized = extranet.modelizedProducts.length === 0;

  return (
    <div className="flex items-center px-5 py-3.5 transition-colors duration-150 hover:bg-panora-drop/50 group/row">
      {/* Logo */}
      <div className="shrink-0 mr-4">
        <InsurerLogo
          insurerId={extranet.insurerId}
          name={extranet.insurerName}
          size="lg"
        />
      </div>

      {/* Name + portal info */}
      <div className="w-[220px] shrink-0 min-w-0 mr-5 flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold text-panora-text leading-5 font-display truncate">
          {extranet.insurerName}
        </span>
        <span className="text-[11px] text-panora-text-muted leading-4 truncate">
          {extranet.portalLabel
            ? `${extranet.portalLabel} · ${extranet.portalUrl}`
            : extranet.portalUrl}
        </span>
      </div>

      {/* Products */}
      <div className="flex-1 flex flex-wrap gap-1 min-w-0">
        {hasNoModelized ? (
          <span className="text-[11px] text-panora-text-muted italic">
            Aucun produit modélisé
          </span>
        ) : (
          extranet.modelizedProducts.map((p) => (
            <ProductBadge
              key={p.product}
              product={p.product}
              variant={p.isNew ? "new" : "modelized"}
            />
          ))
        )}
      </div>

      {/* Configure action */}
      <div className="flex items-center gap-2.5 shrink-0 ml-4">
        {isConfigured && (
          <span className="inline-flex items-center px-1.5 h-5 rounded bg-panora-secondary text-[10px] font-medium text-panora-text-secondary leading-3">
            {configuredCount} accès
          </span>
        )}
        <button
          onClick={() => onConfigure?.(extranet)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-panora-green leading-5 opacity-70 group-hover/row:opacity-100 hover:underline transition-all duration-150 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-panora-green focus-visible:outline-offset-2 rounded"
        >
          <Settings className="w-3.5 h-3.5" />
          {isConfigured ? "Ajouter un accès" : "Configurer"}
        </button>
      </div>
    </div>
  );
}

// ── Main component ──

export function AddExtranetList({
  onConfigure,
}: {
  onConfigure?: (extranet: AvailableExtranet) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState<Set<InsuranceProduct>>(
    new Set()
  );

  // Count how many credentials exist per catalog entry
  const configuredCountByEntry = new Map<string, number>();
  for (const c of configuredExtranets) {
    if (c.catalogEntryId) {
      configuredCountByEntry.set(
        c.catalogEntryId,
        (configuredCountByEntry.get(c.catalogEntryId) ?? 0) + 1
      );
    }
  }

  // Apply search
  const searchFiltered = availableExtranets.filter((e) =>
    e.insurerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply product filter (match ANY selected product)
  const filtered =
    productFilter.size > 0
      ? searchFiltered.filter((e) =>
          e.modelizedProducts.some((p) => productFilter.has(p.product))
        )
      : searchFiltered;

  const hasActiveFilters = searchQuery || productFilter.size > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
          Catalogue extranets
        </h2>
        <button className="flex items-center gap-1.5 text-[12px] font-medium text-panora-text-muted leading-5 hover:text-panora-green transition-colors duration-150">
          <Plus className="w-3.5 h-3.5" />
          Compagnie non listée ?
        </button>
      </div>

      {/* Toolbar: Search + Product filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)] flex items-center gap-1.5 px-3 py-2 focus-within:border-panora-green/40 transition-colors duration-150">
          <Search className="w-4 h-4 text-panora-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Rechercher un assureur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-[13px] leading-5 text-panora-text placeholder:text-panora-text-muted bg-transparent outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="shrink-0 p-0.5 rounded hover:bg-panora-border/40 transition-colors duration-150"
            >
              <X className="w-3.5 h-3.5 text-panora-text-muted" />
            </button>
          )}
        </div>
        <ProductFilterDropdown
          selected={productFilter}
          onChange={setProductFilter}
        />
      </div>

      {/* Active filter pills */}
      {productFilter.size > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from(productFilter).map((product) => (
            <button
              key={product}
              onClick={() => {
                const next = new Set(productFilter);
                next.delete(product);
                setProductFilter(next);
              }}
              className="inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-medium bg-panora-green-light text-panora-green-dark hover:bg-panora-green-light/70 transition-colors duration-150"
            >
              {product}
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={() => setProductFilter(new Set())}
            className="text-[11px] font-medium text-panora-text-muted hover:text-panora-text-secondary transition-colors duration-150 ml-1"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Extranets list */}
      <div className="border border-panora-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[13px] text-panora-text-muted leading-5">
              {hasActiveFilters
                ? "Aucun assureur ne correspond à vos critères."
                : "Tous les assureurs disponibles sont déjà configurés."}
            </p>
          </div>
        ) : (
          filtered.map((extranet, i) => (
            <div
              key={extranet.id}
              className={cn(
                i < filtered.length - 1 && "border-b border-panora-border/70"
              )}
            >
              <ExtranetRow
                extranet={extranet}
                configuredCount={configuredCountByEntry.get(extranet.id) ?? 0}
                onConfigure={onConfigure}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
