# Run Catalog & Adoption UX

# Run Catalog & Adoption UX

Status: resolved  
Type: prototype  

## Question

What is the optimal UX for exploring, filtering, viewing details, and adopting a run in 3 simple steps?

## Answer

### Architecture: 2-Page Model (`/routes` + `/signup`)
1. **Run Catalog (`/routes`)**: Dedicated page for browsing, searching, and filtering all available routes.
2. **Adoption Portal (`/signup`)**: Dedicated 4-step wizard for choosing/verifying a route, selecting a paired Charity Cause, entering runner details with dynamic commitment/fundraising sliders, naming the route animal, and receiving an Adopter ID.
3. **Interlinking**: Each route card on `/routes` features an "Adopt This Route" CTA linking to `/signup?route=<slug>`. Passing the `route` query parameter automatically skips Step 1 of the adoption portal and pre-loads the selected route into the sticky summary panel.

---

### Page 1: Run Catalog (`/routes`)

#### **Design & Bento Grid Layout**
- **Bento Style**: Clean Tech-Brutalist grid with 1px wireframe borders (`oklch(0.35 0.01 128)`).
- **Scheduled Group Runs**: Pinned at the top of the grid with a distinct **Volt border highlight** (`oklch(0.9 0.275 128)`).
- **Regular Route Cards Hover Effect**: Highlighted with an **Orange border** (`oklch(0.66 0.215 21)`), `Scale VF` font weight shift, and corner mini-GUI graphics (`+` lock-on brackets).
- **CMS Identifier**: Internal slug format `[neighbourhood]-[animal]-run-[number]` (e.g. `wan-chai-dog-run-01`), stored in Sanity CMS.

#### **Filtering & Sorting Controls**
- **Sort Options**: `Latest` (Default - latest added), `Longest`, `Shortest`, `Easiest`, `Hardest`.
- **Difficulty Filter**: `All`, `Beginner`, `Easy`, `Intermediate`, `Advanced`.
- **Region Filter**: `All`, `HK Island`, `Kowloon`, `MTR Accessible`.
- **Feature Tags**: `Kid-friendly`, `Traffic-free`, `Trail-running`, etc.

#### **Closed Route Card View**
- **Mini-Map Preview**: Inline SVG polyline preview of the GPS artwork.
- **Telemetry Block (`OCR A` font)**: Distance (km), Elevation (+m), Estimated Time.
- **Primary Tags**: Difficulty grade, Neighbourhood (e.g. Central / The Peak / Tsim Sha Tsui).
- **Secondary Tags**: Lighter, smaller text for additional tags (e.g. `Kid-friendly`, `Traffic-free`).
- **Group Run Badge (Closed Card)**: Displays Date & Time + Current Sign-ups Count (e.g. `NEXT RUN: SAT AUG 8 @ 07:30 HKT` | `12 RUNNERS JOINED`).
- **CTA**: Bottom right position, Volt colored text with underline: `"Adopt This Route →"`. Clicking CTA navigates to `/signup?route=<slug>`.

#### **Expanded Bento Card View (Inline Grid Expansion)**
- Clicking anywhere else on a card expands it directly within the bento layout (spanning neighboring grid cells). No popup modal.
- **Card Expansion Animation**: Volt SVG route path animates and draws itself live on card expand using GSAP `stroke-dashoffset` path-drawing.
- **Full Map View**: Rendered using **Leaflet** with free **CARTO Dark Matter** vector raster tiles (`CartoDB.DarkMatter`).
- **Elevation Profile**: Custom SVG area chart with Volt gradient fill at the bottom of the map view.
- **Additional Telemetry**: Suggested start point (e.g. `MTR Exit A`), Route photo thumbnail in corner, Group run meetup point (for group runs), "View Strava Route" light text link, and short editorial route description.

---

### Page 2: Adoption Portal (`/signup`)

#### **Visual Environment & Layout Header**
- **Background Watermark**: Large, muted editorial typography reading **`ADOPTION PORTAL`** behind the content.
- **Top Stepper Bar**: No numbers in the step labels. Steps: `SELECT ROUTE` ── `SELECT CHARITY` ── `ENTER DETAILS` ── `COMMIT & ADOPT`.

#### **Step 01 // Select Route**
- **Header**: `"FEATURED ROUTES"`.
- **Grid Layout**: 2 rows of featured cards (managed in Sanity CMS), including scheduled group runs and curated routes.
- **Final Card**: Empty wireframe card with text: `"See all routes waiting to be adopted →"`, linking to `/routes`.
- **Pre-Selected Route Skip**: Arriving via `/signup?route=<slug>` automatically skips Step 1 and lands directly on Step 2.

#### **Persistent Sticky Right-Side Summary Panel (Steps 02 ──> 04)**
- Stays pinned on the right side of the screen like an e-commerce checkout drawer throughout steps 2, 3, and 4.
- Displays selected route name, closed card telemetry, mini-map preview, Group Run time/date/meetup location (if applicable), paired Charity Cause (after Step 2), and real-time commit date & target fundraising amount (during Step 3).
- Includes text action links: `[Change Route]` and `[Change Charity]`.

#### **Step 02 // Select Charity**
- Single row of Charity panels featuring Charity Logo, Photo, short description, and impact description (e.g. *"Funds 5kg of animal food per 10km ran"*).
- **2-Stage Selection Interaction**:
  1. Hover: Orange border highlight.
  2. 1st Click: Card background turns solid Orange, revealing a bottom CTA: `"SUPPORT [CHARITY NAME] ↓"`.
  3. 2nd Click (on CTA): Confirms charity selection and advances to Step 03.

#### **Step 03 // Enter Details**
- **Form Inputs**: First Name, Last Name, Email.
- **Slider 1 (Commitment Date)**: `"Commit to running within [X] days"` (Range: 1 to 20 days, Default: 5 days). Dynamic top-right readout: `"by [actual date calculated dynamically, e.g. Fri, Aug 8]"`. *(Hidden for Group Runs)*.
- **Slider 2 (Fundraising Target)**: `"Targeting fundraising [amount] HKD"` (Range: HK$100 to HK$2,000, Recommended/Default: HK$500). Dynamic top-right readout showing charity equivalated impact (e.g. `"Providing 50 meals for shelter animals"`).
- **Group Run Extra (Step 3)**: Underneath Slider 2, displays text link: `"Share this run & invite a friend"`.
- **Bottom Action**: `"Review →"` button advances to Step 04.

#### **Step 04 // Review & Naming**
- Left side displays entered runner Name & Email details.
- Cute ASCII/Canvas matrix artwork of the route's animal (from CMS `[neighbourhood]-[animal]-run-[number]`).
- Empty text input box underneath the matrix artwork to name the route animal, accompanied by prompt: *"It's a match between you and your route! Give it a name, and commit to the adoption!"*
- Bottom CTA: Volt `"Confirm & Commit"` button.

---

### Confirmation Page (`/signup/confirmed` or post-commit state)

- **Header**: `"You've committed! [Animal Name] is waiting for your adoption"`.
- **Left Column**: Timeline displaying the 3-Step Runner Journey (`1. Match & Commit` [COMPLETED] ── `2. Nurture & Grow` ── `3. Forever Guardian`).
- **Adopter ID**: 6-character ID generated and displayed prominently (e.g., `Adopter ID: 0124-JC`, where `0124` is pseudo-sequential from seed `0120` and `JC` are runner initials).
- **Route Display**: Complete route details from the expanded card layout (Leaflet map, elevation profile, start point, route photo, Strava text link, GPX download text link). Group runs include date, time, and meetup point + `"Add to Calendar"` text link.
- **Action CTAs**: `"Share My Commitment"` text link / social copy snippet + instructions directing the runner to visit `/log` ("Log A Run") after completing their run.
- **Transactional Email**: Triggers transactional email via **Resend** to the runner's email containing their Adopter ID (`0124-JC`) and link back to their adoption commitment.


### Focus Areas
- Run Catalog filtering UI (distance, difficulty, location, status).
- Run Detail modal / page layout (map preview, elevation profile, community story).
- Frictionless 3-step Adoption Form overlay (Name, Email, Target Date — no password required).
