# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Always use GitHub MCP (`ServerName: "github"`) with `owner: "julianckt"` and `repo: "adoptarun"`. Never use the `gh` CLI.

## Conventions

- **Create an issue**: GitHub MCP `create_issue` with `{ owner: "julianckt", repo: "adoptarun", title: "...", body: "...", labels: [...] }`.
- **Read an issue**: GitHub MCP `get_issue` with `{ owner: "julianckt", repo: "adoptarun", issue_number: <number> }`.
- **List issues**: GitHub MCP `list_issues` with `{ owner: "julianckt", repo: "adoptarun", state: "open", labels: "..." }` or `search_issues` with `{ q: "repo:julianckt/adoptarun is:issue is:open label:..." }`.
- **Comment on an issue**: GitHub MCP `add_issue_comment` with `{ owner: "julianckt", repo: "adoptarun", issue_number: <number>, body: "..." }`.
- **Apply / remove labels**: GitHub MCP `update_issue` with `{ owner: "julianckt", repo: "adoptarun", issue_number: <number>, labels: [...] }`.
- **Close**: GitHub MCP `update_issue` with `{ owner: "julianckt", repo: "adoptarun", issue_number: <number>, state: "closed" }` (and `add_issue_comment` for closing comments).

Default target repository: `owner: "julianckt"`, `repo: "adoptarun"`.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the GitHub MCP PR equivalents:

- **Read a PR**: GitHub MCP `get_pull_request` with `{ owner: "julianckt", repo: "adoptarun", pull_number: <number> }` (and `get_pull_request_files` for the diff).
- **List external PRs for triage**: GitHub MCP `list_pull_requests` with `{ owner: "julianckt", repo: "adoptarun", state: "open" }`.
- **Comment / label / close**: GitHub MCP `add_issue_comment` (comments on PRs work with `issue_number`), `update_issue` for labels/closing, or `update_pull_request_branch`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `get_pull_request` and fall back to `get_issue`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue using GitHub MCP `create_issue`.

## When a skill says "fetch the relevant ticket"

Call GitHub MCP `get_issue` with `{ owner: "julianckt", repo: "adoptarun", issue_number: <number> }`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. GitHub MCP `create_issue` with `labels: ["wayfinder:map"]`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (or in task lists where sub-issues aren't enabled: add the child to a task list in the map body and put `Part of #<map>` at the top of the child body). Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev via `update_issue` with `assignees: ["julianckt"]`.
- **Blocking**: GitHub's **native issue dependencies** or task list tracking. Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children using GitHub MCP `list_issues` (scoped to `state: "open"`), drop any with an open blocker or an assignee; first in map order wins.
- **Claim**: GitHub MCP `update_issue` with `{ owner: "julianckt", repo: "adoptarun", issue_number: <n>, assignees: ["julianckt"] }` — the session's first write.
- **Resolve**: GitHub MCP `add_issue_comment` with `{ owner: "julianckt", repo: "adoptarun", issue_number: <n>, body: "<answer>" }`, then `update_issue` with `{ owner: "julianckt", repo: "adoptarun", issue_number: <n>, state: "closed" }`, then append a context pointer (gist + link) to the map's Decisions-so-far.
