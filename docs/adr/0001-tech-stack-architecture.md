# Architectural Decision Record (ADR 0001): Technology Stack & Infrastructure

**Status**: Accepted  
**Date**: 2026-07-31  
**Project**: Adopt A Run  

---

## 1. Summary Matrix

| Layer | Selected Tech | Hosting / Provider | Cost Profile | Key Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Framework** | Astro + React | Cloudflare Pages | $0.00 / mo | Ultra-fast static/SSR rendering, lightweight, excellent DX |
| **Styling & Motion** | Vanilla CSS + Framer Motion | Cloudflare Pages | $0.00 / mo | Full control over high-aesthetic micro-animations & layout |
| **CMS** | Sanity.io | Sanity Cloud | $0.00 / mo | Polished visual editing UI for non-technical clients |
| **Database** | Cloudflare D1 (SQLite) | Cloudflare Pages | $0.00 / mo | Native serverless DB, encrypted at rest, zero config |
| **Auth Model** | Zero-Password / Ephemeral | Serverless Edge | $0.00 / mo | Eliminates password reset/login friction & security overhead |
| **Strava & Certs** | Ephemeral OAuth + GPX Parser | Client & Edge | $0.00 / mo | 1-click Strava sync & instant PDF/PNG certificate rendering |

---

## 2. Component Rationale

### 2.1 Web Framework: Astro + React
* **Choice**: Astro (SSG/SSR) with React islands.
* **Why**: 
  * Astro delivers near-zero JavaScript bundle sizes by default while allowing React components for interactive elements (Framer Motion animations, Strava importer, certificate renderer).
  * Highly beginner-friendly codebase structure.
  * Direct integration with Cloudflare Pages via `@astrojs/cloudflare`.

### 2.2 Hosting & Infrastructure: Cloudflare Pages & Functions
* **Choice**: Cloudflare Pages with Pages Functions (Edge Serverless).
* **Why**:
  * **Unlimited Bandwidth & Static Requests**: Free tier covers unlimited visitor traffic.
  * **Edge Performance**: Serves assets globally with sub-50ms latency.
  * **Serverless Functions**: 100,000 free API requests per day (handles OAuth callbacks and database writes).

### 2.3 CMS: Sanity.io
* **Choice**: Sanity.io (Headless CMS + Sanity Studio).
* **Why**:
  * **Non-Technical Client Editing**: Provides a visual drag-and-drop Studio for clients to manage runs, photos, and copy.
  * **Free Tier**: 100,000 API requests/mo & 5GB media storage (far exceeds project needs).
  * **Astro Integration**: Official `@sanity/astro` package allows seamless data fetching at build or runtime.

### 2.4 Database: Cloudflare D1 (SQLite)
* **Choice**: Cloudflare D1.
* **Why**:
  * **Zero Cost & Generous Limits**: 5 million reads/day and 100,000 writes/day free.
  * **Data Privacy & Security**: Serverless DB residing strictly behind edge functions; encrypted at rest and in transit.
  * **Data Stored**: Runner adoption signups (`signups`) and generated certificate records (`certificates`).

### 2.5 Authentication Model: Zero-Password / Ephemeral Access
* **Choice**: No persistent user passwords or login sessions.
* **Why**:
  * Eliminates user onboarding friction (no confirmation emails, forgotten passwords, or login prompts).
  * Reduces security and data privacy liability.
  * Unique 10-character codes (`cert_id`) generate persistent, shareable URLs (`adoptarun.org/certificate/:cert_id`).

### 2.6 Strava Integration & Certificate Pipeline
* **Choice**: Ephemeral Strava OAuth2 + Client-Side GPX File Upload.
* **Why**:
  * **Strava API Compliance**: Ephemeral token fetch extracts distance, elevation, time, and polyline; complies with Strava API brand terms by including "Powered by Strava" badge.
  * **Fallback**: Allows runners without a Strava account to upload `.gpx` files directly in-browser.

---

## 3. Free Tier Usage Projections (< 500 Users/Month)

| Metric | Free Tier Allowance | Projected Usage (500 users/mo) | Margin |
| :--- | :--- | :--- | :--- |
| **Cloudflare Bandwidth** | Unlimited | ~10 GB | Infinite |
| **Cloudflare Functions** | 3,000,000 / month | ~5,000 / month | 99.8% unused |
| **D1 Writes** | 3,000,000 / month | ~1,000 / month | 99.9% unused |
| **D1 Reads** | 150,000,000 / month | ~50,000 / month | 99.9% unused |
| **Sanity API Requests** | 100,000 / month | ~2,000 / month | 98.0% unused |

**Total Estimated Monthly Hosting Cost**: **$0.00**
