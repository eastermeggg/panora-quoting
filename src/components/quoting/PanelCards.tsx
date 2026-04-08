"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubLimitRow, PricingCardRow } from "@/data/mock";

// ─── Override dot ────────────────────────────────────────────────────

function OverrideDot() {
  return (
    <span
      className="w-[6px] h-[6px] rounded-full bg-panora-green shrink-0"
      title="Modifié"
    />
  );
}

// ─── Inline editable field (matches Figma InputSpecific) ─────────────

function InlineEdit({
  value,
  originalValue,
  onChange,
  bold,
  className,
  editing,
  onStartEdit,
  onStopEdit,
  align = "left",
}: {
  value: string;
  originalValue?: string;
  onChange: (v: string) => void;
  bold?: boolean;
  className?: string;
  editing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  align?: "left" | "right";
}) {
  const [local, setLocal] = useState(value);
  const isOverridden = originalValue !== undefined && value !== originalValue;

  // Sync local when value changes externally
  const prevRef = useRef(value);
  if (value !== prevRef.current && !editing) {
    prevRef.current = value;
    setLocal(value);
  }

  if (editing) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-[8px] ring-2 ring-panora-green/40 bg-white",
          className
        )}
      >
        {isOverridden && <OverrideDot />}
        <input
          autoFocus
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => {
            onChange(local);
            prevRef.current = local;
            onStopEdit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange(local);
              prevRef.current = local;
              onStopEdit();
            }
            if (e.key === "Escape") {
              setLocal(value);
              onStopEdit();
            }
          }}
          className={cn(
            "flex-1 text-[13px] leading-5 text-panora-text outline-none bg-transparent min-w-0",
            bold && "font-semibold"
          )}
        />
      </div>
    );
  }

  const pencilIcon = (
    <Pencil className="w-4 h-4 text-panora-text-muted opacity-0 group-hover/field:opacity-100 transition-opacity shrink-0" />
  );
  const textSpan = (
    <span
      className={cn(
        "text-[13px] leading-5 text-panora-text whitespace-nowrap",
        bold && "font-semibold"
      )}
    >
      {value || "—"}
    </span>
  );

  return (
    <div
      onClick={() => {
        setLocal(value);
        onStartEdit();
      }}
      className={cn(
        "group/field flex items-center gap-1.5 px-2 py-1 rounded-[8px] cursor-text hover:bg-[rgba(34,32,26,0.05)] transition-colors",
        className
      )}
    >
      {isOverridden && <OverrideDot />}
      {align === "right" ? (
        <>{pencilIcon}{textSpan}</>
      ) : (
        <>{textSpan}{pencilIcon}</>
      )}
    </div>
  );
}

// ─── PanelCardA (Sub-limits) ─────────────────────────────────────────

interface PanelCardAProps {
  rows: SubLimitRow[];
  originalRows?: SubLimitRow[];
  onChange: (rows: SubLimitRow[]) => void;
}

export function PanelCardA({ rows, originalRows, onChange }: PanelCardAProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const getOriginal = (id: string, field: "label" | "value") => {
    const orig = originalRows?.find((r) => r.id === id);
    return orig ? orig[field] : undefined;
  };

  const updateRow = (id: string, field: "label" | "value", val: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const addRow = () => {
    const id = `sl-${Date.now()}`;
    onChange([...rows, { id, label: "Nouveau", value: "0 €" }]);
    setEditingCell(`${id}-label`);
  };

  const deleteRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
    setEditingCell(null);
  };

  const isRowEditing = (id: string) =>
    editingCell === `${id}-label` || editingCell === `${id}-value`;

  return (
    <div className="border border-panora-border rounded-[10px] overflow-clip">
      {/* Card title header row */}
      {rows.length > 0 && (
        <div className="h-[44px] flex items-center px-3 border-b border-panora-border">
          <span className="text-[13px] leading-5 text-panora-text">Nom de la carte</span>
        </div>
      )}
      {rows.map((row, idx) => {
        const rowEditing = isRowEditing(row.id);
        return (
          <div
            key={row.id}
            className={cn(
              "h-[44px] flex items-center px-3",
              idx < rows.length - 1 && "border-b border-panora-border"
            )}
          >
            {rowEditing && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => deleteRow(row.id)}
                className="w-4 h-4 flex items-center justify-center shrink-0 mr-2 text-panora-text-muted hover:text-[#952617] transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <div className="flex-1 flex items-center justify-between min-w-0">
              <InlineEdit
                value={row.label}
                originalValue={getOriginal(row.id, "label")}
                onChange={(v) => updateRow(row.id, "label", v)}
                editing={editingCell === `${row.id}-label`}
                onStartEdit={() => setEditingCell(`${row.id}-label`)}
                onStopEdit={() => setEditingCell(null)}
              />
              <InlineEdit
                value={row.value}
                originalValue={getOriginal(row.id, "value")}
                onChange={(v) => updateRow(row.id, "value", v)}
                bold
                align="right"
                editing={editingCell === `${row.id}-value`}
                onStartEdit={() => setEditingCell(`${row.id}-value`)}
                onStopEdit={() => setEditingCell(null)}
              />
            </div>
          </div>
        );
      })}
      <button
        onClick={addRow}
        className="flex items-center gap-1.5 w-full p-2.5 text-[12px] text-panora-text-muted hover:text-panora-green hover:bg-panora-bg/50 transition-colors border-t border-panora-border"
      >
        <Plus className="w-3.5 h-3.5" />
        Ajouter une ligne
      </button>
    </div>
  );
}

// ─── PanelCardB (Pricing) ────────────────────────────────────────────

interface PanelCardBProps {
  rows: PricingCardRow[];
  originalRows?: PricingCardRow[];
  onChange: (rows: PricingCardRow[]) => void;
}

export function PanelCardB({ rows, originalRows, onChange }: PanelCardBProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const getOriginal = (id: string, field: keyof PricingCardRow) => {
    const orig = originalRows?.find((r) => r.id === id);
    return orig ? orig[field] : undefined;
  };

  const updateRow = (id: string, field: keyof PricingCardRow, val: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const addRow = () => {
    const id = `pr-${Date.now()}`;
    onChange([...rows, { id, offerLabel: "Nouvelle offre", price: "0 €", conditions: "" }]);
    setEditingCell(`${id}-offerLabel`);
  };

  const deleteRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
    setEditingCell(null);
  };

  const isRowEditing = (id: string) =>
    editingCell?.startsWith(`${id}-`) ?? false;

  return (
    <div className="border border-panora-border rounded-[10px] overflow-clip">
      {rows.map((row, idx) => {
        const rowEditing = isRowEditing(row.id);
        return (
          <div
            key={row.id}
            className={cn(
              "p-[10px]",
              idx < rows.length - 1 && "border-b border-panora-border"
            )}
          >
            <div className="flex items-center">
              {rowEditing && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => deleteRow(row.id)}
                  className="w-4 h-4 flex items-center justify-center shrink-0 mr-2 text-panora-text-muted hover:text-[#952617] transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              <div className="flex-1 flex items-center justify-between min-w-0">
                <InlineEdit
                  value={row.offerLabel}
                  originalValue={getOriginal(row.id, "offerLabel")}
                  onChange={(v) => updateRow(row.id, "offerLabel", v)}
                  editing={editingCell === `${row.id}-offerLabel`}
                  onStartEdit={() => setEditingCell(`${row.id}-offerLabel`)}
                  onStopEdit={() => setEditingCell(null)}
                />
                <InlineEdit
                  value={row.price}
                  originalValue={getOriginal(row.id, "price")}
                  onChange={(v) => updateRow(row.id, "price", v)}
                  bold
                  align="right"
                  editing={editingCell === `${row.id}-price`}
                  onStartEdit={() => setEditingCell(`${row.id}-price`)}
                  onStopEdit={() => setEditingCell(null)}
                />
              </div>
            </div>
            {row.conditions && (
              <div className={cn(rowEditing ? "pl-6" : "")}>
                <InlineEdit
                  value={row.conditions}
                  originalValue={getOriginal(row.id, "conditions")}
                  onChange={(v) => updateRow(row.id, "conditions", v)}
                  className="text-[12px]"
                  editing={editingCell === `${row.id}-conditions`}
                  onStartEdit={() => setEditingCell(`${row.id}-conditions`)}
                  onStopEdit={() => setEditingCell(null)}
                />
              </div>
            )}
          </div>
        );
      })}
      <button
        onClick={addRow}
        className="flex items-center gap-1.5 w-full p-2.5 text-[12px] text-panora-text-muted hover:text-panora-green hover:bg-panora-bg/50 transition-colors border-t border-panora-border"
      >
        <Plus className="w-3.5 h-3.5" />
        Ajouter une offre
      </button>
    </div>
  );
}
