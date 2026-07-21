"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { applyProtoScenario } from "@/data/proto-scenario";

/* Prototype-only control to preview the arrival states. Lives behind a button
 * in a popover — in the sidebar footer on app screens (ProtoStateSwitcher), and
 * as a floating button on screens without a sidebar like /signup
 * (ProtoStateSwitcherFloating). Grouped by lifecycle:
 *   Onboarding      → admin · join collab
 *   Prise en main   → admin · join collab
 *   Terminé · Home  → (admin & collab merge) */

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

function useCurrentKey(): Key {
  const pathname = usePathname();
  const params = useSearchParams();
  if (pathname.startsWith("/signup")) {
    const isJoin =
      params.get("step") === "join" || params.get("invite") !== null;
    return isJoin ? "onb-collab" : "onb-admin";
  }
  const state = params.get("state");
  if (state === "done") return "done";
  if (state === "home") return "home";
  return params.get("collab") === "1" ? "pem-collab" : "pem-admin";
}

function Btn({
  o,
  current,
  onSelect,
}: {
  o: Opt;
  current: Key;
  onSelect: (o: Opt) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(o)}
      className={cn(
        "flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
        current === o.key
          ? "bg-[#173c2d] text-white"
          : "text-panora-text-secondary hover:bg-panora-drop"
      )}
    >
      {o.label}
    </button>
  );
}

function Row({
  label,
  opts,
  current,
  onSelect,
}: {
  label: string;
  opts: Opt[];
  current: Key;
  onSelect: (o: Opt) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[92px] shrink-0 text-[11px] font-medium text-panora-text-muted">
        {label}
      </span>
      <div className="flex flex-1 gap-1">
        {opts.map((o) => (
          <Btn key={o.key} o={o} current={current} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

/* The popover contents — the grouped lifecycle rows. */
function SwitcherPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const current = useCurrentKey();

  const go = (o: Opt) => {
    applyProtoScenario(SETUP_KEYS.includes(o.key) ? "setup" : "fresh");
    router.push(o.href);
    onClose();
  };

  return (
    <div className="flex min-w-[300px] flex-col gap-1 rounded-[14px] border border-panora-border bg-white p-2 shadow-[0px_10px_28px_rgba(0,0,0,0.16)]">
      <span className="px-1 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-panora-text-muted">
        Aperçu proto
      </span>
      <Row label="Onboarding" opts={ONBOARDING} current={current} onSelect={go} />
      <Row label="Prise en main" opts={PRISE_EN_MAIN} current={current} onSelect={go} />
      <div className="mt-0.5 flex gap-1 border-t border-panora-border pt-1.5">
        {FINAL.map((o) => (
          <Btn key={o.key} o={o} current={current} onSelect={go} />
        ))}
      </div>
    </div>
  );
}

/* Open/close + click-outside for the popover. */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

/* Sidebar footer trigger — matches the other footer buttons; opens the panel in
 * a popover to the right of the sidebar. */
export function ProtoStateSwitcher({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const { open, setOpen, ref } = usePopover();
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={collapsed ? "Aperçu proto" : undefined}
        aria-label="Aperçu proto"
        className={cn(
          "flex w-full items-center rounded-md transition-colors",
          collapsed
            ? "justify-center py-0.5"
            : "h-8 gap-2 px-2 py-1.5 hover:bg-panora-border/30",
          open && !collapsed && "bg-panora-border/30"
        )}
      >
        {collapsed ? (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-[8px] text-panora-text-secondary transition-colors hover:bg-panora-secondary hover:text-panora-text",
              open && "bg-panora-secondary text-panora-text"
            )}
          >
            <FlaskConical className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
        ) : (
          <>
            <FlaskConical className="h-4 w-4 shrink-0 text-panora-text-secondary" />
            <span className="text-[13px] font-medium leading-5 text-panora-text-secondary">
              Aperçu proto
            </span>
          </>
        )}
      </button>
      {open && (
        <div className="absolute bottom-0 left-full z-[90] ml-2">
          <Suspense fallback={null}>
            <SwitcherPanel onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

/* Floating trigger — for screens without the sidebar (e.g. /signup). */
export function ProtoStateSwitcherFloating() {
  const { open, setOpen, ref } = usePopover();
  return (
    <div className="fixed bottom-4 left-4 z-[80]" ref={ref}>
      {open && (
        <div className="absolute bottom-full left-0 mb-2">
          <Suspense fallback={null}>
            <SwitcherPanel onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Aperçu proto"
        className={cn(
          "flex items-center gap-2 rounded-full border border-panora-border bg-white px-3.5 py-2 text-[12px] font-medium text-panora-text-secondary shadow-[0px_10px_28px_rgba(0,0,0,0.16)] transition-colors hover:bg-panora-drop",
          open && "bg-panora-drop"
        )}
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Aperçu proto
      </button>
    </div>
  );
}
