"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { InsurerCard } from "@/components/quoting/InsurerCard";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { SessionExpiredModal } from "@/components/quoting/SessionExpiredModal";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import {
  BulkSendToVeosModal,
  type BulkDocument,
  type CrmSection,
} from "@/components/quoting/BulkSendToVeosModal";
import { scenarios } from "@/data/scenarios";
import {
  getFollowupData,
  initialInsurers,
  cotationId as defaultCotationId,
  quotingEmail,
} from "@/data/mock";
import type { InsurerData } from "@/data/mock";
import { isIntegrationConnected } from "@/data/integrations-mock";
import { veosClients } from "@/data/clients-mock";
import { getActiveErpAdapter } from "@/data/erp-adapters";
import Link from "next/link";
import { parsePriceEuros, formatPriceEuros } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Paperclip,
  CheckCircle2,
  ExternalLink,
  X,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";

type InsurerStatus = "completed" | "action_required" | "in_progress";

function FollowupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cotationParamId = searchParams.get("id");

  // Resolve cotation data based on URL param
  const followupData = cotationParamId
    ? getFollowupData(cotationParamId)
    : undefined;

  const cotation = followupData?.cotation;
  const insurersList: InsurerData[] = followupData?.insurers ?? initialInsurers;
  const projectName = followupData?.projectName ?? "RC Pro Marble Tech 2026";
  const clientName = cotation?.client ?? "Marble Tech SAS";
  const productName = cotation?.product ?? "RC Professionnelle";
  const cotId = cotation?.cotationId ?? defaultCotationId;
  const emailSubject =
    followupData?.emailSubject ?? "Cotation Panora RC Pro - Marble Tech SAS";
  const createdVia = cotation?.createdVia ?? "email";
  const scenarioId = followupData?.scenarioId ?? "rc-pro";
  const attachments = followupData?.attachments ?? quotingEmail.attachments;

  const [statuses, setStatuses] = useState<Record<string, InsurerStatus>>(
    () => {
      const initial: Record<string, InsurerStatus> = {};
      for (const ins of insurersList) {
        // Map "pending" status to a valid followup status
        const s = ins.status;
        initial[ins.id] =
          s === "completed" || s === "action_required" || s === "in_progress"
            ? s
            : "in_progress";
      }
      return initial;
    }
  );

  const handleStatusChange = useCallback(
    (insurerId: string, newStatus: InsurerStatus) => {
      setStatuses((prev) => ({ ...prev, [insurerId]: newStatus }));
    },
    []
  );

  // Demo affordance: simulate the agent hitting an expired session mid-quote.
  // In production this would be triggered by the agent runtime, not a button.
  const [expiredModalOpen, setExpiredModalOpen] = useState(false);
  const expiredCarrier = insurersList[0] ?? { id: "generali", name: "Generali" };

  // ── Bulk send to ERP ──
  const erpAdapter = getActiveErpAdapter();
  const [veosModalOpen, setVeosModalOpen] = useState(false);
  const veosConnected = isIntegrationConnected(erpAdapter.id);
  // Heuristic match: look up VEOS client by name (best-effort for the demo).
  const matchedClientId = useMemo(() => {
    const target = clientName.toLowerCase();
    return (
      veosClients.find((c) => c.name.toLowerCase() === target)?.id ??
      veosClients[0]?.id ??
      null
    );
  }, [clientName]);

  const veosDocuments: BulkDocument[] = useMemo(() => {
    const docs: BulkDocument[] = [];
    for (const ins of insurersList) {
      docs.push({
        id: `devis-${ins.id}`,
        label: `Devis ${ins.name} — ${productName}.pdf`,
        meta: "Reçu de l'assureur",
        category: "devis",
        insurerId: ins.id,
        insurerName: ins.name,
        defaultChecked: true,
      });
      docs.push({
        id: `cg-${ins.id}`,
        label: `CG ${ins.name} — ${productName}.pdf`,
        meta: "Conditions générales",
        category: "conditions_generales",
        insurerId: ins.id,
        insurerName: ins.name,
        defaultChecked: true,
      });
    }
    docs.push({
      id: "synthese",
      label: `Synthèse comparative — ${clientName}.pdf`,
      meta: "Document Panora",
      category: "synthese",
      defaultChecked: true,
    });
    docs.push({
      id: "recap",
      label: "Récapitulatif demande Panora.pdf",
      meta: "Auto-généré · Besoins client & contexte",
      category: "recap_demande",
      defaultChecked: true,
    });
    return docs;
  }, [insurersList, productName, clientName]);

  const veosCrmSections: CrmSection[] = useMemo(() => {
    const annualPrices = insurersList
      .flatMap((ins) =>
        (ins.pricing ?? []).map((p) => parsePriceEuros(p.details[0]?.value ?? ""))
      )
      .filter((n) => n > 0);
    const minPrice = annualPrices.length ? Math.min(...annualPrices) : 0;
    const maxPrice = annualPrices.length ? Math.max(...annualPrices) : 0;
    const primeLabel =
      minPrice && maxPrice
        ? minPrice === maxPrice
          ? `${formatPriceEuros(minPrice)} / an`
          : `${formatPriceEuros(minPrice)} – ${formatPriceEuros(maxPrice)} / an`
        : "—";

    // 1. Contract-level "Données contrat" — always first.
    const contractSection: CrmSection = {
      key: "contrat",
      label: "Données contrat",
      fields: [
        {
          label: "Référence",
          value: cotId,
          erpField: "contrat.reference_courtier",
          erpFieldOptions: ["contrat.reference_externe", "contrat.numero_dossier"],
        },
        {
          label: "Produit",
          value: productName,
          erpField: "contrat.produit",
          erpFieldOptions: ["contrat.branche", "contrat.categorie"],
        },
        {
          label: "Courtier",
          value: "Delphine Howden",
          erpField: "contrat.gestionnaire",
          erpFieldOptions: ["contrat.apporteur", "contrat.charge_clientele"],
        },
        {
          label: "Assureurs sollicités",
          value: insurersList.map((i) => i.name).join(", ") || "—",
          erpField: "contrat.assureurs_consultes",
          erpFieldOptions: ["contrat.notes"],
        },
        {
          label: "Statut",
          value: `${insurersList.length} devis reçus`,
          erpField: "contrat.statut",
          erpFieldOptions: ["contrat.etape", "contrat.workflow"],
        },
        {
          label: "Prime estimée",
          value: primeLabel,
          erpField: "contrat.prime_estimee_ttc",
          erpFieldOptions: ["contrat.prime_ht", "contrat.budget_client"],
        },
        {
          label: "Date de demande",
          value: new Date().toLocaleDateString("fr-FR"),
          erpField: "contrat.date_demande",
          erpFieldOptions: ["contrat.date_creation"],
        },
      ],
    };

    // 2. Product-aware sections lifted from the extraction recap — each field
    // gets a synthetic ERP path so the user sees where it lands.
    const scenarioBlock = scenarios[scenarioId] ?? scenarios["rc-pro"];
    const extractedSections: CrmSection[] = scenarioBlock.extractedSections.map(
      (s) => ({
        key: s.key,
        label: s.label,
        fields: s.fields.map((f) => ({
          label: f.label,
          value: f.value.trim() === "" ? "—" : f.value,
          erpField: `contrat.${s.key}.${f.key}`,
          erpFieldOptions: [`risque.${f.key}`, `client.${f.key}`],
        })),
      })
    );

    return [contractSection, ...extractedSections];
  }, [cotId, productName, insurersList, scenarioId]);

  const completed = useMemo(
    () => Object.values(statuses).filter((s) => s === "completed").length,
    [statuses]
  );
  const actionRequired = useMemo(
    () =>
      Object.values(statuses).filter((s) => s === "action_required").length,
    [statuses]
  );
  const total = insurersList.length;
  const progressPercent = (completed / total) * 100;
  const allDone = completed === total;

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
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
            <div className="w-4 h-4 shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  width="16"
                  height="16"
                  rx="3"
                  fill="#00a272"
                  opacity="0.2"
                />
                <circle cx="8" cy="6" r="2.5" fill="#00a272" opacity="0.6" />
                <path
                  d="M4 13c0-2.2 1.8-4 4-4s4 1.8 4 4"
                  stroke="#00a272"
                  strokeWidth="1.5"
                  opacity="0.6"
                  fill="none"
                />
              </svg>
            </div>
            <span className="text-[12px] font-medium text-panora-text-primary">
              Nom cotation
            </span>
            <span className="text-[12px] text-panora-text-secondary">
              {cotId}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpiredModalOpen(true)}
            title="Démo : déclenche le modal de session expirée"
            className="flex items-center gap-1.5 px-2 h-[22px] rounded-md border border-dashed border-panora-border text-[11px] font-medium text-panora-text-muted hover:text-panora-text hover:border-panora-text-muted/40 transition-colors"
          >
            <Clock className="w-3 h-3" />
            Simuler session expirée
          </button>
          <div className="w-px h-4 bg-panora-border" />
          <div className="flex items-center gap-[5px]">
            <button className="bg-panora-secondary rounded-[6px] p-[5px] hover:bg-panora-border transition-colors">
              <ChevronUp className="w-[13px] h-[13px] text-panora-text-muted" />
            </button>
            <button className="bg-panora-secondary rounded-[6px] p-[5px] hover:bg-panora-border transition-colors">
              <ChevronDown className="w-[13px] h-[13px] text-panora-text-muted" />
            </button>
          </div>
          <div className="w-px h-4 bg-panora-border" />
          <button
            onClick={() => router.back()}
            className="p-0.5 hover:bg-panora-secondary rounded transition-colors text-panora-text-muted hover:text-panora-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info / Tab bar area */}
      <div className="shrink-0 border-b border-panora-border p-6 flex flex-col gap-4">
        {/* Row 1: Title + actions */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl text-panora-text-primary font-serif tracking-[-0.24px] leading-7">
            {projectName}
          </h1>
          <div className="flex items-center gap-2.5 shrink-0">
            {veosConnected && allDone && (
              <button
                type="button"
                onClick={() => setVeosModalOpen(true)}
                className="flex items-center gap-1.5 px-3 h-[34px] rounded-md border border-panora-border bg-white text-[13px] font-medium text-panora-text hover:bg-panora-secondary/40 transition-colors"
              >
                <Image
                  src={`/logos/${erpAdapter.id}.svg`}
                  alt=""
                  width={14}
                  height={14}
                  className="rounded-[3px]"
                />
                Envoyer à {erpAdapter.name}
              </button>
            )}
            {createdVia === "email" && !allDone && (
              <div className="border border-[#dad7d0] rounded-[6px] px-2 py-1.5 flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-[15px] h-[15px] rounded-full bg-panora-green flex items-center justify-center shrink-0">
                    <svg width="6" height="8" viewBox="0 0 6 8" fill="none">
                      <path d="M5.5 4L0.5 7.46V0.54L5.5 4Z" fill="white" />
                    </svg>
                  </div>
                  <span className="text-[12px] font-medium text-panora-text leading-4">
                    Initiée par e-mail
                  </span>
                </div>
                <span className="text-[12px] text-panora-text leading-4 max-w-[200px] truncate">
                  {emailSubject}
                </span>
                <button className="flex items-center gap-1.5 text-[12px] font-medium text-panora-green leading-[18px]">
                  Voir
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Tags */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 h-6 bg-white border border-panora-border rounded-full text-[12px] font-medium text-panora-text-secondary">
            {clientName}
          </span>
          <div className="w-px h-[14px] bg-[#d9d9d9]" />
          <span className="inline-flex items-center gap-1.5 px-2 h-6 bg-white border border-panora-border rounded-full text-[12px] font-medium text-panora-text-secondary">
            {productName}
          </span>
          <div className="w-px h-[14px] bg-[#d9d9d9]" />
          <div className="flex items-center gap-1.5">
            {insurersList.map((i) => (
              <span
                key={i.id}
                className="inline-flex items-center gap-1.5 px-2 h-6 bg-white border border-panora-border rounded-full text-[12px] font-medium text-panora-text-secondary"
              >
                <InsurerLogo
                  insurerId={i.id}
                  name={i.name}
                  size="sm"
                  className="w-3.5 h-3.5 rounded-[2px]"
                />
                {i.name}
              </span>
            ))}
          </div>
        </div>

        {/* Row 3: Progress OR status badge */}
        <div className="flex items-center gap-2.5">
          {allDone ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 h-[25px] rounded-full text-[12px] font-medium bg-panora-green-light text-panora-green-dark">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Terminé
            </span>
          ) : (
            <>
              <div className="inline-flex items-center gap-[9px] bg-panora-secondary rounded-full px-2.5 h-[25px]">
                <div className="w-20 h-2 bg-black/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-panora-text-primary rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[12px] font-medium text-panora-text-secondary leading-4">
                  {completed} / {total} devis reçus
                </span>
              </div>

              {actionRequired > 0 && (
                <>
                  <div className="w-px h-[14px] bg-[#d9d9d9]" />
                  <span className="inline-flex items-center px-2 h-6 rounded-full text-[12px] font-medium bg-[#f2ddc1] text-panora-warning-text">
                    {actionRequired} action{actionRequired > 1 ? "s" : ""} requise
                    {actionRequired > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scrollable main content */}
      <div className="flex-1 overflow-y-auto bg-panora-bg">
        <div className="max-w-[1046px] mx-auto px-6 py-6">
          {/* All done banner — rich mini-comparison */}
          {allDone && (
            <AllDoneBanner
              insurers={insurersList}
              clientName={clientName}
              productName={productName}
              cotParamId={cotationParamId ?? ""}
            />
          )}

          {/* Insurer cards */}
          <div className="space-y-3">
            {insurersList.map((insurer) => (
              <InsurerCard
                key={insurer.id}
                insurer={insurer}
                currentStatus={statuses[insurer.id]}
                defaultExpanded={false}
                onStatusChange={(newStatus) =>
                  handleStatusChange(insurer.id, newStatus)
                }
              />
            ))}
          </div>

          {/* Récapitulatif de la demande */}
          <div className="mt-8">
            <RecapSection
              attachments={attachments}
              scenarioId={scenarioId}
              emailSubject={emailSubject}
            />
          </div>
        </div>
      </div>

      <SessionExpiredModal
        open={expiredModalOpen}
        insurerId={expiredCarrier.id}
        insurerName={expiredCarrier.name}
        onResolved={() => setExpiredModalOpen(false)}
        onDismiss={() => setExpiredModalOpen(false)}
      />

      <BulkSendToVeosModal
        open={veosModalOpen}
        clientId={matchedClientId}
        clientName={clientName}
        principalProduct={productName}
        documents={veosDocuments}
        crmSections={veosCrmSections}
        onCancel={() => setVeosModalOpen(false)}
      />
    </div>
  );
}

export default function FollowupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <p className="text-[13px] text-panora-text-muted">Chargement…</p>
        </div>
      }
    >
      <FollowupContent />
    </Suspense>
  );
}

function AllDoneBanner({
  insurers,
  clientName,
  productName,
  cotParamId,
}: {
  insurers: InsurerData[];
  clientName: string;
  productName: string;
  cotParamId: string;
}) {
  const insurerPrices = insurers.map((ins) => {
    const annuals = (ins.pricing ?? []).map((p) => parsePriceEuros(p.details[0]?.value ?? ""));
    const cheapest = annuals.length > 0 ? Math.min(...annuals) : 0;
    return { ...ins, cheapest, offerCount: ins.pricing?.length ?? 0 };
  });

  const globalCheapest = Math.min(...insurerPrices.map((i) => i.cheapest).filter((p) => p > 0));

  // Pick the insurer that best matches client needs (most formulas = broadest coverage)
  const sortedByBreadth = [...insurerPrices].sort((a, b) => b.offerCount - a.offerCount);
  const bestFit = sortedByBreadth[0];
  const totalFormulas = insurerPrices.reduce((sum, i) => sum + i.offerCount, 0);

  return (
    <div className="mb-6 bg-white border border-panora-border rounded-[10px] overflow-hidden shadow-[0px_3px_6px_0px_rgba(0,0,0,0.02),0px_11px_11px_0px_rgba(0,0,0,0.02)]">
      {/* Top bar */}
      <div className="px-5 py-3 border-b border-panora-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-panora-green" />
          <span className="text-[13px] font-semibold text-panora-text">
            {insurers.length} devis reçus
          </span>
          <span className="text-[12px] text-panora-text-muted">
            — {clientName}
          </span>
        </div>
        <Link
          href={`/quoting/comparison?id=${cotParamId}`}
          className="btn-primary flex items-center gap-2 px-4 py-1.5 text-[13px] font-medium"
        >
          Comparer
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Insurer mini-cards */}
      <div className="px-5 py-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${insurers.length}, 1fr)` }}>
          {insurerPrices.map((ins) => {
            const isBest = ins === bestFit;
            return (
              <div
                key={ins.id}
                className={`rounded-[8px] border px-3.5 py-3 ${isBest ? "border-panora-green/30 bg-[#f5fbf7]" : "border-panora-border bg-panora-bg/50"}`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <InsurerLogo insurerId={ins.id} name={ins.name} size="sm" className="w-5 h-5 rounded-[4px]" />
                  <span className="text-[13px] font-medium text-panora-text">{ins.name}</span>
                </div>
                <div className="text-[12px] text-panora-text-muted mb-1">à partir de</div>
                <div className="text-[18px] font-semibold tracking-[-0.3px] mb-1 text-panora-text">
                  {ins.cheapest > 0 ? formatPriceEuros(ins.cheapest) : "—"}
                  <span className="text-[12px] font-normal text-panora-text-muted">/an</span>
                </div>
                <div className="text-[12px] text-panora-text-muted">
                  {ins.offerCount} formule{ins.offerCount > 1 ? "s" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI insight — based on client needs, not price */}
      <div className="px-5 pb-4">
        <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-[8px] bg-panora-bg border border-panora-border">
          <Sparkles className="w-3.5 h-3.5 text-panora-green shrink-0 mt-0.5" />
          <p className="text-[12px] text-panora-text-secondary leading-[18px]">
            Au regard du profil {productName.toLowerCase()} de <strong className="text-panora-text">{clientName}</strong>,{" "}
            <strong className="text-panora-text">{bestFit.name}</strong> propose la couverture la plus large avec {bestFit.offerCount} formules adaptées.
            {" "}{totalFormulas} offres au total à analyser — comparez les garanties et franchises pour valider l&apos;adéquation aux besoins du client.
          </p>
        </div>
      </div>
    </div>
  );
}

function RecapSection({
  attachments,
  scenarioId,
  emailSubject,
}: {
  attachments: Array<{ name: string; size: string; fieldsExtracted: number }>;
  scenarioId: string;
  emailSubject: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const scenario = scenarios[scenarioId] ?? scenarios["rc-pro"];

  // The followup page only shows finished cotations — by construction every
  // field is resolved. Normalize statuses so the extracted-data panel never
  // surfaces a warning ("À compléter") or error chrome here.
  const finishedSections = useMemo(
    () =>
      scenario.extractedSections.map((section) => ({
        ...section,
        status: "complete" as const,
        missingCount: 0,
        invalidCount: 0,
        fields: section.fields.map((field) => ({
          ...field,
          status: "ok" as const,
          error: undefined,
          value: field.value.trim() === "" ? "—" : field.value,
        })),
      })),
    [scenario.extractedSections]
  );

  return (
    <div className="bg-white border border-panora-border rounded-[10px] overflow-hidden shadow-[0px_3px_6px_0px_rgba(0,0,0,0.02),0px_11px_11px_0px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-panora-drop/30 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-panora-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-panora-text-muted" />
        )}
        <FileText className="w-4 h-4 text-panora-text-muted" />
        <span className="text-[13px] font-semibold text-panora-text flex-1">
          Récapitulatif de la demande
        </span>
        {/* Email pill */}
        <div className="border border-[#dad7d0] rounded-[6px] px-2 py-1 flex items-center gap-1.5">
          <div className="w-[15px] h-[15px] rounded-full bg-panora-green flex items-center justify-center shrink-0">
            <svg width="6" height="8" viewBox="0 0 6 8" fill="none">
              <path d="M5.5 4L0.5 7.46V0.54L5.5 4Z" fill="white" />
            </svg>
          </div>
          <span className="text-[12px] font-medium text-panora-text leading-4">
            Initiée par e-mail
          </span>
          <span className="text-[12px] text-panora-text leading-4 max-w-[170px] truncate">
            {emailSubject}
          </span>
          <span className="text-[12px] font-medium text-panora-green leading-[18px] flex items-center gap-1">
            Voir
            <ExternalLink className="w-3 h-3 inline" />
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-panora-border pt-4 space-y-6">
          {/* Consolidated data first */}
          <ExtractedDataPanel sections={finishedSections} showHeading={false} />

          {/* Documents fournis */}
          <div>
            <h4 className="text-[13px] font-medium text-panora-text mb-1">
              Documents fournis
            </h4>
            <p className="text-[12px] text-panora-text-muted leading-[18px] mb-3">
              Déposez tous les documents utiles à la cotation.
            </p>
            <div className="space-y-1.5">
              {attachments.map((att) => (
                <div
                  key={att.name}
                  className="flex items-center gap-2 px-3 py-2 bg-panora-bg border border-panora-border rounded-lg"
                >
                  <Paperclip className="w-4 h-4 text-panora-text-muted shrink-0" />
                  <span className="text-[13px] text-panora-text truncate flex-1">
                    {att.name}
                  </span>
                  <span className="text-[12px] text-panora-text-muted shrink-0">
                    {att.fieldsExtracted} champs extraits
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="text-[13px] font-medium text-panora-text mb-2">
              Instructions à l&apos;agent de cotation
            </h4>
            <p className="text-[13px] text-panora-text-secondary leading-5">
              Informations supplémentaires non couvertes par les champs
              extraits. Contexte, préférences, consignes spécifiques.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
