import { describe, it, expect } from 'vitest';
import {
  pickElevationIndex,
  setRouteParam,
  clearRouteParam,
  getRouteParam,
} from '@/utils/route-modal-state';

/**
 * Seam: pickElevationIndex()
 *
 * The elevation hover maths, kept out of the DOM so it can be specified
 * directly. Takes how far across the profile the pointer sits (0 to 1) and
 * returns which sample to mark on the trace.
 */

// Five samples at x = 0, 25, 50, 75, 100 across a 100-wide profile.
const POINTS = [0, 25, 50, 75, 100].map((x, i) => ({
  km: i,
  m: i * 10,
  lat: 22.2,
  lng: 114.1,
  x,
  y: 0,
}));

describe('pickElevationIndex', () => {
  it('returns the first sample at the far left and the last at the far right', () => {
    expect(pickElevationIndex(0, POINTS)).toBe(0);
    expect(pickElevationIndex(1, POINTS)).toBe(4);
  });

  it('returns the nearest sample for a ratio between two of them', () => {
    expect(pickElevationIndex(0.5, POINTS)).toBe(2);
    // 0.3 of 100 is x=30, nearest sample is x=25.
    expect(pickElevationIndex(0.3, POINTS)).toBe(1);
    // 0.4 of 100 is x=40, nearest sample is x=50.
    expect(pickElevationIndex(0.4, POINTS)).toBe(2);
  });

  it('clamps an out-of-range ratio instead of throwing or going out of bounds', () => {
    expect(pickElevationIndex(-0.5, POINTS)).toBe(0);
    expect(pickElevationIndex(1.5, POINTS)).toBe(4);
    expect(pickElevationIndex(Number.NaN, POINTS)).toBe(0);
  });

  it('returns -1 when there are no samples to pick from', () => {
    expect(pickElevationIndex(0.5, [])).toBe(-1);
  });

  it('always returns the only sample of a single-point profile', () => {
    const single = [POINTS[0]];
    expect(pickElevationIndex(0, single)).toBe(0);
    expect(pickElevationIndex(1, single)).toBe(0);
  });
});

/**
 * Seam: setRouteParam() / clearRouteParam() / getRouteParam()
 *
 * The catalogue already writes difficulty, region, sort and features to the
 * URL. The open route has to join and leave that query string without
 * disturbing any of them.
 */
describe('route deep-link params', () => {
  const FILTERED = '?difficulty=easy&region=kowloon&sort=longest&features=trail-running';

  describe('setRouteParam', () => {
    it('adds the route to an empty query string', () => {
      expect(setRouteParam('', 'wan-chai-dog')).toBe('?route=wan-chai-dog');
    });

    it('adds the route without disturbing live filters', () => {
      expect(setRouteParam(FILTERED, 'wan-chai-dog')).toBe(
        '?difficulty=easy&region=kowloon&sort=longest&features=trail-running&route=wan-chai-dog'
      );
    });

    it('replaces an existing route rather than appending a second one', () => {
      expect(setRouteParam('?route=whampoa-dog', 'wan-chai-dog')).toBe('?route=wan-chai-dog');
      expect(setRouteParam('?difficulty=easy&route=whampoa-dog', 'wan-chai-dog')).toBe(
        '?difficulty=easy&route=wan-chai-dog'
      );
    });

    it('accepts a query string with or without a leading question mark', () => {
      expect(setRouteParam('difficulty=easy', 'wan-chai-dog')).toBe(
        '?difficulty=easy&route=wan-chai-dog'
      );
    });
  });

  describe('clearRouteParam', () => {
    it('removes the route and leaves every filter in place', () => {
      expect(clearRouteParam(`${FILTERED}&route=wan-chai-dog`)).toBe(FILTERED);
    });

    it('returns an empty string when the route was the only parameter', () => {
      expect(clearRouteParam('?route=wan-chai-dog')).toBe('');
    });

    it('is a no-op when no route is present', () => {
      expect(clearRouteParam(FILTERED)).toBe(FILTERED);
      expect(clearRouteParam('')).toBe('');
    });
  });

  describe('getRouteParam', () => {
    it('reads the open route out of a filtered query string', () => {
      expect(getRouteParam(`${FILTERED}&route=wan-chai-dog`)).toBe('wan-chai-dog');
    });

    it('returns null when no route is set', () => {
      expect(getRouteParam(FILTERED)).toBeNull();
      expect(getRouteParam('')).toBeNull();
    });
  });
});
