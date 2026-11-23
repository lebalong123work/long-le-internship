import { ORDER_NUMBER_PREFIX } from '@/utils/orderNumber'

function orderNumber(orderId: string): string {
  return `${ORDER_NUMBER_PREFIX}${orderId}`
}

export const ORDER_TEXT = {
  successTitle: 'Order Placed Successfully!',
  orderNumber,
  orderIdLine: (orderId: string): string => `Order ID: ${orderNumber(orderId)}`,
  loading: 'Loading order',
  productsHeading: 'Products',
  continueShopping: 'Continue Shopping',
  viewOrder: 'View Order',
  addressLine: (address: string, ward: string, province: string): string =>
    `${address}, ${ward}, ${province}`,
  note: (note: string): string => `Note: ${note}`,
  guestEmail: (email: string): string => `Email: ${email}`,
  saveOrderNumber: 'Save your order number to look up your order later.',
} as const

export const ORDER_HISTORY_TEXT = {
  heading: 'My Orders',
  loading: 'Loading orders',
  itemCount: (count: number): string => (count === 1 ? '1 item' : `${count} items`),
  viewDetail: 'View Detail',
  hideDetail: 'Hide Detail',
  timelineLabel: 'Order status',
  shopNow: 'Shop Now',
} as const

export const ORDER_LOOKUP_TEXT = {
  title: 'Track Your Order',
  intro: 'Enter the email used for your order and your order number.',
  emailLabel: 'Email',
  orderNumberLabel: 'Order number',
  orderNumberPlaceholder: '#ORD-…',
  submit: 'Find Order',
} as const
