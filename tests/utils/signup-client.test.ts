import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitAdoption, type AdoptionSubmission } from '@/utils/signup-client';

const submission: AdoptionSubmission = {
  firstName: 'Peter',
  lastName: 'Chan',
  email: 'peter.chan@example.com',
  routeSlug: 'sha-tin-boar',
  charitySlug: 'spca',
  commitmentDays: 5,
  targetDate: '2026-03-15',
  targetHkd: 500,
  companionName: 'Mochi',
};

function respondWith(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  vi.stubGlobal('fetch', respondWith({ adopterId: '1104-PC' }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('submitAdoption', () => {
  it('posts the adoption to the signup endpoint', async () => {
    await submitAdoption(submission);

    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/signup');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual(submission);
  });

  it('returns the Adopter ID minted by the server', async () => {
    const result = await submitAdoption(submission);

    expect(result.adopterId).toBe('1104-PC');
  });

  it('throws when the server rejects the adoption, so the portal can surface it', async () => {
    vi.stubGlobal('fetch', respondWith({ errors: { email: 'That email looks incomplete.' } }, 400));

    await expect(submitAdoption(submission)).rejects.toThrow();
  });

  it('throws when the network fails rather than inventing an Adopter ID', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));

    await expect(submitAdoption(submission)).rejects.toThrow();
  });

  it('throws when the response carries no Adopter ID', async () => {
    vi.stubGlobal('fetch', respondWith({ adopterId: '' }));

    await expect(submitAdoption(submission)).rejects.toThrow();
  });
});
