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
      it('formats numeric estimated minutes under an hour', () => {
        expect(formatRouteDuration(10)).toBe('10min');
        expect(formatRouteDuration(45)).toBe('45min');
      });

      it('formats exact hours without minutes', () => {
        expect(formatRouteDuration(60)).toBe('1hr');
        expect(formatRouteDuration(120)).toBe('2hr');
      });

      it('formats combined hours and minutes without spaces', () => {
        expect(formatRouteDuration(85)).toBe('1hr25min');
        expect(formatRouteDuration(135)).toBe('2hr15min');
      });

      it('formats string minutes with or without suffix', () => {
        expect(formatRouteDuration('10')).toBe('10min');
        expect(formatRouteDuration('10min')).toBe('10min');
        expect(formatRouteDuration('85')).toBe('1hr25min');
      });

      it('returns null when duration is not provided, 0, or empty', () => {
        expect(formatRouteDuration(undefined)).toBeNull();
        expect(formatRouteDuration(null)).toBeNull();
        expect(formatRouteDuration('')).toBeNull();
        expect(formatRouteDuration(0)).toBeNull();
        expect(formatRouteDuration(-5)).toBeNull();
      });
    });

    describe('formatRouteElevation', () => {
      it('formats numeric elevation with ± prefix and integer meters', () => {
        expect(formatRouteElevation(4)).toBe('±4m');
        expect(formatRouteElevation(120)).toBe('±120m');
        expect(formatRouteElevation(0)).toBe('±0m');
        expect(formatRouteElevation(42.4)).toBe('±42m');
        expect(formatRouteElevation(42.6)).toBe('±43m');
      });

      it('formats string elevation with or without prefix and suffix', () => {
        expect(formatRouteElevation('4')).toBe('±4m');
        expect(formatRouteElevation('+4m')).toBe('±4m');
        expect(formatRouteElevation('-10m')).toBe('±10m');
        expect(formatRouteElevation('±42m')).toBe('±42m');
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

    const sanityTestDoc: SanityRoute = {
      _id: 'f1eaba7f-c51c-4453-b3db-d2021b42b87a',
      _type: 'route',
      title: 'Test 1',
      animalType: 'Test',
      district: 'YYC',
      region: 'Kowloon',
      city: 'Hong Kong',
      difficulty: 'easy',
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

    describe('SanityRoute fixture formatting contract', () => {
      it('correctly formats all telemetry readouts and tags from Sanity test document', () => {
        expect(formatRouteDistance(sanityTestDoc.distanceKm)).toBe('5.2km');
        expect(formatRouteDuration(sanityTestDoc.estimatedDurationMin)).toBe('31min');
        expect(formatRouteElevation(sanityTestDoc.elevationGain)).toBe('±42m');
        expect(formatRouteDifficulty(sanityTestDoc.difficulty)).toBe('Easy');
        expect(formatRouteTags(sanityTestDoc.tags)).toBe('');
      });
    });

    describe('Minimap Basemap & Group Run Contract', () => {
      it('supports full-bleed basemap SVG markup with route-trace class', () => {
        const fullBleedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 356 216" fill="none"><g class="route-basemap"><path d="M0 0"/></g><path class="route-trace" d="M10 10"/></svg>`;
        const routeWithBasemap: SanityRoute = {
          ...sanityTestDoc,
          miniMapSvg: fullBleedSvg,
        };

        expect(routeWithBasemap.miniMapSvg).toContain('viewBox="0 0 356 216"');
        expect(routeWithBasemap.miniMapSvg).toContain('class="route-basemap"');
        expect(routeWithBasemap.miniMapSvg).toContain('class="route-trace"');
      });

      it('supports group run fields activating group run contract', () => {
        const groupRunDoc: SanityRoute = {
          ...sanityTestDoc,
          isGroupRun: true,
          groupRunDateTime: '2026-10-15T19:30:00+08:00',
          groupRunSignupCount: 18,
          groupRunMeetupPoint: 'Wan Chai Ferry Pier',
        };

        expect(groupRunDoc.isGroupRun).toBe(true);
        expect(groupRunDoc.groupRunDateTime).toBeDefined();
        expect(groupRunDoc.groupRunSignupCount).toBe(18);
        expect(groupRunDoc.groupRunMeetupPoint).toBe('Wan Chai Ferry Pier');
      });
    });
  });
});

