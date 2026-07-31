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

## Not yet specified

- Certificate social media open-graph (OG) image auto-generation.
- Advanced Strava API webhook caching & rate limit optimization.
- Interactive map tile provider choice (Mapbox GL vs Leaflet vs Static SVG polylines).

## Out of scope

- Persistent user account password creation and login management.
- Self-hosted database servers or paid cloud database tiers.
- Live payment processor implementation for donation system (only architectural blueprint required for MVP).
