import { describe, it, expect } from 'vitest';
import {
  FAQ_CATEGORIES,
  groupFaqsByCategory,
  type FaqCategoryGroup,
} from '@/utils/faq-utils';
import type { FaqItem } from '@/sanity/types';

describe('faq-utils', () => {
  it('defines the canonical categories in expected display order', () => {
    expect(FAQ_CATEGORIES).toHaveLength(4);
    expect(FAQ_CATEGORIES.map((c) => c.slug)).toEqual([
      'adoption',
      'logging',
      'charity',
      'general',
    ]);
    expect(FAQ_CATEGORIES.map((c) => c.label)).toEqual([
      'adoption & routes',
      'logging & gps verification',
      'charities & donations',
      'general',
    ]);
    expect(FAQ_CATEGORIES.map((c) => c.anchorId)).toEqual([
      'adoption-and-routes',
      'logging-and-gps-verification',
      'charities-and-donations',
      'general',
    ]);
  });

  it('groups questions into canonical categories maintaining placeholder entries for empty categories', () => {
    const mockFaqs: FaqItem[] = [
      {
        _key: '1',
        question: 'How do I donate?',
        answer: 'Via our charity partner link.',
        category: 'charity',
      },
      {
        _key: '2',
        question: 'What is Adopt A Run?',
        answer: 'A GPS art movement.',
        category: 'general',
      },
      {
        _key: '3',
        question: 'Can I adopt a route without an account?',
        answer: 'Yes, with your 6-character Adopter ID.',
        category: 'adoption',
      },
    ];

    const groups: FaqCategoryGroup[] = groupFaqsByCategory(mockFaqs);

    expect(groups).toHaveLength(4);

    // 1. Adoption
    expect(groups[0].category.slug).toBe('adoption');
    expect(groups[0].items).toHaveLength(1);
    expect(groups[0].items[0].question).toBe('Can I adopt a route without an account?');

    // 2. Logging (Empty placeholder)
    expect(groups[1].category.slug).toBe('logging');
    expect(groups[1].items).toHaveLength(0);

    // 3. Charity
    expect(groups[2].category.slug).toBe('charity');
    expect(groups[2].items).toHaveLength(1);
    expect(groups[2].items[0].question).toBe('How do I donate?');

    // 4. General
    expect(groups[3].category.slug).toBe('general');
    expect(groups[3].items).toHaveLength(1);
    expect(groups[3].items[0].question).toBe('What is Adopt A Run?');
  });

  it('handles null, undefined, or empty faq list gracefully', () => {
    const emptyResult = groupFaqsByCategory([]);
    expect(emptyResult).toHaveLength(4);
    expect(emptyResult.every((g) => g.items.length === 0)).toBe(true);

    const nullResult = groupFaqsByCategory(null as any);
    expect(nullResult).toHaveLength(4);
    expect(nullResult.every((g) => g.items.length === 0)).toBe(true);
  });

  it('assigns items with unrecognized or missing category to general', () => {
    const mockFaqs: FaqItem[] = [
      {
        _key: '1',
        question: 'Uncategorized question?',
        answer: 'Goes to general.',
      },
      {
        _key: '2',
        question: 'Unknown category question?',
        answer: 'Also goes to general.',
        category: 'unknown' as any,
      },
    ];

    const groups = groupFaqsByCategory(mockFaqs);
    const generalGroup = groups.find((g) => g.category.slug === 'general');
    expect(generalGroup?.items).toHaveLength(2);
  });
});
