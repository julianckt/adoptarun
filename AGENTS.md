## Agent skills

### Design system enforcement

All UI, layout, and style code must strictly comply with `DESIGN.md`. Never use arbitrary `px` or `rem` font sizes. Use defined tokens from `src/styles/tokens.css`. Before declaring any frontend task complete, agents must run `npm run check:design` and ensure 0 anti-patterns are reported.

### Issue tracker

Issues live as GitHub issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.


### Triage labels

Uses canonical triage label roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context domain docs layout (`CONTEXT.md` + `docs/adr/`). See `docs/agents/domain.md`.

### Archived docs

Never read, search, cite, or access files under `docs/archive/` unless the user explicitly requests them in their prompt. Treat all documents in `docs/archive/` as deprecated and out of scope for general exploration, planning, and implementation.
