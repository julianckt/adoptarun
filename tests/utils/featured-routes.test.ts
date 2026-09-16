import { describe, it, expect } from 'vitest';
import { selectFeaturedRoutes } from '../../src/utils/featured-routes';
import type { SanityRoute } from '../../src/sanity/types';

describe('selectFeaturedRoutes Utility', () => {
  it('returns an empty array when routes is null, undefined, or empty', () => {
    expect(selectFeaturedRoutes(null)).toEqual([]);
    expect(selectFeaturedRoutes(undefined)).toEqual([]);
    expect(selectFeaturedRoutes([])).toEqual([]);
    expect(selectFeaturedRoutes([], 3)).toEqual([]);
  });

  it('prioritizes group runs over featured and standard routes', () => {
    const mockRoutes: SanityRoute[] = [
      { _id: 'r1', _type: 'route', title: 'Route 1', featured: false, isGroupRun: false } as SanityRoute,
      { _id: 'r2', _type: 'route', title: 'Route 2', featured: true, isGroupRun: false } as SanityRoute,
      { _id: 'r3', _type: 'route', title: 'Group Run 1', featured: false, isGroupRun: true } as SanityRoute,
      { _id: 'r4', _type: 'route', title: 'Group Run 2', featured: true, isGroupRun: true } as SanityRoute,
    ];

    const result = selectFeaturedRoutes(mockRoutes, 3);
    expect(result.length).toBe(3);
    // Both group runs should be first (r3 and r4)
    expect(result[0].isGroupRun).toBe(true);
    expect(result[1].isGroupRun).toBe(true);
    // Followed by featured non-group-run (r2)
    expect(result[2]._id).toBe('r2');
  });

  it('prioritizes featured routes over standard routes when no group runs exist', () => {
    const mockRoutes: SanityRoute[] = [
      { _id: 'std1', _type: 'route', title: 'Standard 1', featured: false, isGroupRun: false } as SanityRoute,
      { _id: 'feat1', _type: 'route', title: 'Featured 1', featured: true, isGroupRun: false } as SanityRoute,
      { _id: 'std2', _type: 'route', title: 'Standard 2', featured: false, isGroupRun: false } as SanityRoute,
      { _id: 'feat2', _type: 'route', title: 'Featured 2', featured: true, isGroupRun: false } as SanityRoute,
    ];

    const result = selectFeaturedRoutes(mockRoutes, 2);
    expect(result.length).toBe(2);
    expect(result.map((r) => r._id)).toEqual(['feat1', 'feat2']);
  });

  it('does not inject fake or dummy fallback routes if fewer than count exist', () => {
    const mockRoutes: SanityRoute[] = [
      { _id: 'single', _type: 'route', title: 'Only One', featured: true, isGroupRun: false } as SanityRoute,
    ];

    const result = selectFeaturedRoutes(mockRoutes, 3);
    expect(result.length).toBe(1);
    expect(result[0]._id).toBe('single');
  });

  it('deduplicates routes by _id', () => {
    const mockRoutes: SanityRoute[] = [
      { _id: 'dup', _type: 'route', title: 'Duplicate Route', featured: true, isGroupRun: true } as SanityRoute,
      { _id: 'dup', _type: 'route', title: 'Duplicate Route Again', featured: true, isGroupRun: true } as SanityRoute,
      { _id: 'other', _type: 'route', title: 'Other Route', featured: false, isGroupRun: false } as SanityRoute,
    ];

    const result = selectFeaturedRoutes(mockRoutes, 3);
    expect(result.length).toBe(2);
    expect(result.map((r) => r._id)).toEqual(['dup', 'other']);
  });
});
