import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { ApiError } from '@/services/apiClient'
import * as productService from '@/services/productService'
import { product } from '@/test/fixtures'
import { useProductsByIds } from './useProducts'
import type { ReactNode } from 'react'
import type { Product } from '@/types'

vi.mock('@/services/productService')

const P1 = product('p1')
const P2 = product('p2')

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((onResolve) => {
    resolve = onResolve
  })
  return { promise, resolve }
}

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { queryClient, wrapper }
}

afterEach(() => {
  vi.resetAllMocks()
})

describe('useProductsByIds', () => {
  it('loads the products under queryKeys.products.byIds in id order', async () => {
    vi.mocked(productService.getByIds).mockResolvedValue([P2, P1])
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useProductsByIds(['p2', 'p1']), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(productService.getByIds).toHaveBeenCalledWith(['p2', 'p1'])
    expect(result.current.data).toEqual([P2, P1])
    expect(queryClient.getQueryData(queryKeys.products.byIds(['p2', 'p1']))).toEqual([P2, P1])
  })

  it('does not request anything for an empty id list', () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useProductsByIds([]), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
    expect(productService.getByIds).not.toHaveBeenCalled()
  })

  it('keeps the previous list as placeholder data while a new id list loads', async () => {
    const next = deferred<Product[]>()
    vi.mocked(productService.getByIds).mockResolvedValueOnce([P1, P2])
    vi.mocked(productService.getByIds).mockReturnValueOnce(next.promise)
    const { wrapper } = setup()
    const { result, rerender } = renderHook(({ ids }) => useProductsByIds(ids), {
      wrapper,
      initialProps: { ids: ['p1', 'p2'] },
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    rerender({ ids: ['p2'] })
    expect(result.current.data).toEqual([P1, P2])
    expect(result.current.isPlaceholderData).toBe(true)
    next.resolve([P2])
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false))
    expect(result.current.data).toEqual([P2])
  })

  it('reports an error without data when the request fails', async () => {
    vi.mocked(productService.getByIds).mockRejectedValue(new ApiError(500, 'Server error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useProductsByIds(['p1']), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
