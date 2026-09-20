import { describe, it, expect } from 'vitest';
import {
  calculateImpact,
  formatImpactDisplay,
  getRouteAdoptionUrl,
  IMPACT_TIER_PRESETS,
} from '@/utils/charity-utils';

describe('charity-utils', () => {
  describe('calculateImpact', () => {
    it('calculates rounded impact units based on amount and multiplier', () => {
      expect(calculateImpact(100, 0.3)).toBe(30);
      expect(calculateImpact(300, 0.3)).toBe(90);
      expect(calculateImpact(500, 0.3)).toBe(150);
      expect(calculateImpact(1000, 0.3)).toBe(300);
    });

    it('rounds fractional results to nearest integer', () => {
      expect(calculateImpact(100, 0.333)).toBe(33);
      expect(calculateImpact(100, 0.336)).toBe(34);
      expect(calculateImpact(0, 0.5)).toBe(0);
    });

    it('handles negative or invalid values gracefully', () => {
      expect(calculateImpact(-50, 0.3)).toBe(0);
      expect(calculateImpact(100, -0.3)).toBe(0);
      expect(calculateImpact(NaN, 0.3)).toBe(0);
    });
  });

  describe('formatImpactDisplay', () => {
    const template = 'Every HK${amount} saves {impact} dogs from being eaten';

    it('substitutes {amount} and {impact} correctly', () => {
      const result = formatImpactDisplay(template, 300, 0.3);
      expect(result).toBe('Every HK$300 saves 90 dogs from being eaten');
    });

    it('formats numbers with comma separators for large amounts', () => {
      const result = formatImpactDisplay(template, 1000, 0.3);
      expect(result).toBe('Every HK$1,000 saves 300 dogs from being eaten');
    });

    it('handles alternative templates with different tokens ordering', () => {
      const altTemplate = 'HK${amount} funds {impact} days of shelter care';
      expect(formatImpactDisplay(altTemplate, 500, 0.1)).toBe(
        'HK$500 funds 50 days of shelter care'
      );
    });

    it('handles missing template gracefully with a sensible fallback', () => {
      expect(formatImpactDisplay('', 100, 0.3)).toBe('HK$100 generates 30 impact units');
    });
  });

  describe('getRouteAdoptionUrl', () => {
    it('returns /signup with charity query param when slug is provided', () => {
      expect(getRouteAdoptionUrl('spca')).toBe('/signup?charity=spca');
      expect(getRouteAdoptionUrl('hong-kong-dog-rescue')).toBe(
        '/signup?charity=hong-kong-dog-rescue'
      );
    });

    it('encodes URI components in charity slug', () => {
      expect(getRouteAdoptionUrl('spca & friends')).toBe('/signup?charity=spca%20%26%20friends');
    });

    it('falls back to /signup if slug is empty or undefined', () => {
      expect(getRouteAdoptionUrl('')).toBe('/signup');
      expect(getRouteAdoptionUrl(undefined)).toBe('/signup');
    });
  });

  describe('IMPACT_TIER_PRESETS', () => {
    it('contains standard monetary donation tiers [100, 300, 500, 1000]', () => {
      expect(IMPACT_TIER_PRESETS).toEqual([100, 300, 500, 1000]);
    });
  });
});
