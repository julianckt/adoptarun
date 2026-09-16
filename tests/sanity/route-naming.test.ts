import { describe, it, expect } from 'vitest';
import {
  formatBaseTitle,
  calculateNextDuplicateTitle,
  generateSlug,
} from '../../src/sanity/utils/route-naming';

describe('Route Auto-Naming & Slug Utilities', () => {
  describe('formatBaseTitle', () => {
    it('combines district and animal type cleanly', () => {
      expect(formatBaseTitle('Wan Chai', 'Dog')).toBe('Wan Chai Dog');
      expect(formatBaseTitle('The Peak', 'Cat')).toBe('The Peak Cat');
    });

    it('trims whitespace from inputs', () => {
      expect(formatBaseTitle('  Wan Chai  ', '  Dog  ')).toBe('Wan Chai Dog');
    });

    it('returns empty string if either district or animal type is missing or whitespace', () => {
      expect(formatBaseTitle('', 'Dog')).toBe('');
      expect(formatBaseTitle('Wan Chai', '')).toBe('');
      expect(formatBaseTitle('   ', 'Dog')).toBe('');
      expect(formatBaseTitle('Wan Chai', '   ')).toBe('');
      expect(formatBaseTitle(undefined, 'Dog')).toBe('');
      expect(formatBaseTitle('Wan Chai', undefined)).toBe('');
    });
  });

  describe('calculateNextDuplicateTitle', () => {
    it('returns the base title with no number when there are no existing matching titles', () => {
      const next = calculateNextDuplicateTitle('Wan Chai Dog', []);
      expect(next).toBe('Wan Chai Dog');
    });

    it('returns base title if existing titles do not match the base title', () => {
      const existing = ['Central Dog', 'Wan Chai Cat', 'The Peak Dog 2'];
      const next = calculateNextDuplicateTitle('Wan Chai Dog', existing);
      expect(next).toBe('Wan Chai Dog');
    });

    it('increments to "Base 2" when the original unnumbered title already exists', () => {
      const existing = ['Wan Chai Dog'];
      const next = calculateNextDuplicateTitle('Wan Chai Dog', existing);
      expect(next).toBe('Wan Chai Dog 2');
    });

    it('increments to "Base 3" when original and "Base 2" exist', () => {
      const existing = ['Wan Chai Dog', 'Wan Chai Dog 2'];
      const next = calculateNextDuplicateTitle('Wan Chai Dog', existing);
      expect(next).toBe('Wan Chai Dog 3');
    });

    it('increments to "Base 4" when 1, 2, and 3 exist', () => {
      const existing = ['Wan Chai Dog', 'Wan Chai Dog 2', 'Wan Chai Dog 3'];
      const next = calculateNextDuplicateTitle('Wan Chai Dog', existing);
      expect(next).toBe('Wan Chai Dog 4');
    });

    it('fills in lowest missing index when there is a gap', () => {
      // Original (1) and 3 exist, 2 is missing
      const existing = ['Wan Chai Dog', 'Wan Chai Dog 3'];
      const next = calculateNextDuplicateTitle('Wan Chai Dog', existing);
      expect(next).toBe('Wan Chai Dog 2');
    });

    it('returns original unnumbered title if only numbered versions exist (e.g. original was renamed/deleted)', () => {
      const existing = ['Wan Chai Dog 2', 'Wan Chai Dog 3'];
      const next = calculateNextDuplicateTitle('Wan Chai Dog', existing);
      expect(next).toBe('Wan Chai Dog');
    });

    it('handles case-insensitivity when matching base titles', () => {
      const existing = ['wan chai dog'];
      const next = calculateNextDuplicateTitle('Wan Chai Dog', existing);
      expect(next).toBe('Wan Chai Dog 2');
    });

    it('does not match partial prefix titles (e.g. "Wan Chai Dogfight" or "Wan Chai Doge")', () => {
      const existing = ['Wan Chai Dogfight', 'Wan Chai Doge', 'Wan Chai Dogmatic'];
      const next = calculateNextDuplicateTitle('Wan Chai Dog', existing);
      expect(next).toBe('Wan Chai Dog');
    });

    it('handles special characters in base title safely without regex injection', () => {
      const existing = ['Central & Western Dog'];
      const next = calculateNextDuplicateTitle('Central & Western Dog', existing);
      expect(next).toBe('Central & Western Dog 2');
    });
  });

  describe('generateSlug', () => {
    it('converts titles to lowercase hyphenated slugs', () => {
      expect(generateSlug('Wan Chai Dog')).toBe('wan-chai-dog');
      expect(generateSlug('Wan Chai Dog 2')).toBe('wan-chai-dog-2');
      expect(generateSlug('The Peak Cat')).toBe('the-peak-cat');
    });

    it('converts ampersands to "and"', () => {
      expect(generateSlug('Central & Western Dog')).toBe('central-and-western-dog');
      expect(generateSlug('Central & Western Dog 2')).toBe('central-and-western-dog-2');
    });

    it('removes punctuation and collapses multiple hyphens', () => {
      expect(generateSlug("St. John's Cat - Run #1")).toBe('st-johns-cat-run-1');
    });

    it('trims hyphens from beginning and end', () => {
      expect(generateSlug(' - Wan Chai Dog - ')).toBe('wan-chai-dog');
    });

    it('strictly satisfies Sanity route slug regex /^[a-z0-9-]+$/', () => {
      const slugRegex = /^[a-z0-9-]+$/;
      const testCases = [
        'Wan Chai Dog',
        'Wan Chai Dog 2',
        'The Peak Cat',
        'Central & Western Dog 3',
        "King's Park Boar",
        'Tai Mo Shan (North) Eagle',
      ];

      for (const title of testCases) {
        const slug = generateSlug(title);
        expect(slugRegex.test(slug)).toBe(true);
      }
    });

    it('respects maximum length of 96 characters', () => {
      const veryLongTitle = 'A'.repeat(120);
      const slug = generateSlug(veryLongTitle);
      expect(slug.length).toBeLessThanOrEqual(96);
    });

    it('returns empty string for empty or whitespace-only titles', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('   ')).toBe('');
    });
  });

  describe('fetchMatchingRouteTitles', () => {
    it('returns empty array if client or baseTitle is missing', async () => {
      const { fetchMatchingRouteTitles } = await import('../../src/sanity/utils/route-naming');
      expect(await fetchMatchingRouteTitles(null as any, 'Wan Chai Dog')).toEqual([]);
      expect(await fetchMatchingRouteTitles({} as any, '')).toEqual([]);
    });

    it('queries Sanity with correct params and excludes current doc (draft and published)', async () => {
      const { fetchMatchingRouteTitles } = await import('../../src/sanity/utils/route-naming');
      let capturedQuery = '';
      let capturedParams: any = null;

      const mockClient = {
        fetch: async (query: string, params: any) => {
          capturedQuery = query;
          capturedParams = params;
          return [{ title: 'Wan Chai Dog' }, { title: 'Wan Chai Dog 2' }];
        },
      };

      const titles = await fetchMatchingRouteTitles(
        mockClient,
        'Wan Chai Dog',
        'drafts.route-123'
      );

      expect(capturedQuery).toContain('*[_type == "route"');
      expect(capturedParams).toEqual({
        baseTitle: 'Wan Chai Dog',
        searchPattern: 'Wan Chai Dog*',
        draftId: 'drafts.route-123',
        publishedId: 'route-123',
      });
      expect(titles).toEqual(['Wan Chai Dog', 'Wan Chai Dog 2']);
    });

    it('gracefully handles client fetch errors without throwing', async () => {
      const { fetchMatchingRouteTitles } = await import('../../src/sanity/utils/route-naming');
      const failingClient = {
        fetch: async () => {
          throw new Error('Network error');
        },
      };

      const titles = await fetchMatchingRouteTitles(failingClient, 'Wan Chai Dog');
      expect(titles).toEqual([]);
    });
  });
});
