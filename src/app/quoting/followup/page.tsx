"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InsurerCard } from "@/components/quoting/InsurerCard";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { scenarios } from "@/data/scenarios";
import {
  getFollowupData,
  initialInsurers,
  cotationId as defaultCotationId,
  quotingEmail,
} from "@/data/mock";
import type { InsurerData } from "@/data/mock";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Paperclip,
  CheckCircle2,
  Send,
  Eye,
  ExternalLink,
  X,
} from "lucide-react";

type InsurerStatus = "completed" | "action_required" | "in_progress";

function FollowupContent() {
  const searchParams = useSearchParams();
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
          <Link
            href="/quoting/dashboard"
            className="text-[12px] text-panora-text-secondary hover:text-panora-text transition-colors"
          >
            ← Retour
          </Link>
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
          <div className="flex items-center gap-[5px]">
            <button className="bg-panora-secondary rounded-[6px] p-[5px] hover:bg-panora-border transition-colors">
              <ChevronUp className="w-[13px] h-[13px] text-panora-text-muted" />
            </button>
            <button className="bg-panora-secondary rounded-[6px] p-[5px] hover:bg-panora-border transition-colors">
              <ChevronDown className="w-[13px] h-[13px] text-panora-text-muted" />
            </button>
          </div>
          <div className="w-px h-4 bg-panora-border" />
          <Link
            href="/quoting/dashboard"
            className="p-0.5 hover:bg-panora-secondary rounded transition-colors text-panora-text-muted hover:text-panora-text"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Info / Tab bar area */}
      <div className="shrink-0 border-b border-panora-border p-6 flex flex-col gap-4">
        {/* Row 1: Title + email pill */}
        <div className="flex items-start justify-between">
          <h1 className="text-2xl text-panora-text-primary font-serif tracking-[-0.24px] leading-7">
            {projectName}
          </h1>
          {createdVia === "email" && (
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

        {/* Row 3: Progress + status badges */}
        <div className="flex items-center gap-2.5">
          {/* Progress pill */}
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

          <div className="w-px h-[14px] bg-[#d9d9d9]" />

          {actionRequired > 0 && (
            <span className="inline-flex items-center px-2 h-6 rounded-full text-[12px] font-medium bg-[#f2ddc1] text-panora-warning-text">
              {actionRequired} action{actionRequired > 1 ? "s" : ""} requise
              {actionRequired > 1 ? "s" : ""}
            </span>
          )}

          {allDone && (
            <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-[12px] font-medium bg-[#dbeee5] text-[#173c2d]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Toutes les cotations sont terminées
            </span>
          )}
        </div>
      </div>

      {/* Scrollable main content */}
      <div className="flex-1 overflow-y-auto bg-panora-bg">
        <div className="max-w-[1046px] mx-auto px-6 py-6">
          {/* All done banner */}
          {allDone && (
            <div className="mb-6 bg-[#dbeee5] border border-panora-green/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-panora-green shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-[13px] font-semibold text-panora-green mb-1">
                    Vous avez reçu tous les devis
                  </h3>
                  <p className="text-[13px] text-panora-green/80 leading-5 mb-4">
                    Notre agent a packagé une comparaison détaillée prête à
                    envoyer à votre client.
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] font-medium">
                      <Eye className="w-4 h-4" />
                      Voir la comparaison
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-panora-green bg-white border border-panora-green/30 rounded-[10px] hover:bg-[#dbeee5] transition-colors">
                      <Send className="w-4 h-4" />
                      Partager au client
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
        <div className="px-5 pb-5 border-t border-panora-border pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Documents & Instructions */}
            <div className="space-y-5">
              <div>
                <h4 className="text-[13px] font-medium text-panora-text mb-3">
                  Documents fournis
                </h4>
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

              <div>
                <h4 className="text-[13px] font-medium text-panora-text mb-2">
                  Instructions à l&apos;agent de cotation
                </h4>
                <p className="text-[13px] text-panora-text-secondary leading-5">
                  Informations supplémentaires non couvertes par les champs à
                  droite. Contexte, préférences, consignes spécifiques.
                </p>
              </div>
            </div>

            {/* Right - Extracted data */}
            <div>
              <ExtractedDataPanel sections={scenario.extractedSections} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
