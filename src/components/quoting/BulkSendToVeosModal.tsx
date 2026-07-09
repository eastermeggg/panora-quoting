"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Pencil,
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
  | "recap_demande"
  | "devoir_conseil"
  | "contrat"
  | "attestation"
  | "autre";

export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  devis: "Devis",
  conditions_generales: "Conditions générales",
  tableau_garanties: "Tableau garanties",
  ipid: "Fiche IPID",
  synthese: "Synthèse",
  recap_demande: "Récapitulatif",
  devoir_conseil: "Devoir de conseil",
  contrat: "Contrat",
  attestation: "Attestation",
  autre: "Document",
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
  /**
   * Current value in VEOS, when known. `null`/`""` = empty in VEOS (new data
   * point, written silently); a different string = conflict the broker
   * resolves per-field (replace or keep); same string = already in sync;
   * `undefined` = not fetched — plain sync row with no comparison shown.
   */
  veosValue?: string | null;
  /** VEOS data path this field syncs to — surfaced as a tooltip on the label. */
  erpField: string;
  /** Alternative paths. Currently unused by the UI (per-row remapping was cut
   *  for clarity); kept for a future "mappage avancé" mode. */
  erpFieldOptions?: string[];
  /**
   * Inline editor for the Panora value. `"text"` (default) is a single-line
   * field; `"multiselect"` is a chip picker whose value is the comma-joined
   * selection (e.g. a "Produit" carrying several branches).
   */
  input?: "text" | "multiselect";
  /** Options offered by the `"multiselect"` editor. */
  options?: string[];
};

/** Multi-select values are stored as a comma-joined string on `value`. */
function splitMulti(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function joinMulti(items: string[]): string {
  return items.join(", ");
}

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

/** What happens to a conflicting VEOS value: Panora replaces it, or it stays. */
type FieldFate = "replace" | "keep";

type CrmFieldStatus = "sync" | "new" | "same" | "conflict";

/** Stable per-field key, used for edited values and conflict decisions. */
function fieldKey(sectionKey: string, field: CrmDataPoint): string {
  return `${sectionKey}::${field.label}`;
}

/**
 * Status is a function of the field's VEOS value and the *effective* Panora
 * value (which the broker may have edited) — so editing a value to match VEOS
 * clears a conflict, and diverging from a synced value creates one.
 */
function statusFor(field: CrmDataPoint, value: string): CrmFieldStatus {
  if (field.veosValue === undefined) return "sync";
  if (field.veosValue === null || field.veosValue === "") return "new";
  if (field.veosValue === value) return "same";
  return "conflict";
}

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
  /** Demo/capture affordance — open the wizard on a given step. */
  initialStep?: WizardStep;
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
  initialStep,
}: BulkSendToVeosModalProps) {
  const allFields = useMemo(
    () => crmSections.flatMap((s) => s.fields.map((f) => ({ section: s.key, field: f }))),
    [crmSections]
  );
  // Broker-edited Panora values, keyed by section::label. Seeded from each
  // field's value; an entry only diverges once the broker edits it inline.
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      allFields.map(({ section, field }) => [fieldKey(section, field), field.value])
    )
  );
  const valueOf = useCallback(
    (sectionKey: string, field: CrmDataPoint) =>
      fieldValues[fieldKey(sectionKey, field)] ?? field.value,
    [fieldValues]
  );
  const conflictKeys = useMemo(
    () =>
      allFields
        .filter(({ section, field }) => statusFor(field, valueOf(section, field)) === "conflict")
        .map(({ section, field }) => fieldKey(section, field)),
    [allFields, valueOf]
  );
  // Steps adapt to content: no documents → docs step hidden (data-only sync);
  // no data → données step hidden (docs-only push, e.g. from the analysis tab).
  const visibleSteps = useMemo<WizardStep[]>(
    () => [
      1,
      ...(documents.length > 0 ? ([2] as WizardStep[]) : []),
      ...(allFields.length > 0 ? ([3] as WizardStep[]) : []),
    ],
    [documents.length, allFields.length]
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
  // Per-conflict decision — "replace" pushes the Panora value, "keep" leaves
  // the VEOS value untouched. Defaults to replace: that's the point of the
  // sync; keeping is the per-field opt-out. Seeded from the original values;
  // conflicts created by later edits fall back to "replace" via `fateFor`.
  const [fieldDecisions, setFieldDecisions] = useState<Record<string, FieldFate>>(
    () =>
      Object.fromEntries(
        allFields
          .filter(({ field }) => statusFor(field, field.value) === "conflict")
          .map(({ section, field }) => [fieldKey(section, field), "replace" as FieldFate])
      )
  );
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [step, setStep] = useState<WizardStep>(
    initialStep && visibleSteps.includes(initialStep) ? initialStep : 1
  );

  // Reset state every time the modal reopens.
  useEffect(() => {
    if (!open) return;
    setPickedClientId(clientId);
    setSelectedContractId(defaultContract);
    setDocChecked(
      Object.fromEntries(documents.map((d) => [d.id, d.defaultChecked ?? true]))
    );
    setFieldValues(
      Object.fromEntries(
        allFields.map(({ section, field }) => [fieldKey(section, field), field.value])
      )
    );
    setFieldDecisions(
      Object.fromEntries(
        allFields
          .filter(({ field }) => statusFor(field, field.value) === "conflict")
          .map(({ section, field }) => [fieldKey(section, field), "replace" as FieldFate])
      )
    );
    setStatus("idle");
    setStep(initialStep && visibleSteps.includes(initialStep) ? initialStep : 1);
  }, [open, clientId, defaultContract, documents, allFields, initialStep, visibleSteps]);

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
  const stepIdx = visibleSteps.indexOf(step);
  const isLastStep = stepIdx === visibleSteps.length - 1;
  const step1Valid =
    pickedClientId !== null && selectedContractId.length > 0;
  const step2Valid = checkedDocs.length > 0;
  const currentStepValid =
    step === 1 ? step1Valid : step === 2 ? step2Valid : true;
  const canAdvance = !isLastStep && currentStepValid;
  const canSend =
    isLastStep &&
    step1Valid &&
    (documents.length === 0 || step2Valid) &&
    status !== "sending";

  // Data-sync tallies for the step-3 header and the sent confirmation.
  const keptCount = conflictKeys.filter(
    (k) => fieldDecisions[k] === "keep"
  ).length;
  const upToDateCount = allFields.filter(
    ({ section, field }) => statusFor(field, valueOf(section, field)) === "same"
  ).length;
  const writtenCount = allFields.length - upToDateCount - keptCount;

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
              .
              {allFields.length > 0 && (
                <>
                  {" "}
                  {writtenCount} champ{writtenCount > 1 ? "s" : ""} synchronisé
                  {writtenCount > 1 ? "s" : ""}
                  {keptCount > 0 && (
                    <>
                      {" "}— {keptCount} valeur{keptCount > 1 ? "s" : ""} VEOS
                      conservée{keptCount > 1 ? "s" : ""}
                    </>
                  )}
                  .
                </>
              )}
            </p>
          </div>
        ) : (
          <>
            {/* Stepper */}
            <div className="px-6 pt-4 pb-3 border-b border-panora-border">
              <Stepper step={step} steps={visibleSteps} />
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
                  hint={[
                    `${writtenCount} champ${writtenCount > 1 ? "s" : ""} mis à jour`,
                    keptCount > 0
                      ? `${keptCount} conservé${keptCount > 1 ? "s" : ""}`
                      : null,
                    upToDateCount > 0 ? `${upToDateCount} déjà à jour` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                >
                  <div className="flex flex-col gap-2.5">
                    {crmSections.map((section, idx) => (
                      <SectionTable
                        key={section.key}
                        section={section}
                        defaultOpen={idx === 0}
                        valueFor={(field) => valueOf(section.key, field)}
                        onValueChange={(field, value) =>
                          setFieldValues((prev) => ({
                            ...prev,
                            [fieldKey(section.key, field)]: value,
                          }))
                        }
                        fateFor={(field) =>
                          fieldDecisions[fieldKey(section.key, field)] ??
                          "replace"
                        }
                        onFateChange={(field, fate) =>
                          setFieldDecisions((prev) => ({
                            ...prev,
                            [fieldKey(section.key, field)]: fate,
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
              {stepIdx > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(visibleSteps[stepIdx - 1])}
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

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={() => canAdvance && setStep(visibleSteps[stepIdx + 1])}
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

function Stepper({ step, steps }: { step: WizardStep; steps: WizardStep[] }) {
  const activeIdx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((id, i) => {
        const isActive = step === id;
        const isDone = activeIdx > i;
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
              {isDone ? <Check className="w-3 h-3" /> : i + 1}
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
            {i < steps.length - 1 && (
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
      description: `Aperçu des champs posés sur l'${containerNoun}. Les valeurs déjà présentes dans ${erpName} sont comparées — choisissez celles à remplacer.`,
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
  valueFor,
  onValueChange,
  fateFor,
  onFateChange,
}: {
  section: CrmSection;
  defaultOpen?: boolean;
  valueFor: (field: CrmDataPoint) => string;
  onValueChange: (field: CrmDataPoint, value: string) => void;
  fateFor: (field: CrmDataPoint) => FieldFate;
  onFateChange: (field: CrmDataPoint, fate: FieldFate) => void;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const count = section.fields.length;
  const conflicts = section.fields.filter(
    (f) => statusFor(f, valueFor(f)) === "conflict"
  ).length;
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
        {conflicts > 0 && (
          <span className="inline-flex items-center px-1.5 h-[18px] rounded-full text-[10.5px] font-medium leading-4 bg-panora-warning-bg text-panora-warning-text whitespace-nowrap shrink-0">
            {conflicts} conflit{conflicts > 1 ? "s" : ""}
          </span>
        )}
        <span className="text-[12px] text-panora-text-muted tabular-nums">
          {count} champ{count > 1 ? "s" : ""}
        </span>
      </button>
      {open && (
        <div className="divide-y divide-panora-border">
          {section.fields.map((field) => (
            <FieldRow
              key={field.label}
              field={field}
              value={valueFor(field)}
              onValueChange={(value) => onValueChange(field, value)}
              fate={fateFor(field)}
              onFateChange={(fate) => onFateChange(field, fate)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * One data point in the sync review. Four render states, driven by
 * `statusFor` (recomputed from the *edited* value):
 * - sync     — plain label/value row (VEOS value unknown)
 * - new      — value + green "Nouveau" pill (empty in VEOS, written silently)
 * - same     — muted value + "À jour" tag (no-op)
 * - conflict — the winning value carries the emphasis; the losing one is
 *              struck through; a single text action flips the choice
 *
 * Every row is editable: a hover pencil (or click) swaps the value for an
 * inline editor — a text field, or a chip multi-select for `input:
 * "multiselect"` fields such as "Produit". Editing recomputes the status, so
 * fixing a value to match VEOS clears its conflict, and vice-versa.
 *
 * The technical VEOS data path lives in the label's tooltip — plumbing, not
 * something the broker needs on screen.
 */
function FieldRow({
  field,
  value,
  onValueChange,
  fate,
  onFateChange,
}: {
  field: CrmDataPoint;
  value: string;
  onValueChange: (value: string) => void;
  fate: FieldFate;
  onFateChange: (fate: FieldFate) => void;
}) {
  const status = statusFor(field, value);
  const replace = fate === "replace";
  const isMulti = field.input === "multiselect";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  // Keep the draft aligned with external value changes while not editing
  // (e.g. the modal reset on reopen).
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };
  const commit = () => {
    onValueChange(isMulti ? joinMulti(splitMulti(draft)) : draft.trim());
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const editButton = (
    <button
      type="button"
      onClick={startEdit}
      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity w-6 h-6 rounded-md flex items-center justify-center text-panora-text-muted hover:bg-panora-border/40 shrink-0"
      aria-label={`Modifier ${field.label}`}
    >
      <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
    </button>
  );

  const editActions = (
    <div className="flex items-center gap-1 shrink-0 self-start">
      <button
        type="button"
        onClick={commit}
        className="w-6 h-6 rounded-md flex items-center justify-center bg-panora-green text-white hover:bg-panora-green-dark transition-colors"
        aria-label="Valider"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={cancel}
        className="w-6 h-6 rounded-md flex items-center justify-center text-panora-text-muted hover:bg-panora-border/40 transition-colors"
        aria-label="Annuler"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const editor = isMulti ? (
    <MultiSelectEditor
      value={splitMulti(draft)}
      options={field.options ?? []}
      onChange={(next) => setDraft(joinMulti(next))}
    />
  ) : (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        else if (e.key === "Escape") cancel();
      }}
      className="w-full h-8 px-2.5 bg-white border border-panora-green/50 rounded-md text-[13px] text-panora-text outline-none focus:border-panora-green shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
    />
  );

  return (
    <div
      className={cn(
        "group grid grid-cols-[180px_minmax(0,1fr)_auto] items-center gap-3 px-4",
        status === "conflict" && !editing ? "py-2.5 bg-panora-warning-bg/25" : "py-2"
      )}
    >
      <span
        className="text-[13px] text-panora-text-secondary leading-5 truncate self-start mt-0.5"
        title={`Champ VEOS : ${field.erpField}`}
      >
        {field.label}
      </span>

      {editing ? (
        <>
          <div className="flex flex-col gap-1 min-w-0">
            {editor}
            {status === "conflict" && (
              <span className="flex items-baseline gap-1 min-w-0 text-[12px] leading-4">
                <span className="text-panora-text-muted/70 shrink-0">VEOS ·</span>
                <span className="truncate text-panora-text-muted">
                  {field.veosValue}
                </span>
              </span>
            )}
          </div>
          {editActions}
        </>
      ) : status === "conflict" ? (
        <>
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              {isMulti ? (
                <ValueChips items={splitMulti(value)} dim={!replace} />
              ) : (
                <span
                  className={cn(
                    "text-[13px] leading-5 truncate",
                    replace
                      ? "text-panora-text font-medium"
                      : "text-panora-text-muted line-through decoration-panora-text-muted/50"
                  )}
                >
                  {value}
                </span>
              )}
              {editButton}
            </div>
            <span className="flex items-baseline gap-1 min-w-0 text-[12px] leading-4">
              <span className="text-panora-text-muted/70 shrink-0">
                VEOS ·
              </span>
              <span
                className={cn(
                  "truncate",
                  replace
                    ? "text-panora-text-muted line-through decoration-panora-text-muted/50"
                    : "text-panora-text font-medium"
                )}
              >
                {field.veosValue}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onFateChange(replace ? "keep" : "replace")}
            className="text-[12px] font-medium text-panora-green-dark hover:underline shrink-0 self-start mt-0.5"
          >
            {replace ? "Conserver la valeur VEOS" : "Remplacer"}
          </button>
        </>
      ) : (
        <div className="col-span-2 flex items-center gap-2 min-w-0">
          {isMulti ? (
            <ValueChips items={splitMulti(value)} muted={status === "same"} />
          ) : (
            <span
              className={cn(
                "text-[13px] leading-5 truncate",
                status === "same" ? "text-panora-text-muted" : "text-panora-text"
              )}
            >
              {value}
            </span>
          )}
          {status === "new" && (
            <span className="inline-flex items-center px-1.5 h-[18px] rounded-full text-[10.5px] font-medium leading-4 bg-panora-green-light text-panora-green-dark whitespace-nowrap shrink-0">
              Nouveau
            </span>
          )}
          {status === "same" && (
            <span className="inline-flex items-center px-1.5 h-[18px] rounded-full text-[10.5px] font-medium leading-4 bg-panora-tag/60 text-panora-text-muted whitespace-nowrap shrink-0">
              À jour
            </span>
          )}
          {editButton}
        </div>
      )}
    </div>
  );
}

/** Read-only chips for a multi-select value in display mode. */
function ValueChips({
  items,
  muted,
  dim,
}: {
  items: string[];
  muted?: boolean;
  dim?: boolean;
}) {
  if (items.length === 0) {
    return <span className="text-[13px] text-panora-text-muted leading-5">—</span>;
  }
  return (
    <div className={cn("flex flex-wrap items-center gap-1 min-w-0", dim && "opacity-70")}>
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "inline-flex items-center h-[20px] px-1.5 rounded-md text-[12px] font-medium leading-4 whitespace-nowrap",
            muted
              ? "bg-panora-secondary/60 text-panora-text-muted"
              : "bg-panora-secondary/70 text-panora-text",
            dim && "line-through decoration-panora-text-muted/50"
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/** Chip multi-select: remove with the ×, add from the remaining options. */
function MultiSelectEditor({
  value,
  options,
  onChange,
}: {
  value: string[];
  options: string[];
  onChange: (next: string[]) => void;
}) {
  const available = options.filter((o) => !value.includes(o));
  return (
    <div className="flex flex-wrap items-center gap-1.5 py-0.5">
      {value.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 h-[24px] pl-2 pr-1 rounded-md text-[12px] font-medium leading-4 bg-panora-green-light text-panora-green-dark border border-panora-green-border"
        >
          {item}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== item))}
            className="w-4 h-4 rounded-sm flex items-center justify-center hover:bg-panora-green/20"
            aria-label={`Retirer ${item}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {available.length > 0 && (
        <div className="relative">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) onChange([...value, e.target.value]);
            }}
            className="h-[24px] pl-2 pr-6 bg-white border border-dashed border-panora-border rounded-md text-[12px] text-panora-text-secondary outline-none focus:border-panora-green/50 appearance-none cursor-pointer"
          >
            <option value="">+ Ajouter</option>
            {available.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-panora-text-muted pointer-events-none" />
        </div>
      )}
    </div>
  );
}

