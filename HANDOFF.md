# Handoff: Featured Routes — Responsive Refinement ("Phone stack, tablet rows")

## 1. Objective

Refine and ship the responsive redesign of the homepage **Featured Routes** section (`src/components/FeaturedRoutesSection.astro`). The user reviewed three live variants in an `/impeccable live` session and chose **variant 1: "phone stack, tablet rows"**, plus a follow-up steer (heading/link cleanup, alignment, fluid sizing). They want another agent to implement it permanently and refine it further.

**Nothing from that session is in the source tree.** Live mode was exited without accepting, so the working tree was restored to `HEAD` (branch `ui/claude-frontend-polish`, clean at `1a61f53`). The chosen design is fully specified below. Treat §4 as the starting implementation, not a finished result: it was never visually reviewed and never checked at real device sizes.

---

## 2. User Requirements (confirmed in session)

1. **No carousel.** The current mobile/tablet horizontal swipe carousel (the `@media (max-width: 1199px)` block in the component's `<style>`) must go. There aren't enough routes for a carousel to look good.
2. **Max 3 featured routes.** `selectFeaturedRoutes(routes, 3)` already enforces this; keep it.
3. **Premium, refined feel.** Stay inside the existing identity (DESIGN.md): warm Canvas White section, Canvas Black text, route-card fills (orange/coral/blush), Degular Display at 0.8 leading for headings, Runda ≤ 500 weight, zero radius, hairline seams, lowercase actions.
4. **Heading + link cleanup (steer):** "featured routes" and "more routes →" should be tidy and aligned; the link should sit with the heading, not in a separate footer.
5. **Alignment (steer):** Card edges must line up with the heading/container edges. The current `repeat(3, minmax(0, 380px))` plus `justify-content: space-between` spreads the gaps unevenly.
6. **More responsive to size changes (steer):** Things should scale fluidly as the window resizes, not jump at one breakpoint.

---

## 3. Chosen Design: Variant 1 "Phone stack, tablet rows"

| Width | Layout |
|---|---|
| **≥ 1200px (desktop)** | Three equal fluid columns of the standard vertical `RouteCard` (trace window on top, info below). Cards stretch to fill (~397px each at max width vs. today's fixed 380px) and share equal heights per row. |
| **768–1199px (tablet)** | **One column of horizontal cards**: trace minimap on the left (45% width, stretches to card height, min 240px), info on the right. |
| **< 768px (phone)** | **One column of full-width vertical cards**: minimap on top at 356:216 aspect, info below. |

Across all widths:
- **Header row:** the `<h2>` "featured routes" and the "more routes →" link share one row on a common last baseline (`justify-content: space-between`). The link wraps beneath only when the row runs out of room. The old `<footer>` is removed.
- **Heading size:** `clamp(40px token, 7vw, 80px token)` with `text-wrap: balance`.
- **Card type scales with the card's own width** via container queries on `.route-card-info`: district `clamp(24, 13cqi, 48)` and distance `clamp(40, 22cqi, 80)`, all as tokens. This stops the 80px distance numeral from overflowing narrow cards.
- **Section padding and gaps are fluid:** block padding clamps 64→96 / 48→64, inline padding `--space-fluid-lg`, grid gap `--space-fluid-md`.
- **Semantics:** the grid becomes `<ul>`/`<li>` (three routes = a list). Keep `id="routes-featured"` and `aria-label="Featured Routes"` on the `<section>`.

A "Phone minimap" knob was offered with **Tall** (356:216, the default) and **Short** (356:128). The user did not choose, so bake **Tall**; Short is a candidate refinement.

---

## 4. Starting Implementation (translated to permanent component code)

The live preview CSS used `[data-impeccable-variant]` prefixes and throwaway `.fa-*` classes. Below it is rewritten against the component's own class names, for the component's scoped `<style>`. **`RouteCard` is a separate Astro component**, so its internals must be targeted with `:global(...)` from this file's scoped styles; the existing file already does this at `@media (max-width: 440px)`.

### 4.1 Markup (replace the `<section>` body)

```astro
<section
  id="routes-featured"
  class:list={['featured-routes-section', className]}
  aria-label="Featured Routes"
  {...restProps}
>
  <div class="featured-routes-container">
    <header class="featured-routes-header">
      <h2 class="featured-routes-title">featured routes</h2>
      <a href="/routes" class="hairline-link hairline-link--black featured-routes-more">
        more routes &rarr;
      </a>
    </header>

    <ul class="featured-routes-grid">
      {displayRoutes.map((route) => (
        <li class="featured-routes-item"><RouteCard route={route} /></li>
      ))}
    </ul>
  </div>
</section>
```

Update the file's header doc comment: it still describes the swipe carousel and the bottom-right link.

### 4.2 Styles (replace the whole `<style>` block)

```css
.featured-routes-section {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  background-color: transparent;
  color: var(--color-canvas-black);
  padding-block: clamp(var(--space-10), 8vw, var(--space-12)) clamp(var(--space-09), 5vw, var(--space-10));
  padding-inline: var(--space-fluid-lg);
}

.featured-routes-container {
  max-width: calc(var(--space-13) * 7.75); /* 1240px, was a literal */
  margin-inline: auto;
}

/* Title and link share one baseline; the link wraps beneath only when the row runs out of room */
.featured-routes-header {
  display: flex;
  flex-wrap: wrap;
  align-items: last baseline;
  justify-content: space-between;
  gap: var(--space-04) var(--space-06);
  margin-bottom: var(--space-fluid-xl);
}

.featured-routes-title {
  font-family: var(--font-display);
  font-optical-sizing: none;
  font-variation-settings: 'opsz' 72;
  font-size: clamp(var(--font-size-tagline), 7vw, var(--font-size-headline));
  font-weight: 500;
  line-height: var(--leading-compressed);
  letter-spacing: normal;
  text-wrap: balance;
  color: var(--color-canvas-black);
  margin: 0;
}

.featured-routes-more { flex-shrink: 0; }

.featured-routes-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-fluid-md);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Fluid card at every width: fills its track, equal heights per row, type scales with the card */
.featured-routes-grid :global(.route-card) { width: 100%; height: 100%; }
.featured-routes-grid :global(.route-card-minimap) { height: auto; aspect-ratio: 356 / 216; }
.featured-routes-grid :global(.route-card-minimap-svg),
.featured-routes-grid :global(.route-card-minimap-svg svg) { display: block; width: 100%; height: 100%; }
.featured-routes-grid :global(.route-card-info) {
  height: auto;
  gap: var(--space-07);
  container-type: inline-size;
}
.featured-routes-grid :global(.route-card-district) {
  font-size: clamp(var(--font-size-metric), 13cqi, var(--font-size-wordmark));
}
.featured-routes-grid :global(.route-card-distance) {
  font-size: clamp(var(--font-size-tagline), 22cqi, var(--font-size-headline));
  letter-spacing: normal;
}

/* Tablet: one column of horizontal cards */
@media (max-width: 1199px) {
  .featured-routes-grid { grid-template-columns: minmax(0, 1fr); gap: var(--space-06); }
  .featured-routes-grid :global(.route-card) { flex-direction: row; gap: var(--space-05); }
  .featured-routes-grid :global(.route-card-minimap) {
    width: 45%;
    aspect-ratio: auto;
    align-self: stretch;
    min-height: calc(var(--space-13) * 1.5);
  }
  .featured-routes-grid :global(.route-card-info) { flex: 1; min-width: 0; padding-top: 0; }
}

/* Phone: one column of full-width vertical cards */
@media (max-width: 767px) {
  .featured-routes-grid :global(.route-card) { flex-direction: column; }
  .featured-routes-grid :global(.route-card-minimap) {
    width: 100%;
    min-height: 0;
    aspect-ratio: 356 / 216;
  }
  .featured-routes-grid :global(.route-card-info) { padding-top: var(--space-03); }
}
```

This deletes the carousel rules, the `82vw` phone override, and the `1240px` literal.

---

## 5. Known Risks & Open Questions for Refinement

1. **Not visually verified.** The design was only seen in the live overlay and never inspected at 375 / 768 / 1024 / 1440px. Do one batched desktop + mobile visual pass after implementing, but only if the user asks you to launch the browser (CLAUDE.md §3: don't launch the browser by default).
2. **Desktop is no longer pixel-identical.** Cards stretch to ~397px and get equal heights. The fixed `height: 480px` in `components.css` `.route-card` is overridden by `height: 100%` here. Confirm the user is happy with this, or cap card width.
3. **Container-query type scaling** (`cqi` on `.route-card-info`) is new to this codebase. Check that `container-type: inline-size` doesn't collapse the info block's width inside the flex row (it has `flex: 1; min-width: 0`, which should be fine). Also check that the 13cqi and 22cqi coefficients read well at every width.
4. **Tablet horizontal card density.** The info column at 768px is ~55% of ~720px. Check that the district, blurb, telemetry, difficulty and distance don't crowd. `.route-card-info` in `components.css` still has `justify-content: space-between`.
5. **The `.route-card-distance` base style in `src/styles/components.css` has `letter-spacing: -0.02em`**, which violates DESIGN.md's "no custom tracking" rule. This section overrides it to `normal`, but the global rule remains. Consider fixing it at the source; it affects the hero cards too. Check first with the user, since it's outside this section's scope.
6. **Touch target.** The "more routes →" hairline link is text-height (~16–20px). Consider a larger hit area on `(pointer: coarse)` without shifting the hairline underline. Check `.hairline-link` in `components.css` lines ~51–125 for how the underline pseudo-elements are positioned.
7. **Phone minimap height.** Tall is the default; Short (356:128) was the alternative knob. It would cut the phone scroll height for three stacked cards noticeably.
8. **No route detail pages exist** (`src/pages/` has no `routes/`), so cards stay non-link articles. Don't add card links.

---

## 6. Constraints (from CLAUDE.md / AGENTS.md)

- Work on branch `ui/claude-frontend-polish`. **Local commits only**: no push, no PR.
- Tokens only (`src/styles/tokens.css`). No literal px/rem/hex in new CSS. `calc()` of tokens and `vw`/`cqi` inside `clamp()` are fine.
- `npm run check:design` must report **0 anti-patterns** before calling UI work done. It was clean with the live-preview version of this CSS.
- Also run `npm run typecheck`, `npm test`, `npm run build`.
- Don't write Vitest tests asserting CSS or parsing `.astro` templates (CLAUDE.md §3).
- Don't read `docs/archive/`.

---

## 7. Tooling Gotchas (if you use `/impeccable live` again)

- **Stale session trap:** a finished session cached in the browser's localStorage (`impeccable-live-session`) can freeze the overlay in "generating" on every load (picker dead, Esc does nothing). Fix: in the DevTools console on localhost:4321, run `['impeccable-live-session','impeccable-live-session-handled','impeccable-live-session-scroll'].forEach(k => localStorage.removeItem(k)); location.reload();`. Both sessions from this conversation (`fe312ad9`, `5df381c2`) were closed as `discarded` in the journal, so they won't resurrect.
- **Double-Go:** pressing Go twice queues a second `generate` whose scaffold points inside the first wrapper. Don't apply it as-is (nested wrappers). Either rename the existing wrapper's session id to the new one, or reply `error`.
- **Astro scoped styles leak into variants:** variant markup inside the component gets the component's `data-astro-cid`, so reusing the original class names in a preview variant pulls in the original rules, including the carousel. Use fresh class names in previews.
- The dev server usually already runs at http://localhost:4321; probe before starting another.

---

## 8. Suggested Skills

- **`/impeccable adapt src/components/FeaturedRoutesSection.astro`**: continue the responsive refinement with the adapt playbook (content-driven breakpoints, touch targets, landscape).
- **`/impeccable polish src/components/FeaturedRoutesSection.astro`**: final rhythm, hierarchy and micro-detail pass once the layout settles.
- **`/impeccable live`**: optional, for comparing refinement variants in the browser. Read §7 first.
- **`/mattpocock-skills:code-review`**: review the branch diff against CLAUDE.md standards before committing.

---

## 9. Suggested Sequence

1. Implement §4.1 and §4.2 in `src/components/FeaturedRoutesSection.astro`; update its doc comment.
2. `npm run check:design`, then `npm run typecheck`, `npm test`, `npm run build`.
3. Ask the user whether to do a visual pass. If yes, check 375 / 768 / 1024 / 1440px and landscape phone, then work through §5 items 2–4 and 6–7.
4. Raise §5.5 (global `letter-spacing` violation) with the user before touching `components.css`.
5. Commit locally on `ui/claude-frontend-polish`.
