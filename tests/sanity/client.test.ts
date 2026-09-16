import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('public Sanity client', () => {
  it('always reads published content with stega off, whatever the local env says', async () => {
    // The legacy flag that used to leak stega + drafts into production builds.
    vi.stubEnv('PUBLIC_SANITY_VISUAL_EDITING_ENABLED', 'true');
    vi.stubEnv('SANITY_API_READ_TOKEN', 'viewer-token');
    const { sanityClient } = await import('@/sanity/client');
    const config = sanityClient.config();

    expect(config.perspective).toBe('published');
    expect(config.stega.enabled).toBe(false);
    expect(config.token).toBeUndefined();
  });
});

describe('createPreviewClient', () => {
  it('reads drafts with stega pointed at the Studio', async () => {
    const { createPreviewClient } = await import('@/sanity/client');
    const config = createPreviewClient('viewer-token').config();

    expect(config.perspective).toBe('drafts');
    expect(config.token).toBe('viewer-token');
    expect(config.stega.enabled).toBe(true);
    expect(config.stega.studioUrl).toBe('https://adoptarun.sanity.studio');
  });

  it('leaves the public client untouched', async () => {
    const { sanityClient, createPreviewClient } = await import('@/sanity/client');
    createPreviewClient('viewer-token');

    expect(sanityClient.config().stega.enabled).toBe(false);
    expect(sanityClient.config().token).toBeUndefined();
  });
});
