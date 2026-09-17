import { defineQuery } from 'groq';
import type { SanityClient } from '@sanity/client';
import { sanityClient } from './client';
import type { SanityRoute, SanityCharity, SanitySiteCopy, SanitySettings } from './types';
import sanityCache from '../data/sanity-cache.json';
import { recordFallback } from './fallbackState';

export const ROUTES_QUERY = defineQuery(
  `*[_type == "route"] | order(isGroupRun desc, featured desc, distanceKm asc) {
    _id,
    _type,
    title,
    slug,
    animalType,
    district,
    region,
    city,
    difficulty,
    featured,
    "distanceKm": coalesce(distanceKm, gpxFile.distanceKm),
    "elevationGain": coalesce(elevationGain, gpxFile.elevationGain),
    "estimatedDurationMin": coalesce(estimatedDurationMin, gpxFile.estimatedDurationMin),
    "routePolyline": coalesce(routePolyline, gpxFile.routePolyline),
    "miniMapSvg": coalesce(miniMapSvg, gpxFile.miniMapSvg),
    "elevationProfile": coalesce(elevationProfile, gpxFile.elevationProfile),
    stravaRouteUrl,
    startPointDescription,
    description,
    coverImage,
    tags,
    isGroupRun,
    groupRunDateTime,
    groupRunMeetupPoint,
    groupRunNotes
  }`
);

export const ROUTE_BY_SLUG_QUERY = defineQuery(
  `*[_type == "route" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    animalType,
    district,
    region,
    city,
    difficulty,
    featured,
    "distanceKm": coalesce(distanceKm, gpxFile.distanceKm),
    "elevationGain": coalesce(elevationGain, gpxFile.elevationGain),
    "estimatedDurationMin": coalesce(estimatedDurationMin, gpxFile.estimatedDurationMin),
    gpxFile { asset-> { url, originalFilename } },
    "routePolyline": coalesce(routePolyline, gpxFile.routePolyline),
    "miniMapSvg": coalesce(miniMapSvg, gpxFile.miniMapSvg),
    "elevationProfile": coalesce(elevationProfile, gpxFile.elevationProfile),
    stravaRouteUrl,
    startPointDescription,
    description,
    coverImage,
    tags,
    isGroupRun,
    groupRunDateTime,
    groupRunMeetupPoint,
    groupRunNotes
  }`
);

export const CHARITIES_QUERY = defineQuery(
  `*[_type == "charity"] | order(name asc) {
    _id,
    _type,
    name,
    slug,
    websiteUrl,
    logo,
    coverPhoto,
    charityDescription,
    causeDescription,
    impactUnitName,
    impactMultiplierPerHkd,
    impactDisplayTemplate
  }`
);

export const CHARITY_BY_SLUG_QUERY = defineQuery(
  `*[_type == "charity" && slug.current == $slug][0] {
    _id,
    _type,
    name,
    slug,
    websiteUrl,
    logo,
    coverPhoto,
    charityDescription,
    causeDescription,
    impactUnitName,
    impactMultiplierPerHkd,
    impactDisplayTemplate
  }`
);

export const SETTINGS_QUERY = defineQuery(
  `*[_type == "settings" && _id in ["settings", "drafts.settings"]][0] {
    _id,
    _type,
    announcementEnabled,
    announcementTickerText,
    announcementTickerLink,
    footerContactEmail,
    footerSocialLinks[] {
      _key,
      text,
      url
    },
    seoTitle,
    seoDescription,
    ogImage
  }`
);

export const SITE_COPY_QUERY = defineQuery(
  `*[_type == "siteCopy" && _id in ["siteCopy", "drafts.siteCopy"]][0] {
    _id,
    _type,
    heroTitle,
    heroSubtitle,
    heroDescription,
    totalKmCovered,
    totalRunsCompleted,
    totalParticipantsCount,
    totalHKDRaised,
    journeyHeadline,
    journeySubtitle,
    journeySteps[] {
      _key,
      stepNumber,
      title,
      description
    },
    faqs[] {
      _key,
      question,
      answer,
      category
    },
    missionStatement,
    ctaDescription
  }`
);

// Each fetcher defaults to the public (published, stega-off) client; /preview passes the preview client.

export function getCacheTimestamp(): string | null {
  return sanityCache?.timestamp || null;
}

export async function getRoutes(client: SanityClient = sanityClient): Promise<SanityRoute[]> {
  try {
    const result = await client.fetch(ROUTES_QUERY);
    if (Array.isArray(result) && result.length > 0) {
      return result;
    }
    if (client === sanityClient && Array.isArray(sanityCache?.data?.routes) && sanityCache.data.routes.length > 0) {
      return sanityCache.data.routes as unknown as SanityRoute[];
    }
    return result || [];
  } catch (err) {
    recordFallback('getRoutes', err);
    console.warn('[sanity] getRoutes failed, using cached fallback snapshot:', err instanceof Error ? err.message : err);
    return (sanityCache?.data?.routes as unknown as SanityRoute[]) || [];
  }
}

export async function getRouteBySlug(
  slug: string,
  client: SanityClient = sanityClient
): Promise<SanityRoute | null> {
  try {
    const result = await client.fetch(ROUTE_BY_SLUG_QUERY, { slug });
    if (result) return result;
    if (client === sanityClient && Array.isArray(sanityCache?.data?.routes)) {
      return ((sanityCache.data.routes as unknown as SanityRoute[]).find((r) => r.slug?.current === slug) || null);
    }
    return null;
  } catch (err) {
    recordFallback(`getRouteBySlug(${slug})`, err);
    console.warn(`[sanity] getRouteBySlug(${slug}) failed, using cached fallback:`, err instanceof Error ? err.message : err);
    return ((sanityCache?.data?.routes as unknown as SanityRoute[])?.find((r) => r.slug?.current === slug) || null);
  }
}

export async function getCharities(client: SanityClient = sanityClient): Promise<SanityCharity[]> {
  try {
    const result = await client.fetch(CHARITIES_QUERY);
    if (Array.isArray(result) && result.length > 0) {
      return result;
    }
    if (client === sanityClient && Array.isArray(sanityCache?.data?.charities) && sanityCache.data.charities.length > 0) {
      return sanityCache.data.charities as SanityCharity[];
    }
    return result || [];
  } catch (err) {
    recordFallback('getCharities', err);
    console.warn('[sanity] getCharities failed, using cached fallback snapshot:', err instanceof Error ? err.message : err);
    return (sanityCache?.data?.charities as SanityCharity[]) || [];
  }
}

export async function getCharityBySlug(
  slug: string,
  client: SanityClient = sanityClient
): Promise<SanityCharity | null> {
  try {
    const result = await client.fetch(CHARITY_BY_SLUG_QUERY, { slug });
    if (result) return result;
    if (client === sanityClient && Array.isArray(sanityCache?.data?.charities)) {
      return ((sanityCache.data.charities as SanityCharity[]).find((c) => c.slug?.current === slug) || null);
    }
    return null;
  } catch (err) {
    recordFallback(`getCharityBySlug(${slug})`, err);
    console.warn(`[sanity] getCharityBySlug(${slug}) failed, using cached fallback:`, err instanceof Error ? err.message : err);
    return ((sanityCache?.data?.charities as SanityCharity[])?.find((c) => c.slug?.current === slug) || null);
  }
}

export async function getSettings(client: SanityClient = sanityClient): Promise<SanitySettings | null> {
  try {
    const result = await client.fetch(SETTINGS_QUERY);
    if (result) return result;
    if (client === sanityClient && sanityCache?.data?.settings) {
      return sanityCache.data.settings as unknown as SanitySettings;
    }
    return result;
  } catch (err) {
    recordFallback('getSettings', err);
    console.warn('[sanity] getSettings failed, using cached fallback snapshot:', err instanceof Error ? err.message : err);
    return (sanityCache?.data?.settings as unknown as SanitySettings) || null;
  }
}

export async function getSiteCopy(client: SanityClient = sanityClient): Promise<SanitySiteCopy | null> {
  try {
    const result = await client.fetch(SITE_COPY_QUERY);
    if (result) return result;
    if (client === sanityClient && sanityCache?.data?.siteCopy) {
      return sanityCache.data.siteCopy as unknown as SanitySiteCopy;
    }
    return result;
  } catch (err) {
    recordFallback('getSiteCopy', err);
    console.warn('[sanity] getSiteCopy failed, using cached fallback snapshot:', err instanceof Error ? err.message : err);
    return (sanityCache?.data?.siteCopy as unknown as SanitySiteCopy) || null;
  }
}

