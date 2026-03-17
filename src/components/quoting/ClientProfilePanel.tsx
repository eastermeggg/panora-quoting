"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X as XIcon, ChevronDown, Sparkles, FileSearch } from "lucide-react";
import type { ClientProfileData, ContextPill } from "@/data/mock";

interface ClientProfilePanelProps {
  profile: ClientProfileData;
  contextPills?: ContextPill[];
  onSave: (updated: ClientProfileData) => void;
  onClose: () => void;
}

type BesoinRow = { id: string; value: string };

let nextId = 0;
function makeId() {
  return `besoin-${++nextId}`;
}

function toRows(values: string[]): BesoinRow[] {
  const rows = values.map((v) => ({ id: makeId(), value: v }));
  // Always end with one empty row
  rows.push({ id: makeId(), value: "" });
  return rows;
}

export function ClientProfilePanel({ profile, contextPills, onSave, onClose }: ClientProfilePanelProps) {
  const [clientLabel] = useState(profile.clientLabel);
  const [clientSiren] = useState(profile.clientSiren);
  const [rows, setRows] = useState<BesoinRow[]>(() => toRows(profile.besoinsClient));

  const newRowRef = useRef<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Focus newly added row
  useEffect(() => {
    if (newRowRef.current) {
      inputRefs.current[newRowRef.current]?.focus();
      newRowRef.current = null;
    }
  });

  const isDirty = (() => {
    const current = rows.map((r) => r.value.trim()).filter(Boolean);
    const original = profile.besoinsClient;
    if (current.length !== original.length) return true;
    return current.some((b, i) => b !== original[i]);
  })();

  const updateRow = useCallback((id: string, value: string) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, value } : r));
      // If the last row now has content, append a new empty one
      const last = next[next.length - 1];
      if (last && last.value.trim() !== "") {
        const newRow = { id: makeId(), value: "" };
        newRowRef.current = newRow.id;
        next.push(newRow);
      }
      return next;
    });
  }, []);

  const handleSave = () => {
    const trimmed = rows.map((r) => r.value.trim()).filter(Boolean);
    onSave({ clientLabel, clientSiren, besoinsClient: trimmed });
  };

  const filledBesoins = rows.filter((r) => r.value.trim()).length;
  const extractedPills = (contextPills ?? []).filter((p) => p.source === "extracted");

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

        {/* Contexte client */}
        <div className="space-y-2.5">
          <label className="text-[13px] font-medium text-panora-text">
            Contexte client
            {(extractedPills.length + filledBesoins) > 0 && (
              <span className="ml-1.5 text-panora-text-muted font-normal">({extractedPills.length + filledBesoins})</span>
            )}
          </label>

          {/* Extracted items (read-only) */}
          {extractedPills.length > 0 && (
            <div className="space-y-1.5">
              {extractedPills.map((pill) => (
                <div
                  key={pill.id}
                  className="flex items-center gap-2 px-3 py-2 border border-[#e2dfd8] rounded-[8px] bg-[#faf9f7]"
                >
                  <FileSearch className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
                  <span className="text-[13px] text-panora-text flex-1">{pill.label}</span>
                  <span className="text-[10px] font-medium text-panora-text-muted uppercase tracking-wide bg-panora-secondary px-1.5 py-0.5 rounded">Extrait</span>
                </div>
              ))}
            </div>
          )}

          {/* Editable besoin rows */}
          <div className="space-y-1.5">
            {rows.map((row, idx) => {
              const isLast = idx === rows.length - 1;
              return (
                <input
                  key={row.id}
                  ref={(el) => { inputRefs.current[row.id] = el; }}
                  type="text"
                  value={row.value}
                  onChange={(e) => updateRow(row.id, e.target.value)}
                  placeholder={isLast ? "Ajouter un besoin..." : "Ex : franchise max 500 €, assistance 0 km..."}
                  className="w-full px-3 py-2 text-[13px] text-panora-text bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-panora-text-muted/50 outline-none focus:ring-1 focus:ring-panora-green/30"
                />
              );
            })}
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
