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
