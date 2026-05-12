"use client";

export interface BrandingSettings {
  primaryColor: string;
  logoDataUrl: string | null;
  titleFont: string;
}

export interface TitleFontOption {
  /** Family name used in CSS and PDF font registration */
  name: string;
  /** Display label shown in the picker */
  label: string;
  /** URL of the regular weight TTF (used for PDF rendering) */
  regularTtfUrl: string;
  /** URL of the semibold weight TTF (used for PDF heading rendering); falls back to regular for display-only fonts */
  mediumTtfUrl: string;
  /** Google Fonts CSS href used for browser preview */
  cssHref: string;
  category: "serif" | "sans-serif" | "display";
}

const FONTSOURCE_BASE = "https://cdn.jsdelivr.net/fontsource/fonts";

function fontsourceTtf(slug: string, weight: 400 | 500 | 600 | 700): string {
  return `${FONTSOURCE_BASE}/${slug}@latest/latin-${weight}-normal.ttf`;
}

export const TITLE_FONT_OPTIONS: TitleFontOption[] = [
  {
    name: "Inter",
    label: "Inter",
    regularTtfUrl: fontsourceTtf("inter", 400),
    mediumTtfUrl: fontsourceTtf("inter", 600),
    cssHref: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    category: "sans-serif",
  },
  {
    name: "Playfair Display",
    label: "Playfair Display",
    regularTtfUrl: fontsourceTtf("playfair-display", 400),
    mediumTtfUrl: fontsourceTtf("playfair-display", 600),
    cssHref: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
    category: "serif",
  },
  {
    name: "Fraunces",
    label: "Fraunces",
    regularTtfUrl: fontsourceTtf("fraunces", 400),
    mediumTtfUrl: fontsourceTtf("fraunces", 600),
    cssHref: "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&display=swap",
    category: "serif",
  },
  {
    name: "DM Serif Display",
    label: "DM Serif Display",
    regularTtfUrl: fontsourceTtf("dm-serif-display", 400),
    mediumTtfUrl: fontsourceTtf("dm-serif-display", 400),
    cssHref: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap",
    category: "serif",
  },
  {
    name: "Cormorant Garamond",
    label: "Cormorant Garamond",
    regularTtfUrl: fontsourceTtf("cormorant-garamond", 400),
    mediumTtfUrl: fontsourceTtf("cormorant-garamond", 600),
    cssHref: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap",
    category: "serif",
  },
  {
    name: "Libre Caslon Display",
    label: "Libre Caslon Display",
    regularTtfUrl: fontsourceTtf("libre-caslon-display", 400),
    mediumTtfUrl: fontsourceTtf("libre-caslon-display", 400),
    cssHref: "https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&display=swap",
    category: "serif",
  },
  {
    name: "Space Grotesk",
    label: "Space Grotesk",
    regularTtfUrl: fontsourceTtf("space-grotesk", 400),
    mediumTtfUrl: fontsourceTtf("space-grotesk", 600),
    cssHref: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
    category: "sans-serif",
  },
  {
    name: "Bricolage Grotesque",
    label: "Bricolage Grotesque",
    regularTtfUrl: fontsourceTtf("bricolage-grotesque", 400),
    mediumTtfUrl: fontsourceTtf("bricolage-grotesque", 600),
    cssHref: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700&display=swap",
    category: "sans-serif",
  },
];

export const DEFAULT_BRANDING: BrandingSettings = {
  primaryColor: "#1F4D3F",
  logoDataUrl: null,
  titleFont: "Inter",
};

const STORAGE_KEY = "panora.branding.v1";

export function loadBranding(): BrandingSettings {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BRANDING;
    const parsed = JSON.parse(raw) as Partial<BrandingSettings>;
    return { ...DEFAULT_BRANDING, ...parsed };
  } catch {
    return DEFAULT_BRANDING;
  }
}

export function saveBranding(value: BrandingSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function getTitleFontOption(name: string): TitleFontOption {
  return TITLE_FONT_OPTIONS.find((f) => f.name === name) ?? TITLE_FONT_OPTIONS[0];
}

/** Foreground palette to apply on top of a brand-coloured surface. */
export interface OnColorPalette {
  /** Strong text — main titles and primary values. */
  foreground: string;
  /** Medium-weight text — body / chip labels. */
  foregroundStrong: string;
  /** Secondary text — captions, descriptions. */
  foregroundSecondary: string;
  /** Weakest text — small eyebrows / labels. */
  foregroundMuted: string;
  /** Translucent chip / avatar background. */
  chipBg: string;
  /** Chip / avatar border. */
  chipBorder: string;
  /** Subtle inset highlight on glassy chips. */
  chipShadowInset: string;
  /** Whether the underlying surface is dark (i.e., we use light text). */
  isDark: boolean;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Compute the WCAG-style relative luminance of a hex color (0 = black, 1 = white).
 */
function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rl, gl, bl] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/**
 * Returns the foreground palette to use on top of the given brand color.
 * Picks light or dark text+tints based on luminance so all elements stay
 * legible regardless of which color the broker chose.
 */
export function getOnColorPalette(bgHex: string): OnColorPalette {
  // Threshold tuned slightly below WCAG mid-gray (0.179) so brand greens stay
  // "dark-treated" while pastels switch to dark text.
  const isDark = relativeLuminance(bgHex) < 0.45;
  if (isDark) {
    return {
      foreground: "rgba(255,255,255,1)",
      foregroundStrong: "rgba(255,255,255,0.95)",
      foregroundSecondary: "rgba(255,255,255,0.7)",
      foregroundMuted: "rgba(255,255,255,0.5)",
      chipBg: "rgba(255,255,255,0.1)",
      chipBorder: "rgba(255,255,255,0.18)",
      chipShadowInset: "rgba(255,255,255,0.06)",
      isDark: true,
    };
  }
  return {
    foreground: "rgba(14,17,22,1)",
    foregroundStrong: "rgba(14,17,22,0.92)",
    foregroundSecondary: "rgba(14,17,22,0.65)",
    foregroundMuted: "rgba(14,17,22,0.5)",
    chipBg: "rgba(14,17,22,0.06)",
    chipBorder: "rgba(14,17,22,0.14)",
    chipShadowInset: "rgba(14,17,22,0.04)",
    isDark: false,
  };
}

/**
 * Inject the Google Fonts CSS link for the given title font, idempotently.
 * Safe to call from multiple components — only one link tag is appended per
 * font. No-op on the server.
 */
export function ensureTitleFontLoaded(fontName: string): void {
  if (typeof document === "undefined") return;
  const font = getTitleFontOption(fontName);
  const id = `panora-font-${font.name.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = font.cssHref;
  document.head.appendChild(link);
}
