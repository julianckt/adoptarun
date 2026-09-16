/**
 * Dynamic loader and polyfill runner for CSS Scroll-Driven Animations.
 *
 * In Chromium browsers (Chrome, Edge, Brave), native CSS scroll-driven
 * animations execute on the compositor thread with 0 JS work.
 *
 * In non-supporting browsers (Safari, Firefox, iOS Safari), this loads
 * the Chrome Labs scroll-timeline polyfill and initializes ViewTimeline
 * instances on the Journey and Bottom CTA sections.
 */

interface RangeConfig {
  start: string;
  end: string;
}

function riseKeyframes(offsetToken: string): Keyframe[] {
  return [
    { opacity: 0, transform: `translateY(var(${offsetToken}))`, filter: 'blur(var(--space-01))' },
    { opacity: 1, transform: 'none', filter: 'blur(0)' },
  ];
}

function wipeKeyframes(): Keyframe[] {
  return [
    { clipPath: 'inset(0 100% 0 0)', filter: 'blur(var(--space-01))' },
    { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0)' },
  ];
}

function traceKeyframes(): Keyframe[] {
  return [
    { transform: 'scaleX(0)' },
    { transform: 'scaleX(1)' },
  ];
}

function getEaseOutExpo(): string {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const token = getComputedStyle(document.documentElement).getPropertyValue('--ease-out-expo')?.trim();
    if (token) return token;
  }
  return 'cubic-bezier(0.16, 1, 0.3, 1)';
}

function scrollAnimationOptions(
  timeline: any,
  rangeStart: string,
  rangeEnd: string,
  extra?: Partial<KeyframeAnimationOptions>,
): KeyframeAnimationOptions {
  return {
    fill: 'both',
    easing: getEaseOutExpo(),
    timeline,
    rangeStart,
    rangeEnd,
    ...extra,
  } as KeyframeAnimationOptions;
}

function setupJourneySection(ViewTimelineClass: any): void {
  const masthead = document.querySelector<HTMLElement>('.journey-masthead');
  if (masthead) {
    const mastheadTimeline = new ViewTimelineClass({
      subject: masthead,
      axis: 'block',
    });

    const badgeSquare = masthead.querySelector<HTMLElement>('.journey-badge-square');
    if (badgeSquare) {
      badgeSquare.animate(
        wipeKeyframes(),
        scrollAnimationOptions(mastheadTimeline, 'entry 20%', 'cover 40%'),
      );
    }

    const badgeNumber = masthead.querySelector<HTMLElement>('.journey-badge-number');
    if (badgeNumber) {
      badgeNumber.animate(
        riseKeyframes('--space-06'),
        scrollAnimationOptions(mastheadTimeline, 'entry 40%', 'cover 45%'),
      );
    }

    const leadElements = masthead.querySelectorAll<HTMLElement>('.journey-lead-text, .journey-wordmark');
    leadElements.forEach((el) => {
      el.animate(
        riseKeyframes('--space-06'),
        scrollAnimationOptions(mastheadTimeline, 'entry 30%', 'cover 42%'),
      );
    });

    const missionText = masthead.querySelector<HTMLElement>('.journey-mission-text');
    if (missionText) {
      missionText.animate(
        riseKeyframes('--space-06'),
        scrollAnimationOptions(mastheadTimeline, 'cover 20%', 'cover 50%'),
      );
    }
  }

  const steps = document.querySelectorAll<HTMLElement>('.journey-step');
  steps.forEach((step) => {
    const stepTimeline = new ViewTimelineClass({
      subject: step,
      axis: 'block',
    });

    try {
      step.animate(
        traceKeyframes(),
        scrollAnimationOptions(stepTimeline, 'entry 20%', 'cover 40%', {
          pseudoElement: '::before',
        }),
      );
    } catch {
      // Browser without WAAPI pseudoElement support gracefully keeps settled hairline
    }

    const numeral = step.querySelector<HTMLElement>('.journey-step-numeral');
    if (numeral) {
      numeral.animate(
        riseKeyframes('--space-06'),
        scrollAnimationOptions(stepTimeline, 'entry 60%', 'cover 35%'),
      );
    }

    const title = step.querySelector<HTMLElement>('.journey-step-title');
    if (title) {
      title.animate(
        riseKeyframes('--space-06'),
        scrollAnimationOptions(stepTimeline, 'entry 70%', 'cover 42%'),
      );
    }

    const desc = step.querySelector<HTMLElement>('.journey-step-desc');
    if (desc) {
      desc.animate(
        riseKeyframes('--space-06'),
        scrollAnimationOptions(stepTimeline, 'entry 90%', 'cover 48%'),
      );
    }
  });
}

function setupBottomCtaSection(ViewTimelineClass: any): void {
  const finale = document.querySelector<HTMLElement>('.finale');
  if (!finale) return;

  const finaleLines = finale.querySelectorAll<HTMLElement>('.finale-line');
  const lineRanges: RangeConfig[] = [
    { start: 'cover 13%', end: 'cover 43%' },
    { start: 'cover 15%', end: 'cover 45%' },
    { start: 'cover 17%', end: 'cover 47%' },
  ];

  finaleLines.forEach((line, index) => {
    const range = lineRanges[index] || lineRanges[0];
    const timeline = new ViewTimelineClass({ subject: line, axis: 'block' });
    line.animate(
      riseKeyframes('--space-07'),
      scrollAnimationOptions(timeline, range.start, range.end),
    );
  });

  const otherElements = finale.querySelectorAll<HTMLElement>('.finale-subtext, .finale-actions');
  otherElements.forEach((el) => {
    const timeline = new ViewTimelineClass({ subject: el, axis: 'block' });
    el.animate(
      riseKeyframes('--space-07'),
      scrollAnimationOptions(timeline, 'cover 15%', 'cover 30%'),
    );
  });
}

function setupAboutSection(ViewTimelineClass: any): void {
  const aboutSection = document.getElementById('about-section');
  if (!aboutSection) return;

  const desc = aboutSection.querySelector<HTMLElement>('.about-description');
  if (desc) {
    const descTimeline = new ViewTimelineClass({ subject: desc, axis: 'block' });
    desc.animate(
      riseKeyframes('--space-06'),
      scrollAnimationOptions(descTimeline, 'cover 18%', 'cover 32%'),
    );
  }

  const tally = aboutSection.querySelector<HTMLElement>('.about-tally');
  if (tally) {
    const tallyTimeline = new ViewTimelineClass({ subject: tally, axis: 'block' });
    tally.animate(
      riseKeyframes('--space-06'),
      scrollAnimationOptions(tallyTimeline, 'cover 19%', 'cover 32%'),
    );

    const markConfigs: { selector: string; start: string; end: string }[] = [
      { selector: '.mark-distance', start: 'cover 26%', end: 'cover 30%' },
      { selector: '.mark-runs', start: 'cover 32%', end: 'cover 36%' },
      { selector: '.mark-runners', start: 'cover 38%', end: 'cover 42%' },
      { selector: '.mark-raised', start: 'cover 44%', end: 'cover 48%' },
    ];

    markConfigs.forEach(({ selector, start, end }) => {
      const mark = tally.querySelector<HTMLElement>(selector);
      if (mark) {
        try {
          mark.animate(
            traceKeyframes(),
            scrollAnimationOptions(tallyTimeline, start, end, {
              pseudoElement: '::after',
            }),
          );
        } catch {
          // Graceful fallback for browsers without pseudoElement WAAPI support
        }
      }
    });
  }
}

export async function initScrollTimeline(): Promise<void> {
  if (typeof window === 'undefined') return;

  const isNativeSupported =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('animation-timeline', 'view()');

  // Chromium browsers run 100% native compositor CSS — exit immediately
  if (isNativeSupported) {
    return;
  }

  // If user prefers reduced motion, leave elements in their settled state
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
    return;
  }

  try {
    await import('scroll-timeline-polyfill/dist/scroll-timeline.js');

    const ViewTimeline = (window as unknown as { ViewTimeline?: any }).ViewTimeline;
    if (!ViewTimeline) {
      return;
    }

    setupAboutSection(ViewTimeline);
    setupJourneySection(ViewTimeline);
    setupBottomCtaSection(ViewTimeline);
  } catch (error) {
    console.error('[scroll-timeline] Failed to initialize polyfill:', error);
  }
}
