"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useOnboardingProgress } from "@/data/onboarding-store";
import { ProgressRing } from "@/components/signup/ProgressRing";

/* Sidebar "Prise en main" widget: a compact progress ring + label + percent
 * that links back to the arrival hub. Inspired by the Kiosk "Get Started"
 * nav pill. Hidden once onboarding is complete or dismissed. */
export function PriseEnMainWidget({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { percent, done, total, complete, dismissed } = useOnboardingProgress();

  if (complete || dismissed) return null;

  const isActive = pathname.startsWith("/bienvenue");

  if (collapsed) {
    return (
      <Link
        href="/bienvenue"
        title={`Prise en main — ${percent}%`}
        aria-label={`Prise en main, ${percent}% complété`}
        className="flex items-center justify-center py-0.5"
      >
        <span
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-[8px] transition-colors",
            isActive
              ? "bg-panora-secondary border border-panora-border"
              : "hover:bg-panora-secondary"
          )}
        >
          <ProgressRing percent={percent} size={20} showCheck />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/bienvenue"
      className={cn(
        "flex items-center gap-2.5 h-9 px-2 rounded-md transition-colors",
        isActive ? "bg-panora-secondary" : "hover:bg-panora-border/30"
      )}
    >
      <ProgressRing percent={percent} size={20} showCheck />
      <span
        className={cn(
          "text-[13px] font-medium leading-5 flex-1",
          isActive ? "text-panora-text" : "text-panora-text-secondary"
        )}
      >
        Prise en main
      </span>
      <span className="text-[12px] font-medium tabular-nums text-panora-text-muted">
        {done}/{total}
      </span>
    </Link>
  );
}
