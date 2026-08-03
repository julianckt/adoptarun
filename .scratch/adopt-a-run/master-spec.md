# Master Specification Sheet: Adopt A Run MVP Platform

**Status**: Ready for Agent (`ready-for-agent`)  
**Domain**: Adopt A Run (`adoptarun.hk`)  
**Version**: 1.0.0 (Master Blueprint)  
**Date**: 2026-08-03  

---

## Problem Statement

Urban runners, creative thinkers, and fitness enthusiasts in Hong Kong lack a visually inspiring, community-driven, and friction-free platform to combine physical activity (running, jogging, walking) with social impact. Traditional charity runs and event platforms are plagued by high-friction onboarding (password accounts, verification emails, lengthy registration forms), generic race-day aesthetics, and rigid ticket purchases. 

Furthermore, non-profit charities struggle to engage modern urban demographics in peer-to-peer fundraising without paying high platform fees or managing complex money-handling liabilities. Runners who complete GPS art routes lack a polished, shareable digital artifact that honors both their athletic achievement and the charitable cause they championed.

---

## Solution

**Adopt A Run** is an international GPS-art community movement debuting in Hong Kong that transforms urban running into caretaker ownership of digital artwork and non-profit causes. 

The Adopt A Run web platform provides:
1. **A Tech-Brutalist Visual Identity & Interactive Experience**: Built with Astro, React, and GSAP/ScrollTrigger, featuring 3D anamorphic typography ("RUN"), a live ASCII matrix generative dog engine, strict OKLCH color tokens, and a Dual-Row Race Control Header.
2. **A 2-Page Discovery & Adoption Portal (`/routes` + `/signup`)**: A bento-grid catalog for filtering Strava Art Routes paired with a zero-login 4-step adoption wizard where runners match with an Artwork, select a Charity Cause, set dynamic commitment and fundraising goals, name their route animal companion, and receive a persistent 6-character **Adopter ID** (`NNNN-CC`).
3. **An Ephemeral Strava OAuth & Client-Side GPX Verification Engine**: A zero-password run verification pipeline that matches completed runs using a 3-layer spatial algorithm (type, date window, ±40% distance, 40% start radius, 10-point trajectory sample) or accepts browser-parsed `.gpx` file uploads.
4. **Interactive Digital & Printable Certificate System (`/log/:adopter_id`)**: Publicly accessible run log dashboards displaying Leaflet GPX route traces synchronized with interactive elevation scrubbers, HUD telemetry, Sanity CMS impact equivalencies, 1-click social share card generators (1:1 and 9:16 PNGs), and ink-friendly print-ready physical certificates with scannable QR codes.
5. **Decoupled Edge Data Infrastructure**: Serverless execution on Cloudflare Pages & Functions, Sanity.io Headless CMS for client editing, Cloudflare D1 SQLite for adoptions and run logs, Cloudflare R2 for GPX storage, and a blueprint for Raisely P2P donations (`donate.adoptarun.hk`).

---

## User Stories

### Runner / Adopter Experience

1. As an urban runner, I want to view a visually captivating hero section with interactive 3D typography and generative ASCII matrix art, so that I immediately understand the sleek, athletic energy of the Adopt A Run movement.
2. As an urban runner, I want to use a Dual-Row Race Control header, so that I can easily navigate between routes, charities, about pages, and key action flows while staying aware of upcoming community runs and city contexts.
3. As an urban runner, I want to browse a bento wireframe catalog of Strava Art Routes (`/routes`), so that I can filter artwork by difficulty, region, distance, and features like kid-friendly or trail-running.
4. As an urban runner, I want to expand a route card inline within the bento grid, so that I can view an interactive Leaflet map, animated GPS polyline path drawing, elevation profile SVG, and start point details without losing my place.
5. As an urban runner, I want to click "Adopt This Route" on any card, so that I am seamlessly redirected to the Adoption Portal (`/signup?route=<slug>`) with my chosen route pre-loaded.
6. As an urban runner, I want to complete a 4-step zero-login adoption wizard (`/signup`), so that I can commit to a route and pair it with a beneficiary Charity Cause without creating a password or registering an account.
7. As an urban runner, I want to adjust dynamic commitment sliders for completion timeframe (1–20 days) and fundraising targets (HK$100–HK$2,000), so that I can set realistic goals aligned with real-world charity impact equivalencies.
8. As an urban runner, I want to give a custom name to my route's animal companion, so that I establish a personal bond and caretaker connection with the artwork I am running.
9. As an urban runner, I want to receive a unique 6-character Adopter ID (`NNNN-CC`, e.g., `0124-JC`) upon committing, so that I have a persistent identifier to track, share, and log my run.
10. As an urban runner, I want to receive a transactional confirmation email containing my Adopter ID and commitment details, so that I have a reference link to return to whenever I am ready to complete my run.
11. As an urban runner, I want to log my completed run via 1-click Strava OAuth, so that my activity is automatically retrieved, spatially verified against the artwork polyline, and logged without manual metric entry.
12. As an urban runner, I want to log my run by uploading a `.gpx` file if I do not use Strava, so that any GPS device or running app can be used to prove route completion.
13. As a walk-in runner who finished a route before adopting, I want to log a run directly (`/log`), so that an Adopter ID and adoption record are generated for me on the fly.
14. As a runner logging multiple runs under one Adopter ID, I want subsequent logs to automatically append sequential suffixes (`0124-JC-2`), so that all my caretaking efforts are recorded under my single profile.
15. As an urban runner, I want to access my permanent Adoption Run Log (`/log/:adopter_id`), so that I can view my map trace, scrub the elevation profile to see my position on the map, and review my performance HUD telemetry.
16. As an urban runner, I want to generate custom 1:1 and 9:16 social share cards, so that I can post my running achievement and charity impact on Instagram Stories, Strava, and Twitter.
17. As an urban runner, I want to open a print-ready physical certificate modal with a scannable QR code, so that I can print or save an official paper certificate of my route caretaking.
18. As an urban runner, I want to use a "Pass the Torch" action, so that I can invite friends or recruit the next caretaker to take over the route after I complete it.

### Donor / Supporter Experience

19. As a donor, I want to visit an Adopter's fundraising profile (`donate.adoptarun.hk/profiles/:adopter_id`), so that I can contribute funds directly to the paired charity cause in support of the runner.
20. As a donor, I want 100% of my contribution to go directly to the Section 88 tax-exempt charity via Stripe HK, so that I know my money is handling-fee-free and legally tax-deductible.
21. As a donor, I want to view live donor walls and progress cards embedded inside the runner's Adoption Run Log (`/log/:adopter_id`), so that I can see my cheer message and total funds raised.

### Content Manager / Admin Experience

22. As a non-technical client admin, I want to use a visual Sanity Studio CMS interface, so that I can easily create, update, and publish routes, charities, and homepage site copy without code edits.
23. As a client admin, I want GPX file uploads in Sanity Studio to automatically calculate distance, elevation gain, polyline strings, elevation profiles, and mini-map SVGs, so that manual data entry is eliminated.
24. As a client admin, I want to toggle featured routes and group run schedules, so that upcoming community runs are automatically highlighted across the header ticker and catalog grid.

---

## Implementation Decisions

### 1. Architectural & Technology Stack Decisions

- **Framework**: Astro (SSG/SSR) with React islands (`@astrojs/cloudflare`). Static pages rendered at build time for sub-50ms TTFB; React islands used exclusively for interactive components (hero 3D typography, Leaflet maps, adoption wizard, elevation scrubber, card generators).
- **Styling & Design System**: Vanilla CSS with strict OKLCH color tokens and Adobe Typekit fonts (`Scale VF` display, `OCR A` telemetry, `Runda` body). No Tailwind CSS.
- **Motion & Animation Engine**: GSAP + ScrollTrigger for scroll-driven theme crossfades, variable font weight/width morphing, 1px clip-path reveals, and path-drawing SVG polylines.
- **Headless CMS**: Sanity.io (`@sanity/astro`) with exactly 3 schemas (`route`, `charity`, `siteCopy`).
- **Edge Database**: Cloudflare D1 (SQLite) executing via Cloudflare Pages Functions.
- **Media & File Storage**: Cloudflare R2 bucket for direct `.gpx` file uploads.
- **Authentication**: Zero-login architecture. Public identification handled via 6-character `adopter_id` (`NNNN-CC`).

### 2. Design System & Token Allocation Rules

- **Primary Volt (`oklch(0.9 0.275 128)`)**: Strictly reserved for top-tier primary call-to-action buttons (`[RUN WITH US]`, `[ADOPT YOUR RUN]`, `[CONFIRM & COMMIT]`) and glowing map route polylines.
- **Secondary Orange (`oklch(0.66 0.215 21)`)**: Used for secondary CTAs, hover highlights, slider thumbs, progress indicators, and active selection state borders.
- **Splash Blue (`oklch(0.66 0.138 234)`)**: Used for metric readouts and data highlights.
- **Off-Black Base (`oklch(0.16 0.0075 128)`)**: Global dark canvas background.
- **Dark Green Card Fill (`oklch(0.21 0.01 128)`)**: Background fill for bento grid cards and HUD containers.
- **Wireframe Grid Token (`oklch(0.35 0.01 128)`)**: 1px exposed structural borders and divides.
- **Muted HUD Token (`oklch(0.55 0.01 128)`)**: `OCR A` telemetry text, crosshair `+` icons, grid dots, and barcodes.

### 3. Database Schema (Cloudflare D1 SQLite)

```sql
-- 1. ADOPTIONS TABLE (Runner adoption portal commitments)
CREATE TABLE adoptions (
  seq_num INTEGER PRIMARY KEY AUTOINCREMENT,  -- Starts from seed 120
  adopter_id TEXT UNIQUE NOT NULL,             -- Formatted 'NNNN-CC' (e.g. '0124-JC')
  runner_first_name TEXT NOT NULL,
  runner_last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  route_slug TEXT NOT NULL,                   -- Sanity CMS route identifier
  charity_slug TEXT NOT NULL,                 -- Sanity CMS charity identifier
  commitment_days INTEGER NOT NULL DEFAULT 5, -- Days committed (1 to 20)
  target_date TEXT NOT NULL,                  -- Calculated completion date (YYYY-MM-DD)
  target_hkd INTEGER NOT NULL DEFAULT 500,    -- Target fundraising amount in HKD
  animal_name TEXT NOT NULL,                  -- Custom animal name chosen by runner
  status TEXT NOT NULL DEFAULT 'committed',   -- 'committed', 'completed', 'walk_in', 'expired'
  confirmation_email_sent_at TEXT,           -- ISO timestamp when Resend email sent
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. RUN_LOGS TABLE (Verified completed run telemetry for /log/:adopter_id)
CREATE TABLE run_logs (
  adopter_id TEXT PRIMARY KEY,                -- '0124-JC' (or '0124-JC-2' for multi-runs)
  adoption_ref_id TEXT NOT NULL,              -- FK linking back to adoptions.adopter_id
  runner_name TEXT NOT NULL,                  -- Display name on certificate
  route_slug TEXT NOT NULL,                   -- Sanity CMS route identifier
  distance_km REAL NOT NULL,                  -- Total distance in km
  moving_time_seconds INTEGER NOT NULL,      -- Moving time in seconds
  elevation_gain_m INTEGER NOT NULL,          -- Total elevation gain in meters
  avg_pace_min_per_km REAL NOT NULL,          -- Pace in min/km
  fundraised_hkd INTEGER NOT NULL DEFAULT 0,  -- Fundraised amount for impact equivalency
  polyline_json TEXT NOT NULL,                -- Leaflet map route path string / GeoJSON
  elevation_profile_json TEXT NOT NULL,       -- Elevation profile array for chart scrub sync
  source TEXT NOT NULL DEFAULT 'strava_oauth',-- 'strava_oauth' or 'gpx_upload'
  strava_activity_id TEXT UNIQUE,             -- Strava activity ID (nullable)
  gpx_r2_url TEXT,                            -- Cloudflare R2 URL for uploaded .gpx file
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
CREATE TABLE donations (
  donation_id TEXT PRIMARY KEY,          -- Internal unique key (e.g. don_9x8f2a)
  adopter_id TEXT NOT NULL,             -- Foreign Key referencing adoptions.adopter_id
  raisely_donation_id TEXT UNIQUE,      -- Webhook idempotency key from Raisely
  donor_name TEXT DEFAULT 'Anonymous',   -- Donor display name on HUD
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
2. **`charity` Schema**: Includes `name`, `slug`, `websiteUrl`, `logo`, `coverPhoto`, `charityDescription`, `causeDescription`, `impactUnitName`, `impactMultiplierPerHkd`, `impactDisplayTemplate`.
3. **`siteCopy` Schema (Singleton)**: Structured into Studio Tabs managing global announcement bars, hero copy, slogans, 3-step journey text, featured route selections, about story, FAQs, and adoption flow copy.

### 6. Strava OAuth & Spatial Filter Verification Rules

- **OAuth Scopes**: `scope=read,activity:read_all`. Tokens used in Cloudflare Workers to fetch recent activities and discarded immediately (zero persistent token storage).
- **Spatial Matching Algorithm**:
  1. Filter activity types: `Run`, `TrailRun`, `Walk`, `Hike`.
  2. Filter activity date: Recorded within last 20 days or since `adoption.created_at`.
  3. Distance tolerance: `abs(user_km - catalog_km) / catalog_km <= 0.40`.
  4. Start radius: Start point within `0.40 * catalog_km` of catalog start point (Haversine formula).
  5. Trajectory sampling: Decode polyline and verify at least 6 of 10 equidistant sample points fall within 400m of the catalog polyline.

### 7. Adopter ID Generation & Walk-In Business Rules

- **Adopter ID Format**: `NNNN-CC` (e.g. `0124-JC`).
- `NNNN` derives from SQLite autoincrement `seq_num` initialized at seed `120` with deterministic pseudo-sequential jumping (+1 to +4) to portray an active community sequence. `CC` represents runner initials.
- **Walk-Ins**: Runners logging without prior adoption automatically create an `adoptions` record (`status='walk_in'`) and receive a fresh `adopter_id`.
- **Multi-Runs**: Subsequent runs logged under the same `adopter_id` create `run_logs` records with appended suffixes (`0124-JC-2`, `0124-JC-3`).

---

## Testing Decisions

### 1. Seams Strategy & Testing Principles

To ensure high reliability, fast execution, and zero UI fragility, testing is organized around **three high-level testing seams**:

```
+-----------------------------------------------------------------------+
|  SEAM 1: User-Facing Component & Flow Seam (Astro / React Islands)   |
|  - Renders catalog, adoption wizard, and certificate dashboard views  |
|  - Interacts with mock D1 database bindings and mock Sanity CMS       |
+-----------------------------------------------------------------------+
                                   |
+-----------------------------------------------------------------------+
|  SEAM 2: Edge Function API Seam (`/api/*`)                           |
|  - Tests HTTP request handling, validation, D1 mutations & responses |
|  - Uses in-memory SQLite / D1 mock context                            |
+-----------------------------------------------------------------------+
                                   |
+-----------------------------------------------------------------------+
|  SEAM 3: Domain Algorithm & Parser Utility Seam                       |
|  - Strava 3-layer spatial activity matcher (Haversine + sampling)     |
|  - Client-side GPX parser (@tmcw/togeojson) & telemetry calculations   |
|  - Adopter ID generator (`NNNN-CC` pseudo-sequential logic)           |
+-----------------------------------------------------------------------+
```

#### Good Test Principles
- **Test External Behavior, Not Internal Details**: Tests assert rendered DOM outputs, API responses, and database side effects — never private state variables or internal function call counts.
- **Single Ideal Integration Seam**: Primary features (adoption wizard, run verification, certificate generation) are tested at Seam 2 (API contract) and Seam 1 (React island container), avoiding unnecessary internal mock layers.

### 2. Modules to be Tested

1. **Adopter ID Generator**: Unit tests verifying seed `120` sequence generation, pseudo-sequential offsets, and initials formatting.
2. **Spatial Verification Engine**: Integration tests asserting pass/fail decisions for various Strava GPX activity polylines against catalog routes under distance, radius, and 10-point trajectory constraints.
3. **Adoption API (`/api/signup`)**: API contract tests validating request payloads, D1 `adoptions` table inserts, and Resend transactional email payload dispatching.
4. **Run Verification API (`/api/log/strava-callback` & `/api/log/gpx-upload`)**: Edge function tests validating Strava activity matching, `.gpx` file parsing, R2 upload triggers, and `run_logs` database writes.
5. **Interactive Elevation & Map Sync Component**: Component tests verifying mouse hover events on the SVG elevation profile correctly emit coordinate locations along the Leaflet map trace.

---

## Out of Scope

- User password creation, account registration, and persistent login sessions.
- Paid serverless database tiers or self-hosted database infrastructure (strictly free-tier Cloudflare D1 and Sanity.io).
- Live payment gateway execution on the main website (donation processing handled strictly via Raisely REST API v3 under `donate.adoptarun.hk`).
- Native mobile iOS/Android apps (strictly responsive web application).
- Live background Strava webhook sync (activities polled on-demand during user-initiated sync).

---

## Further Notes

- **Strava Terms Compliance**: All digital and printable certificates display official "Powered by Strava" attribution per Strava API brand guidelines.
- **Sanity Studio Revisit**: As new site pages or localized content blocks are added during development, the `siteCopy` singleton schema must be expanded to maintain 100% client editability.
- **Section 88 IRD Compliance**: Donation documentation and tax receipts are issued directly by partner non-profits under Hong Kong IRD Section 88 guidelines.
