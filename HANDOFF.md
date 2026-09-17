# Handoff: Apply Astro Best Practices Across the Homepage (Issue #25)

## 1. Objective

Implement **GitHub Issue #25** ("Apply Astro best practices across the homepage"). Refactor the homepage to follow Astro's recommended patterns for images, hydration, scripts, and fonts, reducing JavaScript bundle size, eliminating dead code, and optimizing runtime performance without visual regressions.

The implementation plan has been completely aligned and approved with the user via `/grill-me`. All decisions, trade-offs, and technical solutions are locked and detailed below.

---

## 2. Suggested Skills

The implementing agent should activate:
- `/implement`: Main implementation execution workflow.
- `tdd`: For running and updating unit/integration tests (`tests/stores/shell.test.ts`, `tests/smoke.test.tsx`).
- `impeccable`: For design system token compliance and running `npm run check:design`.
- `web-perf`: For inspecting asset sizes and build bundle metrics.

---

## 3. Invariants & Execution Rules

1. **Sandbox Execution Invariant:** Always run `npm test`, `npm run check:design`, and `npm run build` with `BypassSandbox: true` on the first attempt (required for `.agents/` scripts and environment access).
2. **Design System Enforcement:** Before declaring completion, run `npm run check:design` and ensure 0 anti-patterns are reported.
3. **No Visual / Layout Drift:** Text fitting in `AboutSection` must still wait on fonts via native `document.fonts.ready`. Parallax and wave motion on the WebGL shader must remain smooth without stutter.
4. **Build Metrics to Record:**
   - **Baseline (Before):** `dist/client/index.html` = `484 KB`, `ShaderBackground` chunk = `1.1 MB`, raw public dead assets = `~788 KB`.
   - Record and note final sizes after implementation for the PR summary.

---

## 4. Exact Implementation Specifications

### Step 1: Fonts & Metadata

#### [BaseLayout.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/layouts/BaseLayout.astro)
1. **Typekit CSS Link (Lines 89–101):**
   - Delete the `<script is:inline>` block that loads `pyi8tbr.js` and sets legacy `wf-loading`/`wf-inactive` classes.
   - Replace with a direct stylesheet link:
     ```html
     <link rel="preconnect" href="https://use.typekit.net" crossorigin />
     <link rel="preconnect" href="https://p.typekit.net" crossorigin />
     <link rel="stylesheet" href="https://use.typekit.net/pyi8tbr.css" />
     ```
2. **Meta Tags Correction (Lines 105 & 120–126):**
   - Delete line 105: `<meta name="title" content={title} />` (invalid meta tag; `<title>` handles page title).
   - Change all Twitter meta tags from `property="twitter:*"` to `name="twitter:*"`:
     ```html
     <meta name="twitter:card" content="summary_large_image" />
     <meta name="twitter:url" content={canonicalURL} />
     <meta name="twitter:title" content={title} />
     <meta name="twitter:description" content={description} />
     <meta name="twitter:image" content={ogImageURL} />
     <meta name="twitter:image:alt" content={ogImageAlt} />
     ```
3. **Canonical Homepage Detection (Line 38):**
   - Replace `Astro.url.pathname === '/' || Astro.url.pathname === ''` with `isHomePage(Astro.url.pathname)` imported from `@/utils/homepage-content`.

---

### Step 2: Assets Migration & Modern Formats (`astro:assets`)

#### 1. Move Images to `src/assets/images/`
Create `src/assets/images/` and relocate the following source files from `public/images/`:
- `public/images/about/community-puppy.jpg` &rarr; `src/assets/images/about/community-puppy.jpg`
- `public/images/about/exercise-runners.jpg` &rarr; `src/assets/images/about/exercise-runners.jpg`
- `public/images/about/art-artlane.jpg` &rarr; `src/assets/images/about/art-artlane.jpg`
- `public/images/journey/mesh-backdrop.jpg` &rarr; `src/assets/images/journey/mesh-backdrop.jpg`
- `public/images/charity/spca-puppy.jpg` &rarr; `src/assets/images/charity/spca-puppy.jpg`

#### 2. Delete Unused Public Assets
- Delete `public/images/hero-sample-bg.jpg`
- Delete `public/images/stats/` directory (`stat-artwork.jpg`, `torn-paper-mask.png`)
- Delete `public/.DS_Store`
- Remove the vacated directories in `public/images/` (`about/`, `journey/`, `charity/`).

#### 3. [src/utils/homepage-content.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/utils/homepage-content.ts)
- Add canonical helper:
  ```ts
  export function isHomePage(pathname: string): boolean {
    const normalized = pathname.replace(/\/+$/, '') || '/';
    return normalized === '/';
  }
  ```

#### 4. [AboutSection.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/AboutSection.astro)
- Import `{ Image } from 'astro:assets';`
- Import local images:
  ```ts
  import imgCommunity from '@/assets/images/about/community-puppy.jpg';
  import imgExercise from '@/assets/images/about/exercise-runners.jpg';
  import imgArt from '@/assets/images/about/art-artlane.jpg';
  ```
- Replace raw `<img>` tags inside `.pic-community`, `.pic-exercise`, `.pic-art` with:
  ```astro
  <Image
    src={imgCommunity}
    alt=""
    widths={[240, 480, 720]}
    format="webp"
    loading="lazy"
    decoding="async"
  />
  ```
  *(Apply correspondingly for `imgExercise` and `imgArt`).*
- In `<script>` (lines 587–591), remove the redundant:
  ```ts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutSection);
  } else {
    initAboutSection();
  }
  ```
  Replace with direct call: `initAboutSection();` (Astro scripts are module scripts that execute after document parsing).

#### 5. [JourneySection.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/JourneySection.astro)
- Import `{ getImage } from 'astro:assets';` and `import meshBackdrop from '@/assets/images/journey/mesh-backdrop.jpg';`.
- Generate optimized image URL in frontmatter:
  ```ts
  const optimizedMesh = await getImage({ src: meshBackdrop, format: 'webp', width: 320 });
  ```
- Pass to style on `.journey-badge-square`: `style={`--mesh-bg: url(${optimizedMesh.src})`}` and update `.journey-badge-square` CSS to use `background-image: var(--mesh-bg, url('/images/journey/mesh-backdrop.jpg'))`.
- Fix stale comment on line 68: Update comment to reflect that Journey gutters diverge on phones (`var(--space-05)` vs About's `var(--space-06)`).

#### 6. [CharitySection.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/CharitySection.astro)
- Fix stale comment on line 280: Change "15% above the viewport bottom" to "5% above the viewport bottom" (matching `rootMargin: '0px 0px -5% 0px'`).
- In `<script>` (lines 377–381), remove redundant `DOMContentLoaded` check and call `initCharityComponent();` directly.

---

### Step 3: Hydration & Pure-WebGL Shader Performance

#### 1. [shaderConfig.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/shaderConfig.ts)
- Line 463: Change `powerPreference: 'high-performance'` to `powerPreference: 'low-power'`.

#### 2. [ShaderBackground.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/ShaderBackground.tsx)
- Remove `const [cameraTilt, setCameraTilt] = useState(...)`.
- Remove `cAzimuthAngle: base.cAzimuthAngle + cameraTilt.azimuth` and `cPolarAngle: base.cPolarAngle + cameraTilt.polar` from `activeConfig`. Pass base angles directly.
- In `handlePointerMove` and `handleScroll`: Keep tracking mutable `mouseTargetRef.current` and `scrollTargetRef.current`. Do **not** call `setCameraTilt` or trigger React state.
- Create a pure-WebGL `<WebGLParallaxRig />` component using `@react-three/fiber`'s `useFrame`:
  ```tsx
  import { useFrame } from '@react-three/fiber';

  interface ParallaxRigProps {
    mouseRef: React.RefObject<{ x: number; y: number }>;
    scrollRef: React.RefObject<number>;
    isSuspended: boolean;
    prefersReducedMotion: boolean;
  }

  function WebGLParallaxRig({ mouseRef, scrollRef, isSuspended, prefersReducedMotion }: ParallaxRigProps) {
    useFrame(({ scene }) => {
      if (isSuspended || prefersReducedMotion) return;
      const targetRotY = (mouseRef.current?.x ?? 0) * 0.12 + (scrollRef.current ?? 0) * 0.04;
      const targetRotX = (mouseRef.current?.y ?? 0) * 0.06;
      scene.rotation.y += (targetRotY - scene.rotation.y) * 0.05;
      scene.rotation.x += (targetRotX - scene.rotation.x) * 0.05;
    });
    return null;
  }
  ```
- Place `<WebGLParallaxRig mouseRef={mouseTargetRef} scrollRef={scrollTargetRef} isSuspended={isSuspended} prefersReducedMotion={prefersReducedMotion} />` inside `<ShaderGradientCanvas>`.
- In `useEffect` (lines 148–171): Delete the `MutationObserver` fallback. DOM elements exist when client component runs.

#### 3. [ShaderBackgroundWrapper.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/ShaderBackground/ShaderBackgroundWrapper.astro)
- Mount the shader after the page is idle so the critical rendering path is uninterrupted.
- Replace `<ShaderBackground client:only="react" />` with an idle client mount pattern (e.g. `<ShaderBackground client:idle={{ timeout: 800 }} />` or idle-deferred client-only wrapper).

#### 4. [Header.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/Header.astro)
- Line 90: Change `<MobileNavDrawer client:load />` to `<MobileNavDrawer client:media="(max-width: 768px)" />`.

#### 5. [BottomCtaSection.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/BottomCtaSection.astro)
- Line 105: Delete `document.addEventListener('astro:page-load', setupPassTorch);` (dead code without `<ClientRouter />`).

---

### Step 4: Sanity Client Consolidation

#### [astro.config.mjs](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/astro.config.mjs)
- Remove the `sanity({...})` integration from `integrations: [...]`.
- Keep `react()`, `@astrojs/cloudflare`, and the `@sanity/astro` package installed (used by `<VisualEditing />` in `src/pages/preview/index.astro`).
- All queries, images, schemas, and preview tokens continue to use `@/sanity/client`.

---

### Step 5: Dead Code Removal & Tests Modernization

#### 1. Delete Dead Files
- Delete `src/components/IslandVerification.tsx`
- Delete `src/utils/gpx-parser.ts`

#### 2. [src/stores/shell.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/stores/shell.ts)
- Delete lines 71–73 (`toggleNav`).
- Delete lines 83–96 (`$isLogModalOpen`, `toggleLogModal`, `openLogModal`, `closeLogModal`).

#### 3. [tests/smoke.test.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/smoke.test.tsx)
- Replace `IslandVerification` import and test cases with verification of `AnnouncementBanner` or core island mounting.

#### 4. [tests/stores/shell.test.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/stores/shell.test.ts)
- Remove test cases asserting on `toggleNav` and `$isLogModalOpen`.

---

## 5. Verification Commands

Run with `BypassSandbox: true`:

```bash
# 1. Typecheck and unit tests
npm test

# 2. Design system token check (must report 0 anti-patterns)
npm run check:design

# 3. Production build and security guard check
npm run build
```

Confirm that `scripts/check-build.mjs` outputs `check-build: 8 HTML file(s) clean.` and all 24+ test files pass cleanly.
