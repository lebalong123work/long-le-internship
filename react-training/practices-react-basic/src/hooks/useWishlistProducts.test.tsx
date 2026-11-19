import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { ApiError } from '@/services/apiClient'
import * as productService from '@/services/productService'
import * as wishlistService from '@/services/wishlistService'
import { useAuthStore } from '@/stores/authStore'
import { product } from '@/test/fixtures'
import { useWishlistProducts } from './useWishlistProducts'
import type { ReactNode } from 'react'
import type { Product, User } from '@/types'

vi.mock('@/services/productService')
vi.mock('@/services/wishlistService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const wishlistKey = queryKeys.wishlist('u1')
const SERVER_ERROR = new ApiError(500, 'Server error')
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
  const view = renderHook(() => useWishlistProducts(), { wrapper })
  return { queryClient, ...view }
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
})

afterEach(() => {
  vi.resetAllMocks()
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
})

describe('useWishlistProducts — status', () => {
  it('W1 is loading while the saved list loads', () => {
    vi.mocked(wishlistService.getWishlist).mockReturnValue(new Promise<string[]>(() => {}))
    const { result } = setup()
    expect(result.current.status).toBe('loading')
    expect(result.current.products).toEqual([])
  })

  it('W2 is error when the saved list fails without data', async () => {
    vi.mocked(wishlistService.getWishlist).mockRejectedValue(SERVER_ERROR)
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('W2 keeps the cards when a background refetch of the saved list fails', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValueOnce(['p1'])
    vi.mocked(productService.getByIds).mockResolvedValue([P1])
    const { result, queryClient } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    vi.mocked(wishlistService.getWishlist).mockRejectedValue(SERVER_ERROR)
    await act(() => queryClient.refetchQueries({ queryKey: wishlistKey }))
    expect(queryClient.getQueryState(wishlistKey)?.status).toBe('error')
    expect(result.current.status).toBe('ready')
    expect(result.current.products).toEqual([P1])
  })

  it('W3 is empty for an empty saved list and requests no products', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue([])
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('empty'))
    expect(productService.getByIds).not.toHaveBeenCalled()
  })

  it('W4 lists the products in saved order and leaves out missing ones', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p2', 'p9', 'p1'])
    vi.mocked(productService.getByIds).mockResolvedValue([P2, P1])
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(productService.getByIds).toHaveBeenCalledWith(['p2', 'p9', 'p1'])
    expect(result.current.products).toEqual([P2, P1])
  })

  it('W4 is empty when every saved product is gone from the store', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p9'])
    vi.mocked(productService.getByIds).mockResolvedValue([])
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('empty'))
    expect(result.current.products).toEqual([])
  })

  it('W5 is error when the products fail without data', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    vi.mocked(productService.getByIds).mockRejectedValue(SERVER_ERROR)
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
  })
})

describe('useWishlistProducts — removing', () => {
  it('W6 keeps the other cards from the previous list while the new list loads', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1', 'p2'])
    vi.mocked(productService.getByIds).mockResolvedValueOnce([P1, P2])
    vi.mocked(productService.getByIds).mockReturnValue(new Promise<Product[]>(() => {}))
    const { result, queryClient } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => queryClient.setQueryData(wishlistKey, ['p2']))
    await waitFor(() => expect(result.current.products).toEqual([P2]))
    expect(result.current.status).toBe('ready')
    expect(productService.getByIds).toHaveBeenLastCalledWith(['p2'])
  })

  it('W6 is loading when the previous list does not cover the new ids', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    vi.mocked(productService.getByIds).mockResolvedValueOnce([P1])
    vi.mocked(productService.getByIds).mockReturnValue(new Promise<Product[]>(() => {}))
    const { result, queryClient } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => queryClient.setQueryData(wishlistKey, ['p2', 'p1']))
    await waitFor(() => expect(result.current.status).toBe('loading'))
    expect(result.current.products).toEqual([])
  })
})

describe('useWishlistProducts — retry', () => {
  it('W7 retries the saved list when it has no data and reports isRetrying', async () => {
    const next = deferred<string[]>()
    vi.mocked(wishlistService.getWishlist).mockRejectedValueOnce(SERVER_ERROR)
    vi.mocked(wishlistService.getWishlist).mockReturnValueOnce(next.promise)
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
    act(() => result.current.retry())
    expect(result.current.isRetrying).toBe(true)
    expect(result.current.status).toBe('error')
    expect(wishlistService.getWishlist).toHaveBeenCalledTimes(2)
    await act(async () => next.resolve([]))
    await waitFor(() => expect(result.current.isRetrying).toBe(false))
    expect(result.current.status).toBe('empty')
  })

  it('W7 retries only the products when the saved list has data', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    vi.mocked(productService.getByIds).mockRejectedValueOnce(SERVER_ERROR)
    vi.mocked(productService.getByIds).mockResolvedValue([P1])
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(wishlistService.getWishlist).toHaveBeenCalledTimes(1)
    expect(productService.getByIds).toHaveBeenCalledTimes(2)
  })
})
