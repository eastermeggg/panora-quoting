"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, Plus, Sparkles, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { produitLabel } from "@/data/souscription-engine";
import type { Produit, Rule } from "@/data/souscription-mock";
import { KindBadge } from "./KindBadge";
import type { RuleChange } from "./types";

const FIELD_OPTIONS = [
  "CA HT",
  "Effectif",
  "Masse salariale",
  "Activité",
  "Certification",
  "Export US/Canada",
  "Sous-traitance",
  "Sinistres (3 ans)",
  "Ligne demandée",
  "Total bilan",
  "Levée de fonds",
  "Volet cyber",
];
const OPERATOR_OPTIONS = [">", "≥", "<", "≤", "=", "≠", "entre", "contient"];
const PRODUCT_CHOICES: (Produit | "tous")[] = ["RC_PRO", "DO", "CYBER", "tous"];

interface Predicate {
  id: string;
  field: string;
  operator: string;
  value: string;
}

let predicateCounter = 0;
const uid = () => `p${predicateCounter++}`;

function guessField(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("masse salariale")) return "Masse salariale";
  if (/\bca\b|chiffre d'affaires/.test(t)) return "CA HT";
  if (t.includes("effectif")) return "Effectif";
  if (t.includes("certification") || t.includes("iso")) return "Certification";
  if (t.includes("export")) return "Export US/Canada";
  if (t.includes("sous-traitance")) return "Sous-traitance";
  if (t.includes("sinistre")) return "Sinistres (3 ans)";
  if (t.includes("ligne")) return "Ligne demandée";
  if (t.includes("bilan")) return "Total bilan";
  if (t.includes("levee") || t.includes("levée")) return "Levée de fonds";
  if (t.includes("cyber")) return "Volet cyber";
  if (
    t.includes("activit") ||
    t.includes("conseil") ||
    t.includes("btp") ||
    t.includes("sante") ||
    t.includes("santé")
  )
    return "Activité";
  return "CA HT";
}

function parsePredicate(part: string): Predicate {
  const text = part.trim();
  for (const op of [">=", "<=", "≥", "≤", ">", "<", "="]) {
    const idx = text.indexOf(op);
    if (idx > 0) {
      const left = text.slice(0, idx).trim();
      const right = text.slice(idx + op.length).trim();
      const normOp = op === ">=" ? "≥" : op === "<=" ? "≤" : op;
      return { id: uid(), field: guessField(left), operator: normOp, value: right };
    }
  }
  if (/\d\s*-\s*\d/.test(text)) {
    const value = text.replace(/^[a-zà-ÿ\s']+/i, "").trim() || text;
    return { id: uid(), field: guessField(text), operator: "entre", value };
  }
  return { id: uid(), field: guessField(text), operator: "contient", value: text };
}

function parseCondition(cond: string): {
  connector: "ET" | "OU";
  predicates: Predicate[];
} {
  if (!cond || cond.trim() === "-") return { connector: "ET", predicates: [] };
  const connector: "ET" | "OU" = /\sou\s|\sor\s/i.test(cond) ? "OU" : "ET";
  const parts = cond.split(/\s+et\s+|\s+ou\s+|\s+and\s+|\s+or\s+/i);
  return { connector, predicates: parts.map(parsePredicate) };
}

function serializeCondition(predicates: Predicate[], connector: "ET" | "OU"): string {
  const live = predicates.filter((p) => p.value.trim() || p.operator);
  if (live.length === 0) return "-";
  return live
    .map((p) => `${p.field} ${p.operator} ${p.value}`.trim())
    .join(` ${connector} `);
}

function extractValue(msg: string): string | null {
  const m = msg.match(/\d[\d\s.,]*(?:%|k€|M€|€)?/);
  return m ? m[0].replace(/\s+/g, " ").trim() : null;
}

interface Draft {
  produit: Produit[] | "tous";
  activite: string;
  connector: "ET" | "OU";
  predicates: Predicate[];
  effet: string;
  valeur: string;
  confirmed: boolean;
}

interface Msg {
  role: "user" | "assistant";
  text: string;
}

/**
 * Prominent rule editor: a structured condition builder (field / operator /
 * value rows joined by ET/OU) on the left, and a chat assistant on the right.
 * Both edit a local draft; "Enregistrer" commits via onApply.
 */
export function EditRuleModal({
  rule,
  onApply,
  onClose,
}: {
  rule: Rule;
  onApply: (change: RuleChange) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => {
    const { connector, predicates } = parseCondition(rule.facets.condition);
    return {
      produit: rule.facets.produit,
      activite: rule.facets.activite,
      connector,
      predicates,
      effet: rule.effet,
      valeur: rule.valeur != null ? String(rule.valeur) : "",
      confirmed: rule.status === "confirmee",
    };
  });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function produitActive(p: Produit | "tous"): boolean {
    if (p === "tous") return draft.produit === "tous";
    return draft.produit !== "tous" && draft.produit.includes(p);
  }
  function toggleProduit(p: Produit | "tous") {
    setDraft((d) => {
      if (p === "tous") return { ...d, produit: "tous" };
      const cur = d.produit === "tous" ? [] : [...d.produit];
      const i = cur.indexOf(p);
      if (i >= 0) cur.splice(i, 1);
      else cur.push(p);
      return { ...d, produit: cur.length ? cur : "tous" };
    });
  }
  function addPredicate() {
    setDraft((d) => ({
      ...d,
      predicates: [...d.predicates, { id: uid(), field: "CA HT", operator: ">", value: "" }],
    }));
  }
  function updatePredicate(id: string, patch: Partial<Predicate>) {
    setDraft((d) => ({
      ...d,
      predicates: d.predicates.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }
  function removePredicate(id: string) {
    setDraft((d) => ({ ...d, predicates: d.predicates.filter((p) => p.id !== id) }));
  }
  function toggleConnector() {
    setDraft((d) => ({ ...d, connector: d.connector === "ET" ? "OU" : "ET" }));
  }

  function sendChat(text: string) {
    const q = text.trim();
    if (!q) return;
    const lower = q.toLowerCase();
    let reply = "";
    let mutate: ((d: Draft) => Draft) | null = null;

    if (/confirm|valid/.test(lower)) {
      mutate = (d) => ({ ...d, confirmed: true });
      reply = "Règle marquée comme confirmée.";
    } else if (/ajoute|condition|restrein|seulement si|uniquement si/.test(lower)) {
      const tail = q.replace(/^.*?(ajoute|condition|restrein\w*|si)\s*:?\s*/i, "");
      const pred = parsePredicate(tail || q);
      mutate = (d) => ({ ...d, predicates: [...d.predicates, pred] });
      reply = `Condition ajoutée : ${pred.field} ${pred.operator} ${pred.value}.`;
    } else {
      const val = extractValue(q);
      if (val) {
        mutate = (d) => ({ ...d, valeur: val });
        reply = `Valeur mise à jour : ${draft.valeur || "non définie"} → ${val}.`;
      }
    }
    if (!mutate) {
      reply =
        "Dites par exemple « passer à 0,9 % », « confirmer », ou « condition : effectif > 30 ».";
    }
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: reply }]);
    if (mutate) setDraft(mutate);
    setChatDraft("");
  }

  function save() {
    onApply({
      produit: draft.produit,
      activite: draft.activite.trim() || "toutes",
      condition: serializeCondition(draft.predicates, draft.connector),
      effet: draft.effet.trim() || rule.effet,
      valeur: draft.valeur.trim() || undefined,
      status: draft.confirmed ? "confirmee" : "a_valider",
    });
    onClose();
  }

  const suggestions = [
    draft.confirmed ? null : "Confirmer cette règle",
    "Condition : effectif > 30",
    draft.valeur ? "Passer à 0,9 %" : null,
  ].filter(Boolean) as string[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-[860px] max-w-[95vw] h-[620px] max-h-[88vh] flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-panora-border flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <KindBadge kind={rule.effectKind} />
              <span className="text-[12px] text-panora-text-muted">
                Modifier la règle
              </span>
            </div>
            <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display truncate">
              {draft.effet}
              {draft.valeur ? ` · ${draft.valeur}` : ""}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-panora-text-muted hover:text-panora-text hover:bg-panora-drop transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: builder + chat */}
        <div className="flex-1 min-h-0 flex">
          {/* Builder */}
          <div className="flex-1 min-w-0 overflow-y-auto border-r border-panora-border px-5 py-5 flex flex-col gap-5">
            {/* Produit */}
            <Section label="Produit">
              <div className="flex flex-wrap gap-1.5">
                {PRODUCT_CHOICES.map((p) => (
                  <ToggleChip
                    key={p}
                    active={produitActive(p)}
                    onClick={() => toggleProduit(p)}
                  >
                    {p === "tous" ? "Tous produits" : produitLabel(p)}
                  </ToggleChip>
                ))}
              </div>
            </Section>

            {/* Activité */}
            <Section label="Activité">
              <input
                value={draft.activite}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, activite: e.target.value }))
                }
                placeholder="toutes"
                className="w-full h-9 px-3 text-[13px] text-panora-text bg-white border border-panora-border rounded-lg outline-none focus:border-panora-green/40 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
              />
            </Section>

            {/* Conditions — the rule builder */}
            <Section label="Conditions">
              {draft.predicates.length === 0 ? (
                <p className="text-[12px] text-panora-text-muted">
                  Aucune condition : s&apos;applique à tous les profils.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {draft.predicates.map((p, i) => (
                    <div key={p.id} className="flex flex-col gap-1.5">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={toggleConnector}
                          className="self-start text-[11px] font-semibold text-panora-green px-2 py-0.5 rounded hover:bg-panora-green-light transition-colors"
                        >
                          {draft.connector}
                        </button>
                      )}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={p.field}
                          onChange={(e) =>
                            updatePredicate(p.id, { field: e.target.value })
                          }
                          className="h-8 px-2 text-[12px] text-panora-text bg-white border border-panora-border rounded-md outline-none focus:border-panora-green/40 flex-1 min-w-0"
                        >
                          {FIELD_OPTIONS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                        <select
                          value={p.operator}
                          onChange={(e) =>
                            updatePredicate(p.id, { operator: e.target.value })
                          }
                          className="h-8 px-1.5 text-[12px] text-panora-text bg-white border border-panora-border rounded-md outline-none focus:border-panora-green/40 shrink-0"
                        >
                          {OPERATOR_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                        <input
                          value={p.value}
                          onChange={(e) =>
                            updatePredicate(p.id, { value: e.target.value })
                          }
                          placeholder="valeur"
                          className="h-8 px-2.5 text-[12px] text-panora-text bg-white border border-panora-border rounded-md outline-none focus:border-panora-green/40 w-[104px] shrink-0"
                        />
                        <button
                          type="button"
                          onClick={() => removePredicate(p.id)}
                          aria-label="Supprimer la condition"
                          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-panora-text-muted hover:text-panora-error hover:bg-panora-drop transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={addPredicate}
                className="self-start mt-2 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-dashed border-panora-border text-[12px] font-medium text-panora-text-secondary hover:border-panora-text-muted/40 hover:bg-panora-drop transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter une condition
              </button>
            </Section>

            {/* Effet */}
            <Section label="Effet">
              <div className="flex items-center gap-1.5">
                <input
                  value={draft.effet}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, effet: e.target.value }))
                  }
                  placeholder="Libellé de l'effet"
                  className="flex-1 min-w-0 h-9 px-3 text-[13px] text-panora-text bg-white border border-panora-border rounded-lg outline-none focus:border-panora-green/40 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                />
                <input
                  value={draft.valeur}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, valeur: e.target.value }))
                  }
                  placeholder="valeur"
                  className="w-[104px] shrink-0 h-9 px-2.5 text-[13px] text-panora-text bg-white border border-panora-border rounded-lg outline-none focus:border-panora-green/40 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                />
              </div>
            </Section>
          </div>

          {/* Chat */}
          <div className="w-[330px] shrink-0 flex flex-col min-h-0 bg-panora-bg/40">
            <div className="shrink-0 px-4 h-11 flex items-center gap-2 border-b border-panora-border">
              <Sparkles className="w-4 h-4 text-panora-green" />
              <span className="text-[13px] font-medium text-panora-text">
                Co-pilote
              </span>
            </div>
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col gap-3">
                  <p className="text-[13px] text-panora-text-secondary leading-5">
                    {"Décrivez la modification, ou utilisez le constructeur à gauche."}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => sendChat(s)}
                        className="text-left text-[13px] text-panora-text px-3 py-2 rounded-lg border border-panora-border bg-white hover:bg-panora-drop transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) =>
                  m.role === "user" ? (
                    <div
                      key={i}
                      className="self-end max-w-[85%] bg-panora-secondary text-panora-text text-[13px] leading-5 px-3 py-2 rounded-[10px] rounded-br-[3px]"
                    >
                      {m.text}
                    </div>
                  ) : (
                    <div key={i} className="self-start max-w-[92%] flex gap-2">
                      <Sparkles className="w-4 h-4 text-panora-green shrink-0 mt-0.5" />
                      <div className="text-[13px] leading-5 text-panora-text">
                        {m.text}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
            <div className="shrink-0 px-3 pb-3 pt-2 border-t border-panora-border">
              <div className="flex items-end gap-2 bg-white border border-panora-border rounded-xl px-2.5 py-2 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] focus-within:border-panora-green/40 transition-colors">
                <textarea
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChat(chatDraft);
                    }
                  }}
                  rows={1}
                  placeholder="Modifier cette règle..."
                  className="flex-1 resize-none bg-transparent text-[13px] leading-5 text-panora-text placeholder:text-panora-text-muted outline-none max-h-24"
                />
                <button
                  type="button"
                  onClick={() => sendChat(chatDraft)}
                  disabled={!chatDraft.trim()}
                  aria-label="Envoyer"
                  className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-panora-text text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3.5 border-t border-panora-border flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-[13px] text-panora-text cursor-pointer">
            <span
              onClick={() => setDraft((d) => ({ ...d, confirmed: !d.confirmed }))}
              className={cn(
                "w-4 h-4 rounded-[5px] border flex items-center justify-center transition-colors",
                draft.confirmed
                  ? "bg-panora-green border-panora-green"
                  : "border-panora-border bg-white"
              )}
            >
              {draft.confirmed && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </span>
            Règle confirmée (consommée par le moteur)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 rounded-lg border border-panora-border text-[13px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={save}
              className="btn-primary inline-flex items-center gap-2 px-4 h-9 text-[13px] font-semibold leading-5"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-[0.06em] leading-4">
        {label}
      </span>
      {children}
    </section>
  );
}

function ToggleChip({
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
        "inline-flex items-center h-7 px-2.5 rounded-full text-[12px] font-medium border transition-colors",
        active
          ? "bg-panora-green-light text-panora-green-dark border-panora-green-border"
          : "bg-white text-panora-text-secondary border-panora-border hover:bg-panora-drop hover:text-panora-text"
      )}
    >
      {children}
    </button>
  );
}
