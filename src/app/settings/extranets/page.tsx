"use client";

import { useState } from "react";
import { KeyRound, ExternalLink } from "lucide-react";
import { SecurityTrustBar } from "@/components/settings/SecurityTrustBar";
import { ExtranetCard } from "@/components/settings/ExtranetCard";
import { EdiCard } from "@/components/settings/EdiCard";
import { CardGrid } from "@/components/ui/CardGrid";
import { AddExtranetList } from "@/components/settings/AddExtranetList";
import { ConfigureExtranetModal } from "@/components/settings/ConfigureExtranetModal";
import {
  addConfiguredExtranet,
  COVERAGE_MATRIX_URL,
  removeConfiguredExtranet,
  updateConfiguredExtranet,
  useConfiguredExtranets,
  type AvailableExtranet,
  type ExtranetConfig,
} from "@/data/settings-mock";

type ModalState =
  | { type: "configure"; extranet: AvailableExtranet }
  | { type: "edit"; extranet: ExtranetConfig }
  | null;

export default function ExtranetsPage() {
  const [modal, setModal] = useState<ModalState>(null);
  const configuredExtranets = useConfiguredExtranets();

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-[1280px] mx-auto px-10 py-8 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider leading-4">
              Paramètres
            </span>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h1 className="text-[24px] font-serif leading-7 text-panora-text">
                Accès extranets assureurs
              </h1>
              <a
                href={COVERAGE_MATRIX_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-panora-text-secondary border border-panora-border rounded-md bg-white hover:bg-panora-bg hover:text-panora-text transition-colors mt-1"
              >
                Matrice de couverture
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[13px] text-panora-text-secondary leading-5 max-w-[560px]">
              Centralisez vos identifiants assureurs en toute sécurité. Vos mots
              de passe sont chiffrés de bout en bout et ne sont jamais stockés en
              clair.
            </p>
          </div>
          <SecurityTrustBar />
        </div>

        {/* EDI — global channel, a setting that sits above (and separate from)
            the per-company extranet list. */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
              Connexion EDI
            </h2>
            <p className="text-[13px] text-panora-text-secondary leading-[18px] max-w-[560px]">
              Un canal unique qui couvre toutes vos compagnies compatibles avec
              un seul identifiant. À activer une fois — distinct de vos accès
              extranet compagnie par compagnie.
            </p>
          </div>
          <div className="max-w-[520px]">
            <EdiCard />
          </div>
        </section>

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

            {/* Session activation explainer */}
            <div className="flex items-start gap-3 bg-panora-secondary/40 border border-panora-border rounded-lg px-4 py-3 max-w-[720px]">
              <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-white border border-panora-border flex items-center justify-center">
                <KeyRound className="w-3.5 h-3.5 text-panora-text-secondary" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-[13px] font-medium text-panora-text leading-5">
                  Activez vos sessions chaque matin
                </p>
                <p className="text-[12px] text-panora-text-secondary leading-[18px]">
                  Les extranets exigent une 2FA quotidienne. Une session
                  activée permet à l&apos;agent Panora de coter automatiquement
                  jusqu&apos;à expiration, sans nouvelle authentification de
                  votre part.
                </p>
              </div>
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
            if (modal.type === "configure") {
              const source = modal.extranet;
              const today = new Date().toISOString().slice(0, 10);
              addConfiguredExtranet({
                id: `cfg-${source.insurerId}-${Date.now()}`,
                insurerId: source.insurerId,
                insurerName: source.insurerName,
                portalLabel: source.portalLabel,
                portalUrl: source.portalUrl,
                username: data.username,
                modelizedProducts: source.modelizedProducts,
                selectedProducts: data.selectedProducts,
                catalogEntryId: source.id,
                configuredAt: today,
                connectionStatus: "connected",
                lastVerified: today,
                sessionState: { status: "inactive" },
                otpDelivery: source.otpDelivery,
                emailForwardConfigured: false,
                sessionDurationLabel: source.sessionDurationLabel,
              });
            } else {
              updateConfiguredExtranet(modal.extranet.id, {
                username: data.username,
                selectedProducts: data.selectedProducts,
              });
            }
            setModal(null);
          }}
          onDelete={
            modal.type === "edit"
              ? () => {
                  removeConfiguredExtranet(modal.extranet.id);
                  setModal(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
