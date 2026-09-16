import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { loadEnv } from 'vite';

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, PUBLIC_SANITY_API_VERSION } = loadEnv(
  process.env.NODE_ENV ?? 'development',
  process.cwd(),
  ''
);

const isBuildOrPreview = process.argv.some((arg) => ['build', 'preview'].includes(arg));

// https://astro.build/config
export default defineConfig({
  site: 'https://adoptarun.org',
  output: 'static',
  session: false,
  env: {
    schema: {
      // Server-only secret for the on-demand /preview route (Cloudflare Worker secret in production).
      SANITY_API_READ_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  adapter: isBuildOrPreview
    ? cloudflare({
        imageService: 'passthrough',
      })
    : undefined,
  integrations: [
    react(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID || 'huk9xx07',
      dataset: PUBLIC_SANITY_DATASET || 'production',
      apiVersion: PUBLIC_SANITY_API_VERSION || '2026-03-01',
      useCdn: false,
      stega: {
        studioUrl: process.env.PUBLIC_SANITY_STUDIO_URL || 'https://adoptarun.sanity.studio',
      },
    }),
  ],
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom', 'styled-components'],
    },
  },
});

