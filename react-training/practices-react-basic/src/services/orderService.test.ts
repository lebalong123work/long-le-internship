import { afterEach, describe, expect, it, vi } from 'vitest'
import { SHIPPING_FEE } from '@/constants/shipping'
import { ApiError } from './apiClient'
import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  ORDER_ERRORS,
  ORDERS_PER_PAGE,
} from './orderService'
import type { CreateOrderDto, Order, OrderItem } from '@/types'

const NOW = '2026-11-06T08:30:00.000Z'

function item(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    productId: 'p1',
    name: 'Smart T-Shirt',
    price: 40,
    image: '/images/products/p1.jpg',
    color: 'Black',
    size: 'M',
    quantity: 2,
    ...overrides,
  }
}

function payloadWith(items: OrderItem[]): CreateOrderDto {
  return {
    items,
    shippingAddress: {
      fullName: 'Test User',
      phone: '0912345678',
      email: 'user@store.com',
      address: '1 Test Street',
      city: 'Hà Nội',
      district: 'Ba Đình',
    },
    paymentMethod: 'cod',
  }
}

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'o1',
    userId: 'u1',
    ...payloadWith([item()]),
    subtotal: 80,
    shippingFee: SHIPPING_FEE,
    total: 80,
    status: 'pending',
    createdAt: NOW,
    ...overrides,
  }
}

interface MockResponse {
  body: unknown
  status?: number
}

function response({ body, status = 200 }: MockResponse) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 500 ? 'Internal Server Error' : 'OK',
    text: () => Promise.resolve(JSON.stringify(body)),
  }
}

function mockFetch(...responses: MockResponse[]) {
  const fetchMock = vi.fn()
  for (const r of responses) fetchMock.mockResolvedValueOnce(response(r))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function callUrl(fetchMock: ReturnType<typeof vi.fn>, index: number): URL {
  return new URL(fetchMock.mock.calls[index][0] as string)
}

function callInit(fetchMock: ReturnType<typeof vi.fn>, index: number): RequestInit {
  return fetchMock.mock.calls[index][1] as RequestInit
}

function callBody(fetchMock: ReturnType<typeof vi.fn>, index: number): unknown {
  return JSON.parse(callInit(fetchMock, index).body as string)
}

async function catchError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('expected an ApiError')
}

function jsonServerPage(data: Order[], prev: number | null, pages: number, items: number) {
  return { data, first: 1, prev, next: null, last: pages, pages, items }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('createOrder', () => {
  it('posts the order for the user with status pending and the current time', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(NOW))
    const payload = payloadWith([item()])
    const fetchMock = mockFetch({ body: order(), status: 201 })

    await createOrder('u1', payload)

    expect(callUrl(fetchMock, 0).pathname).toBe('/orders')
    expect(callInit(fetchMock, 0).method).toBe('POST')
    expect(callBody(fetchMock, 0)).toEqual({
      userId: 'u1',
      items: payload.items,
      shippingAddress: payload.shippingAddress,
      paymentMethod: 'cod',
      subtotal: 80,
      shippingFee: SHIPPING_FEE,
      total: 80 + SHIPPING_FEE,
      status: 'pending',
      createdAt: NOW,
    })
  })

  it('ignores userId, status and totals sent inside the payload', async () => {
    const payload = {
      ...payloadWith([item()]),
      userId: 'u2',
      status: 'delivered',
      subtotal: 1,
      total: 1,
    }
    const fetchMock = mockFetch({ body: order(), status: 201 })

    await createOrder('u1', payload)

    expect(callBody(fetchMock, 0)).toMatchObject({
      userId: 'u1',
      status: 'pending',
      subtotal: 80,
      total: 80 + SHIPPING_FEE,
    })
  })

  it('saves subtotal, shipping fee and total calculated from the items', async () => {
    const items = [
      item({ price: 40, quantity: 2 }),
      item({ productId: 'p2', price: 19.99, quantity: 3 }),
    ]
    const fetchMock = mockFetch({ body: order(), status: 201 })

    await createOrder('u1', payloadWith(items))

    expect(callBody(fetchMock, 0)).toMatchObject({
      subtotal: 139.97,
      shippingFee: SHIPPING_FEE,
      total: 139.97 + SHIPPING_FEE,
    })
  })

  it('makes no product request (prices come only from the snapshot)', async () => {
    const fetchMock = mockFetch({ body: order(), status: 201 })

    await createOrder('u1', payloadWith([item({ price: 12.5, quantity: 1 })]))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(callUrl(fetchMock, 0).pathname).toBe('/orders')
    expect(callBody(fetchMock, 0)).toMatchObject({ items: [item({ price: 12.5, quantity: 1 })] })
  })

  it('creates the order when it has one item', async () => {
    const fetchMock = mockFetch({ body: order(), status: 201 })

    await expect(createOrder('u1', payloadWith([item({ quantity: 1 })]))).resolves.toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rejects an order with no items with 400 and makes no request', async () => {
    const fetchMock = mockFetch()

    const error = await catchError(createOrder('u1', payloadWith([])))

    expect(error.status).toBe(400)
    expect(error.message).toBe(ORDER_ERRORS.emptyOrder)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns the saved order with the id from the server', async () => {
    const saved = order({ id: 'YSRFh05oq0k' })
    mockFetch({ body: saved, status: 201 })

    await expect(createOrder('u1', payloadWith([item()]))).resolves.toEqual(saved)
  })

  it('rethrows a server error from saving the order', async () => {
    mockFetch({ body: {}, status: 500 })

    const error = await catchError(createOrder('u1', payloadWith([item()])))

    expect(error.status).toBe(500)
  })
})

describe('getOrdersByUser', () => {
  it("requests only this user's orders, newest first, 10 per page", async () => {
    const fetchMock = mockFetch({ body: jsonServerPage([order()], null, 1, 1) })

    await getOrdersByUser('u1')

    const url = callUrl(fetchMock, 0)
    expect(url.pathname).toBe('/orders')
    expect(url.searchParams.get('userId:eq')).toBe('u1')
    expect(url.searchParams.get('_sort')).toBe('-createdAt')
    expect(url.searchParams.get('_page')).toBe('1')
    expect(url.searchParams.get('_per_page')).toBe(String(ORDERS_PER_PAGE))
    expect(ORDERS_PER_PAGE).toBe(10)
  })

  it('rethrows a server error from loading the list', async () => {
    mockFetch({ body: {}, status: 500 })

    const error = await catchError(getOrdersByUser('u1'))

    expect(error.status).toBe(500)
  })

  it('maps page 2 of the server answer to a PaginatedList', async () => {
    const orders = [order({ id: 'o11' }), order({ id: 'o12' })]
    const fetchMock = mockFetch({ body: jsonServerPage(orders, 1, 2, 12) })

    await expect(getOrdersByUser('u1', 2)).resolves.toEqual({
      data: orders,
      total: 12,
      page: 2,
      perPage: ORDERS_PER_PAGE,
      totalPages: 2,
    })
    expect(callUrl(fetchMock, 0).searchParams.get('_page')).toBe('2')
  })

  it('returns an empty list on page 1 for a user with no orders', async () => {
    mockFetch({ body: jsonServerPage([], null, 0, 0) })

    await expect(getOrdersByUser('u9')).resolves.toEqual({
      data: [],
      total: 0,
      page: 1,
      perPage: ORDERS_PER_PAGE,
      totalPages: 0,
    })
  })
})

describe('getOrderById', () => {
  it("returns the user's own order", async () => {
    const own = order({ id: 'o 1' })
    const fetchMock = mockFetch({ body: own })

    await expect(getOrderById('u1', 'o 1')).resolves.toEqual(own)
    expect(callUrl(fetchMock, 0).pathname).toBe('/orders/o%201')
  })

  it('throws 404 "Order not found" for another user\'s order', async () => {
    mockFetch({ body: order({ userId: 'u2' }) })

    const error = await catchError(getOrderById('u1', 'o1'))

    expect(error.status).toBe(404)
    expect(error.message).toBe(ORDER_ERRORS.notFound)
  })

  it('maps a server 404 to "Order not found"', async () => {
    mockFetch({ body: {}, status: 404 })

    const error = await catchError(getOrderById('u1', 'xyz'))

    expect(error.status).toBe(404)
    expect(error.message).toBe(ORDER_ERRORS.notFound)
  })

  it('rethrows a network error unchanged', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')))

    const error = await catchError(getOrderById('u1', 'o1'))

    expect(error.status).toBe(0)
    expect(error.message).toBe('Network error')
  })
})
