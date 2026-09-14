# Handoff: Favicon Set Implementation Plan (Evil Martians Minimalist Spec)

## 1. Executive Summary & Objective

Implement a high-performance, minimalist favicon set for **Adopt A Run** strictly following the [Evil Martians modern favicon guide](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs), tailored for sites without PWA or web app manifest requirements.

The favicon set centers on the **"run"** wordmark rendered in **Scale VF** at maximum weight and width (`wght: 900`, `wdth: 175`), framed within an **Apple continuous-curvature squircle** (superellipse / G2 curvature), and styled using the repository's brand tokens (`canvas-black` and `canvas-white`).

---

## 2. Aligned Decisions & Architectural Invariants

All requirements and design decisions were aligned and confirmed via `/grill-me`:

1. **Deliverable Scope (Strictly 3 Files)**:
   - `public/favicon.svg`: Modern vector icon with embedded light/dark color scheme adaptation.
   - `public/favicon.ico`: 32×32 (and 16×16) multi-resolution bitmap fallback for legacy browsers, bookmark bars, and RSS readers.
   - `public/apple-touch-icon.png`: 180×180 raster icon for Apple touch devices and iOS Home Screen shortcuts.
   - *No web app manifest (`manifest.webmanifest`), no maskable PWA icons.*
2. **Brand Color Tokens** (defined in [`src/styles/tokens.css`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/tokens.css)):
   - **Canvas Black**: `rgb(24, 19, 17)` (`#181311`)
   - **Canvas White**: `rgb(255, 251, 249)` (`#fffbf9`)
3. **Color Hierarchy & Theme Adaptation**:
   - **`favicon.svg`**:
     - *Light Mode*: Canvas Black squircle background (`#181311`), Canvas White "run" wordmark (`#fffbf9`).
     - *Dark Mode* (via `@media (prefers-color-scheme: dark)`): Inverted to Canvas White squircle background (`#fffbf9`), Canvas Black "run" wordmark (`#181311`) to prevent the icon from disappearing against dark browser tab bars.
   - **`favicon.ico`**: Canvas Black squircle background with Canvas White "run" wordmark.
   - **`apple-touch-icon.png`**: Full-bleed Canvas Black background with Canvas White "run" wordmark padded ~20px from edges.
     - *Why full-bleed*: iOS automatically applies continuous squircle clipping to Home Screen icons. Supplying transparent corners causes iOS to render black corner artifacts or double-mask borders.
4. **Wordmark Geometry & Vector Bézier Outlines**:
   - Browsers sandbox SVG favicons and actively block external font loading (`@import` or Typekit web fonts).
   - The "run" letterforms must be pure vector Bézier `<path d="..." />` outlines baked directly into the SVG. This guarantees 100% vector fidelity across all devices with zero font-loading delays, zero FOUT, and no security policy blocks.
5. **Tooling & Removability Constraint**:
   - A single, self-contained generator script [`scripts/generate-favicons.mjs`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/scripts/generate-favicons.mjs) registered as `"generate:favicons": "node scripts/generate-favicons.mjs"` in [`package.json`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/package.json).
   - Uses standard Node.js APIs and `sharp` (already permitted and available in `node_modules`).
   - Zero new dependencies added to `package.json`.
   - Easily removable in the future by simply deleting the script and its script entry.

---

## 3. Detailed File Changes & Specifications

### 3.1. `scripts/generate-favicons.mjs` [NEW]

Create a self-contained Node ESM script to generate all 3 assets deterministically:

```javascript
// scripts/generate-favicons.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// 1. Color tokens
const CANVAS_BLACK = '#181311';
const CANVAS_WHITE = '#fffbf9';

// 2. Apple Squircle Geometry (G2 continuous curvature superellipse)
// Normalized 100x100 squircle path (or scaled to viewBox)
// Formula / cubic bezier approximation of Apple's iOS/macOS squircle
```

#### Asset 1: `public/favicon.svg`
- `viewBox="0 0 100 100"`
- Embedded CSS with `@media (prefers-color-scheme: dark)`:
  - Default: `.squircle { fill: #181311; } .wordmark { fill: #fffbf9; }`
  - Dark mode: `@media (prefers-color-scheme: dark) { .squircle { fill: #fffbf9; } .wordmark { fill: #181311; } }`
- Scaled Apple squircle path (~94% canvas size with centered margins).
- Precision vector `<path>` outlines of the "run" wordmark at Scale VF `wght: 900`, `wdth: 175`, centered within the squircle.

#### Asset 2: `public/apple-touch-icon.png` (180×180)
- Full-bleed `#181311` rectangle background.
- Centered `#fffbf9` "run" wordmark scaled with ~20px padding from the borders.
- Rendered using `sharp({ ... }).png().toFile('public/apple-touch-icon.png')`.

#### Asset 3: `public/favicon.ico` (32×32 + 16×16)
- Render 32×32 and 16×16 PNG buffers using `sharp` from the squircle SVG (light mode: `#181311` squircle with `#fffbf9` "run").
- Pack into a valid Windows ICO container:
  - 6-byte ICO Header (`0x0000`, `0x0001` for ICO, `0x0002` for 2 image entries).
  - 16-byte Directory Entries for each resolution (width, height, color count, planes, bpp, size, offset).
  - Raw PNG payloads appended at respective offsets.
  - Written directly to `public/favicon.ico`.

---

### 3.2. `package.json` [MODIFY]

Add the generator script under `"scripts"`:
```json
"scripts": {
  ...
  "generate:favicons": "node scripts/generate-favicons.mjs"
}
```

---

### 3.3. `src/layouts/BaseLayout.astro` [MODIFY]

Update the `<head>` favicon link tags according to the Evil Martians specification:

```astro
<!-- Replace existing single <link rel="icon" ...> with the Evil Martians minimal trio: -->
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

*Note: The `sizes="32x32"` attribute on `favicon.ico` is intentional and mandatory per Evil Martians to prevent older Chrome versions from prioritizing the `.ico` file over the scalable `.svg`.*

---

## 4. Scale VF Wordmark Glyph Extraction Reference

The Scale VF font (`scale-variable`) in Typekit kit `pyi8tbr` has the following confirmed axis bounds:
- `wdth`: `min: 50, default: 50, max: 175`
- `wght`: `min: 200, default: 200, max: 900`

The target configuration for "run" is:
- Text: `"run"` (lowercase, strictly matching the lowercase UI voice from `DESIGN.md`)
- Variations: `'wdth' 175, 'wght' 900`
- The font file is downloaded at:
  `/Users/julianchung/.gemini/antigravity-ide/brain/7c52ffb3-381a-45fa-a7e7-f2ce2bbebd77/scratch/test_font`
- `opentype.js` is cached at:
  `/Users/julianchung/.npm/_npx/2b3cf126c0557c4b/node_modules/opentype.js/dist/opentype.js`
- To obtain the exact SVG `<path d="..." />`, use `opentype.parse(fs.readFileSync(fontPath).buffer)` and retrieve `font.getPath('run', x, y, fontSize, { variationSettings: { wdth: 175, wght: 900 } }).toPathData(2)`.

---

## 5. Apple Squircle Path Reference (G2 Curvature)

For a 100×100 canvas with a 94×94 squircle centered at (50, 50) with 3px margins:
The continuous-curvature squircle Bézier approximation formula (standard Apple superellipse `|x/a|^n + |y/b|^n = 1` with `n ≈ 4.5` / iOS rounded rect) in normalized SVG path:

```xml
<path class="squircle" d="M 50 3
  C 71.5 3, 84.5 5.5, 91.5 12.5
  C 98.5 19.5, 101 32.5, 101 54
  C 101 75.5, 98.5 88.5, 91.5 95.5
  C 84.5 102.5, 71.5 105, 50 105
  C 28.5 105, 15.5 102.5, 8.5 95.5
  C 1.5 88.5, -1 75.5, -1 54
  C -1 32.5, 1.5 19.5, 8.5 12.5
  C 15.5 5.5, 28.5 3, 50 3 Z" />
```
*(Adjust bounds and corner parameters to fit exactly in `viewBox="0 0 100 100"` with symmetric padding).*

---

## 6. Step-by-Step Implementation Sequence for Agent 2

1. **Glyph Extraction & Script Generation**:
   - Write `scripts/generate-favicons.mjs` containing:
     - Vector glyph path generation for `"run"` at `wdth: 175, wght: 900`.
     - SVG squircle generator with theme styles.
     - Sharp rendering for `public/apple-touch-icon.png` (180×180).
     - Sharp rendering + ICO binary packaging for `public/favicon.ico` (32×32).
     - Writing `public/favicon.svg`.
2. **Package Script**:
   - Add `"generate:favicons": "node scripts/generate-favicons.mjs"` to `package.json`.
3. **Execute Generator**:
   - Run `node scripts/generate-favicons.mjs` (or `npm run generate:favicons`).
   - Verify that `public/favicon.svg`, `public/apple-touch-icon.png`, and `public/favicon.ico` exist and are valid.
4. **Template Integration**:
   - Update `src/layouts/BaseLayout.astro` `<head>` with the 3 `<link>` elements.
5. **Validation Checklist**:
   - Run `npm run check:design` (must report 0 anti-patterns).
   - Run `npm test` (all Vitest suites pass).
   - Run `npm run build` (Astro build passes with 0 errors).
   - Visually review the generated SVG in both light and dark mode.
