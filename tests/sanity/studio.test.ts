import { describe, it, expect } from 'vitest';
import sanityConfig from '../../sanity.config';
import sanityCliConfig from '../../sanity.cli';

describe('Sanity Studio Integration & Configuration', () => {
  describe('sanity.config.ts', () => {
    it('does not set basePath (serves from root for hosted Studio)', () => {
      expect((sanityConfig as any).basePath).toBeUndefined();
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

    it('configures studioHost and deployment appId for Sanity hosting', () => {
      expect((sanityCliConfig as any).studioHost).toBe('adoptarun');
      expect((sanityCliConfig as any).deployment?.appId).toBe('mkr9jpmsyclswe4ggdzojc66');
    });
  });
});
