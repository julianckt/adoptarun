import { createClient, type SanityClient } from '@sanity/client';

export const projectId = import.meta.env?.PUBLIC_SANITY_PROJECT_ID || 'huk9xx07';
export const dataset = import.meta.env?.PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = import.meta.env?.PUBLIC_SANITY_API_VERSION || '2026-03-01';
/** Where stega-encoded overlays deep-link to (Sanity-hosted Studio, #28). */
export const studioUrl = import.meta.env?.PUBLIC_SANITY_STUDIO_URL || 'https://adoptarun.sanity.studio';

/**
 * Public client: published content only, stega always off. Every statically built page uses this,
 * so no environment variable can leak drafts or zero-width stega characters into production HTML.
 */
export const sanityClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
  stega: { enabled: false },
});

/**
 * Preview client for the on-demand `/preview` route: drafts + stega for Presentation's
 * click-to-edit overlays. The token is a server-only secret and never reaches the browser.
 */
export function createPreviewClient(token: string): SanityClient {
  return sanityClient.withConfig({
    token,
    perspective: 'drafts',
    stega: { enabled: true, studioUrl },
  });
}
