/** Small numbered badge for the ordered sub-sections of an onboarding step. */
export function StepNumber({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-panora-green-light text-[11px] font-semibold text-panora-green-dark tabular-nums shrink-0">
      {n}
    </span>
  );
}
