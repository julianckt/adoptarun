import type { ReactNode } from 'react';
import { formatTargetDate } from '@/utils/signup-commitment';
import { formatRouteDistance, formatRouteElevation } from '@/utils/formatters';
import RouteThumbnail from './RouteThumbnail';
import type { PanelId } from '@/utils/signup-flow';
import type { PortalCharity, PortalRoute } from './types';

export interface CommitPanelProps {
  route: PortalRoute | null;
  charity: PortalCharity | null;
  runnerName: string;
  email: string;
  targetDate: string;
  targetTime: string | null;
  targetHkd: number;
  impactReadout: string | null;
  companionName: string;
  companionError: string | null;
  commitError: string | null;
  isCommitting: boolean;
  onCompanionName: (value: string) => void;
  onChange: (panel: PanelId) => void;
  onCommit: () => void;
}

/**
 * The only emotional beat in the flow, and the only panel with nothing else on
 * it. The world has receded to the right; the summary rail is gone, its data
 * recomposed here at the scale of a statement. Every row carries its own
 * `change`, so the panel is never a one-way door for something it is asking the
 * Adopter to confirm.
 */
export default function CommitPanel({
  route,
  charity,
  runnerName,
  email,
  targetDate,
  targetTime,
  targetHkd,
  impactReadout,
  companionName,
  companionError,
  commitError,
  isCommitting,
  onCompanionName,
  onChange,
  onCommit,
}: CommitPanelProps) {
  const reviewRow = (
    label: string,
    value: string,
    meta: string | null,
    jumpTo: PanelId,
    leading?: ReactNode
  ) => (
    <div className="signup-review-row" key={label}>
      <dt className="signup-review-label">{label}</dt>
      <dd className="signup-review-value">
        {leading}
        <span className="signup-review-text">
          <span className="signup-review-primary">{value}</span>
          {meta && <span className="signup-review-meta">{meta}</span>}
        </span>
        <button type="button" className="signup-change" onClick={() => onChange(jumpTo)}>
          change<span className="visually-hidden"> {label}</span>
        </button>
      </dd>
    </div>
  );

  return (
    <div className="signup-commit">
      <h2 className="signup-heading" data-reveal-step="1">
        complete your adoption
      </h2>

      <p
        className="signup-field signup-companion"
        data-reveal-step="2"
        data-filled={companionName ? 'true' : 'false'}
      >
        <label className="signup-field-label" htmlFor="signup-companion">
          name your companion
        </label>
        <input
          id="signup-companion"
          className="signup-field-input signup-companion-input"
          type="text"
          value={companionName}
          autoComplete="off"
          aria-invalid={companionError ? 'true' : undefined}
          aria-describedby={companionError ? 'signup-companion-error' : undefined}
          onChange={(event) => onCompanionName(event.currentTarget.value)}
        />
        {companionError && (
          <span className="signup-field-error" id="signup-companion-error">
            {companionError}
          </span>
        )}
      </p>

      <dl className="signup-review" data-reveal-step="3">
        {reviewRow(
          'route',
          route?.title ?? '—',
          route
            ? `${formatRouteDistance(route.distanceKm ?? 0)} · elev. ${formatRouteElevation(
                route.elevationGain ?? 0
              )}`
            : null,
          'route',
          route ? <RouteThumbnail miniMapSvg={route.miniMapSvg} routeTitle={route.title} /> : null
        )}
        {reviewRow('cause', charity?.name ?? '—', impactReadout, 'charity')}
        {reviewRow('adopter', runnerName || '—', email || null, 'details')}
        {reviewRow('target date', formatTargetDate(targetDate, targetTime), null, 'details')}
        {reviewRow('impact goal', `HK$${targetHkd.toLocaleString('en-US')}`, null, 'details')}
      </dl>

      {commitError && (
        <p className="signup-commit-error" role="alert">
          {commitError}
        </p>
      )}

      <div className="signup-panel-foot" data-reveal-step="4">
        <button
          type="button"
          className="signup-commit-button"
          data-committing={isCommitting ? 'true' : 'false'}
          aria-busy={isCommitting ? 'true' : undefined}
          disabled={isCommitting || !companionName.trim()}
          onClick={onCommit}
        >
          <span className="signup-commit-label">confirm &amp; commit</span>
          <span className="signup-commit-wipe" aria-hidden="true">
            <span className="signup-commit-label">confirm &amp; commit</span>
          </span>
        </button>
        {!companionName.trim() && !isCommitting && (
          <p className="signup-commit-hint">Name your companion to commit.</p>
        )}
      </div>
    </div>
  );
}
