import { defineType, defineField } from 'sanity';
import { HeartIcon } from '@sanity/icons/Heart';
import { CharitySlugInput } from '../../components/sanity/CharitySlugInput';
import { generateSlug } from '../utils/route-naming';

export const charityType = defineType({
  name: 'charity',
  title: 'Charity Partner',
  type: 'document',
  icon: HeartIcon,
  fieldsets: [
    { name: 'organization', title: 'Organization Details' },
    { name: 'impact', title: 'Impact Metric & Equivalency Formulas' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Charity Name',
      type: 'string',
      fieldset: 'organization',
      description: 'Official partner organization name (e.g. SPCA (HK)).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      fieldset: 'organization',
      components: {
        input: CharitySlugInput,
      },
      options: {
        source: 'name',
        maxLength: 96,
        slugify: (input) => generateSlug(input),
        isUnique: (slug, context) => context.defaultIsUnique(slug, context),
      },
      validation: (rule) =>
        rule.required().custom((slug) => {
          if (!slug?.current) return 'Slug is required';
          return true;
        }),
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
      fieldset: 'organization',
      description: 'Official organization website (HTTP or HTTPS).',
      validation: (rule) =>
        rule.required().uri({ scheme: ['http', 'https'] }).error('Must be a valid HTTP/HTTPS URL'),
    }),
    defineField({
      name: 'logo',
      title: 'Charity Logo',
      type: 'image',
      fieldset: 'organization',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Descriptive text of the logo for screen readers and accessibility.',
          initialValue: 'Charity partner logo',
          validation: (rule) => rule.required().error('Alternative text is required for accessibility'),
        }),
      ],
      validation: (rule) => rule.required().error('Charity logo is required'),
    }),
    defineField({
      name: 'coverPhoto',
      title: 'Cover Photo',
      type: 'image',
      fieldset: 'organization',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Descriptive text of the photograph for screen readers and accessibility.',
          initialValue: 'Charity mission cover photo',
          validation: (rule) => rule.required().error('Alternative text is required for accessibility'),
        }),
      ],
      validation: (rule) => rule.required().error('Cover photo is required'),
    }),
    defineField({
      name: 'charityDescription',
      title: 'Charity Overview Description',
      type: 'text',
      fieldset: 'organization',
      rows: 4,
      description: 'Organizational overview of the Section 88 tax-exempt non-profit.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'causeDescription',
      title: 'Specific Cause / Campaign Description',
      type: 'text',
      fieldset: 'organization',
      rows: 3,
      description: 'The specific cause or initiative supported by this artwork pairing.',
      validation: (rule) => rule.required(),
    }),

    // --- Fieldset: Impact Formulas ---
    defineField({
      name: 'impactUnitName',
      title: 'Impact Unit Name',
      type: 'string',
      fieldset: 'impact',
      description: 'Human-readable unit (e.g., "meals provided", "days of shelter", "trees planted").',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'impactMultiplierPerHkd',
      title: 'Impact Multiplier (Units per HK$1)',
      type: 'number',
      fieldset: 'impact',
      description: 'Multiplier applied to HKD donations (e.g. 0.1 for 1 meal per HK$10).',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'impactDisplayTemplate',
      title: 'Impact Display Template',
      type: 'string',
      fieldset: 'impact',
      description:
        'Sentence template shown to runners summarizing their donation impact. Use dynamic tokens {amount} (the HKD donation value) and {impact} (the calculated impact units = amount × multiplier). Examples: "HK${amount} provides {impact} meals for rescue animals" or "HK${amount} funds {impact} days of shelter care".',
      initialValue: 'HK${amount} provides {impact} meals for rescue animals',
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value || !value.trim()) return 'Impact display template is required';
          if (!value.includes('{amount}')) {
            return 'Template must include the {amount} token (e.g. HK${amount})';
          }
          if (!value.includes('{impact}')) {
            return 'Template must include the {impact} token (e.g. {impact} meals)';
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'websiteUrl',
      media: 'logo',
    },
  },
});
