import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, studioTheme } from '@sanity/ui';

// Mock Sanity hooks
const mockUseFormValue = vi.fn();

vi.mock('sanity', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sanity')>();
  return {
    ...actual,
    useFormValue: (path: string[]) => mockUseFormValue(path),
  };
});

import { CharitySlugInput } from '../../src/components/sanity/CharitySlugInput';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={studioTheme}>{ui}</ThemeProvider>);
}

describe('CharitySlugInput Sanity Studio Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('auto-generates slug when charity name changes', async () => {
    mockUseFormValue.mockImplementation((path: string[]) => {
      if (path[0] === 'name') return 'SPCA (HK)';
      return undefined;
    });

    const mockOnChange = vi.fn();

    renderWithTheme(
      <CharitySlugInput
        value={undefined}
        onChange={mockOnChange}
        schemaType={{ name: 'slug', title: 'Slug' } as any}
      />
    );

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    const patchEvent = mockOnChange.mock.calls[0][0];
    const patches = patchEvent.patches || [patchEvent];
    const setValue = patches[0]?.value;
    expect(setValue).toEqual({ _type: 'slug', current: 'spca-hk' });
  });

  it('does not overwrite existing slug on initial mount', async () => {
    mockUseFormValue.mockImplementation((path: string[]) => {
      if (path[0] === 'name') return 'Different Name';
      return undefined;
    });

    const mockOnChange = vi.fn();

    renderWithTheme(
      <CharitySlugInput
        value={{ _type: 'slug', current: 'spca-custom' }}
        onChange={mockOnChange}
        schemaType={{ name: 'slug', title: 'Slug' } as any}
      />
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('allows manual override of charity slug', async () => {
    mockUseFormValue.mockImplementation((path: string[]) => {
      if (path[0] === 'name') return 'SPCA';
      return undefined;
    });

    const mockOnChange = vi.fn();

    renderWithTheme(
      <CharitySlugInput
        value={{ _type: 'slug', current: 'spca' }}
        onChange={mockOnChange}
        schemaType={{ name: 'slug', title: 'Slug' } as any}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'custom-spca-hk' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    const patches = lastCall.patches || [lastCall];
    const setValue = patches[0]?.value;
    expect(setValue).toEqual({ _type: 'slug', current: 'custom-spca-hk' });
  });

  it('displays the preview URL badge and text', () => {
    mockUseFormValue.mockReturnValue('SPCA');

    renderWithTheme(
      <CharitySlugInput
        value={{ _type: 'slug', current: 'spca-hk' }}
        onChange={vi.fn()}
        schemaType={{ name: 'slug', title: 'Slug' } as any}
      />
    );

    expect(screen.getByText('Auto-Slug')).toBeDefined();
    expect(screen.getByText(/Public charity URL: \/charities\/spca-hk/)).toBeDefined();
  });
});
