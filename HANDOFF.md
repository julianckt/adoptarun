# Handoff: RouteCard Mini-Map Trace & GpxUploadInput Root Patching

## 1. Executive Summary & Objective

In [src/components/RouteCard.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/RouteCard.astro), the homepage route card currently displays an outdated 100x100 trace instead of the full-bleed 356x216 OpenStreetMap vector basemap trace calculated during GPX ingestion. For newly authored routes in Sanity Studio, it falls back to the placeholder (`<span class="route-card-placeholder-label">gps trace</span>`).

The next agent must implement the fix so that:
1. Ingesting or re-parsing GPX files in Sanity Studio patches root document fields directly.
2. GROQ queries defensively coalesce telemetry data from root or `gpxFile`.
3. The existing Sanity route document is patched and published with the 356x216 vector basemap SVG.
4. Unit tests verify the `DocumentPaneContext` seam.

---

## 2. Suggested Skills

- `tdd` (`.agents/skills/tdd/SKILL.md`): For updating and validating tests for `GpxUploadInput` and `RouteCard`.
- `impeccable` (`.agents/skills/impeccable/SKILL.md`): Ensure design tokens and layout contracts remain unbroken (`npm run check:design`).

---

## 3. Verified Root Cause

### Field Scoping in Sanity Studio v3 (`MemberField` prefixing)
1. In [src/sanity/schemaTypes/routeType.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/schemaTypes/routeType.ts#L138-L150), `GpxUploadInput` is registered as the custom input component for `gpxFile` (`type: 'file'`).
2. In Sanity Studio's form builder (`node_modules/sanity/lib/PerspectiveProvider-CVaQBlks.js:10623`), `MemberField` wraps child inputs in a nested `FormCallbacksProvider` that applies `PatchEvent.from(event).prefixAll(member.name)`.
3. In [src/components/sanity/GpxUploadInput.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/sanity/GpxUploadInput.tsx#L22-L25), calling `useFormCallbacks().onChange` resolves to the innermost `gpxFile` provider.
4. Consequently, `set(result.miniMapSvg, ['miniMapSvg'])` becomes `set(result.miniMapSvg, ['gpxFile', 'miniMapSvg'])`. Telemetry was saved to `doc.gpxFile.*` instead of root `doc.*`.
5. On the live route document `f1eaba7f-c51c-4453-b3db-d2021b42b87a`, `gpxFile.miniMapSvg` contains the rich 356x216 vector basemap SVG, while root `miniMapSvg` remained stuck on an older 100x100 trace. On new routes, root `miniMapSvg` is completely missing.

---

## 4. Exact File Pointers & Changes Required

### Step 1: Update [src/components/sanity/GpxUploadInput.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/sanity/GpxUploadInput.tsx)
**Lines to modify**: 1, 22–26

1. Import `useContext` from React and `DocumentPaneContext` from `'sanity/_singletons'`:
   ```typescript
   import React, { useState, useCallback, useRef, useContext } from 'react';
   import { DocumentPaneContext } from 'sanity/_singletons';
   ```
2. Retrieve the top-level pane's un-prefixed `onChange` callback:
   ```typescript
   const documentPane = useContext(DocumentPaneContext);
   const targetDocumentOnChange = props.documentOnChange || documentPane?.onChange || rootOnChange;
   ```
   *Rationale*: `DocumentPaneContext` is exported by Sanity Studio's Structure Tool. In Studio, `documentPane?.onChange` dispatches patches directly to root document fields without `MemberField` scoping. In unit tests where `DocumentPaneContext` is omitted, `useContext` returns `undefined` without throwing, cleanly falling back to `props.documentOnChange` or `rootOnChange`.

---

### Step 2: Update GROQ Queries in [src/sanity/queries.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/queries.ts)
**Lines to modify**: 5–34 (`ROUTES_QUERY`) and 36–66 (`ROUTE_BY_SLUG_QUERY`)

Add defensive `coalesce` projections for all telemetry fields so existing documents with data under `gpxFile` display immediately:

```groq
export const ROUTES_QUERY = defineQuery(
  `*[_type == "route"] | order(isGroupRun desc, featured desc, distanceKm asc) {
    _id,
    _type,
    title,
    slug,
    animalType,
    district,
    region,
    city,
    difficulty,
    colorTheme,
    featured,
    "distanceKm": coalesce(distanceKm, gpxFile.distanceKm),
    "elevationGain": coalesce(elevationGain, gpxFile.elevationGain),
    "estimatedDurationMin": coalesce(estimatedDurationMin, gpxFile.estimatedDurationMin),
    "routePolyline": coalesce(routePolyline, gpxFile.routePolyline),
    "miniMapSvg": coalesce(miniMapSvg, gpxFile.miniMapSvg),
    "elevationProfile": coalesce(elevationProfile, gpxFile.elevationProfile),
    stravaRouteUrl,
    startPointDescription,
    description,
    coverImage,
    tags,
    isGroupRun,
    groupRunDateTime,
    groupRunMeetupPoint,
    groupRunNotes
  }`
);

export const ROUTE_BY_SLUG_QUERY = defineQuery(
  `*[_type == "route" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    animalType,
    district,
    region,
    city,
    difficulty,
    colorTheme,
    featured,
    "distanceKm": coalesce(distanceKm, gpxFile.distanceKm),
    "elevationGain": coalesce(elevationGain, gpxFile.elevationGain),
    "estimatedDurationMin": coalesce(estimatedDurationMin, gpxFile.estimatedDurationMin),
    gpxFile { asset-> { url, originalFilename } },
    "routePolyline": coalesce(routePolyline, gpxFile.routePolyline),
    "miniMapSvg": coalesce(miniMapSvg, gpxFile.miniMapSvg),
    "elevationProfile": coalesce(elevationProfile, gpxFile.elevationProfile),
    stravaRouteUrl,
    startPointDescription,
    description,
    coverImage,
    tags,
    isGroupRun,
    groupRunDateTime,
    groupRunMeetupPoint,
    groupRunNotes
  }`
);
```

---

### Step 3: Update [src/components/RouteCard.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/RouteCard.astro)
**Lines to modify**: 27–29, 48–54

Add defensive extraction in frontmatter:
```astro
const miniMapSvg = route.miniMapSvg || (route as any).gpxFile?.miniMapSvg;
```
Ensure `<div class="route-card-minimap-svg" set:html={miniMapSvg} />` continues to render `miniMapSvg`.

---

### Step 4: Patch & Publish Sanity Document via Sanity MCP
**Tool**: `call_mcp_tool` (`ServerName: "Sanity"`)
- **Project ID**: `huk9xx07`
- **Dataset**: `production`
- **Document ID**: `f1eaba7f-c51c-4453-b3db-d2021b42b87a`

1. First, fetch `gpxFile.miniMapSvg` and `gpxFile.routePolyline` from `f1eaba7f-c51c-4453-b3db-d2021b42b87a` using `query_documents`.
2. Apply `patch_documents` to copy the 356x216 `gpxFile.miniMapSvg` to root `miniMapSvg`, and `gpxFile.routePolyline` to root `routePolyline`:
   ```json
   {
     "resource": { "projectId": "huk9xx07", "dataset": "production" },
     "documents": {
       "f1eaba7f-c51c-4453-b3db-d2021b42b87a": {
         "patches": [
           {
             "set": {
               "miniMapSvg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 356 216\" fill=\"none\">...</svg>",
               "routePolyline": "..."
             }
           }
         ]
       }
     }
   }
   ```
3. Call `publish_documents` on `f1eaba7f-c51c-4453-b3db-d2021b42b87a`:
   ```json
   {
     "resource": { "projectId": "huk9xx07", "dataset": "production" },
     "ids": ["f1eaba7f-c51c-4453-b3db-d2021b42b87a"]
   }
   ```

---

### Step 5: Add Unit Test in [tests/components/GpxUploadInput.test.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/components/GpxUploadInput.test.tsx)
**Lines to inspect**: 137–170

Add a unit test verifying dispatch via `DocumentPaneContext`:
```tsx
import { DocumentPaneContext } from 'sanity/_singletons';

it('dispatches patches to root document fields via DocumentPaneContext when documentOnChange is omitted', async () => {
  const paneOnChange = vi.fn();
  renderWithTheme(
    <DocumentPaneContext.Provider value={{ onChange: paneOnChange } as any}>
      <GpxUploadInput />
    </DocumentPaneContext.Provider>
  );

  const file = new File([sampleGpx], 'test-route.gpx', { type: 'application/gpx+xml' });
  const fileInput = screen.getByTestId('gpx-file-input');

  fireEvent.change(fileInput, { target: { files: [file] } });

  await waitFor(() => {
    expect(paneOnChange).toHaveBeenCalledTimes(1);
  });

  const patchEvent = paneOnChange.mock.calls[0][0];
  const paths = patchEvent.patches.map((p: any) => p.path[0]);
  expect(paths).toContain('miniMapSvg');
  expect(paths).toContain('distanceKm');
  expect(paths).toContain('routePolyline');
});
```

---

## 5. Verification Commands (Always run with `BypassSandbox: true`)

1. **Unit Tests**:
   ```bash
   npm test
   ```
   Must pass all 14 test files and 173+ tests.

2. **Design System Token Audit**:
   ```bash
   npm run check:design
   ```
   Must report 0 anti-patterns.

3. **Production Build & Markup Verification**:
   ```bash
   npm run build
   ```
   Inspect [dist/client/index.html](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/dist/client/index.html) and verify that `.route-card-minimap-svg` contains the 356x216 SVG (`viewBox="0 0 356 216"` with `<g class="route-basemap">`) rather than the legacy 100x100 SVG or placeholder.
