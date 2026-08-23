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
1. **A Dynamic Visual Identity & Interactive Experience**: Built with Astro, React, and GSAP/ScrollTrigger, featuring dynamic typography, interactive route polyline animations, and a centralized responsive navigation header.
2. **A 2-Page Discovery & Adoption Portal (`/routes` + `/signup`)**: A catalog for discovering and filtering Strava Art Routes paired with a zero-login 4-step adoption wizard where runners match with an Artwork, select a Charity Cause, set dynamic commitment and fundraising goals, name their route animal companion, and receive a persistent 6-character **Adopter ID** (`NNNN-CC`).
3. **An Ephemeral Strava OAuth & Client-Side GPX Verification Engine**: A zero-password run verification pipeline that matches completed runs using a 3-layer spatial algorithm (type, date window, ±40% distance, 40% start radius, 10-point trajectory sample) or accepts browser-parsed `.gpx` file uploads.
4. **Interactive Digital & Printable Certificate System (`/log/:adopter_id`)**: Publicly accessible run log dashboards displaying Leaflet GPX route traces synchronized with interactive elevation scrubbers, verified run telemetry metrics, Sanity CMS impact equivalencies, 1-click social share card generators (1:1 and 9:16 PNGs), and print-ready physical certificates with scannable QR codes.
5. **Decoupled Edge Data Infrastructure**: Serverless execution on Cloudflare Pages & Functions, Sanity.io Headless CMS for client editing, Cloudflare D1 SQLite for adoptions and run logs, Cloudflare R2 for GPX storage, and a blueprint for Raisely P2P donations (`donate.adoptarun.hk`).

---

## User Stories

### Runner / Adopter Experience

1. As an urban runner, I want to view an engaging, interactive hero section with dynamic typography and artwork visuals, so that I immediately understand the athletic, community energy of the Adopt A Run movement.
2. As an urban runner, I want to use a persistent header navigation bar with announcement ticker and city/language controls, so that I can easily navigate between routes, charities, about pages, and key action flows while staying aware of upcoming community runs and city contexts.
3. As an urban runner, I want to browse a catalog of Strava Art Routes (`/routes`), so that I can filter artwork by difficulty, region, distance, and features like kid-friendly or trail-running.
4. As an urban runner, I want to expand a route card inline within the catalog grid, so that I can view an interactive Leaflet map, animated GPS polyline path drawing, elevation profile SVG, and start point details without losing my place.
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
15. As an urban runner, I want to access my permanent Adoption Run Log (`/log/:adopter_id`), so that I can view my map trace, scrub the elevation profile to see my position on the map, and review my performance telemetry and metrics.
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

- **Framework**: Astro (SSG/SSR) with React islands (`@astrojs/cloudflare`). Static pages rendered at build time for sub-50ms TTFB; React islands used exclusively for interactive components (hero interactive typography, Leaflet maps, adoption wizard, elevation scrubber, card generators).
- **Styling & Design System**: Vanilla CSS structured with semantic design tokens for color palettes, typographic hierarchy, spacing scales, and component variants. No Tailwind CSS.
- **Motion & Animation Engine**: GSAP + ScrollTrigger for responsive component transitions, scroll-driven triggers, and path-drawing SVG polylines.
- **Headless CMS**: Sanity.io (`@sanity/astro`) with exactly 3 schemas (`route`, `charity`, `siteCopy`).
- **Edge Database**: Cloudflare D1 (SQLite) executing via Cloudflare Pages Functions.
- **Media & File Storage**: Cloudflare R2 bucket for direct `.gpx` file uploads.
- **Authentication**: Zero-login architecture. Public identification handled via 6-character `adopter_id` (`NNNN-CC`).

### 2. Semantic Token & Component Contract

The styling layer is implemented using Vanilla CSS structured around design-agnostic semantic CSS custom properties. The design system exposes semantic tokens rather than hardcoded palette values, allowing visual themes to evolve independently from the underlying UI architecture:

- **Action Tokens (`--color-action-primary`, `--color-action-secondary`)**: High-contrast action tokens assigned to primary conversion points (`[RUN WITH US]`, `[ADOPT YOUR RUN]`, `[CONFIRM & COMMIT]`) and secondary interactive actions (`[LOG YOUR RUN]`, selection borders, slider thumbs).
- **Feedback & Accent Tokens (`--color-accent`, `--color-highlight`)**: Used for metric telemetry readouts, status tags, and route polyline highlights.
- **Surface Tokens (`--color-surface-canvas`, `--color-surface-card`, `--color-surface-overlay`)**: Hierarchical surface layers defining page background canvas, card containers, and modal dialogs.
- **Boundary & Divider Tokens (`--color-border-subtle`, `--color-border-strong`)**: Structural dividers and component borders.
- **Typography Tokens (`--font-display`, `--font-mono`, `--font-body`)**: Semantic font roles assigned across display headlines, technical telemetry data/identifiers, and narrative editorial copy.

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

### 8. Comprehensive UI/UX Interaction Flows, States & Edge Cases

#### 1. Header Navigation Bar & Announcement Ticker UX
- **Positioning**: Sticky persistent top navigation bar across all pages.
- **Top Micro-Row**:
  - Left: City selector trigger (`HKG ▼`) with dropdown interaction for future multi-city expansion.
  - Center: Clickable announcement ticker banner linking directly to the adoption portal (`/signup`) (e.g. `NEXT RUN: SAT AUG 8 @ 07:30 HKT | 12 RUNNERS JOINED`), supporting dynamic text strings up to 120 characters from Sanity CMS.
  - Right: Language selector trigger (`ENG ▼`).
- **Main Navigation Row**:
  - Left Group: Navigation links to `Routes` (`/routes`), `Charities` (`/#charities`), and `About` (`/#about`).
  - Center Group: Centered **Adopt A Run** wordmark and vector brand mark.
  - Right Group: Action links to `Donate` (`donate.adoptarun.hk`), `Log a Run` (opens run verification modal), and primary CTA button `[RUN WITH US]` (navigates to `/signup`).

#### 2. Homepage Information Hierarchy & Live Counter UX (`/`)
- **Hero Section**:
  - Dynamic typography with interactive route polyline animations / visual artwork elements.
  - Primary Hero CTAs: Primary action `[RUN WITH US]` and secondary action `[LOG YOUR RUN]`.
- **Section Sequence (01 to 08)**:
  - **01. Mission & Movement**: Monochromatic runner imagery paired with the official Adopt A Run mission statement.
  - **02. Adoption Telemetry Live Data Grid**: 4-column live metrics grid featuring real-time counters: `Runs Adopted`, `Kilometers Trekked`, `Causes Championed`, `Dollars Raised`.
  - **03. Featured GPS Art Routes**: Curated catalog grid highlighting featured Strava Art Routes with route polyline previews, distance and elevation metric tags, paired charity cause badges, and inline direct link `"Adopt This Route →"`.
  - **04. 3-Step Caretaker Journey**: 3-stage visual progression cards:
    - *Step 01: Match & Commit* — "Match with an animal route, and commit to a paired charity cause."
    - *Step 02: Nurture & Grow* — "Bring your animal to life with your running steps and fundraise to nurture your cause."
    - *Step 03: Forever Guardian* — "Own your success in running and in impact! Hand off your run to its next caretaker."
  - **05. Partner Charities Grid**: Structured charity profile cards displaying partner logos, photography, dual description text (`charityDescription` for organization background vs `causeDescription` for specific campaign impact), and dynamic impact equivalency calculations.
  - **06. Charitable Mission Story**: Editorial narrative detailing the vision of transforming GPS running into charitable caretaking.
  - **07. Action Banner CTA**: Movement slogan ("Adopt the run. Complete the route. Own the impact.") paired with primary action `[RUN WITH US]` and `"Pass the Torch"` recruitment link.
  - **08. Global Footer**: Geographic coordinates (`22.3193° N, 114.1694° E`), legal copyright, and community social links.

#### 3. Route Catalog (`/routes`) Interaction & Filtering UX
- **Filter & Sort Controls**:
  - *Sort Options*: `Latest` (Default), `Longest`, `Shortest`, `Easiest`, `Hardest`.
  - *Filter Categories*:
    - Difficulty: `All`, `Beginner`, `Easy`, `Intermediate`, `Advanced`.
    - Region: `All`, `HK Island`, `Kowloon`, `MTR Accessible`.
    - Features: `Kid-friendly`, `Traffic-free`, `Trail-running`.
- **Route Cards (Closed View)**:
  - *Pinned Scheduled Group Runs*: Pinned at the top of the grid with schedule badge and runner count (e.g. `NEXT RUN: SAT AUG 8 @ 07:30 HKT | 12 RUNNERS JOINED`).
  - *Regular Route Cards*: Mini-map polyline preview, distance (km), elevation gain (+m), estimated duration, feature tags, and bottom link `"Adopt This Route →"`.
- **Expanded Route Card View (Inline Grid Expansion)**:
  - Clicking any card expands it in place (spanning neighboring columns) without navigating away.
  - *Interactive Leaflet Map*: Vector GPS polyline rendering with animated pulse tracer.
  - *Elevation Profile*: Custom SVG area chart directly underneath the map.
  - *Route Metadata Details*: Suggested start point description (e.g. `MTR Central Exit A`), group run meetup point, external Strava route link, direct `.gpx` file download link, and route narrative description.

#### 4. Adoption Portal (`/signup`) 4-Step Wizard UX
- **Stepper Navigation**: `SELECT ROUTE` ── `SELECT CHARITY` ── `ENTER DETAILS` ── `COMMIT & ADOPT`.
- **Persistent Sticky Summary Panel**:
  - Pins to the viewport throughout steps 2, 3, and 4.
  - Displays selected artwork name, mini-map preview, distance/elevation metrics, paired charity name, calculated target date, target fundraising amount, and inline step-jump links (`[Change Route]`, `[Change Charity]`).
- **Step 01 // Select Route**:
  - Interactive grid of available Strava Art Routes.
  - *Pre-selection Bypass*: Arriving via `/signup?route=<slug>` automatically pre-selects the route and skips Step 1, landing directly on Step 2.
- **Step 02 // Select Charity**:
  - Grid of partner charities.
  - *Two-Step Confirmation Interaction*: Clicking a charity highlights the card and displays a confirmation CTA `SUPPORT [CHARITY NAME] ↓`; clicking the confirmation CTA commits the selection and advances to Step 3.
- **Step 03 // Enter Details**:
  - Input fields: First Name, Last Name, Email.
  - *Slider 1 (Commitment Timeframe)*: Range 1 to 20 days (Default: 5 days) with dynamic top-right readout showing calculated completion date (e.g. `by Fri, Aug 8`). *Conditional Rule: Hidden for Group Runs (`isGroupRun: true`) where the date/time is predetermined.*
  - *Slider 2 (Fundraising Target)*: Range HK$100 to HK$2,000 (Default: HK$500) with dynamic top-right readout calculating real-time charity impact equivalencies (e.g. `Providing 50 meals for shelter animals`).
  - *Group Run Extra*: Includes `"Share this run & invite a friend"` action link.
- **Step 04 // Review & Naming**:
  - Displays runner name and contact details.
  - Route animal companion visual graphic.
  - Companion naming text input (*"It's a match between you and your route! Give it a name, and commit to the adoption!"*).
  - Primary CTA: Full-width `[CONFIRM & COMMIT]` button.

#### 5. Adoption Confirmation (`/signup/confirmed`) UX
- **Header**: `"You've committed! [Animal Name] is waiting for your adoption"`.
- **Adopter ID Banner**: Prominent visual container presenting the 6-character identifier (`Adopter ID: 0124-JC`).
- **Caretaker Journey Timeline**: Step 01 Match & Commit [COMPLETED] ── Step 02 Nurture & Grow [ACTIVE] ── Step 03 Forever Guardian.
- **Route & Meetup Card**: Map trace, elevation profile, start point description, group run schedule, and meetup point.
- **"Add to Calendar" Action**: Generates downloadable `.ics` and Google Calendar links for scheduled group runs.
- **Transactional Notice**: *"Confirmation sent to [email]. Keep your Adopter ID (0124-JC) safe to log your run!"*.
- **Primary Actions**: Secondary action `[LOG YOUR RUN NOW]` and `"Share My Commitment"` social sharing trigger.

#### 6. "Log a Run" Modal System States, Edge Cases & Verification Engine
- **Zero-Password Authentication Model**:
  - The platform contains zero password fields, login sessions, or account registration screens.
  - Identification and access are strictly URL-driven (`/log/:adopter_id`) and Adopter ID-driven.
- **Modal System States**:
  - **State A // ID Prompt & Helper Flows**:
    - Input field for 6-character `adopter_id` (`NNNN-CC`).
    - *"Forgot my ID"* Email Helper: Prompts runner for email and triggers a Resend transactional email listing all Adopter IDs registered under that email.
    - *"I do not have an ID"* (Walk-In Flow): Expands inline inputs for First Name, Last Name, Route selection, and Charity selection. Automatically creates a new D1 adoption record (`status='walk_in'`) and generates an `adopter_id` *before* redirecting to Strava OAuth.
  - **State B // Sync Loading Feedback State**:
    - Visual loading state displaying feedback during Strava OAuth token exchange and spatial filter evaluation.
  - **State C // Spatial Match Results Screen**:
    - *Single Match*: Displays verified route preview card (map trace, distance, pace, moving time, date) with `[Confirm & Log This Run]` action.
    - *Multiple Matches*: Displays top 3 matching runs as selectable cards for the user to choose the correct activity.
    - *Fallback Link*: `"Cannot find my run"` link reveals an unfiltered list of the user's past 30 days of activities without spatial previews.
    - *Catchall Warning Banner*: Diagnostic notification displayed when no activities match (*"No recent run/walk activities detected on your Strava account. Check your Strava activity viewing permissions, or [Upload GPX File Instead]"*).
    - *Walk-In Bypass*: Walk-in runners bypass spatial filtering and are directly presented with their 3 most recent activities to select from.
  - **State D // GPX Helper Guide Modal**:
    - Step-by-step visual export guide for exporting `.gpx` files from Garmin Connect, Apple Health/Fitness, Coros, Suunto, and Strava Web.

#### 7. Adoption Run Log & Digital Certificate (`/log/:adopter_id`)
- **Main Web Dashboard**:
  - Celebration Header: `"Congratulations! You have successfully adopted [Animal Name]!"`.
  - *Interactive Leaflet Map & Elevation Scrubbing Sync*: Leaflet map displaying runner's GPS polyline trace synchronized with the SVG elevation profile chart below. Scrubbing/hovering over the elevation chart dynamically synchronizes and moves a marker along the map polyline in real time.
  - *Performance Telemetry Grid*: Distance (km), Average Pace (min/km), Moving Time (hrs:mins), Amount Fundraised (HKD).
  - *Metadata Block*: Adopter ID (`0124-JC`), Completion Date, Beneficiary Charity, and dynamic Impact Equivalency readout (`IMPACT EQUIVALENCY: 40 MEALS PROVIDED FOR SHELTER DOGS`).
  - *Multi-Run Suffix Display*: When a runner logs multiple runs under one Adopter ID, subsequent runs render with appended suffixes (`0124-JC-2`, `0124-JC-3`).
- **Overlay Modals & Export Views**:
  - *Social Share Card Generator Modal*:
    - Generates 1:1 Square (1080x1080px for Strava/Twitter) and 9:16 Vertical (1080x1920px for Instagram Stories) PNGs containing route artwork trace, run metrics, Adopter ID, and charity logo.
    - CTAs: `[Copy Image to Clipboard]` and `[Download PNG]`.
  - *Printable Physical Certificate Modal*:
    - High-contrast, print-ready layout containing official typography, Strava art polyline, performance metrics, and scannable QR Code linking back to `/log/:adopter_id`.
    - CTAs: `[Print Certificate]` and `[Download PDF]`.
  - *Embedded Peer-to-Peer Donation Widget (`donate.adoptarun.hk`)*:
    - Target vs raised HKD progress bar.
    - `"Back this Run"` CTA button redirecting to `donate.adoptarun.hk/profiles/:adopter_id`.
    - Live donor wall displaying donor names, contribution amounts, and cheer messages.
  - *"Pass the Torch" Recruitment Action*: Direct action link enabling the runner to recruit or invite the next caretaker for the route.

#### 8. Standardized Call-to-Action (CTA) Semantic Registry
Standardized action intents and labels used across all application pages:

| Action Intent | Primary Label String | Semantic Role | Secondary / Sub-Options |
| :--- | :--- | :--- | :--- |
| **Primary Adoption** | `[RUN WITH US]` or `[ADOPT YOUR RUN]` | Primary Action Token | `Adopt This Route →` (inline catalog link) |
| **Run Completion** | `[LOG YOUR RUN]` | Secondary Action Token | Sub-options: `[Sync with Strava]` & `[Upload GPX File]` |
| **Certificate Claim** | `[CLAIM ADOPTION CERTIFICATE]` | Secondary Action Token | Sub-options: `[Share Digital Cert]`, `[Share Achievement]`, `[Claim Physical Cert]` |
| **Caretaker Recruitment** | `[PASS THE TORCH]` | Secondary Action Link | Hand-off link to invite the next runner |
| **Final Adoption Commit** | `[CONFIRM & COMMIT]` | Primary Action Token | Step 4 wizard final commitment action |

#### 9. Dynamic CMS Text Container Elasticity & Fallbacks
All UI components and card containers must gracefully handle variable-length content from Sanity CMS without clipping or visual breakage:
- **Route Descriptions**: Flexible containers accommodating 1 to 3 paragraphs.
- **Dual Charity Text**: Distinct containers accommodating `charityDescription` (organization overview) and `causeDescription` (specific impact campaign).
- **Impact Equivalency Strings**: Dynamic interpolation templates (e.g. `Funds {count} meals for shelter animals`).
- **Announcement Ticker Banner**: Text containers supporting strings up to 120 characters.

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
