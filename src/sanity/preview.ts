import {
  validatePreviewUrl,
  urlSearchParamPreviewSecret,
  type SanityClientLike,
} from '@sanity/preview-url-secret';

/**
 * Draft-mode session for Presentation.
 *
 * The cookie holds the Studio-issued preview secret itself (not a boolean flag), and every
 * `/preview` request re-validates it against Sanity. A hand-forged cookie therefore cannot
 * unlock drafts, and sessions expire with the secret (1 hour).
 */
export const DRAFT_MODE_COOKIE = 'adoptarun-preview-secret';
export const PREVIEW_PATH = '/preview';
const SECRET_TTL_SECONDS = 3600;

/**
 * SameSite=None + Partitioned so the cookie keeps working when the Studio frames the site
 * from another origin (Sanity-hosted Studio, #28).
 */
const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  partitioned: true,
  maxAge: SECRET_TTL_SECONDS,
} as const;

/** The subset of AstroCookies this module needs. */
export interface CookieJar {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: typeof COOKIE_OPTIONS): void;
}

/**
 * Handles Presentation's "enable preview mode" request: validates the secret in the URL,
 * stores it in the session cookie, and redirects into the preview.
 */
export async function enableDraftMode(
  request: Request,
  cookies: CookieJar,
  client: SanityClientLike | null
): Promise<Response> {
  if (!client) {
    return new Response('Preview is not configured: SANITY_API_READ_TOKEN is missing.', { status: 503 });
  }

  const { isValid, redirectTo } = await validatePreviewUrl(client, request.url);
  const secret = new URL(request.url).searchParams.get(urlSearchParamPreviewSecret);
  if (!isValid || !secret) {
    return new Response('Invalid preview secret.', { status: 401 });
  }

  cookies.set(DRAFT_MODE_COOKIE, secret, COOKIE_OPTIONS);
  // validatePreviewUrl only ever returns a same-origin path, so this cannot be an open redirect.
  return new Response(null, { status: 307, headers: { Location: redirectTo || PREVIEW_PATH } });
}

/** True only when the request carries a preview secret that Sanity still recognises. */
export async function hasDraftSession(
  cookies: CookieJar,
  client: SanityClientLike | null
): Promise<boolean> {
  const secret = cookies.get(DRAFT_MODE_COOKIE)?.value;
  if (!client || !secret) return false;

  const url = new URL(PREVIEW_PATH, 'http://localhost');
  url.searchParams.set(urlSearchParamPreviewSecret, secret);
  const { isValid } = await validatePreviewUrl(client, url.toString());
  return isValid;
}
