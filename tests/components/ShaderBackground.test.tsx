import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ShaderBackground from '@/components/ShaderBackground/ShaderBackground';
import { SHADER_PRESET_A, SHADER_PRESET_B } from '@/components/ShaderBackground/shaderConfig';

// Mock @shadergradient/react to render inspectable DOM elements in jsdom
vi.mock('@shadergradient/react', () => ({
  ShaderGradientCanvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="shader-canvas">{children}</div>
  ),
  ShaderGradient: (props: any) => (
    <div
      data-testid="shader-gradient"
      data-shader={props.shader}
      data-animate={props.animate}
      data-color1={props.color1}
      data-color2={props.color2}
      data-color3={props.color3}
    />
  ),
}));

describe('ShaderBackground Component', () => {
  let observerCallbacks: ((entries: Partial<IntersectionObserverEntry>[]) => void)[] = [];
  let observedElements: Element[] = [];
  let matchMediaMock: any;

  beforeEach(() => {
    vi.useFakeTimers();
    observerCallbacks = [];
    observedElements = [];

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      observerCallbacks.push(callback);
      return {
        observe: vi.fn((el: Element) => {
          observedElements.push(el);
        }),
        unobserve: vi.fn((el: Element) => {
          observedElements = observedElements.filter((item) => item !== el);
        }),
        disconnect: vi.fn(() => {
          observedElements = [];
        }),
      };
    }) as any;

    // Mock matchMedia
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;

    // Clear document body
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('renders with Preset A defaults initially', () => {
    render(<ShaderBackground />);
    const shader = screen.getByTestId('shader-gradient');
    expect(shader.getAttribute('data-color1')).toBe(SHADER_PRESET_A.color1);
    expect(shader.getAttribute('data-animate')).toBe('on');
  });

  it('honors forcedPreset prop override', () => {
    render(<ShaderBackground forcedPreset="presetB" />);
    const shader = screen.getByTestId('shader-gradient');
    expect(shader.getAttribute('data-color1')).toBe(SHADER_PRESET_B.color1);
  });

  it('disables animation when prefers-reduced-motion is active', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(<ShaderBackground />);
    const shader = screen.getByTestId('shader-gradient');
    expect(shader.getAttribute('data-animate')).toBe('off');
  });

  describe('IntersectionObserver & Dominance Logic', () => {
    let heroEl: HTMLElement;
    let routesEl: HTMLElement;
    let ctaEl: HTMLElement;

    beforeEach(() => {
      heroEl = document.createElement('section');
      heroEl.className = 'hero-fullscreen';
      routesEl = document.createElement('section');
      routesEl.id = 'routes-featured';
      ctaEl = document.createElement('section');
      ctaEl.id = 'bottom-cta';

      document.body.appendChild(heroEl);
      document.body.appendChild(routesEl);
      document.body.appendChild(ctaEl);
    });

    it('observes all target transparent sections', () => {
      render(<ShaderBackground />);
      expect(observedElements).toContain(heroEl);
      expect(observedElements).toContain(routesEl);
      expect(observedElements).toContain(ctaEl);
    });

    it('switches to Preset B when #routes-featured visible height exceeds hero', () => {
      render(<ShaderBackground />);
      const callback = observerCallbacks[0];
      expect(callback).toBeDefined();

      // Initially hero is visible with 600px
      act(() => {
        callback([
          {
            target: heroEl,
            isIntersecting: true,
            intersectionRatio: 1.0,
            intersectionRect: { height: 600 } as DOMRectReadOnly,
          },
        ]);
      });

      let shader = screen.getByTestId('shader-gradient');
      expect(shader.getAttribute('data-color1')).toBe(SHADER_PRESET_A.color1);

      // User scrolls: routes enters with 700px visible height, hero has 200px
      act(() => {
        callback([
          {
            target: heroEl,
            isIntersecting: true,
            intersectionRatio: 0.33,
            intersectionRect: { height: 200 } as DOMRectReadOnly,
          },
          {
            target: routesEl,
            isIntersecting: true,
            intersectionRatio: 0.9,
            intersectionRect: { height: 700 } as DOMRectReadOnly,
          },
        ]);
      });

      // Fast-forward opacity dip crossfade (250ms)
      act(() => {
        vi.advanceTimersByTime(260);
      });

      shader = screen.getByTestId('shader-gradient');
      expect(shader.getAttribute('data-color1')).toBe(SHADER_PRESET_B.color1);
    });

    it('dips wrapper opacity to 0.3 during preset change and restores to 1 after 250ms', () => {
      const { container } = render(<ShaderBackground />);
      // Initial mount timer
      act(() => {
        vi.advanceTimersByTime(110);
      });

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.style.opacity).toBe('1');

      const callback = observerCallbacks[0];
      // Trigger routes dominance
      act(() => {
        callback([
          {
            target: routesEl,
            isIntersecting: true,
            intersectionRatio: 1.0,
            intersectionRect: { height: 600 } as DOMRectReadOnly,
          },
        ]);
      });

      // Opacity dipped immediately to 0.3
      expect(wrapper.style.opacity).toBe('0.3');

      // Before 250ms, still 0.3
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(wrapper.style.opacity).toBe('0.3');

      // At 250ms+, opacity restores to 1
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(wrapper.style.opacity).toBe('1');
    });

    it('bypasses opacity dip when prefersReducedMotion is active', () => {
      matchMediaMock.mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const { container } = render(<ShaderBackground />);
      act(() => {
        vi.advanceTimersByTime(110);
      });

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.style.opacity).toBe('1');

      const callback = observerCallbacks[0];
      act(() => {
        callback([
          {
            target: routesEl,
            isIntersecting: true,
            intersectionRatio: 1.0,
            intersectionRect: { height: 600 } as DOMRectReadOnly,
          },
        ]);
      });

      // Opacity should NOT dip; preset swaps immediately
      expect(wrapper.style.opacity).toBe('1');
      const shader = screen.getByTestId('shader-gradient');
      expect(shader.getAttribute('data-color1')).toBe(SHADER_PRESET_B.color1);
    });

    it('does not delete element on threshold 0 entry when isIntersecting is true', () => {
      render(<ShaderBackground />);
      const callback = observerCallbacks[0];

      // CTA touches viewport margin: isIntersecting=true, but intersectionRect.height=0
      act(() => {
        callback([
          {
            target: ctaEl,
            isIntersecting: true,
            intersectionRatio: 0,
            intersectionRect: { height: 10 } as DOMRectReadOnly,
          },
        ]);
      });

      const shader = screen.getByTestId('shader-gradient');
      // Should not be suspended because activeElements has ctaEl
      expect(shader.getAttribute('data-animate')).toBe('on');
    });

    it('transitions back from Preset B to Preset A when #bottom-cta visible height exceeds #routes-featured', () => {
      render(<ShaderBackground />);
      const callback = observerCallbacks[0];

      // Step 1: routes is dominant
      act(() => {
        callback([
          {
            target: routesEl,
            isIntersecting: true,
            intersectionRatio: 0.8,
            intersectionRect: { height: 500 } as DOMRectReadOnly,
          },
        ]);
      });
      act(() => {
        vi.advanceTimersByTime(260);
      });
      expect(screen.getByTestId('shader-gradient').getAttribute('data-color1')).toBe(
        SHADER_PRESET_B.color1
      );

      // Step 2: scrolling towards bottom:
      // Even if routes has a higher ratio (e.g. 200/500 = 0.4) than cta (300/1000 = 0.3),
      // cta has more visible height (300px > 200px), so cta (Preset A) must dominate!
      act(() => {
        callback([
          {
            target: routesEl,
            isIntersecting: true,
            intersectionRatio: 0.4,
            intersectionRect: { height: 200 } as DOMRectReadOnly,
          },
          {
            target: ctaEl,
            isIntersecting: true,
            intersectionRatio: 0.3,
            intersectionRect: { height: 300 } as DOMRectReadOnly,
          },
        ]);
      });

      // Advance through crossfade
      act(() => {
        vi.advanceTimersByTime(260);
      });

      expect(screen.getByTestId('shader-gradient').getAttribute('data-color1')).toBe(
        SHADER_PRESET_A.color1
      );
    });

    it('suspends rendering (animate: off) when all transparent elements are offscreen', () => {
      render(<ShaderBackground />);
      const callback = observerCallbacks[0];

      // Opaque curtain covers viewport: elements exit
      act(() => {
        callback([
          {
            target: heroEl,
            isIntersecting: false,
            intersectionRatio: 0,
            intersectionRect: { height: 0 } as DOMRectReadOnly,
          },
          {
            target: routesEl,
            isIntersecting: false,
            intersectionRatio: 0,
            intersectionRect: { height: 0 } as DOMRectReadOnly,
          },
          {
            target: ctaEl,
            isIntersecting: false,
            intersectionRatio: 0,
            intersectionRect: { height: 0 } as DOMRectReadOnly,
          },
        ]);
      });

      const shader = screen.getByTestId('shader-gradient');
      expect(shader.getAttribute('data-animate')).toBe('off');
    });
  });
});
