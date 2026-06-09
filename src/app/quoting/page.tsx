"use client";

import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfiguredExtranets } from "@/data/settings-mock";
import { EmptyStateShowcase } from "@/components/quoting/EmptyStateShowcase";

export default function QuotingEmptyState() {
  const router = useRouter();
  const extranets = useConfiguredExtranets();

  // Fully configured brokers go straight to the dashboard (mount-only check, so
  // partial config that completes via another tab doesn't surprise the user).
  useEffect(() => {
    if (extranets.length === 0) return;
    const hasActiveSession = extranets.some(
      (c) => c.sessionState.status === "active"
    );
    if (hasActiveSession) {
      router.replace("/quoting/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasPartialConfig = extranets.length > 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-panora-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-[17px] h-5 rounded-sm bg-panora-green-light" />
          <span className="text-[15px] font-medium text-panora-text font-serif">
            Assistant cotation
          </span>
        </div>
      </div>

      {/* Welcome + showcase: edge-to-edge split */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Left: welcome */}
        <div className="flex items-center px-8 lg:px-[72px] py-10 lg:py-16 overflow-y-auto">
          <div className="flex flex-col gap-5 max-w-[480px]">
            <h1 className="text-[32px] lg:text-[40px] font-serif text-panora-text leading-[1.05] tracking-[-0.02em] text-balance">
              Bienvenue sur votre assistant cotation
            </h1>
            <p className="text-[14px] text-panora-text-secondary leading-6 max-w-[440px]">
              {hasPartialConfig
                ? "Votre configuration est commencée. Reprenez-la pour activer votre première session et lancer vos cotations."
                : "Connectez vos accès assureurs, puis transférez un email client pour recevoir des cotations comparables en quelques minutes."}
            </p>
            <div className="pt-2">
              <Link
                href="/onboarding"
                className="btn-primary inline-flex items-center gap-2 px-5 h-11 text-[14px] font-semibold leading-5"
              >
                {hasPartialConfig
                  ? "Reprendre la configuration"
                  : "Démarrer la configuration"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Bureau-Vert portfolio panel + painterly landscape + cards */}
        <EmptyStateShowcase />
      </div>
    </div>
  );
}
