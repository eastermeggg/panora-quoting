"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, FileText, Inbox, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAppetit,
  getDraftForDossier,
  isDossierReady,
  produitsLabel,
} from "@/data/souscription-engine";
import { useSouscriptionFormsTick } from "@/data/souscription-store";
import type { Dossier } from "@/data/souscription-mock";
import { TarificationArtefact } from "./TarificationArtefact";
import { AgentColumn } from "./AgentColumn";
import { useCopilote } from "./useCopilote";
import { TarificationProcess } from "./TarificationProcess";
import { AppetitReason } from "./AppetitReason";
import { DonneesTab } from "./DonneesTab";
import { PiecesTab } from "./PiecesTab";

type DetailTab = "tarification" | "donnees" | "pieces";

const LEGAL_FORMS = new Set(["SAS", "SARL", "SA", "SASU", "EURL", "SCI", "SNC"]);

/** Up to two initials for the client logo, ignoring the trailing legal form. */
function clientInitials(raison: string): string {
  const words = raison
    .split(/\s+/)
    .filter((w) => w && !LEGAL_FORMS.has(w.replace(/\./g, "").toUpperCase()));
  if (words.length === 0) return raison.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Dossier detail: one shell, three tabs (Tarification [default] / Données /
 * Pièces). The Données tab reviews the structured data; the collecte/préparation
 * (manques + broker form) is its OWN dedicated screen (`/dossier/[id]/collecte`).
 * The header carries identity only; verdict metrics live in the
 * synthèse, disposition actions in the artefact's foot bar. On the tarification
 * tab, the co-pilote is a full-page-height rail down the right side.
 */
export function DossierDetail({ dossier }: { dossier: Dossier }) {
  useSouscriptionFormsTick();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initialTab: DetailTab = (() => {
    const t = searchParams.get("tab");
    return t === "donnees" || t === "pieces" ? t : "tarification";
  })();
  const [tab, setTab] = useState<DetailTab>(initialTab);
  const [launchRunning, setLaunchRunning] = useState(
    searchParams.get("launch") === "1"
  );

  const appetit = getAppetit(dossier);
  const draft = getDraftForDossier(dossier.id) ?? null;
  const dans = appetit.verdict === "dans_appetit";
  const collecteHref = `/souscription/dossier/${dossier.id}/collecte`;

  // Owns ALL co-pilote/draft state so the artefact (left) and the chat rail
  // (right) act on the same draft. Called unconditionally (draft may be null).
  const copilote = useCopilote(dossier, draft);

  // The tarification tab shows the priced artefact only when in appetite, ready,
  // and not mid-launch. That is exactly when the co-pilote rail rides alongside.
  const showArtefact = tab === "tarification" && dans && !!draft && !launchRunning;

  // A demande that still needs data belongs on the collecte screen. A refusal
  // (hors appétit) skips it — no point collecting on a risk we won't cover.
  const needsCollecte =
    !isDossierReady(dossier.id) && appetit.verdict !== "hors_appetit";

  return (
    <div className="flex-1 flex min-h-0 min-w-0 bg-white">
      {/* Left column — header + tabs + body */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
        {/* Header — identity only */}
        <div className="shrink-0 border-b border-panora-border px-6 py-3 flex items-center gap-2.5 min-w-0">
          <Link
            href="/souscription"
            aria-label="Retour aux demandes"
            className="shrink-0 text-panora-text-muted hover:text-panora-text transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span
            aria-hidden
            className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-panora-secondary text-[11px] font-semibold text-panora-text-secondary"
          >
            {clientInitials(dossier.insured.raison)}
          </span>
          <h1 className="text-[14px] font-medium text-panora-text truncate min-w-0">
            {dossier.insured.raison}
          </h1>
          <div className="flex items-center gap-1 shrink-0">
            {dossier.produitsDemandes.map((p) => (
              <span
                key={p}
                className="inline-flex items-center h-5 px-1.5 rounded-[5px] bg-panora-secondary text-[11px] font-medium text-panora-text-muted whitespace-nowrap"
              >
                {produitsLabel([p])}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 border-b border-panora-border px-6 flex items-center gap-1">
          <TabBtn active={tab === "tarification"} onClick={() => setTab("tarification")}>
            <Sparkles className="w-3.5 h-3.5" />
            Tarification
          </TabBtn>
          <TabBtn active={tab === "donnees"} onClick={() => setTab("donnees")}>
            <FileText className="w-3.5 h-3.5" />
            Données
          </TabBtn>
          <TabBtn active={tab === "pieces"} onClick={() => setTab("pieces")}>
            <Inbox className="w-3.5 h-3.5" />
            Pièces
          </TabBtn>
        </div>

        {/* Body */}
        {tab === "tarification" ? (
          needsCollecte ? (
            <AwaitingData ready={isDossierReady(dossier.id)} href={collecteHref} />
          ) : !dans ? (
            <AppetitReason appetit={appetit} />
          ) : launchRunning && draft ? (
            <TarificationProcess
              dossier={dossier}
              draft={draft}
              onComplete={() => {
                setLaunchRunning(false);
                router.replace(pathname);
              }}
            />
          ) : draft ? (
            <TarificationArtefact dossier={dossier} draft={draft} api={copilote} />
          ) : (
            <AwaitingData ready={isDossierReady(dossier.id)} href={collecteHref} />
          )
        ) : tab === "donnees" ? (
          <DonneesTab dossier={dossier} />
        ) : (
          <PiecesTab dossier={dossier} />
        )}
      </div>

      {/* Right — the co-pilote, full page height (only alongside the artefact) */}
      {showArtefact && (
        <AgentColumn
          messages={copilote.messages}
          suggestions={copilote.suggestions}
          onSend={copilote.sendChat}
          onApplyCard={copilote.applyCard}
          onScopeCard={copilote.scopeCard}
          onCancelCard={copilote.cancelCard}
        />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 h-10 px-2.5 text-[13px] font-medium transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-panora-green/30",
        active
          ? "text-panora-text"
          : "text-panora-text-muted hover:text-panora-text"
      )}
    >
      {children}
      {active && (
        <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-panora-text rounded-full" />
      )}
    </button>
  );
}

function AwaitingData({ ready, href }: { ready: boolean; href: string }) {
  return (
    <div className="flex-1 min-h-0 flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center gap-3 max-w-[420px]">
        <div className="w-10 h-10 rounded-full bg-panora-warning-bg flex items-center justify-center">
          <FileText className="w-5 h-5 text-panora-warning-text" />
        </div>
        <h2 className="text-[16px] font-serif text-panora-text leading-6">
          {ready ? "Prêt à tarifer" : "Données en cours de collecte"}
        </h2>
        <p className="text-[13px] text-panora-text-secondary leading-5">
          {ready
            ? "Lancez la tarification depuis l'écran de préparation."
            : "Le dossier attend des informations. Complétez-le dans la préparation pour débloquer la tarification."}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-panora-border text-[13px] font-medium text-panora-text hover:bg-panora-drop transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panora-green/30"
        >
          <FileText className="w-4 h-4 text-panora-text-secondary" />
          Aller à la préparation
        </Link>
      </div>
    </div>
  );
}
