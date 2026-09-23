/**
 * Reactive state for the Adoption Portal.
 *
 * The portal is not one island: `signup.astro` server-renders every panel so
 * the Route Catalogue can stay an Astro component, and the interactive parts
 * mount as separate islands. These stores are how those islands, the panel
 * controller, and the shader agree on one adoption.
 */
import { atom } from 'nanostores';
import type { PanelId } from '@/utils/signup-flow';

export const $panel = atom<PanelId>('intro');

/** Accumulated yaw, in whole transitions. Signed; drifts freely by design. */
export const $rotationSteps = atom<number>(0);
