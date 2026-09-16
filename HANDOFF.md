# Handoff: Cross-Browser Scroll Animations for Journey & Bottom CTA (Issue #2)

## 1. Objective

Implement cross-browser entrance and scroll reveal animations for the **Journey Section** (`src/components/JourneySection.astro`) and **Bottom CTA Section** (`src/components/BottomCtaSection.astro`).

Currently, both sections use CSS Scroll-Driven Animations (`animation-timeline: view()`), which fail to fire in Safari (including Safari 18 on macOS Sonoma / Sequoia and iOS 18 Safari) and Firefox, leaving elements in a static, un-animated fallback state.

A fresh agent should implement a resilient cross-browser progressive enhancement or fallback so Safari and Firefox users experience the intended scroll-linked or entrance animations without compromising Chrome's native compositor performance.

---

## 2. Context & Current Status

In the preceding session, three deployment issues were investigated:
1. **Issue 1 (RESOLVED)**: On Chrome, the header lacked translucent backing and only showed a dark gradient scrim because `isolation: isolate` on `.site-header` isolated the backdrop root for `::before`. Fixed by removing `isolation: isolate`, giving `.site-header-grid` `position: relative; z-index: 1`, and removing negative z-index from the veil.
2. **Issue 3 (RESOLVED)**: On iPhone Safari, the WebGL shader background and mobile nav menu background did not extend underneath the floating address bar pill and home indicator. Fixed by extending `.shader-background-viewport`, `ShaderBackground.tsx`, and `.mobile-nav-backdrop` through `bottom: calc(-1 * var(--safe-inset-bottom))` and `min-height: 100lvh`, and updating `body.has-shader-bg > main`'s `clip-path` bottom boundary.
3. **Issue 2 (RESOLVED)**: On Safari and Firefox, the Journey Section and Bottom CTA animations did not fire because Safari lacks native CSS Scroll-Driven Animations. Resolved by adding `scroll-timeline-polyfill` dynamically via `src/utils/scroll-timeline-loader.ts` for non-Chromium browsers, driving animations bi-directionally via WAAPI ViewTimeline while Chromium browsers preserve 100% native compositor performance with 0 KB overhead.

---

## 3. Root Cause Analysis

### Journey Section (`src/components/JourneySection.astro:L331-416`)
The section animates:
- Masthead mesh badge wipe open (`journey-wipe` on `.journey-badge-square`)
- Wordmark, numerals, titles, and step descriptions rising out of blur (`journey-rise`)
- Step connecting hairline rules drawing left-to-right (`journey-trace` on `.journey-step::before`)

All of these are declared inside:
```css
@supports (animation-timeline: view()) {
  .journey-badge-square,
  ... {
    animation-timeline: --journey-masthead; /* or --journey-step */
  }
}
```

### Bottom CTA Section (`src/components/BottomCtaSection.astro:L282-332`)
The section animates:
- 3-line stacked headline (`adopt the run. / complete the route. / own the impact.`)
- Mission subtext
- CTA button cluster (`run with us →` and `pass the torch →`)

All of these are declared inside:
```css
@supports (animation-timeline: view()) {
  .finale-line,
  .finale-subtext,
  .finale-actions {
    animation-timeline: view();
    animation-fill-mode: both;
    animation-duration: auto;
    animation-timing-function: var(--ease-out-expo);
  }
}
```

### The Safari Compatibility Reality
- The user noted: *"I understand this is to do with one of the scroll codes not working in old versions of firefox and safari - but I am using a new safari on a new mac."*
- **The reality**: CSS Scroll-Driven Animations (`animation-timeline: view()`, `animation-timeline: scroll()`, and `view-timeline`) are **not supported in any stable release of Safari**, including Safari 18 on macOS Sequoia and iOS 18.
- The feature is currently only supported in Chromium-based browsers (Chrome, Edge, Brave, Opera).
- Because `@supports (animation-timeline: view())` evaluates to `false` in Safari, Safari completely ignores the animation block. The CSS was written to keep the settled state as default, so elements appear statically without animating.

---

## 4. Proposed Solution & Architecture

### Recommended Approach: Progressive Enhancement with IntersectionObserver Fallback

Keep native CSS scroll-driven animations for Chromium browsers (zero JS main-thread cost, runs on compositor thread), and provide a lightweight, resilient `IntersectionObserver` fallback for Safari and Firefox.

#### 4.1 Feature Detection
In a lightweight client script inside `JourneySection.astro` and `BottomCtaSection.astro` (or a shared utility in `src/utils/scroll-observer.ts`):
```ts
const supportsScrollTimeline =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('animation-timeline', 'view()');

if (!supportsScrollTimeline) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  document
    .querySelectorAll('.journey-masthead, .journey-step, .finale-inner')
    .forEach((el) => observer.observe(el));
}
```

#### 4.2 CSS Fallback Rules
When `animation-timeline: view()` is unsupported, elements with `.is-revealed` trigger standard CSS keyframe animations:
```css
/* Fallback for Safari & Firefox */
@supports not (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    /* Initially hidden before reveal */
    .journey-masthead:not(.is-revealed) .journey-badge-square,
    .journey-masthead:not(.is-revealed) .journey-badge-number,
    .journey-masthead:not(.is-revealed) .journey-lead-text,
    .journey-masthead:not(.is-revealed) .journey-wordmark,
    .journey-masthead:not(.is-revealed) .journey-mission-text,
    .journey-step:not(.is-revealed)::before,
    .journey-step:not(.is-revealed) .journey-step-numeral,
    .journey-step:not(.is-revealed) .journey-step-title,
    .journey-step:not(.is-revealed) .journey-step-desc {
      opacity: 0;
    }

    .journey-masthead.is-revealed .journey-badge-square {
      animation: journey-wipe 0.6s var(--ease-out-expo) both;
    }

    .journey-masthead.is-revealed .journey-badge-number,
    .journey-masthead.is-revealed .journey-lead-text,
    .journey-masthead.is-revealed .journey-wordmark {
      animation: journey-rise 0.7s var(--ease-out-expo) 0.1s both;
    }

    .journey-step.is-revealed::before {
      animation: journey-trace 0.6s var(--ease-out-expo) both;
    }

    .journey-step.is-revealed .journey-step-numeral,
    .journey-step.is-revealed .journey-step-title,
    .journey-step.is-revealed .journey-step-desc {
      animation: journey-rise 0.7s var(--ease-out-expo) 0.15s both;
    }

    /* Finale / Bottom CTA */
    .finale-inner:not(.is-revealed) .finale-line,
    .finale-inner:not(.is-revealed) .finale-subtext,
    .finale-inner:not(.is-revealed) .finale-actions {
      opacity: 0;
    }

    .finale-inner.is-revealed .finale-line:nth-child(1) {
      animation: finale-rise 0.8s var(--ease-out-expo) 0.05s both;
    }
    .finale-inner.is-revealed .finale-line:nth-child(2) {
      animation: finale-rise 0.8s var(--ease-out-expo) 0.15s both;
    }
    .finale-inner.is-revealed .finale-line:nth-child(3) {
      animation: finale-rise 0.8s var(--ease-out-expo) 0.25s both;
    }
    .finale-inner.is-revealed .finale-subtext,
    .finale-inner.is-revealed .finale-actions {
      animation: finale-rise 0.8s var(--ease-out-expo) 0.35s both;
    }
  }
}
```

#### 4.3 Alternative Considered: Official Polyfill
The Chrome Labs `@flackr/scroll-timeline` polyfill could be evaluated, but may introduce unnecessary runtime overhead and potential edge cases with Safari's dynamic viewport / overscroll physics compared to a clean, lightweight `IntersectionObserver` trigger.

---

## 5. Key Files to Inspect and Modify

- `src/components/JourneySection.astro`: Contains the 3-step journey markup, keyframes (`journey-wipe`, `journey-rise`, `journey-trace`), and `@supports (animation-timeline: view())` rules.
- `src/components/BottomCtaSection.astro`: Contains the headline lines, subtext, actions, keyframes (`finale-rise`), and `@supports (animation-timeline: view())` rules.
- `src/styles/tokens.css`: Animation easing (`--ease-out-expo`), spacing tokens, and timing tokens.
- `DESIGN.md`: Motion principles, zero-radius architecture, and token enforcement.

---

## 6. Constraints & Repository Invariants

- **Tokens Only**: Strictly comply with `DESIGN.md` using tokens from `src/styles/tokens.css` (never literal `px` or `rem` font sizes).
- **Design Check**: `npm run check:design` must report **0 anti-patterns** before calling work done.
- **Sandbox Execution**: Always run `npm test`, `npm run check:design`, and build commands with `BypassSandbox: true` on first attempt.
- **Testing Seams**: Verify behavior without regex-parsing `.astro` templates or asserting on CSS strings in Vitest.
- **No push / no PR**: Local edits only; do not run `git push`.

---

## 7. Suggested Skills

- **`/impeccable polish`**: Polish animation choreography, stagger delays, and micro-interactions.
- **`modern-web-guidance`**: Search for current best practices on `@supports (animation-timeline: view())` graceful degradation.
- **`code-review`**: Side-by-side spec and standards review before concluding the task.

---

## 8. Suggested Verification Plan

1. **Automated Verification**:
   - `npm run check:design` (0 anti-patterns)
   - `npm test` (all 213+ vitest unit tests pass)
   - `npm run build` (clean Astro production build)
2. **Browser Verification**:
   - **Chrome**: Confirm native scroll-driven animations continue to scrub/progress as the user scrolls through Journey and Bottom CTA.
   - **Safari (Desktop & iOS)**: Confirm elements smoothly animate into view via the `IntersectionObserver` fallback when scrolled into view.
   - **Reduced Motion**: Verify that with `prefers-reduced-motion: reduce`, animations are bypassed or simplified to subtle fades without motion/blur.
