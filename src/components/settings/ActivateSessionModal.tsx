"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { AgentLivePanel } from "@/components/ui/AgentLivePanel";
import { SessionActionBlock } from "./ExtranetSessionPanel";
import { WaitingDemandesPanel } from "./WaitingDemandesPanel";
import { useSessionActivation } from "@/hooks/useSessionActivation";
import {
  updateConfiguredExtranet,
  updateExtranetSession,
  mockConnectionSteps,
  type ExtranetConfig,
} from "@/data/settings-mock";
import {
  getCotations,
  getPendingDemandesForInsurer,
  launchPendingForInsurer,
} from "@/data/cotations-store";

interface ActivateSessionModalProps {
  config: ExtranetConfig;
  onClose: () => void;
}

export function ActivateSessionModal({
  config,
  onClose,
}: ActivateSessionModalProps) {
  const [livePanelOpen, setLivePanelOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  // The stock of demandes waiting on this session, snapshotted when the modal
  // opens. Captured once: activating launches them (flipping them out of
  // "pending"), so we keep this list to confirm what just went out.
  const [waitingAtOpen] = useState(() =>
    getPendingDemandesForInsurer(getCotations(), config.insurerId)
  );
  const hasWaiting = waitingAtOpen.length > 0;

  const otpFormat =
    config.sessionState.status === "otp_required"
      ? config.sessionState.otpFormat
      : "digits-6";

  const {
    state,
    submitting,
    otpError,
    resendCooldown,
    startConnecting,
    submitOtp,
    resendOtp,
    retry,
  } = useSessionActivation({
    initialState: config.sessionState,
    otpFormat,
    onActivated: () => {
      updateExtranetSession(config.id, {
        status: "active",
        expiresAtLabel: "18h",
      });
      // Release the backlog the moment the session is live.
      launchPendingForInsurer(config.insurerId);
    },
  });

  // The card's "Activer la session" CTA already counts as the broker's intent
  // to activate. When the modal opens on an inactive session, skip the second
  // click by kicking off the connecting phase immediately.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (config.sessionState.status === "inactive") {
      autoStartedRef.current = true;
      startConnecting();
    }
  }, [config.sessionState.status, startConnecting]);

  // Auto-close as soon as the session becomes active. Only fires if the modal
  // opened on a non-active session (i.e. the broker came here to activate) AND
  // there was no backlog — when demandes were waiting, we hold the modal open on
  // the "X demandes lancées" confirmation so the broker sees the payoff.
  const openedActiveRef = useRef(config.sessionState.status === "active");
  useEffect(() => {
    if (openedActiveRef.current || hasWaiting) return;
    if (state.status === "active") onClose();
  }, [state.status, onClose, hasWaiting]);

  const isActive = state.status === "active";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onMouseDown={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[480px] mx-4 flex flex-col max-h-[90vh] overflow-visible"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <div className="flex items-center gap-3 min-w-0">
              <InsurerLogo
                insurerId={config.insurerId}
                name={config.insurerName}
                size="lg"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[15px] font-semibold text-panora-text leading-5 font-display">
                  {config.insurerName}
                  {config.portalLabel && (
                    <span className="text-[13px] font-normal text-panora-text-muted ml-1.5">
                      — {config.portalLabel}
                    </span>
                  )}
                </span>
                <a
                  href={`https://${config.portalUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] text-panora-text-muted hover:text-panora-green transition-colors group"
                >
                  {config.portalUrl}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md hover:bg-panora-border/40 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-panora-text-muted" />
            </button>
          </div>

          <div className="h-px bg-panora-border" />

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
            {/* Headline + intro */}
            <div className="flex flex-col gap-1">
              <h2 className="text-[14px] font-semibold text-panora-text leading-5 font-display">
                {isActive
                  ? "Session active"
                  : "Activation de la session du jour"}
              </h2>
              <p className="text-[12px] text-panora-text-secondary leading-[18px]">
                {isActive
                  ? "L'agent peut coter sur ce portail jusqu'à expiration de la session."
                  : hasWaiting
                    ? "L'agent se connecte au portail à votre place. Dès la session ouverte, les demandes en attente partent automatiquement."
                    : "L'agent se connecte au portail à votre place. Si l'assureur demande un code 2FA, vous le saisissez ici."}
              </p>
            </div>

            {/* Stock of demandes waiting on this session */}
            {hasWaiting && (
              <WaitingDemandesPanel
                demandes={waitingAtOpen}
                mode={isActive ? "launched" : "queued"}
              />
            )}

            {/* Action block (reused from the inline card surface) */}
            {!isActive && (
            <>
            <SessionActionBlock
              state={state}
              submitting={submitting}
              otpError={otpError}
              resendCooldown={resendCooldown}
              otpDelivery={config.otpDelivery}
              emailForwardConfigured={config.emailForwardConfigured}
              onActivate={startConnecting}
              onSubmitOtp={() => submitOtp()}
              onResendOtp={resendOtp}
              onRetry={retry}
              onOpenLivePanel={() => setLivePanelOpen(true)}
              onConfigureEmailForward={() =>
                updateConfiguredExtranet(config.id, {
                  emailForwardConfigured: true,
                })
              }
            />

            {/* Pourquoi explainer */}
            <div className="border-t border-panora-border pt-4">
              <button
                onClick={() => setWhyOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-text-secondary hover:text-panora-text leading-4 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Pourquoi un code chaque jour ?
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform duration-200",
                    whyOpen && "rotate-180"
                  )}
                />
              </button>
              {whyOpen && (
                <div className="mt-3 flex flex-col gap-2.5">
                  <WhyRow
                    icon={<KeyRound className="w-3.5 h-3.5" />}
                    text="L'assureur impose un 2FA quotidien. Ce code est ce qui prouve que vous êtes bien à l'origine de la session."
                  />
                  <WhyRow
                    icon={<ShieldCheck className="w-3.5 h-3.5" />}
                    text="Vos identifiants restent chiffrés (AES-256). L'agent n'utilise que la session de la journée, jamais le mot de passe en clair."
                  />
                </div>
              )}
            </div>
            </>
            )}

            {/* Success footer — shown when the modal stays open on the
                "demandes lancées" confirmation (i.e. there was a backlog). */}
            {isActive && hasWaiting && (
              <div className="flex items-center justify-between gap-3 border-t border-panora-border pt-4">
                <button
                  onClick={onClose}
                  className="text-[13px] font-medium text-panora-text-secondary hover:text-panora-text transition-colors"
                >
                  Fermer
                </button>
                <Link
                  href="/quoting/dashboard"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-panora-green hover:underline"
                >
                  Voir le suivi
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
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

function WhyRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-2.5 text-[12px] text-panora-text-secondary leading-[18px]">
      <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-panora-secondary/60 flex items-center justify-center text-panora-text-secondary">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}
