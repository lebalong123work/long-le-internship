import { CATEGORIES } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import type { CategorySlug } from '@/constants/categories'

export const CATEGORY_PARAM = 'category'

export function parseCategoryParam(value: string | null): CategorySlug | undefined {
  return CATEGORIES.find((category) => category.slug === value)?.slug
}

export function shopHref(category: CategorySlug | undefined): string {
  return category === undefined ? ROUTES.SHOP : ROUTES.SHOP_CATEGORY(category)
}
