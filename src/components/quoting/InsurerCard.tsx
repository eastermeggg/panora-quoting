"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LiveAgentTimeline } from "@/components/ui/LiveAgentTimeline";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
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
    <div className="bg-white border border-panora-border/40 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-panora-drop/30 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-panora-text-muted shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-panora-text-muted shrink-0" />
        )}

        <InsurerLogo insurerId={insurer.id} name={insurer.name} size="lg" />
        <span className="text-sm font-semibold text-panora-text">
          {insurer.name}
        </span>

        <StatusBadge status={currentStatus} />

        <span className="text-xs text-panora-text-muted ml-auto mr-2">
          {insurer.reference}
        </span>

        <a
          href="#"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-panora-green hover:underline font-medium"
        >
          Ouvrir dans l&apos;extranet
          <ExternalLink className="w-3 h-3" />
        </a>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-panora-border">
          {currentStatus === "completed" && (
            <CompletedContent insurer={insurer} />
          )}

          {currentStatus === "in_progress" && (
            <div className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <VideoPlaceholder isLive />
                <LiveAgentTimeline
                  allSteps={insurer.allSteps}
                  initialVisible={insurer.initialVisibleSteps ?? 3}
                  stepInterval={2500}
                  onComplete={() => onStatusChange?.("completed")}
                />
              </div>
            </div>
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

function CompletedContent({ insurer }: { insurer: InsurerData }) {
  return (
    <div className="space-y-5 pt-4">
      {/* Video replay */}
      <VideoPlaceholder />

      {/* Success banner */}
      <div className="flex items-center gap-3 p-3 bg-panora-green-light rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-panora-green shrink-0" />
        <div>
          <p className="text-sm font-medium text-panora-green">
            Cotation terminée
          </p>
          <p className="text-xs text-panora-green/70">
            {insurer.allSteps.length} étapes complétées avec succès
          </p>
        </div>
      </div>

      {/* Documents */}
      {insurer.documents && insurer.documents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-panora-text mb-3">
            Documents récupérés
          </h4>
          <div className="space-y-1.5">
            {insurer.documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-panora-drop rounded-lg cursor-pointer hover:bg-panora-border/30 transition-colors"
              >
                <Download className="w-4 h-4 text-panora-text-muted" />
                <span className="text-sm text-panora-text truncate">
                  {doc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing table */}
      {insurer.pricing && insurer.pricing.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-panora-text mb-3">
            Tarifs / offres obtenues
          </h4>
          <div className="border border-panora-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-panora-drop">
                  <th className="text-left px-4 py-2 text-xs font-medium text-panora-text-muted">
                    Formule
                  </th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-panora-text-muted">
                    Montant mensuel
                  </th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-panora-text-muted">
                    Montant annuel
                  </th>
                </tr>
              </thead>
              <tbody>
                {insurer.pricing.map((row, i) => (
                  <tr key={i} className="border-t border-panora-border">
                    <td className="px-4 py-2.5 text-panora-text font-medium">
                      {row.formula}
                    </td>
                    <td className="px-4 py-2.5 text-right text-panora-text-secondary">
                      {row.monthly}
                    </td>
                    <td className="px-4 py-2.5 text-right text-panora-text font-medium">
                      {row.annual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quote info */}
      {insurer.quoteInfo && (
        <div className="border-t border-panora-border pt-4">
          <h4 className="text-sm font-medium text-panora-text mb-3">
            Informations devis
          </h4>
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            {insurer.quoteInfo.map((item) => (
              <div key={item.label}>
                <span className="text-xs text-panora-text-muted">
                  {item.label}
                </span>
                <p className="text-sm text-panora-text font-medium">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed timeline (collapsed) */}
      <CollapsibleSection title="Historique des actions">
        <LiveAgentTimeline allSteps={insurer.allSteps} isCompleted />
      </CollapsibleSection>
    </div>
  );
}

function ActionRequiredContent({
  insurer,
  onValidate,
}: {
  insurer: InsurerData;
  onValidate: () => void;
}) {
  const [validating, setValidating] = useState(false);

  const handleValidate = () => {
    setValidating(true);
    setTimeout(() => {
      onValidate();
    }, 1500);
  };

  return (
    <div className="space-y-5 pt-4">
      {/* Video + Alert side by side */}
      <VideoPlaceholder />

      {/* Alert banner */}
      <div className="bg-panora-warning-bg border border-panora-warning/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-panora-warning shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-panora-text mb-1">
              {insurer.alertMessage}
            </h4>
            <p className="text-sm text-panora-text-secondary leading-relaxed">
              {insurer.alertDescription}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="flex items-center gap-1.5 text-sm text-panora-green hover:underline font-medium"
              >
                Ouvrir l&apos;extranet {insurer.name}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleValidate}
                disabled={validating}
                className={cn(
                  "btn-primary flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all",
                  validating && "opacity-70"
                )}
              >
                {validating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Reprise en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    J&apos;ai validé sur l&apos;extranet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next action info */}
      {insurer.nextAction && (
        <div className="flex items-start gap-2 text-sm text-panora-text-muted bg-panora-drop/50 rounded-lg p-3">
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

      {/* Timeline of completed steps */}
      <CollapsibleSection title="Actions déjà effectuées">
        <LiveAgentTimeline allSteps={insurer.allSteps} isCompleted />
      </CollapsibleSection>
    </div>
  );
}

function VideoPlaceholder({ isLive = false }: { isLive?: boolean }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      onClick={() => setPlaying(!playing)}
      className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer group"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Play/Pause button */}
      <div className="relative w-12 h-12 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors backdrop-blur-sm">
        {playing ? (
          <Pause className="w-5 h-5 text-white fill-white" />
        ) : (
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        )}
      </div>

      {/* Bottom bar */}
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

function CollapsibleSection({
  title,
  headerRight,
  children,
}: {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-panora-border pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-sm text-panora-text-secondary hover:text-panora-text transition-colors"
      >
        {open ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="font-medium">{title}</span>
        {headerRight && <div className="ml-auto">{headerRight}</div>}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
