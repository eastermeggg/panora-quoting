"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { EmailBanner } from "@/components/ui/EmailBanner";
import { InsurerCard } from "@/components/quoting/InsurerCard";
import { ActionJournal } from "@/components/quoting/ActionJournal";
import { insurers, cotationId } from "@/data/mock";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

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
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-panora-text mb-1">
                Cotation 2027
              </h1>
            </div>
            <Link
              href="/quoting/dashboard"
              className="flex items-center gap-1.5 text-sm text-panora-text-secondary hover:text-panora-text transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              Vue résumée
            </Link>
          </div>

          {/* Email banner */}
          <div className="mb-4">
            <EmailBanner compact />
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
              {inProgress > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                  {inProgress} en cours
                </span>
              )}
              {actionRequired > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-panora-green-light text-panora-green">
                  {actionRequired} action requise
                </span>
              )}
              {errors > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-panora-error-bg text-panora-error">
                  {errors} erreur
                </span>
              )}
            </div>
          </div>

          {/* Insurer cards */}
          <div className="space-y-3">
            {insurers.map((insurer) => (
              <InsurerCard
                key={insurer.id}
                insurer={insurer}
                defaultExpanded={insurer.status === "completed"}
                onViewActions={() => handleViewActions(insurer.name)}
              />
            ))}
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
