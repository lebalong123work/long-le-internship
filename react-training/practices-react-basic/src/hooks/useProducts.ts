import { skipToken, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import * as productService from '@/services/productService'
import { retryUnlessNotFound } from './queryRetry'
import type { UseQueryResult } from '@tanstack/react-query'
import type { PaginatedList, Product, ProductFilters } from '@/types'

export function useProducts(filters: ProductFilters): UseQueryResult<PaginatedList<Product>, Error> {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productService.getProducts(filters),
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
