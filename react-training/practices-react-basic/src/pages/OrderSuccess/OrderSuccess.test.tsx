import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ORDER_TEXT } from '@/constants/order'
import { queryKeys } from '@/constants/queryKeys'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useAuthStore } from '@/stores/authStore'
import OrderSuccess from './index'
import type { Order, User } from '@/types'

interface FetchAnswer {
  ok: boolean
  status: number
  statusText: string
  text: () => Promise<string>
}

interface PendingFetch {
  resolve: (answer: FetchAnswer) => void
  reject: (error: unknown) => void
}

type Answer = Order | 'not-found' | 'network'

const USER: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const ORDER: Order = {
  id: 'o1',
  userId: 'u1',
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
    address: '1 Trang Tien',
    province: 'Hanoi',
    ward: 'Hoan Kiem',
  },
  paymentMethod: 'cod',
  subtotal: 80,
  shippingFee: 0,
  total: 80,
  status: 'pending',
  createdAt: '2026-11-17T08:00:00.000Z',
}
const SETTLE_TASKS = 3
const GUEST_ID = '3f2b8c1e-9a4d-4f6b-8c2a-1d5e7f9a0b3c'
const GUEST_ORDER: Order = { ...ORDER, userId: undefined, guestId: GUEST_ID }

let pending: PendingFetch[] = []

function fetchAnswer(status: number, body?: unknown): FetchAnswer {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? 'Not Found' : 'OK',
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  }
}

async function settleQueries(): Promise<void> {
  for (let task = 0; task < SETTLE_TASKS; task += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

function answerRequest(request: PendingFetch, answer: Answer): void {
  if (answer === 'network') request.reject(new TypeError('Failed to fetch'))
  else if (answer === 'not-found') request.resolve(fetchAnswer(404))
  else request.resolve(fetchAnswer(200, answer))
}

async function answerAll(answer: Answer): Promise<void> {
  await act(async () => {
    await settleQueries()
    while (pending.length > 0) {
      const requests = pending
      pending = []
      for (const request of requests) answerRequest(request, answer)
      await settleQueries()
    }
  })
}

function renderPage(cached?: Order) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  })
  if (cached)
    queryClient.setQueryData(
      queryKeys.orders.detail({ kind: 'user', id: USER.id }, cached.id),
      cached
    )
  const router = createMemoryRouter(
    [
      { path: '/order-success/:orderId', element: <OrderSuccess /> },
      { path: '/', element: <p>Home page</p> },
    ],
    { initialEntries: ['/order-success/o1'] }
  )
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return { ...view, user: userEvent.setup() }
}

function heading(): HTMLElement {
  return screen.getByRole('heading', { level: 1, name: ORDER_TEXT.successTitle })
}

function tryAgain(): HTMLElement {
  return screen.getByRole('button', { name: UI_STATE_MESSAGES.retry })
}

function busySkeleton(container: HTMLElement): Element | null {
  return container.querySelector('[aria-busy="true"]:not(button)')
}

function actionPlaceholders(container: HTMLElement): number {
  return busySkeleton(container)?.firstElementChild?.lastElementChild?.children.length ?? 0
}

function statusText(): string {
  return screen.getByRole('status').textContent ?? ''
}

beforeEach(() => {
  useAuthStore.setState({ user: USER, token: 'mock-token-u1', isAuthenticated: true })
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise<FetchAnswer>((resolve, reject) => {
          pending.push({ resolve, reject })
        })
    )
  )
})

afterEach(() => {
  pending = []
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('OrderSuccess page', () => {
  it('shows a cached order at once without a skeleton', () => {
    const { container } = renderPage(ORDER)
    expect(heading()).toBeInTheDocument()
    expect(screen.getByText('Order ID: #ORD-o1')).toBeInTheDocument()
    expect(screen.getByText('Smart T-Shirt')).toBeInTheDocument()
    expect(busySkeleton(container)).toBeNull()
  })

  it('shows the skeleton and Loading order on a direct load, then the order', async () => {
    const { container } = renderPage()
    expect(busySkeleton(container)).toBeInTheDocument()
    expect(statusText()).toBe(ORDER_TEXT.loading)
    await answerAll(ORDER)
    expect(heading()).toBeInTheDocument()
    expect(busySkeleton(container)).toBeNull()
    expect(statusText()).toBe('')
  })

  it('shows Order not found with Back to Home for an unknown order', async () => {
    renderPage()
    await answerAll('not-found')
    expect(screen.getByText(UI_STATE_MESSAGES.orderNotFound)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: UI_STATE_MESSAGES.backToHome })).toHaveAttribute(
      'href',
      '/'
    )
    expect(screen.queryByRole('button', { name: UI_STATE_MESSAGES.retry })).toBeNull()
  })

  it("shows Order not found for another user's order", async () => {
    renderPage()
    await answerAll({ ...ORDER, userId: 'u2' })
    expect(screen.getByText(UI_STATE_MESSAGES.orderNotFound)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })

  it('shows the order and focuses the heading after a successful retry', async () => {
    const { user } = renderPage()
    await answerAll('network')
    await user.click(tryAgain())
    await answerAll(ORDER)
    expect(heading()).toHaveFocus()
  })

  it('keeps the error and focus on Try again after a failed retry', async () => {
    const { user } = renderPage()
    await answerAll('network')
    await user.click(tryAgain())
    await answerAll('network')
    expect(tryAgain()).toHaveFocus()
    expect(screen.getByRole('alert')).toHaveTextContent(UI_STATE_MESSAGES.errorDefault)
  })

  it('keeps the error mounted and busy while retrying, without the skeleton', async () => {
    const { container, user } = renderPage()
    await answerAll('network')
    await user.click(tryAgain())
    expect(tryAgain()).toHaveAttribute('aria-busy', 'true')
    expect(busySkeleton(container)).toBeNull()
    expect(statusText()).toBe('')
  })

  it('keeps the order when a background refetch fails', async () => {
    renderPage(ORDER)
    await answerAll('network')
    expect(heading()).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('links Continue Shopping to the shop and View Order to the order history', () => {
    renderPage(ORDER)
    expect(screen.getByRole('link', { name: ORDER_TEXT.continueShopping })).toHaveAttribute(
      'href',
      '/shop'
    )
    expect(screen.getByRole('link', { name: ORDER_TEXT.viewOrder })).toHaveAttribute(
      'href',
      '/account/orders'
    )
  })

  it('focuses the heading when the order is shown and focus is free', () => {
    renderPage(ORDER)
    expect(heading()).toHaveFocus()
  })

  it('does not move focus that is already on another element', () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    renderPage(ORDER)
    expect(outside).toHaveFocus()
    outside.remove()
  })
})

describe('OrderSuccess page — guest (T35)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  })

  it('S1 shows a guest order to the guest who placed it', async () => {
    localStorage.setItem('mcs_guest', GUEST_ID)
    renderPage()
    await answerAll(GUEST_ORDER)
    expect(heading()).toBeInTheDocument()
    expect(screen.getByText('Order ID: #ORD-o1')).toBeInTheDocument()
  })

  it('S2 links View Order to the guest order details page', async () => {
    localStorage.setItem('mcs_guest', GUEST_ID)
    renderPage()
    await answerAll(GUEST_ORDER)
    expect(screen.getByRole('link', { name: ORDER_TEXT.viewOrder })).toHaveAttribute(
      'href',
      '/order/o1'
    )
  })

  it('S3 shows Order not found without a request when the browser has no guest id', async () => {
    const { container } = renderPage()
    await answerAll(GUEST_ORDER)
    expect(screen.getByText(UI_STATE_MESSAGES.orderNotFound)).toBeInTheDocument()
    expect(busySkeleton(container)).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('S5 shows two action placeholders in the loading skeleton', () => {
    localStorage.setItem('mcs_guest', GUEST_ID)
    const { container } = renderPage()
    expect(actionPlaceholders(container)).toBe(2)
  })

  it('S4 links Continue Shopping to the shop for a guest', async () => {
    localStorage.setItem('mcs_guest', GUEST_ID)
    renderPage()
    await answerAll(GUEST_ORDER)
    expect(screen.getByRole('link', { name: ORDER_TEXT.continueShopping })).toHaveAttribute(
      'href',
      '/shop'
    )
  })
})
