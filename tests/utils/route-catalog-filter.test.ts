import { describe, it, expect } from 'vitest';
import {
  filterAndSortRoutes,
  parseFilterParams,
  toFilterParams,
  DEFAULT_FILTER_STATE,
  type RouteCatalogFilterState,
} from '../../src/utils/route-catalog-filter';
import type { SanityRoute } from '../../src/sanity/types';

describe('route-catalog-filter utility', () => {
  const mockRoutes: SanityRoute[] = [
    {
      _id: 'r1',
      _type: 'route',
      _createdAt: '2026-01-01T00:00:00Z',
      title: 'Peak Dog',
      difficulty: 'easy',
      region: 'Hong Kong Island',
      distanceKm: 5.2,
      tags: ['traffic-free', 'dog-friendly'],
      featured: false,
      isGroupRun: false,
    } as SanityRoute,
    {
      _id: 'r2',
      _type: 'route',
      _createdAt: '2026-01-02T00:00:00Z',
      title: 'Lion Rock Cat',
      difficulty: 'advanced',
      region: 'Kowloon',
      distanceKm: 8.5,
      tags: ['trail-running'],
      featured: true,
      isGroupRun: false,
    } as SanityRoute,
    {
      _id: 'r3',
      _type: 'route',
      _createdAt: '2026-01-03T00:00:00Z',
      title: 'Sha Tin Falcon',
      difficulty: 'beginner',
      region: 'New Territories',
      distanceKm: 3.1,
      tags: ['kid-friendly', 'near MTR'],
      featured: false,
      isGroupRun: true,
      groupRunDateTime: '2026-10-01T10:00:00Z',
    } as SanityRoute,
    {
      _id: 'r4',
      _type: 'route',
      _createdAt: '2026-01-04T00:00:00Z',
      title: 'Kowloon Boar',
      difficulty: 'intermediate',
      region: 'Kowloon',
      distanceKm: 12.0,
      tags: ['near MTR', 'traffic-free'],
      featured: false,
      isGroupRun: true,
      groupRunDateTime: '2026-10-02T10:00:00Z',
    } as SanityRoute,
  ];

  describe('Filtering', () => {
    it('returns all routes when default filter is active', () => {
      const result = filterAndSortRoutes(mockRoutes, DEFAULT_FILTER_STATE);
      expect(result.length).toBe(4);
    });

    it('filters strictly by difficulty', () => {
      const state: RouteCatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        difficulty: 'beginner',
      };
      const result = filterAndSortRoutes(mockRoutes, state);
      expect(result.map((r) => r._id)).toEqual(['r3']);
    });

    it('filters strictly by region with fuzzy mapping (e.g. hk island -> Hong Kong Island)', () => {
      const state: RouteCatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        region: 'hk island',
      };
      const result = filterAndSortRoutes(mockRoutes, state);
      expect(result.map((r) => r._id)).toEqual(['r1']);
    });

    it('filters by feature tags case-insensitively and handles hyphenation', () => {
      const state: RouteCatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        features: ['traffic-free'],
      };
      const result = filterAndSortRoutes(mockRoutes, state);
      expect(result.map((r) => r._id).sort()).toEqual(['r1', 'r4']);
    });

    it('requires all active feature tags to match (AND intersection)', () => {
      const state: RouteCatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        features: ['near MTR', 'traffic-free'],
      };
      const result = filterAndSortRoutes(mockRoutes, state);
      expect(result.map((r) => r._id)).toEqual(['r4']);
    });

    it('returns empty array if no routes match criteria', () => {
      const state: RouteCatalogFilterState = {
        ...DEFAULT_FILTER_STATE,
        difficulty: 'advanced',
        region: 'hk island',
      };
      const result = filterAndSortRoutes(mockRoutes, state);
      expect(result).toEqual([]);
    });
  });

  describe('Sorting and Group Run Priority', () => {
    it('default "latest" puts group runs first, then featured, then standard', () => {
      const result = filterAndSortRoutes(mockRoutes, {
        ...DEFAULT_FILTER_STATE,
        sort: 'latest',
      });
      // r3, r4 are group runs
      expect(result[0].isGroupRun).toBe(true);
      expect(result[1].isGroupRun).toBe(true);
      // r2 is featured
      expect(result[2]._id).toBe('r2');
      // r1 is standard
      expect(result[3]._id).toBe('r1');
    });

    it('"shortest" puts group runs on top sorted by distance ascending, followed by non-group runs sorted by distance ascending', () => {
      const result = filterAndSortRoutes(mockRoutes, {
        ...DEFAULT_FILTER_STATE,
        sort: 'shortest',
      });

      // Group runs: r3 (3.1km), r4 (12.0km)
      expect(result[0]._id).toBe('r3');
      expect(result[1]._id).toBe('r4');

      // Non-group runs: r1 (5.2km), r2 (8.5km) - notice featured r2 is after r1 because 8.5 > 5.2!
      expect(result[2]._id).toBe('r1');
      expect(result[3]._id).toBe('r2');
    });

    it('"longest" puts group runs on top sorted by distance descending, followed by non-group runs sorted by distance descending', () => {
      const result = filterAndSortRoutes(mockRoutes, {
        ...DEFAULT_FILTER_STATE,
        sort: 'longest',
      });

      // Group runs: r4 (12.0km), r3 (3.1km)
      expect(result[0]._id).toBe('r4');
      expect(result[1]._id).toBe('r3');

      // Non-group runs: r2 (8.5km), r1 (5.2km)
      expect(result[2]._id).toBe('r2');
      expect(result[3]._id).toBe('r1');
    });

    it('"easiest" puts group runs on top sorted by difficulty ascending, followed by non-group runs sorted by difficulty ascending', () => {
      const result = filterAndSortRoutes(mockRoutes, {
        ...DEFAULT_FILTER_STATE,
        sort: 'easiest',
      });

      // Group runs: r3 (beginner), r4 (intermediate)
      expect(result[0]._id).toBe('r3');
      expect(result[1]._id).toBe('r4');

      // Non-group runs: r1 (easy), r2 (advanced)
      expect(result[2]._id).toBe('r1');
      expect(result[3]._id).toBe('r2');
    });

    it('"hardest" puts group runs on top sorted by difficulty descending, followed by non-group runs sorted by difficulty descending', () => {
      const result = filterAndSortRoutes(mockRoutes, {
        ...DEFAULT_FILTER_STATE,
        sort: 'hardest',
      });

      // Group runs: r4 (intermediate), r3 (beginner)
      expect(result[0]._id).toBe('r4');
      expect(result[1]._id).toBe('r3');

      // Non-group runs: r2 (advanced), r1 (easy)
      expect(result[2]._id).toBe('r2');
      expect(result[3]._id).toBe('r1');
    });
  });

  describe('URL Search Params sync', () => {
    it('serializes non-default filter state to URLSearchParams', () => {
      const state: RouteCatalogFilterState = {
        difficulty: 'easy',
        region: 'hk island',
        sort: 'shortest',
        features: ['traffic-free', 'trail-running'],
      };
      const params = toFilterParams(state);
      expect(params.get('difficulty')).toBe('easy');
      expect(params.get('region')).toBe('hk island');
      expect(params.get('sort')).toBe('shortest');
      expect(params.get('features')).toBe('traffic-free,trail-running');
    });

    it('omits default values from search params for clean URLs', () => {
      const params = toFilterParams(DEFAULT_FILTER_STATE);
      expect(params.get('difficulty')).toBeNull();
      expect(params.get('region')).toBeNull();
      expect(params.get('sort')).toBeNull();
      expect(params.get('features')).toBeNull();
    });

    it('parses URL search params into RouteCatalogFilterState', () => {
      const params = new URLSearchParams('difficulty=intermediate&region=kowloon&sort=longest&features=near%20mtr,kid-friendly');
      const state = parseFilterParams(params);
      expect(state.difficulty).toBe('intermediate');
      expect(state.region).toBe('kowloon');
      expect(state.sort).toBe('longest');
      expect(state.features).toEqual(['near mtr', 'kid-friendly']);
    });

    it('falls back to default filter values when parsing invalid or empty params', () => {
      const params = new URLSearchParams('difficulty=invalid&region=&sort=bogus');
      const state = parseFilterParams(params);
      expect(state.difficulty).toBe('all');
      expect(state.region).toBe('all');
      expect(state.sort).toBe('latest');
      expect(state.features).toEqual([]);
    });
  });
});
