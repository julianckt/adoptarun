import { describe, it, expect } from 'vitest';
import { cooldownRemainingMs, formatCooldown, DEPLOY_COOLDOWN_MS } from '../../src/sanity/utils/deploy-cooldown';

describe('deploy cooldown', () => {
  const now = Date.parse('2026-10-03T10:00:00Z');

  it('is ready when there was no previous request', () => {
    expect(cooldownRemainingMs(null, now)).toBe(0);
    expect(cooldownRemainingMs('not-a-date', now)).toBe(0);
  });

  it('counts down from the last request', () => {
    expect(cooldownRemainingMs('2026-10-03T09:58:00Z', now)).toBe(DEPLOY_COOLDOWN_MS - 2 * 60 * 1000);
  });

  it('is ready once the window has passed', () => {
    expect(cooldownRemainingMs('2026-10-03T09:50:00Z', now)).toBe(0);
  });

  it('ignores last requests from the future (clock skew)', () => {
    expect(cooldownRemainingMs('2026-10-03T10:30:00Z', now)).toBe(DEPLOY_COOLDOWN_MS);
  });

  it('formats the countdown', () => {
    expect(formatCooldown(245_000)).toBe('4 min 05 s');
  });
});
