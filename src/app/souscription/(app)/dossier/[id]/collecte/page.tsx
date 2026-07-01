"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, FileWarning } from "lucide-react";
import { getDossier } from "@/data/souscription-engine";
import { CollecteScreen } from "@/components/souscription/CollecteScreen";

/** The collecte / préparation step: its own dedicated screen. */
export default function CollectePage() {
  const params = useParams<{ id: string }>();
  const dossier = getDossier(params?.id ?? "");

  if (!dossier) {
    return (
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
        <div className="shrink-0 border-b border-panora-border px-6 py-3">
          <Link
            href="/souscription"
            className="inline-flex items-center gap-1 text-[12px] text-panora-text-muted hover:text-panora-text transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Demandes de souscription
          </Link>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center px-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-panora-warning-bg flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-panora-warning-text" />
            </div>
            <h1 className="text-[18px] font-serif text-panora-text leading-7">
              Dossier introuvable
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return <CollecteScreen dossier={dossier} />;
}
