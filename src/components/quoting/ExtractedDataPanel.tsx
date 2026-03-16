"use client";

import { useState, useCallback } from "react";
import { ChevronRight, ChevronDown, CheckCircle2 } from "lucide-react";
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
                    ? "Email invalide"
                    : field.type === "date"
                    ? "Date invalide"
                    : "Valeur invalide"
                  : undefined,
            };
          });

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

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-panora-text mb-1">
        Donnée consolidées extraites pour cotation
      </h2>
      <p className="text-[13px] text-panora-text-secondary mb-5 leading-5">
        Déposez tous les documents utiles à la cotation.
      </p>

      <div className="space-y-2">
        {sections.map((section) => (
          <DataSection
            key={section.key}
            section={section}
            onFieldChange={(fieldKey, value) =>
              handleFieldChange(section.key, fieldKey, value)
            }
          />
        ))}
      </div>
    </div>
  );
}

function AlertCircleIcon({ variant }: { variant: "warning" | "error" }) {
  return (
    <div
      className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
        variant === "warning" ? "bg-panora-warning" : "bg-panora-error"
      )}
    >
      <span className="text-white text-[10px] font-bold leading-none">!</span>
    </div>
  );
}

function DataSection({
  section,
  onFieldChange,
}: {
  section: ExtractedSection;
  onFieldChange: (fieldKey: string, value: string) => void;
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
          <AlertCircleIcon variant="warning" />
        )}
        {section.status === "invalid" && (
          <AlertCircleIcon variant="error" />
        )}

        <span className="text-[13px] font-medium text-panora-text flex-1">
          {section.label}
        </span>

        {section.status === "incomplete" && section.missingCount! > 0 && (
          <span className="text-[12px] text-panora-warning-text mr-2">
            {section.missingCount} champ{section.missingCount! > 1 ? "s" : ""} à
            compléter
          </span>
        )}
        {section.status === "invalid" && section.invalidCount! > 0 && (
          <span className="text-[12px] text-panora-error mr-2">
            {section.invalidCount} champ{section.invalidCount! > 1 ? "s" : ""}{" "}
            invalide{section.invalidCount! > 1 ? "s" : ""}
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
}: {
  field: ExtractedField;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(field.status === "invalid");
  const [localValue, setLocalValue] = useState(field.value);

  const handleSave = () => {
    onChange(localValue);
    if (localValue.trim()) {
      setEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setLocalValue(field.value);
      if (field.status === "ok") setEditing(false);
    }
  };

  const isMissing = field.status === "missing";
  const isInvalid = field.status === "invalid";

  const inputType =
    field.type === "email"
      ? "email"
      : field.type === "number"
      ? "number"
      : field.type === "phone"
      ? "tel"
      : "text";

  return (
    <div className={cn(
      "flex items-center px-4 py-2.5 gap-2",
      isInvalid && "border-l-2 border-l-panora-error"
    )}>
      {/* Label */}
      <span
        className={cn(
          "text-[13px] shrink-0 w-40",
          isMissing
            ? "text-panora-warning-text"
            : isInvalid
            ? "text-panora-error"
            : "text-panora-text-secondary"
        )}
      >
        {field.label}
      </span>

      {/* Value / Input */}
      <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
        {isMissing && !editing ? (
          <button
            onClick={() => setEditing(true)}
            className="border border-panora-border rounded-lg px-2 py-1 text-[13px] text-panora-text-muted hover:bg-panora-drop/50 transition-colors"
          >
            À compléter..
          </button>
        ) : isInvalid || editing ? (
          <div className="flex items-center gap-2 flex-1 justify-end">
            <input
              type={inputType}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={
                field.placeholder || (isMissing ? "À compléter..." : undefined)
              }
              className={cn(
                "flex-1 rounded-lg px-2 py-1 text-[13px] outline-none text-right max-w-[180px]",
                isInvalid
                  ? "border border-panora-error/50 bg-white focus:ring-2 focus:ring-panora-error/20"
                  : isMissing
                  ? "border border-panora-warning/50 bg-white focus:ring-2 focus:ring-panora-warning/20"
                  : "border border-panora-border bg-white focus:ring-2 focus:ring-panora-green/20"
              )}
            />
            {isInvalid && field.error && (
              <span className="text-[12px] text-panora-error whitespace-nowrap">
                {field.error}
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-[13px] text-panora-text text-right hover:text-panora-green transition-colors cursor-text"
            title="Cliquer pour modifier"
          >
            {field.value}
          </button>
        )}
      </div>
    </div>
  );
}
