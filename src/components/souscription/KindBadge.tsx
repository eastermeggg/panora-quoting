"use client";

import {
  ClipboardList,
  Gavel,
  Percent,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EFFECT_KIND_LABELS } from "@/data/souscription-engine";
import type { EffectKind } from "@/data/souscription-mock";

/**
 * Per-type badge: a distinct soft color + icon for each rule effect kind, so the
 * vault list is scannable at a glance.
 *  - Disposition (route the risk) → amber, gavel
 *  - Tarif (price it) → green, percent
 *  - Couverture (shape the cover) → blue, shield
 *  - Exigence (require a doc) → violet, clipboard
 */
const KIND_META: Record<EffectKind, { icon: LucideIcon; className: string }> = {
  disposition: { icon: Gavel, className: "bg-amber-50 text-amber-700" },
  tarif: { icon: Percent, className: "bg-emerald-50 text-emerald-700" },
  couverture: { icon: Shield, className: "bg-blue-50 text-blue-700" },
  exigence: { icon: ClipboardList, className: "bg-violet-50 text-violet-700" },
};

export function KindBadge({ kind }: { kind: EffectKind }) {
  const { icon: Icon, className } = KIND_META[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-5 pl-1.5 pr-2 rounded-[6px] text-[11px] font-medium",
        className
      )}
    >
      <Icon className="w-3 h-3" strokeWidth={2} />
      {EFFECT_KIND_LABELS[kind]}
    </span>
  );
}
