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

// https://astro.build/config
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

