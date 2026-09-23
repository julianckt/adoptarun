import { describe, it, expect } from 'vitest';
import {
  resolveImpactReadout,
  clampTargetHkd,
  TARGET_HKD_MIN,
  TARGET_HKD_MAX,
  TARGET_HKD_DEFAULT,
} from '../../src/utils/signup-impact';
import type { ImpactSource } from '../../src/utils/signup-impact';

const spca: ImpactSource = {
  impactUnitName: 'meals',
  impactMultiplierPerHkd: 0.5,
  impactDisplayTemplate: 'HK${amount} feeds {impact} rescued animals',
};

describe('resolveImpactReadout', () => {
  it('renders the charity template with the amount and derived impact', () => {
    // 500 x 0.5 = 250.
    expect(resolveImpactReadout(spca, 500)).toBe('HK$500 feeds 250 rescued animals');
  });

  it('falls back to the impact unit name when the charity has no template', () => {
    const untemplated: ImpactSource = { ...spca, impactDisplayTemplate: '' };

    expect(resolveImpactReadout(untemplated, 500)).toBe('HK$500 provides 250 meals');
  });

  it('falls back again when the charity has neither template nor unit name', () => {
    const bare: ImpactSource = {
      ...spca,
      impactDisplayTemplate: '',
      impactUnitName: '',
    };

    expect(resolveImpactReadout(bare, 500)).toBe('HK$500 towards this cause');
  });

  it('returns null when no charity is paired yet', () => {
    expect(resolveImpactReadout(null, 500)).toBeNull();
  });

  it('returns null when the charity carries no usable multiplier', () => {
    const unmeasured: ImpactSource = { ...spca, impactMultiplierPerHkd: 0 };

    expect(resolveImpactReadout(unmeasured, 500)).toBeNull();
  });

  it('groups thousands in both the amount and the impact', () => {
    const generous: ImpactSource = { ...spca, impactMultiplierPerHkd: 4 };

    expect(resolveImpactReadout(generous, 2000)).toBe('HK$2,000 feeds 8,000 rescued animals');
  });
});

describe('clampTargetHkd', () => {
  it('holds amounts inside the permitted range', () => {
    expect(clampTargetHkd(50)).toBe(TARGET_HKD_MIN);
    expect(clampTargetHkd(5000)).toBe(TARGET_HKD_MAX);
    expect(clampTargetHkd(750)).toBe(750);
  });

  it('falls back to the default for an unusable amount', () => {
    expect(clampTargetHkd(Number.NaN)).toBe(TARGET_HKD_DEFAULT);
  });
});
