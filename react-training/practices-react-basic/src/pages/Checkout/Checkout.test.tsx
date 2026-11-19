import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { ApiError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import * as orderService from '@/services/orderService'
import * as productService from '@/services/productService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { product } from '@/test/fixtures'
import Checkout from './index'
import type { Cart, CartItem, Order, Product, User } from '@/types'

vi.mock('@/services/cartService')
vi.mock('@/services/orderService')
vi.mock('@/services/productService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const SERVER_ERROR = new ApiError(500, 'Server error')
const TEE: Product = { ...product('p1'), name: 'Tee One', price: 40, stock: 5 }

const teeLine: CartItem = {
  id: 'p1__Black__S',
  productId: 'p1',
  color: 'Black',
  size: 'S',
  quantity: 2,
}
const goneLine: CartItem = {
  id: 'p9__Black__S',
  productId: 'p9',
  color: 'Black',
  size: 'S',
  quantity: 1,
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

const order: Order = {
  id: 'o1',
  userId: 'u1',
  items: [],
  shippingAddress: {
    fullName: 'Test Customer',
    phone: '0901234567',
    email: 'user@store.com',
    address: '1 Le Loi',
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

async function fillValidForm(): Promise<void> {
  await userEvent.type(await screen.findByLabelText('Phone number'), '0901234567')
  await userEvent.type(screen.getByLabelText('Address'), '1 Le Loi')
  await userEvent.selectOptions(screen.getByLabelText('Province / City'), 'Hanoi')
  await userEvent.selectOptions(screen.getByLabelText('Ward / Commune'), 'Ba Dinh')
  await userEvent.click(screen.getByRole('radio', { name: 'Cash on delivery (COD)' }))
}

function fieldsets(): HTMLElement[] {
  return [
    screen.getByRole('group', { name: 'Shipping address' }),
    screen.getByRole('group', { name: 'Payment method' }),
  ]
}

function placeOrderButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Place Order' })
}

function toastMessages(): string[] {
  return useToastStore.getState().toasts.map(({ message }) => message)
}

function renderCheckout() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<p>Cart page</p>} />
          <Route path="/order-success/:orderId" element={<p>Order success page</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { queryClient }
}

function pageHeading(): HTMLElement {
  return screen.getByRole('heading', { level: 1, name: 'Checkout' })
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe('Checkout page', () => {
  it('shows the banner, a busy skeleton and a loading status while loading', () => {
    vi.mocked(cartService.getCart).mockReturnValue(deferred<Cart>().promise)
    renderCheckout()
    expect(pageHeading()).toBeInTheDocument()
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Loading checkout')
  })

  it('keeps the error state while retrying a failed first load, without a skeleton', async () => {
    const retryRequest = deferred<Cart>()
    vi.mocked(cartService.getCart)
      .mockRejectedValueOnce(SERVER_ERROR)
      .mockReturnValueOnce(retryRequest.promise)
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    renderCheckout()
    await screen.findByRole('alert')
    const tryAgain = screen.getByRole('button', { name: 'Try again' })
    await userEvent.click(tryAgain)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(tryAgain).toHaveAttribute('aria-busy', 'true')
    expect(document.querySelector('[aria-busy="true"]')).toBe(tryAgain)
    await act(async () => retryRequest.resolve(cartOf(teeLine)))
    expect(await screen.findByRole('group', { name: 'Shipping address' })).toBeInTheDocument()
  })

  it('moves focus to the page heading after a retry only when focus fell to the body', async () => {
    vi.mocked(cartService.getCart)
      .mockRejectedValueOnce(SERVER_ERROR)
      .mockResolvedValue(cartOf(teeLine))
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    renderCheckout()
    await screen.findByRole('alert')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await screen.findByRole('group', { name: 'Shipping address' })
    await waitFor(() => expect(pageHeading()).toHaveFocus())
  })

  it('leaves focus where it is after a retry when it is not on the body', async () => {
    const retryRequest = deferred<Cart>()
    vi.mocked(cartService.getCart)
      .mockRejectedValueOnce(SERVER_ERROR)
      .mockReturnValueOnce(retryRequest.promise)
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    renderCheckout()
    await screen.findByRole('alert')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    const homeLink = screen.getByRole('link', { name: 'Home' })
    act(() => homeLink.focus())
    await act(async () => retryRequest.resolve(cartOf(teeLine)))
    await screen.findByRole('group', { name: 'Shipping address' })
    expect(homeLink).toHaveFocus()
  })

  it('sends an empty cart back to the cart page', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf())
    renderCheckout()
    expect(await screen.findByText('Cart page')).toBeInTheDocument()
  })

  it('sends a cart with an unavailable line back to the cart page', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(teeLine, goneLine))
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    renderCheckout()
    expect(await screen.findByText('Cart page')).toBeInTheDocument()
  })

  it('blocks Place Order when a quantity is above the current stock', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf({ ...teeLine, quantity: 6 }))
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    renderCheckout()
    expect(await screen.findByText('Only 5 left')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Place Order' })).toBeDisabled()
  })

  it('keeps the form and typed values when a background refetch fails', async () => {
    vi.mocked(cartService.getCart).mockResolvedValueOnce(cartOf(teeLine))
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    const { queryClient } = renderCheckout()
    const phone = await screen.findByLabelText('Phone number')
    expect(screen.getByLabelText('Full name')).toHaveValue('Test Customer')
    await userEvent.type(phone, '0901234567')
    vi.mocked(cartService.getCart).mockRejectedValue(SERVER_ERROR)
    await act(() =>
      queryClient.refetchQueries({ queryKey: queryKeys.cart({ kind: 'user', id: 'u1' }) })
    )
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByLabelText('Phone number')).toHaveValue('0901234567')
  })

  it('places the order, clears the cart and opens the success page', async () => {
    const created = deferred<Order>()
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(teeLine))
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    vi.mocked(orderService.createOrder).mockReturnValue(created.promise)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    renderCheckout()
    await fillValidForm()
    await userEvent.click(placeOrderButton())
    await waitFor(() => expect(orderService.createOrder).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('status')).toHaveTextContent('Placing your order')
    expect(placeOrderButton()).toHaveAttribute('aria-busy', 'true')
    await act(async () => created.resolve(order))
    expect(await screen.findByText('Order success page')).toBeInTheDocument()
    expect(cartService.clearCart).toHaveBeenCalledWith({ kind: 'user', id: 'u1' })
  })

  it('stays on checkout when the cart empties while the order is pending', async () => {
    const created = deferred<Order>()
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(teeLine))
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    vi.mocked(orderService.createOrder).mockReturnValue(created.promise)
    vi.mocked(cartService.clearCart).mockResolvedValue()
    const { queryClient } = renderCheckout()
    await fillValidForm()
    await userEvent.click(placeOrderButton())
    await waitFor(() => expect(orderService.createOrder).toHaveBeenCalledTimes(1))
    act(() => queryClient.setQueryData(queryKeys.cart({ kind: 'user', id: 'u1' }), cartOf()))
    await waitFor(() => expect(screen.queryByText('Tee One')).toBeNull())
    expect(screen.queryByText('Cart page')).toBeNull()
    expect(pageHeading()).toBeInTheDocument()
    await act(async () => created.resolve(order))
    expect(await screen.findByText('Order success page')).toBeInTheDocument()
  })

  it('shows the fresh stock and places no order when the stock changed before submit', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(teeLine))
    vi.mocked(productService.getByIds)
      .mockResolvedValueOnce([TEE])
      .mockResolvedValue([{ ...TEE, stock: 1 }])
    renderCheckout()
    await fillValidForm()
    await userEvent.click(placeOrderButton())
    expect(await screen.findByText('Only 1 left')).toBeInTheDocument()
    expect(placeOrderButton()).toBeDisabled()
    expect(orderService.createOrder).not.toHaveBeenCalled()
    expect(toastMessages()).toEqual(['Your cart has changed. Please review your order.'])
  })

  it('disables both sections while placing and keeps the values after a failed order', async () => {
    const created = deferred<Order>()
    vi.mocked(cartService.getCart).mockResolvedValue(cartOf(teeLine))
    vi.mocked(productService.getByIds).mockResolvedValue([TEE])
    vi.mocked(orderService.createOrder).mockReturnValue(created.promise)
    renderCheckout()
    await fillValidForm()
    await userEvent.click(placeOrderButton())
    await waitFor(() => expect(orderService.createOrder).toHaveBeenCalledTimes(1))
    fieldsets().forEach((fieldset) => expect(fieldset).toBeDisabled())
    await act(async () => created.reject(SERVER_ERROR))
    await waitFor(() => expect(placeOrderButton()).toBeEnabled())
    fieldsets().forEach((fieldset) => expect(fieldset).toBeEnabled())
    expect(screen.getByLabelText('Phone number')).toHaveValue('0901234567')
    expect(screen.getByLabelText('Ward / Commune')).toHaveValue('Ba Dinh')
    expect(screen.getByRole('radio', { name: 'Cash on delivery (COD)' })).toBeChecked()
    expect(toastMessages()).toEqual(['Order failed, please try again'])
    expect(cartService.clearCart).not.toHaveBeenCalled()
  })
})
