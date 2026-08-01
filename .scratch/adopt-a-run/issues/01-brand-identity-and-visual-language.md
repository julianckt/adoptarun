# Brand Identity & Visual Language

Status: resolved  
Type: grilling  

## Agreed Brand Definition & Audience Profile

- **Brand Essence**: Sleek & Urban-Athletic, focused on graphic design, modern art, and fitness culture while maintaining a warm, welcoming, playful energy.
- **Mission**: *"By bringing people together through long-distance running and community art, our project aims to help champion a kinder city where our shared compassion moves us forward."*
- **Audience**: Urban explorers, creative minds, committed athletes, and casual runners in Hong Kong who want a visual, social way to give back to charity.
- **Adoption Concept**: Taking ownership and caretaking of an Animal/Nature Guardian Strava art route and its assigned charity cause — bringing the art to life with their feet.
- **Geographic Vision**: Global GPS-art movement debuting its first wave of routes in Hong Kong.

## Decision Question

What exact color palette, typography hierarchy (Adobe Fonts), hero header graphic style, logo mark, and map rendering style will express this sleek, urban-athletic brand identity?

## Answer

### 1. Color System (Strict User-Defined OKLCH Tokens)
* **Primary Color (Volt)**: `oklch(0.9 0.275 128)`
* **Secondary Color (Orange)**: `oklch(0.66 0.215 21)`
* **Secondary Bright Variant (Bright Orange)**: `oklch(0.66 0.275 21)`
* **Splash Color (Metrics & UI Blue)**: `oklch(0.66 0.138 234)`
* **Background Color (Off Black)**: `oklch(0.16 0.0075 128)`
* **Cards & Boxes Background (Dark Green)**: `oklch(0.21 0.01 128)`
* **White Text**: `oklch(0.973 0.006 128)`
> **Strict Rule**: Any additional colors required for future UI components must be explicitly confirmed with the user first before defining or implementing.

### 2. Typography Hierarchy (Adobe Fonts)
* **Display / Headlines**: `Scale VF` (Variable Font by Oh No Type Co via Adobe Fonts)
* **Body & UI Copy**: `Runda` (by James Edmondson via Adobe Fonts)

### 3. Logo & Brand Mark
* **Mark**: A continuous single-line GPS vector of a **Roadrunner bird** glowing in Volt (`oklch(0.9 0.275 128)`).
* **Wordmark**: **"ADOPT A RUN"** set in **Scale VF** in Volt.

### 4. Map & Strava Art Polyline Visual Style
* **Vector Style**: Glowing Neon Volt Vector stroke over a dark Map Canvas.
* **Map Engine**: OpenStreetMap of Hong Kong (CartoDB Dark Matter / MapLibre GL).
* **Note**: Specific map tile shading variant is TBD and will be reviewed during map component implementation.

### References
- Interactive Prototype: [hero-bento-oklch.html](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/.scratch/adopt-a-run/prototypes/hero-bento-oklch.html)
- Research Doc: [sports-brand-color-palettes.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/docs/research/sports-brand-color-palettes.md)
