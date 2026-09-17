# Handoff: Fix Chrome Header Translucent Background via Real DOM Veil

## 1. Objective

Resolve the regression where the sticky header background on Chromium browsers (Google Chrome, Edge, Arc, Brave) fails to render the translucent frosted glass blur on scroll, displaying only an opaque darkening gradient scrim. Implement the **Real DOM Veil** architecture ([`.site-header-veil`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/Header.astro#L39)) to bypass Blink's pseudo-element backdrop root detachment, while strictly maintaining the static blur performance invariant in [`DESIGN.md`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md#L249).

---

## 2. Suggested Skills

The implementing agent should activate:
- `/implement`: Main implementation execution workflow.
- `impeccable`: For design system token verification and running `npm run check:design`.

---

## 3. Invariants & Repository Rules

1. **Static Blur Rule ([`DESIGN.md:L249`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md#L249)):** The blur radius must remain static at 28px (`--header-blur`) and saturation at 170% (`--header-saturate`). Only `opacity` animates when transitioning to the stuck state (`[data-stuck]`). Do not animate `backdrop-filter: blur(0px)` &rarr; `blur(28px)`.
2. **Design System Enforcement:** Run `npm run check:design` with `BypassSandbox: true` before declaring completion; 0 anti-patterns must be reported.
3. **Seam Boundaries:** Do not mock or regex-parse `.astro` templates in Vitest. Verify via `npm test`, `npm run check:design`, and visual verification.
4. **Sandbox Execution:** Run all build, test, and design check commands with `BypassSandbox: true`.

---

## 4. Root Cause Analysis & Background Findings

### The Preceding Investigation
This issue was previously addressed in **Conversation `c6de69e5-80f7-451c-a8db-1b4c38fc78b7`** (commit [`0e26829`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css)).

In Chromium's Blink rendering engine, an element with `backdrop-filter` samples pixels behind it only within its nearest **backdrop root** (CSS Filter Effects Module Level 2):
1. **Backdrop Root Isolation:** Originally, [`.site-header`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L546) had `isolation: isolate;`. Because the veil was on a child pseudo-element `.site-header::before` with `z-index: -1`, Chrome only sampled pixels within `.site-header` behind `::before`. Since no content was painted behind `::before` within that isolated context, Chrome rendered 0 blur, displaying only the CSS linear gradient scrim (`--color-header-veil-top` &rarr; `--color-header-veil-bottom`).
2. **Pseudo-Element Compositor Detachment (Chromium Bugs 1152778 & 1205161):** Although `isolation: isolate` was removed in commit `0e26829`, Blink has a persistent compositor bug when handling CSS generated pseudo-elements (`::before` / `::after`) that combine `position: absolute;`, `backdrop-filter`, and an `opacity` transition from `0` to `1`. In many Chromium compositing trees, the pseudo-element's `PaintLayer` fails to attach to the root compositor backdrop pass, causing it to sample an unpopulated black or clear framebuffer.
3. **Sibling Backdrop Layer Collision:** In [`src/styles/components.css:L1658`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L1658):
   ```css
   body.has-shader-bg > main {
     clip-path: inset(-100vh 0 calc(-1 * var(--safe-inset-bottom)) 0);
   }
   ```
   `<main>` has `clip-path`, forming a separate offscreen composited texture layer. Because [`<Header />`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/Header.astro) is a preceding **sibling** of `<main>` in [`BaseLayout.astro`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/layouts/BaseLayout.astro#L120-L121), Chrome's compositor can fail to include `<main>`'s clipped content when a pseudo-element on `<header>` requests a backdrop copy.

---

## 5. Solutions Explored & Rationale

| Solution | Mechanism | Trade-off / Decision |
| :--- | :--- | :--- |
| **A. Direct Blur on `.site-header[data-stuck]`** | Put `backdrop-filter: blur(28px)` directly on `.site-header[data-stuck]` with a transition from `blur(0px)`. | **Rejected:** Violates [`DESIGN.md:L249`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md#L249). Animating `blur()` forces per-frame Gaussian shader passes on the GPU, causing frame drops on lower-powered devices. |
| **B. Pure CSS Hardware Hint on `::before`** | Add `will-change: opacity, backdrop-filter; transform: translateZ(0);` to `.site-header::before`. | **Rejected as brittle:** Chromium's pseudo-element PaintLayer attachment bug is inconsistent across Blink patch versions. |
| **C. Real DOM Veil Element (`.site-header-veil`)** *(Chosen Solution)* | Insert an explicit `<div class="site-header-veil" aria-hidden="true"></div>` inside `<header>`. Move the veil background, blur, and border to this element. | **Selected:** Gives Blink an explicit DOM `LayoutObject` with a direct parent-child stacking relationship. Promotes cleanly to a compositor layer via `will-change: opacity; transform: translateZ(0);`. Complies 100% with [`DESIGN.md`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md#L249). |

---

## 6. Exact Implementation Instructions

### Step 1: Add Veil DOM Element in [`src/components/Header.astro`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/Header.astro)

Locate the `<header>` element at lines 39–41:
```astro
<div class="site-header-sentinel" aria-hidden="true"></div>
<header class:list={['site-header', className]} {...restProps}>
  <!-- Insert the veil div as the first child of header -->
  <div class="site-header-veil" aria-hidden="true"></div>
  <!-- One landmark for the whole row: the CTA, links and menu toggle are all navigation -->
  <nav class="site-header-grid" aria-label="Primary">
```

### Step 2: Refactor Header Styles in [`src/styles/components.css`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css)

Locate lines 546–606:

1. **Replace `.site-header::before` and `.site-header::after`** with `.site-header-veil`:
   ```css
   /* -------------------------------------------------------------
      Site Header (5-Column Grid & Sticky Shell)
      ------------------------------------------------------------- */
   .site-header {
     position: sticky;
     top: 0;
     z-index: 100;
     width: 100%;
     height: var(--header-height);
     box-sizing: border-box;
     display: flex;
     align-items: center;
     padding-block: max(var(--space-04), var(--safe-inset-top)) var(--space-04);
     padding-inline: max(var(--page-gutter), var(--safe-inset-left)) max(var(--page-gutter), var(--safe-inset-right));
   }

   /* Sentinel pinned to the document top; the header observes it to know
      when it has left the top of the page (single source of truth). */
   .site-header-sentinel {
     position: absolute;
     top: 0;
     left: 0;
     width: 1px;
     height: var(--space-03);
     pointer-events: none;
     visibility: hidden;
   }

   /* Veil: a tinted, saturated blur closed off by a hairline, with soft ambient depth.
      Only opacity animates; the blur itself stays static (DESIGN.md).
      Implemented on a real DOM element (.site-header-veil) to ensure Blink creates a stable
      compositing layer and avoids pseudo-element backdrop root detachment bugs in Chromium. */
   .site-header-veil {
     position: absolute;
     inset: 0;
     pointer-events: none;
     background: linear-gradient(to bottom,
         var(--color-header-veil-top) 0%,
         var(--color-header-veil-bottom) 100%);
     backdrop-filter: blur(var(--header-blur)) saturate(var(--header-saturate));
     -webkit-backdrop-filter: blur(var(--header-blur)) saturate(var(--header-saturate));
     border-bottom: 1px solid var(--color-border-subtle);
     box-shadow: 0 var(--space-03) var(--space-06) calc(-1 * var(--space-04)) var(--color-header-shadow);
     opacity: 0;
     transform: translateZ(0);
     will-change: opacity;
     transition: opacity var(--duration-moderate) var(--ease-out-expo);
   }

   .site-header[data-stuck] .site-header-veil {
     opacity: 1;
   }

   .site-header-grid {
     position: relative;
     z-index: 1;
     transition: opacity var(--duration-normal) var(--ease-out-expo);
     display: grid;
     grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr;
     align-items: center;
     gap: var(--space-06);
     max-width: var(--container-max-width);
     margin: 0 auto;
     width: 100%;
   }
   ```

2. **Update Reduced Motion Query (Line ~715):**
   Replace references to `.site-header::before, .site-header::after` with `.site-header-veil`:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .nav-brand-cta .brand-run,
     .nav-brand-cta .brand-with,
     .nav-brand-cta::after,
     .site-header-veil {
       transition-duration: 0.01ms;
     }
     ...
   }
   ```

### Step 3: Inspect Sibling Compositing Layer on `<main>`

Check [`src/styles/components.css:L1658`](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L1658):
```css
body.has-shader-bg > main {
  clip-path: inset(-100vh 0 calc(-1 * var(--safe-inset-bottom)) 0);
}
```
If testing in Chrome shows that `<main>`'s `clip-path` still prevents backdrop sampling for the sibling header:
- Move the bottom safe-area clip from `<main>` to `.shader-background-viewport` (or use `overflow: clip` on the shader wrapper), removing `clip-path` from `<main>` so `<main>` remains in the root backdrop copy pass.

---

## 7. Verification Checklist

Execute all commands with `BypassSandbox: true`:

```bash
# 1. Verify design tokens (0 anti-patterns required)
npm run check:design

# 2. Run unit and integration tests
npm test

# 3. Verify production build and check-build guards
npm run build
```

### Visual Verification
1. Open http://localhost:4321 in Google Chrome.
2. At scroll 0 (top of page), verify the header is transparent over the hero canvas.
3. Scroll down 200px past the hero. Verify:
   - Header receives `[data-stuck]` attribute.
   - `.site-header-veil` transitions opacity to `1`.
   - The background displays a distinct **28px frosted-glass translucent blur** over the passing text, cards, and images, rather than an opaque dark gradient scrim.
   - Navigation links, CTA, and menu controls remain fully clickable.
