import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parse a French-formatted price string like "3 540,00 €/an" → 3540 */
export function parsePriceEuros(s: string): number {
  // Remove everything except digits and comma, then treat comma as decimal
  const cleaned = s.replace(/[^\d,]/g, "").replace(",", ".");
  return Math.round(parseFloat(cleaned) || 0);
}

/** Format a number as French price: 3540 → "3 540 €" */
export function formatPriceEuros(n: number): string {
  return n.toLocaleString("fr-FR") + " €";
}
