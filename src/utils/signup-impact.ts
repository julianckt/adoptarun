/**
 * Target Impact Goal resolution for the Adoption Portal.
 *
 * The equivalency readout beneath the impact slider is authored by the client
 * in Sanity (`impactDisplayTemplate`, `impactUnitName`,
 * `impactMultiplierPerHkd`), so a Charity Cause describes its own impact in its
 * own words rather than the portal inventing a phrase for it.
 */
import { cleanStegaNumber, cleanStegaString } from '@/sanity/cleanStega';
import { calculateImpact, formatImpactDisplay } from '@/utils/charity-utils';

/** The equivalency fields a Charity Cause publishes in Sanity. */
export interface ImpactSource {
  impactUnitName?: string | null;
  impactMultiplierPerHkd?: number | null;
  impactDisplayTemplate?: string | null;
}

export const TARGET_HKD_MIN = 100;
export const TARGET_HKD_MAX = 2000;
export const TARGET_HKD_DEFAULT = 500;

export function clampTargetHkd(amount: number): number {
  if (!Number.isFinite(amount)) return TARGET_HKD_DEFAULT;
  return Math.min(TARGET_HKD_MAX, Math.max(TARGET_HKD_MIN, Math.round(amount)));
}

/**
 * The equivalency line for a paired Charity Cause at a given target amount, or
 * null when there is nothing honest to claim — no cause chosen yet, or a cause
 * that has not published a multiplier.
 */
export function resolveImpactReadout(
  charity: ImpactSource | null | undefined,
  targetHkd: number
): string | null {
  if (!charity) return null;

  const multiplier = cleanStegaNumber(charity.impactMultiplierPerHkd, 0);
  if (!multiplier || multiplier <= 0) return null;

  const amount = clampTargetHkd(targetHkd);
  const template = cleanStegaString(charity.impactDisplayTemplate || '').trim();
  if (template) {
    return formatImpactDisplay(template, amount, multiplier);
  }

  const formattedAmount = amount.toLocaleString('en-US');
  const unitName = cleanStegaString(charity.impactUnitName || '').trim();
  if (!unitName) {
    return `HK$${formattedAmount} towards this cause`;
  }

  const impact = calculateImpact(amount, multiplier).toLocaleString('en-US');
  return `HK$${formattedAmount} provides ${impact} ${unitName}`;
}
