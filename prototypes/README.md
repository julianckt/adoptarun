# Adopt A Run — Prototypes & Sandbox

This directory contains throwaway exploratory prototypes, UI mockups, and the 3D Shadergradient studio created during the discovery and exploration phase.

> [!NOTE]
> These prototypes serve as reference implementations and primary sources for visual/interaction behavior. Production implementation is built separately at the repository root using Astro + Cloudflare Pages.

## Prototype Inventory

| File / Folder | Description |
|---|---|
| `index.html` | Homepage & hero layout mockup |
| `routes.html` | Route catalogue & detail drawer mockup |
| `signup.html` | Route adoption wizard mockup |
| `confirmed.html` | Adoption confirmation & share preview mockup |
| `log.html` | Adopter run log & digital certificate mockup |
| `color-palettes.html` | OKLCH color token & theme exploration |
| `hero-bento-oklch.html` | Bento grid hero variation |
| `nav-race-ticker-variants.html` | Dual-row race navigation ticker variants |
| `architecture-review.html` | Architectural visual review & audit report |
| `shadergradient-studio/` | Interactive React 19 + Three.js + Shadergradient 3D canvas studio |

## Running the Prototypes

All commands should be executed from within the `prototypes/` directory:

```bash
cd prototypes

# Serve static HTML/CSS/JS mockups on http://localhost:3000
npm run serve

# Run interactive Shadergradient 3D Studio on http://localhost:3001
npm run studio
```
