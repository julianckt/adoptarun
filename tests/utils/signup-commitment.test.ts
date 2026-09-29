import { describe, it, expect } from 'vitest';
import {
  resolveCommitment,
  COMMITMENT_DAYS_MIN,
  COMMITMENT_DAYS_MAX,
  COMMITMENT_DAYS_DEFAULT,
  formatTargetDate,
} from '../../src/utils/signup-commitment';
import type { GroupRunCandidate } from '../../src/utils/signup-commitment';

const soloRoute: GroupRunCandidate = { isGroupRun: false };

const groupRunRoute = (groupRunDateTime: string): GroupRunCandidate => ({
  isGroupRun: true,
  groupRunDateTime,
});

describe('resolveCommitment', () => {
  describe('solo adoption', () => {
    it('derives the target date by adding the commitment days to today', () => {
      // 5 days on from 10 Mar 2026 is 15 Mar 2026.
      const result = resolveCommitment({
        route: soloRoute,
        commitmentDays: 5,
        now: new Date('2026-03-10T09:00:00+08:00'),
      });

      expect(result.mode).toBe('solo');
      expect(result.targetDate).toBe('2026-03-15');
    });

    it('shows the timeframe slider', () => {
      const result = resolveCommitment({
        route: soloRoute,
        commitmentDays: COMMITMENT_DAYS_DEFAULT,
        now: new Date('2026-03-10T09:00:00+08:00'),
      });

      expect(result.showTimeframeSlider).toBe(true);
      expect(result.targetTime).toBeNull();
    });

    it('crosses a month boundary', () => {
      const result = resolveCommitment({
        route: soloRoute,
        commitmentDays: 20,
        now: new Date('2026-03-20T09:00:00+08:00'),
      });

      expect(result.targetDate).toBe('2026-04-09');
    });

    it('clamps commitment days to the permitted range', () => {
      const tooFew = resolveCommitment({
        route: soloRoute,
        commitmentDays: 0,
        now: new Date('2026-03-10T09:00:00+08:00'),
      });
      const tooMany = resolveCommitment({
        route: soloRoute,
        commitmentDays: 99,
        now: new Date('2026-03-10T09:00:00+08:00'),
      });

      expect(tooFew.commitmentDays).toBe(COMMITMENT_DAYS_MIN);
      expect(tooMany.commitmentDays).toBe(COMMITMENT_DAYS_MAX);
    });
  });

  describe('scheduled group run', () => {
    it('derives the target date from the event and hides the slider', () => {
      const result = resolveCommitment({
        route: groupRunRoute('2026-03-14T07:30:00+08:00'),
        commitmentDays: 5,
        now: new Date('2026-03-10T09:00:00+08:00'),
      });

      expect(result.mode).toBe('group-run');
      expect(result.showTimeframeSlider).toBe(false);
      expect(result.targetDate).toBe('2026-03-14');
      expect(result.targetTime).toBe('07:30am');
    });

    it('formats evening hours as 12-hour pm time without spaces', () => {
      const result = resolveCommitment({
        route: groupRunRoute('2026-03-14T23:59:00+08:00'),
        commitmentDays: 5,
        now: new Date('2026-03-10T09:00:00+08:00'),
      });

      expect(result.targetTime).toBe('11:59pm');
    });

    it('derives commitment days as the gap to the event', () => {
      const result = resolveCommitment({
        route: groupRunRoute('2026-03-14T07:30:00+08:00'),
        commitmentDays: 5,
        now: new Date('2026-03-10T09:00:00+08:00'),
      });

      expect(result.commitmentDays).toBe(4);
    });

    it('still applies within 24 hours of the event having passed', () => {
      const result = resolveCommitment({
        route: groupRunRoute('2026-03-10T07:30:00+08:00'),
        commitmentDays: 5,
        now: new Date('2026-03-11T06:00:00+08:00'),
      });

      expect(result.mode).toBe('group-run');
    });

    it('falls back to solo adoption once the 24 hour window lapses', () => {
      const result = resolveCommitment({
        route: groupRunRoute('2026-03-10T07:30:00+08:00'),
        commitmentDays: 5,
        now: new Date('2026-03-11T09:00:00+08:00'),
      });

      expect(result.mode).toBe('solo');
      expect(result.showTimeframeSlider).toBe(true);
      expect(result.targetDate).toBe('2026-03-16');
    });

    it('falls back to solo adoption when the event date is missing or unparseable', () => {
      const result = resolveCommitment({
        route: groupRunRoute('not-a-date'),
        commitmentDays: 5,
        now: new Date('2026-03-10T09:00:00+08:00'),
      });

      expect(result.mode).toBe('solo');
    });
  });

  it('treats a missing route as solo adoption', () => {
    const result = resolveCommitment({
      route: null,
      commitmentDays: 5,
      now: new Date('2026-03-10T09:00:00+08:00'),
    });

    expect(result.mode).toBe('solo');
    expect(result.targetDate).toBe('2026-03-15');
  });
});

describe('formatTargetDate', () => {
  it('reads as a lowercase date for a solo adoption', () => {
    expect(formatTargetDate('2026-03-15', null)).toBe('sun 15 mar');
  });

  it('carries the start time for a group run, which is what marks it as one', () => {
    expect(formatTargetDate('2026-03-14', '07:30am')).toBe('sat 14 mar · 07:30am');
  });

  it('returns an em dash when there is no date yet', () => {
    expect(formatTargetDate(null, null)).toBe('—');
  });

  it('returns an em dash for an unparseable date', () => {
    expect(formatTargetDate('not-a-date', null)).toBe('—');
  });
});
