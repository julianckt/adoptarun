/**
 * Serializable view models for the Adoption Portal islands.
 *
 * `signup.astro` normalises Sanity documents into these shapes once, so the
 * islands never carry Sanity types, stega markers, or image-builder concerns
 * across the hydration boundary.
 */

export interface PortalRoute {
  slug: string;
  title: string;
  district: string;
  blurb: string | null;
  distanceKm: number | null;
  elevationGain: number | null;
  estimatedDurationMin: number | null;
  difficulty: string | null;
  isGroupRun: boolean;
  groupRunDateTime: string | null;
  startPoint: string | null;
  meetupPoint: string | null;
  miniMapSvg: string | null;
}

export interface PortalCharity {
  slug: string;
  name: string;
  logoSrc: string | null;
  logoAlt: string;
  charityDescription: string | null;
  causeDescription: string | null;
  impactUnitName: string;
  impactMultiplierPerHkd: number;
  impactDisplayTemplate: string;
}
