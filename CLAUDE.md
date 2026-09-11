# Adopt-a-Run — Claude Code Guidance

Repository guidance for Claude Code. `AGENTS.md` is the primary source of invariants; this file must remain aligned with it. If the two ever conflict, `AGENTS.md` wins — update this file to match.

Specialized domain workflows are loaded via Claude plugins (Matt Pocock skills, Impeccable); external services are connected via MCP servers (`astro`, `github`, `sanity`, `cloudflare`).

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
- **Visual Review**: Do not launch the local browser by default. Only spin up the dev server and inspect visually when the user explicitly asks for it.

---

## 4. Git & Branching Workflow

- **Feature Branch Only**: All Claude Code work lives on a dedicated feature branch (currently `claude/ui-tweaks`). Never commit to `main` directly.
- **Local Commits Only**: Create commits locally as work progresses. Do not `git push`, do not open PRs, do not merge — the user handles all remote and merge operations.
- **Standard Precautions**: Run `git status` before any destructive operation. Never use `--no-verify` or bypass hooks.

---

## 5. Documentation & Scoping Boundaries

- **Active Domain Knowledge**: Consult `CONTEXT.md` and `docs/adr/` for domain models, architectural decision records, and business terminology.
- **Historical Cold Storage**: Treat `docs/archive/` as out-of-scope historical records. Never read, search, cite, or modify files under `docs/archive/` unless explicitly instructed.
- **Triage Labels**: Canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) are defined in `docs/agents/triage-labels.md`.

---

## 6. External Services & MCP Tools

When interacting with external services, use the connected MCP tools (never their CLI equivalents such as `gh`, `sanity`, or `wrangler deploy`):

- **GitHub MCP** (`owner: julianckt`, `repo: adoptarun`): Search, inspect, create, and update issues/PRs. Reads and issue comments are fine without confirmation.
- **Astro Docs MCP**: Consult official Astro documentation freely.
- **Sanity MCP**: **Reads OK; ask before any mutation** (creating, patching, or deleting documents). Confirm intent and target dataset first.
- **Cloudflare MCP**: **Reads OK; ask before any mutation** to workers, storage, DNS, or infrastructure state. Confirm intent and environment (production vs. preview) first.
