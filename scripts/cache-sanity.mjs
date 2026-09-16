#!/usr/bin/env node
/**
 * scripts/cache-sanity.mjs
 *
 * Fetches published Sanity documents at build time and caches them to
 * `src/data/sanity-cache.json`. If Sanity is down or unreachable, gracefully
 * preserves the existing snapshot so the build can proceed with past cache.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

// Load environment variables if available
if (existsSync('.env')) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile('.env');
    }
  } catch (err) {
    // Ignore .env parse errors in minimal environments
  }
}

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'huk9xx07';
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.PUBLIC_SANITY_API_VERSION || '2026-03-01';
const cacheFilePath = path.resolve('src/data/sanity-cache.json');

const ROUTES_QUERY = `*[_type == "route"] | order(isGroupRun desc, featured desc, distanceKm asc) {
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
}`;

const CHARITIES_QUERY = `*[_type == "charity"] | order(name asc) {
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
}`;

const SETTINGS_QUERY = `*[_type == "settings" && _id in ["settings", "drafts.settings"]][0] {
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
}`;

const SITE_COPY_QUERY = `*[_type == "siteCopy" && _id in ["siteCopy", "drafts.siteCopy"]][0] {
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
}`;

async function syncSanityCache() {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: 'published',
  });

  try {
    console.log(`[sanity-cache] Fetching published data from Sanity (${projectId}/${dataset})...`);
    const [routes, charities, settings, siteCopy] = await Promise.all([
      client.fetch(ROUTES_QUERY),
      client.fetch(CHARITIES_QUERY),
      client.fetch(SETTINGS_QUERY),
      client.fetch(SITE_COPY_QUERY),
    ]);

    // Read previous cache to preserve fallback routes or data if new query returned empty
    let previousCache = null;
    if (existsSync(cacheFilePath)) {
      try {
        previousCache = JSON.parse(readFileSync(cacheFilePath, 'utf8'));
      } catch {}
    }

    const payload = {
      timestamp: new Date().toISOString(),
      data: {
        routes: Array.isArray(routes) && routes.length > 0 ? routes : (previousCache?.data?.routes || []),
        charities: Array.isArray(charities) && charities.length > 0 ? charities : (previousCache?.data?.charities || []),
        settings: settings || previousCache?.data?.settings || null,
        siteCopy: siteCopy || previousCache?.data?.siteCopy || null,
      },
    };

    writeFileSync(cacheFilePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    console.log(
      `[sanity-cache] ✓ Snapshot cache updated: ${payload.data.routes.length} route(s), ${payload.data.charities.length} charity(ies).`
    );
  } catch (err) {
    console.warn('\n┌──────────────────────────────────────────────────────────────────┐');
    console.warn('│ ⚠️  SANITY LIVE FETCH FAILED                                     │');
    console.warn(`│ Error: ${(err?.message || err).slice(0, 56).padEnd(56)} │`);
    if (existsSync(cacheFilePath)) {
      console.warn('│ Preserving existing snapshot from src/data/sanity-cache.json     │');
      console.warn('└──────────────────────────────────────────────────────────────────┘\n');
      process.exit(0);
    } else {
      console.error('│ Fatal: No existing cache snapshot found at src/data/sanity-cache.json │');
      console.error('└──────────────────────────────────────────────────────────────────┘\n');
      process.exit(1);
    }
  }
}

syncSanityCache();
