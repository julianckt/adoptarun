# Initial Architecture & Tech Stack Decisions

Status: resolved  
Type: task  

## Question

What is the fundamental technology stack, hosting provider, database architecture, and authentication model for Adopt A Run?

## Answer

1. **Framework & Hosting**: Astro + React hosted on **Cloudflare Pages** ($0 cost, ultra-fast serverless deployment).
2. **CMS**: **Sanity.io** ($0 free tier) for non-technical client editing of run catalog, photos, and homepage copy.
3. **Database**: **Cloudflare D1** (SQLite, $0 free tier) for storing runner signups and generated certificate records.
4. **Auth Model**: **Zero-Password / Zero-Login**. Eliminates password reset and login overhead.
5. **Strava Integration**: Ephemeral Strava OAuth + Client-side GPX file upload. Adoption Run Logs generate unique persistent public links (`/log/:adopter_id`) stored in Cloudflare D1 `run_logs`.
