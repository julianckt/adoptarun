import { decodePolyline, haversineDistance } from './gpx-parser';
import { cleanStegaNumber, cleanStegaString } from '../sanity/cleanStega';

export const VALID_ACTIVITY_TYPES = ['run', 'trailrun', 'walk', 'hike'] as const;
export const MAX_LOOKBACK_DAYS = 20;
export const DISTANCE_TOLERANCE_PERCENT = 0.4; // ±40%
export const START_RADIUS_PERCENT = 0.4; // 0.40 * targetKm
export const TRAJECTORY_SAMPLE_POINTS = 10;
export const TRAJECTORY_PASS_MIN_MATCHES = 6;
export const TRAJECTORY_PROXIMITY_METERS = 400; // 400m

export interface CandidateActivity {
  type: string;
  distanceKm: number;
  startDate: string | Date;
  summaryPolyline?: string;
  coordinates?: [number, number][];
}

export interface CatalogRouteTarget {
  distanceKm: number;
  routePolyline?: string;
  coordinates?: [number, number][];
}

export interface SpatialVerificationOptions {
  referenceDate?: Date;
  bypassSpatial?: boolean;
}

export interface SpatialVerificationResult {
  passed: boolean;
  bypassed?: boolean;
  confidenceScore: number;
  layer1ActivityType: {
    passed: boolean;
    activityType: string;
    hasGps: boolean;
    daysAgo: number;
    timeWindowPassed: boolean;
    reason?: string;
  };
  layer2Distance: {
    passed: boolean;
    userKm: number;
    targetKm: number;
    deviationPercent: number;
    tolerancePercent: number;
    reason?: string;
  };
  layer3Spatial: {
    passed: boolean;
    startDistanceMeters: number;
    startRadiusMeters: number;
    startPassed: boolean;
    matchedPointsCount: number;
    totalSamplePoints: number;
    trajectoryPassed: boolean;
    pointDistancesMeters: number[];
    reason?: string;
  };
  reasons: string[];
}

/**
 * Calculates minimum distance in meters from point P to line segment AB.
 */
export function distanceToSegmentMeters(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  if (aLat === bLat && aLng === bLng) {
    return haversineDistance(pLat, pLng, aLat, aLng) * 1000;
  }

  // Local equirectangular projection
  const midLatRad = ((aLat + bLat) / 2) * (Math.PI / 180);
  const cosLat = Math.cos(midLatRad);

  const dx = (bLng - aLng) * cosLat;
  const dy = bLat - aLat;
  const segLenSq = dx * dx + dy * dy;

  if (segLenSq === 0) {
    return haversineDistance(pLat, pLng, aLat, aLng) * 1000;
  }

  const px = (pLng - aLng) * cosLat;
  const py = pLat - aLat;

  // Projection scalar clamped to [0, 1]
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / segLenSq));

  const projLat = aLat + t * (bLat - aLat);
  const projLng = aLng + t * (bLng - aLng);

  return haversineDistance(pLat, pLng, projLat, projLng) * 1000;
}

/**
 * Calculates minimum distance in meters from point P to an entire polyline.
 */
export function distanceToPolylineMeters(
  point: [number, number],
  polyline: [number, number][]
): number {
  if (!polyline || polyline.length === 0) return Infinity;
  if (polyline.length === 1) {
    return haversineDistance(point[0], point[1], polyline[0][0], polyline[0][1]) * 1000;
  }

  let minDistance = Infinity;
  for (let i = 1; i < polyline.length; i++) {
    const d = distanceToSegmentMeters(
      point[0],
      point[1],
      polyline[i - 1][0],
      polyline[i - 1][1],
      polyline[i][0],
      polyline[i][1]
    );
    if (d < minDistance) {
      minDistance = d;
      if (minDistance === 0) break;
    }
  }

  return minDistance;
}

/**
 * Samples N equidistant coordinates along a trajectory.
 */
export function sampleEquidistantPoints(
  coordinates: [number, number][],
  sampleCount: number = TRAJECTORY_SAMPLE_POINTS
): [number, number][] {
  if (!coordinates || coordinates.length === 0) return [];
  if (coordinates.length <= sampleCount) return [...coordinates];

  const sampled: [number, number][] = [];
  const step = (coordinates.length - 1) / (sampleCount - 1);

  for (let i = 0; i < sampleCount; i++) {
    const index = Math.min(Math.round(i * step), coordinates.length - 1);
    sampled.push(coordinates[index]);
  }

  return sampled;
}

/**
 * Resolves coordinate array from either raw coordinates or encoded polyline string.
 */
export function resolveCoordinates(
  coordinates?: [number, number][],
  polylineString?: string
): [number, number][] {
  if (coordinates && coordinates.length > 0) {
    return coordinates;
  }
  if (polylineString) {
    return decodePolyline(polylineString);
  }
  return [];
}

/**
 * Executes the 3-layer spatial verification algorithm matching candidate Strava activities
 * against catalog route definitions.
 */
export function verifySpatialMatch(
  activity: CandidateActivity,
  targetRoute: CatalogRouteTarget,
  options: SpatialVerificationOptions = {}
): SpatialVerificationResult {
  const reasons: string[] = [];

  // Spatial Bypass Mode (Walk-In or Direct GPX File Upload)
  if (options.bypassSpatial) {
    return {
      passed: true,
      bypassed: true,
      confidenceScore: 1.0,
      layer1ActivityType: {
        passed: true,
        activityType: activity.type || 'WalkIn',
        hasGps: true,
        daysAgo: 0,
        timeWindowPassed: true,
      },
      layer2Distance: {
        passed: true,
        userKm: activity.distanceKm || targetRoute.distanceKm,
        targetKm: targetRoute.distanceKm,
        deviationPercent: 0,
        tolerancePercent: DISTANCE_TOLERANCE_PERCENT * 100,
      },
      layer3Spatial: {
        passed: true,
        startDistanceMeters: 0,
        startRadiusMeters: targetRoute.distanceKm * START_RADIUS_PERCENT * 1000,
        startPassed: true,
        matchedPointsCount: TRAJECTORY_SAMPLE_POINTS,
        totalSamplePoints: TRAJECTORY_SAMPLE_POINTS,
        trajectoryPassed: true,
        pointDistancesMeters: Array(TRAJECTORY_SAMPLE_POINTS).fill(0),
      },
      reasons: ['Spatial verification bypassed by policy (walk-in or GPX upload).'],
    };
  }

  // --- Layer 1: Activity Type, GPS & Time Window ---
  const normalizedType = cleanStegaString(activity.type || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
  const isAllowedType = (VALID_ACTIVITY_TYPES as readonly string[]).includes(normalizedType);

  const userCoords = resolveCoordinates(activity.coordinates, activity.summaryPolyline);
  const hasGps = userCoords.length >= 2;

  const refDate = options.referenceDate || new Date();
  const actDate =
    activity.startDate instanceof Date
      ? activity.startDate
      : new Date(activity.startDate);

  const isValidDate = !Number.isNaN(actDate.getTime());
  const diffMs = isValidDate ? refDate.getTime() - actDate.getTime() : NaN;
  const daysAgo = isValidDate ? diffMs / (1000 * 60 * 60 * 24) : NaN;
  // Allow up to 20 days lookback and up to 1 day clock skew into the future
  const timeWindowPassed = isValidDate && daysAgo >= -1 && daysAgo <= MAX_LOOKBACK_DAYS;

  const layer1Passed = isAllowedType && hasGps && timeWindowPassed;

  let layer1Reason: string | undefined;
  if (!isAllowedType) {
    layer1Reason = `Invalid activity type '${activity.type}'. Must be Run, TrailRun, Walk, or Hike.`;
    reasons.push(layer1Reason);
  } else if (!hasGps) {
    layer1Reason = 'Activity lacks GPS polyline stream.';
    reasons.push(layer1Reason);
  } else if (!isValidDate) {
    layer1Reason = 'Invalid activity start date.';
    reasons.push(layer1Reason);
  } else if (!timeWindowPassed) {
    layer1Reason = `Activity is outside the 20-day time window (${daysAgo.toFixed(1)} days ago).`;
    reasons.push(layer1Reason);
  }

  // --- Layer 2: Distance Tolerance (±40%) ---
  const userKm = cleanStegaNumber(activity.distanceKm, 0);
  const targetKm = cleanStegaNumber(targetRoute.distanceKm, 0);

  let deviationPercent = 1;
  let layer2Passed = false;
  let layer2Reason: string | undefined;

  // Epsilon for IEEE 754 floating-point accuracy at tolerance boundary
  const EPSILON = 1e-7;

  if (targetKm > 0) {
    deviationPercent = Math.abs(userKm - targetKm) / targetKm;
    layer2Passed = deviationPercent <= DISTANCE_TOLERANCE_PERCENT + EPSILON;
  }

  if (!layer2Passed) {
    layer2Reason = `Distance ${userKm}km deviates by ${(deviationPercent * 100).toFixed(1)}% from target ${targetKm}km (exceeds ±${DISTANCE_TOLERANCE_PERCENT * 100}%).`;
    reasons.push(layer2Reason);
  }

  // --- Layer 3: Start Point Proximity & 10-Point Trajectory ---
  const catalogCoords = resolveCoordinates(targetRoute.coordinates, targetRoute.routePolyline);

  let startDistanceMeters = Infinity;
  const startRadiusMeters = targetKm * START_RADIUS_PERCENT * 1000;
  let startPassed = false;
  let trajectoryPassed = false;
  let matchedPointsCount = 0;
  const pointDistancesMeters: number[] = [];
  let layer3Reason: string | undefined;

  if (catalogCoords.length === 0) {
    layer3Reason = 'Catalog route coordinates or polyline are missing.';
    reasons.push(layer3Reason);
  } else if (userCoords.length > 0) {
    const userStart = userCoords[0];
    const catalogStart = catalogCoords[0];

    const startDistKm = haversineDistance(
      userStart[0],
      userStart[1],
      catalogStart[0],
      catalogStart[1]
    );
    startDistanceMeters = Math.round(startDistKm * 1000);
    // Epsilon tolerance of 1 millimeter for floating-point boundary checks
    startPassed = startDistKm <= targetKm * START_RADIUS_PERCENT + 1e-6;

    // 10 equidistant sample points from user route checked against catalog polyline
    const samplePoints = sampleEquidistantPoints(userCoords, TRAJECTORY_SAMPLE_POINTS);

    for (const point of samplePoints) {
      const dMeters = Math.round(distanceToPolylineMeters(point, catalogCoords));
      pointDistancesMeters.push(dMeters);
      if (dMeters <= TRAJECTORY_PROXIMITY_METERS) {
        matchedPointsCount++;
      }
    }

    trajectoryPassed = matchedPointsCount >= TRAJECTORY_PASS_MIN_MATCHES;
  }

  const layer3Passed = startPassed && trajectoryPassed;

  if (catalogCoords.length > 0) {
    if (!startPassed) {
      const msg = `Start point is ${startDistanceMeters}m away from route start (allowed radius: ${Math.round(startRadiusMeters)}m).`;
      layer3Reason = msg;
      reasons.push(msg);
    }
    if (!trajectoryPassed) {
      const msg = `Trajectory match failed: ${matchedPointsCount}/${TRAJECTORY_SAMPLE_POINTS} points within ${TRAJECTORY_PROXIMITY_METERS}m (required >= ${TRAJECTORY_PASS_MIN_MATCHES}).`;
      layer3Reason = layer3Reason ? `${layer3Reason}; ${msg}` : msg;
      reasons.push(msg);
    }
  }

  // Overall Decision & Confidence Score Calculation
  const passed = layer1Passed && layer2Passed && layer3Passed;

  let confidenceScore = 0;
  if (passed) {
    const trajectoryScore = matchedPointsCount / TRAJECTORY_SAMPLE_POINTS; // 0.6 to 1.0
    const distanceScore = Math.max(0, 1 - deviationPercent); // 0.6 to 1.0
    confidenceScore = Number((trajectoryScore * 0.7 + distanceScore * 0.3).toFixed(2));
  } else {
    const trajectoryPartial = (matchedPointsCount / TRAJECTORY_SAMPLE_POINTS) * 0.4;
    const distancePartial = Math.max(0, 1 - Math.min(deviationPercent, 1)) * 0.3;
    confidenceScore = Number((trajectoryPartial + distancePartial).toFixed(2));
  }

  return {
    passed,
    confidenceScore,
    layer1ActivityType: {
      passed: layer1Passed,
      activityType: activity.type,
      hasGps,
      daysAgo: Number.isNaN(daysAgo) ? 0 : Number(daysAgo.toFixed(1)),
      timeWindowPassed,
      reason: layer1Reason,
    },
    layer2Distance: {
      passed: layer2Passed,
      userKm,
      targetKm,
      deviationPercent: Number((deviationPercent * 100).toFixed(1)),
      tolerancePercent: DISTANCE_TOLERANCE_PERCENT * 100,
      reason: layer2Reason,
    },
    layer3Spatial: {
      passed: layer3Passed,
      startDistanceMeters,
      startRadiusMeters: Math.round(startRadiusMeters),
      startPassed,
      matchedPointsCount,
      totalSamplePoints: TRAJECTORY_SAMPLE_POINTS,
      trajectoryPassed,
      pointDistancesMeters,
      reason: layer3Reason,
    },
    reasons,
  };
}
