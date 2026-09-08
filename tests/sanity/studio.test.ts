import { describe, it, expect } from 'vitest';
import sanityConfig from '../../sanity.config';
import sanityCliConfig from '../../sanity.cli';
import SanityStudio from '../../src/components/sanity/Studio';

describe('Sanity Studio Integration & Configuration', () => {
  describe('sanity.config.ts', () => {
    it('sets basePath to /studio', () => {
      // Single workspace config
      expect((sanityConfig as any).basePath).toBe('/studio');
    });

    it('configures valid project credentials', () => {
      expect((sanityConfig as any).projectId).toBe('huk9xx07');
      expect((sanityConfig as any).dataset).toBe('production');
      expect((sanityConfig as any).name).toBe('adopt-a-run');
    });

    it('configures plugins including structureTool and presentationTool', () => {
      const plugins = (sanityConfig as any).plugins;
      expect(Array.isArray(plugins)).toBe(true);
      expect(plugins.length).toBeGreaterThanOrEqual(2);
      expect(plugins[0].name).toBe('sanity/structure');
      expect(plugins[1]).toBeDefined();
    });
  });

  describe('sanity.cli.ts', () => {
    it('configures project API credentials for CLI operations', () => {
      expect((sanityCliConfig as any).api).toBeDefined();
      expect((sanityCliConfig as any).api.projectId).toBe('huk9xx07');
      expect((sanityCliConfig as any).api.dataset).toBe('production');
    });
  });

  describe('Studio.tsx Component', () => {
    it('exports a valid React component function', () => {
      expect(typeof SanityStudio).toBe('function');
    });

    it('returns a JSX element containing the Studio layout', () => {
      const element = SanityStudio();
      expect(element).toBeDefined();
      expect(element.type).toBeDefined();
    });
  });
});

