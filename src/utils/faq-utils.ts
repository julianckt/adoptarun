import type { FaqItem } from '@/sanity/types';

export type FaqCategorySlug = 'adoption' | 'logging' | 'charity' | 'general';

export interface FaqCategoryDef {
  slug: FaqCategorySlug;
  label: string;
  anchorId: string;
}

export const FAQ_CATEGORIES: readonly FaqCategoryDef[] = [
  {
    slug: 'adoption',
    label: 'adoption & routes',
    anchorId: 'adoption-and-routes',
  },
  {
    slug: 'logging',
    label: 'logging & gps verification',
    anchorId: 'logging-and-gps-verification',
  },
  {
    slug: 'charity',
    label: 'charities & donations',
    anchorId: 'charities-and-donations',
  },
  {
    slug: 'general',
    label: 'general',
    anchorId: 'general',
  },
];

export interface FaqCategoryGroup {
  category: FaqCategoryDef;
  items: FaqItem[];
}

/**
 * Groups an array of FaqItems into canonical categories in fixed order,
 * ensuring static placeholders exist even if a category currently has 0 items.
 */
export function groupFaqsByCategory(faqs?: FaqItem[] | null): FaqCategoryGroup[] {
  const safeList = Array.isArray(faqs) ? faqs : [];

  const categoryMap = new Map<FaqCategorySlug, FaqItem[]>();
  for (const cat of FAQ_CATEGORIES) {
    categoryMap.set(cat.slug, []);
  }

  for (const item of safeList) {
    if (!item) continue;
    const cat = item.category as FaqCategorySlug | undefined;
    if (cat && categoryMap.has(cat)) {
      categoryMap.get(cat)!.push(item);
    } else {
      categoryMap.get('general')!.push(item);
    }
  }

  return FAQ_CATEGORIES.map((category) => ({
    category,
    items: categoryMap.get(category.slug) || [],
  }));
}
