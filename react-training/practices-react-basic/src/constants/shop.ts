import { CATEGORIES } from './categories'
import type { CategorySlug } from './categories'

export interface ShopFilterItem {
  id: string
  label: string
  category: CategorySlug | undefined
}

export const SHOP_TEXT = {
  heading: 'Shop',
  allCategories: 'All',
  gridHeading: 'Products',
} as const

export const SHOP_FILTERS: readonly ShopFilterItem[] = [
  { id: 'all', label: SHOP_TEXT.allCategories, category: undefined },
  ...CATEGORIES.map(({ slug, name }) => ({ id: slug, label: name, category: slug })),
]
