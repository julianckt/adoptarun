# Adopt-a-Run — Agent Invariants & Guidelines

Repository guidance for Claude Code. Specialized domain workflows are loaded via Claude plugins; external services are connected via MCP servers (`astro`, `github`, `sanity`, `cloudflare`).

---

## 1. Commands

- **Dev Server**: `npm run dev`
- **Design Token Audit**: `npm run check:design`
- **Typecheck**: `npm run typecheck`
- **Run Unit Tests**: `npm test`
- **Production Build**: `npm run build`

---

## 2. Design System & Frontend Invariants

All UI, layout, and style modifications must comply strictly with the design system.

- **Tokenized Styling**: Compose all layout, spacing, typography, borders, and colors exclusively from CSS custom properties in `src/styles/tokens.css` and specifications in `DESIGN.md`. Never introduce arbitrary literal values (`px`, `rem`, hex, rgb).
- **CSS Architecture**: Write standard Vanilla CSS inside cascade layers (`@layer base`, `@layer components` in `src/styles/components.css`) or scoped Astro `<style>` blocks. Avoid Tailwind or utility CSS libraries unless explicitly instructed.
- **Frontend Stack**: Astro 5 SSR/Static with React 19 interactive islands (`client:load`, `client:idle`).
- **Gated Completion Criterion**: Before declaring any UI or CSS change complete, run `npm run check:design`. The check must exit with **0 anti-patterns**.

---

## 3. Testing & Public Seams

- **Seam Boundaries**: Test frontend components at public behavioral seams: dynamic data/telemetry formatting (e.g., distance, pace, elevation), conditional rendering, interactive state transitions, form/event actions, and accessibility contracts (`aria-*`, `role`).
- **Layout Verification**: Verify styling and visual structure through `npm run check:design` and direct visual review. Never write unit tests asserting on raw CSS strings, exact element dimensions, or mock/regex-parse `.astro` templates in Vitest.

---

## 4. Documentation & Scoping Boundaries

- **Active Domain Knowledge**: Consult `CONTEXT.md` and `docs/adr/` for domain models, architectural decision records, and business terminology.
- **Historical Cold Storage**: Treat `docs/archive/` as out-of-scope historical records. Never read, search, cite, or modify files under `docs/archive/` unless explicitly instructed.

---

## 5. External Services & MCP Tools

When interacting with external services or platforms, use the connected MCP tools:
- **Sanity CMS**: Query and mutate documents using Sanity MCP tools.
- **GitHub**: Search, inspect, create, and update issues/PRs using GitHub MCP tools (`julianckt/adoptarun`).
- **Astro**: Consult official Astro docs using Astro Docs MCP tools.
- **Cloudflare**: Inspect and manage worker/storage/infrastructure state via Cloudflare MCP tools.
