import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import * as productService from '@/services/productService'
import { retryUnlessNotFound } from './queryRetry'
import type { UseQueryResult } from '@tanstack/react-query'
import type { CategorySlug } from '@/constants/categories'
import type { PaginatedList, Product, ProductFilters } from '@/types'

type ProductListKey = ReturnType<typeof queryKeys.products.list>

interface ProductsByIdsQueryOptions {
  queryKey: ReturnType<typeof queryKeys.products.byIds>
  queryFn: () => Promise<Product[]>
}

export function useProducts(
  filters: ProductFilters
): UseQueryResult<PaginatedList<Product>, Error> {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productService.getProducts(filters),
  })
}

function isSameCategory(
  previousKey: ProductListKey | undefined,
  category: CategorySlug | undefined
): boolean {
  return previousKey !== undefined && previousKey[2].category === category
}

export function useShopProducts(
  category: CategorySlug | undefined,
  page: number
): UseQueryResult<PaginatedList<Product>, Error> {
  const filters: ProductFilters = { category, page }

  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productService.getProducts(filters),
    placeholderData: (previousData, previousQuery) =>
      isSameCategory(previousQuery?.queryKey, category) ? previousData : undefined,
  })
}

export function useProduct(id: string | undefined): UseQueryResult<Product, Error> {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: id ? () => productService.getById(id) : skipToken,
    retry: retryUnlessNotFound,
  })
}

export function useBestSellers(category: string): UseQueryResult<Product[], Error> {
  return useQuery({
    queryKey: queryKeys.products.bestSellers(category),
    queryFn: () => productService.getBestSellers(category),
  })
}

export function useRelatedProducts(product: Product | undefined): UseQueryResult<Product[], Error> {
  return useQuery({
    queryKey: queryKeys.products.related(product?.id ?? ''),
    queryFn: product ? () => productService.getRelated(product) : skipToken,
  })
}

export function productsByIdsQueryOptions(ids: string[]): ProductsByIdsQueryOptions {
  return {
    queryKey: queryKeys.products.byIds(ids),
    queryFn: () => productService.getByIds(ids),
  }
}

export function useProductsByIds(ids: string[]): UseQueryResult<Product[], Error> {
  const options = productsByIdsQueryOptions(ids)

  return useQuery({
    queryKey: options.queryKey,
    queryFn: ids.length > 0 ? options.queryFn : skipToken,
    placeholderData: keepPreviousData,
  })
}

export function usableProducts(
  { data, isPlaceholderData }: UseQueryResult<Product[], Error>,
  ids: string[]
): Product[] | undefined {
  if (data === undefined || !isPlaceholderData) return data
  const coversEveryId = ids.every((id) => data.some((product) => product.id === id))
  return coversEveryId ? data : undefined
}
