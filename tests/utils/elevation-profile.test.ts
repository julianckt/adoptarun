import { describe, it, expect } from 'vitest';
import { buildElevationProfile } from '@/utils/elevation-profile';

/**
 * Seam: buildElevationProfile()
 *
 * Public contract: a Sanity `elevationProfile` JSON string in, a drawable
 * profile out (or null when there is nothing honest to draw).
 *
 * Expected values below are hand-worked from the fixture, never recomputed
 * the way the implementation computes them.
 */

// Four samples, 0 -> 3km, elevations 0 / 50 / 100 / 50.
// Chosen so every projected coordinate is a round number at 300 x 100.
const FIXTURE = JSON.stringify([
  { distance_km: 0, elevation_m: 0, lat: 22.2, lng: 114.1 },
  { distance_km: 1, elevation_m: 50, lat: 22.21, lng: 114.11 },
  { distance_km: 2, elevation_m: 100, lat: 22.22, lng: 114.12 },
  { distance_km: 3, elevation_m: 50, lat: 22.23, lng: 114.13 },
]);

const SIZE = { width: 300, height: 100 };

describe('buildElevationProfile', () => {
  describe('unusable input', () => {
    it('returns null for empty, missing, or malformed json', () => {
      expect(buildElevationProfile(undefined, SIZE)).toBeNull();
      expect(buildElevationProfile('', SIZE)).toBeNull();
      expect(buildElevationProfile('not json at all', SIZE)).toBeNull();
      expect(buildElevationProfile('{}', SIZE)).toBeNull();
    });

    it('returns null for an empty array', () => {
      expect(buildElevationProfile('[]', SIZE)).toBeNull();
    });

    it('returns null when no sample carries a usable elevation', () => {
      const noElevation = JSON.stringify([
        { distance_km: 0, lat: 22.2, lng: 114.1 },
        { distance_km: 1, lat: 22.21, lng: 114.11 },
      ]);
      expect(buildElevationProfile(noElevation, SIZE)).toBeNull();
    });
  });

  describe('projection', () => {
    it('spans the full width and reports hand-checked min and max', () => {
      const profile = buildElevationProfile(FIXTURE, SIZE);
      expect(profile).not.toBeNull();
      expect(profile!.minM).toBe(0);
      expect(profile!.maxM).toBe(100);
      expect(profile!.points).toHaveLength(4);

      // x spreads 0 -> 300 across a 3km route; y inverts elevation into the box.
      expect(profile!.points.map((p) => p.x)).toEqual([0, 100, 200, 300]);
      expect(profile!.points.map((p) => p.y)).toEqual([100, 50, 0, 50]);
    });

    it('opens the line path at the first sample and closes the area to the baseline', () => {
      const profile = buildElevationProfile(FIXTURE, SIZE)!;
      expect(profile.pathD).toBe('M0 100 L100 50 L200 0 L300 50');
      expect(profile.areaD).toBe('M0 100 L100 50 L200 0 L300 50 L300 100 L0 100 Z');
    });

    it('carries each sample through with its distance, elevation and position', () => {
      const profile = buildElevationProfile(FIXTURE, SIZE)!;
      expect(profile.points[1]).toEqual({
        km: 1,
        m: 50,
        lat: 22.21,
        lng: 114.11,
        x: 100,
        y: 50,
      });
    });
  });

  describe('degenerate profiles', () => {
    it('draws a dead-flat route along the baseline without dividing by zero', () => {
      const flat = JSON.stringify([
        { distance_km: 0, elevation_m: 7, lat: 22.2, lng: 114.1 },
        { distance_km: 2, elevation_m: 7, lat: 22.21, lng: 114.11 },
      ]);
      const profile = buildElevationProfile(flat, SIZE)!;
      expect(profile.minM).toBe(7);
      expect(profile.maxM).toBe(7);
      expect(profile.points.map((p) => p.y)).toEqual([100, 100]);
      expect(profile.points.map((p) => p.x)).toEqual([0, 300]);
    });

    it('places a single sample at the start of the baseline', () => {
      const single = JSON.stringify([
        { distance_km: 0, elevation_m: 12, lat: 22.2, lng: 114.1 },
      ]);
      const profile = buildElevationProfile(single, SIZE)!;
      expect(profile.points).toHaveLength(1);
      expect(profile.points[0].x).toBe(0);
      expect(profile.points[0].y).toBe(100);
      expect(profile.minM).toBe(12);
      expect(profile.maxM).toBe(12);
    });
  });

  describe('downsampling', () => {
    it('never exceeds maxPoints and keeps the first and last samples', () => {
      const many = JSON.stringify(
        Array.from({ length: 401 }, (_, i) => ({
          distance_km: i / 100,
          elevation_m: i,
          lat: 22.2 + i / 10000,
          lng: 114.1 + i / 10000,
        }))
      );
      const profile = buildElevationProfile(many, SIZE, { maxPoints: 50 })!;
      expect(profile.points.length).toBeLessThanOrEqual(50);
      expect(profile.points[0].km).toBe(0);
      expect(profile.points[profile.points.length - 1].km).toBe(4);
      // The true summit survives the thinning.
      expect(profile.maxM).toBe(400);
    });

    it('leaves a profile shorter than maxPoints untouched', () => {
      const profile = buildElevationProfile(FIXTURE, SIZE, { maxPoints: 50 })!;
      expect(profile.points).toHaveLength(4);
    });
  });

  it('accepts an already-parsed array as well as a json string', () => {
    const parsed = JSON.parse(FIXTURE);
    const profile = buildElevationProfile(parsed, SIZE)!;
    expect(profile.points).toHaveLength(4);
    expect(profile.maxM).toBe(100);
  });
});
