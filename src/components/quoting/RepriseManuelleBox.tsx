"use client";

/**
 * Reprise manuelle — the inline prompt inside an action-required InsurerCard.
 * It shows only the block summary and a "Reprendre la main" button; no extranet
 * screen appears until the broker opens the takeover modal (RepriseManuelleModal).
 *
 * Covers two flavours via action.repriseKind:
 *  - "compte": several broker accounts on the portal; broker picks the right one.
 *  - "ecran": an unrecognized screen (captcha / non-scripted step).
 *
 * Matches the established Cuivre action-box treatment (see TwoFaActionBox).
 */

import { useState } from "react";
import { Building2, MousePointerClick } from "lucide-react";
import { RepriseManuelleModal } from "@/components/quoting/RepriseManuelleModal";
import type { TwoFaAction } from "@/data/mock";

interface RepriseManuelleBoxProps {
  action: TwoFaAction;
  insurerName: string;
  insurerId?: string;
  onResolved: () => void;
}

export function RepriseManuelleBox({
  action,
  insurerName,
  insurerId,
  onResolved,
}: RepriseManuelleBoxProps) {
  const [open, setOpen] = useState(false);
  const Icon = action.repriseKind === "compte" ? Building2 : MousePointerClick;

  return (
    <>
      <div className="relative bg-[rgba(242,221,193,0.4)] rounded-[10px] flex items-end gap-4 pl-[21px] pr-4 py-4">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_4px_0px_0px_0px_#cb8052]" />

        <div className="flex-1 flex flex-col gap-1.5 text-[#80452b] min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 shrink-0" />
            <h4 className="text-[15px] font-semibold leading-[21px] tracking-[-0.15px]">
              {action.title}
            </h4>
          </div>
          <p className="text-[13px] font-normal leading-5">{action.desc}</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-primary shrink-0 flex items-center gap-2 px-3 py-2 text-[13px] font-medium whitespace-nowrap"
        >
          Reprendre la main
        </button>
      </div>

      {open && (
        <RepriseManuelleModal
          action={action}
          insurerName={insurerName}
          insurerId={insurerId}
          onClose={() => setOpen(false)}
          onResolved={onResolved}
        />
      )}
    </>
  );
}
