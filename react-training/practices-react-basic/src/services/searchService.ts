import { apiClient } from './apiClient'
import { getProducts } from './productService'
import type { Category, PaginatedList, Product, Suggestion } from '@/types'

export const SEARCH_RESULTS_PER_PAGE = 8
export const SUGGESTION_LIMIT = 8

function normalizeQuery(query: string): string {
  return query.trim()
}

function emptyResults(): PaginatedList<Product> {
  return { data: [], total: 0, page: 1, perPage: SEARCH_RESULTS_PER_PAGE, totalPages: 0 }
}

export async function searchProducts(query: string, page = 1): Promise<PaginatedList<Product>> {
  const search = normalizeQuery(query)
  if (search === '') return emptyResults()
  return getProducts({ search, page, perPage: SEARCH_RESULTS_PER_PAGE })
}

export async function searchSuggestions(query: string): Promise<Suggestion[]> {
  const search = normalizeQuery(query)
  if (search === '') return []
  const [categories, products] = await Promise.all([
    apiClient.get<Category[]>('/categories', { 'name:contains': search }),
    getProducts({ search, page: 1, perPage: SUGGESTION_LIMIT }),
  ])
  const suggestions: Suggestion[] = [
    ...categories.map((category): Suggestion => ({ type: 'category', category })),
    ...products.data.map((product): Suggestion => ({ type: 'product', product })),
  ]
  return suggestions.slice(0, SUGGESTION_LIMIT)
}
