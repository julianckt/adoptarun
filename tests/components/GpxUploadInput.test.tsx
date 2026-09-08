import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, studioTheme } from '@sanity/ui';
import { GpxUploadInput } from '../../src/components/sanity/GpxUploadInput';

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

    // Mock global fetch for downloading remote GPX text
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => sampleGpx,
    }) as any;

    try {
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
    } finally {
      global.fetch = originalFetch;
    }
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
});
