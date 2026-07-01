"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Mail,
  Paperclip,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dossierToSections, produitsLabel } from "@/data/souscription-engine";
import { getValidationStats, type ExtractedSection } from "@/data/scenarios";
import { markFormSent, useFormState } from "@/data/souscription-store";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { AiVerificationBanner } from "@/components/quoting/AiVerificationBanner";
import { SendBrokerFormModal } from "./SendBrokerFormModal";
import type { Dossier } from "@/data/souscription-mock";

function euro(n: number): string {
  return n.toLocaleString("fr-FR") + " € HT";
}

/**
 * The collecte / préparation step, restored as a single dedicated screen (the
 * broker "préparation" layout): the demande context on the left, the extracted
 * data to complete + verify on the right, and one "Lancer la tarification" in
 * the foot bar once the dossier is ready. Structured capture only, never chat.
 */
export function CollecteScreen({ dossier }: { dossier: Dossier }) {
  const router = useRouter();
  const token = `souscription-${dossier.id}`;
  const form = useFormState(token);

  const [sections, setSections] = useState<ExtractedSection[]>(() =>
    dossierToSections(dossier, {
      completed: form.completed,
      values: form.values,
    }).map((s) => ({ ...s, verified: false }))
  );
  // Re-seed when the broker completes the form (possibly in another tab).
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
  const [sendOpen, setSendOpen] = useState(false);

  const manques = dossier.manques;
  const stats = getValidationStats(sections);
  const ready = stats.missingFields === 0 && stats.invalidFields === 0;
  const profile = dossier.insured;

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-panora-bg">
      {/* Header — 44px */}
      <div className="h-[44px] shrink-0 border-b border-panora-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/souscription"
            className="inline-flex items-center gap-1 text-[12px] text-panora-text-secondary hover:text-panora-text transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </Link>
          <div className="w-px h-[13px] bg-panora-border" />
          <div className="flex items-center gap-1.5 min-w-0">
            <FileText className="w-4 h-4 text-panora-green shrink-0" />
            <span className="text-[12px] font-medium text-panora-text truncate">
              Préparation
            </span>
            <span className="text-[12px] text-panora-text-secondary truncate">
              {profile.raison}
            </span>
          </div>
        </div>
        <Link
          href={`/souscription/dossier/${dossier.id}`}
          aria-label="Fermer"
          className="p-1 hover:bg-panora-secondary rounded transition-colors text-panora-text-muted hover:text-panora-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
        >
          <X className="w-4 h-4" />
        </Link>
      </div>

      {/* Two columns */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left — the demande context */}
        <div className="w-[42%] max-w-[440px] shrink-0 border-r border-panora-border overflow-y-auto bg-white">
          {/* Origin */}
          <div className="border-b border-panora-border px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-panora-green flex items-center justify-center shrink-0">
                  <Mail className="w-3 h-3 text-white" />
                </div>
                <span className="text-[13px] font-medium text-panora-text truncate">
                  Demande transmise par {dossier.courtier}
                </span>
              </div>
              <Link
                href="/souscription/reception"
                className="text-[12px] font-medium text-panora-green hover:underline shrink-0"
              >
                Voir l&apos;e-mail
              </Link>
            </div>
          </div>

          {/* Le projet */}
          <div className="border-b border-panora-border px-6 py-5">
            <h2 className="text-[15px] font-semibold text-panora-text mb-4 font-display">
              La demande
            </h2>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {dossier.produitsDemandes.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center h-6 px-2.5 rounded-full bg-panora-green-light text-[12px] font-medium text-panora-green-dark"
                >
                  {produitsLabel([p])}
                </span>
              ))}
            </div>
            <dl className="flex flex-col gap-2.5">
              <Field label="Raison sociale" value={profile.raison} />
              <Field label="SIREN" value={profile.siren} mono />
              <Field label="Code NAF" value={profile.naf} mono />
              <Field label="Activité" value={profile.activite} />
              <Field label="Chiffre d'affaires" value={euro(profile.caHT)} />
              <Field label="Effectif" value={`${profile.effectif} salariés`} />
            </dl>
          </div>

          {/* Collecte — manques + send form */}
          <div className="px-6 py-5">
            <h2 className="text-[15px] font-semibold text-panora-text mb-3 font-display">
              Collecte
            </h2>
            {manques.length === 0 ? (
              <div className="rounded-lg border border-panora-green-border bg-panora-green-light/60 px-3.5 py-2.5 flex items-center gap-2 text-[13px] text-panora-green-dark">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Aucune pièce manquante signalée.
              </div>
            ) : form.completed ? (
              <div className="rounded-lg border border-panora-green-border bg-panora-green-light/60 px-3.5 py-2.5 flex items-center gap-2 text-[13px] text-panora-green-dark">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Formulaire complété par le courtier. Données importées.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <p className="text-[13px] text-panora-text-secondary leading-5">
                  {manques.length} information{manques.length > 1 ? "s" : ""} à
                  compléter par le courtier avant de tarifer.
                </p>
                <ul className="flex flex-col gap-1">
                  {manques.map((m) => (
                    <li
                      key={m.champ}
                      className="flex items-center gap-1.5 text-[12px] text-panora-text-secondary leading-4"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-panora-warning shrink-0" />
                      {m.champ}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setSendOpen(true)}
                  className="btn-primary inline-flex items-center gap-2 self-start px-3.5 h-8 text-[12px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {form.sent ? "Renvoyer le formulaire" : "Envoyer le formulaire au courtier"}
                </button>
                {form.sent && (
                  <span className="text-[12px] text-panora-green-dark">
                    Formulaire envoyé à {dossier.courtier}. En attente de complétion.
                  </span>
                )}
              </div>
            )}

            {/* Pièces jointes */}
            {dossier.pieces.length > 0 && (
              <div className="mt-5 flex flex-col gap-2">
                <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-[0.06em] leading-4">
                  Pièces jointes
                </span>
                <div className="flex flex-col gap-1.5">
                  {dossier.pieces.map((p) => (
                    <div
                      key={p}
                      className="flex items-center gap-2 rounded-lg border border-panora-border bg-panora-drop px-3 py-2 text-[12px] text-panora-text-secondary"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
                      <span className="truncate">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — the data to complete + verify */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="border-b border-panora-border px-6 py-5">
            <h1 className="text-[18px] font-serif text-panora-text tracking-[-0.01em] leading-6">
              Complétez et vérifiez les données de la souscription
            </h1>
          </div>
          <div className="sticky top-0 z-10 bg-panora-bg px-6 pt-6 pb-3">
            <AiVerificationBanner
              total={stats.totalSections}
              verified={stats.verifiedSections}
              showProgress={false}
            />
          </div>
          <div className="px-6 pb-6">
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
      </div>

      {/* Foot bar — one action: launch the tarification */}
      <div className="shrink-0 border-t border-panora-border bg-white px-6 py-3 flex items-center justify-between gap-4">
        <FootStatus ready={ready} stats={stats} />
        <button
          type="button"
          onClick={() =>
            router.push(`/souscription/dossier/${dossier.id}?launch=1`)
          }
          disabled={!ready}
          aria-disabled={!ready}
          className={cn(
            "btn-primary px-5 py-2.5 text-[13px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            !ready && "opacity-40 cursor-not-allowed pointer-events-none"
          )}
        >
          Lancer la tarification
        </button>
      </div>

      <SendBrokerFormModal
        open={sendOpen}
        dossier={dossier}
        onClose={() => setSendOpen(false)}
        onSent={() => {
          markFormSent(token);
          setSendOpen(false);
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-3 text-[13px] leading-5">
      <span className="w-[120px] shrink-0 text-panora-text-secondary">
        {label}
      </span>
      <span className={cn("flex-1 text-panora-text", mono && "font-mono text-[12px]")}>
        {value}
      </span>
    </div>
  );
}

function FootStatus({
  ready,
  stats,
}: {
  ready: boolean;
  stats: ReturnType<typeof getValidationStats>;
}) {
  if (ready) {
    return (
      <div className="flex items-center gap-1.5 text-[13px] text-panora-green-dark">
        <CheckCircle2 className="w-4 h-4" />
        <span>Dossier prêt, données complètes et vérifiées.</span>
      </div>
    );
  }
  const parts: string[] = [];
  if (stats.invalidFields > 0)
    parts.push(
      `${stats.invalidFields} champ${stats.invalidFields > 1 ? "s" : ""} invalide${stats.invalidFields > 1 ? "s" : ""}`
    );
  if (stats.missingFields > 0)
    parts.push(
      `${stats.missingFields} champ${stats.missingFields > 1 ? "s" : ""} à compléter`
    );
  return (
    <div className="flex items-center gap-1.5 text-[13px] text-panora-text-secondary">
      <span>Avant tarification :</span>
      <span className="text-panora-text font-medium">{parts.join(" · ")}</span>
    </div>
  );
}
