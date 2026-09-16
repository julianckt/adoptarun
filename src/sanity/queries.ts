import { defineQuery } from 'groq';
import type { SanityClient } from '@sanity/client';
import { sanityClient } from './client';
import type { SanityRoute, SanityCharity, SanitySiteCopy } from './types';

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

export const SITE_COPY_QUERY = defineQuery(
  `*[_type == "siteCopy" && _id in ["siteCopy", "drafts.siteCopy"]][0] {
    _id,
    _type,
    announcementEnabled,
    announcementTickerText,
    announcementTickerLink,
    heroTitle,
    heroSubtitle,
    heroCtaText,
    heroCtaLink,
    heroSecondaryCtaText,
    heroSecondaryCtaLink,
    totalKmCovered,
    totalRunsCompleted,
    totalParticipantsCount,
    countersSubtitle,
    journeyHeadline,
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
    essenceStatement,
    actionSlogan
  }`
);

// Each fetcher defaults to the public (published, stega-off) client; /preview passes the preview client.

export async function getRoutes(client: SanityClient = sanityClient): Promise<SanityRoute[]> {
  return await client.fetch(ROUTES_QUERY);
}

export async function getRouteBySlug(
  slug: string,
  client: SanityClient = sanityClient
): Promise<SanityRoute | null> {
  return await client.fetch(ROUTE_BY_SLUG_QUERY, { slug });
}

export async function getCharities(client: SanityClient = sanityClient): Promise<SanityCharity[]> {
  return await client.fetch(CHARITIES_QUERY);
}

export async function getCharityBySlug(
  slug: string,
  client: SanityClient = sanityClient
): Promise<SanityCharity | null> {
  return await client.fetch(CHARITY_BY_SLUG_QUERY, { slug });
}

export async function getSiteCopy(client: SanityClient = sanityClient): Promise<SanitySiteCopy | null> {
  return await client.fetch(SITE_COPY_QUERY);
}
