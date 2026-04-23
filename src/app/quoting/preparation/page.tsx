"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CheckCircle2,
  Car,
  Shield,
  ChevronDown,
  Search,
  ExternalLink,
  X,
  CloudUpload,
  FileText,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerSelector } from "@/components/quoting/InsurerSelector";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { getScenario, getValidationStats, scenarios } from "@/data/scenarios";
import type { ExtractedSection } from "@/data/scenarios";
import Link from "next/link";

// Mock clients for dropdown
const mockClients = [
  { id: "acme", name: "ACME Corp SAS", siren: "523 847 196", color: "bg-purple-600" },
  { id: "marble", name: "Marble Tech SAS", siren: "00007U26464", color: "bg-blue-600" },
  { id: "techvision", name: "TechVision SAS", siren: "891 234 567", color: "bg-emerald-600" },
  { id: "greenway", name: "Greenway SARL", siren: "345 678 912", color: "bg-amber-600" },
  { id: "blueleaf", name: "BlueLeaf Industries SA", siren: "456 789 123", color: "bg-sky-600" },
  { id: "marchand", name: "Sophie Marchand", siren: "", color: "bg-rose-600" },
];

// Mock products for dropdown
const mockProducts = [
  { id: "flotte-auto", name: "Flotte Automobile", icon: "car" },
  { id: "rc-pro", name: "RC Professionnelle", icon: "shield" },
  { id: "multirisque", name: "Multirisque Bureaux", icon: "shield" },
  { id: "cyber", name: "Cyber Risques", icon: "shield" },
  { id: "dommages", name: "Dommages aux Biens", icon: "shield" },
  { id: "auto", name: "Auto", icon: "car" },
];

/* ── Client Logo (colored square with initial) ── */
function ClientLogo({ name, color }: { name: string; color: string }) {
  return (
    <div
      className={cn(
        "w-4 h-4 rounded text-white text-[9px] font-bold flex items-center justify-center shrink-0",
        color
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ── Searchable dropdown for Client ── */
function ClientDropdown({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const current = mockClients.find((c) => c.id === selectedId)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = mockClients.filter((c) =>
    `${c.name} ${c.siren}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-left shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:border-panora-text-muted transition-colors"
        >
          <ClientLogo name={current.name} color={current.color} />
          <span className="text-[13px] text-panora-text-primary flex-1">
            {current.name} -{" "}
            <span className="text-panora-text-secondary">SIREN {current.siren}</span>
          </span>
          <ChevronDown className="w-4 h-4 text-panora-text-muted" />
        </button>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-panora-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            placeholder="Rechercher un client..."
            className="w-full bg-white border border-panora-green rounded-lg pl-9 pr-4 py-2.5 text-[13px] outline-none ring-2 ring-panora-green/20"
          />
        </div>
      )}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-panora-border rounded-lg shadow-lg z-20 overflow-hidden">
          <div className="max-h-[200px] overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c.id);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2.5 text-left text-[13px] hover:bg-panora-tag/50 transition-colors",
                  c.id === selectedId && "bg-panora-green-light/50"
                )}
              >
                <ClientLogo name={c.name} color={c.color} />
                <span className="text-panora-text">
                  {c.name} - SIREN {c.siren}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2.5 text-[13px] text-panora-text-muted">
                Aucun résultat
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Warning/Error badge with ! icon ── */
function AlertBadge({ variant }: { variant: "warning" | "error" }) {
  return (
    <div
      className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
        variant === "warning" ? "bg-panora-warning" : "bg-panora-error"
      )}
    >
      <span className="text-white text-[10px] font-bold leading-none">!</span>
    </div>
  );
}

/* ── Document icon (gray square) ── */
function DocIcon() {
  return (
    <div className="bg-panora-secondary rounded p-1 shrink-0">
      <FileText className="w-3.5 h-3.5 text-panora-text-secondary" />
    </div>
  );
}

function PreparationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenario") || "rc-pro";
  const scenario = getScenario(scenarioId) || scenarios["rc-pro"];

  const [projectName, setProjectName] = useState(scenario.defaultProjectName);
  const [selectedClient, setSelectedClient] = useState(
    mockClients.find((c) => c.name === scenario.client)?.id || mockClients[1].id
  );
  const [selectedProduct, setSelectedProduct] = useState(scenarioId);
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>(
    scenario.defaultSelectedInsurers
  );
  const [instructions, setInstructions] = useState("");
  const [sections, setSections] = useState<ExtractedSection[]>(
    scenario.extractedSections
  );

  const stats = useMemo(() => getValidationStats(sections), [sections]);
  const noInsurers = selectedInsurers.length === 0;

  const handleToggleInsurer = (id: string) => {
    setSelectedInsurers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleLaunch = () => {
    const followupId = scenarioId === "auto" ? "cot-13" : "cot-1";
    router.push(`/quoting/followup?id=${followupId}`);
  };

  const currentProduct = mockProducts.find((p) => p.id === selectedProduct);
  const ProductIcon = currentProduct?.icon === "car" ? Car : Shield;

  const allAttachments = scenario.emailThread.flatMap((e) => e.attachments);

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-panora-bg">
        {/* Header - 44px */}
        <div className="h-[44px] shrink-0 border-b border-panora-border flex items-center justify-between px-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="text-[12px] text-panora-text-secondary hover:text-panora-text transition-colors"
            >
              ← Retour
            </button>
            <div className="w-px h-[13px] bg-[#d9d9d9]" />
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-panora-green" />
              <span className="text-[12px] font-medium text-panora-text-primary">
                Nouvelle cotation
              </span>
              <span className="text-[12px] text-panora-text-secondary">
                {scenario.cotationId || "COT-XXX"}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-panora-secondary rounded transition-colors text-panora-text-muted hover:text-panora-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title area - full width, border-bottom */}
        <div className="shrink-0 border-b border-panora-border p-6">
          <h1 className="text-2xl text-panora-text-primary font-serif tracking-[-0.24px] leading-7 mb-3">
            Préparer et lancer la cotation
          </h1>
          <p className="text-[13px] text-panora-text-secondary leading-5">
            Rassemblez ici tout ce dont les agents ont besoin pour saisir les
            devis sur les extranets. Documents, notes, emails… l&apos;extraction
            commence automatiquement.
          </p>
        </div>

        {/* Main content: two columns */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Column */}
          <div className="flex-1 border-r border-panora-border overflow-y-auto">
            {/* Email banner section */}
            <div className="bg-white border-b border-panora-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-panora-green flex items-center justify-center shrink-0">
                    <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                      <path d="M7.5 5L0.5 9.33V0.67L7.5 5Z" fill="white" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-panora-text">
                    Cotation initiée par e-mail
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] text-panora-text-secondary">
                    Objet
                  </span>
                  <span className="text-[13px] text-panora-text max-w-[170px] truncate">
                    {scenario.emailThread[0].subject}
                  </span>
                  <button className="flex items-center gap-1.5 text-[12px] font-medium text-panora-green hover:underline">
                    Voir
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist section */}
            <div className="bg-white border-b border-panora-border px-6 py-4">
              <div className="flex items-center gap-2 mb-3.5">
                <ListChecks className="w-5 h-5 text-panora-text-secondary" />
                <span className="text-[13px] font-medium text-panora-text">
                  Pour lancer la cotation
                </span>
              </div>
              <div className="space-y-3.5">
                {stats.missingFields > 0 && (
                  <div className="flex items-center gap-[7px]">
                    <AlertBadge variant="warning" />
                    <span className="text-[13px] text-panora-warning-text">
                      {stats.missingFields} champ{stats.missingFields > 1 ? "s" : ""} requis à compléter
                    </span>
                  </div>
                )}
                {noInsurers && (
                  <div className="flex items-center gap-[7px]">
                    <AlertBadge variant="error" />
                    <span className="text-[13px] text-panora-text-primary">
                      Selectionner assureurs à solliciter (exemple)
                    </span>
                  </div>
                )}
                {stats.invalidFields > 0 && (
                  <div className="flex items-center gap-[7px]">
                    <AlertBadge variant="error" />
                    <span className="text-[13px] text-panora-text-primary">
                      {stats.invalidFields} champ{stats.invalidFields > 1 ? "s" : ""} invalide{stats.invalidFields > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {stats.missingFields === 0 &&
                  stats.invalidFields === 0 &&
                  !noInsurers && (
                    <div className="flex items-center gap-[7px]">
                      <CheckCircle2 className="w-5 h-5 text-panora-green" />
                      <span className="text-[13px] text-panora-green">
                        Tout est prêt pour lancer la cotation
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Form body */}
            <div className="bg-white border-b border-panora-border p-6">
              <h3 className="text-[15px] font-semibold text-panora-text mb-5">
                Projet de cotation
              </h3>

              <div className="space-y-4">
                {/* Nom du projet - half width */}
                <div className="max-w-[50%]">
                  <label className="text-[13px] font-medium text-panora-text block mb-1.5">
                    Nom du projet
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-[13px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green"
                  />
                </div>

                {/* Client - full width */}
                <div>
                  <label className="text-[13px] font-medium text-panora-text-primary block mb-1.5">
                    Client
                  </label>
                  <ClientDropdown
                    selectedId={selectedClient}
                    onSelect={setSelectedClient}
                  />
                </div>

                {/* Produit - full width */}
                <div>
                  <label className="text-[13px] font-medium text-panora-text block mb-1.5">
                    Produit
                  </label>
                  <div className="flex items-center gap-1.5 w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                    <ProductIcon className="w-4 h-4 text-panora-text-muted shrink-0" />
                    <span className="text-[13px] text-panora-text flex-1">
                      {currentProduct?.name || scenario.product}
                    </span>
                    <button
                      onClick={() => setSelectedProduct("")}
                      className="p-0.5 hover:bg-panora-tag rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-panora-text-muted" />
                    </button>
                  </div>
                </div>

                {/* Assureurs - full width */}
                <div>
                  <label className="text-[13px] font-medium text-panora-text-primary block mb-2">
                    Assureurs à solliciter
                  </label>
                  <InsurerSelector
                    selectedIds={selectedInsurers}
                    onToggle={handleToggleInsurer}
                    product={currentProduct?.name || scenario.product}
                    insurers={scenario.availableInsurers}
                  />
                </div>
              </div>
            </div>

            {/* Documents & Instructions */}
            <div className="bg-white p-6">
              <h3 className="text-[15px] font-semibold text-panora-text mb-6">
                Documents & instructions
              </h3>

              {/* Documents sub-section */}
              <div className="mb-5">
                <p className="text-[13px] font-medium text-panora-text-primary mb-1">
                  Documents
                </p>
                <p className="text-[13px] text-panora-text-secondary leading-5 mb-5">
                  Les pièces jointes de l&apos;email sont extraites
                  automatiquement pour remplir les champs à droite.
                  Vous pouvez ajouter d&apos;autres documents.
                </p>

                {/* Document list */}
                <div className="space-y-3">
                  {allAttachments.map((att, i) => (
                    <div key={att.name}>
                      <div className="flex items-center gap-2">
                        <DocIcon />
                        <span className="text-[13px] text-panora-text-primary truncate flex-1">
                          {att.name}
                        </span>
                        <span className="text-[12px] text-panora-text-muted shrink-0 text-right flex-1">
                          {att.fieldsExtracted} champs extraits
                        </span>
                      </div>
                      {i < allAttachments.length - 1 && (
                        <div className="h-px bg-panora-border mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div className="border-2 border-dashed border-panora-border rounded-2xl py-8 px-6 text-center bg-panora-drop hover:border-panora-green/30 transition-colors cursor-pointer mb-6">
                <CloudUpload className="w-8 h-8 text-panora-text-muted mx-auto mb-2" />
                <p className="text-[13px] font-medium text-panora-text">
                  Glissez-déposez vos fichiers ici
                </p>
                <p className="text-[12px] text-panora-text-muted mt-1">
                  ou{" "}
                  <span className="text-panora-green font-medium cursor-pointer hover:underline">
                    parcourir
                  </span>{" "}
                  · Contraintes fichiers, PDF, Images, Word...
                </p>
              </div>

              {/* Instructions */}
              <div>
                <p className="text-[13px] font-medium text-panora-text-primary mb-1">
                  Instructions à l&apos;agent de cotation
                </p>
                <p className="text-[13px] text-panora-text-secondary mb-2 leading-5">
                  Informations supplémentaires non couvertes par les champs à
                  droite.
                  Contexte, préférences, consignes spécifiques.
                </p>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={`Ex: Le client veut absolument moins cher que le contrat actuel\nEx : Privilégier les formules sans franchise dégât des eaux..\nEx : .....`}
                  rows={5}
                  className="w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-[13px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green resize-y placeholder:text-panora-text-muted/60"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Beige background */}
          <div className="flex-1 bg-panora-bg overflow-y-auto">
            <div className="p-6">
              <ExtractedDataPanel
                sections={scenario.extractedSections}
                onSectionsChange={setSections}
              />
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="shrink-0 border-t border-panora-border bg-white px-6 py-3 flex items-center justify-end">
          <button
            onClick={handleLaunch}
            className="btn-primary px-6 py-2.5 text-[13px] font-semibold transition-colors"
          >
            Lancer la cotation
          </button>
        </div>
    </div>
  );
}

export default function PreparationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <p className="text-[13px] text-panora-text-muted">Chargement…</p>
        </div>
      }
    >
      <PreparationContent />
    </Suspense>
  );
}
