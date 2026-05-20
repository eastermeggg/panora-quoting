"use client";

import { Fragment, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CheckCircle2,
  Car,
  Shield,
  ExternalLink,
  X,
  CloudUpload,
  FileText,
  FolderOpen,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerSelector } from "@/components/quoting/InsurerSelector";
import { ClientSelector } from "@/components/quoting/ClientSelector";
import { EtudeSelector } from "@/components/quoting/EtudeSelector";
import { CreateEtudeModal } from "@/components/quoting/CreateEtudeModal";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { AiVerificationBanner } from "@/components/quoting/AiVerificationBanner";
import { LaunchConfirmModal } from "@/components/quoting/LaunchConfirmModal";
import { getScenario, getValidationStats, scenarios } from "@/data/scenarios";
import type { ExtractedSection } from "@/data/scenarios";
import {
  addContract,
  getClientContracts,
  veosClients,
  type VeosContract,
} from "@/data/clients-mock";
import { getActiveErpAdapter } from "@/data/erp-adapters";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [etudeModalOpen, setEtudeModalOpen] = useState(false);

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
  const clientEtudes = useMemo(
    () => clientContracts.filter((c) => c.status === "etude"),
    [clientContracts]
  );
  const [etudeChoice, setEtudeChoice] = useState<string>("");
  useMemo(() => {
    if (!selectedClient) return;
    const match = clientEtudes.find(
      (c) => c.product.toLowerCase() === productName.toLowerCase()
    );
    setEtudeChoice(match?.id ?? clientEtudes[0]?.id ?? "");
  }, [selectedClient, productName, clientEtudes]);
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

  // No per-section verification gate in this variant — the modal carries the
  // attestation. Launch only requires fields-valid + insurers selected.
  const allChecksPass =
    stats.missingFields === 0 && stats.invalidFields === 0 && !noInsurers;

  const handleToggleInsurer = (id: string) => {
    setSelectedInsurers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleLaunchClick = () => {
    if (!allChecksPass) return;
    setConfirmOpen(true);
  };

  const handleConfirmLaunch = () => {
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
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase text-panora-text-muted bg-panora-tag/60">
                Variante · Modal seul
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

            {/* Form body */}
            <div className="bg-white border-b border-panora-border p-6">
              <h3 className="text-[15px] font-semibold text-panora-text mb-5">
                Projet de cotation
              </h3>

              <div className="space-y-4">
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

                <div>
                  <label className="text-[13px] font-medium text-panora-text-primary block mb-1.5">
                    Client
                  </label>
                  <ClientSelector
                    value={selectedClient}
                    onChange={setSelectedClient}
                  />
                </div>

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
                    <EtudeDraftChip
                      newEtude={newEtude}
                      erpName={erp.name}
                      singular={erp.container.singular}
                      onEdit={() => setEtudeModalOpen(true)}
                      onCancel={() =>
                        setEtudeChoice(clientEtudes[0]?.id ?? "")
                      }
                    />
                  ) : (
                    <EtudeSelector
                      value={etudeChoice}
                      onChange={setEtudeChoice}
                      onCreate={() => setEtudeModalOpen(true)}
                      contracts={clientEtudes}
                      statusLabels={erp.container.statuses}
                      singular={erp.container.singular}
                    />
                  )}
                </div>

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

              <div className="mb-5">
                <p className="text-[13px] font-medium text-panora-text-primary mb-1">
                  Documents
                </p>
                <p className="text-[13px] text-panora-text-secondary leading-5 mb-5">
                  Les pièces jointes de l&apos;email sont extraites
                  automatiquement pour remplir les champs à droite.
                  Vous pouvez ajouter d&apos;autres documents.
                </p>

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
            {/* Panel title */}
            <div className="bg-panora-bg border-b border-panora-border px-6 py-5">
              <h1 className="text-[18px] font-serif text-panora-text tracking-[-0.01em] leading-6">
                Complétez et vérifiez les données de formulaire de cotation
              </h1>
            </div>

            {/* AI banner — frames the responsibility, no progress strip here */}
            <div className="px-6 pt-6 pb-3">
              <AiVerificationBanner
                total={0}
                verified={0}
                showProgress={false}
              />
            </div>
            <div className="px-6 pb-6">
              <ExtractedDataPanel
                sections={sections}
                onSectionsChange={setSections}
                showHeading={false}
                showVerification={false}
              />
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="shrink-0 border-t border-panora-border bg-white px-6 py-3 flex items-center justify-between gap-4">
          <FooterStatus
            allChecksPass={allChecksPass}
            stats={stats}
            noInsurers={noInsurers}
          />
          <button
            onClick={handleLaunchClick}
            disabled={!allChecksPass}
            className={cn(
              "btn-primary px-6 py-2.5 text-[13px] font-semibold transition-all",
              !allChecksPass && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
            aria-disabled={!allChecksPass}
          >
            Lancer la cotation
          </button>
        </div>

        <LaunchConfirmModal
          open={confirmOpen}
          requireAcknowledgment
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmLaunch}
        />

        <CreateEtudeModal
          open={etudeModalOpen}
          initial={newEtude}
          productPlaceholder={productName}
          singular={erp.container.singular}
          erpName={erp.name}
          formLabels={erp.container.formLabels}
          hasExistingEtudes={clientEtudes.length > 0}
          onBack={() => {
            const first = clientEtudes[0];
            if (first) setEtudeChoice(first.id);
            setEtudeModalOpen(false);
          }}
          onCancel={() => setEtudeModalOpen(false)}
          onCreate={(values) => {
            setNewEtude(values);
            setEtudeChoice("new");
            setEtudeModalOpen(false);
          }}
        />
    </div>
  );
}

/* ── Draft chip — same as preparation/page.tsx ── */
function EtudeDraftChip({
  newEtude,
  erpName,
  singular,
  onEdit,
  onCancel,
}: {
  newEtude: { title: string; number: string; product: string };
  erpName: string;
  singular: string;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const title = newEtude.title.trim() || `Nouvelle ${singular}`;
  const subtitle = newEtude.number
    ? `${newEtude.number} · Sera créée dans ${erpName}`
    : `Sera créée dans ${erpName}`;
  return (
    <div className="flex items-center gap-3 h-12 px-3 bg-white border border-panora-green-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-panora-green-light border border-panora-green-border text-panora-green-dark">
        <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="text-[13px] font-medium text-panora-text truncate">
          {title}
        </span>
        <span className="text-[11px] text-panora-text-muted truncate">
          {subtitle}
        </span>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center justify-center w-6 h-6 rounded-md text-panora-text-muted hover:bg-panora-secondary hover:text-panora-text-secondary transition-colors"
        aria-label="Modifier"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center justify-center w-6 h-6 rounded-md text-panora-text-muted hover:bg-panora-secondary hover:text-panora-text-secondary transition-colors"
        aria-label="Annuler la création"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Footer status — no "à vérifier" reasons in this variant ── */
function FooterStatus({
  allChecksPass,
  stats,
  noInsurers,
}: {
  allChecksPass: boolean;
  stats: ReturnType<typeof getValidationStats>;
  noInsurers: boolean;
}) {
  if (allChecksPass) {
    return (
      <div className="flex items-center gap-1.5 text-[12px] text-panora-green-dark">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Prêt à lancer</span>
      </div>
    );
  }
  type ReasonVariant = "error" | "warning";
  const reasons: { label: string; variant: ReasonVariant }[] = [];
  if (stats.invalidFields > 0)
    reasons.push({
      label: `${stats.invalidFields} champ${stats.invalidFields > 1 ? "s" : ""} invalide${stats.invalidFields > 1 ? "s" : ""}`,
      variant: "error",
    });
  if (stats.missingFields > 0)
    reasons.push({
      label: `${stats.missingFields} champ${stats.missingFields > 1 ? "s" : ""} à compléter`,
      variant: "warning",
    });
  if (noInsurers)
    reasons.push({ label: "assureurs à sélectionner", variant: "error" });
  return (
    <div className="flex items-center gap-2 text-[12px] flex-wrap">
      <span className="text-panora-text-secondary">Avant lancement —</span>
      {reasons.map((r, i) => (
        <Fragment key={r.label}>
          {i > 0 && <span className="text-panora-text-muted/70">·</span>}
          <span className="inline-flex items-center gap-1.5">
            <span
              className={cn(
                "w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0",
                r.variant === "warning" ? "bg-panora-warning" : "bg-panora-error"
              )}
            >
              <span className="text-white text-[8px] font-bold leading-none">!</span>
            </span>
            <span
              className={cn(
                r.variant === "error" && "text-panora-error",
                r.variant === "warning" && "text-panora-warning-text"
              )}
            >
              {r.label}
            </span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}

export default function PreparationModalOnlyPage() {
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
