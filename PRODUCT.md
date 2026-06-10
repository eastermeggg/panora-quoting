# Product

## Register

product

## Users

French insurance brokers (courtiers) working from their desk during business hours. They manage multiple client quotations simultaneously across several insurers, and have historically done this by logging into each insurer's extranet portal one at a time, filling identical forms, waiting for quotes, and reconciling results by hand. They are domain experts, fluent in product line jargon (Auto, MRI, MRP, Santé, RC Pro, D&O, Cyber, Décennale, Flotte), and live in a French-language working environment.

The product replaces the tedious, repetitive parts of that workflow: an AI agent fans out cotation requests, watches the portals, brings back results, and surfaces a comparison view the broker can present to a client. The broker's job becomes oversight and judgement, not data entry.

## Product Purpose

A cotation assistant that lets a broker forward one client email and receive comparable quotes from every relevant insurer, then a clean side-by-side comparison and a brandable client-facing presentation. Success looks like a broker turning what used to be a half-day of portal-juggling into ten minutes of review, with full traceability of every action the agent took on their behalf.

The product spans the full quoting lifecycle: onboarding (connect extranets, configure products to cote, activate daily 2FA sessions), intake (forward client email or fill a standalone form), launch (verify data, pick an étude, fan out to insurers), comparison (side-by-side offers across products), and presentation (branded client export).

## Brand Personality

Premium, polished, confident — quiet authority over loud innovation. The reference is a well-made leather portfolio, not a Silicon Valley dashboard. Three emotional goals drive every screen:

- **Confidence** — "I'm in control, nothing is slipping through."
- **Trust** — "Accurate and transparent, I can rely on it."
- **Relief** — "This used to take hours, now it's handled."

The voice is French, sober, and specific. Copy names what's happening; it does not hype. Errors and pending states are stated plainly with a clear next action.

## Anti-references

- Generic SaaS dashboards (Linear-cloned, Notion-cloned, identical card grids, hero-metric template).
- Neon dark mode and other Silicon-Valley aesthetics.
- Overly playful or animated interfaces; bouncy spring physics; emoji-driven empty states.
- American tech maximalism: gradient text, gradient buttons, glassmorphism as decoration.
- Cream / sand / beige body backgrounds presented as "warm editorial restraint" — the saturated AI-default of 2026. Warmth here is carried by the `#faf8f5` surface plus deep green accents and serif headings, not by tinted near-white scaffolding.
- Tiny uppercase tracked eyebrows above every section; numbered scaffolding (01 / 02 / 03) used as default section markers.

## Design Principles

1. **Quiet authority.** Restraint communicates competence. Nothing shouts; weight and rhythm carry hierarchy.
2. **Information density with clarity.** Brokers scan a lot per screen. Pack tightly, use rhythm and typography to keep it legible at a glance.
3. **Trust through transparency.** Every AI action is visible and traceable. Live-agent panels, action timelines, and explicit session states beat magical "trust us" UX.
4. **Precision over decoration.** Every pixel earns its place. No ornament, no filler chrome.
5. **Warmth without softness.** The palette is warm (#faf8f5, earthy borders, deep green) but the tone stays professional. Approachable without undermining authority.

## Accessibility & Inclusion

- French as the primary working language; English is not a fallback in the broker UI.
- Body text contrast: maintain ≥4.5:1 against the warm-neutral surface. The default body color is `#22201a` on `#faf8f5`, which clears 4.5:1 comfortably; muted secondary text (`#5c5953`) is only used where size or weight justifies it.
- Respect `prefers-reduced-motion` for the live-agent activity feeds and any reveal animations.
- Keyboard-reachable controls on the modals and OTP inputs; the daily session-activation flow is the path of repeated friction and must be fully keyboard-driven.
- The product is shown on broker desktops; no assumption of mobile use, but layouts should not collapse catastrophically below ~1100px.
