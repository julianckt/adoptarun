/**
 * src/sanity/fallbackState.ts
 *
 * Tracks in-memory query fallback events during the current render/runtime lifecycle.
 * In dev mode or when debug query flags are provided, this allows the UI to surface
 * notifications that cached data is being served.
 */

export interface FallbackEvent {
  queryName: string;
  errorMessage: string;
  timestamp: string;
}

export interface SanityFallbackStatus {
  hasFallback: boolean;
  events: FallbackEvent[];
}

const fallbackEvents: FallbackEvent[] = [];

export function recordFallback(queryName: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  fallbackEvents.push({
    queryName,
    errorMessage,
    timestamp: new Date().toISOString(),
  });
}

export function getFallbackStatus(): SanityFallbackStatus {
  return {
    hasFallback: fallbackEvents.length > 0,
    events: [...fallbackEvents],
  };
}

export function resetFallbackStatus(): void {
  fallbackEvents.length = 0;
}
