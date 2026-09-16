import type { SanityRoute } from '@/sanity/types';

/**
 * Selects up to `count` routes with strict priority:
 * 1. Group runs (isGroupRun: true)
 * 2. Featured routes (featured: true)
 * 3. All other routes
 *
 * Never fabricates or appends hardcoded fallback dummy data.
 */
export function selectFeaturedRoutes(routes?: SanityRoute[] | null, count: number = 3): SanityRoute[] {
  if (!Array.isArray(routes) || routes.length === 0 || count <= 0) {
    return [];
  }

  const result: SanityRoute[] = [];
  const seenIds = new Set<string>();

  const addRoute = (r: SanityRoute | null | undefined): boolean => {
    if (r && r._id && !seenIds.has(r._id)) {
      result.push(r);
      seenIds.add(r._id);
      return result.length >= count;
    }
    return false;
  };

  // 1. Group runs first
  for (const r of routes) {
    if (r?.isGroupRun && addRoute(r)) return result;
  }

  // 2. Featured routes next
  for (const r of routes) {
    if (r?.featured && addRoute(r)) return result;
  }

  // 3. Other routes
  for (const r of routes) {
    if (addRoute(r)) return result;
  }

  return result.slice(0, count);
}
