import { cn } from "@/lib/utils";

interface OnboardingHeroProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "start" | "center";
}

export function OnboardingHero({
  title,
  subtitle,
  align = "start",
}: OnboardingHeroProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 max-w-[760px]",
        align === "center" && "items-center text-center mx-auto"
      )}
    >
      <h1 className="text-[28px] lg:text-[38px] font-serif text-panora-text leading-[1.08] tracking-[-0.025em] text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[14px] text-panora-text-secondary leading-6 max-w-[600px]">
          {subtitle}
        </p>
      )}
    </header>
  );
}

/**
 * Convenience: wraps the "accent phrase" inside the title in italic + green-dark,
 * matching the brand voice across all onboarding steps.
 */
export function HeroAccent({ children }: { children: React.ReactNode }) {
  return (
    <span className="italic text-panora-green-dark">{children}</span>
  );
}
