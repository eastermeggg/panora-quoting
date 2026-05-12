"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { marked } from "marked";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import {
  BrandingSettings,
  DEFAULT_BRANDING,
  ensureTitleFontLoaded,
  loadBranding,
} from "@/data/branding";
import {
  comparisonTasks,
  currentUser,
  getAnalysisData,
  getClientProfile,
  getComparisonData,
  getFollowupData,
} from "@/data/mock";
import { getSynthesisOverride } from "@/data/chatMock";
import { buildDefaultSynthese } from "@/components/quoting/ComparisonSynthesis";
import { ComparisonTable } from "@/components/quoting/ComparisonTable";
import { PresentationCover } from "@/components/presentation/PresentationCover";

export default function PresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const initialView: "cover" | "etude" =
    searchParams.get("view") === "etude" ? "etude" : "cover";
  const initialTab: "synthese" | "tableau" =
    searchParams.get("tab") === "tableau" ? "tableau" : "synthese";
  const [view, setView] = useState<"cover" | "etude">(initialView);
  const [tab, setTab] = useState<"synthese" | "tableau">(initialTab);
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);

  useEffect(() => {
    const b = loadBranding();
    setBranding(b);
    ensureTitleFontLoaded(b.titleFont);
  }, []);

  useEffect(() => {
    ensureTitleFontLoaded(branding.titleFont);
  }, [branding.titleFont]);

  const followupData = getFollowupData(id);
  const comparisonData = getComparisonData(id);
  const profile = getClientProfile(id);
  const analysisData = getAnalysisData(id);
  const task = comparisonTasks.find((t) => t.cotationId === id);

  const clientName =
    profile?.clientLabel || followupData?.cotation.client || "Client";
  const productLabel =
    task?.principalProduct ?? followupData?.cotation.product ?? "votre couverture";
  const insurers = useMemo(() => followupData?.insurers ?? [], [followupData]);
  const completedInsurers = useMemo(
    () => insurers.filter((i) => i.status === "completed"),
    [insurers]
  );
  const recommendedInsurerId =
    completedInsurers.find(() => true)?.id ?? null;
  const productLabels = useMemo(() => {
    const set = new Set<string>();
    if (task?.principalProduct) set.add(task.principalProduct);
    if (followupData?.cotation.product) set.add(followupData.cotation.product);
    return Array.from(set);
  }, [task, followupData]);

  const syntheseMarkdown = useMemo(() => {
    const override = getSynthesisOverride(id);
    if (override.content) return override.content;
    return buildDefaultSynthese({
      clientName,
      productLabel,
      insurers,
      recommendedInsurerId,
      besoinsClient: profile?.besoinsClient,
      comparisonData,
      analysisData,
    });
  }, [
    id,
    clientName,
    productLabel,
    insurers,
    recommendedInsurerId,
    profile,
    comparisonData,
    analysisData,
  ]);

  if (!followupData) {
    return <NotFound />;
  }

  if (view === "cover") {
    return (
      <PresentationCover
        branding={branding}
        clientName={clientName}
        productLabels={productLabels.length > 0 ? productLabels : [productLabel]}
        insurers={completedInsurers.map((i) => ({ id: i.id, name: i.name }))}
        brokerName={currentUser.name}
        cabinetName={currentUser.cabinet}
        onContinue={() => setView("etude")}
      />
    );
  }

  return (
    <EtudeView
      branding={branding}
      clientName={clientName}
      productLabel={productLabel}
      cabinetName={currentUser.cabinet}
      tab={tab}
      setTab={setTab}
      onBack={() => setView("cover")}
      syntheseMarkdown={syntheseMarkdown}
      insurers={insurers}
      comparisonData={comparisonData}
      principalProduct={task?.principalProduct ?? null}
    />
  );
}

function EtudeView({
  branding,
  clientName,
  productLabel,
  cabinetName,
  tab,
  setTab,
  onBack,
  syntheseMarkdown,
  insurers,
  comparisonData,
  principalProduct,
}: {
  branding: BrandingSettings;
  clientName: string;
  productLabel: string;
  cabinetName: string;
  tab: "synthese" | "tableau";
  setTab: (t: "synthese" | "tableau") => void;
  onBack: () => void;
  syntheseMarkdown: string;
  insurers: import("@/data/mock").InsurerData[];
  comparisonData: import("@/data/mock").ComparisonData | undefined;
  principalProduct: string | null;
}) {
  const syntheseHtml = useMemo(
    () => marked.parse(syntheseMarkdown, { async: false }) as string,
    [syntheseMarkdown]
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top bar */}
      <header className="h-[60px] shrink-0 border-b border-panora-border bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-text-muted hover:text-panora-text transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Couverture
          </button>
          <div className="w-px h-5 bg-panora-border" />
          <div className="flex items-center gap-2.5">
            {branding.logoDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={branding.logoDataUrl}
                alt={cabinetName}
                className="h-5 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span className="text-[14px] font-semibold text-panora-text">
                {cabinetName}
              </span>
            )}
            <span className="text-[12px] text-panora-text-secondary">·</span>
            <span className="text-[13px] text-panora-text-secondary">
              Étude — <span className="text-panora-text font-medium">{clientName}</span>
            </span>
          </div>
        </div>
        <div className="text-[11px] uppercase tracking-wider text-panora-text-secondary">
          Présentation confidentielle
        </div>
      </header>

      {/* Tabs */}
      <div className="h-[44px] shrink-0 border-b border-panora-border bg-white px-6 flex items-end">
        <button
          onClick={() => setTab("synthese")}
          className={`px-3 pb-2.5 text-[13px] transition-colors border-b-2 ${
            tab === "synthese"
              ? "border-panora-green text-panora-green font-medium"
              : "border-transparent text-panora-text-muted hover:text-panora-text"
          }`}
        >
          Synthèse
        </button>
        <button
          onClick={() => setTab("tableau")}
          className={`px-3 pb-2.5 text-[13px] transition-colors border-b-2 ${
            tab === "tableau"
              ? "border-panora-green text-panora-green font-medium"
              : "border-transparent text-panora-text-muted hover:text-panora-text"
          }`}
        >
          Tableau comparatif
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white min-h-0">
        {tab === "synthese" ? (
          <div className="max-w-[760px] mx-auto px-10 py-10">
            <div
              className="synthese-doc"
              style={{ ["--brand-primary" as string]: branding.primaryColor }}
              dangerouslySetInnerHTML={{ __html: syntheseHtml }}
            />
          </div>
        ) : (
          <ReadOnlyTable
            insurers={insurers}
            comparisonData={comparisonData}
            principalProduct={principalProduct}
          />
        )}
      </div>
    </div>
  );
}

function ReadOnlyTable({
  insurers,
  comparisonData,
  principalProduct,
}: {
  insurers: import("@/data/mock").InsurerData[];
  comparisonData: import("@/data/mock").ComparisonData | undefined;
  principalProduct: string | null;
}) {
  return (
    <div className="flex-1 overflow-auto min-h-0">
      <ComparisonTable
        insurers={insurers}
        comparisonData={comparisonData}
        selectedCell={null}
        principalProduct={principalProduct}
      />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-panora-bg">
      <div className="max-w-md mx-auto px-6 text-center flex flex-col items-center gap-4">
        <h1 className="text-[24px] font-serif text-panora-text">
          Lien expiré ou introuvable
        </h1>
        <p className="text-[13px] text-panora-text-secondary">
          Ce lien d&apos;étude n&apos;est plus disponible. Contactez votre courtier
          pour obtenir un nouveau lien d&apos;accès.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-panora-green hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}
