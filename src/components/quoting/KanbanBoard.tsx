"use client";

import { Building2, Check, Loader2, LayoutGrid, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import Link from "next/link";
import type { Cotation, CotationStatus, CotationInsurer } from "@/data/mock";
import { getCotationStatus } from "@/data/mock";
import { useConfiguredExtranets, type ExtranetConfig } from "@/data/settings-mock";
import { getBlockedInsurerIds } from "@/data/cotations-store";

/* ── Insurer row — marks insurers whose request is stuck behind a closed
   session with an amber clock, and trails an "en attente" chip. ── */
function InsurerRow({
  insurers,
  blocked,
}: {
  insurers: CotationInsurer[];
  blocked: Set<string>;
}) {
  return (
    <div className="flex items-center gap-x-2.5 gap-y-1.5 flex-wrap">
      {insurers.map((insurer) => {
        const isBlocked = blocked.has(insurer.id);
        return (
          <div key={insurer.id} className="flex items-center gap-[7px]">
            <div className="relative shrink-0">
              <InsurerLogo
                insurerId={insurer.id}
                name={insurer.name}
                size="sm"
              />
              {isBlocked && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-panora-warning-bg border border-white flex items-center justify-center">
                  <Clock className="w-2 h-2 text-panora-warning-text" />
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[13px] leading-5",
                isBlocked
                  ? "text-panora-warning-text font-medium"
                  : "text-panora-text-muted"
              )}
            >
              {insurer.name}
            </span>
          </div>
        );
      })}
      {blocked.size > 0 && (
        <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full bg-panora-warning-bg text-[11px] font-medium text-panora-warning-text">
          <Clock className="w-3 h-3" />
          En attente de session
        </span>
      )}
    </div>
  );
}

const columns: {
  key: DisplayStatus;
  label: string;
  dotColor: string;
}[] = [
  { key: "preparation", label: "En préparation", dotColor: "bg-[#f5ae73]" },
  { key: "bloque", label: "En attente de session", dotColor: "bg-[#cb8052]" },
  { key: "en_cours", label: "En cours", dotColor: "bg-[#be93e4]" },
  { key: "terminee", label: "Terminé", dotColor: "bg-[#94ce9a]" },
];

/**
 * Board status, session-aware. A cotation is "bloque" only when nothing is
 * actively in flight (no in_progress) and at least one insurer is waiting on a
 * closed session — i.e. the only thing standing between it and progress is a
 * reactivation. Cards with live work stay in their natural column (with the
 * amber chip). Everything else falls back to the base status.
 */
type DisplayStatus = CotationStatus | "bloque";

function getDisplayStatus(
  cotation: Cotation,
  extranets: ExtranetConfig[]
): DisplayStatus {
  const base = getCotationStatus(cotation);
  if (base === "terminee") return "terminee";
  const blocked = getBlockedInsurerIds(cotation, extranets);
  const hasInProgress = cotation.insurers.some(
    (i) => i.status === "in_progress"
  );
  if (blocked.size > 0 && !hasInProgress) return "bloque";
  return base;
}

/* ── Card footer per status ── */
function CardFooter({
  cotation,
  status,
}: {
  cotation: Cotation;
  status: DisplayStatus;
}) {
  const completed = cotation.insurers.filter(
    (i) => i.status === "completed"
  ).length;
  const total = cotation.insurers.length;

  if (status === "preparation") {
    return (
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#85827b]">
          {cotation.cotationId} - {cotation.createdAt}
        </span>
        <span className="text-[13px] font-medium text-panora-green">
          Préparer et lancer →
        </span>
      </div>
    );
  }

  if (status === "bloque") {
    return (
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#85827b]">
          {cotation.cotationId} - {cotation.createdAt}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full bg-panora-warning-bg text-[12px] font-medium text-panora-warning-text">
          <Clock className="w-3 h-3" />
          Réactiver pour lancer
        </span>
      </div>
    );
  }

  if (status === "en_cours") {
    const pct = total > 0 ? (completed / total) * 100 : 0;
    return (
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#85827b]">{cotation.createdAt}</span>
        <div className="flex items-center gap-[9px]">
          <div className="w-[93px] h-2 bg-[rgba(34,32,26,0.15)] rounded-[50px] overflow-hidden">
            <div
              className="h-full bg-[#162416] rounded-[50px] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[12px] text-[#85827b]">
            {completed} / {total} devis
          </span>
        </div>
      </div>
    );
  }

  // terminee
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#85827b]">{cotation.createdAt}</span>
      <span className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full bg-[#daf1db] text-[12px] font-medium text-[#203c25]">
        <LayoutGrid className="w-3.5 h-3.5" />
        Terminé
      </span>
    </div>
  );
}

/* ── Single-vehicle auto preparation card ── */
function SingleAutoPreparationCard({
  cotation,
  blocked,
}: {
  cotation: Cotation;
  blocked: Set<string>;
}) {
  const auto = cotation.autoMeta!;
  const href = `/quoting/preparation?id=${cotation.id}&scenario=auto`;

  return (
    <Link href={href}>
      <div className="bg-[#fdfdfc] border border-panora-border rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3 hover:border-panora-text-muted/30 transition-all cursor-pointer">
        {/* Title + client */}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[14px] font-medium text-[#21201c] leading-5">
            {cotation.product} — {auto.conducteur.split(" ")[0]}
          </h3>
          <span className="text-[13px] text-panora-text-muted leading-5">
            {cotation.client}
          </span>
        </div>

        {/* Insurers */}
        <InsurerRow insurers={cotation.insurers} blocked={blocked} />

        {/* Separator */}
        <div className="h-px bg-[#d9d9d9]" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#85827b]">
            {cotation.cotationId} - {cotation.createdAt}
          </span>
          <span className="text-[13px] font-medium text-panora-green">
            Préparer et lancer →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Fleet preparation card ── */
function FleetPreparationCard({
  cotation,
  blocked,
}: {
  cotation: Cotation;
  blocked: Set<string>;
}) {
  const fleet = cotation.fleetMeta!;
  const href = `/quoting/preparation?id=${cotation.id}&scenario=flotte-auto`;

  return (
    <Link href={href}>
      <div className="bg-[#fdfdfc] border border-panora-border rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3 hover:border-panora-text-muted/30 transition-all cursor-pointer">
        {/* Title + client */}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[14px] font-medium text-[#21201c] leading-5">
            {cotation.product} {cotation.client.split(" ")[0]} 2026
          </h3>
          <div className="flex items-center gap-[9px]">
            <div className="w-4 h-4 rounded-[4px] bg-gradient-to-b from-white to-[#c8c7cb] border-[1.2px] border-[rgba(0,0,0,0.1)] shadow-[0px_1.2px_2.4px_0px_rgba(0,0,0,0.05)] flex items-center justify-center shrink-0">
              <Building2 className="w-2 h-2 text-[#85827b]" />
            </div>
            <span className="text-[13px] text-panora-text-muted leading-5 truncate">
              {cotation.client}
            </span>
          </div>
        </div>

        {/* Product badge */}
        <div className="flex items-start">
          <span className="inline-flex items-center h-5 px-2 rounded-[6px] bg-panora-secondary text-[12px] font-medium text-panora-text-muted">
            {cotation.product}
          </span>
        </div>

        {/* Insurers */}
        <InsurerRow insurers={cotation.insurers} blocked={blocked} />

        {/* Separator */}
        <div className="h-px bg-[#d9d9d9]" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#85827b]">
            {cotation.cotationId} - {cotation.createdAt}
          </span>
          <span className="text-[13px] font-medium text-panora-green">
            Préparer et lancer →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Cotation card ── */
function CotationCard({
  cotation,
  status,
  blocked,
}: {
  cotation: Cotation;
  status: DisplayStatus;
  blocked: Set<string>;
}) {
  // Use specialized cards for automobile products in preparation
  if (status === "preparation" && cotation.productIcon === "car") {
    if (cotation.autoMeta) {
      return <SingleAutoPreparationCard cotation={cotation} blocked={blocked} />;
    }
    if (cotation.fleetMeta) {
      return <FleetPreparationCard cotation={cotation} blocked={blocked} />;
    }
  }

  // Route by the natural pipeline stage (a "bloque" card still goes to
  // preparation or followup depending on whether it's been launched).
  const href =
    getCotationStatus(cotation) === "preparation"
      ? `/quoting/preparation?id=${cotation.id}`
      : `/quoting/followup?id=${cotation.id}`;

  return (
    <Link href={href}>
      <div className="bg-[#fdfdfc] border border-panora-border rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3 hover:border-panora-text-muted/30 transition-all cursor-pointer">
        {/* Title + client */}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[14px] font-medium text-[#21201c] leading-5">
            {cotation.product} {cotation.client.split(" ")[0]} 2026
          </h3>
          <div className="flex items-center gap-[9px]">
            <div className="w-4 h-4 rounded-[4px] bg-gradient-to-b from-white to-[#c8c7cb] border-[1.2px] border-[rgba(0,0,0,0.1)] shadow-[0px_1.2px_2.4px_0px_rgba(0,0,0,0.05)] flex items-center justify-center shrink-0">
              <Building2 className="w-2 h-2 text-[#85827b]" />
            </div>
            <span className="text-[13px] text-panora-text-muted leading-5">
              {cotation.client}
            </span>
          </div>
        </div>

        {/* Product badge */}
        <div className="flex items-start">
          <span className="inline-flex items-center h-5 px-2 rounded-[6px] bg-panora-secondary text-[12px] font-medium text-panora-text-muted">
            {cotation.product}
          </span>
        </div>

        {/* Insurers list — always inline horizontal */}
        <InsurerRow insurers={cotation.insurers} blocked={blocked} />

        {/* Separator */}
        <div className="h-px bg-[#d9d9d9]" />

        {/* Footer */}
        <CardFooter cotation={cotation} status={status} />
      </div>
    </Link>
  );
}

/* ── Kanban board ── */
interface KanbanBoardProps {
  cotations: Cotation[];
}

export function KanbanBoard({ cotations }: KanbanBoardProps) {
  const extranets = useConfiguredExtranets();
  const grouped = columns
    .map((col) => ({
      ...col,
      items: cotations.filter(
        (c) => getDisplayStatus(c, extranets) === col.key
      ),
    }))
    // "En attente de session" is an exception lane — only show it when
    // something is actually stuck, so the default board stays at 3 columns.
    .filter((col) => col.key !== "bloque" || col.items.length > 0);

  return (
    <div className="flex gap-6 min-h-0 flex-1">
      {grouped.map((column) => (
        <div
          key={column.key}
          className="flex-1 min-w-[280px] bg-panora-secondary rounded-[11px] p-2.5 flex flex-col gap-3.5"
        >
          {/* Column header */}
          <div className="flex items-center gap-2 pl-1 h-5">
            <div className={cn("w-2 h-2 rounded-full", column.dotColor)} />
            <span className="text-[12px] font-medium text-[#2d2a26]">
              {column.label}
            </span>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto">
            {column.items.length === 0 ? (
              <div className="border border-dashed border-panora-border rounded-[12px] p-6 flex items-center justify-center">
                <span className="text-[12px] text-panora-text-muted">
                  Aucune cotation
                </span>
              </div>
            ) : (
              column.items.map((cotation) => (
                <CotationCard
                  key={cotation.id}
                  cotation={cotation}
                  status={column.key}
                  blocked={getBlockedInsurerIds(cotation, extranets)}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
