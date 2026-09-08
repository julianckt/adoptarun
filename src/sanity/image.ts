import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityClient } from './client';

const builder = createImageUrlBuilder(sanityClient);

export function hasImageAsset(source: any): boolean {
  if (!source) return false;
  if (typeof source === 'string') {
    return source.trim().length > 0;
  }
  if (typeof source !== 'object') {
    return false;
  }

  if (source.asset) {
    if (typeof source.asset === 'string') {
      return source.asset.trim().length > 0;
    }
    if (typeof source.asset === 'object') {
      return Boolean(source.asset._ref || source.asset._id || source.asset.url);
    }
    return false;
  }

  return Boolean(source._ref || source._id || source.url);
}

export function urlForImage(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

export function safeUrlForImage(source: any): string | undefined {
  if (!hasImageAsset(source)) return undefined;
  try {
    const imageBuilder = builder.image(source);
    return imageBuilder ? imageBuilder.url() : undefined;
  } catch {
    return undefined;
  }
}
