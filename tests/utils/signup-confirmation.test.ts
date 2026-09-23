import { describe, it, expect } from 'vitest';
import { toConfirmationRecord, canonicalAdopterId } from '@/utils/signup-confirmation';
import type { AdoptionRecord } from '@/db/types';
import type { PortalRoute } from '@/components/signup/types';

const adoption: AdoptionRecord = {
  seq_num: 1104,
  adopter_id: '1104-PC',
  runner_first_name: 'Peter',
  runner_last_name: 'Chan',
  email: 'peter.chan@example.com',
  route_slug: 'sha-tin-boar',
  charity_slug: 'spca',
  commitment_days: 5,
  target_date: '2026-03-15',
  target_hkd: 500,
  animal_name: 'Mochi',
  status: 'committed',
  confirmation_email_sent_at: null,
  created_at: '2026-03-10 02:00:00',
  updated_at: '2026-03-10 02:00:00',
};

const soloRoute: PortalRoute = {
  slug: 'sha-tin-boar',
  title: 'Sha Tin Boar',
  district: 'Sha Tin',
  blurb: null,
  distanceKm: 12,
  elevationGain: 240,
  estimatedDurationMin: 90,
  difficulty: 'moderate',
  isGroupRun: false,
  groupRunDateTime: null,
  startPoint: null,
  meetupPoint: null,
  miniMapSvg: null,
};

describe('toConfirmationRecord', () => {
  it('carries the adoption details the page renders', () => {
    const record = toConfirmationRecord(adoption, soloRoute);

    expect(record.adopterId).toBe('1104-PC');
    expect(record.companionName).toBe('Mochi');
    expect(record.routeSlug).toBe('sha-tin-boar');
    expect(record.charitySlug).toBe('spca');
    expect(record.commitmentDays).toBe(5);
    expect(record.targetDate).toBe('2026-03-15');
    expect(record.targetHkd).toBe(500);
  });

  it('carries no personal detail, because this page is addressed by a guessable ID', () => {
    const record = toConfirmationRecord(adoption, soloRoute);
    const serialised = JSON.stringify(record);

    expect(serialised).not.toContain('Peter');
    expect(serialised).not.toContain('Chan');
    expect(serialised).not.toContain('peter.chan@example.com');
  });

  it('has no meetup time for a solo adoption', () => {
    expect(toConfirmationRecord(adoption, soloRoute).targetTime).toBeNull();
  });

  it('takes the meetup time from a Group Run, in Hong Kong time', () => {
    const groupRoute: PortalRoute = {
      ...soloRoute,
      isGroupRun: true,
      // 07:30 Hong Kong == 23:30 UTC the previous day.
      groupRunDateTime: '2026-03-14T23:30:00.000Z',
    };

    expect(toConfirmationRecord(adoption, groupRoute).targetTime).toBe('07:30');
  });

  it('has no meetup time when a Group Run has no scheduled time', () => {
    const groupRoute: PortalRoute = { ...soloRoute, isGroupRun: true, groupRunDateTime: null };

    expect(toConfirmationRecord(adoption, groupRoute).targetTime).toBeNull();
  });

  it('still renders when the route slug resolves to nothing', () => {
    const record = toConfirmationRecord({ ...adoption, route_slug: 'deleted-route' }, null);

    expect(record.routeSlug).toBe('deleted-route');
    expect(record.targetTime).toBeNull();
  });

  it('falls back to no fundraising goal when the target is null', () => {
    const record = toConfirmationRecord({ ...adoption, target_hkd: null }, soloRoute);

    expect(record.targetHkd).toBeNull();
  });
});

describe('canonicalAdopterId', () => {
  it('accepts a canonical Adopter ID unchanged', () => {
    expect(canonicalAdopterId('1104-PC')).toBe('1104-PC');
  });

  /**
   * The repository looks adoptions up case-insensitively on purpose, so the
   * page must not be stricter than the store behind it. A Runner retyping the
   * ID from their confirmation email should land on their adoption.
   */
  it('upper-cases a lower-case ID rather than rejecting it', () => {
    expect(canonicalAdopterId('1104-pc')).toBe('1104-PC');
  });

  it('tolerates surrounding whitespace from a copy-paste', () => {
    expect(canonicalAdopterId('  1104-pc  ')).toBe('1104-PC');
  });

  it('rejects anything that is not an Adopter ID, so a scan costs no database read', () => {
    expect(canonicalAdopterId('not-an-id')).toBeNull();
    expect(canonicalAdopterId('1104-P')).toBeNull();
    expect(canonicalAdopterId('1104-12')).toBeNull();
    expect(canonicalAdopterId('')).toBeNull();
  });
});
