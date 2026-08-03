## Destination

A launched, high-quality, modern MVP website for **Adopt A Run** built with **Astro + React + Cloudflare Pages + Sanity.io + Cloudflare D1**, featuring:
1. Brand identity & UI/UX design system with captivating visuals, smooth animations, and novel site navigation.
2. Marketing copy and storytelling language that communicates the community vision.
3. Runner sign-up & adoption flow (zero-login).
4. Run catalog & CMS for browsing, filtering, and managing community runs.
5. Interactive digital certificate and downloadable PDF/PNG certificate system powered by Strava 1-click OAuth and GPX file upload.
6. A detailed architectural blueprint for a future peer-to-peer donation/fundraising system.

## Notes

- **Tech Stack**: Astro, React, Vanilla CSS, GSAP + ScrollTrigger, Sanity.io, Cloudflare Pages, Cloudflare D1.
- **Hosting & Infrastructure**: 100% Free Tier compliant on Cloudflare Pages and Sanity.io.
- **Auth Model**: Zero-password, zero-login architecture. Signups and Adoption Run Log links use unique lightweight persistent codes (`adopter_id` at `/log/:adopter_id`).
- **Aesthetics & Design System**: Tech-Brutalism (Tactical / Editorial Brutalism), Adobe Typekit (`Scale VF` + `OCR A` + `Runda`), strict color token allocation (Volt for top CTA only; Orange for actions; Wireframe & HUD tokens), dual-row race control navigation header.

## Decisions so far

- [Stack & Hosting Choice](issues/00-initial-architecture-decisions.md) — Astro + React frontend hosted on Cloudflare Pages, Sanity.io for CMS, Cloudflare D1 for database.
- [Zero-Login Auth & Ephemeral Strava OAuth](issues/00-initial-architecture-decisions.md) — Eliminating user passwords; using ephemeral Strava OAuth + client-side GPX parser and persistent unique URL links (`/log/:adopter_id`).
- [Brand Identity & Visual System](issues/01-brand-identity-and-visual-language.md) — Primary Volt `oklch(0.9 0.275 128)`, Secondary Orange `oklch(0.66 0.215 21)`, Splash Blue `oklch(0.66 0.138 234)`, Off Black `oklch(0.16 0.0075 128)`, Dark Green Cards `oklch(0.21 0.01 128)`, Wireframe Grid `oklch(0.35 0.01 128)`, Muted HUD `oklch(0.55 0.01 128)`. Fonts: Scale VF (Display) + OCR A (Telemetry) + Runda (Body). Logo: Glowing Volt Roadrunner vector + Scale VF wordmark.
- [Marketing Language & Site Copy](issues/02-marketing-language-and-site-copy.md) — Hero: "RUN" with animated vector dog hover release. Slogans: "Run for your cause. Leave your mark." & "Adopt the run. Complete the route. Own the impact." 3-Step Journey: Match & Commit -> Nurture & Grow -> Forever Guardian. CTAs: "Adopt Your Run", "Log Your Run", "Claim Adoption Certificate", "Pass the Torch". Metrics: Runs Adopted, Kilometers Trekked, Causes Championed.
- [UI/UX Design System & Novel Navigation](issues/03-ui-ux-design-system-and-navigation.md) — Tech-Brutalism framework; Dual-Row Race Control Header (Top `OCR A` micro-row: `HKG` city selector, countdown banner, `ENG` lang selector; Main `Scale VF` row: `Routes`/`Charities`/`About`, centered logo, `Donate`/`Log`/`Run With Us`); GSAP + ScrollTrigger engine for `Scale VF` weight morphs, 1px clip-path scroll reveals, corner `+` lock-on spins, digit matrix flickering.
- [Hero Section & Homepage Experience](issues/04-hero-section-and-homepage-experience.md) — 100vh Hero with stark white background crossfading to dark base on scroll; 3D ground perspective "RUN" typography popping out on hover; Canvas 2D ASCII generative matrix dog animation; 9-part editorial homepage layout sequence; Vector Polyline Live Pulse Tracer, Variable Font proximity expansion, and Telemetry Coordinate Marquee.
- [Run Catalog & Adoption UX](issues/05-run-catalog-and-adoption-ux.md) — 2-page model (/routes + /signup); Bento wireframe catalog with Leaflet maps & GSAP path animations; 4-step adoption portal with charity selection, dynamic commitment/fundraising sliders, matrix animal naming, 4-digit Adopter ID, and Resend email triggers.
- [Digital & Printable Certificate Design](issues/06-digital-and-printable-certificate-design.md) — Interactive Adoption Run Log at /log/:adopter_id with Leaflet GPX map, elevation scrub sync, HUD stats, Sanity CMS impact equivalency, social share card generator, and printable PDF/PNG modal with scannable QR code.
- [Sanity CMS Content Schema](issues/07-sanity-cms-content-schema.md) — Exactly 3 schemas (`route`, `charity`, `siteCopy`), admin GPX auto-processing (mini-map SVG, telemetry, elevation profile array), dual charity/cause descriptions, and 7-day Strava KV caching.
- [Cloudflare D1 Database Schema](issues/08-cloudflare-d1-database-schema.md) — Clean 2-table edge database (`adoptions` + `run_logs`), unified `adopter_id` keying (`NNNN-CC`), automatic `seq_num` autoincrement seed starting at 120, walk-in support, multi-attempt run logging (`-2`), and SQL performance indexing.
- [Strava OAuth & GPX Parser Technical Spec](issues/09-strava-oauth-and-gpx-parser-technical-spec.md) — Ephemeral Strava OAuth redirect flow with `scope=read,activity:read_all`; 3-layer spatial activity filter (type, 20-day window, ±40% distance, 40% start radius, 10-point trajectory sample); single/multi/fallback filter results UI with dark editorial loading screen; client-side GPX parser (`@tmcw/togeojson`) with Cloudflare R2 storage; `html-to-image` social cards and `@media print` physical certificates.
- [Donation & Fundraising System Blueprint](issues/10-donation-fundraising-system-blueprint.md) — Peer-to-peer fundraising architecture using Raisely REST API v3 (0% platform fee, direct charity Stripe payout), custom domain (`donate.adoptarun.hk`), and decoupled D1 `donations` table leaving `adoptions` 100% untouched.
- [Map Engine & Tile Provider](issues/05-run-catalog-and-adoption-ux.md) — Leaflet with CARTO Dark Matter vector raster tiles (`CartoDB.DarkMatter`) and custom SVG area chart for elevation profiles.

## Not yet specified

- Advanced Strava API webhook caching & rate limit optimization.

## Out of scope

- Persistent user account password creation and login management.
- Self-hosted database servers or paid cloud database tiers.
- Live payment processor implementation for donation system (only architectural blueprint required for MVP).
