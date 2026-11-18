export const ORDER_TEXT = {
  successTitle: 'Order Placed Successfully!',
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
