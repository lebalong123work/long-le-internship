import type { ProductFilters } from '@/types'

export const queryKeys = {
  products: {
    all: () => ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    bestSellers: (category: string) => ['products', 'best-sellers', category] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    related: (id: string) => ['products', 'related', id] as const,
  },
  search: {
    results: (q: string, page: number) => ['search', 'results', q, page] as const,
    suggestions: (q: string) => ['search', 'suggestions', q] as const,
  },
  cart: (userId: string) => ['cart', userId] as const,
  wishlist: (userId: string) => ['wishlist', userId] as const,
  orders: {
    all: (userId: string) => ['orders', userId] as const,
    list: (userId: string, page: number) => ['orders', userId, 'list', page] as const,
    detail: (userId: string, id: string) => ['orders', userId, 'detail', id] as const,
  },
  profile: (userId: string) => ['profile', userId] as const,
}
