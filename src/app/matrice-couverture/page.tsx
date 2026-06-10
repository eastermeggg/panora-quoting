"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search, Send, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import {
  COVERAGE_PRODUCT_ORDER,
  ROADMAP_STATUS_ORDER,
  coverageMatrix,
  coverageVoteKey,
  toggleCoverageVote,
  useCoverageVotes,
  type CoverageCell,
  type InsuranceProduct,
  type InsurerCoverage,
  type RoadmapStatus,
} from "@/data/settings-mock";

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  available: "Disponible",
  short_term: "Court terme",
  mid_term: "Moyen terme",
  long_term: "Long terme",
  not_planned: "Non prévu",
};

const STATUS_CELL_CLASS: Record<RoadmapStatus, string> = {
  available:
    "bg-panora-green-light text-panora-green-dark border-panora-green-border",
  short_term: "bg-[#f5e7d5] text-[#8a4a1d] border-[#e8d2b3]",
  mid_term: "bg-[#f6e1db] text-[#a04a32] border-[#ecccc0]",
  long_term:
    "bg-panora-secondary text-panora-text-secondary border-panora-border",
  not_planned: "bg-transparent text-panora-text-muted border-transparent",
};

const PRODUCT_SHORT_LABEL: Record<InsuranceProduct, string> = {
  Auto: "Auto",
  MRI: "MRI",
  MRP: "MRP",
  Santé: "Santé",
  "RC Pro": "RC Pro",
  Cyber: "Cyber",
  Flotte: "Flotte",
  Décennale: "Décennale",
  "D&O": "D&O",
  PJ: "PJ",
  "Homme clé": "Homme clé",
  "Marchandises transportées": "March. transp.",
  "Bris de machine": "Bris machine",
  "Perte d'exploitation": "Perte expl.",
  Construction: "Construction",
};

export default function MatricePage() {
  const [search, setSearch] = useState("");
  const votes = useCoverageVotes();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coverageMatrix;
    return coverageMatrix.filter((c) => {
      if (c.insurerName.toLowerCase().includes(q)) return true;
      return COVERAGE_PRODUCT_ORDER.some(
        (p) => p.toLowerCase().includes(q) && c.coverage[p]
      );
    });
  }, [search]);

  const stats = useMemo(() => {
    let available = 0;
    let planned = 0;
    for (const insurer of coverageMatrix) {
      for (const product of COVERAGE_PRODUCT_ORDER) {
        const cell = insurer.coverage[product];
        if (!cell) continue;
        if (cell.status === "available") available++;
        else if (cell.status !== "not_planned") planned++;
      }
    }
    return {
      available,
      planned,
      insurers: coverageMatrix.length,
      products: COVERAGE_PRODUCT_ORDER.length,
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <MarketingTopBar />
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14 flex flex-col gap-10">
          <Header />
          <div className="flex flex-col gap-4">
            <SearchBar value={search} onChange={setSearch} />
            <Legend />
          </div>
          <StatsBar {...stats} myVoteCount={votes.mine.size} />
          <MatrixGrid filtered={filtered} votes={votes} />
          <AskForm />
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

function MarketingTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 lg:px-10 h-14 border-b border-panora-border bg-white/90 backdrop-blur-sm">
      <a
        href="https://panora.co"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center"
        aria-label="Panora"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/panora-wordmark.png"
          alt="Panora"
          className="h-[22px] w-auto"
        />
      </a>
      <a
        href="/quoting"
        className="btn-primary inline-flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold leading-4"
      >
        Accéder à l&apos;app
      </a>
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-t border-panora-border bg-panora-bg/60">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-[12px] text-panora-text-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/panora-wordmark.png"
            alt="Panora"
            className="h-[18px] w-auto opacity-70"
          />
          <span>· Mise à jour chaque lundi par l&apos;équipe modélisation</span>
        </div>
        <a
          href="https://panora.co"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-medium text-panora-text-secondary hover:text-panora-text leading-4"
        >
          panora.co
        </a>
      </div>
    </footer>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider leading-4">
        Ressources
      </span>
      <h1 className="text-[24px] font-serif leading-7 text-panora-text">
        Matrice de couverture
      </h1>
      <p className="text-[13px] text-panora-text-secondary leading-5 max-w-[680px]">
        Quels produits sont modélisés chez quel assureur, et ce qui arrive
        ensuite. Mise à jour tous les lundis par l&apos;équipe modélisation.
      </p>
    </div>
  );
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative max-w-[420px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-panora-text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher un assureur ou un produit…"
        className="w-full h-10 pl-9 pr-3 text-[13px] bg-white border border-panora-border rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] placeholder:text-panora-text-muted focus:outline-none focus:border-panora-green focus:ring-2 focus:ring-panora-green/10 transition-colors"
      />
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {ROADMAP_STATUS_ORDER.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block w-3 h-3 rounded-sm border",
              status === "not_planned"
                ? "bg-transparent border-panora-border"
                : STATUS_CELL_CLASS[status]
            )}
          />
          <span className="text-[12px] text-panora-text-secondary">
            {STATUS_LABEL[status]}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatsBar({
  available,
  planned,
  insurers,
  products,
  myVoteCount,
}: {
  available: number;
  planned: number;
  insurers: number;
  products: number;
  myVoteCount: number;
}) {
  return (
    <div className="flex items-center gap-6 px-5 py-4 bg-panora-bg border border-panora-border rounded-lg flex-wrap">
      <Stat label="Combinaisons disponibles" value={available} accent="green" />
      <div className="w-px h-10 bg-panora-border" />
      <Stat label="Au roadmap" value={planned} />
      <div className="w-px h-10 bg-panora-border" />
      <Stat label="Assureurs suivis" value={insurers} />
      <div className="w-px h-10 bg-panora-border" />
      <Stat label="Produits suivis" value={products} />
      {myVoteCount > 0 && (
        <>
          <div className="w-px h-10 bg-panora-border" />
          <Stat label="Mes demandes" value={myVoteCount} />
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green";
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "text-[22px] font-serif tabular-nums leading-7",
          accent === "green" ? "text-panora-green" : "text-panora-text"
        )}
      >
        {value}
      </span>
      <span className="text-[11px] text-panora-text-muted leading-3 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function MatrixGrid({
  filtered,
  votes,
}: {
  filtered: InsurerCoverage[];
  votes: { counts: Record<string, number>; mine: ReadonlySet<string> };
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2.5 mb-3">
        <h2 className="text-[15px] font-semibold text-panora-text font-display">
          Couverture par assureur
        </h2>
        <span className="text-[12px] text-panora-text-muted">
          {filtered.length} assureur{filtered.length > 1 ? "s" : ""} ·
          cliquez{" "}
          <ThumbsUp className="inline w-3 h-3 -mt-px" /> pour demander une
          intégration
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptySearchResult />
      ) : (
        <div className="border border-panora-border rounded-lg overflow-x-auto bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-panora-bg">
                <th className="sticky left-0 bg-panora-bg z-10 text-left text-[11px] font-medium text-panora-text-muted uppercase tracking-wider px-4 py-3 border-b border-r border-panora-border min-w-[180px]">
                  Assureur
                </th>
                {COVERAGE_PRODUCT_ORDER.map((p) => (
                  <th
                    key={p}
                    className="text-center text-[11px] font-medium text-panora-text-muted uppercase tracking-wider px-2 py-3 border-b border-panora-border min-w-[92px] whitespace-nowrap"
                    title={p}
                  >
                    {PRODUCT_SHORT_LABEL[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((insurer) => (
                <tr
                  key={insurer.insurerId}
                  className="border-b border-panora-border last:border-b-0 hover:bg-panora-bg/40 transition-colors"
                >
                  <td className="sticky left-0 bg-white z-10 px-4 py-3 border-r border-panora-border">
                    <div className="flex items-center gap-2.5">
                      <InsurerLogo
                        insurerId={insurer.insurerId}
                        name={insurer.insurerName}
                        size="sm"
                      />
                      <span className="text-[13px] font-medium text-panora-text">
                        {insurer.insurerName}
                      </span>
                    </div>
                  </td>
                  {COVERAGE_PRODUCT_ORDER.map((p) => {
                    const key = coverageVoteKey(insurer.insurerId, p);
                    return (
                      <td key={p} className="text-center px-2 py-3 align-top">
                        <CoverageBadge
                          cell={insurer.coverage[p]}
                          insurerId={insurer.insurerId}
                          product={p}
                          voteCount={votes.counts[key] ?? 0}
                          voted={votes.mine.has(key)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CoverageBadge({
  cell,
  insurerId,
  product,
  voteCount,
  voted,
}: {
  cell?: CoverageCell;
  insurerId: string;
  product: InsuranceProduct;
  voteCount: number;
  voted: boolean;
}) {
  // Shipped — not votable.
  if (cell?.status === "available") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center w-6 h-6 rounded-full border",
          STATUS_CELL_CLASS.available
        )}
        title="Disponible"
      >
        <Check className="w-3.5 h-3.5" />
      </span>
    );
  }

  const status: RoadmapStatus = cell?.status ?? "not_planned";
  const isRequest = status === "not_planned";
  const periodLabel = cell?.targetLabel ?? STATUS_LABEL[status];
  const showVotes = voteCount > 0;

  return (
    <button
      type="button"
      onClick={() => toggleCoverageVote(insurerId, product)}
      aria-pressed={voted}
      title={
        voted
          ? "Retirer mon vote"
          : isRequest
            ? "Demander cette intégration"
            : `Voter pour prioriser — ${periodLabel}`
      }
      className="group inline-flex flex-col items-center gap-1 rounded-md p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30 cursor-pointer"
    >
      {!isRequest && (
        <span
          className={cn(
            "inline-flex items-center justify-center px-2 h-6 rounded-full border text-[11px] font-medium tabular-nums whitespace-nowrap transition-shadow group-hover:shadow-[0_0_0_2px_rgba(0,162,114,0.10)]",
            STATUS_CELL_CLASS[status]
          )}
        >
          {periodLabel}
        </span>
      )}
      {isRequest && !showVotes && (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-panora-border text-panora-text-muted group-hover:bg-panora-bg group-hover:border-panora-text-muted/50 group-hover:text-panora-text-secondary transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </span>
      )}
      {showVotes && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-[10px] tabular-nums leading-3 transition-colors",
            voted
              ? "text-panora-green-dark font-semibold"
              : "text-panora-text-muted group-hover:text-panora-text-secondary"
          )}
        >
          <ThumbsUp
            className={cn(
              "w-3 h-3 transition-colors",
              voted && "fill-panora-green text-panora-green-dark"
            )}
          />
          {voteCount}
        </span>
      )}
    </button>
  );
}

function EmptySearchResult() {
  return (
    <div className="border border-panora-border border-dashed rounded-lg p-10 text-center">
      <p className="text-[13px] text-panora-text-secondary">
        Aucun résultat. Si vous cherchez un assureur ou un produit que nous ne
        suivons pas,{" "}
        <a
          href="#demande"
          className="text-panora-green font-medium hover:underline"
        >
          dites-le-nous
        </a>
        .
      </p>
    </div>
  );
}

function AskForm() {
  const [insurer, setInsurer] = useState("");
  const [product, setProduct] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = insurer.trim().length > 0 || product.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    console.log("Coverage request:", { insurer, product, notes });
    setSubmitted(true);
    setInsurer("");
    setProduct("");
    setNotes("");
    window.setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div
      id="demande"
      className="flex flex-col gap-4 p-6 bg-panora-bg border border-panora-border rounded-lg scroll-mt-8"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-[15px] font-semibold text-panora-text font-display">
          Vous ne trouvez pas ce qu&apos;il vous faut ?
        </h2>
        <p className="text-[12px] text-panora-text-secondary leading-[18px] max-w-[560px]">
          Indiquez l&apos;assureur ou le produit qui vous manque. Vos demandes
          orientent directement la priorisation de la roadmap.
        </p>
      </div>

      {submitted ? (
        <div className="flex items-center gap-2 px-4 py-3 bg-panora-green-light border border-panora-green-border rounded-lg">
          <Check className="w-4 h-4 text-panora-green-dark shrink-0" />
          <p className="text-[13px] text-panora-green-dark font-medium">
            Merci, votre demande est arrivée. Réponse sous deux semaines
            ouvrées.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ask-insurer"
                className="text-[12px] font-medium text-panora-text"
              >
                Assureur
              </label>
              <input
                id="ask-insurer"
                type="text"
                value={insurer}
                onChange={(e) => setInsurer(e.target.value)}
                placeholder="Ex: Generali, MMA, COFACE…"
                className="h-10 px-3 text-[13px] bg-white border border-panora-border rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] placeholder:text-panora-text-muted focus:outline-none focus:border-panora-green focus:ring-2 focus:ring-panora-green/10 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ask-product"
                className="text-[12px] font-medium text-panora-text"
              >
                Produit
              </label>
              <input
                id="ask-product"
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Ex: Cyber, RC Pro, Décennale…"
                className="h-10 px-3 text-[13px] bg-white border border-panora-border rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] placeholder:text-panora-text-muted focus:outline-none focus:border-panora-green focus:ring-2 focus:ring-panora-green/10 transition-colors"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="ask-notes"
              className="text-[12px] font-medium text-panora-text"
            >
              Note{" "}
              <span className="text-panora-text-muted font-normal">
                (optionnel)
              </span>
            </label>
            <textarea
              id="ask-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Volume estimé, urgence, contexte client…"
              rows={3}
              className="px-3 py-2 text-[13px] bg-white border border-panora-border rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] placeholder:text-panora-text-muted focus:outline-none focus:border-panora-green focus:ring-2 focus:ring-panora-green/10 transition-colors resize-none"
            />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-[11px] text-panora-text-muted">
              Réponse sous deux semaines ouvrées.
            </p>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
              Envoyer la demande
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
