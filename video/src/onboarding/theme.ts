import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";

// Panora brand palette (from CLAUDE.md design tokens)
export const C = {
  bg: "#faf8f5",
  white: "#ffffff",
  text: "#22201a",
  muted: "#5c5953",
  border: "#eae7e0",
  inputBorder: "#e2dfd8",
  green: "#00a272",
  greenDark: "#037c58",
  greenLight: "#e3f3ec",
  deep: "#0b2621", // right-hand visual panel / dark surfaces
  nav: "#173c2d", // active nav fill
  warning: "#cb8052",
  purple: "#6d28a8",
  purpleLight: "#f1e6fb",
  drop: "#f3f1ec",
};

export const sans = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
}).fontFamily;
export const serif = loadFraunces("normal", {
  weights: ["500"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
}).fontFamily;

export const shadowCard = "0px 1px 2px rgba(0,0,0,0.05)";
export const shadowFloat = "0px 24px 60px rgba(11,38,33,0.18)";
