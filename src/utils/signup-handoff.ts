/**
 * First-arrival handoff between the Adoption Portal and the confirmation page.
 *
 * The confirmation page has two arrival modes. Arriving straight from the
 * portal it plays a staged reveal and shows the address the confirmation was
 * sent to; arriving later from an emailed link it renders instantly and shows
 * neither the email nor the Runner's name, because that URL is a link anyone
 * holding it can open.
 *
 * The receipt is consumed on read, so refreshing the page is a later arrival
 * rather than a first one.
 *
 * This is also the only channel through which the Runner's name and email reach
 * the confirmation page. The page is addressed by Adopter ID, which is
 * sequential from a known seed and therefore guessable, so the server-rendered
 * HTML deliberately carries no personal detail — a guessed URL reveals an
 * adoption, never a person. Keep it that way: anything moved from here into the
 * page's props becomes readable by anyone who walks the sequence.
 */

const ARRIVAL_KEY = 'adoptarun_adoption_arrival';

export interface AdoptionReceipt {
  /** Canonical `NNNN-CC`; also the confirmation page this receipt belongs to. */
  adopterId: string;
  companionName: string;
  firstName: string;
  email: string;
  routeSlug: string;
  charitySlug: string;
  commitmentDays: number;
  targetDate: string;
  targetTime: string | null;
  targetHkd: number;
}

function readStored(): AdoptionReceipt | null {
  try {
    const raw = sessionStorage.getItem(ARRIVAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdoptionReceipt;
    return parsed && typeof parsed.adopterId === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function storeArrival(receipt: AdoptionReceipt): void {
  try {
    sessionStorage.setItem(ARRIVAL_KEY, JSON.stringify(receipt));
  } catch {
    // A blocked or full store costs the reveal, not the adoption.
  }
}

/** The receipt for this confirmation page, if the visitor just committed. */
export function peekArrival(adopterId: string): AdoptionReceipt | null {
  const stored = readStored();
  return stored && stored.adopterId === adopterId ? stored : null;
}

/**
 * The receipt for this confirmation page, cleared as it is handed over. A
 * receipt belonging to a different page is left where it is.
 */
export function consumeArrival(adopterId: string): AdoptionReceipt | null {
  const match = peekArrival(adopterId);
  if (!match) return null;

  try {
    sessionStorage.removeItem(ARRIVAL_KEY);
  } catch {
    // Nothing to do: the caller already holds the receipt.
  }

  return match;
}
