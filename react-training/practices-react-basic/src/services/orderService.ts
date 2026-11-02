import type { CreateOrderDto, Order, PaginatedList } from '@/types'

export function createOrder(_userId: string, _payload: CreateOrderDto): Promise<Order> {
  throw new Error('not implemented')
}

export function getOrdersByUser(_userId: string, _page = 1): Promise<PaginatedList<Order>> {
  throw new Error('not implemented')
}

export function getOrderById(_userId: string, _orderId: string): Promise<Order> {
  throw new Error('not implemented')
}
