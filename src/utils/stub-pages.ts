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
    slug: 'charities',
    title: 'charities',
    description: 'partner charity profiles are on their way.',
  },
  {
    slug: 'signup',
    title: 'adopt a route',
    description: 'route adoption opens soon. check back to claim your first route.',
  },
  {
    slug: 'donate',
    title: 'donate',
    description: 'online donations open soon.',
  },
  {
    slug: 'log',
    title: 'log a run',
    description: 'run logging opens alongside route adoption.',
  },
  {
    slug: 'faqs',
    title: 'frequently asked questions',
    description: 'answers to common questions about route adoption, gps art, and fundraising are on their way.',
  },
  {
    slug: 'privacy',
    title: 'privacy policy',
    description: 'our privacy policy is being finalised and will be published here.',
  },
  {
    slug: 'terms',
    title: 'terms & conditions',
    description: 'our terms & conditions are being finalised and will be published here.',
  },
];
