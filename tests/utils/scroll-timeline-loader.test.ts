import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initScrollTimeline } from '@/utils/scroll-timeline-loader';

describe('scroll-timeline-loader', () => {
  const originalCSS = globalThis.CSS;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.CSS = originalCSS;
    window.matchMedia = originalMatchMedia;
  });

  it('bypasses polyfill when browser natively supports animation-timeline view()', async () => {
    globalThis.CSS = {
      supports: vi.fn((prop: string, val?: string) => {
        if (prop === 'animation-timeline' && val === 'view()') return true;
        return false;
      }),
    } as unknown as typeof CSS;

    const querySelectorSpy = vi.spyOn(document, 'querySelector');

    await initScrollTimeline();

    // Should return early and not touch the DOM
    expect(globalThis.CSS.supports).toHaveBeenCalledWith('animation-timeline', 'view()');
    expect(querySelectorSpy).not.toHaveBeenCalled();
  });

  it('bypasses polyfill when prefers-reduced-motion is reduce', async () => {
    globalThis.CSS = {
      supports: vi.fn(() => false),
    } as unknown as typeof CSS;

    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
    } as MediaQueryList);

    const querySelectorSpy = vi.spyOn(document, 'querySelector');

    await initScrollTimeline();

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(querySelectorSpy).not.toHaveBeenCalled();
  });

  it('passes ease-out-expo easing to animate options in fallback mode', async () => {
    globalThis.CSS = {
      supports: vi.fn(() => false),
    } as unknown as typeof CSS;

    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
    } as MediaQueryList);

    // Provide mock ViewTimeline and ResizeObserver
    const originalResizeObserver = (window as any).ResizeObserver;
    (window as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Set up a mock DOM element for about-section
    const mockSection = document.createElement('div');
    mockSection.id = 'about-section';
    const mockDesc = document.createElement('div');
    mockDesc.className = 'about-description';
    const animateSpy = vi.fn();
    mockDesc.animate = animateSpy;
    mockSection.appendChild(mockDesc);
    document.body.appendChild(mockSection);

    try {
      await initScrollTimeline();

      expect(animateSpy).toHaveBeenCalled();
      const lastCall = animateSpy.mock.calls[0];
      const animationOptions = lastCall[1];
      expect(animationOptions).toHaveProperty('easing', 'cubic-bezier(0.16, 1, 0.3, 1)');
    } finally {
      mockSection.remove();
      (window as any).ResizeObserver = originalResizeObserver;
    }
  });
});
