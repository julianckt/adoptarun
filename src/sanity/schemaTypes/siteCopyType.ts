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
    { name: 'about', title: 'About Section' },
    { name: 'cta', title: 'Bottom Action Banner' },
    { name: 'footer', title: 'Footer & Contact' },
    { name: 'seo', title: 'SEO & Social Share' },
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
      description: 'Headline in lieu of the wordmark (currently kept for future use; wordmark is rendered in hero).',
      initialValue: 'the new way to push yourself in training and in giving back',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle / Tagline',
      type: 'text',
      rows: 2,
      group: 'hero',
      description: 'Tagline displayed immediately below the hero wordmark.',
      initialValue: 'the new way to push yourself in training and in giving back',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Bottom Description',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'Description paragraph displayed in the bottom bar of the hero section.',
      initialValue:
        'by bringing people together through long-distance running and community art, our project aims to help champion a kinder city — a city where our shared compassion moves us forward.',
      validation: (rule) => rule.required(),
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
      name: 'totalHKDRaised',
      title: 'Total HKD Raised',
      type: 'number',
      group: 'counters',
      description: 'Total donations and rescue funds raised in HKD across community runs.',
      initialValue: 0,
      validation: (rule) => rule.required().min(0),
    }),

    // --- Group: Journey Steps ---
    defineField({
      name: 'journeyHeadline',
      title: 'Journey Section Headline',
      type: 'string',
      group: 'journey',
      description: 'Headline for the journey section (currently kept for future use; branded badge lockup is rendered in UI).',
      initialValue: 'the 3-step caretaker journey',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'journeySubtitle',
      title: 'Journey Subtitle / Mission Text',
      type: 'text',
      rows: 2,
      group: 'journey',
      description: 'Mission statement rendered beneath the journey lockup.',
      initialValue: 'make commitments to yourself and to your community – run the route and own the impact',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'journeySteps',
      title: 'Journey Steps',
      type: 'array',
      group: 'journey',
      validation: (rule) => rule.required().min(1),
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

    // --- Group: About Section ---
    defineField({
      name: 'missionStatement',
      title: 'Mission Statement / About Description',
      type: 'text',
      group: 'about',
      rows: 4,
      description: 'Community description paragraph displayed in the About section alongside movement counters.',
      initialValue:
        'We are a budding community project, trying to bring together runners across Hong Kong. Seeking to infuse fun and flair into running all the whilst doing good for the community around us. Get involved in our growing movement and turn your compassion into action!',
      validation: (rule) => rule.required(),
    }),

    // --- Group: Bottom Action Banner ---
    defineField({
      name: 'ctaDescription',
      title: 'Action Banner Description',
      type: 'text',
      group: 'cta',
      rows: 2,
      description: 'Description text rendered above the primary and secondary CTA buttons in the bottom action banner.',
      initialValue:
        "every kilometer drawn on the city's pavement raises rescue funds and champions a kinder city.",
      validation: (rule) => rule.required(),
    }),

    // --- Group: Footer & Contact ---
    defineField({
      name: 'footerContactEmail',
      title: 'Contact Email Address',
      type: 'string',
      group: 'footer',
      description: 'Main public inquiries and support email address shown in the site footer.',
      initialValue: 'adoptarunhk@gmail.com',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'footerSocialLinks',
      title: 'Footer Community & Social Links',
      type: 'array',
      group: 'footer',
      description: 'Social and community links displayed in the Community column of the footer.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          title: 'Social Link',
          fields: [
            defineField({
              name: 'text',
              title: 'Link Text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) =>
                rule.required().uri({
                  scheme: ['http', 'https'],
                }),
            }),
          ],
          preview: {
            select: {
              title: 'text',
              subtitle: 'url',
            },
          },
        }),
      ],
      initialValue: [
        { _key: 'strava', text: 'strava club', url: 'https://strava.com/clubs/adoptarun' },
        { _key: 'instagram', text: 'instagram', url: 'https://instagram.com/adoptarun' },
        { _key: 'github', text: 'github', url: 'https://github.com/julianckt/adoptarun' },
      ],
    }),

    // --- Group: SEO & Social Share ---
    defineField({
      name: 'seoTitle',
      title: 'Default SEO Title',
      type: 'string',
      group: 'seo',
      description:
        'Page title displayed in browser tabs and search engine snippets (recommended: 50–60 characters).',
      initialValue: 'adopt a run — gps art community movement',
      validation: (rule) =>
        rule.required().max(70).warning('Titles longer than 70 characters may be truncated by search engines'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Default SEO Meta Description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description:
        'Summary snippet shown in Google search results and social media cards when sharing links (recommended: 120–160 characters).',
      initialValue:
        'an international gps-art community movement debuting in hong kong. bringing people together through long-distance running, jogging, or walking and community art to champion a kinder city.',
      validation: (rule) =>
        rule.required().max(200).warning('Descriptions longer than 160 characters are typically truncated by search engines'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image (OpenGraph)',
      type: 'image',
      group: 'seo',
      description:
        'Custom social preview image displayed when sharing the site on Twitter, Facebook, WhatsApp, or iMessage. Recommended format: 1200×630px JPG or PNG.',
      options: {
        hotspot: true,
      },
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
