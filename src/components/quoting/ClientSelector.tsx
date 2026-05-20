"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Search,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getVeosClient,
  searchVeosClients,
  veosClients,
  type VeosClient,
} from "@/data/clients-mock";
import { isIntegrationConnected } from "@/data/integrations-mock";
import { CreateClientModal } from "./CreateClientModal";

interface ClientSelectorProps {
  /** Currently selected client id. */
  value: string | null;
  /** Called with the selected id, or `null` when the user clears the selection. */
  onChange: (clientId: string | null) => void;
  /** Pool to search over. Defaults to `veosClients`. */
  clients?: VeosClient[];
  /**
   * VEOS connection state — drives the small caption beneath the input.
   * Defaults to whatever `currentConnections` reports for `veos`.
   */
  veosConnected?: boolean;
  /**
   * Optional callback fired after a client is created through the inline
   * modal. Receives the created client so the parent can react (e.g. clear
   * the wizard's search state). The selector also auto-selects the new
   * client by default.
   */
  onCreate?: (client: VeosClient) => void;
  /**
   * If provided, the create flow is delegated to the parent — the selector
   * does NOT render its own modal. Use this when the selector lives inside
   * another modal that would otherwise cause double-overlay. The parent
   * should mount its own `<CreateClientModal />` and, on creation, call
   * `onChange(client.id)` so the chip lights up.
   */
  onRequestCreate?: (initialName: string) => void;
  /** Optional placeholder for the search input. */
  placeholder?: string;
  /** Optional label rendered above the field. */
  label?: string;
}

export function ClientSelector({
  value,
  onChange,
  clients = veosClients,
  veosConnected = isIntegrationConnected("veos"),
  onCreate,
  onRequestCreate,
  placeholder = "Rechercher un client par nom, SIREN ou SIRET…",
  label,
}: ClientSelectorProps) {
  const selected = value ? getVeosClient(value) : null;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
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

  // When the user clears the selection, focus the new search input
  useEffect(() => {
    if (!selected) {
      inputRef.current?.focus();
    }
  }, [selected]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return searchVeosClients(q).filter((c) =>
      clients.some((x) => x.id === c.id)
    );
  }, [query, clients]);

  function handleClear() {
    onChange(null);
    setQuery("");
    setOpen(true);
  }

  function handlePick(client: VeosClient) {
    onChange(client.id);
    setQuery("");
    setOpen(false);
  }

  function handleCreated(client: VeosClient) {
    setCreateOpen(false);
    onChange(client.id);
    setQuery("");
    setOpen(false);
    onCreate?.(client);
  }

  function openCreateFlow() {
    if (onRequestCreate) {
      onRequestCreate(query.trim());
      setOpen(false);
    } else {
      setCreateOpen(true);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-panora-text-secondary leading-5">
          {label}
        </label>
      )}

      <div ref={wrapperRef} className="relative flex flex-col gap-2">
        {selected ? (
          <SelectedChip client={selected} onClear={handleClear} />
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
              placeholder={placeholder}
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
                  <ResultRow key={c.id} client={c} onPick={handlePick} />
                ))}
              </div>
            ) : (
              <NoResults
                query={query.trim()}
                veosConnected={veosConnected}
              />
            )}

            {/* Bottom CTA — always available */}
            <button
              type="button"
              onClick={openCreateFlow}
              className="flex items-center gap-2 w-full px-3 h-10 border-t border-panora-border bg-panora-drop/40 text-[13px] font-medium text-panora-text hover:bg-panora-drop/80 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-panora-green" />
              Créer un client dans {veosConnected ? "VEOS" : "Panora"}
              {query.trim() && (
                <span className="text-panora-text-muted font-normal truncate">
                  « {query.trim()} »
                </span>
              )}
            </button>
          </div>
        )}

        <ErpStatusFooter connected={veosConnected} />
      </div>

      {createOpen && !onRequestCreate && (
        <CreateClientModal
          veosConnected={veosConnected}
          initialName={query.trim()}
          onCancel={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function SelectedChip({
  client,
  onClear,
}: {
  client: VeosClient;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 h-12 px-3 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <ClientTypeBadge type={client.type} />
      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="text-[13px] font-medium text-panora-text truncate">
          {client.name}
        </span>
        <span className="text-[11px] text-panora-text-muted truncate tabular-nums">
          {client.type === "PM" ? (
            <>SIREN&nbsp;{client.siren ?? "—"}</>
          ) : (
            <>Personne physique</>
          )}
          {client.city ? <> · {client.city}</> : null}
        </span>
      </div>
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
  client,
  onPick,
}: {
  client: VeosClient;
  onPick: (client: VeosClient) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(client)}
      className="group flex items-center gap-3 w-full px-3 py-3 text-left hover:bg-panora-secondary/40 focus-visible:bg-panora-secondary/40 outline-none transition-colors"
    >
      <ClientTypeBadge type={client.type} />
      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[13px] font-medium text-panora-text truncate">
            {client.name}
          </span>
          <span className="text-[11px] text-panora-text-muted shrink-0 tabular-nums">
            {client.type === "PM" ? `SIREN ${client.siren ?? "—"}` : "Personne physique"}
          </span>
        </div>
        <span className="text-[11px] text-panora-text-muted truncate">
          {client.city ? <>{client.city} · </> : null}
          Dernier contrat&nbsp;
          <span className="text-panora-text-secondary tabular-nums">
            {client.lastContractUpdate}
          </span>
        </span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-panora-text-muted/0 group-hover:text-panora-text-muted shrink-0 transition-colors" />
    </button>
  );
}

function ClientTypeBadge({ type }: { type: VeosClient["type"] }) {
  const isPM = type === "PM";
  const Icon = isPM ? Building2 : User;
  return (
    <div
      className={cn(
        "w-6 h-6 rounded-md flex items-center justify-center shrink-0 border text-panora-text-secondary",
        isPM
          ? "bg-panora-secondary border-panora-border"
          : "bg-white border-panora-border"
      )}
      aria-label={isPM ? "Personne morale" : "Personne physique"}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
    </div>
  );
}

function NoResults({
  query,
  veosConnected,
}: {
  query: string;
  veosConnected: boolean;
}) {
  const source = veosConnected ? "VEOS" : "Panora";
  return (
    <div className="px-3 py-3">
      <p className="text-[12.5px] text-panora-text-secondary leading-[18px]">
        {query
          ? `Aucun client correspondant à « ${query} » dans ${source}.`
          : `Aucun client trouvé dans ${source}.`}
      </p>
    </div>
  );
}

function ErpStatusFooter({ connected }: { connected: boolean }) {
  if (connected) {
    return (
      <div className="flex items-center gap-1.5 text-[11.5px] leading-4 text-panora-text-muted">
        <Image
          src="/logos/veos.svg"
          alt="VEOS"
          width={14}
          height={14}
          className="rounded-[3px] shrink-0"
        />
        <span>Recherche dans VEOS · Connexion active</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-[11.5px] leading-4 text-panora-text-muted">
      <span>Vous avez un ERP&nbsp;?</span>
      <Link
        href="/settings/integrations"
        className="font-medium text-panora-green hover:underline"
      >
        Connectez-le →
      </Link>
    </div>
  );
}
