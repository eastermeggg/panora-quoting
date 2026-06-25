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
import { DetectionNotice, FieldFlag } from "@/components/quoting/DetectionNotice";
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

type DetectLevel = "ok" | "doubt" | "missing";

/** Test hook: `?hitl=client-doubt,assureurs-missing` (or `all`) simulates the
 *  agent being unsure of, or unable to detect, a left-rail entity — so the broker
 *  is prompted to confirm or fix the choice before launch. */
function parseHitl(param: string | null): {
  client: DetectLevel;
  assureurs: DetectLevel;
} {
  const out: { client: DetectLevel; assureurs: DetectLevel } = {
    client: "ok",
    assureurs: "ok",
  };
  if (!param) return out;
  for (const raw of param.split(",")) {
    const t = raw.trim();
    if (t === "all") {
      out.client = "doubt";
      out.assureurs = "missing";
    } else if (t === "client-doubt") out.client = "doubt";
    else if (t === "client-missing") out.client = "missing";
    else if (t === "assureurs-doubt") out.assureurs = "doubt";
    else if (t === "assureurs-missing") out.assureurs = "missing";
  }
  return out;
}

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

  const hitl = useMemo(() => parseHitl(searchParams.get("hitl")), [searchParams]);

  const [projectName, setProjectName] = useState(scenario.defaultProjectName);
  const [selectedClient, setSelectedClient] = useState<string | null>(
    hitl.client === "missing" ? null : resolveScenarioClientId(scenario.client)
  );
  const [clientDetect, setClientDetect] = useState<DetectLevel>(hitl.client);
  const [selectedProduct, setSelectedProduct] = useState(scenarioId);
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>(
    hitl.assureurs === "missing" ? [] : scenario.defaultSelectedInsurers
  );
  const [assureursDetect, setAssureursDetect] = useState<DetectLevel>(
    hitl.assureurs
  );
  const [instructions, setInstructions] = useState("");
  const [sections, setSections] = useState<ExtractedSection[]>(() =>
    scenario.extractedSections.map((s) => ({ ...s, verified: false }))
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
  // The selector only ever shows études — policies/expired contracts are
  // unrelated containers and shouldn't appear in the cotation picker.
  const clientEtudes = useMemo(
    () => clientContracts.filter((c) => c.status === "etude"),
    [clientContracts]
  );
  // "new" means we'll create a fresh étude on launch — but we never AUTO-enter
  // that state. The broker must click "Créer une étude" explicitly.
  const [etudeChoice, setEtudeChoice] = useState<string>("");
  // Default to a product-matching étude when possible; otherwise the first
  // existing étude for this client. Empty string when nothing exists.
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
  // A doubt is advisory (the field is flagged, but it has a value); only a truly
  // empty entity blocks launch — no client, or no insurers.
  const allChecksPass =
    stats.missingFields === 0 &&
    stats.invalidFields === 0 &&
    stats.unverifiedSections === 0 &&
    !noInsurers &&
    !!selectedClient;

  const handleToggleInsurer = (id: string) => {
    setSelectedInsurers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    // Any deliberate change resolves the agent's uncertainty on this entity.
    setAssureursDetect("ok");
  };

  const handleLaunchClick = () => {
    if (!allChecksPass) return;
    setConfirmOpen(true);
  };

  const handleConfirmLaunch = () => {
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
                  <label className="text-[13px] font-medium text-panora-text-primary mb-1.5 flex items-center gap-2">
                    Client
                    {clientDetect !== "ok" && <FieldFlag level={clientDetect} />}
                  </label>
                  <ClientSelector
                    value={selectedClient}
                    onChange={(v) => {
                      setSelectedClient(v);
                      setClientDetect("ok");
                    }}
                  />
                  {clientDetect === "doubt" && (
                    <DetectionNotice message="L'agent n'est pas certain d'avoir identifié le bon client. Vérifiez ou choisissez le bon." />
                  )}
                  {clientDetect === "missing" && (
                    <DetectionNotice message="L'agent n'a pas pu identifier le client. Sélectionnez-le ci-dessus." />
                  )}
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
                  <label className="text-[13px] font-medium text-panora-text-primary mb-2 flex items-center gap-2">
                    Assureurs à solliciter
                    {assureursDetect !== "ok" && (
                      <FieldFlag level={assureursDetect} />
                    )}
                  </label>
                  <InsurerSelector
                    selectedIds={selectedInsurers}
                    onToggle={handleToggleInsurer}
                    product={currentProduct?.name || scenario.product}
                    insurers={scenario.availableInsurers}
                  />
                  {assureursDetect === "doubt" && (
                    <DetectionNotice message="L'agent a proposé ces assureurs sans certitude. Vérifiez ou ajustez la sélection." />
                  )}
                  {assureursDetect === "missing" && (
                    <DetectionNotice message="L'agent n'a pas pu déterminer les assureurs. Sélectionnez-les ci-dessus." />
                  )}
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
            {/* Panel title */}
            <div className="bg-panora-bg border-b border-panora-border px-6 py-5">
              <h1 className="text-[18px] font-serif text-panora-text tracking-[-0.01em] leading-6">
                Complétez et vérifiez les données de formulaire de cotation
              </h1>
            </div>

            {/* Sticky AI banner — frames the AI-authored data + tracks verification progress */}
            <div className="sticky top-0 z-10 bg-panora-bg px-6 pt-6 pb-3">
              <AiVerificationBanner
                total={stats.totalSections}
                verified={stats.verifiedSections}
              />
            </div>
            <div className="px-6 pb-6">
              <ExtractedDataPanel
                sections={sections}
                onSectionsChange={setSections}
                showHeading={false}
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
            hasClient={!!selectedClient}
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

/* ── Draft chip shown when the broker has committed to creating a new étude ──
   Looks similar to a selected étude, but with edit + cancel actions. */
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

/* ── Footer status text — mirrors the checklist in a one-liner ── */
function FooterStatus({
  allChecksPass,
  stats,
  noInsurers,
  hasClient,
}: {
  allChecksPass: boolean;
  stats: ReturnType<typeof getValidationStats>;
  noInsurers: boolean;
  hasClient: boolean;
}) {
  if (allChecksPass) {
    return (
      <div className="flex items-center gap-1.5 text-[12px] text-panora-green-dark">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Toutes les sections sont vérifiées</span>
      </div>
    );
  }
  type ReasonVariant = "error" | "warning" | "pending";
  const reasons: { label: string; variant: ReasonVariant }[] = [];
  // A missing client blocks launch (a doubt is advisory and stays on the field).
  if (!hasClient)
    reasons.push({ label: "client à sélectionner", variant: "error" });
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
  if (stats.unverifiedSections > 0)
    reasons.push({
      label: `${stats.unverifiedSections} section${stats.unverifiedSections > 1 ? "s" : ""} à vérifier`,
      variant: "pending",
    });
  return (
    <div className="flex items-center gap-2 text-[12px] flex-wrap">
      <span className="text-panora-text-secondary">Avant lancement —</span>
      {reasons.map((r, i) => (
        <Fragment key={r.label}>
          {i > 0 && <span className="text-panora-text-muted/70">·</span>}
          <span className="inline-flex items-center gap-1.5">
            <ReasonMark variant={r.variant} />
            <span
              className={cn(
                r.variant === "error" && "text-panora-error",
                r.variant === "warning" && "text-panora-warning-text",
                r.variant === "pending" && "text-[#75505d]"
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

/* ── Small colored mark for footer reasons — drives visual attention ──
   error/warning use filled badge with white "!"; pending uses the same
   plum-tinted outlined circle as the AI banner accent. */
function ReasonMark({
  variant,
}: {
  variant: "error" | "warning" | "pending";
}) {
  if (variant === "pending") {
    return (
      <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-[#75505d]/60 bg-white" />
    );
  }
  return (
    <span
      className={cn(
        "w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0",
        variant === "warning" ? "bg-panora-warning" : "bg-panora-error"
      )}
    >
      <span className="text-white text-[8px] font-bold leading-none">!</span>
    </span>
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
