/**
 * The confirmation page's view of an adoption.
 *
 * Everything the page renders server-side passes through here, and this is the
 * boundary that keeps the Runner's identity off it. The page is addressed by
 * Adopter ID — sequential from a known seed, with initials that are a typo
 * guard rather than a secret — so its URL is guessable. A guessed URL must
 * reveal that an adoption exists, never who made it.
 *
 * Concretely: `runner_first_name`, `runner_last_name`, and `email` are present
 * on the D1 row and deliberately dropped here. The Runner's own name and email
 * reach their confirmation page through the sessionStorage receipt instead,
 * which only exists in the browser that just committed. Do not add them to this
 * record to make a return visit friendlier — that trade was considered and
 * declined.
 */
import type { AdoptionRecord } from '@/db/types';
import type { PortalRoute } from '@/components/signup/types';
import { isValidAdopterId } from '@/db/adopter-id';

const HK_TIME_ZONE = 'Asia/Hong_Kong';

/**
 * The canonical form of an Adopter ID from a URL, or null if it is not one.
 *
 * Adoptions are looked up case-insensitively in the repository, so the page
 * must not be stricter than the store behind it: a Runner retyping their ID
 * from the confirmation email in lower case should reach their adoption, not a
 * redirect. Whitespace is tolerated for the same reason — IDs get copied and
 * pasted with it.
 *
 * Returning null for everything else lets the page refuse without touching D1,
 * so walking the URL space costs an attacker database reads they never get.
 */
export function canonicalAdopterId(raw: string | undefined): string | null {
  const canonical = (raw ?? '').trim().toUpperCase();
  return isValidAdopterId(canonical) ? canonical : null;
}

export interface ConfirmationRecord {
  adopterId: string;
  companionName: string;
  routeSlug: string;
  charitySlug: string;
  commitmentDays: number;
  targetDate: string;
  /** Group Run meetup as `HH:MM`; null for a solo adoption. */
  targetTime: string | null;
  targetHkd: number | null;
}

/**
 * The meetup time, as it reads on a Hong Kong clock.
 *
 * Lives on the Sanity route rather than the adoption: a Group Run's time is a
 * property of the event, so if the organisers move it, every Adopter's page
 * follows rather than showing the time that was true when they committed.
 */
export function hkMeetupTime(
  isGroupRun: boolean | null | undefined,
  groupRunDateTime: string | null | undefined
): string | null {
  if (!isGroupRun || !groupRunDateTime) return null;

  const parsed = new Date(groupRunDateTime);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleTimeString('en-GB', {
    timeZone: HK_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Maps a D1 adoption onto the page's record.
 *
 * `route` may be null: slugs are stored as submitted and never checked against
 * Sanity, so an artwork can be renamed or unpublished after someone adopts it.
 * That must degrade to a page without meetup details, not a crash.
 */
export function toConfirmationRecord(
  adoption: AdoptionRecord,
  route: PortalRoute | null
): ConfirmationRecord {
  return {
    adopterId: adoption.adopter_id,
    companionName: adoption.animal_name,
    routeSlug: adoption.route_slug,
    charitySlug: adoption.charity_slug,
    commitmentDays: adoption.commitment_days,
    targetDate: adoption.target_date,
    targetTime: hkMeetupTime(route?.isGroupRun, route?.groupRunDateTime),
    targetHkd: adoption.target_hkd,
  };
}
