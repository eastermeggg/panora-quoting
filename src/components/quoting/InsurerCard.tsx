"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
  X,
  Clock,
  Paperclip,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LiveAgentTimeline } from "@/components/ui/LiveAgentTimeline";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { TwoFaActionBox } from "@/components/quoting/TwoFaActionBox";
import type { InsurerData } from "@/data/mock";

type InsurerStatus = "completed" | "action_required" | "in_progress";

interface InsurerCardProps {
  insurer: InsurerData;
  currentStatus: InsurerStatus;
  defaultExpanded?: boolean;
  onStatusChange?: (newStatus: InsurerStatus) => void;
}

export function InsurerCard({
  insurer,
  currentStatus,
  defaultExpanded = false,
  onStatusChange,
}: InsurerCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white border border-panora-border rounded-[10px] overflow-hidden shadow-[0px_3px_6px_0px_rgba(0,0,0,0.02),0px_11px_11px_0px_rgba(0,0,0,0.02),0px_24px_15px_0px_rgba(0,0,0,0.01)]">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-4 text-left hover:bg-panora-drop/30 transition-colors border-b border-panora-border"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3 text-panora-text-muted shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-panora-text-muted shrink-0" />
        )}

        <InsurerLogo insurerId={insurer.id} name={insurer.name} size="md" />
        <span className="text-[15px] font-semibold text-panora-text-primary leading-5">
          {insurer.name}
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-[11px]">
          <StatusBadge status={currentStatus} />
          <div className="w-px h-[15px] bg-panora-border" />
          <span className="text-[12px] text-panora-text-muted leading-4">
            {insurer.reference}
          </span>
          <div className="w-px h-[15px] bg-panora-border" />
          <a
            href="#"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[12px] text-panora-green hover:underline font-medium leading-[18px]"
          >
            Ouvrir dans l&apos;extranet
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-6">
          {currentStatus === "completed" && (
            <CompletedContent insurer={insurer} />
          )}

          {currentStatus === "in_progress" && (
            <InProgressContent
              insurer={insurer}
              onComplete={() => onStatusChange?.("completed")}
            />
          )}

          {currentStatus === "action_required" && (
            <ActionRequiredContent
              insurer={insurer}
              onValidate={() => onStatusChange?.("in_progress")}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Documents section ── */
function DocumentsSection({ documents }: { documents: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] font-medium text-panora-text-primary leading-5 px-0.5">
        Documents récupérés
      </p>
      {documents.map((doc, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-panora-bg border border-panora-border rounded-lg p-2.5"
        >
          <div className="bg-panora-secondary rounded p-1 shrink-0">
            <Paperclip className="w-3.5 h-3.5 text-panora-text-secondary" />
          </div>
          <span className="text-[13px] text-panora-text-primary truncate flex-1 leading-5">
            {doc}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Pricing table ── */
function PricingTable({
  pricing,
}: {
  pricing: Array<{ formula: string; monthly: string; annual: string }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] font-medium text-panora-text-primary leading-5 px-0.5">
        Tarifs / offres obtenues
      </p>
      <div className="border border-panora-border rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="flex bg-panora-bg border-b border-panora-border">
          <div className="flex-1 px-4 py-[11px]">
            <span className="text-[12px] font-medium text-panora-text-secondary leading-4">
              Formule
            </span>
          </div>
          <div className="w-[183px] px-4 py-[11px] text-right">
            <span className="text-[12px] font-medium text-panora-text-secondary leading-4">
              Montant mensuel
            </span>
          </div>
          <div className="w-[183px] px-4 py-[11px] text-right">
            <span className="text-[12px] font-medium text-panora-text-secondary leading-4">
              Montant annuel
            </span>
          </div>
        </div>
        {/* Table rows */}
        {pricing.map((row, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center",
              i < pricing.length - 1 && "border-b border-panora-border"
            )}
          >
            <div className="flex-1 px-4 py-4 flex items-center gap-2.5">
              <span className="text-[13px] font-medium text-panora-text leading-5 flex-1">
                {row.formula}
              </span>
              <div className="bg-panora-secondary rounded p-[3px] opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-3.5 h-3.5 text-panora-text-secondary" />
              </div>
            </div>
            <div className="w-[183px] px-4 py-4 text-right">
              <span className="text-[13px] font-medium text-panora-text leading-5">
                {row.monthly}
              </span>
            </div>
            <div className="w-[183px] px-4 py-4 text-right">
              <span className="text-[13px] font-medium text-panora-text leading-5">
                {row.annual}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Collapsible section ── */
function CollapsibleSection({
  title,
  headerRight,
  children,
  defaultOpen = false,
}: {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-0.5"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-panora-text-muted" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-panora-text-muted" />
        )}
        <span className="text-[13px] font-medium text-panora-text-primary leading-5">
          {title}
        </span>
        {headerRight}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ── Quote info grid ── */
function QuoteInfoGrid({
  quoteInfo,
}: {
  quoteInfo: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid grid-cols-3 gap-x-5">
      {quoteInfo.map((item, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-1 px-0.5 py-3",
            i < quoteInfo.length - 3 && "border-b border-panora-border"
          )}
        >
          <span className="text-[12px] font-medium text-panora-text-muted leading-4 w-[120px] shrink-0">
            {item.label}
          </span>
          <span className="text-[13px] text-panora-text-primary leading-5">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Completed state ── */
function CompletedContent({ insurer }: { insurer: InsurerData }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Documents */}
      {insurer.documents && insurer.documents.length > 0 && (
        <DocumentsSection documents={insurer.documents} />
      )}

      {/* Separator */}
      {insurer.pricing && insurer.pricing.length > 0 && (
        <>
          <div className="h-px bg-panora-border" />
          <PricingTable pricing={insurer.pricing} />
        </>
      )}

      {/* Separator + Agent actions */}
      <div className="h-px bg-panora-border" />
      <CollapsibleSection
        title="Dernières actions de l'agent"
        headerRight={
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDrawerOpen(true);
            }}
            className="text-[13px] font-medium text-panora-green leading-5 ml-2"
          >
            Voir tout
          </button>
        }
      >
        <LiveAgentTimeline
          allSteps={insurer.allSteps.slice(-4)}
          isCompleted
        />
      </CollapsibleSection>

      {/* Separator + Quote info */}
      {insurer.quoteInfo && insurer.quoteInfo.length > 0 && (
        <>
          <div className="h-px bg-panora-border" />
          <CollapsibleSection title="Informations devis">
            <QuoteInfoGrid quoteInfo={insurer.quoteInfo} />
          </CollapsibleSection>
        </>
      )}

      {/* Timeline drawer */}
      {drawerOpen && (
        <TimelineDrawer
          insurer={insurer}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

/* ── In-progress state ── */
function InProgressContent({
  insurer,
  onComplete,
}: {
  insurer: InsurerData;
  onComplete: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Video + Timeline side by side */}
      <div className="grid grid-cols-2 gap-4">
        <VideoPlaceholder isLive />
        <LiveAgentTimeline
          allSteps={insurer.allSteps}
          initialVisible={insurer.initialVisibleSteps ?? 3}
          stepInterval={2500}
          onComplete={onComplete}
        />
      </div>

      {/* Quote info if available */}
      {insurer.quoteInfo && insurer.quoteInfo.length > 0 && (
        <>
          <div className="h-px bg-panora-border" />
          <CollapsibleSection title="Informations devis">
            <QuoteInfoGrid quoteInfo={insurer.quoteInfo} />
          </CollapsibleSection>
        </>
      )}
    </div>
  );
}

/* ── Action required state ── */
function ActionRequiredContent({
  insurer,
  onValidate,
}: {
  insurer: InsurerData;
  onValidate: () => void;
}) {
  const actionType = insurer.twoFaAction?.type ?? "manual";
  const is2fa = actionType !== "manual";

  const [validating, setValidating] = useState(false);

  const handleValidate = () => {
    setValidating(true);
    setTimeout(() => {
      onValidate();
    }, 1500);
  };

  // Show only steps up to the blocking point (first non-success step)
  const blockingIndex = insurer.allSteps.findIndex(
    (s) => s.status === "in_progress" || s.status === "error"
  );
  const visibleSteps =
    blockingIndex >= 0
      ? insurer.allSteps.slice(0, blockingIndex + 1)
      : insurer.allSteps;
  const tailSteps = visibleSteps.slice(-4);

  return (
    <div className="flex flex-col gap-6">
      {/* 2FA action box — replaces the manual alert banner */}
      {is2fa && insurer.twoFaAction ? (
        <TwoFaActionBox
          action={insurer.twoFaAction}
          insurerName={insurer.name}
          onResolved={onValidate}
        />
      ) : (
        /* Manual action banner — Figma style */
        <div className="relative bg-[rgba(242,221,193,0.4)] rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex items-end gap-1.5 pl-[21px] pr-4 py-4">
          {/* Left accent border */}
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_4px_0px_0px_0px_#cb8052]" />

          <div className="flex-1 flex flex-col gap-1.5 text-[#80452b]">
            <h4 className="text-[15px] font-semibold leading-[21px] tracking-[-0.15px]">
              ⚠ {insurer.alertMessage}
            </h4>
            <p className="text-[13px] font-normal leading-5">
              {insurer.alertDescription}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2.5 px-3 py-2 bg-white border border-panora-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] text-[13px] font-medium text-panora-text-muted whitespace-nowrap hover:bg-panora-bg transition-colors"
            >
              Aller sur l&apos;extranet
            </a>
            <button
              onClick={handleValidate}
              disabled={validating}
              className={cn(
                "btn-primary flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-opacity",
                validating && "opacity-70"
              )}
            >
              {validating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Reprise en cours...
                </>
              ) : (
                "Relancer l\u2019agent"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Video + Timeline side by side */}
      <div className="grid grid-cols-2 gap-4">
        <VideoPlaceholder />
        <div>
          <LiveAgentTimeline allSteps={tailSteps} isCompleted />
        </div>
      </div>

      {/* Next action info */}
      {insurer.nextAction && (
        <div className="flex items-start gap-2 text-[13px] text-panora-text-muted bg-panora-drop/50 rounded-lg p-3">
          <RefreshCw className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-panora-text-secondary">
              Prochaine action après validation
            </span>
            <p className="text-panora-text-muted mt-0.5">
              {insurer.nextAction}
            </p>
          </div>
        </div>
      )}

      {/* Quote info */}
      {insurer.quoteInfo && insurer.quoteInfo.length > 0 && (
        <>
          <div className="h-px bg-panora-border" />
          <CollapsibleSection title="Informations devis">
            <QuoteInfoGrid quoteInfo={insurer.quoteInfo} />
          </CollapsibleSection>
        </>
      )}
    </div>
  );
}

/* ── Timeline drawer ── */
function TimelineDrawer({
  insurer,
  onClose,
}: {
  insurer: InsurerData;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-panora-border">
          <h2 className="text-[15px] font-semibold text-panora-text">
            Historique de l&apos;agent — {insurer.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-panora-bg rounded transition-colors"
          >
            <X className="w-5 h-5 text-panora-text-muted" />
          </button>
        </div>
        <div className="px-5 pt-5">
          <VideoPlaceholder />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <LiveAgentTimeline allSteps={insurer.allSteps} isCompleted />
        </div>
      </div>
    </>
  );
}

/* ── Video placeholder ── */
function VideoPlaceholder({ isLive = false }: { isLive?: boolean }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      onClick={() => setPlaying(!playing)}
      className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer group"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      <div className="relative w-12 h-12 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors backdrop-blur-sm">
        {playing ? (
          <Pause className="w-5 h-5 text-white fill-white" />
        ) : (
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 flex items-center gap-2">
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] text-white/80 font-medium">LIVE</span>
          </div>
        )}
        {!isLive && (
          <span className="text-[11px] text-white/60">Replay session agent</span>
        )}
        <div className="flex-1" />
        <span className="text-[11px] text-white/40">0:00 / 2:34</span>
      </div>
    </div>
  );
}
