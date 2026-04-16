import { cn } from "@/lib/utils";

/**
 * CardGrid + Card system using CSS subgrid for cross-card row alignment.
 *
 * - CardGrid: responsive grid with auto-fill columns
 * - Card: uses subgrid so header/body/footer align across a row
 * - Sections self-align top — extra space falls to the footer
 */

interface CardGridProps {
  children: React.ReactNode;
  /** Minimum card width before wrapping. Default 320px */
  minCardWidth?: number;
  className?: string;
}

export function CardGrid({
  children,
  minCardWidth = 320,
  className,
}: CardGridProps) {
  return (
    <div
      className={cn("grid gap-4", className)}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
        gridAutoRows: "auto",
      }}
    >
      {children}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "grid grid-rows-subgrid row-span-3",
        "bg-white border border-panora-border rounded-xl",
        "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]",
        "transition-shadow duration-200 hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardSectionProps) {
  return (
    <div className={cn("px-4 pt-3.5 pb-1.5 self-start", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardSectionProps) {
  return (
    <div className={cn("px-4 pb-2.5 self-start", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardSectionProps) {
  return (
    <div
      className={cn(
        "border-t border-panora-border/50 px-4 py-2.5 self-end",
        className
      )}
    >
      {children}
    </div>
  );
}
