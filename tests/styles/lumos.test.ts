import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Lumos Design System & Fluid Design Token Foundation', () => {
  const stylesDir = resolve(__dirname, '../../src/styles');
  const globalCssPath = resolve(stylesDir, 'global.css');
  const tokensCssPath = resolve(stylesDir, 'tokens.css');
  const baseCssPath = resolve(stylesDir, 'base.css');
  const patternsCssPath = resolve(stylesDir, 'patterns.css');
  const componentsCssPath = resolve(stylesDir, 'components.css');
  const utilitiesCssPath = resolve(stylesDir, 'utilities.css');
  const layoutPath = resolve(__dirname, '../../src/layouts/BaseLayout.astro');

  describe('CSS Architecture & Layer Structure', () => {
    it('should have all required Lumos style files in src/styles/', () => {
      expect(existsSync(globalCssPath)).toBe(true);
      expect(existsSync(tokensCssPath)).toBe(true);
      expect(existsSync(baseCssPath)).toBe(true);
      expect(existsSync(patternsCssPath)).toBe(true);
      expect(existsSync(componentsCssPath)).toBe(true);
      expect(existsSync(utilitiesCssPath)).toBe(true);
    });

    it('should declare layer hierarchy in global.css', () => {
      const content = readFileSync(globalCssPath, 'utf-8');
      expect(content).toMatch(/@layer\s+base,\s*patterns,\s*components,\s*utilities;/);
      expect(content).toContain("@import './tokens.css';");
      expect(content).toContain("@import './base.css';");
      expect(content).toContain("@import './patterns.css';");
      expect(content).toContain("@import './components.css';");
      expect(content).toContain("@import './utilities.css';");
    });

    it('should scope token and base definitions to @layer base', () => {
      const tokensContent = readFileSync(tokensCssPath, 'utf-8');
      const baseContent = readFileSync(baseCssPath, 'utf-8');
      expect(tokensContent).toContain('@layer base');
      expect(baseContent).toContain('@layer base');
    });

    it('should scope patterns to @layer patterns', () => {
      const patternsContent = readFileSync(patternsCssPath, 'utf-8');
      expect(patternsContent).toContain('@layer patterns');
    });

    it('should scope components to @layer components', () => {
      const componentsContent = readFileSync(componentsCssPath, 'utf-8');
      expect(componentsContent).toContain('@layer components');
    });

    it('should scope utilities to @layer utilities', () => {
      const utilitiesContent = readFileSync(utilitiesCssPath, 'utf-8');
      expect(utilitiesContent).toContain('@layer utilities');
    });
  });

  describe('Tokens Specification (DESIGN.md & Master Spec)', () => {
    let tokensContent = '';

    beforeAll(() => {
      if (existsSync(tokensCssPath)) {
        tokensContent = readFileSync(tokensCssPath, 'utf-8');
      }
    });

    it('should declare brand color primitives from DESIGN.md', () => {
      expect(tokensContent).toContain('--color-canvas-black: rgb(24, 19, 17);');
      expect(tokensContent).toContain('--color-canvas-white: rgb(255, 251, 249);');
      expect(tokensContent).toContain('--color-pure-white: rgb(255, 255, 255);');
      expect(tokensContent).toContain('--color-pure-black: rgb(0, 0, 0);');
      expect(tokensContent).toContain('--color-route-orange: rgb(245, 174, 102);');
      expect(tokensContent).toContain('--color-group-run-green: rgb(91, 190, 73);');
      expect(tokensContent).toContain('--color-route-coral: rgb(255, 132, 132);');
      expect(tokensContent).toContain('--color-route-blush: rgb(229, 153, 158);');
      expect(tokensContent).toContain('--color-placeholder-grey: rgb(217, 217, 217);');
      expect(tokensContent).toContain('--color-placeholder-grey-mid: rgb(191, 191, 191);');
      expect(tokensContent).toContain('--color-border-hairline: rgba(255, 251, 249, 0.16);');
    });

    it('should declare semantic color tokens', () => {
      expect(tokensContent).toContain('--color-action-primary:');
      expect(tokensContent).toContain('--color-action-secondary:');
      expect(tokensContent).toContain('--color-surface-canvas:');
      expect(tokensContent).toContain('--color-surface-card:');
      expect(tokensContent).toContain('--color-surface-overlay:');
      expect(tokensContent).toContain('--color-border-subtle:');
      expect(tokensContent).toContain('--color-border-strong:');
      expect(tokensContent).toContain('--color-accent:');
      expect(tokensContent).toContain('--color-highlight:');
      expect(tokensContent).toContain('--color-text-primary:');
      expect(tokensContent).toContain('--color-text-secondary:');
      expect(tokensContent).toContain('--color-text-muted:');
    });

    it('should declare the 14 discrete spacing tokens matching DESIGN.md', () => {
      const expectedTokens = [
        ['--space-00', '0px'],
        ['--space-01', '2px'],
        ['--space-02', '4px'],
        ['--space-03', '8px'],
        ['--space-04', '12px'],
        ['--space-05', '16px'],
        ['--space-06', '24px'],
        ['--space-07', '32px'],
        ['--space-08', '40px'],
        ['--space-09', '48px'],
        ['--space-10', '64px'],
        ['--space-11', '80px'],
        ['--space-12', '96px'],
        ['--space-13', '160px'],
      ];

      for (const [token, value] of expectedTokens) {
        expect(tokensContent).toContain(`${token}: ${value};`);
      }
    });

    it('should declare fluid spacing clamp tokens', () => {
      const fluidSpacingTokens = [
        '--space-fluid-xs',
        '--space-fluid-sm',
        '--space-fluid-md',
        '--space-fluid-lg',
        '--space-fluid-xl',
        '--space-fluid-2xl',
        '--space-fluid-3xl',
      ];

      for (const token of fluidSpacingTokens) {
        const regex = new RegExp(`${token}:\\s*clamp\\([^)]+\\);`);
        expect(tokensContent).toMatch(regex);
      }
    });

    it('should declare semantic font families and fluid typography clamp tokens', () => {
      expect(tokensContent).toContain('--font-display:');
      expect(tokensContent).toContain('--font-body:');
      expect(tokensContent).toContain('--font-wordmark:');
      expect(tokensContent).toContain('--font-chinese:');
      expect(tokensContent).toContain('--font-mono:');

      const fluidTypographyTokens = [
        '--font-fluid-display',
        '--font-fluid-headline',
        '--font-fluid-title',
        '--font-fluid-body',
        '--font-fluid-label',
      ];

      for (const token of fluidTypographyTokens) {
        const regex = new RegExp(`${token}:\\s*clamp\\([^)]+\\);`);
        expect(tokensContent).toMatch(regex);
      }
    });

    it('should declare discrete typography scale tokens matching DESIGN.md', () => {
      const expectedTokens = [
        ['--font-size-micro', '12px'],
        ['--font-size-label', '16px'],
        ['--font-size-body', '20px'],
        ['--font-size-metric', '24px'],
        ['--font-size-wordmark', '48px'],
        ['--font-size-title', '64px'],
        ['--font-size-headline', '80px'],
        ['--font-size-display', '160px'],
      ];

      for (const [token, value] of expectedTokens) {
        expect(tokensContent).toContain(`${token}: ${value};`);
      }
    });

    it('should enforce architectural rules (Zero Radius & Compression)', () => {
      expect(tokensContent).toContain('--radius-none: 0px;');
      expect(tokensContent).toContain('--leading-default: 1.0;');
      expect(tokensContent).toContain('--leading-body: 1.0;');
      expect(tokensContent).toContain('--leading-compressed: 0.8;');
      expect(tokensContent).toContain('--leading-display: 0.8;');
      expect(tokensContent).toContain('--leading-action: 0.8;');
      expect(tokensContent).toContain('--leading-cta: 0.8;');
      expect(tokensContent).toContain('--leading-wordmark: 0.75;');
    });
  });

  describe('Base & Zero-Radius Reset (base.css)', () => {
    it('should enforce universal box-sizing and zero-radius rule', () => {
      const content = readFileSync(baseCssPath, 'utf-8');
      expect(content).toContain('box-sizing: border-box');
      expect(content).toContain('border-radius: var(--radius-none) !important;');
    });

    it('should configure root canvas background and typography defaults', () => {
      const content = readFileSync(baseCssPath, 'utf-8');
      expect(content).toContain('background-color: var(--color-surface-canvas);');
      expect(content).toContain('color: var(--color-text-primary);');
      expect(content).toContain('font-family: var(--font-body);');
      expect(content).toContain('line-height: var(--leading-default);');
      expect(content).toContain('line-height: var(--leading-action);');
    });
  });

  describe('Components Foundation (components.css)', () => {
    it('should implement foundational design system components', () => {
      const content = readFileSync(componentsCssPath, 'utf-8');
      expect(content).toContain('.btn');
      expect(content).toContain('.btn-primary');
      expect(content).toContain('.btn-secondary');
      expect(content).toContain('.card-route');
      expect(content).toContain('.badge-group-run');
      expect(content).toContain('.media-placeholder');
      expect(content).toContain('box-shadow: 0 0 24px rgba(245, 174, 102, 0.28)');
      expect(content).toContain('line-height: var(--leading-action);');
      expect(content).toContain('line-height: var(--leading-wordmark);');
    });
  });

  describe('Utilities (utilities.css)', () => {
    it('should implement container query and layout utility classes', () => {
      const content = readFileSync(utilitiesCssPath, 'utf-8');
      expect(content).toContain('.u-container');
      expect(content).toContain('container-type: inline-size');
      expect(content).toContain('.u-grid-autofit');
      expect(content).toContain('repeat(auto-fit, minmax(');
      expect(content).toContain('.u-text-lowercase');
      expect(content).toContain('.u-text-display');
      expect(content).toContain('.u-border-hairline');
      expect(content).toContain('.u-flat-rest');
      expect(content).toContain('.u-leading-action');
      expect(content).toContain('.u-leading-wordmark');
      expect(content).toContain('line-height: var(--leading-wordmark);');
    });
  });

  describe('BaseLayout Integration', () => {
    it('should import global.css in BaseLayout.astro', () => {
      const content = readFileSync(layoutPath, 'utf-8');
      expect(content).toMatch(/import\s+['"]@\/styles\/global\.css['"]/);
    });
  });
});
