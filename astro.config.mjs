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
    },
  },
  adapter: isBuildOrPreview
    ? cloudflare({
        imageService: 'passthrough',
      })
    : undefined,
  integrations: [
    react(),
  ],
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom', 'styled-components'],
    },
  },
});

