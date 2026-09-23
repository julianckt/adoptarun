/**
 * The Adoption Portal's call to the adoption backend.
 *
 * Deliberately thin. Everything that decides what an adoption *is* — the
 * Adopter ID, the target date's authority, whether the email went out — lives
 * on the server; this only carries the Runner's intent there and brings back
 * the identity it was given.
 *
 * It throws rather than returning a failure shape. An adoption that did not
 * reach D1 has not happened, and the portal must not navigate on to a
 * confirmation page for a commitment that does not exist. The caller races
 * this against the commit beat, so there is no artificial delay here.
 */

export interface AdoptionSubmission {
  firstName: string;
  lastName: string;
  email: string;
  routeSlug: string;
  charitySlug: string;
  commitmentDays: number;
  targetDate: string;
  targetHkd: number;
  companionName: string;
}

export interface AdoptionResult {
  /** Canonical `NNNN-CC`; also the confirmation page's address. */
  adopterId: string;
}

export async function submitAdoption(
  submission: AdoptionSubmission
): Promise<AdoptionResult> {
  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    throw new Error(`Adoption was not recorded (${response.status}).`);
  }

  const result = (await response.json()) as Partial<AdoptionResult>;
  if (!result?.adopterId) {
    throw new Error('Adoption response carried no Adopter ID.');
  }

  return { adopterId: result.adopterId };
}
