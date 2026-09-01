import { describe, it, expect } from 'vitest';
import { GET, prerender } from '@/pages/api/health';

describe('SSR API Health Endpoint', () => {
  it('should explicitly disable prerender for on-demand SSR execution', () => {
    expect(prerender).toBe(false);
  });

  it('should return a valid JSON response with status ok', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const data = await response.json();
    expect(data).toEqual({
      status: 'ok',
      service: 'adopt-a-run-api',
      mode: 'ssr-endpoint',
    });
  });
});
