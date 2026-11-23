import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import * as orderService from '@/services/orderService'
import * as productService from '@/services/productService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { product } from '@/test/fixtures'
import { usePlaceOrder } from './usePlaceOrder'
import type { ReactNode } from 'react'
import type { CartLine } from '@/hooks/useCartLines'
import type { CheckoutFormValues } from '@/schemas/checkout'
import type { Cart, CartItem, Order, Product, User } from '@/types'

vi.mock('@/services/cartService')
vi.mock('@/services/orderService')
vi.mock('@/services/productService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const TEE: Product = { ...product('p1'), name: 'Tee One', price: 40, stock: 5 }
const teeItem: CartItem = {
  id: 'p1__Black__S',
  productId: 'p1',
  color: 'Black',
  size: 'S',
  quantity: 2,
}
const shownLines: CartLine[] = [{ item: teeItem, product: TEE }]

const values: CheckoutFormValues = {
  fullName: 'Test Customer',
  phone: '0912345678',
  email: 'user@store.com',
  address: '1 Test Street',
  province: 'Hanoi',
  ward: 'Ba Dinh',
  note: '',
  paymentMethod: 'cod',
}

const order: Order = {
  id: 'o1',
  userId: 'u1',
  items: [],
  shippingAddress: {
    fullName: 'Test Customer',
    phone: '0912345678',
    email: 'user@store.com',
    address: '1 Test Street',
    province: 'Hanoi',
    ward: 'Ba Dinh',
  },
  paymentMethod: 'cod',
  subtotal: 80,
  shippingFee: 0,
  total: 80,
  status: 'pending',
  createdAt: '2026-11-17T09:00:00.000Z',
}

function cartOf(...items: CartItem[]): Cart {
  return { id: 'c1', userId: 'u1', items }
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((onResolve) => {
    resolve = onResolve
  })
  return { promise, resolve }
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } },
  })
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ROUTES.CHECKOUT]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
  const rendered = renderHook(() => usePlaceOrder(), { wrapper })
  return { queryClient, ...rendered }
}

function toastMessages(): string[] {
  return useToastStore.getState().toasts.map(({ message }) => message)
}

function serveFresh(cart: Cart, products: Product[]): void {
  vi.mocked(cartService.getCart).mockResolvedValue(cart)
  vi.mocked(productService.getByIds).mockResolvedValue(products)
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe('usePlaceOrder', () => {
  it('re-reads the cart and products, then places the order with the fresh snapshot', async () => {
    serveFresh(cartOf(teeItem), [{ ...TEE, name: 'Tee One Renamed' }])
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    const { result, queryClient } = setup()
    queryClient.setQueryData(queryKeys.cart({ kind: 'user', id: 'u1' }), cartOf(teeItem))
    queryClient.setQueryData(queryKeys.products.byIds(['p1']), [TEE])
    await act(() => result.current.placeOrder(values, shownLines))
    expect(cartService.getCart).toHaveBeenCalledWith({ kind: 'user', id: 'u1' })
    expect(productService.getByIds).toHaveBeenCalledWith(['p1'])
    expect(vi.mocked(cartService.getCart).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(productService.getByIds).mock.invocationCallOrder[0] ?? 0
    )
    expect(orderService.createOrder).toHaveBeenCalledWith(
      { kind: 'user', id: 'u1' },
      {
        items: [
          {
            productId: 'p1',
            name: 'Tee One Renamed',
            price: 40,
            image: '/images/products/p1.jpg',
            color: 'Black',
            size: 'S',
            quantity: 2,
          },
        ],
        shippingAddress: order.shippingAddress,
        paymentMethod: 'cod',
      }
    )
  })

  it('places no order when the fresh stock is below the quantity', async () => {
    serveFresh(cartOf(teeItem), [{ ...TEE, stock: 1 }])
    const { result } = setup()
    await act(() => result.current.placeOrder(values, shownLines))
    expect(orderService.createOrder).not.toHaveBeenCalled()
    expect(toastMessages()).toEqual([TOAST_MESSAGES.order.cartChanged])
  })

  it('places no order when the fresh price differs from the shown price', async () => {
    serveFresh(cartOf(teeItem), [{ ...TEE, price: 45 }])
    const { result } = setup()
    await act(() => result.current.placeOrder(values, shownLines))
    expect(orderService.createOrder).not.toHaveBeenCalled()
    expect(toastMessages()).toEqual([TOAST_MESSAGES.order.cartChanged])
  })

  it('places no order when a product is gone', async () => {
    serveFresh(cartOf(teeItem), [])
    const { result } = setup()
    await act(() => result.current.placeOrder(values, shownLines))
    expect(orderService.createOrder).not.toHaveBeenCalled()
    expect(toastMessages()).toEqual([TOAST_MESSAGES.order.cartChanged])
  })

  it('is placing while checking and while the order is pending, and started only while pending', async () => {
    const freshCart = deferred<Cart>()
    const created = deferred<Order>()
    vi.mocked(cartService.getCart).mockReturnValue(freshCart.promise)
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    vi.mocked(orderService.createOrder).mockReturnValue(created.promise)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { result } = setup()
    let placing: Promise<void> = Promise.resolve()
    act(() => {
      placing = result.current.placeOrder(values, shownLines)
    })
    expect(result.current).toMatchObject({ isPlacing: true, isOrderStarted: false })
    await act(async () => freshCart.resolve(cartOf(teeItem)))
    await waitFor(() => expect(result.current.isOrderStarted).toBe(true))
    expect(result.current.isPlacing).toBe(true)
    await act(async () => {
      created.resolve(order)
      await placing
    })
    expect(result.current).toMatchObject({ isPlacing: true, isOrderStarted: true })
  })

  it('shows one failure toast and releases the lock when the re-check fails', async () => {
    vi.mocked(cartService.getCart).mockRejectedValueOnce(new ApiError(0, 'Network error'))
    const { result } = setup()
    await act(() => result.current.placeOrder(values, shownLines))
    expect(orderService.createOrder).not.toHaveBeenCalled()
    expect(toastMessages()).toEqual([TOAST_MESSAGES.network.error])
    expect(result.current.isPlacing).toBe(false)
    serveFresh(cartOf(teeItem), [TEE])
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    await act(() => result.current.placeOrder(values, shownLines))
    expect(orderService.createOrder).toHaveBeenCalledTimes(1)
  })

  it('adds no toast of its own and allows a new attempt after a failed order', async () => {
    serveFresh(cartOf(teeItem), [TEE])
    vi.mocked(orderService.createOrder).mockRejectedValueOnce(new ApiError(500, 'Server error'))
    const { result } = setup()
    await act(() => result.current.placeOrder(values, shownLines))
    expect(toastMessages()).toEqual([TOAST_MESSAGES.order.failed])
    await waitFor(() => expect(result.current.isPlacing).toBe(false))
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    await act(() => result.current.placeOrder(values, shownLines))
    expect(orderService.createOrder).toHaveBeenCalledTimes(2)
  })

  it('ignores a second call while the first one runs', async () => {
    const freshCart = deferred<Cart>()
    vi.mocked(cartService.getCart).mockReturnValue(freshCart.promise)
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    vi.mocked(orderService.createOrder).mockResolvedValue(order)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { result } = setup()
    let first: Promise<void> = Promise.resolve()
    act(() => {
      first = result.current.placeOrder(values, shownLines)
    })
    await act(() => result.current.placeOrder(values, shownLines))
    await act(async () => {
      freshCart.resolve(cartOf(teeItem))
      await first
    })
    expect(cartService.getCart).toHaveBeenCalledTimes(1)
    expect(productService.getByIds).toHaveBeenCalledTimes(1)
    expect(orderService.createOrder).toHaveBeenCalledTimes(1)
  })

  it('places no order when the page unmounts during the re-check', async () => {
    const freshCart = deferred<Cart>()
    vi.mocked(cartService.getCart).mockReturnValue(freshCart.promise)
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    const { result, unmount } = setup()
    let placing: Promise<void> = Promise.resolve()
    act(() => {
      placing = result.current.placeOrder(values, shownLines)
    })
    unmount()
    freshCart.resolve(cartOf(teeItem))
    await placing
    expect(productService.getByIds).not.toHaveBeenCalled()
    expect(orderService.createOrder).not.toHaveBeenCalled()
  })

  it('places no order and reads no products when the fresh cart differs', async () => {
    const otherItem: CartItem = { ...teeItem, id: 'p2__Black__S', productId: 'p2' }
    const { result } = setup()
    vi.mocked(cartService.getCart).mockResolvedValueOnce(cartOf({ ...teeItem, quantity: 3 }))
    await act(() => result.current.placeOrder(values, shownLines))
    vi.mocked(cartService.getCart).mockResolvedValueOnce(cartOf(teeItem, otherItem))
    await act(() => result.current.placeOrder(values, shownLines))
    expect(productService.getByIds).not.toHaveBeenCalled()
    expect(orderService.createOrder).not.toHaveBeenCalled()
    expect(toastMessages()).toEqual([
      TOAST_MESSAGES.order.cartChanged,
      TOAST_MESSAGES.order.cartChanged,
    ])
  })
})
