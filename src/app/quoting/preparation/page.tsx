"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  AlertTriangle,
  Upload,
  CheckCircle2,
  ListChecks,
  Building2,
  Car,
  Shield,
  ChevronDown,
  Mail,
  Paperclip,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";
import { InsurerSelector } from "@/components/quoting/InsurerSelector";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { currentUser } from "@/data/mock";
import { getScenario, getValidationStats, scenarios } from "@/data/scenarios";
import type { ExtractedSection } from "@/data/scenarios";

// Mock clients for dropdown
const mockClients = [
  { id: "acme", name: "ACME Corp SAS", siren: "523 847 196" },
  { id: "marble", name: "Marble Tech SAS", siren: "00007U26464" },
  { id: "techvision", name: "TechVision SAS", siren: "891 234 567" },
  { id: "greenway", name: "Greenway SARL", siren: "345 678 912" },
  { id: "blueleaf", name: "BlueLeaf Industries SA", siren: "456 789 123" },
];

// Mock products for dropdown
const mockProducts = [
  { id: "flotte-auto", name: "Flotte Automobile", icon: "car" },
  { id: "rc-pro", name: "RC Professionnelle", icon: "shield" },
  { id: "multirisque", name: "Multirisque Bureaux", icon: "shield" },
  { id: "cyber", name: "Cyber Risques", icon: "shield" },
  { id: "dommages", name: "Dommages aux Biens", icon: "shield" },
];

function SearchableDropdown({
  label,
  value,
  icon: Icon,
  items,
  onSelect,
  renderItem,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  items: Array<{ id: string; display: string }>;
  onSelect: (id: string) => void;
  renderItem: (item: { id: string; display: string }) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

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

  const filtered = items.filter((i) =>
    i.display.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <label className="text-xs text-panora-text-muted block mb-1.5">
        {label}
      </label>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-left hover:border-panora-text-muted transition-colors"
        >
          <Icon className="w-4 h-4 text-panora-text-muted" />
          <span className="text-sm text-panora-text flex-1">{value}</span>
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
            placeholder="Rechercher..."
            className="w-full bg-white border border-panora-green rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none ring-2 ring-panora-green/20"
          />
        </div>
      )}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-panora-border rounded-lg shadow-lg z-20 overflow-hidden">
          <div className="max-h-[200px] overflow-y-auto">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  setOpen(false);
                  setSearch("");
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-left text-sm hover:bg-panora-tag/50 transition-colors"
              >
                {renderItem(item)}
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
    mockClients.find((c) => c.name === scenario.client)?.id || mockClients[0].id
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

  const currentClient = mockClients.find((c) => c.id === selectedClient)!;
  const currentProduct = mockProducts.find((p) => p.id === selectedProduct);
  const ProductIcon =
    currentProduct?.icon === "car" ? Car : Shield;

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
            <h1 className="text-xl font-semibold text-panora-text mb-1">
              Préparer et lancer la cotation
            </h1>
            <p className="text-sm text-panora-text-secondary leading-relaxed">
              Rassemblez ici tout ce dont les agents ont besoin pour saisir les
              devis sur les extranets. Documents, notes, emails… l&apos;extraction
              commence automatiquement.
            </p>
            <p className="text-xs text-panora-text-muted mt-2">
              Cotation initiée par {currentUser.name} ({currentUser.email})
            </p>
          </div>

          <div className="px-8 py-6">
            {/* Email banner */}
            <div className="mb-4">
              <div className="flex items-center gap-2 bg-panora-green-light rounded-lg px-3 py-2 text-sm">
                <Mail className="w-3.5 h-3.5 text-panora-green shrink-0" />
                <span className="text-panora-green font-medium">
                  Cotation initiée par e-mail
                </span>
                <div className="w-px h-4 bg-panora-green/20" />
                <span className="text-panora-text-secondary truncate text-xs">
                  {scenario.emailThread[0].subject}
                </span>
              </div>
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
                {stats.missingFields > 0 && (
                  <div className="flex items-center gap-2 text-sm text-panora-warning">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      {stats.missingFields} champ
                      {stats.missingFields > 1 ? "s" : ""} requis à compléter
                    </span>
                  </div>
                )}
                {noInsurers && (
                  <div className="flex items-center gap-2 text-sm text-panora-warning">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Sélectionner des assureurs à solliciter</span>
                  </div>
                )}
                {stats.invalidFields > 0 && (
                  <div className="flex items-center gap-2 text-sm text-panora-error">
                    <AlertTriangle className="w-3.5 h-3.5" />
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
                    <div className="flex items-center gap-2 text-sm text-panora-green">
                      <CheckCircle2 className="w-3.5 h-3.5" />
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
                <div>
                  <label className="text-xs text-panora-text-muted block mb-1.5">
                    Nom du projet
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green"
                  />
                </div>

                {/* Client searchable dropdown */}
                <SearchableDropdown
                  label="Client"
                  value={`${currentClient.name} — SIREN ${currentClient.siren}`}
                  icon={Building2}
                  items={mockClients.map((c) => ({
                    id: c.id,
                    display: `${c.name} — ${c.siren}`,
                  }))}
                  onSelect={setSelectedClient}
                  renderItem={(item) => (
                    <>
                      <Building2 className="w-4 h-4 text-panora-text-muted shrink-0" />
                      <span className="text-panora-text">{item.display}</span>
                    </>
                  )}
                />

                {/* Product searchable dropdown */}
                <SearchableDropdown
                  label="Produit"
                  value={currentProduct?.name || scenario.product}
                  icon={ProductIcon}
                  items={mockProducts.map((p) => ({
                    id: p.id,
                    display: p.name,
                  }))}
                  onSelect={setSelectedProduct}
                  renderItem={(item) => {
                    const prod = mockProducts.find((p) => p.id === item.id);
                    const PIcon = prod?.icon === "car" ? Car : Shield;
                    return (
                      <>
                        <PIcon className="w-4 h-4 text-panora-text-muted shrink-0" />
                        <span className="text-panora-text">{item.display}</span>
                      </>
                    );
                  }}
                />
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

              {/* Documents list */}
              <h4 className="text-sm font-medium text-panora-text mb-2">
                Documents ({allAttachments.length})
              </h4>
              <p className="text-xs text-panora-text-secondary mb-3 leading-relaxed">
                Les pièces jointes de l&apos;email sont extraites
                automatiquement pour remplir les champs à droite.
              </p>
              <div className="space-y-1.5 mb-4">
                {allAttachments.map((att) => (
                  <div
                    key={att.name}
                    className="flex items-center gap-2 px-3 py-2 bg-panora-drop rounded-lg"
                  >
                    <Paperclip className="w-4 h-4 text-panora-text-muted shrink-0" />
                    <span className="text-sm text-panora-text truncate flex-1">
                      {att.name}
                    </span>
                    <span className="text-xs text-panora-text-muted shrink-0">
                      {att.size}
                    </span>
                    <span className="text-xs text-panora-green font-medium shrink-0">
                      {att.fieldsExtracted} champs extraits
                    </span>
                  </div>
                ))}
              </div>

              {/* Drop zone */}
              <div className="border-2 border-dashed border-panora-border rounded-lg p-6 text-center bg-panora-drop hover:border-panora-green/30 transition-colors cursor-pointer mb-6">
                <Upload className="w-8 h-8 text-panora-text-muted mx-auto mb-2" />
                <p className="text-sm text-panora-text-secondary">
                  Ajouter d&apos;autres documents
                </p>
                <p className="text-xs text-panora-text-muted mt-1">
                  Glissez-déposez ou{" "}
                  <span className="text-panora-green font-medium cursor-pointer hover:underline">
                    parcourez
                  </span>{" "}
                  — PDF, images, Word
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
                  placeholder={`Ex: Le client veut absolument moins cher que le contrat actuel\nEx : Privilégier les formules sans franchise\nEx : ....`}
                  rows={5}
                  className="w-full bg-white border border-panora-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green resize-y placeholder:text-panora-text-muted/60"
                />
              </div>
            </div>
          </div>

          {/* CTA button - sticky bottom */}
          <div className="sticky bottom-0 z-10 bg-white border-t border-panora-border p-4 flex justify-end">
            <button
              onClick={handleLaunch}
              className="px-6 py-2.5 bg-panora-warning text-white text-sm font-semibold rounded-lg hover:bg-panora-warning/90 transition-colors shadow-sm"
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
