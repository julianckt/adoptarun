import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { $panel, $rotationSteps } from '@/stores/signup';
import {
  advanceFrom,
  canJumpTo,
  furthestLegalPanel,
  indexOfPanel,
  panelFromStepParam,
  resolveEntry,
  type FlowSelection,
  type PanelId,
} from '@/utils/signup-flow';
import {
  COMMITMENT_DAYS_DEFAULT,
  resolveCommitment,
} from '@/utils/signup-commitment';
import { TARGET_HKD_DEFAULT, resolveImpactReadout } from '@/utils/signup-impact';
import { minimumBeat } from '@/utils/signup-motion';
import { storeArrival } from '@/utils/signup-handoff';
import { submitAdoption } from '@/utils/signup-client';
import {
  validateCompanionName,
  validateRunnerDetails,
  type RunnerDetailField,
} from '@/utils/signup-validation';
import SignupStepper from './SignupStepper';
import SummaryRail from './SummaryRail';
import IntroPanel from './IntroPanel';
import CharityPanel from './CharityPanel';
import DetailsPanel from './DetailsPanel';
import CommitPanel from './CommitPanel';
import type { PortalCharity, PortalRoute } from './types';

export interface SignupPortalProps {
  routes: PortalRoute[];
  charity: PortalCharity | null;
  /** The Route Catalogue, server-rendered by Astro and slotted in as panel 1. */
  children?: ReactNode;
}

const COMMIT_FAILURE_MESSAGE =
  'We could not complete your adoption just now. Nothing was lost — try again.';

export default function SignupPortal({ routes, charity, children }: SignupPortalProps) {
  const [panel, setPanel] = useState<PanelId>('intro');
  const [routeSlug, setRouteSlug] = useState<string | null>(null);
  const [entryCta, setEntryCta] = useState<string>('choose a route');
  const [showChooseAnother, setShowChooseAnother] = useState<boolean>(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [commitmentDays, setCommitmentDays] = useState(COMMITMENT_DAYS_DEFAULT);
  const [targetHkd, setTargetHkd] = useState(TARGET_HKD_DEFAULT);
  const [companionName, setCompanionName] = useState('');

  const [detailErrors, setDetailErrors] = useState<Partial<Record<RunnerDetailField, string>>>({});
  const [companionError, setCompanionError] = useState<string | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  const rotationRef = useRef(0);
  const panelRefs = useRef(new Map<PanelId, HTMLElement | null>());
  const hasInteracted = useRef(false);
  const isNavigatingAway = useRef(false);

  const route = useMemo(
    () => routes.find((candidate) => candidate.slug === routeSlug) ?? null,
    [routes, routeSlug]
  );

  const charitySlug = charity?.slug ?? null;

  /**
   * The Charity Cause counts as paired only once the visitor has reached the
   * panel that pairs it — before that it is merely published, and treating it
   * as chosen would let a pasted URL skip the cause entirely.
   */
  const pairedCharityFor = useCallback(
    (at: PanelId) => (at === 'intro' || at === 'route' ? null : charitySlug),
    [charitySlug]
  );

  const detailsValidation = useMemo(
    () => validateRunnerDetails({ firstName, lastName, email }),
    [firstName, lastName, email]
  );

  const selection: FlowSelection = useMemo(
    () => ({
      routeSlug,
      charitySlug: pairedCharityFor(panel),
      detailsComplete: detailsValidation.isValid,
    }),
    [routeSlug, pairedCharityFor, panel, detailsValidation.isValid]
  );

  const commitment = useMemo(
    () => resolveCommitment({ route, commitmentDays, now: new Date() }),
    [route, commitmentDays]
  );

  const impactReadout = useMemo(
    () => resolveImpactReadout(charity, targetHkd),
    [charity, targetHkd]
  );

  // ---------------------------------------------------------------------------
  // Panel movement. Every move — a decision, a `change`, or the back button —
  // resolves through here, so a click and a popstate cannot disagree.
  // ---------------------------------------------------------------------------
  const applyPanel = useCallback((next: PanelId, options: { animate: boolean }) => {
    setPanel((current) => {
      if (current === next) return current;
      if (options.animate) {
        // Rotation accumulates: one fixed delta per transition, whatever the
        // distance travelled, so every move reads as the same gesture.
        rotationRef.current += indexOfPanel(next) > indexOfPanel(current) ? 1 : -1;
        $rotationSteps.set(rotationRef.current);
      }
      $panel.set(next);
      return next;
    });
  }, []);

  const writeUrl = useCallback(
    (next: PanelId, slug: string | null, mode: 'push' | 'replace') => {
      const params = new URLSearchParams();
      if (slug) params.set('route', slug);
      params.set('step', next);
      const url = `${window.location.pathname}?${params.toString()}`;
      if (mode === 'push') window.history.pushState({ panel: next }, '', url);
      else window.history.replaceState({ panel: next }, '', url);
    },
    []
  );

  const goTo = useCallback(
    (next: PanelId, slug: string | null = routeSlug) => {
      applyPanel(next, { animate: true });
      writeUrl(next, slug, 'push');
    },
    [applyPanel, writeUrl, routeSlug]
  );

  // ---------------------------------------------------------------------------
  // Entry. Everyone lands on the intro; a deep-linked Artwork is acknowledged
  // there rather than silently skipped past.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const entry = resolveEntry({ params, routes });
    const requestedPanel = panelFromStepParam(params.get('step'));

    const resolved = furthestLegalPanel(requestedPanel, {
      routeSlug: entry.routeSlug,
      charitySlug: pairedCharityFor(requestedPanel),
      detailsComplete: false,
    });

    setRouteSlug(entry.routeSlug);
    setEntryCta(entry.ctaLabel);
    setShowChooseAnother(entry.showChooseAnother);
    applyPanel(resolved, { animate: false });
    writeUrl(resolved, entry.routeSlug, 'replace');
    // Entry runs once: later movement is owned by goTo and popstate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Back and forward walk the panels, snapping to whatever the selection
  // legally supports rather than rendering a panel whose work was never done.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = panelFromStepParam(params.get('step'));
      const slug = params.get('route');
      const nextSlug = routes.some((candidate) => candidate.slug === slug) ? slug : null;

      setRouteSlug(nextSlug);
      applyPanel(
        furthestLegalPanel(requested, {
          routeSlug: nextSlug,
          charitySlug: pairedCharityFor(requested),
          detailsComplete: detailsValidation.isValid,
        }),
        { animate: true }
      );
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyPanel, routes, pairedCharityFor, detailsValidation.isValid]);

  // ---------------------------------------------------------------------------
  // Route selection is announced by the card rather than wired to it, so the
  // catalogue stays an ordinary Astro component.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest?.('[data-route-select]') as HTMLElement | null;
      if (!trigger) return;

      event.preventDefault();
      const slug = trigger.getAttribute('data-route-slug');
      if (!slug) return;

      hasInteracted.current = true;
      setRouteSlug(slug);
      applyPanel('charity', { animate: true });
      writeUrl('charity', slug, 'push');
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [applyPanel, writeUrl]);

  // ---------------------------------------------------------------------------
  // A stray back swipe should not silently bin a filled-in panel.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isNavigatingAway.current) return;
      if (!firstName && !lastName && !email && !companionName) return;
      event.preventDefault();
      // Still required by Chromium to arm the prompt, deprecated or not.
      // eslint-disable-next-line deprecation/deprecation
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [firstName, lastName, email, companionName]);

  // Focus follows the world: the incoming panel takes it, so a keyboard visitor
  // is never left tabbing through a panel that has slid out of frame.
  useEffect(() => {
    panelRefs.current.get(panel)?.focus({ preventScroll: true });
  }, [panel]);

  const handleField = (field: RunnerDetailField, value: string) => {
    hasInteracted.current = true;
    if (field === 'firstName') setFirstName(value);
    else if (field === 'lastName') setLastName(value);
    else setEmail(value);
    // Errors clear as they are fixed, and are only ever raised on an attempt.
    setDetailErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleDetailsContinue = () => {
    const validation = validateRunnerDetails({ firstName, lastName, email });
    if (!validation.isValid) {
      setDetailErrors(validation.errors);
      return;
    }
    setDetailErrors({});
    goTo('commit');
  };

  const handleChange = (target: PanelId) => {
    if (!canJumpTo(target, { ...selection, charitySlug })) return;
    goTo(target);
  };

  const handleCommit = async () => {
    const nameError = validateCompanionName(companionName);
    setCompanionError(nameError);
    if (nameError || !route || !charity) return;

    setCommitError(null);
    setIsCommitting(true);

    try {
      // The beat is raced, not awaited in series: removing the stub later never
      // removes the gesture.
      const [result] = await Promise.all([
        submitAdoption({
          firstName,
          lastName,
          email,
          routeSlug: route.slug,
          charitySlug: charity.slug,
          commitmentDays: commitment.commitmentDays,
          targetDate: commitment.targetDate,
          targetHkd,
          companionName: companionName.trim(),
        }),
        minimumBeat(),
      ]);

      storeArrival({
        adopterId: result.adopterId,
        companionName: companionName.trim(),
        firstName: firstName.trim(),
        email: email.trim(),
        routeSlug: route.slug,
        charitySlug: charity.slug,
        commitmentDays: commitment.commitmentDays,
        targetDate: commitment.targetDate,
        targetTime: commitment.targetTime,
        targetHkd,
      });

      isNavigatingAway.current = true;
      window.location.assign(`/signup/confirmed/${result.adopterId}`);
    } catch {
      setIsCommitting(false);
      setCommitError(COMMIT_FAILURE_MESSAGE);
    }
  };

  const activeIndex = indexOfPanel(panel);

  const panelProps = (id: PanelId) => ({
    className: 'signup-panel',
    'data-panel': id,
    'data-active': panel === id ? 'true' : 'false',
    inert: panel !== id,
    tabIndex: -1,
    ref: (element: HTMLElement | null) => {
      panelRefs.current.set(id, element);
    },
  });

  return (
    <div className="signup-portal" data-panel={panel}>
      <SignupStepper panel={panel} />

      <div
        className="signup-track"
        style={{ transform: `translateX(calc(${-activeIndex} * 100%))` }}
      >
        <section {...panelProps('intro')} aria-label="Start your adoption">
          <IntroPanel
            ctaLabel={entryCta}
            showChooseAnother={showChooseAnother}
            onAdvance={() => goTo(advanceFrom('intro', selection))}
            onChooseAnother={() => goTo('route')}
          />
        </section>

        <section {...panelProps('route')} aria-label="Match with a route">
          <h2 className="signup-heading" data-reveal-step="1">
            match with a route
          </h2>
          <div className="signup-catalogue-slot" data-reveal-step="2">
            {children}
          </div>
        </section>

        <section {...panelProps('charity')} aria-label="Commit to a cause">
          <CharityPanel charity={charity} onCommit={() => goTo('details')} />
        </section>

        <section {...panelProps('details')} aria-label="Enter your details">
          <DetailsPanel
            firstName={firstName}
            lastName={lastName}
            email={email}
            commitmentDays={commitment.commitmentDays}
            targetHkd={targetHkd}
            errors={detailErrors}
            showTimeframeSlider={commitment.showTimeframeSlider}
            targetDate={commitment.targetDate}
            targetTime={commitment.targetTime}
            impactReadout={impactReadout}
            onField={handleField}
            onCommitmentDays={setCommitmentDays}
            onTargetHkd={setTargetHkd}
            onContinue={handleDetailsContinue}
          />
        </section>

        <section {...panelProps('commit')} aria-label="Complete your adoption">
          <CommitPanel
            route={route}
            charity={charity}
            runnerName={[firstName, lastName].filter(Boolean).join(' ')}
            email={email}
            targetDate={commitment.targetDate}
            targetTime={commitment.targetTime}
            targetHkd={targetHkd}
            impactReadout={impactReadout}
            companionName={companionName}
            companionError={companionError}
            commitError={commitError}
            isCommitting={isCommitting}
            onCompanionName={(value) => {
              hasInteracted.current = true;
              setCompanionName(value);
              if (companionError) setCompanionError(null);
            }}
            onChange={handleChange}
            onCommit={handleCommit}
          />
        </section>
      </div>

      <SummaryRail
        panel={panel}
        route={route}
        charity={charity}
        targetDate={commitment.targetDate}
        targetTime={commitment.targetTime}
        targetHkd={targetHkd}
        onChange={handleChange}
      />
    </div>
  );
}
