/**
 * Elevation profile geometry for the expanded route card.
 *
 * Sanity stores `elevationProfile` as a JSON string of sampled trackpoints.
 * This turns that into everything the card needs to draw the strip welded
 * under the map: an SVG line path, a closed area path, and the per-sample
 * payload the hover interaction reads to mark the matching point on the trace.
 */

/** A raw sample as written by the GPX parser into Sanity. */
interface RawElevationSample {
  distance_km?: number;
  elevation_m?: number;
  lat?: number;
  lng?: number;
}

/** A sample projected into the profile's own SVG box. */
export interface ElevationPoint {
  /** Distance along the route, in kilometres. */
  km: number;
  /** Elevation above sea level, in metres. */
  m: number;
  lat: number;
  lng: number;
  /** Horizontal position within the profile viewBox. */
  x: number;
  /** Vertical position within the profile viewBox; larger is lower. */
  y: number;
}

export interface ElevationProfile {
  /** Open path tracing the crest. */
  pathD: string;
  /** Same crest, closed down to the baseline for the colour fill. */
  areaD: string;
  points: ElevationPoint[];
  minM: number;
  maxM: number;
  /** Total route distance covered by the profile, in kilometres. */
  totalKm: number;
}

export interface ElevationProfileSize {
  width: number;
  height: number;
}

export interface ElevationProfileOptions {
  /**
   * Upper bound on rendered samples. Long trails arrive with thousands of
   * points, far past what a strip a few hundred pixels wide can show.
   */
  maxPoints?: number;
}

const DEFAULT_MAX_POINTS = 160;

/** Rounded to a tenth: enough precision for SVG, short enough to keep markup small. */
function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function isUsableSample(sample: unknown): sample is RawElevationSample {
  if (!sample || typeof sample !== 'object') return false;
  const { distance_km, elevation_m } = sample as RawElevationSample;
  return Number.isFinite(distance_km) && Number.isFinite(elevation_m);
}

/**
 * Thin an oversized profile down to `maxPoints` while keeping the first and
 * last samples, so the strip always starts and ends where the route does.
 */
function downsample<T>(samples: T[], maxPoints: number): T[] {
  if (samples.length <= maxPoints) return samples;
  if (maxPoints <= 2) return [samples[0], samples[samples.length - 1]];

  const kept: T[] = [];
  const step = (samples.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints - 1; i++) {
    kept.push(samples[Math.round(i * step)]);
  }
  kept.push(samples[samples.length - 1]);
  return kept;
}

/**
 * Build the drawable elevation profile, or null when the route carries no
 * usable elevation data.
 */
export function buildElevationProfile(
  source: string | unknown[] | undefined | null,
  size: ElevationProfileSize,
  options: ElevationProfileOptions = {}
): ElevationProfile | null {
  if (source === null || source === undefined || source === '') return null;

  let parsed: unknown;
  if (typeof source === 'string') {
    try {
      parsed = JSON.parse(source);
    } catch {
      return null;
    }
  } else {
    parsed = source;
  }

  if (!Array.isArray(parsed)) return null;

  const samples = parsed.filter(isUsableSample);
  if (samples.length === 0) return null;

  const thinned = downsample(samples, options.maxPoints ?? DEFAULT_MAX_POINTS);

  const elevations = thinned.map((s) => s.elevation_m as number);
  const minM = Math.min(...elevations);
  const maxM = Math.max(...elevations);
  const elevationSpan = maxM - minM;

  const distances = thinned.map((s) => s.distance_km as number);
  const startKm = distances[0];
  const totalKm = distances[distances.length - 1] - startKm;

  const { width, height } = size;

  const points: ElevationPoint[] = thinned.map((sample, index) => {
    // A single sample, or a route with no forward distance, sits at the start.
    const x = totalKm > 0 ? round(((distances[index] - startKm) / totalKm) * width) : 0;
    // A dead-flat route rides the baseline rather than floating mid-box.
    const y =
      elevationSpan > 0
        ? round(height - (((sample.elevation_m as number) - minM) / elevationSpan) * height)
        : height;

    return {
      km: sample.distance_km as number,
      m: sample.elevation_m as number,
      lat: sample.lat as number,
      lng: sample.lng as number,
      x,
      y,
    };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ');

  const first = points[0];
  const last = points[points.length - 1];
  const areaD = `${pathD} L${last.x} ${height} L${first.x} ${height} Z`;

  return { pathD, areaD, points, minM, maxM, totalKm: round(totalKm) };
}
