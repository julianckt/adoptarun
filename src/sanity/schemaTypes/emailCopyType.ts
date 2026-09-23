import { defineType, defineField } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons/Envelope';

/**
 * Adoption confirmation email copy.
 *
 * Wording only. The layout, styling, and every dynamic value — Adopter ID,
 * companion name, route, charity, target date, target HK$, confirmation link —
 * live in `src/email/adoption-confirmation.ts` and cannot be edited here. That
 * split is deliberate: the one email a Runner keeps is the only thing carrying
 * their Adopter ID, so no amount of editing should be able to remove it.
 *
 * Read at BUILD time via `scripts/cache-sanity.mjs` into `sanity-cache.json`,
 * never fetched at request time. Changes therefore go live on deploy, not on
 * publish.
 */
export const emailCopyType = defineType({
  name: 'emailCopy',
  title: 'Email Copy',
  type: 'document',
  icon: EnvelopeIcon,
  groups: [
    { name: 'subject', title: 'Subject & Preview', default: true },
    { name: 'body', title: 'Body Copy' },
    { name: 'closing', title: 'Closing & Footer' },
  ],
  fields: [
    // --- Group: Subject & Preview ---
    defineField({
      name: 'subject',
      title: 'Subject Line',
      type: 'string',
      group: 'subject',
      description:
        'Shown in the inbox list. Keep it under 60 characters so it is not truncated on mobile mail clients.',
      initialValue: 'your adoption is confirmed — welcome to the movement',
      validation: (rule) =>
        rule
          .required()
          .max(90)
          .warning('Subject lines longer than 60 characters are often truncated in mobile inboxes'),
    }),
    defineField({
      name: 'preheader',
      title: 'Preview Text',
      type: 'string',
      group: 'subject',
      description:
        'The grey preview line the inbox shows after the subject. Invisible inside the email itself.',
      initialValue: 'your adopter id and everything you need for your run.',
      validation: (rule) => rule.required().max(140),
    }),

    // --- Group: Body Copy ---
    defineField({
      name: 'greeting',
      title: 'Greeting',
      type: 'string',
      group: 'body',
      description:
        'Opening line. The Runner’s name is deliberately not used here — this email is sent to an address we have not yet verified.',
      initialValue: 'hello, caretaker',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'intro',
      title: 'Opening Paragraph',
      type: 'text',
      rows: 3,
      group: 'body',
      description:
        'Sits above the Adopter ID. The companion name, route, and charity appear below this in a fixed panel.',
      initialValue:
        'your adoption is confirmed. you have taken on an artwork and a cause, and both are now in your care.',
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: 'adopterIdLabel',
      title: 'Adopter ID Label',
      type: 'string',
      group: 'body',
      description: 'The small caption printed directly above the Adopter ID.',
      initialValue: 'your adopter id',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'adopterIdNote',
      title: 'Adopter ID Note',
      type: 'text',
      rows: 2,
      group: 'body',
      description:
        'Explains why the ID matters. Shown directly beneath the ID itself.',
      initialValue:
        'keep this. you will need it to log your run and claim your digital certificate.',
      validation: (rule) => rule.required().max(300),
    }),

    // --- Group: Closing & Footer ---
    defineField({
      name: 'ctaIntro',
      title: 'Line Above Button',
      type: 'string',
      group: 'closing',
      description: 'Short line introducing the link back to the confirmation page.',
      initialValue: 'everything about your adoption lives here:',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button Label',
      type: 'string',
      group: 'closing',
      description: 'Text on the button. Short — long labels wrap badly in Outlook.',
      initialValue: 'view my adoption',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'closing',
      title: 'Closing Paragraph',
      type: 'text',
      rows: 3,
      group: 'closing',
      initialValue:
        'run it, walk it, or jog it — at your own pace, in your own time. we are glad you are here.',
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: 'signoff',
      title: 'Sign-off',
      type: 'string',
      group: 'closing',
      initialValue: 'the adopt a run team',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'footerNote',
      title: 'Footer Note',
      type: 'text',
      rows: 2,
      group: 'closing',
      description:
        'Small print at the bottom. A line explaining why the Runner received this email helps deliverability.',
      initialValue:
        'you received this because you adopted a run at adoptarun.org. no account was created and no password is needed.',
      validation: (rule) => rule.required().max(300),
    }),
  ],
  preview: {
    select: { title: 'subject' },
    prepare: ({ title }) => ({
      title: 'Email Copy',
      subtitle: title ?? 'Adoption confirmation email',
    }),
  },
});
