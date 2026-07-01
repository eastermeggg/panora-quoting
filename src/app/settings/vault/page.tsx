"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Package,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EFFECT_KIND_LABELS,
  getAllRuleSources,
  getAllRules,
  getReferentielForProduit,
  getReferentielProduits,
  produitLabel,
  ruleFacetOptions,
  ruleMatchesProduct,
} from "@/data/souscription-engine";
import type {
  EffectKind,
  Produit,
  Rule,
  RuleStatus,
} from "@/data/souscription-mock";
import { RuleListRow } from "@/components/souscription/RuleListRow";
import { EditRuleModal } from "@/components/souscription/EditRuleModal";
import { ReferentielList } from "@/components/souscription/ReferentielList";
import { RuleSourceList } from "@/components/souscription/RuleSourceList";
import type { RuleChange } from "@/components/souscription/types";

type Tab = "regles" | "referentiel";

function useToggleSet<T>() {
  const [set, setSet] = useState<Set<T>>(new Set());
  const toggle = (v: T) =>
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  const clear = () => setSet(new Set());
  return [set, toggle, clear] as const;
}

export default function VaultSettingsPage() {
  const [tab, setTab] = useState<Tab>("regles");
  const [mods, setMods] = useState<Record<string, RuleChange>>({});
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const [selProduits, toggleProduit, clearProduits] = useToggleSet<
    Produit | "transverse"
  >();
  const [selKinds, toggleKind, clearKinds] = useToggleSet<EffectKind>();
  const [selStatuses, toggleStatus, clearStatuses] = useToggleSet<RuleStatus>();

  function effectiveRule(rule: Rule): Rule {
    const m = mods[rule.id];
    if (!m) return rule;
    return {
      ...rule,
      valeur: m.valeur ?? rule.valeur,
      effet: m.effet ?? rule.effet,
      status: m.status ?? rule.status,
      facets: {
        ...rule.facets,
        produit: m.produit ?? rule.facets.produit,
        condition: m.condition ?? rule.facets.condition,
        activite: m.activite ?? rule.facets.activite,
      },
    };
  }

  function isModified(id: string): boolean {
    const m = mods[id];
    return (
      !!m &&
      (m.valeur != null ||
        m.condition != null ||
        m.effet != null ||
        m.activite != null)
    );
  }

  function applyChange(id: string, change: RuleChange) {
    setMods((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }));
  }

  const options = ruleFacetOptions();
  const allRules = getAllRules().map(effectiveRule);
  const filtered = allRules.filter((r) => {
    if (
      selProduits.size > 0 &&
      ![...selProduits].some((p) => ruleMatchesProduct(r, p))
    )
      return false;
    if (selKinds.size > 0 && !selKinds.has(r.effectKind)) return false;
    if (selStatuses.size > 0 && !selStatuses.has(r.status)) return false;
    return true;
  });
  const anyActive =
    selProduits.size > 0 || selKinds.size > 0 || selStatuses.size > 0;

  function resetFilters() {
    clearProduits();
    clearKinds();
    clearStatuses();
  }

  const selectedBase = selectedRuleId
    ? getAllRules().find((r) => r.id === selectedRuleId)
    : undefined;
  const selectedRule = selectedBase ? effectiveRule(selectedBase) : null;

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-panora-border pt-5">
        <div className="max-w-[820px] mx-auto px-8">
          <Link
            href="/souscription"
            className="inline-flex items-center gap-1 text-[12px] text-panora-text-muted hover:text-panora-text transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Assistant souscription
          </Link>
          <div className="mt-2 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider leading-4">
              Paramètres
            </span>
            <h1 className="text-[24px] font-serif leading-7 text-panora-text">
              Vault souscription
            </h1>
            <p className="text-[13px] text-panora-text-secondary leading-5">
              Règles de souscription ingérées et référentiel produit. Alimente le
              moteur de tarification.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <TabBtn active={tab === "regles"} onClick={() => setTab("regles")}>
              Règles
            </TabBtn>
            <TabBtn
              active={tab === "referentiel"}
              onClick={() => {
                setTab("referentiel");
                setSelectedRuleId(null);
              }}
            >
              Référentiel produit
            </TabBtn>
          </div>
        </div>
      </div>

      {tab === "regles" ? (
        <div className="flex-1 min-h-0 flex flex-col">
            {/* Filter bar */}
            <div className="shrink-0 border-b border-panora-border py-2.5">
              <div className="max-w-[820px] mx-auto px-8 flex items-center gap-2 flex-wrap">
                <FacetFilter
                  icon={Package}
                  label="Produit"
                  selected={selProduits}
                  onToggle={toggleProduit}
                  options={options.produits.map((p) => ({
                    value: p,
                    label: p === "transverse" ? "Transverses" : produitLabel(p),
                  }))}
                />
                <FacetFilter
                  icon={Tag}
                  label="Type"
                  selected={selKinds}
                  onToggle={toggleKind}
                  options={options.kinds.map((k) => ({
                    value: k,
                    label: EFFECT_KIND_LABELS[k],
                  }))}
                />
                <FacetFilter
                  icon={CheckCircle2}
                  label="Statut"
                  selected={selStatuses}
                  onToggle={toggleStatus}
                  options={[
                    { value: "confirmee", label: "Confirmées" },
                    { value: "a_valider", label: "À valider" },
                  ]}
                />
                {anyActive && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="ml-auto text-[12px] font-medium text-panora-text-secondary hover:text-panora-text transition-colors"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="max-w-[820px] mx-auto px-8 py-5 flex flex-col gap-3">
                <div className="text-[12px] text-panora-text-muted">
                  {filtered.length} règle{filtered.length > 1 ? "s" : ""}
                  {anyActive ? ` sur ${allRules.length}` : ""}
                </div>
                <div className="flex flex-col gap-2.5">
                  {filtered.length === 0 ? (
                    <div className="rounded-xl border border-panora-border px-4 py-8 text-center text-[12px] text-panora-text-muted">
                      Aucune règle sur ces filtres.
                    </div>
                  ) : (
                    filtered.map((r) => (
                      <RuleListRow
                        key={r.id}
                        rule={r}
                        modified={isModified(r.id)}
                        selected={selectedRuleId === r.id}
                        onModify={() => setSelectedRuleId(r.id)}
                        onValidate={() =>
                          applyChange(r.id, { status: "confirmee" })
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-[820px] mx-auto px-8 py-5 flex flex-col gap-6">
            {/* Rule-source files — the ingested docs that feed the engine */}
            <section className="flex flex-col gap-2">
              <h2 className="text-[13px] font-semibold text-panora-text leading-5 font-display">
                Sources de règles
              </h2>
              <p className="text-[12px] text-panora-text-secondary leading-4">
                Fichiers ingérés qui alimentent le moteur de tarification.
              </p>
              <RuleSourceList sources={getAllRuleSources()} />
            </section>

            <p className="text-[12px] text-panora-text-secondary leading-4">
              {"Documents produit, stockés tels quels et récupérés à l'export. Ce ne sont pas des règles."}
            </p>
            {getReferentielProduits().map((p) => (
              <section key={p} className="flex flex-col gap-2">
                <h2 className="text-[13px] font-semibold text-panora-text leading-5 font-display">
                  {produitLabel(p)}
                </h2>
                <ReferentielList docs={getReferentielForProduit(p)} />
              </section>
            ))}
          </div>
        </div>
      )}

      {selectedRule && (
        <EditRuleModal
          key={selectedRule.id}
          rule={selectedRule}
          onApply={(c) => applyChange(selectedRule.id, c)}
          onClose={() => setSelectedRuleId(null)}
        />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative h-9 px-1 text-[13px] font-medium transition-colors",
        active ? "text-panora-text" : "text-panora-text-muted hover:text-panora-text"
      )}
    >
      <span className="px-1">{children}</span>
      {active && (
        <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-panora-text rounded-full" />
      )}
    </button>
  );
}

/** A Notion-style filter pill: icon + label (+ selected summary), opening a
 *  multi-select checkbox dropdown. Filled when a filter is active. */
function FacetFilter<T extends string>({
  icon: Icon,
  label,
  options,
  selected,
  onToggle,
}: {
  icon: LucideIcon;
  label: string;
  options: { value: T; label: string }[];
  selected: Set<T>;
  onToggle: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const active = selected.size > 0;
  const summary = active
    ? selected.size === 1
      ? (options.find((o) => selected.has(o.value))?.label ?? "1")
      : `${selected.size}`
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium border transition-colors",
          active
            ? "bg-panora-green-light text-panora-green-dark border-panora-green-border"
            : "bg-white text-panora-text-secondary border-panora-border hover:bg-panora-drop hover:text-panora-text"
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>
          {label}
          {summary ? ` : ${summary}` : ""}
        </span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 min-w-[210px] bg-white border border-panora-border rounded-lg shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] py-1.5 z-20">
          {options.map((o) => {
            const checked = selected.has(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onToggle(o.value)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-panora-text hover:bg-panora-drop transition-colors text-left"
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors",
                    checked
                      ? "bg-panora-green border-panora-green"
                      : "border-panora-border bg-white"
                  )}
                >
                  {checked && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </span>
                <span className="flex-1">{o.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
