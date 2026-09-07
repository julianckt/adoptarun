import { stegaClean as sanityStegaClean } from '@sanity/client/stega';

/**
 * Regex matching zero-width Unicode characters, bidi overrides, isolate controls,
 * BOM, and musical symbols used by Vercel / Sanity Stega encoding.
 */
export const STEGA_REGEX =
  /[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]|[\u{1D173}-\u{1D17A}]/gu;

/**
 * Strips Stega characters from a single string.
 */
export function cleanStegaString(str: string): string {
  if (typeof str !== 'string') return str;
  try {
    const cleaned = sanityStegaClean(str);
    const base = typeof cleaned === 'string' ? cleaned : str;
    return base.replace(STEGA_REGEX, '');
  } catch {
    return str.replace(STEGA_REGEX, '');
  }
}

/**
 * Deeply and recursively sanitizes strings, arrays, and objects by stripping
 * invisible zero-width Stega Unicode characters without mutating original objects.
 */
export function cleanStega<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return cleanStegaString(value) as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => cleanStega(item)) as unknown as T;
  }

  if (typeof value === 'object') {
    // Preserve instances of Date, RegExp, etc.
    if (value instanceof Date || value instanceof RegExp) {
      return value;
    }
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = cleanStega(val);
    }
    return result as T;
  }

  return value;
}

/**
 * Safely extracts clean finite numbers from stega-encoded strings, numeric strings
 * with units (e.g. "12.5km", "250m"), or numbers.
 */
export function cleanStegaNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    const cleaned = cleanStegaString(value).trim();
    const match = cleaned.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/);
    if (match) {
      const parsed = Number(match[0]);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Helper to parse and clean a single coordinate pair, returning null if invalid.
 */
function parseCoordinatePair(coords: unknown): [number, number] | null {
  if (!coords || typeof coords !== 'object') {
    return null;
  }

  if (Array.isArray(coords)) {
    if (coords.length < 2) return null;
    const lat = cleanStegaNumber(coords[0], NaN);
    const lng = cleanStegaNumber(coords[1], NaN);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return [lat, lng];
  }

  const obj = coords as Record<string, unknown>;
  const rawLat = obj.lat ?? obj.latitude;
  const rawLng = obj.lng ?? obj.longitude;
  if (rawLat === undefined || rawLng === undefined) return null;

  const lat = cleanStegaNumber(rawLat, NaN);
  const lng = cleanStegaNumber(rawLng, NaN);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return [lat, lng];
}

/**
 * Sanitizes GPS coordinate pairs [lat, lng] for Leaflet maps, falling back to [0, 0].
 */
export function cleanStegaCoordinates(coords: unknown): [number, number] {
  return parseCoordinatePair(coords) ?? [0, 0];
}

/**
 * Sanitizes an array of GPS coordinate pairs for Leaflet polylines, skipping invalid entries.
 */
export function cleanStegaCoordinateArray(coordsList: unknown): [number, number][] {
  if (!Array.isArray(coordsList)) {
    return [];
  }

  const results: [number, number][] = [];
  for (const item of coordsList) {
    const pair = parseCoordinatePair(item);
    if (pair !== null) {
      results.push(pair);
    }
  }
  return results;
}
