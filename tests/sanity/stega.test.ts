import { describe, it, expect } from 'vitest';
import {
  cleanStega,
  cleanStegaNumber,
  cleanStegaCoordinates,
  cleanStegaCoordinateArray,
} from '../../src/sanity/cleanStega';

describe('Sanity Stega & Telemetry Sanitization Helper', () => {
  // Stega zero-width Unicode characters
  const zwsp = '\u200B';
  const zwnj = '\u200C';
  const zwj = '\u200D';
  const ltr = '\u200E';
  const rtl = '\u200F';
  const lre = '\u202A';
  const rle = '\u202B';
  const pdf = '\u202C';
  const lro = '\u202D';
  const rlo = '\u202E';
  const wj = '\u2060';
  const bom = '\uFEFF';
  const musical1 = '\u{1D173}';
  const musical2 = '\u{1D17A}';

  const stegaNoise = `${zwsp}${zwnj}${zwj}${ltr}${rtl}${lre}${rle}${pdf}${lro}${rlo}${wj}${bom}${musical1}${musical2}`;

  describe('cleanStega()', () => {
    it('returns primitives (number, boolean, null, undefined) untouched', () => {
      expect(cleanStega(null)).toBe(null);
      expect(cleanStega(undefined)).toBe(undefined);
      expect(cleanStega(42)).toBe(42);
      expect(cleanStega(true)).toBe(true);
      expect(cleanStega(false)).toBe(false);
    });

    it('strips Stega zero-width and invisible characters from strings', () => {
      const dirty = `Adopt${zwsp} a${bom} Run${musical1}`;
      expect(cleanStega(dirty)).toBe('Adopt a Run');
    });

    it('strips Stega characters across multiline strings', () => {
      const dirtyMultiline = `Line 1${stegaNoise}\nLine 2${zwsp}\r\nLine 3`;
      expect(cleanStega(dirtyMultiline)).toBe('Line 1\nLine 2\r\nLine 3');
    });

    it('preserves valid multilingual Unicode (Traditional Chinese, accented characters, emojis)', () => {
      const validText = `香港 🏃 跑出希望！Café & Crème brûlée — 100% 💖 ${zwsp}`;
      expect(cleanStega(validText)).toBe('香港 🏃 跑出希望！Café & Crème brûlée — 100% 💖 ');
    });

    it('recursively cleans arrays of strings and nested structures', () => {
      const dirtyArray = [
        `Route 1${zwsp}`,
        [`Nested${bom}`, `Deep${musical2}`],
        42,
        null,
      ];
      const cleaned = cleanStega(dirtyArray);
      expect(cleaned).toEqual([
        'Route 1',
        ['Nested', 'Deep'],
        42,
        null,
      ]);
      // Original array not mutated
      expect(dirtyArray[0]).toContain(zwsp);
    });

    it('recursively cleans object properties without mutating original', () => {
      const dirtyObj = {
        title: `Wan Chai Loop${zwsp}`,
        slug: { current: `wan-chai-loop${bom}` },
        distance: 12.5,
        tags: [`urban${rtl}`, `scenic${ltr}`],
      };
      const cleaned = cleanStega(dirtyObj);
      expect(cleaned).toEqual({
        title: 'Wan Chai Loop',
        slug: { current: 'wan-chai-loop' },
        distance: 12.5,
        tags: ['urban', 'scenic'],
      });
      expect(dirtyObj.title).toContain(zwsp);
    });
  });

  describe('cleanStegaNumber()', () => {
    it('returns clean numbers as is', () => {
      expect(cleanStegaNumber(12.5)).toBe(12.5);
      expect(cleanStegaNumber(0)).toBe(0);
      expect(cleanStegaNumber(-45)).toBe(-45);
    });

    it('strips Stega characters from stringified numbers', () => {
      const dirtyNum = `${zwsp}12.5${bom}`;
      expect(cleanStegaNumber(dirtyNum)).toBe(12.5);
    });

    it('handles numbers with units attached like "12.5km" or "250m"', () => {
      const dirtyKm = `${zwsp}12.5${bom}km`;
      expect(cleanStegaNumber(dirtyKm)).toBe(12.5);

      const dirtyElevation = `${musical1}250${zwj}m`;
      expect(cleanStegaNumber(dirtyElevation)).toBe(250);
    });

    it('handles fallback value when input is null, undefined, or invalid', () => {
      expect(cleanStegaNumber(null, 0)).toBe(0);
      expect(cleanStegaNumber(undefined, 10)).toBe(10);
      expect(cleanStegaNumber('invalid_text', 5)).toBe(5);
      expect(cleanStegaNumber('invalid_text')).toBe(0);
    });
  });

  describe('cleanStegaCoordinates()', () => {
    it('parses and cleans a valid [lat, lng] number array', () => {
      const coords: [number, number] = [22.3193, 114.1694];
      expect(cleanStegaCoordinates(coords)).toEqual([22.3193, 114.1694]);
    });

    it('parses and cleans stega-polluted string coordinates', () => {
      const dirtyCoords = [`${zwsp}22.3193${bom}`, `${musical1}114.1694${zwj}`];
      expect(cleanStegaCoordinates(dirtyCoords)).toEqual([22.3193, 114.1694]);
    });

    it('parses lat/lng object format', () => {
      const objCoords = { lat: `${zwsp}22.28${bom}`, lng: 114.15 };
      expect(cleanStegaCoordinates(objCoords)).toEqual([22.28, 114.15]);
    });

    it('returns [0, 0] fallback for malformed coordinate inputs', () => {
      expect(cleanStegaCoordinates(null)).toEqual([0, 0]);
      expect(cleanStegaCoordinates('not-coords')).toEqual([0, 0]);
      expect(cleanStegaCoordinates([22.3])).toEqual([0, 0]);
    });
  });

  describe('cleanStegaCoordinateArray()', () => {
    it('cleans an array of polyline coordinate pairs', () => {
      const rawPolyline = [
        [`${zwsp}22.28${bom}`, `${musical1}114.15`],
        [22.29, 114.16],
        { lat: `${zwj}22.30`, lng: `${bom}114.17` },
      ];
      const cleaned = cleanStegaCoordinateArray(rawPolyline);
      expect(cleaned).toEqual([
        [22.28, 114.15],
        [22.29, 114.16],
        [22.30, 114.17],
      ]);
    });

    it('returns empty array if input is not an array', () => {
      expect(cleanStegaCoordinateArray(null)).toEqual([]);
      expect(cleanStegaCoordinateArray(undefined)).toEqual([]);
      expect(cleanStegaCoordinateArray('string')).toEqual([]);
    });

    it('skips invalid coordinate entries in the array', () => {
      const mixedArray = [
        [22.28, 114.15],
        null,
        'invalid',
        [22.29, 114.16],
      ];
      const cleaned = cleanStegaCoordinateArray(mixedArray);
      expect(cleaned).toEqual([
        [22.28, 114.15],
        [22.29, 114.16],
      ]);
    });
  });
});
