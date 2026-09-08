import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';
import {
  formatRouteDistance,
  formatRouteDuration,
  formatRouteElevation,
  formatRouteDifficulty,
  formatRouteSubtitle,
  formatRouteTags,
} from '@/utils/formatters';
import type { SanityRoute } from '@/sanity/types';

describe('RouteCard Behavioral Contracts', () => {
  const componentPath = resolve(__dirname, '../../src/components/RouteCard.astro');

  it('exists at src/components/RouteCard.astro', () => {
    expect(existsSync(componentPath)).toBe(true);
  });

  describe('Telemetry & Metadata Formatting Seam', () => {
    describe('formatRouteDistance', () => {
      it('formats numeric kilometers', () => {
        expect(formatRouteDistance(14)).toBe('14.0km');
        expect(formatRouteDistance(5.2)).toBe('5.2km');
        expect(formatRouteDistance(0)).toBe('0.0km');
      });

      it('formats string kilometers with or without existing suffix', () => {
        expect(formatRouteDistance('14')).toBe('14.0km');
        expect(formatRouteDistance('14km')).toBe('14.0km');
        expect(formatRouteDistance('  8.5km  ')).toBe('8.5km');
      });

      it('handles empty or null distance gracefully', () => {
        expect(formatRouteDistance(null)).toBe('');
        expect(formatRouteDistance(undefined)).toBe('');
        expect(formatRouteDistance('')).toBe('');
      });
    });

    describe('formatRouteDuration', () => {
      it('formats numeric estimated minutes', () => {
        expect(formatRouteDuration(10)).toBe('10min');
        expect(formatRouteDuration(45)).toBe('45min');
      });

      it('formats string minutes with or without suffix', () => {
        expect(formatRouteDuration('10')).toBe('10min');
        expect(formatRouteDuration('10min')).toBe('10min');
      });

      it('returns null when duration is not provided or empty', () => {
        expect(formatRouteDuration(undefined)).toBeNull();
        expect(formatRouteDuration(null)).toBeNull();
        expect(formatRouteDuration('')).toBeNull();
      });
    });

    describe('formatRouteElevation', () => {
      it('formats numeric elevation with positive prefix', () => {
        expect(formatRouteElevation(4)).toBe('+4m');
        expect(formatRouteElevation(120)).toBe('+120m');
        expect(formatRouteElevation(0)).toBe('+0m');
      });

      it('formats string elevation with or without prefix and suffix', () => {
        expect(formatRouteElevation('4')).toBe('+4m');
        expect(formatRouteElevation('+4m')).toBe('+4m');
        expect(formatRouteElevation('-10m')).toBe('-10m');
      });

      it('returns null when elevation is not provided or empty', () => {
        expect(formatRouteElevation(undefined)).toBeNull();
        expect(formatRouteElevation(null)).toBeNull();
        expect(formatRouteElevation('')).toBeNull();
      });
    });

    describe('formatRouteDifficulty', () => {
      it('capitalizes standard difficulty labels', () => {
        expect(formatRouteDifficulty('beginner')).toBe('Beginner');
        expect(formatRouteDifficulty('intermediate')).toBe('Intermediate');
        expect(formatRouteDifficulty('advanced')).toBe('Advanced');
      });

      it('defaults to Beginner when not specified', () => {
        expect(formatRouteDifficulty()).toBe('Beginner');
      });
    });

    describe('formatRouteSubtitle', () => {
      it('uses subtitle when provided', () => {
        expect(formatRouteSubtitle('Near MTR · Traffic-Free Promenade Run')).toBe(
          'Near MTR · Traffic-Free Promenade Run'
        );
      });

      it('falls back to joined tags when subtitle is empty', () => {
        expect(formatRouteSubtitle(undefined, ['Waterfront', 'Paved', 'Scenic'])).toBe(
          'Waterfront · Paved · Scenic'
        );
      });

      it('returns empty string when neither subtitle nor tags exist', () => {
        expect(formatRouteSubtitle(undefined, [])).toBe('');
      });
    });

    describe('formatRouteTags', () => {
      it('formats an array of tags with dot separator', () => {
        expect(formatRouteTags(['Scenic', 'Waterfront'])).toBe('Scenic · Waterfront');
        expect(formatRouteTags(['Paved', 'Flat', 'Night Run'])).toBe('Paved · Flat · Night Run');
      });

      it('filters out empty or falsy tag values', () => {
        expect(formatRouteTags(['Scenic', '', 'Waterfront'])).toBe('Scenic · Waterfront');
      });

      it('returns empty string when tags is null, undefined, or empty', () => {
        expect(formatRouteTags(null)).toBe('');
        expect(formatRouteTags(undefined)).toBe('');
        expect(formatRouteTags([])).toBe('');
      });
    });

    describe('SanityRoute fixture formatting contract', () => {
      const sanityTestDoc: SanityRoute = {
        _id: 'f1eaba7f-c51c-4453-b3db-d2021b42b87a',
        _type: 'route',
        title: 'Test 1',
        animalType: 'Test',
        district: 'YYC',
        region: 'Kowloon',
        city: 'Hong Kong',
        difficulty: 'easy',
        colorTheme: 'route-orange',
        featured: false,
        distanceKm: 5.18,
        elevationGain: 42,
        estimatedDurationMin: 31,
        description: 'Test run w/ jackie night run',
        routePolyline: '{}ggC_lzwTVDJBYQGJAHAVCDADA@CBC...',
        slug: { _type: 'slug', current: 'test-1' },
        tags: null,
        isGroupRun: false,
      };

      it('correctly formats all telemetry readouts and tags from Sanity test document', () => {
        expect(formatRouteDistance(sanityTestDoc.distanceKm)).toBe('5.2km');
        expect(formatRouteDuration(sanityTestDoc.estimatedDurationMin)).toBe('31min');
        expect(formatRouteElevation(sanityTestDoc.elevationGain)).toBe('+42m');
        expect(formatRouteDifficulty(sanityTestDoc.difficulty)).toBe('Easy');
        expect(formatRouteTags(sanityTestDoc.tags)).toBe('');
      });
    });
  });
});

