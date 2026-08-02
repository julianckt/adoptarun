# Hero Section & Homepage Experience

Status: resolved  
Type: prototype  

## Question

How should the hero section and homepage scroll experience be designed and animated to create a high-impact first impression?

## Answer

### 1. Viewport & Color Theme Transition
* **Hero Viewport (100vh)**: Full viewport height hero with a stark, high-contrast pure white background (`oklch(0.98 0 0)`) and off-black typography (`oklch(0.16 0.0075 128)`).
* **Scroll Theme Crossfade**: Using GSAP + ScrollTrigger, scrolling down out of the 100vh Hero smoothly transitions the page background into the dark base theme (`oklch(0.16 0.0075 128)`).

### 2. 3D Ground Perspective Typography & Hover "Pop Out"
* **Initial Anamorphic State**: 
  * Viewport perspective set to `1200px` (`perspective-origin: 50% 65%`).
  * Centered headline **"RUN"** (`Scale VF`, `wdth` 70, `wght` 550, `font-size: clamp(10rem, 25vw, 28rem)`) renders in CSS 3D: `transform: rotateX(68deg) scaleY(1.45) translateZ(-40px); transform-origin: center bottom;`.
  * Appears printed directly onto the track / asphalt ground plane.
* **Hover Interaction**: Hovering over "RUN" triggers an elastic GSAP transition popping the typography flat into the 2D plane (`rotateX(0deg)`, `scaleY(1.0)`, `translateZ(0)`), while morphing `Scale VF` variables to `'wdth' 100, 'wght' 850`.

### 3. Micro-HUD ASCII/Glyph Generative Matrix Dog Engine
* **Canvas 2D Matrix Engine**: Rendered behind "RUN" on an HTML5 Canvas context.
* **Typographic Glyph Dictionary**:
  * *Heavy/High-Density*: `☉`, `O`, `■`, `□`, `X`, `⠿` (Core Anatomical Mass)
  * *Medium-Density*: `+`, `/`, `\`, `[` (Anatomical Edge Decay)
  * *Light-Density*: `:`, `::`, `.` (Ambient HUD Grid)
* **Motion & Glitch**: An offscreen running dog silhouette cycle drives cell density. As the dog runs across the canvas, edge cells flip glyph states frame-by-frame, creating a live telemetry data stream aesthetic.

### 4. Revised Homepage Section Layout Sequence
1. **00. Hero Viewport (100vh)** — Stark white background, 3D ground "RUN" typography, ASCII generative matrix dog, primary CTAs (`[RUN WITH US]` in Volt + `[LOG YOUR RUN]` in Orange).
2. **01. Mission & Movement** — Editorial statement in `Scale VF` set over monochromatic high-contrast runner photography with dark 1px wireframe grid overlays (`oklch(0.35 0.01 128)`).
3. **02. Adoption Telemetry Data Grid** — Placed directly underneath Mission. Exposed HUD matrix displaying live counters (`Runs Adopted`, `Kilometers Trekked`, `Causes Championed`, `Dollars Raised`).
4. **03. Featured GPS Art Routes** — Bento grid showcasing Strava Art Routes with glowing Volt polylines, dark green card fills (`oklch(0.21 0.01 128)`), `OCR A` distance/elevation tags, and paired Charity Cause badges.
5. **04. The 3-Step Caretaker Journey** — Step 01 Match & Commit → Step 02 Nurture & Grow → Step 03 Forever Guardian.
6. **05. Charities Grid** — Dedicated bento grid showcasing partner Charity Causes, impact metrics, and paired Artwork links.
7. **06. Charitable Mission of Adopt A Run** — Deep-dive editorial story on how running steps create social impact, featuring full-bleed photography.
8. **07. Final "Adopt A Run Now" Banner CTA** — Action banner with *"Adopt the run. Complete the route. Own the impact."*, primary Volt `[RUN WITH US]` CTA button, and `[PASS THE TORCH]` caretaking recruitment link.
9. **08. Race Control Footer** — Monospaced `OCR A` telemetry, coordinates, and city selector.

### 5. Micro-Animations & Motion Design Specs
1. **Vector Polyline "Live Pulse Tracer"**: Featured Artwork polylines draw step-by-step with an animated glowing tracer dot upon entering viewport.
2. **Variable Font Proximity & Strikethrough Slide**: Headline weight expands on mouse proximity; monospaced tags reveal a sliding 1px Orange wireframe strikethrough line on hover.
3. **Telemetry Coordinate Marquee**: Section header coordinates (`22.3193° N, 114.1694° E`) scroll horizontally like a live race timing split-flap display with periodic character scrambling.
