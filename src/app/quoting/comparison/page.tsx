"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getFollowupData,
  getComparisonData,
  getAnalysisData,
  getClientProfile,
  updateClientProfile,
  buildContextPills,
  comparisonTasks,
  currentUser,
} from "@/data/mock";
import type { ComparisonData, ComparisonTask, CellIdentifier, CellDetail, InsurerData, ExclusionRow, AnalysisSyntheseItem, AnalysisData, ClientProfileData } from "@/data/mock";
import { ComparisonWizard } from "@/components/quoting/ComparisonWizard";
import { DetailPanel } from "@/components/quoting/DetailPanel";
import { ClientProfilePanel } from "@/components/quoting/ClientProfilePanel";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { ComparisonTable } from "@/components/quoting/ComparisonTable";
import { ComparisonSynthesis, buildDefaultSynthese } from "@/components/quoting/ComparisonSynthesis";
import { ComparisonChat } from "@/components/quoting/ComparisonChat";
import { FinaliserDropdown } from "@/components/quoting/FinaliserDropdown";
import { DevoirConseilWizard } from "@/components/quoting/DevoirConseilWizard";
import {
  SendToVeosModal,
  type SendToVeosState,
} from "@/components/quoting/SendToVeosModal";
import { getSynthesisOverride, setSynthesisOverride } from "@/data/chatMock";
import { isIntegrationConnected } from "@/data/integrations-mock";
import { loadBranding } from "@/data/branding";
import {
  downloadSynthesePdf,
  downloadSyntheseDocx,
  previewSynthesePdf,
} from "@/lib/export";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileSearch,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Search,
  MoreVertical,
} from "lucide-react";

function downloadMockFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── List View ───────────────────────────────────────────────────────

function ComparisonListView() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [, setTick] = useState(0);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const rerender = useCallback(() => {
    if (mountedRef.current) setTick((t) => t + 1);
  }, []);

  const inProgress = [...comparisonTasks]
    .filter((t) => t.status === "in_progress")
    .sort((a, b) => parseFrDate(b.date) - parseFrDate(a.date));
  const done = [...comparisonTasks]
    .filter((t) => t.status === "done")
    .sort((a, b) => parseFrDate(b.date) - parseFrDate(a.date));

  const markRead = useCallback((taskId: string) => {
    const task = comparisonTasks.find((t) => t.id === taskId);
    if (task?.isUnread) {
      task.isUnread = false;
      rerender();
    }
  }, [rerender]);

  const handleWizardSubmit = (data: { client: string; clientId: string | null; clientSiren: string | null; products: string[]; principalProduct: string | null; insurerIds: string[]; besoinsClient: { id: string; value: string; source: "ai" | "manual" }[] }) => {
    const cotationId = "cot-1";
    const taskId = `cmp-${Date.now()}`;
    // Update client profile with wizard besoins
    updateClientProfile(cotationId, {
      clientLabel: data.client,
      clientSiren: data.clientSiren ?? "—",
      besoinsClient: data.besoinsClient,
    });
    // Add new in_progress task (unshift so it's found first by detail view)
    comparisonTasks.unshift({
      id: taskId,
      cotationId,
      client: data.client,
      products: data.products,
      principalProduct: data.principalProduct,
      insurerIds: data.insurerIds,
      createdBy: currentUser.name,
      date: new Date().toLocaleDateString("fr-FR"),
      status: "in_progress",
    });
    setWizardOpen(false);
    rerender();

    // Simulate analysis completing — row jumps from "En cours" to "Terminé"
    // with the unread highlight until the user opens it.
    window.setTimeout(() => {
      const task = comparisonTasks.find((t) => t.id === taskId);
      if (task) {
        task.status = "done";
        task.isUnread = true;
      }
      rerender();
    }, 5500);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      {/* Header */}
      <div className="shrink-0 border-b border-[#e5e7eb] bg-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Search className="w-[17px] h-[17px] text-panora-text-muted" />
          <h1 className="text-[15px] font-medium text-panora-text font-serif">
            Assistant comparaison
          </h1>
        </div>
        <button onClick={() => setWizardOpen(true)} className="btn-primary flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium">
          <Sparkles className="w-4 h-4" />
          Nouvelle comparaison
        </button>
      </div>

      {/* Column headers */}
      <div className="shrink-0 border-b border-panora-border h-[35px] flex items-center bg-white">
        <div className="flex-1 min-w-0 px-4 text-[12px] text-panora-text-muted">Client</div>
        <div className="flex-1 min-w-0 px-4 text-[12px] text-panora-text-muted">Produits</div>
        <div className="flex-1 min-w-0 px-4 text-[12px] text-panora-text-muted">Assureurs</div>
        <div className="w-[140px] shrink-0 px-4 text-[12px] text-panora-text-muted">Réalisé par</div>
        <div className="w-[100px] shrink-0 px-4 text-[12px] text-panora-text-muted">Date</div>
        <div className="w-[180px] shrink-0 px-4 text-[12px] text-panora-text-muted">Progrès</div>
        <div className="w-10 shrink-0" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* In progress */}
        {inProgress.length > 0 && (
          <>
            <StatusGroupHeader label="En cours" color="bg-[#be93e4]" bgColor="bg-[#fbf7fe]" />
            {inProgress.map((task) => (
              <TaskRow key={task.id} task={task} onOpen={markRead} />
            ))}
            <div className="h-1.5 border-y border-panora-border" />
          </>
        )}

        {/* Done */}
        {done.length > 0 && (
          <>
            <StatusGroupHeader label="Terminé" color="bg-[#94ce9a]" bgColor="bg-[#f5fbf5]" />
            {done.map((task) => (
              <TaskRow key={task.id} task={task} onOpen={markRead} />
            ))}
          </>
        )}
      </div>

      {wizardOpen && (
        <ComparisonWizard
          onClose={() => setWizardOpen(false)}
          onSubmit={handleWizardSubmit}
        />
      )}
    </div>
  );
}

/** Parse "DD/MM/YYYY" into a sortable timestamp. Returns 0 when malformed. */
function parseFrDate(date: string): number {
  const [d, m, y] = date.split("/").map((n) => Number.parseInt(n, 10));
  if (!d || !m || !y) return 0;
  return new Date(y, m - 1, d).getTime();
}

const productLabelMap: Record<string, string> = {
  "Flotte automobile": "Flotte Auto.",
  "Flotte automobile (stock)": "Flotte Auto. (stock)",
  "Auto": "Auto.",
  "Prévoyance / AT": "Prev/AT",
  "Accident du Travail": "AT",
};

function shortProductLabel(product: string): string {
  return productLabelMap[product] ?? product;
}

function StatusGroupHeader({ label, color, bgColor }: { label: string; color: string; bgColor: string }) {
  return (
    <div className={`${bgColor} px-4 py-2`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-[12px] font-medium text-panora-text">{label}</span>
      </div>
    </div>
  );
}

function TaskRow({ task, onOpen }: { task: ComparisonTask; onOpen: (taskId: string) => void }) {
  const maxVisible = 2;
  const visibleInsurers = task.insurerIds.slice(0, maxVisible);
  const extraCount = task.insurerIds.length - maxVisible;
  // Map insurer id to name
  const insurerNames: Record<string, string> = {
    axa: "Axa", allianz: "Allianz", generali: "Generali", chubb: "Chubb", maif: "MAIF",
  };
  const isUnread = task.status === "done" && task.isUnread === true;

  return (
    <div
      className={cn(
        "group flex items-center bg-white border-b border-panora-border border-l-2 hover:bg-panora-bg/30 transition-colors",
        isUnread ? "border-l-panora-green" : "border-l-transparent"
      )}
    >
      {/* Client */}
      <div className="flex-1 min-w-0 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[6px] bg-panora-green/20 border border-black/10 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-panora-green">{task.client.charAt(0)}</span>
          </div>
          <span
            className={cn(
              "text-[13px] text-panora-text truncate",
              isUnread ? "font-semibold" : "font-medium"
            )}
          >
            {task.client}
          </span>
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 min-w-0 px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {task.products.map((p) => (
            <span
              key={p}
              title={p}
              className="inline-flex items-center h-5 px-2 rounded-full text-[11.5px] font-medium leading-4 bg-panora-secondary/70 text-panora-text-secondary"
            >
              {shortProductLabel(p)}
            </span>
          ))}
        </div>
      </div>

      {/* Insurers */}
      <div className="flex-1 min-w-0 px-4 py-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleInsurers.map((id) => (
            <span key={id} className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-panora-secondary text-[12px] text-panora-text-muted">
              <InsurerLogo insurerId={id} name={insurerNames[id] ?? id} size="sm" className="w-3 h-3 rounded-full" />
              {insurerNames[id] ?? id}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="inline-flex h-5 items-center px-2 rounded-full bg-panora-secondary text-[12px] text-panora-text-muted">
              +{extraCount}
            </span>
          )}
        </div>
      </div>

      {/* Created by */}
      <div className="w-[140px] shrink-0 px-4 py-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-4 h-4 rounded-full bg-panora-green/20 flex items-center justify-center shrink-0">
            <span className="text-[8px] font-bold text-panora-green">{task.createdBy.charAt(0)}</span>
          </div>
          <span className="text-[13px] text-panora-text-muted truncate">{task.createdBy}</span>
        </div>
      </div>

      {/* Date */}
      <div className="w-[100px] shrink-0 px-4 py-4">
        <span className="text-[13px] text-panora-text-muted whitespace-nowrap">{task.date}</span>
      </div>

      {/* Progress */}
      <div className="w-[180px] shrink-0 px-4 py-4">
        {task.status === "in_progress" ? (
          <div className="inline-flex items-center gap-1.5 h-[25px] px-2.5 rounded-full bg-panora-secondary">
            <Loader2 className="w-3.5 h-3.5 text-panora-text-muted animate-spin" />
            <span className="text-[12px] text-panora-text-muted whitespace-nowrap">
              En analyse <span className="font-medium">&lt; 1 min</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isUnread && (
              <span className="inline-flex items-center px-2 h-5 rounded-full text-[11px] font-medium leading-4 bg-panora-green-light text-panora-green-dark whitespace-nowrap group-hover:hidden">
                Nouveau
              </span>
            )}
            <Link
              href={`/quoting/comparison?id=${task.cotationId}`}
              onClick={() => onOpen(task.id)}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-green opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity whitespace-nowrap"
            >
              Voir le comparatif
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-10 shrink-0 flex items-center justify-center">
        <button className="p-1 rounded hover:bg-panora-bg transition-colors">
          <MoreVertical className="w-4 h-4 text-panora-text-muted" />
        </button>
      </div>
    </div>
  );
}

// ─── Detail View ─────────────────────────────────────────────────────

type AgentPhase =
  | "idle"
  | "reading_documents"
  | "extracting_guarantees"
  | "building_comparison"
  | "ready";

const PHASE_DURATIONS: Partial<Record<AgentPhase, number>> = {
  reading_documents: 1800,
  extracting_guarantees: 1400,
  building_comparison: 800,
};

function getCellDetail(
  cellId: CellIdentifier,
  data: ComparisonData | undefined,
  insurers: InsurerData[],
): CellDetail | null {
  if (cellId.type === "guarantee" && data) {
    // Flatten products → subGroups into a flat section list for backward-compatible indexing
    const flatSections = data.products?.flatMap((p) => p.subGroups) ?? data.sections ?? [];
    const section = flatSections[cellId.sectionIndex];
    if (!section) return null;
    const row = section.rows[cellId.rowIndex];
    if (!row) return null;
    const detail = row.details?.[cellId.insurerId];
    if (detail) return detail;
    // Fallback: build a minimal detail from cell value
    const cell = row.values[cellId.insurerId];
    const ins = insurers.find((i) => i.id === cellId.insurerId);
    return {
      title: row.label,
      covered: cell?.type !== "cross",
      insurerId: cellId.insurerId,
      insurerName: ins?.name ?? cellId.insurerId,
      description: "",
      cellType: "guarantee",
      mainLimit: "1 500 €",
      mainDeductible: "5 000 €",
      subLimits: [],
      sources: [],
    };
  }
  if (cellId.type === "price") {
    const ins = insurers.find((i) => i.id === cellId.insurerId);
    if (!ins?.pricing || ins.pricing.length === 0) return null;
    return {
      title: "Tarification",
      covered: true,
      insurerId: cellId.insurerId,
      insurerName: ins.name,
      description: "",
      cellType: "price",
      pricingRows: ins.pricing.map((formula, idx) => ({
        id: `pr-${idx}`,
        offerLabel: formula.formula,
        price: formula.details[0]?.value ?? "",
        conditions: formula.details[1]?.value ?? "",
      })),
      sources: [],
    };
  }
  if (cellId.type === "exclusion" && data?.exclusions) {
    const row = data.exclusions.find((r) => r.id === cellId.exclusionId);
    if (!row) return null;
    const detail = row.details?.[cellId.insurerId];
    if (detail) return detail;
    const cellVal = row.values[cellId.insurerId];
    const ins = insurers.find((i) => i.id === cellId.insurerId);
    return {
      title: row.label,
      covered: cellVal?.type === "inclus",
      insurerId: cellId.insurerId,
      insurerName: ins?.name ?? cellId.insurerId,
      description: "",
      cellType: "exclusion",
      origin: row.origin,
      exclusionId: row.id,
      subLimits: [],
      sources: [],
    };
  }
  return null;
}

function cellIdKey(c: CellIdentifier): string {
  if (c.type === "guarantee") return `g-${c.sectionIndex}-${c.rowIndex}-${c.insurerId}`;
  if (c.type === "price") return `p-${c.insurerId}`;
  return `e-${c.exclusionId}-${c.insurerId}`;
}

function ComparisonDetailView({ cotParamId }: { cotParamId: string }) {
  const router = useRouter();
  const followupData = getFollowupData(cotParamId);

  // Check if this comparison is already done (persisted)
  const task = comparisonTasks.find((t) => t.cotationId === cotParamId);
  const alreadyDone = task?.status === "done";

  const [agentPhase, setAgentPhase] = useState<AgentPhase>(alreadyDone ? "ready" : "idle");
  const [comparisonResult, setComparisonResult] = useState<ComparisonData | undefined>(
    alreadyDone ? getComparisonData(cotParamId) : undefined
  );
  const [selectedCell, setSelectedCell] = useState<CellIdentifier | null>(null);
  const [cellDisplayModes, setCellDisplayModes] = useState<Record<string, boolean>>({});
  const [mutableInsurers, setMutableInsurers] = useState<InsurerData[]>(followupData?.insurers ?? []);
  const [activeTab, setActiveTab] = useState<"comparison" | "analysis">("analysis");
  const [chatOpen, setChatOpen] = useState(true);
  const [fleetViewMode, setFleetViewMode] = useState<"garanties" | "tarifs">("garanties");
  const isMultiEntity = !!comparisonResult?.multiEntity;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mutableProfile, setMutableProfile] = useState<ClientProfileData>(
    () => getClientProfile(cotParamId) ?? { clientLabel: followupData?.cotation.client ?? "", clientSiren: "", besoinsClient: [] as import("@/data/mock").BesoinItem[] }
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<import("@/data/mock").DynamicFieldValues>(
    () => getComparisonData(cotParamId)?.dynamicFieldValues ?? {}
  );
  const hasClientProfile = mutableProfile.besoinsClient.filter((b) => b.value.trim()).length > 0;

  // ── Devoir de conseil wizard ──
  const [devoirWizardOpen, setDevoirWizardOpen] = useState(false);

  // ── Send-to-VEOS post-export prompt ──
  // Only surfaces when VEOS is connected; otherwise the export happens silently.
  const [exportToast, setExportToast] = useState<SendToVeosState | null>(null);
  const wrapExport = useCallback(
    (label: string, run: () => void) => () => {
      run();
      if (isIntegrationConnected("veos")) {
        setExportToast({ status: "prompt", label });
      }
    },
    []
  );
  const handleSendToVeos = useCallback(() => {
    setExportToast((prev) =>
      prev ? { status: "sending", label: prev.label } : prev
    );
    // Simulate ERP round-trip.
    window.setTimeout(() => {
      setExportToast((prev) =>
        prev ? { status: "sent", label: prev.label } : prev
      );
    }, 1100);
  }, []);

  const openProfile = useCallback(() => {
    setSelectedCell(null);
    setIsProfileOpen(true);
  }, []);

  const handleProfileSave = useCallback((updated: ClientProfileData) => {
    setMutableProfile(updated);
    setIsProfileOpen(false);
    setMutableAnalysis((prev) => {
      if (!prev) return prev;
      const { pills, hasFullContext } = buildContextPills(updated, prev.contextPills);
      return { ...prev, contextPills: pills, hasFullContext };
    });
    setIsStreaming(true);
  }, []);

  const startAgent = useCallback(() => {
    const phases: AgentPhase[] = ["reading_documents", "extracting_guarantees", "building_comparison", "ready"];
    let i = 0;
    const advance = () => {
      if (i < phases.length) {
        const phase = phases[i];
        setAgentPhase(phase);
        if (phase === "ready") {
          setComparisonResult(getComparisonData(cotParamId));
          setIsStreaming(true);
          return;
        }
        i++;
        setTimeout(advance, PHASE_DURATIONS[phase] ?? 1000);
      }
    };
    advance();
  }, [cotParamId]);

  useEffect(() => {
    if (alreadyDone) return;
    const timer = setTimeout(startAgent, 400);
    return () => clearTimeout(timer);
  }, [startAgent, alreadyDone]);

  const handleCellUpdate = useCallback((cellId: CellIdentifier, updatedDetail: CellDetail) => {
    if (cellId.type === "guarantee") {
      setComparisonResult((prev) => {
        if (!prev) return prev;
        // Update through nested products → subGroups using flat sectionIndex
        let flatIdx = 0;
        const products = (prev.products ?? []).map((product) => ({
          ...product,
          subGroups: product.subGroups.map((sg) => {
            const currentIdx = flatIdx++;
            if (currentIdx !== cellId.sectionIndex) return sg;
            const rows = sg.rows.map((row, rIdx) => {
              if (rIdx !== cellId.rowIndex) return row;
              const currentCell = row.values[cellId.insurerId];
              let newCell = currentCell;
              if (updatedDetail.covered && currentCell?.type === "cross") {
                newCell = { type: "check" };
              } else if (!updatedDetail.covered && currentCell?.type !== "cross") {
                newCell = { type: "cross" };
              }
              return {
                ...row,
                values: { ...row.values, [cellId.insurerId]: newCell },
                details: { ...row.details, [cellId.insurerId]: updatedDetail },
              };
            });
            return { ...sg, rows };
          }),
        }));
        return { ...prev, products };
      });
    } else if (cellId.type === "price") {
      // Update mutableInsurers pricing from all pricingRows
      setMutableInsurers((prev) =>
        prev.map((ins) => {
          if (ins.id !== cellId.insurerId) return ins;
          if (!updatedDetail.pricingRows) return ins;
          const pricing = updatedDetail.pricingRows.map((row) => ({
            formula: row.offerLabel,
            details: [
              { label: "Prime annuelle", value: row.price },
              { label: "Prime mensuelle", value: row.conditions },
            ],
          }));
          return { ...ins, pricing };
        })
      );
    } else if (cellId.type === "exclusion") {
      setComparisonResult((prev) => {
        if (!prev?.exclusions) return prev;
        const exclusions = prev.exclusions.map((row) => {
          if (row.id !== cellId.exclusionId) return row;
          // Update cell value based on covered toggle
          const currentCell = row.values[cellId.insurerId];
          let newCell = currentCell;
          if (updatedDetail.covered && currentCell?.type !== "inclus") {
            newCell = { type: "inclus" };
          } else if (!updatedDetail.covered && currentCell?.type !== "exclu") {
            newCell = { type: "exclu" };
          }
          return {
            ...row,
            label: updatedDetail.title || row.label,
            values: { ...row.values, [cellId.insurerId]: newCell },
            details: { ...row.details, [cellId.insurerId]: updatedDetail },
          };
        });
        return { ...prev, exclusions };
      });
    }
  }, []);

  const handleAddManualExclusion = useCallback((): string => {
    const newId = `excl-m-${Date.now()}`;
    const newRow: ExclusionRow = {
      id: newId,
      label: "",
      origin: "manual",
      values: Object.fromEntries(mutableInsurers.map((ins) => [ins.id, { type: "exclu" as const }])),
    };
    setComparisonResult((prev) => {
      if (!prev) return prev;
      return { ...prev, exclusions: [...(prev.exclusions ?? []), newRow] };
    });
    return newId;
  }, [mutableInsurers]);

  const handleUpdateExclusionLabel = useCallback((exclusionId: string, label: string) => {
    setComparisonResult((prev) => {
      if (!prev?.exclusions) return prev;
      return {
        ...prev,
        exclusions: prev.exclusions.map((r) =>
          r.id === exclusionId ? { ...r, label } : r
        ),
      };
    });
  }, []);

  const handleDiscardExclusion = useCallback((exclusionId: string) => {
    setComparisonResult((prev) => {
      if (!prev?.exclusions) return prev;
      return { ...prev, exclusions: prev.exclusions.filter((r) => r.id !== exclusionId) };
    });
  }, []);

  const handleDeleteExclusion = useCallback((exclusionId: string) => {
    setComparisonResult((prev) => {
      if (!prev?.exclusions) return prev;
      return { ...prev, exclusions: prev.exclusions.filter((r) => r.id !== exclusionId) };
    });
    setSelectedCell(null);
  }, []);

  const handlePanelClose = useCallback(() => {
    setSelectedCell(null);
  }, []);

  const handleToggleCellDisplayMode = useCallback((cellId: CellIdentifier) => {
    const key = cellIdKey(cellId);
    setCellDisplayModes((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  if (!followupData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[13px] text-panora-text-muted">Cotation introuvable.</p>
      </div>
    );
  }

  const { cotation } = followupData;
  const clientName = cotation.client;
  const totalDocs = mutableInsurers.reduce((sum, ins) => sum + (ins.documents?.length ?? 0), 0);

  const currentDetail = selectedCell ? getCellDetail(selectedCell, comparisonResult, mutableInsurers) : null;
  const analysisData = getAnalysisData(cotParamId);
  const [mutableSynthese, setMutableSynthese] = useState<AnalysisSyntheseItem[]>(analysisData?.synthese ?? []);
  const [mutableAnalysis, setMutableAnalysis] = useState<AnalysisData | undefined>(() => {
    if (!analysisData) return undefined;
    const initProfile = getClientProfile(cotParamId);
    if (!initProfile) return analysisData;
    const { pills, hasFullContext } = buildContextPills(initProfile, analysisData.contextPills);
    return { ...analysisData, contextPills: pills, hasFullContext };
  });

  const handleUpdateSynthese = useCallback((updated: AnalysisSyntheseItem[]) => {
    setMutableSynthese(updated);
  }, []);

  const handleUpdateAnalysis = useCallback((updated: AnalysisData) => {
    setMutableAnalysis(updated);
  }, []);

  const recommendedInsurerId = mutableInsurers.find((ins) => ins.status === "completed")?.id ?? null;
  const productLabel = task?.principalProduct ?? cotation.product ?? "votre couverture";

  const [syntheseContent, setSyntheseContentState] = useState<string>(() => {
    const override = getSynthesisOverride(cotParamId);
    if (override.content) return override.content;
    return buildDefaultSynthese({
      clientName: cotation.client,
      productLabel,
      insurers: mutableInsurers,
      recommendedInsurerId,
      besoinsClient: mutableProfile.besoinsClient,
      comparisonData: comparisonResult,
      analysisData: mutableAnalysis,
    });
  });
  const updateSyntheseContent = useCallback(
    (next: string) => {
      setSyntheseContentState(next);
      setSynthesisOverride(cotParamId, { content: next });
    },
    [cotParamId]
  );

  return (
    <div className="flex-1 flex min-h-0 min-w-0">
      {/* Left column: header + content (chat spans full page height alongside this column) */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
      {/* Header */}
      <div className="h-[52px] shrink-0 border-b border-panora-border flex items-center justify-between px-4 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-panora-bg transition-colors text-panora-text-muted hover:text-panora-text"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] text-panora-text-muted">Comparaisons</span>
          <span className="text-[13px] text-panora-text-muted">/</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-panora-green/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-panora-green">{clientName.charAt(0)}</span>
            </div>
            <span className="text-[13px] font-medium text-panora-text">{clientName}</span>
          </div>
          <button onClick={openProfile} className="text-[12px] font-medium text-panora-green ml-1">Voir profil client</button>
          <div className="w-px h-4 bg-[#d9d9d9] ml-2" />
          <Link
            href={`/quoting/followup?id=${cotParamId}`}
            className="flex items-center gap-1.5 text-[12px] text-panora-text-muted hover:text-panora-text transition-colors ml-1"
          >
            <span className="text-panora-text-secondary">{cotation.cotationId}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <FinaliserDropdown
          clientName={mutableProfile.clientLabel || followupData?.cotation.client}
          productLabel={productLabel}
          presentationUrl={`/presentation/${cotParamId}`}
          onPreviewSynthesePDF={() =>
            previewSynthesePdf({
              branding: loadBranding(),
              clientName: mutableProfile.clientLabel || cotation.client || "Client",
              productLabel,
              syntheseMarkdown: syntheseContent,
            })
          }
          onDownloadSynthesePDF={wrapExport("Synthèse.pdf", () =>
            downloadSynthesePdf({
              branding: loadBranding(),
              clientName: mutableProfile.clientLabel || cotation.client || "Client",
              productLabel,
              syntheseMarkdown: syntheseContent,
            })
          )}
          onDownloadSyntheseDocx={wrapExport("Synthèse.docx", () =>
            downloadSyntheseDocx({
              branding: loadBranding(),
              clientName: mutableProfile.clientLabel || cotation.client || "Client",
              productLabel,
              syntheseMarkdown: syntheseContent,
            })
          )}
          onDownloadTableauXLS={wrapExport("Tableau comparatif.xlsx", () =>
            downloadMockFile(
              `${cotation.client} - Tableau comparatif.xlsx`,
              "Tableau comparatif — export XLS (démo)"
            )
          )}
          onGenerateDevoirConseil={() => setDevoirWizardOpen(true)}
        />
      </div>

      {agentPhase !== "ready" ? (
        <AgentLoadingState phase={agentPhase} insurerCount={mutableInsurers.length} documentCount={totalDocs} />
      ) : (
        <div className="flex-1 flex min-h-0 min-w-0">
          {/* Left column: tab bar + tab content */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            {/* Tab bar */}
            <div className="h-[44px] shrink-0 border-b border-panora-border bg-white px-4 flex items-end justify-between">
              <div className="flex items-end">
                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`px-3 pb-2.5 text-[13px] transition-colors border-b-2 flex items-center gap-1.5 ${
                    activeTab === "analysis"
                      ? "border-panora-green text-panora-green font-medium"
                      : "border-transparent text-panora-text-muted hover:text-panora-text"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Synthèse
                </button>
                <button
                  onClick={() => setActiveTab("comparison")}
                  className={`px-3 pb-2.5 text-[13px] transition-colors border-b-2 ${
                    activeTab === "comparison"
                      ? "border-panora-green text-panora-green font-medium"
                      : "border-transparent text-panora-text-muted hover:text-panora-text"
                  }`}
                >
                  Tableau comparatif
                </button>
              </div>
              {!chatOpen && (
                <div className="flex items-center gap-1.5 mb-2">
                  <button
                    onClick={() => setChatOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 h-[26px] rounded-md text-[12px] font-medium text-panora-text-muted hover:text-panora-text hover:bg-panora-bg transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Copilote
                  </button>
                </div>
              )}
            </div>

            {/* Tab content */}
            <div className="flex-1 flex min-h-0">
              {activeTab === "comparison" ? (
                <div className="flex-1 flex min-h-0 min-w-0">
                  <div
                    className="flex-1 overflow-auto min-w-0"
                    onClick={() => setSelectedCell(null)}
                  >
                    <ComparisonTable
                      insurers={mutableInsurers}
                      comparisonData={comparisonResult}
                      cotParamId={cotParamId}
                      fleetViewMode={isMultiEntity ? fleetViewMode : undefined}
                      onFleetViewChange={isMultiEntity ? setFleetViewMode : undefined}
                      selectedCell={selectedCell}
                      onCellSelect={(cell) => { setIsProfileOpen(false); setSelectedCell(cell); }}
                      onAddExclusion={handleAddManualExclusion}
                      onUpdateExclusionLabel={handleUpdateExclusionLabel}
                      onDiscardExclusion={handleDiscardExclusion}
                      cellDisplayModes={cellDisplayModes}
                      onOpenProfile={openProfile}
                      dynamicFieldValues={dynamicFieldValues}
                      principalProduct={task?.principalProduct ?? null}
                    />
                  </div>
                  {isProfileOpen ? (
                    <ClientProfilePanel
                      profile={mutableProfile}
                      dynamicFields={comparisonResult?.dynamicFields}
                      dynamicFieldValues={dynamicFieldValues}
                      onDynamicFieldChange={(id, value) => setDynamicFieldValues((prev) => ({ ...prev, [id]: value }))}
                      contextPills={mutableAnalysis?.contextPills}
                      onSave={handleProfileSave}
                      onClose={() => setIsProfileOpen(false)}
                    />
                  ) : selectedCell && currentDetail ? (
                    <DetailPanel
                      cellDetail={currentDetail}
                      onUpdate={(detail) => handleCellUpdate(selectedCell, detail)}
                      onClose={handlePanelClose}
                      onDelete={
                        selectedCell.type === "exclusion" && currentDetail.origin === "manual"
                          ? () => handleDeleteExclusion(selectedCell.exclusionId)
                          : undefined
                      }
                      showKeyDetail={cellDisplayModes[cellIdKey(selectedCell)] ?? false}
                      onToggleDisplayMode={() => handleToggleCellDisplayMode(selectedCell)}
                    />
                  ) : null}
                </div>
              ) : (
                <div className="flex-1 flex min-h-0 min-w-0">
                  <ComparisonSynthesis
                    insurers={mutableInsurers}
                    recommendedInsurerId={recommendedInsurerId}
                    productLabel={productLabel}
                    clientName={cotation.client}
                    content={syntheseContent}
                    onContentChange={updateSyntheseContent}
                    onPreviewPdf={() =>
                      previewSynthesePdf({
                        branding: loadBranding(),
                        clientName: mutableProfile.clientLabel || cotation.client || "Client",
                        productLabel,
                        syntheseMarkdown: syntheseContent,
                      })
                    }
                  />
                  {isProfileOpen && (
                    <ClientProfilePanel
                      profile={mutableProfile}
                      contextPills={mutableAnalysis?.contextPills}
                      onSave={handleProfileSave}
                      onClose={() => setIsProfileOpen(false)}
                      dynamicFields={comparisonResult?.dynamicFields}
                      dynamicFieldValues={dynamicFieldValues}
                      onDynamicFieldChange={(id, value) => setDynamicFieldValues((prev) => ({ ...prev, [id]: value }))}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Full-page-height chat — sibling of the header+content column, spans top to bottom */}
      {chatOpen && (
        <ComparisonChat
          cotParamId={cotParamId}
          insurers={mutableInsurers}
          productLabel={productLabel}
          recommendedInsurerId={recommendedInsurerId}
          syntheseContent={syntheseContent}
          onAcceptContentEdit={updateSyntheseContent}
          onClose={() => setChatOpen(false)}
        />
      )}

      {devoirWizardOpen && (
        <DevoirConseilWizard
          insurers={mutableInsurers}
          profile={mutableProfile}
          principalProduct={task?.principalProduct ?? null}
          onClose={() => setDevoirWizardOpen(false)}
          onSubmit={() => {
            wrapExport("Devoir de conseil.pdf", () => {
              downloadMockFile(
                `${cotation.client} - Devoir de conseil.pdf`,
                "Devoir de conseil — export PDF (démo)"
              );
            })();
            setDevoirWizardOpen(false);
          }}
        />
      )}

      {exportToast && (
        <SendToVeosModal
          state={exportToast}
          clientName={mutableProfile.clientLabel || cotation.client}
          onDismiss={() => setExportToast(null)}
          onSend={handleSendToVeos}
        />
      )}
    </div>
  );
}

function AgentLoadingState({ phase, insurerCount, documentCount }: { phase: AgentPhase; insurerCount: number; documentCount: number }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-panora-bg">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="bg-white border border-panora-border rounded-[10px] p-8 shadow-[0px_3px_6px_0px_rgba(0,0,0,0.02),0px_11px_11px_0px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col items-center text-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[#dbeee5] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-panora-green" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-panora-text font-serif mb-1">Agent de comparaison</h3>
              <p className="text-[13px] text-panora-text-muted leading-5">
                Analyse de {documentCount} document{documentCount > 1 ? "s" : ""} reçus de {insurerCount} assureur{insurerCount > 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-full space-y-3 text-left">
              <StepRow label="Lecture des documents" icon={<FileSearch className="w-4 h-4" />} status={phase === "reading_documents" ? "active" : phase === "idle" ? "pending" : "done"} />
              <StepRow label="Extraction des garanties" icon={<FileSearch className="w-4 h-4" />} status={phase === "extracting_guarantees" ? "active" : (phase === "idle" || phase === "reading_documents") ? "pending" : "done"} />
              <StepRow label="Construction du comparatif" icon={<Sparkles className="w-4 h-4" />} status={phase === "building_comparison" ? "active" : phase === "ready" ? "done" : "pending"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepRow({ label, icon, status }: { label: string; icon: React.ReactNode; status: "pending" | "active" | "done" }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${status === "done" ? "bg-[#dbeee5] text-panora-green" : status === "active" ? "bg-panora-green text-white" : "bg-panora-bg text-panora-text-muted"}`}>
        {status === "done" ? <CheckCircle2 className="w-4 h-4" /> : status === "active" ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      </div>
      <span className={`text-[13px] ${status === "done" ? "text-panora-green font-medium" : status === "active" ? "text-panora-text font-medium" : "text-panora-text-muted"}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Router ──────────────────────────────────────────────────────────

function ComparisonRouter() {
  const searchParams = useSearchParams();
  const cotParamId = searchParams.get("id");

  if (cotParamId) {
    return <ComparisonDetailView cotParamId={cotParamId} />;
  }

  return <ComparisonListView />;
}

export default function ComparisonPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <p className="text-[13px] text-panora-text-muted">Chargement...</p>
        </div>
      }
    >
      <ComparisonRouter />
    </Suspense>
  );
}
