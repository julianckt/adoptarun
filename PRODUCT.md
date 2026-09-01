# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Astro with React islands, Vanilla CSS with semantic design tokens, Cloudflare Pages & Functions, Cloudflare D1 (SQLite), Cloudflare R2, Sanity.io CMS.

## Users
- **Primary: Runners / Adopters**: Urban runners, joggers, walkers, creative minds, and casual athletes in Hong Kong seeking a visually inspiring, community-driven way to combine fitness with social impact. They browse GPS-art routes, commit to adopting an artwork without account login friction, execute the route, and log their run.
- **Supporters / Donors**: Friends, family, and community members who donate directly to an Adopter's paired Section 88 charity cause via peer-to-peer campaigns (`donate.adoptarun.hk`).
- **Charity Causes**: Hong Kong Section 88 tax-exempt non-profit organizations paired with artworks, receiving direct donor contributions with zero platform fee friction.
- **Client Admins**: Non-technical organizers managing routes, featured schedules, and site copy through Sanity Studio.

## Product Purpose
Adopt A Run is an international GPS-art community movement debuting in Hong Kong. It brings people together through long-distance running, jogging, or walking and community art to champion a kinder city where shared compassion moves us forward. It transforms running into active caretaker ownership of digital artwork and charitable causes.

## Positioning
Unlike traditional run clubs, race event organizers, or high-friction registration portals requiring passwords and ticket purchases, Adopt A Run offers zero-login adoption where runners adopt an animal or guardian GPS-art route companion, receive a persistent 6-character Adopter ID (`NNNN-CC`), verify their athletic accomplishment via an automated 3-layer spatial GPS algorithm (or GPX upload), and earn a permanent, shareable interactive Digital Certificate (`/log/:adopter_id`) and print-ready Physical Certificate.

## Operating Context
- Physical running, jogging, and walking on Hong Kong urban streets, waterfront promenades, and trail networks.
- GPS fitness tracking via Strava (1-click ephemeral OAuth) or any GPS device/watch generating `.gpx` files.
- Social sharing on Instagram Stories, Strava, and social feeds using auto-generated 1:1 and 9:16 share cards.
- Direct peer-to-peer donations via Raisely / Stripe HK directly to Section 88 tax-exempt charities.

## Capabilities and Constraints
- **Zero-Password Architecture**: No user registration or login forms; identification is anchored to a 6-character Adopter ID (`NNNN-CC`, e.g. `0124-JC`).
- **4-Step Adoption Portal (`/signup`)**: Artwork selection, Charity Cause pairing, dynamic commitment sliders (1–20 days, HK$100–HK$2,000 target), companion naming.
- **Spatial Run Verification**: Automated 3-layer spatial algorithm matching activity type, date window, distance tolerance (±40%), start point proximity (40% radius), and trajectory similarity (10-point sample).
- **Run Log & Certificate Hub (`/log/:adopter_id`)**: Interactive Leaflet map with animated GPS polyline path drawing, synchronized elevation scrubber, verified telemetry metrics, impact equivalencies, social share card export, and printable QR-coded certificate.
- **Domain Language Integrity**: Strictly enforce domain terminology (Runner/Adopter, Artwork/Route, Adoption/Caretaking, Adoption Portal, Adopter ID, Charity Cause, Digital/Physical Certificate, Fundraising Campaign, Donor/Backer).

## Brand Commitments
- **Name**: Adopt A Run (debuting in Hong Kong: `adoptarun.hk`).
- **Voice & Tone**: High-energy, warm, athletic, playful, and community-focused. Welcoming to casual walkers and serious marathoners alike.
- **Aesthetic Direction**: Vibrant, modern urban athletic culture with dynamic typography, rich telemetry readouts, and map-centric interactive craftsmanship.

## Evidence on Hand
- Domain language and philosophy documented in [CONTEXT.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/CONTEXT.md).
- Detailed technical blueprint, database schema, and user stories in [docs/spec/master-spec-sheet.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/docs/spec/master-spec-sheet.md).
- Architecture and cost profile in [docs/adr/0001-tech-stack-architecture.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/docs/adr/0001-tech-stack-architecture.md).

## Product Principles
1. **Zero-Friction Participation**: Eliminate passwords, long forms, and account hurdles; enable instant adoption and participation through persistent Adopter IDs.
2. **Caretaker Connection**: Deepen emotional connection by having runners adopt and name their route companion while directly championing a charity cause.
3. **Spatial Authenticity & Craft**: Verify physical accomplishment accurately with spatial GPS validation while celebrating runners with high-craft interactive and printable certificates.
4. **Direct, Transparent Charity Impact**: Ensure 100% of donor funds reach non-profit partners directly without platform fee skimming.

## Accessibility & Inclusion
- Multimodal navigation for runners, joggers, and walkers of varying fitness levels.
- Accessible color contrast for outdoor readability (WCAG AA minimum).
- Clear typography hierarchy and responsive layout adapted for mobile devices on the go.
