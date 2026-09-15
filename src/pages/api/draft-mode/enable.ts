import type { APIRoute } from 'astro';
import { SANITY_API_READ_TOKEN } from 'astro:env/server';
import { createPreviewClient } from '@/sanity/client';
import { enableDraftMode } from '@/sanity/preview';

export const prerender = false;

/** Presentation's `previewMode.enable` endpoint: validates the Studio secret, then redirects into /preview. */
export const GET: APIRoute = ({ request, cookies }) =>
  enableDraftMode(
    request,
    cookies,
    SANITY_API_READ_TOKEN ? createPreviewClient(SANITY_API_READ_TOKEN) : null
  );
