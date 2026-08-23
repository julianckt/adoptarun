# Strava OAuth & GPX Parser Technical Spec

Status: resolved  
Type: research  

## Question

How will the ephemeral Strava OAuth redirect flow, client-side GPX parser, and digital certificate export pipeline be structured in Astro & Cloudflare Functions?

## Resolution & Detailed Technical Specifications

### 1. Strava OAuth Redirect & State Parameter Architecture
- **OAuth Scopes**: Request `scope=read,activity:read_all` to access both public and private activities for distance matching.
- **State Parameter Binding**:
  - Always uses `adopter_id` in the `state` field (`state=0124-JC`).
  - **Log A Run Modal/Page UI**:
    - Input box to enter `adopter_id` before syncing with Strava.
    - Helper button 1: **"Forgot my ID"** — prompts for user's email and sends a Resend email listing all past `adopter_id`s registered under that email.
    - Helper button 2: **"I do not have an ID"** — expands inline fields for First Name, Last Name, Route selection, and Charity selection. Generates a fresh `adopter_id` in D1 (`adoptions` table with `status='walk_in'`) *before* initiating Strava OAuth redirect.
- **Token Discarding**: Short-lived Strava access tokens are used in Cloudflare Workers to fetch recent activities and discarded immediately. No user passwords or long-lived refresh tokens are stored.

---

### 2. Automatic Activity Selection & 3-Layer Spatial Filter
- **Activity Types**: Filter for `Run`, `TrailRun`, `Walk`, or `Hike`.
- **Time Window**: Activities recorded within the last 20 days OR since `adoption.created_at`, whichever is longer.
- **Distance Tolerance**: ±40% of catalogued route distance (`abs(user_km - target_km) / target_km <= 0.40`).
- **Start Point Radius**: User activity start point must be within `0.40 * route.distanceKm` of the catalogued route start point (via Haversine formula).
- **Trajectory Sampling Check**: Decode summary polyline, check 10 equidistant sample points along catalogued route — at least 6 out of 10 sample points on user's run must be within 400m of the catalogued route polyline. (No Strava title checks).
- **Filter Results Screen & UI Workflow**:
  - **Single Match**: Display 1 card with polyline minimap SVG, title, distance, pace, date, and duration. Text: `"Log this run"`, Button: `[Confirm]`.
  - **Multiple Matches**: Display top 3 most recent matching runs as cards. User selects the correct run.
  - **Fallback Button**: `"Cannot find my run"`. Displays all run/walk activities from past month as a row/table view without minimaps.
  - **Catchall Fallback Message**: *"No recent run/walk activities detected on your Strava account. Check your Strava activity viewing permissions, or [Upload GPX File Instead]"*.
  - **Walk-In Bypass**: Walk-ins or missing adoption records bypass the filtering sequence completely and default directly to displaying the 3 most recent activities.
- **Dark Editorial Loading Screen**: Displays `"LOADING YOUR RUN"` dark editorial screen (~1.2s minimum) for both Strava callback redirects and direct GPX file uploads.

---

### 3. Client-side GPX XML Parser & Upload Pipeline
- **Browser Parser**: `@tmcw/togeojson` + native browser `DOMParser`.
- **No Distance Guardrail**: Whatever `.gpx` file the user uploads is accepted as-is without distance restrictions.
- **Backend Storage Endpoint (`POST /api/log/gpx-upload`)**: Saves raw `.gpx` file payload to Cloudflare R2 bucket (`gpx_r2_url`) and writes parsed telemetry/GeoJSON to D1 `run_logs`.
- **Dedicated GPX Export Guide Page/Modal**: Dedicated helper modal featuring visual step-by-step instructions for downloading `.gpx` files from Strava Web, Garmin Connect, Apple Health/Fitness, and Coros/Suunto.

---

### 4. Digital & Printable Certificate Export Pipeline
- **Social Share Card Generator**: Client-side `html-to-image` rendering 1:1 (Square, 1080x1080px) and 9:16 (IG Story, 1080x1920px) formats with 1-click "Copy Image to Clipboard" (Web Clipboard API) and "Download PNG".
- **Printable Physical Certificate**: High-contrast, ink-friendly printable modal powered by native `@media print` CSS media queries + `window.print()` (A4 Landscape vector output) + vector inline SVG QR code (`qrcode` npm package) linking back to `/log/:adopter_id`.
