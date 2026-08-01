## Destination

A launched, high-quality, modern MVP website for **Adopt A Run** built with **Astro + React + Cloudflare Pages + Sanity.io + Cloudflare D1**, featuring:
1. Brand identity & UI/UX design system with captivating visuals, smooth animations, and novel site navigation.
2. Marketing copy and storytelling language that communicates the community vision.
3. Runner sign-up & adoption flow (zero-login).
4. Run catalog & CMS for browsing, filtering, and managing community runs.
5. Interactive digital certificate and downloadable PDF/PNG certificate system powered by Strava 1-click OAuth and GPX file upload.
6. A detailed architectural blueprint for a future peer-to-peer donation/fundraising system.

## Notes

- **Tech Stack**: Astro, React, Tailwind CSS / Vanilla CSS, Framer Motion, Sanity.io, Cloudflare Pages, Cloudflare D1.
- **Hosting & Infrastructure**: 100% Free Tier compliant on Cloudflare Pages and Sanity.io.
- **Auth Model**: Zero-password, zero-login architecture. Signups and certificate links use unique lightweight persistent codes (`cert_id`).
- **Aesthetics**: Premium, modern, rich micro-animations, custom Google Fonts, curated palette, dynamic map polylines.

## Decisions so far

- [Stack & Hosting Choice](issues/00-initial-architecture-decisions.md) — Astro + React frontend hosted on Cloudflare Pages, Sanity.io for CMS, Cloudflare D1 for database.
- [Zero-Login Auth & Ephemeral Strava OAuth](issues/00-initial-architecture-decisions.md) — Eliminating user passwords; using ephemeral Strava OAuth + client-side GPX parser and persistent unique URL links (`/certificate/:cert_id`).
- [Brand Identity & Visual System](issues/01-brand-identity-and-visual-language.md) — Primary Volt `oklch(0.9 0.275 128)`, Secondary Orange `oklch(0.66 0.215 21)`, Splash Blue `oklch(0.66 0.138 234)`, Off Black `oklch(0.16 0.0075 128)`, Dark Green Cards `oklch(0.21 0.01 128)`. Fonts: Scale VF (Display) + Runda (Body). Logo: Glowing Volt Roadrunner vector + Scale VF wordmark. Map: Glowing Volt polyline over dark OpenStreetMap.
- [Marketing Language & Site Copy](issues/02-marketing-language-and-site-copy.md) — Hero: "RUN" with animated vector dog hover release. Slogans: "Run for your cause. Leave your mark." & "Adopt the run. Complete the route. Own the impact." 3-Step Journey: Match & Commit -> Nurture & Grow -> Forever Guardian. CTAs: "Adopt Your Run", "Log Your Run", "Claim Adoption Certificate", "Pass the Torch". Metrics: Runs Adopted, Kilometers Trekked, Causes Championed.

## Not yet specified

- Certificate social media open-graph (OG) image auto-generation.
- Advanced Strava API webhook caching & rate limit optimization.
- Interactive map tile provider choice (Mapbox GL vs Leaflet vs Static SVG polylines).

## Out of scope

- Persistent user account password creation and login management.
- Self-hosted database servers or paid cloud database tiers.
- Live payment processor implementation for donation system (only architectural blueprint required for MVP).
