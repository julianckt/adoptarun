import { cleanStega, cleanStegaNumber, cleanStegaString } from '@/sanity/cleanStega';
import { hasImageAsset, urlForImage } from '@/sanity/image';
import type { SanityCharity } from '@/sanity/types';

export interface CharityPhoto {
  src: string;
  alt: string;
}

export interface CharityLogo {
  src: string;
  alt: string;
}

export const IMPACT_TIER_PRESETS: readonly number[] = [100, 300, 500, 1000];

const PHOTO_WIDTH = 960;
const PHOTO_HEIGHT = 640;
const LOGO_SIZE = 160;

/**
 * Calculates raw or rounded impact units from donation amount and charity multiplier.
 */
export function calculateImpact(amount: number, multiplier: number): number {
  const cleanAmount = cleanStegaNumber(amount, 0);
  const cleanMultiplier = cleanStegaNumber(multiplier, 0);

  if (cleanAmount <= 0 || cleanMultiplier <= 0 || Number.isNaN(cleanAmount) || Number.isNaN(cleanMultiplier)) {
    return 0;
  }

  return Math.round(cleanAmount * cleanMultiplier);
}

/**
 * Formats a display template by substituting {amount} and {impact} tokens.
 */
export function formatImpactDisplay(template: string, amount: number, multiplier: number): string {
  const cleanedTemplate = cleanStegaString(template || '').trim();
  const impact = calculateImpact(amount, multiplier);
  const formattedAmount = amount.toLocaleString('en-US');
  const formattedImpact = impact.toLocaleString('en-US');

  if (!cleanedTemplate) {
    return `HK$${formattedAmount} generates ${formattedImpact} impact units`;
  }

  return cleanedTemplate
    .replace(/\{amount\}/g, formattedAmount)
    .replace(/\{impact\}/g, formattedImpact);
}

/**
 * Builds the route adoption URL with charity slug query parameter.
 */
export function getRouteAdoptionUrl(slug?: string): string {
  const cleanSlug = cleanStegaString(slug || '').trim();
  if (!cleanSlug) {
    return '/signup';
  }
  return `/signup?charity=${encodeURIComponent(cleanSlug)}`;
}

/**
 * Resolves full-bleed documentary photo from Sanity coverPhoto.
 */
export function resolveCharityPhoto(charity: SanityCharity | null | undefined): CharityPhoto | null {
  const photo = cleanStega(charity?.coverPhoto);
  if (!photo || !hasImageAsset(photo)) {
    return null;
  }

  const rawAlt = (photo as { alt?: unknown }).alt;
  const cleanedAlt = typeof rawAlt === 'string' ? cleanStegaString(rawAlt).trim() : '';
  const alt = cleanedAlt || `${cleanStegaString(charity?.name || 'Charity')} mission photograph`;
  const src = urlForImage(photo)
    .width(PHOTO_WIDTH)
    .height(PHOTO_HEIGHT)
    .fit('crop')
    .auto('format')
    .url();

  return { src, alt };
}

/**
 * Resolves partner logo from Sanity logo asset.
 */
export function resolveCharityLogo(charity: SanityCharity | null | undefined): CharityLogo | null {
  const logo = cleanStega(charity?.logo);
  if (!logo || !hasImageAsset(logo)) {
    return null;
  }

  const rawAlt = (logo as { alt?: unknown }).alt;
  const cleanedAlt = typeof rawAlt === 'string' ? cleanStegaString(rawAlt).trim() : '';
  const alt = cleanedAlt || `${cleanStegaString(charity?.name || 'Charity')} logo`;
  const src = urlForImage(logo)
    .width(LOGO_SIZE)
    .height(LOGO_SIZE)
    .fit('max')
    .auto('format')
    .url();

  return { src, alt };
}
