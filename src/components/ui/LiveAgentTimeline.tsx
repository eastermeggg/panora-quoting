"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { InsurerAction } from "@/data/mock";

interface LiveAgentTimelineProps {
  allSteps: InsurerAction[];
  initialVisible?: number;
  /** Interval in ms between each new step appearing */
  stepInterval?: number;
  /** Called when all steps are done */
  onComplete?: () => void;
  /** If true, show all steps as completed (no animation) */
  isCompleted?: boolean;
}

export function LiveAgentTimeline({
  allSteps,
  initialVisible = 3,
  stepInterval = 3000,
  onComplete,
  isCompleted = false,
}: LiveAgentTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(
    isCompleted ? allSteps.length : initialVisible
  );
  const [currentActive, setCurrentActive] = useState(
    isCompleted ? -1 : initialVisible - 1
  );
  const endRef = useRef<HTMLDivElement>(null);
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (isCompleted || hasCompleted.current) return;

    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        const next = prev + 1;
        if (next >= allSteps.length) {
          clearInterval(timer);
          setCurrentActive(-1);
          if (!hasCompleted.current) {
            hasCompleted.current = true;
            setTimeout(() => onComplete?.(), 500);
          }
          return allSteps.length;
        }
        setCurrentActive(next - 1);
        return next;
      });
    }, stepInterval);

    return () => clearInterval(timer);
  }, [allSteps.length, stepInterval, onComplete, isCompleted]);

  // Auto-scroll to bottom when new steps appear
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [visibleCount]);

  const visibleSteps = allSteps.slice(0, visibleCount);
  const isRunning = !isCompleted && visibleCount < allSteps.length;

  return (
    <div>
      {/* Timeline */}
      <div className="space-y-0 max-h-[300px] overflow-y-auto pr-1">
        {visibleSteps.map((step, i) => {
          const isLast = i === visibleSteps.length - 1;
          const isActive = i === currentActive && isRunning;
          const isDone = !isActive && step.status === "success";
          const isError = step.status === "error";
          const isPending = step.status === "pending";

          return (
            <div key={i} className="flex gap-3 relative">
              {/* Connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[7px] top-5 bottom-0 w-px",
                    isDone || isActive ? "bg-panora-green/30" : "bg-panora-border"
                  )}
                />
              )}

              {/* Dot / spinner */}
              <div className="relative shrink-0 mt-0.5">
                {isActive ? (
                  <div className="w-[15px] h-[15px] rounded-full border-2 border-panora-green flex items-center justify-center">
                    <div className="w-2 h-2 border border-panora-green border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : isError ? (
                  <div className="w-[15px] h-[15px] rounded-full bg-panora-error border-2 border-panora-error" />
                ) : isPending ? (
                  <div className="w-[15px] h-[15px] rounded-full bg-panora-border/40 border-2 border-panora-border/60" />
                ) : (
                  <div className="w-[15px] h-[15px] rounded-full bg-panora-green border-2 border-panora-green" />
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  "pb-4 min-w-0 transition-opacity duration-300",
                  isPending ? "opacity-40" : "opacity-100"
                )}
              >
                <div className="flex items-center gap-2 text-xs text-panora-text-muted">
                  <span>{step.date}</span>
                  {isActive && (
                    <span className="text-panora-green font-medium">
                      En cours...
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm font-medium mt-0.5",
                    isError
                      ? "text-panora-error"
                      : isActive
                      ? "text-panora-green"
                      : "text-panora-text"
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-panora-text-secondary mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Auto-scroll anchor */}
        <div ref={endRef} />
      </div>
    </div>
  );
}
