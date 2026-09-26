# Slack Observability System — Handoff

Captured from a grilling session on 2026-09-23. This is a brainstorm + decisions doc, not an implementation plan — treat it as the source list to scope real work from later.

## Decisions locked in

- **No new CI pipeline.** Deploys already run via Cloudflare's native Git integration (Workers Builds) — confirmed by `npm run deploy` just printing "push to trigger" and no `.github/` directory. We extend the *existing* build script (`scripts/cache-sanity.mjs`) to fire notifications directly from inside the build, and lean on Cloudflare's own deploy-status notifications rather than building parallel CI.
- **Two Slack Incoming Webhooks, two channels** — no Slack bot/OAuth app, no dynamic channel routing. One webhook URL per tier, each just an env var.
  - Tier 1 — **Act-on** channel: needs a decision/action from Julian within a bounded window. Should interrupt.
  - Tier 2 — **Good-to-know** channel: confirms normal operation or gives context. No interrupt, browse when curious.
- **Design framework**: this is the standard SRE "page vs. log" severity split (cf. PagerDuty alerting theory) — actionable+time-bound goes to the interrupting channel, everything else goes to the ambient one.
- Explicitly scoped as a **quality-of-life upgrade**, not a project — if any single item adds real complexity (new infra, new auth, a bot), park it rather than force it in.

## Known repo grounding (facts, not opinions)

- Stack: Astro 5 on Cloudflare Workers (single worker `adoptarun`), D1 database `adoptarun-d1` (3 tables: `counters`, `adoptions`, `run_logs`), Sanity CMS for content.
- `adoptions` table = "user signup" (a runner committing to adopt a shelter animal's run).
- `run_logs` table = "user log" — **schema exists but no API route or Strava OAuth integration wired up yet.** This is a real gap, not just missing notifications.
- `scripts/cache-sanity.mjs` already has a silent-degradation path: if Sanity is unreachable at build time, it falls back to the last cached `src/data/sanity-cache.json` and the build still succeeds. This is currently invisible — no signal anywhere that it happened.
- Cloudflare account currently has: no KV, no R2, no WAF/Bot Fight Mode, no Web Analytics beacon. Observability logs/traces are enabled in `wrangler.jsonc` (persisted).
- No cron triggers exist yet — anything "weekly" needs one to be created.

## Full event list (grouped, tiered)

### Domain / business signals
| Event | Tier | Notes |
|---|---|---|
| New adoption signup | Good-to-know | delightful, not urgent |
| Fundraising milestone crossed (total HKD raised passes a round number) | Good-to-know | fun stat |
| Commitment approaching `target_date` with no verified run logged | Act-on | needs Strava/run-log system to exist first |
| A charity going quiet (zero signups in N days) or lopsided demand across charities | Act-on | rebalancing decision |
| Signup API error rate spike (form/D1 write failures) | Act-on | |

### Content / Sanity — IMPLEMENTED 2026-09-23

| Event | Tier | Status |
|---|---|---|
| Any document published/updated/removed | Good-to-know | **Manual step required** — see below, no code needed |
| Sanity webhook delivery failure | — | **Dropped.** Not observable from our side (if delivery fails, nothing fires); Sanity's own dashboard already shows this via the attempts log. Not worth the polling infra it'd take to replicate. |
| Broken asset/image reference in published content | Act-on | **Done.** Only dangling references (an `asset._ref` pointing at a deleted asset) trigger it — empty image fields are not flagged. Implemented in `scripts/cache-sanity.mjs` (`collectBrokenAssetRefs`), checked at build time via computed `*AssetOk` GROQ fields on the `route`/`charity` queries, stripped from the cache before writing. |
| Sanity cache fallback used during build (silent degradation) | **Act-on** | **Done.** Two cases covered in `scripts/cache-sanity.mjs`: (1) the whole Sanity fetch throws → falls back to the entire previous snapshot; (2) an individual query (routes/charities/settings/siteCopy/emailCopy) returns empty and falls back to that field's previous cached value. Both post to Slack. |

**New env var**: `SLACK_WEBHOOK_ACT_ON` — documented in `.env.example`. Set it as a Cloudflare Workers Build environment variable (Settings → Build → Environment variables) for production; if unset, the script just no-ops (no crash, no spam) — safe to leave empty locally.

**Manual step — configure in [sanity.io/manage](https://www.sanity.io/manage) → adoptarun project → API → Webhooks** (the Sanity CLI's `hooks create` is interactive-only and can't be scripted, so this one has to be clicked through by hand):

- **Name**: `slack-publish-notify` (or anything)
- **URL**: the good-to-know Slack Incoming Webhook URL
- **Dataset**: `production`
- **Trigger on**: Create, Update, Delete (all three)
- **Filter**: `_type != "sanity.imageAsset" && _type != "sanity.fileAsset"` — excludes raw file/image uploads (which fire their own create events with no title, and would otherwise spam the channel every time an image is dragged into a field) while still catching every real content type (`charity`, `route`, `settings`, `siteCopy`, `emailCopy`)
- **Projection**:
  ```groq
  {
    "text": "📝 Sanity " + select(
        after() == null => "🗑️ deleted",
        before() == null => "🆕 published",
        "✏️ updated"
      ) + ": *" + _type + "* — " + coalesce(after().title, after().name, before().title, before().name, "Untitled")
      + "\n<https://adoptarun.sanity.studio/intent/edit/id=" + _id + ";type=" + _type + "|Open in Studio>"
  }
  ```
- **HTTP method**: POST
- **Drafts/versions**: leave both off (default) — only fires on actual publishes, not every keystroke
- **Secret**: not needed — Slack Incoming Webhooks don't require request signing

### Infra / Cloudflare — deploy & runtime
| Event | Tier | Notes |
|---|---|---|
| Deploy failed | Act-on | via Cloudflare's native deploy notifications |
| Deploy succeeded, no issues | Good-to-know | |
| Worker error rate spike / elevated 5xx | Act-on | from Workers Analytics |
| Status code breakdown drift (4xx trend) | Act-on | catches silent breakage, e.g. broken route links |
| D1 query errors | Act-on | |
| CPU time / duration p50-p99 trending up | Act-on | early warning before hitting free-plan CPU limits |

### Free-tier capacity
| Event | Tier | Notes |
|---|---|---|
| Cloudflare Workers requests/day approaching limit | Act-on | |
| D1 storage or rows-read/written approaching limit | Act-on | |
| Sanity API requests/bandwidth/asset storage approaching limit | Act-on | |
| Workers Builds — build minutes/month approaching cap | Act-on | separate cap from request volume, easy to blow through unnoticed |

### Digests (weekly)
| Event | Tier | Notes |
|---|---|---|
| Weekly Cloudflare Analytics summary (traffic, top routes, error trend) | Good-to-know | |
| Weekly free-tier usage across all services | Good-to-know (escalate to Act-on if something's close) | |
| Weekly codebase state (commits, LOC churn, open TODOs) | Good-to-know | |
| Weekly "fun numbers" digest: total km logged, total HKD raised, new districts covered, top-fundraiser leaderboard | Good-to-know | data-nerd candy |
| Weekly geographic traffic breakdown (where visitors/runners come from) | Good-to-know | available today, no prerequisite |
| Weekly D1 file-size growth trend | Good-to-know | |
| Weekly build-duration trend | Good-to-know | flags if `cache-sanity.mjs`/Astro build starts creeping up |

### Meta
| Event | Tier | Notes |
|---|---|---|
| The weekly digest's own Cron Trigger silently fails to run | Act-on | the "who watches the watchmen" case — invisible unless explicitly tracked |

## Blocked on enabling something first (backlog, not v1)

- **Core Web Vitals / Real User Monitoring** — needs the Cloudflare Web Analytics beacon added to the Astro layout. Not present in the codebase today.
- **Bot/threat traffic, WAF events** — needs Bot Fight Mode or a WAF ruleset turned on. Currently off on this zone.

## Open implementation questions (not yet decided)

- Exact Cloudflare notification wiring (Workers Builds webhook vs. email-to-Slack vs. Cloudflare's Slack integration directly) — needs to be scoped once we're ready to build.
- Where the weekly digest logic lives (a Cron Triggered handler in the existing `adoptarun` worker vs. a separate small worker).
- How free-tier usage numbers get pulled (Cloudflare GraphQL Analytics API + Sanity's usage API) — needs API token scoping.
- Whether the Strava run-logging system (currently nonexistent) is a prerequisite for the "commitment approaching deadline, no run logged" alert, or if that alert should wait until that system ships.
