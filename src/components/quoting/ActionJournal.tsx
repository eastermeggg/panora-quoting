"use client";

import { X, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionEntry {
  date: string;
  title: string;
  description: string;
  status: "success" | "error";
}

interface ActionJournalProps {
  isOpen: boolean;
  onClose: () => void;
  insurerName: string;
  actions: ActionEntry[];
}

export function ActionJournal({
  isOpen,
  onClose,
  insurerName,
  actions,
}: ActionJournalProps) {
  if (!isOpen) return null;

  const fullActions: ActionEntry[] = [
    { date: "28/05/25 - 18h25", title: "Début", description: "En cours, remplissage des champs sur l'extranet", status: "success" },
    { date: "28/05/25 - 18h28", title: "Action agent", description: "En cours, remplissage des champs sur l'extranet", status: "success" },
    { date: "28/05/25 - 18h30", title: "Action agent", description: "En cours, remplissage des champs sur l'extranet", status: "success" },
    { date: "28/05/25 - 18h32", title: "Action agent", description: "En cours, remplissage des champs sur l'extranet", status: "success" },
    { date: "28/05/25 - 18h35", title: "Action erreur", description: `Référence: ${insurerName.toUpperCase().slice(0, 3)}-FR-90124`, status: "error" },
    { date: "28/05/25 - 18h38", title: "Action agent reprise", description: `Référence: ${insurerName.toUpperCase().slice(0, 3)}-FR-90124`, status: "success" },
    { date: "28/05/25 - 18h40", title: "Fin", description: "Cotation terminée avec succès", status: "success" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-panora-card shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-panora-border">
          <h2 className="text-base font-semibold text-panora-text">
            Journal d&apos;actions — {insurerName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-panora-sidebar rounded transition-colors"
          >
            <X className="w-5 h-5 text-panora-text-muted" />
          </button>
        </div>

        {/* Video placeholder */}
        <div className="px-5 pt-5">
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center cursor-pointer group">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <h3 className="text-sm font-semibold text-panora-text mb-4">
            Historique
          </h3>
          <div className="space-y-0">
            {fullActions.map((action, i) => (
              <div key={i} className="flex gap-3 relative">
                {/* Line */}
                {i < fullActions.length - 1 && (
                  <div className="absolute left-[7px] top-5 bottom-0 w-px bg-panora-border" />
                )}
                {/* Dot */}
                <div
                  className={cn(
                    "w-[15px] h-[15px] rounded-full mt-0.5 shrink-0 border-2",
                    action.status === "success"
                      ? "bg-panora-green border-panora-green"
                      : "bg-panora-error border-panora-error"
                  )}
                />
                {/* Content */}
                <div className="pb-5 min-w-0">
                  <div className="text-xs text-panora-text-muted">
                    {action.date}
                  </div>
                  <p className="text-sm font-medium text-panora-text mt-0.5">
                    {action.title}
                  </p>
                  <p className="text-xs text-panora-text-secondary mt-0.5">
                    {action.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
