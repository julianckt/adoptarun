# UI/UX Design System & Novel Navigation

Status: resolved  
Type: prototype  

## Question

What visual design tokens, component styles (cards, buttons, glassmorphism, badges), and novel navigation interaction pattern will define the site's user experience?

## Answer

### 1. Overall Design Philosophy: Tech-Brutalism (Tactical / Editorial Brutalism)
* Merges high-fashion editorial typography with data-dense technical HUD aesthetics (sportswear branding, telemetry dashboards, flight instruments).
* Exposed 1px rigid grid wireframes, extreme scale contrast (`Scale VF` display vs `OCR A` telemetry), tactical indicators (`+` corner crosshairs), and oversized section counter indices (`01`, `02`).

### 2. Dual-Row Race Control Navigation Header
* **Top Micro-Row (`OCR A` font)**: 
  - Left: `HKG ▼` (City selector trigger for future multi-city support)
  - Center: `NEXT RUN: [LOCATION] IN [10] DAYS` (Clickable banner navigating to signup flow)
  - Right: `ENG ▼` (Language selector trigger for future multi-language support)
* **Main Nav Row (`Scale VF` font)**:
  - Left Group: `Routes`, `Charities`, `About`
  - Center Group: Centered **ADOPT A RUN** Wordmark + Glowing Volt Roadrunner Logo
  - Right Group: `Donate`, `Log a Run`, and Primary CTA `[RUN WITH US]` button

### 3. Strict Color Allocation Rules
* **Primary Volt (`oklch(0.9 0.275 128)`)**: Reserved *exclusively* for top-tier primary CTA (`Run With Us` / `Adopt Your Run`).
* **Secondary Orange (`oklch(0.66 0.215 21)`)**: Used for all other buttons, CTAs, hover highlights, and secondary action items.
* **Wireframe Grid Token (`oklch(0.35 0.01 128)`)**: 1px exposed grid borders & structural divides.
* **Muted HUD Token (`oklch(0.55 0.01 128)`)**: Used for `OCR A` coordinates, `+` crosshairs, grid dots, barcodes.
* **Off-Black Base (`oklch(0.16 0.0075 128)`)**: Background canvas.
* **Dark Green Card Fill (`oklch(0.21 0.01 128)`)**: Card & container background surface.

### 4. Component Surface Styling
* **Cards & Containers**: Sharp 0px border-radius containers with exposed 1px wireframe borders (`oklch(0.35 0.01 128)`), corner `+` crosshair lock-on indicators, Dark Green fill.
* **Badges & Telemetry Tags**: Monospaced `OCR A` instrument text without outline borders; visual hierarchy driven purely by typography and color.

### 5. Motion & Animation System
* **Animation Engine**: **GSAP + ScrollTrigger** (Industry standard for variable fonts, clip-path timelines, zero React lock-in, 100% Cloudflare Pages edge compatible).
* **`Scale VF` Variable Font Dynamics**: Hover weight morphing (`wght` 700 → 900) + Scroll width expansion (`wdth` 80 → 110).
* **Tactical Clip-Path Scroll Reveals**: 1px box clip-path unmasking (`inset(0 0 100% 0)` → `inset(0 0 0 0)`).
* **Corner Crosshair Lock-On**: Corner `+` crosshairs rotate 90° and illuminate in Orange on card hover.
* **Digit Matrix Flicker**: Numbers rapidly scramble through random digits for 200ms before locking onto target metrics.

### References & Prototypes
- Interactive Navigation Prototype: [nav-race-ticker-variants.html](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/.scratch/adopt-a-run/prototypes/nav-race-ticker-variants.html)
- Adobe Typekit Stylesheet: `<link rel="stylesheet" href="https://use.typekit.net/snp5gkf.css">`
