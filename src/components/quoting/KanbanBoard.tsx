"use client";

import {
  Building2,
  Clock,
  AlertTriangle,
  FastForward,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import Link from "next/link";
import type { Cotation, CotationInsurer } from "@/data/mock";
import { getCotationStatus } from "@/data/mock";
import { useConfiguredExtranets, type ExtranetConfig } from "@/data/settings-mock";
import { getBlockedInsurerIds } from "@/data/cotations-store";

/* ── Insurer row — flags insurers that need the broker: a clock when a request
   waits on a closed session, an alert when the agent needs input (HITL). ── */
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
        const needsInput = insurer.status === "action_required";
        const flagged = isBlocked || needsInput;
        return (
          <div key={insurer.id} className="flex items-center gap-[7px]">
            <div className="relative shrink-0">
              <InsurerLogo
                insurerId={insurer.id}
                name={insurer.name}
                size="sm"
              />
              {flagged && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-panora-warning-bg border border-white flex items-center justify-center">
                  {needsInput ? (
                    <AlertTriangle className="w-2 h-2 text-panora-warning-text" />
                  ) : (
                    <Clock className="w-2 h-2 text-panora-warning-text" />
                  )}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[13px] leading-5",
                flagged
                  ? "text-panora-warning-text font-medium"
                  : "text-panora-text-muted"
              )}
            >
              {insurer.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Board lifecycle, with "Action requise" promoted to its own column. */
type DisplayStatus =
  | "preparation"
  | "action_requise"
  | "en_cours"
  | "terminee";

const columns: {
  key: DisplayStatus;
  label: string;
  dotColor: string;
}[] = [
  { key: "preparation", label: "En préparation", dotColor: "bg-[#b3afa6]" },
  { key: "action_requise", label: "Action requise", dotColor: "bg-[#cb8052]" },
  { key: "en_cours", label: "En cours", dotColor: "bg-[#be93e4]" },
  { key: "terminee", label: "Terminé", dotColor: "bg-[#94ce9a]" },
];

/**
 * A cotation is "stuck" when nothing is actively in flight (no in_progress) and
 * at least one insurer is waiting on a closed session — the only thing standing
 * between it and progress is a reactivation.
 */
function isStuck(cotation: Cotation, extranets: ExtranetConfig[]): boolean {
  if (getCotationStatus(cotation) === "terminee") return false;
  const blocked = getBlockedInsurerIds(cotation, extranets);
  const hasInProgress = cotation.insurers.some(
    (i) => i.status === "in_progress"
  );
  return blocked.size > 0 && !hasInProgress;
}

/**
 * Why a cotation needs the broker's hand. Both route into "Action requise", but
 * they want different actions:
 *  - "session": a request is stuck on a closed portal. One click should fast-
 *    forward straight to reactivation (Paramètres › Extranets), not the cotation.
 *  - "hitl": an insurer is paused on input (2FA, missing info). The broker opens
 *    the cotation to handle it.
 * HITL outranks session when both are present.
 */
type AttentionReason = "hitl" | "session";

function getAttentionReason(
  cotation: Cotation,
  extranets: ExtranetConfig[]
): AttentionReason | null {
  if (cotation.insurers.some((i) => i.status === "action_required")) {
    return "hitl";
  }
  if (isStuck(cotation, extranets)) return "session";
  return null;
}

/** The column a cotation belongs to. Attention outranks the raw pipeline stage. */
function getDisplayStatus(
  cotation: Cotation,
  extranets: ExtranetConfig[]
): DisplayStatus {
  if (getCotationStatus(cotation) === "terminee") return "terminee";
  if (getAttentionReason(cotation, extranets)) return "action_requise";
  return getCotationStatus(cotation); // "preparation" | "en_cours"
}

/** Where a card click should go, fast-forwarding session cards to reactivation. */
const REACTIVATE_HREF = "/settings/extranets";

/* ── Card footer per status ── */
function CardFooter({
  cotation,
  status,
  reason,
}: {
  cotation: Cotation;
  status: DisplayStatus;
  reason: AttentionReason | null;
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

  // Action requise: a reason-specific call to action, not a progress bar.
  // Session → fast-forward to reactivation; HITL → open the cotation to handle it.
  if (status === "action_requise") {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] text-[#85827b]">{cotation.createdAt}</span>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-panora-warning-text">
          {reason === "session" ? (
            <>
              <FastForward className="w-3.5 h-3.5" />
              Réactiver la session
            </>
          ) : (
            <>
              Traiter la demande
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </span>
      </div>
    );
  }

  // Done: every devis is in, so a progress bar adds nothing — just the date.
  if (status === "terminee") {
    return (
      <span className="text-[12px] text-[#85827b]">{cotation.createdAt}</span>
    );
  }

  // en_cours + action_requise: launched, so show devis progress.
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
            {cotation.product} · {auto.conducteur.split(" ")[0]}
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
  reason,
}: {
  cotation: Cotation;
  status: DisplayStatus;
  blocked: Set<string>;
  reason: AttentionReason | null;
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

  // Session-stuck cards fast-forward to the reactivation of the exact insurer
  // that's blocking them; everything else opens the cotation at its natural stage.
  const blockedInsurerId = [...blocked][0];
  const href =
    reason === "session"
      ? `${REACTIVATE_HREF}?activate=${blockedInsurerId ?? ""}`
      : getCotationStatus(cotation) === "preparation"
        ? `/quoting/preparation?id=${cotation.id}`
        : `/quoting/followup?id=${cotation.id}`;

  return (
    <Link href={href}>
      <div className="bg-[#fdfdfc] border border-panora-border rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3 hover:border-panora-text-muted/30 transition-all cursor-pointer">
        {/* Title + client. Status is carried by the column, not a per-card badge. */}
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

        {/* Insurers list — always inline horizontal */}
        <InsurerRow insurers={cotation.insurers} blocked={blocked} />

        {/* Separator */}
        <div className="h-px bg-[#d9d9d9]" />

        {/* Footer */}
        <CardFooter cotation={cotation} status={status} reason={reason} />
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
  const grouped = columns.map((col) => ({
    ...col,
    items: cotations.filter(
      (c) => getDisplayStatus(c, extranets) === col.key
    ),
  }));

  return (
    // Fixed-width columns that scroll horizontally rather than squeezing.
    <div className="flex gap-4 min-h-0 flex-1 overflow-x-auto pb-1">
      {grouped.map((column) => (
        <div
          key={column.key}
          className="w-[300px] shrink-0 bg-panora-drop rounded-[11px] p-2.5 flex flex-col gap-3.5"
        >
          {/* Column header */}
          <div className="flex items-center gap-2 pl-1 h-5">
            <div className={cn("w-2 h-2 rounded-full", column.dotColor)} />
            <span className="text-[12px] font-medium text-[#2d2a26]">
              {column.label}
            </span>
            <span className="text-[11px] font-medium text-panora-text-muted tabular-nums">
              {column.items.length}
            </span>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-3.5 flex-1 min-h-0 overflow-y-auto">
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
                  reason={getAttentionReason(cotation, extranets)}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
