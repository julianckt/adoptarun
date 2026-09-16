import { describe, it, expect } from 'vitest';
import { schemaTypes, routeType, charityType, siteCopyType } from '../../src/sanity/schemaTypes';
import { structure } from '../../src/sanity/structure';
import {
  ROUTES_QUERY,
  ROUTE_BY_SLUG_QUERY,
  CHARITIES_QUERY,
  CHARITY_BY_SLUG_QUERY,
  SITE_COPY_QUERY,
} from '../../src/sanity/queries';
import { urlForImage, hasImageAsset, safeUrlForImage } from '../../src/sanity/image';
import { sanityClient, projectId, dataset } from '../../src/sanity/client';
import { cleanStega } from '../../src/sanity';
import sanityConfig from '../../sanity.config';

describe('Sanity CMS Schemas & Configuration', () => {
  describe('Schema Registry', () => {
    it('exports all 3 content schemas', () => {
      const typeNames = schemaTypes.map((t) => t.name);
      expect(typeNames).toContain('route');
      expect(typeNames).toContain('charity');
      expect(typeNames).toContain('siteCopy');
      expect(schemaTypes.length).toBe(3);
    });
  });

  describe('Route Schema (routeType)', () => {
    it('contains all required fields and fieldsets', () => {
      expect(routeType.name).toBe('route');
      expect(routeType.type).toBe('document');

      const fieldNames = (routeType.fields || []).map((f) => f.name);
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('slug');
      expect(fieldNames).toContain('animalType');
      expect(fieldNames).toContain('district');
      expect(fieldNames).toContain('region');
      expect(fieldNames).toContain('city');
      expect(fieldNames).toContain('difficulty');
      expect(fieldNames).toContain('distanceKm');
      expect(fieldNames).toContain('elevationGain');
      expect(fieldNames).toContain('estimatedDurationMin');
      expect(fieldNames).toContain('gpxFile');
      expect(fieldNames).toContain('routePolyline');
      expect(fieldNames).toContain('miniMapSvg');
      expect(fieldNames).toContain('elevationProfile');
      expect(fieldNames).toContain('stravaRouteUrl');
      expect(fieldNames).toContain('description');
      expect(fieldNames).toContain('coverImage');
      expect(fieldNames).toContain('isGroupRun');
      expect(fieldNames).toContain('groupRunDateTime');
      expect(fieldNames).toContain('groupRunMeetupPoint');
      expect(fieldNames).toContain('groupRunNotes');
    });

    it('has groupRun fields assigned to groupRun fieldset', () => {
      const groupRunField = (routeType.fields || []).find((f) => f.name === 'isGroupRun');
      expect(groupRunField?.fieldset).toBe('groupRun');
    });

    it('orders identity fields: district first, animalType second, title third, and slug fourth', () => {
      const fieldNames = (routeType.fields || []).map((f) => f.name);
      expect(fieldNames[0]).toBe('district');
      expect(fieldNames[1]).toBe('animalType');
      expect(fieldNames[2]).toBe('title');
      expect(fieldNames[3]).toBe('slug');
    });

    it('attaches custom auto-generation components to title and slug', () => {
      const titleField = (routeType.fields || []).find((f) => f.name === 'title');
      const slugField = (routeType.fields || []).find((f) => f.name === 'slug');
      expect(titleField?.components?.input).toBeDefined();
      expect(slugField?.components?.input).toBeDefined();
    });

    it('configures isUnique check on slug options', async () => {
      const slugField = (routeType.fields || []).find((f) => f.name === 'slug') as any;
      expect(slugField?.options?.isUnique).toBeDefined();
      expect(typeof slugField?.options?.isUnique).toBe('function');

      const mockDefaultIsUnique = vi.fn().mockResolvedValue(true);
      const mockContext = { defaultIsUnique: mockDefaultIsUnique };
      const result = await slugField.options.isUnique('test-slug', mockContext);
      expect(mockDefaultIsUnique).toHaveBeenCalledWith('test-slug', mockContext);
      expect(result).toBe(true);
    });

    it('configures custom GpxUploadInput component on gpxFile field', () => {
      const gpxField = (routeType.fields || []).find((f) => f.name === 'gpxFile');
      expect(gpxField).toBeDefined();
      expect(gpxField?.components?.input).toBeDefined();
    });

    it('previews with media only when asset reference is present', () => {
      const prepare = (routeType.preview as any).prepare;
      const previewWithoutAsset = prepare({
        title: 'Jackie Run',
        district: 'YYC',
        distance: 5.18,
        media: { _type: 'image', alt: 'Route photo' },
        isGroupRun: false,
      });
      expect(previewWithoutAsset.media).toBeUndefined();

      const previewWithAsset = prepare({
        title: 'Jackie Run',
        district: 'YYC',
        distance: 5.18,
        media: {
          _type: 'image',
          asset: { _ref: 'image-1234567890abcdef-800x600-png', _type: 'reference' },
        },
        isGroupRun: false,
      });
      expect(previewWithAsset.media).toBeDefined();
    });
  });

  describe('Charity Schema (charityType)', () => {
    it('contains all partner, logo, and impact calculation fields', () => {
      expect(charityType.name).toBe('charity');
      expect(charityType.type).toBe('document');

      const fieldNames = (charityType.fields || []).map((f) => f.name);
      expect(fieldNames).toContain('name');
      expect(fieldNames).toContain('slug');
      expect(fieldNames).toContain('websiteUrl');
      expect(fieldNames).toContain('logo');
      expect(fieldNames).toContain('coverPhoto');
      expect(fieldNames).toContain('charityDescription');
      expect(fieldNames).toContain('causeDescription');
      expect(fieldNames).toContain('impactUnitName');
      expect(fieldNames).toContain('impactMultiplierPerHkd');
      expect(fieldNames).toContain('impactDisplayTemplate');
    });
  });

  describe('SiteCopy Singleton Schema (siteCopyType)', () => {
    it('has studio tabs defined for hero, announcement, counters, journey, and faqs', () => {
      expect(siteCopyType.name).toBe('siteCopy');
      const groupNames = (siteCopyType.groups || []).map((g) => g.name);
      expect(groupNames).toContain('announcement');
      expect(groupNames).toContain('hero');
      expect(groupNames).toContain('counters');
      expect(groupNames).toContain('journey');
      expect(groupNames).toContain('faqs');
      expect(groupNames).toContain('about');
    });

    it('contains movement counters fields', () => {
      const fieldNames = (siteCopyType.fields || []).map((f) => f.name);
      expect(fieldNames).toContain('totalKmCovered');
      expect(fieldNames).toContain('totalRunsCompleted');
      expect(fieldNames).toContain('totalParticipantsCount');
    });

    it('contains announcement banner fields and excludes fallback slogan', () => {
      const fieldNames = (siteCopyType.fields || []).map((f) => f.name);
      expect(fieldNames).toContain('announcementEnabled');
      expect(fieldNames).toContain('announcementTickerText');
      expect(fieldNames).toContain('announcementTickerLink');
      expect(fieldNames).not.toContain('announcementDefaultSlogan');
    });

    it('validates announcementTickerText required when announcementEnabled is true', () => {
      const textDef = (siteCopyType.fields || []).find((f) => f.name === 'announcementTickerText');
      expect(textDef).toBeDefined();

      let customFn: any;
      const mockRule: any = {
        custom: (fn: any) => {
          customFn = fn;
          return mockRule;
        },
        max: () => mockRule,
        warning: () => mockRule,
      };

      if (typeof textDef?.validation === 'function') {
        textDef.validation(mockRule);
      }

      expect(customFn).toBeDefined();
      // Fails when announcementEnabled is true and text is missing or whitespace
      expect(customFn('', { parent: { announcementEnabled: true } })).toBe(
        'Announcement banner text is required when the announcement banner is enabled'
      );
      expect(customFn('   ', { parent: { announcementEnabled: true } })).toBe(
        'Announcement banner text is required when the announcement banner is enabled'
      );
      expect(customFn(undefined, { parent: { announcementEnabled: true } })).toBe(
        'Announcement banner text is required when the announcement banner is enabled'
      );

      // Passes when announcementEnabled is true and text is provided
      expect(customFn('Join our run', { parent: { announcementEnabled: true } })).toBe(true);

      // Passes when announcementEnabled is false, even if text is empty
      expect(customFn('', { parent: { announcementEnabled: false } })).toBe(true);
      expect(customFn(undefined, { parent: { announcementEnabled: false } })).toBe(true);
    });
  });

  describe('Studio Structure & Configuration', () => {
    it('defines a structure resolver function', () => {
      expect(typeof structure).toBe('function');
    });

    it('configures presentationTool in sanity.config.ts plugins', () => {
      expect(Array.isArray(sanityConfig.plugins)).toBe(true);
      expect(sanityConfig.plugins?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Client, Visual Editing & Image Utilities', () => {
    it('configures sanityClient with project and dataset', () => {
      expect(projectId).toBe('huk9xx07');
      expect(dataset).toBe('production');
      expect(sanityClient).toBeDefined();
    });

    // Stega/drafts are no longer env-toggled on the public client; see tests/sanity/client.test.ts.
    it('exports the cleanStega helper', () => {
      expect(typeof cleanStega).toBe('function');
    });

    it('urlForImage generates valid image url string', () => {
      const mockImageSource = {
        _type: 'image' as const,
        asset: {
          _ref: 'image-1234567890abcdef-800x600-png',
          _type: 'reference' as const,
        },
      };
      const url = urlForImage(mockImageSource).width(400).url();
      expect(url).toContain('https://cdn.sanity.io/images/huk9xx07/production/');
      expect(url).toContain('w=400');
    });

    it('hasImageAsset validates asset presence correctly', () => {
      expect(hasImageAsset(null)).toBe(false);
      expect(hasImageAsset(undefined)).toBe(false);
      expect(hasImageAsset('')).toBe(false);
      expect(hasImageAsset({})).toBe(false);
      expect(hasImageAsset({ _type: 'image', alt: 'Route photo' })).toBe(false);
      expect(hasImageAsset({ _type: 'image', asset: {} })).toBe(false);

      expect(
        hasImageAsset({
          _type: 'image',
          asset: { _ref: 'image-1234567890abcdef-800x600-png', _type: 'reference' },
        })
      ).toBe(true);
      expect(hasImageAsset({ asset: { _id: 'image-1234' } })).toBe(true);
      expect(hasImageAsset({ asset: { url: 'https://cdn.sanity.io/images/foo.png' } })).toBe(true);
      expect(hasImageAsset({ asset: 'image-1234' })).toBe(true);
      expect(hasImageAsset('image-1234')).toBe(true);
      expect(hasImageAsset({ _ref: 'image-1234' })).toBe(true);
    });

    it('safeUrlForImage gracefully resolves URLs or returns undefined', () => {
      expect(safeUrlForImage(null)).toBeUndefined();
      expect(safeUrlForImage(undefined)).toBeUndefined();
      expect(safeUrlForImage({ _type: 'image', alt: 'Route photo' })).toBeUndefined();

      const validSource = {
        _type: 'image' as const,
        asset: {
          _ref: 'image-1234567890abcdef-800x600-png',
          _type: 'reference' as const,
        },
      };
      const resolved = safeUrlForImage(validSource);
      expect(resolved).toBeDefined();
      expect(resolved).toContain('https://cdn.sanity.io/images/huk9xx07/production/');
    });

    it('GROQ queries are valid strings', () => {
      expect(typeof ROUTES_QUERY).toBe('string');
      expect(typeof ROUTE_BY_SLUG_QUERY).toBe('string');
      expect(typeof CHARITIES_QUERY).toBe('string');
      expect(typeof CHARITY_BY_SLUG_QUERY).toBe('string');
      expect(typeof SITE_COPY_QUERY).toBe('string');
      expect(ROUTES_QUERY).toContain('*[_type == "route"]');
      expect(CHARITIES_QUERY).toContain('*[_type == "charity"]');
      expect(SITE_COPY_QUERY).toContain('*[_type == "siteCopy"');
    });
  });
});
