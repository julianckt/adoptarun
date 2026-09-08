import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  parseGpx,
  encodePolyline,
  decodePolyline,
  haversineDistance,
  generateMiniMapSvg,
  extractTrackpointsFromXml,
} from '../../src/geo/gpx-parser';

const FIXTURES_DIR = resolve(__dirname, '../fixtures/gpx');

describe('GPX Parser & Telemetry Module', () => {
  describe('haversineDistance', () => {
    it('calculates 0 distance for identical coordinates', () => {
      const dist = haversineDistance(22.28, 114.15, 22.28, 114.15);
      expect(dist).toBe(0);
    });

    it('accurately calculates distance between known Hong Kong coordinates', () => {
      // Central Pier to Wan Chai Ferry Pier (~1.5 km)
      const dist = haversineDistance(22.2865, 114.155, 22.281, 114.173);
      expect(dist).toBeGreaterThan(1.5);
      expect(dist).toBeLessThan(2.5);
    });
  });

  describe('Google Encoded Polyline algorithm', () => {
    it('encodes and decodes coordinates with high fidelity (reversibility)', () => {
      const originalCoords: [number, number][] = [
        [22.2865, 114.155],
        [22.287, 114.156],
        [22.2878, 114.1575],
        [22.2885, 114.159],
      ];

      const encoded = encodePolyline(originalCoords);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = decodePolyline(encoded);
      expect(decoded.length).toBe(originalCoords.length);

      for (let i = 0; i < originalCoords.length; i++) {
        expect(decoded[i][0]).toBeCloseTo(originalCoords[i][0], 5);
        expect(decoded[i][1]).toBeCloseTo(originalCoords[i][1], 5);
      }
    });

    it('handles empty coordinates safely', () => {
      expect(encodePolyline([])).toBe('');
      expect(decodePolyline('')).toEqual([]);
    });
  });

  describe('generateMiniMapSvg', () => {
    it('generates valid SVG path markup', () => {
      const coords: [number, number][] = [
        [22.28, 114.15],
        [22.29, 114.16],
        [22.3, 114.17],
      ];

      const svg = generateMiniMapSvg(coords);
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 100 100"');
      expect(svg).toContain('<path d="M');
      expect(svg).toContain('</svg>');
    });

    it('handles empty coords without crashing', () => {
      const svg = generateMiniMapSvg([]);
      expect(svg).toContain('<svg');
      expect(svg).toContain('<path d=""');
    });
  });

  describe('extractTrackpointsFromXml', () => {
    it('extracts trackpoints with lat, lon, elevation, and timestamps', () => {
      const xml = readFileSync(resolve(FIXTURES_DIR, 'garmin-sample.gpx'), 'utf-8');
      const pts = extractTrackpointsFromXml(xml);

      expect(pts.length).toBe(11);
      expect(pts[0].lat).toBeCloseTo(22.2865, 4);
      expect(pts[0].lon).toBeCloseTo(114.155, 4);
      expect(pts[0].ele).toBe(5.2);
      expect(pts[0].time?.toISOString()).toBe('2026-09-01T07:00:00.000Z');
    });
  });

  describe('Multi-Vendor GPX Fixture Ingestion', () => {
    it('parses Garmin Connect GPX with extensions', () => {
      const xml = readFileSync(resolve(FIXTURES_DIR, 'garmin-sample.gpx'), 'utf-8');
      const result = parseGpx(xml);

      expect(result.trackpointCount).toBe(11);
      expect(result.distanceKm).toBeGreaterThan(1.5);
      expect(result.distanceKm).toBeLessThan(3.0);
      expect(result.elevationGain).toBeGreaterThan(0);
      expect(result.movingTimeSeconds).toBeGreaterThan(100);
      expect(result.avgPaceMinPerKm).toBeGreaterThan(0);
      expect(result.routePolyline.length).toBeGreaterThan(10);
      expect(result.miniMapSvg).toContain('<svg');
      expect(result.elevationProfile.length).toBe(11);
      expect(result.startTime).toBe('2026-09-01T07:00:00.000Z');
      expect(result.endTime).toBe('2026-09-01T07:04:40.000Z');
    });

    it('parses Apple Fitness GPX export', () => {
      const xml = readFileSync(resolve(FIXTURES_DIR, 'apple-fitness-sample.gpx'), 'utf-8');
      const result = parseGpx(xml);

      expect(result.trackpointCount).toBe(6);
      expect(result.distanceKm).toBeGreaterThan(0.5);
      expect(result.elevationGain).toBe(8); // (12.5-10) + (15-12.5) + (18-15) = 8
      expect(result.movingTimeSeconds).toBe(150); // 5 intervals * 30s
      expect(result.routePolyline).toBeTruthy();
    });

    it('parses Strava GPX export', () => {
      const xml = readFileSync(resolve(FIXTURES_DIR, 'strava-sample.gpx'), 'utf-8');
      const result = parseGpx(xml);

      expect(result.trackpointCount).toBe(8);
      expect(result.distanceKm).toBeGreaterThan(1.0);
      expect(result.elevationGain).toBeGreaterThan(0);
      expect(result.startTime).toBe('2026-09-03T08:15:00.000Z');
    });

    it('parses Coros GPX export', () => {
      const xml = readFileSync(resolve(FIXTURES_DIR, 'coros-sample.gpx'), 'utf-8');
      const result = parseGpx(xml);

      expect(result.trackpointCount).toBe(5);
      expect(result.distanceKm).toBeGreaterThan(0.5);
      expect(result.elevationGain).toBe(1); // rounded 1m
      expect(result.routePolyline).toBeTruthy();
    });
  });

  describe('Stega Sanitization Integration', () => {
    it('cleans invisible Stega Unicode characters before computing coordinates and telemetry', () => {
      // Inject zero-width space (\u200B) and BOM (\uFEFF) into numerical attributes
      const stegaXml = `
        <gpx version="1.1">
          <trk><trkseg>
            <trkpt lat="22.\u200B2865" lon="114.\uFEFF1550">
              <ele>5.\u200C2</ele>
              <time>2026-09-01T07:00:00Z</time>
            </trkpt>
            <trkpt lat="22.2870\u200D" lon="114.1560">
              <ele>7.0</ele>
              <time>2026-09-01T07:00:30Z</time>
            </trkpt>
          </trkseg></trk>
        </gpx>
      `;

      const result = parseGpx(stegaXml);
      expect(result.trackpointCount).toBe(2);
      expect(result.distanceKm).toBeGreaterThan(0);
      expect(result.coordinates[0][0]).toBeCloseTo(22.2865, 4);
      expect(result.coordinates[0][1]).toBeCloseTo(114.155, 4);
    });

    it('strips Stega characters inside decodePolyline cleanly', () => {
      const originalCoords: [number, number][] = [
        [22.2865, 114.155],
        [22.287, 114.156],
      ];
      const encoded = encodePolyline(originalCoords);
      const stegaEncoded = `\u200B${encoded.slice(0, 3)}\uFEFF${encoded.slice(3)}`;
      const decoded = decodePolyline(stegaEncoded);
      expect(decoded.length).toBe(2);
      expect(decoded[0][0]).toBeCloseTo(originalCoords[0][0], 5);
      expect(decoded[0][1]).toBeCloseTo(originalCoords[0][1], 5);
    });
  });

  describe('Audit: Multi-Vendor Format Resilience & Edge Cases', () => {
    it('parses GPX with XML namespace prefixes (e.g. gpx:trkpt, gpx:ele)', () => {
      const namespacedXml = `
        <gpx:gpx xmlns:gpx="http://www.topografix.com/GPX/1/1" version="1.1">
          <gpx:trk>
            <gpx:trkseg>
              <gpx:trkpt lat="22.2865" lon="114.1550">
                <gpx:ele>10.5</gpx:ele>
                <gpx:time>2026-09-01T07:00:00Z</gpx:time>
              </gpx:trkpt>
              <gpx:trkpt lat="22.2875" lon="114.1565">
                <gpx:ele>12.0</gpx:ele>
                <gpx:time>2026-09-01T07:00:30Z</gpx:time>
              </gpx:trkpt>
            </gpx:trkseg>
          </gpx:trk>
        </gpx:gpx>
      `;
      const result = parseGpx(namespacedXml);
      expect(result.trackpointCount).toBe(2);
      expect(result.elevationGain).toBe(2); // 1.5 rounded to 2
      expect(result.movingTimeSeconds).toBe(30);
    });

    it('parses XML attributes with whitespace and attributes on ele and time tags', () => {
      const spacedXml = `
        <gpx version="1.1">
          <trk><trkseg>
            <trkpt lat = "22.2865" lon = "114.1550">
              <ele units="m">15.0</ele>
              <time zone="UTC">2026-09-01T07:00:00Z</time>
            </trkpt>
            <trkpt lat = '22.2875' lon = '114.1565'>
              <ele units="m">20.0</ele>
              <time zone="UTC">2026-09-01T07:00:30Z</time>
            </trkpt>
          </trkseg></trk>
        </gpx>
      `;
      const result = parseGpx(spacedXml);
      expect(result.trackpointCount).toBe(2);
      expect(result.elevationGain).toBe(5);
    });

    it('handles smart recording intervals (e.g. 45s intervals) in moving time', () => {
      const smartXml = `
        <gpx version="1.1">
          <trk><trkseg>
            <trkpt lat="22.2865" lon="114.1550">
              <time>2026-09-01T07:00:00Z</time>
            </trkpt>
            <trkpt lat="22.2875" lon="114.1565">
              <time>2026-09-01T07:00:45Z</time>
            </trkpt>
            <trkpt lat="22.2885" lon="114.1580">
              <time>2026-09-01T07:01:30Z</time>
            </trkpt>
          </trkseg></trk>
        </gpx>
      `;
      const result = parseGpx(smartXml);
      expect(result.trackpointCount).toBe(3);
      expect(result.movingTimeSeconds).toBe(90); // 45s + 45s
    });

    it('handles GPX without timestamps gracefully with estimated default pace and duration', () => {
      const noTimeXml = `
        <gpx version="1.1">
          <trk><trkseg>
            <trkpt lat="22.2865" lon="114.1550"><ele>10</ele></trkpt>
            <trkpt lat="22.2875" lon="114.1565"><ele>15</ele></trkpt>
          </trkseg></trk>
        </gpx>
      `;
      const result = parseGpx(noTimeXml);
      expect(result.movingTimeSeconds).toBe(0);
      expect(result.avgPaceMinPerKm).toBe(0);
      expect(result.estimatedDurationMin).toBe(Math.round(result.distanceKm * 6));
      expect(result.startTime).toBeNull();
      expect(result.endTime).toBeNull();
    });

    it('safeguards maxElevationPoints with small or invalid values', () => {
      const xml = readFileSync(resolve(FIXTURES_DIR, 'garmin-sample.gpx'), 'utf-8');
      const result = parseGpx(xml, { maxElevationPoints: 1 });
      expect(result.elevationProfile.length).toBeGreaterThanOrEqual(2);
    });

    it('correctly computes flat routes with zero elevation gain', () => {
      const flatXml = `
        <gpx version="1.1">
          <trk><trkseg>
            <trkpt lat="22.2865" lon="114.1550"><ele>5.0</ele></trkpt>
            <trkpt lat="22.2875" lon="114.1565"><ele>5.0</ele></trkpt>
            <trkpt lat="22.2885" lon="114.1580"><ele>5.0</ele></trkpt>
          </trkseg></trk>
        </gpx>
      `;
      const result = parseGpx(flatXml);
      expect(result.elevationGain).toBe(0);
      expect(result.elevationProfile.every((p) => p.elevation_m === 5)).toBe(true);
    });
  });

  describe('Error Handling & Boundary Conditions', () => {
    it('throws when encountering corrupted or invalid GPX without trackpoints', () => {
      const corrupted = readFileSync(resolve(FIXTURES_DIR, 'corrupted-sample.gpx'), 'utf-8');
      expect(() => parseGpx(corrupted)).toThrow('No valid GPS trackpoints found in GPX file');
    });

    it('throws when passed empty string or non-string', () => {
      expect(() => parseGpx('')).toThrow('Invalid GPX input: string required');
      expect(() => parseGpx(null as any)).toThrow('Invalid GPX input: string required');
    });
  });
});
