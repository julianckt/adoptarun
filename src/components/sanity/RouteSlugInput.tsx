import React, { useEffect, useRef, useCallback } from 'react';
import { type SlugInputProps, set, unset, useFormValue } from 'sanity';
import { Stack, Text, Box, TextInput, Flex, Badge } from '@sanity/ui';
import { generateSlug } from '../../sanity/utils/route-naming';

export function RouteSlugInput(props: Partial<SlugInputProps>) {
  const title = useFormValue(['title']) as string | undefined;
  const currentSlug = props.value?.current || '';
  const prevTitleRef = useRef<string | undefined>(undefined);
  const isInitialMount = useRef(true);

  // Sync slug whenever title changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      // If document already has a slug, record current title and do not overwrite
      if (currentSlug) {
        prevTitleRef.current = title;
        return;
      }
    }

    // If title hasn't changed since last sync and slug exists, do nothing
    if (prevTitleRef.current === title && currentSlug) {
      return;
    }

    prevTitleRef.current = title;

    if (!title || !title.trim()) {
      if (currentSlug && props.onChange) {
        props.onChange(unset());
      }
      return;
    }

    const nextSlug = generateSlug(title);
    if (currentSlug !== nextSlug && props.onChange) {
      props.onChange(set({ _type: 'slug', current: nextSlug }));
    }
  }, [title, currentSlug, props.onChange]);

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
        placeholder="e.g. wan-chai-dog"
      />
      <Flex align="center" gap={2}>
        <Badge tone="positive" fontSize={0} padding={1}>
          Auto-Slug
        </Badge>
        <Box>
          <Text size={1} muted>
            {currentSlug
              ? `Auto-generated from title. Public route URL: /routes/${currentSlug}`
              : 'Auto-generates from Companion Title. Can be edited manually.'}
          </Text>
        </Box>
      </Flex>
    </Stack>
  );
}
