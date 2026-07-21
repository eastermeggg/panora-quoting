"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/* Six-digit code entry split in two groups of three, matching the Figma
 * OTP screen. Handles auto-advance, backspace and paste. */
export function OtpBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const chars = value.padEnd(6, " ").split("");
    chars[index] = digit || " ";
    onChange(chars.join("").trimEnd());
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setDigit(index, "");
      return;
    }
    if (digits.length > 1) {
      // Paste: fill from this position onwards
      const chars = value.padEnd(6, " ").split("");
      digits
        .slice(0, 6 - index)
        .split("")
        .forEach((d, i) => {
          chars[index + i] = d;
        });
      onChange(chars.join("").trimEnd());
      refs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }
    setDigit(index, digits);
    if (index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !(value[index] || "").trim() && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const box = (index: number, position: "first" | "middle" | "last") => (
    <input
      key={index}
      ref={(el) => {
        refs.current[index] = el;
      }}
      type="text"
      inputMode="numeric"
      autoComplete={index === 0 ? "one-time-code" : "off"}
      value={(value[index] || "").trim()}
      onChange={(e) => handleChange(index, e.target.value)}
      onKeyDown={(e) => handleKeyDown(index, e)}
      onFocus={(e) => e.target.select()}
      aria-label={`Chiffre ${index + 1}`}
      className={cn(
        "h-10 w-10 border border-[#e2dfd8] bg-white text-center text-[16px] font-medium text-panora-text",
        "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline-none transition-all",
        "focus:relative focus:z-10 focus:ring-2 focus:ring-panora-green/20 focus:border-panora-green",
        position === "first" && "rounded-l-lg",
        position === "last" && "rounded-r-lg",
        position !== "first" && "-ml-px"
      )}
    />
  );

  return (
    <div className="flex items-center gap-4">
      <div className="flex">
        {box(0, "first")}
        {box(1, "middle")}
        {box(2, "last")}
      </div>
      <span className="h-1 w-1 rounded-full bg-panora-text" />
      <div className="flex">
        {box(3, "first")}
        {box(4, "middle")}
        {box(5, "last")}
      </div>
    </div>
  );
}
