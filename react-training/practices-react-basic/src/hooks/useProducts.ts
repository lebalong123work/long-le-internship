import { skipToken, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { isNotFoundError } from '@/services/apiClient'
import * as productService from '@/services/productService'
import type { Product, ProductFilters } from '@/types'

const MAX_RETRIES = 3

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productService.getProducts(filters),
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: id ? () => productService.getById(id) : skipToken,
    retry: (failureCount, error) => !isNotFoundError(error) && failureCount < MAX_RETRIES,
  })
}

export function useBestSellers(category: string) {
  return useQuery({
    queryKey: queryKeys.products.bestSellers(category),
    queryFn: () => productService.getBestSellers(category),
  })
}

export function useRelatedProducts(product: Product | undefined) {
  return useQuery({
    queryKey: queryKeys.products.related(product?.id ?? ''),
    queryFn: product ? () => productService.getRelated(product) : skipToken,
  })
}
