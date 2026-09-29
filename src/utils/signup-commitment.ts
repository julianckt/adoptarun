/**
 * Commitment timeframe resolution for the Adoption Portal.
 *
 * An Adopter either sets their own timeframe (solo adoption) or inherits it
 * from a scheduled Group Run. Master spec §5: while `now <= groupRunDateTime +
 * 24h` the Group Run owns the target date and the timeframe slider is hidden;
 * once that window lapses the Artwork reverts to solo adoption and the slider
 * returns.
 */
export const COMMITMENT_DAYS_MIN = 1;
export const COMMITMENT_DAYS_MAX = 20;
export const COMMITMENT_DAYS_DEFAULT = 5;

/** How long a Group Run keeps ownership of the target date after it starts. */
const GROUP_RUN_GRACE_MS = 24 * 60 * 60 * 1000;

const HK_TIME_ZONE = 'Asia/Hong_Kong';

export type CommitmentMode = 'solo' | 'group-run';

/** Anything that can describe a scheduled Group Run. */
export interface GroupRunCandidate {
  isGroupRun?: boolean | null;
  groupRunDateTime?: string | null;
}

export interface CommitmentInput {
  route: GroupRunCandidate | null | undefined;
  commitmentDays: number;
  now: Date;
}

export interface Commitment {
  mode: CommitmentMode;
  /** Days between today and the target date, in Hong Kong calendar days. */
  commitmentDays: number;
  /** Target date as `YYYY-MM-DD` in Hong Kong time. */
  targetDate: string;
  /** Group Run start time as `HH:MM`; null for solo adoption. */
  targetTime: string | null;
  showTimeframeSlider: boolean;
}

/** `YYYY-MM-DD` for a moment, as it reads on a Hong Kong calendar. */
function toHkDate(moment: Date): string {
  return moment.toLocaleDateString('en-CA', { timeZone: HK_TIME_ZONE });
}

/** `hh:mma/pm` for a moment, as it reads on a Hong Kong clock. */
function toHkTime(moment: Date): string {
  return moment
    .toLocaleTimeString('en-GB', {
      timeZone: HK_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase()
    .replace(/\s+/g, '');
}

/** Whole days between two Hong Kong calendar dates, ignoring clock time. */
function hkCalendarDaysBetween(from: Date, to: Date): number {
  const start = Date.parse(`${toHkDate(from)}T00:00:00Z`);
  const end = Date.parse(`${toHkDate(to)}T00:00:00Z`);
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

function addHkDays(from: Date, days: number): string {
  const start = Date.parse(`${toHkDate(from)}T00:00:00Z`);
  return new Date(start + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function clampCommitmentDays(days: number): number {
  if (!Number.isFinite(days)) return COMMITMENT_DAYS_DEFAULT;
  return Math.min(COMMITMENT_DAYS_MAX, Math.max(COMMITMENT_DAYS_MIN, Math.round(days)));
}

/**
 * Resolves the Group Run start, or null when this Artwork is adopted solo —
 * either because it was never a Group Run, its date is unusable, or the 24h
 * window has lapsed.
 */
function resolveGroupRunStart(route: CommitmentInput['route'], now: Date): Date | null {
  if (!route?.isGroupRun || !route.groupRunDateTime) return null;

  const startsAt = new Date(route.groupRunDateTime);
  if (Number.isNaN(startsAt.getTime())) return null;

  const lapsed = now.getTime() > startsAt.getTime() + GROUP_RUN_GRACE_MS;
  return lapsed ? null : startsAt;
}

export function resolveCommitment({ route, commitmentDays, now }: CommitmentInput): Commitment {
  const groupRunStart = resolveGroupRunStart(route, now);

  if (groupRunStart) {
    return {
      mode: 'group-run',
      commitmentDays: Math.max(0, hkCalendarDaysBetween(now, groupRunStart)),
      targetDate: toHkDate(groupRunStart),
      targetTime: toHkTime(groupRunStart),
      showTimeframeSlider: false,
    };
  }

  const days = clampCommitmentDays(commitmentDays);
  return {
    mode: 'solo',
    commitmentDays: days,
    targetDate: addHkDays(now, days),
    targetTime: null,
    showTimeframeSlider: true,
  };
}

/**
 * The target date as the portal states it: lowercase, abbreviated, with the
 * Group Run start time appended. The time is the only marker a Group Run
 * needs — a date carrying a clock is self-evidently a scheduled meetup.
 */
export function formatTargetDate(
  targetDate: string | null | undefined,
  targetTime: string | null | undefined
): string {
  if (!targetDate) return '—';

  const parsed = new Date(`${targetDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return '—';

  const date = parsed
    .toLocaleDateString('en-GB', {
      timeZone: 'UTC',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    .replace(',', '')
    .toLowerCase();

  return targetTime ? `${date} · ${targetTime}` : date;
}
