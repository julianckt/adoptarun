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
 * Format route estimated duration into standard display string (e.g. '45min', '1hr', '1hr25min') or null if empty/0.
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
  const minutes =
    typeof estimatedDurationMin === 'number'
      ? estimatedDurationMin
      : parseInt(String(estimatedDurationMin).replace(/min|hr|h|m/gi, '').trim(), 10);

  if (Number.isNaN(minutes) || minutes <= 0) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}hr${remainingMinutes}min`;
  }
  if (hours > 0) {
    return `${hours}hr`;
  }
  return `${remainingMinutes}min`;
}

/**
 * Format route elevation gain into standard display string (e.g. '±4m', '±120m') or null if empty.
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
  const numericVal =
    typeof elevationGainM === 'number'
      ? elevationGainM
      : parseFloat(String(elevationGainM).replace(/[±+\-m]/g, '').trim());

  if (Number.isNaN(numericVal)) {
    return null;
  }

  const rounded = Math.round(Math.abs(numericVal));
  return `±${rounded}m`;
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

