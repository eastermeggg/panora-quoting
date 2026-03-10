"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Upload,
  CheckCircle2,
  ListChecks,
  Building2,
  Car,
  Shield,
  ChevronDown,
  Paperclip,
  Search,
  Play,
  ExternalLink,
  X,
  CloudUpload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";
import { InsurerSelector } from "@/components/quoting/InsurerSelector";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { getScenario, getValidationStats, scenarios } from "@/data/scenarios";
import type { ExtractedSection } from "@/data/scenarios";

// Mock clients for dropdown
const mockClients = [
  { id: "acme", name: "ACME Corp SAS", siren: "523 847 196", color: "bg-purple-600" },
  { id: "marble", name: "Marble Tech SAS", siren: "00007U26464", color: "bg-blue-600" },
  { id: "techvision", name: "TechVision SAS", siren: "891 234 567", color: "bg-emerald-600" },
  { id: "greenway", name: "Greenway SARL", siren: "345 678 912", color: "bg-amber-600" },
  { id: "blueleaf", name: "BlueLeaf Industries SA", siren: "456 789 123", color: "bg-sky-600" },
];

// Mock products for dropdown
const mockProducts = [
  { id: "flotte-auto", name: "Flotte Automobile", icon: "car" },
  { id: "rc-pro", name: "RC Professionnelle", icon: "shield" },
  { id: "multirisque", name: "Multirisque Bureaux", icon: "shield" },
  { id: "cyber", name: "Cyber Risques", icon: "shield" },
  { id: "dommages", name: "Dommages aux Biens", icon: "shield" },
];

/* ── Client Logo (colored square with initial) ── */
function ClientLogo({ name, color }: { name: string; color: string }) {
  return (
    <div
      className={cn(
        "w-6 h-6 rounded text-white text-[11px] font-bold flex items-center justify-center shrink-0",
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
      <label className="text-xs font-medium text-panora-text block mb-1.5">
        Client
      </label>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-left hover:border-panora-text-muted transition-colors"
        >
          <ClientLogo name={current.name} color={current.color} />
          <span className="text-sm text-panora-text flex-1">
            {current.name} - SIREN {current.siren}
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
            className="w-full bg-white border border-panora-green rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none ring-2 ring-panora-green/20"
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
                  "flex items-center gap-2.5 w-full px-3 py-2.5 text-left text-sm hover:bg-panora-tag/50 transition-colors",
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
              <div className="px-3 py-2.5 text-sm text-panora-text-muted">
                Aucun résultat
              </div>
            )}
          </div>
        </div>
      )}
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
    router.push("/quoting/followup");
  };

  const currentProduct = mockProducts.find((p) => p.id === selectedProduct);
  const ProductIcon = currentProduct?.icon === "car" ? Car : Shield;

  // Aggregate all attachments from email thread
  const allAttachments = scenario.emailThread.flatMap((e) => e.attachments);

  return (
    <div className="flex flex-col h-screen">
      <TopBar variant="preparation" cotationId={scenario.cotationId} />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left column */}
        <div className="w-full lg:w-1/2 bg-white overflow-y-auto">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-white px-8 pt-6 pb-4 border-b border-panora-border">
            <h1 className="text-xl font-semibold text-panora-text mb-1 font-serif">
              Préparer et lancer la cotation
            </h1>
            <p className="text-sm text-panora-text-secondary leading-relaxed">
              Rassemblez ici tout ce dont les agents ont besoin pour saisir les
              devis sur les extranets. Documents, notes, emails… l&apos;extraction
              commence automatiquement.
            </p>
          </div>

          <div className="px-8 py-6">
            {/* Email banner */}
            <div className="mb-5">
              <div className="flex items-center gap-2 bg-panora-green-light rounded-lg px-3 py-2.5 text-sm">
                <div className="w-5 h-5 rounded-full bg-panora-green flex items-center justify-center shrink-0">
                  <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                </div>
                <span className="text-panora-text font-medium">
                  Cotation initiée par e-mail
                </span>
                <div className="flex-1" />
                <span className="text-panora-text-secondary text-xs truncate max-w-[200px]">
                  Objet: {scenario.emailThread[0].subject}
                </span>
                <button className="text-panora-green hover:underline text-xs font-medium flex items-center gap-1 shrink-0">
                  Voir
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Validation checklist */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-4 h-4 text-panora-text-muted" />
                <span className="text-sm font-medium text-panora-text">
                  Pour lancer la cotation
                </span>
              </div>
              <div className="space-y-2.5">
                {stats.missingFields > 0 && (
                  <div className="flex items-center gap-2.5 text-sm text-panora-warning">
                    <span className="w-2 h-2 rounded-full bg-panora-warning shrink-0" />
                    <span>
                      {stats.missingFields} champ
                      {stats.missingFields > 1 ? "s" : ""} requis à compléter
                    </span>
                  </div>
                )}
                {noInsurers && (
                  <div className="flex items-center gap-2.5 text-sm text-panora-warning">
                    <span className="w-2 h-2 rounded-full bg-panora-warning shrink-0" />
                    <span>Sélectionner assureurs à solliciter (exemple)</span>
                  </div>
                )}
                {stats.invalidFields > 0 && (
                  <div className="flex items-center gap-2.5 text-sm text-panora-error">
                    <span className="w-2 h-2 rounded-full bg-panora-error shrink-0" />
                    <span>
                      {stats.invalidFields} champ
                      {stats.invalidFields > 1 ? "s" : ""} invalide
                      {stats.invalidFields > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {stats.missingFields === 0 &&
                  stats.invalidFields === 0 &&
                  !noInsurers && (
                    <div className="flex items-center gap-2.5 text-sm text-panora-green">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tout est prêt pour lancer la cotation</span>
                    </div>
                  )}
              </div>
            </div>

            {/* Project section */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-panora-text mb-4">
                Projet de cotation
              </h3>
              <div className="space-y-4">
                {/* Project name */}
                <div>
                  <label className="text-xs font-medium text-panora-text block mb-1.5">
                    Nom du projet
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green"
                  />
                </div>

                {/* Client */}
                <ClientDropdown
                  selectedId={selectedClient}
                  onSelect={setSelectedClient}
                />

                {/* Product — display field with X to clear */}
                <div>
                  <label className="text-xs font-medium text-panora-text block mb-1.5">
                    Produit
                  </label>
                  <div className="flex items-center gap-2.5 w-full bg-white border border-panora-border rounded-lg px-3 py-2.5">
                    <ProductIcon className="w-4 h-4 text-panora-text-muted shrink-0" />
                    <span className="text-sm text-panora-text flex-1">
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
              </div>
            </div>

            {/* Insurers section */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-panora-text mb-4">
                Assureurs à solliciter
              </h3>
              <InsurerSelector
                selectedIds={selectedInsurers}
                onToggle={handleToggleInsurer}
                product={currentProduct?.name || scenario.product}
                insurers={scenario.availableInsurers}
              />
            </div>

            {/* Documents & Instructions */}
            <div>
              <h3 className="text-base font-semibold text-panora-text mb-4">
                Documents & instructions
              </h3>

              {/* Documents */}
              <h4 className="text-sm font-medium text-panora-text mb-2">
                Documents
              </h4>
              <p className="text-xs text-panora-text-secondary mb-3 leading-relaxed">
                Les pièces jointes de l&apos;email sont extraites
                automatiquement pour remplir les champs à droite.
                <br />
                Vous pouvez ajouter d&apos;autres documents.
              </p>
              <div className="space-y-1 mb-5">
                {allAttachments.map((att) => (
                  <div
                    key={att.name}
                    className="flex items-center gap-2.5 py-2"
                  >
                    <Paperclip className="w-4 h-4 text-red-400 shrink-0" />
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
              <div className="border-2 border-dashed border-panora-border rounded-2xl py-8 px-6 text-center bg-panora-drop hover:border-panora-green/30 transition-colors cursor-pointer mb-8">
                <CloudUpload className="w-8 h-8 text-panora-text-muted mx-auto mb-2" />
                <p className="text-sm font-medium text-panora-text">
                  Glissez-déposez vos fichiers ici
                </p>
                <p className="text-xs text-panora-text-muted mt-1">
                  ou{" "}
                  <span className="text-panora-green font-medium cursor-pointer hover:underline">
                    parcourir
                  </span>{" "}
                  · Contraintes fichiers, PDF, Images, Word...
                </p>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-sm font-medium text-panora-text mb-1">
                  Instructions à l&apos;agent de cotation
                </h4>
                <p className="text-xs text-panora-text-secondary mb-2 leading-relaxed">
                  Informations supplémentaires non couvertes par les champs à
                  droite.
                  <br />
                  Contexte, préférences, consignes spécifiques.
                </p>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={`Ex: Le client veut absolument moins cher que le contrat actuel\nEx : Privilégier les formules sans franchise dégât des eaux..\nEx : .....`}
                  rows={5}
                  className="w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green resize-y placeholder:text-panora-text-muted/60"
                />
              </div>
            </div>
          </div>

          {/* CTA button - sticky bottom */}
          <div className="sticky bottom-0 z-10 bg-white border-t border-panora-border p-4 flex items-center justify-end gap-3">
            <button
              onClick={handleLaunch}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-panora-text-secondary bg-white border border-panora-border rounded-[10px] hover:bg-panora-btn-secondary transition-all duration-200 ease-in-out"
            >
              Simuler la cotation
            </button>
            <button
              onClick={handleLaunch}
              className="btn-primary px-6 py-2.5 text-sm font-semibold transition-colors"
            >
              Lancer la cotation
            </button>
          </div>
        </div>

        {/* Right column - Beige background with white cards */}
        <div className="w-full lg:w-1/2 bg-panora-bg overflow-y-auto">
          <div className="px-8 py-6">
            <ExtractedDataPanel
              sections={scenario.extractedSections}
              onSectionsChange={setSections}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreparationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <p className="text-sm text-panora-text-muted">Chargement…</p>
        </div>
      }
    >
      <PreparationContent />
    </Suspense>
  );
}
