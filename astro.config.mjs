import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

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
  // Attached in dev as well as build: `POST /api/signup` and the confirmation
  // page read D1 off `locals.runtime.env`, which only exists when the site runs
  // inside workerd. Local bindings come from `wrangler.jsonc`, secrets from
  // `.dev.vars`, so dev, preview, and production share one runtime.
  adapter: cloudflare({
    imageService: 'compile',
  }),
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
    ssr: {
      // Pre-declare Astro/Cloudflare internals the workerd dev runner needs so Vite
      // never discovers them mid-request: a mid-flight rewrite of `.vite/deps_ssr`
      // invalidates the module paths workerd already holds, crashing with
      // "The file does not exist at .../deps_ssr/<chunk>.js" (withastro/astro#17893, #17921).
      optimizeDeps: {
        include: [
          'astro/app/manifest',
          'astro/logger/console',
          'astro/logger/json',
          'astro/assets/services/noop',
          '@astrojs/cloudflare/cache/provider',
          '@astrojs/react/server.js',
          'react-dom/client',
          'react-dom',
          'react',
          '@shadergradient/react',
          '@react-three/fiber',
          '@nanostores/react',
        ],
      },
    },
  },
});

