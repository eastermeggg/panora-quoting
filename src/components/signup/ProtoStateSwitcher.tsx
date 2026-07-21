"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { applyProtoScenario } from "@/data/proto-scenario";

/* Prototype-only control to preview the arrival. Grouped by lifecycle:
 *   Onboarding      → admin · join collab
 *   Prise en main   → admin · join collab
 *   Terminé         → (admin & collab merge)
 *   Home            → (merged)
 * Floating, demo-flavored — not part of the real product chrome. */

type Key =
  | "onb-admin"
  | "onb-collab"
  | "pem-admin"
  | "pem-collab"
  | "done"
  | "home";

type Opt = { key: Key; label: string; href: string };

const ONBOARDING: Opt[] = [
  { key: "onb-admin", label: "Admin", href: "/signup?step=admin" },
  { key: "onb-collab", label: "Collab", href: "/signup?step=join" },
];
const PRISE_EN_MAIN: Opt[] = [
  { key: "pem-admin", label: "Admin", href: "/bienvenue?state=progress&prenom=Benjamin" },
  { key: "pem-collab", label: "Collab", href: "/bienvenue?state=progress&collab=1&prenom=Camille" },
];
const FINAL: Opt[] = [
  { key: "done", label: "Terminé", href: "/bienvenue?state=done&prenom=Benjamin" },
  { key: "home", label: "Home", href: "/bienvenue?state=home&prenom=Benjamin" },
];

// The two "set-up" states seed the app; everything else is "fresh".
const SETUP_KEYS: Key[] = ["done", "home"];

export function ProtoStateSwitcher() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const current: Key = (() => {
    if (pathname.startsWith("/signup")) {
      const isJoin =
        params.get("step") === "join" || params.get("invite") !== null;
      return isJoin ? "onb-collab" : "onb-admin";
    }
    const state = params.get("state");
    if (state === "done") return "done";
    if (state === "home") return "home";
    return params.get("collab") === "1" ? "pem-collab" : "pem-admin";
  })();

  const go = (o: Opt) => {
    applyProtoScenario(SETUP_KEYS.includes(o.key) ? "setup" : "fresh");
    router.push(o.href);
  };

  const Btn = ({ o, grow }: { o: Opt; grow?: boolean }) => (
    <button
      type="button"
      onClick={() => go(o)}
      className={cn(
        "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap",
        grow && "flex-1",
        current === o.key
          ? "bg-[#173c2d] text-white"
          : "text-panora-text-secondary hover:bg-panora-drop"
      )}
    >
      {o.label}
    </button>
  );

  const Row = ({ label, opts }: { label: string; opts: Opt[] }) => (
    <div className="flex items-center gap-2">
      <span className="w-[92px] shrink-0 text-[11px] font-medium text-panora-text-muted">
        {label}
      </span>
      <div className="flex flex-1 gap-1">
        {opts.map((o) => (
          <Btn key={o.key} o={o} grow />
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-4 left-1/2 z-[80] -translate-x-1/2">
      <div className="flex min-w-[300px] flex-col gap-1 rounded-[14px] border border-panora-border bg-white p-2 shadow-[0px_10px_28px_rgba(0,0,0,0.16)]">
        <span className="px-1 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-panora-text-muted">
          Aperçu proto
        </span>
        <Row label="Onboarding" opts={ONBOARDING} />
        <Row label="Prise en main" opts={PRISE_EN_MAIN} />
        <div className="mt-0.5 flex gap-1 border-t border-panora-border pt-1.5">
          {FINAL.map((o) => (
            <Btn key={o.key} o={o} grow />
          ))}
        </div>
      </div>
    </div>
  );
}
