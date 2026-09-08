import React, { useState, useCallback, useRef } from 'react';
import { type FileInputProps, set, unset, PatchEvent, useFormCallbacks, useClient } from 'sanity';
import { useDocumentPane } from 'sanity/structure';
import { Card, Stack, Flex, Text, Badge, Box, Button, Spinner } from '@sanity/ui';
import { parseGpx, type ParsedGpxResult } from '../../geo/gpx-parser';

export interface GpxUploadInputProps extends Partial<FileInputProps> {
  onParsed?: (result: ParsedGpxResult) => void;
  documentOnChange?: (event: PatchEvent) => void;
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

  // Safely obtain document pane context for patching root document fields
  let documentPane: ReturnType<typeof useDocumentPane> | undefined;
  try {
    documentPane = useDocumentPane();
  } catch {
    // Outside Sanity Structure DocumentPane context (e.g. unit tests)
  }

  // Safely obtain form callbacks as secondary fallback
  let formCallbacks: ReturnType<typeof useFormCallbacks> | undefined;
  try {
    formCallbacks = useFormCallbacks();
  } catch {
    // Outside Sanity form provider context
  }

  // Safely obtain Sanity client for uploading file asset to Sanity CDN
  let sanityClient: any;
  try {
    sanityClient = useClient({ apiVersion: '2025-02-19' });
  } catch {
    // Outside Sanity Studio source context
  }

  const activeClient = props.client || sanityClient;
  const targetDocumentOnChange = props.documentOnChange || documentPane?.onChange || formCallbacks?.onChange;

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

        const result = parseGpx(content);
        setParsed(result);

        // Dispatch patches to root document fields to auto-populate metrics
        if (targetDocumentOnChange) {
          targetDocumentOnChange(
            PatchEvent.from([
              set(result.distanceKm, ['distanceKm']),
              set(result.elevationGain, ['elevationGain']),
              set(result.estimatedDurationMin, ['estimatedDurationMin']),
              set(result.routePolyline, ['routePolyline']),
              set(result.miniMapSvg, ['miniMapSvg']),
              set(result.elevationProfileJson, ['elevationProfile']),
            ])
          );
        }

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
    [activeClient, props, targetDocumentOnChange]
  );

  const handleReparseExistingAsset = useCallback(async () => {
    const assetRef = props.value?.asset?._ref;
    if (!assetRef || !activeClient) return;

    setIsProcessing(true);
    setError(null);

    try {
      const assetDoc = await activeClient.getDocument(assetRef);
      if (!assetDoc?.url) {
        throw new Error('Unable to resolve GPX asset URL from Sanity CDN');
      }

      const response = await fetch(assetDoc.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch GPX asset (${response.status} ${response.statusText})`);
      }

      const content = await response.text();
      const result = parseGpx(content);
      setParsed(result);
      setFileName(assetDoc.originalFilename || 'Existing GPX Asset');

      if (targetDocumentOnChange) {
        targetDocumentOnChange(
          PatchEvent.from([
            set(result.distanceKm, ['distanceKm']),
            set(result.elevationGain, ['elevationGain']),
            set(result.estimatedDurationMin, ['estimatedDurationMin']),
            set(result.routePolyline, ['routePolyline']),
            set(result.miniMapSvg, ['miniMapSvg']),
            set(result.elevationProfileJson, ['elevationProfile']),
          ])
        );
      }

      if (props.onParsed) {
        props.onParsed(result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to re-parse attached GPX asset');
    } finally {
      setIsProcessing(false);
    }
  }, [activeClient, props, targetDocumentOnChange]);

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

  const hasAttachedAsset = Boolean(props.value?.asset?._ref);
  const displayLabel = fileName || (hasAttachedAsset ? `Asset: ${props.value?.asset?._ref}` : null);

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
                  ? 'Parsing GPX...'
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
                        width: '120px',
                        height: '120px',
                        backgroundColor: 'rgba(24, 19, 17, 0.9)',
                        color: 'rgb(245, 174, 102)',
                        borderRadius: '6px',
                        padding: '8px',
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
