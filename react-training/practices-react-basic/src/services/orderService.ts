import { ORDER_STATUS } from '@/constants/orderStatus'
import { calcCartTotals } from '@/utils/cartTotals'
import { belongsTo, ownerFields } from '@/utils/cartOwner'
import { apiClient, ApiError, isNotFoundError } from './apiClient'
import { toPaginatedList } from './pagination'
import type { CartOwner, CreateOrderDto, Order, PaginatedList } from '@/types'
import type { JsonServerPage } from './pagination'

export const ORDERS_PER_PAGE = 10

export const ORDER_ERRORS = {
  notFound: 'Order not found',
  emptyOrder: 'Order has no items',
} as const

export async function createOrder(owner: CartOwner, payload: CreateOrderDto): Promise<Order> {
  if (payload.items.length === 0) throw new ApiError(400, ORDER_ERRORS.emptyOrder)
  const { subtotal, shippingFee, total } = calcCartTotals(payload.items)
  return apiClient.post<Order>('/orders', {
    ...ownerFields(owner),
    items: payload.items,
    shippingAddress: payload.shippingAddress,
    paymentMethod: payload.paymentMethod,
    subtotal,
    shippingFee,
    total,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date().toISOString(),
  })
}

export async function getOrdersByUser(userId: string, page = 1): Promise<PaginatedList<Order>> {
  const response = await apiClient.get<JsonServerPage<Order>>('/orders', {
    'userId:eq': userId,
    _sort: '-createdAt',
    _page: page,
    _per_page: ORDERS_PER_PAGE,
  })
  return toPaginatedList(response, ORDERS_PER_PAGE)
}

function orderNotFound(): ApiError {
  return new ApiError(404, ORDER_ERRORS.notFound)
}

async function fetchOrder(orderId: string): Promise<Order> {
  try {
    return await apiClient.get<Order>(`/orders/${encodeURIComponent(orderId)}`)
  } catch (error) {
    if (isNotFoundError(error)) throw orderNotFound()
    throw error
  }
}

export async function getOrderById(owner: CartOwner, orderId: string): Promise<Order> {
  const order = await fetchOrder(orderId)
  if (!belongsTo(order, owner)) throw orderNotFound()
  return order
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function isGuestOrder(order: Order): boolean {
  return typeof order.guestId === 'string' && order.guestId !== '' && order.userId === undefined
}

export async function findGuestOrder(email: string, orderId: string): Promise<Order> {
  const id = orderId.trim()
  if (id === '') throw orderNotFound()
  const order = await fetchOrder(id)
  const emailMatches = normalizeEmail(order.shippingAddress.email) === normalizeEmail(email)
  if (!isGuestOrder(order) || !emailMatches) throw orderNotFound()
  return order
}
