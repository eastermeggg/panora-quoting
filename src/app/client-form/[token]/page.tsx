"use client";

import { useState, useCallback, useRef, useEffect, use } from "react";
import { CheckCircle2, AlertCircle, Send, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getClientFormRequest } from "@/data/client-form-mock";
import type {
  ExtractedSection,
  ExtractedField,
  FieldStatus,
} from "@/data/scenarios";

// ─── Field validation ────────────────────────────────────────────────

function validateField(field: ExtractedField, value: string): FieldStatus {
  if (!value.trim()) return "missing";
  if (field.type === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "ok" : "invalid";
  }
  if (field.type === "date") {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return "invalid";
    const [, d, m] = match.map(Number);
    return d >= 1 && d <= 31 && m >= 1 && m <= 12 ? "ok" : "invalid";
  }
  return "ok";
}

function getFieldError(field: ExtractedField, status: FieldStatus): string | undefined {
  if (status !== "invalid") return undefined;
  if (field.type === "email") return "Email invalide";
  if (field.type === "date") return "Format attendu : JJ/MM/AAAA";
  return "Valeur invalide";
}

// ─── Stats helpers ───────────────────────────────────────────────────

function getProgress(sections: ExtractedSection[], initialTotal: number) {
  let remaining = 0;
  for (const s of sections) {
    for (const f of s.fields) {
      if (f.status === "missing" || f.status === "invalid") remaining++;
    }
  }
  const done = initialTotal - remaining;
  return { done, remaining, total: initialTotal, pct: initialTotal > 0 ? Math.round((done / initialTotal) * 100) : 100 };
}

// ─── Page ────────────────────────────────────────────────────────────

export default function ClientFormPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const formRequest = getClientFormRequest(token);

  if (!formRequest) {
    return <ExpiredOrNotFound />;
  }

  return <ClientForm formRequest={formRequest} />;
}

function ClientForm({ formRequest }: { formRequest: NonNullable<ReturnType<typeof getClientFormRequest>> }) {
  const [sections, setSections] = useState<ExtractedSection[]>(formRequest.sections);
  const [submitted, setSubmitted] = useState(false);

  // Track which fields were originally editable so they stay editable after filling
  const [editableKeys] = useState(() => {
    const keys = new Set<string>();
    for (const s of formRequest.sections) {
      for (const f of s.fields) {
        if (f.status === "missing" || f.status === "invalid") {
          keys.add(`${s.key}:${f.key}`);
        }
      }
    }
    return keys;
  });

  const initialTotal = editableKeys.size;

  const progress = getProgress(sections, initialTotal);
  const canSubmit = progress.remaining === 0;

  const handleFieldChange = useCallback(
    (sectionKey: string, fieldKey: string, newValue: string) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.key !== sectionKey) return section;

          const updatedFields = section.fields.map((field) => {
            if (field.key !== fieldKey) return field;
            const newStatus = validateField(field, newValue);
            return {
              ...field,
              value: newValue,
              status: newStatus,
              error: getFieldError(field, newStatus),
            };
          });

          const missingCount = updatedFields.filter((f) => f.status === "missing").length;
          const invalidCount = updatedFields.filter((f) => f.status === "invalid").length;
          let sectionStatus: "complete" | "incomplete" | "invalid" = "complete";
          if (invalidCount > 0) sectionStatus = "invalid";
          else if (missingCount > 0) sectionStatus = "incomplete";

          return { ...section, fields: updatedFields, status: sectionStatus, missingCount, invalidCount };
        })
      );
    },
    []
  );

  if (submitted) {
    return <SuccessScreen cabinetName={formRequest.cabinetName} brokerName={formRequest.brokerName} />;
  }

  return (
    <div className="min-h-screen bg-panora-bg">
      {/* Header */}
      <header className="bg-white border-b border-panora-border">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-panora-btn-primary flex items-center justify-center">
            <span className="text-white text-[13px] font-semibold">{formRequest.cabinetName.charAt(0)}</span>
          </div>
          <p className="text-[13px] font-medium text-panora-text">{formRequest.cabinetName}</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Introduction */}
        <div className="mb-10">
          <h1 className="text-[24px] font-serif text-panora-text mb-3">
            Complétez votre dossier
          </h1>
          <p className="text-[14px] text-panora-text-secondary leading-relaxed mb-5">
            <span className="font-medium text-panora-text">{formRequest.brokerName}</span> du
            cabinet <span className="font-medium text-panora-text">{formRequest.cabinetName}</span> prépare
            actuellement une cotation d&apos;assurance pour vous. Il manque quelques informations
            pour pouvoir interroger les assureurs et vous obtenir les meilleures offres.
          </p>

          <div className="bg-white border border-panora-border rounded-xl overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-3 divide-x divide-panora-border">
              <div className="px-4 py-3.5">
                <p className="text-[11px] uppercase tracking-wide text-panora-text-muted mb-1">Client</p>
                <p className="text-[13px] font-medium text-panora-text">{formRequest.client}</p>
              </div>
              <div className="px-4 py-3.5">
                <p className="text-[11px] uppercase tracking-wide text-panora-text-muted mb-1">Produit</p>
                <p className="text-[13px] font-medium text-panora-text">{formRequest.product}</p>
              </div>
              <div className="px-4 py-3.5">
                <p className="text-[11px] uppercase tracking-wide text-panora-text-muted mb-1">Référence</p>
                <p className="text-[13px] font-medium text-panora-text">{formRequest.cotationId}</p>
              </div>
            </div>
          </div>

          <p className="text-[13px] text-panora-text-muted mt-4 leading-relaxed">
            Les champs marqués d&apos;un <span className="inline-block w-1.5 h-1.5 rounded-full bg-panora-warning align-middle mx-0.5" /> sont
            à renseigner en priorité. Vous pouvez également vérifier et corriger les informations déjà pré-remplies.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-panora-text-secondary">
              {progress.remaining > 0
                ? `${progress.remaining} champ${progress.remaining > 1 ? "s" : ""} restant${progress.remaining > 1 ? "s" : ""}`
                : "Tous les champs sont remplis"}
            </span>
            <span className="text-[13px] font-medium text-panora-text">{progress.pct}%</span>
          </div>
          <div className="h-1.5 bg-panora-border rounded-full overflow-hidden">
            <div
              className="h-full bg-panora-green rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <FormSection
              key={section.key}
              section={section}
              editableKeys={editableKeys}
              onFieldChange={(fieldKey, value) =>
                handleFieldChange(section.key, fieldKey, value)
              }
            />
          ))}
        </div>

        {/* Submit */}
        <div className="mt-10 pb-12">
          <button
            onClick={() => setSubmitted(true)}
            disabled={!canSubmit}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[14px] font-medium transition-all",
              canSubmit
                ? "btn-primary text-white cursor-pointer"
                : "bg-panora-border text-panora-text-muted cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
            Envoyer mes informations
          </button>
          {!canSubmit && (
            <p className="text-center text-[12px] text-panora-text-muted mt-3">
              Veuillez compléter tous les champs requis avant d&apos;envoyer.
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-panora-border bg-white">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-[12px] text-panora-text-muted">
            Vos données sont transmises de manière sécurisée à votre courtier.
          </p>
          <p className="text-[12px] text-panora-text-muted">Panora</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Form Section ────────────────────────────────────────────────────

function FormSection({
  section,
  editableKeys,
  onFieldChange,
}: {
  section: ExtractedSection;
  editableKeys: Set<string>;
  onFieldChange: (fieldKey: string, value: string) => void;
}) {
  const [showProvided, setShowProvided] = useState(false);

  const isComplete = section.status === "complete";
  const hasIssues = section.status === "incomplete" || section.status === "invalid";

  // Split fields: highlighted ones (to complete) vs already provided
  const toComplete = section.fields.filter((f) => editableKeys.has(`${section.key}:${f.key}`));
  const provided = section.fields.filter((f) => !editableKeys.has(`${section.key}:${f.key}`));

  return (
    <div className="bg-white border border-panora-border rounded-xl overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.04)]">
      {/* Section header */}
      <div className="px-5 py-3.5 border-b border-panora-border flex items-center gap-2.5">
        {isComplete ? (
          <CheckCircle2 className="w-[18px] h-[18px] text-panora-green shrink-0" />
        ) : (
          <div className="w-[18px] h-[18px] rounded-full border-2 border-panora-warning shrink-0" />
        )}
        <span className="text-[14px] font-medium text-panora-text flex-1">
          {section.label}
        </span>
        {hasIssues && (
          <span className="text-[12px] text-panora-warning-text">
            {(section.missingCount || 0) + (section.invalidCount || 0)} à compléter
          </span>
        )}
      </div>

      {/* Fields to complete — always visible */}
      {toComplete.length > 0 && (
        <div className="divide-y divide-panora-border/60">
          {toComplete.map((field) => (
            <ClientField
              key={field.key}
              field={field}
              highlight={true}
              onChange={(value) => onFieldChange(field.key, value)}
            />
          ))}
        </div>
      )}

      {/* Already provided — collapsible */}
      {provided.length > 0 && (
        <div className={cn(toComplete.length > 0 && "border-t border-panora-border")}>
          <button
            onClick={() => setShowProvided(!showProvided)}
            className="w-full px-5 py-2.5 flex items-center gap-2 text-left hover:bg-panora-drop/50 transition-colors"
          >
            {showProvided ? (
              <ChevronDown className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
            )}
            <span className="text-[12px] text-panora-text-muted">
              {provided.length} information{provided.length > 1 ? "s" : ""} déjà renseignée{provided.length > 1 ? "s" : ""}
            </span>
          </button>

          {showProvided && (
            <div className="divide-y divide-panora-border/60 border-t border-panora-border/60">
              {provided.map((field) => (
                <ClientField
                  key={field.key}
                  field={field}
                  highlight={false}
                  onChange={(value) => onFieldChange(field.key, value)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Client Field ────────────────────────────────────────────────────

function ClientField({
  field,
  highlight,
  onChange,
}: {
  field: ExtractedField;
  highlight: boolean;
  onChange: (value: string) => void;
}) {
  const isMissing = field.status === "missing";
  const isInvalid = field.status === "invalid";

  const [localValue, setLocalValue] = useState(field.value);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(field.value);
  }, [field.value]);

  const handleBlur = () => {
    setFocused(false);
    if (localValue !== field.value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onChange(localValue);
      inputRef.current?.blur();
    }
  };

  const inputType =
    field.type === "email" ? "email" :
    field.type === "number" ? "number" :
    field.type === "phone" ? "tel" :
    "text";

  return (
    <div className={cn(
      "px-5 py-3 flex items-start gap-4",
      highlight && isMissing && "bg-panora-warning-bg/40",
    )}>
      {/* Label */}
      <div className="w-44 shrink-0 pt-2 flex items-center gap-1.5">
        {highlight && isMissing && (
          <div className="w-1.5 h-1.5 rounded-full bg-panora-warning shrink-0" />
        )}
        {highlight && isInvalid && (
          <div className="w-1.5 h-1.5 rounded-full bg-panora-error shrink-0" />
        )}
        <span
          className={cn(
            "text-[13px] leading-5",
            highlight && (isMissing || isInvalid) ? "text-panora-text font-medium" : "text-panora-text-secondary"
          )}
        >
          {field.label}
        </span>
      </div>

      {/* Input — always editable */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "border rounded-lg transition-all",
            focused
              ? "border-panora-green shadow-[0_0_0_3px_rgba(0,162,114,0.1)]"
              : isInvalid
              ? "border-panora-error"
              : isMissing && highlight
              ? "border-[#d4b792]"
              : "border-[#e2dfd8]"
          )}
        >
          <input
            ref={inputRef}
            type={inputType}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || ""}
            className="w-full px-3 py-2 text-[13px] text-panora-text bg-white rounded-lg outline-none placeholder:text-panora-text-muted"
          />
        </div>
        {isInvalid && field.error && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-panora-error shrink-0" />
            <span className="text-[12px] text-panora-error">{field.error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Success Screen ──────────────────────────────────────────────────

function SuccessScreen({ cabinetName, brokerName }: { cabinetName: string; brokerName: string }) {
  return (
    <div className="min-h-screen bg-panora-bg flex flex-col">
      <header className="bg-white border-b border-panora-border">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-panora-btn-primary flex items-center justify-center">
            <span className="text-white text-[13px] font-semibold">P</span>
          </div>
          <div>
            <p className="text-[13px] font-medium text-panora-text">{cabinetName}</p>
            <p className="text-[12px] text-panora-text-muted">via Panora</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-panora-green-light flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-panora-green" />
          </div>
          <h1 className="text-[24px] font-serif text-panora-text mb-3">
            Informations envoyées
          </h1>
          <p className="text-[14px] text-panora-text-secondary leading-relaxed mb-2">
            Vos informations ont bien été transmises à <span className="font-medium text-panora-text">{brokerName}</span>.
          </p>
          <p className="text-[13px] text-panora-text-muted leading-relaxed">
            Votre courtier va pouvoir finaliser la cotation. Vous serez recontacté prochainement avec les propositions d&apos;assurance.
          </p>
        </div>
      </main>

      <footer className="border-t border-panora-border bg-white">
        <div className="max-w-2xl mx-auto px-6 py-4 text-center">
          <p className="text-[12px] text-panora-text-muted">Panora</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Expired / Not Found ─────────────────────────────────────────────

function ExpiredOrNotFound() {
  return (
    <div className="min-h-screen bg-panora-bg flex flex-col">
      <header className="bg-white border-b border-panora-border">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-panora-btn-primary flex items-center justify-center">
            <span className="text-white text-[13px] font-semibold">P</span>
          </div>
          <p className="text-[13px] font-medium text-panora-text">Panora</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-panora-drop flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-panora-text-muted" />
          </div>
          <h1 className="text-[24px] font-serif text-panora-text mb-3">
            Lien expiré ou introuvable
          </h1>
          <p className="text-[14px] text-panora-text-secondary leading-relaxed">
            Ce formulaire n&apos;est plus disponible. Veuillez contacter votre courtier pour obtenir un nouveau lien.
          </p>
        </div>
      </main>

      <footer className="border-t border-panora-border bg-white">
        <div className="max-w-2xl mx-auto px-6 py-4 text-center">
          <p className="text-[12px] text-panora-text-muted">Panora</p>
        </div>
      </footer>
    </div>
  );
}
