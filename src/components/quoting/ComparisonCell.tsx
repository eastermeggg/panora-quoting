"use client";

import { cn } from "@/lib/utils";

interface ComparisonCellProps {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ComparisonCell({
  isSelected,
  onClick,
  children,
  className,
}: ComparisonCellProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "cursor-pointer transition-colors",
        isSelected
          ? "ring-2 ring-panora-green/30 bg-panora-green/5"
          : "hover:bg-panora-bg/50",
        className
      )}
    >
      {children}
    </div>
  );
}
