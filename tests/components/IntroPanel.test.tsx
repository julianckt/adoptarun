import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import IntroPanel from '../../src/components/signup/IntroPanel';

describe('IntroPanel', () => {
  const originalFonts = document.fonts;

  afterEach(() => {
    Object.defineProperty(document, 'fonts', {
      value: originalFonts,
      configurable: true,
      writable: true,
    });
  });

  it('sets data-font-ready="true" on .signup-intro-run when Scale VF font is ready and active', async () => {
    const checkMock = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'fonts', {
      value: {
        ready: Promise.resolve(),
        check: checkMock,
      },
      configurable: true,
      writable: true,
    });

    render(
      <IntroPanel
        ctaLabel="begin adoption"
        showChooseAnother={false}
        onAdvance={() => {}}
        onChooseAnother={() => {}}
      />
    );

    const runSpan = screen.getByText('run');
    await waitFor(() => {
      expect(runSpan.getAttribute('data-font-ready')).toBe('true');
    });
    expect(checkMock).toHaveBeenCalledWith('900 1em scale-variable');
  });

  it('leaves data-font-ready="false" if the font check fails (fallback font active)', async () => {
    const checkMock = vi.fn().mockReturnValue(false);
    Object.defineProperty(document, 'fonts', {
      value: {
        ready: Promise.resolve(),
        check: checkMock,
      },
      configurable: true,
      writable: true,
    });

    render(
      <IntroPanel
        ctaLabel="begin adoption"
        showChooseAnother={false}
        onAdvance={() => {}}
        onChooseAnother={() => {}}
      />
    );

    const runSpan = screen.getByText('run');
    // Allow any pending promises to flush
    await Promise.resolve();
    expect(runSpan.getAttribute('data-font-ready')).toBe('false');
  });
});
