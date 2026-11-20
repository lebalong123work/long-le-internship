export const ORDER_TEXT = {
  successTitle: 'Order Placed Successfully!',
  detailsTitle: 'Order Details',
  orderIdLabel: 'Order ID',
  orderNumber: (orderId: string): string => `#ORD-${orderId}`,
  loading: 'Loading order',
  productsHeading: 'Products',
  continueShopping: 'Continue Shopping',
  viewOrder: 'View Order',
  addressLine: (address: string, ward: string, province: string): string =>
    `${address}, ${ward}, ${province}`,
  note: (note: string): string => `Note: ${note}`,
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
