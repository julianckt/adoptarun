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

// Slack Incoming Webhook for build-time issues that need action: Sanity
// unreachable (falling back to cached content) or a dangling image asset
// reference (a field points at an asset that no longer exists in the dataset).
const slackActOnWebhook = process.env.SLACK_WEBHOOK_ACT_ON;

async function notifySlack(webhookUrl, text) {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.warn(`[sanity-cache] Slack notification failed: ${err?.message || err}`);
  }
}

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
  "coverImageAssetOk": !defined(coverImage.asset._ref) || defined(coverImage.asset->_id),
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
  "logoAssetOk": !defined(logo.asset._ref) || defined(logo.asset->_id),
  coverPhoto,
  "coverPhotoAssetOk": !defined(coverPhoto.asset._ref) || defined(coverPhoto.asset->_id),
  charityDescription,
  causeDescription,
  impactUnitName,
  impactMultiplierPerHkd,
  impactDisplayTemplate
}`;

const STUDIO_HOST = 'https://adoptarun.sanity.studio';

function studioEditLink(doc) {
  return `${STUDIO_HOST}/intent/edit/id=${doc._id};type=${doc._type}`;
}

// Scans fetched routes/charities for image fields whose asset reference no
// longer resolves (e.g. the asset was deleted from the media library), then
// strips the computed *AssetOk fields so they never leak into the cache file.
function collectBrokenAssetRefs(routes, charities) {
  const broken = [];

  for (const route of Array.isArray(routes) ? routes : []) {
    if (route.coverImageAssetOk === false) {
      broken.push(`• *route* "${route.title || route._id}" — coverImage (${studioEditLink(route)})`);
    }
    delete route.coverImageAssetOk;
  }

  for (const charity of Array.isArray(charities) ? charities : []) {
    if (charity.logoAssetOk === false) {
      broken.push(`• *charity* "${charity.name || charity._id}" — logo (${studioEditLink(charity)})`);
    }
    if (charity.coverPhotoAssetOk === false) {
      broken.push(`• *charity* "${charity.name || charity._id}" — coverPhoto (${studioEditLink(charity)})`);
    }
    delete charity.logoAssetOk;
    delete charity.coverPhotoAssetOk;
  }

  return broken;
}

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

// Adoption confirmation email copy. Baked into the bundle at build time so the
// signup endpoint never makes a Sanity call on the Adopter's critical path.
const EMAIL_COPY_QUERY = `*[_type == "emailCopy" && _id in ["emailCopy", "drafts.emailCopy"]][0] {
  _id,
  _type,
  subject,
  preheader,
  greeting,
  intro,
  adopterIdLabel,
  adopterIdNote,
  ctaIntro,
  ctaLabel,
  closing,
  signoff,
  footerNote
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
    const [routes, charities, settings, siteCopy, emailCopy] = await Promise.all([
      client.fetch(ROUTES_QUERY),
      client.fetch(CHARITIES_QUERY),
      client.fetch(SETTINGS_QUERY),
      client.fetch(SITE_COPY_QUERY),
      client.fetch(EMAIL_COPY_QUERY),
    ]);

    const brokenAssetRefs = collectBrokenAssetRefs(routes, charities);
    if (brokenAssetRefs.length > 0) {
      console.warn(`[sanity-cache] ⚠️  ${brokenAssetRefs.length} dangling image asset reference(s) found.`);
      await notifySlack(
        slackActOnWebhook,
        `🖼️ *Dangling Sanity asset reference(s) found during build*\n${brokenAssetRefs.join('\n')}`
      );
    }

    // Read previous cache to preserve fallback routes or data if new query returned empty
    let previousCache = null;
    if (existsSync(cacheFilePath)) {
      try {
        previousCache = JSON.parse(readFileSync(cacheFilePath, 'utf8'));
      } catch {}
    }

    const fellBackTo = [];
    if (!(Array.isArray(routes) && routes.length > 0) && previousCache?.data?.routes?.length) {
      fellBackTo.push('routes');
    }
    if (!(Array.isArray(charities) && charities.length > 0) && previousCache?.data?.charities?.length) {
      fellBackTo.push('charities');
    }
    if (!settings && previousCache?.data?.settings) fellBackTo.push('settings');
    if (!siteCopy && previousCache?.data?.siteCopy) fellBackTo.push('siteCopy');
    if (!emailCopy && previousCache?.data?.emailCopy) fellBackTo.push('emailCopy');

    if (fellBackTo.length > 0) {
      console.warn(`[sanity-cache] ⚠️  Sanity returned empty for: ${fellBackTo.join(', ')}. Using cached snapshot for these.`);
      await notifySlack(
        slackActOnWebhook,
        `⚠️ *Sanity build fell back to cached snapshot* for: ${fellBackTo.join(', ')}\nSanity returned empty results for these — the deploy proceeded on stale content.`
      );
    }

    const payload = {
      timestamp: new Date().toISOString(),
      data: {
        routes: Array.isArray(routes) && routes.length > 0 ? routes : (previousCache?.data?.routes || []),
        charities: Array.isArray(charities) && charities.length > 0 ? charities : (previousCache?.data?.charities || []),
        settings: settings || previousCache?.data?.settings || null,
        siteCopy: siteCopy || previousCache?.data?.siteCopy || null,
        emailCopy: emailCopy || previousCache?.data?.emailCopy || null,
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
      await notifySlack(
        slackActOnWebhook,
        `🔴 *Sanity fetch failed during build* — deploy proceeded entirely on the previous cached snapshot.\nError: ${err?.message || err}`
      );
      process.exit(0);
    } else {
      console.error('│ Fatal: No existing cache snapshot found at src/data/sanity-cache.json │');
      console.error('└──────────────────────────────────────────────────────────────────┘\n');
      await notifySlack(
        slackActOnWebhook,
        `🔴 *Sanity fetch failed during build and no cached snapshot exists* — build is failing.\nError: ${err?.message || err}`
      );
      process.exit(1);
    }
  }
}

syncSanityCache();
