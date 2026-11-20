import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ORDER_TEXT } from '@/constants/order'
import { queryKeys } from '@/constants/queryKeys'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useAuthStore } from '@/stores/authStore'
import GuestOrderDetails from './index'
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

type Answer = Order | 'network'

const GUEST_A = '3f2b8c1e-9a4d-4f6b-8c2a-1d5e7f9a0b3c'
const GUEST_B = '7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f'
const USER_A: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const BASE_ORDER: Order = {
  id: 'o1',
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
    fullName: 'Guest Buyer',
    phone: '0912345678',
    email: 'guest@store.com',
    address: '1 Trang Tien',
    province: 'Hanoi',
    ward: 'Hoan Kiem',
  },
  paymentMethod: 'cod',
  subtotal: 80,
  shippingFee: 0,
  total: 80,
  status: 'pending',
  createdAt: '2026-11-20T08:00:00.000Z',
}
const GUEST_A_ORDER: Order = { ...BASE_ORDER, guestId: GUEST_A }
const USER_A_ORDER: Order = { ...BASE_ORDER, userId: 'u1' }
const USER_B_ORDER: Order = { ...BASE_ORDER, userId: 'u2' }
const SETTLE_TASKS = 3

let pending: PendingFetch[] = []

function fetchAnswer(body: unknown): FetchAnswer {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    text: () => Promise.resolve(JSON.stringify(body)),
  }
}

async function settleQueries(): Promise<void> {
  for (let task = 0; task < SETTLE_TASKS; task += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

async function answerAll(answer: Answer): Promise<void> {
  await act(async () => {
    await settleQueries()
    while (pending.length > 0) {
      const requests = pending
      pending = []
      for (const request of requests) {
        if (answer === 'network') request.reject(new TypeError('Failed to fetch'))
        else request.resolve(fetchAnswer(answer))
      }
      await settleQueries()
    }
  })
}

function asGuest(guestId: string): void {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  localStorage.setItem('mcs_guest', guestId)
}

function asUserA(): void {
  useAuthStore.setState({ user: USER_A, token: 'mock-token-u1', isAuthenticated: true })
}

function renderPage(seed?: (queryClient: QueryClient) => void) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  })
  seed?.(queryClient)
  const router = createMemoryRouter(
    [
      { path: '/order/:orderId', element: <GuestOrderDetails /> },
      { path: '/', element: <p>Home page</p> },
    ],
    { initialEntries: ['/order/o1'] }
  )
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return { ...view, router, user: userEvent.setup() }
}

function heading(): HTMLElement {
  return screen.getByRole('heading', { level: 1, name: ORDER_TEXT.detailsTitle })
}

function notFound(): HTMLElement | null {
  return screen.queryByText(UI_STATE_MESSAGES.orderNotFound)
}

function tryAgain(): HTMLElement {
  return screen.getByRole('button', { name: UI_STATE_MESSAGES.retry })
}

function busySkeleton(container: HTMLElement): Element | null {
  return container.querySelector('[aria-busy="true"]:not(button)')
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
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

describe('GuestOrderDetails page', () => {
  it('G1 shows guest A their own order with the Order Details heading and order id', async () => {
    asGuest(GUEST_A)
    const { container } = renderPage()
    await answerAll(GUEST_A_ORDER)
    expect(heading()).toBeInTheDocument()
    expect(screen.getByText('Order ID: #ORD-o1')).toBeInTheDocument()
    expect(screen.getByText('Smart T-Shirt')).toBeInTheDocument()
    expect(container.querySelector('img[src="/icons/check-circle.svg"]')).toBeNull()
  })

  it("G2 shows Order not found to guest B for guest A's order", async () => {
    asGuest(GUEST_B)
    renderPage()
    await answerAll(GUEST_A_ORDER)
    expect(notFound()).toBeInTheDocument()
    expect(screen.queryByText('Smart T-Shirt')).toBeNull()
  })

  it("G3 shows Order not found to user A for guest A's order while guest A's id is stored", async () => {
    localStorage.setItem('mcs_guest', GUEST_A)
    asUserA()
    renderPage()
    await answerAll(GUEST_A_ORDER)
    expect(notFound()).toBeInTheDocument()
    expect(screen.queryByText('Smart T-Shirt')).toBeNull()
  })

  it('G4 shows user A their own order', async () => {
    asUserA()
    renderPage()
    await answerAll(USER_A_ORDER)
    expect(heading()).toBeInTheDocument()
  })

  it("G5 shows Order not found for user B's order and for a guest opening a user order", async () => {
    asUserA()
    const first = renderPage()
    await answerAll(USER_B_ORDER)
    expect(notFound()).toBeInTheDocument()
    first.unmount()
    asGuest(GUEST_A)
    renderPage()
    await answerAll(USER_A_ORDER)
    expect(notFound()).toBeInTheDocument()
    expect(screen.queryByText('Smart T-Shirt')).toBeNull()
  })

  it('G6 shows the guest order again after logout with the same guest id', async () => {
    localStorage.setItem('mcs_guest', GUEST_A)
    asUserA()
    renderPage()
    await answerAll(GUEST_A_ORDER)
    expect(notFound()).toBeInTheDocument()
    act(() => useAuthStore.setState({ user: null, token: null, isAuthenticated: false }))
    await answerAll(GUEST_A_ORDER)
    expect(heading()).toBeInTheDocument()
  })

  it('G7 never shows a cached guest order after logging in', async () => {
    asGuest(GUEST_A)
    renderPage((queryClient) =>
      queryClient.setQueryData(
        queryKeys.orders.detail({ kind: 'guest', id: GUEST_A }, 'o1'),
        GUEST_A_ORDER
      )
    )
    expect(heading()).toBeInTheDocument()
    act(() => asUserA())
    expect(screen.queryByText('Smart T-Shirt')).toBeNull()
    await answerAll(GUEST_A_ORDER)
    expect(notFound()).toBeInTheDocument()
  })

  it('G8 shows the skeleton and Loading order on a direct load, then the order', async () => {
    asGuest(GUEST_A)
    const { container } = renderPage()
    expect(busySkeleton(container)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(ORDER_TEXT.loading)
    await answerAll(GUEST_A_ORDER)
    expect(heading()).toBeInTheDocument()
    expect(busySkeleton(container)).toBeNull()
  })

  it('G12 shows one action placeholder and no icon placeholder in the loading skeleton', () => {
    asGuest(GUEST_A)
    const { container } = renderPage()
    const column = busySkeleton(container)?.firstElementChild
    expect(column?.lastElementChild?.children).toHaveLength(1)
    expect(column?.firstElementChild?.children).toHaveLength(2)
  })

  it('G9 offers only Continue Shopping and never opens the login modal', async () => {
    asGuest(GUEST_A)
    const { router } = renderPage()
    await answerAll(GUEST_A_ORDER)
    expect(screen.getByRole('link', { name: ORDER_TEXT.continueShopping })).toHaveAttribute(
      'href',
      '/shop'
    )
    expect(screen.queryByRole('link', { name: ORDER_TEXT.viewOrder })).toBeNull()
    expect(router.state.location.pathname).toBe('/order/o1')
    expect(new URLSearchParams(router.state.location.search).has('auth')).toBe(false)
  })

  it('G10 focuses the heading when focus is free and leaves focus that is elsewhere', async () => {
    asGuest(GUEST_A)
    const first = renderPage()
    await answerAll(GUEST_A_ORDER)
    expect(heading()).toHaveFocus()
    first.unmount()
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    renderPage()
    await answerAll(GUEST_A_ORDER)
    expect(outside).toHaveFocus()
    outside.remove()
  })

  it('G11 keeps the error mounted and busy while retrying, then shows the order', async () => {
    asGuest(GUEST_A)
    const { container, user } = renderPage()
    await answerAll('network')
    await user.click(tryAgain())
    expect(tryAgain()).toHaveAttribute('aria-busy', 'true')
    expect(busySkeleton(container)).toBeNull()
    await answerAll(GUEST_A_ORDER)
    expect(heading()).toBeInTheDocument()
  })
})
