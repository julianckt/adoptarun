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

  // Brand palette as literals (see the waiver above); mirrors DESIGN.md.
  const INK = '#181311';
  const PAPER = '#fffbf9';
  const ORANGE = '#f5ae66';
  const MUTED = '#6b5f58';
  const HAIRLINE = '#e9dfd8';
  const BACKDROP = '#efe6df';
  const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif";
  const stripes = ['#f5ae66', '#5bbe49', '#ff8484', '#42bee0'];

  // Hairline-divided rows: quiet label over a confident value. Colour is saved
  // for the hero, the ID panel and the button so it means something.
  const detailRows = details
    .map(
      ([label, value], i) => `
            <tr>
              <td style="padding:16px 0;${i === 0 ? '' : `border-top:1px solid ${HAIRLINE};`}font-family:${FONT};">
                <div style="font-size:11px;line-height:14px;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">${escapeHtml(label)}</div>
                <div style="padding-top:4px;font-size:18px;line-height:24px;font-weight:600;color:${INK};">${escapeHtml(value)}</div>
              </td>
            </tr>`
    )
    .join('');
  const stripeCells = stripes
    .map((c) => `<td width="25%" height="6" bgcolor="${c}" style="font-size:0;line-height:0;">&nbsp;</td>`)
    .join('');

  // Images need absolute URLs; derive the origin so previews and prod both work.
  const origin = new URL(context.confirmationUrl).origin;
  const heroUrl = `${origin}/email/hero.jpg`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(slot(copy, 'subject'))}</title>
</head>
<body style="margin:0;padding:0;background:${BACKDROP};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(slot(copy, 'preheader'))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BACKDROP}">
  <tr>
    <td align="center" style="padding:32px 16px 40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;" bgcolor="${PAPER}">
        <tr>
          <td bgcolor="${ORANGE}" style="padding:0;font-size:0;line-height:0;">
            <img src="${escapeHtml(heroUrl)}" width="600" alt="adopt a run" style="display:block;border:0;width:100%;max-width:600px;height:auto;font-family:${FONT};font-size:32px;line-height:36px;font-weight:700;color:${INK};">
          </td>
        </tr>
        <tr>
          <td style="padding:48px 40px 0 40px;font-family:${FONT};">
            <h1 style="margin:0 0 20px 0;font-size:44px;line-height:46px;font-weight:700;letter-spacing:-0.03em;color:${INK};">you adopted a run.</h1>
            <p style="margin:0;font-size:17px;line-height:26px;color:${MUTED};"><strong style="color:${INK};">${escapeHtml(slot(copy, 'greeting'))}.</strong> ${escapeHtml(slot(copy, 'intro'))}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 0 40px;font-family:${FONT};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${INK}">
              <tr>
                <td align="center" style="padding:32px 16px;font-family:${FONT};">
                  <div style="font-size:11px;line-height:14px;letter-spacing:0.18em;text-transform:uppercase;color:${ORANGE};">${escapeHtml(slot(copy, 'adopterIdLabel'))}</div>
                  <div style="padding-top:12px;font-size:40px;line-height:44px;font-weight:700;letter-spacing:0.06em;color:${PAPER};">${escapeHtml(context.adopterId)}</div>
                </td>
              </tr>
            </table>
            <p style="margin:14px 0 0 0;font-size:14px;line-height:21px;color:${MUTED};">${escapeHtml(slot(copy, 'adopterIdNote'))}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 0 40px;font-family:${FONT};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${INK};border-bottom:1px solid ${HAIRLINE};">${detailRows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 0 40px;font-family:${FONT};">
            <p style="margin:0 0 16px 0;font-size:15px;line-height:22px;color:${MUTED};">${escapeHtml(slot(copy, 'ctaIntro'))}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" bgcolor="${INK}">
                  <a href="${escapeHtml(context.confirmationUrl)}" style="display:block;padding:20px 24px;font-family:${FONT};font-size:16px;line-height:20px;font-weight:700;letter-spacing:0.02em;color:${PAPER};text-decoration:none;">${escapeHtml(slot(copy, 'ctaLabel'))} &rarr;</a>
                </td>
              </tr>
            </table>
            <p style="margin:14px 0 0 0;font-size:12px;line-height:18px;color:${MUTED};word-break:break-all;">${escapeHtml(context.confirmationUrl)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:44px 40px 48px 40px;font-family:${FONT};">
            <p style="margin:0 0 20px 0;font-size:17px;line-height:26px;color:${INK};">${escapeHtml(slot(copy, 'closing'))}</p>
            <p style="margin:0;font-size:15px;line-height:20px;font-weight:700;color:${INK};">${escapeHtml(slot(copy, 'signoff'))}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0;font-size:0;line-height:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${stripeCells}</tr></table>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
        <tr>
          <td align="center" style="padding:28px 24px 0 24px;font-family:${FONT};">
            <p style="margin:0 0 8px 0;font-size:13px;line-height:18px;font-weight:600;color:${INK};">${escapeHtml(context.charityName)} &middot; <a href="${escapeHtml(origin)}" style="color:${INK};text-decoration:underline;">${escapeHtml(new URL(origin).host)}</a></p>
            <p style="margin:0;font-size:12px;line-height:18px;color:${MUTED};">${escapeHtml(slot(copy, 'footerNote'))}</p>
          </td>
        </tr>
      </table>
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
