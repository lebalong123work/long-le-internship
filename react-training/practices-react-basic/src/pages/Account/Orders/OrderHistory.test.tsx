import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ORDER_HISTORY_TEXT, ORDER_TEXT } from '@/constants/order'
import { ORDER_STATUS_LABELS, ORDER_TIMELINE_STEPS } from '@/constants/orderStatus'
import { PAGINATION_TEXT } from '@/constants/pagination'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { ApiError } from '@/services/apiClient'
import * as orderService from '@/services/orderService'
import { useAuthStore } from '@/stores/authStore'
import OrderHistory from './index'
import type { OrderStatus } from '@/constants/orderStatus'
import type { Order, OrderItem, PaginatedList, User } from '@/types'

vi.mock('@/services/orderService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const SERVER_ERROR = new ApiError(500, 'Server error')
const HOME_TEXT = 'Home page'

const ITEM: OrderItem = {
  productId: 'p1',
  name: 'Smart T-Shirt',
  price: 40,
  image: '/images/products/p1.jpg',
  color: 'Black',
  size: 'S',
  quantity: 2,
}

function makeOrder(id: string, changes: Partial<Order> = {}): Order {
  return {
    id,
    userId: 'u1',
    items: [ITEM],
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
    createdAt: new Date(2026, 10, 17, 12).toISOString(),
    ...changes,
  }
}

function listOf(orders: Order[], page = 1, totalPages = 1): PaginatedList<Order> {
  return { data: orders, total: orders.length, page, perPage: 10, totalPages }
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function renderPage(path: string = ROUTES.ACCOUNT.ORDERS) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: ROUTES.ACCOUNT.ORDERS, element: <OrderHistory /> },
      { path: ROUTES.HOME, element: <p>{HOME_TEXT}</p> },
    ],
    { initialEntries: [path] }
  )
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return router
}

function heading(): HTMLElement {
  return screen.getByRole('heading', { level: 1, name: ORDER_HISTORY_TEXT.heading })
}

function cardTitles(): string[] {
  return screen.getAllByRole('heading', { level: 2 }).map((title) => title.textContent ?? '')
}

function card(orderId: string) {
  return within(screen.getByRole('article', { name: ORDER_TEXT.orderNumber(orderId) }))
}

function serve(...lists: PaginatedList<Order>[]): void {
  const mock = vi.mocked(orderService.getOrdersByUser)
  for (const list of lists) mock.mockResolvedValueOnce(list)
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.resetAllMocks()
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
})

describe('Order History — states', () => {
  it('P1 shows the heading, a busy skeleton and the loading status while loading', () => {
    vi.mocked(orderService.getOrdersByUser).mockReturnValue(
      new Promise<PaginatedList<Order>>(() => {})
    )
    renderPage()
    expect(heading()).toBeInTheDocument()
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(ORDER_HISTORY_TEXT.loading)
  })

  it('P1 shows the orders in the server order and clears the loading status', async () => {
    serve(listOf([makeOrder('o2'), makeOrder('o1')]))
    renderPage()
    await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o2') })
    expect(cardTitles()).toEqual([ORDER_TEXT.orderNumber('o2'), ORDER_TEXT.orderNumber('o1')])
    expect(screen.getByRole('status')).toHaveTextContent('')
    expect(orderService.getOrdersByUser).toHaveBeenCalledWith('u1', 1)
  })

  it('P3 shows the empty message with the dark bag icon and Shop Now to Home', async () => {
    serve(listOf([]))
    renderPage()
    expect(await screen.findByText(UI_STATE_MESSAGES.emptyOrders)).toBeInTheDocument()
    expect(document.querySelector('img[src="/icons/bag-dark.svg"]')).toHaveAttribute('alt', '')
    expect(screen.getByRole('link', { name: ORDER_HISTORY_TEXT.shopNow })).toHaveAttribute(
      'href',
      ROUTES.HOME
    )
  })

  it('P3 shows no empty message when there are orders', async () => {
    serve(listOf([makeOrder('o1')]))
    renderPage()
    await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o1') })
    expect(screen.queryByText(UI_STATE_MESSAGES.emptyOrders)).not.toBeInTheDocument()
  })

  it('P4 shows the error, retries and shows the list with focus on the heading', async () => {
    vi.mocked(orderService.getOrdersByUser).mockRejectedValueOnce(SERVER_ERROR)
    serve(listOf([makeOrder('o1')]))
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: UI_STATE_MESSAGES.retry }))
    await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o1') })
    expect(heading()).toHaveFocus()
  })

  it('P4 shows the error for a next page that fails and hides the pagination', async () => {
    serve(listOf([makeOrder('o1')], 1, 2))
    vi.mocked(orderService.getOrdersByUser).mockRejectedValueOnce(SERVER_ERROR)
    renderPage()
    await userEvent.click(await screen.findByRole('link', { name: PAGINATION_TEXT.next }))
    expect(await screen.findByRole('button', { name: UI_STATE_MESSAGES.retry })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})

describe('Order History — card', () => {
  it('P2 shows the order number, date, total, item count and status', async () => {
    serve(listOf([makeOrder('MHY_ZdStguw', { total: 120 })]))
    renderPage()
    const view = await screen.findByRole('article', {
      name: ORDER_TEXT.orderNumber('MHY_ZdStguw'),
    })
    const scope = within(view)
    expect(scope.getByText('17/11/2026')).toBeInTheDocument()
    expect(scope.getByText('$120 USD')).toBeInTheDocument()
    expect(scope.getByText('2 items')).toBeInTheDocument()
    expect(scope.getByText(ORDER_STATUS_LABELS.pending)).toBeInTheDocument()
  })

  it('P2 counts the quantities of every line, with 1 item in the singular', async () => {
    serve(
      listOf([
        makeOrder('o1', { items: [{ ...ITEM, quantity: 1 }] }),
        makeOrder('o2', { items: [ITEM, { ...ITEM, size: 'M', quantity: 3 }] }),
      ])
    )
    renderPage()
    await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o1') })
    expect(card('o1').getByText('1 item')).toBeInTheDocument()
    expect(card('o2').getByText('5 items')).toBeInTheDocument()
  })

  it('P12 shows the date in a time element with the stored value', async () => {
    const order = makeOrder('o1')
    serve(listOf([order]))
    renderPage()
    const date = await screen.findByText('17/11/2026')
    expect(date.tagName).toBe('TIME')
    expect(date).toHaveAttribute('dateTime', order.createdAt)
  })

  it('P12 shows no date element for an invalid date', async () => {
    serve(listOf([makeOrder('o1', { createdAt: 'not a date' })]))
    renderPage()
    const view = await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o1') })
    expect(view.querySelector('time')).toBeNull()
  })
})

describe('Order History — detail', () => {
  it('P5 keeps the detail closed until View Detail is pressed', async () => {
    serve(listOf([makeOrder('o1')]))
    renderPage()
    const toggle = await screen.findByRole('button', { name: ORDER_HISTORY_TEXT.viewDetail })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('P5 opens and closes the detail with level 3 headings', async () => {
    serve(listOf([makeOrder('o1')]))
    renderPage()
    await userEvent.click(
      await screen.findByRole('button', { name: ORDER_HISTORY_TEXT.viewDetail })
    )
    const toggle = screen.getByRole('button', { name: ORDER_HISTORY_TEXT.hideDetail })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '')
    expect(panel).not.toBeNull()
    expect(
      screen.getByRole('heading', { level: 3, name: ORDER_TEXT.productsHeading })
    ).toBeInTheDocument()
    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: ORDER_HISTORY_TEXT.viewDetail })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('P6 opens each card on its own', async () => {
    serve(listOf([makeOrder('o1'), makeOrder('o2')]))
    renderPage()
    await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o1') })
    await userEvent.click(card('o2').getByRole('button', { name: ORDER_HISTORY_TEXT.viewDetail }))
    expect(card('o1').getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    expect(card('o2').getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(card('o1').getByRole('button', { name: ORDER_HISTORY_TEXT.viewDetail }))
    expect(card('o1').getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(card('o2').getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it.each<[OrderStatus, string]>([
    ['pending', 'Ordered'],
    ['processing', 'Processing'],
    ['shipped', 'Shipped'],
    ['delivered', 'Delivered'],
  ])('P10 marks the current timeline step for %s', async (status, currentLabel) => {
    serve(listOf([makeOrder('o1', { status })]))
    renderPage()
    await userEvent.click(
      await screen.findByRole('button', { name: ORDER_HISTORY_TEXT.viewDetail })
    )
    const steps = within(
      screen.getByRole('list', { name: ORDER_HISTORY_TEXT.timelineLabel })
    ).getAllByRole('listitem')
    expect(steps.map((step) => step.textContent)).toEqual(
      ORDER_TIMELINE_STEPS.map((step) => step.label)
    )
    const current = steps.filter((step) => step.getAttribute('aria-current') === 'step')
    expect(current.map((step) => step.textContent)).toEqual([currentLabel])
  })

  it('P10 marks the reached steps as done', async () => {
    serve(listOf([makeOrder('o1', { status: 'processing' })]))
    renderPage()
    await userEvent.click(
      await screen.findByRole('button', { name: ORDER_HISTORY_TEXT.viewDetail })
    )
    const steps = within(
      screen.getByRole('list', { name: ORDER_HISTORY_TEXT.timelineLabel })
    ).getAllByRole('listitem')
    expect(steps.map((step) => step.classList.contains('text-dark'))).toEqual([
      true,
      true,
      false,
      false,
    ])
  })

  it('P10 shows no timeline for a cancelled order', async () => {
    serve(listOf([makeOrder('o1', { status: 'cancelled' })]))
    renderPage()
    await userEvent.click(
      await screen.findByRole('button', { name: ORDER_HISTORY_TEXT.viewDetail })
    )
    expect(
      screen.queryByRole('list', { name: ORDER_HISTORY_TEXT.timelineLabel })
    ).not.toBeInTheDocument()
    expect(screen.getByText(ORDER_STATUS_LABELS.cancelled)).toBeInTheDocument()
  })

  it('P10 shows no timeline for an unknown status', async () => {
    const unknownStatusOrder: Order = JSON.parse(
      JSON.stringify({ ...makeOrder('o1'), status: 'returned' })
    )
    serve(listOf([unknownStatusOrder]))
    renderPage()
    await userEvent.click(
      await screen.findByRole('button', { name: ORDER_HISTORY_TEXT.viewDetail })
    )
    expect(
      screen.queryByRole('list', { name: ORDER_HISTORY_TEXT.timelineLabel })
    ).not.toBeInTheDocument()
    expect(screen.getByText('returned')).toBeInTheDocument()
  })
})

describe('Order History — pages', () => {
  it('P7 requests the page from the URL', async () => {
    serve(listOf([makeOrder('o11')], 2, 2))
    renderPage(`${ROUTES.ACCOUNT.ORDERS}?page=2`)
    await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o11') })
    expect(orderService.getOrdersByUser).toHaveBeenCalledWith('u1', 2)
    expect(screen.getByText(PAGINATION_TEXT.pageOf(2, 2))).toBeInTheDocument()
  })

  it('P7 keeps the previous list busy while the next page loads', async () => {
    const nextPage = deferred<PaginatedList<Order>>()
    serve(listOf([makeOrder('o1')], 1, 2))
    vi.mocked(orderService.getOrdersByUser).mockReturnValueOnce(nextPage.promise)
    renderPage()
    await userEvent.click(await screen.findByRole('link', { name: PAGINATION_TEXT.next }))
    const list = screen.getByRole('article', { name: ORDER_TEXT.orderNumber('o1') }).closest('ul')
    expect(list).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('')
    nextPage.resolve(listOf([makeOrder('o11')], 2, 2))
    await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o11') })
    expect(screen.getByRole('article').closest('ul')).not.toHaveAttribute('aria-busy')
  })

  it('P8 requests page 1 for an invalid page parameter', async () => {
    serve(listOf([makeOrder('o1')]))
    renderPage(`${ROUTES.ACCOUNT.ORDERS}?page=x`)
    await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o1') })
    expect(orderService.getOrdersByUser).toHaveBeenCalledWith('u1', 1)
  })

  it('P9 replaces only the page parameter with the page the server returned', async () => {
    serve(listOf([makeOrder('o11')], 2, 2))
    const router = renderPage(`${ROUTES.ACCOUNT.ORDERS}?ref=a&page=9`)
    await waitFor(() => expect(router.state.location.search).toBe('?ref=a&page=2'))
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('P9 removes the page parameter when the server returns page 1', async () => {
    serve(listOf([makeOrder('o1')], 1, 1))
    const router = renderPage(`${ROUTES.ACCOUNT.ORDERS}?page=4&ref=a`)
    await waitFor(() => expect(router.state.location.search).toBe('?ref=a'))
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('P11 focuses the heading after the next page shows', async () => {
    serve(listOf([makeOrder('o1')], 1, 2), listOf([makeOrder('o11')], 2, 2))
    renderPage()
    await userEvent.click(await screen.findByRole('link', { name: PAGINATION_TEXT.next }))
    await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o11') })
    await waitFor(() => expect(heading()).toHaveFocus())
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 })
  })

  it('P11 leaves focus alone on the first load', async () => {
    serve(listOf([makeOrder('o1')], 1, 2))
    renderPage()
    await screen.findByRole('article', { name: ORDER_TEXT.orderNumber('o1') })
    expect(heading()).not.toHaveFocus()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})
