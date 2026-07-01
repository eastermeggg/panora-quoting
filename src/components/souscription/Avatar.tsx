import { cn } from "@/lib/utils";

/** Small initials avatar for the souscripteur responsable. */
export function Avatar({
  initials,
  title,
  className,
}: {
  initials: string;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center justify-center w-6 h-6 rounded-full bg-panora-secondary text-panora-text-secondary text-[10px] font-semibold leading-none shrink-0",
        className
      )}
    >
      {initials}
    </span>
  );
}
