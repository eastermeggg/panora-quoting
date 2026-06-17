"use client";

// ─────────────────────────────────────────────────────────────────────────
// PAN-67 · "Version 1" prototype — the typed entry door for creating an
// analysis. The user picks a MODE, then a guided intake collects the
// documents AND a free-text "intention" (what the user actually wants).
//
//   stage: picker → intake
//
// Outputs:
//   • compare → the classic comparison board (synthèse / comparatif).
//   • besoin  → a generated synthèse .md (driven by the intention).
//   • explore → a generated synthèse .md (driven by the intention).
//
// "Générer un document" is NOT an entrance — it's a tool inside the co-pilote
// chat of any analysis. All data is mocked.
// ─────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  X,
  CloudUpload,
  FileText,
  ArrowLeft,
  Plus,
  Sparkles,
  ChevronRight,
  Table2,
  FileSearch,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { ClientSelector } from "@/components/quoting/ClientSelector";
import { CreateClientModal } from "@/components/quoting/CreateClientModal";
import { BesoinTag } from "@/components/ui/BesoinTag";
import { getVeosClient, type VeosClient } from "@/data/clients-mock";
import { isIntegrationConnected } from "@/data/integrations-mock";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────

type Mode = "compare" | "besoin" | "explore" | "generate";

/** Modes whose result is the comparatif-style workspace (artefact + chat). */
export type AnalysisKind = "besoin" | "explore" | "generate";

export type DetectedFile = { name: string; badges: string[]; insurerName?: string };

type LaunchComparisonPayload = {
  client: string;
  clientId: string | null;
  clientSiren: string | null;
  products: string[];
  principalProduct: string | null;
  insurerIds: string[];
  besoinsClient: { id: string; value: string; source: "ai" | "manual" }[];
  skippedProfile: boolean;
};

/** Handed to the page when besoin/explore launch — drives AnalysisWorkspace. */
export type AnalysisWorkspacePayload = {
  kind: AnalysisKind;
  clientName: string;
  intent: string;
  files: DetectedFile[];
  /** Only set for the "generate" kind. */
  product?: string;
};

interface NewAnalysisFlowProps {
  onClose: () => void;
  /** Same signature as ComparisonWizard's onSubmit — called only by compare. */
  onLaunchComparison: (data: LaunchComparisonPayload) => void;
  /** Opens the synthèse workspace — called by besoin & explore. */
  onOpenWorkspace: (payload: AnalysisWorkspacePayload) => void;
}

type Stage = { name: "picker" } | { name: "intake"; mode: Mode };

type BesoinRow = { id: string; value: string; source: "ai" | "manual" };

// ─── Static config ────────────────────────────────────────────────────

const PRODUCTS = [
  "Flotte automobile",
  "RC Pro",
  "RC Exploitation",
  "Décennale",
  "D&O",
  "Multirisque",
];

const SEED_BESOINS_COMPARE: BesoinRow[] = [
  { id: "ai-c1", value: "Protection juridique incluse", source: "ai" },
  { id: "ai-c2", value: "Franchise maximale 1 000€ par sinistre", source: "ai" },
  { id: "ai-c3", value: "Assistance 0 km", source: "ai" },
];

type ModeConfig = {
  mode: Mode;
  icon: LucideIcon;
  title: string;
  description: string;
  breadcrumbLabel: string;
  heading: string;
  subheading: string;
  dropTitle: string;
  addLabel: string;
  intentPlaceholder: string;
  ctaLabel: string;
  minFiles: number;
  mockFiles: DetectedFile[];
  extraFiles?: DetectedFile[];
};

const MODE_CONFIGS: ModeConfig[] = [
  {
    mode: "compare",
    icon: Table2,
    title: "Comparer des devis",
    description: "Vous avez reçu plusieurs devis et voulez les évaluer ensemble.",
    breadcrumbLabel: "Comparer des devis",
    heading: "Comparer des devis",
    subheading: "Déposez les devis à mettre en regard (2 minimum).",
    dropTitle: "Déposez les devis à comparer (2 minimum)",
    addLabel: "Ajouter un devis",
    intentPlaceholder:
      "Ex : Compare ces devis en priorisant la couverture cyber et une franchise basse.",
    ctaLabel: "Lancer la comparaison",
    minFiles: 2,
    mockFiles: [
      { name: "Devis_Axa_Flotte.pdf", badges: ["Devis", "Flotte", "AXA"], insurerName: "Axa" },
      { name: "Devis_Generali_Flotte.pdf", badges: ["Devis", "Flotte", "Generali"], insurerName: "Generali" },
    ],
    extraFiles: [
      { name: "Devis_Allianz_Flotte.pdf", badges: ["Devis", "Flotte", "Allianz"], insurerName: "Allianz" },
    ],
  },
  {
    mode: "besoin",
    icon: ClipboardList,
    title: "Partir d’un besoin",
    description: "Vous partez d’un cahier des charges ou d’un contrat, en amont des devis.",
    breadcrumbLabel: "Partir d’un besoin",
    heading: "Partir d’un besoin",
    subheading: "Déposez un cahier des charges ou un contrat existant.",
    dropTitle: "Déposez un cahier des charges ou un contrat existant",
    addLabel: "Remplacer le document",
    intentPlaceholder:
      "Ex : Vérifie que ce contrat couvre une flotte de 12 véhicules en tous risques, assistance 0 km.",
    ctaLabel: "Générer la synthèse",
    minFiles: 1,
    mockFiles: [
      { name: "Contrat_Flotte_Actuel.pdf", badges: ["Contrat", "Flotte", "AXA"] },
    ],
  },
  {
    mode: "explore",
    icon: FileSearch,
    title: "Interroger des documents",
    description: "Vous cherchez une information précise dans des contrats ou des CG.",
    breadcrumbLabel: "Interroger des documents",
    heading: "Interroger des documents",
    subheading: "Déposez des conditions générales ou des contrats à interroger.",
    dropTitle: "Déposez les CG ou contrats à interroger",
    addLabel: "Ajouter un document",
    intentPlaceholder:
      "Ex : Quelles sont les exclusions et la franchise vol dans ces documents ?",
    ctaLabel: "Générer la synthèse",
    minFiles: 1,
    mockFiles: [
      { name: "CG_Axa_Flotte.pdf", badges: ["Conditions générales", "AXA"] },
      { name: "Contrat_Flotte_2024.pdf", badges: ["Contrat", "Flotte"] },
    ],
    extraFiles: [
      { name: "Fiche_IPID_Flotte.pdf", badges: ["Fiche IPID", "Flotte"] },
    ],
  },
  {
    mode: "generate",
    icon: FileText,
    title: "Générer un document",
    description: "Vous avez un seul devis à transformer en document pour le client.",
    breadcrumbLabel: "Générer un document",
    heading: "Générer un document",
    subheading: "Déposez un devis ; décrivez le document à produire.",
    dropTitle: "Déposez le devis à transformer",
    addLabel: "Remplacer le document",
    intentPlaceholder:
      "Ex : Rédige une fiche produit synthétique d’une page pour le client.",
    ctaLabel: "Générer le document",
    minFiles: 1,
    mockFiles: [
      { name: "Devis_Axa_Flotte.pdf", badges: ["Devis", "Flotte", "AXA"], insurerName: "Axa" },
    ],
  },
];

const MODE_BY_KEY: Record<Mode, ModeConfig> = MODE_CONFIGS.reduce(
  (acc, c) => ({ ...acc, [c.mode]: c }),
  {} as Record<Mode, ModeConfig>,
);

// ─── Component ────────────────────────────────────────────────────────

export function NewAnalysisFlow({
  onClose,
  onLaunchComparison,
  onOpenWorkspace,
}: NewAnalysisFlowProps) {
  const [stage, setStage] = useState<Stage>({ name: "picker" });

  // Intake state (seeded per mode on selection; reset on mode switch).
  const [files, setFiles] = useState<DetectedFile[]>([]);
  const [extraUsed, setExtraUsed] = useState(false);
  const [intent, setIntent] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>("marble");
  const [besoins, setBesoins] = useState<BesoinRow[]>([]);
  const [newBesoin, setNewBesoin] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [detected, setDetected] = useState(false);

  // Inline client creation — swap overlays to avoid a double backdrop.
  const [createClientState, setCreateClientState] = useState<{ initialName: string } | null>(null);

  const currentMode: Mode | null = stage.name === "picker" ? null : stage.mode;
  const config = currentMode ? MODE_BY_KEY[currentMode] : null;

  // ── Stage transitions ──
  const goToPicker = () => setStage({ name: "picker" });

  const selectMode = (mode: Mode) => {
    // Client & product start empty — they're detected once documents are dropped.
    setFiles([]);
    setExtraUsed(false);
    setDetected(false);
    setIntent("");
    setNewBesoin("");
    setSelectedProduct("");
    setSelectedClientId(null);
    setBesoins(mode === "compare" ? SEED_BESOINS_COMPARE : []);
    setStage({ name: "intake", mode });
  };

  // ── Document detection (mock) ──
  const handleDetect = () => {
    if (!config) return;
    setFiles(config.mockFiles);
    // Client & product are detected from the dropped documents.
    setSelectedClientId("marble");
    setSelectedProduct("Flotte automobile");
    setDetected(true);
  };
  const handleAddMore = () => {
    if (!config?.extraFiles) return;
    setFiles((prev) => [...prev, ...config.extraFiles!]);
    setExtraUsed(true);
  };
  const canAddMore =
    !!config?.extraFiles?.length && !extraUsed && files.length > 0;

  // ── Besoins editing (compare only) ──
  const addBesoin = () => {
    const value = newBesoin.trim();
    if (!value) return;
    setBesoins((prev) => [
      ...prev,
      { id: `manual-${Date.now()}`, value, source: "manual" },
    ]);
    setNewBesoin("");
  };
  const removeBesoin = (id: string) =>
    setBesoins((prev) => prev.filter((b) => b.id !== id));

  // ── Launch ──
  // besoin/explore require an intention (it drives the synthèse); compare does not.
  const canLaunch =
    !!config &&
    files.length >= config.minFiles &&
    (config.mode === "compare" || intent.trim().length > 0);

  const clientName =
    (selectedClientId ? getVeosClient(selectedClientId)?.name : null) ??
    "le client";

  const handleLaunch = () => {
    if (!config || !canLaunch) return;
    if (config.mode === "compare") {
      const client = selectedClientId ? getVeosClient(selectedClientId) : null;
      onLaunchComparison({
        client: client?.name ?? "",
        clientId: selectedClientId,
        clientSiren: client?.siren ?? null,
        products: [selectedProduct],
        principalProduct: selectedProduct,
        insurerIds: files
          .filter((f) => f.insurerName)
          .map((f) => f.insurerName!.toLowerCase()),
        besoinsClient: besoins.map((b) => ({
          id: b.id,
          value: b.value,
          source: b.source,
        })),
        skippedProfile: false,
      });
      onClose();
      return;
    }
    // besoin / explore / generate → comparatif-style workspace
    onOpenWorkspace({
      kind: config.mode,
      clientName,
      intent: intent.trim(),
      files,
      product: selectedProduct || undefined,
    });
    onClose();
  };

  const handleClientCreated = (client: VeosClient) => {
    setSelectedClientId(client.id);
    setCreateClientState(null);
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/30",
          createClientState && "hidden",
        )}
      >
        <div className="w-[600px] max-h-[800px] bg-white rounded-[16px] flex flex-col shadow-xl overflow-hidden">
          {/* Header / breadcrumb */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-panora-bg border-b border-panora-border">
            <div className="flex items-center gap-2 min-w-0">
              {stage.name === "picker" ? (
                <>
                  <Sparkles className="w-4 h-4 text-panora-green" />
                  <span className="text-[15px] font-medium text-panora-text font-serif">
                    Nouvelle analyse
                  </span>
                </>
              ) : (
                <>
                  <button
                    onClick={goToPicker}
                    className="flex items-center gap-1.5 text-[13px] text-panora-text-muted hover:text-panora-text transition-colors shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Nouvelle analyse
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
                  <span className="text-[15px] font-medium text-panora-text font-serif truncate">
                    {config?.breadcrumbLabel}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/60 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-panora-text-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
            {stage.name === "picker" ? (
              <ModePicker onSelect={selectMode} />
            ) : (
              config && (
                <IntakeView
                  config={config}
                  files={files}
                  canAddMore={canAddMore}
                  detected={detected}
                  onDetect={handleDetect}
                  onAddMore={handleAddMore}
                  intent={intent}
                  onIntentChange={setIntent}
                  selectedClientId={selectedClientId}
                  onClientChange={setSelectedClientId}
                  onRequestCreateClient={(initialName) =>
                    setCreateClientState({ initialName })
                  }
                  besoins={besoins}
                  newBesoin={newBesoin}
                  onNewBesoinChange={setNewBesoin}
                  onAddBesoin={addBesoin}
                  onRemoveBesoin={removeBesoin}
                  selectedProduct={selectedProduct}
                  onProductChange={setSelectedProduct}
                />
              )
            )}
          </div>

          {/* Footer (intake only) */}
          {stage.name === "intake" && config && (
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-t border-panora-border bg-white">
              <button
                onClick={goToPicker}
                className="flex items-center gap-1.5 text-[13px] text-panora-text-muted hover:text-panora-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
              <button
                onClick={handleLaunch}
                disabled={!canLaunch}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                {config.ctaLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {createClientState && (
        <CreateClientModal
          veosConnected={isIntegrationConnected("veos")}
          initialName={createClientState.initialName}
          onCancel={() => setCreateClientState(null)}
          onCreated={handleClientCreated}
        />
      )}
    </>
  );
}

// ─── Stage: mode picker (A.2) ─────────────────────────────────────────

function ModePicker({ onSelect }: { onSelect: (mode: Mode) => void }) {
  return (
    <div>
      <h2 className="text-[20px] font-serif text-panora-text">
        Choisissez votre point de départ
      </h2>
      <p className="text-[13px] text-panora-text-muted leading-5 mt-1">
        Le type d’analyse détermine les documents attendus et le livrable
        produit.
      </p>

      <div className="space-y-2.5 mt-4">
        {MODE_CONFIGS.map((c) => (
          <ModeCard key={c.mode} config={c} onClick={() => onSelect(c.mode)} />
        ))}
      </div>
    </div>
  );
}

function ModeCard({ config, onClick }: { config: ModeConfig; onClick: () => void }) {
  const Icon = config.icon;
  return (
    <button
      onClick={onClick}
      className="group w-full text-left flex items-center gap-4 bg-white border border-panora-border rounded-[12px] p-4 hover:border-panora-green/40 hover:bg-panora-bg hover:shadow-[0px_2px_8px_rgba(0,0,0,0.04)] transition-all"
    >
      <div className="w-10 h-10 rounded-[8px] bg-panora-green-light flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-panora-green-dark" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-panora-text">
          {config.title}
        </div>
        <div className="text-[12px] text-panora-text-secondary mt-0.5 leading-[16px]">
          {config.description}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-panora-text-muted/0 group-hover:text-panora-text-muted shrink-0 transition-colors" />
    </button>
  );
}

// ─── Stage: per-mode intake (A.3) ─────────────────────────────────────

function IntakeView({
  config,
  files,
  canAddMore,
  detected,
  onDetect,
  onAddMore,
  intent,
  onIntentChange,
  selectedClientId,
  onClientChange,
  onRequestCreateClient,
  besoins,
  newBesoin,
  onNewBesoinChange,
  onAddBesoin,
  onRemoveBesoin,
  selectedProduct,
  onProductChange,
}: {
  config: ModeConfig;
  files: DetectedFile[];
  canAddMore: boolean;
  detected: boolean;
  onDetect: () => void;
  onAddMore: () => void;
  intent: string;
  onIntentChange: (v: string) => void;
  selectedClientId: string | null;
  onClientChange: (id: string | null) => void;
  onRequestCreateClient: (initialName: string) => void;
  besoins: BesoinRow[];
  newBesoin: string;
  onNewBesoinChange: (v: string) => void;
  onAddBesoin: () => void;
  onRemoveBesoin: (id: string) => void;
  selectedProduct: string;
  onProductChange: (p: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[20px] font-serif text-panora-text">
          {config.heading}
        </h2>
        <p className="text-[13px] text-panora-text-muted leading-5 mt-1">
          {config.subheading}
        </p>
      </div>

      <DocumentDropZone
        files={files}
        dropTitle={config.dropTitle}
        addLabel={config.addLabel}
        canAddMore={canAddMore}
        onDetect={onDetect}
        onAddMore={onAddMore}
      />

      {/* Client & product — present in every flow, auto-detected on drop */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text="Client" detected={detected} />
        <ClientSelector
          value={selectedClientId}
          onChange={onClientChange}
          onRequestCreate={onRequestCreateClient}
        />
      </div>

      <ProductSelect
        value={selectedProduct}
        onChange={onProductChange}
        detected={detected}
      />

      {/* Intention — captured in every flow */}
      <IntentField
        value={intent}
        onChange={onIntentChange}
        placeholder={config.intentPlaceholder}
      />

      {config.mode === "compare" && (
        <BesoinsBlock
          besoins={besoins}
          input={newBesoin}
          onInput={onNewBesoinChange}
          onAdd={onAddBesoin}
          onRemove={onRemoveBesoin}
        />
      )}
    </div>
  );
}

function IntentField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1.5">
        <label className="text-[13px] font-medium text-panora-text">
          Votre intention
        </label>
        <span className="text-[11px] text-panora-text-muted">
          ce que vous attendez de l’analyse
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] px-3 py-2 text-[13px] leading-[20px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green transition-colors resize-none"
      />
    </div>
  );
}

function DocumentDropZone({
  files,
  dropTitle,
  addLabel,
  canAddMore,
  onDetect,
  onAddMore,
}: {
  files: DetectedFile[];
  dropTitle: string;
  addLabel: string;
  canAddMore: boolean;
  onDetect: () => void;
  onAddMore: () => void;
}) {
  if (files.length === 0) {
    return (
      <button
        onClick={onDetect}
        className="w-full rounded-[12px] border-2 border-dashed border-panora-border bg-gradient-to-b from-[rgba(34,32,26,0.05)] to-transparent p-8 flex flex-col items-center gap-3 hover:border-panora-text-muted transition-colors cursor-pointer"
      >
        <CloudUpload className="w-8 h-8 text-panora-text-muted" />
        <span className="text-[13px] text-panora-text-muted text-center">
          {dropTitle}
        </span>
        <span className="text-[13px] font-medium text-panora-green">
          + Ajouter vos documents
        </span>
      </button>
    );
  }
  return (
    <div className="space-y-2">
      {files.map((f, i) => (
        <DetectedFileRow key={i} file={f} />
      ))}
      {canAddMore && (
        <button
          onClick={onAddMore}
          className="flex items-center gap-2 text-[13px] text-panora-green font-medium mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      )}
    </div>
  );
}

function DetectedFileRow({ file }: { file: DetectedFile }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-[8px] px-3 py-2 border border-panora-border">
      <FileText className="w-4 h-4 text-panora-text-muted shrink-0" />
      <span className="text-[13px] text-panora-text flex-1 truncate">
        {file.name}
      </span>
      <span className="inline-flex items-center h-5 px-2 rounded-full bg-panora-secondary text-[12px] text-panora-text-muted shrink-0">
        {file.badges.join(" · ")}
      </span>
    </div>
  );
}

function FieldLabel({ text, detected }: { text: string; detected: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="text-[13px] font-medium text-panora-text-secondary leading-5">
        {text}
      </label>
      {detected && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-panora-green">
          <Sparkles className="w-3 h-3" />
          détecté
        </span>
      )}
    </div>
  );
}

function ProductSelect({
  value,
  onChange,
  detected,
}: {
  value: string;
  onChange: (v: string) => void;
  detected: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel text="Produit" detected={detected} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 px-3 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-[13px] text-panora-text outline-none focus:border-panora-green/40 transition-colors"
      >
        <option value="" disabled>
          À détecter…
        </option>
        {PRODUCTS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}

function BesoinsBlock({
  besoins,
  input,
  onInput,
  onAdd,
  onRemove,
}: {
  besoins: BesoinRow[];
  input: string;
  onInput: (v: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const aiCount = besoins.filter((b) => b.source === "ai").length;
  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <label className="text-[13px] font-medium text-panora-text">
          Besoins du client
        </label>
        <span className="inline-flex items-center gap-1 text-[11px] text-panora-text-muted">
          <Sparkles className="w-3 h-3 text-panora-green" />
          critères pour évaluer chaque offre
        </span>
      </div>

      <div className="space-y-2">
        {besoins.map((b) => (
          <BesoinTag
            key={b.id}
            value={b.value}
            source={b.source}
            onRemove={() => onRemove(b.id)}
          />
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder="Ajoutez un besoin. Ex : Couverture monde entier…"
          className="w-full bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] px-3 py-2 min-h-[36px] text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green transition-colors"
        />
      </div>

      {aiCount > 0 && (
        <p className="mt-2 text-[12px] text-panora-green flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {aiCount} éléments détectés automatiquement
        </p>
      )}
    </div>
  );
}
