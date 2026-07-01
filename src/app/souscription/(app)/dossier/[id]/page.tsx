"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, FileWarning } from "lucide-react";
import { getDossier } from "@/data/souscription-engine";
import { DossierDetail } from "@/components/souscription/DossierDetail";

export default function DossierPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const dossier = getDossier(id);

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
            <p className="text-[13px] text-panora-text-secondary leading-5">
              {"Ce dossier n'existe pas ou a été retiré."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <DossierDetail dossier={dossier} />;
}
