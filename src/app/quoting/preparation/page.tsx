"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Paperclip,
  Upload,
  CheckCircle2,
  ListChecks,
  Building2,
  Car,
  X,
  ChevronDown,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { EmailBanner } from "@/components/ui/EmailBanner";
import { InsurerSelector } from "@/components/quoting/InsurerSelector";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { quotingEmail, cotationId } from "@/data/mock";

export default function PreparationPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("Cotation 2027");
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>([
    "axa",
    "generali",
  ]);
  const [instructions, setInstructions] = useState("");

  const handleToggleInsurer = (id: string) => {
    setSelectedInsurers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleLaunch = () => {
    router.push("/quoting/followup");
  };

  const missingFields = 3 as number;
  const invalidFields = 1 as number;
  const noInsurers = selectedInsurers.length === 0;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar variant="preparation" cotationId={cotationId} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-panora-text mb-1">
              Préparer et lancer la cotation
            </h1>
            <p className="text-sm text-panora-text-secondary leading-relaxed">
              Rassemblez ici tout ce dont les agents ont besoin pour saisir les
              devis sur les extranets. Documents, notes, emails… l&apos;extraction
              commence automatiquement.
            </p>
          </div>

          {/* Email banner */}
          <div className="mb-4">
            <EmailBanner subject={quotingEmail.subject} />
          </div>

          {/* Validation checklist */}
          <div className="mb-6 bg-panora-card border border-panora-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-4 h-4 text-panora-text-muted" />
              <span className="text-sm font-medium text-panora-text">
                Pour lancer la cotation
              </span>
            </div>
            <div className="space-y-2">
              {missingFields > 0 && (
                <div className="flex items-center gap-2 text-sm text-panora-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{missingFields} champs requis à compléter</span>
                </div>
              )}
              {noInsurers && (
                <div className="flex items-center gap-2 text-sm text-panora-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Sélectionner assureurs à solliciter (exemple)</span>
                </div>
              )}
              {invalidFields > 0 && (
                <div className="flex items-center gap-2 text-sm text-panora-error">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{invalidFields} champ invalide</span>
                </div>
              )}
              {missingFields === 0 && invalidFields === 0 && !noInsurers && (
                <div className="flex items-center gap-2 text-sm text-panora-green">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tout est prêt pour lancer la cotation</span>
                </div>
              )}
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column - Form */}
            <div className="space-y-8">
              {/* Project section */}
              <div>
                <h3 className="text-base font-semibold text-panora-text mb-4">
                  Projet de cotation
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-panora-text-muted block mb-1.5">
                      Nom du projet
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full border border-panora-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-panora-text-muted block mb-1.5">
                      Client
                    </label>
                    <div className="flex items-center gap-2 border border-panora-border rounded-lg px-3 py-2.5 cursor-pointer hover:border-panora-text-muted transition-colors">
                      <Building2 className="w-4 h-4 text-panora-text-muted" />
                      <span className="text-sm text-panora-text flex-1">
                        Marble Tech SAS - SIREN 00007U26464
                      </span>
                      <ChevronDown className="w-4 h-4 text-panora-text-muted" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-panora-text-muted block mb-1.5">
                      Produit
                    </label>
                    <div className="flex items-center gap-2 border border-panora-border rounded-lg px-3 py-2.5">
                      <Car className="w-4 h-4 text-panora-text-muted" />
                      <span className="text-sm text-panora-text flex-1">
                        Flotte Automobile
                      </span>
                      <button className="text-panora-text-muted hover:text-panora-text">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurers section */}
              <div>
                <h3 className="text-base font-semibold text-panora-text mb-4">
                  Assureurs à solliciter
                </h3>
                <InsurerSelector
                  selectedIds={selectedInsurers}
                  onToggle={handleToggleInsurer}
                  product="Flotte Automobile"
                />
              </div>

              {/* Documents & Instructions */}
              <div>
                <h3 className="text-base font-semibold text-panora-text mb-4">
                  Documents & instructions
                </h3>

                {/* Documents sub-header */}
                <h4 className="text-sm font-medium text-panora-text mb-2">
                  Documents
                </h4>
                <p className="text-xs text-panora-text-secondary mb-3 leading-relaxed">
                  Les pièces jointes de l&apos;email sont extraites
                  automatiquement pour remplir les champs à droite. Vous pouvez
                  ajouter d&apos;autres documents.
                </p>
                <div className="space-y-2 mb-4">
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

                {/* Drop zone */}
                <div className="border-2 border-dashed border-panora-border rounded-lg p-6 text-center bg-panora-drop hover:border-panora-green/30 transition-colors cursor-pointer mb-6">
                  <Upload className="w-8 h-8 text-panora-text-muted mx-auto mb-2" />
                  <p className="text-sm text-panora-text-secondary">
                    Glissez-déposez vos fichiers ici
                  </p>
                  <p className="text-xs text-panora-text-muted mt-1">
                    ou{" "}
                    <span className="text-panora-green font-medium cursor-pointer hover:underline">
                      parcourir
                    </span>{" "}
                    - Contraintes fichiers, PDF, Images, Word...
                  </p>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="text-sm font-medium text-panora-text mb-1">
                    Instructions à l&apos;agent de cotation
                  </h4>
                  <p className="text-xs text-panora-text-muted mb-2 leading-relaxed">
                    Informations supplémentaires non couvertes par les champs à
                    droite. Contexte, préférences, consignes spécifiques.
                  </p>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={`Ex: Le client veut absolument moins cher que le contrat actuel\nEx : Privilégier les formules sans franchise dégât des eaux..\nEx : ....`}
                    rows={5}
                    className="w-full border border-panora-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green resize-y placeholder:text-panora-text-muted/60"
                  />
                </div>
              </div>
            </div>

            {/* Right column - Extracted data */}
            <div>
              <ExtractedDataPanel />
            </div>
          </div>
        </div>
      </div>

      {/* CTA button */}
      <div className="sticky bottom-0 bg-panora-bg border-t border-panora-border p-4 flex justify-end">
        <button
          onClick={handleLaunch}
          className="px-6 py-2.5 bg-panora-warning text-white text-sm font-semibold rounded-lg hover:bg-panora-warning/90 transition-colors shadow-sm"
        >
          Lancer la cotation
        </button>
      </div>
    </div>
  );
}
