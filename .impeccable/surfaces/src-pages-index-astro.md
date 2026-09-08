---
version: 1
primary_target: src/pages/index.astro
mode: persuade
---

# Surface Brief: Homepage (`/`)

## 1. Job and Audience
- **Audience:** Urban runners, joggers, walkers, and caretakers in Hong Kong seeking a visually captivating, community-grounded movement combining athletic training with direct charitable impact.
- **Visitor Mode:** Persuade — immediately demonstrate the unique concept of "adopting a GPS-art run" through living typography and street-level evidence.

## 2. Outcome and Proof
- **Primary Task:** Understand the movement within 5 seconds, explore adoptable routes, and transition into adopting a route (`/signup`) or logging a run (`/log`).
- **Proof & Truth:** Authentic GPS-art polyline previews, real-time community movement counters pulled from Sanity CMS `siteCopy`, and a transparent Section 88 partnership spotlight with SPCA Hong Kong.

## 3. Selected Direction & Section Sequence
1. **Header (Incumbent):** Retained as-is with persistent navigation (`run with us`, `routes`, `charities`, `donate`, `log a run`) and live announcement ticker.
2. **Hero Section (Split Architectural Anchor):**
   - **Left Column:** Degular Display compressed editorial headline (`the new way to push yourself in training and in giving back`), Runda body mission statement, zero redundant CTA buttons (deferring directly to the existing header).
   - **Right Column:** Authentic signature Route Card scaled to 380×480px featuring a dramatic 90°-rotated GPS minimap polyline, live telemetry tags, and hard zero-radius framing.
3. **Section 01 — Movement Mission & Staggered Scroll Imagery:**
   - Editorial mission statement paired with street-level documentary photo frames that grow in scale via staggered scroll-driven transitions as the user scrolls past.
4. **Section 02 — Community Movement Counters (Editorial Narrative Lockup):**
   - Pre-rendered static SSG headline block dynamically embedding live figures from Sanity CMS `siteCopy` singleton (`totalKmCovered`, `totalRunsCompleted`, `totalParticipantsCount`): *"187 km covered across 21 runs by 33 participants and counting"* with Route Orange highlighted accents.
5. **Section 03 — 3-Step Caretaker Journey (Connected Linear Stepper):**
   - Continuous linear stepper linking the three steps (`one. Match & Commit`, `two. Nurture & Grow`, `three. Forever Guardian`) with architectural indicator nodes and Degular Display 0.8 line-height stage markers.
6. **Section 04 — Featured GPS Art Routes (Horizontal Scroll Runway):**
   - Single-row horizontal scrollable runway showcasing 4–6 curated Route Cards (scheduled group runs with Group Run Green bands + solo runs in Route Orange / Coral / Blush) with edge peek, left/right scroll controls, and inline `"adopt this route →"` links.
7. **Section 05 — Partner Charities Spotlight (Asymmetric Editorial Feature):**
   - Two-column split: hard-cornered documentary image frame with Section 88 tax-exempt tag on the left; Degular Display heading ("Proudly Supporting SPCA"), impact narrative, and `"view all partner charities →"` link on the right.
8. **Section 06 — Action Banner CTA (Atmospheric Mesh-Noise Banner):**
   - Full-width warm sunset mesh-noise gradient container with visible film grain, Canvas Black Degular typography (`adopt the run. complete the route. own the impact.`), high-contrast `[run with us]` button, and a `"pass the torch →"` action that triggers native Web Share or copies an invite link with toast feedback.
9. **Section 07 — Global Footer (Incumbent):**
   - Integrated via `BaseLayout.astro` with geographic coordinates (`22.3193° N, 114.1694° E`) and community links.

## 4. Scope and Boundaries
- Zero border-radius on all elements (`border-radius: 0px`).
- Strict all-lowercase UI identity for buttons, labels, and links.
- No external icon libraries or emoji (strictly Unicode glyphs `↓`, `·`, `+`, `×`, `→` and telemetry abbreviations).
- Mesh-noise gradient bitmaps only — no synthetic CSS linear gradients.
- Sub-50ms static pre-rendering (SSG) with Sanity Presentation Tool / Stega live visual editing support.
