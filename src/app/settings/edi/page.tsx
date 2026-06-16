"use client";

import { EdiCard } from "@/components/settings/EdiCard";
import { EDI_BRAND } from "@/data/edi-store";

export default function EdiPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-[1280px] mx-auto px-10 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider leading-4">
            Paramètres
          </span>
          <h1 className="text-[24px] font-serif leading-7 text-panora-text">
            Connexion {EDI_BRAND}
          </h1>
          <p className="text-[13px] text-panora-text-secondary leading-5 max-w-[600px]">
            {EDI_BRAND} est un canal unique — « le France Connect de
            l&apos;assurance » — qui couvre toutes vos compagnies compatibles avec
            un seul identifiant. Activez-le une fois ; il reste distinct de vos
            accès extranet compagnie par compagnie.
          </p>
        </div>

        <div className="max-w-[520px]">
          <EdiCard />
        </div>
      </div>
    </div>
  );
}
