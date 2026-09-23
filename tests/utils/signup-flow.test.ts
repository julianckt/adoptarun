import { describe, it, expect } from 'vitest';
import {
  PANEL_ORDER,
  resolveEntry,
  advanceFrom,
  furthestLegalPanel,
  canJumpTo,
  panelFromStepParam,
  type FlowSelection,
} from '../../src/utils/signup-flow';
import type { PortalRoute } from '../../src/components/signup/types';

const routes = [
  { slug: 'sha-tin-boar', title: 'Sha Tin Boar' },
  { slug: 'kowloon-crane', title: 'Kowloon Crane' },
] as PortalRoute[];

const empty: FlowSelection = {
  routeSlug: null,
  charitySlug: null,
  detailsComplete: false,
};

const withRoute: FlowSelection = { ...empty, routeSlug: 'sha-tin-boar' };
const withCharity: FlowSelection = { ...withRoute, charitySlug: 'spca' };
const withDetails: FlowSelection = { ...withCharity, detailsComplete: true };

describe('resolveEntry', () => {
  it('always lands on the intro panel', () => {
    expect(resolveEntry({ params: new URLSearchParams(''), routes }).panel).toBe('intro');
    expect(
      resolveEntry({ params: new URLSearchParams('route=sha-tin-boar'), routes }).panel
    ).toBe('intro');
  });

  it('pre-selects a route named by the deep link', () => {
    const entry = resolveEntry({ params: new URLSearchParams('route=sha-tin-boar'), routes });

    expect(entry.routeSlug).toBe('sha-tin-boar');
    expect(entry.ctaLabel).toBe('adopt the sha tin boar');
    expect(entry.showChooseAnother).toBe(true);
  });

  it('invites a cold visitor to choose', () => {
    const entry = resolveEntry({ params: new URLSearchParams(''), routes });

    expect(entry.routeSlug).toBeNull();
    expect(entry.ctaLabel).toBe('choose a route');
    expect(entry.showChooseAnother).toBe(false);
  });

  it('ignores a route slug that matches no published Artwork', () => {
    const entry = resolveEntry({ params: new URLSearchParams('route=ghost-route'), routes });

    expect(entry.routeSlug).toBeNull();
    expect(entry.ctaLabel).toBe('choose a route');
  });

  it('ignores a charity deep link entirely', () => {
    const entry = resolveEntry({ params: new URLSearchParams('charity=spca'), routes });

    expect(entry.charitySlug).toBeNull();
    expect(entry.ctaLabel).toBe('choose a route');
  });
});

describe('advanceFrom', () => {
  it('sends a cold visitor from the intro to the route catalogue', () => {
    expect(advanceFrom('intro', empty)).toBe('route');
  });

  it('skips the catalogue when a route arrived with the visitor', () => {
    expect(advanceFrom('intro', withRoute)).toBe('charity');
  });

  it('walks the remaining panels in order', () => {
    expect(advanceFrom('route', withRoute)).toBe('charity');
    expect(advanceFrom('charity', withCharity)).toBe('details');
    expect(advanceFrom('details', withDetails)).toBe('commit');
  });

  it('stays put at the end of the flow', () => {
    expect(advanceFrom('commit', withDetails)).toBe('commit');
  });
});

describe('furthestLegalPanel', () => {
  it('holds an empty selection at the route catalogue', () => {
    expect(furthestLegalPanel('commit', empty)).toBe('route');
  });

  it('holds a route-only selection at the charity panel', () => {
    expect(furthestLegalPanel('details', withRoute)).toBe('charity');
  });

  it('holds a charity-paired selection at the details panel', () => {
    expect(furthestLegalPanel('commit', withCharity)).toBe('details');
  });

  it('permits the commit panel once details are complete', () => {
    expect(furthestLegalPanel('commit', withDetails)).toBe('commit');
  });

  it('never drags a visitor forward past where they are', () => {
    expect(furthestLegalPanel('charity', withDetails)).toBe('charity');
  });

  it('always permits the intro', () => {
    expect(furthestLegalPanel('intro', empty)).toBe('intro');
  });
});

describe('canJumpTo', () => {
  it('permits a change back to a satisfied panel', () => {
    expect(canJumpTo('route', withDetails)).toBe(true);
    expect(canJumpTo('charity', withDetails)).toBe(true);
  });

  it('refuses a jump to a panel whose prerequisites are unmet', () => {
    expect(canJumpTo('details', withRoute)).toBe(false);
    expect(canJumpTo('commit', withCharity)).toBe(false);
  });
});

describe('step parameters', () => {
  it('round-trips every panel', () => {
    for (const panel of PANEL_ORDER) {
      expect(panelFromStepParam(panel)).toBe(panel);
    }
  });

  it('falls back to the intro for an unknown or absent step', () => {
    expect(panelFromStepParam('nonsense')).toBe('intro');
    expect(panelFromStepParam(null)).toBe('intro');
  });
});
