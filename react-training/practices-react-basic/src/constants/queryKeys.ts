import { ownerKey } from '@/utils/cartOwner'
import type { CartOwner, ProductFilters } from '@/types'

const NO_OWNER = 'none'

function keyOf(owner: CartOwner | null): string {
  return owner ? ownerKey(owner) : NO_OWNER
}

export const queryKeys = {
  products: {
    all: () => ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    bestSellers: (category: string) => ['products', 'best-sellers', category] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    related: (id: string) => ['products', 'related', id] as const,
    byIds: (ids: string[]) => ['products', 'by-ids', ids] as const,
  },
  search: {
    results: (q: string, page: number) => ['search', 'results', q, page] as const,
    suggestions: (q: string) => ['search', 'suggestions', q] as const,
  },
  cart: (owner: CartOwner | null) => ['cart', keyOf(owner)] as const,
  wishlist: (userId: string) => ['wishlist', userId] as const,
  orders: {
    all: (owner: CartOwner | null) => ['orders', keyOf(owner)] as const,
    list: (owner: CartOwner | null, page: number) =>
      ['orders', keyOf(owner), 'list', page] as const,
    detail: (owner: CartOwner | null, id: string) =>
      ['orders', keyOf(owner), 'detail', id] as const,
  },
  profile: (userId: string) => ['profile', userId] as const,
}
