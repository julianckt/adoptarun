/**
 * Panel sequencing for the Adoption Portal.
 *
 * The portal is one continuous world seen through five panels. Movement along
 * the horizontal axis is owned by the flow, never by a gesture, and means
 * exactly one thing: a decision was made. This module holds that sequencing as
 * pure logic so the controller island, the browser's back button, and a pasted
 * URL all resolve through one place.
 */
import type { PortalRoute } from '@/components/signup/types';

export const PANEL_ORDER = ['intro', 'route', 'charity', 'details', 'commit'] as const;
export type PanelId = (typeof PANEL_ORDER)[number];

export interface FlowSelection {
  routeSlug: string | null;
  charitySlug: string | null;
  detailsComplete: boolean;
}

export interface EntryResolution {
  panel: PanelId;
  routeSlug: string | null;
  charitySlug: null;
  ctaLabel: string;
  showChooseAnother: boolean;
}

/** What each panel needs before a visitor may legally stand on it. */
const PREREQUISITES: Record<PanelId, (selection: FlowSelection) => boolean> = {
  intro: () => true,
  route: () => true,
  charity: (s) => Boolean(s.routeSlug),
  details: (s) => Boolean(s.routeSlug && s.charitySlug),
  commit: (s) => Boolean(s.routeSlug && s.charitySlug && s.detailsComplete),
};

export function indexOfPanel(panel: PanelId): number {
  return PANEL_ORDER.indexOf(panel);
}

export function panelFromStepParam(step: string | null | undefined): PanelId {
  const match = PANEL_ORDER.find((panel) => panel === step);
  return match ?? 'intro';
}

function routeTitleFor(routes: PortalRoute[], slug: string): string | null {
  const match = routes.find((route) => route.slug === slug);
  return match?.title?.trim() || null;
}

/**
 * Where a visitor starts, and what the intro panel offers them.
 *
 * Everyone lands on the intro: a deep-linked visitor is greeted by the Artwork
 * they clicked rather than dropped into the middle of a flow with no bearings.
 * A `charity` parameter is deliberately ignored — only the route deep link is
 * honoured.
 */
export function resolveEntry({
  params,
  routes,
}: {
  params: URLSearchParams;
  routes: PortalRoute[];
}): EntryResolution {
  const requested = (params.get('route') ?? '').trim();
  const title = requested ? routeTitleFor(routes, requested) : null;

  if (!title) {
    return {
      panel: 'intro',
      routeSlug: null,
      charitySlug: null,
      ctaLabel: 'choose a route',
      showChooseAnother: false,
    };
  }

  return {
    panel: 'intro',
    routeSlug: requested,
    charitySlug: null,
    ctaLabel: `adopt the ${title.toLowerCase()}`,
    showChooseAnother: true,
  };
}

/** The next panel a decision moves the world to. */
export function advanceFrom(panel: PanelId, selection: FlowSelection): PanelId {
  if (panel === 'intro' && selection.routeSlug) return 'charity';

  const next = PANEL_ORDER[indexOfPanel(panel) + 1];
  return next ?? panel;
}

/**
 * The furthest panel this selection legally supports, never ahead of where the
 * visitor already is. A pasted or stale URL snaps here instead of rendering a
 * panel whose prerequisites were never met.
 */
export function furthestLegalPanel(requested: PanelId, selection: FlowSelection): PanelId {
  const ceiling = indexOfPanel(requested);

  for (let index = ceiling; index >= 0; index -= 1) {
    const panel = PANEL_ORDER[index];
    if (PREREQUISITES[panel](selection)) return panel;
  }

  return 'intro';
}

/** Whether a `change` control may send the visitor to this panel. */
export function canJumpTo(panel: PanelId, selection: FlowSelection): boolean {
  return PREREQUISITES[panel](selection);
}
