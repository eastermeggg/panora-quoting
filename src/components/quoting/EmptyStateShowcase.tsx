"use client";

import {
  Check,
  X as XIcon,
  Sparkles,
  RefreshCw,
  Truck,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";

/**
 * Floating "what you'll soon see" collage for the `/quoting` empty state.
 * Three overlapping mockup cards anchored to a fixed height; rotated slightly
 * for the leather-portfolio feel and hidden on viewports under 1024px where
 * the layout collapses to text + CTA only.
 */
export function EmptyStateShowcase() {
  return (
    <div className="relative h-full w-full overflow-hidden hidden lg:block bg-[#173c2d]">
      {/* Painterly landscape pinned to the bottom of the panel */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[42%] bg-cover bg-bottom pointer-events-none"
        style={{
          backgroundImage: "url(/onboarding/empty-state-landscape.jpg)",
        }}
      />
      {/* Thin gradient band above the landscape (the soft horizon glow) */}
      <div
        aria-hidden
        className="absolute left-0 right-0 h-[7%] bg-cover pointer-events-none"
        style={{
          bottom: "41%",
          backgroundImage: "url(/onboarding/empty-state-gradient.jpg)",
        }}
      />

      {/* Floating cards positioned over the dark portfolio "sky" */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full max-w-[540px] mx-auto px-6">
          <ProjectChecklistCard />
          <AxaCotationCard />
          <AxaReceivedCard />
          <GeneraliRelanceCard />
        </div>
      </div>
    </div>
  );
}

// ── Cards ──

function FloatingCard({
  style,
  className,
  children,
}: {
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute rounded-2xl bg-white border border-panora-border",
        "shadow-[0px_14px_36px_-10px_rgba(34,32,26,0.18),0px_2px_6px_-2px_rgba(34,32,26,0.08)]",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

function ProjectChecklistCard() {
  return (
    <FloatingCard
      style={{
        top: "72px",
        left: "0",
        width: "278px",
        transform: "rotate(-3deg)",
      }}
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-[15px] font-serif text-panora-text leading-5 tracking-[-0.01em]">
            Projet Flotte Auto 2026
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] text-panora-text-muted">
              <Truck className="w-3 h-3" />
              120 véhicules
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 h-4 rounded-full bg-panora-warning-bg text-[10px] font-semibold text-panora-warning-text">
              <span className="w-1 h-1 rounded-full bg-panora-warning-text" />
              Collecte en cours
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-1.5">
          <ChecklistRow state="done">KBis</ChecklistRow>
          <ChecklistRow state="done">Listing parc auto</ChecklistRow>
          <ChecklistRow state="done">Permis conducteurs</ChecklistRow>
          <ChecklistRow state="missing">Sinistralité sur 3 ans</ChecklistRow>
        </ul>

        <div className="pt-2 border-t border-panora-border flex items-center gap-1.5 text-[11px] text-panora-text-secondary">
          <RefreshCw className="w-3 h-3 text-panora-text-muted" />
          Relance programmée
        </div>
      </div>
    </FloatingCard>
  );
}

function AxaCotationCard() {
  return (
    <FloatingCard
      className="z-10"
      style={{
        top: "232px",
        left: "92px",
        width: "316px",
        transform: "rotate(1deg)",
      }}
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <InsurerLogo insurerId="axa" name="Axa" size="lg" />
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-panora-text leading-4 font-display">
              Axa
            </span>
            <span className="text-[11px] text-panora-text-muted leading-3">
              Cotation via site extranet
            </span>
          </div>
        </div>

        <div className="h-px bg-panora-border" />

        <ul className="flex flex-col gap-1.5">
          <TimelineRow state="done">Ouverture du portail (axa.com)</TimelineRow>
          <TimelineRow state="done">Saisie des identifiants</TimelineRow>
          <TimelineRow state="done">Remplissage du formulaire</TimelineRow>
          <TimelineRow state="done">Finalisation</TimelineRow>
          <TimelineRow state="active">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-panora-green-dark" />
              Récupération des documents
            </span>
          </TimelineRow>
        </ul>
      </div>
    </FloatingCard>
  );
}

function AxaReceivedCard() {
  return (
    <FloatingCard
      style={{
        top: "56px",
        right: "0",
        width: "238px",
        transform: "rotate(2deg)",
      }}
    >
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <InsurerLogo insurerId="axa" name="Axa" size="md" />
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-semibold text-panora-text leading-3">
                Axa
              </span>
              <span className="text-[10px] text-panora-text-muted leading-3">
                Reçu hier
              </span>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-panora-green-light">
            <Check className="w-3 h-3 text-panora-green-dark" strokeWidth={3} />
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <DocPill label="CG.pdf" />
          <DocPill label="Devis.pdf" />
        </div>
      </div>
    </FloatingCard>
  );
}

function GeneraliRelanceCard() {
  return (
    <FloatingCard
      style={{
        top: "200px",
        right: "8px",
        width: "238px",
        transform: "rotate(-2deg)",
      }}
    >
      <div className="p-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <InsurerLogo insurerId="generali" name="Generali" size="md" />
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-semibold text-panora-text leading-3">
              Generali
            </span>
            <span className="text-[10px] text-panora-text-muted leading-3">
              Relance dans 2j
            </span>
          </div>
        </div>
        <span className="shrink-0 w-2 h-2 rounded-full bg-panora-warning" />
      </div>
    </FloatingCard>
  );
}

// ── Row primitives ──

function ChecklistRow({
  state,
  children,
}: {
  state: "done" | "missing";
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2 text-[12px] leading-4">
      {state === "done" ? (
        <span className="shrink-0 w-4 h-4 rounded-full bg-panora-green-light flex items-center justify-center">
          <Check
            className="w-2.5 h-2.5 text-panora-green-dark"
            strokeWidth={3}
          />
        </span>
      ) : (
        <span className="shrink-0 w-4 h-4 rounded-full bg-panora-error-bg flex items-center justify-center">
          <XIcon className="w-2.5 h-2.5 text-panora-error" strokeWidth={3} />
        </span>
      )}
      <span
        className={cn(
          "flex-1 truncate",
          state === "done"
            ? "text-panora-text-secondary"
            : "text-panora-text font-medium"
        )}
      >
        {children}
      </span>
    </li>
  );
}

function TimelineRow({
  state,
  children,
}: {
  state: "done" | "active";
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2 text-[12px] leading-4">
      {state === "done" ? (
        <span className="shrink-0 w-4 h-4 rounded-full bg-panora-green-light flex items-center justify-center">
          <Check
            className="w-2.5 h-2.5 text-panora-green-dark"
            strokeWidth={3}
          />
        </span>
      ) : (
        <span className="shrink-0 w-4 h-4 rounded-full bg-white border border-panora-green-border flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-panora-green animate-pulse" />
        </span>
      )}
      <span
        className={cn(
          "flex-1 truncate",
          state === "active"
            ? "text-panora-text font-medium"
            : "text-panora-text-secondary"
        )}
      >
        {children}
      </span>
    </li>
  );
}

function DocPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 h-5 rounded-md bg-panora-secondary/60 border border-panora-border text-[10px] font-medium text-panora-text-secondary">
      <Paperclip className="w-2.5 h-2.5 text-panora-text-muted" />
      {label}
    </span>
  );
}
