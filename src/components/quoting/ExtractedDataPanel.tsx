"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Check,
  Pencil,
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
  /** When false, the "Donnée consolidées…" heading is hidden. Default: true. */
  showHeading?: boolean;
  /** When false, per-section verification UI is hidden (no Marquer/Modifier
   *  buttons, no "Non vérifié"/"Vérifié" labels, fields never lock). Used by
   *  variants that gate verification only at the launch modal. Default: true. */
  showVerification?: boolean;
  /** When true, every section starts expanded. Otherwise only incomplete
   *  sections open (the broker default). */
  defaultExpanded?: boolean;
}

export function ExtractedDataPanel({
  sections: initialSections,
  onSectionsChange,
  showHeading = true,
  showVerification = true,
  defaultExpanded,
}: ExtractedDataPanelProps) {
  const [sections, setSections] = useState<ExtractedSection[]>(() =>
    initialSections.map((s) => ({ ...s, verified: false }))
  );

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

          // Verification is *only* explicit. Filling a missing field doesn't
          // mean the broker reviewed the AI-extracted ones around it.
          return {
            ...section,
            fields: updatedFields,
            status: sectionStatus,
            missingCount,
            invalidCount,
            verified: section.verified ?? false,
          };
        });

        onSectionsChange?.(updated);
        return updated;
      });
    },
    [onSectionsChange]
  );

  const handleSetVerified = useCallback(
    (sectionKey: string, verified: boolean) => {
      setSections((prev) => {
        const updated = prev.map((section) =>
          section.key === sectionKey ? { ...section, verified } : section
        );
        onSectionsChange?.(updated);
        return updated;
      });
    },
    [onSectionsChange]
  );

  return (
    <div>
      {showHeading && (
        <>
          <h2 className="text-[15px] font-semibold text-panora-text mb-1">
            Donnée consolidées extraites pour cotation
          </h2>
          <p className="text-[13px] text-panora-text-secondary mb-5 leading-5">
            Déposez tous les documents utiles à la cotation.
          </p>
        </>
      )}

      <div className="space-y-2">
        {sections.map((section) => (
          <DataSection
            key={section.key}
            section={section}
            showVerification={showVerification}
            defaultExpanded={defaultExpanded}
            onMarkVerified={() => handleSetVerified(section.key, true)}
            onUnverify={() => handleSetVerified(section.key, false)}
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

function VerifiedBadge() {
  return (
    <div className="w-5 h-5 rounded-full bg-panora-green flex items-center justify-center shrink-0">
      <Check className="w-3 h-3 text-white" strokeWidth={3} />
    </div>
  );
}

/* ── Pending (complete-but-unverified) marker ──
   A plain empty circle — the classic "to-do" affordance. Distinct from the
   filled green check (done) without raising alarm like warning/error. */
function PendingIcon() {
  return (
    <div className="w-5 h-5 rounded-full shrink-0 border-2 border-panora-border bg-white" />
  );
}

function DataSection({
  section,
  showVerification,
  defaultExpanded,
  onMarkVerified,
  onUnverify,
  onFieldChange,
}: {
  section: ExtractedSection;
  showVerification: boolean;
  defaultExpanded?: boolean;
  onMarkVerified: () => void;
  onUnverify: () => void;
  onFieldChange: (fieldKey: string, value: string) => void;
}) {
  // Default: only incomplete sections open (broker draws attention to gaps).
  // When defaultExpanded is set, every section starts open.
  const [expanded, setExpanded] = useState(
    defaultExpanded ?? section.status === "incomplete"
  );

  const isComplete = section.status === "complete";
  const isIncomplete = section.status === "incomplete";
  const isInvalid = section.status === "invalid";
  // In the no-verification variant, "complete" always reads as "done" (green
  // check) — there's no separate verified/pending split.
  const isVerified = isComplete && (!showVerification || section.verified === true);
  const isPending = isComplete && showVerification && !section.verified;
  // Fields lock only in the verification variant once the section is verified.
  const fieldsLocked = showVerification && isVerified;

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden bg-white transition-colors",
        isVerified
          ? "border-panora-green-border"
          : isInvalid
          ? "border-panora-error/30"
          : isIncomplete
          ? "border-[#e8d4ba]"
          : "border-panora-border"
      )}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2.5 w-full px-4 py-3 text-left hover:bg-panora-drop/50 transition-colors"
      >
        {isVerified && <VerifiedBadge />}
        {isPending && <PendingIcon />}
        {isIncomplete && <AlertCircleIcon variant="warning" />}
        {isInvalid && <AlertCircleIcon variant="error" />}

        <span className="text-[14px] font-medium text-panora-text flex-1">
          {section.label}
        </span>

        {/* Right-side status hint — only shown when there's something to act on */}
        {isIncomplete && section.missingCount! > 0 && (
          <span className="text-[12px] font-medium text-panora-warning-text mr-1">
            {section.missingCount} champ{section.missingCount! > 1 ? "s" : ""} à
            compléter
          </span>
        )}
        {isInvalid && section.invalidCount! > 0 && (
          <span className="text-[12px] font-medium text-panora-error mr-1">
            {section.invalidCount} champ{section.invalidCount! > 1 ? "s" : ""}{" "}
            invalide{section.invalidCount! > 1 ? "s" : ""}
          </span>
        )}
        {isPending && (
          <span className="text-[12px] font-medium text-panora-text-muted mr-1">
            Vérifier les infos
          </span>
        )}

        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-panora-border">
          <div className="divide-y divide-panora-border">
            {section.fields.map((field) => (
              <FieldRow
                key={field.key}
                field={field}
                locked={fieldsLocked}
                onChange={(value) => onFieldChange(field.key, value)}
              />
            ))}
          </div>

          {/* Pending: invite verification */}
          {isPending && (
            <div className="bg-white px-4 py-2.5 flex items-center justify-between gap-3">
              <span className="text-[12px] text-panora-text-muted leading-4">
                Vérifiez les valeurs ci-dessus puis confirmez.
              </span>
              <button
                onClick={onMarkVerified}
                className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-panora-green-light text-[13px] font-medium text-panora-green-dark hover:bg-panora-green-light/70 transition-colors shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marquer comme vérifié
              </button>
            </div>
          )}

          {/* Verified: escape hatch back to editing */}
          {showVerification && isVerified && (
            <div className="bg-white px-4 py-2.5 flex items-center justify-end gap-3">
              <button
                onClick={onUnverify}
                className="inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-panora-secondary text-[13px] font-medium text-panora-text-secondary hover:bg-panora-tag transition-colors shrink-0"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InlineInput({
  field,
  locked,
  onChange,
}: {
  field: ExtractedField;
  locked: boolean;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [localValue, setLocalValue] = useState(field.value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSave = () => {
    onChange(localValue);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setLocalValue(field.value);
      setEditing(false);
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

  // Locked (section verified): plain text, no interaction. Editing requires
  // un-verifying the section first.
  if (locked) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1">
        <span className="text-[13px] text-panora-text leading-5 truncate">
          {field.value || "—"}
        </span>
      </div>
    );
  }

  // Editing state: green outer border, inner white field
  if (editing) {
    return (
      <div className="border border-panora-green rounded-lg p-[2px]">
        <div className="bg-white border border-[#e2dfd8] rounded-[6px] flex items-center gap-1.5 px-2 py-1">
          <input
            ref={inputRef}
            type={inputType}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || "À compléter.."}
            className="flex-1 text-[13px] text-panora-text leading-5 outline-none bg-transparent min-w-0"
          />
        </div>
      </div>
    );
  }

  // Missing/warning state: orange border, placeholder text
  if (isMissing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="border border-[#d4b792] rounded-lg p-[2px] w-full text-left"
      >
        <div className="bg-white border border-[#e2dfd8] rounded-[6px] flex items-center gap-1.5 px-2 py-1">
          <span className="text-[13px] text-panora-text-muted leading-5">
            À compléter..
          </span>
        </div>
      </button>
    );
  }

  // Invalid state: red border, error message
  if (isInvalid) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setEditing(true); setLocalValue(field.value); }}
          className="border border-panora-error rounded-lg p-[2px] flex-1 min-w-0 text-left"
        >
          <div className="bg-white border border-[#e2dfd8] rounded-[6px] flex items-center gap-1.5 px-2 py-1">
            <span className="text-[13px] text-panora-text leading-5 truncate">
              {field.value}
            </span>
          </div>
        </button>
        {field.error && (
          <span className="text-[12px] font-medium text-panora-error whitespace-nowrap shrink-0">
            {field.error}
          </span>
        )}
      </div>
    );
  }

  // Filled state: text + pencil icon, hover bg
  return (
    <button
      onClick={() => { setEditing(true); setLocalValue(field.value); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors w-full text-left",
        hovered && "bg-[rgba(34,32,26,0.05)]"
      )}
    >
      <Pencil className="w-4 h-4 text-panora-text-muted shrink-0" />
      <span className="text-[13px] text-panora-text leading-5 truncate">
        {field.value}
      </span>
    </button>
  );
}

function FieldRow({
  field,
  locked,
  onChange,
}: {
  field: ExtractedField;
  locked: boolean;
  onChange: (value: string) => void;
}) {
  const isMissing = field.status === "missing";
  const isInvalid = field.status === "invalid";

  return (
    <div className="flex items-center px-4 py-2 gap-3">
      {/* Label */}
      <span
        className={cn(
          "text-[13px] shrink-0 w-40 leading-5",
          locked
            ? "text-panora-text-secondary"
            : isMissing
            ? "text-panora-warning-text"
            : isInvalid
            ? "text-panora-error"
            : "text-panora-text-secondary"
        )}
      >
        {field.label}
      </span>

      {/* Inline input */}
      <div className="flex-1 min-w-0">
        <InlineInput field={field} locked={locked} onChange={onChange} />
      </div>
    </div>
  );
}
