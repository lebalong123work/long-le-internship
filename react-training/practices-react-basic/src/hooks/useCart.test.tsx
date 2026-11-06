import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useAddToCart, useCart, useRemoveCartItem, useUpdateCartQuantity } from './useCart'
import type { ReactNode } from 'react'
import type { AddToCartDto, Cart, CartItem, User } from '@/types'

vi.mock('@/services/cartService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const cartKey = queryKeys.cart('u1')

const black: CartItem = {
  id: 'p1__Black__S',
  productId: 'p1',
  color: 'Black',
  size: 'S',
  quantity: 2,
}
const blue: CartItem = { id: 'p2__Blue__M', productId: 'p2', color: 'Blue', size: 'M', quantity: 1 }
const cart: Cart = { id: 'c1', userId: 'u1', items: [black, blue] }
const newItem: AddToCartDto = { productId: 'p3', color: 'Green', size: 'L', quantity: 1 }

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { queryClient, wrapper }
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  let reject: (reason: unknown) => void = () => undefined
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function toasts() {
  return useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))
}

function cachedItems(queryClient: QueryClient) {
  return queryClient.getQueryData<Cart>(cartKey)?.items
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe('useCart', () => {
  it('useCart caches the cart under queryKeys.cart(uid)', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cart)
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useCart(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(cartService.getCart).toHaveBeenCalledWith('u1')
    expect(queryClient.getQueryData(cartKey)).toEqual(cart)
  })

  it('useCart does not call the service for a guest', () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    const { wrapper } = setup()
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(cartService.getCart).not.toHaveBeenCalled()
  })

  it('useCart sets isError and shows no toast when loading fails', async () => {
    vi.mocked(cartService.getCart).mockRejectedValue(new ApiError(500, 'Server error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useCart(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toasts()).toEqual([])
  })
})

describe('useAddToCart', () => {
  it('useAddToCart saves the server cart and shows "Added to cart"', async () => {
    const saved: Cart = { ...cart, items: [{ id: 'p3__Green__L', ...newItem }, black, blue] }
    vi.mocked(cartService.addItem).mockResolvedValue(saved)
    vi.mocked(cartService.getCart).mockResolvedValue(saved)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(cartKey, cart)
    const { result } = renderHook(() => useAddToCart(), { wrapper })

    act(() => result.current.mutate(newItem))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(cartKey)).toEqual(saved)
    expect(toasts()).toEqual([{ type: 'success', message: TOAST_MESSAGES.cart.added }])
  })

  it('useAddToCart keeps the cache and shows the cart error toast when adding fails', async () => {
    vi.mocked(cartService.addItem).mockRejectedValue(new ApiError(500, 'Server error'))
    vi.mocked(cartService.getCart).mockResolvedValue(cart)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(cartKey, cart)
    const { result } = renderHook(() => useAddToCart(), { wrapper })

    act(() => result.current.mutate(newItem))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(queryClient.getQueryData(cartKey)).toEqual(cart)
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
  })

  it('useAddToCart leaves the cache unchanged while the request is pending', async () => {
    const pending = deferred<Cart>()
    vi.mocked(cartService.addItem).mockReturnValue(pending.promise)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(cartKey, cart)
    const { result } = renderHook(() => useAddToCart(), { wrapper })

    act(() => result.current.mutate(newItem))

    await waitFor(() => expect(result.current.isPending).toBe(true))
    expect(queryClient.getQueryData(cartKey)).toEqual(cart)
    pending.resolve(cart)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('useAddToCart calls cartService.addItem with the logged-in user id', async () => {
    vi.mocked(cartService.addItem).mockResolvedValue(cart)
    const { wrapper } = setup()
    const { result } = renderHook(() => useAddToCart(), { wrapper })

    act(() => result.current.mutate(newItem))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(cartService.addItem).toHaveBeenCalledWith('u1', newItem)
  })
})

describe('useUpdateCartQuantity', () => {
  it('useUpdateCartQuantity shows the new quantity before the server answers', async () => {
    const pending = deferred<Cart>()
    vi.mocked(cartService.updateQuantity).mockReturnValue(pending.promise)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(cartKey, cart)
    const { result } = renderHook(() => useUpdateCartQuantity(), { wrapper })

    act(() => result.current.mutate({ itemId: black.id, quantity: 5 }))

    await waitFor(() => expect(cachedItems(queryClient)?.[0].quantity).toBe(5))
    expect(cachedItems(queryClient)?.[1]).toEqual(blue)
    pending.resolve(cart)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('useUpdateCartQuantity does not create a cache entry when the cart is not loaded', async () => {
    const pending = deferred<Cart>()
    vi.mocked(cartService.updateQuantity).mockReturnValue(pending.promise)
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useUpdateCartQuantity(), { wrapper })

    act(() => result.current.mutate({ itemId: black.id, quantity: 5 }))

    await waitFor(() => expect(cartService.updateQuantity).toHaveBeenCalled())
    expect(queryClient.getQueryData(cartKey)).toBeUndefined()
    pending.reject(new ApiError(500, 'Server error'))
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('useUpdateCartQuantity replaces the cache with the server cart and shows no toast', async () => {
    const saved: Cart = { ...cart, items: [{ ...black, quantity: 3 }, blue] }
    vi.mocked(cartService.updateQuantity).mockResolvedValue(saved)
    vi.mocked(cartService.getCart).mockResolvedValue(saved)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(cartKey, cart)
    const { result } = renderHook(() => useUpdateCartQuantity(), { wrapper })

    act(() => result.current.mutate({ itemId: black.id, quantity: 5 }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(cartService.updateQuantity).toHaveBeenCalledWith('u1', black.id, 5)
    expect(queryClient.getQueryData(cartKey)).toEqual(saved)
    expect(toasts()).toEqual([])
  })

  it('useUpdateCartQuantity rolls back and shows the cart error toast when updating fails', async () => {
    vi.mocked(cartService.updateQuantity).mockRejectedValue(
      new ApiError(404, cartService.CART_ERRORS.itemNotFound)
    )
    vi.mocked(cartService.getCart).mockReturnValue(new Promise<Cart>(() => undefined))
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(cartKey, cart)
    const { result } = renderHook(() => useUpdateCartQuantity(), { wrapper })

    act(() => result.current.mutate({ itemId: black.id, quantity: 5 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(queryClient.getQueryData(cartKey)).toEqual(cart)
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
  })
})

describe('useRemoveCartItem', () => {
  it('useRemoveCartItem hides the line before the server answers', async () => {
    const pending = deferred<Cart>()
    vi.mocked(cartService.removeItem).mockReturnValue(pending.promise)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(cartKey, cart)
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper })

    act(() => result.current.mutate(black.id))

    await waitFor(() => expect(cachedItems(queryClient)).toEqual([blue]))
    pending.resolve({ ...cart, items: [blue] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('useRemoveCartItem does not create a cache entry when the cart is not loaded', async () => {
    const pending = deferred<Cart>()
    vi.mocked(cartService.removeItem).mockReturnValue(pending.promise)
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper })

    act(() => result.current.mutate(black.id))

    await waitFor(() => expect(cartService.removeItem).toHaveBeenCalled())
    expect(queryClient.getQueryData(cartKey)).toBeUndefined()
    pending.reject(new ApiError(500, 'Server error'))
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('useRemoveCartItem replaces the cache with the server cart and shows "Removed from cart"', async () => {
    const saved: Cart = { ...cart, items: [blue] }
    vi.mocked(cartService.removeItem).mockResolvedValue(saved)
    vi.mocked(cartService.getCart).mockResolvedValue(saved)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(cartKey, cart)
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper })

    act(() => result.current.mutate(black.id))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(cartService.removeItem).toHaveBeenCalledWith('u1', black.id)
    expect(queryClient.getQueryData(cartKey)).toEqual(saved)
    expect(toasts()).toEqual([{ type: 'info', message: TOAST_MESSAGES.cart.removed }])
  })

  it('useRemoveCartItem rolls back and shows the cart error toast when removing fails', async () => {
    vi.mocked(cartService.removeItem).mockRejectedValue(new ApiError(500, 'Server error'))
    vi.mocked(cartService.getCart).mockReturnValue(new Promise<Cart>(() => undefined))
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(cartKey, cart)
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper })

    act(() => result.current.mutate(black.id))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(queryClient.getQueryData(cartKey)).toEqual(cart)
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
  })
})

describe('all cart mutations', () => {
  it('a cart mutation shows the network toast when the request fails with status 0', async () => {
    vi.mocked(cartService.updateQuantity).mockRejectedValue(new ApiError(0, 'Network error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useUpdateCartQuantity(), { wrapper })

    act(() => result.current.mutate({ itemId: black.id, quantity: 5 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.network.error }])
  })

  it('a cart mutation shows the cart error toast for a server error', async () => {
    vi.mocked(cartService.updateQuantity).mockRejectedValue(new ApiError(500, 'Server error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useUpdateCartQuantity(), { wrapper })

    act(() => result.current.mutate({ itemId: black.id, quantity: 5 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
  })

  it('a cart mutation rejects without a request for a guest and shows the cart error toast', async () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    const { wrapper } = setup()
    const { result } = renderHook(() => useAddToCart(), { wrapper })

    act(() => result.current.mutate(newItem))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(cartService.addItem).not.toHaveBeenCalled()
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
  })

  it('two cart mutations run one after the other', async () => {
    const first = deferred<Cart>()
    vi.mocked(cartService.updateQuantity).mockReturnValue(first.promise)
    vi.mocked(cartService.removeItem).mockResolvedValue(cart)
    const { wrapper } = setup()
    const { result } = renderHook(
      () => ({ update: useUpdateCartQuantity(), remove: useRemoveCartItem() }),
      {
        wrapper,
      }
    )

    act(() => {
      result.current.update.mutate({ itemId: black.id, quantity: 5 })
      result.current.remove.mutate(blue.id)
    })

    await waitFor(() => expect(cartService.updateQuantity).toHaveBeenCalled())
    expect(cartService.removeItem).not.toHaveBeenCalled()
    first.resolve(cart)
    await waitFor(() => expect(cartService.removeItem).toHaveBeenCalledWith('u1', blue.id))
  })

  it('a cart mutation queued behind a failed one still runs', async () => {
    const first = deferred<Cart>()
    vi.mocked(cartService.updateQuantity).mockReturnValue(first.promise)
    vi.mocked(cartService.removeItem).mockResolvedValue(cart)
    const { wrapper } = setup()
    const { result } = renderHook(
      () => ({ update: useUpdateCartQuantity(), remove: useRemoveCartItem() }),
      {
        wrapper,
      }
    )

    act(() => {
      result.current.update.mutate({ itemId: black.id, quantity: 5 })
      result.current.remove.mutate(blue.id)
    })

    await waitFor(() => expect(cartService.updateQuantity).toHaveBeenCalled())
    first.reject(new ApiError(500, 'Server error'))
    await waitFor(() => expect(result.current.remove.isSuccess).toBe(true))
    expect(cartService.removeItem).toHaveBeenCalledWith('u1', blue.id)
  })

  it('a cart mutation invalidates queryKeys.cart(uid) after success', async () => {
    vi.mocked(cartService.removeItem).mockResolvedValue(cart)
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper })

    act(() => result.current.mutate(black.id))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: cartKey })
  })

  it('a cart mutation invalidates queryKeys.cart(uid) after failure', async () => {
    vi.mocked(cartService.removeItem).mockRejectedValue(new ApiError(500, 'Server error'))
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRemoveCartItem(), { wrapper })

    act(() => result.current.mutate(black.id))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: cartKey })
  })
})
