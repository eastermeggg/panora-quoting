"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, FolderOpen, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VeosContract, VeosContractStatus } from "@/data/clients-mock";
import type { ErpContainerStatus } from "@/data/erp-adapters";

interface EtudeSelectorProps {
  /** Currently selected contract id, or empty string when nothing is picked. */
  value: string;
  /** Called with a contract id when the broker picks one from the list. */
  onChange: (id: string) => void;
  /** Called when the broker hits the "Créer une étude" CTA. */
  onCreate: () => void;
  /** Pool of contracts for the active client. */
  contracts: VeosContract[];
  /** Localized status labels (Étude / Active / etc.) from the ERP adapter. */
  statusLabels: Partial<Record<ErpContainerStatus, string>>;
  /** Singular noun for the container ("étude", "study", …) — used in copy. */
  singular: string;
  /** Demo/capture affordance — render with the dropdown already open. */
  defaultOpen?: boolean;
}

export function EtudeSelector({
  value,
  onChange,
  onCreate,
  contracts,
  statusLabels,
  singular,
  defaultOpen,
}: EtudeSelectorProps) {
  const selected = useMemo(
    () => contracts.find((c) => c.id === value) ?? null,
    [contracts, value]
  );

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(defaultOpen ?? false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (!selected) inputRef.current?.focus();
  }, [selected]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contracts;
    return contracts.filter((c) =>
      [c.label, c.product, c.insurer, c.number].some(
        (f) => f?.toLowerCase().includes(q) ?? false
      )
    );
  }, [query, contracts]);

  function handleClear() {
    onChange("");
    setQuery("");
    setOpen(true);
  }

  function handlePick(c: VeosContract) {
    onChange(c.id);
    setQuery("");
    setOpen(false);
  }

  function handleCreate() {
    setOpen(false);
    onCreate();
  }

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-2">
      {selected ? (
        <SelectedChip
          contract={selected}
          statusLabel={statusLabels[selected.status]}
          onClear={handleClear}
        />
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-panora-text-muted pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={`Rechercher une ${singular} existante…`}
            className="w-full h-12 pl-9 pr-3 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green/40 focus:ring-2 focus:ring-panora-green/15 transition-colors"
          />
        </div>
      )}

      {/* Live-search dropdown */}
      {!selected && open && (
        <div className="absolute left-0 right-0 top-[calc(100%+2px)] bg-white border border-panora-border rounded-lg shadow-[0px_8px_24px_0px_rgba(0,0,0,0.10)] z-30 overflow-hidden">
          {results.length > 0 ? (
            <div className="max-h-[280px] overflow-y-auto py-1.5">
              {results.map((c) => (
                <ResultRow
                  key={c.id}
                  contract={c}
                  statusLabel={statusLabels[c.status]}
                  onPick={handlePick}
                />
              ))}
            </div>
          ) : (
            <div className="px-3 py-3">
              <p className="text-[12.5px] text-panora-text-secondary leading-[18px]">
                {query.trim()
                  ? `Aucune ${singular} correspondant à « ${query.trim()} ».`
                  : `Aucune ${singular} pour ce client.`}
              </p>
            </div>
          )}

          {/* Bottom CTA — always available */}
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 w-full px-3 h-10 border-t border-panora-border bg-panora-drop/40 text-[13px] font-medium text-panora-text hover:bg-panora-drop/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-panora-green" />
            Créer une {singular}
            {query.trim() && (
              <span className="text-panora-text-muted font-normal truncate">
                « {query.trim()} »
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function SelectedChip({
  contract,
  statusLabel,
  onClear,
}: {
  contract: VeosContract;
  statusLabel: string | undefined;
  onClear: () => void;
}) {
  const isEtude = contract.status === "etude";
  const hasInsurer = !!contract.insurer && contract.insurer !== "—";
  return (
    <div className="flex items-center gap-3 h-12 px-3 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <FolderBadge status={contract.status} />
      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="text-[13px] font-medium text-panora-text truncate">
          {contract.label}
        </span>
        {isEtude ? (
          contract.number && (
            <span className="text-[11px] text-panora-text-muted font-mono tabular-nums truncate">
              {contract.number}
            </span>
          )
        ) : (
          <span className="text-[11px] text-panora-text-muted truncate">
            {contract.product}
            {hasInsurer && <> · {contract.insurer}</>}
          </span>
        )}
      </div>
      {!isEtude && statusLabel && (
        <StatusPill status={contract.status} label={statusLabel} />
      )}
      <button
        type="button"
        onClick={onClear}
        className="flex items-center justify-center w-6 h-6 rounded-md text-panora-text-muted hover:bg-panora-secondary hover:text-panora-text-secondary transition-colors"
        aria-label="Effacer la sélection"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ResultRow({
  contract,
  statusLabel,
  onPick,
}: {
  contract: VeosContract;
  statusLabel: string | undefined;
  onPick: (c: VeosContract) => void;
}) {
  const isEtude = contract.status === "etude";
  const hasInsurer = !!contract.insurer && contract.insurer !== "—";
  return (
    <button
      type="button"
      onClick={() => onPick(contract)}
      className="group flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-panora-secondary/40 focus-visible:bg-panora-secondary/40 outline-none transition-colors"
    >
      <FolderBadge status={contract.status} />
      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="text-[13px] font-medium text-panora-text truncate">
          {contract.label}
        </span>
        {isEtude ? (
          contract.number && (
            <span className="text-[11px] text-panora-text-muted font-mono tabular-nums truncate">
              {contract.number}
            </span>
          )
        ) : (
          <span className="text-[11px] text-panora-text-muted truncate">
            {contract.product}
            {hasInsurer && <> · {contract.insurer}</>}
          </span>
        )}
      </div>
      {!isEtude && statusLabel && (
        <StatusPill status={contract.status} label={statusLabel} />
      )}
      <ChevronRight className="w-3.5 h-3.5 text-panora-text-muted/0 group-hover:text-panora-text-muted shrink-0 transition-colors" />
    </button>
  );
}

function FolderBadge({ status }: { status: VeosContractStatus }) {
  const isEtude = status === "etude";
  return (
    <div
      className={cn(
        "w-6 h-6 rounded-md flex items-center justify-center shrink-0 border",
        isEtude
          ? "bg-panora-green-light border-panora-green-border text-panora-green-dark"
          : "bg-panora-secondary border-panora-border text-panora-text-secondary"
      )}
    >
      <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
    </div>
  );
}

function StatusPill({
  status,
  label,
}: {
  status: VeosContractStatus;
  label: string;
}) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-medium uppercase tracking-wide shrink-0",
        tone === "etude" && "bg-panora-green-light text-panora-green-dark",
        tone === "active" && "bg-panora-tag text-panora-text-secondary",
        tone === "renewal" &&
          "bg-panora-warning-bg text-panora-warning-text",
        tone === "expired" && "bg-panora-tag/60 text-panora-text-muted",
        tone === "neutral" && "bg-panora-tag text-panora-text-muted"
      )}
    >
      {label}
    </span>
  );
}

const STATUS_TONE: Record<VeosContractStatus, string> = {
  etude: "etude",
  active: "active",
  renewal: "renewal",
  expired: "expired",
};
