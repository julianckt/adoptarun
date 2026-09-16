import { defineType, defineField, defineArrayMember } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';

export const settingsType = defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'seo', title: 'SEO & Social Share', default: true },
    { name: 'announcement', title: 'Announcement Ticker' },
    { name: 'footer', title: 'Footer & Contact' },
  ],
  fields: [
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
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
        subtitle: 'Global SEO, announcement banner & footer',
      };
    },
  },
});
