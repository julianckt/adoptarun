import { describe, it, expect } from 'vitest';
import { checkBuild, candidateFiles, extractInternalLinks, scanHtml } from '../../scripts/lib/build-guard.mjs';
import { STUB_PAGES } from '@/utils/stub-pages';

const page = (body: string) => `<!doctype html><html><head></head><body>${body}</body></html>`;

describe('scanHtml', () => {
  it('passes clean HTML', () => {
    expect(scanHtml('index.html', page('<h2>featured routes</h2>'))).toEqual([]);
  });

  it('flags the impeccable live-preview script', () => {
    const html = page('<script src="http://localhost:8400/live.js?token=abc"></script>');
    expect(scanHtml('index.html', html).map((v) => v.rule)).toContain('live-preview-script');
  });

  it('flags and counts Sanity stega characters', () => {
    const [violation] = scanHtml('index.html', page('Wan Chai​‌‍﻿'));
    expect(violation.rule).toBe('stega-characters');
    expect(violation.message).toMatch(/^4 /);
  });

  it('flags the Visual Editing island', () => {
    const html = page('<astro-island component-url="/_astro/visual-editing-component.X.js"></astro-island>');
    expect(scanHtml('index.html', html).map((v) => v.rule)).toContain('visual-editing-island');
  });
});

describe('extractInternalLinks', () => {
  it('returns root-relative paths without query or hash, ignoring external and protocol-relative links', () => {
    const html = page(
      '<a href="/routes">r</a><a href="/#about">a</a><a href="/signup?ref=hero">s</a>' +
        '<a href="https://adoptarun.org/x">x</a><a href="//cdn.example/y">y</a><a href="#local">l</a>'
    );
    expect(extractInternalLinks(html).sort()).toEqual(['/', '/routes', '/signup']);
  });
});

describe('candidateFiles', () => {
  it('maps directory paths to index.html and bare paths to file, .html or directory index', () => {
    expect(candidateFiles('/')).toEqual(['index.html']);
    expect(candidateFiles('/routes')).toEqual(['routes', 'routes.html', 'routes/index.html']);
    expect(candidateFiles('/images/og-default.jpg')).toContain('images/og-default.jpg');
  });
});

describe('checkBuild', () => {
  const files = new Map([
    ['index.html', page('<a href="/routes">routes</a><a href="/privacy">privacy</a>')],
    ['routes/index.html', page('<a href="/">home</a>')],
  ]);
  const built = new Set(files.keys());

  it('flags internal links with no built page', () => {
    const violations = checkBuild(files, (p) => built.has(p));
    expect(violations).toEqual([
      expect.objectContaining({ file: 'index.html', rule: 'dead-internal-link', message: expect.stringContaining('/privacy') }),
    ]);
  });

  it('allows on-demand routes', () => {
    const dynamic = new Map([['index.html', page('<a href="/preview">p</a><a href="/api/health">h</a>')]]);
    expect(checkBuild(dynamic, () => false)).toEqual([]);
  });

  it('flags editing tooling if accidentally emitted to any page', () => {
    const studio = new Map([['studio/index.html', page('visual-editing ​')]]);
    expect(checkBuild(studio, () => true).length).toBeGreaterThan(0);
  });
});

describe('stub pages', () => {
  it('cover every internal destination the site navigation links to', () => {
    expect(STUB_PAGES.map((p) => p.slug).sort()).toEqual(
      ['charities', 'donate', 'faqs', 'log', 'privacy', 'signup', 'terms']
    );
  });
});
