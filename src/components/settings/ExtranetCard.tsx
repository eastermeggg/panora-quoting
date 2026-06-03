"use client";

import { useState } from "react";
import { Globe, User, Pencil, Trash2 } from "lucide-react";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { AgentLivePanel } from "@/components/ui/AgentLivePanel";
import { ProductBadge } from "./ProductBadge";
import {
  SessionActionBlock,
  SessionStatusPill,
} from "./ExtranetSessionPanel";
import { useSessionActivation } from "@/hooks/useSessionActivation";
import {
  getActiveProducts,
  getRequestedProducts,
  mockConnectionSteps,
  updateExtranetSession,
  type ExtranetConfig,
} from "@/data/settings-mock";

interface ExtranetCardProps {
  config: ExtranetConfig;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ExtranetCard({ config, onEdit, onDelete }: ExtranetCardProps) {
  const activeProducts = getActiveProducts(config);
  const requestedProducts = getRequestedProducts(config);
  const selectedSet = new Set(config.selectedProducts);
  const modelizedNewSet = new Set(
    config.modelizedProducts.filter((p) => p.isNew).map((p) => p.product)
  );
  const inactiveProducts = config.modelizedProducts
    .filter((p) => !selectedSet.has(p.product))
    .map((p) => p.product);

  const otpFormat =
    config.sessionState.status === "otp_required"
      ? config.sessionState.otpFormat
      : "digits-6";

  const { state, submitting, otpError, startConnecting, submitOtp, retry } =
    useSessionActivation({
      initialState: config.sessionState,
      otpFormat,
      onActivated: () =>
        updateExtranetSession(config.id, {
          status: "active",
          expiresAtLabel: "18h",
        }),
    });

  const [livePanelOpen, setLivePanelOpen] = useState(false);

  return (
    <>
      <div
        className="group flex flex-col h-[340px] bg-white border border-panora-border rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)] hover:bg-panora-bg hover:shadow-[0px_5px_9px_0px_rgba(0,0,0,0.06)] transition-all duration-200"
      >
        {/* Top section */}
        <div className="flex-1 min-h-0 p-4 border-b border-panora-border flex flex-col gap-4 overflow-hidden">
          <div className="flex flex-col gap-2.5">
            {/* Header */}
            <div className="flex items-start justify-between min-w-0">
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
            </div>

            {/* Link section: URL + username, horizontal */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 items-center min-w-0">
              <a
                href={`https://${config.portalUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[13px] font-medium text-panora-green hover:underline min-w-0"
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span className="truncate">{config.portalUrl}</span>
              </a>
              <div className="flex items-center gap-2 text-[13px] text-panora-text-primary min-w-0">
                <User className="w-4 h-4 shrink-0 text-panora-text-muted" />
                <span className="truncate">{config.username}</span>
              </div>
            </div>
          </div>

          {/* Product badges */}
          <div className="flex flex-wrap gap-1.5 content-start">
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

          {/* Session action — only renders for non-active states */}
          <SessionActionBlock
            state={state}
            submitting={submitting}
            otpError={otpError}
            onActivate={startConnecting}
            onSubmitOtp={() => submitOtp()}
            onRetry={retry}
            onOpenLivePanel={() => setLivePanelOpen(true)}
          />
        </div>

        {/* Bottom strip: status pill + hover-revealed actions */}
        <div className="flex items-center justify-between gap-2 pl-4 pr-[13px] py-2.5">
          <SessionStatusPill state={state} />
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

      <AgentLivePanel
        open={livePanelOpen}
        title={`Activation de la session — ${config.insurerName}`}
        steps={mockConnectionSteps}
        onClose={() => setLivePanelOpen(false)}
        isLive
        isCompleted={false}
      />
    </>
  );
}
