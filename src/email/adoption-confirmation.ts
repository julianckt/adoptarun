// impeccable-disable * -- Email HTML is not browser UI and cannot use the
// design system. Gmail strips <style> blocks, and Outlook renders through
// Word's engine, which ignores CSS custom properties entirely — so
// `var(--color-ink)` resolves to nothing and the email renders unstyled. Every
// value here must be a literal, inline, on the element. The design tokens in
// `src/styles/tokens.css` remain the single source of truth for the site; this
// file is a deliberate, bounded exception for a different rendering medium.
//
// The waiver covers HOW values are expressed, not WHICH values are chosen. The
// brand rules still bind: DESIGN.md's Zero-Radius Architecture means no
// border-radius here either, and the literals below must stay visually in step
// with `tokens.css` by hand whenever those tokens change.

/**
 * The adoption confirmation email.
 *
 * This is the only artifact a Runner keeps from the adoption, and the only
 * thing carrying their Adopter ID — there is no account to log back into. So
 * the structure and every dynamic value are fixed here in code; Sanity supplies
 * wording only (see `emailCopyType`). No amount of editing in the Studio can
 * remove the ID, the link, or break the layout.
 *
 * Pure: no D1, no network, no clock. Everything it needs arrives in the
 * context, which is what makes it testable without a Worker.
 *
 * Table-based HTML with inline styles is not nostalgia — Outlook still renders
 * through Word's engine, which ignores floats, flexbox, grid, and most of
 * `<style>`. A plain-text part ships alongside because a missing one measurably
 * hurts deliverability.
 */
import type { SanityEmailCopy } from '@/sanity/types';

export interface AdoptionEmailContext {
  adopterId: string;
  companionName: string;
  /** Display name for the Artwork; the caller falls back to the slug. */
  routeName: string;
  charityName: string;
  /** `YYYY-MM-DD` in Hong Kong time. */
  targetDate: string;
  /** Group Run meetup as `HH:MM`; null for a solo adoption, which has no time. */
  targetTime: string | null;
  targetHkd: number | null;
  confirmationUrl: string;
}

export interface AdoptionEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Wording used when Sanity has never been published, or when a field is blank.
 *
 * These are real defaults rather than placeholders: a build whose Sanity fetch
 * failed still sends a complete, sensible email instead of one with holes.
 */
const DEFAULT_COPY = {
  subject: 'your adoption is confirmed — welcome to the movement',
  preheader: 'your adopter id and everything you need for your run.',
  greeting: 'hello, caretaker',
  intro:
    'your adoption is confirmed. you have taken on an artwork and a cause, and both are now in your care.',
  adopterIdLabel: 'your adopter id',
  adopterIdNote:
    'keep this. you will need it to log your run and claim your digital certificate.',
  ctaIntro: 'everything about your adoption lives here:',
  ctaLabel: 'view my adoption',
  closing:
    'run it, walk it, or jog it — at your own pace, in your own time. we are glad you are here.',
  signoff: 'the adopt a run team',
  footerNote:
    'you received this because you adopted a run at adoptarun.org. no account was created and no password is needed.',
} as const;

type CopySlot = keyof typeof DEFAULT_COPY;

/** A published-but-blank field falls back exactly like a missing one. */
function slot(copy: SanityEmailCopy | null, key: CopySlot): string {
  const value = copy?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : DEFAULT_COPY[key];
}

/** Email HTML is assembled by string concatenation, so nothing may go in raw. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** `2026-09-27` → `Sunday, 27 September 2026`, as it reads in Hong Kong. */
function formatTargetDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00+08:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Hong_Kong',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatHkd(amount: number | null): string | null {
  if (amount === null || !Number.isFinite(amount)) return null;
  return `HK$${Math.round(amount).toLocaleString('en-US')}`;
}

export function buildAdoptionConfirmationEmail(
  context: AdoptionEmailContext,
  copy: SanityEmailCopy | null
): AdoptionEmail {
  const targetDate = formatTargetDate(context.targetDate);
  const targetHkd = formatHkd(context.targetHkd);

  const details: Array<[string, string]> = [
    ['companion', context.companionName],
    ['artwork', context.routeName],
    ['charity cause', context.charityName],
    ['target date', targetDate],
  ];
  // A Group Run has a place and an hour to turn up at; a solo adoption only has
  // a deadline. Adding an empty time row to a solo adoption would invent one.
  if (context.targetTime) details.push(['meetup time', context.targetTime]);
  if (targetHkd) details.push(['fundraising goal', targetHkd]);

  const detailRows = details
    .map(
      ([label, value]) => `
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#6b6b6b;width:40%;">${escapeHtml(label)}</td>
              <td style="padding:6px 0;font-size:15px;color:#141414;font-weight:600;">${escapeHtml(value)}</td>
            </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(slot(copy, 'subject'))}</title>
</head>
<body style="margin:0;padding:0;background:#f4f2ee;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(slot(copy, 'preheader'))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f2ee;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;">
        <tr>
          <td style="padding:32px 32px 8px 32px;font-family:Helvetica,Arial,sans-serif;">
            <p style="margin:0 0 16px 0;font-size:16px;color:#141414;">${escapeHtml(slot(copy, 'greeting'))}</p>
            <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#3d3d3d;">${escapeHtml(slot(copy, 'intro'))}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;font-family:Helvetica,Arial,sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f2ee;">
              <tr>
                <td align="center" style="padding:24px 16px;">
                  <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b6b6b;">${escapeHtml(slot(copy, 'adopterIdLabel'))}</p>
                  <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:0.04em;color:#141414;">${escapeHtml(context.adopterId)}</p>
                </td>
              </tr>
            </table>
            <p style="margin:12px 0 24px 0;font-size:13px;line-height:1.6;color:#6b6b6b;">${escapeHtml(slot(copy, 'adopterIdNote'))}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;font-family:Helvetica,Arial,sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${detailRows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;font-family:Helvetica,Arial,sans-serif;">
            <p style="margin:0 0 16px 0;font-size:15px;color:#3d3d3d;">${escapeHtml(slot(copy, 'ctaIntro'))}</p>
            <a href="${escapeHtml(context.confirmationUrl)}" style="display:inline-block;padding:14px 28px;background:#141414;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${escapeHtml(slot(copy, 'ctaLabel'))}</a>
            <p style="margin:16px 0 0 0;font-size:12px;color:#6b6b6b;word-break:break-all;">${escapeHtml(context.confirmationUrl)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px 32px;font-family:Helvetica,Arial,sans-serif;">
            <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#3d3d3d;">${escapeHtml(slot(copy, 'closing'))}</p>
            <p style="margin:0;font-size:15px;color:#141414;">${escapeHtml(slot(copy, 'signoff'))}</p>
          </td>
        </tr>
      </table>
      <p style="max-width:560px;margin:16px auto 0 auto;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#8a8a8a;text-align:center;">${escapeHtml(slot(copy, 'footerNote'))}</p>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    slot(copy, 'greeting'),
    '',
    slot(copy, 'intro'),
    '',
    `${slot(copy, 'adopterIdLabel').toUpperCase()}: ${context.adopterId}`,
    slot(copy, 'adopterIdNote'),
    '',
    ...details.map(([label, value]) => `${label}: ${value}`),
    '',
    slot(copy, 'ctaIntro'),
    context.confirmationUrl,
    '',
    slot(copy, 'closing'),
    '',
    slot(copy, 'signoff'),
    '',
    '—',
    slot(copy, 'footerNote'),
  ].join('\n');

  return { subject: slot(copy, 'subject'), html, text };
}
