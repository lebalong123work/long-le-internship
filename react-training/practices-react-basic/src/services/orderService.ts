import { ORDER_STATUS } from '@/constants/orderStatus'
import { calcCartTotals } from '@/utils/cartTotals'
import { apiClient, ApiError, isNotFoundError } from './apiClient'
import { toPaginatedList } from './pagination'
import type { CreateOrderDto, Order, PaginatedList } from '@/types'
import type { JsonServerPage } from './pagination'

export const ORDERS_PER_PAGE = 10

export const ORDER_ERRORS = {
  notFound: 'Order not found',
  emptyOrder: 'Order has no items',
} as const

export async function createOrder(userId: string, payload: CreateOrderDto): Promise<Order> {
  if (payload.items.length === 0) throw new ApiError(400, ORDER_ERRORS.emptyOrder)
  const { subtotal, shippingFee, total } = calcCartTotals(payload.items)
  return apiClient.post<Order>('/orders', {
    userId,
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

export async function getOrderById(userId: string, orderId: string): Promise<Order> {
  let order: Order
  try {
    order = await apiClient.get<Order>(`/orders/${encodeURIComponent(orderId)}`)
  } catch (error) {
    if (isNotFoundError(error)) throw new ApiError(404, ORDER_ERRORS.notFound)
    throw error
  }
  if (order.userId !== userId) throw new ApiError(404, ORDER_ERRORS.notFound)
  return order
}
