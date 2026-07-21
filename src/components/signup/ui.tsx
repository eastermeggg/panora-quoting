"use client";

import { cn } from "@/lib/utils";

/* Shared primitives for the global onboarding flow (sign-up → invite).
 * Visual specs come from the Figma onboarding screens: inputs are white with
 * border #e2dfd8, radius 8, subtle shadow; labels 13px Inter medium. */

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5 w-full", className)}>
      <span className="text-[13px] font-medium leading-5 text-panora-text">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-white border border-[#e2dfd8] rounded-lg px-3 py-2.5 text-[13px] leading-5 text-panora-text",
        "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none transition-all",
        "placeholder:text-panora-text-muted/70",
        "focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green",
        className
      )}
    />
  );
}

export function SelectInput({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full">
      <select
        {...props}
        className={cn(
          "w-full appearance-none bg-white border border-[#e2dfd8] rounded-lg px-3 py-2.5 pr-8 text-[13px] leading-5 text-panora-text",
          "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none transition-all",
          "focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green",
          className
        )}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-panora-text-secondary"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function SecondaryButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-panora-btn-secondary px-3 py-2 text-[13px] font-medium leading-5 text-[#63635e]",
        "hover:bg-panora-btn-secondary-hover transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-panora-border px-3 py-2 text-[13px] font-medium leading-5 text-panora-text-secondary",
        "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-panora-drop transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "btn-primary inline-flex items-center justify-center gap-2 px-3 py-2 text-[13px] font-medium leading-5",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={cn("w-4 h-4", className)}>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.32z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

export function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("w-4 h-4", className)}>
      <rect x="0" y="0" width="7.5" height="7.5" fill="#F25022" />
      <rect x="8.5" y="0" width="7.5" height="7.5" fill="#7FBA00" />
      <rect x="0" y="8.5" width="7.5" height="7.5" fill="#00A4EF" />
      <rect x="8.5" y="8.5" width="7.5" height="7.5" fill="#FFB900" />
    </svg>
  );
}

/* Outlined Panora flower, drawn as 12 stadium-shaped petals radiating from
 * the center. Used as the large watermark on the dark auth panel. */
export function FlowerOutline({
  className,
  stroke = "#2c5343",
}: {
  className?: string;
  stroke?: string;
}) {
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 300 300" fill="none" className={className}>
      {petals.map((deg) => (
        <rect
          key={deg}
          x="141"
          y="24"
          width="18"
          height="104"
          rx="9"
          stroke={stroke}
          strokeWidth="2"
          transform={`rotate(${deg} 150 150)`}
        />
      ))}
    </svg>
  );
}

/* Small solid flower used in pills / logos (12 rays). */
export function FlowerMark({
  className,
  color = "#22201a",
}: {
  className?: string;
  color?: string;
}) {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      {rays.map((deg) => (
        <line
          key={deg}
          x1="10"
          y1="3"
          x2="10"
          y2="7.2"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          transform={`rotate(${deg} 10 10)`}
        />
      ))}
    </svg>
  );
}
