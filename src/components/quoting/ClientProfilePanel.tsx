"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X as XIcon, ChevronDown, Sparkles, Plus, PencilLine, Info, Target } from "lucide-react";
import type { ClientProfileData, ContextPill, BesoinItem, DynamicField, DynamicFieldValues } from "@/data/mock";
import { BesoinTag } from "@/components/ui/BesoinTag";

interface ClientProfilePanelProps {
  profile: ClientProfileData;
  contextPills?: ContextPill[];
  onSave: (updated: ClientProfileData) => void;
  onClose: () => void;
  /** Dynamic fields config for rate-based products */
  dynamicFields?: DynamicField[];
  /** Current dynamic field values */
  dynamicFieldValues?: DynamicFieldValues;
  /** Called on blur when a dynamic field value changes */
  onDynamicFieldChange?: (fieldId: string, value: number | undefined) => void;
}

let nextId = 0;
function makeId() {
  return `besoin-panel-${++nextId}`;
}

export function ClientProfilePanel({ profile, contextPills, onSave, onClose, dynamicFields, dynamicFieldValues, onDynamicFieldChange }: ClientProfilePanelProps) {
  const [clientLabel] = useState(profile.clientLabel);
  const [clientSiren] = useState(profile.clientSiren);

  // Merge extracted context pills into the editable besoins list as "ai" source items.
  // Only add extracted pills that aren't already represented in besoinsClient.
  const [besoins, setBesoins] = useState<BesoinItem[]>(() => {
    const existing = [...profile.besoinsClient];
    const existingLabels = new Set(existing.map((b) => b.value.toLowerCase()));
    const extractedPills = (contextPills ?? []).filter((p) => p.source === "extracted");
    for (const pill of extractedPills) {
      if (!existingLabels.has(pill.label.toLowerCase())) {
        existing.unshift({ id: `extracted-${pill.id}`, value: pill.label, source: "ai" });
      }
    }
    return existing;
  });
  const [newBesoinInput, setNewBesoinInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const isDirty = (() => {
    const current = besoins.filter((b) => b.value.trim());
    const original = profile.besoinsClient;
    if (current.length !== original.length) return true;
    return current.some((b, i) => b.value !== original[i]?.value || b.source !== original[i]?.source);
  })();

  const addBesoin = useCallback(() => {
    const trimmed = newBesoinInput.trim();
    if (!trimmed) return;
    setBesoins((prev) => [...prev, { id: makeId(), value: trimmed, source: "manual" }]);
    setNewBesoinInput("");
    inputRef.current?.focus();
  }, [newBesoinInput]);

  const removeBesoin = useCallback((id: string) => {
    setBesoins((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const startEdit = useCallback((besoin: BesoinItem) => {
    setEditingId(besoin.id);
    setEditingValue(besoin.value);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingId) return;
    const trimmed = editingValue.trim();
    if (trimmed) {
      // When editing an AI-detected item, it becomes manual
      setBesoins((prev) => prev.map((b) => (b.id === editingId ? { ...b, value: trimmed, source: "manual" as const } : b)));
    } else {
      setBesoins((prev) => prev.filter((b) => b.id !== editingId));
    }
    setEditingId(null);
    setEditingValue("");
  }, [editingId, editingValue]);

  const handleSave = () => {
    const filtered = besoins.filter((b) => b.value.trim());
    onSave({ clientLabel, clientSiren, besoinsClient: filtered });
  };

  const aiCount = besoins.filter((b) => b.source === "ai").length;
  const filledBesoins = besoins.filter((b) => b.value.trim()).length;

  // Missing suggestions: context pills the AI suggests for this product type,
  // filtered out if the user already has a besoin with matching text.
  const besoinLabels = new Set(besoins.map((b) => b.value.toLowerCase()));
  const missingSuggestions = (contextPills ?? []).filter(
    (p) => p.source === "missing" && !besoinLabels.has(p.label.toLowerCase())
  );

  const addSuggestion = useCallback((label: string) => {
    setBesoins((prev) => [...prev, { id: makeId(), value: label, source: "manual" }]);
  }, []);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-[400px] shrink-0 border-l border-panora-border bg-panora-card flex flex-col"
    >
      {/* Header */}
      <div className="h-12 shrink-0 border-b border-panora-border flex items-center justify-between px-5">
        <span className="text-[13px] font-medium text-panora-text">Profil client</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-[6px] hover:bg-panora-drop transition-colors"
        >
          <XIcon className="w-3.5 h-3.5 text-panora-text-muted" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Client field (read-only selector) */}
        <div className="px-5 pt-5 pb-4 space-y-1.5">
          <label className="text-[13px] font-medium text-panora-text">Client</label>
          <div className="flex items-center gap-2.5 px-3 py-2 border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] bg-panora-bg cursor-default">
            <div className="w-6 h-6 rounded-[6px] bg-panora-green/20 border border-panora-text/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-panora-green">
                {clientLabel.charAt(0)}
              </span>
            </div>
            <span className="text-[13px] text-panora-text flex-1 truncate">
              {clientLabel} — SIREN {clientSiren}
            </span>
            <ChevronDown className="w-4 h-4 text-panora-text-muted shrink-0" />
          </div>
        </div>

        <div className="h-px bg-panora-border mx-5" />

        {/* Besoins client — main editable section */}
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center gap-1.5">
            <span className="w-[22px] h-[22px] rounded-[4px] bg-panora-secondary flex items-center justify-center shrink-0">
              <Target className="w-3 h-3 text-panora-text" />
            </span>
            <label className="text-[13px] font-medium text-panora-text">
              Besoins client
              {filledBesoins > 0 && (
                <span className="ml-1.5 text-panora-text-muted font-normal">({filledBesoins})</span>
              )}
            </label>
          </div>
          <p className="mt-1 text-[12px] text-panora-text-muted leading-[18px] max-w-[55ch]">
            Tout element lie au client pouvant influencer le choix d&apos;une offre. Plus c&apos;est specifique, plus l&apos;analyse sera pertinente.
          </p>

          {/* All besoins — extracted (as ai) + manual + ai in one list */}
          <div className="mt-3 space-y-1.5">
            {besoins.map((besoin) => (
              editingId === besoin.id ? (
                <div
                  key={besoin.id}
                  className="flex items-start gap-2.5 rounded-[8px] px-3 py-2 min-h-[36px] bg-panora-card border border-panora-green/40"
                >
                  <input
                    ref={editRef}
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
                      if (e.key === "Escape") { setEditingId(null); setEditingValue(""); }
                    }}
                    className="flex-1 text-[13px] text-panora-text bg-transparent outline-none leading-[18px] py-[1px]"
                  />
                </div>
              ) : (
                <BesoinTag
                  key={besoin.id}
                  value={besoin.value}
                  source={besoin.source}
                  onClick={() => startEdit(besoin)}
                  onRemove={() => removeBesoin(besoin.id)}
                />
              )
            ))}

            {/* Add input */}
            <input
              ref={inputRef}
              type="text"
              value={newBesoinInput}
              onChange={(e) => setNewBesoinInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addBesoin();
                }
              }}
              placeholder="Ajoutez un besoin client..."
              className="w-full bg-panora-card border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] px-3 py-2 min-h-[36px] text-[13px] text-panora-text placeholder:text-panora-text-muted/50 outline-none focus:border-panora-green transition-colors"
            />
          </div>

          {/* Suggestions & AI count — tighter grouping below the list */}
          <div className="mt-3 space-y-2">
            {missingSuggestions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[12px] text-panora-text-muted">
                  Infos utiles pour ce type de produit :
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missingSuggestions.map((pill) => (
                    <button
                      key={pill.id}
                      onClick={() => addSuggestion(pill.label)}
                      className="inline-flex items-center gap-1 rounded-[8px] border border-dashed border-[#d4d2cc] text-panora-text-muted px-2 py-1 text-[12px] leading-4 hover:border-panora-green/40 hover:text-panora-text transition-colors"
                      title={pill.hint}
                    >
                      <Plus className="w-3 h-3 shrink-0" />
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {missingSuggestions.length === 0 && (
              <p className="text-[12px] text-panora-text-muted">
                Exemples : Franchise max 1 000€, Protection juridique incluse, Couverture monde entier
              </p>
            )}
            {aiCount > 0 && (
              <p className="text-[12px] text-panora-green flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {aiCount} detectes automatiquement
              </p>
            )}
          </div>
        </div>

        {/* Dynamic fields — payroll / headcount inputs grouped by section */}
        {dynamicFields && dynamicFields.length > 0 && (() => {
          const sections = new Map<string, { label: string; fields: DynamicField[] }>();
          for (const field of dynamicFields) {
            if (!sections.has(field.sectionKey)) {
              sections.set(field.sectionKey, { label: field.sectionLabel, fields: [] });
            }
            sections.get(field.sectionKey)!.fields.push(field);
          }

          return (
            <>
              <div className="h-px bg-panora-border mx-5" />
              <div className="px-5 pt-4 pb-5 space-y-4">
                {Array.from(sections.entries()).map(([key, section]) => (
                  <div key={key}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-[22px] h-[22px] rounded-[4px] bg-panora-secondary flex items-center justify-center text-[10px] text-panora-text font-bold">€</span>
                      <label className="text-[13px] font-medium text-panora-text">{section.label}</label>
                      <span
                        className="text-panora-text-muted cursor-help"
                        title="Renseignez ces données pour afficher les cotisations en euros dans le comparatif."
                      >
                        <Info className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div className="mt-2 space-y-0.5">
                      {section.fields.map((field) => (
                        <InlineFieldInput
                          key={field.id}
                          label={field.label}
                          value={dynamicFieldValues?.[field.id]}
                          onChange={(val) => onDynamicFieldChange?.(field.id, val)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-panora-border px-5 py-3 flex flex-col gap-3">
        {isDirty && (
          <div className="flex items-start gap-2.5 rounded-[8px] bg-panora-green-light border border-panora-green-border/40 px-3 py-2.5">
            <Sparkles className="w-3.5 h-3.5 text-panora-green shrink-0 mt-0.5" />
            <p className="text-[12px] text-panora-text leading-[17px]">
              Enregistrez pour relancer la synthese comparative avec le contexte mis a jour.
            </p>
          </div>
        )}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-panora-text bg-panora-secondary rounded-[8px] hover:bg-panora-drop transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="btn-primary px-4 py-2 text-[13px] font-medium"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

/** Inline input matching the Figma InputInline component (right-aligned variant).
 *  - Filled: plain text + pencil icon, no border
 *  - Hover: subtle bg
 *  - Editing: green border
 *  - Empty: amber "À compléter.." placeholder */
function InlineFieldInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (val: number | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(
    value !== undefined ? value.toLocaleString("fr-FR") : ""
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFilled = value !== undefined;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Sync from parent when not editing
  useEffect(() => {
    if (!editing) {
      setLocalValue(value !== undefined ? value.toLocaleString("fr-FR") : "");
    }
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const raw = localValue.replace(/[^\d]/g, "");
    const num = raw ? parseInt(raw, 10) : undefined;
    onChange(num);
    setLocalValue(num !== undefined ? num.toLocaleString("fr-FR") : "");
  };

  return (
    <div className="flex items-center gap-2 min-h-[32px]">
      <span className="text-[13px] text-panora-text flex-1 min-w-0 truncate">{label}</span>

      {editing ? (
        /* Editing state: green border wrapper */
        <div className="border border-panora-green rounded-[8px] p-[2px] shrink-0">
          <div className="bg-panora-card border border-[#e2dfd8] rounded-[6px] flex items-center px-2 py-1 gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") { setEditing(false); setLocalValue(value !== undefined ? value.toLocaleString("fr-FR") : ""); }
              }}
              className="w-[100px] text-[13px] font-medium text-panora-text text-right bg-transparent outline-none leading-[20px]"
            />
          </div>
        </div>
      ) : hasFilled ? (
        /* Filled state: plain text + pencil, no border */
        <button
          onClick={() => setEditing(true)}
          className="group/inline flex items-center gap-1.5 px-2 py-1 rounded-[8px] hover:bg-panora-drop transition-colors shrink-0"
        >
          <PencilLine className="w-4 h-4 text-panora-text-muted opacity-0 group-hover/inline:opacity-100 transition-opacity" />
          <span className="text-[13px] font-medium text-panora-text leading-[20px]">
            {localValue}
          </span>
        </button>
      ) : (
        /* Empty state: plain dash, no warning */
        <button
          onClick={() => setEditing(true)}
          className="group/inline flex items-center gap-1.5 px-2 py-1 rounded-[8px] hover:bg-panora-drop transition-colors shrink-0"
        >
          <PencilLine className="w-4 h-4 text-panora-text-muted opacity-0 group-hover/inline:opacity-100 transition-opacity" />
          <span className="text-[13px] text-panora-text-muted leading-[20px]">—</span>
        </button>
      )}
    </div>
  );
}
