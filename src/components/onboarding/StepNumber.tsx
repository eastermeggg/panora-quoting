/** Small numbered badge for the ordered sub-sections of an onboarding step. */
export function StepNumber({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-panora-secondary text-[12px] font-medium text-panora-text-secondary tabular-nums shrink-0">
      {n}
    </span>
  );
}
