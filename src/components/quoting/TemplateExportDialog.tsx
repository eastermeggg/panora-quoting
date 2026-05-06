"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, FileSearch, LayoutGrid, Palette, Search, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type DocumentTemplate,
  type FileFormat,
  PRODUCT_TAG_OPTIONS,
  addTemplate,
  getDocumentTemplates,
  guessProductsFromFilename,
  guessTypeFromFilename,
  makePendingTemplate,
  simulateExtraction,
  updateTemplate as updateTemplateMock,
} from "@/data/templates-mock";
import { TemplateUploadZone } from "@/components/settings/templates/TemplateUploadZone";
import { ProductTagPills } from "@/components/settings/templates/ProductTagSelect";
import { TypePill } from "@/components/settings/templates/TypeSelect";
import { TemplateThumbnail } from "@/components/settings/templates/TemplateThumbnail";
import { ExportGenerationProgress } from "./ExportGenerationProgress";

interface TemplateExportDialogProps {
  clientName: string;
  /** Product label of the current comparison — used to pre-filter and auto-tag drops */
  currentProduct?: string | null;
  preselectedTemplateId?: string | null;
  onClose: () => void;
}

export function TemplateExportDialog({
  clientName,
  currentProduct,
  preselectedTemplateId,
  onClose,
}: TemplateExportDialogProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(() => getDocumentTemplates());

  // Pre-filter on the current comparison's product, but the broker can switch.
  const [productFilter, setProductFilter] = useState<string | null>(currentProduct ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    preselectedTemplateId ?? null
  );
  const [generating, setGenerating] = useState(false);

  // Available products to filter by — from existing templates + always include current product.
  const availableProducts = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => t.products.forEach((p) => set.add(p)));
    if (currentProduct) set.add(currentProduct);
    return PRODUCT_TAG_OPTIONS.filter((p) => set.has(p));
  }, [templates, currentProduct]);

  const visibleTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return templates.filter((t) => {
      if (t.extraction.status !== "ready") return false;
      if (productFilter && !t.products.includes(productFilter)) return false;
      if (q && !t.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [templates, productFilter, searchQuery]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;
  const outputFormat = selectedTemplate?.exportFormats[0] ?? null;

  function handleUpload(file: { name: string; format: FileFormat; size: number }) {
    const cleanName = file.name.replace(/\.[^.]+$/, "");
    // Auto-detect type + products from filename, fall back to the active product filter
    const guessedType = guessTypeFromFilename(file.name);
    const guessedProducts = guessProductsFromFilename(file.name);
    const products =
      guessedProducts.length > 0
        ? guessedProducts
        : currentProduct
          ? [currentProduct]
          : [];
    const pending = makePendingTemplate({
      name: cleanName,
      fileFormat: file.format,
      fileSize: file.size,
      products,
      type: guessedType,
    });
    addTemplate(pending);
    setTemplates(getDocumentTemplates());
    setSelectedTemplateId(pending.id);
    simulateExtraction(pending.id, false, () => {
      setTemplates(getDocumentTemplates());
    });
  }

  function handleGenerate() {
    if (!selectedTemplate || !outputFormat) return;
    updateTemplateMock(selectedTemplate.id, { lastUsedAt: new Date().toISOString() });
    setTemplates(getDocumentTemplates());
    setGenerating(true);
  }

  if (generating && selectedTemplate && outputFormat) {
    return (
      <ExportGenerationProgress
        template={selectedTemplate}
        format={outputFormat}
        clientName={clientName}
        onClose={() => {
          setGenerating(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[820px] mx-4 flex flex-col max-h-[88vh] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-panora-border flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider">
              Exporter
            </span>
            <h2 className="text-[18px] font-serif text-panora-text leading-6">
              Générer un document à partir d&apos;un modèle
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-panora-border/40 transition-colors"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Pedagogic explainer */}
          <ExplainerCard />

          {/* Filter bar — search + product dropdown pre-filtered on the current dossier */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
            <ProductFilterDropdown
              options={availableProducts}
              value={productFilter}
              onChange={setProductFilter}
              currentProduct={currentProduct ?? null}
            />
            <span className="text-[12px] text-panora-text-muted ml-auto tabular-nums">
              {visibleTemplates.length} modèle{visibleTemplates.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Template grid + drop-zone */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
          >
            <TemplateUploadZone compact onFile={handleUpload} />
            {visibleTemplates.map((tpl) => (
              <TemplateGridCard
                key={tpl.id}
                template={tpl}
                selected={selectedTemplateId === tpl.id}
                onSelect={() => setSelectedTemplateId(tpl.id)}
              />
            ))}
            {visibleTemplates.length === 0 && (
              <div className="col-span-full flex items-center justify-center text-[12px] text-panora-text-muted px-4 py-6 border border-dashed border-panora-border rounded-lg">
                {currentProduct
                  ? `Aucun modèle tagué « ${currentProduct} ». Déposez-en un ci-dessus — il sera automatiquement tagué pour ce produit.`
                  : "Aucun modèle pour le moment. Déposez votre premier modèle ci-dessus."}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-panora-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 h-[36px] text-[13px] font-medium text-panora-text-secondary rounded-lg border border-panora-border hover:bg-panora-drop transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleGenerate}
            disabled={
              !selectedTemplate ||
              !outputFormat ||
              selectedTemplate.extraction.status !== "ready"
            }
            className={cn(
              "btn-primary px-4 h-[36px] text-[13px] font-semibold leading-5",
              (!selectedTemplate ||
                !outputFormat ||
                selectedTemplate.extraction.status !== "ready") &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {!selectedTemplate
              ? "Sélectionnez un modèle"
              : selectedTemplate.extraction.status !== "ready"
                ? "Modèle en cours d'analyse…"
                : "Générer le document"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateGridCard({
  template,
  selected,
  onSelect,
}: {
  template: DocumentTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  const isReady = template.extraction.status === "ready";
  return (
    <button
      onClick={onSelect}
      disabled={!isReady}
      className={cn(
        "text-left rounded-[12px] border overflow-hidden transition-all duration-150 will-change-transform",
        selected
          ? "border-panora-green bg-panora-green/[0.04] ring-2 ring-panora-green/25 scale-[1.015] shadow-[0px_6px_18px_-2px_rgba(0,162,114,0.18),0px_2px_4px_rgba(0,0,0,0.04)]"
          : "border-panora-border bg-white shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)] hover:border-panora-text-muted hover:-translate-y-px hover:shadow-[0px_4px_10px_-2px_rgba(0,0,0,0.06)]",
        !isReady && "opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)]"
      )}
    >
      <div
        className={cn(
          "relative h-[120px] border-b transition-colors",
          selected ? "border-panora-green/30" : "border-panora-border"
        )}
      >
        <TemplateThumbnail
          variant={template.previewVariant}
          format={template.fileFormat}
          accent={template.previewAccent}
          size="sm"
        />
        <span className="absolute top-2 right-2 inline-flex items-center h-5 px-2 rounded-full bg-white/90 text-[10px] font-semibold uppercase tracking-wider text-panora-text-secondary shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          {template.fileFormat}
        </span>
        {selected && (
          <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-panora-green flex items-center justify-center shadow-[0px_2px_6px_rgba(0,162,114,0.4)] ring-2 ring-white">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="px-3 py-2.5 flex flex-col gap-1.5">
        {template.type && isReady && <TypePill type={template.type} />}
        <p className="text-[12px] font-medium text-panora-text leading-[18px] line-clamp-2">
          {template.name}
        </p>
        {isReady ? (
          <ProductTagPills products={template.products} />
        ) : (
          <p className="text-[11px] text-panora-text-muted">
            {template.extraction.status === "processing"
              ? "Analyse en cours…"
              : "Indisponible"}
          </p>
        )}
      </div>
    </button>
  );
}

const EXPLAINER_SEEN_KEY = "panora.exportExplainerSeen";

function ExplainerCard() {
  // Default expanded=false to keep SSR + first paint compact.
  // We flip to expanded on mount only if the user has never acknowledged it.
  const [seen, setSeen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wasSeen = localStorage.getItem(EXPLAINER_SEEN_KEY) === "1";
    setSeen(wasSeen);
    if (!wasSeen) setExpanded(true);
  }, []);

  function dismiss() {
    if (!seen) {
      localStorage.setItem(EXPLAINER_SEEN_KEY, "1");
      setSeen(true);
    }
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="group flex items-center gap-2 text-left text-[12px] text-panora-text-muted hover:text-panora-text transition-colors"
      >
        <Sparkles className="w-3 h-3 text-panora-green shrink-0" />
        <span className="leading-[18px]">
          Panora reprend le branding du modèle et y intègre le contenu du dossier.
        </span>
        <span className="inline-flex items-center gap-0.5 text-panora-green font-medium group-hover:underline shrink-0 ml-auto">
          Comment ça marche
          <ChevronDown className="w-3 h-3" />
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-panora-border bg-panora-bg/40 px-4 py-3.5 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold text-panora-text leading-5 font-display">
          Comment Panora génère votre document
        </p>
        {seen && (
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-panora-text-muted hover:text-panora-text"
          >
            <ChevronDown className="w-3 h-3 rotate-180" />
            Replier
          </button>
        )}
      </div>
      <p className="text-[12px] text-panora-text-secondary leading-[18px]">
        Le modèle sert de moule visuel et structurel. Panora reprend son
        branding et l&apos;ordre de ses sections, puis y intègre automatiquement
        le contenu du dossier en cours.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
        <ExplainerStep
          icon={<Palette className="w-3.5 h-3.5" />}
          title="Branding"
          body="Logo, palette, typographies — repris du modèle."
        />
        <ExplainerStep
          icon={<LayoutGrid className="w-3.5 h-3.5" />}
          title="Structure"
          body="Sections, ordre, ton — calqués sur le modèle."
        />
        <ExplainerStep
          icon={<FileSearch className="w-3.5 h-3.5" />}
          title="Contenu"
          body="Synthèse, tableau comparatif et données extraites des devis."
        />
      </div>
      {!seen && (
        <button
          onClick={dismiss}
          className="self-start mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-panora-green hover:underline"
        >
          <Check className="w-3 h-3" />
          J&apos;ai compris — ne plus afficher
        </button>
      )}
    </div>
  );
}

function ExplainerStep({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-white border border-panora-border">
      <div className="w-6 h-6 rounded-md bg-panora-green/10 text-panora-green flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex flex-col gap-0.5">
        <span className="text-[12px] font-semibold text-panora-text leading-4">{title}</span>
        <span className="text-[11px] text-panora-text-muted leading-[16px]">{body}</span>
      </div>
    </div>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex-1 min-w-[200px] max-w-[320px]">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-panora-text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher un modèle"
        className="w-full h-[34px] pl-8 pr-8 text-[13px] text-panora-text bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:border-panora-green/40 placeholder:text-panora-text-muted transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 inline-flex items-center justify-center rounded-md text-panora-text-muted hover:text-panora-text hover:bg-panora-bg"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function ProductFilterDropdown({
  options,
  value,
  onChange,
  currentProduct,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  currentProduct: string | null;
}) {
  return (
    <div className="relative inline-block">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        className={cn(
          "appearance-none h-[34px] pl-3 pr-8 text-[13px] font-medium bg-white border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none cursor-pointer transition-colors focus:border-panora-green/40",
          value ? "border-panora-green/40 text-panora-green" : "border-panora-border text-panora-text"
        )}
      >
        <option value="">Tous mes modèles</option>
        {options.map((p) => (
          <option key={p} value={p}>
            {p}
            {p === currentProduct ? " · ce dossier" : ""}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none",
          value ? "text-panora-green" : "text-panora-text-muted"
        )}
      />
    </div>
  );
}

