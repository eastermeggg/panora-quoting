"use client";

import { useState, useCallback, useMemo } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { EmailBanner } from "@/components/ui/EmailBanner";
import { InsurerCard } from "@/components/quoting/InsurerCard";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { initialInsurers, cotationId, quotingEmail } from "@/data/mock";
import { scenarios } from "@/data/scenarios";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Paperclip,
  CheckCircle2,
} from "lucide-react";

type InsurerStatus = "completed" | "action_required" | "in_progress";

export default function FollowupPage() {
  const [statuses, setStatuses] = useState<Record<string, InsurerStatus>>(
    () => {
      const initial: Record<string, InsurerStatus> = {};
      for (const ins of initialInsurers) {
        initial[ins.id] = ins.status;
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
    () => Object.values(statuses).filter((s) => s === "action_required").length,
    [statuses]
  );
  const total = initialInsurers.length;
  const progressPercent = (completed / total) * 100;
  const allDone = completed === total;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar variant="followup" cotationId={cotationId} />

      <div className="flex-1 overflow-y-auto bg-panora-bg">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <h1 className="text-2xl font-semibold text-panora-text tracking-tight">
              Cotation 2027 (Nom du projet)
            </h1>
            <EmailBanner compact />
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-panora-border rounded-full text-xs text-panora-text-secondary shadow-sm">
              Marble Tech SAS
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-panora-border rounded-full text-xs text-panora-text-secondary shadow-sm">
              RC Professionnelle
            </span>
            <div className="w-px h-5 bg-panora-border mx-1" />
            {initialInsurers.map((i) => (
              <span
                key={i.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-panora-border rounded-full text-xs text-panora-text-secondary shadow-sm"
              >
                <InsurerLogo insurerId={i.id} name={i.name} size="sm" />
                {i.name}
              </span>
            ))}
          </div>

          {/* Progress row — compact, single line */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            {/* Mini progress bar + count */}
            <div className="inline-flex items-center gap-2.5 bg-panora-drop rounded-full px-3 py-1.5">
              <div className="w-24 h-1.5 bg-panora-border/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-panora-text rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-panora-text-secondary">
                {completed} / {total} devis reçus
              </span>
            </div>

            <div className="w-px h-4 bg-panora-border" />

            {actionRequired > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-panora-warning/30 bg-panora-warning-bg text-panora-warning">
                {"{"}
                {actionRequired}
                {"}"} action requise
              </span>
            )}
            {allDone && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-panora-green/30 bg-panora-green-light text-panora-green">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Toutes les cotations sont terminées
              </span>
            )}
          </div>

          {/* Insurer cards */}
          <div className="space-y-3">
            {initialInsurers.map((insurer) => (
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
            <RecapSection />
          </div>
        </div>
      </div>
    </div>
  );
}

function RecapSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-panora-border/40 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
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
        <span className="text-sm font-semibold text-panora-text flex-1">
          Récapitulatif de la demande
        </span>
        <EmailBanner compact />
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-panora-border pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Documents & Instructions */}
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-medium text-panora-text mb-3">
                  Documents fournis
                </h4>
                <div className="space-y-1.5">
                  {quotingEmail.attachments.map((att) => (
                    <div
                      key={att.name}
                      className="flex items-center gap-2 px-3 py-2 bg-panora-drop rounded-lg"
                    >
                      <Paperclip className="w-4 h-4 text-panora-text-muted shrink-0" />
                      <span className="text-sm text-panora-text truncate flex-1">
                        {att.name}
                      </span>
                      <span className="text-xs text-panora-text-muted shrink-0">
                        {att.fieldsExtracted} champs extraits
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-panora-text mb-2">
                  Instructions à l&apos;agent de cotation
                </h4>
                <p className="text-sm text-panora-text-secondary leading-relaxed">
                  Informations supplémentaires non couvertes par les champs à
                  droite. Contexte, préférences, consignes spécifiques.
                </p>
              </div>
            </div>

            {/* Right - Extracted data */}
            <div>
              <ExtractedDataPanel
                sections={scenarios["rc-pro"].extractedSections}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
