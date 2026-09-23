/**
 * Normalises Sanity documents into the Adoption Portal's view models.
 *
 * Done once at build time so the islands carry plain data across the hydration
 * boundary: no Sanity types, no stega markers, no image builder.
 */
import { cleanStegaNumber, cleanStegaString } from '@/sanity/cleanStega';
import { resolveCharityLogo } from '@/utils/charity-utils';
import type { SanityCharity, SanityRoute } from '@/sanity/types';
import type { PortalCharity, PortalRoute } from '@/components/signup/types';

function text(value: unknown): string | null {
  const cleaned = cleanStegaString((value as string) ?? '').trim();
  return cleaned || null;
}

function num(value: unknown): number | null {
  const cleaned = cleanStegaNumber(value as number, Number.NaN);
  return Number.isFinite(cleaned) ? cleaned : null;
}

export function toPortalRoute(route: SanityRoute): PortalRoute {
  return {
    slug: cleanStegaString(route.slug?.current ?? ''),
    title: cleanStegaString(route.title ?? ''),
    district: cleanStegaString(route.district ?? ''),
    blurb: text(route.description),
    distanceKm: num(route.distanceKm),
    elevationGain: num(route.elevationGain),
    estimatedDurationMin: num(route.estimatedDurationMin),
    difficulty: text(route.difficulty),
    isGroupRun: Boolean(route.isGroupRun),
    groupRunDateTime: text(route.groupRunDateTime),
    startPoint: text(route.startPointDescription),
    meetupPoint: text(route.groupRunMeetupPoint),
    miniMapSvg: route.miniMapSvg ?? null,
  };
}

export function toPortalRoutes(routes: SanityRoute[] | null | undefined): PortalRoute[] {
  return (routes ?? []).map(toPortalRoute).filter((route) => Boolean(route.slug));
}

export function toPortalCharity(charity: SanityCharity): PortalCharity {
  const logo = resolveCharityLogo(charity);

  return {
    slug: cleanStegaString(charity.slug?.current ?? ''),
    name: cleanStegaString(charity.name ?? ''),
    logoSrc: logo?.src ?? null,
    logoAlt: logo?.alt ?? `${cleanStegaString(charity.name ?? 'Charity')} logo`,
    charityDescription: text(charity.charityDescription),
    causeDescription: text(charity.causeDescription),
    impactUnitName: cleanStegaString(charity.impactUnitName ?? ''),
    impactMultiplierPerHkd: cleanStegaNumber(charity.impactMultiplierPerHkd, 0),
    impactDisplayTemplate: cleanStegaString(charity.impactDisplayTemplate ?? ''),
  };
}
