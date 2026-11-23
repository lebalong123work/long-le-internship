import type { CategorySlug } from './categories'

const SEARCH = '/search'
const SHOP = '/shop'

export const ROUTES = {
  HOME: '/',
  SHOP,
  SHOP_CATEGORY: (slug: CategorySlug) =>
    `${SHOP}?${new URLSearchParams({ category: slug }).toString()}`,
  PRODUCT: (productId: string) => `/shop/${productId}`,
  SEARCH,
  SEARCH_RESULTS: (query: string) => `${SEARCH}?${new URLSearchParams({ q: query }).toString()}`,
  ABOUT: '/about',
  CONTACT: '/contact',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: (orderId: string) => `/order-success/${orderId}`,
  ORDER_LOOKUP: '/order-lookup',
  ACCOUNT: {
    PROFILE: '/account/profile',
    ORDERS: '/account/orders',
    WISHLIST: '/account/wishlist',
  },
} as const
