import { apiClient, ApiError, isNotFoundError } from './apiClient'
import { toPaginatedList } from './pagination'
import { PRODUCT_ERRORS } from './productErrors'
import { parseProduct, parseProductList } from './productRecord'
import type { Query } from './apiClient'
import type { JsonServerPage } from './pagination'
import type { PaginatedList, Product, ProductFilters } from '@/types'

export const PRODUCTS_PER_PAGE = 12
export const BEST_SELLER_LIMIT = 8
export const RELATED_LIMIT = 8

export { PRODUCT_ERRORS } from './productErrors'

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
  const response = await apiClient.get<JsonServerPage<unknown>>('/products', query)
  return toPaginatedList({ ...response, data: parseProductList(response.data) }, perPage)
}

export async function getById(id: string): Promise<Product> {
  let record: unknown
  try {
    record = await apiClient.get<unknown>(`/products/${encodeURIComponent(id)}`)
  } catch (error) {
    if (isNotFoundError(error)) throw new ApiError(404, PRODUCT_ERRORS.notFound)
    throw error
  }
  return parseProduct(record)
}

export async function getByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  const records = await apiClient.get<unknown[]>('/products', { 'id:in': ids.join(',') })
  const products = parseProductList(records)
  return ids.flatMap((id) => products.filter((product) => product.id === id))
}

export async function getBestSellers(category: string): Promise<Product[]> {
  const response = await apiClient.get<JsonServerPage<unknown>>('/products', {
    'category:eq': category,
    'isBestSeller:eq': true,
    _page: 1,
    _per_page: BEST_SELLER_LIMIT,
  })
  return parseProductList(response.data)
}

export async function getRelated(product: Product): Promise<Product[]> {
  const response = await apiClient.get<JsonServerPage<unknown>>('/products', {
    'category:eq': product.category,
    'id:ne': product.id,
    _page: 1,
    _per_page: RELATED_LIMIT,
  })
  return parseProductList(response.data)
}
