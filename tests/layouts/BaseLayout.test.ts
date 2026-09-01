import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('BaseLayout Shell Interface & Metadata', () => {
  const layoutPath = resolve(__dirname, '../../src/layouts/BaseLayout.astro');

  it('should exist at src/layouts/BaseLayout.astro', () => {
    expect(existsSync(layoutPath)).toBe(true);
  });

  it('should declare standard HTML5 metadata and slots', () => {
    const content = readFileSync(layoutPath, 'utf-8');

    // Document structure
    expect(content).toContain('<!doctype html>');
    expect(content).toContain('<html');
    expect(content).toContain('<head>');
    expect(content).toContain('<body');
    expect(content).toContain('</body>');
    expect(content).toContain('<slot />');

    // Standard metadata elements
    expect(content).toContain('charset="UTF-8"');
    expect(content).toContain('name="viewport"');
    expect(content).toContain('name="description"');
    expect(content).toContain('rel="icon"');

    // OpenGraph metadata
    expect(content).toContain('property="og:title"');
    expect(content).toContain('property="og:description"');
    expect(content).toContain('property="og:type"');

    // Clean-prop / class forwarding
    expect(content).toContain('class:list');
  });
});
