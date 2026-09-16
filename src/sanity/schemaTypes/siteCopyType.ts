import { defineType, defineField, defineArrayMember } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';

export const siteCopyType = defineType({
  name: 'siteCopy',
  title: 'Site Copy & Global Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'announcement', title: 'Announcement Ticker', default: true },
    { name: 'hero', title: 'Hero' },
    { name: 'counters', title: 'Movement Counters' },
    { name: 'journey', title: 'Journey Steps' },
    { name: 'faqs', title: 'FAQs' },
    { name: 'about', title: 'About & Slogans' },
  ],
  fields: [
    // --- Group: Announcement Ticker ---
    defineField({
      name: 'announcementEnabled',
      title: 'Announcement Banner Enabled',
      type: 'boolean',
      group: 'announcement',
      description: 'Toggle the announcement banner on or off in the site header.',
      initialValue: true,
    }),
    defineField({
      name: 'announcementTickerText',
      title: 'Announcement Banner Text',
      type: 'string',
      group: 'announcement',
      description: 'Text displayed in the announcement banner (max 120 characters). Required when banner is enabled.',
      validation: (rule) => [
        rule.custom((value, context) => {
          const parent = (context.parent ?? context.document) as { announcementEnabled?: boolean } | undefined;
          if (parent?.announcementEnabled && (!value || !value.trim())) {
            return 'Announcement banner text is required when the announcement banner is enabled';
          }
          return true;
        }),
        rule.max(120).warning('Keep ticker text concise for mobile screens'),
      ],
    }),
    defineField({
      name: 'announcementTickerLink',
      title: 'Announcement Banner Link (Optional)',
      type: 'string',
      group: 'announcement',
      description: 'Optional internal route or URL (e.g. /signup). Leave empty to display banner text without linking anywhere.',
    }),

    // --- Group: Hero ---
    defineField({
      name: 'heroTitle',
      title: 'Hero Headline',
      type: 'string',
      group: 'hero',
      initialValue: 'the new way to push yourself in training and in giving back',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle / Description',
      type: 'text',
      rows: 3,
      group: 'hero',
      initialValue:
        'by bringing people together through long-distance running and community art, our project aims to help champion a kinder city.',
    }),
    defineField({
      name: 'heroCtaText',
      title: 'Primary CTA Text',
      type: 'string',
      group: 'hero',
      initialValue: 'run with us',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroCtaLink',
      title: 'Primary CTA Link',
      type: 'string',
      group: 'hero',
      initialValue: '/signup',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSecondaryCtaText',
      title: 'Secondary CTA Text',
      type: 'string',
      group: 'hero',
      initialValue: 'log a run',
    }),
    defineField({
      name: 'heroSecondaryCtaLink',
      title: 'Secondary CTA Link',
      type: 'string',
      group: 'hero',
      initialValue: '/log',
    }),

    // --- Group: Movement Counters ---
    defineField({
      name: 'totalKmCovered',
      title: 'Total Kilometers Covered',
      type: 'number',
      group: 'counters',
      description: 'Total distance completed across community runs.',
      initialValue: 187,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'totalRunsCompleted',
      title: 'Total Runs Completed',
      type: 'number',
      group: 'counters',
      description: 'Total verified route completions.',
      initialValue: 21,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'totalParticipantsCount',
      title: 'Total Participants Count',
      type: 'number',
      group: 'counters',
      description: 'Total active runners and caretakers.',
      initialValue: 33,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'countersSubtitle',
      title: 'Counters Suffix / Subtitle',
      type: 'string',
      group: 'counters',
      initialValue: 'km covered across 21 runs by 33 participants and counting',
    }),

    // --- Group: Journey Steps ---
    defineField({
      name: 'journeyHeadline',
      title: 'Journey Section Headline',
      type: 'string',
      group: 'journey',
      initialValue: 'the 3-step caretaker journey',
    }),
    defineField({
      name: 'journeySteps',
      title: 'Journey Steps',
      type: 'array',
      group: 'journey',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'journeyStep',
          title: 'Journey Step',
          fields: [
            defineField({
              name: 'stepNumber',
              title: 'Step Number / Ordinal',
              type: 'string',
              description: 'e.g., "one.", "two.", "three."',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Step Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Step Description',
              type: 'text',
              rows: 2,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'stepNumber',
            },
          },
        }),
      ],
      initialValue: [
        {
          _key: 'step1',
          stepNumber: 'one.',
          title: 'Match & Commit',
          description: 'Match with an animal route, choose a charity cause to pair with, and commit.',
        },
        {
          _key: 'step2',
          stepNumber: 'two.',
          title: 'Nurture & Grow',
          description: 'Bring your animal to life with your running steps and nurture your cause.',
        },
        {
          _key: 'step3',
          stepNumber: 'three.',
          title: 'Forever Guardian',
          description:
            'Own your success in running and impact! Hand off your run to its next caretaker.',
        },
      ],
    }),

    // --- Group: FAQs ---
    defineField({
      name: 'faqs',
      title: 'Frequently Asked Questions',
      type: 'array',
      group: 'faqs',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Item',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: [
                  { title: 'Adoption & Routes', value: 'adoption' },
                  { title: 'Logging & GPS Verification', value: 'logging' },
                  { title: 'Charities & Donations', value: 'charity' },
                  { title: 'General', value: 'general' },
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'category',
            },
          },
        }),
      ],
    }),

    // --- Group: About & Slogans ---
    defineField({
      name: 'missionStatement',
      title: 'Mission Statement',
      type: 'text',
      group: 'about',
      rows: 3,
      initialValue:
        'By bringing people together through long-distance running and community art, our project aims to help champion a kinder city where our shared compassion moves us forward.',
    }),
    defineField({
      name: 'essenceStatement',
      title: 'Essence Statement',
      type: 'text',
      group: 'about',
      rows: 3,
      initialValue:
        'Creating large-scale pieces of digital art through GPS tracking by running, jogging or walking an artwork to adopt and take care of it!',
    }),
    defineField({
      name: 'actionSlogan',
      title: 'Action Slogan',
      type: 'string',
      group: 'about',
      initialValue: 'Adopt the run. Complete the route. Own the impact.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Copy & Global Settings',
        subtitle: 'Global tabs & movement counters',
      };
    },
  },
});
