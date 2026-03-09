"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { availableInsurers } from "@/data/mock";

interface InsurerSelectorProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  product?: string;
}

export function InsurerSelector({
  selectedIds,
  onToggle,
  product = "Automobile",
}: InsurerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const withCode = availableInsurers.filter((i) => i.hasCode);
  const withoutCode = availableInsurers.filter((i) => !i.hasCode);
  const filtered = withCode.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      {/* Selected chips */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selectedIds.map((id) => {
            const insurer = availableInsurers.find((i) => i.id === id);
            if (!insurer) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-panora-green-light rounded-md text-sm text-panora-green"
              >
                {insurer.logo && <span className="text-xs">{insurer.logo}</span>}
                <span className="font-medium">{insurer.name}</span>
                <Check className="w-3.5 h-3.5" />
              </span>
            );
          })}
        </div>
      )}

      {/* Search input */}
      <div
        className="relative"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-panora-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un assureur à solliciter..."
          className="w-full bg-white border border-panora-border rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green transition-colors"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-panora-border rounded-lg shadow-lg z-20 overflow-hidden">
          {/* Info header */}
          <div className="px-3 py-2 bg-panora-tag/50 border-b border-panora-border">
            <p className="text-xs text-panora-text-muted">
              <span className="font-medium">{withCode.length} disponibles</span>{" "}
              · {withoutCode.length} sans code
            </p>
            <p className="text-xs text-panora-text-muted mt-0.5">
              Assureurs filtrés sur le produit {product} et les flows mappés
              avec un code extranet actif.
            </p>
          </div>

          {/* Selectable items */}
          <div className="max-h-[240px] overflow-y-auto">
            {filtered.map((insurer) => {
              const isSelected = selectedIds.includes(insurer.id);
              return (
                <button
                  key={insurer.id}
                  onClick={() => onToggle(insurer.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors",
                    "hover:bg-panora-tag/50",
                    isSelected && "bg-panora-green-light/50"
                  )}
                >
                  <span className="text-base w-5 text-center">{insurer.logo}</span>
                  <span className="text-sm font-medium text-panora-text flex-1">
                    {insurer.name}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-panora-green" />
                  )}
                </button>
              );
            })}

            {/* Without code */}
            {withoutCode.length > 0 && (
              <div className="border-t border-panora-border">
                {withoutCode.map((insurer) => (
                  <div
                    key={insurer.id}
                    className="flex items-center gap-3 px-3 py-2.5 opacity-60"
                  >
                    <div className="w-5 h-5 rounded bg-gray-200" />
                    <span className="text-sm text-panora-text-muted flex-1">
                      {insurer.name}
                    </span>
                    <button className="flex items-center gap-1 text-xs text-panora-green font-medium hover:underline">
                      <Plus className="w-3 h-3" />
                      Ajouter mes codes extranets
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
