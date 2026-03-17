"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getFollowupData,
  getComparisonData,
  getAnalysisData,
  getClientProfile,
  buildContextPills,
  comparisonTasks,
  currentUser,
} from "@/data/mock";
import type { ComparisonData, ComparisonTask, CellIdentifier, CellDetail, InsurerData, ExclusionRow, AnalysisSyntheseItem, AnalysisData, ClientProfileData } from "@/data/mock";
import { DetailPanel } from "@/components/quoting/DetailPanel";
import { ClientProfilePanel } from "@/components/quoting/ClientProfilePanel";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { ComparisonTable } from "@/components/quoting/ComparisonTable";
import { AnalysisTab } from "@/components/quoting/AnalysisTab";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FileSignature,
  Loader2,
  FileSearch,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Search,
  MoreVertical,
} from "lucide-react";

// ─── List View ───────────────────────────────────────────────────────

function ComparisonListView() {
  const inProgress = comparisonTasks.filter((t) => t.status === "in_progress");
  const done = comparisonTasks.filter((t) => t.status === "done");

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
        <button className="btn-primary flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium">
          <Sparkles className="w-4 h-4" />
          Nouvelle comparaison
        </button>
      </div>

      {/* Column headers */}
      <div className="shrink-0 border-b border-panora-border h-[35px] flex items-center bg-white">
        <div className="flex-1 px-4 text-[12px] text-panora-text-muted">Client</div>
        <div className="flex-1 px-4 text-[12px] text-panora-text-muted">Produits</div>
        <div className="flex-1 px-4 text-[12px] text-panora-text-muted">Assureurs</div>
        <div className="flex-1 px-4 text-[12px] text-panora-text-muted">Réalisé par</div>
        <div className="flex-1 px-4 text-[12px] text-panora-text-muted">Date</div>
        <div className="flex-1 px-4 text-[12px] text-panora-text-muted">Progrès</div>
        <div className="w-10 shrink-0" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* In progress */}
        {inProgress.length > 0 && (
          <>
            <StatusGroupHeader label="En cours" color="bg-[#be93e4]" bgColor="bg-[#fbf7fe]" />
            {inProgress.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
            <div className="h-1.5 border-y border-panora-border" />
          </>
        )}

        {/* Done */}
        {done.length > 0 && (
          <>
            <StatusGroupHeader label="Terminé" color="bg-[#94ce9a]" bgColor="bg-[#f5fbf5]" />
            {done.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </>
        )}
      </div>
    </div>
  );
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

function TaskRow({ task }: { task: ComparisonTask }) {
  const maxVisible = 2;
  const visibleInsurers = task.insurerIds.slice(0, maxVisible);
  const extraCount = task.insurerIds.length - maxVisible;
  // Map insurer id to name
  const insurerNames: Record<string, string> = {
    axa: "Axa", allianz: "Allianz", generali: "Generali", chubb: "Chubb", maif: "MAIF",
  };

  return (
    <div className="flex items-center bg-white border-b border-panora-border hover:bg-panora-bg/30 transition-colors">
      {/* Client */}
      <div className="flex-1 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[6px] bg-panora-green/20 border border-black/10 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-panora-green">{task.client.charAt(0)}</span>
          </div>
          <span className="text-[13px] font-medium text-panora-text truncate">{task.client}</span>
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {task.products.map((p) => (
            <span key={p} className="inline-flex h-5 items-center px-2 rounded-full bg-panora-secondary text-[12px] text-panora-text-muted">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Insurers */}
      <div className="flex-1 px-4 py-4">
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
      <div className="flex-1 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-panora-green/20 flex items-center justify-center shrink-0">
            <span className="text-[8px] font-bold text-panora-green">{task.createdBy.charAt(0)}</span>
          </div>
          <span className="text-[13px] text-panora-text-muted">{task.createdBy}</span>
        </div>
      </div>

      {/* Date */}
      <div className="flex-1 px-4 py-4">
        <span className="text-[13px] text-panora-text-muted">{task.date}</span>
      </div>

      {/* Progress */}
      <div className="flex-1 px-4 py-4">
        {task.status === "in_progress" ? (
          <div className="inline-flex items-center gap-1.5 h-[25px] px-2.5 rounded-full bg-panora-secondary">
            <Loader2 className="w-3.5 h-3.5 text-panora-text-muted animate-spin" />
            <span className="text-[12px] text-panora-text-muted">
              En analyse <span className="font-medium">&lt; 1 min</span>
            </span>
          </div>
        ) : (
          <Link
            href={`/quoting/comparison?id=${task.cotationId}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-green"
          >
            Voir le comparatif
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
    const section = data.sections[cellId.sectionIndex];
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
        price: formula.annual,
        conditions: formula.monthly,
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
  const [activeTab, setActiveTab] = useState<"comparison" | "analysis">("comparison");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mutableProfile, setMutableProfile] = useState<ClientProfileData>(
    () => getClientProfile(cotParamId) ?? { clientLabel: followupData?.cotation.client ?? "", clientSiren: "", besoinsClient: [] }
  );
  const [isStreaming, setIsStreaming] = useState(false);

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
        const sections = prev.sections.map((section, sIdx) => {
          if (sIdx !== cellId.sectionIndex) return section;
          const rows = section.rows.map((row, rIdx) => {
            if (rIdx !== cellId.rowIndex) return row;
            // Update the cell value based on covered toggle
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
          return { ...section, rows };
        });
        return { ...prev, sections };
      });
    } else if (cellId.type === "price") {
      // Update mutableInsurers pricing from all pricingRows
      setMutableInsurers((prev) =>
        prev.map((ins) => {
          if (ins.id !== cellId.insurerId) return ins;
          if (!updatedDetail.pricingRows) return ins;
          const pricing = updatedDetail.pricingRows.map((row, idx) => ({
            formula: row.offerLabel,
            annual: row.price,
            monthly: row.conditions,
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

  return (
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
        <button
          onClick={() => console.log("TODO: Finaliser la proposition")}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
        >
          <FileSignature className="w-4 h-4" />
          Finaliser la proposition
        </button>
      </div>

      {agentPhase !== "ready" ? (
        <AgentLoadingState phase={agentPhase} insurerCount={mutableInsurers.length} documentCount={totalDocs} />
      ) : (
        <>
          {/* Tab bar */}
          <div className="h-[44px] shrink-0 border-b border-panora-border bg-white px-4 flex items-end">
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
            <button
              onClick={() => setActiveTab("analysis")}
              className={`px-3 pb-2.5 text-[13px] transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === "analysis"
                  ? "border-panora-green text-panora-green font-medium"
                  : "border-transparent text-panora-text-muted hover:text-panora-text"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Synthese / Analyse
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "comparison" ? (
            <div className="flex-1 flex min-h-0">
              <div
                className="flex-1 overflow-auto min-w-0"
                onClick={() => setSelectedCell(null)}
              >
                <ComparisonTable
                  insurers={mutableInsurers}
                  comparisonData={comparisonResult}
                  cotParamId={cotParamId}
                  selectedCell={selectedCell}
                  onCellSelect={(cell) => { setIsProfileOpen(false); setSelectedCell(cell); }}
                  onAddExclusion={handleAddManualExclusion}
                  onUpdateExclusionLabel={handleUpdateExclusionLabel}
                  onDiscardExclusion={handleDiscardExclusion}
                  cellDisplayModes={cellDisplayModes}
                  syntheseData={mutableSynthese}
                  onUpdateSynthese={handleUpdateSynthese}
                  onViewAnalysis={() => setActiveTab("analysis")}
                  onOpenProfile={openProfile}
                  isStreaming={isStreaming}
                  onStreamingDone={() => setIsStreaming(false)}
                />
              </div>
              {isProfileOpen ? (
                <ClientProfilePanel
                  profile={mutableProfile}
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
            <div className="flex-1 flex min-h-0">
              <AnalysisTab
                analysisData={mutableAnalysis}
                insurers={mutableInsurers}
                offerCount={mutableInsurers.length}
                comparisonData={comparisonResult}
                onSwitchToComparison={() => setActiveTab("comparison")}
                onOpenProfile={openProfile}
                onUpdateAnalysis={handleUpdateAnalysis}
                isStreaming={isStreaming}
                onStreamingDone={() => setIsStreaming(false)}
              />
              {isProfileOpen && (
                <ClientProfilePanel
                  profile={mutableProfile}
                  contextPills={mutableAnalysis?.contextPills}
                  onSave={handleProfileSave}
                  onClose={() => setIsProfileOpen(false)}
                />
              )}
            </div>
          )}
        </>
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
