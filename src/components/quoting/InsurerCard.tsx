"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Download,
  AlertTriangle,
  Play,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionTimeline } from "@/components/ui/ActionTimeline";

type InsurerStatus = "completed" | "action_required" | "in_progress" | "error";

interface InsurerCardProps {
  insurer: {
    id: string;
    name: string;
    logo: string;
    status: InsurerStatus;
    reference: string;
    documents?: string[];
    pricing?: Array<{ formula: string; monthly: string; annual: string }>;
    quoteInfo?: Array<{ label: string; value: string }>;
    alertMessage?: string;
    alertDescription?: string;
    nextAction?: string;
    errorMessage?: string;
    errorDescription?: string;
    errorInfo?: string;
    actions: Array<{
      date: string;
      title: string;
      description: string;
      status: "success" | "error";
    }>;
  };
  index?: number;
  defaultExpanded?: boolean;
  onViewActions?: () => void;
}

export function InsurerCard({
  insurer,
  index,
  defaultExpanded = false,
  onViewActions,
}: InsurerCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-panora-card border border-panora-border rounded-lg overflow-hidden">
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

        <span className="text-xl">{insurer.logo}</span>
        <span className="text-sm font-semibold text-panora-text">
          {insurer.name}
        </span>

        <StatusBadge status={insurer.status} />

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
          {/* Completed state */}
          {insurer.status === "completed" && (
            <div className="space-y-5 pt-4">
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
                        className="flex items-center gap-2 px-3 py-2 bg-panora-drop rounded-lg cursor-pointer hover:bg-panora-tag transition-colors"
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
                          <tr
                            key={i}
                            className="border-t border-panora-border"
                          >
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

              {/* Actions timeline - collapsible with Voir tout in header */}
              <CollapsibleSection
                title="Dernières actions de l'agent"
                headerRight={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewActions?.();
                    }}
                    className="text-xs text-panora-green hover:underline font-medium"
                  >
                    Voir tout
                  </button>
                }
              >
                <ActionTimeline
                  actions={insurer.actions}
                  onViewAll={onViewActions}
                />
              </CollapsibleSection>

              {/* Quote info - always visible */}
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

              {/* Paramètres devis */}
              <CollapsibleSection title="Paramètres devis">
                <div className="p-3 bg-panora-drop rounded-lg text-sm text-panora-text-muted">
                  Détails des paramètres du devis...
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* Action required state */}
          {insurer.status === "action_required" && (
            <div className="space-y-5 pt-4">
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
                    <div className="flex items-center gap-3 mt-3">
                      <a
                        href="#"
                        className="text-sm text-panora-text-secondary hover:text-panora-text transition-colors underline"
                      >
                        Aller sur l&apos;extranet
                      </a>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-panora-green text-white text-sm font-medium rounded-lg hover:bg-panora-green-dark transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Relancer l&apos;agent
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-column: Video + Timeline */}
              <div className="grid grid-cols-2 gap-5">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center cursor-pointer group">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </div>
                </div>
                <div>
                  <ActionTimeline
                    actions={insurer.actions}
                    onViewAll={onViewActions}
                  />
                </div>
              </div>

              {/* Prochaine action après validation */}
              {insurer.nextAction && (
                <div className="text-sm text-panora-text-muted">
                  <span className="flex items-center gap-2">
                    <Play className="w-3 h-3 text-panora-text-muted" />
                    <span>Prochaine action après validation</span>
                  </span>
                  <p className="ml-5 text-panora-text-secondary">
                    {insurer.nextAction}
                  </p>
                </div>
              )}

              {/* Paramètres devis */}
              <CollapsibleSection title="Paramètres devis">
                <div className="p-3 bg-panora-drop rounded-lg text-sm text-panora-text-muted">
                  Détails des paramètres du devis...
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* In progress state */}
          {insurer.status === "in_progress" && (
            <div className="space-y-5 pt-4">
              {/* Two-column: Video + Timeline */}
              <div className="grid grid-cols-2 gap-5">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="relative w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-panora-green animate-pulse" />
                    <span className="text-xs text-white/80">
                      Agent en cours d&apos;exécution...
                    </span>
                  </div>
                </div>
                <div>
                  <ActionTimeline
                    actions={insurer.actions}
                    onViewAll={onViewActions}
                  />
                </div>
              </div>

              {/* Paramètres devis */}
              <CollapsibleSection title="Paramètres devis">
                <div className="p-3 bg-panora-drop rounded-lg text-sm text-panora-text-muted">
                  Détails des paramètres du devis...
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* Error state */}
          {insurer.status === "error" && (
            <div className="space-y-5 pt-4">
              {/* Error banner */}
              <div className="bg-panora-error-bg border border-panora-error/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-panora-error shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-panora-text mb-1">
                      {insurer.errorMessage}
                    </h4>
                    <p className="text-sm text-panora-text-secondary leading-relaxed">
                      {insurer.errorDescription}
                    </p>
                    <p className="text-xs text-panora-text-muted mt-2">
                      {insurer.errorInfo}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <a
                        href="#"
                        className="text-sm text-panora-text-secondary hover:text-panora-text transition-colors underline"
                      >
                        Aller sur l&apos;extranet
                      </a>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-panora-green text-white text-sm font-medium rounded-lg hover:bg-panora-green-dark transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Relancer l&apos;agent
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two-column: Video + Timeline */}
              <div className="grid grid-cols-2 gap-5">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center cursor-pointer group">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </div>
                </div>
                <div>
                  <ActionTimeline
                    actions={insurer.actions}
                    onViewAll={onViewActions}
                  />
                </div>
              </div>

              {/* Paramètres devis */}
              <CollapsibleSection title="Paramètres devis">
                <div className="p-3 bg-panora-drop rounded-lg text-sm text-panora-text-muted">
                  Détails des paramètres du devis...
                </div>
              </CollapsibleSection>
            </div>
          )}
        </div>
      )}
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
