"use client";

/**
 * Reprise manuelle — the takeover workspace, in a big centered modal.
 *
 * Opened from the InsurerCard prompt ("Reprendre la main"). No extranet screen
 * is shown until the broker is here: the modal IS the act of taking the controls.
 * The broker does the one blocking gesture (pick the account / pass the captcha),
 * hands back, and the agent resumes from the next step.
 */

import { useEffect, useState } from "react";
import { X, Globe, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsurerLogo } from "@/components/ui/InsurerLogo";
import type { TwoFaAction } from "@/data/mock";

interface RepriseManuelleModalProps {
  action: TwoFaAction;
  insurerName: string;
  insurerId?: string;
  onClose: () => void;
  onResolved: () => void;
}

// Stand-in for what the broker reads on the real extranet during the takeover.
// In production these rows are the live portal, not data Panora supplies.
const SAMPLE_ACCOUNTS = [
  {
    id: "4412",
    label: "Cabinet Martin — code courtier 4412",
    detail: "Dernière cotation : 12/04/2026",
    recommande: true,
  },
  {
    id: "7781",
    label: "Martin & Associés — code courtier 7781",
    detail: "Convention santé collective",
  },
];

export function RepriseManuelleModal({
  action,
  insurerName,
  insurerId,
  onClose,
  onResolved,
}: RepriseManuelleModalProps) {
  const isCompte = action.repriseKind === "compte";
  const portal = action.portalName || insurerName;
  const portalSlug = portal.toLowerCase().replace(/\s+/g, "");

  const [account, setAccount] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState(false);
  const [remember, setRemember] = useState(true);
  const [resuming, setResuming] = useState(false);

  const gestureDone = isCompte ? account !== null : captcha;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !resuming) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, resuming]);

  const handBack = () => {
    setResuming(true);
    window.setTimeout(() => onResolved(), 1500);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={resuming ? undefined : onClose}
      />
      <div className="fixed inset-0 z-50 grid place-items-center p-6 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={action.title}
          className="pointer-events-auto w-[min(900px,100%)] max-h-[calc(100vh-48px)] flex flex-col bg-white rounded-xl border border-panora-border shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12)] overflow-hidden"
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-panora-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <InsurerLogo insurerId={insurerId ?? ""} name={portal} size="md" />
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-panora-text leading-5 truncate">
                  {action.title}
                </h2>
                <p className="text-[12px] text-panora-text-muted leading-4">
                  Reprise manuelle · {portal}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={resuming}
              aria-label="Fermer"
              className="p-1 rounded hover:bg-panora-drop text-panora-text-muted hover:text-panora-text transition-colors disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {resuming ? (
            <div className="flex-1 grid place-items-center px-6 py-16">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-panora-green" />
                <div>
                  <p className="text-[15px] font-semibold text-panora-text">
                    Reprise de la cotation…
                  </p>
                  <p className="text-[13px] text-panora-text-secondary mt-1">
                    L&apos;agent reprend la main sur {portal}.
                    {isCompte && remember
                      ? ` Le compte sera réutilisé par défaut.`
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-[13px] text-panora-text-secondary leading-5 mb-4 max-w-[68ch]">
                  {action.gesture}
                </p>

                {/* Framed extranet — the broker is in control here */}
                <div className="rounded-lg border border-panora-border bg-white overflow-hidden">
                  <div className="flex items-center gap-2 px-3 h-9 border-b border-panora-border bg-panora-drop">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-panora-border" />
                      <span className="w-2.5 h-2.5 rounded-full bg-panora-border" />
                      <span className="w-2.5 h-2.5 rounded-full bg-panora-border" />
                    </span>
                    <span className="flex-1 inline-flex items-center gap-1.5 text-[12px] text-panora-text-muted truncate">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      extranet.{portalSlug}.fr/{isCompte ? "comptes" : "verification"}
                    </span>
                    <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-panora-error-bg text-[11px] font-semibold text-panora-error">
                      <span className="w-1.5 h-1.5 rounded-full bg-panora-error animate-pulse" />
                      Vous avez la main
                    </span>
                  </div>

                  <div className="p-5 min-h-[300px]">
                    {isCompte ? (
                      <div className="max-w-[520px] mx-auto flex flex-col gap-2">
                        <span className="text-[12px] font-medium text-panora-text-muted mb-1">
                          Comptes courtier rattachés à cet identifiant {portal}
                        </span>
                        {SAMPLE_ACCOUNTS.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setAccount(a.id)}
                            aria-pressed={account === a.id}
                            className={cn(
                              "text-left rounded-lg border p-3.5 flex items-start justify-between gap-3 transition-colors",
                              account === a.id
                                ? "border-panora-green bg-panora-green-light/40"
                                : "border-panora-border hover:border-panora-green/50"
                            )}
                          >
                            <span className="min-w-0">
                              <span className="flex items-center gap-2 flex-wrap">
                                <span className="text-[14px] font-medium text-panora-text">
                                  {a.label}
                                </span>
                                {a.recommande && (
                                  <span className="inline-flex items-center h-5 px-1.5 rounded-full bg-panora-green-light text-[11px] font-medium text-panora-green-dark">
                                    Habituel
                                  </span>
                                )}
                              </span>
                              <span className="block text-[13px] text-panora-text-secondary mt-1">
                                {a.detail}
                              </span>
                            </span>
                            <span
                              aria-hidden
                              className={cn(
                                "shrink-0 mt-0.5 grid place-items-center w-5 h-5 rounded-full border transition-colors",
                                account === a.id
                                  ? "border-panora-green bg-panora-green"
                                  : "border-panora-text-muted/40"
                              )}
                            >
                              {account === a.id && (
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid place-items-center min-h-[260px]">
                        <div className="w-full max-w-[300px] rounded-lg border border-panora-border bg-panora-drop/60 p-4">
                          <label className="flex items-center gap-3 text-[14px] text-panora-text cursor-pointer">
                            <input
                              type="checkbox"
                              checked={captcha}
                              onChange={(e) => setCaptcha(e.target.checked)}
                              className="w-5 h-5 accent-panora-green"
                            />
                            Je ne suis pas un robot
                          </label>
                          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-panora-text-muted">
                            <span className="w-4 h-4 rounded-sm border border-panora-border" />
                            Vérification
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isCompte && (
                  <label className="flex items-center gap-2 text-[13px] text-panora-text-secondary cursor-pointer select-none mt-4">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 accent-[#1A3C34]"
                    />
                    Utiliser ce compte par défaut pour {portal}
                  </label>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-t border-panora-border">
                <span className="text-[12px] text-panora-text-muted">
                  {gestureDone
                    ? "Vous pouvez rendre la main à l'agent."
                    : isCompte
                      ? "Sélectionnez le compte à utiliser."
                      : "Validez la vérification ci-dessus."}
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-9 px-4 rounded-lg border border-panora-border bg-white text-[13px] font-medium text-panora-text-secondary hover:bg-panora-drop transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={!gestureDone}
                    onClick={handBack}
                    className={cn(
                      "btn-primary h-9 px-4 text-[13px] font-medium whitespace-nowrap transition-opacity",
                      !gestureDone && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    Rendre la main à l&apos;agent
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
