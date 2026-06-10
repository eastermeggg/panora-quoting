import { cn } from "@/lib/utils";

/**
 * Stylized monogram in place of real insurer marks. The brand register is
 * Quiet Bureau: a row of loud insurer logos (saturated reds, neon blues)
 * fights the warm-neutral surface and the restrained accent palette. Every
 * insurer instead gets a deterministic tinted monogram — same insurer, same
 * color across every screen — keeping the palette cohesive.
 */
const monogramPalette: Array<{ bg: string; ink: string }> = [
  { bg: "#E5EEE7", ink: "#3A5340" }, // sage
  { bg: "#EFE2D2", ink: "#6E4628" }, // copper
  { bg: "#EEE0DD", ink: "#693C36" }, // rose
  { bg: "#E1E7EE", ink: "#3D5479" }, // slate
  { bg: "#E7E1ED", ink: "#4D3F6E" }, // mauve
  { bg: "#E9E6D6", ink: "#5C5236" }, // olive
  { bg: "#EEE7D8", ink: "#6A532D" }, // sand
  { bg: "#DEE6E7", ink: "#3E5358" }, // mineral
];

function pickPalette(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return monogramPalette[Math.abs(hash) % monogramPalette.length];
}

interface InsurerLogoProps {
  insurerId: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InsurerLogo({
  insurerId,
  name,
  size = "md",
  className,
}: InsurerLogoProps) {
  const palette = pickPalette(insurerId || name);
  const initial = (name.trim().charAt(0) || "?").toUpperCase();

  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        "rounded-md flex items-center justify-center shrink-0 font-display font-bold leading-none",
        size === "sm" && "w-5 h-5 text-[11px]",
        size === "md" && "w-6 h-6 text-[13px]",
        size === "lg" && "w-8 h-8 text-[15px]",
        className
      )}
      style={{
        backgroundColor: palette.bg,
        color: palette.ink,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {initial}
    </div>
  );
}
