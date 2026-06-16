"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  X,
  CornerDownLeft,
  ExternalLink,
  Check,
  Send,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { ProductBadge } from "@/components/settings/ProductBadge";
import {
  availableExtranets,
  masterProducts,
  type AvailableExtranet,
  type InsuranceProduct,
} from "@/data/settings-mock";

interface InsurerCommandBarProps {
  /** Kept for API stability; no longer rendered in the rows. */
  configuredCatalogIds?: Set<string>;
  onSelect: (extranet: AvailableExtranet) => void;
}

export function InsurerCommandBar({ onSelect }: InsurerCommandBarProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // ⌘K shortcut to open
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="group w-full flex items-center gap-3 px-4 h-14 bg-white border border-panora-border rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:border-panora-text-muted/40 hover:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06)] transition-all text-left"
      >
        <Search className="w-4 h-4 text-panora-text-muted shrink-0" />
        <span className="flex-1 text-[14px] text-panora-text-muted">
          Recherchez un extranet de compagnie d&apos;assurance à ajouter.
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-panora-text-muted">
          <kbd className="inline-flex items-center justify-center min-w-[18px] h-5 px-1 rounded border border-panora-border bg-panora-drop text-[10px] font-semibold text-panora-text-secondary">
            ⌘
          </kbd>
          <kbd className="inline-flex items-center justify-center min-w-[18px] h-5 px-1 rounded border border-panora-border bg-panora-drop text-[10px] font-semibold text-panora-text-secondary">
            K
          </kbd>
        </span>
      </button>

      {open && (
        <CommandPalette
          onSelect={(extranet) => {
            setOpen(false);
            onSelect(extranet);
          }}
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

// ── Palette ──

function CommandPalette({
  onSelect,
  onClose,
}: {
  onSelect: (extranet: AvailableExtranet) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Featured AXA first, then alphabetical, then configured rows pushed to the end.
  const sorted = useMemo(() => {
    const featuredIds = new Set(["axa"]);
    const featured = availableExtranets.filter((e) =>
      featuredIds.has(e.insurerId)
    );
    const rest = availableExtranets
      .filter((e) => !featuredIds.has(e.insurerId))
      .sort((a, b) => a.insurerName.localeCompare(b.insurerName, "fr"));
    return [...featured, ...rest];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (e) =>
        e.insurerName.toLowerCase().includes(q) ||
        (e.portalLabel ?? "").toLowerCase().includes(q) ||
        e.portalUrl.toLowerCase().includes(q) ||
        e.modelizedProducts.some((p) =>
          p.product.toLowerCase().includes(q)
        )
    );
  }, [query, sorted]);

  // Reset highlight when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Autofocus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lock background scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Scroll active row into view
  useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(
      `[data-row-index="${activeIndex}"]`
    );
    if (row) row.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target) onSelect(target);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 py-[6vh] bg-black/30 backdrop-blur-[2px]"
      onMouseDown={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Rechercher une compagnie d'assurance"
    >
      <div
        className="w-full max-w-[640px] max-h-[80vh] bg-white rounded-2xl shadow-[0px_24px_64px_0px_rgba(0,0,0,0.18)] border border-panora-border flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search row */}
        <div className="flex items-center gap-3 px-6 h-[68px] border-b border-panora-border">
          <Search className="w-5 h-5 text-panora-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Recherchez un extranet de compagnie d'assurance à ajouter."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-[17px] leading-6 text-panora-text placeholder:text-panora-text-muted bg-transparent outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="shrink-0 p-1 rounded hover:bg-panora-drop transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5 text-panora-text-muted" />
            </button>
          )}
          <button
            onClick={onClose}
            className="shrink-0 inline-flex items-center gap-1 px-2 h-7 rounded-md text-[11px] font-medium text-panora-text-muted hover:bg-panora-drop transition-colors"
            aria-label="Fermer"
          >
            <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded text-[10px] font-semibold">
              Esc
            </kbd>
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <NotFoundRequestForm initialName={query} onClose={onClose} />
          ) : (
            filtered.map((extranet, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={extranet.id}
                  data-row-index={idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => onSelect(extranet)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                    isActive
                      ? "bg-panora-drop"
                      : "bg-transparent hover:bg-panora-drop/60"
                  )}
                >
                  <InsurerLogo
                    insurerId={extranet.insurerId}
                    name={extranet.insurerName}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className="text-[14px] font-semibold text-panora-text leading-5 font-display">
                      {extranet.insurerName}
                      {extranet.portalLabel && (
                        <span className="text-[12px] font-normal text-panora-text-muted ml-1.5">
                          · {extranet.portalLabel}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-panora-text-muted leading-4 truncate">
                      {extranet.portalUrl}
                    </span>
                    {extranet.modelizedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {extranet.modelizedProducts.map((p) => (
                          <ProductBadge
                            key={p.product}
                            product={p.product}
                            variant={p.isNew ? "new" : "modelized"}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <span className="shrink-0 self-center inline-flex items-center gap-1 text-[11px] font-medium text-panora-text-secondary">
                      <CornerDownLeft className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 h-11 border-t border-panora-border bg-panora-drop/40">
          <Link
            href="/matrice-couverture"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-panora-text-secondary hover:text-panora-text leading-4 transition-colors"
          >
            Matrice extranets × produits
            <ExternalLink className="w-3 h-3" />
          </Link>
          <div className="flex items-center gap-3 text-[11px] text-panora-text-muted">
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded border border-panora-border bg-white text-[10px] font-semibold">
                ↑
              </kbd>
              <kbd className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded border border-panora-border bg-white text-[10px] font-semibold">
                ↓
              </kbd>
              naviguer
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded border border-panora-border bg-white text-[10px] font-semibold">
                ⏎
              </kbd>
              configurer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Not-found request form ──

function NotFoundRequestForm({
  initialName,
  onClose,
}: {
  initialName: string;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [selected, setSelected] = useState<Set<InsuranceProduct>>(new Set());
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Keep the name field in sync with the palette query until the broker
  // edits the field or submits the request.
  const lastInitialRef = useRef(initialName);
  if (initialName !== lastInitialRef.current && !submitted) {
    lastInitialRef.current = initialName;
    setName(initialName);
  }

  function toggleProduct(product: InsuranceProduct) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(product)) next.delete(product);
      else next.add(product);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    // Mocked submission. In production, post to a request endpoint.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="px-6 py-10 flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-panora-green-light flex items-center justify-center">
          <Check
            className="w-4 h-4 text-panora-green-dark"
            strokeWidth={3}
          />
        </div>
        <div className="flex flex-col gap-1 max-w-[360px]">
          <p className="text-[14px] font-semibold text-panora-text">
            Demande envoyée
          </p>
          <p className="text-[12px] text-panora-text-secondary leading-[18px]">
            Nous priorisons les ajouts les plus demandés. Vous serez notifié
            par email dès que {name.trim() || "cette compagnie d'assurance"} sera disponible
            sur Panora.
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-1 inline-flex items-center px-3 h-8 rounded-md border border-panora-border text-[12px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-5 py-5 flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <p className="text-[14px] font-semibold text-panora-text font-display">
          Pas trouvé ? Demandez son ajout
        </p>
        <p className="text-[12px] text-panora-text-secondary leading-[18px]">
          Précisez la compagnie d&apos;assurance et les produits que vous souhaitez coter,
          nous priorisons les ajouts les plus demandés.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-panora-text leading-4">
          Nom de la compagnie d&apos;assurance
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. April, Swiss Life, MGEN…"
          className="w-full h-9 px-3 text-[13px] leading-5 text-panora-text placeholder:text-panora-text-muted bg-white border border-panora-border rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)] outline-none focus:border-panora-green/40 transition-colors"
          autoFocus={!initialName}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label className="text-[12px] font-medium text-panora-text leading-4">
            Produits prioritaires
          </label>
          <span className="text-[11px] text-panora-text-muted">
            {selected.size > 0 ? `${selected.size} sélectionné${selected.size > 1 ? "s" : ""}` : "Plusieurs choix possibles"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {masterProducts.map((p) => {
            const isSelected = selected.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProduct(p.id)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 h-6 rounded-md text-[11px] font-medium transition-colors",
                  isSelected
                    ? "bg-panora-green-light text-panora-green-dark border border-panora-green-border"
                    : "bg-white border border-panora-border text-panora-text-secondary hover:border-panora-text-muted/40"
                )}
              >
                {isSelected && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                {p.id}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-panora-text leading-4">
          Note (optionnel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Volumes prévus, urgence, contact dédié…"
          rows={2}
          className="w-full px-3 py-2 text-[13px] leading-5 text-panora-text placeholder:text-panora-text-muted bg-white border border-panora-border rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)] outline-none focus:border-panora-green/40 transition-colors resize-none"
        />
      </div>

      <div className="flex items-center justify-end pt-1">
        <button
          type="submit"
          disabled={!name.trim()}
          className={cn(
            "btn-primary inline-flex items-center gap-2 px-4 h-9 text-[13px] font-semibold leading-5",
            !name.trim() && "opacity-50 cursor-not-allowed"
          )}
        >
          <Send className="w-3.5 h-3.5" />
          Envoyer la demande
        </button>
      </div>
    </form>
  );
}
