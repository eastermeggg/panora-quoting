"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { SecurityTrustBar } from "@/components/settings/SecurityTrustBar";
import { ExtranetCard } from "@/components/settings/ExtranetCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { AddExtranetList } from "@/components/settings/AddExtranetList";
import { ConfigureExtranetModal } from "@/components/settings/ConfigureExtranetModal";
import {
  configuredExtranets,
  type AvailableExtranet,
  type ExtranetConfig,
} from "@/data/settings-mock";

type ModalState =
  | { type: "configure"; extranet: AvailableExtranet }
  | { type: "edit"; extranet: ExtranetConfig }
  | null;

export default function ExtranetsPage() {
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-[1280px] mx-auto px-10 py-8 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider leading-4">
              Paramètres
            </span>
            <h1 className="text-[24px] font-serif leading-7 text-panora-text">
              Accès extranets assureurs
            </h1>
            <p className="text-[13px] text-panora-text-secondary leading-5 max-w-[560px]">
              Centralisez vos identifiants assureurs en toute sécurité. Vos mots
              de passe sont chiffrés de bout en bout et ne sont jamais stockés en
              clair.
            </p>
          </div>
          <SecurityTrustBar />
        </div>

        {/* Configured extranets */}
        {configuredExtranets.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
                Extranets configurés
              </h2>
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-panora-secondary text-[11px] font-semibold text-panora-text-secondary tabular-nums">
                {configuredExtranets.length}
              </span>
            </div>
            <CardGrid minCardWidth={320}>
              {configuredExtranets.map((config) => (
                <ExtranetCard
                  key={config.id}
                  config={config}
                  onEdit={() => setModal({ type: "edit", extranet: config })}
                  onDelete={() => console.log("Delete:", config.id)}
                />
              ))}
            </CardGrid>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-full bg-panora-secondary flex items-center justify-center">
              <KeyRound className="w-4.5 h-4.5 text-panora-text-muted" />
            </div>
            <p className="text-[15px] font-semibold text-panora-text font-display">
              Aucun extranet configuré
            </p>
            <p className="text-[13px] text-panora-text-secondary text-center max-w-[380px] leading-5">
              Configurez vos accès aux portails assureurs ci-dessous pour
              commencer à centraliser vos identifiants.
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-panora-border" />

        {/* Catalog */}
        <AddExtranetList
          onConfigure={(extranet) =>
            setModal({ type: "configure", extranet })
          }
        />
      </div>

      {/* Configure modal */}
      {modal && (
        <ConfigureExtranetModal
          extranet={modal.extranet}
          variant={modal.type}
          onClose={() => setModal(null)}
          onSave={(data) => {
            console.log("Save:", data);
            setModal(null);
          }}
          onDelete={
            modal.type === "edit"
              ? () => {
                  console.log("Delete:", modal.extranet.id);
                  setModal(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
