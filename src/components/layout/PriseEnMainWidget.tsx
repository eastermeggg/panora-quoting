"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useOnboardingProgress } from "@/data/onboarding-store";
import { ProgressRing } from "@/components/signup/ProgressRing";

/* Sidebar onboarding widget — the "Bienvenue sur Panora" card (Figma
 * 4451-34645): 👋 + title + "Voir détail", with a green progress bar hugging
 * the card's bottom edge. Collapsed → a compact progress-ring tile. Hidden
 * once onboarding is complete or dismissed. */
export function PriseEnMainWidget({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { percent, complete, dismissed } = useOnboardingProgress();

  if (complete || dismissed) return null;

  const isActive = pathname.startsWith("/bienvenue");

  if (collapsed) {
    return (
      <Link
        href="/bienvenue"
        title={`Bienvenue sur Panora — ${percent}%`}
        aria-label={`Bienvenue sur Panora, ${percent}% complété`}
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
      aria-label={`Bienvenue sur Panora, ${percent}% complété`}
      className={cn(
        "block overflow-hidden rounded-[10px] border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)]",
        isActive ? "border-panora-green-border" : "border-panora-border"
      )}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <span className="text-[20px] leading-none" aria-hidden>
          👋
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium leading-5 text-panora-text">
            Bienvenue sur Panora
          </span>
          <span className="block text-[12px] leading-4 text-panora-text-secondary">
            Voir détail
          </span>
        </span>
      </div>
      {/* Progress bar on the card's bottom edge */}
      <div className="h-[4px] w-full bg-panora-border/60">
        <div
          className="h-full rounded-r-full bg-panora-green transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(percent, 4)}%` }}
        />
      </div>
    </Link>
  );
}
