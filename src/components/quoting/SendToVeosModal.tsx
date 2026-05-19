"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SendToVeosState =
  | { status: "prompt"; label: string }
  | { status: "sending"; label: string }
  | { status: "sent"; label: string };

interface SendToVeosModalProps {
  state: SendToVeosState;
  clientName?: string;
  onDismiss: () => void;
  onSend: () => void;
}

/**
 * Modal shown after a comparison doc is exported, asking whether to push the
 * file to VEOS. Only rendered when VEOS is connected — when it isn't, the
 * export happens silently and we do not nudge the user about the integration.
 */
export function SendToVeosModal({
  state,
  clientName,
  onDismiss,
  onSend,
}: SendToVeosModalProps) {
  // Auto-close after a brief success confirmation.
  useEffect(() => {
    if (state.status !== "sent") return;
    const timer = window.setTimeout(onDismiss, 2400);
    return () => window.clearTimeout(timer);
  }, [state, onDismiss]);

  // ESC to dismiss (except while sending).
  useEffect(() => {
    if (state.status === "sending") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state.status, onDismiss]);

  const fileLabel = state.label;
  const sending = state.status === "sending";
  const sent = state.status === "sent";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
      onMouseDown={sending ? undefined : onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Synchroniser avec VEOS"
    >
      <div
        className="bg-white rounded-xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] w-full max-w-[460px] mx-4 flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-[44px] px-4 bg-panora-secondary/40 border-b border-panora-border">
          <span className="text-[13px] font-medium text-panora-text leading-5 truncate">
            {sent ? "Envoyé à VEOS" : "Envoyer à VEOS ?"}
          </span>
          {!sending && (
            <button
              type="button"
              onClick={onDismiss}
              className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-panora-border/50 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-panora-text-muted" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-4 flex flex-col gap-4">
          <FileRow label={fileLabel} sent={sent} />
          {!sent && <DestinationRow clientName={clientName} />}
          <p className="text-[12px] text-panora-text-secondary leading-[18px]">
            {sent ? (
              <>
                Le document est classé dans la fiche
                {clientName ? (
                  <> <span className="font-medium text-panora-text">{clientName}</span></>
                ) : (
                  " client"
                )}{" "}
                dans VEOS. Vous le retrouverez avec les autres pièces du dossier.
              </>
            ) : (
              <>
                Le document sera classé dans la fiche client dans VEOS, à côté
                des autres pièces du dossier.
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-panora-border px-6 py-3.5 flex items-center justify-between gap-3 bg-panora-secondary/30">
          <span className="text-[11.5px] text-panora-text-muted leading-4 truncate">
            {sending
              ? "Envoi en cours, ne fermez pas la fenêtre…"
              : sent
              ? "Cette fenêtre se ferme automatiquement."
              : "Cette demande apparaît après chaque export."}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {sent ? (
              <button
                type="button"
                onClick={onDismiss}
                className="px-4 h-9 text-[13px] font-medium text-panora-text-secondary rounded-lg border border-panora-border hover:bg-white transition-colors"
              >
                Fermer
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onDismiss}
                  disabled={sending}
                  className={cn(
                    "px-4 h-9 text-[13px] font-medium text-panora-text-secondary rounded-lg border border-panora-border hover:bg-white transition-colors",
                    sending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Pas maintenant
                </button>
                <button
                  type="button"
                  onClick={onSend}
                  disabled={sending}
                  className={cn(
                    "btn-primary px-4 h-9 text-[13px] font-semibold leading-5 inline-flex items-center gap-1.5",
                    sending && "opacity-80 cursor-not-allowed"
                  )}
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Envoi…
                    </>
                  ) : (
                    <>
                      <Image
                        src="/logos/veos.svg"
                        alt=""
                        width={14}
                        height={14}
                        className="rounded-[3px]"
                      />
                      Envoyer à VEOS
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function FileRow({ label, sent }: { label: string; sent: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-panora-secondary/40 border border-panora-border">
      <div className="w-9 h-9 rounded-md bg-white border border-panora-border flex items-center justify-center shrink-0">
        {sent ? (
          <CheckCircle2 className="w-4 h-4 text-panora-green" />
        ) : (
          <FileText
            className="w-4 h-4 text-panora-text-secondary"
            strokeWidth={1.75}
          />
        )}
      </div>
      <div className="flex flex-col min-w-0 leading-tight flex-1">
        <span className="text-[13px] font-medium text-panora-text truncate">
          {label}
        </span>
        <span className="text-[11.5px] text-panora-text-muted leading-4">
          {sent ? "Synchronisé · à l'instant" : "Téléchargé · à l'instant"}
        </span>
      </div>
    </div>
  );
}

function DestinationRow({ clientName }: { clientName?: string }) {
  return (
    <div className="flex items-center gap-3 text-[12px] text-panora-text-secondary">
      <ArrowRight className="w-3.5 h-3.5 text-panora-text-muted shrink-0" />
      <div className="flex items-center gap-1.5 min-w-0">
        <Image
          src="/logos/veos.svg"
          alt="VEOS"
          width={14}
          height={14}
          className="rounded-[3px] shrink-0"
        />
        <span className="text-panora-text font-medium truncate">VEOS</span>
        {clientName && (
          <>
            <span className="text-panora-text-muted">·</span>
            <span className="text-panora-text-secondary truncate">
              Fiche {clientName}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
