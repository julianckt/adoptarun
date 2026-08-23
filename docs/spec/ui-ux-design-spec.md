# Adopt A Run — Comprehensive UI/UX Design Specification & Designer Handoff Guide

**Target Audience**: Web Designers & UI/UX Designers (Figma, Penpot, Sketch, Adobe XD)  
**Project**: Adopt A Run (`adoptarun.hk`)  
**Document Version**: 1.1.0 (Audited Master Handoff)  
**Date**: 2026-08-04  

---

## 1. Executive Summary & Brand Definition

**Adopt A Run** is an international GPS-art community movement debuting in Hong Kong. It brings people together through long-distance running, jogging, or walking and community art to champion a kinder city and support charitable causes.

### Design Aesthetic: Tech-Brutalism (Tactical / Editorial Brutalism)
The UI blends **high-fashion editorial typography** with **data-dense technical HUD aesthetics** (sportswear branding, telemetry dashboards, flight instruments).

#### Core Visual Identifiers & Rigid Design Rules
- **Zero Roundness**: All cards, buttons, badges, input fields, and modal containers have **0px border-radius** (sharp right-angled corners).
- **Exposed 1px Rigid Wireframe Grids**: Dark green surfaces encased in 1px structural grid lines (`oklch(0.35 0.01 128)`).
- **Extreme Scale Contrast**: Massive `Scale VF` headlines juxtaposed with tiny monospaced `OCR A` technical microcopy.
- **Tactical Indicators**: Corner `+` crosshair lock-on icons, `::` dot matrix dividers, barcodes, and section index counters (`01`, `02`, `03`).
- **High-Contrast Photography**: Monochromatic, gritty urban running imagery overlaid with dark wireframe grid lines.

---

## 2. Strict Color System (OKLCH Tokens & Usage Rules)

Designers MUST define and apply these exact OKLCH tokens in design software component libraries:

| Token Name | OKLCH Code | Approx HEX | UI Allocation & Strict Usage Rules |
| :--- | :--- | :--- | :--- |
| **Primary Volt** | `oklch(0.9 0.275 128)` | `#ccff00` | **RESERVED EXCLUSIVELY** for top-tier primary CTA buttons (`[RUN WITH US]`, `[ADOPT YOUR RUN]`, `[CONFIRM & COMMIT]`), glowing GPS artwork polylines, and active group run borders. Do NOT use for secondary buttons. |
| **Secondary Orange** | `oklch(0.66 0.215 21)` | `#ff4500` | Used for secondary action buttons (`[LOG YOUR RUN]`), hover highlights, slider thumbs, selection borders, active step indicators, and crosshair hover spins. |
| **Secondary Bright Orange** | `oklch(0.66 0.275 21)` | `#ff5500` | Used for active selection card fills and high-contrast hover focus states. |
| **Splash Blue** | `oklch(0.66 0.138 234)` | `#00aaff` | Used for metric telemetry readouts, data highlights, and performance badges. |
| **Off-Black Base** | `oklch(0.16 0.0075 128)` | `#121412` | Global dark background canvas for the website. |
| **Dark Green Card Fill** | `oklch(0.21 0.01 128)` | `#1a1f1a` | Background surface color for bento grid cards, HUD containers, and modal dialogs. |
| **White Text** | `oklch(0.973 0.006 128)` | `#f5f7f5` | Primary body text and high-contrast section titles. |
| **Wireframe Grid Token** | `oklch(0.35 0.01 128)` | `#384038` | Exposed 1px structural grid borders and container divides. |
| **Muted HUD Token** | `oklch(0.55 0.01 128)` | `#6e7b6e` | `OCR A` coordinates, `+` crosshairs, grid dots, barcodes, and inactive labels. |

---

## 3. Typography Hierarchy (Adobe Typekit)

Design files must use the exact font stack available via Adobe Typekit (`https://use.typekit.net/snp5gkf.css`):

1. **Display & Headlines (`Scale VF`)**
   - Font Family: `'scale-variable', sans-serif`
   - Usage: Main section headlines, Hero typography, primary CTA labels, and main menu items.
   - Variable Font Properties: Weight (`wght` 500 to 900) and Width (`wdth` 70 to 110).
2. **Telemetry & Technical Microcopy (`OCR A`)**
   - Font Family: `'ocr-a-std', 'ocr-a', monospace`
   - Usage: Race control top bar, telemetry tags, distance/elevation metrics, step indicators, Adopter IDs (`NNNN-CC`), coordinates, barcodes, and section index numbers (`01`, `02`).
3. **Body & Narrative Copy (`Runda`)**
   - Font Family: `'runda', sans-serif`
   - Usage: Editorial story paragraphs, charity cause descriptions, form labels, tooltips, and FAQ answers.

---

## 4. Logo, Branding Marks & Vector Polylines

- **Brand Mark**: A continuous single-line GPS vector of a **Roadrunner bird** glowing in Primary Volt (`oklch(0.9 0.275 128)`).
- **Wordmark**: **"ADOPT A RUN"** set in **Scale VF** in Volt or White.
- **GPS Art Polylines**: Glowing Neon Volt vector stroke (`#ccff00`) rendered over dark map tiles (`CartoDB.DarkMatter`). Includes a **Live Pulse Tracer** (glowing animated dot moving along the polyline path when entering viewport).

---

## 5. Standardized Call-to-Action (CTA) Button Registry

Designers must use these exact labels and visual treatments across all pages:

| CTA Intent | Primary Label String | Visual Button Style | Secondary / Sub-Options |
| :--- | :--- | :--- | :--- |
| **Primary Adoption** | `[RUN WITH US]` or `[ADOPT YOUR RUN]` | Primary Volt fill (`oklch(0.9 0.275 128)`), black `Scale VF` text, 0px border-radius. | `Adopt This Route →` (Volt text link with underline) |
| **Run Completion** | `[LOG YOUR RUN]` | Secondary Orange border/fill (`oklch(0.66 0.215 21)`), white text. | Sub-options: `[Sync with Strava]` & `[Upload GPX File]` |
| **Certificate Claim** | `[CLAIM ADOPTION CERTIFICATE]` | Secondary Orange border, monospaced `OCR A` text. | Sub-options: `[Share Digital Cert]`, `[Share Achievement]`, `[Claim Physical Cert]` |
| **Caretaker Recruitment** | `[PASS THE TORCH]` | Monospaced `OCR A` link with Orange hover underline. | Hand-off link to invite the next runner |
| **Final Adoption Commit** | `[CONFIRM & COMMIT]` | Primary Volt fill, black text, full container width. | Step 4 final commitment action |

---

## 6. Micro-Animation & Interaction Dictionary

Design prototypes and interactive specs must incorporate these 5 motion behaviors:

1. **3D Ground Perspective Pop-Out**: Hero headline "RUN" is pitched in 3D ground perspective (`rotateX(68deg)`). Hovering pops typography flat into 2D plane (`rotateX(0deg)`) while expanding font weight (`wght` 500 → 850).
2. **Hero Vector Dog Release**: A continuous-line vector dog sits in the middle of "RUN". Hovering over "RUN" animates the dog running off-screen, symbolizing its release into the wild.
3. **Corner Crosshair Lock-On Spin**: Corner `+` crosshairs rotate 90° and illuminate in Secondary Orange on card hover.
4. **Strikethrough Slide Hover**: Hovering monospaced `OCR A` feature tags triggers a 1px Orange wireframe strikethrough line sliding horizontally across the text.
5. **Digit Matrix Scramble**: Numbers in telemetry counters rapidly flicker through random digits for 200ms before locking onto target metrics.

---

## 7. Comprehensive Page-by-Page Layout Specifications

### Page 1: Homepage (`/`)

#### 1. Dual-Row Race Control Navigation Header (Sticky Top)
- **Top Micro-Row (`OCR A` font, 12px)**:
  - Left: `HKG ▼` (City selector trigger for future multi-city expansion).
  - Center: `NEXT RUN: SAT AUG 8 @ 07:30 HKT | 12 RUNNERS JOINED` (Clickable ticker banner linking to `/signup`).
  - Right: `ENG ▼` (Language selector).
- **Main Nav Row (`Scale VF` font, 18px)**:
  - Left Group: `Routes`, `Charities`, `About`.
  - Center Group: Centered **ADOPT A RUN** Wordmark + Glowing Volt Roadrunner Logo.
  - Right Group: `Donate`, `Log a Run`, and Primary CTA button `[RUN WITH US]` (Primary Volt fill, black text).

#### 2. Hero Section (100vh Viewport)
- **Hero Canvas**: Pure white stark background (`oklch(0.98 0 0)`) with off-black typography (`oklch(0.16 0.0075 128)`).
- **3D Ground Anamorphic Headline**: Centered **"RUN"** in `Scale VF`. Vector dog in middle runs off-screen on hover while typography pops flat.
- **ASCII Generative Matrix Dog Engine**: HTML5 Canvas 2D behind "RUN" rendering a running dog silhouette made of ASCII characters (`☉`, `O`, `■`, `X`, `+`, `::`, `.`).
- **Hero CTAs**: `[RUN WITH US]` (Volt button) + `[LOG YOUR RUN]` (Orange outline button).
- **Scroll Theme Crossfade**: Scrolling out of the 100vh Hero smoothly transitions background color into Off-Black (`oklch(0.16 0.0075 128)`).

#### 3. Section Sequence (01 to 08)
- **01. Mission & Movement**: Monochromatic runner photography overlaid with exposed 1px grid lines and `Scale VF` statement: *"By bringing people together through long-distance running and community art..."*.
- **02. Adoption Telemetry Data Grid**: 4-column HUD grid featuring live counters: `__ Runs Adopted`, `__ Kilometers Trekked`, `__ Causes Championed`, `__ Dollars Raised`.
- **03. Featured GPS Art Routes**: Bento grid displaying Strava Art Routes with glowing Volt polylines, dark green card fills (`oklch(0.21 0.01 128)`), `OCR A` distance/elevation tags, and Charity Cause badges.
- **04. 3-Step Caretaker Journey**: 3-card horizontal layout:
  - `Step 01: Match & Commit` — *"Match with an animal route, and commit to a paired charity cause."*
  - `Step 02: Nurture & Grow` — *"Bring your animal to life with your running steps and fundraise to nurture your cause."*
  - `Step 03: Forever Guardian` — *"Own your success in running and in impact! Hand off your run to its next caretaker."*
- **05. Partner Charities Grid**: Bento cards showing charity logos, photos, dual descriptions, and impact equivalency formulas.
- **06. Charitable Mission Story**: Full-bleed editorial section on running for social impact.
- **07. Action Banner CTA**: Slogan *"Adopt the run. Complete the route. Own the impact."* + Volt `[RUN WITH US]` button + `[PASS THE TORCH]` recruitment link.
- **08. Race Control Footer**: Monospaced `OCR A` telemetry, coordinates (`22.3193° N, 114.1694° E`), copyright, and social links.

---

### Page 2: Run Catalog (`/routes`)

#### 1. Filter & Sort Bar
- **Sort Options**: `Latest` (Default), `Longest`, `Shortest`, `Easiest`, `Hardest`.
- **Filters**: Difficulty (`All`, `Beginner`, `Easy`, `Intermediate`, `Advanced`), Region (`All`, `HK Island`, `Kowloon`, `MTR Accessible`), Features (`Kid-friendly`, `Traffic-free`, `Trail-running`).

#### 2. Bento Grid Cards (Closed View)
- **Pinned Scheduled Group Runs**: Top grid cards highlighted with a **Volt border** (`oklch(0.9 0.275 128)`) and badge: `NEXT RUN: SAT AUG 8 @ 07:30 HKT | 12 RUNNERS JOINED`.
- **Regular Route Cards**: Dark green fill (`oklch(0.21 0.01 128)`), 1px grid border, SVG mini-map polyline preview, `OCR A` distance (km), elevation gain (+m), estimated duration, tags, and bottom Volt link: `"Adopt This Route →"`.

#### 3. Expanded Bento Card View (Inline Grid Expansion)
- Clicking a card expands it in place (spanning neighboring grid columns).
- **Interactive Leaflet Map**: Dark raster map tiles (`CartoDB.DarkMatter`) with glowing Volt GPS polyline.
- **Elevation Profile**: Custom SVG area chart underneath map with Volt gradient fill.
- **Details**: Suggested start point (e.g. `MTR Central Exit A`), group run meetup point, Strava route link, GPX download link, and short route description.

---

### Page 3: Adoption Portal (`/signup`)

#### 1. Visual Environment
- **Watermark Background**: Oversized muted typography reading **`ADOPTION PORTAL`** behind main cards.
- **Top Stepper Bar (`OCR A` font)**: `SELECT ROUTE` ── `SELECT CHARITY` ── `ENTER DETAILS` ── `COMMIT & ADOPT`.
- **Sticky Summary Panel (Right Drawer)**: Pins to right side throughout steps 2, 3, and 4. Displays selected route name, mini-map preview, distance/elevation, paired charity, commitment date, target fundraising amount, `[Change Route]`, and `[Change Charity]` action text.

#### 2. Adoption Steps Flow
- **Step 01 // Select Route**: Bento grid of featured routes. Arriving via `/signup?route=<slug>` automatically skips Step 1 and lands on Step 2.
- **Step 02 // Select Charity**: Grid of partner charities. 
  - *Interaction*: 1st click highlights card in solid Orange and reveals bottom CTA `SUPPORT [CHARITY NAME] ↓`. 2nd click on CTA confirms selection.
- **Step 03 // Enter Details**:
  - Form fields: First Name, Last Name, Email.
  - **Slider 1 (Commitment Timeframe)**: Range 1 to 20 days (Default: 5 days). Dynamic top-right readout showing calculated completion date (e.g. `by Fri, Aug 8`). *(Hidden for Group Runs)*.
  - **Slider 2 (Fundraising Target)**: Range HK$100 to HK$2,000 (Default: HK$500). Dynamic top-right readout showing charity impact equivalency (e.g. `Providing 50 meals for shelter animals`).
  - **Group Run Extra**: Link `"Share this run & invite a friend"`.
- **Step 04 // Review & Naming**:
  - Displays runner name & email.
  - ASCII matrix art of route animal.
  - Text input to name route animal (*"It's a match between you and your route! Give it a name, and commit to the adoption!"*).
  - Primary CTA: Volt `[CONFIRM & COMMIT]` button.

---

### Page 4: Adoption Confirmation (`/signup/confirmed`)

- **Header**: `"You've committed! [Animal Name] is waiting for your adoption"`.
- **Adopter ID Banner**: Prominent display of 6-character ID (`Adopter ID: 0124-JC`).
- **Caretaker Journey Timeline**: Step 01 Match & Commit [COMPLETED] ── Step 02 Nurture & Grow [ACTIVE] ── Step 03 Forever Guardian.
- **Route & Meetup Card**: Leaflet map trace, elevation profile, start point description, group run date/time/meetup point + `"Add to Calendar"` link.
- **Email Notice**: *"Confirmation sent to [email]. Keep your Adopter ID (0124-JC) safe to log your run!"*.
- **CTAs**: `[LOG YOUR RUN NOW]` (Orange button) + `[SHARE MY COMMITMENT]` link.

---

### Page 5: Adoption Run Log & Digital Certificate (`/log/:adopter_id`)

#### 1. Main Web Dashboard
- **Header**: `"Congratulations! You have successfully adopted [Animal Name]!"` in large editorial `Scale VF`.
- **Interactive Leaflet Map & Elevation Sync**:
  - Leaflet map displaying runner's GPS polyline trace.
  - SVG elevation profile chart directly below map.
  - **Scrubbing Sync**: Moving mouse across elevation profile dynamically updates a glowing pulse marker along the map polyline in real-time.
- **HUD Telemetry Grid**: Distance (km), Average Pace (min/km), Moving Time (hrs:mins), Amount Fundraised (HKD).
- **OCR A Metadata Block**: Adopter ID (`0124-JC`), Completion Date, Beneficiary Charity, Impact Equivalency readout (`IMPACT EQUIVALENCY: 40 MEALS PROVIDED FOR SHELTER DOGS`).

#### 2. Overlay Modals & Export Views
- **Social Share Card Generator Modal**:
  - Formats: 1:1 Square (1080x1080px for Strava/Twitter) and 9:16 Vertical (1080x1920px for IG Stories).
  - Dark Tech-Brutalist card layout with artwork polyline, stats, Adopter ID, and charity logo.
  - CTAs: `[Copy Image to Clipboard]` + `[Download PNG]`.
- **Printable Physical Certificate Modal**:
  - High-contrast, ink-friendly light layout (white background, black lines, Volt accents).
  - Official certificate typography, Strava art polyline, performance telemetry, and scannable QR Code linking back to `/log/:adopter_id`.
  - CTAs: `[Print Certificate]` + `[Download PDF]`. *(Note: Future option to toggle a Framed Race Bib theme)*.

---

## 8. Complete Mapping of Backend Interactions, Fallbacks & UX States

Designers MUST create UI mockups for all 6 backend interaction categories below:

### 1. Adopter ID Schema (`NNNN-CC`) & Multi-Run Suffixes
- **Base Format**: `NNNN-CC` (e.g. `0124-JC`), where `NNNN` represents 4-digit autoincrement sequence starting at seed `0120` with pseudo-sequential jumps, and `CC` represents runner initials.
- **Multi-Run Suffixes**: When a runner completes subsequent runs under the same Adopter ID, the UI must render appended suffixes: `0124-JC-2`, `0124-JC-3`.

### 2. Zero-Password Authentication Model
- **No Login Screens**: The UI must **NEVER** contain login tabs, password input fields, "Forgot Password" links, or account registration forms.
- **URL-Based Access**: Access to adoption commitments and run logs is 100% link-driven (`/log/:adopter_id` and Resend transactional email links).

### 3. Strava OAuth & GPX Verification Modal (4 System States)
The "Log A Run" flow must include UI screens for these 4 system states:
- **State A // ID Prompt Modal**: Input box for `adopter_id` with 2 helper links:
  - `"Forgot my ID"`: Opens modal asking for email; triggers Resend email listing all past IDs registered under that email.
  - `"I do not have an ID"` (Walk-in Flow): Expands inline fields for First Name, Last Name, Route, Charity. Generates a fresh `adopter_id` (`status='walk_in'`) in D1 *before* redirecting to Strava.
- **State B // Sync Loading Screen**: Dark editorial screen displaying `"LOADING YOUR RUN"` with a 1.2s pulsing telemetry animation for Strava callbacks and GPX uploads.
- **State C // Spatial Match Results Screen**:
  - *Single Match*: Card with polyline minimap SVG, distance, pace, duration, date + `[Confirm & Log This Run]` button.
  - *Multiple Matches*: Top 3 matching runs displayed as selectable cards.
  - *Fallback Link*: `"Cannot find my run"` displaying raw activity list from past month without minimaps.
  - *Catchall Warning Banner*: *"No recent run/walk activities detected on your Strava account. Check your Strava activity viewing permissions, or [Upload GPX File Instead]"*.
  - *Walk-In Bypass*: Walk-in runners bypass spatial filtering and directly see their 3 most recent activities.
- **State D // GPX Upload Helper Modal**: Visual guide step-by-step instructions for exporting `.gpx` files from Strava Web, Garmin Connect, Apple Health, Coros, and Suunto.

### 4. Dynamic Sanity CMS Text Container Flexibility
Components must gracefully format variable-length CMS data:
- Route descriptions (1 to 3 paragraphs).
- Dual charity text: `charityDescription` (organization overview) vs `causeDescription` (specific impact campaign).
- Impact equivalency strings (e.g. `Funds {count} meals for shelter animals`).
- Header announcement ticker text (up to 120 characters).

### 5. Embedded Peer-to-Peer Donation HUD Widget (`donate.adoptarun.hk`)
The Run Log dashboard (`/log/:adopter_id`) must include a dedicated **Donation HUD Widget**:
- Target vs raised HKD progress bar.
- `"Back this Run"` CTA button redirecting to `donate.adoptarun.hk/profiles/:adopter_id`.
- Live donor wall displaying donor names, contribution amounts, and cheer messages.

---

## 9. Comprehensive Designer Handoff Checklist

Before handing off Figma/Penpot design files to development, verify that:

- [ ] All primary CTA buttons (`[RUN WITH US]`, `[ADOPT YOUR RUN]`, `[CONFIRM & COMMIT]`) use **Primary Volt** (`oklch(0.9 0.275 128)`).
- [ ] All containers and modals have **0px border-radius** and exposed **1px wireframe grid lines**.
- [ ] Typography uses `Scale VF` for headlines/CTAs, `OCR A` for telemetry/IDs, and `Runda` for body copy.
- [ ] The hero section includes 3D ground typography, ASCII matrix dog canvas, and dog hover release interaction notes.
- [ ] Micro-animations are documented: corner crosshair 90° spin, strikethrough slide on tag hover, digit matrix scramble.
- [ ] The Run Catalog includes both closed bento views and expanded inline card views (Leaflet map + SVG elevation profile).
- [ ] The Adoption Portal includes the sticky summary panel throughout steps 2, 3, and 4.
- [ ] Adopter IDs show `NNNN-CC` formatting (e.g., `0124-JC`) and multi-run suffixes (`0124-JC-2`).
- [ ] The Strava OAuth flow includes all 4 system states (ID prompt, walk-in form, loading screen, single/multi match results, catchall warning, GPX guide).
- [ ] Digital Certificate includes map scrub-sync, 1:1 and 9:16 social share card overlays, and printable light certificate overlays with QR code.
- [ ] No login forms, password fields, or account creation tabs exist anywhere in the design.
