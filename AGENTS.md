## Repository Invariants

### Design system enforcement
All UI, layout, and style code must strictly comply with `DESIGN.md` using defined tokens from `src/styles/tokens.css` (never arbitrary `px` or `rem` font sizes).
**Completion criterion**: Before declaring any frontend task complete, run `npm run check:design` and ensure 0 anti-patterns are reported.

### UI/UX testing & seam boundaries
When using `/tdd` or `/implement` on frontend components, test behavioral contracts at public seams: dynamic data and telemetry formatting (e.g. distance, elevation, duration), conditional rendering, interactive state transitions, form/event actions, and accessibility attributes (`aria-*`, `role`).
Verify layout and styling via `npm run check:design` and visual review — never assert on styling details (CSS strings, exact dimensions, colors, stylesheet files) or fabricate pseudo-seams by regex-parsing or mocking `.astro` templates in Vitest.

### Issue tracker & external services
- **Issue tracker**: GitHub issues via GitHub MCP (`ServerName: "github"`, Tools: `get_issue`, `list_issues`, `search_issues`, `create_issue`, `add_issue_comment`, `update_issue`) with `owner: "julianckt"` and `repo: "adoptarun"`. See `docs/agents/issue-tracker.md`.
- **MCPs over CLIs**: Always use MCP servers (`github`, `Sanity`, `cloudflare-api`) for external network or auth operations. Never run CLI equivalents in the sandbox (`gh`, `sanity` CLI, `wrangler deploy`, `git push`).

### Sandbox execution
Always run `npm test`, `npm run check:design`, package installations (`npm i`), and `npx skills` with `BypassSandbox: true` on the first attempt (required for `.agents/` scripts and network access).

### Context pointers & doc rules
- **Triage labels**: Uses canonical triage label roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.
- **Domain docs**: Single-context domain docs layout (`CONTEXT.md` + `docs/adr/`). See `docs/agents/domain.md`.
- **Archived docs**: Never read, search, cite, or access files under `docs/archive/` unless explicitly requested in the user prompt (deprecated and out of scope).
