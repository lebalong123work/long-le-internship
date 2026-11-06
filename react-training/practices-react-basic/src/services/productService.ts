import { apiClient, ApiError, isNotFoundError } from './apiClient'
import { toPaginatedList } from './pagination'
import type { Query } from './apiClient'
import type { JsonServerPage } from './pagination'
import type { PaginatedList, Product, ProductFilters } from '@/types'

export const PRODUCTS_PER_PAGE = 12
export const BEST_SELLER_LIMIT = 8
export const RELATED_LIMIT = 8

type ProductSort = NonNullable<ProductFilters['sort']>

const SORT_PARAM: Record<ProductSort, string> = {
  newest: '-createdAt',
  'price-asc': 'price',
  'price-desc': '-price',
}

export async function getProducts(filters: ProductFilters): Promise<PaginatedList<Product>> {
  const perPage = filters.perPage ?? PRODUCTS_PER_PAGE
  const query: Query = {
    'category:eq': filters.category,
    'name:contains': filters.search,
    _sort: filters.sort ? SORT_PARAM[filters.sort] : undefined,
    _page: filters.page ?? 1,
    _per_page: perPage,
  }
  const response = await apiClient.get<JsonServerPage<Product>>('/products', query)
  return toPaginatedList(response, perPage)
}

export async function getById(id: string): Promise<Product> {
  try {
    return await apiClient.get<Product>(`/products/${encodeURIComponent(id)}`)
  } catch (error) {
    if (isNotFoundError(error)) throw new ApiError(404, 'Product not found')
    throw error
  }
}

export async function getByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  const products = await apiClient.get<Product[]>('/products', { 'id:in': ids.join(',') })
  return ids.flatMap((id) => products.filter((product) => product.id === id))
}

export async function getBestSellers(category: string): Promise<Product[]> {
  const response = await apiClient.get<JsonServerPage<Product>>('/products', {
    'category:eq': category,
    'isBestSeller:eq': true,
    _page: 1,
    _per_page: BEST_SELLER_LIMIT,
  })
  return response.data
}

export async function getRelated(product: Product): Promise<Product[]> {
  const response = await apiClient.get<JsonServerPage<Product>>('/products', {
    'category:eq': product.category,
    'id:ne': product.id,
    _page: 1,
    _per_page: RELATED_LIMIT,
  })
  return response.data
}
