import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { ApiError } from '@/services/apiClient'
import * as productService from '@/services/productService'
import { useBestSellers, useProduct, useProducts, useRelatedProducts } from './useProducts'
import type { ReactNode } from 'react'
import type { PaginatedList, Product } from '@/types'

vi.mock('@/services/productService')

const product = { id: 'p1', category: 't-shirt' } as Product

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { queryClient, wrapper }
}

afterEach(() => {
  vi.resetAllMocks()
})

describe('product query hooks', () => {
  it('useProducts caches the list under queryKeys.products.list', async () => {
    const list: PaginatedList<Product> = {
      data: [product],
      total: 1,
      page: 1,
      perPage: 12,
      totalPages: 1,
    }
    vi.mocked(productService.getProducts).mockResolvedValue(list)
    const { queryClient, wrapper } = setup()
    const filters = { category: 't-shirt' }
    const { result } = renderHook(() => useProducts(filters), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(productService.getProducts).toHaveBeenCalledWith(filters)
    expect(queryClient.getQueryData(queryKeys.products.list(filters))).toEqual(list)
  })

  it('useProduct caches the product under queryKeys.products.detail', async () => {
    vi.mocked(productService.getById).mockResolvedValue(product)
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useProduct('p1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(queryKeys.products.detail('p1'))).toEqual(product)
  })

  it('useProduct does not retry a 404', async () => {
    vi.mocked(productService.getById).mockRejectedValue(new ApiError(404, 'Product not found'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useProduct('xyz'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(productService.getById).toHaveBeenCalledTimes(1)
  })

  it('useProduct retries other errors', async () => {
    vi.mocked(productService.getById).mockRejectedValue(new ApiError(500, 'Server error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useProduct('p1'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(productService.getById).toHaveBeenCalledTimes(4) // 1 call + 3 retries
  })

  it('useProduct does not fetch without an id', () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useProduct(undefined), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(productService.getById).not.toHaveBeenCalled()
  })

  it('useBestSellers caches under queryKeys.products.bestSellers', async () => {
    vi.mocked(productService.getBestSellers).mockResolvedValue([product])
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useBestSellers('t-shirt'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(productService.getBestSellers).toHaveBeenCalledWith('t-shirt')
    expect(queryClient.getQueryData(queryKeys.products.bestSellers('t-shirt'))).toEqual([product])
  })

  it('useRelatedProducts caches under queryKeys.products.related', async () => {
    vi.mocked(productService.getRelated).mockResolvedValue([])
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useRelatedProducts(product), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(productService.getRelated).toHaveBeenCalledWith(product)
    expect(queryClient.getQueryData(queryKeys.products.related('p1'))).toEqual([])
  })

  it('useRelatedProducts does not fetch without a product', () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useRelatedProducts(undefined), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(productService.getRelated).not.toHaveBeenCalled()
  })
})
