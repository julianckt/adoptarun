/**
 * Route Auto-Naming & Slug Generation Utilities
 *
 * Implements deterministic title formatting, duplicate name suffixing,
 * and URL-safe slug generation for Sanity Route documents.
 */

/**
 * Combines district and animal type into a standard base route title.
 * Returns empty string if either value is absent or whitespace-only.
 *
 * @example
 * formatBaseTitle('Wan Chai', 'Dog') // 'Wan Chai Dog'
 * formatBaseTitle('The Peak', 'Cat') // 'The Peak Cat'
 */
export function formatBaseTitle(district?: string, animalType?: string): string {
  const cleanDistrict = district?.trim();
  const cleanAnimalType = animalType?.trim();

  if (!cleanDistrict || !cleanAnimalType) {
    return '';
  }

  return `${cleanDistrict} ${cleanAnimalType} Run`;
}

/**
 * Calculates the next title according to duplicate numbering rules:
 * - The original route has NO number (e.g. "Wan Chai Dog").
 * - The first duplicate becomes "Base 2" (e.g. "Wan Chai Dog 2").
 * - Subsequent duplicates become "Base 3", "Base 4", etc.
 * - If gaps exist in the numbering (e.g. 1 and 3 exist), it fills the lowest available index (2).
 * - Only exact matches for `${baseTitle}` or `${baseTitle} <number>` are counted.
 *
 * @param baseTitle The base unnumbered companion title (e.g. "Wan Chai Dog").
 * @param existingTitles Array of companion titles from other routes in the dataset.
 */
export function calculateNextDuplicateTitle(
  baseTitle: string,
  existingTitles: (string | undefined | null)[]
): string {
  const normalizedBase = baseTitle.trim();
  if (!normalizedBase) return '';

  // Escape special regex characters in baseTitle to prevent injection
  const escapedBase = normalizedBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match exact base title (case-insensitive) or base title followed by a space and digits
  const regex = new RegExp(`^${escapedBase}(?:\\s+(\\d+))?$`, 'i');

  const numbersUsed = new Set<number>();
  let baseTitleExists = false;

  for (const rawTitle of existingTitles) {
    if (!rawTitle) continue;
    const title = rawTitle.trim();
    const match = title.match(regex);
    if (match) {
      if (match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num >= 2) {
          numbersUsed.add(num);
        }
      } else {
        baseTitleExists = true;
      }
    }
  }

  // If the base title doesn't exist yet, return unnumbered base
  if (!baseTitleExists) {
    return normalizedBase;
  }

  // Find lowest available integer starting at 2
  let nextNum = 2;
  while (numbersUsed.has(nextNum)) {
    nextNum++;
  }

  return `${normalizedBase} ${nextNum}`;
}

/**
 * Converts a companion title into a Sanity-compliant slug string:
 * - Lowercase alphanumeric characters with hyphens only (/^[a-z0-9-]+$/)
 * - Converts '&' to 'and'
 * - Collapses consecutive hyphens and trims leading/trailing hyphens
 * - Caps maximum length at 96 characters
 *
 * @example
 * generateSlug('Wan Chai Dog') // 'wan-chai-dog'
 * generateSlug('Wan Chai Dog 2') // 'wan-chai-dog-2'
 * generateSlug('Central & Western Dog') // 'central-and-western-dog'
 */
export function generateSlug(title: string): string {
  if (!title) return '';

  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);

  // If slicing ends with a trailing hyphen, strip it
  return normalized.replace(/-+$/, '');
}

/**
 * Queries Sanity for titles of other route documents that match the base title pattern.
 * Excludes both draft and published versions of currentDocId to avoid self-collision.
 */
export async function fetchMatchingRouteTitles(
  client: any,
  baseTitle: string,
  currentDocId?: string
): Promise<string[]> {
  if (!client || !baseTitle) return [];

  // Determine draft and published IDs for exclusion
  const cleanId = currentDocId ? currentDocId.replace(/^drafts\./, '') : '';
  const draftId = cleanId ? `drafts.${cleanId}` : '__none__';
  const publishedId = cleanId || '__none__';

  const query = `*[_type == "route" && !(_id in [$draftId, $publishedId]) && (title == $baseTitle || title match $searchPattern)]{
    title
  }`;

  const params = {
    baseTitle: baseTitle.trim(),
    searchPattern: `${baseTitle.trim()}*`,
    draftId,
    publishedId,
  };

  try {
    const results: Array<{ title?: string }> = await client.fetch(query, params);
    return results.map((r) => r.title).filter((t): t is string => Boolean(t));
  } catch (err) {
    console.error('[fetchMatchingRouteTitles] Failed to fetch existing routes:', err);
    return [];
  }
}
