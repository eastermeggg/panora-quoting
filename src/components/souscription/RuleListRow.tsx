"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSourceDoc, produitLabel } from "@/data/souscription-engine";
import type { Produit, Rule } from "@/data/souscription-mock";
import { KindBadge } from "./KindBadge";

function productLabels(rule: Rule): string[] {
  return rule.facets.produit === "tous"
    ? ["Tous produits"]
    : (rule.facets.produit as Produit[]).map(produitLabel);
}

const VALUE_TYPES = new Set([
  "taux",
  "modificateur",
  "sous_limite",
  "franchise",
  "plafond",
]);

/** Title = the effect headline, reading its value naturally ("Taux de base de 0,8%"). */
function ruleTitle(rule: Rule): string {
  if (rule.valeur != null && VALUE_TYPES.has(rule.effectType)) {
    return `${rule.effet} de ${rule.valeur}`;
  }
  return rule.effet;
}

/** Description = a natural-language sentence saying when the rule applies. */
function ruleExplanation(rule: Rule): string {
  const act =
    rule.facets.activite && rule.facets.activite !== "toutes"
      ? rule.facets.activite
      : null;
  const cond =
    rule.facets.condition && rule.facets.condition !== "-"
      ? rule.facets.condition
      : null;
  if (act && cond) return `S'applique en ${act}, si ${cond}.`;
  if (act) return `S'applique aux activités ${act}.`;
  if (cond) return `S'applique si ${cond}.`;
  return "S'applique à tous les profils, sans condition.";
}

/**
 * A vault rule, readable at a glance: type tag + product tag(s), a title (what it
 * does) and a small description (when it applies). The status doubles as the
 * affordance to expand the full facets + source, with Valider / Modifier.
 */
export function RuleListRow({
  rule,
  modified,
  selected,
  onModify,
  onValidate,
}: {
  rule: Rule;
  modified: boolean;
  selected: boolean;
  onModify: () => void;
  onValidate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const source = getSourceDoc(rule.sourceId);
  const confirmed = rule.status === "confirmee";
  const products = productLabels(rule);
  const title = ruleTitle(rule);

  return (
    <div
      className={cn(
        "rounded-xl border bg-white transition-colors",
        selected
          ? "border-panora-green/50 ring-1 ring-panora-green/20"
          : "border-panora-border"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full text-left px-4 py-3 flex flex-col gap-1.5"
      >
        {/* Tags + status */}
        <div className="flex items-center gap-1.5">
          <KindBadge kind={rule.effectKind} />
          {products.map((p) => (
            <ProductTag key={p}>{p}</ProductTag>
          ))}
          {modified && (
            <span className="inline-flex items-center h-5 px-1.5 rounded-full bg-panora-green-light text-panora-green-dark text-[11px] font-medium leading-4">
              modifiée
            </span>
          )}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <StatusMarker confirmed={confirmed} />
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-panora-text-muted transition-transform",
                open && "rotate-180"
              )}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-[13px] font-medium text-panora-text leading-5">
          {title}
        </div>

        {/* Description */}
        <div className="text-[12px] text-panora-text-muted leading-[17px]">
          {ruleExplanation(rule)}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-3.5 border-t border-panora-border/70 flex flex-col gap-3">
          <dl className="flex flex-col gap-1.5 pt-3">
            <FacetRow label="Produit" value={products.join(", ")} />
            <FacetRow label="Activité" value={rule.facets.activite} />
            {rule.facets.condition && rule.facets.condition !== "-" && (
              <FacetRow label="Condition" value={rule.facets.condition} />
            )}
            <FacetRow label="Effet" value={title} />
            <FacetRow
              label="Source"
              value={`${source?.filename ?? "source inconnue"} · ${rule.sourceLocation}`}
              mono
            />
          </dl>

          <div className="flex items-center justify-end gap-2">
            {!confirmed && (
              <button
                type="button"
                onClick={onValidate}
                className="h-7 px-2.5 rounded-md text-[12px] font-medium text-panora-green hover:bg-panora-green-light transition-colors"
              >
                Valider
              </button>
            )}
            <button
              type="button"
              onClick={onModify}
              className="h-7 px-2.5 rounded-md text-[12px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
            >
              Modifier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center h-5 px-2 rounded-[6px] border border-panora-border bg-white text-[11px] font-medium text-panora-text-secondary">
      {children}
    </span>
  );
}

function StatusMarker({ confirmed }: { confirmed: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium leading-4",
        confirmed ? "text-panora-green-dark" : "text-panora-warning-text"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          confirmed ? "bg-panora-green" : "bg-panora-warning"
        )}
      />
      {confirmed ? "confirmée" : "à valider"}
    </span>
  );
}

function FacetRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-3 text-[12px] leading-4">
      <span className="w-[84px] shrink-0 text-panora-text-muted">{label}</span>
      <span
        className={cn(
          "flex-1 text-panora-text",
          mono && "font-mono text-[11px] break-all"
        )}
      >
        {value}
      </span>
    </div>
  );
}
