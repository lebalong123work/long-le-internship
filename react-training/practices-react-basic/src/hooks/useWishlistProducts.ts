import { useState } from 'react'
import { skipToken, useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { usableProducts, useProductsByIds } from './useProducts'
import { wishlistQueryOptions } from './useWishlist'
import type { Product } from '@/types'

type WishlistProductsStatus = 'loading' | 'error' | 'empty' | 'ready'
type RetryTarget = 'wishlist' | 'products'

export interface WishlistProductsState {
  status: WishlistProductsStatus
  products: Product[]
  retry: () => void
  isRetrying: boolean
}

const NO_IDS: string[] = []
const NO_PRODUCTS: Product[] = []

function savedProducts(ids: string[], products: Product[]): Product[] {
  return ids.flatMap((id) => products.find((product) => product.id === id) ?? [])
}

export function useWishlistProducts(): WishlistProductsState {
  const [retryingQuery, setRetryingQuery] = useState<RetryTarget | null>(null)
  const { user } = useAuth()
  const userId = user?.id
  const options = wishlistQueryOptions(userId ?? '')
  const wishlistQuery = useQuery({
    queryKey: options.queryKey,
    queryFn: userId ? options.queryFn : skipToken,
  })
  const ids = wishlistQuery.data ?? NO_IDS
  const productsQuery = useProductsByIds(ids)
  const usable = usableProducts(productsQuery, ids)
  const products = usable === undefined ? NO_PRODUCTS : savedProducts(ids, usable)

  function resolveStatus(): WishlistProductsStatus {
    if (retryingQuery !== null) return 'error'
    if (wishlistQuery.data === undefined) return wishlistQuery.isError ? 'error' : 'loading'
    if (ids.length === 0) return 'empty'
    if (usable !== undefined) return products.length === 0 ? 'empty' : 'ready'
    return productsQuery.isError ? 'error' : 'loading'
  }

  function retry(): void {
    const target: RetryTarget = wishlistQuery.data === undefined ? 'wishlist' : 'products'
    const request = target === 'wishlist' ? wishlistQuery.refetch() : productsQuery.refetch()
    setRetryingQuery(target)
    void request.finally(() => setRetryingQuery(null))
  }

  const status = resolveStatus()

  return {
    status,
    products: status === 'ready' ? products : NO_PRODUCTS,
    retry,
    isRetrying: retryingQuery !== null,
  }
}
