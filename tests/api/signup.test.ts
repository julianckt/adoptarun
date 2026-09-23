import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { createTestDb } from '../helpers/mock-d1';
import { env, resetEnv } from '../helpers/cloudflare-workers';
import { POST } from '@/pages/api/signup';

const VALID_BODY = {
  firstName: 'Julian',
  lastName: 'Chung',
  email: 'julian@example.com',
  routeSlug: 'dragon-back',
  charitySlug: 'spca',
  commitmentDays: 5,
  targetDate: '2026-09-27',
  targetHkd: 500,
  companionName: 'Lucky',
};

let db: D1Database;

/**
 * The context Astro hands an endpoint. Bindings deliberately do NOT live here:
 * Astro 7 removed `Astro.locals.runtime.env`, and the endpoint reads them from
 * `cloudflare:workers` instead. Tests populate that module's `env` directly.
 */
function contextFor(body: unknown) {
  return {
    request: new Request('https://adoptarun.org/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    site: new URL('https://adoptarun.org'),
  } as never;
}

beforeEach(async () => {
  db = await createTestDb();
  resetEnv();
  env.DB = db;
  env.RESEND_API_KEY = 're_test_key';
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ id: 'email_1' }), { status: 200 }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/signup', () => {
  it('writes the adoption to D1 and returns the generated Adopter ID', async () => {
    const response = await POST(contextFor(VALID_BODY));
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { adopterId: string };
    expect(payload.adopterId).toMatch(/^\d{4,}-JC$/);

    const row = await db
      .prepare('SELECT * FROM adoptions WHERE adopter_id = ?')
      .bind(payload.adopterId)
      .first<Record<string, unknown>>();

    expect(row).not.toBeNull();
    expect(row?.animal_name).toBe('Lucky');
    expect(row?.email).toBe('julian@example.com');
    expect(row?.charity_slug).toBe('spca');
    expect(row?.status).toBe('committed');
  });

  describe('rejects what it cannot honour', () => {
    it('rejects a non-ASCII name, because initials become the Adopter ID', async () => {
      const response = await POST(contextFor({ ...VALID_BODY, firstName: '張' }));
      expect(response.status).toBe(400);

      const payload = (await response.json()) as { errors: Record<string, string> };
      expect(payload.errors.firstName).toBeTruthy();
    });

    it('rejects a malformed email address', async () => {
      const response = await POST(contextFor({ ...VALID_BODY, email: 'julian@' }));
      expect(response.status).toBe(400);

      const payload = (await response.json()) as { errors: Record<string, string> };
      expect(payload.errors.email).toBeTruthy();
    });

    it('rejects a missing companion name — the adoption is not complete without it', async () => {
      const response = await POST(contextFor({ ...VALID_BODY, companionName: '  ' }));
      expect(response.status).toBe(400);

      const payload = (await response.json()) as { errors: Record<string, string> };
      expect(payload.errors.companionName).toBeTruthy();
    });

    it('rejects a negative commitment timeframe', async () => {
      const response = await POST(contextFor({ ...VALID_BODY, commitmentDays: -1 }));
      expect(response.status).toBe(400);
    });

    it('rejects an absurd commitment timeframe', async () => {
      const response = await POST(contextFor({ ...VALID_BODY, commitmentDays: 5000 }));
      expect(response.status).toBe(400);
    });

    it('rejects a fractional commitment timeframe', async () => {
      const response = await POST(contextFor({ ...VALID_BODY, commitmentDays: 2.5 }));
      expect(response.status).toBe(400);
    });

    /**
     * The 1–20 range belongs to the Commitment Timeframe slider, which only
     * governs a solo adoption. A Group Run derives its timeframe from the event
     * date instead, and that derived value legitimately falls outside the
     * slider's bounds — 0 for a run already under way inside its 24h grace
     * window, or well past 20 for one scheduled months out. The server cannot
     * tell the two apart, because it deliberately does not look the route up in
     * Sanity, so enforcing the slider's range here rejects real adoptions.
     */
    it('accepts a Group Run already under way, whose derived timeframe is 0 days', async () => {
      const response = await POST(contextFor({ ...VALID_BODY, commitmentDays: 0 }));

      expect(response.status).toBe(200);
      const { adopterId } = (await response.json()) as { adopterId: string };
      const row = await db
        .prepare('SELECT commitment_days FROM adoptions WHERE adopter_id = ?')
        .bind(adopterId)
        .first<{ commitment_days: number }>();
      expect(row?.commitment_days).toBe(0);
    });

    it('accepts a Group Run scheduled beyond the slider’s 20-day maximum', async () => {
      const response = await POST(contextFor({ ...VALID_BODY, commitmentDays: 31 }));

      expect(response.status).toBe(200);
    });

    it('rejects an impact target outside HK$100–HK$2,000', async () => {
      const response = await POST(contextFor({ ...VALID_BODY, targetHkd: 999999 }));
      expect(response.status).toBe(400);
    });

    it('rejects a target date that is not ISO-8601', async () => {
      const response = await POST(contextFor({ ...VALID_BODY, targetDate: '27/09/2026' }));
      expect(response.status).toBe(400);
    });

    it('rejects a body that is not JSON', async () => {
      const response = await POST({
        request: new Request('https://adoptarun.org/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'not json',
        }),
        site: new URL('https://adoptarun.org'),
      } as never);

      expect(response.status).toBe(400);
    });

    it('writes nothing to D1 when validation fails', async () => {
      await POST(contextFor({ ...VALID_BODY, companionName: '' }));

      const row = await db
        .prepare('SELECT COUNT(*) as count FROM adoptions')
        .first<{ count: number }>();
      expect(row?.count).toBe(0);
    });

    it('does not burn an Adopter ID when validation fails', async () => {
      await POST(contextFor({ ...VALID_BODY, companionName: '' }));

      const row = await db
        .prepare('SELECT current_val FROM counters WHERE id = ?')
        .bind('adopter_seq')
        .first<{ current_val: number }>();
      expect(row?.current_val).toBe(1100);
    });
  });

  describe('confirmation email', () => {
    it('sends from letsrun@adoptarun.org to the Runner, carrying the Adopter ID', async () => {
      const response = await POST(contextFor(VALID_BODY));
      const { adopterId } = (await response.json()) as { adopterId: string };

      expect(fetch).toHaveBeenCalledTimes(1);
      const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];

      expect(url).toBe('https://api.resend.com/emails');
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test_key');

      const sent = JSON.parse(init.body as string);
      expect(sent.from).toContain('letsrun@adoptarun.org');
      expect(sent.to).toEqual(['julian@example.com']);
      expect(sent.subject).toBeTruthy();
      expect(sent.html).toContain(adopterId);
      expect(sent.text).toContain(adopterId);
    });

    it('records when the confirmation was sent', async () => {
      const response = await POST(contextFor(VALID_BODY));
      const { adopterId } = (await response.json()) as { adopterId: string };

      const row = await db
        .prepare('SELECT confirmation_email_sent_at FROM adoptions WHERE adopter_id = ?')
        .bind(adopterId)
        .first<{ confirmation_email_sent_at: string | null }>();

      expect(row?.confirmation_email_sent_at).toBeTruthy();
    });

    it('still completes the adoption when Resend throws', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }));

      const response = await POST(contextFor(VALID_BODY));
      expect(response.status).toBe(200);

      const { adopterId } = (await response.json()) as { adopterId: string };
      expect(adopterId).toMatch(/^\d{4,}-JC$/);

      const row = await db
        .prepare('SELECT confirmation_email_sent_at FROM adoptions WHERE adopter_id = ?')
        .bind(adopterId)
        .first<{ confirmation_email_sent_at: string | null }>();

      expect(row?.confirmation_email_sent_at).toBeNull();
    });

    it('still completes the adoption when Resend returns an error status', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response(JSON.stringify({ message: 'rate limited' }), { status: 429 }))
      );

      const response = await POST(contextFor(VALID_BODY));
      expect(response.status).toBe(200);

      const { adopterId } = (await response.json()) as { adopterId: string };
      const row = await db
        .prepare('SELECT confirmation_email_sent_at FROM adoptions WHERE adopter_id = ?')
        .bind(adopterId)
        .first<{ confirmation_email_sent_at: string | null }>();

      expect(row?.confirmation_email_sent_at).toBeNull();
    });

    it('completes the adoption without sending when no API key is configured', async () => {
      delete env.RESEND_API_KEY;
      const response = await POST(contextFor(VALID_BODY));

      expect(response.status).toBe(200);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  it('returns the confirmation page address for the Adopter ID', async () => {
    const response = await POST(contextFor(VALID_BODY));
    const payload = (await response.json()) as { adopterId: string; confirmationUrl: string };

    expect(payload.confirmationUrl).toBe(
      `https://adoptarun.org/signup/confirmed/${payload.adopterId}`
    );
  });
});
