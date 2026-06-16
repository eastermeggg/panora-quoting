"use client";

import { usePathname } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useConfiguredExtranets } from "@/data/settings-mock";
import { useCotations, getWaitingDemandeCount } from "@/data/cotations-store";

/**
 * App-wide banner shown when at least one configured extranet has a non-active
 * session. Renders at the top of the app shell on every page except the
 * onboarding wizard (which already asks for activation in its own flow).
 */
export function SessionExpiredBanner() {
  const pathname = usePathname();
  const extranets = useConfiguredExtranets();
  const cotations = useCotations();

  // The wizard manages its own activation guidance. No need to double-up.
  if (pathname?.startsWith("/onboarding")) return null;

  const expired = extranets.filter(
    (c) =>
      c.connectionStatus === "connected" &&
      c.sessionState.status !== "active" &&
      !c.useEdi
  );

  if (expired.length === 0) return null;

  const count = expired.length;
  const plural = count > 1;

  // The backlog stuck behind those closed sessions — the reason to reactivate.
  const waiting = getWaitingDemandeCount(cotations, extranets);
  const waitingPlural = waiting > 1;

  return (
    <div
      role="alert"
      className="shrink-0 flex items-center gap-3 px-5 py-2.5 bg-panora-warning-bg border-b border-panora-warning/25"
    >
      <AlertCircle className="w-4 h-4 text-panora-warning-text shrink-0" />
      <p className="text-[13px] text-panora-warning-text leading-5 flex-1 min-w-0">
        <span className="font-medium">
          {count} session{plural ? "s" : ""} expirée{plural ? "s" : ""}
        </span>
        <span className="text-panora-warning-text/85">
          {waiting > 0
            ? `. ${waiting} demande${waitingPlural ? "s" : ""} en attente, réactivez${plural ? "-les" : "-la"} depuis les cotations concernées.`
            : `. Réactivez${plural ? "-les" : "-la"} depuis les cotations concernées.`}
        </span>
      </p>
    </div>
  );
}
