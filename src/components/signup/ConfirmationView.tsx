import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { formatTargetDate } from '@/utils/signup-commitment';
import { resolveImpactReadout } from '@/utils/signup-impact';
import { consumeArrival, type AdoptionReceipt } from '@/utils/signup-handoff';
import { buildGoogleCalendarUrl, buildIcs } from '@/utils/signup-calendar';
import type { ConfirmationRecord } from '@/utils/signup-confirmation';
import type { PortalCharity, PortalRoute } from './types';

export interface ConfirmationViewProps {
  adopterId: string;
  record: ConfirmationRecord;
  routes: PortalRoute[];
  charity: PortalCharity | null;
  pageUrl: string;
  /** The expanded Route Card, server-rendered by Astro. */
  children?: ReactNode;
}

/**
 * The adoption, once committed.
 *
 * One layout, two arrivals. Coming straight from the portal the page reveals
 * itself in sequence and names the address the confirmation went to; opened
 * later from an emailed link it renders at once and shows neither the email nor
 * the Runner's name, because that URL is a link anyone holding it can open.
 *
 * The record always comes from the server. The handoff only says whether this
 * is a first arrival, and it is consumed on read — so a refresh is a return
 * visit, not a replay.
 */
export default function ConfirmationView({
  adopterId,
  record,
  routes,
  charity,
  pageUrl,
  children,
}: ConfirmationViewProps) {
  const [arrival, setArrival] = useState<AdoptionReceipt | null>(null);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    setArrival(consumeArrival(adopterId));
  }, [adopterId]);

  /**
   * Arriving from the portal, the receipt is what the Adopter just committed
   * to and is therefore the truth; the server record is what a later visit
   * reads. Once the real lookup replaces the stub the two agree, and this
   * merge becomes a no-op rather than a correction.
   */
  const adoption: ConfirmationRecord = useMemo(
    () =>
      arrival
        ? {
            ...record,
            adopterId: arrival.adopterId,
            companionName: arrival.companionName,
            routeSlug: arrival.routeSlug,
            charitySlug: arrival.charitySlug,
            commitmentDays: arrival.commitmentDays,
            targetDate: arrival.targetDate,
            targetTime: arrival.targetTime,
            targetHkd: arrival.targetHkd,
          }
        : record,
    [arrival, record]
  );

  /**
   * The Artwork follows the adoption, so a first arrival shows what was
   * actually committed to rather than whatever the lookup returned.
   *
   * NOTE: the expanded Route Card below is server-rendered against the looked
   * up record, so while that lookup is stubbed the two can disagree. With the
   * real D1 read they are the same row and cannot.
   */
  const route = useMemo(
    () => routes.find((candidate) => candidate.slug === adoption.routeSlug) ?? null,
    [routes, adoption.routeSlug]
  );

  // A walk-in adoption carries no fundraising target, so the impact line has
  // nothing to say and the whole fact is omitted below.
  const impactReadout = useMemo(
    () => (adoption.targetHkd === null ? null : resolveImpactReadout(charity, adoption.targetHkd)),
    [charity, adoption.targetHkd]
  );

  const calendar = useMemo(
    () => ({
      companionName: adoption.companionName,
      routeTitle: route?.title ?? 'your route',
      charityName: charity?.name ?? 'your charity cause',
      targetDate: adoption.targetDate,
      targetTime: adoption.targetTime,
      meetupPoint: route?.meetupPoint ?? route?.startPoint ?? null,
      adopterId: adoption.adopterId,
      url: pageUrl,
    }),
    [adoption, route, charity, pageUrl]
  );

  const downloadIcs = () => {
    const blob = new Blob([buildIcs(calendar)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${adoption.adopterId}-${adoption.companionName.toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  /**
   * Share the commitment, not the page's privacy: the link is the adoption's
   * own URL, which carries no name or email for anyone the Adopter sends it to.
   */
  const share = async () => {
    const text = `I've adopted ${adoption.companionName} — running ${
      route?.title ?? 'a GPS-art route'
    } for ${charity?.name ?? 'a charity cause'}.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'adopt a run', text, url: pageUrl });
        return;
      } catch {
        // A dismissed share sheet is not a failure; fall through to the copy.
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${pageUrl}`);
      setShareState('copied');
    } catch {
      setShareState('failed');
    }
  };

  const shareLabel =
    shareState === 'copied'
      ? 'link copied'
      : shareState === 'failed'
        ? 'could not copy — select the address bar'
        : 'share my commitment';

  /**
   * The stage numerals are the system's own: Runda Medium at label size in
   * Route Orange, a quiet index beside the name. A completed stage is marked
   * by that index going solid, not struck through — a run that happened is
   * not a cancelled line item.
   */
  const journey: { name: string; index: string; state: 'done' | 'active' | 'ahead' }[] = [
    { name: 'match & commit', index: 'one.', state: 'done' },
    { name: 'nurture & grow', index: 'two.', state: 'active' },
    { name: 'forever guardian', index: 'three.', state: 'ahead' },
  ];

  return (
    <div className="confirmed" data-reveal={arrival ? 'true' : 'false'}>
      <div className="confirmed-main">
        <h1 className="confirmed-headline" data-reveal-step="1">
          {adoption.companionName} is waiting for your run
        </h1>

        <p className="confirmed-id" data-reveal-step="2">
          <span className="confirmed-id-label">adopter id</span>
          <span className="confirmed-id-value">{adoption.adopterId}</span>
          <span className="confirmed-id-note">this is how you log your run</span>
        </p>

        <dl className="confirmed-facts" data-reveal-step="3">
          <div className="confirmed-fact">
            <dt className="confirmed-fact-label">route</dt>
            <dd className="confirmed-fact-value">{route?.title ?? '—'}</dd>
          </div>
          <div className="confirmed-fact">
            <dt className="confirmed-fact-label">cause</dt>
            <dd className="confirmed-fact-value">{charity?.name ?? '—'}</dd>
          </div>
          <div className="confirmed-fact">
            <dt className="confirmed-fact-label">target date</dt>
            <dd className="confirmed-fact-value">
              {formatTargetDate(adoption.targetDate, adoption.targetTime)}
            </dd>
          </div>
          {adoption.targetHkd !== null && (
            <div className="confirmed-fact">
              <dt className="confirmed-fact-label">impact goal</dt>
              <dd className="confirmed-fact-value">
                HK${adoption.targetHkd.toLocaleString('en-US')}
                {impactReadout && <span className="confirmed-fact-meta">{impactReadout}</span>}
              </dd>
            </div>
          )}
          {(route?.meetupPoint || route?.startPoint) && (
            <div className="confirmed-fact">
              <dt className="confirmed-fact-label">
                {route.meetupPoint ? 'meetup point' : 'start point'}
              </dt>
              <dd className="confirmed-fact-value">{route.meetupPoint ?? route.startPoint}</dd>
            </div>
          )}
        </dl>

        <ol className="confirmed-journey" data-reveal-step="4" aria-label="Caretaker journey">
          {journey.map((stage) => (
            <li key={stage.name} className="confirmed-journey-stage" data-state={stage.state}>
              <span className="confirmed-journey-index" aria-hidden="true">
                {stage.index}
              </span>
              <span className="confirmed-journey-name">{stage.name}</span>
            </li>
          ))}
        </ol>

        <div className="confirmed-actions" data-reveal-step="5">
          <a className="signup-cta" href="/log">
            <span className="signup-cta-label">log your run</span>
            <span className="signup-cta-arrow" aria-hidden="true">
              &rarr;
            </span>
          </a>

          <div className="confirmed-actions-secondary">
            <button type="button" className="confirmed-secondary" onClick={downloadIcs}>
              add to calendar (.ics)
            </button>
            <a
              className="confirmed-secondary"
              href={buildGoogleCalendarUrl(calendar)}
              target="_blank"
              rel="noopener noreferrer"
            >
              add to google calendar
            </a>
            <button
              type="button"
              className="confirmed-secondary"
              data-share-state={shareState}
              onClick={share}
            >
              {shareLabel}
            </button>
          </div>
        </div>

        {arrival && (
          <p className="confirmed-notice" data-reveal-step="6">
            Confirmation sent to {arrival.email}, with your Adopter ID inside.
          </p>
        )}
      </div>

      <div className="confirmed-route" data-reveal-step="7">
        {children}
      </div>
    </div>
  );
}
