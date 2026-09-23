/**
 * Test double for the `cloudflare:workers` built-in module.
 *
 * Wired in by an alias in `vitest.config.ts`, because the real module only
 * exists inside workerd and cannot be imported under Vitest.
 *
 * The bindings live on this one mutable object so a test can populate it the
 * way the Worker runtime would, and production code can read `env.DB` exactly
 * as it does in production — no `locals` plumbing invented purely for tests.
 * An earlier version of this code hand-rolled a `locals.runtime.env` shape that
 * Astro 7 no longer provides; every endpoint test passed against that shape
 * while the endpoint 500'd in the real runtime. Keep this double honest: it
 * should only ever expose what `cloudflare:workers` genuinely exposes.
 */
export const env: Record<string, unknown> = {};

/** Clears every binding between tests, so state cannot leak across them. */
export function resetEnv(): void {
  for (const key of Object.keys(env)) delete env[key];
}
