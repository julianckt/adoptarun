import { cleanStega, cleanStegaNumber, cleanStegaString } from '@/sanity/cleanStega';
import { hasImageAsset, urlForImage } from '@/sanity/image';
import type { SanityCharity, SanitySiteCopy } from '@/sanity/types';

/**
 * Homepage content seams shared by `/` (published, stega off) and `/preview` (drafts, stega on).
 * Everything that compares or formats Sanity values strips stega first, so both pages agree.
 */

/** About tally figures. A missing figure stays undefined so the section keeps its placeholder. */
export interface TallyValues {
  totalKmCovered?: number;
  totalRunsCompleted?: number;
  totalParticipantsCount?: number;
}

const tallyNumber = (value: unknown): number | undefined => {
  const parsed = cleanStegaNumber(value, NaN);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export function resolveTallyValues(siteCopy: Partial<SanitySiteCopy> | null | undefined): TallyValues {
  return {
    totalKmCovered: tallyNumber(siteCopy?.totalKmCovered),
    totalRunsCompleted: tallyNumber(siteCopy?.totalRunsCompleted),
    totalParticipantsCount: tallyNumber(siteCopy?.totalParticipantsCount),
  };
}

const SPOTLIGHT_MATCH = 'spca';

/**
 * The charity section is SPCA-branded (letters and default photo), so it only ever takes the
 * SPCA document — never another charity, which would put its copy under SPCA branding.
 */
export function findSpotlightCharity(
  charities: SanityCharity[] | null | undefined
): SanityCharity | null {
  return (
    charities?.find((charity) => {
      const slug = cleanStegaString(charity.slug?.current ?? '').toLowerCase();
      const name = cleanStegaString(charity.name ?? '').toLowerCase();
      return slug.includes(SPOTLIGHT_MATCH) || name.includes(SPOTLIGHT_MATCH);
    }) ?? null
  );
}

export interface CharityPhoto {
  src: string;
  alt: string;
}

export const DEFAULT_CHARITY_PHOTO: CharityPhoto = {
  src: '/images/charity/spca-puppy.jpg',
  alt: 'SPCA rescue puppy resting head in human hand',
};

/** The photo frame's largest rendered size (568×379) at 2x, cropped around the editor's hotspot. */
const PHOTO_WIDTH = 1136;
const PHOTO_HEIGHT = 758;

export function resolveCharityPhoto(charity: SanityCharity | null | undefined): CharityPhoto {
  const photo = cleanStega(charity?.coverPhoto);
  if (!photo || !hasImageAsset(photo)) {
    return DEFAULT_CHARITY_PHOTO;
  }

  const rawAlt = (photo as { alt?: unknown }).alt;
  const alt = typeof rawAlt === 'string' && rawAlt.trim() ? rawAlt.trim() : DEFAULT_CHARITY_PHOTO.alt;
  const src = urlForImage(photo)
    .width(PHOTO_WIDTH)
    .height(PHOTO_HEIGHT)
    .fit('crop')
    .auto('format')
    .url();

  return { src, alt };
}
