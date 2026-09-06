# Agent Handoff: Enforce Line Heights with CSS Tokens (Lumos Framework)

This document provides complete, self-contained context and exact instructions for a second agent to enforce line heights across the project using CSS design tokens following the **Lumos Framework** architecture (`@layer base, patterns, components, utilities`), and ensure all existing/already written code automatically updates to conform.

---

## 1. Suggested Skills

The implementing agent should invoke:
1. **`tdd`**: Execute and update Vitest test suites (`npm test` / `npx vitest run`).
2. **`impeccable`**: Run design checks (`npm run check:design`) to guarantee zero design system anti-patterns.
3. **`code-review`**: Verify that all changes comply with [DESIGN.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md) and Lumos layer conventions.

---

## 2. Context Boundaries: Where to Look & What to Ignore

### Read ONLY These Exact Files:
1. [DESIGN.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md): Design system typography rules.
2. [src/styles/tokens.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/tokens.css): Root token definitions in `@layer base`.
3. [src/styles/base.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/base.css): Universal element resets in `@layer base`.
4. [src/styles/components.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css): Component styles in `@layer components`.
5. [src/styles/utilities.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/utilities.css): Utility classes in `@layer utilities`.
6. [tests/styles/lumos.test.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/styles/lumos.test.ts): Unit tests validating token contracts and styling layers.
7. [AGENTS.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/AGENTS.md): Agent rules.

### Strictly DO NOT Read Or Ingest:
- **`docs/archive/`**: **Strictly forbidden.** Deprecated documentation per `AGENTS.md`. Never read or reference.
- **`src/stores/shell.ts`**: Shell store logic is complete and unaffected.
- **`src/pages/api/health.ts`**: API routes are unaffected.

---

## 3. Specifications & Decision Summary

| Target | Font / Element Context | Required Line Height | Proposed Lumos Token | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Editorial Headings / Display** | Degular Display | `80%` (`0.8`) | `--leading-compressed: 0.8;`<br>`--leading-display: 0.8;` | Compression rule for high-density editorial display |
| **Body & Metadata** | Runda | `100%` (`1.0`) | `--leading-body: 1.0;` | Clean geometric readability at 100% |
| **Wordmark / Brand Lockup** | Scale VF & Runda paired with wordmark | `75%` (`0.75`) | `--leading-wordmark: 0.75;` | Tight brand lockup in `.nav-brand-cta` ("run with us") |
| **CTAs, Buttons & Clickables** | Buttons, links, dismissals, toggles | `80%` (`0.8`) | `--leading-action: 0.8;`<br>`--leading-cta: 0.8;` | Compact, button-aligned interactive typography |
| **Global Baseline** | All other elements (p, inputs, containers) | `100%` (`1.0`) | `--leading-default: 1.0;` | 100% default cascade across the document |

> [!NOTE]
> **Unitless Multipliers**: Tokens are declared as unitless numbers (`0.8`, `1.0`, `0.75`) in CSS rather than percentage strings (`80%`, `100%`, `75%`). Unitless values ensure child elements scale their line height proportionally with their own `font-size`, preventing computed pixel inheritance bugs.

---

## 4. How Already Written Code Updates Automatically

1. **Cascade through `@layer base`**:
   - Setting `html, body { line-height: var(--leading-default); }` ensures all unstyled elements, generic text, paragraphs, and containers across existing pages immediately default to `100%` (`1.0`).
   - Setting `button, [role="button"], input[type="button"], input[type="submit"] { line-height: var(--leading-action); }` automatically applies `80%` (`0.8`) to all existing and future native buttons and interactive controls.

2. **Propagation through `@layer components`**:
   - Updating `.btn` from `line-height: var(--leading-body);` to `line-height: var(--leading-action);` propagates `80%` across all instances of buttons in existing templates (e.g. `.btn-primary`, `.btn-secondary`, `.mobile-cta-btn` in `index.astro`, `IslandVerification.tsx`, and `MobileNavDrawer.tsx`).
   - Updating `.nav-brand-cta` to `line-height: var(--leading-wordmark);` immediately enforces `75%` on the Runda text ("with us") in both `Header.astro` and `MobileNavDrawer.tsx`.
   - Replacing hardcoded `line-height: 1;` on `.brand-run` with `line-height: var(--leading-wordmark);` ensures Scale VF uses `75%`.
   - Adding `line-height: var(--leading-action);` to `.nav-link`, `.footer-link`, `.announcement-link`, `.announcement-dismiss`, `.nav-mobile-toggle`, `.mobile-nav-link`, and `.mobile-nav-close` updates all existing navigation and action typography.

3. **Enforcement through `@layer utilities`**:
   - Existing code using `.u-text-display` automatically receives `80%`.
   - Existing code using `.u-text-body` automatically receives `100%`.
   - `.u-text-wordmark` is updated to enforce `75%` via `var(--leading-wordmark)`.

---

## 5. Step-by-Step Implementation Instructions

### Step 1: Update [src/styles/tokens.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/tokens.css)
In `@layer base { :root { ... } }`:
Replace lines 94–97:
```css
    /* Architectural Constraints */
    --leading-compressed: 0.8;
    /* Line-Height Compression Rule */
    --leading-body: 1.0;
    --radius-none: 0px;
    /* Zero Radius Rule */
```
With:
```css
    /* Line Height / Leading Tokens (Lumos Framework) */
    --leading-default: 1.0;
    /* Default for all general content (100%) */
    --leading-body: 1.0;
    /* Runda body, metadata, and general text (100%) */
    --leading-compressed: 0.8;
    /* Degular Display headings & compression (80%) */
    --leading-display: 0.8;
    /* Degular Display alias (80%) */
    --leading-action: 0.8;
    /* Buttons, CTAs, clickables (80%) */
    --leading-cta: 0.8;
    /* Action / CTA alias (80%) */
    --leading-wordmark: 0.75;
    /* Scale VF & Runda paired with wordmark (75%) */

    /* Architectural Constraints */
    --radius-none: 0px;
    /* Zero Radius Rule */
```

---

### Step 2: Update [src/styles/base.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/base.css)
1. In `html, body` (lines 25–35), update line-height:
```css
  html,
  body {
    background-color: var(--color-surface-canvas);
    color: var(--color-text-primary);
    font-family: var(--font-body);
    line-height: var(--leading-default);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    min-height: 100%;
  }
```

2. Add a base clickable reset right below `/* Link Resets */`:
```css
  /* Interactive Base Resets */
  button,
  [role="button"],
  input[type="button"],
  input[type="submit"] {
    line-height: var(--leading-action);
  }
```

---

### Step 3: Update [src/styles/components.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css)
Update the following component rules:

1. **`.btn` (Line 15)**:
   Change `line-height: var(--leading-body);` to:
   ```css
   line-height: var(--leading-action);
   ```

2. **`.nav-brand-cta` (Line 115)**:
   Add `line-height: var(--leading-wordmark);`:
   ```css
   .nav-brand-cta {
     grid-column: 1;
     display: inline-flex;
     align-items: baseline;
     gap: var(--space-02);
     font-family: var(--font-body);
     font-size: var(--font-size-body);
     line-height: var(--leading-wordmark);
     color: var(--color-canvas-white);
     text-decoration: none;
     text-transform: lowercase;
     white-space: nowrap;
     row-gap: var(--space-03);
     column-gap: var(--space-03);
   }
   ```

3. **`.nav-brand-cta .brand-run` (Line 130)**:
   Change `line-height: 1;` to:
   ```css
   line-height: var(--leading-wordmark);
   ```

4. **`.announcement-link` (Line 161)**:
   Add `line-height: var(--leading-action);`:
   ```css
   .announcement-link {
     color: var(--color-canvas-white);
     font-family: var(--font-body);
     font-size: var(--font-size-micro);
     line-height: var(--leading-action);
     text-decoration: none;
     overflow: hidden;
     text-overflow: ellipsis;
     white-space: nowrap;
   }
   ```

5. **`.announcement-dismiss` (Line 171)**:
   Change `line-height: 1;` to:
   ```css
   line-height: var(--leading-action);
   ```

6. **`.nav-link` (Line 203)**:
   Add `line-height: var(--leading-action);`:
   ```css
   .nav-link {
     font-family: var(--font-body);
     font-size: var(--font-size-label);
     line-height: var(--leading-action);
     color: var(--color-canvas-white);
     text-decoration: none;
     text-transform: lowercase;
     transition: color 0.15s ease;
     text-align: right;
   }
   ```

7. **`.nav-mobile-toggle` (Line 217)**:
   Add `line-height: var(--leading-action);`:
   ```css
   .nav-mobile-toggle {
     display: none;
     background: transparent;
     border: 1px solid var(--color-border-subtle);
     border-radius: var(--radius-none) !important;
     color: var(--color-canvas-white);
     font-family: var(--font-body);
     font-size: var(--font-size-label);
     line-height: var(--leading-action);
     text-transform: lowercase;
     padding: var(--space-02) var(--space-04);
     cursor: pointer;
   }
   ```

8. **`.mobile-nav-close` (Line 288)**:
   Change `line-height: 1;` to:
   ```css
   line-height: var(--leading-action);
   ```

9. **`.mobile-nav-link` (Line 304)**:
   Add `line-height: var(--leading-action);`:
   ```css
   .mobile-nav-link {
     font-family: var(--font-body);
     font-size: var(--font-size-body);
     line-height: var(--leading-action);
     color: var(--color-canvas-white);
     text-decoration: none;
     text-transform: lowercase;
     transition: color 0.15s ease;
   }
   ```

10. **`.footer-link` (Line 363)**:
    Add `line-height: var(--leading-action);`:
    ```css
    .footer-link {
      font-family: var(--font-body);
      font-size: var(--font-size-label);
      line-height: var(--leading-action);
      color: var(--color-text-secondary);
      text-decoration: none;
      text-transform: lowercase;
    }
    ```

---

### Step 4: Update [src/styles/utilities.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/utilities.css)
1. In `.u-text-wordmark` (line 33), add line-height:
```css
  .u-text-wordmark {
    font-family: var(--font-wordmark);
    line-height: var(--leading-wordmark);
  }
```

2. Add Lumos leading utility classes under `/* Text & Typography Utilities */`:
```css
  /* Lumos Leading Utility Classes */
  .u-leading-default {
    line-height: var(--leading-default) !important;
  }

  .u-leading-body {
    line-height: var(--leading-body) !important;
  }

  .u-leading-compressed,
  .u-leading-display {
    line-height: var(--leading-compressed) !important;
  }

  .u-leading-action,
  .u-leading-cta {
    line-height: var(--leading-action) !important;
  }

  .u-leading-wordmark {
    line-height: var(--leading-wordmark) !important;
  }
```

---

### Step 5: Update [DESIGN.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md)
1. In frontmatter under `typography:` (around line 50), document leading definitions:
```yaml
  leading:
    default: 1.0
    body: 1.0
    compressed: 0.8
    action: 0.8
    wordmark: 0.75
```
2. Under `### Named Rules` (around line 155), add:
- **The Typography Line-Height Rules**:
  - **Degular Display**: Always set at `0.8` (80%) (`--leading-compressed`).
  - **Runda**: Always set at `1.0` (100%) (`--leading-body`) for standard body and metadata.
  - **Wordmark & Brand Lockup**: Scale VF and Runda paired with the wordmark must be set at `0.75` (75%) (`--leading-wordmark`).
  - **CTAs & Clickables**: All buttons, links, dismissal buttons, and interactive elements must be set at `0.8` (80%) (`--leading-action`).
  - **Global Baseline**: All other text defaults to `1.0` (100%) (`--leading-default`).

---

### Step 6: Update Style Test Suite in [tests/styles/lumos.test.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/styles/lumos.test.ts)
Update test assertions:
1. In `'should enforce architectural rules (Zero Radius & Compression)'`:
   ```ts
   expect(tokensContent).toContain('--leading-default: 1.0;');
   expect(tokensContent).toContain('--leading-body: 1.0;');
   expect(tokensContent).toContain('--leading-compressed: 0.8;');
   expect(tokensContent).toContain('--leading-display: 0.8;');
   expect(tokensContent).toContain('--leading-action: 0.8;');
   expect(tokensContent).toContain('--leading-cta: 0.8;');
   expect(tokensContent).toContain('--leading-wordmark: 0.75;');
   ```
2. In `'Base & Zero-Radius Reset (base.css)'`:
   ```ts
   expect(content).toContain('line-height: var(--leading-default);');
   expect(content).toContain('line-height: var(--leading-action);');
   ```
3. In `'Components Foundation (components.css)'`:
   ```ts
   expect(content).toContain('line-height: var(--leading-action);');
   expect(content).toContain('line-height: var(--leading-wordmark);');
   ```
4. In `'Utilities (utilities.css)'`:
   ```ts
   expect(content).toContain('.u-leading-action');
   expect(content).toContain('.u-leading-wordmark');
   expect(content).toContain('line-height: var(--leading-wordmark);');
   ```

---

## 6. Verification & Done Criteria

1. **Run Unit Tests**:
   ```bash
   npx vitest run
   ```
   **Expected**: All test suites pass, 0 failures.

2. **Run Design Check**:
   ```bash
   npm run check:design
   ```
   **Expected**: 0 anti-patterns detected.

3. **Check Computed Styles**:
   - Degular Display headings (`.u-text-display`): `0.8` line-height ratio.
   - Runda body text (`.u-text-body`): `1.0` line-height ratio.
   - Brand wordmark CTA (`.nav-brand-cta` including `.brand-run`): `0.75` line-height ratio.
   - Buttons and links (`.btn`, `.nav-link`, `.footer-link`): `0.8` line-height ratio.
   - Base canvas text: `1.0` line-height ratio.
