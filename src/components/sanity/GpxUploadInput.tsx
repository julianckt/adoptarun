import React, { useState, useCallback, useRef, useContext } from 'react';
import { type FileInputProps, set, unset, PatchEvent, useClient } from 'sanity';
import { DocumentPaneContext, DocumentIdContext } from 'sanity/_singletons';
import { Card, Stack, Flex, Text, Badge, Box, Button, Spinner } from '@sanity/ui';
import { parseGpxWithBasemap, type ParsedGpxResult } from '../../geo/gpx-parser';

export interface GpxUploadInputProps extends Partial<FileInputProps> {
  onParsed?: (result: ParsedGpxResult) => void;
  documentOnChange?: (event: PatchEvent) => void;
  documentId?: string;
  client?: any;
}

export function GpxUploadInput(props: GpxUploadInputProps) {
  const [parsed, setParsed] = useState<ParsedGpxResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sanityClient = useClient({ apiVersion: '2025-02-19' });
  const documentPane = useContext(DocumentPaneContext);
  const documentIdContext = useContext(DocumentIdContext);

  const activeClient = props.client || sanityClient;
  const dispatchRootPatches = useCallback(
    async (result: ParsedGpxResult) => {
      const patches = [
        set(result.distanceKm, ['distanceKm']),
        set(result.elevationGain, ['elevationGain']),
        set(result.estimatedDurationMin, ['estimatedDurationMin']),
        set(result.routePolyline, ['routePolyline']),
        set(result.miniMapSvg, ['miniMapSvg']),
        set(result.elevationProfileJson, ['elevationProfile']),
      ];

      // 1. Explicit document onChange prop (e.g. tests or custom pane wrapper)
      if (props.documentOnChange) {
        props.documentOnChange(PatchEvent.from(patches));
      }

      // 2. Studio Document Pane onChange (Structure Tool form level dispatcher)
      if (documentPane?.onChange) {
        documentPane.onChange(PatchEvent.from(patches));
      }

      // 3. Fallback direct client patch (handles Presentation Tool / visual editing where DocumentPaneContext is absent)
      const targetId =
        props.documentId ||
        documentPane?.displayed?._id ||
        documentPane?.documentId ||
        documentIdContext?.id;

      if (activeClient && targetId && typeof activeClient.patch === 'function') {
        try {
          await activeClient
            .patch(targetId)
            .set({
              distanceKm: result.distanceKm,
              elevationGain: result.elevationGain,
              estimatedDurationMin: result.estimatedDurationMin,
              routePolyline: result.routePolyline,
              miniMapSvg: result.miniMapSvg,
              elevationProfile: result.elevationProfileJson,
            })
            .commit({ autoGenerateArrayKeys: true });
        } catch (patchErr: any) {
          console.warn('Direct document patch fallback warning:', patchErr);
        }
      }
    },
    [
      activeClient,
      documentIdContext?.id,
      documentPane?.displayed?._id,
      documentPane?.documentId,
      documentPane?.onChange,
      props,
    ]
  );

  const processGpxFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setError(null);
      setFileName(file.name);

      try {
        // Read file contents (supporting both modern file.text() and FileReader)
        let content: string;
        if (typeof file.text === 'function') {
          content = await file.text();
        } else {
          content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Error reading file from disk'));
            reader.readAsText(file);
          });
        }

        if (!content || typeof content !== 'string') {
          throw new Error('Unable to read GPX file contents');
        }

        const result = await parseGpxWithBasemap(content);
        setParsed(result);

        // Dispatch patches to root document fields to auto-populate metrics
        await dispatchRootPatches(result);

        if (props.onParsed) {
          props.onParsed(result);
        }

        // Concurrently upload file asset to Sanity CDN if client & props.onChange are available
        if (activeClient && props.onChange) {
          setIsUploading(true);
          try {
            const assetDoc = await activeClient.assets.upload('file', file, {
              filename: file.name,
              contentType: 'application/gpx+xml',
            });
            props.onChange(
              PatchEvent.from([
                set({
                  _type: 'file',
                  asset: {
                    _type: 'reference',
                    _ref: assetDoc._id,
                  },
                }),
              ])
            );
          } catch (uploadErr: any) {
            console.error('Failed to upload GPX file asset to Sanity:', uploadErr);
            setError(`Parsed successfully, but asset upload failed: ${uploadErr.message || uploadErr}`);
          } finally {
            setIsUploading(false);
          }
        }
      } catch (err: any) {
        setParsed(null);
        setError(err.message || 'Failed to parse GPX file');
      } finally {
        setIsProcessing(false);
      }
    },
    [activeClient, dispatchRootPatches, props]
  );

  const handleReparseExistingAsset = useCallback(async () => {
    const assetRef = props.value?.asset?._ref || (props.value as any)?._ref;
    if (!assetRef || !activeClient) return;

    setIsProcessing(true);
    setError(null);

    try {
      let assetDoc = await activeClient.getDocument(assetRef);
      if (!assetDoc && typeof activeClient.fetch === 'function') {
        assetDoc = await activeClient.fetch('*[_id == $id][0]', { id: assetRef });
      }

      const fileUrl =
        assetDoc?.url ||
        (assetDoc?.path ? `https://cdn.sanity.io/${assetDoc.path}` : null);

      if (!fileUrl) {
        throw new Error('Unable to resolve GPX asset URL from Sanity CDN');
      }

      let response: Response;
      try {
        response = await fetch(fileUrl);
      } catch (fetchErr: any) {
        throw new Error(
          `Failed to load GPX file from Sanity CDN (${fileUrl}): ${fetchErr?.message || fetchErr}`
        );
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch GPX asset (${response.status} ${response.statusText})`);
      }

      const content = await response.text();
      const result = await parseGpxWithBasemap(content);
      setParsed(result);
      setFileName(assetDoc.originalFilename || 'Existing GPX Asset');

      await dispatchRootPatches(result);

      if (props.onParsed) {
        props.onParsed(result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to re-parse attached GPX asset');
    } finally {
      setIsProcessing(false);
    }
  }, [activeClient, dispatchRootPatches, props]);

  const handleRemove = useCallback(() => {
    if (props.onChange) {
      props.onChange(PatchEvent.from(unset()));
    }
    setParsed(null);
    setFileName(null);
    setError(null);
  }, [props]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processGpxFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processGpxFile(file);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const assetRef = props.value?.asset?._ref || (props.value as any)?._ref;
  const hasAttachedAsset = Boolean(assetRef);
  const displayLabel = fileName || (hasAttachedAsset ? `Asset: ${assetRef}` : null);

  return (
    <Stack gap={3}>
      {/* Unified In-Browser GPX Route Telemetry Parser & Asset Upload */}
      <Card
        padding={3}
        radius={2}
        tone={isDragging ? 'positive' : 'primary'}
        border
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Stack gap={3}>
          <Flex align="center" justify="space-between">
            <Text size={1} weight="semibold">
              GPX Route Auto-Calculation (In-Browser)
            </Text>
            <Flex gap={2} align="center">
              {hasAttachedAsset && (
                <Badge tone="primary">
                  Asset Attached
                </Badge>
              )}
              {isUploading && (
                <Badge tone="caution">
                  Uploading to CDN...
                </Badge>
              )}
              {parsed && (
                <Badge tone="positive">
                  Fields Populated
                </Badge>
              )}
              {parsed?.basemapSource === 'local-hk' && (
                <Badge tone="positive">
                  Local HK Basemap
                </Badge>
              )}
              {parsed?.basemapSource === 'overpass' && (
                <Badge tone="primary">
                  OSM Overpass
                </Badge>
              )}
            </Flex>
          </Flex>

          <Text size={1} muted>
            Upload a .gpx track file to automatically calculate distance, elevation gain,
            estimated duration, polyline string, and SVG mini-map.
          </Text>

          <Flex gap={2} align="center" wrap="wrap">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".gpx,application/gpx+xml,application/xml"
              style={{ display: 'none' }}
              data-testid="gpx-file-input"
            />
            <Button
              text={
                isProcessing
                  ? 'Generating Basemap...'
                  : hasAttachedAsset || parsed
                  ? 'Replace GPX File'
                  : 'Select GPX File to Parse'
              }
              tone="primary"
              mode={hasAttachedAsset || parsed ? 'default' : 'ghost'}
              onClick={handleSelectClick}
              disabled={isProcessing || isUploading}
              data-testid="gpx-select-button"
            />

            {hasAttachedAsset && activeClient && (
              <Button
                text="Re-parse & Sync Telemetry"
                tone="default"
                mode="ghost"
                onClick={handleReparseExistingAsset}
                disabled={isProcessing || isUploading}
                data-testid="gpx-reparse-button"
              />
            )}

            {(hasAttachedAsset || parsed) && (
              <Button
                text="Remove"
                tone="critical"
                mode="ghost"
                onClick={handleRemove}
                disabled={isProcessing || isUploading}
                data-testid="gpx-remove-button"
              />
            )}

            {(isProcessing || isUploading) && <Spinner size={2} />}

            {displayLabel && (
              <Text size={1} textOverflow="ellipsis">
                {displayLabel}
              </Text>
            )}
          </Flex>

          {error && (
            <Card tone="critical" padding={2} radius={2} border>
              <Text size={1}>{error}</Text>
            </Card>
          )}

          {parsed && (
            <Card padding={3} radius={2} tone="default" border data-testid="gpx-telemetry-preview">
              <Stack gap={3}>
                <Flex gap={4} wrap="wrap">
                  <Box>
                    <Text size={0} muted>
                      Distance
                    </Text>
                    <Text size={2} weight="bold">
                      {parsed.distanceKm} km
                    </Text>
                  </Box>
                  <Box>
                    <Text size={0} muted>
                      Elevation Gain
                    </Text>
                    <Text size={2} weight="bold">
                      +{parsed.elevationGain} m
                    </Text>
                  </Box>
                  <Box>
                    <Text size={0} muted>
                      Est. Duration
                    </Text>
                    <Text size={2} weight="bold">
                      {parsed.estimatedDurationMin} min
                    </Text>
                  </Box>
                  <Box>
                    <Text size={0} muted>
                      Avg Pace
                    </Text>
                    <Text size={2} weight="bold">
                      {parsed.avgPaceMinPerKm > 0 ? `${parsed.avgPaceMinPerKm} min/km` : 'N/A'}
                    </Text>
                  </Box>
                  <Box>
                    <Text size={0} muted>
                      Moving Time
                    </Text>
                    <Text size={2} weight="bold">
                      {parsed.movingTimeSeconds > 0
                        ? `${Math.floor(parsed.movingTimeSeconds / 60)}m ${parsed.movingTimeSeconds % 60}s (${parsed.movingTimeSeconds}s)`
                        : '0s'}
                    </Text>
                  </Box>
                  <Box>
                    <Text size={0} muted>
                      Trackpoints
                    </Text>
                    <Text size={2} weight="bold">
                      {parsed.trackpointCount}
                    </Text>
                  </Box>
                </Flex>

                {parsed.miniMapSvg && (
                  <Box>
                    <Text size={0} muted style={{ marginBottom: 4 }}>
                      Mini-Map Trace Preview:
                    </Text>
                    <div
                      data-testid="gpx-minimap-preview"
                      style={{
                        width: '237px',
                        height: '144px',
                        backgroundColor: 'rgb(24, 19, 17)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      dangerouslySetInnerHTML={{ __html: parsed.miniMapSvg }}
                    />
                  </Box>
                )}
              </Stack>
            </Card>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

export default GpxUploadInput;
