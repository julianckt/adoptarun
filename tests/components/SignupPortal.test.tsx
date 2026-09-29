import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SignupStepper from '../../src/components/signup/SignupStepper';
import CommitPanel from '../../src/components/signup/CommitPanel';
import DetailsPanel from '../../src/components/signup/DetailsPanel';
import type { PortalCharity, PortalRoute } from '../../src/components/signup/types';

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
  startPoint: null,
  meetupPoint: null,
  miniMapSvg: null,
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

describe('SignupStepper', () => {
  it('is absent on the intro, where nothing has been decided', () => {
    const { container } = render(<SignupStepper panel="intro" />);

    expect(container.innerHTML).toBe('');
  });

  it('names the panel the visitor is on, and its position in the flow', () => {
    render(<SignupStepper panel="details" />);

    expect(
      screen.getByRole('group', { name: 'Adoption progress: step 3 of 4, enter details' })
    ).toBeTruthy();
  });

  it('marks exactly one graduation as current', () => {
    const { container } = render(<SignupStepper panel="details" />);

    expect(container.querySelectorAll('[data-state=\'current\']')).toHaveLength(1);
    expect(container.querySelectorAll('[data-state=\'done\']')).toHaveLength(2);
  });

  it('stays on screen at the last step, where it reassures', () => {
    render(<SignupStepper panel="commit" />);

    expect(
      screen.getByRole('group', { name: 'Adoption progress: step 4 of 4, commit & adopt' })
    ).toBeTruthy();
  });

  it('offers nothing to activate: navigation belongs to the change controls', () => {
    render(<SignupStepper panel="details" />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('DetailsPanel', () => {
  const baseProps = {
    firstName: 'Peter',
    lastName: 'Chan',
    email: 'peter@example.com',
    commitmentDays: 5,
    targetHkd: 500,
    errors: {},
    showTimeframeSlider: true,
    targetDate: '2026-03-15',
    targetTime: null,
    impactReadout: 'HK$500 feeds 250 rescued animals',
    onField: () => {},
    onCommitmentDays: () => {},
    onTargetHkd: () => {},
    onContinue: () => {},
  };

  it('announces the impact slider by what the money does, not by its number', () => {
    const { container } = render(<DetailsPanel {...baseProps} />);

    const label = container.querySelector('label[for="signup-target"]');
    expect(label?.textContent).toBe('your target fundraising goal');
    expect(label?.className).toBe('signup-slider-intro');
    expect(container.querySelectorAll('p.signup-slider-intro')).toHaveLength(0);

    expect(screen.getByLabelText('your target fundraising goal').getAttribute('aria-valuetext')).toBe(
      'HK$500 feeds 250 rescued animals'
    );
  });

  it('announces the timeframe slider in days', () => {
    const { container } = render(<DetailsPanel {...baseProps} />);

    const label = container.querySelector('label[for="signup-timeframe"]');
    expect(label?.textContent).toBe('your target run-by date');
    expect(label?.className).toBe('signup-slider-intro');

    expect(screen.getByLabelText('your target run-by date').getAttribute('aria-valuetext')).toBe(
      '5 days'
    );
  });

  it('drops the timeframe slider entirely for a scheduled group run', () => {
    render(<DetailsPanel {...baseProps} showTimeframeSlider={false} />);

    expect(screen.queryByLabelText('your target run-by date')).toBeNull();
    expect(screen.queryByLabelText('your target fundraising goal')).not.toBeNull();
  });

  it('ties a field error to the field it belongs to', () => {
    render(<DetailsPanel {...baseProps} errors={{ email: 'That email address looks incomplete.' }} />);

    const field = screen.getByLabelText('email');
    expect(field.getAttribute('aria-invalid')).toBe('true');

    const describedBy = field.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toBe(
      'That email address looks incomplete.'
    );
  });
});

describe('CommitPanel', () => {
  const commitButton = () =>
    screen.getByRole('button', { name: /confirm & commit/i }) as HTMLButtonElement;

  const baseProps = {
    route,
    charity,
    runnerName: 'Peter Chan',
    email: 'peter@example.com',
    targetDate: '2026-03-15',
    targetTime: null,
    targetHkd: 500,
    impactReadout: 'HK$500 feeds 250 rescued animals',
    companionName: '',
    companionError: null,
    commitError: null,
    isCommitting: false,
    onCompanionName: () => {},
    onChange: () => {},
    onCommit: () => {},
  };

  it('refuses to commit an unnamed companion', () => {
    render(<CommitPanel {...baseProps} />);

    expect(commitButton().disabled).toBe(true);
  });

  it('opens the commitment once the companion is named', () => {
    render(<CommitPanel {...baseProps} companionName="Mochi" />);

    expect(commitButton().disabled).toBe(false);
  });

  it('offers a change for every row it is asking to confirm', () => {
    const jumps: string[] = [];
    render(
      <CommitPanel
        {...baseProps}
        companionName="Mochi"
        onChange={(panel) => jumps.push(panel)}
      />
    );

    const changes = screen.getAllByRole('button', { name: /^change/i });
    expect(changes).toHaveLength(5);

    changes.forEach((button) => fireEvent.click(button));
    expect(jumps).toEqual(['route', 'charity', 'details', 'details', 'details']);
  });

  it('announces a failed commitment without taking the visitor anywhere', () => {
    render(
      <CommitPanel
        {...baseProps}
        companionName="Mochi"
        commitError="We could not complete your adoption just now."
      />
    );

    expect(screen.getByRole('alert').textContent).toContain(
      'We could not complete your adoption just now.'
    );
    expect((screen.getByLabelText('name your companion') as HTMLInputElement).value).toBe('Mochi');
  });

  it('locks the button while the commitment is in flight', () => {
    render(<CommitPanel {...baseProps} companionName="Mochi" isCommitting />);

    expect(commitButton().disabled).toBe(true);
  });

  it('renders "Group Run" tag when route is a scheduled group run', () => {
    const groupRunRoute: PortalRoute = {
      ...route,
      isGroupRun: true,
      groupRunDateTime: '2026-03-14T07:30:00+08:00',
    };
    const { container } = render(
      <CommitPanel
        {...baseProps}
        route={groupRunRoute}
        targetDate="2026-03-14"
        targetTime="07:30am"
      />
    );

    const groupRunSpan = container.querySelector('.text-route-group-run');
    expect(groupRunSpan).not.toBeNull();
    expect(groupRunSpan?.textContent).toBe('Group Run');
  });

  it('omits "Group Run" tag for solo route', () => {
    const { container } = render(<CommitPanel {...baseProps} />);

    expect(container.querySelector('.text-route-group-run')).toBeNull();
  });
});
