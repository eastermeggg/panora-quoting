# Panora Quoting — Project Rules

## Sidebar
- **ALWAYS** use the shared `<Sidebar />` component from `src/components/layout/Sidebar.tsx` on every page.
- **NEVER** duplicate the sidebar. Each page must render exactly ONE `<Sidebar />`.
- When implementing a Figma design that includes a sidebar, **skip the sidebar from the Figma output** — the shared component already handles it.
- Page layout pattern: `<div className="flex h-screen"> <Sidebar /> <div className="flex-1 ...">content</div> </div>`

## Design System
- Colors match Figma tokens: green `#00a272`, warning `#cb8052`, error `#952617`, text `#22201a`, muted `#5c5953`, border `#eae7e0`
- Body text: 13px Inter. Section headers: 15px serif. Page titles: 24px serif.
- Inputs: white bg, border `#e2dfd8`, shadow `0px 1px 2px rgba(0,0,0,0.05)`, radius 8px.

## Stack
- Next.js 16 + React 19 + Tailwind 4 + TypeScript
- No component libraries — all components are custom.

## Design Context

### Users
Insurance brokers (courtiers) working at desks during business hours in France. They manage multiple client quotations across several insurers simultaneously. The tool replaces tedious manual work — logging into insurer extranets, filling forms, waiting for quotes, comparing results.

### Brand Personality
**Premium, polished, confident.** Quiet authority over loud innovation. Think: a well-made leather portfolio, not a Silicon Valley dashboard.

### Emotional Goals
- **Confidence** — "I'm in control, nothing is slipping through"
- **Trust** — "Accurate and transparent, I can rely on it"
- **Relief** — "This used to take hours, now it's handled"

### Aesthetic Direction
- Light theme, warm neutrals (#faf8f5), earthy borders (#eae7e0), deep green accent (#00a272) used sparingly
- Serif headings for gravitas, sans-serif body for density
- Anti-references: generic SaaS dashboards, neon dark mode, overly playful interfaces
- Understated French sophistication over American tech maximalism

### Design Principles
1. **Quiet authority** — Restraint communicates competence. Nothing shouts.
2. **Information density with clarity** — Pack tightly, use rhythm and hierarchy to keep it scannable.
3. **Trust through transparency** — Every AI action is visible and traceable.
4. **Precision over decoration** — Every pixel serves a purpose.
5. **Warmth without softness** — Approachable without undermining professional authority.
