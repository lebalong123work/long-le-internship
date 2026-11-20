import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { product } from '@/test/fixtures'
import Cart from './index'
import type { Cart as CartRecord, CartItem, Product, User } from '@/types'

interface Gate {
  promise: Promise<void>
  open: () => void
}

interface FakeServer {
  cart: CartRecord
  products: Product[]
  cartFailures: number
  productFailures: number
  failWrites: boolean
  gate: Gate | null
  patches: CartItem[][]
}

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }

const TEE: Product = { ...product('p1'), name: 'Tee One', price: 40, stock: 5 }
const POLO: Product = { ...product('p2'), name: 'Polo Two', price: 25, stock: 10 }

const teeLine: CartItem = {
  id: 'p1__Black__S',
  productId: 'p1',
  color: 'Black',
  size: 'S',
  quantity: 2,
}
const poloLine: CartItem = {
  id: 'p2__Blue__M',
  productId: 'p2',
  color: 'Blue',
  size: 'M',
  quantity: 1,
}
const goneLine: CartItem = {
  id: 'p9__Green__L',
  productId: 'p9',
  color: 'Green',
  size: 'L',
  quantity: 4,
}

const REMOVE_TEE = 'Remove Tee One, Black, S from cart'
const REMOVE_GONE = 'Remove unavailable product, Green, L from cart'
const TEE_QUANTITY = 'Quantity of Tee One, Black, S'

let server: FakeServer

function createGate(): Gate {
  let open: () => void = () => undefined
  const promise = new Promise<void>((resolve) => {
    open = resolve
  })
  return { promise, open }
}

function answer(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status >= 500 ? 'Internal Server Error' : 'OK',
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  }
}

function readCart() {
  if (server.cartFailures > 0) {
    server.cartFailures -= 1
    return answer(500)
  }
  return answer(200, [server.cart])
}

function readProducts(url: URL) {
  if (server.productFailures > 0) {
    server.productFailures -= 1
    return answer(500)
  }
  const ids = (url.searchParams.get('id:in') ?? '').split(',')
  return answer(
    200,
    server.products.filter((item) => ids.includes(item.id))
  )
}

function writeCart(init: RequestInit) {
  if (server.failWrites) return answer(500)
  const { items } = JSON.parse(String(init.body)) as { items: CartItem[] }
  server.patches.push(items)
  server.cart = { ...server.cart, items }
  return answer(200, server.cart)
}

async function handleRequest(input: string, init: RequestInit = {}) {
  const url = new URL(input)
  if (init.method === 'PATCH') return writeCart(init)
  if (server.gate) await server.gate.promise
  return url.pathname === '/products' ? readProducts(url) : readCart()
}

function startServer(items: CartItem[], overrides: Partial<FakeServer> = {}): void {
  server = {
    cart: { id: 'c1', userId: 'u1', items },
    products: [TEE, POLO],
    cartFailures: 0,
    productFailures: 0,
    failWrites: false,
    gate: null,
    patches: [],
    ...overrides,
  }
}

function renderCart() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function toasts() {
  return useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))
}

function cartHeading(): HTMLElement {
  return screen.getByRole('heading', { level: 2, name: 'Cart Product' })
}

function removeButtons(): HTMLElement[] {
  return screen.queryAllByRole('button', { name: /^Remove / })
}

async function openGate(): Promise<void> {
  await act(async () => {
    server.gate?.open()
    server.gate = null
    await Promise.resolve()
  })
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
  useToastStore.setState({ toasts: [] })
  vi.stubGlobal('fetch', vi.fn(handleRequest))
})

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('Cart page', () => {
  it('shows the banner and the Cart Product heading while loading', () => {
    startServer([teeLine], { gate: createGate() })
    renderCart()
    expect(screen.getByRole('heading', { level: 1, name: 'Cart' })).toBeInTheDocument()
    expect(cartHeading()).toBeInTheDocument()
  })

  it('shows a busy skeleton with a status text only while loading', async () => {
    startServer([teeLine], { gate: createGate() })
    renderCart()
    const container = document.body
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Loading cart')
    await openGate()
    await screen.findByRole('group', { name: TEE_QUANTITY })
    expect(container.querySelector('[aria-busy="true"]')).toBeNull()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('shows one row per cart line and the order summary', async () => {
    startServer([teeLine, poloLine])
    renderCart()
    await screen.findByRole('link', { name: 'Tee One' })
    expect(screen.getByRole('link', { name: 'Polo Two' })).toBeInTheDocument()
    expect(removeButtons()).toHaveLength(2)
    const summary = screen.getByRole('region', { name: 'Order summary' })
    expect(within(summary).getByText('3 Products')).toBeInTheDocument()
    expect(within(summary).getByText('$105 USD')).toBeInTheDocument()
  })

  it('shows the error state when the cart fails and reloads on Try again', async () => {
    startServer([teeLine], { cartFailures: 1 })
    renderCart()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    server.gate = createGate()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    const homeLink = screen.getByRole('link', { name: 'Home' })
    act(() => homeLink.focus())
    await openGate()
    expect(await screen.findByRole('link', { name: 'Tee One' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(homeLink).toHaveFocus()
  })

  it('keeps the error state mounted while retrying and leaves focus on Try again after a failure', async () => {
    startServer([teeLine], { cartFailures: 2 })
    renderCart()
    await screen.findByRole('alert')
    server.gate = createGate()
    const tryAgain = screen.getByRole('button', { name: 'Try again' })
    await userEvent.click(tryAgain)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(tryAgain).toHaveAttribute('aria-busy', 'true')
    expect(document.querySelector('[aria-busy="true"]')).toBe(tryAgain)
    await openGate()
    await waitFor(() => expect(tryAgain).not.toHaveAttribute('aria-busy'))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(tryAgain).toHaveFocus()
  })

  it('shows the error state instead of a half page when the products fail', async () => {
    startServer([teeLine], { productFailures: 1 })
    renderCart()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(removeButtons()).toHaveLength(0)
    expect(screen.queryByRole('region', { name: 'Order summary' })).toBeNull()
  })

  it('updates the row and the summary at once and saves the clamped quantity', async () => {
    startServer([{ ...teeLine, quantity: 9 }])
    renderCart()
    const stepper = await screen.findByRole('group', { name: TEE_QUANTITY })
    await userEvent.click(within(stepper).getByRole('button', { name: 'Decrease quantity' }))
    await waitFor(() => expect(within(stepper).getByText('5')).toBeInTheDocument())
    expect(screen.getByText('5 Products')).toBeInTheDocument()
    expect(screen.getByText('$200 USD')).toBeInTheDocument()
    await waitFor(() => expect(server.patches).toHaveLength(1))
    expect(server.patches[0]).toEqual([{ ...teeLine, quantity: 5 }])
  })

  it('removes the row with a toast and moves focus to the heading', async () => {
    startServer([teeLine, poloLine])
    renderCart()
    await userEvent.click(await screen.findByRole('button', { name: REMOVE_TEE }))
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Tee One' })).toBeNull())
    expect(cartHeading()).toHaveFocus()
    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'info', message: TOAST_MESSAGES.cart.removed }])
    )
    expect(server.patches[0]).toEqual([poloLine])
    expect(screen.getByRole('link', { name: 'Polo Two' })).toBeInTheDocument()
  })

  it('shows the empty state with Shop Now and no summary for an empty cart', async () => {
    startServer([])
    renderCart()
    expect(await screen.findByText(UI_STATE_MESSAGES.emptyCart)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Shop Now' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('region', { name: 'Order summary' })).toBeNull()
    expect(cartHeading()).toBeInTheDocument()
  })

  it('shows the empty state after the last line is removed', async () => {
    startServer([teeLine])
    renderCart()
    await userEvent.click(await screen.findByRole('button', { name: REMOVE_TEE }))
    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument()
    expect(removeButtons()).toHaveLength(0)
  })

  it('restores the old quantity and shows an error toast when the change fails', async () => {
    startServer([teeLine], { failWrites: true })
    renderCart()
    const stepper = await screen.findByRole('group', { name: TEE_QUANTITY })
    await userEvent.click(within(stepper).getByRole('button', { name: 'Increase quantity' }))
    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
    )
    await waitFor(() => expect(within(stepper).getByText('2')).toBeInTheDocument())
    expect(screen.getByText('2 Products')).toBeInTheDocument()
  })

  it('keeps an unavailable line visible, counts it and blocks Checkout with a message', async () => {
    startServer([teeLine, goneLine])
    renderCart()
    expect(await screen.findByText('Product unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: REMOVE_GONE })).toBeInTheDocument()
    expect(screen.getByText('6 Products')).toBeInTheDocument()
    expect(screen.getByText('$80 USD')).toBeInTheDocument()
    const checkout = screen.getByRole('button', { name: 'Checkout' })
    expect(checkout).toBeDisabled()
    expect(checkout).toHaveAccessibleDescription(
      'Remove unavailable products to continue to checkout.'
    )
    expect(screen.queryByRole('link', { name: 'Checkout' })).toBeNull()
  })

  it('brings the Checkout link back after the unavailable line is removed', async () => {
    startServer([teeLine, goneLine])
    renderCart()
    await userEvent.click(await screen.findByRole('button', { name: REMOVE_GONE }))
    await waitFor(() => expect(screen.queryByText('Product unavailable')).toBeNull())
    expect(screen.getByRole('link', { name: 'Checkout' })).toHaveAttribute('href', '/checkout')
    expect(screen.queryByRole('button', { name: 'Checkout' })).toBeNull()
    expect(screen.getByText('2 Products')).toBeInTheDocument()
  })

  it('moves focus to the heading after a successful retry when focus fell to the body', async () => {
    startServer([teeLine], { productFailures: 1 })
    renderCart()
    await screen.findByRole('alert')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('link', { name: 'Tee One' })).toBeInTheDocument()
    await waitFor(() => expect(cartHeading()).toHaveFocus())
  })
})

describe('Cart page — guest (T35 row 3)', () => {
  const GUEST_ID = '3f2b8c1e-9a4d-4f6b-8c2a-1d5e7f9a0b3c'

  function startGuestServer(pending: boolean): void {
    startServer([teeLine])
    server.cart = {
      id: 'g1',
      guestId: GUEST_ID,
      items: [teeLine],
      pendingMerge: pending ? { id: 'm1', userId: 'u9', items: [teeLine] } : null,
    }
  }

  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.setItem('mcs_guest', GUEST_ID)
  })

  it('C1 shows the recovery notice under the heading and disables the controls while a merge is pending', async () => {
    startGuestServer(true)
    renderCart()
    const notice = await screen.findByText(TOAST_MESSAGES.cart.mergePending)
    expect(cartHeading().nextElementSibling).toBe(notice)
    const quantity = within(await screen.findByRole('group', { name: TEE_QUANTITY }))
    quantity.getAllByRole('button').forEach((button) => expect(button).toBeDisabled())
    expect(screen.getByRole('button', { name: REMOVE_TEE })).toBeDisabled()
  })

  it('C2 shows no notice and enabled controls without a pending merge', async () => {
    startGuestServer(false)
    renderCart()
    expect(await screen.findByRole('button', { name: REMOVE_TEE })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeEnabled()
    expect(screen.queryByText(TOAST_MESSAGES.cart.mergePending)).toBeNull()
  })

  it('C3 shows the empty state with no request for a guest without a guest id', async () => {
    localStorage.clear()
    startServer([teeLine])
    renderCart()
    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })
})
