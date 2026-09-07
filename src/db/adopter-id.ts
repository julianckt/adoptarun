/**
 * Extracts 2-letter uppercase ASCII initials from runner names.
 * Formula: (firstName[0] + (lastName[0] || firstName[1] || 'A')).toUpperCase()
 * Strips whitespace, accents, and non-ASCII characters.
 */
export function extractInitials(firstName: string, lastName?: string | null): string {
  const cleanFirst = (firstName || '').trim().replace(/[^a-zA-Z]/g, '');
  const cleanLast = (lastName || '').trim().replace(/[^a-zA-Z]/g, '');

  const firstChar = cleanFirst[0] ? cleanFirst[0].toUpperCase() : 'A';
  const secondChar = cleanLast[0]
    ? cleanLast[0].toUpperCase()
    : cleanFirst[1]
      ? cleanFirst[1].toUpperCase()
      : 'A';

  return `${firstChar}${secondChar}`;
}

/**
 * Formats sequence number and initials into canonical Adopter ID: `NNNN-CC`
 * `NNNN = lpad(current_val, 4, '0')` (expands to 5+ digits if sequence exceeds 9999).
 */
export function formatAdopterId(
  seqNum: number,
  firstName: string,
  lastName?: string | null
): string {
  const paddedSeq = String(seqNum).padStart(4, '0');
  const initials = extractInitials(firstName, lastName);
  return `${paddedSeq}-${initials}`;
}

/**
 * Validates whether string is a canonical Adopter ID (`NNNN-CC`).
 */
export function isValidAdopterId(adopterId: string): boolean {
  return /^(\d{4,})-([A-Z]{2})$/.test(adopterId.trim());
}

/**
 * Parses canonical Adopter ID into sequence number and initials.
 */
export function parseAdopterId(
  adopterId: string
): { seqNum: number; initials: string } | null {
  const match = adopterId.trim().match(/^(\d{4,})-([A-Z]{2})$/);
  if (!match) return null;
  return {
    seqNum: parseInt(match[1], 10),
    initials: match[2],
  };
}

/**
 * Generates pseudo-random jump in range [1, 4] for sequence increments.
 */
export function getRandomJump(): number {
  return Math.floor(Math.random() * 4) + 1;
}

/**
 * Resolves the next run ID for an Adopter ID given a list of existing run IDs.
 * - If baseAdopterId does not exist in existingRunIds: returns baseAdopterId (e.g. '1200-JC')
 * - If baseAdopterId exists: returns next sequential suffix (e.g. '1200-JC-2', '1200-JC-3')
 */
export function resolveNextRunId(baseAdopterId: string, existingRunIds: string[]): string {
  const trimmedBase = baseAdopterId.trim();
  const normalizedExisting = existingRunIds.map((id) => id.trim());

  if (!normalizedExisting.includes(trimmedBase)) {
    return trimmedBase;
  }

  // Find all existing suffixes for this base ID
  const escapedBase = trimmedBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const suffixPattern = new RegExp(`^${escapedBase}-(\\d+)$`);

  let maxSuffix = 1; // Base run counts as run 1
  for (const id of normalizedExisting) {
    const match = id.match(suffixPattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSuffix) {
        maxSuffix = num;
      }
    }
  }

  return `${trimmedBase}-${maxSuffix + 1}`;
}
