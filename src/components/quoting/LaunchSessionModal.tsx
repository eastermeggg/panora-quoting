"use client";

import { useState, type ReactNode } from "react";
import { Check, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import { AgentLivePanel } from "@/components/ui/AgentLivePanel";
import { SessionActionBlock } from "@/components/settings/ExtranetSessionPanel";
import { useSessionActivation } from "@/hooks/useSessionActivation";
import {
  mockConnectionSteps,
  updateConfiguredExtranet,
  updateExtranetSession,
  type ExtranetConfig,
} from "@/data/settings-mock";
import { launchPendingForInsurer } from "@/data/cotations-store";

export type LaunchReadyInsurer = { id: string; name: string };

/**
 * Split the selected insurers into those already reachable — an active daily
 * session or EDI coverage, so they fire at launch — and those whose session is
 * expired and must be reconnected before that insurer's quote can go out.
 *
 * Unconfigured insurers (no extranet at all) are left out entirely: that's a
 * different problem (the "Ajouter mes codes" flow), not a session to reopen.
 */
export function splitInsurersForLaunch(
  selectedIds: string[],
  configs: ExtranetConfig[]
): { ready: LaunchReadyInsurer[]; down: ExtranetConfig[] } {
  const ready: LaunchReadyInsurer[] = [];
  const down: ExtranetConfig[] = [];
  for (const id of selectedIds) {
    const forId = configs.filter((c) => c.insurerId === id);
    if (forId.length === 0) continue; // unconfigured — out of scope here
    const reachable = forId.find(
      (c) => c.sessionState.status === "active" || c.useEdi
    );
    if (reachable) {
      ready.push({ id, name: reachable.insurerName });
    } else {
      down.push(forId[0]);
    }
  }
  return { ready, down };
}

interface LaunchSessionModalProps {
  /** Insurers with a live session / EDI — already fired ("Cotations déjà lancées"). */
  ready: LaunchReadyInsurer[];
  /** Insurers whose session is expired — reconnected here before they go out. */
  down: ExtranetConfig[];
  /** Launch. `pendingInsurerIds` = down insurers NOT reconnected (still action
   *  requise on the followup). The footer passes []; the ✕ passes them all. */
  onComplete: (pendingInsurerIds: string[]) => void;
  /** ✕ — the already-launched insurers stand; the expired ones land as action
   *  requise on the followup, reconnectable there. */
  onClose: () => void;
}

/**
 * The reconnect modal shown when a launch includes an expired-session insurer.
 * The reachable insurers have already fired ("Cotations déjà lancées"); this
 * modal reconnects the expired one(s) so their own quote can launch too — the
 * footer "Lancer la cotation X" enables only once they're back.
 */
export function LaunchSessionModal({
  ready,
  down,
  onComplete,
  onClose,
}: LaunchSessionModalProps) {
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const allConnected = down.every((c) => connectedIds.includes(c.insurerId));
  const firstDownName = down[0]?.insurerName ?? "";
  const launchLabel =
    down.length === 1
      ? `Lancer la cotation ${firstDownName}`
      : "Lancer les cotations";

  const handleActivated = (insurerId: string) =>
    setConnectedIds((prev) =>
      prev.includes(insurerId) ? prev : [...prev, insurerId]
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[600px] mx-4 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top chrome bar */}
        <div className="flex items-center justify-between px-4 py-[11px] bg-panora-bg border-b border-panora-border">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-panora-green" />
            <span className="text-[13px] font-medium text-panora-text-secondary leading-5">
              Lancement de la cotation
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-panora-border/40 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-panora-text-muted" />
          </button>
        </div>

        {/* Title */}
        <div className="px-6 py-5 flex flex-col gap-1.5">
          <h2 className="text-[20px] font-serif text-panora-text tracking-[-0.2px] leading-6">
            Reconnexion requise
          </h2>
          <p className="text-[13px] text-panora-text-secondary leading-5">
            La session {firstDownName} a expiré. Reconnectez-vous et entrez le
            code de double authentification pour lancer votre cotation.
          </p>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 flex flex-col gap-6 overflow-y-auto">
          {/* À reconnecter */}
          <div className="flex flex-col gap-4">
            <SectionLabel>À reconnecter</SectionLabel>
            <div className="flex flex-col gap-3">
              {down.map((config) => (
                <DownReconnectCard
                  key={config.id}
                  config={config}
                  onActivated={handleActivated}
                />
              ))}
            </div>
          </div>

          {/* Cotations déjà lancées */}
          {ready.length > 0 && (
            <div className="flex flex-col gap-4">
              <SectionLabel>Cotations déjà lancées</SectionLabel>
              <div className="flex flex-col gap-3">
                {ready.map((ins) => (
                  <LaunchedInsurerRow key={ins.id} insurer={ins} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — launch the expired insurer's own quote, once it's back */}
        <div className="flex items-center justify-end px-6 py-5 border-t border-panora-border">
          <button
            onClick={() =>
              onComplete(
                down
                  .filter((c) => !connectedIds.includes(c.insurerId))
                  .map((c) => c.insurerId)
              )
            }
            disabled={!allConnected}
            aria-disabled={!allConnected}
            className={cn(
              "btn-primary px-3 py-2 text-[13px] font-medium transition-all",
              !allConnected && "opacity-30 cursor-not-allowed pointer-events-none"
            )}
          >
            {launchLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── One expired insurer: persistent hint, then a staged reconnect — "Se
   reconnecter" button → agent connecting → 2FA code → "Session active". ── */
function DownReconnectCard({
  config,
  onActivated,
}: {
  config: ExtranetConfig;
  onActivated: (insurerId: string) => void;
}) {
  const [livePanelOpen, setLivePanelOpen] = useState(false);
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
    // Always start "inactive" so the broker plays the staged flow (button →
    // connecting → 2FA) rather than being dropped onto the code field.
    initialState: { status: "inactive" },
    otpFormat,
    onActivated: () => {
      updateExtranetSession(config.id, {
        status: "active",
        expiresAtLabel: "18h",
      });
      launchPendingForInsurer(config.insurerId);
      onActivated(config.insurerId);
    },
  });

  return (
    <div className="border border-panora-border rounded-xl bg-white shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <InsurerLogo
          insurerId={config.insurerId}
          name={config.insurerName}
          size="sm"
        />
        <span className="text-[13px] font-medium text-panora-text leading-5">
          {config.insurerName}
        </span>
      </div>

      <p className="text-[13px] text-panora-text-muted leading-5">
        L&apos;agent se reconnecte à votre place. Un code 2FA est demandé,
        saisissez-le ici.
      </p>

      {state.status === "inactive" ? (
        <button
          onClick={startConnecting}
          className="btn-primary self-start px-3 py-1.5 text-[13px] font-medium"
        >
          Se reconnecter
        </button>
      ) : state.status === "active" ? (
        <div className="flex items-center gap-2 bg-panora-green-light rounded-lg px-3 py-2.5">
          <Check className="w-4 h-4 text-panora-green-dark" />
          <span className="text-[13px] font-medium text-panora-green-dark leading-5">
            Session active
          </span>
        </div>
      ) : (
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
            updateConfiguredExtranet(config.id, { emailForwardConfigured: true })
          }
        />
      )}

      <AgentLivePanel
        open={livePanelOpen}
        title={`Reconnexion — ${config.insurerName}`}
        steps={mockConnectionSteps}
        onClose={() => setLivePanelOpen(false)}
        isLive
        isCompleted={false}
      />
    </div>
  );
}

/* ── A reachable insurer whose quote already went out at launch ── */
function LaunchedInsurerRow({ insurer }: { insurer: LaunchReadyInsurer }) {
  return (
    <div className="flex items-center justify-between border border-panora-border rounded-xl p-4">
      <div className="flex items-center gap-2.5">
        <InsurerLogo insurerId={insurer.id} name={insurer.name} size="sm" />
        <span className="text-[13px] font-medium text-panora-text leading-5">
          {insurer.name}
        </span>
      </div>
      <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-panora-green-light">
        <Check className="w-3 h-3 text-panora-green-dark" />
        <span className="text-[12px] font-medium text-panora-green-dark leading-4">
          Lancée
        </span>
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[12px] font-medium text-panora-text-muted leading-4">
      {children}
    </span>
  );
}
