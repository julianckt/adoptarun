# Master Specification Sheet: Adopt A Run MVP Platform

**Status**: Ready for Agent (`ready-for-agent`)  
**Domain**: Adopt A Run (`adoptarun.org`)  
**Version**: 1.2.0 (Master Blueprint - Finalized)  
**Date**: 2026-09-01  

---

## Problem Statement

Urban runners, creative thinkers, and fitness enthusiasts in Hong Kong lack a visually inspiring, community-driven, and friction-free platform to combine physical activity (running, jogging, walking) with social impact. Traditional charity runs and event platforms are plagued by high-friction onboarding (password accounts, verification emails, lengthy registration forms), generic race-day aesthetics, and rigid ticket purchases. 

Furthermore, non-profit charities struggle to engage modern urban demographics in peer-to-peer fundraising without paying high platform fees or managing complex money-handling liabilities. Runners who complete GPS art routes lack a polished, shareable digital artifact that honors both their athletic achievement and the charitable cause they championed.

---

## Solution

**Adopt A Run** is an international GPS-art community movement debuting in Hong Kong that transforms urban running into caretaker ownership of digital artwork and non-profit causes. 

The Adopt A Run web platform provides:
1. **A Dynamic Visual Identity & Lumos Design System**: Built with Astro (Hybrid SSR), React islands, and the Lumos Framework for Astro (`@layer base, patterns, components, utilities` + fluid clamp design tokens), featuring dynamic typography, interactive route polyline animations, and a centralized responsive navigation header.
2. **A 3-Page Discovery & Adoption Portal (`/routes`, `/charities`, `/signup`)**: A catalog for discovering and filtering Strava Art Routes, a dedicated partner charities showcase launching with SPCA, and a zero-login 4-step adoption wizard where runners match with an Artwork, select a Charity Cause, set dynamic commitment and fundraising target goals, name their route animal companion (strictly required), and receive a persistent 6-character **Adopter ID** (`NNNN-CC`, starting from seed `1200`).
3. **An Ephemeral Strava OAuth & Server-Side Verification Engine (`/api/strava-callback`, `/api/verify-gpx`, `/api/confirm-run`)**: A zero-password run verification pipeline executing securely inside Cloudflare Pages Functions using stateless signed tokens. It matches completed Strava runs for Adopters using a 3-layer spatial algorithm (activity type, 20-day window, ±40% distance, start radius, 10-point trajectory sample) with a 6-tier fallback hierarchy, handing candidate activities to `/log` via a signed URL parameter (`review_token`), or accepts raw `.gpx` file uploads parsed 100% server-side with spatial checks bypassed.
4. **Interactive Digital Certificate System (`/log/:run_id`)**: Publicly accessible, independent run log dashboards displaying Leaflet GPX route traces synchronized with interactive elevation scrubbers, verified run telemetry metrics, Sanity CMS impact equivalencies, and clean "Pass the Torch" recruitment actions. Unlogged IDs render a clean 404 page. Printable physical certificates and social share graphics are retained for future deployment, presenting a sleek "Feature Coming Soon" modal in the MVP.
5. **Decoupled Edge Data Infrastructure**: Serverless execution on Cloudflare Pages & Functions (Hybrid SSR), embedded Sanity.io Headless CMS at `/studio` with `@sanity/visual-editing` (Stega) for in-context live visual editing and in-browser GPX route parsing, Cloudflare D1 SQLite for adoptions and run telemetry with atomic sequence counters and automatic multi-run suffix resolution (`1200-JC-2`), static SSG marketing pages with editable community movement counters managed via Sanity `siteCopy`, Nano Stores for zero-bundle cross-island state, synchronous Resend transactional emails with non-blocking error handling, and a blueprint for future Raisely P2P donations (`donate.adoptarun.hk`).

---

## User Stories

### Runner / Adopter Experience

1. As an urban runner, I want to view an engaging, interactive hero section with dynamic typography and artwork visuals, so that I immediately understand the athletic, community energy of the Adopt A Run movement.
2. As an urban runner, I want to see community movement counters on the homepage (total km, total runs, total participants), so that I can see the collective momentum of the movement updated from CMS site copy on an ultra-fast static page.
3. As an urban runner, I want to browse a catalog of Strava Art Routes (`/routes`), so that I can filter artwork by difficulty, region, distance, and features like kid-friendly or trail-running.
4. As an urban runner, I want to expand a route card inline within the catalog grid, so that I can view an interactive Leaflet map, animated GPS polyline path drawing, elevation profile SVG, and start point details without losing my place.
5. As an urban runner, I want to browse a dedicated Charities page (`/charities`), so that I can explore our partner non-profit organizations (featuring SPCA for MVP launch) and understand their charitable missions.
6. As an urban runner, I want to click "Adopt This Route" on any card, so that I am seamlessly redirected to the Adoption Portal (`/signup?route=<slug>`) with my chosen route pre-loaded.
7. As an urban runner, I want to complete a 4-step zero-login adoption wizard (`/signup`), so that I can commit to a route and pair it with a beneficiary Charity Cause without creating a password or registering an account.
8. As an urban runner, I want to adjust dynamic commitment sliders for completion timeframe (1–20 days) and fundraising target goals (HK$100–HK$2,000), so that I can set realistic goals aligned with real-world charity impact equivalencies.
9. As an urban runner adopting a scheduled group run, I want my target date and commitment days to automatically derive from the event date, so that I do not have to manually configure timeframe sliders.
10. As an urban runner, I want scheduled group run routes to retain their group status in the header ticker, catalog pinning, and wizard until 24 hours after the meetup time (`groupRunDateTime + 24h`), so that runners can still commit during the event day before the route automatically converts to standard solo adoption mode.
11. As an urban runner, I want to give a custom name to my route's animal companion as a required step, so that I establish a personal caretaker connection with the artwork I am running.
12. As an urban runner, I want to receive a unique 6-character Adopter ID (`NNNN-CC`, starting from seed `1200-JC`) upon committing, so that I have a persistent identifier to track, share, and log my run.
13. As an urban runner, I want to receive a transactional confirmation email containing my Adopter ID and commitment details, so that I have a reference link to return to whenever I am ready to complete my run.
14. As an urban runner, I want to visit a dedicated run logging page (`/log`) to log my completed run via 1-click Strava OAuth, so that my activity is securely retrieved, spatially verified on the server against the artwork polyline (within 20 days lookback), and logged without manual metric entry.
15. As an urban runner, I want a clear fallback hierarchy when Strava activities do not perfectly match (single match card, top 3 match cards, "Cannot find my run" raw table list, or catchall banner), so that I can always identify and confirm my activity.
16. As an urban runner, I want to log my run on `/log` by uploading a raw `.gpx` file, so that any GPS watch or tracking app can be used to prove route completion through server-side parsing with spatial checks bypassed.
17. As a walk-in runner who finished a run before adopting, I want to log a run directly on `/log` by entering my name, email (required), charity, and animal companion name, so that an Adopter ID is created upfront (`commitment_days=0`, `target_date=today`, `target_hkd=null`), spatial verification is bypassed, and I can directly select my Strava run or upload a GPX file.
18. As a runner who forgot my Adopter ID, I want to request ID recovery by email on `/log` and receive direct feedback (explicit 404 error if not found, or dispatch notice if found), so that I know immediately whether an email was sent.
19. As a runner logging multiple runs under one Adopter ID, I want subsequent logs to automatically append sequential suffixes (`1200-JC-2`, `1200-JC-3`) upon confirmation without asking, so that each run receives an independent run log URL (`/log/1200-JC-2`).
20. As an urban runner, I want to access my permanent Adoption Run Log (`/log/:run_id`) as an independent standalone dashboard, so that I can view my map trace, scrub the elevation profile to see my position on the map, and review my performance telemetry and metrics.
21. As a visitor navigating to an unlogged Adopter ID on `/log/:run_id`, I want to see a clear 404 "Run Log Not Found" page, so that unverified runs are not prematurely displayed.
22. As an urban runner viewing my Run Log, I want clicking `[Share Achievement]` or `[Claim Physical Cert]` to display a sleek "Feature Coming Soon" dialog, so that I am clearly informed of future enhancements while enjoying the interactive digital dashboard.
23. As an urban runner, I want to use a "Pass the Torch" action, so that I can easily copy a clean referral link (`https://adoptarun.org/signup?route=<slug>`) to recruit the next caretaker to take over the route.

### Donor / Supporter Experience (Future Deployment)

24. *[Future Deployment]* As a donor, I want to visit an Adopter's fundraising profile (`donate.adoptarun.org/profiles/:adopter_id`), so that I can contribute funds directly to the paired charity cause in support of the runner.
25. *[Future Deployment]* As a donor, I want 100% of my contribution to go directly to the Section 88 tax-exempt charity via Stripe HK, so that I know my money is handling-fee-free and legally tax-deductible.
26. *[Future Deployment]* As a donor, I want to view live donor walls and progress cards embedded inside the runner's Adoption Run Log (`/log/:run_id`), so that I can see my cheer message and total funds raised.

### Content Manager / Admin Experience

27. As a non-technical client admin, I want to use a visual Sanity Studio CMS interface embedded at `/studio` with live click-to-edit visual overlays, so that I can easily create, update, and publish routes, charities, and homepage site copy in-context without code edits.
28. As a client admin, I want GPX file uploads in Sanity Studio to automatically calculate distance, elevation gain, polyline strings, elevation profiles, and mini-map SVGs in-browser via a custom Studio component, so that manual data entry is eliminated without server round-trips.
29. As a client admin, I want to toggle featured routes, group run schedules, and movement counter numbers in Sanity Studio, so that homepage content and community runs are easily updated without deploying code.

---

## Implementation Decisions

### 1. Architectural & Technology Stack Decisions

- **Framework**: Astro with Hybrid SSR (`output: 'hybrid'`) deployed via `@astrojs/cloudflare` with React islands. Marketing and static pages (`/`, `/routes`, `/charities`, `/signup/confirmed`) are pre-rendered to static HTML for sub-50ms TTFB; dynamic run logs (`/log/:run_id`) and serverless API endpoints (`/api/signup`, `/api/strava-callback`, `/api/verify-gpx`, `/api/confirm-run`, `/api/recover-adopter-id`, `/api/preview`) execute on-demand via Cloudflare Pages Functions.
- **Styling & Design System**: Lumos Framework for Astro (`@layer base, patterns, components, utilities`) with fluid clamp tokens (`var(--space-fluid-*)`, `var(--font-fluid-*)`) and container-query utilities (`u-grid-autofit`). All custom component styling is declared inside `@layer components` to preserve CSS layer specificity and prevent overrides.
- **Visual Code Authoring (Stacki)**: Astro components strictly follow clean-prop forwarding (`class:list`, `{...props}`, slots) so that the local desktop Stacki visual editor can cleanly parse and manipulate `.astro` files. Stacki owns local layout/template engineering; Sanity CMS owns live content.
- **Cross-Island State Management**: Nano Stores (`nanostores` + `@nanostores/react`) for lightweight (~1 KB) atomic reactive state sharing between decoupled React islands (e.g., Adoption Wizard summary rail, Header ticker) and static Astro templates.
- **Headless CMS & In-Browser GPX Processing**: Sanity.io embedded directly in Astro at `/studio` via `@sanity/astro`, with `@sanity/visual-editing` and Stega content source maps for in-context live visual editing. Stega, drafts, and the Visual Editing island are confined to the on-demand `/preview` route (unlocked by Presentation's draft-mode handshake at `/api/draft-mode/enable` and a server-only `SANITY_API_READ_TOKEN`); every static public page is published-only with stega off, enforced by the post-build guard `scripts/check-build.mjs` (issue #20). A custom `GpxUploadInput` React component in Sanity Studio processes GPX files directly in the browser using the shared `gpx-parser.ts` utility to auto-calculate metrics, polylines, and elevation SVG paths. A dedicated string sanitization helper (`cleanStega()`) strips invisible Stega Unicode characters from numerical telemetry (distance, elevation) before math or mapping operations.
- **Edge Database & Sequence Generator**: Cloudflare D1 (SQLite) executing via Cloudflare Pages Functions. Cloudflare R2 is eliminated; GPS polylines (Google Encoded Polyline format, ~2–4 KB) and elevation sample arrays are stored directly in D1 `run_logs` text columns. Sequence numbering uses plain integers initialized at seed `1200` with atomic mutations via a dedicated `counters` table with pseudo-jumps (+1 to +4).
- **Server-Side Verification Engine**: Strava OAuth token exchange, GPX file parsing, and 3-layer spatial matching execute securely 100% server-side on Cloudflare Pages Functions (`/api/strava-callback`, `/api/verify-gpx`) to protect `CLIENT_SECRET` and maintain metric calculation integrity.
- **Authentication**: Zero-login architecture. Public identification handled via 6-character `adopter_id` (`NNNN-CC`).
- **Scope**: Single-language English platform for Phase 1. All donation integrations (Raisely REST API v3 / `donate.adoptarun.hk`), live donor walls, physical certificate generator (`jsPDF`), dynamic social preview card generators, and email background cron daemons are deferred to Future Deployment.

#### Platform Architecture: Pages vs. Modals

```
+---------------------------------------------------------------------------------------+
| STANDALONE PAGES (Astro Routes)                                                       |
| • /                   Homepage SSG (Hero, About, CMS Movement Counters, Journey, SPCA)|
| • /routes             Route Catalog SSG with filters and inline expandable cards      |
| • /charities          Charity Catalog SSG with dynamic cards (launches with SPCA)     |
| • /signup             4-Step Adoption Portal Wizard                                   |
| • /signup/confirmed   Adoption Commitment Confirmation & Calendar Export              |
| • /log                Dedicated Run Logging Page (ID prompt, Walk-In, Strava/GPX)     |
| • /log/:run_id        Verified Run Dashboard & Digital Certificate (SSR, 404 fallback)|
| • /studio             Embedded Sanity Studio CMS interface                            |
+---------------------------------------------------------------------------------------+
| MODALS & OVERLAY DIALOGS                                                              |
| • Physical Certificate Modal  (/log/:run_id) "Feature Coming Soon" notice             |
| • Social Share Modal          (/log/:run_id) "Feature Coming Soon" notice             |
| • GPX Helper Guide Modal      (/log) Step-by-step export guide for Garmin/Apple/etc.  |
| • "Forgot My ID" Modal/Drawer (/log) Direct feedback email prompt for ID recovery     |
+---------------------------------------------------------------------------------------+
```

### 2. Semantic Token & Component Contract

The styling layer is implemented using the Lumos CSS Framework structured around design-agnostic semantic CSS custom properties and layered architecture (`@layer base, patterns, components, utilities`):

- **Action Tokens (`--color-action-primary`, `--color-action-secondary`)**: High-contrast action tokens assigned to primary conversion points (`[RUN WITH US]`, `[ADOPT YOUR RUN]`, `[CONFIRM & COMMIT]`) and secondary interactive actions (`[LOG YOUR RUN]`, selection borders, slider thumbs).
- **Feedback & Accent Tokens (`--color-accent`, `--color-highlight`)**: Used for metric telemetry readouts, status tags, and route polyline highlights.
- **Surface Tokens (`--color-surface-canvas`, `--color-surface-card`, `--color-surface-overlay`)**: Hierarchical surface layers defining page background canvas, card containers, and modal dialogs.
- **Boundary & Divider Tokens (`--color-border-subtle`, `--color-border-strong`)**: Structural dividers and component borders.
- **Typography & Spacing Tokens (`--font-display`, `--font-mono`, `--font-body`, `--space-fluid-*`)**: Semantic font roles assigned across display headlines, technical telemetry data/identifiers, and narrative editorial copy, scaled via fluid clamp tokens.

### 3. Database Schema (Cloudflare D1 SQLite)

```sql
-- 1. COUNTERS TABLE (Atomic sequence generator for Adopter IDs)
CREATE TABLE counters (
  id TEXT PRIMARY KEY,                        -- 'adopter_seq'
  current_val INTEGER NOT NULL DEFAULT 1200   -- Initialized at seed 1200
);

-- 2. ADOPTIONS TABLE (Runner adoption portal commitments & upfront walk-ins)
CREATE TABLE adoptions (
  seq_num INTEGER NOT NULL,                   -- Plain integer assigned from counters table
  adopter_id TEXT PRIMARY KEY,                -- Formatted 'NNNN-CC' (e.g. '1204-JC')
  runner_first_name TEXT NOT NULL,
  runner_last_name TEXT NOT NULL,
  email TEXT NOT NULL,                        -- Required for both standard and walk-in flows
  route_slug TEXT NOT NULL DEFAULT 'open-run',-- Sanity route slug or 'open-run' for walk-ins
  charity_slug TEXT NOT NULL,                 -- Sanity CMS charity identifier
  commitment_days INTEGER NOT NULL DEFAULT 5, -- Days committed (1 to 20; 0 for walk-ins)
  target_date TEXT NOT NULL,                  -- Completion date (YYYY-MM-DD; today for walk-ins)
  target_hkd INTEGER DEFAULT 500,             -- Target fundraising goal in HKD (NULL for walk-ins)
  animal_name TEXT NOT NULL,                  -- Custom companion name chosen by runner (required)
  status TEXT NOT NULL DEFAULT 'committed',   -- 'committed', 'completed', 'walk_in'
  confirmation_email_sent_at TEXT,           -- ISO timestamp when Resend email sent (NULL if error/unsent)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. RUN_LOGS TABLE (Verified completed run telemetry for /log/:run_id)
CREATE TABLE run_logs (
  run_id TEXT PRIMARY KEY,                    -- '1200-JC' (or '1200-JC-2' for multi-runs)
  adoption_ref_id TEXT NOT NULL,              -- FK linking back to adoptions.adopter_id
  runner_name TEXT NOT NULL,                  -- Display name on certificate
  route_slug TEXT NOT NULL DEFAULT 'open-run',-- Sanity route slug or 'open-run'
  distance_km REAL NOT NULL,                  -- Total distance in km
  moving_time_seconds INTEGER NOT NULL,      -- Moving time in seconds
  elevation_gain_m INTEGER NOT NULL,          -- Total elevation gain in meters
  avg_pace_min_per_km REAL NOT NULL,          -- Pace in min/km
  fundraised_hkd INTEGER,                     -- Impact target amount in HKD (nullable for walk-ins)
  polyline_json TEXT NOT NULL,                -- Google Encoded Polyline string
  elevation_profile_json TEXT NOT NULL,       -- JSON array of [{ distance_km, elevation_m, lat, lng }]
  source TEXT NOT NULL DEFAULT 'strava_oauth',-- 'strava_oauth' or 'gpx_upload'
  strava_activity_id TEXT UNIQUE,             -- Strava activity ID (nullable)
  verified_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (adoption_ref_id) REFERENCES adoptions(adopter_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_adoptions_email ON adoptions(email);
CREATE INDEX idx_adoptions_route ON adoptions(route_slug);
CREATE INDEX idx_adoptions_status ON adoptions(status);
CREATE INDEX idx_run_logs_adoption_ref ON run_logs(adoption_ref_id);
CREATE INDEX idx_run_logs_route ON run_logs(route_slug);
```

### 4. Decoupled Donation Database Schema (Future Deployment)

```sql
-- PENDING FUTURE DEPLOYMENT (Raisely Integration)
CREATE TABLE donations (
  donation_id TEXT PRIMARY KEY,          -- Internal unique key (e.g. don_9x8f2a)
  adopter_id TEXT NOT NULL,             -- Foreign Key referencing adoptions.adopter_id
  raisely_donation_id TEXT UNIQUE,      -- Webhook idempotency key from Raisely
  donor_name TEXT DEFAULT 'Anonymous',   -- Donor display name on certificate/donor wall
  amount_cents INTEGER NOT NULL,        -- Amount in HKD cents (10000 = HK$100.00)
  currency TEXT DEFAULT 'HKD',
  message TEXT,                          -- Cheer/encouragement note for runner
  payment_method TEXT,                  -- Payment rail ('card', 'apple_pay')
  status TEXT DEFAULT 'succeeded',       -- 'succeeded', 'refunded'
  created_at TEXT NOT NULL,             -- ISO 8601 timestamp
  FOREIGN KEY (adopter_id) REFERENCES adoptions(adopter_id) ON DELETE CASCADE
);

CREATE INDEX idx_donations_adopter_created ON donations(adopter_id, created_at DESC);
```

### 5. Sanity CMS Content Schemas (3 Schemas)

1. **`route` Schema**: Includes `slug`, `district`, `animalType`, `featured`, `distanceKm`, `elevationGain`, `difficulty`, `estimatedDurationMin`, `tags`, `city`, `region`, `gpxFile`, `routePolyline`, `miniMapSvg`, `elevationProfile`, `stravaRouteUrl`, `description`, `coverImage`, `startPointDescription`, `isGroupRun`, `groupRunDateTime`, `groupRunMeetupPoint`, `groupRunNotes`.
   - *In-Browser Ingestion*: Uses custom input component `GpxUploadInput` to calculate metrics and polyline fields client-side upon GPX file upload.
2. **`charity` Schema**: Includes `name`, `slug`, `websiteUrl`, `logo`, `coverPhoto`, `charityDescription`, `causeDescription`, `impactUnitName`, `impactMultiplierPerHkd`, `impactDisplayTemplate`.
3. **`siteCopy` Schema (Singleton)**: Structured into Studio Tabs managing global announcement bars, hero copy, slogans, 3-step journey text, featured route selections, about story, FAQs, adoption flow copy, and editable community movement counters (`totalKmCovered`, `totalRunsCompleted`, `totalParticipantsCount`).

### 6. Strava OAuth & Spatial Filter Verification Rules

#### 1. Stateless Signed State Token & OAuth Callback Flow
- When initiating Strava OAuth on `/log`, an encrypted/HMAC-signed token is passed in Strava's `&state=` parameter:
  ```json
  {
    "adopter_id": "1204-JC",
    "is_walk_in": false,
    "csrf_nonce": "a8f9c2d1e04b7891",
    "exp": 1725200000
  }
  ```
- Validated on `/api/strava-callback`. Strava tokens are used ephemerally to query activities and discarded immediately (zero persistent token storage).
- The server matches activities, packages the candidate runs into a short-lived (15-min) HMAC-signed `review_token`, and redirects the runner to `/log?review_token=<token>`.
- The `/log` page decodes the `review_token` to render the Review & Confirm screen (State 3).
- When the runner clicks `[Confirm & Log This Run]`, `POST /api/confirm-run` verifies the signed token and writes the record to D1 `run_logs`.

#### 2. The 3-Layer Spatial Verification Filter (For Adopters via Strava)
- **Activity Type Filter**: Must be `Run`, `TrailRun`, `Walk`, or `Hike`. Activities without GPS streams are ignored.
- **Time Window**: Recorded within the last **20 days from current date**.
- **Distance Tolerance**: `abs(user_km - target_km) / target_km <= 0.40` (±40% of catalog route distance).
- **Start Point Proximity**: User activity start point must be within `0.40 * route.distanceKm` of the catalog start point (Haversine formula).
- **Trajectory Sampling**: Decodes Strava summary polyline and checks 10 equidistant sample points along the catalog route — at least **6 out of 10 sample points** must fall within 400m of the catalog polyline.

#### 3. Match Results & Exact Fallback Hierarchy

| Scenario | System Action & UI Behavior |
| :--- | :--- |
| **1. Single Spatial Match** | Displays 1 card with polyline minimap SVG, title, distance, pace, date, and duration with `[Confirm & Log This Run]`. |
| **2. Multiple Spatial Matches** | Displays the top 3 most recent matching runs as selectable cards for the runner to choose from. |
| **3. No Match / Unmatched Run** | A fallback button labeled *"Cannot find my run"* appears. Clicking reveals a raw table list of all run/walk activities from the past month without minimaps for manual selection. At bottom: *"Still cannot find my run. Manually upload GPX instead."* |
| **4. Zero Strava Activities Found** | If no activities exist or permissions are blocked, displays catchall banner: *"No recent run/walk activities detected on your Strava account. Check your Strava activity viewing permissions, or [Upload GPX File Instead]"*. |
| **5. Walk-In Bypass** | Walk-in runners bypass the spatial algorithm completely and default directly to displaying their 3 most recent activities to pick from, with option to reveal the full activity list. |
| **6. GPX Direct File Upload** | Independent fallback accepting `.gpx` files (max 5MB) processed server-side with spatial checks bypassed, backed by a dedicated GPX Export Guide Modal. |

### 7. Server-Side GPX Ingestion & Spatial Bypass Rules

- **Transport**: `.gpx` files uploaded via `POST /api/verify-gpx` (multipart/form-data, 5MB cap).
- **Server Execution**: Cloudflare Pages Function parses XML trackpoints, calculates distance, moving time, elevation gain, average pace, and generates the encoded polyline string + elevation sample array.
- **Spatial Bypass**: GPX uploads **bypass the spatial check completely** (for both adopted and walk-in runners). Upon parsing, the user is immediately taken to the Single Match confirmation screen (`[Confirm & Log This Run]`).

### 8. Adopter ID Generation, Walk-In Business Rules & Multi-Run Auto-Suffixing

- **Adopter ID Format**: `NNNN-CC` (e.g. `1204-JC`).
- **Sequence Generation**: `NNNN` derives from the `counters` table initialized at seed `1200`. Each new adoption executes an atomic transaction incrementing `current_val` by a random offset `floor(random() * 4) + 1` (+1 to +4) and formatting `NNNN = lpad(current_val, 4, '0')` (expanding to 5+ digits if sequence exceeds 9999).
- **Initials Rule (`CC`)**: `(firstName[0] + (lastName[0] || firstName[1] || 'A')).toUpperCase()`. Form validation enforces ASCII alphabetic characters (A-Z).
- **Walk-In Flow**: Walk-in runners complete a form (**First Name**, **Last Name**, **Email (required)**, **Charity Selection**, **Animal Companion Name**). An `adoptions` record is created upfront:
  - `status = 'walk_in'`
  - `route_slug = 'open-run'`
  - `commitment_days = 0`
  - `target_date = date('now')`
  - `target_hkd = NULL`
- **Multi-Run Auto-Suffixing**:
  - `run_logs` records are created **only after** the runner selects and confirms their specific activity.
  - Upon confirmation, the system checks whether a run log already exists where `run_id == adopter_id`.
  - If a log exists, the system **automatically assigns the next sequential suffix (`1200-JC-2`, `1200-JC-3`) without prompting**, setting `adoption_ref_id = '1200-JC'`.
- **Run Log Dynamic Routing (`/log/:run_id`)**:
  - Each `/log/:run_id` operates as an independent standalone page.
  - If `run_id` does not exist in `run_logs`, the page returns a clean 404 "Run Log Not Found".

---

## Comprehensive UI/UX Interaction Flows, States & Edge Cases

### 1. Header Navigation Bar & Announcement Ticker UX
- **Positioning**: Sticky persistent top navigation bar across all pages.
- **Top Micro-Row**:
  - Left: City selector trigger (`HKG ▼`) for future multi-city expansion.
  - Center: Clickable announcement ticker banner linking directly to the adoption portal (`/signup`) (e.g. `NEXT RUN: SAT AUG 8 @ 07:30 HKT | 12 RUNNERS JOINED`), supporting dynamic text strings up to 120 characters from Sanity CMS.
  - *Group Run Fallback*: If no upcoming group run is active (`now() > groupRunDateTime + 24h`), the ticker displays a default movement slogan configured in Sanity `siteCopy`.
- **Main Navigation Row**:
  - Left Group: Navigation links to `Routes` (`/routes`), `Charities` (`/charities`), and `About` (`/#about`).
  - Center Group: Centered **Adopt A Run** wordmark and vector brand mark.
  - Right Group: Action links to `Log a Run` (navigates to `/log`) and primary CTA button `[run with us]` (navigates to `/signup`).

### 2. Homepage Information Hierarchy & CMS Movement Counters UX (`/`)
- **Hero Section**:
  - Dynamic typography with visual artwork elements.
  - Action buttons: Primary `[RUN WITH US]` (`/signup`), secondary `[LOG A RUN]` (`/log`), `[CHARITIES]` (`/charities`), and `[ROUTES]` (`/routes`).
- **Section Sequence (01 to 07)**:
  - **01. Mission & Movement**: Slogan *"Your next run collective - Merging Community with Exercise and Art"* paired with expanding imagery boxes.
  - **02. Community Movement Counters**: Rendered from editable Sanity `siteCopy` singleton fields on an ultra-fast static SSG page: *"187 km covered across 21 runs by 33 participants and counting"*.
  - **03. 3-Step Caretaker Journey**:
    - *Step 01: Match & Commit* — "Match with an animal route, choose a charity cause to pair with, and commit."
    - *Step 02: Nurture & Grow* — "Bring your animal to life with your running steps and nurture your cause."
    - *Step 03: Forever Guardian* — "Own your success in running and impact! Hand off your run to its next caretaker."
  - **04. Featured GPS Art Routes**: Curated catalog grid highlighting featured Strava Art Routes with polyline previews, distance and elevation tags, paired charity badges, inline link `"Adopt This Route →"`, and button to view all routes.
  - **05. Partner Charities Spotlight**: Curated bold spotlight on **SPCA** with dynamic imagery, impact overview, and `"View all partner charities →"` linking to `/charities`.
  - **06. Action Banner CTA**: Movement slogan (*"Adopt the run. Complete the route. Own the impact."*) paired with primary action `[RUN WITH US]` and `"Pass the Torch"` recruitment link.
  - **07. Global Footer**: Geographic coordinates (`22.3193° N, 114.1694° E`), legal copyright, and community links.

### 3. Charity Catalog (`/charities`) UX
- **Dynamic Grid**: Standalone page rendering partner charity cards populated directly from Sanity CMS `charity` documents.
- **MVP Launch**: Launches with **SPCA** as the sole featured partner card, designed on an extensible CSS grid layout that automatically accommodates additional charity partners as they are published in Sanity CMS.
- **Card Elements**: Charity logo, cover photo, mission description, cause description, and direct link to adopt a route supporting this charity.

### 4. Route Catalog (`/routes`) Interaction & Filtering UX
- **Filter & Sort Controls**:
  - *Sort Options*: `Latest` (Default), `Longest`, `Shortest`, `Easiest`, `Hardest`.
  - *Filter Categories*:
    - Difficulty: `All`, `Beginner`, `Easy`, `Intermediate`, `Advanced`.
    - Region: `All`, `HK Island`, `Kowloon`, `MTR Accessible`.
    - Features: `Kid-friendly`, `Traffic-free`, `Trail-running`.
- **Route Cards (Closed View)**:
  - *Pinned Scheduled Group Runs*: Pinned at the top of the grid with schedule badge and runner count as long as `now() <= groupRunDateTime + 24h`. Once the 24h window expires, the route unpins and displays as a standard solo route.
  - *Regular Route Cards*: Mini-map polyline preview, distance (km), elevation gain (+m), estimated duration, feature tags, and bottom link `"Adopt This Route →"`.
- **Expanded Route Card View (Inline Grid Expansion)**:
  - Clicking any card expands it in place (spanning neighboring columns) without navigating away.
  - Interactive Leaflet map with animated pulse tracer, SVG elevation profile, suggested start point description, group run meetup point, Strava route link, direct `.gpx` file download link, and route narrative.

### 5. Adoption Portal (`/signup`) 4-Step Wizard UX
- **Stepper Navigation**: `SELECT ROUTE` ── `SELECT CHARITY` ── `ENTER DETAILS` ── `COMMIT & ADOPT`.
- **Persistent Sticky Summary Panel**:
  - Pins to viewport throughout steps 2, 3, and 4. Displays artwork name, mini-map preview, distance/elevation metrics, paired charity name, calculated target date, target impact goal, and inline step-jump links (`[Change Route]`, `[Change Charity]`).
- **Step 01 // Select Route**: Interactive grid of available Strava Art Routes. Pre-selection bypass: Arriving via `/signup?route=<slug>` skips Step 1 and lands on Step 2.
- **Step 02 // Select Charity**: Grid of partner charities. Two-step confirmation: clicking a card highlights it and displays `SUPPORT [CHARITY NAME] ↓`; clicking advances to Step 3.
- **Step 03 // Enter Details**:
  - Inputs: First Name, Last Name, Email (ASCII validation).
  - *Slider 1 (Commitment Timeframe)*: Range 1 to 20 days (Default: 5 days) with dynamic top-right date readout.
    - *Group Run Rule*: For Group Runs where `now() <= groupRunDateTime + 24h`, Slider 1 is hidden; `target_date` is set to `groupRunDateTime`.
    - *Auto-Fallback Rule*: When `now() > groupRunDateTime + 24h`, the route automatically reverts to standard individual adoption mode (revealing Slider 1).
  - *Slider 2 (Target Impact Goal)*: Range HK$100 to HK$2,000 (Default: HK$500) with dynamic charity impact equivalency readout.
- **Step 04 // Review & Naming**:
  - Displays runner details, animal companion visual, and **strictly required** Companion Name text input (*"Give your animal companion a name to commit to the adoption"*).
  - Primary CTA: Full-width `[CONFIRM & COMMIT]`.

### 6. Adoption Confirmation (`/signup/confirmed`) UX
- **Header**: `"You've committed! [Animal Name] is waiting for your adoption"`.
- **Adopter ID Banner**: Prominent visual container presenting the 6-character identifier (`Adopter ID: 1204-JC`).
- **Caretaker Journey Timeline**: Step 01 Match & Commit [COMPLETED] ── Step 02 Nurture & Grow [ACTIVE] ── Step 03 Forever Guardian.
- **Route & Meetup Card**: Map trace, elevation profile, start point description, group run schedule, and meetup point.
- **"Add to Calendar" Action**: Generates downloadable `.ics` and Google Calendar links for scheduled group runs.
- **Transactional Notice & Email Resilience**:
  - Notice: *"Confirmation sent to [email]. Keep your Adopter ID (1204-JC) safe to log your run!"*.
  - Resend email is triggered synchronously during signup. If the Resend API errors or rate-limits, the exception is caught, `confirmation_email_sent_at` remains `NULL`, and the user completes signup smoothly with their ID displayed on-screen.
- **Primary Actions**: Secondary action `[LOG YOUR RUN NOW]` (`/log`) and `"Share My Commitment"` trigger.

### 7. Dedicated Run Logging Page (`/log`)
- **Zero-Password Authentication Model**: URL-driven and Adopter ID-driven access.
- **Page States**:
  - **State 1 // Identification & Helper Flows**:
    - Mode A: Existing Adopters enter 6-character `adopter_id` (`NNNN-CC`).
    - Mode B: Walk-In Form (First Name, Last Name, Email, Charity Selection, required Animal Name) — generates upfront `adoptions` record in D1 with `commitment_days=0`, `target_date=today`, `target_hkd=NULL`.
    - *"Forgot my ID"* Recovery: Prompts for email. Calls `POST /api/recover-adopter-id`. Returns **direct feedback** (explicit `404` if not found; dispatches consolidated email and displays success notice if found; rate-limited to 3 requests / IP / 10 min).
  - **State 2 // Verification Method Selection**:
    - Primary: `[Sync with Strava]` (redirects with signed stateless `state` token).
    - Secondary: `[Upload GPX File]` (5MB file dropzone, spatial checks bypassed).
  - **State 3 // Activity Review & Confirmation Screen**:
    - Renders activity card (map trace, distance, pace, moving time, date) decoded from `review_token` with `[Confirm & Log This Run]`.
    - Confirming executes `POST /api/confirm-run`, writes the verified record to D1 `run_logs` (auto-assigning next suffix `-2`, `-3` if a run already exists), and redirects to `/log/:run_id`.
  - **GPX Helper Guide Modal**: Step-by-step export walkthrough for Garmin Connect, Apple Fitness, Coros, Suunto, and Strava Web.

### 8. Adoption Run Log & Digital Certificate (`/log/:run_id`)
- **Main Web Dashboard**:
  - Celebration Header: `"Congratulations! You have successfully adopted [Animal Name]!"`.
  - *Interactive Leaflet Map & Elevation Scrubbing Sync*: Leaflet map displaying runner's GPS polyline trace synchronized with the SVG elevation profile chart. Scrubbing/hovering over the elevation chart dynamically moves a synchronized marker along the map polyline in real time.
  - *Performance Telemetry Grid*: Distance (km), Average Pace (min/km), Moving Time (hrs:mins), Impact Goal (HKD).
  - *Metadata Block*: Run ID (`1204-JC` or `1204-JC-2`), Completion Date, Beneficiary Charity, and dynamic Impact Equivalency readout (`IMPACT EQUIVALENCY: 50 MEALS PROVIDED FOR SHELTER ANIMALS`).
  - *Walk-In Display*: Renders with a clean "Community Walk-in Run" badge.
- **Overlay Modals & Export Views**:
  - *Social Share Modal*: Triggered by `[Share Achievement]`. Displays a sleek *"Feature Coming Soon"* dialog (Canvas/OG generation deferred to Future Deployment).
  - *Printable Physical Certificate Modal*: Triggered by `[Claim Physical Certificate]`. Displays a sleek *"Feature Coming Soon"* dialog (`jsPDF` / print templates deferred to Future Deployment).
  - *"Pass the Torch" Recruitment Action*: Uses Web Share API on mobile with clipboard copy fallback, generating a clean referral link: `https://adoptarun.org/signup?route=<slug>`.

### 9. Standardized Call-to-Action (CTA) Semantic Registry

| Action Intent | Primary Label String | Semantic Role | Secondary / Sub-Options |
| :--- | :--- | :--- | :--- |
| **Primary Adoption** | `[RUN WITH US]` or `[ADOPT YOUR RUN]` | Primary Action Token | `Adopt This Route →` (inline catalog link) |
| **Run Completion** | `[LOG YOUR RUN]` | Secondary Action Token | Sub-options: `[Sync with Strava]` & `[Upload GPX File]` |
| **Certificate Actions** | `[CLAIM ADOPTION CERTIFICATE]` | Secondary Action Token | Sub-options: `[Share Achievement]` (Coming Soon), `[Claim Physical Cert]` (Coming Soon) |
| **Caretaker Recruitment** | `[PASS THE TORCH]` | Secondary Action Link | Referral link (`/signup?route=<slug>`) |
| **Final Adoption Commit** | `[CONFIRM & COMMIT]` | Primary Action Token | Step 4 wizard final commitment action |

### 10. Dynamic CMS Text Container Elasticity & Fallbacks
All UI components gracefully handle variable-length content from Sanity CMS without clipping:
- **Route Descriptions**: Flexible containers accommodating 1 to 3 paragraphs.
- **Dual Charity Text**: Distinct containers accommodating `charityDescription` (organization overview) and `causeDescription` (specific impact campaign).
- **Impact Equivalency Strings**: Dynamic interpolation templates (e.g. `Funds {count} meals for shelter animals`).
- **Announcement Ticker Banner**: Text containers supporting strings up to 120 characters with automatic slogan fallback when no group runs are active.

---

## Testing Decisions

### 1. Seams Strategy & Testing Principles

Testing is organized around **three high-level testing seams**:

```
+-----------------------------------------------------------------------+
|  SEAM 1: User-Facing Component & Flow Seam (Astro / React Islands)   |
|  - Renders catalog, adoption wizard, and certificate dashboard views  |
|  - Tests Nano Stores cross-island state reactivity and Stega cleanup  |
|  - Tests Sanity custom GpxUploadInput component parsing in-browser    |
|  - Interacts with mock D1 database bindings and mock Sanity CMS       |
+-----------------------------------------------------------------------+
                                   |
+-----------------------------------------------------------------------+
|  SEAM 2: Edge Function API Seam (`/api/*`)                           |
|  - Tests HTTP request handling, validation, D1 mutations & responses |
|  - Endpoints: /api/signup, /api/strava-callback, /api/verify-gpx,    |
|               /api/confirm-run, /api/recover-adopter-id               |
|  - Uses in-memory SQLite / D1 mock context without external R2 deps   |
+-----------------------------------------------------------------------+
                                   |
+-----------------------------------------------------------------------+
|  SEAM 3: Domain Algorithm & Parser Utility Seam                       |
|  - Shared GPX XML parser & telemetry calculations (distance/pace)     |
|  - Strava 3-layer spatial activity matcher (Haversine + sampling)     |
|  - Atomic Adopter ID generator (`NNNN-CC` seed 1200 + random offsets) |
|  - Multi-run auto-suffix generator (`1200-JC-2`)                      |
+-----------------------------------------------------------------------+
```

#### Good Test Principles
- **Test External Behavior, Not Internal Details**: Tests assert rendered DOM outputs, API responses, and database side effects — never private state variables or internal function call counts.
- **Single Ideal Integration Seam**: Primary features (adoption wizard, run verification, certificate generation) are tested at Seam 2 (API contract) and Seam 1 (React island container), avoiding unnecessary internal mock layers.

### 2. Modules to be Tested

1. **Adopter ID Generator**: Unit tests verifying seed `1200` sequence generation, atomic counter mutations, pseudo-sequential offsets (+1 to +4), ASCII initials formatting, and multi-run auto-suffixing (`1200-JC-2`).
2. **Spatial Verification Engine**: Integration tests asserting pass/fail decisions for candidate Strava activities against catalog routes under distance, radius, and 10-point trajectory constraints, as well as spatial bypass for walk-in runs and GPX uploads.
3. **Adoption API (`/api/signup`)**: API contract tests validating request payloads, D1 `adoptions` table inserts, required companion animal name validation, group run 24h auto-fallback date calculations, and Resend transactional email payload dispatching.
4. **Run Verification & Ingestion APIs (`/api/strava-callback`, `/api/verify-gpx`, `/api/confirm-run`)**: Edge function tests validating signed `state` tokens, `review_token` redirection, Strava activity matching, server-side `.gpx` XML parsing (with 5MB cap and spatial bypass), Stega string sanitization, and `run_logs` D1 database writes.
5. **ID Recovery API (`/api/recover-adopter-id`)**: API tests asserting explicit `404` on non-existent emails, consolidated multi-ID email dispatching, and IP-based rate limiting (3 requests / 10 min).
6. **In-Browser & Server GPX Parsers**: Unit tests asserting XML trackpoint parsing, distance, elevation gain, polyline encoding, and elevation profile JSON generation across Garmin, Apple Fitness, Strava, and Coros GPX files.
7. **Interactive Elevation & Map Sync Component**: Component tests verifying mouse hover events on the SVG elevation profile correctly emit coordinate locations along the Leaflet map trace.

---

## Out of Scope

- User password creation, account registration, and persistent login sessions.
- Live payment gateway execution on the main website (donation processing and Raisely integration deferred to Future Deployment).
- Background cron retry daemons for transactional emails (synchronous dispatch with graceful non-blocking error handling).
- Real-time database SSR queries for homepage movement counters (counters are managed via Sanity CMS `siteCopy`).
- Multi-run tab/switcher UI on `/log/:run_id` (each run log is an independent standalone URL; unlogged IDs return 404).
- Printable physical certificate PDF generation (`jsPDF` / print templates) — deferred to Future Deployment (displays "Feature Coming Soon" modal).
- Dynamic Open Graph social preview card generation at the edge (`/api/og/:run_id.png`) and HTML5 canvas social share card generator — deferred to Future Deployment (displays "Feature Coming Soon" modal).
- Client-side GPX parsing for run verification (run logging GPX verification is strictly executed server-side at the edge; Sanity Studio admin GPX parsing runs in-browser).
- Automated cron daemons for adoption expiration (uncompleted runs remain eligible for completion; `'expired'` status unused for MVP).
- Paid serverless database tiers or self-hosted database infrastructure (strictly free-tier Cloudflare D1 and Sanity.io).
- Native mobile iOS/Android apps (strictly responsive web application).
- Live background Strava webhook sync (activities polled on-demand during user-initiated sync).

---

## Further Notes

- **Strava Terms Compliance**: All digital and printable certificates display official "Powered by Strava" attribution per Strava API brand guidelines.
- **Sanity Studio Revisit**: As new site pages or localized content blocks are added during development, the `siteCopy` singleton schema must be expanded to maintain 100% client editability.
- **Section 88 IRD Compliance**: Donation documentation and tax receipts will be issued directly by partner non-profits under Hong Kong IRD Section 88 guidelines upon future Raisely deployment.
