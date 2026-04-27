"use client";

import { cn } from "@/lib/utils";

interface ComparisonCellProps {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ComparisonCell({
  isSelected,
  onClick,
  children,
  className,
  style,
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
          ? "ring-2 ring-panora-green z-10 rounded-[4px]"
          : "hover:bg-panora-bg/50",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
