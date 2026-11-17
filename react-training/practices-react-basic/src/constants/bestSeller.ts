import { CATEGORIES } from './categories'
import type { CategorySlug } from './categories'
import type { TabItem } from '@/components/ui/Tabs'

export const BEST_SELLER_TEXT = {
  eyebrow: 'Choose from the best products',
  title: 'Our Best Seller',
  tabsLabel: 'Product categories',
  seeMore: 'See More',
  loading: 'Loading products',
} as const

export const CATEGORY_TABS: readonly TabItem<CategorySlug>[] = CATEGORIES.map((category) => ({
  id: category.slug,
  label: category.name,
}))
