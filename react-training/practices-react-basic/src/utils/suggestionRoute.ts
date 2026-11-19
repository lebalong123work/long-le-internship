import { ROUTES } from '@/constants/routes'
import type { Suggestion } from '@/types'

export function suggestionRoute(suggestion: Suggestion): string {
  return suggestion.type === 'category'
    ? ROUTES.SEARCH_RESULTS(suggestion.category.name)
    : ROUTES.PRODUCT(suggestion.product.id)
}

export function suggestionKey(suggestion: Suggestion): string {
  return suggestion.type === 'category'
    ? `category-${suggestion.category.id}`
    : `product-${suggestion.product.id}`
}
