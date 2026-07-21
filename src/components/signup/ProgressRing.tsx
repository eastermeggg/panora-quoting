"use client";

import { cn } from "@/lib/utils";

/* Circular progress ring used by the sidebar "Prise en main" widget and the
 * hub header. Track + green arc, optional centered label. */
export function ProgressRing({
  percent,
  size = 20,
  strokeWidth = 2.5,
  className,
  showCheck = false,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showCheck?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;
  const complete = clamped >= 100;

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-panora-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-panora-green)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      {showCheck && complete && (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="absolute inset-0 m-auto"
          style={{ width: size * 0.55, height: size * 0.55 }}
        >
          <path
            d="M3.5 8.5l3 3 6-6.5"
            stroke="var(--color-panora-green)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
