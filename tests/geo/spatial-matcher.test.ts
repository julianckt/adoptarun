import { describe, it, expect } from 'vitest';
import {
  verifySpatialMatch,
  distanceToSegmentMeters,
  distanceToPolylineMeters,
  sampleEquidistantPoints,
  type CandidateActivity,
  type CatalogRouteTarget,
} from '../../src/geo/spatial-matcher';
import { encodePolyline } from '../../src/geo/gpx-parser';

describe('3-Layer Spatial Verification Engine', () => {
  const refDate = new Date('2026-09-08T12:00:00Z');

  // Baseline catalog route: Central to Wan Chai Promenade (~5.0 km)
  const catalogRouteCoords: [number, number][] = [
    [22.2865, 114.155],
    [22.287, 114.158],
    [22.2875, 114.161],
    [22.288, 114.164],
    [22.2885, 114.167],
    [22.289, 114.17],
    [22.2895, 114.173],
    [22.29, 114.176],
    [22.2905, 114.179],
    [22.291, 114.182],
    [22.2915, 114.185],
  ];

  const catalogTarget: CatalogRouteTarget = {
    distanceKm: 5.0,
    routePolyline: encodePolyline(catalogRouteCoords),
    coordinates: catalogRouteCoords,
  };

  describe('Point-to-Polyline Geodetic Projections', () => {
    it('accurately computes distance from point to segment in meters', () => {
      // Segment from (22.2865, 114.1550) to (22.2865, 114.1650)
      // Point directly on segment midway
      const dZero = distanceToSegmentMeters(22.2865, 114.16, 22.2865, 114.155, 22.2865, 114.165);
      expect(dZero).toBeCloseTo(0, 0);

      // Point ~100m perpendicular north
      const d100 = distanceToSegmentMeters(22.2874, 114.16, 22.2865, 114.155, 22.2865, 114.165);
      expect(d100).toBeGreaterThan(80);
      expect(d100).toBeLessThan(120);
    });

    it('finds minimum distance to entire polyline', () => {
      const pointNearSegment: [number, number] = [22.2871, 114.158];
      const dist = distanceToPolylineMeters(pointNearSegment, catalogRouteCoords);
      expect(dist).toBeLessThan(50);
    });
  });

  describe('sampleEquidistantPoints', () => {
    it('samples exactly N points including start and end', () => {
      const sampled = sampleEquidistantPoints(catalogRouteCoords, 10);
      expect(sampled.length).toBe(10);
      expect(sampled[0]).toEqual(catalogRouteCoords[0]);
      expect(sampled[9]).toEqual(catalogRouteCoords[catalogRouteCoords.length - 1]);
    });
  });

  describe('Layer 1: Activity Type, GPS, and 20-Day Time Window', () => {
    it('accepts Run, TrailRun, Walk, Hike within 20 days', () => {
      const validTypes = ['Run', 'TrailRun', 'Walk', 'Hike', 'run', 'trailrun'];
      for (const type of validTypes) {
        const activity: CandidateActivity = {
          type,
          distanceKm: 5.0,
          startDate: new Date('2026-09-01T10:00:00Z'), // 7 days ago
          coordinates: catalogRouteCoords,
        };
        const result = verifySpatialMatch(activity, catalogTarget, { referenceDate: refDate });
        expect(result.layer1ActivityType.passed).toBe(true);
      }
    });

    it('rejects unsupported activity types (Ride, Swim, Workout)', () => {
      const invalidTypes = ['Ride', 'Swim', 'Workout', 'VirtualRide'];
      for (const type of invalidTypes) {
        const activity: CandidateActivity = {
          type,
          distanceKm: 5.0,
          startDate: new Date('2026-09-01T10:00:00Z'),
          coordinates: catalogRouteCoords,
        };
        const result = verifySpatialMatch(activity, catalogTarget, { referenceDate: refDate });
        expect(result.passed).toBe(false);
        expect(result.layer1ActivityType.passed).toBe(false);
        expect(result.reasons[0]).toContain('Invalid activity type');
      }
    });

    it('rejects activities without GPS streams', () => {
      const activity: CandidateActivity = {
        type: 'Run',
        distanceKm: 5.0,
        startDate: new Date('2026-09-01T10:00:00Z'),
        coordinates: [], // No GPS
      };
      const result = verifySpatialMatch(activity, catalogTarget, { referenceDate: refDate });
      expect(result.passed).toBe(false);
      expect(result.layer1ActivityType.hasGps).toBe(false);
    });

    it('accepts activity at the 20-day boundary and rejects beyond 20 days', () => {
      // 19.9 days ago (passed)
      const date20Days = new Date(refDate.getTime() - 19.9 * 24 * 60 * 60 * 1000);
      const act20: CandidateActivity = {
        type: 'Run',
        distanceKm: 5.0,
        startDate: date20Days,
        coordinates: catalogRouteCoords,
      };
      expect(verifySpatialMatch(act20, catalogTarget, { referenceDate: refDate }).layer1ActivityType.passed).toBe(true);

      // 21 days ago (failed)
      const date21Days = new Date(refDate.getTime() - 21 * 24 * 60 * 60 * 1000);
      const act21: CandidateActivity = {
        type: 'Run',
        distanceKm: 5.0,
        startDate: date21Days,
        coordinates: catalogRouteCoords,
      };
      const res21 = verifySpatialMatch(act21, catalogTarget, { referenceDate: refDate });
      expect(res21.passed).toBe(false);
      expect(res21.layer1ActivityType.timeWindowPassed).toBe(false);
    });
  });

  describe('Layer 2: Distance Tolerance (±40%)', () => {
    it('passes distance at exact ±40% boundaries', () => {
      // Target is 5.0km. Lower bound: 3.0km (-40%). Upper bound: 7.0km (+40%).
      const lowerBoundAct: CandidateActivity = {
        type: 'Run',
        distanceKm: 3.0,
        startDate: refDate,
        coordinates: catalogRouteCoords,
      };
      expect(verifySpatialMatch(lowerBoundAct, catalogTarget, { referenceDate: refDate }).layer2Distance.passed).toBe(true);

      const upperBoundAct: CandidateActivity = {
        type: 'Run',
        distanceKm: 7.0,
        startDate: refDate,
        coordinates: catalogRouteCoords,
      };
      expect(verifySpatialMatch(upperBoundAct, catalogTarget, { referenceDate: refDate }).layer2Distance.passed).toBe(true);
    });

    it('fails when distance exceeds ±40% tolerance', () => {
      // 2.9km (-42%) fails
      const tooShortAct: CandidateActivity = {
        type: 'Run',
        distanceKm: 2.9,
        startDate: refDate,
        coordinates: catalogRouteCoords,
      };
      const resShort = verifySpatialMatch(tooShortAct, catalogTarget, { referenceDate: refDate });
      expect(resShort.passed).toBe(false);
      expect(resShort.layer2Distance.passed).toBe(false);

      // 7.1km (+42%) fails
      const tooLongAct: CandidateActivity = {
        type: 'Run',
        distanceKm: 7.1,
        startDate: refDate,
        coordinates: catalogRouteCoords,
      };
      const resLong = verifySpatialMatch(tooLongAct, catalogTarget, { referenceDate: refDate });
      expect(resLong.passed).toBe(false);
      expect(resLong.layer2Distance.passed).toBe(false);
    });
  });

  describe('Layer 3: Start Point Proximity & 10-Point Trajectory', () => {
    it('passes when start point is within 0.40 * targetKm and trajectory matches >= 6/10', () => {
      // Identical track (10/10 matches, 0m start dist)
      const matchingAct: CandidateActivity = {
        type: 'Run',
        distanceKm: 5.1,
        startDate: refDate,
        coordinates: catalogRouteCoords,
      };
      const res = verifySpatialMatch(matchingAct, catalogTarget, { referenceDate: refDate });
      expect(res.passed).toBe(true);
      expect(res.confidenceScore).toBeGreaterThanOrEqual(0.9);
      expect(res.layer3Spatial.matchedPointsCount).toBe(10);
      expect(res.layer3Spatial.startPassed).toBe(true);
    });

    it('fails when start point is too far (> 0.40 * targetKm)', () => {
      // Catalog start is (22.2865, 114.1550).
      // Allowed radius = 0.40 * 5.0km = 2.0km.
      // Sha Tin start (22.38, 114.18) is ~10km away.
      const shiftedCoords = catalogRouteCoords.map(
        ([lat, lng]) => [lat + 0.1, lng] as [number, number]
      );

      const farStartAct: CandidateActivity = {
        type: 'Run',
        distanceKm: 5.0,
        startDate: refDate,
        coordinates: shiftedCoords,
      };
      const res = verifySpatialMatch(farStartAct, catalogTarget, { referenceDate: refDate });
      expect(res.passed).toBe(false);
      expect(res.layer3Spatial.startPassed).toBe(false);
    });

    it('passes when at least 6 out of 10 points are within 400m, but fails if only 5/10 match', () => {
      const sample10 = sampleEquidistantPoints(catalogRouteCoords, 10);

      // 6 points matching (indices 0..5), 4 points deviated > 400m (indices 6..9)
      const sixMatchCoords: [number, number][] = sample10.map(([lat, lng], idx) => {
        if (idx >= 6) {
          return [lat + 0.02, lng];
        }
        return [lat, lng];
      });

      const pass6Act: CandidateActivity = {
        type: 'Run',
        distanceKm: 5.0,
        startDate: refDate,
        coordinates: sixMatchCoords,
      };
      const res6 = verifySpatialMatch(pass6Act, catalogTarget, { referenceDate: refDate });
      expect(res6.layer3Spatial.matchedPointsCount).toBe(6);
      expect(res6.layer3Spatial.trajectoryPassed).toBe(true);
      expect(res6.passed).toBe(true);

      // 5 points matching (indices 0..4), 5 points deviated > 400m (indices 5..9)
      const fiveMatchCoords: [number, number][] = sample10.map(([lat, lng], idx) => {
        if (idx >= 5) {
          return [lat + 0.02, lng];
        }
        return [lat, lng];
      });

      const fail5Act: CandidateActivity = {
        type: 'Run',
        distanceKm: 5.0,
        startDate: refDate,
        coordinates: fiveMatchCoords,
      };
      const res5 = verifySpatialMatch(fail5Act, catalogTarget, { referenceDate: refDate });
      expect(res5.layer3Spatial.matchedPointsCount).toBe(5);
      expect(res5.layer3Spatial.trajectoryPassed).toBe(false);
      expect(res5.passed).toBe(false);
    });
  });

  describe('Spatial Bypass Policy Matrix', () => {
    it('returns passed: true, bypassed: true when bypassSpatial is set', () => {
      // Even if activity is swimming, 100 days old, and in another country!
      const crazyAct: CandidateActivity = {
        type: 'Swim',
        distanceKm: 42.0,
        startDate: new Date('2025-01-01T00:00:00Z'),
        coordinates: [[0, 0]],
      };

      const result = verifySpatialMatch(crazyAct, catalogTarget, { bypassSpatial: true });
      expect(result.passed).toBe(true);
      expect(result.bypassed).toBe(true);
      expect(result.confidenceScore).toBe(1.0);
      expect(result.reasons[0]).toContain('bypassed');
    });
  });

  describe('Audit: Boundary Conditions, Floating Point Precision & Edge Cases', () => {
    it('handles IEEE 754 floating point precision at exact +40% distance boundaries', () => {
      // 3.3km * 1.4 = 4.62km. In raw float math, (4.62 - 3.3) / 3.3 = 0.40000000000000013.
      const target3_3: CatalogRouteTarget = {
        distanceKm: 3.3,
        coordinates: catalogRouteCoords,
      };
      const act4_62: CandidateActivity = {
        type: 'Run',
        distanceKm: 4.62,
        startDate: refDate,
        coordinates: catalogRouteCoords,
      };
      const result3_3 = verifySpatialMatch(act4_62, target3_3, { referenceDate: refDate });
      expect(result3_3.layer2Distance.passed).toBe(true);

      // 5.5km * 1.4 = 7.7km
      const target5_5: CatalogRouteTarget = {
        distanceKm: 5.5,
        coordinates: catalogRouteCoords,
      };
      const act7_7: CandidateActivity = {
        type: 'Run',
        distanceKm: 7.7,
        startDate: refDate,
        coordinates: catalogRouteCoords,
      };
      const result5_5 = verifySpatialMatch(act7_7, target5_5, { referenceDate: refDate });
      expect(result5_5.layer2Distance.passed).toBe(true);
    });

    it('normalizes activity types with spaces, underscores, and mixed casing', () => {
      const types = ['Trail Run', 'trail_run', 'TRAILRUN', 'Walk', 'HIKE', '  run  '];
      for (const t of types) {
        const act: CandidateActivity = {
          type: t,
          distanceKm: 5.0,
          startDate: refDate,
          coordinates: catalogRouteCoords,
        };
        const res = verifySpatialMatch(act, catalogTarget, { referenceDate: refDate });
        expect(res.layer1ActivityType.passed).toBe(true);
      }
    });

    it('gracefully handles invalid start dates without producing NaN in reason messages', () => {
      const actInvalidDate: CandidateActivity = {
        type: 'Run',
        distanceKm: 5.0,
        startDate: 'not-a-valid-date',
        coordinates: catalogRouteCoords,
      };
      const res = verifySpatialMatch(actInvalidDate, catalogTarget, { referenceDate: refDate });
      expect(res.passed).toBe(false);
      expect(res.layer1ActivityType.timeWindowPassed).toBe(false);
      expect(res.layer1ActivityType.reason).toBe('Invalid activity start date.');
      expect(res.reasons).toContain('Invalid activity start date.');
      expect(res.layer1ActivityType.daysAgo).toBe(0);
    });

    it('correctly decodes activity from summaryPolyline instead of raw coordinates', () => {
      const actPolyline: CandidateActivity = {
        type: 'Run',
        distanceKm: 5.0,
        startDate: refDate,
        summaryPolyline: encodePolyline(catalogRouteCoords),
      };
      const res = verifySpatialMatch(actPolyline, catalogTarget, { referenceDate: refDate });
      expect(res.passed).toBe(true);
      expect(res.layer1ActivityType.hasGps).toBe(true);
      expect(res.layer3Spatial.matchedPointsCount).toBe(10);
    });

    it('handles missing catalog route coordinates cleanly', () => {
      const emptyCatalog: CatalogRouteTarget = {
        distanceKm: 5.0,
        coordinates: [],
      };
      const act: CandidateActivity = {
        type: 'Run',
        distanceKm: 5.0,
        startDate: refDate,
        coordinates: catalogRouteCoords,
      };
      const res = verifySpatialMatch(act, emptyCatalog, { referenceDate: refDate });
      expect(res.passed).toBe(false);
      expect(res.layer3Spatial.passed).toBe(false);
      expect(res.reasons).toContain('Catalog route coordinates or polyline are missing.');
    });

    it('strips Stega Unicode characters from summary polyline and activity fields', () => {
      const rawPolyline = encodePolyline(catalogRouteCoords);
      // Inject zero-width space characters (\u200B, \uFEFF)
      const stegaPolyline = `\u200B${rawPolyline.slice(0, 5)}\uFEFF${rawPolyline.slice(5)}`;
      const actStega: CandidateActivity = {
        type: 'Run\u200B',
        distanceKm: 5.0,
        startDate: refDate,
        summaryPolyline: stegaPolyline,
      };
      const res = verifySpatialMatch(actStega, catalogTarget, { referenceDate: refDate });
      expect(res.passed).toBe(true);
      expect(res.layer1ActivityType.passed).toBe(true);
      expect(res.layer3Spatial.matchedPointsCount).toBe(10);
    });
  });
});
