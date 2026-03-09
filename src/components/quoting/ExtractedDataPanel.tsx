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
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-panora-text-muted shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-panora-text-muted shrink-0" />
        )}

        <span className="text-sm font-medium text-panora-text flex-1">
          {section.label}
        </span>

        {section.status === "complete" && (
          <CheckCircle2 className="w-4 h-4 text-panora-green" />
        )}
        {section.status === "incomplete" && (
          <span className="flex items-center gap-1 text-xs text-panora-warning">
            <AlertTriangle className="w-3.5 h-3.5" />
            {section.missingCount} champ{section.missingCount! > 1 ? "s" : ""} à
            compléter
          </span>
        )}
        {section.status === "invalid" && (
          <span className="flex items-center gap-1 text-xs text-panora-error">
            <AlertTriangle className="w-3.5 h-3.5" />
            {section.invalidCount} champ{section.invalidCount! > 1 ? "s" : ""}{" "}
            invalide{section.invalidCount! > 1 ? "s" : ""}
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-panora-border">
          <div className="space-y-3 pt-3">
            {section.fields.map((field) => (
              <div key={field.label}>
                <label className="text-xs text-panora-text-muted block mb-1">
                  {field.label}
                </label>
                {field.status === "missing" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="À compléter..."
                      className="flex-1 border border-panora-warning/50 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-panora-warning/20 bg-panora-warning-bg/30"
                    />
                    <span className="text-xs bg-panora-tag text-panora-warning px-2 py-0.5 rounded font-medium">
                      À compléter..
                    </span>
                  </div>
                ) : field.status === "invalid" ? (
                  <div>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full border border-panora-error rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-panora-error/20"
                    />
                    <p className="text-xs text-panora-error mt-1">
                      {field.error}
                    </p>
                  </div>
                ) : (
                  <input
                    type="text"
                    defaultValue={field.value}
                    className="w-full border border-panora-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-panora-green/20"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
