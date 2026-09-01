# Architectural Decision Record (ADR 0001): Technology Stack & Infrastructure

**Status**: Accepted  
**Date**: 2026-08-31  
**Project**: Adopt A Run  

---

## 1. Summary Matrix

| Layer | Selected Tech | Hosting / Provider | Cost Profile | Key Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Web Framework** | Astro (Hybrid SSR) + React Islands | Cloudflare Pages | $0.00 / mo | Ultra-fast static rendering for public pages with serverless edge SSR for dynamic run logs & preview mode |
| **Styling & Design System** | Lumos Framework for Astro + Stacki | Cloudflare Pages | $0.00 / mo | Fluid clamp design tokens, CSS `@layer` hierarchy, container query utilities, and direct AST editing via Stacki |
| **Motion & Micro-Interactions** | Framer Motion / GSAP | Client (React Islands) | $0.00 / mo | Dynamic telemetry animations, interactive map tracers, and smooth stepper transitions |
| **CMS & Visual Editing** | Sanity.io (Embedded Studio at `/studio`) | Cloudflare Pages & Sanity Cloud | $0.00 / mo | Embedded Studio via `@sanity/astro` with live click-to-edit visual editing via `@sanity/visual-editing` (Stega) |
| **Cross-Island State** | Nano Stores (`nanostores`) | Client Runtime | $0.00 / mo | Zero-bundle atomic reactive state shared between decoupled React islands and Astro components |
| **Database** | Cloudflare D1 (SQLite) | Cloudflare Pages | $0.00 / mo | Native serverless edge DB for adoptions, adopter IDs (`NNNN-CC`), and verified GPS polylines |
| **Auth & Verification** | Zero-Password Ephemeral + Edge Verification | Serverless Edge Functions | $0.00 / mo | Ephemeral Strava OAuth + 3-layer spatial verification executed securely at the edge (`/api/verify-run`) |
| **Media & Storage** | Sanity CDN + D1 + Client Canvas (R2 Eliminated) | Sanity & Client Browser | $0.00 / mo | Editorial media on Sanity CDN; GPS polylines in D1; social share cards & PDF certificates rendered client-side on-the-fly |

---

## 2. Component Rationale

### 2.1 Web Framework: Astro (Hybrid SSR) + React Islands
* **Choice**: Astro with Hybrid Rendering (`output: 'hybrid'`) deployed via `@astrojs/cloudflare` with React islands.
* **Why**: 
  * **Hybrid Edge Performance**: Marketing, catalog, and editorial pages (`/`, `/routes`, `/about`) are pre-rendered to static HTML for instant sub-50ms global edge delivery. Dynamic routes (`/log/:adopter_id`, `/signup/confirmed`) and API endpoints (`/api/verify-run`, `/api/preview`) execute on-demand via Cloudflare Pages Functions.
  * **Island Isolation**: Interactive components (Leaflet maps, 4-step adoption wizard, run verification modal, canvas certificate generator) run as lightweight React islands (`client:visible` / `client:idle`), while the surrounding page shell remains pure HTML.
  * **Single-Language Scope**: English-only foundation for Phase 1, eliminating multi-locale overhead.

### 2.2 Styling & Design System: Lumos Framework for Astro + Stacki Editor
* **Choice**: Lumos Framework CSS architecture (`@layer base, patterns, components, utilities`) with the Stacki visual AST desktop editor.
* **Why**:
  * **CSS Layer Hierarchy & Specificity**: Lumos uses CSS `@layer` rules and fluid CSS custom properties (`var(--space-fluid-*)`, `var(--font-fluid-*)`) with container-query utilities (`u-grid-autofit`). All custom component styling is declared inside `@layer components`, ensuring Lumos utility classes (`u-*`) always take proper precedence without `!important` hacks.
  * **Stacki AST Compatibility**: Astro components follow a strict "clean-prop" pattern (forwarding `class:list`, `{...props}`, and standard `<slot />` targets), allowing the local Stacki visual editor to cleanly read and write Lumos classes directly to `.astro` source files.
  * **Developer & Content Separation**: Stacki is used exclusively by developers/designers for local layout, styling, and template engineering; Sanity CMS manages dynamic content and live production data.

### 2.3 Headless CMS & Visual Live Editing: Sanity.io at `/studio`
* **Choice**: Sanity.io embedded inside the Astro project at `/studio` via `@sanity/astro`, with `@sanity/visual-editing` and Stega content source maps enabled.
* **Why**:
  * **Single Codebase Deployment**: The Sanity Studio dashboard is embedded directly at `adoptarun.hk/studio` (and `localhost:4321/studio`), sharing the same Git repository, TypeScript types, and deployment lifecycle with zero CORS configuration.
  * **Live Click-to-Edit Overlays**: When content managers preview pages in the Sanity Presentation Tool, Stega encoding allows clicking any heading or text block to immediately open that field in Sanity Studio.
  * **Stega-Safe Sanitization**: A dedicated sanitization helper strips invisible Stega Unicode characters from numerical data (e.g. GPS distances, elevation gain) and coordinates before they are processed by math utilities or Leaflet maps.

### 2.4 Cross-Island State Management: Nano Stores
* **Choice**: Nano Stores (`nanostores` + `@nanostores/react`).
* **Why**:
  * Because Astro renders each React island as an isolated root (`createRoot`), traditional React Context Providers cannot span across islands.
  * Nano Stores provides framework-agnostic, atomic state stores (~1 KB) allowing any button (even in a static Astro header or footer) to reactively open modals (`$isLogModalOpen`) or communicate active route selections with zero performance penalty.

### 2.5 Database & Storage: Cloudflare D1 (SQLite) — R2 Eliminated
* **Choice**: Cloudflare D1 SQLite database for all relational records and GPS telemetry; Cloudflare R2 is completely eliminated.
* **Why**:
  * **Streamlined Cloud Infrastructure**: Editorial assets (route photos, charity logos) are served directly from Sanity's CDN. 
  * **Lightweight Telemetry in D1**: GPS route traces (Google Encoded Polyline format, ~2–4 KB) and elevation samples are stored directly in text columns inside the D1 `run_logs` table.
  * **Client-Side Certificate Generation**: Social share cards (1:1 and 9:16 PNGs) and printable QR-coded physical certificates are generated on-the-fly in the runner's browser via HTML5 `<canvas>` and `jsPDF`, with dynamic Open Graph social preview cards rendered on-demand via an edge endpoint (`/api/og/:adopter_id.png`).
  * **Cost & Maintenance**: Eliminating R2 avoids object storage buckets, presigned URLs, and synchronization overhead, keeping the database layer 100% serverless and zero-cost.

### 2.6 Authentication & Edge Verification: Zero-Password & Serverless Functions
* **Choice**: Zero-Password identification via 6-character Adopter IDs (`NNNN-CC`) + Serverless Edge Function verification (`/api/verify-run`).
* **Why**:
  * **Zero Friction**: No user passwords, login prompts, or account resets; runner access is URL-driven (`/log/:adopter_id`).
  * **Strava API Compliance & Security**: Strava OAuth token exchange and the 3-layer spatial matching algorithm (activity type, ±40% distance, 40% start radius, 10-point trajectory match) execute securely inside Cloudflare Pages Functions, keeping `CLIENT_SECRET` protected and discarding tokens immediately after verification.

---

## 3. Free Tier Usage Projections (< 500 Users/Month)

| Metric | Free Tier Allowance | Projected Usage (500 users/mo) | Margin |
| :--- | :--- | :--- | :--- |
| **Cloudflare Bandwidth** | Unlimited | ~10 GB | Infinite |
| **Cloudflare Functions** | 3,000,000 / month | ~5,000 / month | 99.8% unused |
| **D1 Writes** | 3,000,000 / month | ~1,000 / month | 99.9% unused |
| **D1 Reads** | 150,000,000 / month | ~50,000 / month | 99.9% unused |
| **Sanity API Requests** | 100,000 / month | ~2,000 / month | 98.0% unused |
| **Cloudflare R2 Storage** | N/A (Eliminated) | 0 GB | 100% eliminated |

**Total Estimated Monthly Hosting Cost**: **$0.00**

