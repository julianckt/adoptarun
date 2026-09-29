import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ConfirmationView from '../../src/components/signup/ConfirmationView';
import { storeArrival } from '../../src/utils/signup-handoff';
import type { ConfirmationRecord } from '../../src/utils/signup-confirmation';
import type { PortalCharity, PortalRoute } from '../../src/components/signup/types';

const ADOPTER_ID = '1104-PC';

const record: ConfirmationRecord = {
  adopterId: ADOPTER_ID,
  companionName: 'Mochi',
  routeSlug: 'sha-tin-boar',
  charitySlug: 'spca',
  commitmentDays: 5,
  targetDate: '2026-03-15',
  targetTime: null,
  targetHkd: 500,
};

const route: PortalRoute = {
  slug: 'sha-tin-boar',
  title: 'Sha Tin Boar',
  district: 'Sha Tin',
  blurb: null,
  distanceKm: 14,
  elevationGain: 220,
  estimatedDurationMin: 95,
  difficulty: 'intermediate',
  isGroupRun: false,
  groupRunDateTime: null,
  startPoint: 'Sha Tin Park main gate',
  meetupPoint: null,
  miniMapSvg: null,
};

const charity: PortalCharity = {
  slug: 'spca',
  name: 'SPCA',
  logoSrc: null,
  logoAlt: 'SPCA logo',
  charityDescription: null,
  causeDescription: null,
  impactUnitName: 'meals',
  impactMultiplierPerHkd: 0.5,
  impactDisplayTemplate: 'HK${amount} feeds {impact} rescued animals',
};

const otherRoute: PortalRoute = {
  ...route,
  slug: 'kowloon-crane',
  title: 'Kowloon Crane',
  district: 'Kowloon City',
};

function renderView() {
  return render(
    <ConfirmationView
      adopterId={ADOPTER_ID}
      record={record}
      routes={[route, otherRoute]}
      charity={charity}
      pageUrl={`https://adoptarun.org/signup/confirmed/${ADOPTER_ID}`}
    />
  );
}

function storeMatchingArrival() {
  storeArrival({
    adopterId: record.adopterId,
    companionName: record.companionName,
    firstName: 'Peter',
    email: 'peter.chan@example.com',
    routeSlug: record.routeSlug,
    charitySlug: record.charitySlug,
    commitmentDays: record.commitmentDays,
    targetDate: record.targetDate,
    targetTime: record.targetTime,
    targetHkd: record.targetHkd ?? 500,
  });
}

describe('ConfirmationView', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('arriving straight from the portal', () => {
    it('names the address the confirmation was sent to', () => {
      storeMatchingArrival();
      renderView();

      expect(screen.getByText(/peter\.chan@example\.com/)).toBeTruthy();
    });

    it("ignores a receipt belonging to another Adopter's page", () => {
      storeArrival({
        adopterId: '1317-AW',
        companionName: 'Biscuit',
        firstName: 'Ada',
        email: 'ada.wong@example.com',
        routeSlug: 'kowloon-crane',
        charitySlug: 'spca',
        commitmentDays: 9,
        targetDate: '2026-04-02',
        targetTime: null,
        targetHkd: 1200,
      });

      renderView();

      // The adoption on screen is the one D1 returned for this URL.
      expect(screen.getByText(ADOPTER_ID)).toBeTruthy();
      expect(screen.queryByText('1317-AW')).toBeNull();
      // And the other Adopter's email never surfaces.
      expect(screen.queryByText(/ada\.wong@example\.com/)).toBeNull();
    });

    it('plays the staged reveal', () => {
      storeMatchingArrival();
      const { container } = renderView();

      expect(container.querySelector('.confirmed')?.getAttribute('data-reveal')).toBe('true');
    });
  });

  describe('arriving later from an emailed link', () => {
    it('withholds the email address, which the URL holder may not own', () => {
      renderView();

      expect(screen.queryByText(/example\.com/)).toBeNull();
    });

    it('never shows the Runner name', () => {
      renderView();

      expect(screen.queryByText(/Peter/)).toBeNull();
    });

    it('renders at once rather than performing', () => {
      const { container } = renderView();

      expect(container.querySelector('.confirmed')?.getAttribute('data-reveal')).toBe('false');
    });
  });

  it('treats a refresh as a return visit, not a replay', () => {
    storeMatchingArrival();
    renderView();
    cleanup();

    const { container } = renderView();

    expect(screen.queryByText(/peter\.chan@example\.com/)).toBeNull();
    expect(container.querySelector('.confirmed')?.getAttribute('data-reveal')).toBe('false');
  });

  it('shows the adoption itself in both arrivals', () => {
    renderView();

    expect(screen.getByText(ADOPTER_ID)).toBeTruthy();
    expect(screen.getByText(/Mochi is waiting/)).toBeTruthy();
    expect(screen.getByText('Sha Tin Boar')).toBeTruthy();
    expect(screen.getByText('HK$500 feeds 250 rescued animals')).toBeTruthy();
  });

  it('renders "Group Run" tag when the adoption is on a group run route', () => {
    const groupRunRoute: PortalRoute = {
      ...route,
      slug: 'group-run-route',
      isGroupRun: true,
      groupRunDateTime: '2026-03-14T07:30:00+08:00',
    };
    const groupRecord: ConfirmationRecord = {
      ...record,
      routeSlug: 'group-run-route',
      targetDate: '2026-03-14',
      targetTime: '07:30am',
    };

    const { container } = render(
      <ConfirmationView
        adopterId={ADOPTER_ID}
        record={groupRecord}
        routes={[groupRunRoute]}
        charity={charity}
        pageUrl={`https://adoptarun.org/signup/confirmed/${ADOPTER_ID}`}
      />
    );

    const groupRunSpan = container.querySelector('.text-route-group-run');
    expect(groupRunSpan).not.toBeNull();
    expect(groupRunSpan?.textContent).toBe('Group Run');
  });

  it('omits "Group Run" tag for solo route in confirmation', () => {
    const { container } = renderView();

    expect(container.querySelector('.text-route-group-run')).toBeNull();
  });
});
