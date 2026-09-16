export interface SanitySlug {
  _type: 'slug';
  current: string;
}

export interface SanityImageReference {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface SanityFileReference {
  _type: 'file';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

export interface SanityRoute {
  _id: string;
  _type: 'route';
  _createdAt?: string;
  _updatedAt?: string;
  /** District / Neighbourhood (e.g., Wan Chai, Central & Western, Sha Tin) */
  district: string;
  /** Animal or guardian species (e.g., Dog, Cat, Boar) */
  animalType: string;
  /** Companion artwork name (auto-generated from district + animalType, e.g., Wan Chai Dog 2) */
  title: string;
  /** URL slug (auto-generated from title, e.g., wan-chai-dog-2) */
  slug: SanitySlug;
  region: 'Hong Kong Island' | 'Kowloon' | 'New Territories' | 'Outlying Islands';
  city: string;
  difficulty: 'beginner' | 'easy' | 'intermediate' | 'advanced';
  featured: boolean;
  distanceKm: number;
  elevationGain: number;
  estimatedDurationMin: number;
  gpxFile?: SanityFileReference;
  routePolyline: string;
  miniMapSvg?: string;
  elevationProfile?: string;
  stravaRouteUrl?: string;
  startPointDescription?: string;
  description: string;
  coverImage?: SanityImageReference;
  tags?: string[] | null;
  isGroupRun: boolean;
  groupRunDateTime?: string;
  /** Current signups for a group run. Not yet in the Sanity schema; data source TBD. */
  groupRunSignupCount?: number;
  groupRunMeetupPoint?: string;
  groupRunNotes?: string;
}

export interface SanityCharity {
  _id: string;
  _type: 'charity';
  _createdAt?: string;
  _updatedAt?: string;
  name: string;
  slug: SanitySlug;
  websiteUrl: string;
  logo: SanityImageReference;
  coverPhoto?: SanityImageReference;
  charityDescription: string;
  causeDescription: string;
  impactUnitName: string;
  impactMultiplierPerHkd: number;
  impactDisplayTemplate: string;
}

export interface JourneyStep {
  _key: string;
  stepNumber: string;
  title: string;
  description: string;
}

export interface FaqItem {
  _key: string;
  question: string;
  answer: string;
  category?: 'adoption' | 'logging' | 'charity' | 'general';
}

export interface SanitySiteCopy {
  _id: string;
  _type: 'siteCopy';
  announcementEnabled: boolean;
  announcementTickerText?: string;
  announcementTickerLink?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  totalKmCovered: number;
  totalRunsCompleted: number;
  totalParticipantsCount: number;
  countersSubtitle?: string;
  journeyHeadline: string;
  journeySteps: JourneyStep[];
  faqs?: FaqItem[];
  missionStatement?: string;
  essenceStatement?: string;
  actionSlogan?: string;
}
