import type { SanityRoute } from '@/sanity/types';

export const FALLBACK_FEATURED_ROUTES: SanityRoute[] = [
  {
    _id: 'sample-wan-chai',
    _type: 'route',
    title: 'Wan Chai Promenade',
    slug: { _type: 'slug', current: 'wan-chai-promenade' },
    animalType: 'dog',
    district: 'Wan Chai',
    region: 'Hong Kong Island',
    city: 'Hong Kong',
    distanceKm: 14,
    estimatedDurationMin: 10,
    elevationGain: 4,
    difficulty: 'beginner',
    featured: true,
    routePolyline: '',
    description: 'Scenic flat route along Wan Chai Promenade',
    isGroupRun: false,
    tags: ['Near MTR', 'Traffic-Free Promenade Run'],
  },
  {
    _id: 'sample-happy-valley',
    _type: 'route',
    title: 'Happy Valley Boar',
    slug: { _type: 'slug', current: 'happy-valley-boar' },
    animalType: 'boar',
    district: 'Happy Valley',
    region: 'Hong Kong Island',
    city: 'Hong Kong',
    distanceKm: 8.5,
    estimatedDurationMin: 85,
    elevationGain: 320,
    difficulty: 'intermediate',
    featured: true,
    routePolyline: '',
    description: 'Winding ridgeline loop tracing northern contours through Wan Chai Gap and Bowen Road',
    isGroupRun: false,
    tags: ['Ridge Trail', 'Scenic Lookout'],
  },
  {
    _id: 'sample-bowen-road',
    _type: 'route',
    title: 'Bowen Road Gazelle',
    slug: { _type: 'slug', current: 'bowen-road-gazelle' },
    animalType: 'gazelle',
    district: 'Mid-Levels',
    region: 'Hong Kong Island',
    city: 'Hong Kong',
    distanceKm: 6.2,
    estimatedDurationMin: 45,
    elevationGain: 85,
    difficulty: 'beginner',
    featured: true,
    routePolyline: '',
    description: 'Historic shaded military road overlooking Victoria Harbour',
    isGroupRun: false,
    tags: ['Shaded Path', 'Historical Aqueduct'],
  },
];

/**
 * Selects up to `count` featured routes, prioritizing routes marked as featured,
 * then other routes, and finally falling back to curated presets if fewer than `count` exist.
 */
export function selectFeaturedRoutes(routes?: SanityRoute[] | null, count: number = 3): SanityRoute[] {
  const result: SanityRoute[] = [];
  const seenIds = new Set<string>();

  if (Array.isArray(routes) && routes.length > 0) {
    // 1. Featured routes first
    for (const r of routes) {
      if (r?.featured && !seenIds.has(r._id)) {
        result.push(r);
        seenIds.add(r._id);
        if (result.length >= count) return result;
      }
    }

    // 2. Non-featured routes next
    for (const r of routes) {
      if (!seenIds.has(r._id)) {
        result.push(r);
        seenIds.add(r._id);
        if (result.length >= count) return result;
      }
    }
  }

  // 3. Fallback defaults if still under count
  for (const fallback of FALLBACK_FEATURED_ROUTES) {
    if (!seenIds.has(fallback._id)) {
      result.push(fallback);
      seenIds.add(fallback._id);
      if (result.length >= count) return result;
    }
  }

  return result.slice(0, count);
}
