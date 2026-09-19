import type { SanityRoute } from '@/sanity/types';

export type RouteDifficultyFilter = 'all' | 'beginner' | 'easy' | 'intermediate' | 'advanced';
export type RouteRegionFilter = 'all' | 'hk island' | 'kowloon' | 'new territories';
export type RouteSortOption = 'latest' | 'shortest' | 'longest' | 'easiest' | 'hardest';

export interface RouteCatalogFilterState {
  difficulty: RouteDifficultyFilter;
  region: RouteRegionFilter;
  sort: RouteSortOption;
  features: string[];
}

export const DEFAULT_FILTER_STATE: RouteCatalogFilterState = {
  difficulty: 'all',
  region: 'all',
  sort: 'latest',
  features: [],
};

const DIFFICULTY_WEIGHT: Record<string, number> = {
  beginner: 1,
  easy: 2,
  intermediate: 3,
  advanced: 4,
};

/**
 * Normalizes a string for loose matching (lowercase, collapses hyphens and whitespace)
 */
function normalizeString(val?: string | null): string {
  if (!val) return '';
  return val.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
}

/**
 * Checks if a route matches a given region filter
 */
function matchesRegion(routeRegion?: string | null, filterRegion?: RouteRegionFilter): boolean {
  if (!filterRegion || filterRegion === 'all') return true;
  if (!routeRegion) return false;

  const normRoute = normalizeString(routeRegion);
  const normFilter = normalizeString(filterRegion);

  if (normFilter === 'hk island') {
    return normRoute.includes('hong kong island') || normRoute.includes('hk island');
  }
  return normRoute.includes(normFilter);
}

/**
 * Checks if a route matches a given difficulty filter
 */
function matchesDifficulty(routeDifficulty?: string | null, filterDifficulty?: RouteDifficultyFilter): boolean {
  if (!filterDifficulty || filterDifficulty === 'all') return true;
  if (!routeDifficulty) return false;
  return routeDifficulty.toLowerCase() === filterDifficulty.toLowerCase();
}

/**
 * Checks if a route has all of the selected feature tags
 */
function matchesFeatures(routeTags?: string[] | null, filterFeatures?: string[]): boolean {
  if (!filterFeatures || filterFeatures.length === 0) return true;
  if (!routeTags || routeTags.length === 0) return false;

  const normalizedRouteTags = routeTags.map((t) => normalizeString(t));
  return filterFeatures.every((f) => {
    const normF = normalizeString(f);
    return normalizedRouteTags.some((rt) => rt === normF || rt.includes(normF));
  });
}

/**
 * Pure filter & sort function for route catalog
 */
export function filterAndSortRoutes(
  routes: SanityRoute[] | null | undefined,
  filterState: RouteCatalogFilterState
): SanityRoute[] {
  if (!Array.isArray(routes) || routes.length === 0) {
    return [];
  }

  // 1. Filter routes
  const filtered = routes.filter((route) => {
    if (!matchesDifficulty(route.difficulty, filterState.difficulty)) return false;
    if (!matchesRegion(route.region, filterState.region)) return false;
    if (!matchesFeatures(route.tags, filterState.features)) return false;
    return true;
  });

  // 2. Partition into group runs and standard runs
  const groupRuns = filtered.filter((r) => r.isGroupRun);
  const nonGroupRuns = filtered.filter((r) => !r.isGroupRun);

  // Sorting helpers
  const sortByDistance = (asc: boolean) => (a: SanityRoute, b: SanityRoute) => {
    const distA = a.distanceKm ?? 0;
    const distB = b.distanceKm ?? 0;
    return asc ? distA - distB : distB - distA;
  };

  const sortByDifficulty = (asc: boolean) => (a: SanityRoute, b: SanityRoute) => {
    const diffA = DIFFICULTY_WEIGHT[a.difficulty?.toLowerCase() || 'easy'] || 2;
    const diffB = DIFFICULTY_WEIGHT[b.difficulty?.toLowerCase() || 'easy'] || 2;
    return asc ? diffA - diffB : diffB - diffA;
  };

  const sortByLatest = (runs: SanityRoute[]) => {
    // Priority: Featured first, then createdAt / original index
    return [...runs].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const timeA = a._createdAt ? new Date(a._createdAt).getTime() : 0;
      const timeB = b._createdAt ? new Date(b._createdAt).getTime() : 0;
      return timeB - timeA;
    });
  };

  // 3. Apply sorting per group partition
  let sortedGroupRuns: SanityRoute[] = [];
  let sortedNonGroupRuns: SanityRoute[] = [];

  switch (filterState.sort) {
    case 'shortest':
      sortedGroupRuns = [...groupRuns].sort(sortByDistance(true));
      sortedNonGroupRuns = [...nonGroupRuns].sort(sortByDistance(true));
      break;
    case 'longest':
      sortedGroupRuns = [...groupRuns].sort(sortByDistance(false));
      sortedNonGroupRuns = [...nonGroupRuns].sort(sortByDistance(false));
      break;
    case 'easiest':
      sortedGroupRuns = [...groupRuns].sort(sortByDifficulty(true));
      sortedNonGroupRuns = [...nonGroupRuns].sort(sortByDifficulty(true));
      break;
    case 'hardest':
      sortedGroupRuns = [...groupRuns].sort(sortByDifficulty(false));
      sortedNonGroupRuns = [...nonGroupRuns].sort(sortByDifficulty(false));
      break;
    case 'latest':
    default:
      sortedGroupRuns = sortByLatest(groupRuns);
      sortedNonGroupRuns = sortByLatest(nonGroupRuns);
      break;
  }

  // Pinned group runs always appear first, followed by standard runs
  return [...sortedGroupRuns, ...sortedNonGroupRuns];
}

/**
 * Converts RouteCatalogFilterState to URLSearchParams for browser URL synchronization
 */
export function toFilterParams(state: RouteCatalogFilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.difficulty && state.difficulty !== 'all') {
    params.set('difficulty', state.difficulty);
  }
  if (state.region && state.region !== 'all') {
    params.set('region', state.region);
  }
  if (state.sort && state.sort !== 'latest') {
    params.set('sort', state.sort);
  }
  if (state.features && state.features.length > 0) {
    params.set('features', state.features.join(','));
  }

  return params;
}

/**
 * Parses URLSearchParams into RouteCatalogFilterState
 */
export function parseFilterParams(params: URLSearchParams | string): RouteCatalogFilterState {
  const sp = typeof params === 'string' ? new URLSearchParams(params) : params;

  const validDifficulties: RouteDifficultyFilter[] = ['all', 'beginner', 'easy', 'intermediate', 'advanced'];
  const validRegions: RouteRegionFilter[] = ['all', 'hk island', 'kowloon', 'new territories'];
  const validSorts: RouteSortOption[] = ['latest', 'shortest', 'longest', 'easiest', 'hardest'];

  const rawDiff = (sp.get('difficulty') || '').toLowerCase();
  const difficulty = validDifficulties.includes(rawDiff as RouteDifficultyFilter)
    ? (rawDiff as RouteDifficultyFilter)
    : 'all';

  const rawRegion = (sp.get('region') || '').toLowerCase();
  const region = validRegions.includes(rawRegion as RouteRegionFilter)
    ? (rawRegion as RouteRegionFilter)
    : 'all';

  const rawSort = (sp.get('sort') || '').toLowerCase();
  const sort = validSorts.includes(rawSort as RouteSortOption)
    ? (rawSort as RouteSortOption)
    : 'latest';

  const rawFeatures = sp.get('features');
  const features = rawFeatures
    ? rawFeatures
        .split(',')
        .map((f) => f.trim().toLowerCase())
        .filter(Boolean)
    : [];

  return {
    difficulty,
    region,
    sort,
    features,
  };
}
