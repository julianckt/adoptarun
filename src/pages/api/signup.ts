/**
 * POST /api/signup — the moment an adoption becomes real.
 *
 * Validates shape only. Route and charity slugs are stored as sent rather than
 * checked against Sanity: the confirmation page renders defensively when one
 * does not resolve, and keeping Sanity out of this path keeps the request to a
 * single D1 round trip plus one email.
 *
 * The email is dispatched synchronously but never blocks the adoption. If
 * Resend errors, rate-limits, or times out, the Adopter still receives their
 * ID on screen and `confirmation_email_sent_at` stays NULL — a NULL there is
 * the record of a delivery that needs chasing, not a failed adoption.
 */
import type { APIContext } from 'astro';
import type { D1Database } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';
import { AdoptionsRepository } from '@/db/repositories/adoptions';
import { validateRunnerDetails, validateCompanionName } from '@/utils/signup-validation';
import { TARGET_HKD_MIN, TARGET_HKD_MAX } from '@/utils/signup-impact';
import { buildAdoptionConfirmationEmail } from '@/email/adoption-confirmation';
import { getCachedEmailCopy, getCachedRouteBySlug, getCachedCharityBySlug } from '@/sanity/queries';
import { hkMeetupTime } from '@/utils/signup-confirmation';

export const prerender = false;

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const MAIL_FROM = 'adopt a run <letsrun@adoptarun.org>';

/**
 * Sane outer bounds for a derived commitment timeframe.
 *
 * Deliberately NOT the Commitment Timeframe slider's 1–20. That range governs a
 * solo adoption, where the Runner picks. A Group Run derives its timeframe from
 * the event date instead, which legitimately lands outside those bounds: 0 for a
 * run already under way inside its 24h grace window, or well beyond 20 for one
 * scheduled months ahead. This endpoint validates shape only and never looks the
 * route up in Sanity, so it cannot tell a derived value from a chosen one —
 * applying the slider's range here would reject real adoptions. The slider's
 * bounds are enforced where the slider lives.
 */
const COMMITMENT_DAYS_FLOOR = 0;
const COMMITMENT_DAYS_CEILING = 365;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface SignupBody {
  firstName: string;
  lastName: string;
  email: string;
  routeSlug: string;
  charitySlug: string;
  commitmentDays: number;
  targetDate: string;
  targetHkd: number;
  companionName: string;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Whole number within an inclusive range. */
function inRange(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

/**
 * Shape validation for the submitted adoption.
 *
 * Name, email, and companion rules are delegated to the same pure validators
 * the portal uses, so the server can never disagree with what the Runner was
 * told in the form.
 */
function validateBody(body: SignupBody): Record<string, string> {
  const { errors } = validateRunnerDetails({
    firstName: body?.firstName ?? '',
    lastName: body?.lastName ?? '',
    email: body?.email ?? '',
  });
  const collected: Record<string, string> = { ...errors };

  const companion = validateCompanionName(body?.companionName ?? '');
  if (companion) collected.companionName = companion;

  if (typeof body?.routeSlug !== 'string' || !body.routeSlug.trim()) {
    collected.routeSlug = 'Select an artwork to adopt.';
  }
  if (typeof body?.charitySlug !== 'string' || !body.charitySlug.trim()) {
    collected.charitySlug = 'Select a charity cause.';
  }
  if (!inRange(body?.commitmentDays, COMMITMENT_DAYS_FLOOR, COMMITMENT_DAYS_CEILING)) {
    collected.commitmentDays = 'That commitment timeframe is not a valid number of days.';
  }
  if (!inRange(body?.targetHkd, TARGET_HKD_MIN, TARGET_HKD_MAX)) {
    collected.targetHkd = `Choose an impact target between HK$${TARGET_HKD_MIN} and HK$${TARGET_HKD_MAX}.`;
  }
  if (typeof body?.targetDate !== 'string' || !ISO_DATE.test(body.targetDate)) {
    collected.targetDate = 'Target date must be an ISO-8601 date.';
  }

  return collected;
}

export async function POST(context: APIContext): Promise<Response> {
  // Astro 7 removed `Astro.locals.runtime.env`; bindings come from the
  // `cloudflare:workers` module. Read inside the handler rather than at module
  // scope, because the binding is only populated within a request context.
  const db = env.DB as D1Database | undefined;

  if (!db) {
    console.error('[signup] D1 binding "DB" is missing — adoption not recorded.');
    return json({ error: 'Adoption service unavailable.' }, 503);
  }

  let body: SignupBody;
  try {
    body = (await context.request.json()) as SignupBody;
  } catch {
    return json({ error: 'Malformed request body.' }, 400);
  }

  const errors = validateBody(body);
  if (Object.keys(errors).length > 0) {
    return json({ errors }, 400);
  }

  const adoption = await AdoptionsRepository.create(db, {
    runnerFirstName: body.firstName,
    runnerLastName: body.lastName,
    email: body.email,
    routeSlug: body.routeSlug,
    charitySlug: body.charitySlug,
    commitmentDays: body.commitmentDays,
    targetDate: body.targetDate,
    targetHkd: body.targetHkd,
    animalName: body.companionName,
  });

  const origin = context.site?.origin ?? new URL(context.request.url).origin;
  const confirmationUrl = `${origin}/signup/confirmed/${adoption.adopter_id}`;

  await sendConfirmation(db, adoption, confirmationUrl, env.RESEND_API_KEY as string | undefined);

  return json({ adopterId: adoption.adopter_id, confirmationUrl }, 200);
}

/**
 * What the email needs to say about the adopted Artwork and its Charity Cause,
 * from the build-time Sanity snapshot.
 *
 * Slugs are stored unvalidated, so one that resolves to nothing is a real
 * possibility. Falling back to the slug keeps the email readable rather than
 * blank — a Runner seeing `dragon-back` still knows which Artwork they adopted.
 */
function emailContextFor(routeSlug: string, charitySlug: string) {
  const route = getCachedRouteBySlug(routeSlug);
  const charity = getCachedCharityBySlug(charitySlug);

  return {
    routeName: route?.title ?? routeSlug,
    charityName: charity?.name ?? charitySlug,
    // A Group Run's meetup hour is the detail that actually gets a Runner to
    // the start, so it belongs in the email and not only on the page.
    targetTime: hkMeetupTime(route?.isGroupRun, route?.groupRunDateTime),
  };
}

/**
 * Dispatches the confirmation and records the attempt.
 *
 * Every failure path is swallowed on purpose. The adoption is already durable
 * in D1 by the time this runs; an email problem must never turn a completed
 * commitment into an error the Runner sees. A NULL
 * `confirmation_email_sent_at` is the durable signal that delivery did not
 * happen.
 */
async function sendConfirmation(
  db: D1Database,
  adoption: { adopter_id: string; email: string; animal_name: string; route_slug: string; charity_slug: string; target_date: string; target_hkd: number | null },
  confirmationUrl: string,
  apiKey: string | undefined
): Promise<void> {
  if (!apiKey) {
    console.warn('[signup] RESEND_API_KEY not configured — confirmation email skipped.');
    return;
  }

  try {
    const { routeName, charityName, targetTime } = emailContextFor(
      adoption.route_slug,
      adoption.charity_slug
    );
    const email = buildAdoptionConfirmationEmail(
      {
        adopterId: adoption.adopter_id,
        companionName: adoption.animal_name,
        routeName,
        charityName,
        targetDate: adoption.target_date,
        targetTime,
        targetHkd: adoption.target_hkd,
        confirmationUrl,
      },
      getCachedEmailCopy()
    );

    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [adoption.email],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });

    if (!response.ok) {
      console.error(
        `[signup] Resend rejected the confirmation for ${adoption.adopter_id}: ${response.status}`
      );
      return;
    }

    await AdoptionsRepository.markEmailSent(db, adoption.adopter_id);
  } catch (err) {
    console.error(
      `[signup] Confirmation email failed for ${adoption.adopter_id}:`,
      err instanceof Error ? err.message : err
    );
  }
}
