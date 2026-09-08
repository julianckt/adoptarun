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

/**
 * Generates an SVG path and scalable markup (<svg viewBox="0 0 100 100">) from coordinate pairs.
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
