import type { Category, PaginatedList, Product } from '@/types'

export type Suggestion =
  { type: 'product'; product: Product } | { type: 'category'; category: Category }

export function searchProducts(_query: string, _page = 1): Promise<PaginatedList<Product>> {
  throw new Error('not implemented')
}

export function searchSuggestions(_query: string): Promise<Suggestion[]> {
  throw new Error('not implemented')
}
