import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { SHIPPING_FEE } from '@/constants/shipping'
import { ApiError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import * as productService from '@/services/productService'
import { useAuthStore } from '@/stores/authStore'
import { product } from '@/test/fixtures'
import { useCartLines } from './useCartLines'
import type { ReactNode } from 'react'
import type { Cart, CartItem, Product, User } from '@/types'

vi.mock('@/services/cartService')
vi.mock('@/services/productService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const cartKey = queryKeys.cart({ kind: 'user', id: 'u1' })
const SERVER_ERROR = new ApiError(500, 'Server error')

const P1: Product = { ...product('p1'), price: 40 }
const P2: Product = { ...product('p2'), price: 25 }

const blackP1: CartItem = {
  id: 'p1__Black__S',
  productId: 'p1',
  color: 'Black',
  size: 'S',
  quantity: 2,
}
const blueP1: CartItem = {
  id: 'p1__Blue__M',
  productId: 'p1',
  color: 'Blue',
  size: 'M',
  quantity: 1,
}
const blackP2: CartItem = {
  id: 'p2__Black__S',
  productId: 'p2',
  color: 'Black',
  size: 'S',
  quantity: 3,
}
const gone: CartItem = {
  id: 'p9__Black__S',
  productId: 'p9',
  color: 'Black',
  size: 'S',
  quantity: 4,
}

function cartOf(...items: CartItem[]): Cart {
  return { id: 'c1', userId: 'u1', items }
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  let reject: (reason: unknown) => void = () => undefined
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })
  return { promise, resolve, reject }
}

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  const view = renderHook(() => useCartLines(), { wrapper })
  return { queryClient, ...view }
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe('useCartLines', () => {
  it('joins every cart item with its product in cart order', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(blackP2, blackP1))
    vi.mocked(productService.getByIds).mockResolvedValue([P2, P1])
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.lines).toEqual([
      { item: blackP2, product: P2 },
      { item: blackP1, product: P1 },
    ])
    expect(result.current.hasUnavailableItems).toBe(false)
  })

  it('reports an empty cart without requesting products', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf())
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('empty'))
    expect(result.current.lines).toEqual([])
    expect(result.current.summary).toEqual({
      itemCount: 0,
      subtotal: 0,
      shippingFee: 0,
      total: 0,
    })
    expect(productService.getByIds).not.toHaveBeenCalled()
  })

  it('requests each product id once for two variants of one product', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(blackP1, blackP2, blueP1))
    vi.mocked(productService.getByIds).mockResolvedValue([P1, P2])
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(productService.getByIds).toHaveBeenCalledWith(['p1', 'p2'])
    expect(result.current.lines).toHaveLength(3)
  })

  it('keeps a line whose product is missing from a completed lookup', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(blackP1, gone))
    vi.mocked(productService.getByIds).mockResolvedValue([P1])
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.lines).toEqual([
      { item: blackP1, product: P1 },
      { item: gone, product: null },
    ])
    expect(result.current.hasUnavailableItems).toBe(true)
  })

  it('counts every stored item but totals only lines with a product', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(blackP1, gone, blackP2))
    vi.mocked(productService.getByIds).mockResolvedValue([P1, P2])
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.summary).toEqual({
      itemCount: 9,
      subtotal: 155,
      shippingFee: 0,
      total: 155,
    })
  })

  it('reports the subtotal and the shipping fee of the lines with a product', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(blackP1, blackP2))
    vi.mocked(productService.getByIds).mockResolvedValue([P1, P2])
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.summary.subtotal).toBe(155)
    expect(result.current.summary.shippingFee).toBe(SHIPPING_FEE)
    expect(result.current.summary.total).toBe(155 + SHIPPING_FEE)
  })

  it('leaves an unavailable line out of the subtotal', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(gone))
    vi.mocked(productService.getByIds).mockResolvedValue([])
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.summary).toEqual({
      itemCount: 4,
      subtotal: 0,
      shippingFee: SHIPPING_FEE,
      total: SHIPPING_FEE,
    })
  })

  it('is loading until the cart and then the products have loaded', async () => {
    const cartRequest = deferred<Cart>()
    const productsRequest = deferred<Product[]>()
    vi.mocked(cartService.getCart).mockReturnValue(cartRequest.promise)
    vi.mocked(productService.getByIds).mockReturnValue(productsRequest.promise)
    const { result } = setup()
    expect(result.current.status).toBe('loading')
    cartRequest.resolve(cartOf(blackP1))
    await waitFor(() => expect(productService.getByIds).toHaveBeenCalled())
    expect(result.current.status).toBe('loading')
    productsRequest.resolve([P1])
    await waitFor(() => expect(result.current.status).toBe('ready'))
  })

  it('reports an error when the cart cannot be loaded', async () => {
    vi.mocked(cartService.getCart).mockRejectedValue(SERVER_ERROR)
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.isRetrying).toBe(false)
  })

  it('reports an error when the products cannot be loaded', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(blackP1))
    vi.mocked(productService.getByIds).mockRejectedValue(SERVER_ERROR)
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.lines).toEqual([])
  })

  it('stays ready when a background refetch fails', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(blackP1))
    vi.mocked(productService.getByIds).mockResolvedValueOnce([P1])
    const { result, queryClient } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    vi.mocked(cartService.getCart).mockRejectedValue(SERVER_ERROR)
    vi.mocked(productService.getByIds).mockRejectedValue(SERVER_ERROR)
    await act(async () => {
      await queryClient.refetchQueries()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(queryClient.getQueryState(cartKey)?.status).toBe('error')
    expect(result.current.status).toBe('ready')
    expect(result.current.lines).toEqual([{ item: blackP1, product: P1 }])
  })

  it('stays ready on placeholder data that covers every current id', async () => {
    const nextLookup = deferred<Product[]>()
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(blackP1, blackP2))
    vi.mocked(productService.getByIds).mockResolvedValueOnce([P1, P2])
    vi.mocked(productService.getByIds).mockReturnValueOnce(nextLookup.promise)
    const { result, queryClient } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => {
      queryClient.setQueryData(cartKey, cartOf(blackP2))
    })
    await waitFor(() => expect(result.current.lines).toEqual([{ item: blackP2, product: P2 }]))
    expect(productService.getByIds).toHaveBeenLastCalledWith(['p2'])
    expect(result.current.status).toBe('ready')
    expect(result.current.hasUnavailableItems).toBe(false)
    await act(async () => {
      nextLookup.resolve([P2])
      await nextLookup.promise
    })
    expect(result.current.status).toBe('ready')
  })

  it('is loading, not unavailable, while placeholder data misses a current id', async () => {
    const nextLookup = deferred<Product[]>()
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(blackP1))
    vi.mocked(productService.getByIds).mockResolvedValueOnce([P1])
    vi.mocked(productService.getByIds).mockReturnValueOnce(nextLookup.promise)
    const { result, queryClient } = setup()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => {
      queryClient.setQueryData(cartKey, cartOf(blackP1, blackP2))
    })
    await waitFor(() => expect(result.current.status).toBe('loading'))
    expect(productService.getByIds).toHaveBeenLastCalledWith(['p1', 'p2'])
    expect(result.current.hasUnavailableItems).toBe(false)
    nextLookup.resolve([P1, P2])
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.hasUnavailableItems).toBe(false)
  })

  it('keeps the error state while a first-load retry runs, then becomes ready', async () => {
    const retryRequest = deferred<Product[]>()
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(blackP1))
    vi.mocked(productService.getByIds).mockRejectedValueOnce(SERVER_ERROR)
    vi.mocked(productService.getByIds).mockReturnValueOnce(retryRequest.promise)
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
    act(() => {
      result.current.retry()
    })
    expect(result.current.status).toBe('error')
    expect(result.current.isRetrying).toBe(true)
    retryRequest.resolve([P1])
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.isRetrying).toBe(false)
  })

  it('returns to the error state without retrying flag when the retry fails', async () => {
    const retryRequest = deferred<Cart>()
    vi.mocked(cartService.getCart).mockRejectedValueOnce(SERVER_ERROR)
    vi.mocked(cartService.getCart).mockReturnValueOnce(retryRequest.promise)
    const { result } = setup()
    await waitFor(() => expect(result.current.status).toBe('error'))
    act(() => {
      result.current.retry()
    })
    expect(result.current.isRetrying).toBe(true)
    retryRequest.reject(SERVER_ERROR)
    await waitFor(() => expect(result.current.isRetrying).toBe(false))
    expect(result.current.status).toBe('error')
  })
})
