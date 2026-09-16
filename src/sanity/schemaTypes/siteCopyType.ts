import { defineType, defineField, defineArrayMember } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';

export const siteCopyType = defineType({
  name: 'siteCopy',
  title: 'Site Copy',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'homepage', title: 'Homepage', default: true },
    { name: 'faqs', title: 'FAQs' },
  ],
  fields: [
    // ==========================================
    // --- Group: Homepage (Top to Bottom) ---
    // ==========================================

    // 1. Hero Section
    defineField({
      name: 'heroTitle',
      title: 'Hero Headline',
      type: 'string',
      group: 'homepage',
      description: 'Headline in lieu of the wordmark (currently kept for future use; wordmark is rendered in hero).',
      initialValue: 'the new way to push yourself in training and in giving back',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle / Tagline',
      type: 'text',
      rows: 2,
      group: 'homepage',
      description: 'Tagline displayed immediately below the hero wordmark.',
      initialValue: 'the new way to push yourself in training and in giving back',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Bottom Description',
      type: 'text',
      rows: 3,
      group: 'homepage',
      description: 'Description paragraph displayed in the bottom bar of the hero section.',
      initialValue:
        'by bringing people together through long-distance running and community art, our project aims to help champion a kinder city — a city where our shared compassion moves us forward.',
      validation: (rule) => rule.required(),
    }),

    // 2. About & Movement Counters Section
    defineField({
      name: 'totalKmCovered',
      title: 'Total Kilometers Covered',
      type: 'number',
      group: 'homepage',
      description: 'Total distance completed across community runs.',
      initialValue: 187,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'totalRunsCompleted',
      title: 'Total Runs Completed',
      type: 'number',
      group: 'homepage',
      description: 'Total verified route completions.',
      initialValue: 21,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'totalParticipantsCount',
      title: 'Total Participants Count',
      type: 'number',
      group: 'homepage',
      description: 'Total active runners and caretakers.',
      initialValue: 33,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'totalHKDRaised',
      title: 'Total HKD Raised',
      type: 'number',
      group: 'homepage',
      description: 'Total donations and rescue funds raised in HKD across community runs.',
      initialValue: 0,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'missionStatement',
      title: 'Mission Statement / About Description',
      type: 'text',
      group: 'homepage',
      rows: 4,
      description: 'Community description paragraph displayed in the About section alongside movement counters.',
      initialValue:
        'We are a budding community project, trying to bring together runners across Hong Kong. Seeking to infuse fun and flair into running all the whilst doing good for the community around us. Get involved in our growing movement and turn your compassion into action!',
      validation: (rule) => rule.required(),
    }),

    // 3. 3-Step Caretaker Journey Section
    defineField({
      name: 'journeyHeadline',
      title: 'Journey Section Headline',
      type: 'string',
      group: 'homepage',
      description: 'Headline for the journey section (currently kept for future use; branded badge lockup is rendered in UI).',
      initialValue: 'the 3-step caretaker journey',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'journeySubtitle',
      title: 'Journey Subtitle / Mission Text',
      type: 'text',
      rows: 2,
      group: 'homepage',
      description: 'Mission statement rendered beneath the journey lockup.',
      initialValue: 'make commitments to yourself and to your community – run the route and own the impact',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'journeySteps',
      title: 'Journey Steps',
      type: 'array',
      group: 'homepage',
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

    // 4. Bottom Action Banner Section
    defineField({
      name: 'ctaDescription',
      title: 'Action Banner Description',
      type: 'text',
      group: 'homepage',
      rows: 2,
      description: 'Description text rendered above the primary and secondary CTA buttons in the bottom action banner.',
      initialValue:
        "every kilometer drawn on the city's pavement raises rescue funds and champions a kinder city.",
      validation: (rule) => rule.required(),
    }),

    // ==========================================
    // --- Group: FAQs ---
    // ==========================================
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
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Copy',
        subtitle: 'Homepage content & FAQs',
      };
    },
  },
});
