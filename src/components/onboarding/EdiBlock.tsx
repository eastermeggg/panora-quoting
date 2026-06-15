"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepNumber } from "@/components/onboarding/StepNumber";
import { EdiCard } from "@/components/settings/EdiCard";
import { useEdiConnection, EDI_BRAND } from "@/data/edi-store";

/**
 * EDIconnexion block on the Portails step. EDI is optional — many brokers don't
 * have it — so we triage first ("Avez-vous une connexion EDI ?") and only reveal
 * the activation card on « Oui ». An already-active connection defaults to Oui.
 */
export function EdiBlock({ step }: { step?: number }) {
  const edi = useEdiConnection();
  const [choice, setChoice] = useState<"yes" | "no" | null>(
    edi.status === "idle" ? null : "yes"
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Title with the "do you have EDI?" triage on the right */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {step !== undefined && <StepNumber n={step} />}
          <h2 className="text-[15px] font-semibold text-panora-text leading-5 font-display">
            Connexion {EDI_BRAND}
          </h2>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] text-panora-text-secondary">
            Avez-vous une connexion EDI&nbsp;?
          </span>
          <div className="inline-flex items-center gap-0.5 rounded-lg bg-panora-secondary p-0.5">
            <ChoiceBtn active={choice === "yes"} onClick={() => setChoice("yes")}>
              Oui
            </ChoiceBtn>
            <ChoiceBtn active={choice === "no"} onClick={() => setChoice("no")}>
              Non
            </ChoiceBtn>
          </div>
        </div>
      </div>

      {choice === "yes" && <EdiCard />}

      {choice === "no" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-panora-border bg-panora-secondary/30 p-3.5">
          <Info className="w-4 h-4 text-panora-text-muted shrink-0 mt-0.5" />
          <p className="text-[12px] text-panora-text-secondary leading-[18px]">
            Pas de problème. Vous coterez via les extranets ci-dessous. Si vous
            souscrivez à {EDI_BRAND} plus tard, vous pourrez l&apos;activer à tout
            moment depuis Paramètres&nbsp;›&nbsp;EDI.
          </p>
        </div>
      )}
    </div>
  );
}

function ChoiceBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-3.5 h-7 rounded-md text-[12px] font-medium transition-colors",
        active
          ? "bg-white text-panora-text shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          : "text-panora-text-secondary hover:text-panora-text"
      )}
    >
      {children}
    </button>
  );
}
