import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import * as orderService from '@/services/orderService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useUpdateCartQuantity } from './useCart'
import { useCreateOrder, useOrder, useOrders } from './useOrders'
import type { ReactNode } from 'react'
import type { Cart, CreateOrderDto, Order, PaginatedList, User } from '@/types'

vi.mock('@/services/cartService')
vi.mock('@/services/orderService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }

const payload: CreateOrderDto = {
  items: [
    {
      productId: 'p1',
      name: 'Smart T-Shirt',
      price: 40,
      image: '/images/products/p1.jpg',
      color: 'Black',
      size: 'S',
      quantity: 2,
    },
  ],
  shippingAddress: {
    fullName: 'Test Customer',
    phone: '0912345678',
    email: 'user@store.com',
    address: '1 Test Street',
    city: 'Hà Nội',
    district: 'Ba Đình',
  },
  paymentMethod: 'cod',
}

const order: Order = {
  id: 'o1',
  userId: 'u1',
  ...payload,
  subtotal: 80,
  shippingFee: 0,
  total: 80,
  status: 'pending',
  createdAt: '2026-11-06T09:00:00.000Z',
}

const orderPage: PaginatedList<Order> = {
  data: [order],
  total: 11,
  page: 2,
  perPage: 10,
  totalPages: 2,
}

const cart: Cart = {
  id: 'c1',
  userId: 'u1',
  items: [{ id: 'p1__Black__S', productId: 'p1', color: 'Black', size: 'S', quantity: 2 }],
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 }, mutations: { retry: false } },
  })
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ROUTES.CHECKOUT]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
  return { queryClient, wrapper }
}

function useCreateOrderWithLocation() {
  return { create: useCreateOrder(), location: useLocation(), navigationType: useNavigationType() }
}

function useCartUpdateAndOrder() {
  return { update: useUpdateCartQuantity(), create: useCreateOrder() }
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

function logOut() {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe('useOrders', () => {
  it('useOrders caches page 2 under queryKeys.orders.list(uid, 2)', async () => {
    vi.mocked(orderService.getOrdersByUser).mockResolvedValue(orderPage)
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useOrders(2), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(orderService.getOrdersByUser).toHaveBeenCalledWith('u1', 2)
    expect(queryClient.getQueryData(queryKeys.orders.list('u1', 2))).toEqual(orderPage)
  })

  it('useOrders sends no request for a guest', async () => {
    logOut()
    const { wrapper } = setup()
    const { result } = renderHook(() => useOrders(1), { wrapper })
    await act(async () => undefined)
    expect(result.current.fetchStatus).toBe('idle')
    expect(orderService.getOrdersByUser).not.toHaveBeenCalled()
  })

  it('useOrders shows no toast when the list loads', async () => {
    vi.mocked(orderService.getOrdersByUser).mockResolvedValue(orderPage)
    const { wrapper } = setup()
    const { result } = renderHook(() => useOrders(1), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toasts()).toEqual([])
  })

  it('useOrders puts a load error in the query without a toast', async () => {
    const error = new ApiError(500, 'Server error')
    vi.mocked(orderService.getOrdersByUser).mockRejectedValue(error)
    const { wrapper } = setup()
    const { result } = renderHook(() => useOrders(1), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(error)
    expect(toasts()).toEqual([])
  })
})

describe('useOrder', () => {
  it('useOrder caches the order under queryKeys.orders.detail(uid, id)', async () => {
    vi.mocked(orderService.getOrderById).mockResolvedValue(order)
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useOrder('o1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(queryKeys.orders.detail('u1', 'o1'))).toEqual(order)
  })

  it('useOrder sends no request without an id', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useOrder(undefined), { wrapper })
    await act(async () => undefined)
    expect(result.current.fetchStatus).toBe('idle')
    expect(orderService.getOrderById).not.toHaveBeenCalled()
  })

  it('useOrder requests the order of the logged-in user', async () => {
    vi.mocked(orderService.getOrderById).mockResolvedValue(order)
    const { wrapper } = setup()
    const { result } = renderHook(() => useOrder('o1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(orderService.getOrderById).toHaveBeenCalledWith('u1', 'o1')
  })

  it('useOrder sends no request for a guest', async () => {
    logOut()
    const { wrapper } = setup()
    const { result } = renderHook(() => useOrder('o1'), { wrapper })
    await act(async () => undefined)
    expect(result.current.fetchStatus).toBe('idle')
    expect(orderService.getOrderById).not.toHaveBeenCalled()
  })

  it('useOrder retries a server error', async () => {
    vi.mocked(orderService.getOrderById).mockRejectedValue(new ApiError(500, 'Server error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useOrder('o1'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(orderService.getOrderById).toHaveBeenCalledTimes(4)
  })

  it('useOrder does not retry a 404', async () => {
    vi.mocked(orderService.getOrderById).mockRejectedValue(new ApiError(404, 'Order not found'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useOrder('o1'), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(orderService.getOrderById).toHaveBeenCalledTimes(1)
  })
})

describe('useCreateOrder', () => {
  it('useCreateOrder places the order, clears the cart and opens the success page', async () => {
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrderWithLocation(), { wrapper })
    act(() => result.current.create.mutate(payload))
    await waitFor(() => expect(result.current.create.isSuccess).toBe(true))
    expect(orderService.createOrder).toHaveBeenCalledWith('u1', payload)
    expect(cartService.clearCart).toHaveBeenCalledWith('u1')
    expect(result.current.location.pathname).toBe(ROUTES.ORDER_SUCCESS('o1'))
  })

  it('useCreateOrder does not clear the cart or navigate when the order fails', async () => {
    vi.mocked(orderService.createOrder).mockRejectedValue(new ApiError(500, 'Server error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrderWithLocation(), { wrapper })
    act(() => result.current.create.mutate(payload))
    await waitFor(() => expect(result.current.create.isError).toBe(true))
    expect(cartService.clearCart).not.toHaveBeenCalled()
    expect(result.current.location.pathname).toBe(ROUTES.CHECKOUT)
  })

  it('useCreateOrder invalidates cart and orders after success', async () => {
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.cart('u1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all('u1') })
  })

  it('useCreateOrder invalidates cart and orders after a failed order', async () => {
    vi.mocked(orderService.createOrder).mockRejectedValue(new ApiError(0, 'Network error'))
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.cart('u1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all('u1') })
  })

  it('useCreateOrder shows no toast on success', async () => {
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toasts()).toEqual([])
  })

  it('useCreateOrder shows the order-failed toast on a server error', async () => {
    vi.mocked(orderService.createOrder).mockRejectedValue(new ApiError(500, 'Server error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.order.failed }])
  })

  it('useCreateOrder shows the network toast on a network error', async () => {
    vi.mocked(orderService.createOrder).mockRejectedValue(new ApiError(0, 'Network error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.network.error }])
  })

  it('useCreateOrder shows the order-failed toast for an empty-order error', async () => {
    vi.mocked(orderService.createOrder).mockRejectedValue(
      new ApiError(400, orderService.ORDER_ERRORS.emptyOrder)
    )
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate({ ...payload, items: [] }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.order.failed }])
  })

  it('useCreateOrder opens the success page and shows the cart toast when clearing fails', async () => {
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockRejectedValue(new ApiError(500, 'Server error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrderWithLocation(), { wrapper })
    act(() => result.current.create.mutate(payload))
    await waitFor(() => expect(result.current.create.isSuccess).toBe(true))
    expect(result.current.location.pathname).toBe(ROUTES.ORDER_SUCCESS('o1'))
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
  })

  it('useCreateOrder shows no cart toast when clearing succeeds', async () => {
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrderWithLocation(), { wrapper })
    act(() => result.current.create.mutate(payload))
    await waitFor(() => expect(result.current.create.isSuccess).toBe(true))
    expect(toasts()).not.toContainEqual({
      type: 'error',
      message: TOAST_MESSAGES.cart.updateFailed,
    })
  })

  it('useCreateOrder sends the order for the logged-in user id', async () => {
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(orderService.createOrder).mock.calls[0]?.[0]).toBe('u1')
  })

  it('useCreateOrder rejects a guest without calling the service', async () => {
    logOut()
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(orderService.createOrder).not.toHaveBeenCalled()
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.order.failed }])
  })

  it('useCreateOrder waits for a pending cart mutation', async () => {
    const update = deferred<Cart>()
    vi.mocked(cartService.updateQuantity).mockReturnValue(update.promise)
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { wrapper } = setup()
    const { result } = renderHook(() => useCartUpdateAndOrder(), { wrapper })
    act(() => result.current.update.mutate({ itemId: 'p1__Black__S', quantity: 3 }))
    act(() => result.current.create.mutate(payload))
    await waitFor(() => expect(cartService.updateQuantity).toHaveBeenCalled())
    expect(orderService.createOrder).not.toHaveBeenCalled()
    await act(async () => update.resolve(cart))
    await waitFor(() => expect(result.current.create.isSuccess).toBe(true))
    expect(orderService.createOrder).toHaveBeenCalledTimes(1)
  })

  it('useCreateOrder runs after a failed cart mutation', async () => {
    const update = deferred<Cart>()
    vi.mocked(cartService.updateQuantity).mockReturnValue(update.promise)
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { wrapper } = setup()
    const { result } = renderHook(() => useCartUpdateAndOrder(), { wrapper })
    act(() => result.current.update.mutate({ itemId: 'p1__Black__S', quantity: 3 }))
    act(() => result.current.create.mutate(payload))
    await waitFor(() => expect(cartService.updateQuantity).toHaveBeenCalled())
    await act(async () => update.reject(new ApiError(500, 'Server error')))
    await waitFor(() => expect(result.current.create.isSuccess).toBe(true))
    expect(result.current.update.isError).toBe(true)
    expect(orderService.createOrder).toHaveBeenCalledTimes(1)
  })

  it('useCreateOrder stores the new order under queryKeys.orders.detail', async () => {
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const detailKey = queryKeys.orders.detail('u1', 'o1')
    expect(queryClient.getQueryData(detailKey)).toEqual(order)
    expect(queryClient.getQueryState(detailKey)?.isInvalidated).toBe(false)
  })

  it('useCreateOrder stores no order detail when the order fails', async () => {
    vi.mocked(orderService.createOrder).mockRejectedValue(new ApiError(500, 'Server error'))
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(queryClient.getQueryData(queryKeys.orders.detail('u1', 'o1'))).toBeUndefined()
  })

  it('useCreateOrder navigates with replace', async () => {
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrderWithLocation(), { wrapper })
    act(() => result.current.create.mutate(payload))
    await waitFor(() => expect(result.current.create.isSuccess).toBe(true))
    expect(result.current.navigationType).toBe('REPLACE')
  })

  it('useCreateOrder stays pending until the cart is cleared', async () => {
    const clear = deferred<void>()
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockReturnValue(clear.promise)
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(cartService.clearCart).toHaveBeenCalled())
    expect(result.current.isPending).toBe(true)
    await act(async () => clear.resolve())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.isPending).toBe(false)
  })

  it('useCreateOrder is not pending after a failed order', async () => {
    vi.mocked(orderService.createOrder).mockRejectedValue(new ApiError(500, 'Server error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useCreateOrder(), { wrapper })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.isPending).toBe(false)
  })
})
