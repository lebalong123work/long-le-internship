export const UI_STATE_MESSAGES = {
  errorDefault: 'Something went wrong. Please try again.',
  retry: 'Try again',
  emptyCategory: 'No products in this category',
  productNotFound: 'Product not found',
  backToHome: 'Back to Home',
  emptyCart: 'Your cart is empty',
  orderNotFound: 'Order not found',
  emptyWishlist: 'No saved items',
  emptyOrders: 'You have no orders yet',
} as const

export const UI_STATE_ERRORS = {
  emptyMessage: 'EmptyState message must be a non-empty string',
  emptyIconSrc: 'EmptyState iconSrc must be a non-empty string',
  emptyAction: 'EmptyState action needs a non-empty label and path',
} as const
