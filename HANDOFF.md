# Handoff: Connect Homepage Route Card to Sanity & Enforce 1-Decimal Distance

## 1. Suggested Skills
The executing agent should invoke:
1. **`tdd`** (`.agents/skills/tdd/SKILL.md`): Execute test-first updates on the distance formatter seam and behavioral contracts in [tests/components/RouteCard.test.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/components/RouteCard.test.tsx).
2. **`impeccable`** (`.agents/skills/impeccable/SKILL.md`): Validate Lumos design system token compliance via `npm run check:design`.

---

## 2. Objective & Scope
1. **Sanity Data Connection**: Stop using hardcoded fallback values in [src/pages/index.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro); bind `<RouteCard />` directly to the live route document from Sanity.
2. **GPS Trace Display**: In [src/components/RouteCard.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/RouteCard.astro), `miniMapSvg` must be the default and sole graphic. Completely remove all references to `coverImage` and `urlForImage`.
3. **Drafts Perspective Fix**: In [src/sanity/client.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/client.ts), ensure unauthenticated public queries use `'published'` perspective so queries do not return empty arrays `[]`.
4. **Distance Formatting**: In [src/utils/formatters.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/utils/formatters.ts), format distances to exactly one decimal place (`.toFixed(1)`), e.g. `14` -> `'14.0km'`, `5.18` -> `'5.2km'`.

---

## 3. Targeted Changes

### Seam 1: Telemetry Formatter & Tests
- **File**: [src/utils/formatters.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/utils/formatters.ts)
  - Update `formatRouteDistance(distanceKm: number | string | undefined | null): string`:
    - If `distanceKm === null || distanceKm === undefined || distanceKm === ''`, return `''`.
    - Parse numeric value (handles both number types and numeric strings with/without `'km'`).
    - Format with `val.toFixed(1) + 'km'`.
    - Return `''` if parsed value is `NaN`.
- **File**: [tests/components/RouteCard.test.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/components/RouteCard.test.tsx)
  - Update assertions in `describe('formatRouteDistance')`:
    - `14` -> `'14.0km'`
    - `5.2` -> `'5.2km'`
    - `0` -> `'0.0km'`
    - `'14'` -> `'14.0km'`
    - `'14km'` -> `'14.0km'`
    - `'  8.5km  '` -> `'8.5km'`
  - Update `SanityRoute fixture formatting contract`:
    - Fixture with `distanceKm: 5.18` must expect `'5.2km'`.

### Seam 2: Sanity Client Configuration
- **File**: [src/sanity/client.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/client.ts)
  - Root cause: `perspective: visualEditingEnabled ? 'drafts' : 'published'` caused queries to request drafts. Without an API read token, Sanity returns `[]` for unauthenticated requests.
  - Apply:
    ```typescript
    export const projectId = import.meta.env?.PUBLIC_SANITY_PROJECT_ID || 'huk9xx07';
    export const dataset = import.meta.env?.PUBLIC_SANITY_DATASET || 'production';
    export const apiVersion = import.meta.env?.PUBLIC_SANITY_API_VERSION || '2026-03-01';
    export const visualEditingEnabled =
      import.meta.env?.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === 'true';

    export const sanityClient: SanityClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective:
        visualEditingEnabled && Boolean(import.meta.env?.SANITY_API_READ_TOKEN)
          ? 'drafts'
          : 'published',
      stega: {
        enabled: visualEditingEnabled,
        studioUrl: '/studio',
      },
    });
    ```

### Seam 3: RouteCard Component
- **File**: [src/components/RouteCard.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/RouteCard.astro)
  - Remove `coverImage` from destructuring and component logic.
  - Remove `import { urlForImage } from '@/sanity/image';`.
  - Replace the `<div class="route-card-minimap">` slot content with:
    ```astro
    <div class="route-card-minimap">
      <slot name="minimap">
        {miniMapSvg ? (
          <div class="route-card-minimap-svg" set:html={miniMapSvg} />
        ) : (
          <div class="media-placeholder route-card-minimap-placeholder" aria-label="Route minimap placeholder">
            <span class="route-card-placeholder-label">gps trace</span>
          </div>
        )}
      </slot>
    </div>
    ```

### Seam 4: Homepage Card Binding
- **File**: [src/pages/index.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro)
  - Delete `fallbackRoute` constant.
  - Retrieve live routes:
    ```astro
    const routes = await getRoutes();
    const displayRoute = routes[0];
    ```
  - Guard the template rendering:
    ```astro
    <!-- Signature Route Card Component -->
    {displayRoute && <RouteCard route={displayRoute} />}
    ```

---

## 4. Verification & Completion Criteria

Always run verification commands with `BypassSandbox: true` per repository rules.

1. **Unit & Design Invariant Tests**:
   ```bash
   npm test
   ```
   - Must pass all tests in Vitest.
   - `npm run check:design` must report **0 anti-patterns**.

2. **Typecheck**:
   ```bash
   npm run typecheck
   ```
   - Astro check & TypeScript validation must report **0 errors**.

3. **Production Build & Markup Verification**:
   ```bash
   npm run build
   ```
   - Confirm [dist/client/index.html](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/dist/client/index.html) contains:
     - The inline `<svg ...>` element inside `.route-card-minimap-svg`.
     - Distance formatted as `5.2km`.
     - Zero instances of `<div class="media-placeholder route-card-minimap-placeholder">` on the signature card.
