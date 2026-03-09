"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Building2,
  FileText,
  Paperclip,
  List,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { EmailBanner } from "@/components/ui/EmailBanner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ExtractedDataPanel } from "@/components/quoting/ExtractedDataPanel";
import { insurers, cotationId, quotingEmail } from "@/data/mock";
import Link from "next/link";

export default function DashboardPage() {
  const completed = insurers.filter((i) => i.status === "completed").length;
  const actionRequired = insurers.filter(
    (i) => i.status === "action_required"
  ).length;
  const progressPercent = (completed / insurers.length) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar variant="followup" cotationId={cotationId} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-semibold text-panora-text">
                Quoting RC Pro 2027
              </h1>
              <Link
                href="/quoting/followup"
                className="flex items-center gap-1.5 text-sm text-panora-text-secondary hover:text-panora-text transition-colors"
              >
                <List className="w-4 h-4" />
                Vue détaillée
              </Link>
            </div>

            {/* Tags row */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-panora-drop rounded-md text-xs text-panora-text-secondary">
                <Building2 className="w-3.5 h-3.5" />
                Marble Tech SAS
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-panora-drop rounded-md text-xs text-panora-text-secondary">
                <FileText className="w-3.5 h-3.5" />
                RC Professionnelle
              </span>
              {insurers.map((i) => (
                <span
                  key={i.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-panora-drop rounded-md text-xs text-panora-text-secondary"
                >
                  <span className="text-[10px]">{i.logo}</span>
                  {i.name}
                </span>
              ))}
            </div>

            {/* Status + progress */}
            <div className="flex items-center gap-3">
              {actionRequired > 0 && (
                <StatusBadge status="action_required" />
              )}
              <div className="flex-1 h-2 bg-panora-border rounded-full overflow-hidden max-w-xs">
                <div
                  className="h-full bg-panora-green rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-panora-text-muted">
                {completed} / {insurers.length} devis reçus
              </span>
            </div>
          </div>

          {/* Insurer rows */}
          <div className="bg-panora-card border border-panora-border rounded-lg overflow-hidden mb-6">
            {insurers.map((insurer, idx) => (
              <Link
                key={insurer.id}
                href="/quoting/followup"
                className={`flex items-center gap-3 px-5 py-3.5 hover:bg-panora-drop/30 transition-colors ${
                  idx < insurers.length - 1 ? "border-b border-panora-border" : ""
                }`}
              >
                <span className="text-lg">{insurer.logo}</span>
                <span className="text-sm font-medium text-panora-text flex-1">
                  {insurer.name}
                </span>
                <StatusBadge status={insurer.status} />
                <span className="text-xs text-panora-text-muted w-32 text-right">
                  {insurer.reference}
                </span>
                <a
                  href="#"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-panora-green hover:underline font-medium"
                >
                  Extranet
                  <ExternalLink className="w-3 h-3" />
                </a>
                <ChevronRight className="w-4 h-4 text-panora-text-muted" />
              </Link>
            ))}
          </div>

          {/* Récapitulatif de la demande */}
          <RecapSection />
        </div>
      </div>
    </div>
  );
}

function RecapSection() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-panora-card border border-panora-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-panora-drop/30 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-panora-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-panora-text-muted" />
        )}
        <FileText className="w-4 h-4 text-panora-text-muted" />
        <span className="text-sm font-semibold text-panora-text flex-1">
          Récapitulatif de la demande
        </span>
        <EmailBanner compact />
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-panora-border pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Documents & Instructions */}
            <div className="space-y-5">
              {/* Documents */}
              <div>
                <h4 className="text-sm font-medium text-panora-text mb-3">
                  Documents fournis
                </h4>
                <div className="space-y-1.5">
                  {quotingEmail.attachments.map((att) => (
                    <div
                      key={att.name}
                      className="flex items-center gap-2 px-3 py-2 bg-panora-drop rounded-lg"
                    >
                      <Paperclip className="w-4 h-4 text-panora-text-muted shrink-0" />
                      <span className="text-sm text-panora-text truncate flex-1">
                        {att.name}
                      </span>
                      <span className="text-xs text-panora-text-muted shrink-0">
                        {att.fieldsExtracted} champs extraits
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-sm font-medium text-panora-text mb-2">
                  Instructions à l&apos;agent de cotation
                </h4>
                <p className="text-sm text-panora-text-secondary leading-relaxed">
                  Le client veut absolument moins cher que le contrat actuel.
                  Privilégier les formules sans franchise.
                </p>
              </div>
            </div>

            {/* Right - Extracted data */}
            <div>
              <ExtractedDataPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
