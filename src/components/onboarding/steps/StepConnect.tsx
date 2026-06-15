"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ExtranetCard } from "@/components/settings/ExtranetCard";
import { EdiCard } from "@/components/settings/EdiCard";
import { EDI_BRAND } from "@/data/edi-store";
import { ConfigureExtranetModal } from "@/components/settings/ConfigureExtranetModal";
import { CardGrid } from "@/components/ui/CardGrid";
import { InsurerCommandBar } from "@/components/onboarding/InsurerCommandBar";
import { ProductsBlock } from "@/components/onboarding/ProductsBlock";
import { OnboardingHero, HeroAccent } from "@/components/onboarding/OnboardingHero";
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
    <div className="mx-auto w-full max-w-[1040px] flex flex-col gap-10 py-6 lg:py-10">
      <OnboardingHero
        eyebrow="Vos portails"
        title={
          <>
            Connectez vos{" "}
            <HeroAccent>portails de compagnies d&apos;assurance</HeroAccent>{" "}
            une fois pour toutes.
          </>
        }
      />

      {/* Block 1 — Produits */}
      <ProductsBlock />

      <div className="h-px bg-panora-border" />

      {/* Block 2 — EDIconnexion (its own channel, not part of extranets) */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
            Connexion {EDI_BRAND}
          </h2>
          <p className="text-[13px] text-panora-text-secondary leading-[18px]">
            Un identifiant pour toutes vos compagnies compatibles. Activez-le une
            fois ; connectez les portails restants ci-dessous.
          </p>
        </div>
        <EdiCard />
      </div>

      <div className="h-px bg-panora-border" />

      {/* Block 3 — Extranets */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
            Extranets compagnie
          </h2>
          <p className="text-[13px] text-panora-text-secondary leading-[18px]">
            Connectez les portails de vos compagnies d&apos;assurance — un accès
            par compagnie.
          </p>
        </div>

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
          Cherchez une compagnie d&apos;assurance dans la barre ci-dessus pour
          ajouter votre premier accès. Vos cartes apparaîtront ici.
        </p>
      </div>
    </div>
  );
}
