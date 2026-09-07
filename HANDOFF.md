# Agent Handoff: Embedded Sanity Studio & Content Schemas (GitHub Issue #16)

This document provides complete, self-contained context and exact step-by-step instructions for a second agent to implement **GitHub Issue #16: Embedded Sanity Studio & Content Schemas (route, charity, siteCopy)** inside this Astro project.

> [!NOTE]
> Dependencies (`@sanity/astro`, `sanity`, `@sanity/image-url`, `@sanity/icons`, `groq`) and Sanity CORS origins (`http://localhost:4321` on project `huk9xx07`) are pre-configured. Do NOT run dependency installations or modify header CSS layout.

---

## 1. Suggested Skills

The implementing agent should invoke:
1. **`implement`**: Execute the implementation workflow.
2. **`tdd`**: Run and verify Vitest unit test suites (`npx vitest run`).
3. **`code-review`**: Verify implementation against this specification and repo conventions.

---

## 2. Context Boundaries: Where to Look & What to Ignore

### Read ONLY These Exact Files:
1. [HANDOFF.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/HANDOFF.md): This specification and step-by-step guide.
2. [docs/spec/master-spec-sheet.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/docs/spec/master-spec-sheet.md): Section 5 (Sanity CMS Content Schemas) and Section 2–4 (Route/Charity/Movement Counter fields).
3. [DESIGN.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md): Route Card colors (`route-orange`, `route-coral`, `route-blush`) and typographic rules.
4. [astro.config.mjs](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/astro.config.mjs): Astro integration registration.
5. [tsconfig.json](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tsconfig.json): TypeScript configuration.
6. [AGENTS.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/AGENTS.md): Agent rules.

### Strictly DO NOT Read Or Ingest:
- **`docs/archive/`**: Strictly forbidden deprecated documentation per `AGENTS.md`.
- **`tests/components/Header.test.tsx`**: Header test mismatch is strictly out of scope. Do not read, run, or attempt to fix header styles.
- **`src/styles/components.css`**: CSS components foundation is unaffected by CMS schemas.
- **`src/stores/shell.ts`**: Shell stores are complete and unaffected.
- **`src/pages/api/`**: API routes are unaffected.

---

## 3. Specifications & Architecture Summary

### Core Project Identifiers
- **Sanity Project ID**: `huk9xx07`
- **Sanity Organisation ID**: `o6br06fjz`
- **Sanity Dataset**: `production`
- **Studio Route Path**: `/studio`
- **API Version**: `2026-03-01`

### Acceptance Criteria Checklist
- [ ] Embedded Sanity Studio mounted and accessible at `/studio` via `@sanity/astro`.
- [ ] `route` schema defined with fields for slug, region, difficulty, distance/elevation metrics, GPX file, polyline string, mini-map SVG, elevation profile, and group run fields (`isGroupRun`, `groupRunDateTime`, `groupRunMeetupPoint`, `groupRunNotes`).
- [ ] `charity` schema defined with fields for name, slug, website URL, logo, cover photo, charityDescription, causeDescription, impactUnitName, impactMultiplierPerHkd, and impactDisplayTemplate.
- [ ] `siteCopy` singleton schema configured with Studio tabs for hero, announcement ticker, journey, movement counters (`totalKmCovered`, `totalRunsCompleted`, `totalParticipantsCount`), and FAQs.
- [ ] Typed Sanity client helper utilities (`sanityClient`, `urlForImage`, GROQ queries, and TypeScript interfaces) configured for querying CMS data.

---

## 4. File Structure to Create / Modify

```
adoptarun/
├── astro.config.mjs                # [MODIFY] Register @sanity/astro integration at /studio
├── tsconfig.json                   # [MODIFY] Add @sanity/astro/module to compilerOptions.types
├── sanity.config.ts                # [NEW] Sanity Studio root config & structureTool
├── .env                            # [NEW] Local environment variables
├── .env.example                    # [NEW] Environment variables template
├── src/
│   └── sanity/
│       ├── index.ts                # [NEW] Unified barrel exports
│       ├── client.ts               # [NEW] Typed Sanity client instance
│       ├── image.ts                # [NEW] urlForImage builder utility
│       ├── queries.ts              # [NEW] GROQ queries & fetch helper functions
│       ├── structure.ts            # [NEW] Studio StructureBuilder with siteCopy singleton
│       ├── types.ts                # [NEW] TypeScript interfaces for schemas and queries
│       └── schemaTypes/
│           ├── index.ts            # [NEW] Schema registry exporting schemaTypes array
│           ├── routeType.ts        # [NEW] Route document schema
│           ├── charityType.ts      # [NEW] Charity document schema
│           └── siteCopyType.ts     # [NEW] SiteCopy singleton document schema with tabs
└── tests/
    └── sanity/
        └── schemas.test.ts         # [NEW] Vitest suite validating schemas, structure & queries
```

---

## 5. Step-by-Step Implementation Instructions

### Step 1: Update [astro.config.mjs](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/astro.config.mjs)

Update `astro.config.mjs` to import `sanity` from `@sanity/astro` and `loadEnv` from `vite`, and register the integration with `studioBasePath: '/studio'`:

```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { loadEnv } from 'vite';

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, PUBLIC_SANITY_API_VERSION } = loadEnv(
  process.env.NODE_ENV ?? 'development',
  process.cwd(),
  ''
);

export default defineConfig({
  site: 'https://adoptarun.org',
  output: 'static',
  adapter: cloudflare({
    imageService: 'cloudflare',
  }),
  integrations: [
    react(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID || 'huk9xx07',
      dataset: PUBLIC_SANITY_DATASET || 'production',
      apiVersion: PUBLIC_SANITY_API_VERSION || '2026-03-01',
      useCdn: false,
      studioBasePath: '/studio',
    }),
  ],
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  },
});
```

---

### Step 2: Update [tsconfig.json](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tsconfig.json)

Add `"@sanity/astro/module"` to `compilerOptions.types`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["@cloudflare/workers-types", "@sanity/astro/module"]
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

---

### Step 3: Create [.env](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/.env) & [.env.example](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/.env.example)

Both files should contain:
```bash
PUBLIC_SANITY_PROJECT_ID="huk9xx07"
PUBLIC_SANITY_DATASET="production"
PUBLIC_SANITY_API_VERSION="2026-03-01"
```

---

### Step 4: Create [src/sanity/schemaTypes/routeType.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/schemaTypes/routeType.ts)

Define the `route` document schema per `master-spec-sheet.md` Section 5.1 and `DESIGN.md`:

```typescript
import { defineType, defineField } from 'sanity';
import { PinIcon } from '@sanity/icons/Pin';

export const routeType = defineType({
  name: 'route',
  title: 'Route',
  type: 'document',
  icon: PinIcon,
  fieldsets: [
    { name: 'metrics', title: 'Route Telemetry & Metrics', options: { columns: 2 } },
    { name: 'geo', title: 'GPS Geometry & Mapping', options: { collapsible: true } },
    { name: 'groupRun', title: 'Scheduled Community Group Run', options: { collapsible: true } },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Artwork / Companion Name',
      type: 'string',
      description: 'The creative companion artwork name (e.g., The Running Dog, Wild Boar).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) =>
        rule.required().custom((slug) => {
          if (!slug?.current) return 'Slug is required';
          if (!/^[a-z0-9-]+$/.test(slug.current)) {
            return 'Slug must be lowercase alphanumeric characters with hyphens only';
          }
          return true;
        }),
    }),
    defineField({
      name: 'animalType',
      title: 'Animal / Guardian Type',
      type: 'string',
      description: 'The animal or guardian species (e.g., Golden Retriever, Boar, Falcon).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'district',
      title: 'District / Neighbourhood',
      type: 'string',
      description: 'Hong Kong district (e.g., Central & Western, Wan Chai, Sha Tin).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      options: {
        list: [
          { title: 'Hong Kong Island', value: 'Hong Kong Island' },
          { title: 'Kowloon', value: 'Kowloon' },
          { title: 'New Territories', value: 'New Territories' },
          { title: 'Outlying Islands', value: 'Outlying Islands' },
        ],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      initialValue: 'Hong Kong',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Easy', value: 'easy' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
          { title: 'Endurance', value: 'endurance' },
        ],
        layout: 'radio',
      },
      initialValue: 'easy',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'colorTheme',
      title: 'Card Fill Color Theme',
      type: 'string',
      description: 'Sanctioned card surface fill per DESIGN.md.',
      options: {
        list: [
          { title: 'Route Orange (Default)', value: 'route-orange' },
          { title: 'Route Coral (Endurance / Landmark)', value: 'route-coral' },
          { title: 'Route Blush (Promenade / Scenic)', value: 'route-blush' },
        ],
        layout: 'radio',
      },
      initialValue: 'route-orange',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Route',
      type: 'boolean',
      description: 'Display this route in the homepage featured grid.',
      initialValue: false,
    }),

    // --- Fieldset: Metrics ---
    defineField({
      name: 'distanceKm',
      title: 'Distance (km)',
      type: 'number',
      fieldset: 'metrics',
      validation: (rule) => rule.required().positive().precision(2),
    }),
    defineField({
      name: 'elevationGain',
      title: 'Elevation Gain (+m)',
      type: 'number',
      fieldset: 'metrics',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'estimatedDurationMin',
      title: 'Estimated Duration (minutes)',
      type: 'number',
      fieldset: 'metrics',
      validation: (rule) => rule.required().positive().integer(),
    }),

    // --- Fieldset: Geo & Mapping ---
    defineField({
      name: 'gpxFile',
      title: 'GPX Track File Asset',
      type: 'file',
      fieldset: 'geo',
      options: {
        accept: '.gpx,application/gpx+xml,application/xml',
      },
      description: 'Official master GPX track file for this artwork.',
    }),
    defineField({
      name: 'routePolyline',
      title: 'Google Encoded Polyline String',
      type: 'text',
      fieldset: 'geo',
      rows: 3,
      description: 'Encoded GPS polyline representation used by Leaflet maps.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'miniMapSvg',
      title: 'Mini-Map SVG Markup / Path',
      type: 'text',
      fieldset: 'geo',
      rows: 4,
      description: 'Static SVG trace path string for fast SSG card previews.',
    }),
    defineField({
      name: 'elevationProfile',
      title: 'Elevation Profile Data (JSON / String)',
      type: 'text',
      fieldset: 'geo',
      rows: 3,
      description: 'Sampled elevation array string for the interactive elevation scrubber.',
    }),
    defineField({
      name: 'stravaRouteUrl',
      title: 'Strava Route URL',
      type: 'url',
      fieldset: 'geo',
      validation: (rule) =>
        rule.uri({ scheme: ['http', 'https'] }).error('Must be a valid HTTP/HTTPS URL'),
    }),
    defineField({
      name: 'startPointDescription',
      title: 'Start Point Description',
      type: 'string',
      fieldset: 'geo',
      description: 'MTR exit or landmark where this route begins.',
    }),

    // --- Narrative & Media ---
    defineField({
      name: 'description',
      title: 'Route Blurb / Description',
      type: 'text',
      rows: 3,
      description: 'Breathy editorial narrative describing the companion and terrain.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          initialValue: 'Route companion scenery photograph',
        }),
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Feature Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),

    // --- Fieldset: Scheduled Community Group Run ---
    defineField({
      name: 'isGroupRun',
      title: 'Scheduled Community Group Run Active',
      type: 'boolean',
      fieldset: 'groupRun',
      description: 'When enabled, displays the Group Run Green banner across route cards.',
      initialValue: false,
    }),
    defineField({
      name: 'groupRunDateTime',
      title: 'Group Run Date & Time',
      type: 'datetime',
      fieldset: 'groupRun',
      hidden: ({ parent }) => !parent?.isGroupRun,
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as { isGroupRun?: boolean })?.isGroupRun && !value) {
            return 'Group run date and time is required when group run is active';
          }
          return true;
        }),
    }),
    defineField({
      name: 'groupRunMeetupPoint',
      title: 'Meetup Point',
      type: 'string',
      fieldset: 'groupRun',
      hidden: ({ parent }) => !parent?.isGroupRun,
    }),
    defineField({
      name: 'groupRunNotes',
      title: 'Group Run Notes / Instructions',
      type: 'text',
      fieldset: 'groupRun',
      rows: 3,
      hidden: ({ parent }) => !parent?.isGroupRun,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      district: 'district',
      distance: 'distanceKm',
      media: 'coverImage',
      isGroupRun: 'isGroupRun',
    },
    prepare({ title, district, distance, media, isGroupRun }) {
      const groupRunBadge = isGroupRun ? ' [GROUP RUN]' : '';
      return {
        title: `${title}${groupRunBadge}`,
        subtitle: `${district || 'Hong Kong'} · ${distance ? `${distance}km` : 'TBD'}`,
        media,
      };
    },
  },
});
```

---

### Step 5: Create [src/sanity/schemaTypes/charityType.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/schemaTypes/charityType.ts)

Define the `charity` document schema per `master-spec-sheet.md` Section 5.2:

```typescript
import { defineType, defineField } from 'sanity';
import { HeartIcon } from '@sanity/icons/Heart';

export const charityType = defineType({
  name: 'charity',
  title: 'Charity Partner',
  type: 'document',
  icon: HeartIcon,
  fieldsets: [
    { name: 'organization', title: 'Organization Details' },
    { name: 'impact', title: 'Impact Metric & Equivalency Formulas' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Charity Name',
      type: 'string',
      fieldset: 'organization',
      description: 'Official partner organization name (e.g. SPCA (HK)).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      fieldset: 'organization',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) =>
        rule.required().custom((slug) => {
          if (!slug?.current) return 'Slug is required';
          if (!/^[a-z0-9-]+$/.test(slug.current)) {
            return 'Slug must be lowercase alphanumeric characters with hyphens only';
          }
          return true;
        }),
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
      fieldset: 'organization',
      validation: (rule) =>
        rule.required().uri({ scheme: ['http', 'https'] }).error('Must be a valid HTTP/HTTPS URL'),
    }),
    defineField({
      name: 'logo',
      title: 'Charity Logo',
      type: 'image',
      fieldset: 'organization',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          initialValue: 'Charity partner logo',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverPhoto',
      title: 'Cover Photo',
      type: 'image',
      fieldset: 'organization',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          initialValue: 'Charity mission cover photo',
        }),
      ],
    }),
    defineField({
      name: 'charityDescription',
      title: 'Charity Overview Description',
      type: 'text',
      fieldset: 'organization',
      rows: 4,
      description: 'Organizational overview of the Section 88 tax-exempt non-profit.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'causeDescription',
      title: 'Specific Cause / Campaign Description',
      type: 'text',
      fieldset: 'organization',
      rows: 3,
      description: 'The specific cause or initiative supported by this artwork pairing.',
      validation: (rule) => rule.required(),
    }),

    // --- Fieldset: Impact Formulas ---
    defineField({
      name: 'impactUnitName',
      title: 'Impact Unit Name',
      type: 'string',
      fieldset: 'impact',
      description: 'Human-readable unit (e.g., "meals provided", "days of shelter", "trees planted").',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'impactMultiplierPerHkd',
      title: 'Impact Multiplier (Units per HK$1)',
      type: 'number',
      fieldset: 'impact',
      description: 'Multiplier applied to HKD donations (e.g. 0.1 for 1 meal per HK$10).',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'impactDisplayTemplate',
      title: 'Impact Display Template',
      type: 'string',
      fieldset: 'impact',
      description:
        'Display template string with tokens {amount} and {impact} (e.g., "HK${amount} provides {impact} meals for rescue animals").',
      initialValue: 'HK${amount} provides {impact} meals for rescue animals',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'websiteUrl',
      media: 'logo',
    },
  },
});
```

---

### Step 6: Create [src/sanity/schemaTypes/siteCopyType.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/schemaTypes/siteCopyType.ts)

Define the `siteCopy` singleton document schema with Studio tabs (`groups`) per `master-spec-sheet.md` Section 5.3:

```typescript
import { defineType, defineField, defineArrayMember } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';

export const siteCopyType = defineType({
  name: 'siteCopy',
  title: 'Site Copy & Global Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'announcement', title: 'Announcement Ticker', default: true },
    { name: 'hero', title: 'Hero' },
    { name: 'counters', title: 'Movement Counters' },
    { name: 'journey', title: 'Journey Steps' },
    { name: 'faqs', title: 'FAQs' },
    { name: 'about', title: 'About & Slogans' },
  ],
  fields: [
    // --- Group: Announcement Ticker ---
    defineField({
      name: 'announcementEnabled',
      title: 'Announcement Ticker Enabled',
      type: 'boolean',
      group: 'announcement',
      initialValue: true,
    }),
    defineField({
      name: 'announcementTickerText',
      title: 'Announcement Ticker Text',
      type: 'string',
      group: 'announcement',
      description: 'Dynamic announcement string (max 120 characters).',
      validation: (rule) => rule.max(120).warning('Keep ticker text concise for mobile screens'),
      initialValue: 'NEXT RUN: SAT AUG 8 @ 07:30 HKT | 12 RUNNERS JOINED',
    }),
    defineField({
      name: 'announcementTickerLink',
      title: 'Announcement Ticker Link',
      type: 'string',
      group: 'announcement',
      description: 'Internal route or URL (e.g., /signup).',
      initialValue: '/signup',
    }),
    defineField({
      name: 'announcementDefaultSlogan',
      title: 'Default Movement Slogan (Fallback)',
      type: 'string',
      group: 'announcement',
      description: 'Fallback text displayed when no upcoming group run is active.',
      initialValue: 'Your next run collective - Merging Community with Exercise and Art',
    }),

    // --- Group: Hero ---
    defineField({
      name: 'heroTitle',
      title: 'Hero Headline',
      type: 'string',
      group: 'hero',
      initialValue: 'the new way to push yourself in training and in giving back',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle / Description',
      type: 'text',
      rows: 3,
      group: 'hero',
      initialValue:
        'by bringing people together through long-distance running and community art, our project aims to help champion a kinder city.',
    }),
    defineField({
      name: 'heroCtaText',
      title: 'Primary CTA Text',
      type: 'string',
      group: 'hero',
      initialValue: 'run with us',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroCtaLink',
      title: 'Primary CTA Link',
      type: 'string',
      group: 'hero',
      initialValue: '/signup',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSecondaryCtaText',
      title: 'Secondary CTA Text',
      type: 'string',
      group: 'hero',
      initialValue: 'log a run',
    }),
    defineField({
      name: 'heroSecondaryCtaLink',
      title: 'Secondary CTA Link',
      type: 'string',
      group: 'hero',
      initialValue: '/log',
    }),

    // --- Group: Movement Counters ---
    defineField({
      name: 'totalKmCovered',
      title: 'Total Kilometers Covered',
      type: 'number',
      group: 'counters',
      description: 'Total distance completed across community runs.',
      initialValue: 187,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'totalRunsCompleted',
      title: 'Total Runs Completed',
      type: 'number',
      group: 'counters',
      description: 'Total verified route completions.',
      initialValue: 21,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'totalParticipantsCount',
      title: 'Total Participants Count',
      type: 'number',
      group: 'counters',
      description: 'Total active runners and caretakers.',
      initialValue: 33,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'countersSubtitle',
      title: 'Counters Suffix / Subtitle',
      type: 'string',
      group: 'counters',
      initialValue: 'km covered across 21 runs by 33 participants and counting',
    }),

    // --- Group: Journey Steps ---
    defineField({
      name: 'journeyHeadline',
      title: 'Journey Section Headline',
      type: 'string',
      group: 'journey',
      initialValue: 'the 3-step caretaker journey',
    }),
    defineField({
      name: 'journeySteps',
      title: 'Journey Steps',
      type: 'array',
      group: 'journey',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'journeyStep',
          title: 'Journey Step',
          fields: [
            defineField({
              name: 'stepNumber',
              title: 'Step Number / Ordinal',
              type: 'string',
              description: 'e.g., "one.", "two.", "three."',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Step Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Step Description',
              type: 'text',
              rows: 2,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'stepNumber',
            },
          },
        }),
      ],
      initialValue: [
        {
          _key: 'step1',
          stepNumber: 'one.',
          title: 'Match & Commit',
          description: 'Match with an animal route, choose a charity cause to pair with, and commit.',
        },
        {
          _key: 'step2',
          stepNumber: 'two.',
          title: 'Nurture & Grow',
          description: 'Bring your animal to life with your running steps and nurture your cause.',
        },
        {
          _key: 'step3',
          stepNumber: 'three.',
          title: 'Forever Guardian',
          description:
            'Own your success in running and impact! Hand off your run to its next caretaker.',
        },
      ],
    }),

    // --- Group: FAQs ---
    defineField({
      name: 'faqs',
      title: 'Frequently Asked Questions',
      type: 'array',
      group: 'faqs',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Item',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: [
                  { title: 'Adoption & Routes', value: 'adoption' },
                  { title: 'Logging & GPS Verification', value: 'logging' },
                  { title: 'Charities & Donations', value: 'charity' },
                  { title: 'General', value: 'general' },
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'category',
            },
          },
        }),
      ],
    }),

    // --- Group: About & Slogans ---
    defineField({
      name: 'missionStatement',
      title: 'Mission Statement',
      type: 'text',
      group: 'about',
      rows: 3,
      initialValue:
        'By bringing people together through long-distance running and community art, our project aims to help champion a kinder city where our shared compassion moves us forward.',
    }),
    defineField({
      name: 'essenceStatement',
      title: 'Essence Statement',
      type: 'text',
      group: 'about',
      rows: 3,
      initialValue:
        'Creating large-scale pieces of digital art through GPS tracking by running, jogging or walking an artwork to adopt and take care of it!',
    }),
    defineField({
      name: 'actionSlogan',
      title: 'Action Slogan',
      type: 'string',
      group: 'about',
      initialValue: 'Adopt the run. Complete the route. Own the impact.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Copy & Global Settings',
        subtitle: 'Global tabs & movement counters',
      };
    },
  },
});
```

---

### Step 7: Create [src/sanity/schemaTypes/index.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/schemaTypes/index.ts)

Export the schema types array:

```typescript
import { routeType } from './routeType';
import { charityType } from './charityType';
import { siteCopyType } from './siteCopyType';

export const schemaTypes = [routeType, charityType, siteCopyType];

export { routeType, charityType, siteCopyType };
```

---

### Step 8: Create [src/sanity/structure.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/structure.ts)

Configure the custom Studio structure resolver enforcing the `siteCopy` singleton:

```typescript
import type { StructureResolver } from 'sanity/structure';
import { CogIcon } from '@sanity/icons/Cog';
import { PinIcon } from '@sanity/icons/Pin';
import { HeartIcon } from '@sanity/icons/Heart';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Adopt A Run Content')
    .items([
      // 1. Singleton: Site Copy & Global Settings at the top
      S.listItem()
        .title('Site Copy & Settings')
        .id('siteCopySingleton')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteCopy')
            .documentId('siteCopy')
            .title('Site Copy & Global Settings')
        ),

      S.divider(),

      // 2. Repeatable Documents
      S.documentTypeListItem('route').title('Routes').icon(PinIcon),
      S.documentTypeListItem('charity').title('Charity Partners').icon(HeartIcon),
    ]);
```

---

### Step 9: Create Root [sanity.config.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/sanity.config.ts)

```typescript
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

export default defineConfig({
  name: 'adopt-a-run',
  title: 'Adopt A Run',
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'huk9xx07',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  plugins: [
    structureTool({
      structure,
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
```

---

### Step 10: Create [src/sanity/types.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/types.ts)

Define strict TypeScript types:

```typescript
export interface SanitySlug {
  _type: 'slug';
  current: string;
}

export interface SanityImageReference {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface SanityFileReference {
  _type: 'file';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

export interface SanityRoute {
  _id: string;
  _type: 'route';
  _createdAt?: string;
  _updatedAt?: string;
  title: string;
  slug: SanitySlug;
  animalType: string;
  district: string;
  region: 'Hong Kong Island' | 'Kowloon' | 'New Territories' | 'Outlying Islands';
  city: string;
  difficulty: 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'endurance';
  colorTheme: 'route-orange' | 'route-coral' | 'route-blush';
  featured: boolean;
  distanceKm: number;
  elevationGain: number;
  estimatedDurationMin: number;
  gpxFile?: SanityFileReference;
  routePolyline: string;
  miniMapSvg?: string;
  elevationProfile?: string;
  stravaRouteUrl?: string;
  startPointDescription?: string;
  description: string;
  coverImage?: SanityImageReference;
  tags?: string[];
  isGroupRun: boolean;
  groupRunDateTime?: string;
  groupRunMeetupPoint?: string;
  groupRunNotes?: string;
}

export interface SanityCharity {
  _id: string;
  _type: 'charity';
  _createdAt?: string;
  _updatedAt?: string;
  name: string;
  slug: SanitySlug;
  websiteUrl: string;
  logo: SanityImageReference;
  coverPhoto?: SanityImageReference;
  charityDescription: string;
  causeDescription: string;
  impactUnitName: string;
  impactMultiplierPerHkd: number;
  impactDisplayTemplate: string;
}

export interface JourneyStep {
  _key: string;
  stepNumber: string;
  title: string;
  description: string;
}

export interface FaqItem {
  _key: string;
  question: string;
  answer: string;
  category?: 'adoption' | 'logging' | 'charity' | 'general';
}

export interface SanitySiteCopy {
  _id: string;
  _type: 'siteCopy';
  announcementEnabled: boolean;
  announcementTickerText: string;
  announcementTickerLink: string;
  announcementDefaultSlogan: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  totalKmCovered: number;
  totalRunsCompleted: number;
  totalParticipantsCount: number;
  countersSubtitle?: string;
  journeyHeadline: string;
  journeySteps: JourneyStep[];
  faqs?: FaqItem[];
  missionStatement?: string;
  essenceStatement?: string;
  actionSlogan?: string;
}
```

---

### Step 11: Create [src/sanity/client.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/client.ts)

Export a typed Sanity client instance with graceful fallback for browser, edge SSR, and testing:

```typescript
import { createClient, type SanityClient } from '@sanity/client';

export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'huk9xx07';
export const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION || '2026-03-01';

export const sanityClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
});
```

---

### Step 12: Create [src/sanity/image.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/image.ts)

Export the `urlForImage` builder:

```typescript
import createImageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './client';

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
```

---

### Step 13: Create [src/sanity/queries.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/queries.ts)

Export typed GROQ queries wrapped in `defineQuery` and data fetching functions:

```typescript
import { defineQuery } from 'groq';
import { sanityClient } from './client';
import type { SanityRoute, SanityCharity, SanitySiteCopy } from './types';

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
    distanceKm,
    elevationGain,
    estimatedDurationMin,
    routePolyline,
    miniMapSvg,
    elevationProfile,
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
    distanceKm,
    elevationGain,
    estimatedDurationMin,
    gpxFile { asset-> { url, originalFilename } },
    routePolyline,
    miniMapSvg,
    elevationProfile,
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

export const CHARITIES_QUERY = defineQuery(
  `*[_type == "charity"] | order(name asc) {
    _id,
    _type,
    name,
    slug,
    websiteUrl,
    logo,
    coverPhoto,
    charityDescription,
    causeDescription,
    impactUnitName,
    impactMultiplierPerHkd,
    impactDisplayTemplate
  }`
);

export const CHARITY_BY_SLUG_QUERY = defineQuery(
  `*[_type == "charity" && slug.current == $slug][0] {
    _id,
    _type,
    name,
    slug,
    websiteUrl,
    logo,
    coverPhoto,
    charityDescription,
    causeDescription,
    impactUnitName,
    impactMultiplierPerHkd,
    impactDisplayTemplate
  }`
);

export const SITE_COPY_QUERY = defineQuery(
  `*[_type == "siteCopy" && _id in ["siteCopy", "drafts.siteCopy"]][0] {
    _id,
    _type,
    announcementEnabled,
    announcementTickerText,
    announcementTickerLink,
    announcementDefaultSlogan,
    heroTitle,
    heroSubtitle,
    heroCtaText,
    heroCtaLink,
    heroSecondaryCtaText,
    heroSecondaryCtaLink,
    totalKmCovered,
    totalRunsCompleted,
    totalParticipantsCount,
    countersSubtitle,
    journeyHeadline,
    journeySteps[] {
      _key,
      stepNumber,
      title,
      description
    },
    faqs[] {
      _key,
      question,
      answer,
      category
    },
    missionStatement,
    essenceStatement,
    actionSlogan
  }`
);

export async function getRoutes(): Promise<SanityRoute[]> {
  return await sanityClient.fetch(ROUTES_QUERY);
}

export async function getRouteBySlug(slug: string): Promise<SanityRoute | null> {
  return await sanityClient.fetch(ROUTE_BY_SLUG_QUERY, { slug });
}

export async function getCharities(): Promise<SanityCharity[]> {
  return await sanityClient.fetch(CHARITIES_QUERY);
}

export async function getCharityBySlug(slug: string): Promise<SanityCharity | null> {
  return await sanityClient.fetch(CHARITY_BY_SLUG_QUERY, { slug });
}

export async function getSiteCopy(): Promise<SanitySiteCopy | null> {
  return await sanityClient.fetch(SITE_COPY_QUERY);
}
```

---

### Step 14: Create [src/sanity/index.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/sanity/index.ts)

Unified barrel export:

```typescript
export * from './client';
export * from './image';
export * from './queries';
export * from './types';
export * from './schemaTypes';
export * from './structure';
```

---

### Step 15: Create [tests/sanity/schemas.test.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/sanity/schemas.test.ts)

Write comprehensive unit tests validating schemas, Studio structure, image builder, queries, and client configuration:

```typescript
import { describe, it, expect } from 'vitest';
import { schemaTypes, routeType, charityType, siteCopyType } from '../../src/sanity/schemaTypes';
import { structure } from '../../src/sanity/structure';
import {
  ROUTES_QUERY,
  ROUTE_BY_SLUG_QUERY,
  CHARITIES_QUERY,
  CHARITY_BY_SLUG_QUERY,
  SITE_COPY_QUERY,
} from '../../src/sanity/queries';
import { urlForImage } from '../../src/sanity/image';
import { sanityClient, projectId, dataset } from '../../src/sanity/client';

describe('Sanity CMS Schemas & Configuration', () => {
  describe('Schema Registry', () => {
    it('exports all 3 content schemas', () => {
      const typeNames = schemaTypes.map((t) => t.name);
      expect(typeNames).toContain('route');
      expect(typeNames).toContain('charity');
      expect(typeNames).toContain('siteCopy');
      expect(schemaTypes.length).toBe(3);
    });
  });

  describe('Route Schema (routeType)', () => {
    it('contains all required fields and fieldsets', () => {
      expect(routeType.name).toBe('route');
      expect(routeType.type).toBe('document');

      const fieldNames = (routeType.fields || []).map((f) => f.name);
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('slug');
      expect(fieldNames).toContain('animalType');
      expect(fieldNames).toContain('district');
      expect(fieldNames).toContain('region');
      expect(fieldNames).toContain('city');
      expect(fieldNames).toContain('difficulty');
      expect(fieldNames).toContain('colorTheme');
      expect(fieldNames).toContain('distanceKm');
      expect(fieldNames).toContain('elevationGain');
      expect(fieldNames).toContain('estimatedDurationMin');
      expect(fieldNames).toContain('gpxFile');
      expect(fieldNames).toContain('routePolyline');
      expect(fieldNames).toContain('miniMapSvg');
      expect(fieldNames).toContain('elevationProfile');
      expect(fieldNames).toContain('stravaRouteUrl');
      expect(fieldNames).toContain('description');
      expect(fieldNames).toContain('coverImage');
      expect(fieldNames).toContain('isGroupRun');
      expect(fieldNames).toContain('groupRunDateTime');
      expect(fieldNames).toContain('groupRunMeetupPoint');
      expect(fieldNames).toContain('groupRunNotes');
    });

    it('has groupRun fields assigned to groupRun fieldset', () => {
      const groupRunField = (routeType.fields || []).find((f) => f.name === 'isGroupRun');
      expect(groupRunField?.fieldset).toBe('groupRun');
    });
  });

  describe('Charity Schema (charityType)', () => {
    it('contains all partner, logo, and impact calculation fields', () => {
      expect(charityType.name).toBe('charity');
      expect(charityType.type).toBe('document');

      const fieldNames = (charityType.fields || []).map((f) => f.name);
      expect(fieldNames).toContain('name');
      expect(fieldNames).toContain('slug');
      expect(fieldNames).toContain('websiteUrl');
      expect(fieldNames).toContain('logo');
      expect(fieldNames).toContain('coverPhoto');
      expect(fieldNames).toContain('charityDescription');
      expect(fieldNames).toContain('causeDescription');
      expect(fieldNames).toContain('impactUnitName');
      expect(fieldNames).toContain('impactMultiplierPerHkd');
      expect(fieldNames).toContain('impactDisplayTemplate');
    });
  });

  describe('SiteCopy Singleton Schema (siteCopyType)', () => {
    it('has studio tabs defined for hero, announcement, counters, journey, and faqs', () => {
      expect(siteCopyType.name).toBe('siteCopy');
      const groupNames = (siteCopyType.groups || []).map((g) => g.name);
      expect(groupNames).toContain('announcement');
      expect(groupNames).toContain('hero');
      expect(groupNames).toContain('counters');
      expect(groupNames).toContain('journey');
      expect(groupNames).toContain('faqs');
      expect(groupNames).toContain('about');
    });

    it('contains movement counters fields', () => {
      const fieldNames = (siteCopyType.fields || []).map((f) => f.name);
      expect(fieldNames).toContain('totalKmCovered');
      expect(fieldNames).toContain('totalRunsCompleted');
      expect(fieldNames).toContain('totalParticipantsCount');
    });
  });

  describe('Studio Structure', () => {
    it('defines a structure resolver function', () => {
      expect(typeof structure).toBe('function');
    });
  });

  describe('Client & Image Utilities', () => {
    it('configures sanityClient with project and dataset', () => {
      expect(projectId).toBe('huk9xx07');
      expect(dataset).toBe('production');
      expect(sanityClient).toBeDefined();
    });

    it('urlForImage generates valid image url string', () => {
      const mockImageSource = {
        _type: 'image' as const,
        asset: {
          _ref: 'image-1234567890abcdef-800x600-png',
          _type: 'reference' as const,
        },
      };
      const url = urlForImage(mockImageSource).width(400).url();
      expect(url).toContain('https://cdn.sanity.io/images/huk9xx07/production/');
      expect(url).toContain('w=400');
    });

    it('GROQ queries are valid strings', () => {
      expect(typeof ROUTES_QUERY).toBe('string');
      expect(typeof ROUTE_BY_SLUG_QUERY).toBe('string');
      expect(typeof CHARITIES_QUERY).toBe('string');
      expect(typeof CHARITY_BY_SLUG_QUERY).toBe('string');
      expect(typeof SITE_COPY_QUERY).toBe('string');
      expect(ROUTES_QUERY).toContain('*[_type == "route"]');
      expect(CHARITIES_QUERY).toContain('*[_type == "charity"]');
      expect(SITE_COPY_QUERY).toContain('*[_type == "siteCopy"');
    });
  });
});
```

---

## 6. Verification & Done Criteria

1. **Run Sanity Unit Test Suite**:
   ```bash
   npx vitest run tests/sanity/schemas.test.ts
   ```
   **Expected**: 100% tests pass.

2. **Run TypeScript Check**:
   ```bash
   npx astro check && npx tsc --noEmit
   ```
   **Expected**: Zero diagnostics errors.

3. **Run Design System Check**:
   ```bash
   npm run check:design
   ```
   **Expected**: 0 anti-patterns reported.

4. **Verify Astro Build**:
   ```bash
   npm run build
   ```
   **Expected**: Clean build generated in `dist/`.
