# Handoff: Homepage Bottom CTA Shader Background Visibility Investigation

## 1. Executive Summary & Objective

The objective is to fix an issue on the homepage ([src/pages/index.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro)) where the living 3D WebGL background shader ([src/components/ShaderBackground/ShaderBackground.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/ShaderBackground.tsx)) is visible behind the fullscreen Hero section (`.hero-fullscreen`) at the top of the page, but **not visible** in the background of the bottom action CTA section ([src/components/BottomCtaSection.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/BottomCtaSection.astro) / `#bottom-cta`) at the bottom of the page.

The previous agent attempted three fixes:
1. Changed `activeSections` from `Set<string>` to `activeElements = new Map<Element, 'presetA' | 'presetB'>()` in [ShaderBackground.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/ShaderBackground.tsx).
2. Changed `.shader-background-viewport` from `background-color: var(--color-canvas-black)` to `background-color: transparent` in [ShaderBackgroundWrapper.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/ShaderBackgroundWrapper.astro).
3. Added `z-index: 1` to `.bottom-cta-section` and slightly lightened the directional scrim gradient in [BottomCtaSection.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/BottomCtaSection.astro).

Despite these changes, **the shader remains invisible at the bottom CTA**. This handoff documents all findings across the DOM, CSS stacking hierarchy, React state machine, and Three.js / `@shadergradient/react` internals, along with concrete next steps for resolution.

---

## 2. Suggested Skills

- `impeccable` (`.agents/skills/impeccable/SKILL.md`): Review visual hierarchy, CSS tokens, and ensure `npm run check:design` passes with 0 anti-patterns.
- `chrome-devtools` (`.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md`): Direct runtime inspection of DOM, computed styles, WebGL canvas, and React/Three.js state in the active browser page (`http://127.0.0.1:4321/`).
- `diagnosing-bugs` (`.agents/skills/diagnosing-bugs/SKILL.md`): Hypothesis-driven debugging loop.

---

## 3. Detailed Investigation Findings

### A. Document Hierarchy & CSS Stacking Contexts
In [src/pages/index.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro) and [src/layouts/BaseLayout.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/layouts/BaseLayout.astro):

```text
<html> (background: var(--color-canvas-black) = #181311 via html:has(body.has-shader-bg))
  <body class="adoptarun-shell has-shader-bg"> (background: transparent)
    <Header />
    <div class="shader-background-viewport"> (position: fixed; inset: 0; z-index: -1; background: transparent)
      <ShaderBackground client:only="react" /> (inner div: position: fixed; inset: 0; z-index: -1)
        <ShaderGradientCanvas> (WebGL canvas: width: 100%; height: 100%)
    <main>
      <section class="hero-fullscreen"> (position: relative; no z-index; background: transparent)
      <div class="homepage-curtain"> (position: relative; z-index: 1; background: var(--color-surface-canvas) = #181311)
        <AboutSection />
        <StatsSection />
        <JourneySection />
      </div>
      <section id="routes-featured" class="featured-routes-section"> (position: relative; no z-index; background: var(--color-canvas-white))
      <div class="homepage-curtain"> (position: relative; z-index: 1; background: var(--color-surface-canvas) = #181311)
        <CharitySection />
      </div>
      <section id="bottom-cta" class="bottom-cta-section"> (position: relative; z-index: 1; background: transparent)
        <div class="bottom-cta-scrim"> (position: absolute; inset: 0; z-index: 1; linear-gradient dusk scrim)
        <div class="bottom-cta-container"> (position: relative; z-index: 2)
      </section>
    </main>
    <footer class="site-footer"> (background: var(--color-surface-canvas) = #181311)
  </body>
</html>
```

Key observations on stacking:
1. **Root Stacking Context**: `html` has `background-color: var(--color-canvas-black)` (`#181311`).
2. **Fixed WebGL Canvas**: Painted at negative stack level (`z-index: -1`) relative to root.
3. **Hero Section**: `position: relative` with `z-index: auto` (stack level 0). Because its background is `transparent`, the negative `z-index` canvas shows through clearly.
4. **Curtains**: `.homepage-curtain` (`z-index: 1`) and `FeaturedRoutesSection` have solid backgrounds (`#181311` and `#fffbf9`), deliberately occluding the shader during middle-page scroll.
5. **Bottom CTA**: Has `z-index: 1` and `background: transparent`. Even with `z-index: 1`, its background is transparent, so it should visually reveal whatever is underneath (stack level 0 through -1), unless masked or occluded.

---

### B. IntersectionObserver Lifecycle & State Machine
In [src/components/ShaderBackground/ShaderBackground.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/ShaderBackground.tsx#L82-L135):

```tsx
const sectionSelectors = [
  { selector: '.hero-fullscreen', preset: 'presetA' as const },
  { selector: '#routes-featured', preset: 'presetB' as const },
  { selector: '#bottom-cta', preset: 'presetA' as const },
];
```

The scroll lifecycle from top to bottom executes as follows:
1. **Initial Page Load (Top / Scroll 0)**:
   - `.hero-fullscreen` is intersecting $\rightarrow$ `activeElements` has `[hero, 'presetA']`.
   - `isSuspended` = `false`, `activePresetKey` = `'presetA'`. Canvas animates.
2. **Scroll Into Curtain 1**:
   - `.hero-fullscreen` leaves viewport $\rightarrow$ `activeElements` is empty.
   - `isSuspended` = `true`. Three.js animation is set to `animate: 'off'`.
3. **Scroll Into `#routes-featured`**:
   - `#routes-featured` has `id="routes-featured"`. Even though its CSS background is solid white (`var(--color-canvas-white)`), it is in `sectionSelectors` with `preset: 'presetB'`.
   - IntersectionObserver triggers $\rightarrow$ `activeElements.set(routes, 'presetB')`.
   - `isSuspended` = `false`, `activePresetKey` = `'presetB'`.
   - `@shadergradient/react` switches to `SHADER_PRESET_B` (Nocturnal Blush: `#a699e5`, `#8490ff`, `#2518e2`, with `positionY: -1.9`, `cPolarAngle: 90`, `cAzimuthAngle: 160`).
4. **Scroll Into Charity Section (Curtain 2)**:
   - `#routes-featured` leaves viewport $\rightarrow$ `activeElements` is empty.
   - `isSuspended` = `true`. Three.js animation clock stops.
5. **Scroll Into `#bottom-cta`**:
   - `#bottom-cta` enters viewport $\rightarrow$ `activeElements.set(cta, 'presetA')`.
   - `isSuspended` = `false`, `activePresetKey` = `'presetA'`.

---

### C. Three.js & `@shadergradient/react` Deep Internals
By inspecting `node_modules/@shadergradient/react/dist/`:
1. **Material Re-compilation on Preset Switch** (`chunk-HXMZSSU4.mjs`):
   - Props (`color1`, `color2`, `color3`, `uSpeed`, etc.) are bundled into uniforms object `D`.
   - `useMemo(() => new MeshPhysicalMaterial(...), [D, ...])` **disposes the existing material and constructs a new material** whenever preset props change.
   - `onBeforeCompile` rewires Three.js shaders.
2. **Camera Controls Transition** (`chunk-6DNZ3I5B.mjs` & `chunk-YIJC6OD2.mjs`):
   - Camera transition uses `CameraControls.rotateTo(azimuth, polar, enableTransition)` and `CameraControls.dollyTo(distance, enableTransition)`.
   - `SHADER_PRESET_A` has `enableTransition: true` with `smoothTime: 0.8`.
3. **Mesh Geometry & Horizon Positioning** (`chunk-27WNIDXB.mjs` & `shaderConfig.ts`):
   - Geometry for `type: 'waterPlane'` is a flat `PlaneGeometry(10, 10, 192, 192)` at `position: [positionX, positionY, positionZ]`.
   - In `SHADER_PRESET_A`:
     - `positionY: 0`
     - `cPolarAngle: 95` (camera is looking slightly upward from below the horizon plane at 95 degrees, where 90 is horizon and 0 is zenith).
     - `cDistance: 2.5`
     - `cameraZoom: 1.0`
   - Because the camera looks *upward* (`95°`) at a flat plane at `Y=0`, the liquid plane occupies the **bottom third** of the 3D projection, while the **upper two-thirds** of the viewport render the canvas's ambient background/void.

---

## 4. Primary Hypotheses for the Root Cause

### Hypothesis 1: The 3D Mesh Horizon & Directional Scrim Occlusion (Most Probable Visual Culprit)
- `BottomCtaSection.astro` has `min-height: 85vh`.
- Overlaid on `#bottom-cta` is `.bottom-cta-scrim`:
  ```css
  background: linear-gradient(
    to bottom,
    rgba(24, 19, 17, 0.4) 0%,
    rgba(24, 19, 17, 0.1) 45%,
    rgba(24, 19, 17, 0.5) 100%
  );
  ```
- Because `SHADER_PRESET_A` has `cPolarAngle: 95` and `positionY: 0`, the upper 60% of the fixed canvas is the dark Three.js scene void (rendered over `html`'s `#181311` black).
- In the hero section, the typography spans `100vh` and the bright orange/coral ripples rise into the lower half.
- In `#bottom-cta`, the section is `85vh`, with `padding-top: 96px` and `padding-bottom: 160px`. The headline is centered in the upper-mid area where the Three.js mesh is either out of view or too dark/deep under the scrim gradient, appearing completely black.
- Furthermore, `SHADER_PRESET_A` in [shaderConfig.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/shaderConfig.ts#L338-L340) was modified to:
  ```ts
  color1: '#89a8deff',  // Light periwinkle blue
  color2: '#ff8484',    // Coral
  color3: '#4e579eff',  // Dark slate blue
  ```
  If `color3` is a dark slate blue and the light waves are situated lower down, the dark dusk base combined with the scrim gradient makes the background look like flat canvas black.

### Hypothesis 2: Intermediate `#routes-featured` Preset Transition State Disruption
- `#routes-featured` has `background-color: var(--color-canvas-white)` (it is completely opaque white).
- However, it triggers `presetB` when scrolled past.
- Immediately after, `CharitySection` sets `isSuspended = true` (which pauses the animation loop and freezes the clock).
- When the user lands on `#bottom-cta`, `ShaderBackground` receives a command to transition from `presetB` back to `presetA` while coming out of suspension.
- If the Three.js camera or material transition gets interrupted or frozen during the intermediate suspension, the WebGL canvas may remain in an unresolved camera state or blank frame.

### Hypothesis 3: Stacking Context Masking or Fixed Viewport Sizing
- In [src/components/ShaderBackground/ShaderBackgroundWrapper.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/ShaderBackgroundWrapper.astro#L16-L26):
  ```css
  .shader-background-viewport {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
    background-color: transparent;
    overflow: hidden;
  }
  ```
- And [src/components/ShaderBackground/ShaderBackground.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/ShaderBackground.tsx#L228-L237) has an identical fixed wrapper with `zIndex: -1`.
- While the previous agent changed `.shader-background-viewport` to `background-color: transparent`, both wrappers define `z-index: -1`.
- In addition, [BottomCtaSection.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/BottomCtaSection.astro#L126) has `z-index: 1;`.
- Check whether any parent container or browser stacking layer is clipping or masking the fixed canvas when scrolled near the document bottom.

---

## 5. Next Steps for the Next Agent

### Step 1: Verify WebGL Canvas State at Bottom CTA via DevTools / Direct Inspection
1. Use the `chrome-devtools` plugin or run an isolated browser check against the active dev server (`http://127.0.0.1:4321/`):
   - Scroll directly to `#bottom-cta`.
   - Inspect `#gradientCanvas`: Is the WebGL `<canvas>` element present, active, and rendering frames?
   - Check `activeElements` map size, `isSuspended` boolean, and `activePresetKey` in React DevTools or via temporary console logs in `ShaderBackground.tsx`.

### Step 2: Remove `#routes-featured` from `sectionSelectors` (Eliminate False Preset B Trigger)
In [src/components/ShaderBackground/ShaderBackground.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/ShaderBackground.tsx#L82-L86):
- `#routes-featured` is currently solid white and not ready for shader reveal (per [src/pages/index.astro:75](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro#L75): *"Observer Seam: Future Routes Feature Section will activate Shader Preset B"*).
- Temporarily remove `{ selector: '#routes-featured', preset: 'presetB' }` so the state machine only manages `.hero-fullscreen` and `#bottom-cta` (both `presetA`).
- This eliminates any preset switching / material recompilation thrashing during page scroll.

### Step 3: Test Disabling Scrim & Adjusting Preset A Camera/Position
1. In [src/components/BottomCtaSection.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/BottomCtaSection.astro#L141):
   - Temporarily set `.bottom-cta-scrim { display: none; }` or `opacity: 0`.
   - If the shader immediately becomes visible, the issue is lighting/scrim contrast and camera horizon.
2. In [src/components/ShaderBackground/shaderConfig.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/shaderConfig.ts#L344-L356) for `SHADER_PRESET_A`:
   - Test elevating the wave horizon: adjust `positionY` (e.g. `-0.5` to `0.5`) or `cPolarAngle` (e.g. `85`–`90` instead of `95`), and verify wave brightness/color visibility in the viewport when centered on `#bottom-cta`.

### Step 4: Stacking & Wrapper Sanity
1. In [src/components/ShaderBackground/ShaderBackground.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/ShaderBackground.tsx#L228-L237), remove the redundant inner `zIndex: -1` on the React root container (since the outer Astro `.shader-background-viewport` already has `z-index: -1`).
2. Verify that `.bottom-cta-section` does not have any unintended background paint from parent containers (`<main>` or `.adoptarun-shell`).

### Step 5: Verification
1. Run `npm run check:design` to guarantee 0 design token regressions.
2. Run `npm run typecheck` to confirm TypeScript and Astro checks pass cleanly.
3. Verify visually in the browser that when scrolling down to the bottom CTA, the liquid shader waves flow visibly behind the 3-line headline and buttons.
