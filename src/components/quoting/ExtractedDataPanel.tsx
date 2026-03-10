"use client";

import { useState, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ExtractedSection,
  ExtractedField,
  FieldStatus,
} from "@/data/scenarios";

interface ExtractedDataPanelProps {
  sections: ExtractedSection[];
  onSectionsChange?: (sections: ExtractedSection[]) => void;
}

export function ExtractedDataPanel({
  sections: initialSections,
  onSectionsChange,
}: ExtractedDataPanelProps) {
  const [sections, setSections] = useState<ExtractedSection[]>(initialSections);

  const handleFieldChange = useCallback(
    (sectionKey: string, fieldKey: string, newValue: string) => {
      setSections((prev) => {
        const updated = prev.map((section) => {
          if (section.key !== sectionKey) return section;

          const updatedFields = section.fields.map((field) => {
            if (field.key !== fieldKey) return field;

            // Determine new status
            let newStatus: FieldStatus = "ok";
            if (!newValue.trim()) {
              newStatus = "missing";
            } else if (field.type === "email" && newValue.trim()) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              newStatus = emailRegex.test(newValue) ? "ok" : "invalid";
            } else if (field.type === "date" && newValue.trim()) {
              const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
              if (dateRegex.test(newValue)) {
                const [day, month] = newValue.split("/").map(Number);
                newStatus =
                  day >= 1 && day <= 31 && month >= 1 && month <= 12
                    ? "ok"
                    : "invalid";
              } else {
                newStatus = "invalid";
              }
            }

            return {
              ...field,
              value: newValue,
              status: newStatus,
              error:
                newStatus === "invalid"
                  ? field.type === "email"
                    ? "Format email invalide"
                    : field.type === "date"
                    ? "Date invalide"
                    : "Valeur invalide"
                  : undefined,
            };
          });

          // Recalculate section status
          const missingCount = updatedFields.filter(
            (f) => f.status === "missing"
          ).length;
          const invalidCount = updatedFields.filter(
            (f) => f.status === "invalid"
          ).length;

          let sectionStatus: "complete" | "incomplete" | "invalid" = "complete";
          if (invalidCount > 0) sectionStatus = "invalid";
          else if (missingCount > 0) sectionStatus = "incomplete";

          return {
            ...section,
            fields: updatedFields,
            status: sectionStatus,
            missingCount,
            invalidCount,
          };
        });

        onSectionsChange?.(updated);
        return updated;
      });
    },
    [onSectionsChange]
  );

  const handleFieldConfirm = useCallback(
    (sectionKey: string, fieldKey: string) => {
      setSections((prev) => {
        const updated = prev.map((section) => {
          if (section.key !== sectionKey) return section;

          const updatedFields = section.fields.map((field) => {
            if (field.key !== fieldKey) return field;
            if (field.status !== "ok") return field;
            // Mark as confirmed (we use a visual cue but same status)
            return { ...field };
          });

          return { ...section, fields: updatedFields };
        });
        return updated;
      });
    },
    []
  );

  return (
    <div>
      <h2 className="text-base font-semibold text-panora-text mb-1">
        Données consolidées extraites pour cotation
      </h2>
      <p className="text-sm text-panora-text-secondary mb-5">
        Vérifiez, complétez ou corrigez les données extraites des documents et
        emails.
      </p>

      <div className="space-y-2">
        {sections.map((section) => (
          <DataSection
            key={section.key}
            section={section}
            onFieldChange={(fieldKey, value) =>
              handleFieldChange(section.key, fieldKey, value)
            }
            onFieldConfirm={(fieldKey) =>
              handleFieldConfirm(section.key, fieldKey)
            }
          />
        ))}
      </div>
    </div>
  );
}

function DataSection({
  section,
  onFieldChange,
  onFieldConfirm,
}: {
  section: ExtractedSection;
  onFieldChange: (fieldKey: string, value: string) => void;
  onFieldConfirm: (fieldKey: string) => void;
}) {
  const [expanded, setExpanded] = useState(section.status !== "complete");

  return (
    <div className="border border-panora-border rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-panora-drop/50 transition-colors"
      >
        {section.status === "complete" && (
          <CheckCircle2 className="w-5 h-5 text-panora-green shrink-0" />
        )}
        {section.status === "incomplete" && (
          <AlertTriangle className="w-5 h-5 text-panora-warning shrink-0" />
        )}
        {section.status === "invalid" && (
          <AlertTriangle className="w-5 h-5 text-panora-error shrink-0" />
        )}

        <span className="text-sm font-medium text-panora-text flex-1">
          {section.label}
        </span>

        <span className="text-xs text-panora-text-muted mr-1">
          {section.fields.length} champs
        </span>

        {section.status === "incomplete" && section.missingCount! > 0 && (
          <span className="text-xs text-panora-warning mr-2">
            {section.missingCount} à compléter
          </span>
        )}
        {section.status === "invalid" && section.invalidCount! > 0 && (
          <span className="text-xs text-panora-error mr-2">
            {section.invalidCount} invalide
            {section.invalidCount! > 1 ? "s" : ""}
          </span>
        )}

        {expanded ? (
          <ChevronDown className="w-4 h-4 text-panora-text-muted shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-panora-text-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-panora-border">
          <div className="divide-y divide-panora-border">
            {section.fields.map((field) => (
              <FieldRow
                key={field.key}
                field={field}
                onChange={(value) => onFieldChange(field.key, value)}
                onConfirm={() => onFieldConfirm(field.key)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldRow({
  field,
  onChange,
  onConfirm,
}: {
  field: ExtractedField;
  onChange: (value: string) => void;
  onConfirm: () => void;
}) {
  const [editing, setEditing] = useState(
    field.status === "missing" || field.status === "invalid"
  );
  const [localValue, setLocalValue] = useState(field.value);

  const handleSave = () => {
    onChange(localValue);
    if (localValue.trim()) {
      setEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      setLocalValue(field.value);
      if (field.status === "ok") setEditing(false);
    }
  };

  const isMissing = field.status === "missing";
  const isInvalid = field.status === "invalid";
  const isError = isMissing || isInvalid;

  return (
    <div className="flex items-center px-4 py-2.5 gap-3">
      <span
        className={cn(
          "text-sm w-40 shrink-0",
          isError ? "text-panora-error font-medium" : "text-panora-text-muted"
        )}
      >
        {field.label}
      </span>

      <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
        {/* Select fields */}
        {field.type === "select" ? (
          <div className="flex items-center gap-2 flex-1 justify-end">
            <select
              value={localValue}
              onChange={(e) => {
                setLocalValue(e.target.value);
                onChange(e.target.value);
              }}
              className={cn(
                "text-sm rounded-md px-3 py-1.5 outline-none text-right appearance-none bg-no-repeat bg-[length:16px] bg-[right_8px_center] pr-8 cursor-pointer max-w-[220px]",
                isMissing
                  ? "border border-panora-warning/50 bg-panora-warning-bg/30 focus:ring-2 focus:ring-panora-warning/20"
                  : isInvalid
                  ? "border border-panora-error bg-white focus:ring-2 focus:ring-panora-error/20"
                  : "border border-transparent hover:border-panora-border bg-transparent focus:border-panora-green focus:ring-2 focus:ring-panora-green/20"
              )}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239B9590' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='m6 9 6 6 6-6'/%3e%3c/svg%3e")`,
              }}
            >
              {isMissing && (
                <option value="">{field.placeholder || "Sélectionner..."}</option>
              )}
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {isMissing && !localValue && (
              <span className="text-xs bg-panora-tag text-panora-warning px-2 py-0.5 rounded font-medium whitespace-nowrap">
                À compléter
              </span>
            )}
          </div>
        ) : editing || isError ? (
          /* Editable text/email/date/number/etc fields */
          <div className="flex items-center gap-2 flex-1 justify-end">
            <input
              type={
                field.type === "email"
                  ? "email"
                  : field.type === "number"
                  ? "number"
                  : field.type === "phone"
                  ? "tel"
                  : "text"
              }
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={
                field.placeholder ||
                (isMissing ? "À compléter..." : undefined)
              }
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm outline-none text-right max-w-[220px]",
                isMissing
                  ? "border border-panora-warning/50 bg-panora-warning-bg/30 focus:ring-2 focus:ring-panora-warning/20"
                  : isInvalid
                  ? "border border-panora-error bg-white focus:ring-2 focus:ring-panora-error/20"
                  : "border border-panora-green/50 bg-white focus:ring-2 focus:ring-panora-green/20"
              )}
            />
            {isMissing && !localValue && (
              <span className="text-xs bg-panora-tag text-panora-warning px-2 py-0.5 rounded font-medium whitespace-nowrap">
                À compléter
              </span>
            )}
            {isInvalid && (
              <span className="text-xs text-panora-error whitespace-nowrap">
                {field.error}
              </span>
            )}
            {!isError && localValue && (
              <button
                onClick={handleSave}
                className="p-1 rounded hover:bg-panora-green-light transition-colors"
                title="Confirmer"
              >
                <Check className="w-3.5 h-3.5 text-panora-green" />
              </button>
            )}
          </div>
        ) : (
          /* Read-only display with click-to-edit */
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-panora-text text-right hover:text-panora-green transition-colors cursor-text group flex items-center gap-1"
            title="Cliquer pour modifier"
          >
            <span>{field.value}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-panora-green/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>
    </div>
  );
}
