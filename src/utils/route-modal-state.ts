/**
 * Pure state helpers for the expanded route card modal.
 *
 * Kept out of the component so the two pieces of real logic — which elevation
 * sample a pointer is over, and how the ?route= deep link co-exists with the
 * catalogue's filter params — can be specified directly rather than only
 * through a browser.
 */

/** Query parameter carrying the open route on /routes. */
export const ROUTE_PARAM = 'route';

/** Anything positioned along the profile's horizontal axis can be picked. */
export interface ProfilePosition {
  x: number;
}

/**
 * Given how far across the elevation profile the pointer sits (0 at the start
 * of the route, 1 at the end), return the index of the sample to mark on the
 * trace. Returns -1 when there is nothing to mark.
 */
export function pickElevationIndex(ratio: number, points: readonly ProfilePosition[]): number {
  if (!points || points.length === 0) return -1;
  if (points.length === 1) return 0;

  const safeRatio = Number.isFinite(ratio) ? Math.min(1, Math.max(0, ratio)) : 0;

  const first = points[0].x;
  const last = points[points.length - 1].x;
  const target = first + (last - first) * safeRatio;

  let nearest = 0;
  let nearestDistance = Infinity;
  for (let i = 0; i < points.length; i++) {
    const distance = Math.abs(points[i].x - target);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = i;
    }
  }
  return nearest;
}

/**
 * Add or replace the open route in a query string, leaving every other
 * parameter (the catalogue's difficulty / region / sort / features) untouched.
 */
export function setRouteParam(search: string, slug: string): string {
  const params = new URLSearchParams(search);
  params.set(ROUTE_PARAM, slug);
  return `?${params.toString()}`;
}

/**
 * Remove the open route from a query string, preserving the rest. Returns an
 * empty string when nothing is left, so the URL drops the '?' entirely.
 */
export function clearRouteParam(search: string): string {
  const params = new URLSearchParams(search);
  params.delete(ROUTE_PARAM);
  const rest = params.toString();
  return rest ? `?${rest}` : '';
}

/** Read the open route from a query string, or null when none is set. */
export function getRouteParam(search: string): string | null {
  return new URLSearchParams(search).get(ROUTE_PARAM);
}
