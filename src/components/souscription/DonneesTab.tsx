"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  dossierToSections,
  isDossierReady,
} from "@/data/souscription-engine";
import { getValidationStats, type ExtractedSection } from "@/data/scenarios";
import { useFormState } from "@/data/souscription-store";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { AiVerificationBanner } from "@/components/quoting/AiVerificationBanner";
import type { Dossier } from "@/data/souscription-mock";

/**
 * Données tab: the structured data behind the quote, readable and correctable in
 * place. Data collection (manques + broker form) lives on the dedicated collecte
 * screen — this tab just reviews; if the data is still incomplete, it points
 * there. Saisie structurée only, jamais en chat (Fabian).
 */
export function DonneesTab({ dossier }: { dossier: Dossier }) {
  const token = `souscription-${dossier.id}`;
  const form = useFormState(token);

  const [sections, setSections] = useState<ExtractedSection[]>(() =>
    dossierToSections(dossier, {
      completed: form.completed,
      values: form.values,
    }).map((s) => ({ ...s, verified: false }))
  );
  // Re-seed when the broker completes the form (on the collecte, another tab).
  const [syncedCompleted, setSyncedCompleted] = useState(form.completed);
  if (form.completed !== syncedCompleted) {
    setSyncedCompleted(form.completed);
    setSections(
      dossierToSections(dossier, {
        completed: form.completed,
        values: form.values,
      }).map((s) => ({ ...s, verified: false }))
    );
  }

  const stats = getValidationStats(sections);
  const incomplete = !isDossierReady(dossier.id);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-panora-bg">
      <div className="max-w-[820px] mx-auto px-6 py-6 flex flex-col gap-3">
        <AiVerificationBanner
          total={stats.totalSections}
          verified={stats.verifiedSections}
          showProgress={false}
        />

        {incomplete && (
          <Link
            href={`/souscription/dossier/${dossier.id}/collecte`}
            className="rounded-lg border border-panora-warning/40 bg-panora-warning-bg/60 px-4 py-2.5 flex items-center gap-2 text-[13px] text-panora-warning-text hover:bg-panora-warning-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
          >
            <span className="flex-1">
              Données incomplètes. Complétez-les dans la préparation.
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        )}

        <ExtractedDataPanel
          key={syncedCompleted ? "completed" : "pending"}
          sections={sections}
          onSectionsChange={setSections}
          showHeading={false}
          showVerification={false}
          defaultExpanded
        />
      </div>
    </div>
  );
}
