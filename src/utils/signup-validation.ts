/**
 * Runner detail validation for the Adoption Portal.
 *
 * ASCII is a hard requirement rather than a preference: the two trailing
 * characters of an Adopter ID (`NNNN-CC`) are the Runner's uppercase initials,
 * so a name outside ASCII cannot produce a usable ID.
 */

export interface RunnerDetails {
  firstName: string;
  lastName: string;
  email: string;
}

export type RunnerDetailField = keyof RunnerDetails;

export interface RunnerDetailsValidation {
  isValid: boolean;
  errors: Partial<Record<RunnerDetailField, string>>;
}

const ASCII_ONLY = /^[\x20-\x7E]*$/;

/**
 * Master spec §Initials Rule: names enforce ASCII alphabetic characters, since
 * the first letter of each becomes half of an Adopter ID's `CC`. Spaces,
 * hyphens and apostrophes are allowed after that first letter, because real
 * names carry them and the initial is taken from position zero regardless.
 */
const ASCII_NAME = /^[A-Za-z][A-Za-z '-]*$/;

/** Deliberately permissive: shape only, since delivery is the real proof. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const MESSAGES = {
  firstNameMissing: 'Enter your first name.',
  lastNameMissing: 'Enter your last name.',
  nameNonAscii: 'Use English letters only — your initials become part of your Adopter ID.',
  emailMissing: 'Enter your email so we can send your Adopter ID.',
  emailNonAscii: 'Use English letters only in your email address.',
  emailShape: 'That email address looks incomplete.',
  companionMissing: 'Name your companion to complete the adoption.',
} as const;

function validateName(value: string, missingMessage: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return missingMessage;
  if (!ASCII_NAME.test(trimmed)) return MESSAGES.nameNonAscii;
  return null;
}

function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return MESSAGES.emailMissing;
  if (!ASCII_ONLY.test(trimmed)) return MESSAGES.emailNonAscii;
  if (!EMAIL_SHAPE.test(trimmed)) return MESSAGES.emailShape;
  return null;
}

export function validateRunnerDetails(details: RunnerDetails): RunnerDetailsValidation {
  const errors: Partial<Record<RunnerDetailField, string>> = {};

  const firstName = validateName(details.firstName ?? '', MESSAGES.firstNameMissing);
  if (firstName) errors.firstName = firstName;

  const lastName = validateName(details.lastName ?? '', MESSAGES.lastNameMissing);
  if (lastName) errors.lastName = lastName;

  const email = validateEmail(details.email ?? '');
  if (email) errors.email = email;

  return { isValid: Object.keys(errors).length === 0, errors };
}

/** The Companion Name is strictly required before an adoption can be committed. */
export function validateCompanionName(name: string): string | null {
  return (name ?? '').trim() ? null : MESSAGES.companionMissing;
}
