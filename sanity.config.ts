import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool, defineLocations } from 'sanity/presentation';
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
    presentationTool({
      previewUrl: {
        initial: '/',
      },
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
                href: '/',
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
