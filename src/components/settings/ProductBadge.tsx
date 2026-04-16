import { cn } from "@/lib/utils";
import type { InsuranceProduct } from "@/data/settings-mock";

type BadgeVariant = "modelized" | "new" | "requested" | "inactive";

interface ProductBadgeProps {
  product: InsuranceProduct;
  variant: BadgeVariant;
}

export function ProductBadge({ product, variant }: ProductBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 h-5 rounded-full text-[11px] font-medium leading-4 whitespace-nowrap",
        variant === "modelized" && "bg-panora-green-light text-panora-green-dark",
        variant === "new" && "bg-purple-100 text-purple-700",
        variant === "requested" &&
          "border border-dashed border-panora-text-muted/40 text-panora-text-muted bg-transparent",
        variant === "inactive" &&
          "bg-panora-secondary/60 text-panora-text-muted/50"
      )}
    >
      {product}
    </span>
  );
}
