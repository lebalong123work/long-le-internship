const SEARCH = '/search'

export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  PRODUCT: (productId: string) => `/shop/${productId}`,
  SEARCH,
  SEARCH_RESULTS: (query: string) => `${SEARCH}?${new URLSearchParams({ q: query }).toString()}`,
  ABOUT: '/about',
  CONTACT: '/contact',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: (orderId: string) => `/order-success/${orderId}`,
  ACCOUNT: {
    PROFILE: '/account/profile',
    ORDERS: '/account/orders',
    WISHLIST: '/account/wishlist',
  },
} as const
