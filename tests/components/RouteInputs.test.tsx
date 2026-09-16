import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, studioTheme } from '@sanity/ui';

// Mock Sanity hooks
const mockUseFormValue = vi.fn();
const mockClientFetch = vi.fn();
const mockUseClient = vi.fn(() => ({
  fetch: mockClientFetch,
}));

vi.mock('sanity', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sanity')>();
  return {
    ...actual,
    useFormValue: (path: string[]) => mockUseFormValue(path),
    useClient: () => mockUseClient(),
  };
});

import { RouteTitleInput } from '../../src/components/sanity/RouteTitleInput';
import { RouteSlugInput } from '../../src/components/sanity/RouteSlugInput';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={studioTheme}>{ui}</ThemeProvider>);
}

describe('Sanity Studio Route Custom Inputs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientFetch.mockResolvedValue([]);
  });

  describe('RouteTitleInput', () => {
    it('auto-generates title from district and animal type for new documents', async () => {
      mockUseFormValue.mockImplementation((path: string[]) => {
        if (path[0] === 'district') return 'Wan Chai';
        if (path[0] === 'animalType') return 'Dog';
        if (path[0] === '_id') return 'drafts.new-route-1';
        return undefined;
      });

      const mockOnChange = vi.fn();
      const mockRenderDefault = vi.fn((props) => (
        <input data-testid="title-input" value={props.value || ''} onChange={() => {}} />
      ));

      renderWithTheme(
        <RouteTitleInput
          value=""
          onChange={mockOnChange}
          renderDefault={mockRenderDefault}
        />
      );

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });

      const patchEvent = mockOnChange.mock.calls[0][0];
      const patches = patchEvent.patches || [patchEvent];
      const setValue = patches[0]?.value;
      expect(setValue).toBe('Wan Chai Dog');
    });

    it('increments duplicate title to "Base 2" if original unnumbered title exists', async () => {
      mockUseFormValue.mockImplementation((path: string[]) => {
        if (path[0] === 'district') return 'Wan Chai';
        if (path[0] === 'animalType') return 'Dog';
        if (path[0] === '_id') return 'drafts.new-route-2';
        return undefined;
      });

      mockClientFetch.mockResolvedValue([{ title: 'Wan Chai Dog' }]);

      const mockOnChange = vi.fn();
      const mockRenderDefault = vi.fn((props) => (
        <input data-testid="title-input" value={props.value || ''} onChange={() => {}} />
      ));

      renderWithTheme(
        <RouteTitleInput
          value=""
          onChange={mockOnChange}
          renderDefault={mockRenderDefault}
        />
      );

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });

      const patchEvent = mockOnChange.mock.calls[0][0];
      const patches = patchEvent.patches || [patchEvent];
      const setValue = patches[0]?.value;
      expect(setValue).toBe('Wan Chai Dog 2');
    });

    it('does not overwrite existing title on initial mount of existing document', async () => {
      mockUseFormValue.mockImplementation((path: string[]) => {
        if (path[0] === 'district') return 'YYC';
        if (path[0] === 'animalType') return 'Dog';
        if (path[0] === '_id') return 'f1eaba7f-c51c-4453-b3db-d2021b42b87a';
        return undefined;
      });

      const mockOnChange = vi.fn();
      const mockRenderDefault = vi.fn((props) => (
        <input data-testid="title-input" value={props.value || ''} onChange={() => {}} />
      ));

      renderWithTheme(
        <RouteTitleInput
          value="The Jackie Night Run"
          onChange={mockOnChange}
          renderDefault={mockRenderDefault}
        />
      );

      // Should not call onChange on initial mount when title is already set
      await new Promise((r) => setTimeout(r, 50));
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('RouteSlugInput', () => {
    it('auto-generates slug when title changes without requiring generate button', async () => {
      mockUseFormValue.mockImplementation((path: string[]) => {
        if (path[0] === 'title') return 'Wan Chai Dog';
        return undefined;
      });

      const mockOnChange = vi.fn();

      renderWithTheme(
        <RouteSlugInput
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
      expect(setValue).toEqual({ _type: 'slug', current: 'wan-chai-dog' });
    });

    it('auto-updates slug when title has duplicate suffix number', async () => {
      let currentTitle = 'Wan Chai Dog';
      mockUseFormValue.mockImplementation((path: string[]) => {
        if (path[0] === 'title') return currentTitle;
        return undefined;
      });

      const mockOnChange = vi.fn();

      const { rerender } = renderWithTheme(
        <RouteSlugInput
          value={{ _type: 'slug', current: 'wan-chai-dog' }}
          onChange={mockOnChange}
          schemaType={{ name: 'slug', title: 'Slug' } as any}
        />
      );

      // Now title updates to duplicate number "Wan Chai Dog 2"
      currentTitle = 'Wan Chai Dog 2';
      rerender(
        <ThemeProvider theme={studioTheme}>
          <RouteSlugInput
            value={{ _type: 'slug', current: 'wan-chai-dog' }}
            onChange={mockOnChange}
            schemaType={{ name: 'slug', title: 'Slug' } as any}
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });

      const patchEvent = mockOnChange.mock.calls[0][0];
      const patches = patchEvent.patches || [patchEvent];
      const setValue = patches[0]?.value;
      expect(setValue).toEqual({ _type: 'slug', current: 'wan-chai-dog-2' });
    });

    it('allows manual override of slug value', async () => {
      mockUseFormValue.mockImplementation((path: string[]) => {
        if (path[0] === 'title') return 'Wan Chai Dog';
        return undefined;
      });

      const mockOnChange = vi.fn();

      renderWithTheme(
        <RouteSlugInput
          value={{ _type: 'slug', current: 'wan-chai-dog' }}
          onChange={mockOnChange}
          schemaType={{ name: 'slug', title: 'Slug' } as any}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'custom-wan-chai-run' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });

      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      const patches = lastCall.patches || [lastCall];
      const setValue = patches[0]?.value;
      expect(setValue).toEqual({ _type: 'slug', current: 'custom-wan-chai-run' });
    });
  });
});
