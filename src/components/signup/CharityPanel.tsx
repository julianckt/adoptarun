import type { PortalCharity } from './types';

export interface CharityPanelProps {
  charity: PortalCharity | null;
  onCommit: () => void;
}

/**
 * The Charity Cause, stated rather than picked.
 *
 * While one partner is published, a grid of one card would be a flow pretending
 * to offer a choice it does not have. A single cause told at editorial scale is
 * both more honest and more persuasive — and this is the only place in the
 * portal where what the money does is actually told. The two-step confirmation
 * survives in substance: you read the cause, then you commit to it.
 */
export default function CharityPanel({ charity, onCommit }: CharityPanelProps) {
  if (!charity) {
    return (
      <div className="signup-charity">
        <h2 className="signup-heading" data-reveal-step="1">
          commit to a cause
        </h2>
        <p className="signup-empty" data-reveal-step="2">
          No Charity Cause is published yet. Adoptions open as soon as a partner goes live.
        </p>
      </div>
    );
  }

  return (
    <div className="signup-charity">
      <h2 className="signup-heading" data-reveal-step="1">
        commit to a cause
      </h2>

      <div className="signup-charity-identity" data-reveal-step="2">
        {charity.logoSrc ? (
          <img
            className="signup-charity-logo"
            src={charity.logoSrc}
            alt={charity.logoAlt}
            width="160"
            height="160"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="signup-charity-logo signup-charity-logo--placeholder" aria-hidden="true" />
        )}
        <p className="signup-charity-name">{charity.name}</p>
      </div>

      <div className="signup-charity-copy" data-reveal-step="3">
        {charity.charityDescription && (
          <p className="signup-charity-about">{charity.charityDescription}</p>
        )}
        {charity.causeDescription && (
          <p className="signup-charity-cause">{charity.causeDescription}</p>
        )}
      </div>

      <div className="signup-panel-foot" data-reveal-step="4">
        <button type="button" className="signup-cta" onClick={onCommit}>
          <span className="signup-cta-label">commit to this cause</span>
          <span className="signup-cta-arrow" aria-hidden="true">
            &rarr;
          </span>
        </button>
      </div>
    </div>
  );
}
