"use client";

import { FileText, Car, Building2, Mail, Clock, ChevronRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import Link from "next/link";
import type { Cotation, CotationStatus, CotationInsurer } from "@/data/mock";
import { getCotationStatus } from "@/data/mock";

const columns: { key: CotationStatus; label: string; color: string; dotColor: string }[] = [
  {
    key: "preparation",
    label: "En préparation",
    color: "text-panora-text-secondary",
    dotColor: "bg-panora-text-muted",
  },
  {
    key: "en_cours",
    label: "En cours",
    color: "text-panora-text-secondary",
    dotColor: "bg-blue-500",
  },
  {
    key: "terminee",
    label: "Terminée",
    color: "text-panora-text-secondary",
    dotColor: "bg-panora-green",
  },
];

const productIcons = {
  car: Car,
  shield: FileText,
  building: Building2,
};

function InsurerStatusDot({ status }: { status: CotationInsurer["status"] }) {
  if (status === "completed") {
    return <CheckCircle2 className="w-3.5 h-3.5 text-panora-green" />;
  }
  if (status === "action_required") {
    return <AlertCircle className="w-3.5 h-3.5 text-panora-warning" />;
  }
  if (status === "in_progress") {
    return <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />;
  }
  return <Clock className="w-3.5 h-3.5 text-panora-text-muted" />;
}

function CotationCard({ cotation }: { cotation: Cotation }) {
  const ProductIcon = productIcons[cotation.productIcon];
  const completed = cotation.insurers.filter((i) => i.status === "completed").length;
  const actionRequired = cotation.insurers.filter((i) => i.status === "action_required").length;
  const total = cotation.insurers.length;

  // Find best price across completed insurers
  const bestPrice = cotation.insurers
    .filter((i) => i.bestPrice)
    .map((i) => i.bestPrice)
    .sort()[0];

  return (
    <Link href={`/quoting/followup?id=${cotation.id}`}>
      <div className="bg-panora-card border border-panora-border rounded-lg p-4 hover:shadow-sm hover:border-panora-text-muted/30 transition-all cursor-pointer group">
        {/* Header: client + product */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-panora-text truncate">
              {cotation.client}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <ProductIcon className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
              <span className="text-xs text-panora-text-secondary truncate">
                {cotation.product}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-panora-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
        </div>

        {/* Cotation ID + date */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono text-panora-text-muted">
            {cotation.cotationId}
          </span>
          <span className="text-panora-border">·</span>
          <span className="text-[11px] text-panora-text-muted">
            {cotation.createdAt}
          </span>
          {cotation.createdVia === "email" && (
            <>
              <span className="text-panora-border">·</span>
              <Mail className="w-3 h-3 text-panora-green" />
            </>
          )}
        </div>

        {/* Insurers list */}
        <div className="space-y-1.5">
          {cotation.insurers.map((insurer) => (
            <div
              key={insurer.id}
              className="flex items-center gap-2"
            >
              <InsurerLogo insurerId={insurer.id} name={insurer.name} size="sm" />
              <span className="text-xs text-panora-text-secondary flex-1 truncate">
                {insurer.name}
              </span>
              <InsurerStatusDot status={insurer.status} />
              {insurer.bestPrice && (
                <span className="text-[11px] font-medium text-panora-green">
                  {insurer.bestPrice}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer: progress */}
        {total > 0 && (
          <div className="mt-3 pt-3 border-t border-panora-border">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-panora-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-panora-green rounded-full transition-all"
                  style={{ width: `${(completed / total) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-panora-text-muted whitespace-nowrap">
                {completed}/{total} devis
              </span>
              {actionRequired > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-panora-warning font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {actionRequired}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

interface KanbanBoardProps {
  cotations: Cotation[];
}

export function KanbanBoard({ cotations }: KanbanBoardProps) {
  const grouped = columns.map((col) => ({
    ...col,
    items: cotations.filter((c) => getCotationStatus(c) === col.key),
  }));

  return (
    <div className="flex gap-4 min-h-0 flex-1">
      {grouped.map((column) => (
        <div key={column.key} className="flex-1 min-w-[280px] flex flex-col">
          {/* Column header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className={cn("w-2 h-2 rounded-full", column.dotColor)} />
            <span className={cn("text-xs font-semibold uppercase tracking-wide", column.color)}>
              {column.label}
            </span>
            <span className="text-[11px] text-panora-text-muted bg-panora-drop rounded-full px-1.5 py-0.5">
              {column.items.length}
            </span>
          </div>

          {/* Column content */}
          <div className="flex-1 space-y-3 overflow-y-auto">
            {column.items.length === 0 ? (
              <div className="border border-dashed border-panora-border rounded-lg p-6 flex items-center justify-center">
                <span className="text-xs text-panora-text-muted">
                  Aucune cotation
                </span>
              </div>
            ) : (
              column.items.map((cotation) => (
                <CotationCard key={cotation.id} cotation={cotation} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
