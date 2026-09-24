import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

// The real @shadergradient/react components require a live WebGL canvas,
// which jsdom can't provide. Stubbing them lets us assert on *whether* the
// canvas mounts (the behavior this component owns) without needing WebGL.
vi.mock('@shadergradient/react', () => ({
  ShaderGradientCanvas: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="shader-canvas">{children}</div>
  ),
  ShaderGradient: (props: { animate?: string }) => (
    <div data-testid="shader-gradient" data-animate={props.animate} />
  ),
}));

import PageHeaderShaderBackground from '@/components/PageHeader/PageHeaderShaderBackground';

/**
 * A controllable double for the browser IntersectionObserver, so tests can
 * fire visibility changes without a real layout engine.
 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

describe('PageHeaderShaderBackground', () => {
  let getContextSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      MockIntersectionObserver;

    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    // Default: WebGL is available.
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({} as unknown as RenderingContext);
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('mounts the WebGL canvas once, before the header is even in view', () => {
    render(<PageHeaderShaderBackground preset="presetA" />);
    // The canvas (WebGL context) mounts immediately and stays mounted — only
    // the shader mesh inside it toggles with visibility. See the component's
    // doc comment for why: re-creating the context on every scroll-back was
    // slow enough to show as a flash of empty header.
    expect(screen.queryByTestId('shader-canvas')).not.toBeNull();
    expect(screen.queryByTestId('shader-gradient')).toBeNull();
  });

  it('renders the shader mesh once the header scrolls into view, without remounting the canvas', async () => {
    render(<PageHeaderShaderBackground preset="presetA" />);
    const canvas = screen.getByTestId('shader-canvas');
    const observer = MockIntersectionObserver.instances[0];

    act(() => observer.trigger(true));

    await waitFor(() => {
      expect(screen.queryByTestId('shader-gradient')).not.toBeNull();
    });
    expect(screen.getByTestId('shader-canvas')).toBe(canvas);
  });

  it('removes the shader mesh — but keeps the canvas mounted — once scrolled out of view', async () => {
    render(<PageHeaderShaderBackground preset="presetA" />);
    const canvas = screen.getByTestId('shader-canvas');
    const observer = MockIntersectionObserver.instances[0];

    act(() => observer.trigger(true));
    await waitFor(() => {
      expect(screen.queryByTestId('shader-gradient')).not.toBeNull();
    });

    act(() => observer.trigger(false));
    await waitFor(() => {
      expect(screen.queryByTestId('shader-gradient')).toBeNull();
    });
    expect(screen.getByTestId('shader-canvas')).toBe(canvas);
  });

  it('falls back to the static still image when WebGL is unavailable', async () => {
    getContextSpy.mockReturnValue(null);

    render(<PageHeaderShaderBackground preset="presetA" />);
    const observer = MockIntersectionObserver.instances[0];
    act(() => observer.trigger(true));

    await waitFor(() => {
      expect(document.querySelector('img.page-header-shader-still')).toBeTruthy();
    });
    expect(screen.queryByTestId('shader-canvas')).toBeNull();
    expect(document.querySelector('img.page-header-shader-still')?.getAttribute('alt')).toBe('');
  });

  it('renders as decorative and out of the accessibility tree', () => {
    const { container } = render(<PageHeaderShaderBackground preset="presetA" />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('stops animating when the viewer prefers reduced motion', async () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    render(<PageHeaderShaderBackground preset="presetA" />);
    const observer = MockIntersectionObserver.instances[0];
    act(() => observer.trigger(true));

    await waitFor(() => {
      expect(screen.getByTestId('shader-gradient').getAttribute('data-animate')).toBe('off');
    });
  });
});
