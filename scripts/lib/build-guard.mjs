/**
 * Production build guard (issue #20).
 *
 * Pure checks over the static HTML that ships to Cloudflare. `scripts/check-build.mjs` runs
 * them after `astro build` and fails the build on any violation, so a bad artefact never deploys.
 */

/** Zero-width characters used by Sanity stega encoding. */
const STEGA_CHARS = /[​‌‍⁠﻿]/g;

/** Content that must never appear in public HTML. */
const FORBIDDEN_PATTERNS = [
  {
    rule: 'live-preview-script',
    pattern: /localhost:8400|\/live\.js\b/,
    message: 'impeccable live-preview script injected into the page',
  },
  {
    rule: 'visual-editing-island',
    pattern: /visual-editing/i,
    message: 'Sanity Visual Editing island shipped on a public page',
  },
];

/**
 * Paths that are valid without a static file: on-demand Worker routes.
 */
const DYNAMIC_PREFIXES = ['/api/', '/preview'];

/** Build output that is allowed to contain editing tooling. */
const EXEMPT_FILE_PREFIXES = [];

/**
 * @typedef {{ file: string, rule: string, message: string }} Violation
 */

/**
 * @param {string} file build-relative path, e.g. `index.html`
 * @param {string} html
 * @returns {Violation[]}
 */
export function scanHtml(file, html) {
  /** @type {Violation[]} */
  const violations = [];

  const stegaCount = html.match(STEGA_CHARS)?.length ?? 0;
  if (stegaCount > 0) {
    violations.push({
      file,
      rule: 'stega-characters',
      message: `${stegaCount} Sanity stega zero-width characters in HTML`,
    });
  }

  for (const { rule, pattern, message } of FORBIDDEN_PATTERNS) {
    if (pattern.test(html)) violations.push({ file, rule, message });
  }

  return violations;
}

/**
 * Root-relative `href`s (`/foo`, not `//cdn` or `https://…`), without query or hash.
 * @param {string} html
 * @returns {string[]}
 */
export function extractInternalLinks(html) {
  const links = new Set();
  for (const [, href] of html.matchAll(/\shref="(\/(?!\/)[^"]*)"/g)) {
    links.add(href.split(/[?#]/)[0] || '/');
  }
  return [...links];
}

/**
 * Candidate build files that would serve a path, mirroring static-asset routing.
 * @param {string} pathname
 * @returns {string[]}
 */
export function candidateFiles(pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (clean === '' || clean.endsWith('/')) return [`${clean}index.html`];
  return [clean, `${clean}.html`, `${clean}/index.html`];
}

/**
 * @param {Map<string, string>} htmlFiles build-relative path -> HTML
 * @param {(relPath: string) => boolean} fileExists
 * @returns {Violation[]}
 */
export function checkBuild(htmlFiles, fileExists) {
  /** @type {Violation[]} */
  const violations = [];

  for (const [file, html] of htmlFiles) {
    if (EXEMPT_FILE_PREFIXES.some((prefix) => file.startsWith(prefix))) continue;

    violations.push(...scanHtml(file, html));

    for (const link of extractInternalLinks(html)) {
      if (DYNAMIC_PREFIXES.some((prefix) => link === prefix || link.startsWith(prefix))) continue;
      if (!candidateFiles(link).some(fileExists)) {
        violations.push({ file, rule: 'dead-internal-link', message: `links to ${link}, which has no page` });
      }
    }
  }

  return violations;
}
