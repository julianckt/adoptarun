/**
 * Format route distance into standard display string (e.g. '14.0km', '5.2km').
 */
export function formatRouteDistance(distanceKm: number | string | undefined | null): string {
  if (distanceKm === null || distanceKm === undefined || distanceKm === '') {
    return '';
  }
  const numericVal =
    typeof distanceKm === 'number'
      ? distanceKm
      : parseFloat(String(distanceKm).replace(/km/i, '').trim());

  if (Number.isNaN(numericVal)) {
    return '';
  }
  return `${numericVal.toFixed(1)}km`;
}

/**
 * Format route estimated duration into standard display string (e.g. '10min') or null if empty.
 */
export function formatRouteDuration(
  estimatedDurationMin?: number | string | null
): string | null {
  if (
    estimatedDurationMin === undefined ||
    estimatedDurationMin === null ||
    estimatedDurationMin === ''
  ) {
    return null;
  }
  if (typeof estimatedDurationMin === 'number') {
    return `${estimatedDurationMin}min`;
  }
  const str = String(estimatedDurationMin).trim();
  if (!str) return null;
  return str.endsWith('min') ? str : `${str}min`;
}

/**
 * Format route elevation gain into standard display string (e.g. '+4m', '-2m') or null if empty.
 */
export function formatRouteElevation(
  elevationGainM?: number | string | null
): string | null {
  if (
    elevationGainM === undefined ||
    elevationGainM === null ||
    elevationGainM === ''
  ) {
    return null;
  }
  if (typeof elevationGainM === 'number') {
    return elevationGainM >= 0 ? `+${elevationGainM}m` : `${elevationGainM}m`;
  }
  let str = String(elevationGainM).trim();
  if (!str) return null;
  if (!str.startsWith('+') && !str.startsWith('-')) {
    str = `+${str}`;
  }
  return str.endsWith('m') ? str : `${str}m`;
}

/**
 * Format route difficulty into capitalized display string (e.g. 'beginner' -> 'Beginner').
 */
export function formatRouteDifficulty(difficulty: string = 'beginner'): string {
  if (!difficulty) return '';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

/**
 * Format subtitle or fallback to joined tags (e.g. 'Tag1 · Tag2').
 */
export function formatRouteSubtitle(subtitle?: string, tags: string[] = []): string {
  return subtitle || (tags.length > 0 ? tags.join(' · ') : '');
}

/**
 * Format route tags into dot-separated display string (e.g. 'Scenic · Waterfront') or empty string if empty.
 */
export function formatRouteTags(tags?: string[] | null): string {
  if (!tags || tags.length === 0) {
    return '';
  }
  return tags.filter(Boolean).join(' · ');
}

