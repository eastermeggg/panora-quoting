"use client";

import { useState } from "react";
import {
  Globe,
  User,
  Pencil,
  Trash2,
  KeyRound,
  ArrowRight,
  Check,
  Inbox,
  Network,
} from "lucide-react";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { ProductBadge } from "./ProductBadge";
import { SessionStatusPill } from "./ExtranetSessionPanel";
import { ActivateSessionModal } from "./ActivateSessionModal";
import {
  getActiveProducts,
  getRequestedProducts,
  type ExtranetConfig,
} from "@/data/settings-mock";
import {
  useCotations,
  getPendingDemandesForInsurer,
} from "@/data/cotations-store";
import { useEdiCoveredInsurerIds } from "@/data/edi-store";

interface ExtranetCardProps {
  config: ExtranetConfig;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Hide the session activation CTA and status pill. Used in onboarding Step 2
   *  where the broker only stores credentials; activation happens later. */
  hideSessionActivation?: boolean;
}

export function ExtranetCard({
  config,
  onEdit,
  onDelete,
  hideSessionActivation,
}: ExtranetCardProps) {
  const activeProducts = getActiveProducts(config);
  const requestedProducts = getRequestedProducts(config);
  const selectedSet = new Set(config.selectedProducts);
  const modelizedNewSet = new Set(
    config.modelizedProducts.filter((p) => p.isNew).map((p) => p.product)
  );
  const inactiveProducts = config.modelizedProducts
    .filter((p) => !selectedSet.has(p.product))
    .map((p) => p.product);

  const [modalOpen, setModalOpen] = useState(false);
  const isSessionActive = config.sessionState.status === "active";

  // Whether the global EDI channel already covers this company.
  const ediCovered = useEdiCoveredInsurerIds().has(config.insurerId);

  // Stock of cotation requests waiting on this insurer's session to reopen.
  const cotations = useCotations();
  const waitingCount = isSessionActive
    ? 0
    : getPendingDemandesForInsurer(cotations, config.insurerId).length;

  return (
    <>
      <div className="group flex flex-col bg-white border border-panora-border rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)] hover:shadow-[0px_5px_9px_0px_rgba(0,0,0,0.06)] transition-shadow duration-200">
        {/* Top: identity */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <InsurerLogo
                insurerId={config.insurerId}
                name={config.insurerName}
                size="md"
              />
              <span className="text-[15px] font-medium text-panora-text-primary leading-5 truncate">
                {config.insurerName}
              </span>
            </div>
            {ediCovered && (
              <span className="shrink-0 inline-flex items-center gap-1 h-5 px-2 rounded-full bg-[#1366b3]/10 text-[11px] font-medium text-[#1366b3]">
                <Network className="w-3 h-3" />
                Couvert par EDI
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 items-center min-w-0">
            <a
              href={`https://${config.portalUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-medium text-panora-green hover:underline min-w-0"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{config.portalUrl}</span>
            </a>
            <div className="flex items-center gap-1.5 text-[12px] text-panora-text-secondary min-w-0">
              <User className="w-3.5 h-3.5 shrink-0 text-panora-text-muted" />
              <span className="truncate">{config.username}</span>
            </div>
          </div>

          {/* Products */}
          <div className="flex flex-wrap gap-1.5">
            {activeProducts.map((p) => (
              <ProductBadge
                key={p}
                product={p}
                variant={modelizedNewSet.has(p) ? "new" : "modelized"}
              />
            ))}
            {requestedProducts.map((p) => (
              <ProductBadge key={p} product={p} variant="requested" />
            ))}
            {inactiveProducts.map((p) => (
              <ProductBadge key={p} product={p} variant="inactive" />
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-panora-border flex items-center justify-between gap-2 pl-4 pr-[13px] py-2.5">
          {hideSessionActivation ? (
            <span className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full bg-panora-green-light text-[11px] font-semibold text-panora-green-dark">
              <Check className="w-3 h-3" strokeWidth={3} />
              Identifiants enregistrés
            </span>
          ) : isSessionActive ? (
            <SessionStatusPill state={config.sessionState} />
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-panora-warning-bg text-panora-warning-text text-[12px] font-medium hover:brightness-95 transition shrink-0"
              >
                <KeyRound className="w-3 h-3" />
                Activer la session
                <ArrowRight className="w-3 h-3" />
              </button>
              {waitingCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-panora-warning-bg/60 text-[11px] font-medium text-panora-warning-text leading-4 truncate"
                  title={`${waitingCount} demande${waitingCount > 1 ? "s" : ""} en attente de cette session`}
                >
                  <Inbox className="w-3 h-3 shrink-0" />
                  {waitingCount} en attente
                </span>
              )}
            </div>
          )}
          <div className="flex items-start opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 shrink-0">
            <button
              onClick={onEdit}
              aria-label="Modifier"
              className="size-6 flex items-center justify-center rounded-md hover:bg-panora-secondary transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-panora-green focus-visible:outline-offset-1"
            >
              <Pencil className="w-3.5 h-3.5 text-panora-text-muted" />
            </button>
            <button
              onClick={onDelete}
              aria-label="Supprimer"
              className="size-6 flex items-center justify-center rounded-md hover:bg-panora-secondary transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-panora-green focus-visible:outline-offset-1"
            >
              <Trash2 className="w-3.5 h-3.5 text-panora-text-muted" />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <ActivateSessionModal
          config={config}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
