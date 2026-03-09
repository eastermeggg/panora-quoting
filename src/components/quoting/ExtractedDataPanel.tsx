"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { extractedData } from "@/data/mock";

type SectionData = {
  label: string;
  status: "complete" | "incomplete" | "invalid";
  missingCount?: number;
  invalidCount?: number;
  fields: Array<{
    label: string;
    value: string;
    status?: "ok" | "missing" | "invalid";
    error?: string;
  }>;
};

export function ExtractedDataPanel() {
  const sections: SectionData[] = [
    extractedData.entreprise,
    extractedData.dirigeant1,
    extractedData.dirigeant2,
    extractedData.contratActuel,
  ];

  return (
    <div>
      <h2 className="text-base font-semibold text-panora-text mb-1">
        Données consolidées extraites pour cotation
      </h2>
      <p className="text-sm text-panora-text-secondary mb-5">
        Déposez tous les documents utiles à la cotation.
      </p>

      <div className="space-y-2">
        {sections.map((section) => (
          <DataSection key={section.label} section={section} />
        ))}
      </div>
    </div>
  );
}

function DataSection({ section }: { section: SectionData }) {
  const [expanded, setExpanded] = useState(
    section.status !== "complete"
  );

  return (
    <div className="border border-panora-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-panora-drop/50 transition-colors"
      >
        {section.status === "complete" && (
          <CheckCircle2 className="w-5 h-5 text-panora-green shrink-0" />
        )}
        {section.status === "incomplete" && (
          <AlertTriangle className="w-5 h-5 text-panora-warning shrink-0" />
        )}
        {section.status === "invalid" && (
          <AlertTriangle className="w-5 h-5 text-panora-error shrink-0" />
        )}

        <span className="text-sm font-medium text-panora-text flex-1">
          {section.label}
        </span>

        {section.status === "incomplete" && (
          <span className="text-xs text-panora-warning mr-2">
            {section.missingCount} champ{section.missingCount! > 1 ? "s" : ""} à
            compléter
          </span>
        )}
        {section.status === "invalid" && (
          <span className="text-xs text-panora-error mr-2">
            {section.invalidCount} champ{section.invalidCount! > 1 ? "s" : ""}{" "}
            invalide{section.invalidCount! > 1 ? "s" : ""}
          </span>
        )}

        {expanded ? (
          <ChevronDown className="w-4 h-4 text-panora-text-muted shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-panora-text-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-panora-border">
          <div className="divide-y divide-panora-border">
            {section.fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center px-4 py-2.5 gap-4"
              >
                <span
                  className={cn(
                    "text-sm w-36 shrink-0",
                    field.status === "missing" || field.status === "invalid"
                      ? "text-panora-error font-medium"
                      : "text-panora-text-muted"
                  )}
                >
                  {field.label}
                </span>
                <div className="flex-1 flex items-center gap-2 justify-end">
                  {field.status === "missing" ? (
                    <>
                      <input
                        type="text"
                        placeholder="À compléter..."
                        className="flex-1 border border-panora-warning/50 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-panora-warning/20 bg-panora-warning-bg/30 text-right"
                      />
                      <span className="text-xs bg-panora-tag text-panora-warning px-2 py-0.5 rounded font-medium whitespace-nowrap">
                        À compléter..
                      </span>
                    </>
                  ) : field.status === "invalid" ? (
                    <>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="flex-1 border border-panora-error rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-panora-error/20 text-right"
                      />
                      <span className="text-xs text-panora-error whitespace-nowrap">
                        {field.error}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-panora-text text-right">
                      {field.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
