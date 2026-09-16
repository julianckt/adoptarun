import { useEffect, useRef, useState } from 'react';
import { type StringInputProps, set, useClient, useFormValue } from 'sanity';
import { Stack, Text, Box } from '@sanity/ui';
import {
  formatBaseTitle,
  calculateNextDuplicateTitle,
  fetchMatchingRouteTitles,
} from '../../sanity/utils/route-naming';

export function RouteTitleInput(props: Partial<StringInputProps>) {
  const district = useFormValue(['district']) as string | undefined;
  const animalType = useFormValue(['animalType']) as string | undefined;
  const docId = useFormValue(['_id']) as string | undefined;

  const sanityClient = useClient({ apiVersion: '2025-02-19' });
  const [isResolving, setIsResolving] = useState(false);

  // Track the previous district + animalType combination to detect intentional changes
  const prevDistrictAnimalRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const currentKey = `${district?.trim() || ''}:::${animalType?.trim() || ''}`;

    // On initial mount of a document that already has a title, preserve the existing title
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (props.value) {
        prevDistrictAnimalRef.current = currentKey;
        return;
      }
    }

    // Only run resolution if district or animalType actually changed or title is empty
    if (prevDistrictAnimalRef.current === currentKey && props.value) {
      return;
    }

    const baseTitle = formatBaseTitle(district, animalType);
    if (!baseTitle) {
      return;
    }

    let isCancelled = false;

    async function resolveTitle() {
      try {
        setIsResolving(true);
        const existingTitles = await fetchMatchingRouteTitles(sanityClient, baseTitle, docId);
        if (isCancelled) return;

        const nextTitle = calculateNextDuplicateTitle(baseTitle, existingTitles);
        prevDistrictAnimalRef.current = currentKey;

        if (props.value !== nextTitle && props.onChange) {
          props.onChange(set(nextTitle));
        }
      } catch (err) {
        console.error('[RouteTitleInput] Error auto-generating title:', err);
      } finally {
        if (!isCancelled) {
          setIsResolving(false);
        }
      }
    }

    resolveTitle();

    return () => {
      isCancelled = true;
    };
  }, [district, animalType, docId, props.onChange, sanityClient]);

  return (
    <Stack gap={2}>
      {props.renderDefault ? (
        props.renderDefault(props as StringInputProps)
      ) : (
        <input
          value={props.value || ''}
          onChange={(e) => props.onChange && props.onChange(set(e.target.value))}
        />
      )}
      <Box paddingX={1}>
        <Text size={1} muted>
          {isResolving
            ? 'Checking route titles in district...'
            : 'Auto-generated from District & Animal Type. Can be edited manually.'}
        </Text>
      </Box>
    </Stack>
  );
}
