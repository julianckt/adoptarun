import { cleanStegaNumber, cleanStegaString } from '../sanity/cleanStega';
import type { ElevationPoint } from '../db/types';

export type { ElevationPoint };

export interface GpxTrackpoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: Date;
}

export interface ParsedGpxResult {
  distanceKm: number;
  elevationGain: number;
  movingTimeSeconds: number;
  avgPaceMinPerKm: number;
  estimatedDurationMin: number;
  routePolyline: string;
  coordinates: [number, number][];
  elevationProfile: ElevationPoint[];
  elevationProfileJson: string;
  miniMapSvg: string;
  trackpointCount: number;
  startTime: string | null;
  endTime: string | null;
  basemapSource?: 'local-hk' | 'overpass' | 'none';
}

/**
 * Calculates great-circle distance between two geographic coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  return R * c;
}

/**
 * Encodes a single integer difference using Google Encoded Polyline zigzag encoding.
 */
function encodeNumber(val: number): string {
  let sgn = val < 0 ? ~(val << 1) : val << 1;
  let encoded = '';
  while (sgn >= 0x20) {
    encoded += String.fromCharCode((0x20 | (sgn & 0x1f)) + 63);
    sgn >>= 5;
  }
  encoded += String.fromCharCode(sgn + 63);
  return encoded;
}

/**
 * Encodes an array of [lat, lng] coordinates into a Google Encoded Polyline string ($10^5$ scaling).
 */
export function encodePolyline(coordinates: [number, number][]): string {
  if (!coordinates || coordinates.length === 0) return '';

  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const [lat, lng] of coordinates) {
    const latInt = Math.round(lat * 1e5);
    const lngInt = Math.round(lng * 1e5);

    const dLat = latInt - prevLat;
    const dLng = lngInt - prevLng;

    prevLat = latInt;
    prevLng = lngInt;

    encoded += encodeNumber(dLat) + encodeNumber(dLng);
  }

  return encoded;
}

/**
 * Decodes a Google Encoded Polyline string back into an array of [lat, lng] coordinates.
 */
export function decodePolyline(encoded: string): [number, number][] {
  if (!encoded) return [];
  const cleaned = cleanStegaString(encoded);
  if (!cleaned) return [];

  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < cleaned.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = cleaned.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20 && index < cleaned.length);

    const dLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    shift = 0;
    result = 0;

    do {
      b = cleaned.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20 && index < cleaned.length);

    const dLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export interface GeoBoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface BasemapData {
  roads: [number, number][][];
  water: [number, number][][];
}

/**
 * Approximate bounding box for the entire territory of Hong Kong.
 */
export const HK_BOUNDING_BOX: GeoBoundingBox = {
  minLat: 22.15,
  maxLat: 22.6,
  minLng: 113.8,
  maxLng: 114.45,
};

/**
 * Checks if a geographic bounding box is entirely within Hong Kong territory.
 */
export function isWithinHongKong(bbox: GeoBoundingBox): boolean {
  return (
    bbox.minLat >= HK_BOUNDING_BOX.minLat &&
    bbox.maxLat <= HK_BOUNDING_BOX.maxLat &&
    bbox.minLng >= HK_BOUNDING_BOX.minLng &&
    bbox.maxLng <= HK_BOUNDING_BOX.maxLng
  );
}

export interface CompactWay {
  b: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
  p: string; // Google encoded polyline
}

export interface HkBasemapDataset {
  version: number;
  generatedAt?: string;
  bbox: [number, number, number, number];
  roads: CompactWay[];
  water: CompactWay[];
}

let hkDatasetCache: HkBasemapDataset | null = null;

export function clearHkBasemapCache(): void {
  hkDatasetCache = null;
}

export function setHkBasemapDataset(dataset: HkBasemapDataset | null): void {
  hkDatasetCache = dataset;
}

export function isValidHkDataset(data: any): data is HkBasemapDataset {
  return Boolean(
    data &&
      typeof data === 'object' &&
      Array.isArray(data.roads) &&
      Array.isArray(data.water)
  );
}

export interface LoadHkBasemapOptions {
  datasetUrl?: string;
  datasetFetchFn?: typeof fetch;
}

/**
 * Loads the pre-processed Hong Kong basemap dataset.
 * Supports browser fetch (with static studio fallback) and Node.js file system reading for tests/build.
 */
export async function loadHkBasemapDataset(
  options: LoadHkBasemapOptions = {}
): Promise<HkBasemapDataset | null> {
  if (hkDatasetCache) {
    return hkDatasetCache;
  }

  const { datasetUrl = '/data/hk-basemap.json', datasetFetchFn } = options;

  // 1. Node.js environment (tests, scripts, SSR) - read directly from disk if not explicitly given a custom fetch function
  if (!datasetFetchFn && typeof process !== 'undefined' && process.versions?.node) {
    try {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const candidates = [
        path.resolve(process.cwd(), 'static/data/hk-basemap.json'),
        path.resolve(process.cwd(), 'public/data/hk-basemap.json'),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf-8');
          const parsed = JSON.parse(content);
          if (isValidHkDataset(parsed)) {
            hkDatasetCache = parsed;
            return hkDatasetCache;
          }
        }
      }
    } catch {
      // Fall through to fetch if filesystem read failed
    }
  }

  // 2. Fetch via datasetFetchFn or global fetch in browser/web worker
  const activeFetch = datasetFetchFn || (typeof fetch !== 'undefined' ? fetch : undefined);
  if (activeFetch) {
    try {
      let res = await activeFetch(datasetUrl);
      if (!res.ok && !datasetUrl.startsWith('http')) {
        res = await activeFetch(`https://adoptarun.sanity.studio${datasetUrl.startsWith('/') ? '' : '/'}${datasetUrl}`);
      }
      if (res && res.ok) {
        const parsed = await res.json();
        if (isValidHkDataset(parsed)) {
          hkDatasetCache = parsed;
          return hkDatasetCache;
        }
      }
    } catch (err) {
      console.warn('Could not load local Hong Kong basemap dataset via fetch:', err);
    }
  }

  return null;
}

/**
 * Fast in-memory spatial bounding box query against the pre-processed HK basemap dataset.
 * Intersects road and water bounding boxes and decodes only the matching polylines.
 */
export function queryHkBasemapFromDataset(
  dataset: HkBasemapDataset,
  bbox: GeoBoundingBox
): BasemapData {
  const roads: [number, number][][] = [];
  const water: [number, number][][] = [];

  if (Array.isArray(dataset.roads)) {
    for (let i = 0; i < dataset.roads.length; i++) {
      const b = dataset.roads[i].b;
      // Bounding box intersection check
      if (!(b[1] > bbox.maxLng || b[3] < bbox.minLng || b[0] > bbox.maxLat || b[2] < bbox.minLat)) {
        const coords = decodePolyline(dataset.roads[i].p);
        if (coords.length > 1) {
          roads.push(coords);
        }
      }
    }
  }

  if (Array.isArray(dataset.water)) {
    for (let i = 0; i < dataset.water.length; i++) {
      const b = dataset.water[i].b;
      if (!(b[1] > bbox.maxLng || b[3] < bbox.minLng || b[0] > bbox.maxLat || b[2] < bbox.minLat)) {
        const coords = decodePolyline(dataset.water[i].p);
        if (coords.length > 1) {
          water.push(coords);
        }
      }
    }
  }

  return { roads, water };
}

/**
 * Calculates a bounding box expanded to match a target aspect ratio (e.g. 356:216 for RouteCard)
 * with geographic metric projection scaling (cos(meanLat)) and padding.
 */
export function calculateAspectBoundingBox(
  coordinates: [number, number][],
  targetAspectRatio = 356 / 216,
  paddingRatio = 0.1
): GeoBoundingBox {
  if (!coordinates || coordinates.length === 0) {
    return { minLat: 0, maxLat: 0.01, minLng: 0, maxLng: 0.01 * targetAspectRatio };
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of coordinates) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const rawLatSpan = Math.max(maxLat - minLat, 0.0005);
  const rawLngSpan = Math.max(maxLng - minLng, 0.0005);
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Metric projection scaling using mean latitude
  const radLat = (centerLat * Math.PI) / 180;
  const cosLat = Math.max(0.1, Math.cos(radLat));

  const rawMetricW = rawLngSpan * cosLat;
  const rawMetricH = rawLatSpan;

  // Add padding
  const paddedW = rawMetricW * (1 + 2 * paddingRatio);
  const paddedH = rawMetricH * (1 + 2 * paddingRatio);

  let targetMetricW: number;
  let targetMetricH: number;

  if (paddedW / paddedH < targetAspectRatio) {
    // Height is constraining
    targetMetricH = paddedH;
    targetMetricW = paddedH * targetAspectRatio;
  } else {
    // Width is constraining
    targetMetricW = paddedW;
    targetMetricH = paddedW / targetAspectRatio;
  }

  const finalLngSpan = targetMetricW / cosLat;
  const finalLatSpan = targetMetricH;

  return {
    minLat: centerLat - finalLatSpan / 2,
    maxLat: centerLat + finalLatSpan / 2,
    minLng: centerLng - finalLngSpan / 2,
    maxLng: centerLng + finalLngSpan / 2,
  };
}

function projectCoordinate(
  lat: number,
  lng: number,
  bbox: GeoBoundingBox,
  width = 356,
  height = 216
): [number, number] {
  const lngSpan = bbox.maxLng - bbox.minLng;
  const latSpan = bbox.maxLat - bbox.minLat;
  const x = Number((((lng - bbox.minLng) / lngSpan) * width).toFixed(1));
  const y = Number(((1 - (lat - bbox.minLat) / latSpan) * height).toFixed(1));
  return [x, y];
}

function coordinatesToPathD(
  coords: [number, number][],
  bbox: GeoBoundingBox,
  width = 356,
  height = 216
): string {
  if (!coords || coords.length === 0) return '';
  let d = '';
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = projectCoordinate(coords[i][0], coords[i][1], bbox, width, height);
    d += i === 0 ? `M${x} ${y}` : ` L${x} ${y}`;
  }
  return d;
}

/**
 * Generates full-bleed SVG markup (viewBox="0 0 356 216") embedding OpenStreetMap
 * simplified road and water ways behind a pure-line route trace.
 */
export function generateMiniMapWithBasemapSvg(
  coordinates: [number, number][],
  basemap?: BasemapData,
  width = 356,
  height = 216
): string {
  if (!coordinates || coordinates.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none"><path d=""/></svg>`;
  }

  const bbox = calculateAspectBoundingBox(coordinates, width / height, 0.12);

  let waterPaths = '';
  if (basemap?.water && basemap.water.length > 0) {
    for (const way of basemap.water) {
      const d = coordinatesToPathD(way, bbox, width, height);
      if (d) waterPaths += `<path d="${d}"/>`;
    }
  }

  let roadPaths = '';
  if (basemap?.roads && basemap.roads.length > 0) {
    for (const way of basemap.roads) {
      const d = coordinatesToPathD(way, bbox, width, height);
      if (d) roadPaths += `<path d="${d}"/>`;
    }
  }

  const traceD = coordinatesToPathD(coordinates, bbox, width, height);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">`,
    `  <style>`,
    `    .route-basemap path { stroke: rgba(255, 251, 249, 0.14); stroke-width: 0.8; fill: none; stroke-linecap: round; stroke-linejoin: round; }`,
    `    .route-water path { stroke: rgba(255, 251, 249, 0.22); fill: rgba(255, 251, 249, 0.05); }`,
    `    .route-trace { stroke: var(--route-trace-color, rgb(245, 174, 102)); stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }`,
    `  </style>`,
    waterPaths ? `  <g class="route-water">${waterPaths}</g>` : '',
    roadPaths ? `  <g class="route-basemap">${roadPaths}</g>` : '',
    `  <path class="route-trace" d="${traceD}"/>`,
    `</svg>`,
  ]
    .filter(Boolean)
    .join('\n');
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const basemapCache = new Map<string, BasemapData>();

export function clearBasemapCache(): void {
  basemapCache.clear();
}

export interface FetchOsmBasemapOptions {
  fetchFn?: typeof fetch;
  timeoutMs?: number;
  bypassCache?: boolean;
}

/**
 * Queries OpenStreetMap Overpass API for road networks and water boundaries within the bounding box.
 * Enforces in-memory caching and a strict failure policy.
 */
export async function fetchOsmBasemap(
  bbox: GeoBoundingBox,
  options: FetchOsmBasemapOptions = {}
): Promise<BasemapData> {
  const { fetchFn = fetch, timeoutMs = 8000, bypassCache = false } = options;

  // Round bbox to ~4 decimal places for stable cache keys (~11 meters)
  const cacheKey = `${bbox.minLat.toFixed(4)},${bbox.minLng.toFixed(4)},${bbox.maxLat.toFixed(4)},${bbox.maxLng.toFixed(4)}`;

  if (!bypassCache && basemapCache.has(cacheKey)) {
    return basemapCache.get(cacheKey)!;
  }

  // Overpass QL bounding box format: (south,west,north,east)
  const bboxStr = `${bbox.minLat.toFixed(6)},${bbox.minLng.toFixed(6)},${bbox.maxLat.toFixed(6)},${bbox.maxLng.toFixed(6)}`;

  const query = `[out:json][timeout:8];(way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|pedestrian|footway|cycleway|path)$"](${bboxStr});way["natural"="coastline"](${bboxStr});way["waterway"~"^(river|canal|stream)$"](${bboxStr}););out geom;`;

  let signal: any = undefined;
  let timer: any = null;

  try {
    if (typeof AbortSignal !== 'undefined' && typeof (AbortSignal as any).timeout === 'function') {
      signal = (AbortSignal as any).timeout(timeoutMs);
    } else if (typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(), timeoutMs);
      signal = controller.signal;
    }
  } catch {
    // Ignore signal creation errors in non-standard runtimes
  }

  const requestInit: RequestInit = {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  if (signal) {
    requestInit.signal = signal;
  }

  try {
    let response: Response;
    try {
      response = await fetchFn(OVERPASS_URL, requestInit);
    } catch (fetchErr: any) {
      if (fetchErr?.message && fetchErr.message.includes('AbortSignal')) {
        delete requestInit.signal;
        response = await fetchFn(OVERPASS_URL, requestInit);
      } else {
        throw new Error(`Failed to fetch OpenStreetMap basemap (${fetchErr?.message || fetchErr})`);
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenStreetMap basemap (${response.status} ${response.statusText})`);
    }

    const data = (await response.json()) as any;
    const elements = data?.elements || [];

    const roads: [number, number][][] = [];
    const water: [number, number][][] = [];

    for (const el of elements) {
      if (el.type === 'way' && Array.isArray(el.geometry) && el.geometry.length > 1) {
        const wayCoords: [number, number][] = el.geometry.map((pt: any) => [pt.lat, pt.lon]);
        if (el.tags?.highway) {
          roads.push(wayCoords);
        } else if (el.tags?.natural === 'coastline' || el.tags?.waterway) {
          water.push(wayCoords);
        }
      }
    }

    const result: BasemapData = { roads, water };
    basemapCache.set(cacheKey, result);
    return result;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Failed to fetch OpenStreetMap basemap (Connection timed out)');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generates a legacy 100x100 square SVG path markup from coordinate pairs.
 */
export function generateMiniMapSvg(coordinates: [number, number][]): string {
  if (!coordinates || coordinates.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d=""/></svg>';
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of coordinates) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  // If track is a single point or flat line, provide a default span
  const safeLatSpan = latSpan > 0.000001 ? latSpan : 0.001;
  const safeLngSpan = lngSpan > 0.000001 ? lngSpan : 0.001;

  // Aspect ratio scaling centered in a 10-90 box (80x80 usable space)
  const maxSpan = Math.max(safeLatSpan, safeLngSpan);
  const padding = 10;
  const usable = 80;

  const latOffset = (maxSpan - safeLatSpan) / 2;
  const lngOffset = (maxSpan - safeLngSpan) / 2;

  let pathD = '';
  for (let i = 0; i < coordinates.length; i++) {
    const [lat, lng] = coordinates[i];
    // Map lng to x (10 to 90)
    const normX = ((lng - minLng + lngOffset) / maxSpan) * usable + padding;
    // Map lat to y (in SVG, y increases downwards, whereas lat increases northwards)
    const normY = (1 - (lat - minLat + latOffset) / maxSpan) * usable + padding;

    const x = Number(normX.toFixed(1));
    const y = Number(normY.toFixed(1));

    if (i === 0) {
      pathD += `M${x} ${y}`;
    } else {
      pathD += ` L${x} ${y}`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="${pathD}"/></svg>`;
}

export interface ParseGpxWithBasemapOptions extends ParseGpxOptions, FetchOsmBasemapOptions {
  preferLocalHkBasemap?: boolean;
  hkDataset?: HkBasemapDataset;
  datasetUrl?: string;
}

/**
 * Parses raw GPX XML and asynchronously enriches it with an OpenStreetMap vector basemap.
 * Prioritizes pre-processed local Hong Kong dataset when route is within HK bounds,
 * falling back seamlessly to OpenStreetMap Overpass API, and finally to route-only SVG.
 */
export async function parseGpxWithBasemap(
  gpxXml: string,
  options: ParseGpxWithBasemapOptions = {}
): Promise<ParsedGpxResult> {
  const baseResult = parseGpx(gpxXml, options);
  const bbox = calculateAspectBoundingBox(baseResult.coordinates, 356 / 216, 0.12);

  let basemap: BasemapData | null = null;
  let basemapSource: 'local-hk' | 'overpass' | 'none' = 'none';

  // 1. Try local Hong Kong dataset if route is within HK bounds
  const preferLocal = options.preferLocalHkBasemap !== false;
  if (preferLocal && isWithinHongKong(bbox)) {
    try {
      const dataset = options.hkDataset || (await loadHkBasemapDataset(options));
      if (dataset) {
        const localData = queryHkBasemapFromDataset(dataset, bbox);
        if (localData.roads.length > 0 || localData.water.length > 0) {
          basemap = localData;
          basemapSource = 'local-hk';
        }
      }
    } catch (localErr) {
      console.warn('Local HK basemap query failed, falling back to Overpass API:', localErr);
    }
  }

  // 2. Fallback to Overpass API if not resolved locally
  if (!basemap) {
    basemap = await fetchOsmBasemap(bbox, options);
    basemapSource = 'overpass';
  }

  // 3. Render vector basemap SVG (or fallback to clean route-only SVG)
  const miniMapSvg = basemap
    ? generateMiniMapWithBasemapSvg(baseResult.coordinates, basemap)
    : generateMiniMapSvg(baseResult.coordinates);

  return {
    ...baseResult,
    miniMapSvg,
    basemapSource,
  };
}

/**
 * Extracts trackpoints from GPX XML text with zero dependencies.
 * Handles namespaces, single/double quotes, `<ele>`, and `<time>`.
 */
export function extractTrackpointsFromXml(gpxXml: string): GpxTrackpoint[] {
  const cleanedXml = cleanStegaString(gpxXml);
  const trackpoints: GpxTrackpoint[] = [];

  // Match point tags: <trkpt>, <rtept>, or <wpt>, with optional XML namespace prefix
  const pointRegex = /<(?:[a-zA-Z0-9_]+:)?(?:trkpt|rtept|wpt)\b([^>]*?)(?:\/>|>(.*?)<\/(?:[a-zA-Z0-9_]+:)?(?:trkpt|rtept|wpt)>)/gis;
  let match: RegExpExecArray | null;

  while ((match = pointRegex.exec(cleanedXml)) !== null) {
    const attributes = match[1];
    const innerContent = match[2] || '';

    // Extract lat & lon (or lng) with optional whitespace around '='
    const latMatch = attributes.match(/\blat\s*=\s*["']([^"']+)["']/i);
    const lonMatch = attributes.match(/\b(?:lon|lng)\s*=\s*["']([^"']+)["']/i);

    if (!latMatch || !lonMatch) continue;

    const lat = cleanStegaNumber(latMatch[1], NaN);
    const lon = cleanStegaNumber(lonMatch[1], NaN);

    if (Number.isNaN(lat) || Number.isNaN(lon)) continue;

    const point: GpxTrackpoint = { lat, lon };

    // Extract elevation, supporting optional XML namespace and attributes
    const eleMatch = innerContent.match(/<(?:[a-zA-Z0-9_]+:)?ele\b[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_]+:)?ele>/i);
    if (eleMatch) {
      const ele = cleanStegaNumber(eleMatch[1], NaN);
      if (!Number.isNaN(ele)) {
        point.ele = ele;
      }
    }

    // Extract time, supporting optional XML namespace and attributes
    const timeMatch = innerContent.match(/<(?:[a-zA-Z0-9_]+:)?time\b[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_]+:)?time>/i);
    if (timeMatch) {
      const date = new Date(timeMatch[1].trim());
      if (!Number.isNaN(date.getTime())) {
        point.time = date;
      }
    }

    trackpoints.push(point);
  }

  return trackpoints;
}

export interface ParseGpxOptions {
  maxElevationPoints?: number;
}

/**
 * Parses raw GPX XML string and returns comprehensive telemetry, encoded polyline,
 * elevation profile JSON, and mini-map SVG markup.
 */
export function parseGpx(
  gpxXml: string,
  options: ParseGpxOptions = {}
): ParsedGpxResult {
  if (!gpxXml || typeof gpxXml !== 'string') {
    throw new Error('Invalid GPX input: string required');
  }

  const trackpoints = extractTrackpointsFromXml(gpxXml);

  if (trackpoints.length === 0) {
    throw new Error('No valid GPS trackpoints found in GPX file');
  }

  const coordinates: [number, number][] = trackpoints.map((p) => [p.lat, p.lon]);
  const cumulativeDistances: number[] = [0];
  let totalDistanceKm = 0;
  let elevationGain = 0;
  let movingTimeSeconds = 0;

  for (let i = 1; i < trackpoints.length; i++) {
    const prev = trackpoints[i - 1];
    const curr = trackpoints[i];

    const segDist = haversineDistance(prev.lat, prev.lon, curr.lat, curr.lon);
    totalDistanceKm += segDist;
    cumulativeDistances.push(totalDistanceKm);

    // Elevation Gain
    if (curr.ele !== undefined && prev.ele !== undefined) {
      const dEle = curr.ele - prev.ele;
      if (dEle > 0) {
        elevationGain += dEle;
      }
    }

    // Moving Time: dt <= 120 seconds and speed > 0.5 km/h to filter pauses while accommodating smart recording
    if (curr.time && prev.time) {
      const dt = (curr.time.getTime() - prev.time.getTime()) / 1000;
      if (dt > 0 && dt <= 120) {
        const speedKmh = (segDist * 1000 / dt) * 3.6;
        if (speedKmh > 0.5) {
          movingTimeSeconds += dt;
        }
      }
    }
  }

  // Fallback for moving time if timestamps exist but intervals were outside window
  const firstTime = trackpoints[0]?.time;
  const lastTime = trackpoints[trackpoints.length - 1]?.time;

  if (movingTimeSeconds === 0 && firstTime && lastTime) {
    const elapsed = (lastTime.getTime() - firstTime.getTime()) / 1000;
    if (elapsed > 0) {
      movingTimeSeconds = elapsed;
    }
  }

  const distanceKm = Number(totalDistanceKm.toFixed(2));
  const roundedElevationGain = Math.round(elevationGain);

  const avgPaceMinPerKm =
    distanceKm > 0 && movingTimeSeconds > 0
      ? Number(((movingTimeSeconds / 60) / distanceKm).toFixed(2))
      : 0;

  const estimatedDurationMin =
    movingTimeSeconds > 0
      ? Math.round(movingTimeSeconds / 60)
      : Math.round(distanceKm * 6); // default 6 min/km

  const routePolyline = encodePolyline(coordinates);
  const miniMapSvg = generateMiniMapSvg(coordinates);

  // Generate elevation profile points
  const maxPoints = Math.max(2, options.maxElevationPoints || 100);
  const elevationProfile: ElevationPoint[] = [];

  if (trackpoints.length <= maxPoints) {
    for (let i = 0; i < trackpoints.length; i++) {
      elevationProfile.push({
        distance_km: Number(cumulativeDistances[i].toFixed(2)),
        elevation_m: Math.round(trackpoints[i].ele ?? 0),
        lat: trackpoints[i].lat,
        lng: trackpoints[i].lon,
      });
    }
  } else {
    // Downsample evenly while preserving endpoints
    const step = (trackpoints.length - 1) / (maxPoints - 1);
    for (let i = 0; i < maxPoints; i++) {
      const idx = Math.min(Math.round(i * step), trackpoints.length - 1);
      elevationProfile.push({
        distance_km: Number(cumulativeDistances[idx].toFixed(2)),
        elevation_m: Math.round(trackpoints[idx].ele ?? 0),
        lat: trackpoints[idx].lat,
        lng: trackpoints[idx].lon,
      });
    }
  }

  return {
    distanceKm,
    elevationGain: roundedElevationGain,
    movingTimeSeconds: Math.round(movingTimeSeconds),
    avgPaceMinPerKm,
    estimatedDurationMin,
    routePolyline,
    coordinates,
    elevationProfile,
    elevationProfileJson: JSON.stringify(elevationProfile),
    miniMapSvg,
    trackpointCount: trackpoints.length,
    startTime: firstTime ? firstTime.toISOString() : null,
    endTime: lastTime ? lastTime.toISOString() : null,
  };
}
