"use client";

import { Building2, Check, Loader2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import Link from "next/link";
import type { Cotation, CotationStatus, CotationInsurer } from "@/data/mock";
import { getCotationStatus } from "@/data/mock";

const columns: {
  key: CotationStatus;
  label: string;
  dotColor: string;
}[] = [
  { key: "preparation", label: "En préparation", dotColor: "bg-[#f5ae73]" },
  { key: "en_cours", label: "En cours", dotColor: "bg-[#be93e4]" },
  { key: "terminee", label: "Terminé", dotColor: "bg-[#94ce9a]" },
];

/* ── Card footer per status ── */
function CardFooter({
  cotation,
  status,
}: {
  cotation: Cotation;
  status: CotationStatus;
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

/* ── Cotation card ── */
function CotationCard({
  cotation,
  status,
}: {
  cotation: Cotation;
  status: CotationStatus;
}) {
  const href =
    status === "preparation"
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
        <div className="flex items-center gap-2.5">
          {cotation.insurers.map((insurer) => (
            <div
              key={insurer.id}
              className="flex items-center gap-[7px]"
            >
              <InsurerLogo
                insurerId={insurer.id}
                name={insurer.name}
                size="sm"
              />
              <span className="text-[13px] text-panora-text-muted leading-5">
                {insurer.name}
              </span>
            </div>
          ))}
        </div>

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
  const grouped = columns.map((col) => ({
    ...col,
    items: cotations.filter((c) => getCotationStatus(c) === col.key),
  }));

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
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
