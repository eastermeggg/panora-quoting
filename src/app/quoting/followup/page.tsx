"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { EmailBanner } from "@/components/ui/EmailBanner";
import { InsurerCard } from "@/components/quoting/InsurerCard";
import { ActionJournal } from "@/components/quoting/ActionJournal";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { insurers, cotationId, quotingEmail } from "@/data/mock";
import Link from "next/link";
import {
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  FileText,
  Paperclip,
} from "lucide-react";

export default function FollowupPage() {
  const [journalOpen, setJournalOpen] = useState(false);
  const [selectedInsurer, setSelectedInsurer] = useState<string>("");

  const completed = insurers.filter((i) => i.status === "completed").length;
  const actionRequired = insurers.filter(
    (i) => i.status === "action_required"
  ).length;
  const inProgress = insurers.filter(
    (i) => i.status === "in_progress"
  ).length;
  const errors = insurers.filter((i) => i.status === "error").length;

  const progressPercent = (completed / insurers.length) * 100;

  const handleViewActions = (insurerName: string) => {
    setSelectedInsurer(insurerName);
    setJournalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar variant="followup" cotationId={cotationId} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Header row: Title + Email banner */}
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-xl font-semibold text-panora-text">
              Cotation 2027 (Nom du projet)
            </h1>
            <div className="flex items-center gap-3">
              <EmailBanner compact />
            </div>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-panora-drop rounded-md text-xs text-panora-text-secondary">
              Nom du client ici
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-panora-drop rounded-md text-xs text-panora-text-secondary">
              Nom du produit
            </span>
            {insurers.map((i) => (
              <span
                key={i.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-panora-drop rounded-md text-xs text-panora-text-secondary"
              >
                <span className="text-[10px]">{i.logo}</span>
                {i.name}
              </span>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 bg-panora-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-panora-green rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-panora-text-muted">
                {completed} / {insurers.length} devis reçus
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {actionRequired > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-panora-green-light text-panora-green">
                  ({actionRequired}) action requise
                </span>
              )}
              {errors > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-panora-error-bg text-panora-error">
                  ({errors}) erreur
                </span>
              )}
            </div>
          </div>

          {/* Insurer cards */}
          <div className="space-y-3">
            {insurers.map((insurer, idx) => (
              <InsurerCard
                key={insurer.id}
                insurer={insurer}
                index={idx + 1}
                defaultExpanded={insurer.status === "completed"}
                onViewActions={() => handleViewActions(insurer.name)}
              />
            ))}
          </div>

          {/* Récapitulatif de la demande */}
          <div className="mt-6">
            <RecapSection />
          </div>
        </div>
      </div>

      {/* Action Journal drawer */}
      <ActionJournal
        isOpen={journalOpen}
        onClose={() => setJournalOpen(false)}
        insurerName={selectedInsurer}
        actions={[]}
      />
    </div>
  );
}

function RecapSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-panora-card border border-panora-border rounded-lg overflow-hidden">
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
              <ExtractedDataPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
