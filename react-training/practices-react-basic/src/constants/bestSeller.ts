import { CATEGORIES, CATEGORY_LIST_LABEL } from './categories'
import { UI_STATE_MESSAGES } from './uiStateMessages'
import type { CategorySlug } from './categories'
import type { TabItem } from '@/components/ui/Tabs'

export const BEST_SELLER_TEXT = {
  eyebrow: 'Choose from the best products',
  title: 'Our Best Seller',
  tabsLabel: CATEGORY_LIST_LABEL,
  seeMore: 'See More',
  loading: UI_STATE_MESSAGES.loadingProducts,
} as const

export const CATEGORY_TABS: readonly TabItem<CategorySlug>[] = CATEGORIES.map((category) => ({
  id: category.slug,
  label: category.name,
}))
