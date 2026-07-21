"use client";

import Link from "next/link";
import { HelpCircle, Map } from "lucide-react";

/* Secondary header actions for the cotation feature — shown in both the empty
 * state header and the populated dashboard TopBar so they stay consistent.
 *   • Aide à la cotation → the quoting tutorial / how-to (address + ideal e-mail)
 *   • Roadmap           → the products & insurers release calendar */
export function CotationHeaderActions() {
  return (
    <div className="flex items-center gap-0.5">
      <Link
        href="/onboarding"
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-panora-text-secondary transition-colors hover:bg-panora-drop hover:text-panora-text"
      >
        <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
        Aide à la cotation
      </Link>
      <Link
        href="/matrice-couverture"
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-panora-text-secondary transition-colors hover:bg-panora-drop hover:text-panora-text"
      >
        <Map className="h-4 w-4" strokeWidth={1.75} />
        Roadmap
      </Link>
    </div>
  );
}
