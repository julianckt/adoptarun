import type { CSSProperties } from 'react';
import { PANEL_ORDER, type PanelId } from '@/utils/signup-flow';

/**
 * The instrument's position marker, and emphatically not a control.
 *
 * Navigation runs entirely through the `change` affordances in the summary rail
 * and the commit panel's review, where the visitor is already looking at the
 * thing they would want to change. Absent on the intro, where nothing has been
 * decided and a marker would only preview the work.
 *
 * Drawn as a vertical ticked gutter rather than a row of labels: a horizontal
 * strip of evenly weighted, boxed words is a tab bar whatever its semantics
 * say, and it was read as one. Here only the current step is named, the rest
 * are ticks, and the whole thing is a `group` rather than a `nav` — there is
 * nothing in it to navigate to.
 */
const STEP_LABELS: Record<Exclude<PanelId, 'intro'>, string> = {
  route: 'select route',
  charity: 'select charity',
  details: 'enter details',
  commit: 'commit & adopt',
};

const STEPS = PANEL_ORDER.filter((panel): panel is Exclude<PanelId, 'intro'> => panel !== 'intro');

export default function SignupStepper({ panel }: { panel: PanelId }) {
  if (panel === 'intro') return null;

  const activeIndex = STEPS.indexOf(panel as Exclude<PanelId, 'intro'>);
  // The travelled fraction of the gutter, read by CSS as the lit part of the
  // scale. Ticks sit at step centres, so the fill lands on the marker.
  const travelled = STEPS.length > 1 ? activeIndex / (STEPS.length - 1) : 0;

  return (
    <div
      className="signup-stepper"
      role="group"
      aria-label={`Adoption progress: step ${activeIndex + 1} of ${STEPS.length}, ${
        STEP_LABELS[STEPS[activeIndex]]
      }`}
      style={{ '--signup-stepper-travel': `${travelled}` } as CSSProperties}
    >
      <p className="signup-stepper-index" aria-hidden="true">
        <span className="signup-stepper-ordinal">{String(activeIndex + 1).padStart(2, '0')}</span>
        <span className="signup-stepper-total">/ {String(STEPS.length).padStart(2, '0')}</span>
      </p>

      <ol className="signup-stepper-scale" aria-hidden="true">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className="signup-stepper-tick"
            data-state={index === activeIndex ? 'current' : index < activeIndex ? 'done' : 'upcoming'}
          >
            <span className="signup-stepper-tick-mark" />
          </li>
        ))}
      </ol>
    </div>
  );
}
