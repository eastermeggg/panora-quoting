"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Plus, Clock, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { masterProducts, type InsuranceProduct } from "@/data/settings-mock";
import { ProductBadge } from "@/components/settings/ProductBadge";
import { StepNumber } from "@/components/onboarding/StepNumber";
import {
  useQuotedProducts,
  addQuotedProduct,
  removeQuotedProduct,
  useRequestedProducts,
  requestCustomProduct,
  removeRequestedProduct,
} from "@/data/products-store";

const availabilityById = new Map(
  masterProducts.map((p) => [p.id as string, p.available])
);

/**
 * "Produits que vous cotez régulièrement" — the first block of the Portails
 * step. The catalog dropdown separates products available today from those not
 * yet modelized, and lets the broker request a product that isn't listed (sent
 * to the team as a feedback signal).
 */
export function ProductsBlock({ step }: { step?: number }) {
  const selected = useQuotedProducts();
  const requested = useRequestedProducts();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [justSent, setJustSent] = useState<string | null>(null);
  const [requestInitial, setRequestInitial] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const q = query.trim().toLowerCase();

  const matches = useMemo(
    () =>
      masterProducts.filter(
        (p) =>
          !selectedSet.has(p.id) && (q === "" || p.id.toLowerCase().includes(q))
      ),
    [q, selectedSet]
  );
  const available = matches.filter((p) => p.available);
  const coming = matches.filter((p) => !p.available);

  // Offer a "request" row when the typed term isn't a known catalog product.
  const exactCatalogMatch = masterProducts.some((p) => p.id.toLowerCase() === q);
  const alreadyRequested = requested.some((r) => r.name.toLowerCase() === q);
  const showRequestRow = q.length > 0 && !exactCatalogMatch && !alreadyRequested;

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (!justSent) return;
    const t = window.setTimeout(() => setJustSent(null), 3500);
    return () => window.clearTimeout(t);
  }, [justSent]);

  function add(product: InsuranceProduct) {
    addQuotedProduct(product);
    setQuery("");
  }

  // Open the "request a product" modal, pre-filled with the typed term.
  function openRequest() {
    const name = query.trim();
    if (!name) return;
    setRequestInitial(name);
    setOpen(false);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {step !== undefined && <StepNumber n={step} />}
          <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
            Produits que vous cotez régulièrement
          </h2>
        </div>
        <p className="text-[13px] text-panora-text-secondary leading-[18px]">
          Indiquez les produits que vous placez le plus souvent. Panora s&apos;en
          sert pour préparer et prioriser vos cotations.
        </p>
      </div>

      {/* Search + dropdown */}
      <div className="relative" ref={wrapRef}>
        <div
          className={cn(
            "flex items-center gap-3 h-14 px-4 rounded-xl bg-white border shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors",
            open ? "border-panora-green-border" : "border-panora-border"
          )}
        >
          <Search className="w-4 h-4 text-panora-text-muted shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && showRequestRow) openRequest();
            }}
            placeholder="Rechercher un produit (Auto, RC Pro, Flotte…)"
            className="flex-1 text-[14px] leading-5 text-panora-text placeholder:text-panora-text-muted bg-transparent outline-none"
          />
        </div>

        {open && (
          <div className="absolute z-20 mt-1.5 w-full max-h-[300px] overflow-y-auto rounded-lg bg-white border border-panora-border shadow-[0px_8px_24px_-8px_rgba(0,0,0,0.16)] py-1.5">
            {available.length > 0 && (
              <Group label={`Disponible (${available.length})`}>
                {available.map((p) => (
                  <ProductRow key={p.id} onClick={() => add(p.id)}>
                    <span className="text-[13px] text-panora-text">{p.id}</span>
                    <Tag tone="ok">Disponible</Tag>
                  </ProductRow>
                ))}
              </Group>
            )}

            {coming.length > 0 && (
              <Group label={`Bientôt disponible (${coming.length})`}>
                {coming.map((p) => (
                  <ProductRow key={p.id} onClick={() => add(p.id)}>
                    <span className="text-[13px] text-panora-text-secondary">
                      {p.id}
                    </span>
                    <Tag tone="soon">Bientôt</Tag>
                  </ProductRow>
                ))}
              </Group>
            )}

            {showRequestRow && (
              <>
                {(available.length > 0 || coming.length > 0) && (
                  <div className="h-px bg-panora-border mx-2 my-1" />
                )}
                <button
                  type="button"
                  onClick={openRequest}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-panora-secondary/50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-panora-green-dark shrink-0" />
                  <span className="text-[13px] text-panora-text">
                    Ce produit n&apos;est pas dans la liste ? Demandez son ajout
                  </span>
                </button>
              </>
            )}

            {available.length === 0 && coming.length === 0 && !showRequestRow && (
              <p className="px-3.5 py-2 text-[13px] text-panora-text-muted">
                Aucun produit à ajouter.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Confirmation after a request */}
      {justSent && (
        <p className="inline-flex items-center gap-1.5 text-[12px] text-panora-green-dark leading-4">
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
          «&nbsp;{justSent}&nbsp;» a été transmis à l&apos;équipe Panora.
        </p>
      )}

      {/* Selected + requested pills */}
      {selected.length > 0 || requested.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((product) => {
            const isAvailable = availabilityById.get(product) !== false;
            return (
              <ProductBadge
                key={product}
                product={isAvailable ? product : `${product} · bientôt`}
                variant={isAvailable ? "modelized" : "inactive"}
                onRemove={() => removeQuotedProduct(product)}
                removeLabel={`Retirer ${product}`}
              />
            );
          })}
          {requested.map((r) => (
            <ProductBadge
              key={`req-${r.name}`}
              product={r.name}
              variant="requested"
              onRemove={() => removeRequestedProduct(r.name)}
              removeLabel={`Retirer la demande ${r.name}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-panora-text-muted leading-4">
          Aucun produit sélectionné pour l&apos;instant.
        </p>
      )}

      {requestInitial !== null && (
        <RequestProductModal
          initialName={requestInitial}
          onClose={() => setRequestInitial(null)}
          onSubmitted={(name) => {
            setJustSent(name);
            setQuery("");
            setRequestInitial(null);
          }}
        />
      )}
    </section>
  );
}

// ── Request-a-product modal (feedback loop) ──

function RequestProductModal({
  initialName,
  onClose,
  onSubmitted,
}: {
  initialName: string;
  onClose: () => void;
  onSubmitted: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [assureurs, setAssureurs] = useState("");
  const [details, setDetails] = useState("");

  const canSubmit = name.trim().length > 0;

  function submit() {
    if (!canSubmit) return;
    requestCustomProduct({
      name: name.trim(),
      assureurs: assureurs.trim() || undefined,
      details: details.trim() || undefined,
    });
    onSubmitted(name.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[460px] mx-4 flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-panora-text leading-5 font-display">
              Demander l&apos;ajout d&apos;un produit
            </span>
            <span className="text-[12px] text-panora-text-muted leading-4">
              Votre demande est transmise à l&apos;équipe Panora pour
              modélisation.
            </span>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md hover:bg-panora-border/40 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        <div className="h-px bg-panora-border" />

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <ModalField label="Nom du produit">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Assurance drone"
              className="w-full h-9 px-3 rounded-lg bg-white border border-[#e2dfd8] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green-border"
            />
          </ModalField>

          <ModalField label="Assureurs" hint="Qui le propose ?">
            <input
              value={assureurs}
              onChange={(e) => setAssureurs(e.target.value)}
              placeholder="ex. Axa, Hiscox, Generali"
              className="w-full h-9 px-3 rounded-lg bg-white border border-[#e2dfd8] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green-border"
            />
          </ModalField>

          <ModalField label="Précisions" hint="Optionnel">
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Volume estimé, particularités, échéances…"
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#e2dfd8] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green-border resize-none leading-[18px]"
            />
          </ModalField>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 h-9 rounded-md text-[13px] font-medium text-panora-text-secondary hover:text-panora-text transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="btn-primary inline-flex items-center gap-2 px-4 h-9 text-[13px] font-semibold disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Envoyer la demande
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline gap-1.5">
        <span className="text-[12px] font-medium text-panora-text-secondary">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-panora-text-muted">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}

// ── Small building blocks ──

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="px-3.5 pt-2 pb-1">
        <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wide">
          {label}
        </span>
      </div>
      {children}
    </>
  );
}

function ProductRow({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-3.5 py-2 text-left hover:bg-panora-secondary/50 transition-colors"
    >
      <span className="inline-flex items-center gap-2">{children}</span>
      <Plus className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
    </button>
  );
}

function Tag({
  tone,
  children,
}: {
  tone: "ok" | "soon";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 h-[18px] rounded-full text-[10px] font-semibold",
        tone === "ok" && "bg-panora-green-light text-panora-green-dark",
        tone === "soon" && "bg-panora-warning-bg text-panora-warning-text"
      )}
    >
      {tone === "soon" && <Clock className="w-2.5 h-2.5" />}
      {children}
    </span>
  );
}

