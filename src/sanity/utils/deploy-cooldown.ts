/** Minimum gap between deploy requests, shared by everyone using the Studio. */
export const DEPLOY_COOLDOWN_MS = 5 * 60 * 1000;

/** Milliseconds left before another deploy may be requested (0 = ready). */
export function cooldownRemainingMs(
  lastRequestedAt: string | null | undefined,
  nowMs: number,
  cooldownMs: number = DEPLOY_COOLDOWN_MS
): number {
  if (!lastRequestedAt) return 0;
  const last = Date.parse(lastRequestedAt);
  if (Number.isNaN(last)) return 0;
  return Math.min(cooldownMs, Math.max(0, last + cooldownMs - nowMs));
}

/** "4 min 05 s" style countdown for the button label. */
export function formatCooldown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes} min ${seconds} s`;
}
