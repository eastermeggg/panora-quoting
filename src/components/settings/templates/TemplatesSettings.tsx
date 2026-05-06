"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloudUpload, Filter, Search, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type DocumentTemplate,
  type FileFormat,
  PRODUCT_TAG_OPTIONS,
  addTemplate,
  deleteTemplate as deleteTemplateMock,
  getDocumentTemplates,
  getKnownTypes,
  guessProductsFromFilename,
  guessTypeFromFilename,
  makePendingTemplate,
  simulateExtraction,
} from "@/data/templates-mock";
import { BatchReviewPanel } from "./BatchReviewPanel";
import { TemplateCard } from "./TemplateCard";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import { TemplatesOnboarding } from "./TemplatesOnboarding";
import type { UploadedFile } from "./TemplateUploadZone";

const FORMAT_BY_EXT: Record<string, FileFormat> = {
  pdf: "pdf",
  docx: "docx",
  pptx: "pptx",
};

export function TemplatesSettings() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(() => getDocumentTemplates());
  const [openTemplate, setOpenTemplate] = useState<DocumentTemplate | null>(null);
  const [productFilters, setProductFilters] = useState<Set<string>>(new Set());
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  /** Templates dropped in the last batch — pending review in the inline panel */
  const [batchReviewIds, setBatchReviewIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  function toggleProductFilter(p: string) {
    setProductFilters((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  function toggleTypeFilter(t: string) {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  const [shouldFailExtraction, setShouldFailExtraction] = useState(false);
  /** ?empty=1 forces the onboarding view even if templates exist (demo only) */
  const [forceEmpty, setForceEmpty] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setShouldFailExtraction(params.get("failExtraction") === "1");
      setForceEmpty(params.get("empty") === "1");
    }
  }, []);

  function handleUploadFiles(files: UploadedFile[]) {
    const created: DocumentTemplate[] = [];
    files.forEach((file) => {
      const cleanName = file.name.replace(/\.[^.]+$/, "");
      const guessedType = guessTypeFromFilename(file.name);
      const guessedProducts = guessProductsFromFilename(file.name);
      const pending = makePendingTemplate({
        name: cleanName,
        fileFormat: file.format,
        fileSize: file.size,
        type: guessedType,
        products: guessedProducts,
      });
      addTemplate(pending);
      created.push(pending);
      simulateExtraction(pending.id, shouldFailExtraction, () =>
        setTemplates(getDocumentTemplates())
      );
    });
    setTemplates(getDocumentTemplates());

    // Stack new IDs at the top of the review list; existing pending stays visible too.
    if (created.length > 0) {
      setBatchReviewIds((prev) => [...created.map((t) => t.id), ...prev]);
    }
  }

  function handleDeleteTemplate(id: string) {
    deleteTemplateMock(id);
    setTemplates(getDocumentTemplates());
    setBatchReviewIds((prev) => prev.filter((x) => x !== id));
    setOpenTemplate(null);
  }

  function handleRemoveFromBatch(id: string) {
    deleteTemplateMock(id);
    setTemplates(getDocumentTemplates());
    setBatchReviewIds((prev) => prev.filter((x) => x !== id));
  }

  function handleValidateBatch() {
    setBatchReviewIds([]);
  }

  // Resolve the pending templates at every render — they may have transitioned from processing → ready
  const batchReviewTemplates = useMemo(
    () =>
      batchReviewIds
        .map((id) => templates.find((t) => t.id === id))
        .filter((t): t is DocumentTemplate => Boolean(t)),
    [batchReviewIds, templates]
  );

  // Filter pill data
  const productsInUse = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => t.products.forEach((p) => set.add(p)));
    return PRODUCT_TAG_OPTIONS.filter((p) => set.has(p));
  }, [templates]);

  const typesInUse = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => {
      if (t.type) set.add(t.type);
    });
    return getKnownTypes().filter((t) => set.has(t));
  }, [templates]);

  const visibleTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return templates.filter((t) => {
      if (typeFilters.size > 0) {
        if (!t.type || !typeFilters.has(t.type)) return false;
      }
      if (productFilters.size > 0) {
        const matchesAnyProduct = t.products.some((p) => productFilters.has(p));
        if (!matchesAnyProduct) return false;
      }
      if (q && !t.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [templates, typeFilters, productFilters, searchQuery]);

  const isEmpty = templates.length === 0 || forceEmpty;
  const hasFilters = typesInUse.length > 0 || productsInUse.length > 0;
  const isFiltered = typeFilters.size > 0 || productFilters.size > 0 || searchQuery.length > 0;

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-[1200px] mx-auto px-12 py-14 flex flex-col gap-14">
        {/* Header */}
        <header className="flex flex-col gap-2 max-w-[640px]">
          <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-[0.08em]">
            Paramètres
          </span>
          <h1 className="text-[28px] font-serif leading-[34px] text-panora-text">
            Modèles de sortie
          </h1>
          <p className="text-[13px] text-panora-text-secondary leading-[22px] mt-1">
            Déposez vos modèles de proposition, synthèse ou devoir de conseil.
            Panora reprend leur branding et leur structure pour générer chaque
            document client à partir d&apos;une comparaison.
          </p>
        </header>

        {/* Empty state — onboarding shown only when no batch is being classified */}
        {isEmpty && batchReviewIds.length === 0 && (
          <TemplatesOnboarding onFiles={handleUploadFiles} />
        )}

        {/* Batch review — appears after a multi-file drop, until validated or emptied */}
        {batchReviewTemplates.length > 0 && (
          <BatchReviewPanel
            templates={batchReviewTemplates}
            onTemplatesChange={() => setTemplates(getDocumentTemplates())}
            onRemove={handleRemoveFromBatch}
            onValidate={handleValidateBatch}
          />
        )}

        {/* Library — when there's at least one template */}
        {!isEmpty && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-panora-border">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-[18px] font-serif text-panora-text leading-6">
                  Bibliothèque
                </h2>
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-panora-secondary text-[11px] font-semibold text-panora-text-secondary tabular-nums">
                  {templates.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LibrarySearchInput value={searchQuery} onChange={setSearchQuery} />
                <ImportButton onFiles={handleUploadFiles} />
              </div>
            </div>

            {hasFilters && (
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <FilterToolbar
                  types={typesInUse}
                  typeSelection={typeFilters}
                  onTypeToggle={toggleTypeFilter}
                  products={productsInUse}
                  productSelection={productFilters}
                  onProductToggle={toggleProductFilter}
                />
                {isFiltered && (
                  <button
                    onClick={() => {
                      setTypeFilters(new Set());
                      setProductFilters(new Set());
                      setSearchQuery("");
                    }}
                    className="text-[12px] font-medium text-panora-text-muted hover:text-panora-text transition-colors shrink-0"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}

            {visibleTemplates.length === 0 ? (
              <div className="border border-dashed border-panora-border rounded-xl bg-panora-bg/30 px-4 py-12 text-center">
                <p className="text-[13px] text-panora-text-muted">
                  Aucun modèle ne correspond à votre recherche.
                </p>
              </div>
            ) : (
              <div
                className="grid gap-5"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
              >
                {visibleTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onClick={() => setOpenTemplate(t)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Demo-only flow toggle — preview empty (onboarding) vs populated library */}
      <DemoFlowToggle value={forceEmpty} onChange={setForceEmpty} />

      {openTemplate && (
        <TemplatePreviewDialog
          template={openTemplate}
          onClose={() => setOpenTemplate(null)}
          onChange={(next) => {
            setOpenTemplate(next);
            setTemplates(getDocumentTemplates());
          }}
          onDelete={() => handleDeleteTemplate(openTemplate.id)}
        />
      )}
    </div>
  );
}

// ── Demo-only flow toggle — preview onboarding vs populated library ─

function DemoFlowToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-30 flex items-center gap-1 px-1 py-1 rounded-full bg-panora-text/95 backdrop-blur-sm shadow-[0px_8px_24px_rgba(0,0,0,0.18),0px_2px_4px_rgba(0,0,0,0.08)]">
      <span className="text-[9px] font-semibold text-white/55 uppercase tracking-[0.12em] px-2 select-none">
        Démo
      </span>
      <button
        onClick={() => onChange(false)}
        className={cn(
          "px-3 h-7 rounded-full text-[11px] font-medium transition-colors",
          !value
            ? "bg-white text-panora-text shadow-[0px_1px_2px_rgba(0,0,0,0.15)]"
            : "text-white/70 hover:text-white"
        )}
      >
        Bibliothèque
      </button>
      <button
        onClick={() => onChange(true)}
        className={cn(
          "px-3 h-7 rounded-full text-[11px] font-medium transition-colors",
          value
            ? "bg-white text-panora-text shadow-[0px_1px_2px_rgba(0,0,0,0.15)]"
            : "text-white/70 hover:text-white"
        )}
      >
        Onboarding
      </button>
    </div>
  );
}

// ── Filter toolbar — single horizontal row ─────────────────────────

function FilterToolbar({
  types,
  typeSelection,
  onTypeToggle,
  products,
  productSelection,
  onProductToggle,
}: {
  types: string[];
  typeSelection: Set<string>;
  onTypeToggle: (next: string) => void;
  products: string[];
  productSelection: Set<string>;
  onProductToggle: (next: string) => void;
}) {
  return (
    <div className="flex items-center gap-x-6 gap-y-3 flex-wrap">
      {types.length > 0 && (
        <FilterDimension
          icon={<Tag className="w-3 h-3" />}
          label="Type"
          options={types}
          selection={typeSelection}
          onToggle={onTypeToggle}
        />
      )}
      {types.length > 0 && products.length > 0 && (
        <span className="hidden md:block w-px h-5 bg-panora-border" />
      )}
      {products.length > 0 && (
        <FilterDimension
          icon={<Filter className="w-3 h-3" />}
          label="Produit"
          options={products}
          selection={productSelection}
          onToggle={onProductToggle}
        />
      )}
    </div>
  );
}

function FilterDimension({
  icon,
  label,
  options,
  selection,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  options: string[];
  selection: Set<string>;
  onToggle: (next: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] font-medium text-panora-text-muted">
        {icon}
        {label}
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {options.map((p) => {
          const active = selection.has(p);
          return (
            <button
              key={p}
              onClick={() => onToggle(p)}
              className={cn(
                "inline-flex items-center gap-1 h-[26px] px-2.5 rounded-full text-[12px] font-medium transition-colors",
                active
                  ? "bg-panora-green/10 text-panora-green border border-panora-green/30"
                  : "bg-transparent text-panora-text-secondary border border-panora-border hover:bg-panora-bg"
              )}
            >
              {p}
              {active && <X className="w-2.5 h-2.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Library search input ──────────────────────────────────────────

function LibrarySearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative w-[240px]">
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

// ── Compact import button (replaces hero drop zone in non-empty state) ─

function ImportButton({ onFiles }: { onFiles: (files: UploadedFile[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handle(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const format = (FORMAT_BY_EXT as Record<string, FileFormat>)[ext];
      if (!format) continue;
      files.push({ name: file.name, format, size: file.size });
    }
    if (files.length > 0) onFiles(files);
  }

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        className="btn-primary inline-flex items-center gap-1.5 px-3 h-[34px] text-[13px] font-semibold"
      >
        <CloudUpload className="w-3.5 h-3.5" />
        Importer
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.pptx"
        multiple
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = ""; // allow re-importing the same file
        }}
      />
    </>
  );
}
