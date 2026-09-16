import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRoutes,
  getCharities,
  getSettings,
  getSiteCopy,
  getRouteBySlug,
  getCharityBySlug,
  getCacheTimestamp,
} from '../../src/sanity/queries';
import { getFallbackStatus, resetFallbackStatus } from '../../src/sanity/fallbackState';
import sanityCache from '../../src/data/sanity-cache.json';

describe('Sanity Query Cache Fallback & Telemetry', () => {
  beforeEach(() => {
    resetFallbackStatus();
    vi.restoreAllMocks();
  });

  it('exposes a valid snapshot timestamp from sanity-cache.json', () => {
    const timestamp = getCacheTimestamp();
    expect(timestamp).toBeDefined();
    expect(new Date(timestamp!).getTime()).not.toBeNaN();
  });

  describe('Live Fetch Success', () => {
    it('returns live routes when Sanity client fetch succeeds', async () => {
      const mockLiveRoutes = [{ _id: 'live-1', _type: 'route', title: 'Live Route' }];
      const mockClient = {
        fetch: vi.fn().mockResolvedValue(mockLiveRoutes),
      } as any;

      const result = await getRoutes(mockClient);
      expect(result).toEqual(mockLiveRoutes);
      expect(getFallbackStatus().hasFallback).toBe(false);
    });

    it('returns live charities when Sanity client fetch succeeds', async () => {
      const mockLiveCharities = [{ _id: 'live-charity', _type: 'charity', name: 'Live SPCA' }];
      const mockClient = {
        fetch: vi.fn().mockResolvedValue(mockLiveCharities),
      } as any;

      const result = await getCharities(mockClient);
      expect(result).toEqual(mockLiveCharities);
      expect(getFallbackStatus().hasFallback).toBe(false);
    });
  });

  describe('Live Fetch Failure & Cache Fallback', () => {
    it('falls back to cached routes and records fallback event when client.fetch throws', async () => {
      const mockClient = {
        fetch: vi.fn().mockRejectedValue(new Error('Sanity 503 Network Gateway Timeout')),
      } as any;

      const result = await getRoutes(mockClient);
      expect(result).toEqual(sanityCache.data.routes);

      const status = getFallbackStatus();
      expect(status.hasFallback).toBe(true);
      expect(status.events).toHaveLength(1);
      expect(status.events[0].queryName).toBe('getRoutes');
      expect(status.events[0].errorMessage).toContain('Sanity 503');
    });

    it('falls back to cached charities and records fallback event when client.fetch throws', async () => {
      const mockClient = {
        fetch: vi.fn().mockRejectedValue(new Error('Connection refused')),
      } as any;

      const result = await getCharities(mockClient);
      expect(result).toEqual(sanityCache.data.charities);

      const status = getFallbackStatus();
      expect(status.hasFallback).toBe(true);
      expect(status.events[0].queryName).toBe('getCharities');
    });

    it('falls back to cached settings when client.fetch throws', async () => {
      const mockClient = {
        fetch: vi.fn().mockRejectedValue(new Error('Auth failure')),
      } as any;

      const result = await getSettings(mockClient);
      expect(result).toEqual(sanityCache.data.settings);
      expect(getFallbackStatus().hasFallback).toBe(true);
    });

    it('falls back to cached siteCopy when client.fetch throws', async () => {
      const mockClient = {
        fetch: vi.fn().mockRejectedValue(new Error('Rate limited')),
      } as any;

      const result = await getSiteCopy(mockClient);
      expect(result).toEqual(sanityCache.data.siteCopy);
      expect(getFallbackStatus().hasFallback).toBe(true);
    });

    it('finds single route by slug from cache when client.fetch throws', async () => {
      const firstRouteSlug = sanityCache.data.routes[0]?.slug?.current;
      if (!firstRouteSlug) return;

      const mockClient = {
        fetch: vi.fn().mockRejectedValue(new Error('Network error')),
      } as any;

      const result = await getRouteBySlug(firstRouteSlug, mockClient);
      expect(result).toBeDefined();
      expect(result?.slug?.current).toBe(firstRouteSlug);
    });
  });
});
