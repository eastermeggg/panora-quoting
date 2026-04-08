"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X as XIcon, ChevronDown, Sparkles, Plus } from "lucide-react";
import type { ClientProfileData, ContextPill, BesoinItem } from "@/data/mock";
import { BesoinTag } from "@/components/ui/BesoinTag";

interface ClientProfilePanelProps {
  profile: ClientProfileData;
  contextPills?: ContextPill[];
  onSave: (updated: ClientProfileData) => void;
  onClose: () => void;
}

let nextId = 0;
function makeId() {
  return `besoin-panel-${++nextId}`;
}

export function ClientProfilePanel({ profile, contextPills, onSave, onClose }: ClientProfilePanelProps) {
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
      className="w-[420px] shrink-0 border-l border-panora-border bg-white flex flex-col"
    >
      {/* Header */}
      <div className="h-[52px] shrink-0 border-b border-[#e3e3e3] flex items-center justify-between px-4">
        <span className="text-[13px] text-panora-text-muted">Profil client</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-[6px] bg-panora-secondary hover:bg-panora-drop transition-colors"
        >
          <XIcon className="w-3.5 h-3.5 text-panora-text" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Title */}
        <h2 className="text-[20px] font-serif font-semibold text-panora-text" style={{ letterSpacing: "-0.2px" }}>
          Profil client
        </h2>

        {/* Client field (read-only) */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-panora-text">Client</label>
          <div className="flex items-center gap-2.5 px-3 py-2 border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] bg-[#faf9f7] cursor-default">
            <div className="w-6 h-6 rounded-[6px] bg-panora-green/20 border border-black/10 flex items-center justify-center shrink-0">
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

        {/* Besoins client — single unified list */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <label className="text-[13px] font-medium text-panora-text">
              Besoins client
              {filledBesoins > 0 && (
                <span className="ml-1.5 text-panora-text-muted font-normal">({filledBesoins})</span>
              )}
            </label>
          </div>
          <p className="text-[12px] text-panora-text-muted leading-[18px]">
            Tout element lie au client pouvant influencer le choix d&apos;une offre. Plus c&apos;est specifique, plus l&apos;analyse sera pertinente.
          </p>

          {/* All besoins — extracted (as ai) + manual + ai in one list */}
          <div className="space-y-2">
            {besoins.map((besoin) => (
              editingId === besoin.id ? (
                <div
                  key={besoin.id}
                  className="flex items-start gap-2.5 rounded-[8px] px-3 py-2 min-h-[36px] bg-white border border-panora-green/40"
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
              placeholder="Ajoutez un besoin client. Ex: Couverture cyber minimum 500k€..."
              className="w-full bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] px-3 py-2 min-h-[36px] text-[13px] text-panora-text placeholder:text-panora-text-muted/50 outline-none focus:border-panora-green transition-colors"
            />
          </div>

          <div className="space-y-2">
            {/* AI-suggested missing info for this product */}
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
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-panora-border px-4 py-3 space-y-3">
        {isDirty && (
          <div className="flex items-start gap-2 rounded-[6px] bg-[#f0faf5] border border-panora-green/20 px-3 py-2">
            <Sparkles className="w-3.5 h-3.5 text-panora-green shrink-0 mt-0.5" />
            <p className="text-[12px] text-panora-text leading-4">
              Enregistrez pour relancer la synthese comparative avec le contexte mis a jour.
            </p>
          </div>
        )}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-panora-text bg-panora-secondary rounded-[6px] hover:bg-panora-drop transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-[13px] font-medium text-white bg-[#173c2d] rounded-[6px] hover:bg-[#1a4a36] transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
