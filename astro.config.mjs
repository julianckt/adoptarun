import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

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
      // CARTO Basemap API Keys (dev for localhost, prod for *.adoptarun.org)
      PUBLIC_CARTO_API_KEY_DEV: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_CARTO_API_KEY_PROD: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  adapter: isBuildOrPreview
    ? cloudflare({
        imageService: 'compile',
      })
    : undefined,
  integrations: [
    react(),
  ],
  vite: {
    optimizeDeps: {
      include: ['react-dom/client', 'react-dom', 'react', '@shadergradient/react', '@react-three/fiber'],
    },
    resolve: {
      dedupe: ['react', 'react-dom', 'styled-components'],
    },
  },
});

