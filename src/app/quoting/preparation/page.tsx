"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CheckCircle2,
  Car,
  Shield,
  ChevronDown,
  ExternalLink,
  X,
  CloudUpload,
  FileText,
  ListChecks,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerSelector } from "@/components/quoting/InsurerSelector";
import { ClientSelector } from "@/components/quoting/ClientSelector";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { getScenario, getValidationStats, scenarios } from "@/data/scenarios";
import type { ExtractedSection } from "@/data/scenarios";
import {
  addContract,
  getClientContracts,
  veosClients,
  type VeosContract,
} from "@/data/clients-mock";
import { getActiveErpAdapter } from "@/data/erp-adapters";
import Link from "next/link";

// Mock products for dropdown
const mockProducts = [
  { id: "flotte-auto", name: "Flotte Automobile", icon: "car" },
  { id: "rc-pro", name: "RC Professionnelle", icon: "shield" },
  { id: "multirisque", name: "Multirisque Bureaux", icon: "shield" },
  { id: "cyber", name: "Cyber Risques", icon: "shield" },
  { id: "dommages", name: "Dommages aux Biens", icon: "shield" },
  { id: "auto", name: "Auto", icon: "car" },
];

/** Best-effort: map a scenario.client name to a VEOS client id. */
function resolveScenarioClientId(name: string | undefined): string {
  if (!name) return "marble";
  const match = veosClients.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  return match?.id ?? "marble";
}

/* ── Warning/Error badge with ! icon ── */
function AlertBadge({ variant }: { variant: "warning" | "error" }) {
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

/* ── Document icon (gray square) ── */
function DocIcon() {
  return (
    <div className="bg-panora-secondary rounded p-1 shrink-0">
      <FileText className="w-3.5 h-3.5 text-panora-text-secondary" />
    </div>
  );
}

function PreparationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenario") || "rc-pro";
  const scenario = getScenario(scenarioId) || scenarios["rc-pro"];

  const [projectName, setProjectName] = useState(scenario.defaultProjectName);
  const [selectedClient, setSelectedClient] = useState<string | null>(
    resolveScenarioClientId(scenario.client)
  );
  const [selectedProduct, setSelectedProduct] = useState(scenarioId);
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>(
    scenario.defaultSelectedInsurers
  );
  const [instructions, setInstructions] = useState("");
  const [sections, setSections] = useState<ExtractedSection[]>(
    scenario.extractedSections
  );

  // ── Étude picker ──
  const erp = getActiveErpAdapter();
  const productName = useMemo(
    () => mockProducts.find((p) => p.id === selectedProduct)?.name ?? scenario.product,
    [selectedProduct, scenario.product]
  );
  const clientContracts = useMemo(
    () => (selectedClient ? getClientContracts(selectedClient) : []),
    [selectedClient]
  );
  // "new" means we'll create a fresh étude on launch.
  const [etudeChoice, setEtudeChoice] = useState<string>("new");
  // When picking an existing étude, default to one whose product matches.
  useMemo(() => {
    if (!selectedClient) return;
    const match = clientContracts.find(
      (c) => c.status === "etude" && c.product.toLowerCase() === productName.toLowerCase()
    );
    setEtudeChoice(match?.id ?? "new");
  }, [selectedClient, productName, clientContracts]);
  const suggestedEtudeNumber = useMemo(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 900 + 100);
    return `${erp.container.numberPrefix}-${year}-${rand}`;
  }, [erp.container.numberPrefix]);
  const [newEtude, setNewEtude] = useState({
    title: `${erp.container.Singular} ${productName} ${new Date().getFullYear()}`,
    number: suggestedEtudeNumber,
    product: productName,
  });
  // Keep autofill in sync when product/year change before user touches the field.
  useMemo(() => {
    setNewEtude((prev) => ({
      ...prev,
      title:
        prev.title.startsWith(erp.container.Singular)
          ? `${erp.container.Singular} ${productName} ${new Date().getFullYear()}`
          : prev.title,
      product: prev.product || productName,
    }));
  }, [productName, erp.container.Singular]);

  const stats = useMemo(() => getValidationStats(sections), [sections]);
  const noInsurers = selectedInsurers.length === 0;
  const creatingEtude = etudeChoice === "new";

  const handleToggleInsurer = (id: string) => {
    setSelectedInsurers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleLaunch = () => {
    // Persist the étude to the shared mock so the followup page's bulk modal
    // picks it up by default.
    if (creatingEtude && selectedClient && newEtude.title.trim()) {
      const created: VeosContract = {
        id: `ctr-${Date.now()}`,
        clientId: selectedClient,
        product: newEtude.product || productName,
        label: `${newEtude.title.trim()} · ${newEtude.number.trim()}`,
        insurer: "—",
        status: "etude",
      };
      addContract(created);
    }
    const followupId = scenarioId === "auto" ? "cot-13" : "cot-1";
    router.push(`/quoting/followup?id=${followupId}`);
  };

  const currentProduct = mockProducts.find((p) => p.id === selectedProduct);
  const ProductIcon = currentProduct?.icon === "car" ? Car : Shield;

  const allAttachments = scenario.emailThread.flatMap((e) => e.attachments);

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-panora-bg">
        {/* Header - 44px */}
        <div className="h-[44px] shrink-0 border-b border-panora-border flex items-center justify-between px-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="text-[12px] text-panora-text-secondary hover:text-panora-text transition-colors"
            >
              ← Retour
            </button>
            <div className="w-px h-[13px] bg-[#d9d9d9]" />
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-panora-green" />
              <span className="text-[12px] font-medium text-panora-text-primary">
                Nouvelle cotation
              </span>
              <span className="text-[12px] text-panora-text-secondary">
                {scenario.cotationId || "COT-XXX"}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-panora-secondary rounded transition-colors text-panora-text-muted hover:text-panora-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title area - full width, border-bottom */}
        <div className="shrink-0 border-b border-panora-border p-6">
          <h1 className="text-2xl text-panora-text-primary font-serif tracking-[-0.24px] leading-7 mb-3">
            Préparer et lancer la cotation
          </h1>
          <p className="text-[13px] text-panora-text-secondary leading-5">
            Rassemblez ici tout ce dont les agents ont besoin pour saisir les
            devis sur les extranets. Documents, notes, emails… l&apos;extraction
            commence automatiquement.
          </p>
        </div>

        {/* Main content: two columns */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Column */}
          <div className="flex-1 border-r border-panora-border overflow-y-auto">
            {/* Email banner section */}
            <div className="bg-white border-b border-panora-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-panora-green flex items-center justify-center shrink-0">
                    <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                      <path d="M7.5 5L0.5 9.33V0.67L7.5 5Z" fill="white" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-panora-text">
                    Cotation initiée par e-mail
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] text-panora-text-secondary">
                    Objet
                  </span>
                  <span className="text-[13px] text-panora-text max-w-[170px] truncate">
                    {scenario.emailThread[0].subject}
                  </span>
                  <button className="flex items-center gap-1.5 text-[12px] font-medium text-panora-green hover:underline">
                    Voir
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist section */}
            <div className="bg-white border-b border-panora-border px-6 py-4">
              <div className="flex items-center gap-2 mb-3.5">
                <ListChecks className="w-5 h-5 text-panora-text-secondary" />
                <span className="text-[13px] font-medium text-panora-text">
                  Pour lancer la cotation
                </span>
              </div>
              <div className="space-y-3.5">
                {stats.missingFields > 0 && (
                  <div className="flex items-center gap-[7px]">
                    <AlertBadge variant="warning" />
                    <span className="text-[13px] text-panora-warning-text">
                      {stats.missingFields} champ{stats.missingFields > 1 ? "s" : ""} requis à compléter
                    </span>
                  </div>
                )}
                {noInsurers && (
                  <div className="flex items-center gap-[7px]">
                    <AlertBadge variant="error" />
                    <span className="text-[13px] text-panora-text-primary">
                      Selectionner assureurs à solliciter (exemple)
                    </span>
                  </div>
                )}
                {stats.invalidFields > 0 && (
                  <div className="flex items-center gap-[7px]">
                    <AlertBadge variant="error" />
                    <span className="text-[13px] text-panora-text-primary">
                      {stats.invalidFields} champ{stats.invalidFields > 1 ? "s" : ""} invalide{stats.invalidFields > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {stats.missingFields === 0 &&
                  stats.invalidFields === 0 &&
                  !noInsurers && (
                    <div className="flex items-center gap-[7px]">
                      <CheckCircle2 className="w-5 h-5 text-panora-green" />
                      <span className="text-[13px] text-panora-green">
                        Tout est prêt pour lancer la cotation
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Form body */}
            <div className="bg-white border-b border-panora-border p-6">
              <h3 className="text-[15px] font-semibold text-panora-text mb-5">
                Projet de cotation
              </h3>

              <div className="space-y-4">
                {/* Nom du projet - half width */}
                <div className="max-w-[50%]">
                  <label className="text-[13px] font-medium text-panora-text block mb-1.5">
                    Nom du projet
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-[13px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green"
                  />
                </div>

                {/* Client - full width */}
                <div>
                  <label className="text-[13px] font-medium text-panora-text-primary block mb-1.5">
                    Client
                  </label>
                  <ClientSelector
                    value={selectedClient}
                    onChange={setSelectedClient}
                  />
                </div>

                {/* Étude — picked at launch so the cotation lands in the right VEOS container */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <label className="text-[13px] font-medium text-panora-text-primary">
                      {erp.container.Singular}
                    </label>
                    <span className="text-[12px] text-panora-text-muted leading-5">
                      Statut <span className="font-medium text-panora-text-secondary">Étude</span> dans {erp.name}
                    </span>
                  </div>
                  {creatingEtude ? (
                    <div className="rounded-lg border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] divide-y divide-panora-border">
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <Plus className="w-3.5 h-3.5 text-panora-green shrink-0" />
                        <span className="text-[13px] font-medium text-panora-text flex-1">
                          Nouvelle {erp.container.singular} dans {erp.name}
                        </span>
                        {clientContracts.some((c) => c.status === "etude") && (
                          <button
                            type="button"
                            onClick={() => {
                              const first = clientContracts.find((c) => c.status === "etude");
                              if (first) setEtudeChoice(first.id);
                            }}
                            className="inline-flex items-center gap-1 text-[12px] font-medium text-panora-text-muted hover:text-panora-text-secondary transition-colors"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            Reprendre une étude existante
                          </button>
                        )}
                      </div>
                      <div className="px-3 py-3 grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[13px] font-medium text-panora-text leading-5">
                            {erp.container.formLabels.title}
                            <span className="text-panora-error ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={newEtude.title}
                            onChange={(e) =>
                              setNewEtude((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder={`${erp.container.Singular} ${productName} 2026`}
                            className="w-full h-9 px-3 bg-white border border-panora-border rounded-md text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green/40 transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-medium text-panora-text leading-5">
                            {erp.container.formLabels.number}
                          </label>
                          <input
                            type="text"
                            value={newEtude.number}
                            onChange={(e) =>
                              setNewEtude((prev) => ({ ...prev, number: e.target.value }))
                            }
                            className="w-full h-9 px-3 bg-white border border-panora-border rounded-md text-[13px] text-panora-text font-mono tabular-nums outline-none focus:border-panora-green/40 transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[13px] font-medium text-panora-text leading-5">
                            {erp.container.formLabels.product}
                          </label>
                          <input
                            type="text"
                            value={newEtude.product}
                            onChange={(e) =>
                              setNewEtude((prev) => ({ ...prev, product: e.target.value }))
                            }
                            placeholder={productName}
                            className="w-full h-9 px-3 bg-white border border-panora-border rounded-md text-[13px] text-panora-text outline-none focus:border-panora-green/40 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <select
                          value={etudeChoice}
                          onChange={(e) => setEtudeChoice(e.target.value)}
                          className="w-full h-10 pl-3 pr-9 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-[13px] text-panora-text outline-none focus:border-panora-green/40 transition-colors appearance-none"
                        >
                          {clientContracts.map((c) => {
                            const badge = erp.container.statuses[c.status];
                            return (
                              <option key={c.id} value={c.id}>
                                {c.label}
                                {badge ? ` · ${badge}` : ""}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-panora-text-muted pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEtudeChoice("new")}
                        className="self-start inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-dashed border-panora-border text-[13px] font-medium text-panora-text hover:bg-panora-secondary/40 hover:border-panora-text-muted/40 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-panora-text-secondary" />
                        Nouvelle {erp.container.singular} dans {erp.name}
                      </button>
                    </div>
                  )}
                </div>

                {/* Produit - full width */}
                <div>
                  <label className="text-[13px] font-medium text-panora-text block mb-1.5">
                    Produit
                  </label>
                  <div className="flex items-center gap-1.5 w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                    <ProductIcon className="w-4 h-4 text-panora-text-muted shrink-0" />
                    <span className="text-[13px] text-panora-text flex-1">
                      {currentProduct?.name || scenario.product}
                    </span>
                    <button
                      onClick={() => setSelectedProduct("")}
                      className="p-0.5 hover:bg-panora-tag rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-panora-text-muted" />
                    </button>
                  </div>
                </div>

                {/* Assureurs - full width */}
                <div>
                  <label className="text-[13px] font-medium text-panora-text-primary block mb-2">
                    Assureurs à solliciter
                  </label>
                  <InsurerSelector
                    selectedIds={selectedInsurers}
                    onToggle={handleToggleInsurer}
                    product={currentProduct?.name || scenario.product}
                    insurers={scenario.availableInsurers}
                  />
                </div>
              </div>
            </div>

            {/* Documents & Instructions */}
            <div className="bg-white p-6">
              <h3 className="text-[15px] font-semibold text-panora-text mb-6">
                Documents & instructions
              </h3>

              {/* Documents sub-section */}
              <div className="mb-5">
                <p className="text-[13px] font-medium text-panora-text-primary mb-1">
                  Documents
                </p>
                <p className="text-[13px] text-panora-text-secondary leading-5 mb-5">
                  Les pièces jointes de l&apos;email sont extraites
                  automatiquement pour remplir les champs à droite.
                  Vous pouvez ajouter d&apos;autres documents.
                </p>

                {/* Document list */}
                <div className="space-y-3">
                  {allAttachments.map((att, i) => (
                    <div key={att.name}>
                      <div className="flex items-center gap-2">
                        <DocIcon />
                        <span className="text-[13px] text-panora-text-primary truncate flex-1">
                          {att.name}
                        </span>
                        <span className="text-[12px] text-panora-text-muted shrink-0 text-right flex-1">
                          {att.fieldsExtracted} champs extraits
                        </span>
                      </div>
                      {i < allAttachments.length - 1 && (
                        <div className="h-px bg-panora-border mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div className="border-2 border-dashed border-panora-border rounded-2xl py-8 px-6 text-center bg-panora-drop hover:border-panora-green/30 transition-colors cursor-pointer mb-6">
                <CloudUpload className="w-8 h-8 text-panora-text-muted mx-auto mb-2" />
                <p className="text-[13px] font-medium text-panora-text">
                  Glissez-déposez vos fichiers ici
                </p>
                <p className="text-[12px] text-panora-text-muted mt-1">
                  ou{" "}
                  <span className="text-panora-green font-medium cursor-pointer hover:underline">
                    parcourir
                  </span>{" "}
                  · Contraintes fichiers, PDF, Images, Word...
                </p>
              </div>

              {/* Instructions */}
              <div>
                <p className="text-[13px] font-medium text-panora-text-primary mb-1">
                  Instructions à l&apos;agent de cotation
                </p>
                <p className="text-[13px] text-panora-text-secondary mb-2 leading-5">
                  Informations supplémentaires non couvertes par les champs à
                  droite.
                  Contexte, préférences, consignes spécifiques.
                </p>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={`Ex: Le client veut absolument moins cher que le contrat actuel\nEx : Privilégier les formules sans franchise dégât des eaux..\nEx : .....`}
                  rows={5}
                  className="w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-[13px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green resize-y placeholder:text-panora-text-muted/60"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Beige background */}
          <div className="flex-1 bg-panora-bg overflow-y-auto">
            <div className="p-6">
              <ExtractedDataPanel
                sections={scenario.extractedSections}
                onSectionsChange={setSections}
              />
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="shrink-0 border-t border-panora-border bg-white px-6 py-3 flex items-center justify-end">
          <button
            onClick={handleLaunch}
            className="btn-primary px-6 py-2.5 text-[13px] font-semibold transition-colors"
          >
            Lancer la cotation
          </button>
        </div>
    </div>
  );
}

export default function PreparationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <p className="text-[13px] text-panora-text-muted">Chargement…</p>
        </div>
      }
    >
      <PreparationContent />
    </Suspense>
  );
}
