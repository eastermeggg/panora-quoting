"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ExtranetCard } from "@/components/settings/ExtranetCard";
import { ConfigureExtranetModal } from "@/components/settings/ConfigureExtranetModal";
import { CardGrid } from "@/components/ui/CardGrid";
import { InsurerCommandBar } from "@/components/onboarding/InsurerCommandBar";
import {
  addConfiguredExtranet,
  removeConfiguredExtranet,
  updateConfiguredExtranet,
  type AvailableExtranet,
  type ExtranetConfig,
  type InsuranceProduct,
} from "@/data/settings-mock";

interface StepConnectProps {
  configuredExtranets: ExtranetConfig[];
  /** Called after each successful connection with the new config id. */
  onConfigured: (id: string) => void;
}

type ModalState =
  | { type: "configure"; extranet: AvailableExtranet }
  | { type: "edit"; extranet: ExtranetConfig }
  | null;

export function StepConnect({
  configuredExtranets,
  onConfigured,
}: StepConnectProps) {
  const [modal, setModal] = useState<ModalState>(null);

  const configuredCatalogIds = useMemo(
    () =>
      new Set(
        configuredExtranets
          .map((c) => c.catalogEntryId)
          .filter((id): id is string => Boolean(id))
      ),
    [configuredExtranets]
  );

  function handleSave(data: {
    username: string;
    password: string;
    selectedProducts: InsuranceProduct[];
  }) {
    if (!modal) return;
    if (modal.type === "configure") {
      const source = modal.extranet;
      const today = new Date().toISOString().slice(0, 10);
      const id = `cfg-${source.insurerId}-${Date.now()}`;
      addConfiguredExtranet({
        id,
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
      onConfigured(id);
    } else {
      updateConfiguredExtranet(modal.extranet.id, {
        username: data.username,
        selectedProducts: data.selectedProducts,
      });
    }
    setModal(null);
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] flex flex-col gap-8 py-4 lg:py-8">
      <header className="flex flex-col gap-2 max-w-[680px]">
        <h1 className="text-[24px] lg:text-[28px] font-serif text-panora-text leading-[1.2] text-balance">
          Connectez vos portails assureurs
        </h1>
        <p className="text-[13px] text-panora-text-secondary leading-5">
          Cherchez un assureur, renseignez vos identifiants. Vous gérerez les
          sessions 2FA à l&apos;étape suivante.
        </p>
      </header>

      {/* Command bar */}
      <div className="flex flex-col gap-2">
        <InsurerCommandBar
          configuredCatalogIds={configuredCatalogIds}
          onSelect={(extranet) => setModal({ type: "configure", extranet })}
        />
        <div className="flex items-center justify-end px-1">
          <Link
            href="/matrice-couverture"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-text-secondary hover:text-panora-text leading-4 transition-colors"
          >
            Voir la matrice extranets × produits
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Configured cards */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
            Vos extranets
          </h2>
          {configuredExtranets.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-panora-secondary text-[11px] font-semibold text-panora-text-secondary tabular-nums">
              {configuredExtranets.length}
            </span>
          )}
        </div>

        {configuredExtranets.length === 0 ? (
          <EmptyState />
        ) : (
          <CardGrid minCardWidth={320}>
            {configuredExtranets.map((config) => (
              <ExtranetCard
                key={config.id}
                config={config}
                hideSessionActivation
                onEdit={() => setModal({ type: "edit", extranet: config })}
                onDelete={() => removeConfiguredExtranet(config.id)}
              />
            ))}
          </CardGrid>
        )}
      </section>

      {/* Setup modal */}
      {modal && (
        <ConfigureExtranetModal
          extranet={modal.extranet}
          variant={modal.type}
          onClose={() => setModal(null)}
          onSave={handleSave}
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center gap-3 px-6 py-10 rounded-xl border border-dashed border-panora-border bg-panora-bg/40">
      <div className="w-10 h-10 rounded-full bg-panora-secondary/60 flex items-center justify-center">
        <ShieldCheck className="w-4 h-4 text-panora-text-muted" />
      </div>
      <div className="flex flex-col gap-1 max-w-[360px]">
        <p className="text-[14px] font-medium text-panora-text leading-5">
          Aucun extranet pour l&apos;instant
        </p>
        <p className="text-[12px] text-panora-text-secondary leading-[18px]">
          Cherchez un assureur dans la barre ci-dessus pour ajouter votre
          premier accès. Vos cartes apparaîtront ici.
        </p>
      </div>
    </div>
  );
}
