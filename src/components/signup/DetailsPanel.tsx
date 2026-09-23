import type { CSSProperties } from 'react';
import {
  COMMITMENT_DAYS_MAX,
  COMMITMENT_DAYS_MIN,
  formatTargetDate,
} from '@/utils/signup-commitment';
import { TARGET_HKD_MAX, TARGET_HKD_MIN } from '@/utils/signup-impact';
import type { RunnerDetailField } from '@/utils/signup-validation';

/** HK$50 steps: fine enough to feel continuous, coarse enough to land on round numbers. */
const TARGET_HKD_STEP = 50;

/** Graduations drawn behind a track, so a value is read against a scale rather than guessed. */
const SLIDER_TICKS = 9;

export interface DetailsPanelProps {
  firstName: string;
  lastName: string;
  email: string;
  commitmentDays: number;
  targetHkd: number;
  errors: Partial<Record<RunnerDetailField, string>>;
  showTimeframeSlider: boolean;
  targetDate: string;
  targetTime: string | null;
  impactReadout: string | null;
  onField: (field: RunnerDetailField, value: string) => void;
  onCommitmentDays: (days: number) => void;
  onTargetHkd: (amount: number) => void;
  onContinue: () => void;
}

/**
 * Who the Runner is, and what they are committing to.
 *
 * Two instrument groups, each under its own ruled caption: the identity that
 * will carry the Adopter ID, and the commitment that will be measured against
 * it. The stepper already says `enter details`, so the panel titles the groups
 * rather than itself.
 *
 * When a scheduled Group Run owns the target date the timeframe slider is not
 * here at all and the impact slider simply moves up — the date carries its
 * start time in the rail, which is all the explanation a clock needs.
 */
export default function DetailsPanel({
  firstName,
  lastName,
  email,
  commitmentDays,
  targetHkd,
  errors,
  showTimeframeSlider,
  targetDate,
  targetTime,
  impactReadout,
  onField,
  onCommitmentDays,
  onTargetHkd,
  onContinue,
}: DetailsPanelProps) {
  /**
   * The filled fraction of a track, handed to CSS so the lit portion of the
   * scale is the value itself rather than a second thing to keep in step.
   */
  const fill = (value: number, min: number, max: number): CSSProperties =>
    ({ '--signup-slider-fill': `${((value - min) / (max - min)) * 100}%` }) as CSSProperties;

  const ticks = (
    <span className="signup-slider-ticks" aria-hidden="true">
      {Array.from({ length: SLIDER_TICKS }, (_, index) => (
        <span key={index} className="signup-slider-tick" data-major={index % 4 === 0 ? 'true' : 'false'} />
      ))}
    </span>
  );

  const field = (
    id: RunnerDetailField,
    label: string,
    type: string,
    autoComplete: string
  ) => {
    const value = id === 'firstName' ? firstName : id === 'lastName' ? lastName : email;
    const error = errors[id];
    const errorId = `signup-${id}-error`;

    return (
      <p className="signup-field" data-filled={value ? 'true' : 'false'}>
        <label className="signup-field-label" htmlFor={`signup-${id}`}>
          {label}
        </label>
        <input
          id={`signup-${id}`}
          className="signup-field-input"
          type={type}
          value={value}
          autoComplete={autoComplete}
          spellCheck={false}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onField(id, event.currentTarget.value)}
        />
        {error && (
          <span className="signup-field-error" id={errorId}>
            {error}
          </span>
        )}
      </p>
    );
  };

  return (
    <div className="signup-details">
      <section className="signup-group" data-reveal-step="1">
        <h2 className="signup-group-title">
          <span className="signup-group-index" aria-hidden="true">
            a
          </span>
          who is running
        </h2>
        <div className="signup-details-identity">
          <div className="signup-details-name">
            {field('firstName', 'first name', 'text', 'given-name')}
            {field('lastName', 'last name', 'text', 'family-name')}
          </div>
          {field('email', 'email', 'email', 'email')}
        </div>
      </section>

      <section className="signup-group" data-reveal-step="2">
        <h2 className="signup-group-title">
          <span className="signup-group-index" aria-hidden="true">
            b
          </span>
          what you are committing to
        </h2>

        <div className="signup-details-commitment">
          {showTimeframeSlider && (
            <div className="signup-slider" style={fill(commitmentDays, COMMITMENT_DAYS_MIN, COMMITMENT_DAYS_MAX)}>
              <div className="signup-slider-head">
                <label className="signup-field-label" htmlFor="signup-timeframe">
                  commitment timeframe
                </label>
                <output className="signup-slider-readout" htmlFor="signup-timeframe">
                  {formatTargetDate(targetDate, targetTime)}
                </output>
              </div>
              <span className="signup-slider-track">
                {ticks}
                <input
                  id="signup-timeframe"
                  className="signup-slider-input"
                  type="range"
                  min={COMMITMENT_DAYS_MIN}
                  max={COMMITMENT_DAYS_MAX}
                  step={1}
                  value={commitmentDays}
                  aria-valuetext={`${commitmentDays} ${commitmentDays === 1 ? 'day' : 'days'}`}
                  onChange={(event) => onCommitmentDays(Number(event.currentTarget.value))}
                />
              </span>
              <p className="signup-slider-scale" aria-hidden="true">
                <span>{COMMITMENT_DAYS_MIN} day</span>
                <span className="signup-slider-scale-value">
                  {commitmentDays} {commitmentDays === 1 ? 'day' : 'days'}
                </span>
                <span>{COMMITMENT_DAYS_MAX} days</span>
              </p>
            </div>
          )}

          <div className="signup-slider" style={fill(targetHkd, TARGET_HKD_MIN, TARGET_HKD_MAX)}>
            <div className="signup-slider-head">
              <label className="signup-field-label" htmlFor="signup-target">
                target impact goal
              </label>
              <output className="signup-slider-readout" htmlFor="signup-target">
                HK${targetHkd.toLocaleString('en-US')}
              </output>
            </div>
            <span className="signup-slider-track">
              {ticks}
              <input
                id="signup-target"
                className="signup-slider-input"
                type="range"
                min={TARGET_HKD_MIN}
                max={TARGET_HKD_MAX}
                step={TARGET_HKD_STEP}
                value={targetHkd}
                aria-valuetext={impactReadout ?? `HK$${targetHkd.toLocaleString('en-US')}`}
                onChange={(event) => onTargetHkd(Number(event.currentTarget.value))}
              />
            </span>
            <p className="signup-slider-scale" aria-hidden="true">
              <span>HK${TARGET_HKD_MIN.toLocaleString('en-US')}</span>
              <span />
              <span>HK${TARGET_HKD_MAX.toLocaleString('en-US')}</span>
            </p>
            {impactReadout && (
              <p className="signup-slider-impact" key={impactReadout}>
                {impactReadout}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="signup-panel-foot" data-reveal-step="3">
        <button type="button" className="signup-cta" onClick={onContinue}>
          <span className="signup-cta-label">name your companion</span>
          <span className="signup-cta-arrow" aria-hidden="true">
            &rarr;
          </span>
        </button>
      </div>
    </div>
  );
}
