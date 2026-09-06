# Agent Handoff: Design System Alignment & Typography Enforcement

This document provides complete, self-contained context and exact instructions for a second agent to resolve all `DESIGN.md` violations, eliminate arbitrary font sizes and anti-patterns, align Astro components, and wire automated design verification.

---

## 1. Suggested Skills

The implementing agent should invoke:
1. **`impeccable`**: Run the design detector (`node .agents/skills/impeccable/scripts/detect.mjs src/`) to verify zero design-system anti-patterns.
2. **`tdd`**: Execute and maintain Vitest test suites (`npm test`).
3. **`code-review`**: Review the diff against [DESIGN.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md) rules.

---

## 2. Context Boundaries: Where to Look & What to Ignore

### Read ONLY These Exact Files:
1. [DESIGN.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md) (Lines 1–82 frontmatter, Lines 84–265 specification rules).
2. [src/styles/tokens.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/tokens.css): Typography and spacing tokens.
3. [src/styles/components.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css): Component styles (`.badge-group-run`, `.nav-brand-cta`, `.announcement-link`, `.nav-link`, `.nav-mobile-toggle`, `.mobile-nav-close`, footer links).
4. [src/pages/index.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro): Inline styles in hero and route showcase.
5. [src/components/IslandVerification.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/IslandVerification.tsx): React island component inline styles.
6. [src/layouts/BaseLayout.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/layouts/BaseLayout.astro): Page title and Open Graph metadata casing.
7. [package.json](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/package.json): Script definitions.
8. [AGENTS.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/AGENTS.md): Agent rules.
9. [tests/styles/lumos.test.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/styles/lumos.test.ts) & [tests/smoke.test.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/smoke.test.tsx): Unit and smoke tests.

### Strictly DO NOT Read Or Ingest:
* **`docs/archive/`**: **Strictly forbidden.** Treat as deprecated and never open or reference per repository rules in `AGENTS.md`.
* **`src/stores/shell.ts`**: Store logic is verified and needs no modifications.
* **`src/pages/api/health.ts`**: Backend health check is verified and out of scope.
* **`.agents/skills/` (except running `detect.mjs`)**: Do not edit skill plumbing or detector code.

---

## 3. The Violations to Fix

### A. Font Size Drift & Arbitrary Values
1. `.announcement-link`: Uses hardcoded `font-size: 13px;` in [src/styles/components.css:156](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L156).
2. `.footer-coordinates`, `.footer-link`, `.footer-copyright`: Use hardcoded `font-size: 13px;` in [src/styles/components.css:344, 357, 369](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L344-L369).
3. `.nav-mobile-toggle`: Uses hardcoded `font-size: 14px;` in [src/styles/components.css:216](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L216).
4. `.mobile-nav-close`: Uses hardcoded `font-size: 24px;` in [src/styles/components.css:284](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L284).
5. `.nav-brand-cta .brand-run`: Uses `font-size: 22px; font-weight: 700;` in [src/styles/components.css:129-130](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L129-L130). Must be weight 200, width 125, line-height 0.69em per [DESIGN.md#L205](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md#L205).
6. `.nav-link`: Uses `font-size: 16px;` in [src/styles/components.css:197](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L197). [DESIGN.md#L216](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md#L216) explicitly mandates Runda Medium 20px, line-height 1.0.
7. [src/pages/index.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro):
   - Line 36: `style="font-size: 14px; font-weight: 600;"` on distance `14km`.
   - Line 38: `style="font-size: 24px; font-weight: 700;"` on route card heading.
   - Line 41: `style="font-size: 16px; line-height: 1.3;"` on description.
   - Lines 45–46: `style="font-size: 14px; font-weight: 500;"` on telemetry items.
8. [src/components/IslandVerification.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/IslandVerification.tsx):
   - Line 26: `fontSize: '1.25rem'` on heading.

### B. Weight Ceiling Rule Violations (Max Weight 500 in Runda)
1. [src/styles/components.css:130](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L130): `font-weight: 700;` on `.brand-run`.
2. [src/pages/index.astro:36](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro#L36): `font-weight: 600;` on Runda text.
3. [src/pages/index.astro:38](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro#L38): `font-weight: 700;` on Runda text.
4. [src/components/IslandVerification.tsx:39](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/IslandVerification.tsx#L39): `fontWeight: 'bold'`.

### C. Zero Radius Rule Violations
1. [src/components/IslandVerification.tsx:20](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/IslandVerification.tsx#L20): `borderRadius: '8px'`.
2. [src/components/IslandVerification.tsx:38](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/IslandVerification.tsx#L38): `borderRadius: '4px'`.

### D. Color Palette Violations
1. [src/components/IslandVerification.tsx:19,21,22,27,28,35,36](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/IslandVerification.tsx#L19-L36): Uses `#333`, `#111`, `#fff`, `#aaa`, `#000`, and `#00ff88` (unsanctioned electric green). Must use `--color-surface-canvas`, `--color-canvas-white`, `--color-text-primary`, and `--color-route-orange` or `--color-group-run-green`.

### E. Lowercase Identity Rule Violations
1. [src/styles/components.css:73](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css#L73): `.badge-group-run` has `text-transform: uppercase;`. Must be `text-transform: lowercase;`.
2. [src/layouts/BaseLayout.astro:17, 49](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/layouts/BaseLayout.astro#L17): `title = 'Adopt A Run...'` and `og:site_name = "Adopt A Run"`. Must be lowercase `'adopt a run...'`.
3. [src/components/IslandVerification.tsx:43](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/IslandVerification.tsx#L43): Button text is `"Increment Counter"`. Must be `"increment counter"`.

---

## 4. Exact Implementation Steps

### Step 1: Update [DESIGN.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md) Frontmatter
Add the explicit `scale` map under `typography` so Impeccable's parser validates all sanctioned steps:
```yaml
typography:
  scale:
    micro: "12px"
    label: "16px"
    body: "20px"
    metric: "24px"
    wordmark: "48px"
    title: "64px"
    headline: "80px"
    display: "160px"
  display:
    fontFamily: "Degular Display, system-ui, sans-serif"
    fontSize: "clamp(4rem, 8vw, 10rem)"
    fontWeight: 600
    lineHeight: 0.8
  headline:
    fontFamily: "Degular Display, system-ui, sans-serif"
    fontSize: "80px"
    fontWeight: 500
    lineHeight: 0.8
  title:
    fontFamily: "Degular Display, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 400
    lineHeight: 0.8
  body:
    fontFamily: "Runda, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.0
  label:
    fontFamily: "Runda, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.0
```

### Step 2: Update [src/styles/tokens.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/tokens.css)
Add discrete typographic size tokens and lock `--font-fluid-label` minimum to `1rem` (16px):
```css
    /* Discrete Typography Tokens (DESIGN.md scale) */
    --font-size-micro: 12px;
    --font-size-label: 16px;
    --font-size-body: 20px;
    --font-size-metric: 24px;
    --font-size-wordmark: 48px;
    --font-size-title: 64px;
    --font-size-headline: 80px;
    --font-size-display: 160px;

    /* Semantic Font Families & Fluid Clamp Typography */
    --font-display: 'Degular Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    --font-body: 'Runda', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif;
    --font-wordmark: 'Scale VF', system-ui, sans-serif;
    --font-chinese: 'Source Han Sans HK VF', system-ui, sans-serif;
    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

    --font-fluid-display: clamp(4rem, 8vw, 10rem);
    /* 64px - 160px */
    --font-fluid-headline: clamp(3.5rem, 6vw, 5rem);
    /* 56px - 80px */
    --font-fluid-title: clamp(2.5rem, 4.5vw, 4rem);
    /* 40px - 64px */
    --font-fluid-body: clamp(1rem, 1.25vw, 1.25rem);
    /* 16px - 20px */
    --font-fluid-label: clamp(1rem, 1.2vw, 1rem);
    /* Locked to 16px */
```

### Step 3: Refactor [src/styles/components.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css)
1. **`.badge-group-run` (Line 73)**:
   Change `text-transform: uppercase;` to `text-transform: lowercase;`.
2. **`.nav-brand-cta .brand-run` (Lines 127–133)**:
   ```css
   .nav-brand-cta .brand-run {
     font-family: var(--font-wordmark);
     font-size: var(--font-size-body);
     font-variation-settings: 'wdth' 125, 'wght' 200;
     font-weight: 200;
     line-height: 0.69;
     color: var(--color-pure-white);
   }
   ```
3. **`.announcement-link` (Lines 153–161)**:
   Change `font-size: 13px;` to `font-size: var(--font-size-label);`.
4. **`.nav-link` (Lines 195–204)**:
   Change `font-size: 16px;` to `font-size: var(--font-size-body);` (20px per DESIGN.md § Navigation).
5. **`.nav-mobile-toggle` (Lines 209–220)**:
   Change `font-size: 14px;` to `font-size: var(--font-size-label);`.
6. **`.mobile-nav-close` (Lines 280–289)**:
   Change `font-size: 24px;` to `font-size: var(--font-size-body);`.
7. **Footer (Lines 342–372)**:
   - `.footer-coordinates`: `font-size: var(--font-size-micro);`
   - `.footer-link`: `font-size: var(--font-size-label);`
   - `.footer-copyright`: `font-size: var(--font-size-micro);`

### Step 4: Refactor [src/pages/index.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro)
Eliminate off-ramp inline sizes and weight ceiling breaches in the demo card:
```astro
        <!-- Route Card Sample -->
        <article class="card-route p-micro-frame">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-04);">
            <span class="badge-group-run">group run</span>
            <span class="u-text-mono" style="font-size: var(--font-size-label); font-weight: 500;">14km</span>
          </div>
          <h3 style="font-family: var(--font-body); font-size: var(--font-size-body); font-weight: 500; margin-bottom: var(--space-02);">
            happy valley boar
          </h3>
          <p style="font-family: var(--font-body); font-size: var(--font-size-label); line-height: var(--leading-body); margin-bottom: var(--space-06);">
            winding ridgeline loop tracing the northern contours through wanchai gap and bowen road.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto;">
            <span style="font-family: var(--font-body); font-size: var(--font-size-micro); font-weight: 500;">est. 85 min</span>
            <span style="font-family: var(--font-body); font-size: var(--font-size-micro); font-weight: 500;">elev. +320m</span>
          </div>
        </article>
```

### Step 5: Refactor [src/components/IslandVerification.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/IslandVerification.tsx)
Remove arbitrary colors, non-zero border-radii, and title casing:
```tsx
import React, { useState } from 'react';

export interface IslandVerificationProps {
  title?: string;
  initialCount?: number;
}

export const IslandVerification: React.FC<IslandVerificationProps> = ({
  title = 'adopt a run island',
  initialCount = 1200,
}) => {
  const [count, setCount] = useState<number>(initialCount);

  return (
    <div
      data-testid="island-verification"
      style={{
        padding: 'var(--space-06)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '0px',
        backgroundColor: 'var(--color-surface-canvas)',
        color: 'var(--color-canvas-white)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <h3 style={{ margin: '0 0 var(--space-03) 0', fontSize: 'var(--font-size-body)', fontWeight: 500, textTransform: 'lowercase' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 var(--space-05) 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-label)', lineHeight: 'var(--leading-body)' }}>
        current count: <strong style={{ color: 'var(--color-group-run-green)', fontWeight: 500 }}>{count}</strong>
      </p>
      <button
        type="button"
        onClick={() => setCount((prev) => prev + 1)}
        className="btn btn-primary"
        style={{
          padding: 'var(--space-03) var(--space-06)',
          fontSize: 'var(--font-size-label)',
        }}
      >
        increment counter
      </button>
    </div>
  );
};

export default IslandVerification;
```
*(Note: [tests/smoke.test.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/smoke.test.tsx) uses regex `/Increment Counter/i` and `/Current Count/i`, so lowercase text will pass tests).*

### Step 6: Update [src/layouts/BaseLayout.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/layouts/BaseLayout.astro)
Change default `title` and `og:site_name` to lowercase:
- Line 17: `title = 'adopt a run — gps art community movement'`
- Line 49: `<meta property="og:site_name" content="adopt a run" />`

### Step 7: Update [package.json](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/package.json) & [AGENTS.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/AGENTS.md)
1. Add design check script to `package.json`:
   ```json
   "scripts": {
     "check:design": "node .agents/skills/impeccable/scripts/detect.mjs src/",
     "test": "vitest run && npm run check:design"
   }
   ```
2. In `AGENTS.md`, add under `## Agent skills`:
   ```markdown
   ### Design system enforcement
   All UI, layout, and style code must strictly comply with `DESIGN.md`. Never use arbitrary `px` or `rem` font sizes. Use defined tokens from `src/styles/tokens.css`. Before declaring any frontend task complete, agents must run `npm run check:design` and ensure 0 anti-patterns are reported.
   ```

### Step 8: Update Style Test Suite [tests/styles/lumos.test.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/styles/lumos.test.ts)
Assert the presence of the discrete tokens (`--font-size-micro`, `--font-size-label`, `--font-size-body`, etc.) in `tokens.css`.

---

## 5. Verification Commands

1. **Run Design System Detector**:
   ```bash
   node .agents/skills/impeccable/scripts/detect.mjs src/
   ```
   **Expected output**: `0 anti-patterns found.` (exit code 0).

2. **Run Full Test Suite**:
   ```bash
   npm test
   ```
   **Expected output**: All test suites pass including `lumos.test.ts`, `smoke.test.tsx`, and `Header.test.tsx`.
