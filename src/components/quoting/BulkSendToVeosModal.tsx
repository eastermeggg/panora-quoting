"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientSelector } from "@/components/quoting/ClientSelector";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { getActiveErpAdapter } from "@/data/erp-adapters";
import {
  getClientContractByProduct,
  getClientContracts,
  getVeosClient,
  type VeosContract,
} from "@/data/clients-mock";

export type DocumentCategory =
  | "devis"
  | "conditions_generales"
  | "tableau_garanties"
  | "ipid"
  | "synthese"
  | "recap_demande";

export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  devis: "Devis",
  conditions_generales: "Conditions générales",
  tableau_garanties: "Tableau garanties",
  ipid: "Fiche IPID",
  synthese: "Synthèse",
  recap_demande: "Récapitulatif",
};

export type BulkDocument = {
  id: string;
  /** Filename shown in the checklist row. */
  label: string;
  /** VEOS classification — drives the badge and group placement. */
  category: DocumentCategory;
  /** Insurer the doc comes from. Undefined for Panora-generated docs. */
  insurerId?: string;
  insurerName?: string;
  /** Short hint like "Reçu le 14/04 · 12 pages". */
  meta?: string;
  /** Pre-checked default. */
  defaultChecked?: boolean;
};

export type CrmDataPoint = {
  label: string;
  value: string;
  /** Default VEOS data path this field syncs to. */
  erpField: string;
  /** Alternative paths the user can remap to (excluding the default). */
  erpFieldOptions?: string[];
};

/**
 * Grouped CRM data — each section becomes a collapsible card in step 3,
 * mirroring the "Récapitulatif demande" layout used elsewhere in the app.
 */
export type CrmSection = {
  key: string;
  label: string;
  fields: CrmDataPoint[];
};

type SubmitStatus = "idle" | "sending" | "sent" | "error";

type WizardStep = 1 | 2 | 3;

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Client & contrat",
  2: "Documents",
  3: "Données",
};

interface BulkSendToVeosModalProps {
  open: boolean;
  /** VEOS client id — drives the contract list. */
  clientId: string | null;
  /** Display name shown in the read-only client row. */
  clientName: string;
  /** Cotation's principal product, used to preselect the matching contract. */
  principalProduct?: string | null;
  /** Files available to push. The dialog renders one row per entry with a checkbox. */
  documents: BulkDocument[];
  /** Contract-level structured fields, grouped into product-aware sections. */
  crmSections: CrmSection[];
  onCancel: () => void;
  /** Resolves once the simulated round-trip completes successfully. */
  onSent?: (summary: {
    contract: VeosContract | { id: "new"; label: string; product: string };
    documentIds: string[];
  }) => void;
}

export function BulkSendToVeosModal({
  open,
  clientId,
  clientName,
  principalProduct,
  documents,
  crmSections,
  onCancel,
  onSent,
}: BulkSendToVeosModalProps) {
  const allFields = useMemo(
    () => crmSections.flatMap((s) => s.fields.map((f) => ({ section: s.key, field: f }))),
    [crmSections]
  );
  const erp = getActiveErpAdapter();
  // Pickable client (defaults to the cotation's client; user can switch).
  const [pickedClientId, setPickedClientId] = useState<string | null>(clientId);
  const contracts = useMemo(
    () => (pickedClientId ? getClientContracts(pickedClientId) : []),
    [pickedClientId]
  );
  const defaultContract = useMemo(
    () =>
      (pickedClientId &&
        getClientContractByProduct(pickedClientId, principalProduct)?.id) ||
      contracts[0]?.id ||
      "new",
    [pickedClientId, principalProduct, contracts]
  );

  const [selectedContractId, setSelectedContractId] = useState<string>(
    defaultContract
  );
  const [docChecked, setDocChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(documents.map((d) => [d.id, d.defaultChecked ?? true]))
  );
  // Per-field VEOS mapping selections, keyed by `${sectionKey}::${fieldLabel}`.
  const [crmMappings, setCrmMappings] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      allFields.map(({ section, field }) => [
        `${section}::${field.label}`,
        field.erpField,
      ])
    )
  );
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [step, setStep] = useState<WizardStep>(1);

  // Reset state every time the modal reopens.
  useEffect(() => {
    if (!open) return;
    setPickedClientId(clientId);
    setSelectedContractId(defaultContract);
    setDocChecked(
      Object.fromEntries(documents.map((d) => [d.id, d.defaultChecked ?? true]))
    );
    setCrmMappings(
      Object.fromEntries(
        allFields.map(({ section, field }) => [
          `${section}::${field.label}`,
          field.erpField,
        ])
      )
    );
    setStatus("idle");
    setStep(1);
  }, [open, clientId, defaultContract, documents, allFields]);

  // Keep the contract selection synced when the picked client changes.
  useEffect(() => {
    setSelectedContractId(defaultContract);
  }, [defaultContract]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && status !== "sending") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, status, onCancel]);

  // Auto-close after success
  useEffect(() => {
    if (status !== "sent") return;
    const t = window.setTimeout(onCancel, 2400);
    return () => window.clearTimeout(t);
  }, [status, onCancel]);

  if (!open) return null;

  const checkedDocs = documents.filter((d) => docChecked[d.id]);
  const step1Valid =
    pickedClientId !== null && selectedContractId.length > 0;
  const step2Valid = checkedDocs.length > 0;
  const canAdvance =
    (step === 1 && step1Valid) || (step === 2 && step2Valid);
  const canSend =
    step === 3 &&
    step1Valid &&
    step2Valid &&
    status !== "sending";

  function toggleDoc(id: string) {
    setDocChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSend() {
    if (!canSend) return;
    setStatus("sending");
    window.setTimeout(() => {
      setStatus("sent");
      onSent?.({
        contract: contracts.find((c) => c.id === selectedContractId)!,
        documentIds: checkedDocs.map((d) => d.id),
      });
    }, 1200);
  }

  const sending = status === "sending";
  const sent = status === "sent";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
      onMouseDown={sending ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={`Envoyer à ${erp.name}`}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[880px] mx-4 flex flex-col max-h-[92vh] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-[44px] px-4 bg-panora-secondary/40 border-b border-panora-border">
          <div className="flex items-center gap-2 min-w-0">
            <Image
              src="/logos/veos.svg"
              alt=""
              width={14}
              height={14}
              className="rounded-[3px] shrink-0"
            />
            <span className="text-[13px] font-medium text-panora-text leading-5 truncate">
              {sent ? `Envoyé à ${erp.name}` : `Envoyer à ${erp.name}`}
            </span>
          </div>
          {!sending && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-panora-border/50 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-panora-text-muted" />
            </button>
          )}
        </div>

        {sent ? (
          <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-panora-green" />
            <p className="text-[14px] font-medium text-panora-text">
              {checkedDocs.length} document
              {checkedDocs.length > 1 ? "s" : ""} envoyé
              {checkedDocs.length > 1 ? "s" : ""} à {erp.name}
            </p>
            <p className="text-[12.5px] text-panora-text-secondary leading-5 max-w-[420px]">
              Classés dans la fiche{" "}
              <span className="font-medium text-panora-text">
                {(pickedClientId && getVeosClient(pickedClientId)?.name) ||
                  clientName}
              </span>
              {(() => {
                const c = contracts.find((c) => c.id === selectedContractId);
                return c ? ` · ${c.label}` : "";
              })()}
              . Les données CRM ont été synchronisées.
            </p>
          </div>
        ) : (
          <>
            {/* Stepper */}
            <div className="px-6 pt-4 pb-3 border-b border-panora-border">
              <Stepper step={step} />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-5 flex flex-col gap-4">
              <StepIntro step={step} erpName={erp.name} containerNoun={erp.container.singular} />

              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <SubSection title="Client">
                    <ClientSelector
                      value={pickedClientId}
                      onChange={setPickedClientId}
                    />
                  </SubSection>

                  <SubSection
                    title={`Classer dans une ${erp.container.singular}`}
                    hint={`Les pièces seront rattachées à cette ${erp.container.singular} dans ${erp.name}.`}
                  >
                    <div className="relative">
                      <select
                        value={selectedContractId}
                        onChange={(e) => setSelectedContractId(e.target.value)}
                        className="w-full h-10 pl-3 pr-9 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-[13px] text-panora-text outline-none focus:border-panora-green/40 transition-colors appearance-none"
                        disabled={contracts.length === 0}
                      >
                        {contracts.length === 0 ? (
                          <option value="">Aucune {erp.container.singular} existante</option>
                        ) : (
                          contracts.map((c) => {
                            const badge = erp.container.statuses[c.status];
                            return (
                              <option key={c.id} value={c.id}>
                                {c.label}
                                {badge ? ` · ${badge}` : ""}
                              </option>
                            );
                          })
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-panora-text-muted pointer-events-none" />
                    </div>
                  </SubSection>
                </div>
              )}

              {step === 2 && (
                <DocumentClassificationList
                  documents={documents}
                  docChecked={docChecked}
                  onToggle={toggleDoc}
                />
              )}

              {step === 3 && (
                <SubSection
                  title={`Contrat (${erp.container.Singular})`}
                  hint={`${allFields.length} champ${allFields.length > 1 ? "s" : ""} synchronisé${allFields.length > 1 ? "s" : ""} dans ${erp.name}.`}
                >
                  <div className="flex flex-col gap-2.5">
                    {crmSections.map((section, idx) => (
                      <SectionTable
                        key={section.key}
                        section={section}
                        defaultOpen={idx === 0}
                        mappingFor={(field) =>
                          crmMappings[`${section.key}::${field.label}`] ??
                          field.erpField
                        }
                        onMappingChange={(field, v) =>
                          setCrmMappings((prev) => ({
                            ...prev,
                            [`${section.key}::${field.label}`]: v,
                          }))
                        }
                      />
                    ))}
                  </div>
                </SubSection>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-panora-border px-6 py-3.5 flex items-center justify-between gap-3 bg-panora-secondary/30">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s))}
                  disabled={sending}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 h-9 text-[13px] font-medium text-panora-text-secondary rounded-lg border border-panora-border hover:bg-white transition-colors",
                    sending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Précédent
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 h-9 text-[13px] font-medium text-panora-text-secondary rounded-lg border border-panora-border hover:bg-white transition-colors"
                >
                  Annuler
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => canAdvance && setStep((s) => (s < 3 ? ((s + 1) as WizardStep) : s))}
                  disabled={!canAdvance}
                  className={cn(
                    "btn-primary px-4 h-9 text-[13px] font-semibold leading-5 inline-flex items-center gap-1.5",
                    !canAdvance && "opacity-60 cursor-not-allowed"
                  )}
                >
                  Suivant
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!canSend}
                  className={cn(
                    "btn-primary px-4 h-9 text-[13px] font-semibold leading-5 inline-flex items-center gap-1.5",
                    !canSend && "opacity-60 cursor-not-allowed"
                  )}
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Envoi…
                    </>
                  ) : (
                    <>
                      <Image
                        src="/logos/veos.svg"
                        alt=""
                        width={14}
                        height={14}
                        className="rounded-[3px]"
                      />
                      Envoyer à VEOS
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

// ── Stepper & step intro ──────────────────────────────────────────────

function Stepper({ step }: { step: WizardStep }) {
  const items: WizardStep[] = [1, 2, 3];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map((id, i) => {
        const isActive = step === id;
        const isDone = step > id;
        return (
          <div key={id} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold leading-4",
                isActive || isDone
                  ? "bg-panora-green text-white"
                  : "bg-panora-secondary text-panora-text-muted"
              )}
            >
              {isDone ? <Check className="w-3 h-3" /> : id}
            </span>
            <span
              className={cn(
                "text-[13px] leading-5",
                isActive
                  ? "text-panora-text font-semibold"
                  : isDone
                  ? "text-panora-text-secondary font-medium"
                  : "text-panora-text-muted font-medium"
              )}
            >
              {STEP_LABELS[id]}
            </span>
            {i < items.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-panora-text-muted mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepIntro({
  step,
  erpName,
  containerNoun,
}: {
  step: WizardStep;
  erpName: string;
  containerNoun: string;
}) {
  const copy: Record<WizardStep, { title: string; description: string }> = {
    1: {
      title: `Vérifier le client et l'${containerNoun}`,
      description: `Confirmez le client destinataire et l'${containerNoun} dans laquelle les pièces seront classées.`,
    },
    2: {
      title: "Documents à envoyer",
      description: `Sélectionnez les pièces à pousser dans ${erpName}. Tout est sélectionné par défaut.`,
    },
    3: {
      title: `Données synchronisées dans ${erpName}`,
      description: `Aperçu des champs structurés posés sur l'${containerNoun}.`,
    },
  };
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-[18px] font-serif text-panora-text leading-6 tracking-[-0.01em]">
        {copy[step].title}
      </h2>
      <p className="text-[13px] text-panora-text-secondary leading-5">
        {copy[step].description}
      </p>
    </div>
  );
}

function SubSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-medium text-panora-text leading-5">
          {title}
        </h3>
        {hint && (
          <span className="text-[12px] text-panora-text-muted leading-5 truncate">
            {hint}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

// ── Document classification (grouped by insurer / Panora) ────────────

const PANORA_GROUP_KEY = "__panora__";

function DocumentClassificationList({
  documents,
  docChecked,
  onToggle,
}: {
  documents: BulkDocument[];
  docChecked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  // Group by insurer; Panora-generated docs collapse into a single trailing group.
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; insurerId?: string; docs: BulkDocument[] }
    >();
    for (const doc of documents) {
      const key = doc.insurerId ?? PANORA_GROUP_KEY;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: doc.insurerName ?? "Panora",
          insurerId: doc.insurerId,
          docs: [],
        });
      }
      map.get(key)!.docs.push(doc);
    }
    return Array.from(map.values());
  }, [documents]);

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <DocumentGroup
          key={group.key}
          name={group.name}
          insurerId={group.insurerId}
          docs={group.docs}
          docChecked={docChecked}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

function DocumentGroup({
  name,
  insurerId,
  docs,
  docChecked,
  onToggle,
}: {
  name: string;
  insurerId?: string;
  docs: BulkDocument[];
  docChecked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const checkedCount = docs.filter((d) => docChecked[d.id]).length;
  return (
    <div className="border border-panora-border rounded-lg overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-3.5 py-2.5 bg-panora-bg/40 border-b border-panora-border">
        {insurerId ? (
          <InsurerLogo
            insurerId={insurerId}
            name={name}
            size="sm"
            className="w-5 h-5 rounded"
          />
        ) : (
          <div className="w-5 h-5 rounded bg-panora-green/15 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-panora-green" strokeWidth={2} />
          </div>
        )}
        <span className="text-[13px] font-medium text-panora-text flex-1 truncate">
          {name}
        </span>
        <span className="text-[12px] text-panora-text-muted tabular-nums">
          {checkedCount} / {docs.length}
        </span>
      </div>
      <ul className="divide-y divide-panora-border">
        {docs.map((doc) => {
          const checked = !!docChecked[doc.id];
          return (
            <li key={doc.id}>
              <label
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2 cursor-pointer transition-colors",
                  checked
                    ? "bg-white hover:bg-panora-bg/30"
                    : "bg-panora-secondary/20 hover:bg-panora-secondary/30"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(doc.id)}
                  className="w-4 h-4 accent-panora-green"
                />
                <FileText
                  className="w-4 h-4 text-panora-text-secondary shrink-0"
                  strokeWidth={1.75}
                />
                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                  <span className="text-[13px] font-medium text-panora-text truncate">
                    {doc.label}
                  </span>
                  {doc.meta && (
                    <span className="text-[12px] text-panora-text-muted leading-4 truncate">
                      {doc.meta}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center px-1.5 h-[18px] rounded-full text-[10.5px] font-medium leading-4 bg-panora-secondary/70 text-panora-text-secondary whitespace-nowrap shrink-0">
                  {DOCUMENT_CATEGORY_LABEL[doc.category]}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Section table (one collapsible card per CrmSection) ───────────────

function SectionTable({
  section,
  defaultOpen,
  mappingFor,
  onMappingChange,
}: {
  section: CrmSection;
  defaultOpen?: boolean;
  mappingFor: (field: CrmDataPoint) => string;
  onMappingChange: (field: CrmDataPoint, value: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const count = section.fields.length;
  return (
    <div className="border border-panora-border rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full px-4 py-2.5 bg-panora-bg/40 hover:bg-panora-bg/70 transition-colors text-left"
        aria-expanded={open}
      >
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 text-panora-text-muted shrink-0 transition-transform",
            open && "rotate-90"
          )}
        />
        <CheckCircle2 className="w-4 h-4 text-panora-green shrink-0" />
        <span className="text-[13px] font-medium text-panora-text flex-1 truncate">
          {section.label}
        </span>
        <span className="text-[12px] text-panora-text-muted tabular-nums">
          {count} champ{count > 1 ? "s" : ""}
        </span>
      </button>
      {open && (
        <div className="divide-y divide-panora-border">
          {section.fields.map((field) => (
            <div
              key={field.label}
              className="grid grid-cols-[180px_1fr_200px] items-center gap-3 px-4 py-2"
            >
              <span className="text-[13px] text-panora-text-secondary leading-5 truncate">
                {field.label}
              </span>
              <span className="text-[13px] text-panora-text leading-5 truncate">
                {field.value}
              </span>
              <ErpFieldSelect
                field={field}
                value={mappingFor(field)}
                onChange={(v) => onMappingChange(field, v)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ERP field mapping select ──────────────────────────────────────────

function ErpFieldSelect({
  field,
  value,
  onChange,
}: {
  field: CrmDataPoint;
  value: string;
  onChange: (v: string) => void;
}) {
  const adapter = getActiveErpAdapter();
  const options = useMemo(() => {
    const opts = [field.erpField, ...(field.erpFieldOptions ?? [])];
    if (!opts.includes(value)) opts.push(value);
    // Dedup while preserving order
    return Array.from(new Set(opts));
  }, [field.erpField, field.erpFieldOptions, value]);

  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-7 pl-2 pr-7 bg-white border border-panora-border rounded-md text-[11.5px] text-panora-text-secondary outline-none focus:border-panora-green/40 hover:border-panora-text-muted/40 transition-colors appearance-none font-mono tabular-nums truncate"
        title={`Champ ${adapter.name} : ${value}`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-panora-text-muted pointer-events-none" />
    </div>
  );
}
