import type { OrderStatus } from '@/constants/orderStatus'

export interface CartItem {
  id: string
  productId: string
  color: string
  size: string
  quantity: number
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
}

export type AddToCartDto = Omit<CartItem, 'id'>

export interface Wishlist {
  id: string
  userId: string
  productIds: string[]
}

/** Product data copied into the order, so later price changes do not affect it. */
export interface OrderItem {
  productId: string
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
}

export interface ShippingAddress {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  district: string
  note?: string
}

export type PaymentMethod = 'cod' | 'bank-transfer' | 'credit-card'

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  subtotal: number
  shippingFee: number
  total: number
  status: OrderStatus
  createdAt: string
}

export interface CreateOrderDto {
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
}
