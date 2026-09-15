import { describe, it, expect } from 'vitest';
import {
  resolveTallyValues,
  findSpotlightCharity,
  resolveCharityPhoto,
  DEFAULT_CHARITY_PHOTO,
} from '@/utils/homepage-content';
import type { SanityCharity, SanitySiteCopy } from '@/sanity/types';

// Zero-width characters as Sanity stega appends them to strings on /preview
const stega = '​‌‍⁠﻿';

const charity = (overrides: Partial<SanityCharity>): SanityCharity =>
  ({ _id: 'c', _type: 'charity', name: 'Some Charity', slug: { current: 'some-charity' }, ...overrides }) as SanityCharity;

describe('resolveTallyValues', () => {
  it('passes Sanity counter numbers through', () => {
    const siteCopy = { totalKmCovered: 187, totalRunsCompleted: 21, totalParticipantsCount: 33 } as SanitySiteCopy;
    expect(resolveTallyValues(siteCopy)).toEqual({
      totalKmCovered: 187,
      totalRunsCompleted: 21,
      totalParticipantsCount: 33,
    });
  });

  it('keeps zero as real data', () => {
    const siteCopy = { totalKmCovered: 0, totalRunsCompleted: 0, totalParticipantsCount: 0 } as SanitySiteCopy;
    expect(resolveTallyValues(siteCopy).totalKmCovered).toBe(0);
  });

  it('strips stega from preview values before reading the number', () => {
    const siteCopy = { totalKmCovered: `187${stega}` } as unknown as SanitySiteCopy;
    expect(resolveTallyValues(siteCopy).totalKmCovered).toBe(187);
  });

  it('leaves missing figures undefined so the placeholder stays', () => {
    expect(resolveTallyValues(null)).toEqual({
      totalKmCovered: undefined,
      totalRunsCompleted: undefined,
      totalParticipantsCount: undefined,
    });
    expect(resolveTallyValues({ totalKmCovered: 12 }).totalRunsCompleted).toBeUndefined();
  });
});

describe('findSpotlightCharity', () => {
  it('matches SPCA by slug', () => {
    const spca = charity({ name: 'Society for Animals', slug: { current: 'spca-hk' } } as Partial<SanityCharity>);
    expect(findSpotlightCharity([charity({}), spca])).toBe(spca);
  });

  it('matches SPCA by name, case-insensitively', () => {
    const spca = charity({ name: 'SPCA (HK)' });
    expect(findSpotlightCharity([spca])).toBe(spca);
  });

  it('matches stega-encoded slugs and names from the preview', () => {
    const bySlug = charity({ slug: { current: `spca${stega}` } } as Partial<SanityCharity>);
    const byName = charity({ name: `S${stega}PCA` });
    expect(findSpotlightCharity([bySlug])).toBe(bySlug);
    expect(findSpotlightCharity([byName])).toBe(byName);
  });

  it('never falls back to another charity', () => {
    expect(findSpotlightCharity([charity({ name: 'Hong Kong Dog Rescue' })])).toBeNull();
  });

  it('returns null without charities', () => {
    expect(findSpotlightCharity(null)).toBeNull();
    expect(findSpotlightCharity([])).toBeNull();
  });
});

describe('resolveCharityPhoto', () => {
  const coverPhoto = { _type: 'image', asset: { _ref: 'image-abc123def456-1200x800-jpg', _type: 'reference' } };

  it('uses the Sanity cover photo, cropped to the frame at 2x, with its alt text', () => {
    const photo = resolveCharityPhoto(charity({ coverPhoto: { ...coverPhoto, alt: 'Volunteer walking a dog' } } as Partial<SanityCharity>));
    expect(photo.alt).toBe('Volunteer walking a dog');
    expect(photo.src).toContain('cdn.sanity.io/images/');
    expect(photo.src).toContain('abc123def456-1200x800.jpg');
    expect(photo.src).toContain('w=1136');
    expect(photo.src).toContain('h=758');
    expect(photo.src).toContain('fit=crop');
  });

  it('strips stega from the alt text', () => {
    const photo = resolveCharityPhoto(charity({ coverPhoto: { ...coverPhoto, alt: `Volunteer${stega}` } } as Partial<SanityCharity>));
    expect(photo.alt).toBe('Volunteer');
  });

  it('falls back to the built-in alt when the photo has none', () => {
    const photo = resolveCharityPhoto(charity({ coverPhoto: { ...coverPhoto, alt: '  ' } } as Partial<SanityCharity>));
    expect(photo.src).toContain('cdn.sanity.io');
    expect(photo.alt).toBe(DEFAULT_CHARITY_PHOTO.alt);
  });

  it('keeps the built-in photo when no cover photo is uploaded', () => {
    expect(resolveCharityPhoto(charity({}))).toEqual(DEFAULT_CHARITY_PHOTO);
    expect(resolveCharityPhoto(null)).toEqual(DEFAULT_CHARITY_PHOTO);
    expect(resolveCharityPhoto(charity({ coverPhoto: { _type: 'image' } } as Partial<SanityCharity>))).toEqual(
      DEFAULT_CHARITY_PHOTO
    );
  });
});
