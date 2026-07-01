import { cn } from "@/lib/utils";
import { APPETIT_LABELS, type AppetitVerdict } from "@/data/souscription-engine";

const META: Record<AppetitVerdict, { className: string; dot: string }> = {
  dans_appetit: {
    className: "bg-panora-green-light text-panora-green-dark",
    dot: "bg-panora-green",
  },
  hors_appetit: {
    className: "bg-panora-error-bg text-panora-error",
    dot: "bg-panora-error",
  },
};

/** Appétit verdict as a soft pill — the disposition, shown from the listing on. */
export function AppetitBadge({
  verdict,
  className,
}: {
  verdict: AppetitVerdict;
  className?: string;
}) {
  const m = META[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[12px] font-medium leading-4 whitespace-nowrap",
        m.className,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", m.dot)} />
      {APPETIT_LABELS[verdict]}
    </span>
  );
}
