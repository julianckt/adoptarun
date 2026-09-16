import React, { useEffect, useRef, useCallback } from 'react';
import { type SlugInputProps, set, unset, useFormValue } from 'sanity';
import { Stack, Text, Box, TextInput, Flex, Badge } from '@sanity/ui';
import { generateSlug } from '../../sanity/utils/route-naming';

export function CharitySlugInput(props: Partial<SlugInputProps>) {
  const name = useFormValue(['name']) as string | undefined;
  const currentSlug = props.value?.current || '';
  const prevNameRef = useRef<string | undefined>(undefined);
  const isInitialMount = useRef(true);

  // Sync slug whenever charity name changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      // If document already has a slug, record current name and do not overwrite
      if (currentSlug) {
        prevNameRef.current = name;
        return;
      }
    }

    // If name hasn't changed since last sync and slug exists, do nothing
    if (prevNameRef.current === name && currentSlug) {
      return;
    }

    prevNameRef.current = name;

    if (!name || !name.trim()) {
      if (currentSlug && props.onChange) {
        props.onChange(unset());
      }
      return;
    }

    const nextSlug = generateSlug(name);
    if (currentSlug !== nextSlug && props.onChange) {
      props.onChange(set({ _type: 'slug', current: nextSlug }));
    }
  }, [name, currentSlug, props.onChange]);

  const handleManualChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = generateSlug(e.currentTarget.value);
      if (!props.onChange) return;

      if (!formatted) {
        props.onChange(unset());
      } else {
        props.onChange(set({ _type: 'slug', current: formatted }));
      }
    },
    [props.onChange]
  );

  return (
    <Stack gap={2}>
      <TextInput
        value={currentSlug}
        onChange={handleManualChange}
        placeholder="e.g. spca-hk"
      />
      <Flex align="center" gap={2}>
        <Badge tone="positive" fontSize={0} padding={1}>
          Auto-Slug
        </Badge>
        <Box>
          <Text size={1} muted>
            {currentSlug
              ? `Auto-generated from Charity Name. Public charity URL: /charities/${currentSlug}`
              : 'Auto-generates from Charity Name. Can be edited manually.'}
          </Text>
        </Box>
      </Flex>
    </Stack>
  );
}
