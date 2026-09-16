import { describe, it, expect, vi } from 'vitest';
import type { SanityClientLike } from '@sanity/preview-url-secret';
import { enableDraftMode, hasDraftSession, DRAFT_MODE_COOKIE, PREVIEW_FRAME_ANCESTORS_CSP, type CookieJar } from '@/sanity/preview';

const VALID_SECRET = 'studio-issued-secret';

/** Minimal Sanity client whose secret store knows exactly one live secret. */
function fakeClient(knownSecret: string | null = VALID_SECRET): SanityClientLike {
  const client = {
    config: () => ({ token: 'viewer-token' }),
    withConfig: () => client,
    fetch: vi.fn(async (_query: string, params: { secret: string }) => ({
      private:
        knownSecret && params.secret === knownSecret
          ? {
              _id: 'sanity-preview-url-secret.abc',
              _updatedAt: new Date().toISOString(),
              secret: knownSecret,
              studioUrl: 'https://adoptarun.org/studio',
            }
          : null,
      public: null,
    })),
  };
  return client as unknown as SanityClientLike;
}

function cookieJar(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  const set = vi.fn((name: string, value: string) => void store.set(name, value));
  const jar: CookieJar = {
    get: (name) => (store.has(name) ? { value: store.get(name)! } : undefined),
    set,
  };
  return { jar, set };
}

function enableRequest(secret: string, pathname = '/preview') {
  const url = new URL('https://adoptarun.org/api/draft-mode/enable');
  url.searchParams.set('sanity-preview-secret', secret);
  url.searchParams.set('sanity-preview-pathname', pathname);
  return new Request(url);
}

describe('enableDraftMode', () => {
  it('responds 503 when no read token is configured', async () => {
    const { jar, set } = cookieJar();
    const response = await enableDraftMode(enableRequest(VALID_SECRET), jar, null);

    expect(response.status).toBe(503);
    expect(set).not.toHaveBeenCalled();
  });

  it('rejects an unknown secret without setting a session', async () => {
    const { jar, set } = cookieJar();
    const response = await enableDraftMode(enableRequest('forged'), jar, fakeClient());

    expect(response.status).toBe(401);
    expect(set).not.toHaveBeenCalled();
  });

  it('stores the secret in a cross-site-safe, http-only cookie and redirects into the preview', async () => {
    const { jar, set } = cookieJar();
    const response = await enableDraftMode(enableRequest(VALID_SECRET), jar, fakeClient());

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe('/preview');
    expect(response.headers.get('Content-Security-Policy')).toBe(PREVIEW_FRAME_ANCESTORS_CSP);
    expect(set).toHaveBeenCalledWith(
      DRAFT_MODE_COOKIE,
      VALID_SECRET,
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'none', partitioned: true })
    );
  });

  it('normalizes root path "/" to "/preview" where visual editing lives', async () => {
    const { jar } = cookieJar();
    const response = await enableDraftMode(enableRequest(VALID_SECRET, '/'), jar, fakeClient());

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe('/preview');
  });

  it('whitelists sanity.io and sanity.studio domains in CSP frame-ancestors', () => {
    expect(PREVIEW_FRAME_ANCESTORS_CSP).toContain('https://adoptarun.sanity.studio');
    expect(PREVIEW_FRAME_ANCESTORS_CSP).toContain('https://www.sanity.io');
    expect(PREVIEW_FRAME_ANCESTORS_CSP).toContain('https://sanity.io');
    expect(PREVIEW_FRAME_ANCESTORS_CSP).toContain('https://*.sanity.io');
    expect(PREVIEW_FRAME_ANCESTORS_CSP).toContain('https://*.sanity.studio');
  });

  it('only redirects to a same-origin path, even if Studio passes an absolute URL', async () => {
    const { jar } = cookieJar();
    const response = await enableDraftMode(
      enableRequest(VALID_SECRET, 'https://evil.example/phish'),
      jar,
      fakeClient()
    );

    expect(response.headers.get('Location')).toBe('/phish');
  });
});

describe('hasDraftSession', () => {
  it('is false without a session cookie', async () => {
    const { jar } = cookieJar();
    expect(await hasDraftSession(jar, fakeClient())).toBe(false);
  });

  it('is false when the preview client is not configured', async () => {
    const { jar } = cookieJar({ [DRAFT_MODE_COOKIE]: VALID_SECRET });
    expect(await hasDraftSession(jar, null)).toBe(false);
  });

  it('is false for a hand-forged or expired cookie value', async () => {
    const { jar } = cookieJar({ [DRAFT_MODE_COOKIE]: 'forged' });
    expect(await hasDraftSession(jar, fakeClient())).toBe(false);
  });

  it('is true for a secret Sanity still recognises', async () => {
    const { jar } = cookieJar({ [DRAFT_MODE_COOKIE]: VALID_SECRET });
    expect(await hasDraftSession(jar, fakeClient())).toBe(true);
  });
});
