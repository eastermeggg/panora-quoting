"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STATUS_LABELS,
  dossierNeedsCollecte,
  dossierStatus,
  getAllDossiers,
  getAppetit,
  getEstimatedPrime,
  getSouscripteur,
  isDossierReady,
  produitsLabel,
  type DossierStatus,
} from "@/data/souscription-engine";
import type { Dossier } from "@/data/souscription-mock";
import { useSouscriptionFormsTick } from "@/data/souscription-store";
import { AppetitBadge } from "./AppetitBadge";
import { Avatar } from "./Avatar";

const STATUS_ORDER: DossierStatus[] = [
  "a_process",
  "tarifiee",
  "refusee",
  "terminee",
];

// Colors carry the state: cuivre = à traiter (action attendue), vert = tarifié
// (chiffré, actif), bordeaux = refusé, neutre = terminé (classé, rien à faire).
const STATUS_META: Record<DossierStatus, { dot: string; strip: string }> = {
  a_process: { dot: "bg-panora-warning", strip: "bg-panora-warning-bg/60" },
  tarifiee: { dot: "bg-panora-green", strip: "bg-panora-green-light/50" },
  refusee: { dot: "bg-panora-error", strip: "bg-panora-error-bg/60" },
  terminee: { dot: "bg-panora-text-muted", strip: "bg-panora-drop" },
};

type Filter = "all" | DossierStatus;
const TAB_KEYS: Filter[] = [
  "all",
  "a_process",
  "tarifiee",
  "refusee",
  "terminee",
];

function detailHref(id: string): string {
  return `/souscription/dossier/${id}`;
}

/** Where a row opens: the collecte screen while it still needs data, else the detail. */
function entryHref(dossier: Dossier): string {
  const base = detailHref(dossier.id);
  return dossierNeedsCollecte(dossier) ? `${base}/collecte` : base;
}

/**
 * Triage listing in the broker "Assistant analyse" idiom: thin column headers,
 * rows grouped under a status strip, each row an icon tile + client, product
 * chips, the Appétit badge, and a souscripteur avatar.
 */
export function DossierBoard() {
  useSouscriptionFormsTick();
  const router = useRouter();
  const dossiers = getAllDossiers();
  const [menuId, setMenuId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const groups = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        items: dossiers
          .filter((d) => dossierStatus(d) === status)
          .sort((a, b) => a.recuLe.localeCompare(b.recuLe)),
      })).filter((g) => g.items.length > 0),
    [dossiers]
  );
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: dossiers.length,
      a_process: 0,
      tarifiee: 0,
      refusee: 0,
      terminee: 0,
    };
    for (const d of dossiers) c[dossierStatus(d)] += 1;
    return c;
  }, [dossiers]);

  const shownGroups = filter === "all" ? groups : groups.filter((g) => g.status === filter);
  const empty = shownGroups.length === 0;

  const rowFor = (d: Dossier) => (
    <DossierRow
      key={d.id}
      dossier={d}
      menuOpen={menuId === d.id}
      onToggleMenu={() => setMenuId((m) => (m === d.id ? null : d.id))}
      onCloseMenu={() => setMenuId(null)}
      onNavigate={(href) => router.push(href)}
    />
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      {/* Status tabs */}
      <div className="shrink-0 px-4 pt-3 pb-2.5">
        <div className="inline-flex items-center gap-0.5 bg-panora-drop rounded-[10px] p-1">
          {TAB_KEYS.map((k) => {
            const active = filter === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={cn(
                  "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[7px] text-[12px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30",
                  active
                    ? "bg-white text-panora-text shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06)]"
                    : "text-panora-text-muted hover:text-panora-text"
                )}
              >
                {k === "all" ? "Toutes" : STATUS_LABELS[k]}
                <span className="text-[11px] tabular-nums text-panora-text-muted">
                  {counts[k]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Column headers */}
      <div className="shrink-0 h-9 border-y border-panora-border flex items-center text-[12px] text-panora-text-muted">
        <div className="flex-1 min-w-0 px-4">Client</div>
        <div className="flex-1 min-w-0 px-4">Produits</div>
        <div className="w-[150px] shrink-0 px-4">Appétit</div>
        <div className="w-[110px] shrink-0 px-4">Prime est.</div>
        <div className="w-[160px] shrink-0 px-4">Souscripteur</div>
        <div className="w-10 shrink-0" />
      </div>

      {/* Rows — grouped under "Toutes", flat within a status */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {empty ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-[13px] text-panora-text-muted">
              Aucune demande dans cet onglet.
            </span>
          </div>
        ) : filter === "all" ? (
          shownGroups.map((g) => (
            <div key={g.status}>
              <StatusGroupHeader status={g.status} count={g.items.length} />
              {g.items.map(rowFor)}
            </div>
          ))
        ) : (
          shownGroups[0].items.map(rowFor)
        )}
      </div>
    </div>
  );
}

function StatusGroupHeader({
  status,
  count,
}: {
  status: DossierStatus;
  count: number;
}) {
  const m = STATUS_META[status];
  return (
    <div className={cn("px-4 py-2 flex items-center gap-2", m.strip)}>
      <span className={cn("w-2 h-2 rounded-full", m.dot)} />
      <span className="text-[12px] font-medium text-panora-text">
        {STATUS_LABELS[status]}
      </span>
      <span className="text-[11px] font-medium text-panora-text-muted tabular-nums">
        {count}
      </span>
    </div>
  );
}

function DossierRow({
  dossier,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onNavigate,
}: {
  dossier: Dossier;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onNavigate: (href: string) => void;
}) {
  const appetit = getAppetit(dossier);
  const prime = getEstimatedPrime(dossier);
  const sous = getSouscripteur(dossier.souscripteurId);
  const href = entryHref(dossier);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate(href);
        }
      }}
      className="group flex items-center bg-white border-b border-panora-border/60 cursor-pointer transition-colors hover:bg-panora-drop/40 focus-visible:outline-none focus-visible:bg-panora-drop/40"
    >
      {/* Client — icon tile + raison + courtier */}
      <div className="flex-1 min-w-0 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-panora-green-light flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-panora-green-dark" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-panora-text truncate">
              {dossier.insured.raison}
            </div>
            <div className="text-[12px] text-panora-text-secondary truncate">
              {dossier.courtier}
            </div>
          </div>
        </div>
      </div>

      {/* Produits */}
      <div className="flex-1 min-w-0 px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {dossier.produitsDemandes.map((p) => (
            <span
              key={p}
              className="inline-flex items-center h-5 px-2 rounded-full bg-panora-secondary text-[12px] text-panora-text-muted whitespace-nowrap"
            >
              {produitsLabel([p])}
            </span>
          ))}
        </div>
      </div>

      {/* Appétit */}
      <div className="w-[150px] shrink-0 px-4 py-3.5">
        <AppetitBadge verdict={appetit.verdict} />
      </div>

      {/* Prime estimée */}
      <div className="w-[110px] shrink-0 px-4 py-3.5">
        <span className="text-[13px] text-panora-text tabular-nums">
          {prime != null ? `${prime.toLocaleString("fr-FR")} €` : "—"}
        </span>
      </div>

      {/* Souscripteur */}
      <div className="w-[160px] shrink-0 px-4 py-3.5">
        {sous ? (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar initials={sous.initials} title={sous.name} />
            <span className="text-[13px] text-panora-text-muted truncate">
              {sous.name}
            </span>
          </div>
        ) : (
          <span className="text-[13px] text-panora-text-muted">—</span>
        )}
      </div>

      {/* Row menu */}
      <div className="w-10 shrink-0 flex items-center justify-center">
        <RowMenu
          dossier={dossier}
          appetitVerdict={appetit.verdict}
          open={menuOpen}
          onToggle={onToggleMenu}
          onClose={onCloseMenu}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

function RowMenu({
  dossier,
  appetitVerdict,
  open,
  onToggle,
  onClose,
  onNavigate,
}: {
  dossier: Dossier;
  appetitVerdict: ReturnType<typeof getAppetit>["verdict"];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onNavigate: (href: string) => void;
}) {
  const base = detailHref(dossier.id);
  const status = dossierStatus(dossier);
  const ready = isDossierReady(dossier.id);
  const items: { label: string; href: string }[] = [];
  // "À process" = still to work: open the collecte (data incomplete) or, once
  // ready and in appetite, launch the tarification.
  if (status === "a_process") {
    items.push(
      ready && appetitVerdict === "dans_appetit"
        ? { label: "Lancer la tarification", href: `${base}?launch=1` }
        : { label: "Lancer la collecte", href: `${base}/collecte` }
    );
  }
  items.push({ label: "Ouvrir", href: entryHref(dossier) });
  if (appetitVerdict === "hors_appetit") items.push({ label: "Refuser", href: base });

  return (
    <div className="relative flex justify-center">
      <button
        type="button"
        aria-label="Actions"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="w-7 h-7 flex items-center justify-center rounded-md text-panora-text-muted hover:text-panora-text hover:bg-panora-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-panora-border rounded-lg shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] py-1.5 z-20">
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  onNavigate(it.href);
                }}
                className="w-full text-left px-3 py-1.5 text-[13px] text-panora-text-secondary hover:bg-panora-drop hover:text-panora-text transition-colors"
              >
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
