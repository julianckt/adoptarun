import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Global Footer Component', () => {
  const footerPath = resolve(__dirname, '../../src/components/Footer.astro');

  it('exists at src/components/Footer.astro', () => {
    expect(existsSync(footerPath)).toBe(true);
  });

  it('renders geographic coordinates, community links, and copyright text in template', () => {
    const content = readFileSync(footerPath, 'utf-8');

    // Geographic coordinates
    expect(content).toContain('22.3193° N, 114.1694° E');

    // Community links (all lowercase per DESIGN.md)
    expect(content).toContain('strava club');
    expect(content).toContain('instagram');
    expect(content).toContain('github');
    expect(content).toContain('terms');

    // Legal copyright notice
    expect(content.toLowerCase()).toContain('© 2026 adopt a run. all rights reserved.');
  });

  it('produces valid DOM hierarchy with styled footer classes', () => {
    const content = readFileSync(footerPath, 'utf-8');
    // Extract template below frontmatter and replace Astro expressions for HTML parsing
    const parts = content.split(/---/);
    let template = parts.length >= 3 ? parts.slice(2).join('---').trim() : content;
    template = template.replace(/class:list=\{[^}]+\}/g, 'class="site-footer"');

    const div = document.createElement('div');
    div.innerHTML = template;

    const footer = div.querySelector('footer.site-footer');
    expect(footer).not.toBeNull();

    const coords = div.querySelector('.footer-coordinates');
    expect(coords?.textContent).toContain('22.3193° N, 114.1694° E');

    const copyright = div.querySelector('.footer-copyright');
    expect(copyright?.textContent?.toLowerCase()).toContain('© 2026 adopt a run. all rights reserved.');

    const links = Array.from(div.querySelectorAll('.footer-link')).map((el) => el.textContent?.trim().toLowerCase());
    expect(links).toContain('strava club');
    expect(links).toContain('instagram');
    expect(links).toContain('github');
    expect(links).toContain('terms');
  });
});
