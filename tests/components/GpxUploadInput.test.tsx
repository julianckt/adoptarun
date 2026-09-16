import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, studioTheme } from '@sanity/ui';

vi.mock('sanity', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sanity')>();
  return {
    ...actual,
    useClient: vi.fn(() => ({
      assets: { upload: vi.fn() },
      getDocument: vi.fn(),
    })),
    useFormCallbacks: vi.fn(() => ({
      onChange: vi.fn(),
    })),
  };
});

import { GpxUploadInput } from '../../src/components/sanity/GpxUploadInput';
import { clearBasemapCache } from '../../src/geo/gpx-parser';
import { DocumentPaneContext } from 'sanity/_singletons';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={studioTheme}>{ui}</ThemeProvider>);
}

describe('GpxUploadInput Sanity Studio Component', () => {
  const sampleGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestGPX">
  <trk><trkseg>
    <trkpt lat="22.2865" lon="114.1550">
      <ele>5.0</ele>
      <time>2026-09-01T07:00:00Z</time>
    </trkpt>
    <trkpt lat="22.2875" lon="114.1565">
      <ele>12.0</ele>
      <time>2026-09-01T07:00:30Z</time>
    </trkpt>
    <trkpt lat="22.2885" lon="114.1580">
      <ele>18.0</ele>
      <time>2026-09-01T07:01:00Z</time>
    </trkpt>
  </trkseg></trk>
</gpx>`;

  const mockOverpassData = {
    elements: [
      {
        type: 'way',
        tags: { highway: 'primary' },
        geometry: [
          { lat: 22.2865, lon: 114.155 },
          { lat: 22.2875, lon: 114.1565 },
          { lat: 22.2885, lon: 114.158 },
        ],
      },
    ],
  };

  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    clearBasemapCache();
    originalFetch = global.fetch;
    global.fetch = vi.fn(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('overpass-api.de')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => mockOverpassData,
        } as any;
      }
      if (urlStr.includes('cdn.sanity.io')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          text: async () => sampleGpx,
        } as any;
      }
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ elements: [] }),
        text: async () => '',
      } as any;
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders the component with select button and description', () => {
    renderWithTheme(<GpxUploadInput />);
    expect(screen.getByText('GPX Route Auto-Calculation (In-Browser)')).toBeDefined();
    expect(screen.getByTestId('gpx-select-button')).toBeDefined();
  });

  it('parses GPX file on upload, calls onParsed, and displays telemetry preview with moving time and trackpoint count', async () => {
    const onParsed = vi.fn();
    renderWithTheme(<GpxUploadInput onParsed={onParsed} />);

    const file = new File([sampleGpx], 'test-route.gpx', { type: 'application/gpx+xml' });
    const fileInput = screen.getByTestId('gpx-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onParsed).toHaveBeenCalled();
    });

    const parsedResult = onParsed.mock.calls[0][0];
    expect(parsedResult.trackpointCount).toBe(3);
    expect(parsedResult.distanceKm).toBeGreaterThan(0);
    expect(parsedResult.elevationGain).toBe(13); // (12-5) + (18-12)
    expect(parsedResult.movingTimeSeconds).toBe(60);
    expect(parsedResult.routePolyline).toBeTruthy();
    expect(parsedResult.miniMapSvg).toContain('<svg');

    // Asserts preview rendered on DOM
    expect(await screen.findByTestId('gpx-telemetry-preview')).toBeDefined();
    expect(screen.getByText('Fields Populated')).toBeDefined();
    expect(screen.getByTestId('gpx-minimap-preview')).toBeDefined();
    expect(screen.getByText('test-route.gpx')).toBeDefined();

    // Verify trackpoint count and moving time are shown in the UI
    expect(screen.getByText('Trackpoints')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('Moving Time')).toBeDefined();
    expect(screen.getByText('1m 0s (60s)')).toBeDefined();
  });

  it('dispatches patches to root document fields via documentOnChange', async () => {
    const documentOnChange = vi.fn();
    renderWithTheme(<GpxUploadInput documentOnChange={documentOnChange} />);

    const file = new File([sampleGpx], 'test-route.gpx', { type: 'application/gpx+xml' });
    const fileInput = screen.getByTestId('gpx-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(documentOnChange).toHaveBeenCalledTimes(1);
    });

    const patchEvent = documentOnChange.mock.calls[0][0];
    const patches = patchEvent.patches;
    expect(patches).toHaveLength(6);

    const paths = patches.map((p: any) => p.path[0]);
    expect(paths).toContain('distanceKm');
    expect(paths).toContain('elevationGain');
    expect(paths).toContain('estimatedDurationMin');
    expect(paths).toContain('routePolyline');
    expect(paths).toContain('miniMapSvg');
    expect(paths).toContain('elevationProfile');

    // Verify distance is a positive number
    const distancePatch = patches.find((p: any) => p.path[0] === 'distanceKm');
    expect(distancePatch.value).toBeGreaterThan(0);

    // Verify elevation gain
    const elevationPatch = patches.find((p: any) => p.path[0] === 'elevationGain');
    expect(elevationPatch.value).toBe(13);
  });

  it('dispatches patches to root document fields via DocumentPaneContext when documentOnChange is omitted', async () => {
    const paneOnChange = vi.fn();
    renderWithTheme(
      <DocumentPaneContext.Provider value={{ onChange: paneOnChange } as any}>
        <GpxUploadInput />
      </DocumentPaneContext.Provider>
    );

    const file = new File([sampleGpx], 'test-route.gpx', { type: 'application/gpx+xml' });
    const fileInput = screen.getByTestId('gpx-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(paneOnChange).toHaveBeenCalledTimes(1);
    });

    const patchEvent = paneOnChange.mock.calls[0][0];
    const paths = patchEvent.patches.map((p: any) => p.path[0]);
    expect(paths).toContain('miniMapSvg');
    expect(paths).toContain('distanceKm');
    expect(paths).toContain('routePolyline');
  });

  it('uploads asset to Sanity CDN when client and onChange are provided', async () => {
    const mockUpload = vi.fn().mockResolvedValue({
      _id: 'file-asset-123',
      url: 'https://cdn.sanity.io/files/project/dataset/sample.gpx',
    });
    const mockClient = {
      assets: {
        upload: mockUpload,
      },
    };
    const onChange = vi.fn();

    renderWithTheme(<GpxUploadInput client={mockClient} onChange={onChange} />);

    const file = new File([sampleGpx], 'test-route.gpx', { type: 'application/gpx+xml' });
    const fileInput = screen.getByTestId('gpx-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith('file', file, {
        filename: 'test-route.gpx',
        contentType: 'application/gpx+xml',
      });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    const patchEvent = onChange.mock.calls[0][0];
    const patch = patchEvent.patches[0];
    expect(patch.value).toEqual({
      _type: 'file',
      asset: {
        _type: 'reference',
        _ref: 'file-asset-123',
      },
    });
  });

  it('handles drag and drop file upload correctly', async () => {
    const onParsed = vi.fn();
    renderWithTheme(<GpxUploadInput onParsed={onParsed} />);

    const card = screen.getByText('GPX Route Auto-Calculation (In-Browser)').closest('div');
    expect(card).toBeDefined();

    const file = new File([sampleGpx], 'dropped-route.gpx', { type: 'application/gpx+xml' });

    // Drag over
    fireEvent.dragOver(card!, { preventDefault: vi.fn() });
    // Drop file
    fireEvent.drop(card!, {
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(onParsed).toHaveBeenCalled();
    });

    expect(await screen.findByText('dropped-route.gpx')).toBeDefined();
  });

  it('renders attached asset state and re-parses from asset on demand', async () => {
    const mockGetDocument = vi.fn().mockResolvedValue({
      _id: 'file-asset-456',
      url: 'https://cdn.sanity.io/files/project/dataset/remote.gpx',
      originalFilename: 'remote.gpx',
    });
    const mockClient = {
      getDocument: mockGetDocument,
    };
    const documentOnChange = vi.fn();

    renderWithTheme(
      <GpxUploadInput
        value={{
          _type: 'file',
          asset: { _type: 'reference', _ref: 'file-asset-456' },
        } as any}
        client={mockClient}
        documentOnChange={documentOnChange}
      />
    );

    expect(screen.getByText('Asset Attached')).toBeDefined();
    expect(screen.getByTestId('gpx-reparse-button')).toBeDefined();
    expect(screen.getByTestId('gpx-remove-button')).toBeDefined();

    // Click Re-parse
    fireEvent.click(screen.getByTestId('gpx-reparse-button'));

    await waitFor(() => {
      expect(mockGetDocument).toHaveBeenCalledWith('file-asset-456');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://cdn.sanity.io/files/project/dataset/remote.gpx'
      );
      expect(documentOnChange).toHaveBeenCalled();
    });

    expect(await screen.findByTestId('gpx-telemetry-preview')).toBeDefined();
    expect(screen.getByText('Fields Populated')).toBeDefined();
  });

  it('displays strict error in UI when Overpass basemap fetch fails', async () => {
    clearBasemapCache();
    global.fetch = vi.fn(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('overpass-api.de')) {
        return {
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
        } as any;
      }
      return { ok: true, text: async () => sampleGpx } as any;
    });

    renderWithTheme(<GpxUploadInput />);
    const file = new File([sampleGpx], 'route.gpx', { type: 'application/gpx+xml' });
    const fileInput = screen.getByTestId('gpx-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch OpenStreetMap basemap/)).toBeDefined();
    });
  });

  it('clears state and calls onChange with unset on remove', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <GpxUploadInput
        value={{
          _type: 'file',
          asset: { _type: 'reference', _ref: 'file-asset-789' },
        } as any}
        onChange={onChange}
      />
    );

    const removeBtn = screen.getByTestId('gpx-remove-button');
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const patchEvent = onChange.mock.calls[0][0];
    expect(patchEvent.patches[0].type).toBe('unset');
  });

  it('displays error message when corrupted GPX is uploaded', async () => {
    renderWithTheme(<GpxUploadInput />);

    const corruptedFile = new File(['<invalid>xml'], 'broken.gpx', { type: 'application/gpx+xml' });
    const fileInput = screen.getByTestId('gpx-file-input');

    fireEvent.change(fileInput, { target: { files: [corruptedFile] } });

    await waitFor(() => {
      expect(screen.getByText(/No valid GPS trackpoints found/i)).toBeDefined();
    });
  });

  it('patches root document directly via client.patch when client and documentId are provided', async () => {
    const mockCommit = vi.fn().mockResolvedValue({});
    const mockSet = vi.fn().mockReturnValue({ commit: mockCommit });
    const mockPatch = vi.fn().mockReturnValue({ set: mockSet });
    const mockClient = {
      assets: { upload: vi.fn().mockResolvedValue({ _id: 'asset-123' }) },
      patch: mockPatch,
    };

    renderWithTheme(
      <GpxUploadInput client={mockClient} documentId="route-doc-123" />
    );

    const file = new File([sampleGpx], 'test-route.gpx', { type: 'application/gpx+xml' });
    const fileInput = screen.getByTestId('gpx-file-input');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('route-doc-123');
      expect(mockSet).toHaveBeenCalled();
      expect(mockCommit).toHaveBeenCalled();
    });

    const setArgs = mockSet.mock.calls[0][0];
    expect(setArgs.miniMapSvg).toBeDefined();
    expect(setArgs.distanceKm).toBeGreaterThan(0);
    expect(setArgs.routePolyline).toBeDefined();
  });
});
