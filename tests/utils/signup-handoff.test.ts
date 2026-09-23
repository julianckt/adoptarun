import { describe, it, expect, beforeEach } from 'vitest';
import {
  storeArrival,
  consumeArrival,
  peekArrival,
  type AdoptionReceipt,
} from '../../src/utils/signup-handoff';

const receipt: AdoptionReceipt = {
  adopterId: '1104-PC',
  companionName: 'Mochi',
  firstName: 'Peter',
  email: 'peter.chan@example.com',
  routeSlug: 'sha-tin-boar',
  charitySlug: 'spca',
  commitmentDays: 5,
  targetDate: '2026-03-15',
  targetTime: null,
  targetHkd: 500,
};

describe('adoption handoff', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('reports no arrival when nothing was stored', () => {
    expect(consumeArrival('1104-PC')).toBeNull();
  });

  it('hands the receipt to the confirmation page it was stored for', () => {
    storeArrival(receipt);

    expect(consumeArrival('1104-PC')).toEqual(receipt);
  });

  it('is consumed once, so a refresh is no longer a first arrival', () => {
    storeArrival(receipt);
    consumeArrival('1104-PC');

    expect(consumeArrival('1104-PC')).toBeNull();
  });

  it('withholds the receipt from another Adopter\u2019s confirmation page', () => {
    storeArrival(receipt);

    expect(consumeArrival('1105-AB')).toBeNull();
  });

  it('leaves the receipt in place for a mismatched Adopter ID, so the right page still gets it', () => {
    storeArrival(receipt);
    consumeArrival('1105-AB');

    expect(consumeArrival('1104-PC')).toEqual(receipt);
  });

  it('can be inspected without consuming it', () => {
    storeArrival(receipt);

    expect(peekArrival('1104-PC')).toEqual(receipt);
    expect(consumeArrival('1104-PC')).toEqual(receipt);
  });

  it('survives unreadable storage without throwing', () => {
    sessionStorage.setItem('adoptarun_adoption_arrival', 'not json');

    expect(() => consumeArrival('1104-PC')).not.toThrow();
    expect(consumeArrival('1104-PC')).toBeNull();
  });
});
