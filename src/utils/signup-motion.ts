/**
 * Motion contract for the Adoption Portal.
 *
 * Two rules govern the camera, and they are deliberately different:
 *
 *   Rotation accumulates. Every transition applies the same delta, forward or
 *   back, however many panels are skipped. Each move is therefore identical in
 *   magnitude and duration, deep links and `change` jumps need no special case,
 *   and the drift this causes is invisible on a mesh with no canonical
 *   orientation.
 *
 *   Framing is absolute. The commit panel's pull-back is a property of being on
 *   that panel, not of how the visitor arrived, because its layout depends on
 *   the sphere sitting small and to the right.
 *
 * The durations below mirror CSS tokens so the DOM slide and the camera run on
 * one timeline rather than two that merely finish near each other.
 */
import type { PanelId } from '@/utils/signup-flow';

/** Mirrors `--duration-slow`. */
export const PANEL_TRANSITION_MS = 600;

/** Mirrors `--ease-out-expo`: cubic-bezier(0.16, 1, 0.3, 1). */
export const EASE_OUT_EXPO: readonly [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Degrees of azimuth yaw per transition, forward negative (world swings left) and back positive. */
export const ROTATION_DELTA_DEG = -80;

/** `ROTATION_DELTA_DEG` in radians, the unit `scene.rotation.y` takes. */
export const ROTATION_DELTA_RAD = (ROTATION_DELTA_DEG * Math.PI) / 180;

/**
 * Floor for the commit beat, mirroring `--duration-commit-beat`. This is NOT
 * part of the backend stub: when the real request replaces the stand-in it
 * races this floor, so a fast response still gets the full gesture and a slow
 * one is already covered.
 */
export const MINIMUM_COMMIT_BEAT_MS = 1600;

export interface PanelFraming {
  /** ShaderGradient camera zoom; lower pulls the sphere back. */
  cameraZoom: number;
}

/**
 * The matching horizontal shift lives in CSS (`--signup-sphere-shift`), keyed
 * off `data-flow-panel`, so the canvas and the panels move on one declaration
 * rather than two that have to be kept in step.
 */

/**
 * The world is full-bleed for the four panels where the visitor is deciding,
 * and recedes to the right on the panel where only the decision is left.
 */
export const PANEL_FRAMING: Record<PanelId, PanelFraming> = {
  intro: { cameraZoom: 13 },
  route: { cameraZoom: 13 },
  charity: { cameraZoom: 13 },
  details: { cameraZoom: 13 },
  commit: { cameraZoom: 3 },
};

/** Cubic-bezier evaluated for a normalised time, matching the CSS easing. */
export function easeOutExpo(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped === 1 ? 1 : 1 - Math.pow(2, -10 * clamped);
}

/** Holds a promise open for at least `ms`, so a gesture is never cut short. */
export function minimumBeat(ms: number = MINIMUM_COMMIT_BEAT_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
