import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SummaryRail from '../../src/components/signup/SummaryRail';
import type { PortalCharity, PortalRoute } from '../../src/components/signup/types';

const soloRoute: PortalRoute = {
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
  startPoint: null,
  meetupPoint: null,
  miniMapSvg: null,
};

const groupRunRoute: PortalRoute = {
  ...soloRoute,
  isGroupRun: true,
  groupRunDateTime: '2026-03-14T07:30:00+08:00',
};

const charity: PortalCharity = {
  slug: 'spca',
  name: 'SPCA',
  logoSrc: null,
  logoAlt: 'SPCA logo',
  charityDescription: 'Hong Kong animal welfare.',
  causeDescription: 'Rescue and rehoming.',
  impactUnitName: 'meals',
  impactMultiplierPerHkd: 0.5,
  impactDisplayTemplate: 'HK${amount} feeds {impact} rescued animals',
};

describe('SummaryRail', () => {
  it('renders "Group Run" tag with text-route-group-run class on details panel when route is group run', () => {
    const { container } = render(
      <SummaryRail
        panel="details"
        route={groupRunRoute}
        charity={charity}
        targetDate="2026-03-14"
        targetTime="07:30am"
        targetHkd={500}
        onChange={() => {}}
      />
    );

    const groupRunSpan = container.querySelector('.text-route-group-run');
    expect(groupRunSpan).not.toBeNull();
    expect(groupRunSpan?.textContent).toBe('Group Run');
  });

  it('does not render "Group Run" tag for solo adoption', () => {
    const { container } = render(
      <SummaryRail
        panel="details"
        route={soloRoute}
        charity={charity}
        targetDate="2026-03-15"
        targetTime={null}
        targetHkd={500}
        onChange={() => {}}
      />
    );

    expect(container.querySelector('.text-route-group-run')).toBeNull();
  });

  it('renders only the rail container without title/artwork/rows on route and commit panels (mobile stepper-only mode)', () => {
    const { container, rerender } = render(
      <SummaryRail
        panel="route"
        route={groupRunRoute}
        charity={charity}
        targetDate="2026-03-14"
        targetTime="07:30am"
        targetHkd={500}
        onChange={() => {}}
      />
    );

    const rail = container.querySelector('.signup-rail');
    expect(rail).not.toBeNull();
    expect(rail?.getAttribute('data-panel')).toBe('route');
    expect(container.querySelector('.signup-rail-title')).toBeNull();
    expect(container.querySelector('.signup-rail-rows')).toBeNull();

    rerender(
      <SummaryRail
        panel="commit"
        route={groupRunRoute}
        charity={charity}
        targetDate="2026-03-14"
        targetTime="07:30am"
        targetHkd={500}
        onChange={() => {}}
      />
    );

    expect(rail?.getAttribute('data-panel')).toBe('commit');
    expect(container.querySelector('.signup-rail-title')).toBeNull();
    expect(container.querySelector('.signup-rail-rows')).toBeNull();
  });
});
