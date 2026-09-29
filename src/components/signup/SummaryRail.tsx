import { formatTargetDate } from '@/utils/signup-commitment';
import { formatRouteDistance, formatRouteElevation } from '@/utils/formatters';
import RouteThumbnail from './RouteThumbnail';
import type { PanelId } from '@/utils/signup-flow';
import type { PortalCharity, PortalRoute } from './types';

export interface SummaryRailProps {
  panel: PanelId;
  route: PortalRoute | null;
  charity: PortalCharity | null;
  targetDate: string;
  targetTime: string | null;
  targetHkd: number;
  onChange: (panel: PanelId) => void;
}

/**
 * What the Adopter is committing to, held in view from the moment a Charity
 * Cause is chosen until the commit panel — where it does not persist, but is
 * recomposed as the review block, at the scale of a statement rather than a
 * running tally.
 *
 * Read as the instrument's readout panel: a titled housing, rows that arrive
 * in the order they were decided, and the Artwork named by its own trace at a
 * size worth looking at rather than a stamp beside the words.
 */
export default function SummaryRail({
  panel,
  route,
  charity,
  targetDate,
  targetTime,
  targetHkd,
  onChange,
}: SummaryRailProps) {
  const isVisible =
    panel === 'charity' || panel === 'details' || panel === 'route' || panel === 'commit';

  return (
    <aside
      className="signup-rail"
      data-panel={panel}
      data-visible={isVisible ? 'true' : 'false'}
      aria-label="Your adoption so far"
      aria-hidden={isVisible ? undefined : 'true'}
      inert={!isVisible}
    >
      <div className="signup-rail-veil" aria-hidden="true" />
      <div className="signup-rail-inner">
        {panel !== 'route' && panel !== 'commit' && (
          <>
            <p className="signup-rail-title">
              <span className="signup-rail-title-text">your adoption</span>
              <span className="signup-rail-title-rule" aria-hidden="true" />
            </p>

            {route && (
              <div className="signup-rail-artwork" data-rail-step="1">
                <RouteThumbnail miniMapSvg={route.miniMapSvg} routeTitle={route.title} />
              </div>
            )}

            <dl className="signup-rail-rows">
              <div className="signup-rail-row" data-rail-step="2">
                <dt className="signup-rail-label">route</dt>
                <dd className="signup-rail-value">
                  <span className="signup-rail-primary">{route?.title ?? '—'}</span>
                  {route && (
                    <span className="signup-rail-meta">
                      {formatRouteDistance(route.distanceKm ?? 0)} · elev.{' '}
                      {formatRouteElevation(route.elevationGain ?? 0)}
                    </span>
                  )}
                  {route && (
                    <button type="button" className="signup-change" onClick={() => onChange('route')}>
                      change<span className="visually-hidden"> route</span>
                    </button>
                  )}
                </dd>
              </div>

              <div className="signup-rail-row" data-rail-step="3">
                <dt className="signup-rail-label">cause</dt>
                <dd className="signup-rail-value">
                  <span className="signup-rail-primary">{charity?.name ?? '—'}</span>
                  {charity && (
                    <button type="button" className="signup-change" onClick={() => onChange('charity')}>
                      change<span className="visually-hidden"> charity</span>
                    </button>
                  )}
                </dd>
              </div>

              {panel === 'details' && (
                <div className="signup-rail-row" data-rail-step="4">
                  <dt className="signup-rail-label">target date</dt>
                  <dd className="signup-rail-value">
                    <span className="signup-rail-primary">
                      {formatTargetDate(targetDate, targetTime)}
                      {route?.isGroupRun && (
                        <> · <span className="text-route-group-run">Group Run</span></>
                      )}
                    </span>
                  </dd>
                </div>
              )}

              {panel === 'details' && (
                <div className="signup-rail-row" data-rail-step="5">
                  <dt className="signup-rail-label">impact goal</dt>
                  <dd className="signup-rail-value">
                    <span className="signup-rail-primary signup-rail-primary--numeric">
                      HK${targetHkd.toLocaleString('en-US')}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </>
        )}
      </div>
    </aside>
  );
}
