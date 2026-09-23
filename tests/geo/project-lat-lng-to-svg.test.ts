import { describe, it, expect } from 'vitest';
import {
  projectLatLngToSvg,
  calculateAspectBoundingBox,
  generateMiniMapWithBasemapSvg,
} from '@/geo/gpx-parser';

/**
 * Seam: projectLatLngToSvg()
 *
 * The expanded card's hover dot has to land on the same trace the stored
 * miniMapSvg already drew. This is the shared projection that guarantees it.
 */

const MINI_MAP_WIDTH = 356;
const MINI_MAP_HEIGHT = 216;

// A square bounding box, so every expected coordinate is exact by hand.
const BBOX = { minLat: 22.2, maxLat: 22.4, minLng: 114.1, maxLng: 114.3 };

describe('projectLatLngToSvg', () => {
  it('maps the bounding box corners onto the viewBox corners', () => {
    // North-west corner: leftmost x, topmost y (latitude increases upwards,
    // SVG y increases downwards).
    expect(projectLatLngToSvg(BBOX.maxLat, BBOX.minLng, BBOX, 356, 216)).toEqual([0, 0]);
    // South-east corner: rightmost x, bottom y.
    expect(projectLatLngToSvg(BBOX.minLat, BBOX.maxLng, BBOX, 356, 216)).toEqual([356, 216]);
  });

  it('maps the centre of the box to the centre of the viewBox', () => {
    expect(projectLatLngToSvg(22.3, 114.2, BBOX, 356, 216)).toEqual([178, 108]);
  });

  it('maps a quarter point to a quarter of the box', () => {
    expect(projectLatLngToSvg(22.35, 114.15, BBOX, 356, 216)).toEqual([89, 54]);
  });

  it('defaults to the minimap dimensions', () => {
    expect(projectLatLngToSvg(22.3, 114.2, BBOX)).toEqual([178, 108]);
  });

  it('agrees with the coordinates generateMiniMapWithBasemapSvg writes into the trace', () => {
    const coordinates: [number, number][] = [
      [22.280742, 114.17684],
      [22.282329, 114.178282],
      [22.279605, 114.172414],
    ];

    const svg = generateMiniMapWithBasemapSvg(coordinates);
    const traceD = svg.match(/class="route-trace" d="([^"]+)"/)?.[1];
    expect(traceD).toBeTruthy();

    // Reproduce the trace independently through the exported projection.
    const bbox = calculateAspectBoundingBox(
      coordinates,
      MINI_MAP_WIDTH / MINI_MAP_HEIGHT,
      0.12
    );
    const rebuilt = coordinates
      .map(([lat, lng], index) => {
        const [x, y] = projectLatLngToSvg(lat, lng, bbox, MINI_MAP_WIDTH, MINI_MAP_HEIGHT);
        return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
      })
      .join(' ');

    expect(rebuilt).toBe(traceD);
  });
});
