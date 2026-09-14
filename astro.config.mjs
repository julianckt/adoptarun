import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { loadEnv } from 'vite';
import path from 'node:path';

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
        studioUrl: '/studio',
      },
    }),
  ],
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom', 'styled-components'],
      alias: {
        '@sanity/ui/_visual-editing': path.resolve(
          './node_modules/@sanity/astro/node_modules/@sanity/ui/dist/_visual-editing.js'
        ),
      },
    },
  },
});

