# Strava OAuth & GPX Parser Technical Spec

Status: open  
Type: research  

## Question

How will the ephemeral Strava OAuth redirect flow and client-side GPX parser be structured in Astro & Cloudflare Functions?

### Focus Areas
- Strava OAuth API app setup & callback endpoint (`/api/strava/callback`).
- Client-side GPX XML parser library selection (`gpx-parser` or `togeojson`).
- Certificate rendering & PDF export pipeline (`html2pdf` or `canvas-to-pdf`).
