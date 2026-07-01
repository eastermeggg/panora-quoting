"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRuleWithSource } from "@/data/souscription-engine";
import type { Dossier, Draft } from "@/data/souscription-mock";
import { DossierIdentityLine } from "./DossierIdentityLine";

function formatEuros(n: number): string {
  return n.toLocaleString("fr-FR") + " €";
}

interface Step {
  title: string;
  detail: string;
  mono?: boolean;
}

/**
 * Steps for the sourcing animation, data-driven from the draft: profil load,
 * one step per distinct source doc the draft drew from (with what it posed),
 * then assembly.
 */
function buildSteps(dossier: Dossier, draft: Draft): Step[] {
  const bySource = new Map<string, string[]>();
  for (const line of draft.lignes) {
    if (!line.ruleId) continue;
    const rw = getRuleWithSource(line.ruleId);
    if (!rw?.source) continue;
    const arr = bySource.get(rw.source.filename) ?? [];
    arr.push(line.label.toLowerCase());
    bySource.set(rw.source.filename, arr);
  }
  const sourceSteps: Step[] = [...bySource.entries()].map(([filename, labels]) => ({
    title: filename,
    detail: labels.slice(0, 2).join(", ") + (labels.length > 2 ? "…" : ""),
    mono: true,
  }));
  return [
    {
      title: "Profil assuré chargé",
      detail: `${dossier.insured.raison} · NAF ${dossier.insured.naf}`,
    },
    ...sourceSteps,
    {
      title: "Assemblage du projet",
      detail: `prime ${formatEuros(draft.primeFinale)} HT`,
    },
  ];
}

/** Smoothly climb a number to its target (easeOutExpo). Instant if disabled. */
function useCountUp(target: number, durationMs: number, enabled: boolean): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / durationMs);
      const eased = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, enabled]);
  return enabled ? val : target;
}

/**
 * The "tarification en cours" live surface. The hero is the prime assembling
 * itself from the vault: a figure that climbs to its sourced value while a
 * provenance timeline fills green, one document at a time. The point is visible
 * provenance and earned confidence, not a spinner.
 */
export function TarificationProcess({
  dossier,
  draft,
  onComplete,
}: {
  dossier: Dossier;
  draft: Draft;
  onComplete: () => void;
}) {
  const steps = useMemo(() => buildSteps(dossier, draft), [dossier, draft]);
  const [done, setDone] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [reduce] = useState(
    () =>
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  const stepMs = reduce ? 140 : 700;

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setDone(i);
      if (i >= steps.length) {
        window.clearInterval(id);
        window.setTimeout(() => onCompleteRef.current(), reduce ? 150 : 650);
      }
    }, stepMs);
    return () => window.clearInterval(id);
  }, [steps, stepMs, reduce]);

  const total = steps.length;
  const complete = done >= total;
  const hasPrime = draft.primeFinale > 0;

  const prime = useCountUp(
    draft.primeFinale,
    total * stepMs,
    hasPrime && !reduce
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white">
      <div className="shrink-0 border-b border-panora-border px-6 py-3">
        <DossierIdentityLine dossier={dossier} />
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-[480px] flex flex-col items-center text-center">

          <h1 className="text-[24px] font-serif text-panora-text leading-7 tracking-[-0.02em]">
            Tarification en cours
          </h1>
          <p className="mt-1.5 text-[13px] text-panora-text-secondary leading-5">
            {"L'agent croise le profil avec les règles du vault."}
          </p>

          {/* Hero: the prime assembling from its sources */}
          {hasPrime ? (
            <div className="mt-10 flex flex-col items-center">
              <span
                className={cn(
                  "text-[56px] font-semibold leading-none tabular-nums tracking-[-0.02em] transition-colors duration-300",
                  complete ? "text-panora-text" : "text-panora-text/90"
                )}
              >
                {prime.toLocaleString("fr-FR")}{" "}
                <span className="text-[40px] font-medium text-panora-text-muted">
                  €
                </span>
              </span>
              <span className="mt-2.5 text-[12px] text-panora-text-muted leading-4 tabular-nums">
                {complete ? (
                  <span className="inline-flex items-center gap-1.5 text-panora-green-dark">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    prime annuelle HT, sourcée
                  </span>
                ) : (
                  "assemblage à partir des règles du vault"
                )}
              </span>
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center">
              <span className="text-[28px] font-semibold leading-tight tracking-[-0.01em] text-panora-warning-text">
                Analyse de l&apos;autorité
              </span>
              <span className="mt-2 text-[12px] text-panora-text-muted leading-4">
                la disposition prime sur le chiffrage
              </span>
            </div>
          )}

          {/* The trace: a provenance timeline that fills green as it resolves */}
          <ol className="mt-11 w-full flex flex-col text-left">
            {steps.map((s, i) => {
              const state =
                i < done ? "done" : i === done ? "running" : "pending";
              const last = i === steps.length - 1;
              return (
                <li key={i} className="relative flex gap-3.5 pb-5 last:pb-0">
                  {!last && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-[7.5px] top-[18px] bottom-0 w-px transition-colors duration-500",
                        i < done ? "bg-panora-green" : "bg-panora-border"
                      )}
                    />
                  )}
                  <span className="relative z-10 mt-0.5 shrink-0 w-4 h-4 flex items-center justify-center">
                    {state === "done" ? (
                      <span className="w-4 h-4 rounded-full bg-panora-green flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                      </span>
                    ) : state === "running" ? (
                      <>
                        <span className="absolute inset-0 rounded-full bg-panora-green/30 animate-ping motion-reduce:hidden" />
                        <span className="relative w-4 h-4 rounded-full border-2 border-panora-green bg-white" />
                      </>
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-panora-border" />
                    )}
                  </span>

                  <div className="flex-1 min-w-0 flex flex-col gap-0.5 pt-px">
                    <span
                      className={cn(
                        "leading-5 transition-colors duration-300",
                        s.mono ? "font-mono text-[12px]" : "text-[13px]",
                        state === "pending"
                          ? "text-panora-text-muted"
                          : state === "running"
                            ? "text-panora-text font-medium"
                            : "text-panora-text"
                      )}
                    >
                      {s.title}
                    </span>
                    {state !== "pending" && (
                      <span className="text-[12px] text-panora-text-secondary leading-4">
                        {s.detail}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
