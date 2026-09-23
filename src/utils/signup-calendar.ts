/**
 * Calendar export for a committed adoption.
 *
 * Both formats are generated in the browser: an `.ics` file for the calendar
 * the Adopter actually uses, and a Google Calendar template link for the one
 * they use in a tab. Neither needs a server.
 */

export interface CalendarCommitment {
  companionName: string;
  routeTitle: string;
  charityName: string;
  /** `YYYY-MM-DD` in Hong Kong time. */
  targetDate: string;
  /** `HH:MM` for a scheduled Group Run; null for a solo adoption. */
  targetTime: string | null;
  meetupPoint: string | null;
  adopterId: string;
  /** Where the adoption can be looked up again. */
  url: string;
}

/** Group Runs get a two-hour block; a solo adoption is an all-day deadline. */
const GROUP_RUN_DURATION_HOURS = 2;

const HK_UTC_OFFSET_HOURS = 8;

function compactDate(date: string): string {
  return date.replace(/-/g, '');
}

/** A Hong Kong wall-clock moment as a UTC `YYYYMMDDTHHMMSSZ` stamp. */
function toUtcStamp(date: string, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const utc = new Date(
    Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(5, 7)) - 1,
      Number(date.slice(8, 10)),
      hours - HK_UTC_OFFSET_HOURS,
      minutes
    )
  );
  return `${utc.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
}

function addHoursToStamp(stamp: string, hours: number): string {
  const parsed = new Date(
    `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T${stamp.slice(
      9,
      11
    )}:${stamp.slice(11, 13)}:${stamp.slice(13, 15)}Z`
  );
  parsed.setUTCHours(parsed.getUTCHours() + hours);
  return `${parsed.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
}

function nextDay(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return compactDate(parsed.toISOString().slice(0, 10));
}

function summaryFor(commitment: CalendarCommitment): string {
  return `Run ${commitment.companionName} — ${commitment.routeTitle}`;
}

function descriptionFor(commitment: CalendarCommitment): string {
  return [
    `Your adoption of ${commitment.routeTitle}, supporting ${commitment.charityName}.`,
    `Adopter ID: ${commitment.adopterId}`,
    commitment.url,
  ].join('\\n');
}

/** Folds per RFC 5545 and escapes the characters iCalendar reserves. */
function escapeIcsText(value: string): string {
  return value.replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
}

interface EventWindow {
  isScheduled: boolean;
  start: string;
  end: string;
}

/**
 * A scheduled Group Run is a two-hour block at a known time; a solo adoption is
 * an all-day deadline, which is what a self-set target date actually is.
 */
function resolveEventWindow(commitment: CalendarCommitment): EventWindow {
  if (commitment.targetTime) {
    const start = toUtcStamp(commitment.targetDate, commitment.targetTime);
    return { isScheduled: true, start, end: addHoursToStamp(start, GROUP_RUN_DURATION_HOURS) };
  }

  return {
    isScheduled: false,
    start: compactDate(commitment.targetDate),
    end: nextDay(commitment.targetDate),
  };
}

export function buildIcs(commitment: CalendarCommitment): string {
  const { isScheduled, start, end } = resolveEventWindow(commitment);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//adopt a run//Adoption Portal//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${commitment.adopterId}@adoptarun.org`,
    `DTSTAMP:${toUtcStamp(commitment.targetDate, commitment.targetTime ?? '00:00')}`,
    isScheduled ? `DTSTART:${start}` : `DTSTART;VALUE=DATE:${start}`,
    isScheduled ? `DTEND:${end}` : `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeIcsText(summaryFor(commitment))}`,
    `DESCRIPTION:${escapeIcsText(descriptionFor(commitment))}`,
    commitment.meetupPoint ? `LOCATION:${escapeIcsText(commitment.meetupPoint)}` : null,
    `URL:${commitment.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter((line): line is string => line !== null);

  return `${lines.join('\r\n')}\r\n`;
}

export function buildGoogleCalendarUrl(commitment: CalendarCommitment): string {
  const { start, end } = resolveEventWindow(commitment);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summaryFor(commitment),
    dates: `${start}/${end}`,
    details: descriptionFor(commitment).replace(/\\n/g, '\n'),
    ctz: 'Asia/Hong_Kong',
  });

  if (commitment.meetupPoint) params.set('location', commitment.meetupPoint);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
