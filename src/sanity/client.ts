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
