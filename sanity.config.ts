import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool, defineLocations } from 'sanity/presentation';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

const projectId =
  (typeof process !== 'undefined' ? process.env?.PUBLIC_SANITY_PROJECT_ID : undefined) ||
  (typeof import.meta !== 'undefined' ? import.meta.env?.PUBLIC_SANITY_PROJECT_ID : undefined) ||
  'huk9xx07';

const dataset =
  (typeof process !== 'undefined' ? process.env?.PUBLIC_SANITY_DATASET : undefined) ||
  (typeof import.meta !== 'undefined' ? import.meta.env?.PUBLIC_SANITY_DATASET : undefined) ||
  'production';

// Origin of the site Presentation previews. Defaults to https://adoptarun.org for hosted Studio (#28).
const previewOrigin =
  (typeof process !== 'undefined' ? process.env?.SANITY_STUDIO_PREVIEW_ORIGIN : undefined) ||
  (typeof import.meta !== 'undefined' ? import.meta.env?.PUBLIC_SANITY_PREVIEW_ORIGIN : undefined) ||
  'https://adoptarun.org';

export default defineConfig({
  name: 'adopt-a-run',
  title: 'Adopt A Run',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure,
    }),
    presentationTool({
      previewUrl: {
        // The public homepage is static published content; drafts render on-demand at /preview.
        initial: `${previewOrigin}/preview`,
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      allowOrigins: [
        previewOrigin,
        'https://adoptarun.org',
        'http://localhost:*',
      ],
      resolve: {
        locations: {
          route: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled Route',
                  href: `/routes/${doc?.slug}`,
                },
                {
                  title: 'Routes Directory',
                  href: '/routes',
                },
              ],
            }),
          }),
          charity: defineLocations({
            select: {
              name: 'name',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.name || 'Untitled Charity',
                  href: `/charities/${doc?.slug}`,
                },
                {
                  title: 'Charities Directory',
                  href: '/charities',
                },
              ],
            }),
          }),
          siteCopy: defineLocations({
            message: 'This document is used on the home page',
            tone: 'positive',
            locations: [
              {
                title: 'Home',
                href: '/preview',
              },
            ],
          }),
        },
      },
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
