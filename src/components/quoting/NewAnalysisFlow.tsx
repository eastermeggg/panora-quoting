"use client";

// ─────────────────────────────────────────────────────────────────────────
// The typed entry door for creating an analysis. TWO entrances only:
//
//   • Analyse de contrat — drop the contract + annexes (CG, avenants…), pick
//     an OBJECTIVE (analyse complète by default, or a focused lens) and
//     optionally precise it in free text → generated synthèse workspace.
//   • Comparer des offres — the classic comparison intake (devis 2+, besoins
//     client) → comparison board.
//
//   stage: picker → intake (3 steps: Documents → Client & produit →
//   Objectif [analyse] / Besoins [compare])
//
// Interroger des documents / générer un document are NOT entrances — they're
// covered by the analyse objective + the co-pilote chat inside any analysis.
// All data is mocked.
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
  Check,
  Table2,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import { ClientSelector } from "@/components/quoting/ClientSelector";
import { CreateClientModal } from "@/components/quoting/CreateClientModal";
import { BesoinTag } from "@/components/ui/BesoinTag";
import { getVeosClient, type VeosClient } from "@/data/clients-mock";
import { isIntegrationConnected } from "@/data/integrations-mock";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────

type Mode = "compare" | "besoin";

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
  /** Skip the picker and open directly on a mode's intake (e.g. from Bienvenue). */
  initialMode?: Mode;
}

type Stage = { name: "picker" } | { name: "intake"; mode: Mode; step: number };

/** Step labels per mode — same skeleton, only the last step differs. */
const STEP_LABELS: Record<Mode, string[]> = {
  besoin: ["Documents", "Client & produit", "Objectif"],
  compare: ["Documents", "Client & produit", "Besoins"],
};

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
    mode: "besoin",
    icon: ScanSearch,
    title: "Analyse de contrat",
    description:
      "Décortiquez un contrat ou des CG : garanties, exclusions, plafonds, franchises.",
    breadcrumbLabel: "Analyse de contrat",
    heading: "Analyse de contrat",
    subheading:
      "Déposez le contrat et ses annexes (CG, conditions particulières, avenants…).",
    dropTitle: "Déposez le contrat et ses annexes",
    addLabel: "Ajouter un document",
    intentPlaceholder:
      "Ex : Vérifie que ce contrat couvre une flotte de 12 véhicules en tous risques, assistance 0 km.",
    ctaLabel: "Lancer l’analyse",
    minFiles: 1,
    mockFiles: [
      { name: "Contrat_Flotte_Actuel.pdf", badges: ["Contrat", "Flotte", "AXA"] },
      { name: "CG_Axa_Flotte.pdf", badges: ["Conditions générales", "AXA"] },
    ],
    extraFiles: [
      { name: "Avenant_Flotte_2025.pdf", badges: ["Avenant", "Flotte"] },
    ],
  },
  {
    mode: "compare",
    icon: Table2,
    title: "Comparer des offres",
    description:
      "Vous avez reçu plusieurs devis ou offres et voulez les évaluer ensemble.",
    breadcrumbLabel: "Comparer des offres",
    heading: "Comparer des offres",
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
];

// ── Analyse objectives — what the agent should verify. "Analyse complète" is
// the default so the broker can launch in two clicks; the focused lenses seed
// the intent driving the synthèse. Free text refines whichever is picked.
type Objective = { id: string; label: string; intent: string };

const OBJECTIVES: Objective[] = [
  {
    id: "complete",
    label: "Analyse complète",
    intent:
      "Analyse complète du contrat : garanties, exclusions, plafonds et franchises, points de vigilance.",
  },
  {
    id: "garanties",
    label: "Garanties & exclusions",
    intent: "Détaille les garanties couvertes et les exclusions du contrat.",
  },
  {
    id: "plafonds",
    label: "Plafonds & franchises",
    intent: "Relève les plafonds d’indemnisation et les franchises applicables.",
  },
  {
    id: "vigilance",
    label: "Points de vigilance",
    intent:
      "Identifie les points de vigilance : trous de garantie, conditions restrictives, délais de carence.",
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
  initialMode,
}: NewAnalysisFlowProps) {
  // From Bienvenue we skip the picker and land on the right intake directly.
  const [stage, setStage] = useState<Stage>(
    initialMode
      ? { name: "intake", mode: initialMode, step: 0 }
      : { name: "picker" }
  );

  // Intake state (seeded per mode on selection; reset on mode switch).
  const [files, setFiles] = useState<DetectedFile[]>([]);
  const [extraUsed, setExtraUsed] = useState(false);
  const [intent, setIntent] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>("marble");
  const [besoins, setBesoins] = useState<BesoinRow[]>(
    initialMode === "compare" ? SEED_BESOINS_COMPARE : []
  );
  const [newBesoin, setNewBesoin] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [detected, setDetected] = useState(false);
  // Analyse objective — "complete" by default so launch needs only documents.
  const [objective, setObjective] = useState<string>("complete");

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
    setObjective("complete");
    setBesoins(mode === "compare" ? SEED_BESOINS_COMPARE : []);
    setStage({ name: "intake", mode, step: 0 });
  };

  // ── Step navigation ──
  const step = stage.name === "intake" ? stage.step : 0;
  const lastStep = 2;

  // Per-step gate: documents first, then the detected client/produit; the
  // final step is always launchable (the objective defaults to "complete",
  // and compare's besoins are optional).
  const stepValid = (s: number): boolean => {
    if (!config) return false;
    if (s === 0) return files.length >= config.minFiles;
    if (s === 1) return !!selectedClientId && !!selectedProduct;
    return true;
  };

  const goNext = () => {
    if (stage.name !== "intake" || !stepValid(stage.step)) return;
    setStage({ ...stage, step: Math.min(stage.step + 1, lastStep) });
  };
  const goBack = () => {
    if (stage.name !== "intake") return;
    if (stage.step === 0) goToPicker();
    else setStage({ ...stage, step: stage.step - 1 });
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
  // Documents are the only requirement: the analyse objective defaults to
  // "Analyse complète", so the broker can launch in two clicks.
  const canLaunch = !!config && files.length >= config.minFiles;

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
    // Analyse de contrat → synthèse workspace. The intent = the picked
    // objective, refined by the optional free text.
    const objectiveIntent =
      OBJECTIVES.find((o) => o.id === objective)?.intent ?? "";
    onOpenWorkspace({
      kind: config.mode,
      clientName,
      intent: [objectiveIntent, intent.trim()].filter(Boolean).join(" "),
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
          "fixed inset-0 z-50 flex items-center justify-center bg-black/40",
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
                  step={step}
                  files={files}
                  canAddMore={canAddMore}
                  detected={detected}
                  onDetect={handleDetect}
                  onAddMore={handleAddMore}
                  objective={objective}
                  onObjectiveChange={setObjective}
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

          {/* Footer (intake only) — Retour + Continuer / launch on last step */}
          {stage.name === "intake" && config && (
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-t border-panora-border bg-white">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-[13px] text-panora-text-muted hover:text-panora-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
              {step < lastStep ? (
                <button
                  onClick={goNext}
                  disabled={!stepValid(step)}
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuer
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleLaunch}
                  disabled={!canLaunch}
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  {config.ctaLabel}
                </button>
              )}
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
        Que souhaitez-vous faire&nbsp;?
      </h2>
      <p className="text-[13px] text-panora-text-muted leading-5 mt-1">
        Analysez un contrat en profondeur, ou mettez plusieurs offres en
        regard.
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
  step,
  files,
  canAddMore,
  detected,
  onDetect,
  onAddMore,
  objective,
  onObjectiveChange,
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
  step: number;
  files: DetectedFile[];
  canAddMore: boolean;
  detected: boolean;
  onDetect: () => void;
  onAddMore: () => void;
  objective: string;
  onObjectiveChange: (id: string) => void;
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
  // Per-step heading; step 0 uses the mode's own heading/subheading.
  const stepHeading: [string, string] =
    step === 0
      ? [config.heading, config.subheading]
      : step === 1
        ? [
            "Client & produit",
            "Vérifiez les informations détectées depuis vos documents.",
          ]
        : config.mode === "besoin"
          ? [
              "Objectif de l’analyse",
              "Choisissez ce que l’agent doit vérifier — précisez si besoin.",
            ]
          : [
              "Besoins du client",
              "L’intention et les critères guident la comparaison.",
            ];

  return (
    <div className="space-y-5">
      <Stepper labels={STEP_LABELS[config.mode]} current={step} />

      <div>
        <h2 className="text-[20px] font-serif text-panora-text">
          {stepHeading[0]}
        </h2>
        <p className="text-[13px] text-panora-text-muted leading-5 mt-1">
          {stepHeading[1]}
        </p>
      </div>

      {/* Step 1 — documents */}
      {step === 0 && (
        <DocumentDropZone
          files={files}
          dropTitle={config.dropTitle}
          addLabel={config.addLabel}
          canAddMore={canAddMore}
          onDetect={onDetect}
          onAddMore={onAddMore}
        />
      )}

      {/* Step 2 — client & product, auto-detected on drop */}
      {step === 1 && (
        <>
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
        </>
      )}

      {/* Step 3 — objective (analyse) / besoins (compare) */}
      {step === 2 &&
        (config.mode === "besoin" ? (
          <>
            <ObjectivesBlock value={objective} onChange={onObjectiveChange} />
            <IntentField
              value={intent}
              onChange={onIntentChange}
              placeholder={config.intentPlaceholder}
              label="Précisez votre demande"
              hint="optionnel — affine l’objectif choisi"
            />
          </>
        ) : (
          <>
            <IntentField
              value={intent}
              onChange={onIntentChange}
              placeholder={config.intentPlaceholder}
            />
            <BesoinsBlock
              besoins={besoins}
              input={newBesoin}
              onInput={onNewBesoinChange}
              onAdd={onAddBesoin}
              onRemove={onRemoveBesoin}
            />
          </>
        ))}
    </div>
  );
}

/* Compact wizard stepper — numbered circles + labels, green for the active
 * step, a check for completed ones. */
function Stepper({ labels, current }: { labels: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2.5">
      {labels.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <div key={label} className="flex items-center gap-2.5 min-w-0">
            {i > 0 && <span className="h-px w-5 shrink-0 bg-panora-border" />}
            <span className="flex items-center gap-1.5 min-w-0">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  isDone
                    ? "bg-panora-green text-white"
                    : isActive
                      ? "bg-[#173c2d] text-white"
                      : "bg-panora-secondary text-panora-text-muted"
                )}
              >
                {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cn(
                  "truncate text-[12px] font-medium",
                  isActive ? "text-panora-text" : "text-panora-text-muted"
                )}
              >
                {label}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ObjectivesBlock({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-panora-text">
        Que doit vérifier l’agent&nbsp;?
      </label>
      <div className="flex flex-wrap gap-2">
        {OBJECTIVES.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                active
                  ? "border-[rgba(0,162,114,0.4)] bg-panora-green-light text-panora-green-dark"
                  : "border-panora-border bg-white text-panora-text-secondary hover:bg-panora-drop"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IntentField({
  value,
  onChange,
  placeholder,
  label = "Votre intention",
  hint = "ce que vous attendez de l’analyse",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1.5">
        <label className="text-[13px] font-medium text-panora-text">
          {label}
        </label>
        <span className="text-[11px] text-panora-text-muted">{hint}</span>
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
