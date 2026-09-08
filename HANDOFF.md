# Agent Handoff: Connect RouteCard to Sanity CMS

## 1. Suggested Skills

The implementing agent should invoke:
1. **`tdd`** (`.agents/skills/tdd/SKILL.md`): Follow test-first behavioral verification on public seams (formatting utilities) without testing internal styling or parsing `.astro` templates in Vitest.
2. **`impeccable`** (`.agents/skills/impeccable/SKILL.md`): Ensure zero design token anti-patterns via `npm run check:design`.

---

## 2. Objective & User Constraints

Connect [src/components/RouteCard.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/RouteCard.astro) strictly to Sanity CMS using the existing test document in the production dataset (`title: "Test 1"`, `district: "YYC"`, `distanceKm: 5.18`) as the display source on [src/pages/index.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro).

### Strict Scope Rules (Do Not Deviate):
- **Props contract**: `RouteCard.astro` must **only** accept `route: SanityRoute` (and optional `class?: string`). Remove support for individual discrete props (`district`, `distanceKm`, etc.).
- **Existing elements only**: Do NOT add new elements, links, or CTA buttons:
  - **NO** "Adopt This Route" link or CTA (signup portal is not created yet).
  - **NO** Group run banner variant (group run component is not created yet).
  - **NO** hover / expansion states.
- **District Sub-box = Feature Tags**: The element underneath the district heading (`.route-card-blurb`) is **strictly connected to feature tags (`route.tags`)**, formatted via `formatRouteTags(route.tags)`. If `tags` is null, undefined, or empty, do not render this element.

---

## 3. Sanity Test Document Reference

The test document currently in the Sanity production dataset (`projectId: "huk9xx07"`, `dataset: "production"`) has been verified via Sanity MCP `query_documents`:

```json
{
  "_id": "f1eaba7f-c51c-4453-b3db-d2021b42b87a",
  "_type": "route",
  "title": "Test 1",
  "animalType": "Test",
  "district": "YYC",
  "region": "Kowloon",
  "city": "Hong Kong",
  "difficulty": "easy",
  "colorTheme": "route-orange",
  "distanceKm": 5.18,
  "elevationGain": 42,
  "estimatedDurationMin": 31,
  "description": "Test run w/ jackie night run",
  "miniMapSvg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M45.5 80.7 L45.2 82 ...\"/></svg>",
  "routePolyline": "{}ggC_lzwTVDJBYQGJAHAVCDADA@CBC...",
  "slug": { "_type": "slug", "current": "test-1" },
  "tags": null,
  "isGroupRun": false
}
```

---

## 4. Implementation Steps & Exact Target Files

### 4.1. Formatting Utilities
- **File**: [src/utils/formatters.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/utils/formatters.ts)
- Add `formatRouteTags(tags?: string[] | null): string`:
  - Returns `tags.filter(Boolean).join(' · ')` when tags exist.
  - Returns `''` if tags is null, undefined, or empty.

### 4.2. RouteCard Component
- **File**: [src/components/RouteCard.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/RouteCard.astro)
- Update `Props` interface:
  ```astro
  ---
  import type { SanityRoute } from '@/sanity/types';
  import { urlForImage } from '@/sanity/image';
  import {
    formatRouteDistance,
    formatRouteDuration,
    formatRouteElevation,
    formatRouteDifficulty,
    formatRouteTags,
  } from '@/utils/formatters';

  export interface Props {
    class?: string;
    route: SanityRoute;
    [key: string]: any;
  }

  const { class: className, route, ...restProps } = Astro.props;

  const {
    district,
    tags,
    distanceKm,
    estimatedDurationMin,
    elevationGain,
    difficulty = 'beginner',
    colorTheme = 'route-orange',
    miniMapSvg,
    coverImage,
  } = route;

  const themeClass =
    colorTheme === 'route-coral'
      ? 'route-card--coral'
      : colorTheme === 'route-blush'
        ? 'route-card--blush'
        : 'route-card--orange';

  const formattedDistance = formatRouteDistance(distanceKm);
  const formattedDuration = formatRouteDuration(estimatedDurationMin);
  const formattedElevation = formatRouteElevation(elevationGain);
  const formattedDifficulty = formatRouteDifficulty(difficulty);
  const displayTags = formatRouteTags(tags);
  const mapImage = coverImage ? urlForImage(coverImage).url() : undefined;
  ---
  ```
- In the template, bind `displayTags` to `.route-card-blurb`:
  ```astro
  <div class="route-card-heading-group">
    <h3 class="route-card-district">{district}</h3>
    {displayTags && (
      <p class="route-card-blurb">{displayTags}</p>
    )}
  </div>
  ```

### 4.3. Minimap SVG Styling
- **File**: [src/styles/components.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css)
- Add rules inside `@layer components` for `.route-card-minimap-svg` and `.route-card-minimap-svg svg`:
  ```css
  .route-card-minimap-svg {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .route-card-minimap-svg svg {
    width: 100%;
    height: 100%;
    display: block;
    color: var(--color-canvas-white);
  }
  ```
  *(Note: Must comply strictly with `DESIGN.md`: 0px border-radius, only sanctioned tokens from `tokens.css`).*

### 4.4. Showcase Page Integration
- **File**: [src/pages/index.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/pages/index.astro)
- Fetch routes via `getRoutes()` from `@/sanity/queries`:
  ```astro
  ---
  import BaseLayout from '@/layouts/BaseLayout.astro';
  import IslandVerification from '@/components/IslandVerification';
  import RouteCard from '@/components/RouteCard.astro';
  import { getRoutes } from '@/sanity/queries';
  import type { SanityRoute } from '@/sanity/types';

  const fallbackRoute: SanityRoute = {
    _id: 'fallback-test-1',
    _type: 'route',
    title: 'Test 1',
    animalType: 'Test',
    district: 'YYC',
    region: 'Kowloon',
    city: 'Hong Kong',
    difficulty: 'easy',
    colorTheme: 'route-orange',
    distanceKm: 5.18,
    elevationGain: 42,
    estimatedDurationMin: 31,
    description: 'Test run w/ jackie night run',
    routePolyline: '',
    slug: { _type: 'slug', current: 'test-1' },
    isGroupRun: false,
  };

  const routes = await getRoutes().catch(() => []);
  const displayRoute = routes.length > 0 ? routes[0] : fallbackRoute;
  ---
  ```
- Render:
  ```astro
  <RouteCard route={displayRoute} />
  ```

### 4.5. Tests
- **File**: [tests/components/RouteCard.test.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/components/RouteCard.test.tsx)
- Add tests for `formatRouteTags`:
  - `formatRouteTags(['Scenic', 'Waterfront'])` returns `'Scenic · Waterfront'`
  - `formatRouteTags(null)` / `formatRouteTags(undefined)` / `formatRouteTags([])` returns `''`
- Add test verifying telemetry & metadata formatting against a `SanityRoute` fixture representing the Sanity test document.

---

## 5. Verification Commands

Run these exact commands from repository root:
1. `npm test` with `BypassSandbox: true` (Must pass 100% of tests).
2. `npm run check:design` with `BypassSandbox: true` (Must report 0 anti-patterns).
3. `npx astro check` (Must pass type checks).
