---
name: Panora Quoting
description: A cotation atelier for French insurance brokers. Quiet authority, warm neutrals, deep evergreen.
colors:
  signal-vert: "#00a272"
  signal-vert-deep: "#00784f"
  signal-vert-soft: "#ebf3ef"
  signal-vert-edge: "#c9e8d9"
  bureau-vert: "#1A3C34"
  bureau-vert-hover: "#243D36"
  bureau-vert-glow: "#2D5A4E"
  mistral: "#faf8f5"
  document-white: "#FFFFFF"
  drop-neutral: "#F8F6F2"
  linen-edge: "#eae7e0"
  oat-tag: "#F0ECE5"
  oat-tag-hover: "#E8E3DA"
  encre: "#22201a"
  encre-deep: "#162416"
  pierre: "#5c5953"
  cendre: "#85827b"
  bordeaux: "#952617"
  bordeaux-bg: "#FFECEC"
  cuivre: "#cb8052"
  cuivre-ink: "#80452b"
  cuivre-bg: "#FFF3E8"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: "28px"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Inter Display', Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "20px"
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "normal"
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.06em"
rounded:
  xs: "3px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
  "3xl": "32px"
components:
  button-primary:
    backgroundColor: "{colors.bureau-vert}"
    textColor: "{colors.document-white}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.bureau-vert-hover}"
    textColor: "{colors.document-white}"
    rounded: "{rounded.lg}"
  button-secondary:
    backgroundColor: "{colors.oat-tag}"
    textColor: "{colors.encre}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.oat-tag-hover}"
    textColor: "{colors.encre}"
    rounded: "{rounded.lg}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.pierre}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.document-white}"
    textColor: "{colors.encre}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "38px"
  card:
    backgroundColor: "{colors.document-white}"
    textColor: "{colors.encre}"
    rounded: "{rounded.xl}"
    padding: "16px"
  status-pill-success:
    backgroundColor: "{colors.signal-vert-soft}"
    textColor: "{colors.signal-vert-deep}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "20px"
  status-pill-warning:
    backgroundColor: "{colors.cuivre-bg}"
    textColor: "{colors.cuivre-ink}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "20px"
  status-pill-error:
    backgroundColor: "{colors.bordeaux-bg}"
    textColor: "{colors.bordeaux}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "20px"
---

# Design System: Panora Quoting

## 1. Overview

**Creative North Star: "The Quiet Bureau"**

A French insurance broker's office in good order. Wood, warm paper, dark green binding, one signal lamp on the desk. The system carries authority through restraint: a single warm-neutral surface, two greens that never compete, a serif voice for page titles, and tight 13px sans-serif rows of broker-grade data. Density is the affordance; brokers scan hundreds of fields a day, and the design earns its keep by being legible at a glance without ornament.

The system explicitly rejects the SaaS dashboard reflex: no neon dark mode, no playful animations, no gradient text, no glassmorphism, no identical card grids, no "01 / 02 / 03" scaffolding above every section. Warmth is carried by the off-white Mistral surface and the serif page titles, not by tinted near-white "cream" backgrounds with token names like `--paper` or `--linen`. The product looks like a tool a senior partner would keep open all day, not a deck.

**Key Characteristics:**
- Warm-neutral surface (`#faf8f5`) carries 80%+ of every screen.
- Two greens that never share a surface: bright **Signal Vert** for status and links, deep **Bureau Vert** for the single primary CTA.
- Serif page titles in Georgia (24px), sans section heads in Inter Display (15px / 600), body in Inter (13px / 20px line-height).
- Borders are 1px, warm gray `#eae7e0`. Shadows are whisper-soft (`0 1px 2px rgba(0,0,0,0.05)`).
- French copy. Sober, specific. No marketing buzzwords, no aphoristic cadence.

## 2. Colors

A warm-neutral surface with two deliberate greens, three earth-toned text shades, and two status accents (Bordeaux + Cuivre). The palette is **Restrained** by strategy: one accent role at a time per surface, and the primary CTA is the only place Bureau Vert appears.

### Primary
- **Signal Vert** (`#00a272`): the accent color. Active nav, links, success states, the dot on the logo. Used sparingly so its presence is noticed.
- **Signal Vert Deep** (`#00784f`): the readable text variant of Signal Vert on the soft tint. Status-pill copy, hover state on accent text.
- **Signal Vert Soft** (`#ebf3ef`): the success status-pill background. Also the "Active session" pill background.
- **Signal Vert Edge** (`#c9e8d9`): focus border on inputs in the success state. 1px only.
- **Bureau Vert** (`#1A3C34`): the primary CTA color. Deep evergreen with an inner-glow gradient (`linear-gradient(90deg, #173c2d, #173c2d)` over a `0,0,0,0.15` overlay, inset bottom highlight). Appears on `.btn-primary` and nowhere else.
- **Bureau Vert Hover** (`#243D36`): one notch lighter for the hover state of the primary CTA.
- **Bureau Vert Glow** (`#2D5A4E`): the gradient endpoint for the CTA's bottom inner glow.

### Secondary
- **Bordeaux** (`#952617`): error text. Strictly destructive feedback. Never decorative.
- **Bordeaux Background** (`#FFECEC`): the surface behind error banners and `Session expirée` pills.
- **Cuivre** (`#cb8052`): warning accent. The 2FA "Code requis" state, in-flight session warnings.
- **Cuivre Ink** (`#80452b`): readable warning text on tinted backgrounds.
- **Cuivre Background** (`#FFF3E8`): the warning panel surface.

### Neutral
- **Mistral** (`#faf8f5`): the body surface. The room.
- **Document White** (`#FFFFFF`): cards, inputs, modals. The page on the desk.
- **Drop Neutral** (`#F8F6F2`): the hover state on list rows and ghost buttons.
- **Oat Tag** (`#F0ECE5`): tag and secondary-button backgrounds.
- **Oat Tag Hover** (`#E8E3DA`): secondary-button hover.
- **Linen Edge** (`#eae7e0`): every border, every divider. 1px, always.
- **Encre** (`#22201a`): body text. Near-black with a touch of warmth. The default `<body>` color.
- **Encre Deep** (`#162416`): heading text where extra weight is needed.
- **Pierre** (`#5c5953`): secondary text. Captions, helper copy, secondary button labels.
- **Cendre** (`#85827b`): muted text. Placeholder, metadata, the most subdued tier.

### Named Rules

**The Two Greens Rule.** Signal Vert and Bureau Vert never share a surface. Signal Vert is for state (success, active, link); Bureau Vert is the primary CTA color and nothing else. If you find yourself painting both green on the same screen for the same role, one of them is wrong.

**The One Accent Rule.** Per screen, only one of {Signal Vert, Cuivre, Bordeaux} is the dominant accent. Status pills can coexist as data, but decorative use of two accents on the same canvas is forbidden.

**The Warm-Neutral Doctrine.** Mistral is the room. Document White is the page on the desk. Together they carry 80%+ of every screen. Any deviation requires a reason that can be named.

## 3. Typography

**Display Font:** Georgia (with Times New Roman fallback). Used for page titles and the welcome heading. The serif is the page's signature; it appears once or twice per surface, never as body or as a decorative repeated heading.

**Body Font:** Inter (with system-ui, -apple-system fallback). Carries body and label text at 13px.

**Section Head Font:** Inter Display weight 600 (with Inter, system-ui fallback). The semibold-tighter cut of Inter used at 15px for section heads. Distinct enough from body Inter that hierarchy is unambiguous.

**Character:** The pairing is two voices: a serif voice for the page's title (Georgia), a sans voice for the working surface (Inter and its tighter Display cut). The serif appears rarely and reads as gravitas; the sans is what brokers scan all day and reads as competence.

### Hierarchy
- **Display** (Georgia 500, 24px, line-height 28px, letter-spacing -0.02em): Page titles. "Assistant cotation", "Bienvenue sur l'assistant cotation", "Accès extranets assureurs". One per surface.
- **Headline** (Inter Display 600, 15px, line-height 20px): Section heads inside a page. "Extranets configurés", "Catalogue extranets".
- **Title** (Inter 500, 14–15px, line-height 20px): Card titles, list-item primary labels.
- **Body** (Inter 400, 13px, line-height 20px): The default. Form rows, tooltips, table cells, paragraph copy. Cap line length at ~65–75ch in long-form contexts (modals, presentations).
- **Caption** (Inter 400, 12px, line-height 18px): Helper text under inputs, secondary metadata, microcopy in tags.
- **Label** (Inter 500, 11px, line-height 16px, letter-spacing 0.06em, **uppercase**): Reserved for short eyebrow labels in modals ("PARAMÈTRES", "PRODUITS"). Use sparingly; the "tiny uppercase tracked eyebrow above every section" pattern is forbidden as default scaffolding.

### Named Rules

**The Serif-Once Rule.** Georgia appears for the page title. It does not appear in modals, cards, buttons, or repeated headings. Its scarcity is the point.

**The 13px Body Rule.** Body is 13px / 1.4. Smaller sizes (11–12px) are for labels and metadata, and need a reason. Larger sizes (15px+) are heads or eyebrow titles, not body.

**The All-Caps Cap.** Uppercase is permitted only at the **label** tier (11px tracked). No body sentences in caps, no card titles in caps, no buttons in caps.

## 4. Elevation

The system is **nearly flat by intention**. Depth is conveyed by 1px Linen Edge borders, the warm-neutral surface backing white cards, and whisper-soft shadows that round the page's corners rather than lift them. Modal backdrops use a soft 25% black overlay with a 1px backdrop blur; everything else stays grounded.

### Shadow Vocabulary
- **Whisper** (`box-shadow: 0px 1px 2px 0px rgba(0,0,0,0.05)`): the default. Buttons, inputs, cards at rest. Functionally a hairline below the element to separate it from Mistral.
- **Lift** (`box-shadow: 0px 5px 9px 0px rgba(0,0,0,0.06)`): hover state on cards. Subtle enough that the motion (200ms ease-out) carries more weight than the shadow itself.
- **Float** (`box-shadow: 0px 8px 24px 0px rgba(0,0,0,0.12)`): dropdowns and floating menus.
- **Overlay** (`box-shadow: 0px 8px 32px 0px rgba(0,0,0,0.12)`): modals over the backdrop.
- **Inner Glow** (`box-shadow: inset 0px -5px 15px 0px rgba(255,255,255,0.3)`): the bottom inner highlight on `.btn-primary` only.

### Named Rules

**The Whisper Rule.** Default shadows are 1px / 2px blur / 5% black. If a shadow needs to "pop", the design is louder than the brand. Increase contrast through type weight or border presence instead.

**The Border-First Rule.** Hierarchy is borders before shadows. A 1px Linen Edge is the first tool; a Whisper shadow is the second. Heavier shadows only earn their place on floating surfaces (dropdowns, modals).

## 5. Components

The codebase has no component library dependency: every primitive is custom. The visual rhetoric across them is consistent: white surface, 1px Linen Edge, Whisper shadow, 8px corner radius by default.

### Buttons
- **Shape:** 8px radius (`rounded-lg`); buttons inside compact rows drop to 6px.
- **Primary (`.btn-primary`):** Bureau Vert background with a layered gradient (Bureau Vert base + 15% black overlay + inset bottom white highlight at 30%). White text. 1px border at `rgba(34,32,26,0.15)`. Whisper-plus shadow (`0 2px 2px rgba(0,0,0,0.1)`). Used for the single primary action per surface (Configurer mes accès, Activer la session, Tester et enregistrer, Lancer la cotation).
- **Primary hover:** background lightens to Bureau Vert Hover (`#1e4d3a` mix); shadow unchanged.
- **Secondary:** Oat Tag background (`#F0ECE5`), Encre text, 1px Linen Edge. Used for cancel actions, secondary CTAs in modals.
- **Ghost:** transparent background, Pierre text, hover background Drop Neutral. Used for inline actions in cards and rows.
- **Sizes:** primary lives at `h-9` (36px) for modal footers, `h-7` / `py-1.5` for compact rows.

### Inputs
- **Style:** Document White background, 1px border `#e2dfd8` (a notch warmer than Linen Edge for input chrome specifically), 8px radius, Whisper shadow inside. Height 38px for standard inputs.
- **Focus:** border darkens to Signal Vert at 40% alpha; a 2px Signal Vert ring at 20% alpha appears outside the border. No glow.
- **Error:** border becomes Bordeaux at 50% alpha; 2px Bordeaux ring at 20%; shake animation (60ms × 5 swings) on submit failure.
- **Placeholder:** Cendre (`#85827b`). Verify 4.5:1 contrast against Document White at the size used.
- **Password/secret inputs:** include a visibility toggle button right-aligned, Pierre icon at 16px.

### Cards
- **Corner Style:** 12px radius (`rounded-xl`) for primary cards, 8px for compact secondary cards.
- **Background:** Document White.
- **Border:** 1px Linen Edge.
- **Shadow:** Whisper at rest; Lift on hover (only when the card is actionable).
- **Internal Padding:** 16–20px depending on density.
- **Hover state:** background warms to Mistral, shadow steps to Lift, 200ms ease-out.

### Status Pills
- **Shape:** full pill (`rounded-full`), 20px height, 8px horizontal padding.
- **Typography:** 12px, font-medium, line-height 16px. **No uppercase, no tracking.**
- **Variants:**
  - Success: Signal Vert Soft bg, Signal Vert Deep text (`Session active jusqu'à 18h`).
  - Warning: Cuivre Background bg, Cuivre Ink text (`Code requis`).
  - Error: Bordeaux Background bg, Bordeaux text (`Session expirée`).
  - Neutral: Linen Edge bg, Pierre text (`En cours`).

### Navigation (Sidebar)
- **Style:** Mistral background, 256px wide expanded / 64px collapsed, 1px right edge implicit by surface contrast (no border).
- **Item style:** 8px radius, 13px Inter, Pierre text. Active item: Document White background, Encre text, Whisper shadow, Signal Vert dot.
- **Icons:** Lucide React at 16px (compact) or 18px (sidebar).
- **State transitions:** 150ms ease-out for hover/active.

### Live-Agent Surfaces (signature pattern)
The product's distinctive surface. Whenever the AI agent is working, a live panel slides in from the right (480px wide) with a per-step timeline: Loader2 spinning icon, step title in Inter 13px medium, step description in Pierre 12px, success/in_progress/pending state colors from the status pill vocabulary. The visual contract: every AI action is named and timestamped. This is the "Trust through transparency" principle made concrete.

### Modals
- **Backdrop:** `rgba(0,0,0,0.25)` with `backdrop-filter: blur(1px)`.
- **Surface:** Document White, 12px radius, Overlay shadow, max-width 480–560px depending on content.
- **Header:** 20px padding, insurer logo + name on the left, close button on the right.
- **Body:** 20–24px padding, 20px vertical gap between fields.
- **Footer:** 16px padding, secondary action left of primary right, separated by a 1px Linen Edge above.

## 6. Do's and Don'ts

### Do:
- **Do** use Mistral (`#faf8f5`) as the body surface on every page. The warm-neutral is the room.
- **Do** reserve Bureau Vert (`#1A3C34`) for the single primary CTA per surface. One per screen, period.
- **Do** use Signal Vert (`#00a272`) for status, links, and active nav, sparingly.
- **Do** keep borders at 1px Linen Edge (`#eae7e0`). Hierarchy is borders before shadows.
- **Do** keep body at 13px / 1.4 Inter. Smaller sizes need a reason.
- **Do** use Georgia serif for page titles (24px) and only page titles.
- **Do** write French copy that names what's happening. Sober, specific, never hyped.
- **Do** make every AI action visible: timeline, status pill, named step.
- **Do** respect `prefers-reduced-motion` for the live-agent feeds and the streaming background blobs.
- **Do** verify 4.5:1 contrast for body text and placeholders against Mistral and Document White.

### Don't:
- **Don't** add a second primary CTA on a surface. The Bureau Vert button is singular.
- **Don't** mix Signal Vert and Bureau Vert on the same element. They are not interchangeable greens.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored stripe accent on cards or alerts. Use a full border or a tinted background instead.
- **Don't** use gradient text. Solid color, weight + size for emphasis.
- **Don't** use glassmorphism decoratively. The modal backdrop is the only blur surface.
- **Don't** import a component library (shadcn, MUI, Chakra). Every primitive is custom.
- **Don't** name a future neutral token `--paper`, `--cream`, `--sand`, `--bone`, `--linen`, or `--parchment`. Those names are the saturated AI default; Mistral is the system's name.
- **Don't** put a tiny uppercase tracked eyebrow above every section. The "label" tier earns its place once or twice per page.
- **Don't** number sections with `01 · / 02 · / 03 ·` as default scaffolding. Numbers belong to real ordered sequences (a 3-step onboarding gate, a step-by-step wizard), not to be decorative.
- **Don't** use bouncy/spring/elastic motion. Ease-out curves only (200ms ease-out is the default).
- **Don't** clone Linear, Notion, or a SaaS hero-metric dashboard. The reference is a leather portfolio, not a Silicon Valley deck.
- **Don't** use neon dark mode, gradient buttons (Bureau Vert's gradient is internal, single-hue, not a multi-stop rainbow), or emoji-driven empty states.
