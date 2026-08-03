# Sanity CMS Content Schema

Status: resolved  
Type: task  

## Question

What exact document types, field structures, and schemas do we need in Sanity.io for non-technical client editing?

## Answer

### 1. Architecture Overview: Exactly 3 Core Schemas
We consolidate all CMS and marketing content into **exactly 3 schemas**:

1. **`route`**: Document collection for adoptable routes (telemetry, GPX file, auto-generated mini-map SVG, auto-derived elevation profile, tags, and group run settings).
2. **`charity`**: Document collection for beneficiary charities (logos, dual descriptions for charity vs cause, and impact equivalency formulas).
3. **`siteCopy`**: Singleton document (organized into Sanity Studio Field Groups/Tabs) managing all editable site copy, hero headlines, 3-step journey labels, about section, FAQs, announcement bar, and social links.

> [!IMPORTANT]
> **Implementation Note**: We MUST revisit the `siteCopy` schema in Sanity.io down the line as we build and flush out additional pages to ensure every new UI text block and copy field is added for client editing.

---

### 2. Detailed Schema Specifications

#### A. `route` Schema
- **Identity Metadata**:
  - `slug`: Slug (auto-generated from `district` + `animalType` + auto-incrementing `number` if duplicates exist, e.g. `wan-chai-dog-run-01`).
  - `district`: String (e.g. `"Wan Chai"`, `"Central"`, `"The Peak"`).
  - `animalType`: String select (`dog`, `cat`, `rabbit`, `other` — selects ASCII matrix artwork).
  - `featured`: Boolean (toggles feature placement on Homepage and Step 1 of Adoption Wizard ONLY; does not alter `/routes` catalog page sorting).
- **Route Telemetry**:
  - `distanceKm`: Number float (**auto-populated from GPX**).
  - `elevationGain`: Number int in meters (**auto-populated from GPX**).
  - `difficulty`: String select (`beginner`, `easy`, `intermediate`, `advanced`).
  - `estimatedDurationMin`: Number int (**auto-calculated** from formula: `distanceKm` × `difficulty_pace_multiplier` + `elevation_time_penalty`).
  - `tags`: Array of strings (tag-picker & custom tag creation, e.g. `kid-friendly`, `traffic-free`, `trail-running`, `stairs`).
- **Geospatial Data**:
  - `city`: String (e.g. `"Hong Kong"`).
  - `region`: String select (`hk_island`, `kowloon`, `new_territories`).
  - `gpxFile`: File upload (raw `.gpx` uploaded by admin).
  - `routePolyline`: Text (**auto-populated from GPX**).
  - `miniMapSvg`: Text (**auto-populated from GPX** for instant bento card preview).
  - `elevationProfile`: Array of numbers (**auto-populated from GPX** for SVG area chart).
  - `stravaRouteUrl`: URL (optional external link).
- **Rich Content**:
  - `description`: Portable Text (rich editorial text overview).
  - `coverImage`: Image (with hotspot/crop enabled + `alt` text).
  - `startPointDescription`: String (e.g. `"MTR Central Exit A, near fountain"`).
- **Scheduled Group Run**:
  - `isGroupRun`: Boolean toggle.
  - `groupRunDateTime`: Datetime picker.
  - `groupRunMeetupPoint`: String.
  - `groupRunNotes`: Text / String (extra group run notes, e.g. `"Pace: 6:30 min/km. Post-run coffee at Brew Co."`).

*Note on Route Availability*: Routes do **not** have a `status` field. All routes remain available at all times for adoption by multiple runners.

---

#### B. `charity` Schema
- **Identity**:
  - `name`: String (e.g. `"Hong Kong Dog Rescue"`).
  - `slug`: Slug (auto-generated from `name`).
  - `websiteUrl`: URL (link to official charity site).
- **Media Assets**:
  - `logo`: Image (transparent background PNG).
  - `coverPhoto`: Image (card background/banner photo).
- **Dual Descriptions**:
  - `charityDescription`: String / short text (describing the organization, e.g. `"SPCA supports animals in need across HK"`).
  - `causeDescription`: String / short text (describing the specific cause, e.g. `"Raising funds to purchase essential medical supplies for shelter dogs"`).
- **Impact Calculation Parameters**:
  - `impactUnitName`: String (e.g. `"Meals Provided"`).
  - `impactMultiplierPerHkd`: Number float (e.g. `0.1`).
  - `impactDisplayTemplate`: String (e.g. `"Funds {count} meals for shelter animals"`).

---

#### C. `siteCopy` Schema (Singleton with Studio Tabs)
- **Tab 1: Global & Header**:
  - `announcementActive`: Boolean toggle.
  - `announcementText`: String (e.g. `"ADOPT A RUN MVP LIVE — HKG CHAPTER | SATURDAY GROUP RUN SIGNUPS OPEN"`).
  - `announcementLink`: String / URL.
  - `instagramUrl`, `stravaClubUrl`, `contactEmail`, `copyrightText`.
- **Tab 2: Homepage Copy**:
  - `heroPrimaryHeadline`, `heroSubtitle`, `heroCtaText`.
  - `slogans` array.
  - **3-Step Runner Journey Section Copy** (Step 1, Step 2, Step 3 labels & subtitles).
  - `featuredRoutes`: Array of references to `route` documents.
- **Tab 3: About Page & FAQs**:
  - Mission editorial paragraph / story.
  - `faqItems`: Array of objects (`question` string + `answer` Portable Text).
- **Tab 4: Adoption Flow Copy**:
  - Helper text for `/signup` steps 1-4 and `/log` digital certificate header templates.

---

### 3. GPX Auto-Processing & Cloudflare Storage Strategy

1. **Admin GPX Upload in Sanity Studio**:
   - Client-side JS parser in Sanity Studio extracts `distanceKm`, `elevationGain`, `routePolyline`, `elevationProfile`, and generates a normalized `miniMapSvg` `<path d="..." />` string automatically upon file drop.
2. **Strava API Compliance & 7-Day Cloudflare KV Cache**:
   - Store Strava access tokens and activity IDs in Cloudflare D1 permanently.
   - Cache Strava activity polyline, pace, and calculated telemetry in **Cloudflare KV** with a 7-day TTL (`604800`s). Serves requests in **< 20ms** while complying strictly with Strava API rules.
3. **Direct User GPX Uploads**:
   - Stored in **Cloudflare R2** bucket permanently. Derived metrics stored in **Cloudflare D1** (`certificates` table).
4. **Dynamic Data Separation**:
   - Group Run static schedule is in Sanity (`route`), while live runner signup count (`"12 runners joined"`) is queried dynamically from **Cloudflare D1**.
   - Impact formulas are stored in Sanity (`charity`), while individual donation target inputs live in **Cloudflare D1**.

