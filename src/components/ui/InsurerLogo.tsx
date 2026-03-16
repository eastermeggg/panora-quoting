import Image from "next/image";
import { cn } from "@/lib/utils";

// Map insurer IDs to their logo files
const logoMap: Record<string, string> = {
  axa: "/logos/axa.svg",
  allianz: "/logos/allianz.svg",
  generali: "/logos/generali.svg",
  chubb: "/logos/chubb.svg",
  groupama: "/logos/groupama.svg",
  mma: "/logos/mma.svg",
  maif: "/logos/maif.svg",
  hiscox: "/logos/hiscox.svg",
};

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
  const src = logoMap[insurerId];
  const dimensions = {
    sm: 20,
    md: 24,
    lg: 32,
  };
  const px = dimensions[size];

  if (!src) {
    // Fallback: first letter in a gray circle
    return (
      <div
        className={cn(
          "rounded-md bg-panora-drop flex items-center justify-center shrink-0 text-panora-text-muted font-semibold",
          size === "sm" && "w-5 h-5 text-[10px]",
          size === "md" && "w-6 h-6 text-xs",
          size === "lg" && "w-8 h-8 text-sm",
          className
        )}
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={px}
      height={px}
      className={cn("rounded-md shrink-0", className)}
    />
  );
}
