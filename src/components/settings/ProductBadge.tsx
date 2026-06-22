import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeVariant = "modelized" | "requested" | "inactive";

interface ProductBadgeProps {
  product: string;
  variant: BadgeVariant;
  /** When provided, renders a small remove affordance inside the badge. */
  onRemove?: () => void;
  removeLabel?: string;
}

export function ProductBadge({
  product,
  variant,
  onRemove,
  removeLabel,
}: ProductBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 pl-2 h-5 rounded-full text-[11px] font-medium leading-4 whitespace-nowrap",
        onRemove ? "pr-1" : "pr-2",
        variant === "modelized" && "bg-panora-green-light text-panora-green-dark",
        variant === "requested" &&
          "border border-dashed border-panora-text-muted/40 text-panora-text-muted bg-transparent",
        variant === "inactive" &&
          "bg-panora-secondary/60 text-panora-text-muted/50"
      )}
    >
      {product}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}
