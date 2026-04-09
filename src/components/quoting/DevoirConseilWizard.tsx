"use client";

import { useState } from "react";
import {
  X,
  FileSignature,
  ArrowLeft,
  Sparkles,
  Check,
  Star,
  ExternalLink,
  FileText,
} from "lucide-react";
import { BesoinTag } from "@/components/ui/BesoinTag";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import type { InsurerData, ClientProfileData } from "@/data/mock";

// ─── Types ────────────────────────────────────────────────────────────

interface DevoirConseilWizardProps {
  onClose: () => void;
  onSubmit: (data: {
    templateId: string;
    besoins: BesoinRow[];
    recommendedInsurerId: string;
    recommendation: string;
  }) => void;
  insurers: InsurerData[];
  profile: ClientProfileData;
  /** The workspace's template, if one has been uploaded in settings */
  template?: DevoirTemplate | null;
}

type BesoinRow = { id: string; value: string; source: "ai" | "manual" };

export type DevoirTemplate = {
  id: string;
  name: string;
  updatedAt: string;
};

// ─── Component ────────────────────────────────────────────────────────

export function DevoirConseilWizard({
  onClose,
  onSubmit,
  insurers,
  profile,
  template = null,
}: DevoirConseilWizardProps) {
  const hasTemplate = !!template;

  // If a template exists, skip directly to step 2
  const [step, setStep] = useState<1 | 2 | 3>(hasTemplate ? 2 : 1);

  // Step 2 — Besoins client
  const [besoins, setBesoins] = useState<BesoinRow[]>(
    profile.besoinsClient
      .filter((b) => b.value.trim())
      .map((b) => ({ id: b.id, value: b.value, source: b.source })),
  );
  const [newBesoinInput, setNewBesoinInput] = useState("");

  // Step 3 — Insurer recommendation
  const [recommendedInsurerId, setRecommendedInsurerId] = useState<string>(
    () => (insurers.length === 1 ? insurers[0].id : insurers[0]?.id ?? ""),
  );
  const [recommendation, setRecommendation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const canProceedStep1 = hasTemplate;
  const canProceedStep2 = besoins.length > 0;
  const canSubmit = !!recommendedInsurerId;

  // ── Handlers ──

  const handleRemoveBesoin = (id: string) => {
    setBesoins((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddBesoin = () => {
    const value = newBesoinInput.trim();
    if (!value) return;
    setBesoins((prev) => [
      ...prev,
      { id: `manual-${Date.now()}`, value, source: "manual" },
    ]);
    setNewBesoinInput("");
  };

  const handleGenerateRecommendation = () => {
    setIsGenerating(true);
    const insurer = insurers.find((i) => i.id === recommendedInsurerId);
    setTimeout(() => {
      setRecommendation(
        `Au regard des besoins exprimés par le client et de l'analyse comparative des ${insurers.length} offre${insurers.length > 1 ? "s" : ""} reçue${insurers.length > 1 ? "s" : ""}, nous recommandons l'offre ${insurer?.name ?? "sélectionnée"}.\n\nCette offre présente le meilleur rapport entre les garanties proposées et les besoins identifiés du client, notamment en termes de couverture, de franchises et de conditions tarifaires.`,
      );
      setIsGenerating(false);
    }, 1200);
  };

  const handleSubmit = () => {
    onSubmit({
      templateId: template?.id ?? "",
      besoins,
      recommendedInsurerId,
      recommendation,
    });
  };

  const steps = [
    { num: 1 as const, label: "Modèle" },
    { num: 2 as const, label: "Besoins client" },
    { num: 3 as const, label: "Recommandation" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[600px] max-h-[800px] bg-white rounded-[16px] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-panora-bg border-b border-panora-border">
          <div className="flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-panora-text-muted" />
            <span className="text-[15px] font-medium text-panora-text font-serif">
              Devoir de conseil
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/60 transition-colors"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="shrink-0 flex border-b border-panora-border bg-white">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num === 1) setStep(1);
                else if (s.num === 2 && canProceedStep1) setStep(2);
                else if (s.num === 3 && canProceedStep1 && canProceedStep2)
                  setStep(3);
              }}
              className="flex-1 relative py-3 text-center"
            >
              <span
                className={`text-[13px] ${step === s.num ? "text-panora-text font-medium" : "text-panora-text-muted"}`}
              >
                {s.num} - {s.label}
              </span>
              <div
                className={`absolute bottom-0 left-0 right-0 h-[2px] ${step === s.num ? "bg-panora-green" : "bg-panora-secondary"}`}
              />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
          {step === 1 && (
            <Step1Template template={template} />
          )}
          {step === 2 && (
            <Step2Besoins
              besoins={besoins}
              newBesoinInput={newBesoinInput}
              onNewBesoinInputChange={setNewBesoinInput}
              onAddBesoin={handleAddBesoin}
              onRemoveBesoin={handleRemoveBesoin}
            />
          )}
          {step === 3 && (
            <Step3Recommendation
              insurers={insurers}
              recommendedInsurerId={recommendedInsurerId}
              onSelectInsurer={setRecommendedInsurerId}
              recommendation={recommendation}
              onRecommendationChange={setRecommendation}
              onGenerate={handleGenerateRecommendation}
              isGenerating={isGenerating}
            />
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-t border-panora-border bg-white">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                className="flex items-center gap-1.5 text-[13px] text-panora-text-muted hover:text-panora-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            )}
          </div>
          <div>
            {step === 1 && !hasTemplate && (
              <a
                href="/settings"
                className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Aller aux réglages
              </a>
            )}
            {step === 1 && hasTemplate && (
              <button
                onClick={() => setStep(2)}
                className="btn-primary px-4 py-2 text-[13px] font-medium"
              >
                Etape suivante
              </button>
            )}
            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="btn-primary px-4 py-2 text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Etape suivante
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileSignature className="w-4 h-4" />
                Générer le devoir de conseil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Template ─────────────────────────────────────────────────

function Step1Template({
  template,
}: {
  template?: DevoirTemplate | null;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-serif text-panora-text">
        Modèle de devoir de conseil
      </h2>

      {template ? (
        <>
          <p className="text-[13px] text-panora-text-muted leading-5">
            Le modèle configuré pour votre espace de travail sera utilisé.
          </p>

          {/* Selected template — radio row matching Figma product list item */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-[8px] border border-panora-green bg-[#f0faf5]">
            <div className="w-4 h-4 rounded-full bg-panora-green flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <FileText className="w-4 h-4 text-panora-text-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium text-panora-text leading-5">
                {template.name}
              </span>
            </div>
            <span className="text-[12px] text-panora-text-muted shrink-0">
              Mis à jour le {template.updatedAt}
            </span>
          </div>

          <a
            href="/settings"
            className="flex items-center gap-1.5 text-[13px] text-panora-text-muted hover:text-panora-green transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Modifier dans les réglages
          </a>
        </>
      ) : (
        /* Empty state — no template configured */
        <div className="flex flex-col items-center text-center py-10 px-6">
          <div className="w-12 h-12 rounded-full bg-panora-secondary flex items-center justify-center mb-4">
            <FileSignature className="w-6 h-6 text-panora-text-muted" />
          </div>
          <h3 className="text-[15px] font-medium text-panora-text font-serif mb-1.5">
            Aucun modèle configuré
          </h3>
          <p className="text-[13px] text-panora-text-muted leading-5 max-w-[340px] mb-5">
            Importez un modèle de devoir de conseil dans les réglages de votre
            espace de travail pour pouvoir en générer.
          </p>
          <a
            href="/settings"
            className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Configurer dans les réglages
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Besoins Client ───────────────────────────────────────────

function Step2Besoins({
  besoins,
  newBesoinInput,
  onNewBesoinInputChange,
  onAddBesoin,
  onRemoveBesoin,
}: {
  besoins: BesoinRow[];
  newBesoinInput: string;
  onNewBesoinInputChange: (v: string) => void;
  onAddBesoin: () => void;
  onRemoveBesoin: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-serif text-panora-text">
        Rappel des besoins client
      </h2>
      <p className="text-[13px] text-panora-text-muted leading-5">
        Vérifiez et complétez les besoins exprimés par le client. Ils seront
        intégrés dans le devoir de conseil.
      </p>

      <div className="space-y-2">
        {besoins.map((besoin) => (
          <BesoinTag
            key={besoin.id}
            value={besoin.value}
            source={besoin.source}
            onRemove={() => onRemoveBesoin(besoin.id)}
          />
        ))}

        {/* Add input */}
        <input
          type="text"
          value={newBesoinInput}
          onChange={(e) => onNewBesoinInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddBesoin();
            }
          }}
          placeholder="Ajoutez un besoin client..."
          className="w-full bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] px-3 py-2 min-h-[36px] text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green transition-colors"
        />
      </div>

      <p className="text-[12px] text-panora-text-muted">
        Exemples : Franchise max 1 000 euros, Protection juridique incluse,
        Couverture monde entier
      </p>
    </div>
  );
}

// ─── Step 3: Insurer Recommendation ──────────────────────────────────

function Step3Recommendation({
  insurers,
  recommendedInsurerId,
  onSelectInsurer,
  recommendation,
  onRecommendationChange,
  onGenerate,
  isGenerating,
}: {
  insurers: InsurerData[];
  recommendedInsurerId: string;
  onSelectInsurer: (id: string) => void;
  recommendation: string;
  onRecommendationChange: (v: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-serif text-panora-text">
        Assureur recommandé
      </h2>
      <p className="text-[13px] text-panora-text-muted leading-5">
        Sélectionnez l&apos;assureur que vous recommandez et rédigez votre
        motivation.
      </p>

      {/* Insurer chips */}
      <div className="flex flex-wrap gap-2">
        {insurers.map((ins) => {
          const selected = ins.id === recommendedInsurerId;
          return (
            <button
              key={ins.id}
              onClick={() => onSelectInsurer(ins.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-[8px] border transition-colors ${
                selected
                  ? "border-panora-green bg-[#f0faf5]"
                  : "border-panora-border bg-white hover:bg-panora-bg"
              }`}
            >
              <InsurerLogo
                insurerId={ins.id}
                name={ins.name}
                size="sm"
                className="w-5 h-5 rounded-full"
              />
              <span className="text-[13px] text-panora-text">{ins.name}</span>
              {selected && (
                <Star className="w-3.5 h-3.5 text-panora-green fill-panora-green" />
              )}
            </button>
          );
        })}
      </div>

      {/* Recommendation text */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[13px] font-medium text-panora-text">
            Rédaction de la recommandation
          </label>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-[12px] text-panora-green hover:text-panora-green-dark transition-colors disabled:opacity-50"
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
            />
            {isGenerating ? "Génération..." : "Générer avec l'IA"}
          </button>
        </div>
        <textarea
          value={recommendation}
          onChange={(e) => onRecommendationChange(e.target.value)}
          placeholder="Rédigez votre recommandation motivée ou utilisez l'IA pour la générer..."
          rows={6}
          className="w-full bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] px-3 py-2.5 text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green transition-colors resize-none leading-5"
        />
      </div>
    </div>
  );
}
