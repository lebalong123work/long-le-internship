import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ORDER_LOOKUP_TEXT } from '@/constants/order'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { ApiError } from '@/services/apiClient'
import * as orderService from '@/services/orderService'
import { VALIDATION_MESSAGES } from '@/schemas/common'
import { useAuthStore } from '@/stores/authStore'
import OrderLookup from './index'
import type { Order } from '@/types'

vi.mock('@/services/orderService', async (importOriginal) => {
  const actual = await importOriginal<typeof orderService>()
  return { ...actual, findGuestOrder: vi.fn() }
})

const EMAIL = 'guest@store.com'

function guestOrder(id: string, productName = 'Smart T-Shirt'): Order {
  return {
    id,
    guestId: '3f2b8c1e-9a4d-4f6b-8c2a-1d5e7f9a0b3c',
    items: [
      {
        productId: 'p1',
        name: productName,
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
      email: EMAIL,
      address: '1 Trang Tien',
      province: 'Hanoi',
      ward: 'Hoan Kiem',
    },
    paymentMethod: 'cod',
    subtotal: 80,
    shippingFee: 0,
    total: 80,
    status: 'processing',
    createdAt: '2026-11-20T08:00:00.000Z',
  }
}

const NOT_FOUND = new ApiError(404, orderService.ORDER_ERRORS.notFound)

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function renderLookup(state?: unknown) {
  const router = createMemoryRouter([{ path: '/order-lookup', element: <OrderLookup /> }], {
    initialEntries: [{ pathname: '/order-lookup', state }],
  })
  const view = render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return { ...view, router, user: userEvent.setup() }
}

function emailField(): HTMLElement {
  return screen.getByLabelText(ORDER_LOOKUP_TEXT.emailLabel)
}

function orderNumberField(): HTMLElement {
  return screen.getByLabelText(ORDER_LOOKUP_TEXT.orderNumberLabel)
}

function findButton(): HTMLElement {
  return screen.getByRole('button', { name: ORDER_LOOKUP_TEXT.submit })
}

function resultHeading(id: string): HTMLElement | null {
  return screen.queryByRole('heading', { level: 2, name: `Order ID: #ORD-${id}` })
}

async function lookUp(user: ReturnType<typeof userEvent.setup>, email: string, number: string) {
  await user.clear(emailField())
  await user.type(emailField(), email)
  await user.clear(orderNumberField())
  await user.type(orderNumberField(), number)
  await user.click(findButton())
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})

describe('OrderLookup page', () => {
  it('P1 opens for a guest with an empty form and no login', () => {
    const { router } = renderLookup()
    expect(
      screen.getByRole('heading', { level: 1, name: ORDER_LOOKUP_TEXT.title })
    ).toBeInTheDocument()
    expect(screen.getByText(ORDER_LOOKUP_TEXT.intro)).toBeInTheDocument()
    expect(emailField()).toHaveValue('')
    expect(orderNumberField()).toHaveValue('')
    expect(router.state.location.search).toBe('')
    expect(orderService.findGuestOrder).not.toHaveBeenCalled()
  })

  it('P2 fills the order number from navigation state and leaves the email empty', () => {
    renderLookup({ orderNumber: '#ORD-AbC_12' })
    expect(orderNumberField()).toHaveValue('#ORD-AbC_12')
    expect(emailField()).toHaveValue('')
  })

  it('P3 shows the order with badge, timeline and details and focuses its heading', async () => {
    vi.mocked(orderService.findGuestOrder).mockResolvedValue(guestOrder('AbC_12'))
    const { user } = renderLookup()

    await lookUp(user, ` ${EMAIL} `, '#ord-AbC_12')

    const heading = await screen.findByRole('heading', { level: 2, name: 'Order ID: #ORD-AbC_12' })
    expect(orderService.findGuestOrder).toHaveBeenCalledWith(EMAIL, 'AbC_12')
    expect(screen.getByText('Processing', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Order status' })).toBeInTheDocument()
    expect(screen.getByText('Smart T-Shirt')).toBeInTheDocument()
    await waitFor(() => expect(heading).toHaveFocus())
  })

  it.each([
    ['a wrong email', 'other@store.com', '#ORD-AbC_12'],
    ['a wrong order number', EMAIL, '#ORD-nope'],
  ])(
    'P4 shows the same generic not-found message for %s and keeps the values',
    async (_c, email, number) => {
      vi.mocked(orderService.findGuestOrder).mockRejectedValue(NOT_FOUND)
      const { user } = renderLookup()

      await lookUp(user, email, number)

      expect(await screen.findByRole('alert')).toHaveTextContent(UI_STATE_MESSAGES.orderNotFound)
      expect(emailField()).toHaveValue(email)
      expect(orderNumberField()).toHaveValue(number)
    }
  )

  it('P5 offers Try again after a network error and resends the same lookup', async () => {
    vi.mocked(orderService.findGuestOrder)
      .mockRejectedValueOnce(new ApiError(0, 'Network error'))
      .mockResolvedValueOnce(guestOrder('AbC_12'))
    const { user } = renderLookup()

    await lookUp(user, EMAIL, 'AbC_12')
    await user.click(await screen.findByRole('button', { name: UI_STATE_MESSAGES.retry }))

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Order ID: #ORD-AbC_12' })
    ).toBeInTheDocument()
    expect(orderService.findGuestOrder).toHaveBeenCalledTimes(2)
    expect(orderService.findGuestOrder).toHaveBeenNthCalledWith(2, EMAIL, 'AbC_12')
  })

  it('P6 sends one request for two submits in the same moment', async () => {
    const pending = deferred<Order>()
    vi.mocked(orderService.findGuestOrder).mockReturnValue(pending.promise)
    const { user } = renderLookup()
    await user.type(emailField(), EMAIL)
    await user.type(orderNumberField(), 'AbC_12')

    fireEvent.submit(findButton())
    fireEvent.submit(findButton())

    await waitFor(() => expect(orderService.findGuestOrder).toHaveBeenCalledTimes(1))
    pending.resolve(guestOrder('AbC_12'))
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Order ID: #ORD-AbC_12' })
    ).toBeInTheDocument()
    expect(orderService.findGuestOrder).toHaveBeenCalledTimes(1)
  })

  it('P7 unmounting while the lookup runs causes no error', async () => {
    const pending = deferred<Order>()
    vi.mocked(orderService.findGuestOrder).mockReturnValue(pending.promise)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { user, unmount } = renderLookup()

    await lookUp(user, EMAIL, 'AbC_12')
    unmount()
    pending.resolve(guestOrder('AbC_12'))
    await pending.promise

    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('P8 shows field errors, sends nothing and focuses the first invalid field', async () => {
    const { user } = renderLookup()

    await user.click(findButton())

    expect(await screen.findByText(VALIDATION_MESSAGES.emailRequired)).toBeInTheDocument()
    expect(screen.getByText(VALIDATION_MESSAGES.orderNumberRequired)).toBeInTheDocument()
    expect(emailField()).toHaveFocus()
    expect(orderService.findGuestOrder).not.toHaveBeenCalled()
  })

  it('P9 never puts the email in the URL, navigation state or browser storage', async () => {
    vi.mocked(orderService.findGuestOrder).mockResolvedValue(guestOrder('AbC_12'))
    const { router, user } = renderLookup({ orderNumber: '#ORD-AbC_12' })

    await user.type(emailField(), EMAIL)
    await user.click(findButton())
    await screen.findByRole('heading', { level: 2, name: 'Order ID: #ORD-AbC_12' })

    const { location } = router.state
    expect(`${location.pathname}${location.search}${location.hash}`).not.toContain(EMAIL)
    expect(JSON.stringify(location.state)).not.toContain(EMAIL)
    const stored = [localStorage, sessionStorage].flatMap((storage) =>
      Object.keys(storage).map((key) => storage.getItem(key) ?? '')
    )
    expect(stored.some((value) => value.includes(EMAIL))).toBe(false)
  })

  it('P10 works for a logged-in customer too', async () => {
    useAuthStore.setState({
      user: { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' },
      token: 't',
      isAuthenticated: true,
    })
    vi.mocked(orderService.findGuestOrder).mockResolvedValue(guestOrder('AbC_12'))
    const { user } = renderLookup()

    await lookUp(user, EMAIL, 'AbC_12')

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Order ID: #ORD-AbC_12' })
    ).toBeInTheDocument()
  })

  it('P11 editing the email after a result removes the result at once', async () => {
    vi.mocked(orderService.findGuestOrder).mockResolvedValue(guestOrder('AbC_12'))
    const { user } = renderLookup()
    await lookUp(user, EMAIL, 'AbC_12')
    await screen.findByRole('heading', { level: 2, name: 'Order ID: #ORD-AbC_12' })

    await user.type(emailField(), 'x')

    expect(resultHeading('AbC_12')).toBeNull()
    expect(screen.queryByText('Smart T-Shirt')).toBeNull()
  })

  it('P12 editing the order number after a result removes the result at once', async () => {
    vi.mocked(orderService.findGuestOrder).mockResolvedValue(guestOrder('AbC_12'))
    const { user } = renderLookup()
    await lookUp(user, EMAIL, 'AbC_12')
    await screen.findByRole('heading', { level: 2, name: 'Order ID: #ORD-AbC_12' })

    await user.type(orderNumberField(), '3')

    expect(resultHeading('AbC_12')).toBeNull()
    expect(screen.queryByText('Smart T-Shirt')).toBeNull()
  })

  it('U6 editing a field after a network error removes Try again and sends nothing', async () => {
    vi.mocked(orderService.findGuestOrder).mockRejectedValueOnce(new ApiError(0, 'Network error'))
    const { user } = renderLookup()
    await lookUp(user, EMAIL, 'AbC_12')
    expect(await screen.findByRole('button', { name: UI_STATE_MESSAGES.retry })).toBeInTheDocument()

    await user.type(emailField(), 'x')

    expect(screen.queryByRole('button', { name: UI_STATE_MESSAGES.retry })).toBeNull()
    expect(orderService.findGuestOrder).toHaveBeenCalledTimes(1)
  })

  it('P13 a second lookup on the same page shows the new order', async () => {
    vi.mocked(orderService.findGuestOrder)
      .mockResolvedValueOnce(guestOrder('AbC_12'))
      .mockResolvedValueOnce(guestOrder('XyZ_34', 'Classic Polo'))
    const { user } = renderLookup()
    await lookUp(user, EMAIL, 'AbC_12')
    await screen.findByRole('heading', { level: 2, name: 'Order ID: #ORD-AbC_12' })

    await lookUp(user, EMAIL, 'XyZ_34')

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Order ID: #ORD-XyZ_34' })
    ).toBeInTheDocument()
    expect(screen.getByText('Classic Polo')).toBeInTheDocument()
    expect(resultHeading('AbC_12')).toBeNull()
  })
})
