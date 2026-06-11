"use client";

import { useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useConfiguredExtranets,
  type ExtranetConfig,
} from "@/data/settings-mock";
import { cn } from "@/lib/utils";
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
                ? "Votre configuration est commencée. Reprenez où vous l'avez laissée — tout est enregistré."
                : "Panora automatise vos cotations sur les compagnies d'assurance qui le permettent. Pour les autres, vos codes 2FA sont regroupés en 1 à 3 saisies par jour — jamais en pleine cotation."}
            </p>

            {hasPartialConfig && <ResumeProgress extranets={extranets} />}

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

// ── Resume progress ──

type MilestoneState = "done" | "current" | "todo";

function ResumeProgress({ extranets }: { extranets: ExtranetConfig[] }) {
  const portalCount = extranets.length;
  const emailExtranets = extranets.filter(
    (c) => c.otpDelivery?.channel === "email"
  );
  const has2faToConfigure = emailExtranets.length > 0;
  const all2faConfigured =
    !has2faToConfigure ||
    emailExtranets.every((c) => c.emailForwardConfigured === true);

  // Milestone 1 is always done in this view (hasPartialConfig gate).
  // Milestone 2 is done when nothing's left to configure for email portals.
  // Milestone 3 is the resume target; it's never done here (we'd be on the
  // dashboard otherwise).
  const m1: MilestoneState = "done";
  const m2: MilestoneState = all2faConfigured ? "done" : "current";
  const m3: MilestoneState =
    m2 === "done" ? "current" : "todo";

  return (
    <section
      aria-label="Votre progression de configuration"
      className="rounded-xl border border-panora-border bg-panora-bg/40 px-5 py-4 flex flex-col gap-3"
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-panora-green-dark">
        Votre progression
      </span>
      <ol className="flex flex-col">
        <Milestone
          n={1}
          state={m1}
          label="Portails"
          sub={`${portalCount} connecté${portalCount > 1 ? "s" : ""}`}
          connectorDone={m2 === "done"}
        />
        <Milestone
          n={2}
          state={m2}
          label="2FA"
          sub={
            !has2faToConfigure
              ? "Aucun email à gérer"
              : all2faConfigured
                ? "Automatisée"
                : "À configurer"
          }
          connectorDone={false}
        />
        <Milestone
          n={3}
          state={m3}
          label="Première session"
          sub="À activer"
          isLast
        />
      </ol>
    </section>
  );
}

function Milestone({
  n,
  state,
  label,
  sub,
  connectorDone,
  isLast,
}: {
  n: number;
  state: MilestoneState;
  label: string;
  sub: string;
  connectorDone?: boolean;
  isLast?: boolean;
}) {
  return (
    <li className="flex gap-3">
      {/* Rail: pip + vertical connector */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "shrink-0 grid place-items-center w-5 h-5 rounded-full text-[10px] font-semibold transition-colors",
            state === "done" && "bg-panora-green text-white",
            state === "current" && "bg-panora-text text-white",
            state === "todo" && "bg-panora-secondary text-panora-text-muted"
          )}
        >
          {state === "done" ? (
            <Check className="w-3 h-3" strokeWidth={3} />
          ) : (
            n
          )}
        </span>
        {!isLast && (
          <span
            aria-hidden
            className={cn(
              "w-px flex-1 my-1 min-h-[14px] transition-colors",
              connectorDone ? "bg-panora-green/50" : "bg-panora-text-muted/25"
            )}
          />
        )}
      </div>

      {/* Label + sub */}
      <div
        className={cn(
          "flex flex-col gap-0.5 min-w-0",
          isLast ? "pb-0" : "pb-3"
        )}
      >
        <span
          className={cn(
            "text-[12px] font-medium leading-4 truncate",
            state === "todo" ? "text-panora-text-muted" : "text-panora-text"
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "text-[11px] leading-4 truncate",
            state === "done" && "text-panora-green-dark",
            state === "current" && "text-panora-text-secondary",
            state === "todo" && "text-panora-text-muted"
          )}
        >
          {sub}
        </span>
      </div>
    </li>
  );
}
