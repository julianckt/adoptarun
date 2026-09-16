import { defineType, defineField } from 'sanity';
import { PinIcon } from '@sanity/icons/Pin';
import { GpxUploadInput } from '../../components/sanity/GpxUploadInput';
import { RouteTitleInput } from '../../components/sanity/RouteTitleInput';
import { RouteSlugInput } from '../../components/sanity/RouteSlugInput';
import { generateSlug } from '../utils/route-naming';

export const routeType = defineType({
  name: 'route',
  title: 'Route',
  type: 'document',
  icon: PinIcon,
  fieldsets: [
    { name: 'metrics', title: 'Route Telemetry & Metrics', options: { columns: 2 } },
    { name: 'geo', title: 'GPS Geometry & Mapping', options: { collapsible: true } },
    { name: 'groupRun', title: 'Scheduled Community Group Run', options: { collapsible: true } },
  ],
  fields: [
    defineField({
      name: 'district',
      title: 'District / Neighbourhood',
      type: 'string',
      description: 'Hong Kong district (e.g., Central & Western, Wan Chai, Sha Tin).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'animalType',
      title: 'Animal / Guardian Type',
      type: 'string',
      description: 'The animal or guardian species (e.g., Dog, Cat, Boar, Falcon).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Artwork / Companion Name',
      type: 'string',
      components: {
        input: RouteTitleInput,
      },
      description:
        'The creative companion artwork name (e.g., Wan Chai Dog, The Peak Cat). Auto-generates from District & Animal Type with duplicate numbering.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      components: {
        input: RouteSlugInput,
      },
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) => generateSlug(input),
        isUnique: (slug, context) => context.defaultIsUnique(slug, context),
      },
      validation: (rule) =>
        rule.required().custom((slug) => {
          if (!slug?.current) return 'Slug is required';
          if (!/^[a-z0-9-]+$/.test(slug.current)) {
            return 'Slug must be lowercase alphanumeric characters with hyphens only';
          }
          return true;
        }),
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      options: {
        list: [
          { title: 'Hong Kong Island', value: 'Hong Kong Island' },
          { title: 'Kowloon', value: 'Kowloon' },
          { title: 'New Territories', value: 'New Territories' },
          { title: 'Outlying Islands', value: 'Outlying Islands' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      initialValue: 'Hong Kong',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Easy', value: 'easy' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
        layout: 'radio',
      },
      initialValue: 'easy',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Route',
      type: 'boolean',
      description: 'Display this route in the homepage featured grid.',
      initialValue: false,
    }),

    // --- Fieldset: Metrics ---
    defineField({
      name: 'distanceKm',
      title: 'Distance (km)',
      type: 'number',
      fieldset: 'metrics',
      validation: (rule) => rule.required().positive().precision(2),
    }),
    defineField({
      name: 'elevationGain',
      title: 'Elevation Gain (+m)',
      type: 'number',
      fieldset: 'metrics',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'estimatedDurationMin',
      title: 'Estimated Duration (minutes)',
      type: 'number',
      fieldset: 'metrics',
      validation: (rule) => rule.required().positive().integer(),
    }),

    // --- Fieldset: Geo & Mapping ---
    defineField({
      name: 'gpxFile',
      title: 'GPX Track File Asset',
      type: 'file',
      fieldset: 'geo',
      options: {
        accept: '.gpx,application/gpx+xml,application/xml',
      },
      components: {
        input: GpxUploadInput,
      },
      description: 'Official master GPX track file for this artwork.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'routePolyline',
      title: 'Google Encoded Polyline String',
      type: 'text',
      fieldset: 'geo',
      rows: 3,
      description: 'Encoded GPS polyline representation used by Leaflet maps.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'miniMapSvg',
      title: 'Mini-Map SVG Markup / Path',
      type: 'text',
      fieldset: 'geo',
      rows: 4,
      description: 'Static SVG trace path string for fast SSG card previews.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'elevationProfile',
      title: 'Elevation Profile Data (JSON / String)',
      type: 'text',
      fieldset: 'geo',
      rows: 3,
      description: 'Sampled elevation array string for the interactive elevation scrubber.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stravaRouteUrl',
      title: 'Strava Route URL',
      type: 'url',
      fieldset: 'geo',
      validation: (rule) =>
        rule.uri({ scheme: ['http', 'https'] }).error('Must be a valid HTTP/HTTPS URL'),
    }),
    defineField({
      name: 'startPointDescription',
      title: 'Start Point Description',
      type: 'string',
      fieldset: 'geo',
      description: 'MTR exit or landmark where this route begins.',
    }),

    // --- Narrative & Media ---
    defineField({
      name: 'description',
      title: 'Route Blurb / Description',
      type: 'text',
      rows: 3,
      description: 'Breathy editorial narrative describing the companion and terrain.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          initialValue: 'Route companion scenery photograph',
        }),
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Feature Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),

    // --- Fieldset: Scheduled Community Group Run ---
    defineField({
      name: 'isGroupRun',
      title: 'Scheduled Community Group Run Active',
      type: 'boolean',
      fieldset: 'groupRun',
      description: 'When enabled, displays the Group Run Green banner across route cards.',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'groupRunDateTime',
      title: 'Group Run Date & Time',
      type: 'datetime',
      fieldset: 'groupRun',
      hidden: ({ parent }) => !parent?.isGroupRun,
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.parent as { isGroupRun?: boolean })?.isGroupRun && !value) {
            return 'Group run date and time is required when group run is active';
          }
          return true;
        }),
    }),
    defineField({
      name: 'groupRunMeetupPoint',
      title: 'Meetup Point',
      type: 'string',
      fieldset: 'groupRun',
      hidden: ({ parent }) => !parent?.isGroupRun,
    }),
    defineField({
      name: 'groupRunNotes',
      title: 'Group Run Notes / Instructions',
      type: 'text',
      fieldset: 'groupRun',
      rows: 3,
      hidden: ({ parent }) => !parent?.isGroupRun,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      district: 'district',
      distance: 'distanceKm',
      media: 'coverImage',
      isGroupRun: 'isGroupRun',
    },
    prepare({ title, district, distance, media, isGroupRun }) {
      const groupRunBadge = isGroupRun ? ' [GROUP RUN]' : '';
      return {
        title: `${title}${groupRunBadge}`,
        subtitle: `${district || 'Hong Kong'} · ${distance ? `${distance}km` : 'TBD'}`,
        media: media?.asset ? media : undefined,
      };
    },
  },
});
