export interface IntroPanelProps {
  ctaLabel: string;
  showChooseAnother: boolean;
  onAdvance: () => void;
  onChooseAnother: () => void;
}

/**
 * The invitation, and the one zero-stakes press in the flow.
 *
 * It exists to teach the contract before anything is at stake: when you decide,
 * the world moves left. Every later transition is legible because of this one.
 * A visitor who arrived by deep link is greeted by the Artwork they clicked
 * rather than dropped into the middle of a flow with no bearings.
 *
 * The one panel with no instrument gutter and no measured column: nothing has
 * been calibrated yet, so there is nothing to read off a scale.
 */
export default function IntroPanel({
  ctaLabel,
  showChooseAnother,
  onAdvance,
  onChooseAnother,
}: IntroPanelProps) {
  return (
    <div className="signup-intro">
      <p className="signup-intro-wordmark" data-reveal-step="1">
        <span className="signup-intro-lets">let&rsquo;s</span>
        <span className="signup-intro-run">run</span>
      </p>

      <div className="signup-intro-actions" data-reveal-step="2">
        <button type="button" className="signup-cta" onClick={onAdvance}>
          <span className="signup-cta-label">{ctaLabel}</span>
          <span className="signup-cta-arrow" aria-hidden="true">
            &rarr;
          </span>
        </button>

        {showChooseAnother && (
          <button type="button" className="signup-intro-alt" onClick={onChooseAnother}>
            or choose another route
          </button>
        )}
      </div>
    </div>
  );
}
