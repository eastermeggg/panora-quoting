"use client";

import { useState, useEffect } from "react";
import {
  X,
  CloudUpload,
  FileText,
  Search,
  Check,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { BesoinTag } from "@/components/ui/BesoinTag";
import { PRODUCT_PRIORITY } from "@/data/mock";

// ─── Types ────────────────────────────────────────────────────────────

interface ComparisonWizardProps {
  onClose: () => void;
  onSubmit: (data: {
    client: string;
    products: string[];
    principalProduct: string | null;
    insurerIds: string[];
    besoinsClient: { id: string; value: string; source: "ai" | "manual" }[];
    skippedProfile: boolean;
  }) => void;
}

type MockDocument = { name: string; typeBadge: string };
type WizardOffer = {
  id: string;
  label: string;
  documents: MockDocument[];
  insurerName?: string;
};
type BesoinRow = { id: string; value: string; source: "ai" | "manual" };

// ─── Mock Data ────────────────────────────────────────────────────────

const MOCK_DOCUMENTS_BY_OFFER: Record<
  string,
  { insurerName: string; documents: MockDocument[] }
> = {
  A: {
    insurerName: "Axa",
    documents: [
      { name: "Devis_Axa_RC_Pro.pdf", typeBadge: "Devis" },
      { name: "CG_Axa_RC_Pro.pdf", typeBadge: "PDF" },
    ],
  },
  B: {
    insurerName: "Generali",
    documents: [
      { name: "Devis_Generali_RC.pdf", typeBadge: "Devis" },
      { name: "Tableau_Garanties_Generali.pdf", typeBadge: "PDF" },
      { name: "Fiche_IPID_Generali.pdf", typeBadge: "Conditions" },
    ],
  },
  C: {
    insurerName: "Allianz",
    documents: [
      { name: "Devis_Allianz_RC_Pro.pdf", typeBadge: "Devis" },
      { name: "CG_Allianz_RC_Pro.pdf", typeBadge: "PDF" },
    ],
  },
};

const PRODUCTS = ["RC Pro", "RC Exploitation", "Décennale", "D&O", "Apres livraison"];

const INITIAL_AI_BESOINS: BesoinRow[] = [
  { id: "ai-1", value: "Protection cyber minimum 500 000€", source: "ai" },
  { id: "ai-2", value: "Franchise maximale 1 000€ par sinistre", source: "ai" },
  { id: "ai-3", value: "Protection juridique incluse", source: "ai" },
];

const OFFER_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// ─── Component ────────────────────────────────────────────────────────

export function ComparisonWizard({ onClose, onSubmit }: ComparisonWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [offers, setOffers] = useState<WizardOffer[]>([
    { id: "A", label: "Offre A", documents: [] },
    { id: "B", label: "Offre B", documents: [] },
  ]);

  // Step 2 — preselect RC Pro as LLM suggestion
  const [selectedProducts, setSelectedProducts] = useState<string[]>(["RC Pro"]);
  const [principalProduct, setPrincipalProduct] = useState<string | null>("RC Pro");
  const [userOverride, setUserOverride] = useState(false);

  // Step 3
  const [besoinsClient, setBesoinsClient] =
    useState<BesoinRow[]>(INITIAL_AI_BESOINS);
  const [newBesoinInput, setNewBesoinInput] = useState("");

  // Auto-detect principal product based on priority
  useEffect(() => {
    if (!userOverride) {
      if (selectedProducts.length === 0) {
        setPrincipalProduct(null);
      } else {
        const best = selectedProducts.reduce((a, b) =>
          (PRODUCT_PRIORITY[a] ?? 99) <= (PRODUCT_PRIORITY[b] ?? 99) ? a : b,
        );
        setPrincipalProduct(best);
      }
    }
  }, [selectedProducts, userOverride]);

  const hasDocuments = offers.some((o) => o.documents.length > 0);
  const canProceedStep1 = hasDocuments;
  const canProceedStep2 = selectedProducts.length > 0;

  const handleAddDocuments = (offerId: string) => {
    const mock =
      MOCK_DOCUMENTS_BY_OFFER[offerId] ?? MOCK_DOCUMENTS_BY_OFFER["C"];
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              documents: mock.documents,
              insurerName: mock.insurerName,
            }
          : o,
      ),
    );
  };

  const handleAddOffer = () => {
    const nextIndex = offers.length;
    const letter = OFFER_LETTERS[nextIndex] ?? `${nextIndex + 1}`;
    setOffers((prev) => [
      ...prev,
      { id: letter, label: `Offre ${letter}`, documents: [] },
    ]);
  };

  const handleToggleProduct = (product: string) => {
    const wasSelected = selectedProducts.includes(product);
    setSelectedProducts((prev) =>
      wasSelected ? prev.filter((p) => p !== product) : [...prev, product],
    );
    if (wasSelected && product === principalProduct) {
      setUserOverride(false);
    }
  };

  const handleSetPrincipal = (product: string) => {
    setPrincipalProduct(product);
    setUserOverride(true);
  };

  const handleRemovePrincipal = () => {
    setUserOverride(false);
  };

  const handleRemoveBesoin = (id: string) => {
    setBesoinsClient((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddBesoin = () => {
    const value = newBesoinInput.trim();
    if (!value) return;
    setBesoinsClient((prev) => [
      ...prev,
      { id: `manual-${Date.now()}`, value, source: "manual" },
    ]);
    setNewBesoinInput("");
  };

  const handleSubmit = (skipProfile = false) => {
    const insurerIds = offers
      .filter((o) => o.insurerName)
      .map((o) => o.insurerName!.toLowerCase());
    onSubmit({
      client: "Marble Tech SAS",
      products: selectedProducts,
      principalProduct,
      insurerIds,
      besoinsClient: skipProfile ? [] : besoinsClient.map((b) => ({ id: b.id, value: b.value, source: b.source })),
      skippedProfile: skipProfile,
    });
  };

  const steps = [
    { num: 1, label: "Depot docs" },
    { num: 2, label: "Produits" },
    { num: 3, label: "Profil client" },
  ];

  const aiCount = besoinsClient.filter((b) => b.source === "ai").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[600px] max-h-[800px] bg-white rounded-[16px] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-panora-bg border-b border-panora-border">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-panora-text-muted" />
            <span className="text-[15px] font-medium text-panora-text font-serif">
              Lancer une comparaison
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
            <Step1Documents
              offers={offers}
              onAddDocuments={handleAddDocuments}
              onAddOffer={handleAddOffer}
            />
          )}
          {step === 2 && (
            <Step2Products
              products={PRODUCTS}
              selectedProducts={selectedProducts}
              principalProduct={principalProduct}
              userOverride={userOverride}
              onToggle={handleToggleProduct}
              onSetPrincipal={handleSetPrincipal}
              onRemovePrincipal={handleRemovePrincipal}
            />
          )}
          {step === 3 && (
            <Step3Profile
              besoinsClient={besoinsClient}
              newBesoinInput={newBesoinInput}
              onNewBesoinInputChange={setNewBesoinInput}
              onAddBesoin={handleAddBesoin}
              onRemoveBesoin={handleRemoveBesoin}
              aiCount={aiCount}
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
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="btn-primary px-4 py-2 text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Etape suivante
              </button>
            )}
            {step === 2 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={!canProceedStep2}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-panora-text-muted border border-panora-border rounded-[8px] hover:bg-panora-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  Lancer la comparaison
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="btn-primary px-4 py-2 text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Etape suivante
                </button>
              </div>
            )}
            {step === 3 && (
              <button
                onClick={() => handleSubmit(false)}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Lancer la comparaison
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Document Upload ──────────────────────────────────────────

function Step1Documents({
  offers,
  onAddDocuments,
  onAddOffer,
}: {
  offers: WizardOffer[];
  onAddDocuments: (offerId: string) => void;
  onAddOffer: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-serif text-panora-text">
        Deposez vos documents
      </h2>
      <p className="text-[13px] text-panora-text-muted leading-5">
        Ajoutez les devis et documents reçus de chaque assureur pour lancer la
        comparaison.
      </p>

      <div className="space-y-3">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onAddDocuments={() => onAddDocuments(offer.id)}
          />
        ))}
      </div>

      <button
        onClick={onAddOffer}
        className="flex items-center gap-2 text-[13px] text-panora-text-muted hover:text-panora-text transition-colors"
      >
        <Plus className="w-4 h-4" />
        Ajouter une nouvelle offre
      </button>
    </div>
  );
}

function OfferCard({
  offer,
  onAddDocuments,
}: {
  offer: WizardOffer;
  onAddDocuments: () => void;
}) {
  const hasDocs = offer.documents.length > 0;

  return (
    <div className="bg-panora-bg rounded-[16px] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-panora-text">
          {offer.label}
        </span>
        {offer.insurerName && (
          <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-panora-secondary text-[12px] text-panora-text-muted font-medium">
            {offer.insurerName}
          </span>
        )}
      </div>

      {!hasDocs ? (
        <button
          onClick={onAddDocuments}
          className="w-full rounded-[12px] border-2 border-dashed border-panora-border bg-gradient-to-b from-[rgba(34,32,26,0.05)] to-transparent p-6 flex flex-col items-center gap-3 hover:border-panora-text-muted transition-colors cursor-pointer"
        >
          <CloudUpload className="w-8 h-8 text-panora-text-muted" />
          <span className="text-[13px] text-panora-text-muted">
            Glissez vos fichiers ici ou
          </span>
          <span className="text-[13px] font-medium text-panora-green">
            + Ajouter vos documents
          </span>
        </button>
      ) : (
        <div className="space-y-2">
          {offer.documents.map((doc, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white rounded-[8px] px-3 py-2 border border-panora-border"
            >
              <FileText className="w-4 h-4 text-panora-text-muted shrink-0" />
              <span className="text-[13px] text-panora-text flex-1 truncate">
                {doc.name}
              </span>
              <span className="inline-flex h-5 items-center px-2 rounded-full bg-panora-secondary text-[12px] text-panora-text-muted shrink-0">
                {doc.typeBadge}
              </span>
            </div>
          ))}
          <button
            onClick={onAddDocuments}
            className="flex items-center gap-2 text-[13px] text-panora-green font-medium mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter des documents
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Product Selection ────────────────────────────────────────

function Step2Products({
  products,
  selectedProducts,
  principalProduct,
  userOverride,
  onToggle,
  onSetPrincipal,
  onRemovePrincipal,
}: {
  products: string[];
  selectedProducts: string[];
  principalProduct: string | null;
  userOverride: boolean;
  onToggle: (product: string) => void;
  onSetPrincipal: (product: string) => void;
  onRemovePrincipal: () => void;
}) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-serif text-panora-text">
        Produits d&apos;assurance
      </h2>
      <p className="text-[13px] text-panora-text-muted leading-5">
        Sélectionnez les produits inclus dans les offres.
      </p>

      {/* Search input (decorative) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-panora-text-muted" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          className="w-full bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] pl-9 pr-3 py-2.5 text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green transition-colors"
        />
      </div>

      <div className="space-y-2">
        {products.map((product) => {
          const selected = selectedProducts.includes(product);
          const isPrincipal = product === principalProduct;
          const isHovered = product === hoveredProduct;
          const multipleSelected = selectedProducts.length > 1;
          const showRemove = selected && isPrincipal && isHovered && multipleSelected;

          return (
            <div
              key={product}
              className={`w-full flex items-center gap-3 px-4 rounded-[8px] border transition-colors h-[44px] ${
                selected
                  ? "border-panora-border bg-panora-bg"
                  : "border-panora-border bg-white hover:bg-panora-bg"
              }`}
              onMouseEnter={() => setHoveredProduct(product)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <button
                onClick={() => onToggle(product)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div
                  className={`w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 ${
                    selected
                      ? "bg-panora-green"
                      : "bg-white border border-panora-border shadow-sm"
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[13px] text-panora-text">{product}</span>
                {selected && isPrincipal && !showRemove && (
                  <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-[#dbeee5] text-[12px] font-medium text-[#173c2d] leading-4">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#00a272] shrink-0" />
                    principal
                  </span>
                )}
              </button>

              {/* Hover actions */}
              <div className="flex items-center shrink-0">
                {showRemove && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemovePrincipal(); }}
                    className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[8px] bg-[#f6e1db] text-[13px] font-medium text-[#952617] hover:bg-[#f0d2c9] transition-colors"
                  >
                    Retirer principal
                  </button>
                )}

                {selected && !isPrincipal && isHovered && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSetPrincipal(product); }}
                    className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[8px] bg-panora-secondary text-[13px] font-medium text-panora-text-muted hover:bg-[#e2dfd8] transition-colors"
                  >
                    Définir comme principal
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info bar */}
      {selectedProducts.length > 0 && principalProduct && (
        <div className="px-3 py-2 rounded-[8px] bg-panora-bg text-[12px] text-[#5c5953] leading-[18px]">
          {userOverride ? (
            <>
              <span className="font-medium text-panora-text">{principalProduct}</span>
              {" "}défini comme produit principal.
            </>
          ) : (
            <>
              <span className="font-medium text-panora-text">{principalProduct}</span>
              {" "}détecté comme produit principal.
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Client Profile & Besoins ─────────────────────────────────

function Step3Profile({
  besoinsClient,
  newBesoinInput,
  onNewBesoinInputChange,
  onAddBesoin,
  onRemoveBesoin,
  aiCount,
}: {
  besoinsClient: BesoinRow[];
  newBesoinInput: string;
  onNewBesoinInputChange: (v: string) => void;
  onAddBesoin: () => void;
  onRemoveBesoin: (id: string) => void;
  aiCount: number;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-serif text-panora-text">
        Profil client
      </h2>

      {/* Client selector (read-only) */}
      <div>
        <label className="text-[13px] text-panora-text-muted mb-1.5 block">
          Client
        </label>
        <div className="flex items-center gap-3 bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] px-3 py-2.5 cursor-default">
          <div className="w-6 h-6 rounded-[6px] bg-panora-green/20 border border-black/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-panora-green">M</span>
          </div>
          <span className="text-[13px] text-panora-text flex-1">
            Marble Tech SAS — SIREN 00007U26464
          </span>
          <ChevronDown className="w-4 h-4 text-panora-text-muted" />
        </div>
      </div>

      {/* Besoins client */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
          <label className="text-[13px] font-medium text-panora-text">
            Synthese &amp; analyse IA — besoins client
          </label>
        </div>
        <p className="text-[12px] text-panora-text-muted mb-3 leading-[18px]">
          Chaque offre sera evaluee au regard de ces criteres pour generer votre synthese comparative.
        </p>

        <div className="space-y-2">
          {besoinsClient.map((besoin) => (
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
            placeholder="Ajoutez un besoin client. Ex: Couverture cyber minimum 500k€..."
            className="w-full bg-white border border-[#e2dfd8] rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] px-3 py-2 min-h-[36px] text-[13px] text-panora-text placeholder:text-panora-text-muted outline-none focus:border-panora-green transition-colors"
          />
        </div>

        <div className="mt-3 space-y-1.5">
          <p className="text-[12px] text-panora-text-muted">
            💡 Exemples : Franchise max 1 000€, Protection juridique incluse,
            Couverture monde entier
          </p>
          {aiCount > 0 && (
            <p className="text-[12px] text-panora-green flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {aiCount} elements detectes automatiquement
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
