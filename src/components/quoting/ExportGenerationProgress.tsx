"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentTemplate, FileFormat } from "@/data/templates-mock";

interface ExportGenerationProgressProps {
  template: DocumentTemplate;
  format: FileFormat;
  clientName: string;
  onClose: () => void;
}

type Stage = {
  key: string;
  label: string;
  duration: number;
};

const STAGES: Stage[] = [
  { key: "mapping", label: "Mapping des sections du modèle", duration: 1000 },
  { key: "branding", label: "Application du branding", duration: 900 },
  { key: "render", label: "Rendu du document", duration: 1100 },
];

export function ExportGenerationProgress({
  template,
  format,
  clientName,
  onClose,
}: ExportGenerationProgressProps) {
  const [stageIdx, setStageIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (stageIdx >= STAGES.length) {
      setDone(true);
      // Trigger mock download
      const fileName = `${clientName} - ${template.name}.${format}`;
      const blob = new Blob(
        [
          `Mock export\n\nClient: ${clientName}\nTemplate: ${template.name}\nFormat: ${format}\n\nGénéré par Panora — démo.`,
        ],
        { type: "text/plain" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
    const t = setTimeout(() => setStageIdx((i) => i + 1), STAGES[stageIdx].duration);
    return () => clearTimeout(t);
  }, [stageIdx, clientName, template, format]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.16)] w-full max-w-[460px] mx-4 overflow-hidden">
        <div className="px-6 pt-5 pb-3 border-b border-panora-border flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-panora-green" />
          <span className="text-[15px] font-semibold text-panora-text font-display">
            {done ? "Document généré" : "Génération en cours"}
          </span>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3">
          {STAGES.map((stage, idx) => {
            const isDone = idx < stageIdx || done;
            const isActive = idx === stageIdx && !done;
            return (
              <div key={stage.key} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    isDone
                      ? "bg-panora-green text-white"
                      : isActive
                        ? "bg-panora-green/10 text-panora-green"
                        : "bg-panora-secondary text-panora-text-muted"
                  )}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span className="text-[11px] font-semibold">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[13px]",
                    isDone || isActive ? "text-panora-text" : "text-panora-text-muted"
                  )}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}

        </div>
        <div className="border-t border-panora-border px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className={cn(
              "px-4 h-[34px] text-[13px] font-medium rounded-lg transition-colors",
              done
                ? "btn-primary text-white"
                : "border border-panora-border text-panora-text-secondary hover:bg-panora-bg"
            )}
          >
            {done ? "Fermer" : "Annuler"}
          </button>
        </div>
      </div>
    </div>
  );
}
