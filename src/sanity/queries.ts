import { defineQuery } from 'groq';
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
    colorTheme,
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
    colorTheme,
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
    announcementDefaultSlogan,
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

export async function getRoutes(): Promise<SanityRoute[]> {
  return await sanityClient.fetch(ROUTES_QUERY);
}

export async function getRouteBySlug(slug: string): Promise<SanityRoute | null> {
  return await sanityClient.fetch(ROUTE_BY_SLUG_QUERY, { slug });
}

export async function getCharities(): Promise<SanityCharity[]> {
  return await sanityClient.fetch(CHARITIES_QUERY);
}

export async function getCharityBySlug(slug: string): Promise<SanityCharity | null> {
  return await sanityClient.fetch(CHARITY_BY_SLUG_QUERY, { slug });
}

export async function getSiteCopy(): Promise<SanitySiteCopy | null> {
  return await sanityClient.fetch(SITE_COPY_QUERY);
}
