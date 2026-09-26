/**
 * Placeholder pages for internal links whose real pages aren't built yet (issue #20).
 * Rendered by `src/pages/[stub].astro`. When a real page ships (e.g. `src/pages/routes.astro`),
 * delete its entry here — the static route takes over the URL.
 */
export interface StubPage {
  slug: string;
  title: string;
  description: string;
}

export const STUB_PAGES: readonly StubPage[] = [
  {
    slug: 'donate',
    title: 'donate',
    description: 'we are working with fundraising platforms to make donating seamless.',
  },
  {
    slug: 'log',
    title: 'log a run',
    description: 'the run logging system and the digital certificate system are opening soon. ',
  },
];
